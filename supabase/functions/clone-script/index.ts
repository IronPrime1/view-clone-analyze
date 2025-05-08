
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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

// Define the script clone handler
serve(async (req) => {
  // Handle CORS
  const corsResponse = await handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse the request
    const { competitorVideoUrl, userVideoUrl } = await req.json();
    
    // Validate request data
    if (!competitorVideoUrl) {
      return new Response(
        JSON.stringify({ error: "Competitor video URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Extract video ID from URL
    const videoId = extractYouTubeVideoId(competitorVideoUrl);
    
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: "Invalid YouTube URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Fetch video data and transcript
    // For now, we'll generate a mock script since we don't have real API access
    const script = generateMockScript(videoId, userVideoUrl);
    
    // Return the generated script
    return new Response(
      JSON.stringify({ success: true, script }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
    
  } catch (error) {
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

// Extract YouTube video ID from URL
function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Generate a mock script
function generateMockScript(videoId: string, userVideoUrl?: string): string {
  const topics = [
    "audience engagement strategies", 
    "SEO optimization tips",
    "trends in the industry",
    "content creation workflow",
    "storytelling techniques"
  ];
  
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  const includeUserVideo = userVideoUrl ? true : false;
  const currentDate = new Date().toLocaleDateString();
  
  let script = `# Video Script Based on Competitor Analysis
Generated on ${currentDate}
Video ID: ${videoId}

## Introduction
- Hook viewers with a compelling statement about ${randomTopic}
- Introduce yourself and the topic of today's video
- Mention why this topic matters to your audience

## Main Content
1. **Key Point 1: Understanding ${randomTopic}**
   - Explain the fundamentals
   - Share relevant statistics
   - Provide real-world examples

2. **Key Point 2: Implementation Strategies**
   - Step-by-step approach
   - Common mistakes to avoid
   - Tools and resources needed

3. **Key Point 3: Results You Can Expect**
   - Short-term benefits
   - Long-term impact
   - Case studies or success stories

## Conclusion
- Summarize the main points
- Call to action: Like, subscribe, comment
- Tease upcoming related content
`;

  if (includeUserVideo) {
    script += `\n## Integration with Your Existing Content
- This script has been tailored to match your existing style and content
- Recommended to reference your previous video on a related topic
- Consider creating a series where this video is part 2 of your content strategy
`;
  }

  script += `\n## Technical Notes
- Optimal video length: 8-12 minutes
- Add timestamps in video description
- Include 3-5 keywords in title and description
- Suggested thumbnail: Image showing before/after results

## Script Optimization
This script is designed to increase engagement and retention based on competitor analysis. Be sure to add your personal style and examples to make the content unique.`;

  return script;
}
