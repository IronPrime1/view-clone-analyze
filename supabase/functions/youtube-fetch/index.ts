
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

// Helper function to fetch channel data
async function fetchChannelData(channelId: string, apiKey: string) {
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${apiKey}`
  );
  
  if (!channelResponse.ok) {
    throw new Error("Failed to fetch channel data from YouTube API");
  }
  
  const channelData = await channelResponse.json();
  
  if (!channelData.items || channelData.items.length === 0) {
    throw new Error("No channel found with the provided ID");
  }
  
  const channel = channelData.items[0];
  
  return {
    id: channel.id,
    title: channel.snippet.title,
    thumbnail: channel.snippet.thumbnails.default.url,
    subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
    viewCount: parseInt(channel.statistics.viewCount) || 0,
    videoCount: parseInt(channel.statistics.videoCount) || 0
  };
}

// Helper function to fetch videos for a channel
async function fetchChannelVideos(channelId: string, apiKey: string, maxResults = 10) {
  // Get channel uploads playlist ID
  const channelResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
  );
  
  if (!channelResponse.ok) {
    throw new Error("Failed to fetch channel contentDetails");
  }
  
  const channelData = await channelResponse.json();
  
  if (!channelData.items || channelData.items.length === 0) {
    throw new Error("No channel found with the provided ID");
  }
  
  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
  
  // Get videos from uploads playlist
  const playlistResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${maxResults}&playlistId=${uploadsPlaylistId}&key=${apiKey}`
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
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`
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
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = await handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body
    const { channelId, action } = await req.json();
    
    // Get YouTube API key
    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY") || "AIzaSyDKh3CDFoL69CuW6aFxTW-u9igrootuqpk";
    
    if (!youtubeApiKey) {
      return new Response(
        JSON.stringify({ error: "YouTube API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get user ID from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle different actions
    switch (action) {
      case 'add_competitor': {
        // Fetch channel data
        const channelData = await fetchChannelData(channelId, youtubeApiKey);
        
        // Insert channel into database
        const { data: competitorData, error: competitorError } = await supabaseAdmin
          .from('competitor_channels')
          .insert({
            youtube_id: channelData.id,
            user_id: user.id,
            title: channelData.title,
            thumbnail: channelData.thumbnail,
            subscriber_count: channelData.subscriberCount,
            video_count: channelData.videoCount,
            view_count: channelData.viewCount
          })
          .select()
          .single();
          
        if (competitorError) {
          throw new Error(`Failed to add competitor channel: ${competitorError.message}`);
        }
        
        // Fetch videos for the channel
        const videos = await fetchChannelVideos(channelId, youtubeApiKey);
        
        // Insert videos into database
        if (videos.length > 0) {
          const videosToInsert = videos.map(video => ({
            channel_id: competitorData.id,
            youtube_id: video.id,
            title: video.title,
            description: video.description,
            published_at: video.publishedAt,
            thumbnail: video.thumbnail,
            view_count: video.viewCount,
            like_count: video.likeCount,
            comment_count: video.commentCount,
            is_short: video.isShort
          }));
          
          const { error: videosError } = await supabaseAdmin
            .from('competitor_videos')
            .insert(videosToInsert);
            
          if (videosError) {
            console.error("Error inserting videos:", videosError);
          }
          
          // Generate mock daily views data
          const dates = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
          });
          
          const mockViews = dates.map(date => ({
            channel_id: channelData.id,
            user_id: user.id,
            date: date,
            views: Math.floor(Math.random() * 1000) + 300
          }));
          
          const { error: viewsError } = await supabaseAdmin
            .from('daily_views')
            .insert(mockViews);
            
          if (viewsError) {
            console.error("Error inserting daily views:", viewsError);
          }
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            channel: {
              ...channelData,
              videos
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      case 'get_channel_data': {
        // Fetch channel data
        const channelData = await fetchChannelData(channelId, youtubeApiKey);
        
        // Fetch videos
        const videos = await fetchChannelVideos(channelId, youtubeApiKey);
        
        return new Response(
          JSON.stringify({
            success: true,
            channel: {
              ...channelData,
              videos
            }
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("YouTube fetch error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
