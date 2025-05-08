
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// In a production app, you would use real OAuth and API calls
// This is a simplified mock version for the prototype

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    if (path === 'connect') {
      // Handle OAuth connection
      
      // In a real app, this would handle a real OAuth flow
      // For now, return a mock response
      const mockResponse = {
        success: true,
        channelInfo: {
          id: "your-channel-id",
          title: "Your YouTube Channel",
          subscriberCount: 5480,
          viewCount: 286400,
          videoCount: 42,
          thumbnail: "https://i.pravatar.cc/150?u=yourChannel"
        },
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        expiresAt: new Date(Date.now() + 3600000).toISOString()
      };
      
      return new Response(JSON.stringify(mockResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    } 
    else if (path === 'analytics') {
      // Get YouTube analytics data
      const mockDailyViews = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          views: Math.floor(Math.random() * 1000) + 500
        };
      });
      
      return new Response(JSON.stringify({ dailyViews: mockDailyViews }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    else if (path === 'channel') {
      // Get channel info
      const { channel } = await req.json();
      
      // In a real app, we'd call the YouTube API
      const randomId = Math.random().toString(36).substring(2, 15);
      const randomSubscribers = Math.floor(Math.random() * 9000) + 1000;
      const randomViews = randomSubscribers * (Math.floor(Math.random() * 50) + 20);
      const randomVideos = Math.floor(Math.random() * 100) + 10;
      
      const mockChannel = {
        id: randomId,
        title: channel.includes('/') ? 
          channel.split('/').pop() || "Competitor Channel" : 
          channel,
        subscriberCount: randomSubscribers,
        viewCount: randomViews,
        videoCount: randomVideos,
        thumbnail: `https://i.pravatar.cc/150?u=${randomId}`,
        videos: Array.from({ length: 10 }, (_, i) => {
          const isShort = i % 3 === 0; // Every 3rd video is a short
          const videoId = `v-${Math.random().toString(36).substring(2, 10)}`;
          const viewCount = isShort ? 
            Math.floor(Math.random() * 50000) + 10000 : 
            Math.floor(Math.random() * 10000) + 1000;
          
          const daysAgo = Math.floor(Math.random() * 7);
          const pubDate = new Date();
          pubDate.setDate(pubDate.getDate() - daysAgo);
          
          return {
            id: videoId,
            title: isShort ? 
              `Quick ${i + 1}: How to boost engagement instantly` : 
              `The complete guide to growing on YouTube - Part ${i + 1}`,
            description: isShort ? 
              "Short video tip for quick growth!" : 
              "In this video, I share my top strategies for growth on YouTube in 2023...",
            publishedAt: pubDate.toISOString(),
            thumbnail: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/640/360`,
            viewCount: viewCount,
            likeCount: Math.floor(viewCount * 0.1),
            commentCount: Math.floor(viewCount * 0.02),
            isShort: isShort
          };
        })
      };
      
      return new Response(JSON.stringify(mockChannel), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // Default response if no path matches
    return new Response(JSON.stringify({ error: 'Route not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404,
    });
    
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
