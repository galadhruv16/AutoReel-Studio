import { NextResponse } from 'next/server';

export interface StoryboardScene {
  id: number;
  title: string;
  badge: string;
  durationSec: number;
  archetype: 'anatomy' | 'pipeline' | 'telemetry' | 'matrix' | 'hook';
  headline: string;
  subheadline: string;
  calloutPoints: string[];
  narration: string;
}

const PRESET_STORYBOARDS: Record<string, StoryboardScene[]> = {
  genetics: [
    {
      id: 1,
      title: 'The P-Generation Paradox',
      badge: '// P1 GENERATION',
      durationSec: 6.5,
      archetype: 'hook',
      headline: 'Gregor Mendel Crossed Two Pea Plants',
      subheadline: 'Yellow Round vs Green Wrinkled',
      calloutPoints: ['Purebred YYRR', 'Purebred yyrr', '100% Yellow F1'],
      narration: 'Gregor Mendel crossed two purebred pea plants: one yellow and round, the other green and wrinkled.',
    },
    {
      id: 2,
      title: 'Hidden Recessive Alleles',
      badge: '// ALLELE SEGREGATION',
      durationSec: 6.5,
      archetype: 'pipeline',
      headline: 'The Secret Recessive Code',
      subheadline: 'Green Alleles Did Not Disappear',
      calloutPoints: ['Y = Dominant Yellow', 'y = Recessive Green', 'Masked in F1'],
      narration: 'In the first generation, every single pea was yellow. But the green trait had not vanished—it was merely masked.',
    },
    {
      id: 3,
      title: '16-Cell Punnett Matrix',
      badge: '// DIHYBRID COMBINATORICS',
      durationSec: 6.5,
      archetype: 'matrix',
      headline: 'Independent Assortment Matrix',
      subheadline: '16 Microscopic Combinations',
      calloutPoints: ['YR', 'Yr', 'yR', 'yr Gametes'],
      narration: 'When he self-pollinated the F1 generation, chromosomes sorted independently, yielding a sixteen-cell Punnett matrix.',
    },
    {
      id: 4,
      title: 'The 9:3:3:1 Explosion',
      badge: '// PHENOTYPE DISTRIBUTION',
      durationSec: 6.0,
      archetype: 'telemetry',
      headline: 'The Magic 9:3:3:1 Ratio',
      subheadline: 'Four Distinct Categorical Pedestals',
      calloutPoints: ['9/16 Yellow Round', '3/16 Green Round', '3/16 Yellow Wrinkled', '1/16 Green Wrinkled'],
      narration: 'Nine yellow-round, three green-round, three yellow-wrinkled, and one lone green-wrinkled pea.',
    },
    {
      id: 5,
      title: 'Law of Independent Assortment',
      badge: '// DISCOVERY SEAL',
      durationSec: 5.5,
      archetype: 'anatomy',
      headline: 'The Law of Independent Assortment',
      subheadline: 'The Mathematical Foundation of Genetics',
      calloutPoints: ['Gene Independence', 'Deterministic Ratios', 'Mendel 1865'],
      narration: 'This mathematical 9:3:3:1 ratio proved that traits inherit independently—founding modern genetics.',
    },
  ],
  kubernetes: [
    {
      id: 1,
      title: 'The Container Illusion',
      badge: '// HOST PROCESS REALITY',
      durationSec: 5.5,
      archetype: 'hook',
      headline: 'Containers Do Not Actually Exist',
      subheadline: 'No Tiny Virtual Machine Inside Your Server',
      calloutPoints: ['PID #48291', 'Shared CPU Core', 'Zero Hypervisor'],
      narration: 'Containers do not exist. There is no tiny virtual machine inside your server.',
    },
    {
      id: 2,
      title: 'cgroups & Namespaces',
      badge: '// KERNEL PRIMITIVES',
      durationSec: 7.0,
      archetype: 'telemetry',
      headline: 'Two Linux Kernel Levers',
      subheadline: 'Throttling Resources & Masking Visibility',
      calloutPoints: ['cgroups: 512MB RAM', 'namespaces: PID • NET', 'Port 80 Conflict'],
      narration: 'A container is just an ordinary Linux process, restricted by cgroups for resource throttling, and namespaces for isolated vision.',
    },
    {
      id: 3,
      title: 'The Pod Solution',
      badge: '// POD ENCAPSULATION',
      durationSec: 6.5,
      archetype: 'anatomy',
      headline: 'Enter The Kubernetes Pod',
      subheadline: 'Shared Network Namespace Boundary',
      calloutPoints: ['Single IP (10.244.0.12)', 'App Container (Port 8080)', 'Sidecar Proxy (Port 9000)'],
      narration: 'That is why Kubernetes created the Pod. A Pod wraps containers inside the exact same network namespace.',
    },
    {
      id: 4,
      title: 'Zero-Latency Localhost Bridge',
      badge: '// LOCALHOST INTER-PROCESS',
      durationSec: 5.5,
      archetype: 'pipeline',
      headline: 'Lightspeed Localhost Bridge',
      subheadline: 'Co-Located Atomic Processes',
      calloutPoints: ['127.0.0.1 Loopback', '0.02ms Latency', 'Shared Storage Volumes'],
      narration: 'Letting them communicate with zero network latency over localhost, while sharing shared disk storage.',
    },
    {
      id: 5,
      title: 'Atomic Unit of Cloud Compute',
      badge: '// ARCHITECTURAL TRUTH',
      durationSec: 5.0,
      archetype: 'matrix',
      headline: 'The Pod: The Smallest Unit of Compute',
      subheadline: 'Not The Container',
      calloutPoints: ['Co-Scheduled', 'Atomic Scalability', 'Kubernetes Architecture'],
      narration: 'In Kubernetes, the container is just an implementation detail. The Pod is the true atomic unit of cloud computing.',
    },
  ],
  saraighat: [
    {
      id: 1,
      title: 'The River Armada',
      badge: '// BRAHMAPUTRA 1671',
      durationSec: 6.0,
      archetype: 'hook',
      headline: '4,000 War Vessels Sailing Upstream',
      subheadline: 'Ram Singh Imperial Mughal Fleet',
      calloutPoints: ['4,000 Armada', 'Heavy Cannons', 'Overwhelming Numbers'],
      narration: 'In 1671, the mighty Mughal Empire sent an armada of four thousand war vessels sailing up the Brahmaputra River to conquer Assam.',
    },
    {
      id: 2,
      title: 'The 1km Canyon Bottleneck',
      badge: '// GEOGRAPHIC CHOKEPOINT',
      durationSec: 6.5,
      archetype: 'anatomy',
      headline: 'The Saraighat Natural Bottleneck',
      subheadline: 'Narrow 1km Gorge with 8.5-Knot Rapids',
      calloutPoints: ['1km Width', 'High Current', 'Heavy Ships Trapped'],
      narration: 'General Lachit Borphukan knew he could not defeat their superior numbers on open ground. He baited the massive armada into the narrow Saraighat canyon.',
    },
    {
      id: 3,
      title: 'Twin-Flank Ambush',
      badge: '// TACTICAL COUNTER-OFFENSIVE',
      durationSec: 6.5,
      archetype: 'pipeline',
      headline: 'Agile Bachari War Boats Strike',
      subheadline: 'High-Speed River Guerilla Warfare',
      calloutPoints: ['Bachari Boats', 'Twin Flank Fire', 'Armada Divided'],
      narration: 'As the bulky Mughal galleys struggled against the fierce currents, agile Assamese river craft struck from both riverbanks simultaneously.',
    },
    {
      id: 4,
      title: 'Armada Shattered',
      badge: '// COMPLETE RETREAT',
      durationSec: 6.5,
      archetype: 'telemetry',
      headline: 'Mughal Armada Utterly Shattered',
      subheadline: 'Decisive Victory on The Brahmaputra',
      calloutPoints: ['Fleet Destroyed', 'General Ram Singh Retreats', 'Assam Victorious'],
      narration: 'Trapped in the crossfire and unable to maneuver, the imperial fleet broke in catastrophic disorder, forcing an unconditional retreat.',
    },
    {
      id: 5,
      title: 'Assam Stood Free',
      badge: '// HISTORICAL SOVEREIGNTY',
      durationSec: 6.0,
      archetype: 'matrix',
      headline: 'Assam Maintained Its Sovereignty',
      subheadline: 'The Genius of Lachit Borphukan',
      calloutPoints: ['600-Year Ahom Dynasty', 'Defensive Mastery', 'Saraighat Legacy'],
      narration: 'Through brilliant geographical warfare and courage, Saraighat became the greatest river battle in Indian history—and Assam remained free.',
    },
  ],
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { presetId, topic, durationSec = 30 } = body;

    // 1. If preset requested, return hand-crafted studio preset
    if (presetId && PRESET_STORYBOARDS[presetId]) {
      return NextResponse.json({
        success: true,
        data: {
          scenes: PRESET_STORYBOARDS[presetId],
          topic: presetId,
          totalDurationSec: PRESET_STORYBOARDS[presetId].reduce((acc, s) => acc + s.durationSec, 0),
        },
      });
    }

    // 2. Custom Topic Generation with Gemini Flash (or structured fallback)
    const geminiKey = process.env.GEMINI_API_KEY;
    const promptText = topic || 'Explaining how Redis handles in-memory key-value caching';

    if (geminiKey && !geminiKey.includes('your_')) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are AutoReel Studio's AI Storyboard Director.
Break down the topic into exactly 4 or 5 progressive visual scenes for a ${durationSec}-second high-impact explainer reel.
Return strictly valid JSON without any markdown formatting.

Topic: "${promptText}"

JSON Structure:
{
  "scenes": [
    {
      "id": 1,
      "title": "Short Scene Title",
      "badge": "// TECHNICAL CONTEXT BADGE",
      "durationSec": 6.0,
      "archetype": "hook" | "anatomy" | "pipeline" | "telemetry" | "matrix",
      "headline": "Bold 4-7 Word Kinetic Headline",
      "subheadline": "Explanatory supporting phrase",
      "calloutPoints": ["Callout 1", "Callout 2", "Callout 3"],
      "narration": "Natural, punchy sentence spoken by voiceover (approx 12-16 words)."
    }
  ]
}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const rawData = await geminiRes.json();
          const jsonText = rawData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            if (parsed.scenes && Array.isArray(parsed.scenes)) {
              return NextResponse.json({
                success: true,
                data: {
                  scenes: parsed.scenes,
                  topic: promptText,
                  totalDurationSec: parsed.scenes.reduce((acc: number, s: any) => acc + (s.durationSec || 6), 0),
                },
              });
            }
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, generating intelligent fallback storyboard:', err);
      }
    }

    // 3. High-Quality Fallback Dynamic Storyboard for Custom Topics
    const fallbackScenes: StoryboardScene[] = [
      {
        id: 1,
        title: 'The Core Problem Hook',
        badge: '// PROBLEM DISCOVERY',
        durationSec: 6.0,
        archetype: 'hook',
        headline: `Why ${promptText.slice(0, 32)} Breaks Conventional Logic`,
        subheadline: 'The Unseen Technical Chokepoint',
        calloutPoints: ['High Latency', 'Bottleneck', 'System Stress'],
        narration: `Most people misunderstand ${promptText.slice(0, 28)}. Here is what actually happens beneath the surface.`,
      },
      {
        id: 2,
        title: 'Deconstructed Architecture',
        badge: '// INTERNAL DECONSTRUCTION',
        durationSec: 6.5,
        archetype: 'anatomy',
        headline: 'Deconstructing The Inner Mechanism',
        subheadline: 'Three Layers of Execution',
        calloutPoints: ['Application Layer', 'Abstraction Sandbox', 'Kernel Engine'],
        narration: 'When we peel back the abstraction layer, three discrete architectural stages orchestrate the entire pipeline.',
      },
      {
        id: 3,
        title: 'Sequential Processing Pipeline',
        badge: '// TRANSFORMATION PIPELINE',
        durationSec: 6.0,
        archetype: 'pipeline',
        headline: 'Deterministic Sequential Execution',
        subheadline: 'Lightspeed In-Flight Data Transfer',
        calloutPoints: ['Stage 1: Ingest', 'Stage 2: Parse', 'Stage 3: Commit'],
        narration: 'Data streams continuously across an isolated memory bus, bypassing traditional network overhead entirely.',
      },
      {
        id: 4,
        title: 'Retention & Performance Telemetry',
        badge: '// QUANTITATIVE BENCHMARK',
        durationSec: 6.0,
        archetype: 'telemetry',
        headline: '92% Performance Optimization',
        subheadline: 'Zero-Latency Resolution',
        calloutPoints: ['Sub-Millisecond', 'Deterministic', 'Near-Zero Overhead'],
        narration: 'The result is a ninety percent reduction in operational latency, creating a rock-solid, production-grade foundation.',
      },
      {
        id: 5,
        title: 'Architectural Conclusion',
        badge: '// SYSTEM VERIFICATION',
        durationSec: 5.5,
        archetype: 'matrix',
        headline: 'The True Paradigm Shift',
        subheadline: 'Engineered For Extreme Determinism',
        calloutPoints: ['Production Ready', 'Zero Slop', 'AutoReel Studio'],
        narration: 'That is why leading engineering teams adopt this paradigm—simple in concept, unstoppable in execution.',
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        scenes: fallbackScenes,
        topic: promptText,
        totalDurationSec: 30,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate storyboard' },
      { status: 500 }
    );
  }
}
