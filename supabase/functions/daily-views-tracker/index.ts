
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
    
    // Generate 7 days of data in the past
    const days = 7;
    const datesArray = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    });
    
    console.log(`Generating data for dates:`, datesArray);
    
    // 2. Process each user's own channel
    if (profiles && profiles.length > 0) {
      for (const profile of profiles) {
        if (!profile.youtube_channel_id) continue;
        
        try {
          console.log(`Processing user channel: ${profile.youtube_channel_id}`);
          
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
          
          const currentViewCount = parseInt(channelData.items[0].statistics.viewCount) || 0;
          
          // Update profile with latest view count
          await supabaseAdmin
            .from('profiles')
            .update({ 
              youtube_view_count: currentViewCount,
              youtube_subscriber_count: parseInt(channelData.items[0].statistics.subscriberCount) || 0,
              youtube_video_count: parseInt(channelData.items[0].statistics.videoCount) || 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', profile.id);
          
          // Generate simulated historical data - each date gets different view count
          // with recent dates having slightly higher counts than older dates to simulate growth
          const totalViews = currentViewCount;
          const dailyViews = [];
          
          // Check existing records to avoid duplicates
          const { data: existingRecords } = await supabaseAdmin
            .from('daily_views')
            .select('date')
            .eq('channel_id', profile.youtube_channel_id)
            .eq('user_id', profile.id)
            .in('date', datesArray);
          
          const existingDates = new Set((existingRecords || []).map(record => record.date));
          
          // Generate view count data for each day
          for (const date of datesArray) {
            // Skip if we already have a record for this date
            if (existingDates.has(date)) {
              console.log(`Skipping existing record for date ${date}`);
              continue;
            }
            
            // Generate a realistic view count for this day
            // Decreasing slightly as we go back in time to simulate channel growth
            const index = datesArray.indexOf(date);
            const factor = 0.98 ** (datesArray.length - 1 - index);
            const dayViews = Math.floor(totalViews / (365 * 3) * factor);
            
            dailyViews.push({
              channel_id: profile.youtube_channel_id,
              user_id: profile.id,
              date: date,
              views: dayViews
            });
          }
          
          // Insert all the view data if we have any new dates
          if (dailyViews.length > 0) {
            const { error: insertError } = await supabaseAdmin
              .from('daily_views')
              .insert(dailyViews);
              
            if (insertError) {
              console.error(`Error inserting daily views: ${insertError.message}`);
            } else {
              console.log(`Added ${dailyViews.length} historical view records for user channel`);
            }
          }
            
          console.log(`Processed daily views for user channel: ${profile.youtube_channel_id}`);
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
          
          const currentViewCount = parseInt(channelData.items[0].statistics.viewCount) || 0;
          
          // Update competitor with latest stats
          await supabaseAdmin
            .from('competitor_channels')
            .update({ 
              view_count: currentViewCount,
              subscriber_count: parseInt(channelData.items[0].statistics.subscriberCount) || 0,
              video_count: parseInt(channelData.items[0].statistics.videoCount) || 0,
              updated_at: new Date().toISOString()
            })
            .eq('youtube_id', competitor.youtube_id)
            .eq('user_id', competitor.user_id);
          
          // Generate simulated historical data
          const totalViews = currentViewCount;
          const dailyViews = [];
          
          // Check existing records to avoid duplicates
          const { data: existingRecords } = await supabaseAdmin
            .from('daily_views')
            .select('date')
            .eq('channel_id', competitor.youtube_id)
            .eq('user_id', competitor.user_id)
            .in('date', datesArray);
          
          const existingDates = new Set((existingRecords || []).map(record => record.date));
          
          // Generate view count data for each day
          for (const date of datesArray) {
            // Skip if we already have a record for this date
            if (existingDates.has(date)) {
              continue;
            }
            
            // Generate a realistic view count for this day
            // Decreasing slightly as we go back in time to simulate channel growth
            const index = datesArray.indexOf(date);
            const factor = 0.99 ** (datesArray.length - 1 - index);
            const dayViews = Math.floor(totalViews / (365 * 2.5) * factor);
            
            dailyViews.push({
              channel_id: competitor.youtube_id,
              user_id: competitor.user_id,
              date: date,
              views: dayViews
            });
          }
          
          // Insert all the view data if we have any
          if (dailyViews.length > 0) {
            const { error: insertError } = await supabaseAdmin
              .from('daily_views')
              .insert(dailyViews);
              
            if (insertError) {
              console.error(`Error inserting daily views: ${insertError.message}`);
            } else {
              console.log(`Added ${dailyViews.length} historical view records for competitor channel`);
            }
          }
          
          console.log(`Processed daily views for competitor: ${competitor.youtube_id}`);
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
