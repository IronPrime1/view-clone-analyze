
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

// Define the YouTube API handler
serve(async (req) => {
  // Handle CORS
  const corsResponse = await handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body
    const { code, redirectUri } = await req.json();
    
    // Validate request data
    if (!code) {
      return new Response(
        JSON.stringify({ error: "Authorization code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Supabase client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    // Exchange the authorization code for tokens
    const clientId = Deno.env.get("YOUTUBE_CLIENT_ID");
    const clientSecret = Deno.env.get("YOUTUBE_CLIENT_SECRET");
    
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const tokenParams = new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    });
    
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: tokenParams.toString()
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("YouTube token error:", tokenData);
      return new Response(
        JSON.stringify({ error: "Failed to authenticate with YouTube" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { access_token, refresh_token, expires_in } = tokenData;
    
    // Fetch YouTube channel data using the API key as a fallback
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY") || "AIzaSyDKh3CDFoL69CuW6aFxTW-u9igrootuqpk";
    
    // First try to get channel with access token
    let channelResponse;
    try {
      channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
    } catch (error) {
      console.error("Error using access token, falling back to API key:", error);
      // Fall back to API key if access token doesn't work
      channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=channel_id&key=' + youtubeApiKey);
    }
    
    const channelData = await channelResponse.json();
    
    if (!channelResponse.ok || !channelData.items || channelData.items.length === 0) {
      console.error("YouTube channel error:", channelData);
      return new Response(
        JSON.stringify({ error: "Failed to fetch YouTube channel data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const channel = channelData.items[0];
    const channelId = channel.id;
    const channelTitle = channel.snippet.title;
    const channelThumbnail = channel.snippet.thumbnails.default.url;
    
    // Get current user ID from authorization header
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
    
    // Calculate token expiry time
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + expires_in);
    
    // Update user profile with YouTube tokens and data
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        youtube_connected: true,
        youtube_token: access_token,
        youtube_refresh_token: refresh_token,
        youtube_token_expiry: expiryTime.toISOString()
      })
      .eq('id', user.id);
      
    if (updateError) {
      console.error("Profile update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        channel: {
          id: channelId,
          title: channelTitle,
          thumbnail: channelThumbnail
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
    console.error("YouTube auth error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
