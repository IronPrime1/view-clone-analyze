
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

// Helper to fetch popular videos from a channel (by most views)
async function fetchPopularVideos(channelId: string, apiKey: string) {
  try {
    // First get all videos (we'll get 20 to have a good pool to choose from)
    const allVideos = await fetchChannelVideos(channelId, apiKey, 20);
    
    // Sort by view count
    const sortedVideos = allVideos.sort((a, b) => b.viewCount - a.viewCount);
    
    // Take top 10
    return sortedVideos.slice(0, 10);
  } catch (error) {
    console.error("Error fetching popular videos:", error);
    return [];
  }
}

// Helper to generate daily views data
async function generateDailyViews(channelId: string, userId: string, supabaseAdmin: any) {
  // Generate mock views data for the past 7 days
  const dates = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  // Get current views data
  const { data: existingData } = await supabaseAdmin
    .from('daily_views')
    .select('*')
    .eq('channel_id', channelId)
    .eq('user_id', userId);
    
  // If there's existing data, don't create new data
  if (existingData && existingData.length > 0) {
    return existingData;
  }
  
  // Create new mock views data
  const mockViews = dates.map(date => ({
    channel_id: channelId,
    user_id: userId,
    date: date,
    views: Math.floor(Math.random() * 1000) + 300
  }));
  
  // Insert mock views data
  await supabaseAdmin
    .from('daily_views')
    .insert(mockViews);
    
  return mockViews;
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = await handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body
    const { channelId, action } = await req.json();
    
    // Get YouTube API key
    const youtubeApiKey = "AIzaSyDKh3CDFoL69CuW6aFxTW-u9igrootuqpk";
    
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
        console.log("Adding competitor channel:", channelId);
        
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
        
        // Fetch popular videos for the channel
        console.log("Fetching popular videos for the competitor channel");
        const videos = await fetchPopularVideos(channelId, youtubeApiKey);
        
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
          
          // Generate daily views data
          await generateDailyViews(channelData.id, user.id, supabaseAdmin);
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
        console.log("Getting channel data for:", channelId);
        
        // Fetch channel data
        const channelData = await fetchChannelData(channelId, youtubeApiKey);
        
        // Fetch videos
        const videos = await fetchPopularVideos(channelId, youtubeApiKey);
        
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
      
      case 'refresh_data': {
        console.log("Refreshing data for user:", user.id);
        
        // Get user profile for YouTube channel ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        // Update own channel info if connected
        if (profile?.youtube_connected && profile?.youtube_channel_id) {
          try {
            console.log("Refreshing own channel data");
            
            // Get fresh data for own channel
            const channelData = await fetchChannelData(profile.youtube_channel_id, youtubeApiKey);
            
            // Update profile
            await supabaseAdmin
              .from('profiles')
              .update({
                youtube_channel_title: channelData.title,
                youtube_subscriber_count: channelData.subscriberCount,
                youtube_view_count: channelData.viewCount,
                youtube_video_count: channelData.videoCount
              })
              .eq('id', user.id);
          } catch (error) {
            console.error("Error refreshing own channel:", error);
          }
        }
        
        // Get all competitor channels
        const { data: competitors } = await supabaseAdmin
          .from('competitor_channels')
          .select('id, youtube_id')
          .eq('user_id', user.id);
        
        // Update each competitor channel
        if (competitors && competitors.length > 0) {
          for (const comp of competitors) {
            try {
              console.log("Refreshing competitor channel:", comp.youtube_id);
              
              // Get fresh data
              const channelData = await fetchChannelData(comp.youtube_id, youtubeApiKey);
              
              // Update in database
              await supabaseAdmin
                .from('competitor_channels')
                .update({
                  title: channelData.title,
                  thumbnail: channelData.thumbnail,
                  subscriber_count: channelData.subscriberCount,
                  video_count: channelData.videoCount,
                  view_count: channelData.viewCount,
                  updated_at: new Date().toISOString()
                })
                .eq('id', comp.id);
              
              // Get fresh videos
              const videos = await fetchPopularVideos(comp.youtube_id, youtubeApiKey);
              
              if (videos && videos.length > 0) {
                // Delete old videos
                await supabaseAdmin
                  .from('competitor_videos')
                  .delete()
                  .eq('channel_id', comp.id);
                
                // Insert new videos
                const videosToInsert = videos.map(video => ({
                  channel_id: comp.id,
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
                
                await supabaseAdmin
                  .from('competitor_videos')
                  .insert(videosToInsert);
              }
            } catch (error) {
              console.error(`Error updating competitor ${comp.youtube_id}:`, error);
            }
          }
        }
        
        // Return success
        return new Response(
          JSON.stringify({
            success: true,
            message: "Data refreshed successfully"
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
