
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
  };

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Parse request body
    const { videoUrl, userUrl } = await req.json();
    
    if (!videoUrl || typeof videoUrl !== 'string') {
      throw new Error('videoUrl is missing or invalid');
    }

    // Extract video ID from the YouTube URL
    const videoId = videoUrl.match(/(?:[?&]v=|youtu.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Get API keys
    const rapidApiKey = Deno.env.get('RAPID_API_KEY');
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables');
    }

    // Fetch the transcript using RapidAPI
    console.log(`Fetching transcript for video ID: ${videoId[1]}`);
    const transcriptUrl = `https://youtube-transcript3.p.rapidapi.com/api/transcript?videoId=${videoId[1]}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'youtube-transcript3.p.rapidapi.com'
      }
    };

    const transcriptResponse = await fetch(transcriptUrl, options);
    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error(`RapidAPI error (${transcriptResponse.status}):`, errorText);
      throw new Error(`Error fetching transcript: ${transcriptResponse.status} ${transcriptResponse.statusText}`);
    }

    const transcriptData = await transcriptResponse.json();
    if (!transcriptData || !transcriptData.transcript) {
      throw new Error('No transcript data available for this video');
    }

    const transcript = transcriptData.transcript;
    const plainTextTranscript = transcript.map((item) => item.text).join(' ');

    // Helper function to call Groq API
    const callGroqAPI = async (prompt, model = 'llama-3.3-70b-versatile') => {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Groq API error (${response.status}):`, errorText);
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const completion = await response.json();
      return completion.choices?.[0]?.message?.content || '';
    };

    let userStyleAnalysis = '';
    
    // Step 1: Analyze user's style if userUrl is provided
    if (userUrl) {
      console.log('Step 1: Analyzing user style...');
      const styleAnalysisPrompt = `
You are a master YouTube script analyst with expertise in identifying unique storytelling patterns, voice, and engagement techniques.

Analyze the following script and extract the creator's UNIQUE SIGNATURE STYLE:

**SCRIPT TO ANALYZE:**
${userUrl}

**YOUR ANALYSIS MUST INCLUDE:**

1. **HOOK PATTERNS** - How do they open videos? What makes viewers stop scrolling?
2. **STORYTELLING DNA** - Do they use analogies, personal stories, case studies, or dramatic reveals?
3. **PACING & RHYTHM** - Fast-paced? Slow burn? How do they build tension?
4. **LANGUAGE STYLE** - Casual/formal? Technical/simple? Emotional/logical?
5. **ENGAGEMENT TRICKS** - How do they keep people watching? Questions? Cliffhangers? Callbacks?
6. **PERSONALITY TRAITS** - Humor style, authority level, relatability factors
7. **STRUCTURAL PREFERENCES** - How do they organize information? Lists? Stories? Problem-solution?

Extract the creator's voice like you're creating a DNA profile. Focus on what makes them UNIQUE and MEMORABLE.

Provide a detailed style profile that could be used to recreate their voice authentically.
`;

      userStyleAnalysis = await callGroqAPI(styleAnalysisPrompt);
      console.log('User style analysis completed');
    }

    // Step 2: Analyze the viral video structure and key elements
    console.log('Step 2: Analyzing viral video structure...');
    const viralAnalysisPrompt = `
You are a viral content strategist who reverse-engineers what makes videos explode on YouTube.

Analyze this viral video transcript and extract the VIRAL DNA:

**VIRAL TRANSCRIPT:**
${plainTextTranscript}

**EXTRACT THE VIRAL ELEMENTS:**

1. **THE HOOK** - What grabbed attention in the first 15 seconds?
2. **CORE MESSAGE** - What's the main value proposition or revelation?
3. **STORY STRUCTURE** - How is information revealed? What's the journey?
4. **EMOTIONAL TRIGGERS** - What emotions does it evoke? Fear? Curiosity? Excitement?
5. **RETENTION TACTICS** - What keeps people watching? Promises? Teasers? Payoffs?
6. **KEY MOMENTS** - What are the most engaging/surprising parts?
7. **PACING ANALYSIS** - Where does it speed up or slow down for effect?
8. **CALL-TO-ACTION** - How does it end? What action does it inspire?

Identify the psychological triggers and storytelling mechanics that made this content viral.

Focus on WHY it works, not just WHAT it says.
`;

    const viralAnalysis = await callGroqAPI(viralAnalysisPrompt);
    console.log('Viral analysis completed');

    // Step 3: Generate the ultimate script
    console.log('Step 3: Generating the ultimate script...');
    const finalScriptPrompt = `
You are the world's most elite YouTube scriptwriter, combining the storytelling mastery of Pixar, the engagement tactics of MrBeast, and the psychological understanding of viral content creators.

Your mission: Create a LEGENDARY YouTube script that will become the new gold standard.

**USER'S SIGNATURE STYLE:**
${userStyleAnalysis || 'No user style provided - create in a universally engaging style'}

**VIRAL VIDEO ANALYSIS:**
${viralAnalysis}

**ULTIMATE SCRIPT REQUIREMENTS:**

🎯 **MAGNETIC OPENING (0-15 seconds)**
- Use pattern interrupts that stop the scroll
- Create immediate curiosity gaps
- Promise a specific, valuable payoff
- Include visual/emotional hooks

📚 **STORY ARCHITECTURE**
- Follow the "3-Act YouTube Structure": Hook → Journey → Payoff
- Use "breadcrumb storytelling" - drop hints that pay off later
- Create multiple "aha moments" throughout
- Build to a satisfying climax and resolution

🔥 **RETENTION MASTERY**
- Every 30 seconds, reset attention with new intrigue
- Use "pattern breaks" to maintain engagement
- Include "callback moments" that reference earlier content
- Strategic use of cliffhangers and payoff loops

💎 **PREMIUM TECHNIQUES**
- Metaphors and analogies that make complex ideas stick
- Personal vulnerability that creates connection
- Specific, concrete examples over abstract concepts
- Visual storytelling that works even without images

🎭 **EMOTIONAL ENGINEERING**
- Create emotional highs and lows
- Use curiosity as the primary driver
- Include moments of surprise, delight, or revelation
- End with inspiration or clear next steps

**SCRIPT STRUCTURE:**
1. **COLD OPEN** (0-15s): The hook that stops everything
2. **SETUP** (15-45s): Context and promise amplification  
3. **JOURNEY** (45s-90%): The main story with multiple payoffs
4. **CLIMAX** (90-95%): The biggest revelation or transformation
5. **RESOLUTION** (95-100%): Clear takeaway and call-to-action

Write a script that doesn't just inform—it TRANSFORMS the viewer's understanding and leaves them feeling like they've discovered something life-changing.

Make every word count. Every sentence should either advance the story or deepen engagement.

Create something that people will want to share because it made them feel smarter, more inspired, or more connected.
`;

    console.log('Calling final script generation...');
    const finalScript = await callGroqAPI(finalScriptPrompt);

    // Return the generated script
    return new Response(JSON.stringify({
      script: finalScript,
      userStyleAnalysis: userStyleAnalysis || null,
      viralAnalysis: viralAnalysis
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Script generation error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
