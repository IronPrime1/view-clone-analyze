
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
    const clientId = "629017410456-o7oj41ahdjetb0nkb96vfhddj6uv8g7t.apps.googleusercontent.com";
    const clientSecret = "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";
    
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const tokenParams = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    });
    
    console.log("Exchanging auth code for tokens...");
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
        JSON.stringify({ error: "Failed to authenticate with YouTube: " + (tokenData.error_description || tokenData.error) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { access_token, refresh_token, expires_in } = tokenData;
    
    // Use the access token to get the user's channel info
    console.log("Fetching channel data with access token...");
    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
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
    const subscriberCount = parseInt(channel.statistics.subscriberCount) || 0;
    const viewCount = parseInt(channel.statistics.viewCount) || 0;
    const videoCount = parseInt(channel.statistics.videoCount) || 0;
    
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
    console.log("Updating user profile with YouTube data...");
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        youtube_connected: true,
        youtube_token: access_token,
        youtube_refresh_token: refresh_token,
        youtube_token_expiry: expiryTime.toISOString(),
        youtube_channel_id: channelId,
        youtube_channel_title: channelTitle,
        youtube_channel_thumbnail: channelThumbnail,
        youtube_subscriber_count: subscriberCount,
        youtube_view_count: viewCount,
        youtube_video_count: videoCount
      })
      .eq('id', user.id);
      
    if (updateError) {
      console.error("Profile update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Fetch videos for the channel (10 latest)
    console.log("Fetching videos for the channel...");
    const getChannelVideos = async () => {
      try {
        // Use the YouTube API key
        const youtubeApiKey = "AIzaSyDKh3CDFoL69CuW6aFxTW-u9igrootuqpk";
        
        // Get channel uploads playlist ID
        const contentDetailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${youtubeApiKey}`
        );
        
        if (!contentDetailsResponse.ok) {
          throw new Error("Failed to fetch channel contentDetails");
        }
        
        const contentDetailsData = await contentDetailsResponse.json();
        
        if (!contentDetailsData.items || contentDetailsData.items.length === 0) {
          throw new Error("No channel found with the provided ID");
        }
        
        const uploadsPlaylistId = contentDetailsData.items[0].contentDetails.relatedPlaylists.uploads;
        
        // Get videos from uploads playlist
        const playlistResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=10&playlistId=${uploadsPlaylistId}&key=${youtubeApiKey}`
        );
        
        if (!playlistResponse.ok) {
          throw new Error("Failed to fetch playlist items");
        }
        
        const playlistData = await playlistResponse.json();
        
        if (!playlistData.items) {
          return [];
        }
        
        // Get video IDs
        const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');
        
        // Get video details
        const videosResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${youtubeApiKey}`
        );
        
        if (!videosResponse.ok) {
          throw new Error("Failed to fetch video details");
        }
        
        const videosData = await videosResponse.json();
        
        if (!videosData.items) {
          return [];
        }
        
        // Format videos
        return videosData.items.map((video: any) => {
          // Check if it's a short (duration < 60 seconds)
          let duration = video.contentDetails.duration;
          const durationRegex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
          const matches = duration.match(durationRegex);
          
          const hours = matches[1] ? parseInt(matches[1]) : 0;
          const minutes = matches[2] ? parseInt(matches[2]) : 0;
          const seconds = matches[3] ? parseInt(matches[3]) : 0;
          
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          const isShort = totalSeconds <= 60;
          
          return {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            publishedAt: video.snippet.publishedAt,
            thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
            viewCount: parseInt(video.statistics.viewCount) || 0,
            likeCount: parseInt(video.statistics.likeCount) || 0,
            commentCount: parseInt(video.statistics.commentCount) || 0,
            isShort
          };
        });
      } catch (error) {
        console.error("Error fetching videos:", error);
        return [];
      }
    };
    
    // Get videos
    const videos = await getChannelVideos();
    
    // Return success response
    console.log("YouTube channel connected successfully");
    return new Response(
      JSON.stringify({
        success: true,
        channel: {
          id: channelId,
          title: channelTitle,
          thumbnail: channelThumbnail,
          subscriberCount,
          viewCount,
          videoCount,
          videos
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
