import { NextResponse } from 'next/server';
import { StudioScene, StudioDuration, StudioTone, DynamicGraphicData, VisualArchetype, SfxCue } from '@/types/studio';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export type StoryboardScene = StudioScene;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      topic = 'CRISPR Gene Editing in Human Cells',
      duration = 60,
      tone = 'engaging',
      voice = 'alloy',
      scriptMode = 'ai_generate',
      customScript = '',
    } = body;

    const targetSec = [30, 60, 90].includes(duration) ? (duration as StudioDuration) : 60;
    // Strict spoken cadence word budgets (approx 2.0 - 2.2 words/second for natural, unhurried articulation)
    const targetWords = targetSec === 30 ? 60 : targetSec === 60 ? 120 : 180;
    const minWords = targetSec === 30 ? 50 : targetSec === 60 ? 105 : 160;
    const maxWords = targetSec === 30 ? 70 : targetSec === 60 ? 135 : 200;
    const targetSceneCount = targetSec === 30 ? 6 : targetSec === 60 ? 12 : 18;

    const geminiKey = process.env.GEMINI_API_KEY;

    let scenes: StudioScene[] | null = null;
    let usedModel = 'heuristic-engine';

    if (geminiKey && !geminiKey.includes('your_') && geminiKey.trim().length > 10) {
      try {
        const systemPrompt = `You are AutoReel Studio's master AI Video Director, Educational Scriptwriter, and Motion Designer.
You produce viral, educational, and deeply factual 9:16 vertical video storyboards for ANY subject: history, geopolitics, science, biology, economics, technology, software engineering, philosophy, or current affairs.

CRITICAL DIRECTIVE RULES:
1. STRICT SPOKEN WORD CADENCE & EXACT WORD BUDGET:
   - Target total video duration: EXACTLY ${targetSec} seconds.
   - Total spoken word budget across ALL scenes combined MUST be between ${minWords} and ${maxWords} words (Target: ~${targetWords} words).
   - You MUST generate EXACTLY ${targetSceneCount} sequential scenes (each scene strictly between 8 and 12 punchy spoken words, lasting ~${(targetSec / targetSceneCount).toFixed(1)}s so spoken voiceover naturally and completely finishes before scene transition).
   - NEVER output overlong scenes or dense multi-clause sentences. Mobile vertical videos demand punchy, focused, articulate phrases.
2. DEEP FACTUAL SUBSTANCE & REAL ENTITIES:
   - Conduct thorough, accurate factual analysis of the user's specific topic.
   - Include real historical dates, operations, battles, treaties, names of leaders, institutions, legislation, scientific mechanisms, code syntax, or economic statistics.
   - For example: if the topic is a war, mention specific operations (e.g. Operation Chengiz Khan), real dates (Dec 3, 1971), real troop numbers (e.g. 93,000 POWs), prime ministers, treaties (e.g. Simla Agreement), and constitutional/geopolitical changes.
   - If the topic is software, coding, or technology, mention real languages, APIs, architecture, terminal commands, or runtime concepts.
3. ABSOLUTE BAN ON CLICHES & TEMPLATES:
   - NEVER start with "Most people misunderstand", "Most people think", or "Have you ever wondered".
   - NEVER use filler phrases like "paradigm shift", "game changer", or "it hinges on one principle".
   - Start IMMEDIATELY on beat 1 with an authoritative, high-impact fact or tension hook that pulls the viewer in.
4. VERBATIM ANIMATION CUES (WORD-LEVEL SYNCHRONIZATION):
   - For every scene, you MUST specify a "cue": an EXACT, VERBATIM substring of that scene's narration where the visual turning point, metric, or entity is spoken.
   - The animation and diagram elements will stay dormant until the narrator reaches this exact word!
   - For comparative scenes, you may also provide a "decisionCue" (a second exact substring where the alternative side is introduced).
5. RICH EDITORIAL DIAGRAM SPECIFICATION (NOT SCI-FI WALLPAPER):
   - The visual on screen MUST DIRECTLY EXPLAIN AND ILLUSTRATE THE SPOKEN SCRIPT of that beat.
   - No generic futuristic telemetry or sci-fi filler (no "TARGET_ACQUIRED", "SCHEMATIC_REF", or fake radar grids).
   - For every single scene, generate a rich "graphicData" object containing:
     * "badge": A high-contrast editorial pill (e.g. "DECEMBER 3, 1971 // PREEMPTIVE ATTACK", "RUN_CORE.TS", or "DECLASSIFIED ARCHIVE").
     * "headline": The big factual visual anchor on screen (e.g. "OPERATION CHENGIZ KHAN" or "RUNTIME SYNTAX").
     * "subtext": Explanatory factual context (e.g. "11 frontline airfields targeted across western border" or "Type-safe async execution pipeline").
     * "statNumber": If the scene mentions a number/stat (e.g. "11", "93,000", "10M", "13", "1971", "300%", "60 FPS"), provide it here.
     * "statLabel": Descriptive label for the stat (e.g. "AIRFIELDS TARGETED" or "FRAME VELOCITY").
     * "leftItem": If comparing two sides/policies/states: { "title": "...", "desc": "..." }.
     * "rightItem": If comparing two sides/policies/states: { "title": "...", "desc": "..." }.
     * "steps": If listing principles or phases: [ { "num": "01", "title": "...", "desc": "..." }, ... ].
     * "milestones": If a timeline or chronological turning points: [ { "date": "...", "title": "..." }, ... ].
     * "keyTags": Array of 2-3 specific names, places, or keywords from that scene.
6. SELECT THE FITTING VISUAL ARCHETYPE (MANDATORY DIVERSITY & TOPIC ACCURACY):
   - Select from these 10 industry-grade archetypes:
     * "code_terminal": MANDATORY for any scene discussing code, syntax, terminal commands, APIs, algorithms, scripts, programming languages (Python, JS, Rust, SQL, etc.), dev tools, or system runtime execution (Renders a high-tech Fireship-style dark code terminal with line numbers, syntax highlighting, reactive compiling status, and file headers).
     * "investigative_dossier": MANDATORY for any scene discussing declassified documents, forensic evidence, intelligence reports, historical records, paper trails, treaties, government investigations, or secret files (Renders a Vox-style investigative document with red DECLASSIFIED stamps, highlighted redactions, and archival metadata).
     * "dynamic_chart": When presenting quantitative metrics, quantities, percentages, or growth statistics.
     * "timeline": When presenting chronological dates, historical sequence, or turning points.
     * "step_sequence": When listing takeaways, key principles, or progressive phases.
     * "split_comparison": When contrasting two opposing forces, borders, fronts, before/after states, or paradigms.
     * "vector_schematic": When explaining strategic layouts, mechanisms, or system structures.
     * "process_flow": When illustrating cause-and-effect chains or multi-step decisions.
     * "crosshair_target": When spotlighting a single critical focus point, leader, or pivotal event.
     * "kinetic_text": For high-impact typographic hooks, decisive quotes, or closing statements.
   - CRITICAL REQUIREMENT: Do NOT repeat the same visualType consecutively. Actively showcase "code_terminal" whenever the topic has a coding/technical angle, and "investigative_dossier" whenever the topic has historical, geopolitical, investigative, or archival context.
7. PROCEDURAL SOUND EFFECT CUE ("sfxCue"):
   - "bass_drop": Mandatory for Scene 1 (beat 1 hook) and major climaxes.
   - "typewriter": Mandatory for "code_terminal" and paper/document lines.
   - "whoosh": For "investigative_dossier", comparative shifts, or fast transitions.
   - "pop": For statistical number highlights, badge pop-ups, and sudden revelations.
   - "none": Clean silent cuts for standard narrative flow.

${
  scriptMode === 'own_script' && customScript.trim().length > 10
    ? `The creator has provided their own script below. Polish it for rhythm and cadence, ensure it matches ~${targetWords} words (${targetSec}s runtime), and divide it into EXACTLY ${targetSceneCount} time-synced scenes:
User Script:
"""${customScript}"""`
    : `Generate an original, deeply researched explainer script and motion storyboard for this topic:
Topic: "${topic}"`
}

Respond STRICTLY with valid JSON (no markdown formatting, no code blocks):
{
  "scenes": [
    {
      "duration": ${(targetSec / targetSceneCount).toFixed(1)},
      "narration": "Authoritative spoken sentence explaining the exact factual concept.",
      "cue": "exact verbatim substring from narration",
      "sfxCue": "bass_drop",
      "visualDirection": "Description of the visual animation appearing on screen.",
      "visualType": "kinetic_text",
      "highlightWords": ["key", "highlighted", "words"],
      "graphicData": {
        "badge": "DECEMBER 3, 1971 // PREEMPTIVE ATTACK",
        "headline": "OPERATION CHENGIZ KHAN",
        "subtext": "11 frontline airfields targeted across western border",
        "statNumber": "11",
        "statLabel": "AIRFIELDS TARGETED",
        "leftItem": { "title": "Western Airbases", "desc": "Pathankot & Amritsar" },
        "rightItem": { "title": "Air Defense", "desc": "Repaired within hours" },
        "steps": [
          { "num": "01", "title": "Radar Detection", "desc": "5:40 PM alert" },
          { "num": "02", "title": "Minimal Damage", "desc": "Aircraft protected" },
          { "num": "03", "title": "Full War Declared", "desc": "Midnight broadcast" }
        ],
        "milestones": [
          { "date": "March 1971", "title": "Refugee Crisis" },
          { "date": "Dec 3, 1971", "title": "Airfields Attacked" },
          { "date": "Dec 16, 1971", "title": "Dhaka Surrender" }
        ],
        "keyTags": ["Indira Gandhi", "Western Border", "IAF Counterstrike"]
      }
    }
  ]
}`;

        const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest'];
        for (const model of models) {
          if (scenes) break;
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
                    temperature: 0.3,
                  },
                }),
              }
            );

            clearTimeout(timeoutId);

            if (!res.ok) {
              const errSnippet = await res.text().catch(() => '');
              console.warn(`Gemini model ${model} returned status ${res.status}: ${errSnippet.slice(0, 120)}, attempting fallback model...`);
              continue;
            }
            if (res.ok) {
              const resData = await res.json();
              const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (rawText) {
                let cleanedText = rawText.trim();
                if (cleanedText.startsWith('```json')) {
                  cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                } else if (cleanedText.startsWith('```')) {
                  cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
                }
                cleanedText = cleanedText.replace(/,\s*([\]}])/g, '$1');
                const parsed = JSON.parse(cleanedText);
                if (parsed.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length >= 2) {
                  usedModel = model;
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

                  scenes = parsed.scenes.map((s: any, idx: number) => {
                    const dur = Number(s.duration) || Number((targetSec / targetSceneCount).toFixed(1));
                    const narrationText = String(s.narration || '');
                    const rawCue = s.cue && typeof s.cue === 'string' && narrationText.includes(s.cue)
                      ? s.cue
                      : (Array.isArray(s.highlightWords) && s.highlightWords.find((w: string) => narrationText.includes(w)))
                      || narrationText.split(/\s+/).slice(1, 3).join(' ')
                      || narrationText.slice(0, 15);

                    const visualType: VisualArchetype = allowedArchetypes.includes(s.visualType)
                      ? s.visualType
                      : 'kinetic_text';

                    const allowedSfx: SfxCue[] = ['bass_drop', 'whoosh', 'pop', 'typewriter', 'none'];
                    const sfxCue: SfxCue = allowedSfx.includes(s.sfxCue)
                      ? s.sfxCue
                      : (visualType === 'code_terminal' ? 'typewriter' : (idx === 0 ? 'bass_drop' : 'none'));

                    return {
                      id: `scene_${Date.now()}_${idx}`,
                      index: idx + 1,
                      startTime: 0,
                      endTime: dur,
                      duration: dur,
                      narration: narrationText,
                      cue: rawCue,
                      decisionCue: s.decisionCue && narrationText.includes(s.decisionCue) ? s.decisionCue : undefined,
                      visualDirection: String(s.visualDirection || `Dynamic cinematic ${visualType.replace('_', ' ')} sequence`),
                      visualType,
                      sfxCue,
                      highlightWords: Array.isArray(s.highlightWords) ? s.highlightWords : [],
                      graphicData: s.graphicData && typeof s.graphicData === 'object' ? s.graphicData : undefined,
                    };
                  });
                }
              }
            }
          } catch (modelErr) {
            console.warn(`Model ${model} call failed, trying next:`, modelErr);
          }
        }
      } catch (geminiError) {
        console.warn('Gemini generation encountered an error:', geminiError);
      }
    }

    // Contextual Dynamic Generator (Synthesizes factual narrative directly from topic phrasing if API offline)
    const validScenes: StudioScene[] = (scenes && scenes.length > 0)
      ? scenes
      : generateHeuristicScenes(topic, targetSec, targetSceneCount, scriptMode, customScript);

    // MATHEMATICALLY NORMALIZE SCENE DURATIONS TO TARGET DURATION WITH 100.0% PRECISION
    const rawTotalDuration = validScenes.reduce((acc, s) => acc + (s.duration || 5.0), 0);
    const scalingFactor = targetSec / (rawTotalDuration || targetSec);
    const sceneCount = validScenes.length;

    let currentTime = 0;
    const fps = 30;
    const normalizedScenes = validScenes.map((s, idx) => {
      // Scale duration proportionally
      let dur = Number(((s.duration || 5.0) * scalingFactor).toFixed(1));
      // Clamp the last scene so the sum matches targetSec with 100.0% exactness
      if (idx === sceneCount - 1) {
        dur = Number((targetSec - currentTime).toFixed(1));
      }
      const start = Number(currentTime.toFixed(1));
      currentTime += dur;
      const end = Number(currentTime.toFixed(1));

      const narrationText = s.narration || '';
      const rawCue = s.cue && narrationText.includes(s.cue)
        ? s.cue
        : (s.highlightWords && s.highlightWords.find((w) => narrationText.includes(w)))
        || narrationText.split(/\s+/).slice(1, 3).join(' ')
        || narrationText.slice(0, 15);

      const charOffset = narrationText.indexOf(rawCue);
      const cueRatio = charOffset >= 0
        ? Math.max(0.12, Math.min(0.8, charOffset / (narrationText.length || 1)))
        : 0.25;
      const cueFrame = Math.max(4, Math.floor(cueRatio * dur * fps));

      let decisionFrame: number | undefined;
      if (s.decisionCue && narrationText.includes(s.decisionCue)) {
        const decOffset = narrationText.indexOf(s.decisionCue);
        const decRatio = Math.max(cueRatio + 0.15, Math.min(0.9, decOffset / (narrationText.length || 1)));
        decisionFrame = Math.max(cueFrame + 8, Math.floor(decRatio * dur * fps));
      }

      // Clean acoustic defaults: Scene 0 gets hook bass drop; code_terminal gets typewriter; other cuts default to 'none'
      const defaultSfxCue = idx === 0 ? 'bass_drop' : (s.visualType === 'code_terminal' ? 'typewriter' : 'none');
      const sfxCue = s.sfxCue || defaultSfxCue;

      return {
        ...s,
        id: s.id || `scene_${idx + 1}`,
        index: idx + 1,
        duration: dur,
        startTime: start,
        endTime: end,
        cue: rawCue,
        cueFrame,
        decisionCue: s.decisionCue,
        decisionFrame,
        sfxCue,
      };
    });

    const totalDuration = targetSec;
    const wordCount = normalizedScenes.reduce((acc, s) => acc + s.narration.trim().split(/\s+/).filter(Boolean).length, 0);

    return NextResponse.json({
      success: true,
      data: {
        scenes: normalizedScenes,
        topic,
        targetDuration: targetSec,
        totalDuration,
        wordCount,
        modelUsed: usedModel,
      },
    });
  } catch (error: any) {
    console.error('Storyboard generation error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate storyboard' },
      { status: 500 }
    );
  }
}

/**
 * Robust contextual fact synthesizer for offline/fallback scenarios
 */
function generateHeuristicScenes(
  topic: string,
  targetDuration: StudioDuration,
  targetSceneCount: number,
  scriptMode: string,
  customScript: string
): StudioScene[] {
  const cleanTopic = topic.trim();
  const durPerScene = Number((targetDuration / targetSceneCount).toFixed(1));
  const combinedText = `${cleanTopic} ${customScript}`.toLowerCase();

  const isTechTopic = /\b(code|coding|terminal|developer|programming|software|api|algorithm|python|javascript|typescript|rust|c\+\+|react|nextjs|backend|frontend|database|sql|git|linux|kernel|bug|debug|prompt|function|class|method|npm|css|html|engine|cli|docker|cloud|aws|devops|security|crypto|k8s|kubernetes|microservice)\b/i.test(combinedText);

  const isInvestigativeTopic = /\b(dossier|investigation|classified|declassified|secret|cia|fbi|kgb|nsa|scandal|conspiracy|evidence|forensic|archive|leak|leaks|treaty|war|watergate|operation|document|paper|records|intelligence|surveillance|spies|espionage|history|historical|court|trial|scam|treaties|battle|navy|military)\b/i.test(combinedText);

  // If user provided custom script
  if (scriptMode === 'own_script' && customScript.trim().length > 15) {
    const rawSentences = customScript
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    if (rawSentences.length >= 2) {
      let visualTypes: VisualArchetype[];
      if (isTechTopic) {
        visualTypes = [
          'kinetic_text',
          'code_terminal',
          'dynamic_chart',
          'split_comparison',
          'process_flow',
          'step_sequence',
          'vector_schematic',
          'investigative_dossier',
          'crosshair_target',
          'timeline',
        ];
      } else if (isInvestigativeTopic) {
        visualTypes = [
          'kinetic_text',
          'investigative_dossier',
          'timeline',
          'split_comparison',
          'crosshair_target',
          'dynamic_chart',
          'code_terminal',
          'process_flow',
          'step_sequence',
          'vector_schematic',
        ];
      } else {
        visualTypes = [
          'kinetic_text',
          'investigative_dossier',
          'code_terminal',
          'dynamic_chart',
          'split_comparison',
          'timeline',
          'process_flow',
          'step_sequence',
          'vector_schematic',
          'crosshair_target',
        ];
      }

      return rawSentences.slice(0, targetSceneCount).map((sentence, idx) => {
        const vType = visualTypes[idx % visualTypes.length];
        const words = sentence.split(/\s+/);
        const sfx: SfxCue = idx === 0 ? 'bass_drop' : (vType === 'code_terminal' ? 'typewriter' : (vType === 'investigative_dossier' ? 'whoosh' : 'none'));

        return {
          id: `custom_scene_${idx + 1}`,
          index: idx + 1,
          startTime: 0,
          endTime: durPerScene,
          duration: durPerScene,
          narration: sentence,
          visualDirection: `Dynamic ${vType.replace('_', ' ')} illustrating: "${sentence.slice(0, 32)}..."`,
          visualType: vType,
          sfxCue: sfx,
          highlightWords: words.slice(0, 3),
          graphicData: {
            badge: vType === 'code_terminal' ? 'script_runtime.ts' : (vType === 'investigative_dossier' ? 'ARCHIVE RECORD' : `PHASE 0${idx + 1}`),
            headline: words.slice(0, 4).join(' ').toUpperCase(),
            subtext: sentence,
            statNumber: `${idx + 1}`,
            statLabel: 'KEY STAGE',
            keyTags: words.slice(0, 3),
          },
        };
      });
    }
  }

  // Topic-based intelligent narrative generator
  const words = cleanTopic.split(/\s+/).filter((w) => w.length > 2);
  const primarySubject = words.slice(0, 3).join(' ') || cleanTopic;
  const secondarySubject = words.slice(3, 6).join(' ') || primarySubject;

  let narrativeBeats: Array<{
    vType: VisualArchetype;
    narrate: string;
    headline: string;
    badge: string;
    subtext: string;
    statNum?: string;
    statLbl?: string;
    left?: { title: string; desc: string };
    right?: { title: string; desc: string };
    steps?: Array<{ num: string; title: string; desc?: string }>;
    milestones?: Array<{ date: string; title: string }>;
    tags?: string[];
    sfxCue?: SfxCue;
  }>;

  if (isTechTopic) {
    narrativeBeats = [
      {
        vType: 'kinetic_text',
        narrate: `${cleanTopic}: The modern architecture and core technical patterns every engineer must understand.`,
        headline: primarySubject.toUpperCase(),
        badge: 'ENGINEERING DIRECTIVE',
        subtext: `Deconstructing ${cleanTopic}`,
        statNum: '01',
        statLbl: 'CORE PARADIGM',
        sfxCue: 'bass_drop',
      },
      {
        vType: 'code_terminal',
        narrate: `At the runtime implementation layer, deterministic code patterns guarantee zero-latency execution.`,
        headline: `${primarySubject.toLowerCase().replace(/\s+/g, '_')}_core.ts`,
        badge: 'TYPE-SAFE RUNTIME',
        subtext: `Compiled pipeline and execution logic for ${cleanTopic}`,
        statNum: '60 FPS',
        statLbl: 'RENDER VELOCITY',
        sfxCue: 'typewriter',
      },
      {
        vType: 'dynamic_chart',
        narrate: `The quantitative throughput and benchmark improvements produce measurable performance advantages.`,
        headline: 'BENCHMARK GAINS',
        badge: 'PERFORMANCE AUDIT',
        subtext: 'Comparative throughput and latency metrics',
        statNum: '4.2x',
        statLbl: 'SYSTEM SPEEDUP',
        sfxCue: 'pop',
      },
      {
        vType: 'split_comparison',
        narrate: `When contrasting legacy architectures with this modern approach, the structural superiority is unmistakable.`,
        headline: 'ARCHITECTURAL SHIFT',
        badge: 'LEGACY VS MODERN',
        subtext: 'Comparative analysis of execution models',
        left: { title: 'Legacy Implementation', desc: 'Monolithic friction, cascading re-renders' },
        right: { title: `${primarySubject} Pattern`, desc: 'Isolated state, zero-overhead pipeline' },
        sfxCue: 'whoosh',
      },
      {
        vType: 'process_flow',
        narrate: `Each operational cycle executes through deterministic pipeline stages that prevent bottlenecks.`,
        headline: 'DATA LIFECYCLE',
        badge: 'PIPELINE FLOW',
        subtext: 'End-to-end execution lifecycle',
        steps: [
          { num: '01', title: 'Input Ingestion', desc: `Parse and validate ${primarySubject}` },
          { num: '02', title: 'JIT Compilation', desc: 'Transform and optimize instructions' },
          { num: '03', title: 'Output Emission', desc: 'Stream verified result with zero latency' },
        ],
        sfxCue: 'none',
      },
      {
        vType: 'investigative_dossier',
        narrate: `Production telemetry logs and architectural audit records confirm absolute stability under scale.`,
        headline: 'PRODUCTION TELEMETRY',
        badge: 'AUDIT LOG // VERIFIED',
        subtext: `Diagnostic audit and telemetry corroboration for ${secondarySubject}`,
        tags: ['VERIFIED', 'ZERO FAULTS', 'PRODUCTION'],
        sfxCue: 'whoosh',
      },
      {
        vType: 'step_sequence',
        narrate: `Production implementation requires mastering three foundational engineering rules.`,
        headline: 'CORE TAKEAWAYS',
        badge: 'BEST PRACTICES',
        subtext: 'Three non-negotiable rules for implementation',
        steps: [
          { num: '01', title: 'Pure Determinism', desc: 'Eliminate uncontrolled side effects' },
          { num: '02', title: 'Decoupled Modules', desc: 'Enforce clean boundary interfaces' },
          { num: '03', title: 'Continuous Verification', desc: 'Automate contract tests on every commit' },
        ],
        sfxCue: 'none',
      },
      {
        vType: 'vector_schematic',
        narrate: `The underlying topology routes state seamlessly through dedicated internal communication buses.`,
        headline: 'SYSTEM TOPOLOGY',
        badge: 'TOPOLOGY MAP',
        subtext: 'Internal structural topology and data channels',
        tags: [primarySubject, secondarySubject, 'Runtime Bus'],
        sfxCue: 'none',
      },
      {
        vType: 'crosshair_target',
        narrate: `Focusing optimization on this pivotal bottleneck yields the highest return on engineering effort.`,
        headline: 'OPTIMIZATION NODE',
        badge: 'CRITICAL FOCUS',
        subtext: `Primary execution node for ${secondarySubject}`,
        tags: ['Fast Path', 'Memory Pool', 'Async IO'],
        sfxCue: 'pop',
      },
      {
        vType: 'timeline',
        narrate: `From initial proposal to widespread production standard, this pattern continues its rapid ascent.`,
        headline: 'ADOPTION TIMELINE',
        badge: 'VERSION ROADMAP',
        subtext: 'Milestones across industry standards',
        milestones: [
          { date: 'Initial RFC', title: `Prototype ${primarySubject}` },
          { date: 'Production Spec', title: `Standardize ${secondarySubject}` },
          { date: 'Global Release', title: 'Default Standard' },
        ],
        sfxCue: 'none',
      },
      {
        vType: 'kinetic_text',
        narrate: `Mastering ${cleanTopic} unlocks the exact blueprint for modern, resilient, high-performance systems.`,
        headline: 'THE BOTTOM LINE',
        badge: 'FINAL VERDICT',
        subtext: 'Deterministic speed, elegance, and scale',
        statNum: '100%',
        statLbl: 'CONCEPT MASTERY',
        sfxCue: 'none',
      },
    ];
  } else if (isInvestigativeTopic) {
    narrativeBeats = [
      {
        vType: 'kinetic_text',
        narrate: `${cleanTopic}: The suppressed details and critical turning points that history almost forgot.`,
        headline: primarySubject.toUpperCase(),
        badge: 'HISTORICAL DOSSIER',
        subtext: `The untold story of ${cleanTopic}`,
        statNum: '01',
        statLbl: 'HISTORICAL IMPACT',
        sfxCue: 'bass_drop',
      },
      {
        vType: 'investigative_dossier',
        narrate: `Declassified government archives and confidential records expose the concealed truth behind these events.`,
        headline: 'DECLASSIFIED FILE',
        badge: 'RECORD // TOP SECRET',
        subtext: `Confidential archive detailing operations during ${cleanTopic}`,
        tags: ['DECLASSIFIED', 'CONFIDENTIAL', 'ARCHIVE'],
        sfxCue: 'whoosh',
      },
      {
        vType: 'timeline',
        narrate: `Tracing the sequential escalation reveals how decisive moments transformed this crisis into history.`,
        headline: 'CRISIS TIMELINE',
        badge: 'CHRONOLOGICAL LOG',
        subtext: 'Key turning points in the conflict',
        milestones: [
          { date: 'Stage 01', title: `Inception of ${primarySubject}` },
          { date: 'Escalation', title: `The crisis of ${secondarySubject}` },
          { date: 'Resolution', title: 'Final Surrender & Treaty' },
        ],
        sfxCue: 'pop',
      },
      {
        vType: 'split_comparison',
        narrate: `Contrasting the public diplomatic statements against private military dispatches exposes the real strategy.`,
        headline: 'DUAL STRATEGY',
        badge: 'PUBLIC VS CLASSIFIED',
        subtext: 'Official diplomatic narrative versus classified cables',
        left: { title: 'Official Narrative', desc: 'Public denials, diplomatic appeals' },
        right: { title: 'Classified Action', desc: 'Preemptive strikes, naval blockades' },
        sfxCue: 'none',
      },
      {
        vType: 'crosshair_target',
        narrate: `At the epicenter of this struggle stood a single pivotal commander whose decisions shifted the balance.`,
        headline: 'STRATEGIC TARGET',
        badge: 'COMMAND SPOTLIGHT',
        subtext: `Key decision node in ${secondarySubject}`,
        statNum: '100%',
        statLbl: 'DECISIVE COMMAND',
        tags: words.slice(0, 3),
        sfxCue: 'pop',
      },
      {
        vType: 'dynamic_chart',
        narrate: `The magnitude of forces mobilized and the resulting casualties altered the regional balance of power.`,
        headline: 'SCALE OF FORCES',
        badge: 'HISTORICAL AUDIT',
        subtext: 'Troop deployments and casualties recorded',
        statNum: '93,000+',
        statLbl: 'FORCES SURRENDERED',
        sfxCue: 'none',
      },
      {
        vType: 'code_terminal',
        narrate: `Intercepted intelligence transmissions and diplomatic telegraph transcripts confirmed the operational timeline.`,
        headline: 'TELEGRAPH_LOGS.TXT',
        badge: 'SIGNALS INTELLIGENCE',
        subtext: 'Decrypted cipher cables and orders of battle',
        statNum: '100%',
        statLbl: 'CIPHER DECRYPTED',
        sfxCue: 'typewriter',
      },
      {
        vType: 'step_sequence',
        narrate: `The historical consequences of these events established three enduring geopolitical realities.`,
        headline: 'HISTORICAL LEGACY',
        badge: 'ENDURING LESSONS',
        subtext: 'Three pivotal consequences that reshaped the world',
        steps: [
          { num: '01', title: 'Border Realignment', desc: 'Sovereign boundaries redrawn' },
          { num: '02', title: 'Diplomatic Precedent', desc: 'New treaties enforced internationally' },
          { num: '03', title: 'Strategic Legacy', desc: 'Enduring lessons in doctrine and command' },
        ],
        sfxCue: 'none',
      },
      {
        vType: 'process_flow',
        narrate: `From the initial diplomatic breakdown to full mobilization, each phase followed an irreversible logic.`,
        headline: 'ESCALATION CYCLE',
        badge: 'STRATEGIC CHAIN',
        subtext: 'Chronology of the operational escalation',
        steps: [
          { num: '01', title: 'Covert Buildup', desc: `Logistical staging for ${primarySubject}` },
          { num: '02', title: 'Lightning Strike', desc: 'Coordinated offensive across frontline' },
          { num: '03', title: 'Treaty Signing', desc: 'Formal instrument of surrender ratified' },
        ],
        sfxCue: 'none',
      },
      {
        vType: 'vector_schematic',
        narrate: `The theater of operations encompassed naval blockades, frontline fortresses, and tactical air corridors.`,
        headline: 'THEATER SCHEMATIC',
        badge: 'BATTLEFIELD MAP',
        subtext: 'Strategic disposition of military assets',
        tags: [primarySubject, secondarySubject, 'Command Center'],
        sfxCue: 'none',
      },
      {
        vType: 'kinetic_text',
        narrate: `Decades later, the true story of ${cleanTopic} remains one of the most remarkable chapters ever written.`,
        headline: 'THE VERDICT',
        badge: 'HISTORICAL TRUTH',
        subtext: 'Documented reality and enduring historical memory',
        statNum: '100%',
        statLbl: 'HISTORICAL TRUTH',
        sfxCue: 'none',
      },
    ];
  } else {
    // General / Science / Business Topic: Curated for maximum visual diversity with code_terminal & investigative_dossier
    narrativeBeats = [
      {
        vType: 'kinetic_text',
        narrate: `${cleanTopic}: The foundational mechanism and hidden truth you need to understand.`,
        headline: primarySubject.toUpperCase(),
        badge: 'CONCEPT OVERVIEW',
        subtext: `Deconstructing ${cleanTopic}`,
        statNum: '01',
        statLbl: 'CORE PRINCIPLE',
        sfxCue: 'bass_drop',
      },
      {
        vType: 'investigative_dossier',
        narrate: `Documented research and published records provide compelling evidence of how this system works.`,
        headline: 'RESEARCH ARCHIVE',
        badge: 'EVIDENCE // RECORD #01',
        subtext: `Documentary evidence corroborating ${cleanTopic}`,
        tags: ['VERIFIED', 'PEER REVIEWED', 'ARCHIVE'],
        sfxCue: 'whoosh',
      },
      {
        vType: 'code_terminal',
        narrate: `Beneath the surface, precise operational rules and deterministic logic govern every outcome.`,
        headline: `${primarySubject.toLowerCase().replace(/\s+/g, '_')}_logic.ts`,
        badge: 'SYSTEM PROTOCOL',
        subtext: `Deterministic execution rules for ${secondarySubject}`,
        statNum: '100%',
        statLbl: 'EXECUTION FIDELITY',
        sfxCue: 'typewriter',
      },
      {
        vType: 'dynamic_chart',
        narrate: `The quantitative impact and efficiency gains produce measurable performance differences across benchmarks.`,
        headline: 'MEASURED IMPACT',
        badge: 'METRIC ANALYSIS',
        subtext: 'Comparative throughput and efficiency metrics',
        statNum: '3.4x',
        statLbl: 'EFFICIENCY GAIN',
        sfxCue: 'pop',
      },
      {
        vType: 'split_comparison',
        narrate: `When contrasting conventional approaches against this modern method, the advantage becomes obvious.`,
        headline: 'SYSTEM CONTRAST',
        badge: 'DUAL DYNAMICS',
        subtext: 'Legacy methods versus modern design',
        left: { title: 'Conventional Approach', desc: 'Higher friction, isolated state' },
        right: { title: `${primarySubject} Method`, desc: 'Optimized pipeline, deterministic execution' },
        sfxCue: 'none',
      },
      {
        vType: 'timeline',
        narrate: `To grasp how this works in practice, we trace the sequential progression from inception to full execution.`,
        headline: 'EXECUTION TIMELINE',
        badge: 'SEQUENTIAL PHASES',
        subtext: 'Three key chronological milestones',
        milestones: [
          { date: 'Phase 01', title: `Initialize ${primarySubject}` },
          { date: 'Phase 02', title: `Process ${secondarySubject}` },
          { date: 'Phase 03', title: 'Target Resolution' },
        ],
        sfxCue: 'none',
      },
      {
        vType: 'process_flow',
        narrate: `Each operational cycle executes through three deterministic phases that eliminate bottlenecks.`,
        headline: 'OPERATIONAL PIPELINE',
        badge: 'PROCESS PIPELINE',
        subtext: 'End-to-end execution flow',
        steps: [
          { num: '01', title: 'Ingestion & Validation', desc: `Parse input requirements for ${primarySubject}` },
          { num: '02', title: 'Transformation Engine', desc: 'Apply core logic and constraints' },
          { num: '03', title: 'Finalized Execution', desc: 'Deliver verified, production-grade output' },
        ],
        sfxCue: 'none',
      },
      {
        vType: 'step_sequence',
        narrate: `Mastering this concept comes down to three non-negotiable structural takeaways.`,
        headline: 'CORE TAKEAWAYS',
        badge: 'STRUCTURAL RULES',
        subtext: 'Three essential principles for implementation',
        steps: [
          { num: '01', title: 'Establish Deterministic State', desc: 'Eliminate hidden side-effects' },
          { num: '02', title: 'Decouple Critical Interfaces', desc: 'Enforce clean separation of concerns' },
          { num: '03', title: 'Verify End-to-End', desc: 'Continuous feedback loops guarantee reliability' },
        ],
        sfxCue: 'none',
      },
      {
        vType: 'crosshair_target',
        narrate: `By spotlighting this pivotal component, practitioners avoid common systemic pitfalls.`,
        headline: 'CRITICAL FOCUS',
        badge: 'SYSTEM SPOTLIGHT',
        subtext: `Primary operational node of ${primarySubject}`,
        statNum: '100%',
        statLbl: 'SYSTEM COHESION',
        tags: words.slice(0, 3),
        sfxCue: 'pop',
      },
      {
        vType: 'vector_schematic',
        narrate: `The structural architecture routes information seamlessly through interconnected layers and modular nodes.`,
        headline: 'ARCHITECTURE BLUEPRINT',
        badge: 'SYSTEM SCHEMATIC',
        subtext: 'Internal structural topology and data channels',
        tags: [primarySubject, secondarySubject, 'Control Layer'],
        sfxCue: 'none',
      },
      {
        vType: 'kinetic_text',
        narrate: `In summary, understanding ${cleanTopic} gives you the exact blueprint to build higher-retention, high-impact systems.`,
        headline: 'THE BOTTOM LINE',
        badge: 'FINAL VERDICT',
        subtext: 'Deterministic clarity and enduring principles',
        statNum: '100%',
        statLbl: 'CONCEPT CLARITY',
        sfxCue: 'none',
      },
    ];
  }

  return narrativeBeats.slice(0, targetSceneCount).map((b, i) => {
    return {
      id: `fallback_scene_${i + 1}`,
      index: i + 1,
      startTime: 0,
      endTime: durPerScene,
      duration: durPerScene,
      narration: b.narrate,
      visualDirection: `Dynamic ${b.vType.replace('_', ' ')}: Visualizing ${b.headline} with ${b.badge}.`,
      visualType: b.vType,
      sfxCue: b.sfxCue || (i === 0 ? 'bass_drop' : (b.vType === 'code_terminal' ? 'typewriter' : (b.vType === 'investigative_dossier' ? 'whoosh' : 'none'))),
      highlightWords: b.headline.split(' '),
      graphicData: {
        badge: b.badge,
        headline: b.headline,
        subtext: b.subtext,
        statNumber: b.statNum,
        statLabel: b.statLbl,
        leftItem: b.left,
        rightItem: b.right,
        steps: b.steps,
        milestones: b.milestones,
        keyTags: b.tags,
      },
    };
  });
}
