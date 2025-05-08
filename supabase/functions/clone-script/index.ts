
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

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
    const { competitorVideoUrl, userVideoUrl } = await req.json();
    
    console.log("Generating script for:", { competitorVideoUrl, userVideoUrl });
    
    // In a real app, this would analyze the videos and generate a script
    // For now, create a mock script
    
    const videoId = competitorVideoUrl?.split('v=')[1] || 'unknown';
    
    const templates = [
      `# Video Script: How to Replicate This Video's Success

## Introduction (0:00 - 0:30)
- "Hey everyone! Welcome back to my channel."
- "Today I'm going to show you how to create content that really resonates with your audience."
- "I recently analyzed a successful video in our niche, and I'm going to break down exactly what made it work."

## Main Points (0:30 - 5:00)
1. The Hook
   - First 15 seconds are crucial
   - Use pattern interrupts to grab attention
   - Ask a compelling question

2. Content Structure
   - Problem → Solution → Results format
   - Storytelling elements that connect emotionally
   - Visual pacing that maintains interest

3. Call to Action Techniques
   - Multiple soft CTAs throughout
   - Strong final CTA with clear value proposition
   - Use of graphics to emphasize action steps

## Implementation Tips (5:00 - 7:30)
- How to adapt these concepts to your own style
- Equipment and editing techniques to achieve similar quality
- Thumbnail design strategy based on the competitor's success

## Conclusion (7:30 - 8:00)
- Recap of key takeaways
- Invitation to share results
- Preview of next video

## Notes:
- Keep editing pace fast in the first minute
- Use similar background music style (upbeat, motivational)
- Incorporate similar B-roll footage transitions
`,
      `# Video Script: Competitor Analysis and Implementation

## Opening (0:00 - 0:30)
- Energetic greeting with your channel tagline
- "In this video, I'm breaking down a top-performing video in our niche and showing you how to apply these strategies to your own content."
- "By the end, you'll have a clear roadmap for your next high-performing video."

## Competitor Breakdown (0:30 - 3:00)
1. Title & Thumbnail Analysis
   - Keywords that drove clicks
   - Visual elements that created curiosity
   - How they created tension/intrigue

2. Content Structure Analysis
   - Opening hook effectiveness (first 15 seconds)
   - Content pacing and engagement techniques
   - Key moments that drive retention

3. Value Delivery Mechanism
   - How information was presented
   - Balance of entertainment vs. education
   - Unique angles on common topics

## Your Implementation Plan (3:00 - 6:30)
1. Content Planning
   - Topic selection based on this formula
   - Script structure template
   - B-roll and visual planning

2. Production Techniques
   - Camera angles to replicate
   - Lighting setup recommendations
   - Audio quality considerations

3. Post-Production Focus
   - Editing pace recommendations
   - Music and sound effect strategy
   - Graphics and text overlay approach

## Closing Strategy (6:30 - 8:00)
- Implementation timeline suggestion
- Call to action for audience engagement
- Preview of follow-up content

## Additional Notes:
- Focus on matching energy level throughout
- Use similar transitions between sections
- Consider using similar thumbnail color scheme
`,
      `# Video Script: Reverse Engineering Success

## Intro (0:00 - 0:45)
- "Welcome back to the channel! Today we're doing something different."
- "I've found a video that's crushing it in our niche, and I'm going to show you exactly how to create content with the same level of impact."
- "This isn't about copying—it's about understanding what works and why."

## Video Analysis (0:45 - 3:30)
1. Audience Psychology 
   - Why this content resonated with viewers
   - Emotional triggers used throughout
   - Pain points addressed and solutions offered

2. Structural Breakdown
   - Timing of key moments and reveals
   - Information density analysis
   - Use of open loops to maintain interest

3. Technical Execution
   - Camera movement patterns
   - Lighting techniques
   - Sound design elements

## Strategic Application (3:30 - 7:00)
1. Content Planning Framework
   - How to identify your own high-potential topics
   - Research method for finding unique angles
   - Content scheduling for maximum impact

2. Production Checklist
   - Essential equipment vs. nice-to-have
   - Time-saving shooting techniques
   - Performance tips for on-camera presence

3. Post-Production Priority List
   - Critical editing techniques
   - Color grading approach
   - Thumbnail design process

## Conclusion & Next Steps (7:00 - 8:30)
- Action plan summary
- Results prediction timeline
- Community challenge announcement

## Production Notes:
- Incorporate screen recordings of the analyzed video (fair use)
- Use split-screen comparisons where helpful
- Include downloadable template in description
`
    ];
    
    // Select a random template
    const scriptTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Customize the script a bit
    const customizedScript = scriptTemplate
      .replace(/competitor/gi, "the competitor video you selected")
      .replace(/niche/gi, "YouTube growth niche")
      .replace(/video/gi, "content");
    
    // Wait a bit to simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return new Response(JSON.stringify({ script: customizedScript, videoId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
