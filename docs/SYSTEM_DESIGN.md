# System Architecture & Technical Design Document (SDD)

# Project: AutoReel Studio
**Version:** 1.0.0  
**Status:** Approved Baseline for Implementation  
**Target:** 9:16 Vertical Short-Form Video Generation Engine & Web Studio  

---

## 1. System Architecture Overview

AutoReel Studio is organized into five decoupled tiers:
1. **Client Tier (Web Studio):** Next.js App Router (React, Tailwind CSS, Shadcn UI) hosting the AI Director Chat, Storyboard Inspector, and the in-browser real-time Remotion Player.
2. **API & Orchestration Tier:** Next.js Server Actions and Route Handlers triggering durable, multi-step background workflows via **Inngest**.
3. **Multi-Engine Intelligence & Audio Layer:** 
   - LLM: Google Gemini 1.5 / 3.8 Flash (structured JSON output mode).
   - Audio: Abstracted `AudioProvider` supporting **Microsoft Edge Neural TTS** (Free Dev default) and **ElevenLabs** (Studio drop-in).
   - Generative Concept Art: Pollinations.ai (Flux Schnell / Dev).
4. **Motion Composition & Video Rendering Engine:** Remotion framework running `@remotion/player` for client preview and `@remotion/renderer` with Headless Chrome + FFmpeg for 1080 × 1920 MP4 export.
5. **Persistence & Social Integration Tier:** PostgreSQL / Supabase (or MongoDB) for state dimensions, Cloudflare R2 / S3 for media storage, and Meta Graph API for Instagram Reels publishing.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT BROWSER (Next.js)                                │
│                                                                                        │
│   ┌────────────────────┐   ┌──────────────────────────┐   ┌────────────────────────┐  │
│   │ AI Director Chat   │   │ Storyboard Inspector     │   │ Real-Time Preview      │  │
│   │ (Seed / Hooks)     │   │ (8 Motion Patterns / UI) │   │ (@remotion/player)     │  │
│   └─────────┬──────────┘   └────────────┬─────────────┘   └───────────▲────────────┘  │
└─────────────┼───────────────────────────┼─────────────────────────────┼────────────────┘
              │ HTTP / Server Actions     │ HTTP                        │ Reads Props
              ▼                           ▼                             │ & Media
┌───────────────────────────────────────────────────────────────────────┴────────────────┐
│                              API & ORCHESTRATION LAYER                                 │
│                                                                                        │
│   Next.js API Routes / Inngest Durable Workflow Engine                                 │
│   • Version Invalidation Resolver                                                      │
│   • Job Queue & Deduplication Coordinator                                              │
│   • Atomic State Transitions                                                           │
└──────┬──────────────────────┬──────────────────────┬────────────────────┬──────────────┘
       │                      │                      │                    │
       ▼                      ▼                      ▼                    ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  LLM SERVICE │      │ AUDIO ENGINE │      │ VISUAL ASSET │      │ VIDEO RENDER │
│              │      │ (Abstracted) │      │   SERVICE    │      │    ENGINE    │
│ Gemini Flash │      │ 1. Edge-TTS  │      │ 1. Lucide SVG│      │ Remotion     │
│ JSON Output  │      │    (Default) │      │ 2. Flux AI   │      │ Renderer     │
│ Hook & Plan  │      │ 2. ElevenLabs│      │ 3. Canvas UI │      │ FFmpeg MP4   │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │                     │
       └─────────────────────┼─────────────────────┴─────────────────────┘
                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              STORAGE & PERSISTENCE                                     │
│   • Database (PostgreSQL / Supabase): Users, Projects, Storyboards, Jobs, Intent       │
│   • Object Storage (Cloudflare R2 / S3): Audio MP3s, Alignment JSON, MP4 Exports       │
│   • Meta Graph API: Instagram Reels Container Ingestion & Scheduling                   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Data Contracts & JSON Schemas

The contract between the LLM, the Database, and the Remotion Video Engine is governed by strict TypeScript interfaces and validated via **Zod**.

### 2.1. Storyboard Schema (The Master Visual Blueprint)
```typescript
import { z } from 'zod';

export const MotionPatternEnum = z.enum([
  'title_hook',
  'labeled_diagram',
  'process_flow',
  'comparison',
  'timeline',
  'dynamic_chart',
  'step_sequence',
  'kinetic_summary'
]);

export const SfxCueEnum = z.enum(['whoosh', 'pop', 'click', 'none']);

export const VisualChoiceSchema = z.object({
  geometryType: z.enum(['isometric_3d', 'split_screen', 'radial_orbit', 'linear_flow', 'minimal_editorial']),
  focalElements: z.array(z.string()),
  accentColor: z.string().default('#38BDF8'),
  cameraMotion: z.enum(['dolly_in', 'pan_down', 'subtle_float', 'static_anchor']).default('dolly_in'),
});

export const SceneLabelsSchema = z.object({
  badgeText: z.string().optional(),
  headline: z.string(),
  subheadline: z.string().optional(),
  calloutPoints: z.array(z.string()).optional(),
});

export const SceneSchema = z.object({
  id: z.string().uuid(),
  sceneIndex: z.number().int().min(0),
  narration: z.string().min(1).max(500),
  targetDurationSec: z.number().min(1).max(15),
  motionPattern: MotionPatternEnum,
  labels: SceneLabelsSchema,
  visualChoice: VisualChoiceSchema,
  patternParams: z.record(z.any()).optional(), // Extended pattern-specific params
  pronunciationNotes: z.record(z.string()).optional(), // e.g., { "SQL": "sequel" }
  sfxCue: SfxCueEnum.default('whoosh'),
});

export const StoryboardSchema = z.object({
  versionId: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().min(1).max(100),
  learningObjective: z.string().max(250),
  durationTarget: z.enum(['30', '60', '90']),
  pacingMode: z.enum(['fast_punchy', 'balanced', 'deep_dive']),
  captionStyle: z.enum(['vox-editorial', 'opus-karaoke']).default('vox-editorial'),
  scenes: z.array(SceneSchema).min(3).max(20),
});

export type Storyboard = z.infer<typeof StoryboardSchema>;
export type StoryboardScene = z.infer<typeof SceneSchema>;
```

### 2.2. Pattern-Specific Parameter Contracts
Each of the 8 motion patterns expects a strongly typed `patternParams` payload:

```typescript
// 1. Title / Hook
export interface TitleHookParams {
  headline: string;
  subheadline?: string;
  badgeText?: string;
}

// 2. Labeled Diagram
export interface LabeledDiagramParams {
  centralNode: { label: string; icon?: string };
  satelliteNodes: Array<{
    id: string;
    label: string;
    icon?: string;
    connectionType: 'arrow_in' | 'arrow_out' | 'bidirectional';
  }>;
}

// 3. Process Flow
export interface ProcessFlowParams {
  steps: Array<{
    stepNumber: number;
    title: string;
    description?: string;
    icon?: string;
  }>;
  activeStepIndex?: number;
}

// 4. Comparison (Split-Screen)
export interface ComparisonParams {
  leftSide: { title: string; badge?: string; points: string[]; tone: 'negative' | 'neutral' };
  rightSide: { title: string; badge?: string; points: string[]; tone: 'positive' | 'neutral' };
}

// 5. Timeline
export interface TimelineParams {
  events: Array<{
    periodOrYear: string;
    title: string;
    description?: string;
  }>;
}

// 6. Dynamic Chart
export interface DynamicChartParams {
  chartType: 'bar' | 'metric_counter' | 'trendline';
  metricValue?: number;
  metricPrefix?: string; // e.g. "$"
  metricSuffix?: string; // e.g. "%" or "M"
  dataPoints?: Array<{ label: string; value: number }>;
}

// 7. Step Sequence
export interface StepSequenceParams {
  cards: Array<{
    number: string;
    headline: string;
    subtext?: string;
  }>;
}

// 8. Kinetic Summary
export interface KineticSummaryParams {
  takeawayStatement: string;
  ctaText?: string;
  accentWord: string;
}
```

---

## 3. Audio & Speech Alignment Pipeline

### 3.1. Unified Audio Provider Interface
To guarantee **$0.00 development costs** while enabling **enterprise drop-in capability**, the audio layer uses an abstract factory:

```typescript
export interface WordBoundary {
  word: string;
  startMs: number;
  endMs: number;
}

export interface AudioSynthesisResult {
  audioBuffer: Buffer;
  audioUrl: string;
  durationMs: number;
  wordTimestamps: WordBoundary[];
}

export interface AudioProvider {
  synthesize(text: string, voiceId: string, pronunciationNotes?: Record<string, string>): Promise<AudioSynthesisResult>;
  getCuratedVoices(): Array<{ id: string; name: string; gender: 'male' | 'female'; accent: string; previewUrl: string }>;
}
```

### 3.2. Free-Tier Implementation: Microsoft Edge Neural TTS
- **Package:** `edge-tts` (via lightweight Node child-process or Python runner) or `@remotion/edge-speech`.
- **Zero API Key:** Uses Microsoft Azure's public cognitive endpoints with WebSocket streaming.
- **Word Boundaries:** Edge-TTS emits `WordBoundary` metadata packets via WebSocket.
- **Timestamp Normalization:**
  - Converts ticks/offsets ($1\text{ tick} = 100\text{ ns}$) into clean millisecond values:
    $$\text{startMs} = \text{offset} / 10{,}000$$
- **Default Curated Voices:**
  - `en-US-ChristopherNeural` (Global Male - Authoritative & Clear)
  - `en-US-JennyNeural` (Global Female - Natural & Energetic)
  - `en-IN-PrabhatNeural` (Indian English Male - Professional)
  - `en-IN-NeerjaNeural` (Indian English Female - Articulate & Warm)

### 3.3. Production Studio Drop-in: ElevenLabs
- Swapped automatically when `process.env.AUDIO_PROVIDER === 'elevenlabs'` and `ELEVENLABS_API_KEY` is present.
- Endpoint: `POST /v1/text-to-speech/{voice_id}/with-timestamps`
- Model: `eleven_multilingual_v2` or `eleven_turbo_v2_5`.

---

## 4. Audio-Visual Timeline Synchronization Math

A 9:16 vertical video renders at **30 frames per second (fps)** ($1 \text{ frame} \approx 33.33 \text{ ms}$).

### 4.1. Frame Conversion Formula
For any millisecond timestamp $T_{\text{ms}}$:
$$\text{frameIndex} = \left\lfloor \frac{T_{\text{ms}}}{1000} \times 30 \right\rfloor$$

### 4.2. Scene Duration Calculation
Every scene $i$ duration in frames ($\text{SceneFrames}_i$) is derived from its measured audio duration:
$$\text{SceneFrames}_i = \left\lceil \frac{\text{AudioDurationMs}_i}{1000} \times 30 \right\rceil + \text{PaddingFrames}$$
*Where $\text{PaddingFrames} = 6$ frames (0.2s hold at the end of each scene for smooth transitions).*

### 4.3. Dynamic Audio Ducking Engine
Background music dynamically ducks whenever voiceover is active:
```typescript
import { interpolate } from 'remotion';

export function calculateMusicVolume(
  currentFrame: number, 
  activeSpeechIntervals: Array<{ startFrame: number; endFrame: number }>
): number {
  const BASE_VOLUME = 0.25;
  const DUCKED_VOLUME = 0.07;
  const FADE_FRAMES = 8; // ~250ms smooth crossfade

  const isSpeaking = activeSpeechIntervals.some(
    interval => currentFrame >= interval.startFrame - FADE_FRAMES && currentFrame <= interval.endFrame + FADE_FRAMES
  );

  return isSpeaking ? DUCKED_VOLUME : BASE_VOLUME;
}
```

---

## 5. Remotion Video Composition Architecture

The Remotion composition tree is structured as a series of nested sequences:

```
<Root>
  └── <Composition id="MainReel" width={1080} height={1920} fps={30}>
        ├── <BackgroundLayer /> (Dynamic canvas gradient / subtle ambient particles)
        ├── <Series>
        │     ├── <Series.Sequence durationInFrames={scene1Frames}>
        │     │     ├── <MotionPatternComponent pattern={scene1.pattern} params={scene1.params} />
        │     │     ├── <Audio src={scene1.audioUrl} />
        │     │     └── <SfxAudio cue={scene1.sfxCue} />
        │     │
        │     ├── <Series.Sequence durationInFrames={scene2Frames}>
        │     │     ├── <MotionPatternComponent pattern={scene2.pattern} params={scene2.params} />
        │     │     ├── <Audio src={scene2.audioUrl} />
        │     │     └── <SfxAudio cue={scene2.sfxCue} />
        │     │
        │     └── ... [Scene N]
        │
        ├── <GlobalCaptionLayer wordTimestamps={allWordTimestamps} />
        ├── <BackgroundMusicLayer audioUrl={musicUrl} activeIntervals={speechIntervals} />
        └── <InstagramSafeZoneOverlay isVisible={showSafeZone} />
```

### 5.1. Instagram Safe-Zone Guardrails (9:16 Canvas)
Total Canvas: $1080 \times 1920 \text{ px}$
- **Top Safe Margin:** $160 \text{ px}$ ($8.3\%$) $\rightarrow$ Avoids Instagram profile header / search bar.
- **Bottom Safe Margin:** $480 \text{ px}$ ($25.0\%$) $\rightarrow$ Avoids account handle, caption text, audio disc icon.
- **Right Safe Margin:** $160 \text{ px}$ ($14.8\%$) $\rightarrow$ Avoids Like, Comment, Share, Remix buttons.
- **Safe Center Area:** $W: 880 \text{ px}, H: 1280 \text{ px}$, centered horizontally from $X = 40 \text{ px}$ to $X = 920 \text{ px}$, and vertically from $Y = 160 \text{ px}$ to $Y = 1440 \text{ px}$.

All 8 Motion Pattern layouts and dynamic captions are strictly clamped inside this **Safe Center Area**.

---

## 6. Revision Invalidation & Caching Engine

When a creator requests a revision (either via chat or the inspector), the system computes an **Invalidation Diff** to prevent redundant API calls:

```
                        [User Revision Request]
                                   │
                                   ▼
                   [Classify Revision Scope]
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
 [Visual/Layout Only]     [Caption Text Only]       [Spoken Audio Change]
        │                          │                          │
 • Reuse Audio MP3         • Reuse Audio MP3          • Regenerate Scene Audio
 • Reuse Word Timestamps   • Reuse Word Timestamps    • Re-align Timestamps
 • Rebuild Remotion Scene  • Re-render Caption SVG    • Rebuild Scene Timing
 • Cost: $0.00 / ~3s       • Cost: $0.00 / ~1s        • Cost: $0.00 (Edge) / ~6s
```

### Invalidation Hash Strategy
Assets are keyed by a SHA-256 hash of their inputs:
- $\text{AudioHash} = \text{SHA256}(\text{voiceoverText} + \text{voiceId} + \text{pronunciationNotes})$
- If $\text{AudioHash}$ matches an existing asset in storage, audio synthesis is completely skipped!

---

## 7. Durable Workflow Pipeline (Inngest)

Long-running operations (audio synthesis, asset fetching, rendering) must not run inside short-lived HTTP handlers. They are orchestrated as **Inngest Durable Workflows**:

### 7.1. Video Generation Workflow (`video.generate`)
```typescript
export const videoGenerateWorkflow = inngest.createFunction(
  { id: 'video-generate-workflow', retries: 2 },
  { event: 'video/generate.requested' },
  async ({ event, step }) => {
    const { projectId, storyboardId } = event.data;

    // Step 1: Synthesize Audio & Alignments for each scene
    const audioResults = await step.run('synthesize-scene-audios', async () => {
      return await audioOrchestrator.synthesizeAllScenes(storyboardId);
    });

    // Step 2: Fetch Visual Assets (Flux images / SVGs)
    const visualAssets = await step.run('resolve-visual-assets', async () => {
      return await assetOrchestrator.resolveAssets(storyboardId);
    });

    // Step 3: Compute Timeline & Safe Durations
    const timeline = await step.run('build-synchronized-timeline', async () => {
      return await timelineBuilder.compile(storyboardId, audioResults);
    });

    // Step 4: Render Video via Remotion (Local or Sandbox)
    const renderResult = await step.run('render-mp4-video', async () => {
      return await remotionRenderer.renderVideo({
        storyboardId,
        audioResults,
        visualAssets,
        timeline
      });
    });

    // Step 5: Validate Output & Update State
    await step.run('validate-and-finalize', async () => {
      return await videoValidator.verifyAndSave(renderResult);
    });
  }
);
```

### 7.2. Instagram Publishing Workflow (`instagram.publish`)
```typescript
export const instagramPublishWorkflow = inngest.createFunction(
  { id: 'instagram-publish-workflow', retries: 1 },
  { event: 'instagram/publish.requested' },
  async ({ event, step }) => {
    const { publishIntentId } = event.data;

    // 1. Atomic Claim (Prevents race conditions)
    const claim = await step.run('atomic-claim-intent', async () => {
      return await db.claimPublishIntent(publishIntentId);
    });

    // 2. Initialize Meta Media Container
    const container = await step.run('create-meta-container', async () => {
      return await metaClient.createReelsContainer(claim.videoUrl, claim.caption);
    });

    // 3. Poll Container Processing with Backoff
    const isReady = await step.run('poll-meta-status', async () => {
      return await metaClient.waitForProcessing(container.id, { maxAttempts: 15 });
    });

    // 4. Publish Media Container
    const publishResult = await step.run('publish-container', async () => {
      return await metaClient.publishMedia(container.id);
    });

    // 5. Reconcile & Mark Published
    await step.run('finalize-post', async () => {
      return await db.markPublished(publishIntentId, publishResult.mediaId);
    });
  }
);
```

---

## 8. Directory & Folder Structure

```
VideoGenerationSAAS/
├── docs/
│   ├── PRD.md                       # Master Product Requirements Document
│   └── SYSTEM_DESIGN.md             # This System Architecture Document
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (auth)/                  # Sign-in / Auth Routes
│   │   ├── (dashboard)/             # Project Library & Workspace
│   │   │   └── page.tsx
│   │   ├── studio/[projectId]/      # Core 4-Step Studio Application
│   │   │   ├── idea/                # Step 1: Idea & Hook Brainstorming
│   │   │   ├── storyboard/          # Step 2: Storyboard Inspector
│   │   │   ├── preview/             # Step 3: Real-Time Remotion Player & Tweaker
│   │   │   └── publish/             # Step 4: Instagram Publish & Schedule
│   │   └── api/                     # Server Endpoints & Inngest Handlers
│   │       ├── inngest/route.ts
│   │       └── trpc/ / actions/
│   │
│   ├── remotion/                    # Remotion Video Engine Components
│   │   ├── Root.tsx                 # Remotion Entry Point
│   │   ├── compositions/
│   │   │   └── MainReel.tsx         # Primary 9:16 Vertical Composition
│   │   ├── patterns/                # The 8 Reusable Motion Patterns
│   │   │   ├── TitleHook.tsx
│   │   │   ├── LabeledDiagram.tsx
│   │   │   ├── ProcessFlow.tsx
│   │   │   ├── Comparison.tsx
│   │   │   ├── Timeline.tsx
│   │   │   ├── DynamicChart.tsx
│   │   │   ├── StepSequence.tsx
│   │   │   └── KineticSummary.tsx
│   │   ├── components/
│   │   │   ├── Captions.tsx         # Kinetic Word-Highlighted Subtitles
│   │   │   ├── SafeZoneOverlay.tsx  # Instagram UI Guardrail Overlay
│   │   │   ├── AudioDucker.tsx      # Smart Background Music Ducking
│   │   │   └── SfxPlayer.tsx        # Whoosh / Pop / Click audio triggers
│   │   └── index.ts
│   │
│   ├── lib/                         # Core Logic & Multi-Engine Providers
│   │   ├── ai/                      # LLM Orchestration
│   │   │   ├── gemini.ts            # Gemini 1.5/3.8 Flash Client
│   │   │   └── prompts.ts           # Hook & Storyboard JSON Prompts
│   │   ├── audio/                   # Audio Synthesis Engine
│   │   │   ├── types.ts             # AudioProvider Interface
│   │   │   ├── edge-tts.ts          # Free Microsoft Edge Neural TTS Provider
│   │   │   └── elevenlabs.ts        # ElevenLabs Studio Provider
│   │   ├── assets/                  # Asset Resolvers
│   │   │   ├── pollinations.ts      # Flux AI Image Generator
│   │   │   └── icons.ts             # Lucide SVG Resolver
│   │   ├── meta/                    # Instagram Graph API Client
│   │   │   ├── oauth.ts             # Instagram Login OAuth
│   │   │   └── publishing.ts        # Container & Post Scheduler
│   │   ├── db/                      # Database Clients & Schemas
│   │   │   └── schema.ts            # PostgreSQL / Supabase Schema
│   │   └── inngest/                 # Inngest Client & Workflow Definitions
│   │       ├── client.ts
│   │       └── functions/
│   │
│   └── styles/                      # Tailwind Global Styles & Theme Tokens
│
├── public/                          # Static assets (SFX audio, default music, fonts)
│   ├── sfx/
│   │   ├── whoosh.mp3
│   │   ├── pop.mp3
│   │   └── click.mp3
│   └── music/
│       ├── lofi-ambient.mp3
│       └── tech-minimal.mp3
│
├── package.json
├── remotion.config.ts               # Remotion Bundler & Chromium Config
├── tailwind.config.js
└── tsconfig.json
```

---

## 9. Security, Reliability & Failure Modes

1. **Prompt Injection Guardrails:**
   - Raw notes and user topics are placed in isolated data blocks within the prompt template: `=== BEGIN USER NOTES === ... === END USER NOTES ===`. System instructions strictly forbid the LLM from executing commands found within the notes.
2. **Deterministic Video Compilation:**
   - Visual layouts depend purely on pure functions of `(frame, sceneParams, themeTokens)`. Given the same storyboard JSON and audio alignment, video renders are 100% reproducible.
3. **Instagram Duplicate-Post Protection:**
   - If Meta's container upload times out or returns an ambiguous response, the state machine transitions to `Outcome unknown`. No automated retry is dispatched until the status is queried directly via Meta's `GET /{container-id}?fields=status_code` endpoint.
4. **Isolated Render Process:**
   - Remotion renders run in sandboxed headless Chromium with restricted file system permissions.
