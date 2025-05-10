
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.4.0";

// Set up CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
async function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Format a date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get date range for the last 7 days (excluding today)
function getDateRange() {
  const today = new Date();
  
  // End date is yesterday
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - 1);
  
  // Start date is 7 days before yesterday (so 8 days from today)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 8);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}

// Refresh an expired access token
async function refreshAccessToken(refreshToken: string) {
  const clientId = "629017410456-o7oj41ahdjetb0nkb96vfhddj6uv8g7t.apps.googleusercontent.com";
  const clientSecret = "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";
  
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token"
  });
  
  console.log("Refreshing access token...");
  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: tokenParams.toString()
  });
  
  if (!tokenResponse.ok) {
    const errorData = await tokenResponse.json();
    throw new Error(`Failed to refresh token: ${errorData.error_description || errorData.error}`);
  }
  
  const tokenData = await tokenResponse.json();
  
  // Calculate expiry time
  const expiryTime = new Date();
  expiryTime.setSeconds(expiryTime.getSeconds() + tokenData.expires_in);
  
  return {
    accessToken: tokenData.access_token,
    expiryTime: expiryTime.toISOString()
  };
}

// Fetch daily views data from YouTube Analytics API
async function fetchYouTubeAnalytics(accessToken: string) {
  const { startDate, endDate } = getDateRange();
  
  console.log(`Fetching analytics from ${startDate} to ${endDate}`);
  
  const analyticsUrl = new URL("https://youtubeanalytics.googleapis.com/v2/reports");
  analyticsUrl.searchParams.append("ids", "channel==MINE");
  analyticsUrl.searchParams.append("metrics", "views");
  analyticsUrl.searchParams.append("dimensions", "day");
  analyticsUrl.searchParams.append("startDate", startDate);
  analyticsUrl.searchParams.append("endDate", endDate);
  analyticsUrl.searchParams.append("sort", "day");
  
  const analyticsResponse = await fetch(analyticsUrl.toString(), {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  
  if (!analyticsResponse.ok) {
    const errorText = await analyticsResponse.text();
    console.error("YouTube Analytics API error:", errorText);
    throw new Error(`Failed to fetch analytics: ${analyticsResponse.status} ${analyticsResponse.statusText}`);
  }
  
  const analyticsData = await analyticsResponse.json();
  
  // Transform response into expected format
  // YouTube Analytics API returns data as rows with day and views
  const formattedData = analyticsData.rows?.map((row: any[]) => ({
    date: row[0],  // day is first dimension
    views: row[1]  // views is first metric
  })) || [];
  
  return formattedData;
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = await handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Initialize Supabase client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    // Get user ID from authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get user's YouTube tokens from profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('youtube_token, youtube_refresh_token, youtube_token_expiry')
      .eq('id', user.id)
      .single();
    
    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Failed to retrieve user profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!profile.youtube_token || !profile.youtube_refresh_token) {
      return new Response(
        JSON.stringify({ error: "YouTube account not connected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let accessToken = profile.youtube_token;
    
    // Check if the token has expired
    const tokenExpiry = profile.youtube_token_expiry ? new Date(profile.youtube_token_expiry) : null;
    const now = new Date();
    
    if (!tokenExpiry || tokenExpiry <= now) {
      console.log("Access token expired, refreshing...");
      
      try {
        // Refresh the token
        const { accessToken: newAccessToken, expiryTime } = await refreshAccessToken(profile.youtube_refresh_token);
        accessToken = newAccessToken;
        
        // Update the token in the database
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            youtube_token: newAccessToken,
            youtube_token_expiry: expiryTime
          })
          .eq('id', user.id);
          
        if (updateError) {
          console.error("Error updating token:", updateError);
        }
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        return new Response(
          JSON.stringify({ error: "Failed to refresh access token", details: refreshError.message }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Fetch analytics data from YouTube API
    try {
      const analyticsData = await fetchYouTubeAnalytics(accessToken);
      
      return new Response(
        JSON.stringify(analyticsData),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    } catch (analyticsError) {
      console.error("Analytics error:", analyticsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch analytics data", details: analyticsError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("YouTube analytics error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
