import { NextResponse } from 'next/server';
import { StudioScene } from '@/types/studio';
import { generateVideoChapters } from '@/utils/srt';

export interface PlatformPublishingKit {
  title: string;
  description: string;
  hashtags: string[];
}

export interface MultiPlatformKits {
  youtube: PlatformPublishingKit;
  instagram: PlatformPublishingKit;
  tiktok: PlatformPublishingKit;
  linkedin: PlatformPublishingKit;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      topic = 'CRISPR Gene Editing in Living Cells',
      scenes = [],
      duration = 60,
      tone = 'engaging',
    } = body;

    const safeTopic = (topic || 'Explainer Reel').trim();
    const typedScenes: StudioScene[] = Array.isArray(scenes) ? (scenes as StudioScene[]) : [];
    const geminiKey = process.env.GEMINI_API_KEY;

    // Helper for fallback generation
    const buildDeterministicKits = (): MultiPlatformKits => {
      const chapters = generateVideoChapters(typedScenes);
      const cleanSlug = safeTopic.replace(/[^a-zA-Z0-9]/g, '');
      const coreHashtags = [
        `#${cleanSlug.slice(0, 18)}`,
        '#Education',
        '#DeepDive',
        '#Science',
        '#VisualLearning',
      ];

      return {
        youtube: {
          title: `${safeTopic} Explained in ${duration} Seconds ⏱️`,
          description: `Everything you need to know about ${safeTopic} in under a minute.\n\nCHAPTERS:\n${chapters}\n\n💬 What topic should we animate next? Drop your thoughts in the comments!\n\nSUBSCRIBE for weekly deep-dive motion explainer reels.`,
          hashtags: ['#Shorts', '#Education', '#Explainers', ...coreHashtags],
        },
        instagram: {
          title: `How ${safeTopic} Works Behind the Scenes 🔍`,
          description: `Most people have heard of ${safeTopic}, but rarely see how it actually works frame-by-frame.\n\nSwipe through the breakdown above to see the core mechanism in action. Double-tap if you learned something new and save this reel for reference! 📌\n\nSound on for the full narration breakdown. 🎧`,
          hashtags: ['#reelsinstagram', '#learnontiktok', '#scienceexplained', '#animation', ...coreHashtags],
        },
        tiktok: {
          title: `Wait until you see how this actually works... 🤯`,
          description: `Did you know this about ${safeTopic}? Here is the exact breakdown in ${duration}s. 🧬 Follow for daily visual explainers!`,
          hashtags: ['#edutok', '#learnontiktok', '#didyouknow', '#fyp', ...coreHashtags],
        },
        linkedin: {
          title: `Deconstructing ${safeTopic}: Key Takeaways & Mechanics`,
          description: `Understanding ${safeTopic} is essential for professionals navigating modern developments in this space.\n\nKey Breakdown:\n${typedScenes
            .slice(0, 3)
            .map((s: StudioScene, i: number) => `• Takeaway ${i + 1}: ${s.narration}`)
            .join('\n')}\n\nWhat are your thoughts on where this technology is heading in the next 3-5 years? Looking forward to reading your insights below.`,
          hashtags: ['#Innovation', '#Technology', '#Education', '#DeepTech', ...coreHashtags],
        },
      };
    };

    // Try Gemini AI generation if key is present
    if (geminiKey && !geminiKey.includes('your_') && geminiKey.trim().length > 10) {
      try {
        const scriptExcerpt = typedScenes.map((s: StudioScene) => s.narration).join(' ');
        const prompt = `You are a social media growth strategist and video copywriter.
Generate tailored publishing kits for 4 platforms (YouTube Shorts, Instagram Reels, TikTok, LinkedIn) for this explainer video:

Topic: "${safeTopic}"
Duration: ${duration}s
Script: "${scriptExcerpt.slice(0, 600)}"

Return STRICTLY valid JSON with no markdown formatting:
{
  "youtube": {
    "title": "Punchy title under 80 chars with emoji",
    "description": "Engaging description with timestamps and call to action",
    "hashtags": ["#Shorts", "#TopicTag1", "#TopicTag2", "#Tag3"]
  },
  "instagram": {
    "title": "Visual hook title",
    "description": "Engaging IG caption with line breaks and call to save",
    "hashtags": ["#reelsinstagram", "#tag1", "#tag2", "#tag3"]
  },
  "tiktok": {
    "title": "Viral curiosity hook",
    "description": "Short, punchy TikTok caption with follow CTA",
    "hashtags": ["#edutok", "#learnontiktok", "#tag1", "#tag2"]
  },
  "linkedin": {
    "title": "Professional insight headline",
    "description": "Thoughtful breakdown with 3 bulleted takeaways and discussion prompt",
    "hashtags": ["#Innovation", "#Topic", "#Leadership"]
  }
}`;

        const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
        for (const model of models) {
          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.4,
                  },
                }),
              }
            );

            if (res.ok) {
              const resData = await res.json();
              const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawText) {
                const parsed = JSON.parse(rawText.trim());
                if (parsed.youtube && parsed.instagram && parsed.tiktok && parsed.linkedin) {
                  // Ensure chapter timestamps are present in YouTube description
                  const chapters = generateVideoChapters(typedScenes);
                  if (!parsed.youtube.description.includes('0:00')) {
                    parsed.youtube.description = `${parsed.youtube.description}\n\nCHAPTERS:\n${chapters}`;
                  }

                  return NextResponse.json({
                    success: true,
                    data: parsed as MultiPlatformKits,
                    source: `ai_${model}`,
                  });
                }
              }
            }
          } catch (e) {
            console.warn(`Gemini publishing generation failed on model ${model}:`, e);
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to deterministic kit:', err);
      }
    }

    // Fallback response
    const fallbackKits = buildDeterministicKits();
    return NextResponse.json({
      success: true,
      data: fallbackKits,
      source: 'deterministic_engine',
    });
  } catch (error: any) {
    console.error('Publishing generation error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Publishing generation failed' },
      { status: 500 }
    );
  }
}
