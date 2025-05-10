
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

serve(async (req) => {
  // Handle CORS
  const corsResponse = await handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
    
    const youtubeApiKey = "AIzaSyDKh3CDFoL69CuW6aFxTW-u9igrootuqpk";
    
    if (!youtubeApiKey) {
      return new Response(
        JSON.stringify({ error: "YouTube API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 1. Get all active YouTube channels (user's own channel and competitors)
    console.log("Fetching active channels...");
    
    // Get all profiles with connected YouTube channels
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('id, youtube_channel_id')
      .eq('youtube_connected', true)
      .not('youtube_channel_id', 'is', null);
    
    // Get all competitor channels
    const { data: competitors } = await supabaseAdmin
      .from('competitor_channels')
      .select('user_id, youtube_id');
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // 2. Process each user's own channel
    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        if (!profile.youtube_channel_id) continue;
        
        try {
          console.log(`Processing user channel: ${profile.youtube_channel_id}`);
          
          // Check if we already have entry for today
          const { data: existingViews } = await supabaseAdmin
            .from('daily_views')
            .select('id')
            .eq('channel_id', profile.youtube_channel_id)
            .eq('user_id', profile.id)
            .eq('date', today)
            .maybeSingle();
            
          if (existingViews) {
            console.log("Already processed user channel today, skipping");
            continue;
          }
          
          // Fetch current channel stats from YouTube API
          const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${profile.youtube_channel_id}&key=${youtubeApiKey}`
          );
          
          if (!channelResponse.ok) {
            console.error(`Failed to fetch data for channel ${profile.youtube_channel_id}`);
            continue;
          }
          
          const channelData = await channelResponse.json();
          
          if (!channelData.items || channelData.items.length === 0) {
            console.error(`No data found for channel ${profile.youtube_channel_id}`);
            continue;
          }
          
          const viewCount = parseInt(channelData.items[0].statistics.viewCount) || 0;
          
          // Record the view count for today
          await supabaseAdmin
            .from('daily_views')
            .insert({
              channel_id: profile.youtube_channel_id,
              user_id: profile.id,
              date: today,
              views: viewCount
            });
            
          // Also update the profile with the latest stats
          await supabaseAdmin
            .from('profiles')
            .update({ 
              youtube_view_count: viewCount,
              youtube_subscriber_count: parseInt(channelData.items[0].statistics.subscriberCount) || 0,
              youtube_video_count: parseInt(channelData.items[0].statistics.videoCount) || 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', profile.id);
            
          console.log(`Saved daily views for user channel: ${profile.youtube_channel_id}`);
        } catch (error) {
          console.error(`Error processing user channel ${profile.youtube_channel_id}:`, error);
        }
      }
    }
    
    // 3. Process each competitor channel
    if (competitors && competitors.length > 0) {
      for (const competitor of competitors) {
        try {
          console.log(`Processing competitor channel: ${competitor.youtube_id}`);
          
          // Check if we already have entry for today
          const { data: existingViews } = await supabaseAdmin
            .from('daily_views')
            .select('id')
            .eq('channel_id', competitor.youtube_id)
            .eq('user_id', competitor.user_id)
            .eq('date', today)
            .maybeSingle();
            
          if (existingViews) {
            console.log("Already processed competitor channel today, skipping");
            continue;
          }
          
          // Fetch current channel stats from YouTube API
          const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${competitor.youtube_id}&key=${youtubeApiKey}`
          );
          
          if (!channelResponse.ok) {
            console.error(`Failed to fetch data for channel ${competitor.youtube_id}`);
            continue;
          }
          
          const channelData = await channelResponse.json();
          
          if (!channelData.items || channelData.items.length === 0) {
            console.error(`No data found for channel ${competitor.youtube_id}`);
            continue;
          }
          
          const viewCount = parseInt(channelData.items[0].statistics.viewCount) || 0;
          
          // Record the view count for today
          await supabaseAdmin
            .from('daily_views')
            .insert({
              channel_id: competitor.youtube_id,
              user_id: competitor.user_id,
              date: today,
              views: viewCount
            });
            
          // Also update the competitor record with latest stats
          await supabaseAdmin
            .from('competitor_channels')
            .update({ 
              view_count: viewCount,
              subscriber_count: parseInt(channelData.items[0].statistics.subscriberCount) || 0,
              video_count: parseInt(channelData.items[0].statistics.videoCount) || 0,
              updated_at: new Date().toISOString()
            })
            .eq('youtube_id', competitor.youtube_id)
            .eq('user_id', competitor.user_id);
            
          console.log(`Saved daily views for competitor: ${competitor.youtube_id}`);
        } catch (error) {
          console.error(`Error processing competitor ${competitor.youtube_id}:`, error);
        }
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Daily view tracking completed" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in daily views tracker:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
