import { NextResponse } from 'next/server';
import { StudioScene, StudioDuration, VisualArchetype, SfxCue, StudioTone } from '@/types/studio';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      instruction,
      targetSceneIndex,
      scenes = [],
      topic = 'Explainer Video',
      duration = 60,
      tone = 'engaging',
    } = body;

    if (!instruction || typeof instruction !== 'string' || instruction.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Revision instruction is required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Existing scenes array is required for revision.' },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey || geminiKey.includes('your_') || geminiKey.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key is required for AI revisions.' },
        { status: 500 }
      );
    }

    const cleanInstruction = instruction.trim();
    const targetSec = [30, 60, 90].includes(duration) ? (duration as StudioDuration) : 60;
    const targetSceneCount = scenes.length;

    // Build the system prompt with existing scenes context
    const systemPrompt = `You are AutoReel Studio's AI Revision Copilot and Video Director.
A creator wants to revise an existing storyboard according to their specific instruction.

TOPIC: "${topic}"
OVERALL VIDEO RUNTIME: ${targetSec} seconds across ${targetSceneCount} scenes.
CREATOR REVISION INSTRUCTION: "${cleanInstruction}"
${targetSceneIndex ? `TARGET SCENE: Scene ${targetSceneIndex} (zero-based index ${targetSceneIndex - 1})` : ''}

EXISTING SCENES IN CURRENT STORYBOARD:
${JSON.stringify(
  scenes.map((s: StudioScene) => ({
    id: s.id,
    index: s.index,
    duration: s.duration,
    narration: s.narration,
    cue: s.cue,
    visualType: s.visualType,
    sfxCue: s.sfxCue,
    graphicData: s.graphicData,
  })),
  null,
  2
)}

CRITICAL REVISION DIRECTIVES:
1. TARGETED REVISION ONLY:
   - Identify which scene or scenes the user wants to modify based on the instruction.
   - If the user refers to a specific scene (e.g. "Scene 2", "the opening", "the conclusion", or targetSceneIndex: ${targetSceneIndex || 'not specified'}), ONLY modify that scene.
   - PRESERVE UNCHANGED SCENES COMPLETELY: For any scene NOT affected by the revision, keep its exact "id", "index", "duration", "narration", "cue", "visualType", "sfxCue", and "graphicData" intact.
2. REVISION RULES FOR MODIFIED SCENES:
   - Keep narration punchy, authoritative, and strictly within the scene word budget (8 to 12 spoken words).
   - MANDATORY PHONETIC WORDS FOR NUMBERS: In the "narration" string, you MUST spell out all numbers phonetically as spoken words (e.g. write "twenty-four thousand dollars" instead of "$24,000", "nineteen seventy-one" instead of "1971", "five forty PM" instead of "5:40 PM", "eleven airfields" instead of "11 airfields", "ninety-three thousand" instead of "93,000", "fifty percent" instead of "50%").
   - VERBATIM CUE: Provide an exact, verbatim substring from the new narration as the "cue".
   - VISUAL ARCHETYPE: Select from:
     * "code_terminal": For coding, syntax, terminal commands, APIs, algorithms, programming languages.
     * "investigative_dossier": For historical documents, declassified records, intelligence reports, treaties.
     * "dynamic_chart": For quantitative metrics, quantities, percentages, or statistics.
     * "timeline": For chronological dates, historical sequence, or turning points.
     * "step_sequence": For listing takeaways, key principles, or progressive phases.
     * "split_comparison": For contrasting two opposing sides, before/after states, or paradigms.
     * "vector_schematic": For strategic layouts, mechanisms, or system structures.
     * "process_flow": For cause-and-effect chains or multi-step decisions.
     * "crosshair_target": For spotlighting a single critical focus point or pivotal event.
     * "kinetic_text": For high-impact typographic hooks, decisive quotes, or closing statements.
   - GRAPHIC DATA: Update "graphicData" with relevant factual headline, badge, stat, or comparison items.
3. OUTPUT FORMAT:
   Return valid JSON with:
   - "scenes": The full array of all scenes (with the target scene(s) modified).
   - "modifiedIndices": An array of zero-based numbers indicating which scene indices were changed (e.g. [1] if only scene 2 changed).
   - "explanation": A one-sentence summary of what was revised.`;

    const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest'];
    let revisedData: { scenes: any[]; modifiedIndices: number[]; explanation: string } | null = null;
    let usedModel = '';

    for (const model of models) {
      if (revisedData) break;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
                responseSchema: {
                  type: 'OBJECT',
                  properties: {
                    scenes: {
                      type: 'ARRAY',
                      items: {
                        type: 'OBJECT',
                        properties: {
                          id: { type: 'STRING' },
                          duration: { type: 'NUMBER' },
                          narration: { type: 'STRING' },
                          cue: { type: 'STRING' },
                          decisionCue: { type: 'STRING' },
                          sfxCue: { type: 'STRING', enum: ['bass_drop', 'whoosh', 'pop', 'typewriter', 'none'] },
                          visualDirection: { type: 'STRING' },
                          visualType: {
                            type: 'STRING',
                            enum: [
                              'kinetic_text',
                              'vector_schematic',
                              'crosshair_target',
                              'split_comparison',
                              'process_flow',
                              'dynamic_chart',
                              'timeline',
                              'step_sequence',
                              'code_terminal',
                              'investigative_dossier'
                            ]
                          },
                          highlightWords: { type: 'ARRAY', items: { type: 'STRING' } },
                          graphicData: {
                            type: 'OBJECT',
                            properties: {
                              badge: { type: 'STRING' },
                              headline: { type: 'STRING' },
                              subtext: { type: 'STRING' },
                              statNumber: { type: 'STRING' },
                              statLabel: { type: 'STRING' },
                              leftItem: {
                                type: 'OBJECT',
                                properties: { title: { type: 'STRING' }, desc: { type: 'STRING' } }
                              },
                              rightItem: {
                                type: 'OBJECT',
                                properties: { title: { type: 'STRING' }, desc: { type: 'STRING' } }
                              },
                              steps: {
                                type: 'ARRAY',
                                items: {
                                  type: 'OBJECT',
                                  properties: { num: { type: 'STRING' }, title: { type: 'STRING' }, desc: { type: 'STRING' } }
                                }
                              },
                              milestones: {
                                type: 'ARRAY',
                                items: {
                                  type: 'OBJECT',
                                  properties: { date: { type: 'STRING' }, title: { type: 'STRING' } }
                                }
                              },
                              keyTags: { type: 'ARRAY', items: { type: 'STRING' } }
                            },
                            required: ['headline']
                          }
                        },
                        required: ['duration', 'narration', 'cue', 'visualDirection', 'visualType', 'sfxCue']
                      }
                    },
                    modifiedIndices: {
                      type: 'ARRAY',
                      items: { type: 'INTEGER' }
                    },
                    explanation: { type: 'STRING' }
                  },
                  required: ['scenes', 'modifiedIndices', 'explanation']
                }
              },
            }),
          }
        );

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errSnippet = await res.text().catch(() => '');
          console.warn(`Gemini model ${model} revision error ${res.status}: ${errSnippet.slice(0, 100)}`);
          continue;
        }

        const resData = await res.json();
        const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          let cleaned = rawText.trim();
          if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
          const parsed = JSON.parse(cleaned);
          if (parsed.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
            revisedData = parsed;
            usedModel = model;
          }
        }
      } catch (err) {
        console.warn(`Model ${model} revision call failed:`, err);
      }
    }

    if (!revisedData) {
      return NextResponse.json(
        { success: false, error: 'Could not process revision request with AI models.' },
        { status: 500 }
      );
    }

    // Determine modified indices if not explicitly provided or if empty
    let modifiedIndices = Array.isArray(revisedData.modifiedIndices) ? revisedData.modifiedIndices : [];
    if (modifiedIndices.length === 0) {
      // Diff narration against original scenes to detect changed scenes automatically
      revisedData.scenes.forEach((newScene: any, idx: number) => {
        const orig = scenes[idx];
        if (!orig || orig.narration !== newScene.narration || orig.visualType !== newScene.visualType) {
          modifiedIndices.push(idx);
        }
      });
    }

    const allowedArchetypes: VisualArchetype[] = [
      'kinetic_text',
      'vector_schematic',
      'crosshair_target',
      'split_comparison',
      'process_flow',
      'dynamic_chart',
      'timeline',
      'step_sequence',
      'code_terminal',
      'investigative_dossier',
    ];

    // Map and preserve existing audio on unchanged scenes
    let curTime = 0;
    const finalScenes: StudioScene[] = revisedData.scenes.map((s: any, idx: number) => {
      const isModified = modifiedIndices.includes(idx);
      const original = scenes[idx];

      const narrationText = String(s.narration || original?.narration || '');
      const rawCue = s.cue && typeof s.cue === 'string' && narrationText.includes(s.cue)
        ? s.cue
        : narrationText.split(/\s+/).slice(1, 3).join(' ') || narrationText.slice(0, 15);

      const visualType: VisualArchetype = allowedArchetypes.includes(s.visualType)
        ? s.visualType
        : original?.visualType || 'kinetic_text';

      const dur = Number(s.duration) || original?.duration || Number((targetSec / targetSceneCount).toFixed(1));
      const startTime = Number(curTime.toFixed(1));
      curTime += dur;
      const endTime = Number(curTime.toFixed(1));

      return {
        id: original?.id || `scene_${Date.now()}_${idx}`,
        index: idx + 1,
        startTime,
        endTime,
        duration: dur,
        narration: narrationText,
        cue: rawCue,
        decisionCue: s.decisionCue && narrationText.includes(s.decisionCue) ? s.decisionCue : undefined,
        visualDirection: String(s.visualDirection || original?.visualDirection || `Dynamic ${visualType}`),
        visualType,
        sfxCue: (s.sfxCue as SfxCue) || original?.sfxCue || 'none',
        highlightWords: Array.isArray(s.highlightWords) ? s.highlightWords : original?.highlightWords || [],
        graphicData: s.graphicData || original?.graphicData,
        // CRITICAL SMART CACHE: Keep original audio if this scene was NOT modified!
        audioUrl: isModified ? undefined : original?.audioUrl,
        audioDuration: isModified ? undefined : original?.audioDuration,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        scenes: finalScenes,
        modifiedIndices,
        explanation: revisedData.explanation || `Updated ${modifiedIndices.length} scene(s) according to instruction.`,
        modelUsed: usedModel,
      },
    });
  } catch (error: any) {
    console.error('Revise plan route error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Revision failed.' },
      { status: 500 }
    );
  }
}
