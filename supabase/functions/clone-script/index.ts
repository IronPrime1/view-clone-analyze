
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

// Helper function to extract video ID from URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  
  return null;
}

// Helper function to fetch video data from YouTube API
async function fetchVideoDetails(videoId: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch video details from YouTube API");
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      throw new Error("No video found with the provided ID");
    }
    
    const video = data.items[0];
    
    return {
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      tags: video.snippet.tags || []
    };
  } catch (error) {
    console.error("Error fetching video details:", error);
    throw error;
  }
}

// Function to generate a video script based on competitor video
function generateScript(competitorVideo: any, userVideo: any | null) {
  // Generate intro
  const intro = `# ${competitorVideo.title}\n\n## Introduction\n`;
  
  // Generate hook
  const hook = `Hello everyone, welcome back to the channel. Today we're going to be talking about ${competitorVideo.title.toLowerCase()}.\n\n`;
  
  // Generate main content
  const mainContent = `## Main Content\n\n`;
  
  // Generate description content
  let descriptionParagraphs = competitorVideo.description
    .split('\n\n')
    .filter((p: string) => p.length > 30)
    .slice(0, 3)
    .map((p: string) => `- ${p.replace(/http\S+/g, '')}\n`)
    .join('\n');
  
  if (!descriptionParagraphs) {
    descriptionParagraphs = "- Let's dive into this topic in detail\n- Make sure to cover all important aspects\n- Remember to explain key concepts clearly";
  }
  
  // Generate outro
  const outro = `\n\n## Conclusion\n\nThank you for watching! If you found this video helpful, please like and subscribe for more content like this. Let me know in the comments if you have any questions or suggestions for future videos.`;
  
  // Add user video reference if available
  const userVideoSection = userVideo ? 
    `\n\n## Personal Insights\nIn my previous video on ${userVideo.title}, we talked about similar concepts. Let's build upon those ideas with some new insights...\n\n` : '';
  
  // Generate tags section
  const tags = competitorVideo.tags && competitorVideo.tags.length > 0 ?
    `\n\n## Tags\n${competitorVideo.tags.slice(0, 8).map((tag: string) => `#${tag.replace(/\s+/g, '')}`).join(' ')}` :
    '';
  
  // Combine all sections
  return `${intro}${hook}${mainContent}${descriptionParagraphs}${userVideoSection}${outro}${tags}`;
}

// Define the API handler
serve(async (req) => {
  // Handle CORS
  const corsResponse = await handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request body
    const { competitorVideoUrl, userVideoUrl } = await req.json();
    
    // Validate request data
    if (!competitorVideoUrl) {
      return new Response(
        JSON.stringify({ error: "Competitor video URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Extract video IDs
    const competitorVideoId = extractVideoId(competitorVideoUrl);
    const userVideoId = userVideoUrl ? extractVideoId(userVideoUrl) : null;
    
    if (!competitorVideoId) {
      return new Response(
        JSON.stringify({ error: "Invalid competitor video URL or ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get YouTube API key
    const apiKey = Deno.env.get("YOUTUBE_API_KEY") || "AIzaSyDKh3CDFoL69CuW6aFxTW-u9igrootuqpk";
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "YouTube API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Fetch video details
    const competitorVideo = await fetchVideoDetails(competitorVideoId, apiKey);
    let userVideo = null;
    
    if (userVideoId) {
      try {
        userVideo = await fetchVideoDetails(userVideoId, apiKey);
      } catch (error) {
        console.error("Error fetching user video:", error);
        // Continue without user video
      }
    }
    
    // Generate script
    const script = generateScript(competitorVideo, userVideo);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        script
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error: any) {
    console.error("Script generation error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
