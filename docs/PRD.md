# Product Requirements Document (PRD)

# Project: AutoReel Studio (AI-Powered Short-Form Motion Video SaaS)
**Version:** 2.0 (Integrated Master Baseline)  
**Status:** Final Planning Baseline — Ready for System Architecture & Implementation  
**Target Platform:** Web (Desktop-first studio, mobile-optimized preview & review)  
**Output Target:** 9:16 Vertical Video (1080 × 1920, 30/60 fps) for Instagram Reels, YouTube Shorts, and TikTok  

---

## 1. Executive Summary & Vision

### 1.1. Problem Statement
Content creators, startup founders, and educators face a major bottleneck when producing short-form video content (30–90 seconds):
- **Traditional editing is time-consuming:** Crafting motion graphics, kinetic typography, and transitions in After Effects or Premiere Pro takes 4–8 hours per reel.
- **Current AI video generators look cheap and generic:** Tools like InVideo or basic stock-video wrappers stitch unrelated stock footage with robotic voiceovers, causing immediate audience "AI blindness."
- **Diffusion-only AI video (Sora, Runway) lacks control:** Generative diffusion video is computationally expensive ($0.20–$0.50/sec), slow, and incapable of rendering crisp text, brand design, UI mockups, or accurate charts.

### 1.2. The Solution
**AutoReel Studio** is an AI-powered motion video generation platform built specifically for high-retention 30–90 second vertical videos. It hides video production complexity behind an intuitive four-step workflow:

$$\mathbf{Idea \longrightarrow Review\ Storyboard \longrightarrow Generate\ \&\ Review\ Video \longrightarrow Publish\ /\ Schedule}$$

By pairing an **interactive AI Director co-pilot** with a **code-driven motion graphics engine (Remotion)** and an **abstracted multi-engine audio & visual pipeline**, the platform produces studio-grade, content-adaptive explainer reels with zero manual timeline editing.

### 1.3. Core Principles
1. **Control Before Compilation:** Never lock users into a black-box generator. The creator approves the story before rendering, and approves the finished video before publishing.
2. **Deterministic Motion, Infinite Scalability:** Code-driven motion graphics (React/Remotion) guarantee razor-sharp 1080 × 1920 typography, frame-accurate animation sync, and instant in-browser playback.
3. **Semantic Intent Over Clichés:** Visual layouts reflect what the script actually communicates (causality, comparison, progression, metric impact) rather than superficial, rigid templates.
4. **Zero-Cost Development Guarantee:** Built with high-fidelity free-tier and open engines (Gemini 1.5/3.8 Flash, Microsoft Edge Neural TTS, Pollinations Flux, Remotion Local Renderer) to allow unlimited iterative testing during development, with seamless drop-in points for enterprise paid APIs in production.
5. **Fail-Safe Publishing:** Immutable publish payloads, atomic job claims, UTC-normalized scheduling, and strict outcome reconciliation prevent duplicate external posts or broken state.

---

## 2. Product Summary & Scope Decisions

| Area | V1 Decision | Rationale |
|---|---|---|
| **Product Name** | AutoReel Studio | Role-neutral, premium, applicable to startups, educators, and creators. |
| **Release Scope** | Internal development baseline & aggressive testing | Strict data isolation, robust project persistence, zero-cost dev. |
| **Workspace Model** | Private personal dashboard per user | Strict data isolation; no cross-user project leakage. |
| **Workflow** | 4-step progressive flow | 1. Idea $\rightarrow$ 2. Combined Storyboard $\rightarrow$ 3. Video Preview $\rightarrow$ 4. Publish/Schedule. |
| **Durations & Pacing** | 30s, 60s, 90s targets with Pacing Modes | Fast & Punchy (2.5–3.5s/scene), Balanced (4–5s/scene), Deep-Dive (5–7s/scene). |
| **Languages & Accents** | English narration with curated voice presets | Includes Indian English (Male/Female) and Global English presets. |
| **Visual Direction** | Minimal editorial motion graphics + generative concept art | 8 reusable vector motion patterns + optional Flux AI concept illustrations. |
| **Audio Engine** | Abstracted Hybrid Provider | Free-tier default: Edge Neural TTS (unlimited, $0). Drop-in: ElevenLabs. |
| **Captions** | Visible, editable dynamic captions | Millisecond-accurate word sync; max 2 lines; strictly inside Instagram Safe Zone. |
| **Revisions** | Conversational + In-place editing | Natural language chat edits at both Storyboard and Video Preview stages. |
| **Delivery** | In-browser preview, 1080p MP4 download, Meta Instagram direct publish & schedule | Official Meta Graph API with atomic deduplication. |
| **Persistence** | Accounts, project library, autosave, durable jobs | Background jobs survive browser closure; state recovery on return. |
| **Billing & Credits** | Excluded in V1 | No paywalls or credit meters during development; built-in upgrade hooks for V2. |

---

## 3. Information Architecture & Four-Step User Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 1: IDEA & BRAINSTORMING                                           │
│ • Input topic, paste notes/PRD, or brainstorm with AI Director         │
│ • Select Target Duration (30s / 60s / 90s) & Pacing Profile            │
│ • Choose Voice Preset (with instant audio preview)                     │
│ • Select from 3 AI-generated high-converting Hooks                     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 2: COMBINED SCRIPT & STORYBOARD REVIEW                            │
│ • Card-by-card timeline showing narration, visual intent, & duration   │
│ • In-place text editing + Conversational revisions ("Make scene 2 punchy")│
│ • Assign Motion Pattern (Diagram, Comparison, Flow, Chart, etc.)       │
│ • Select Visual Asset (Vector SVG, Flux Concept Art, Code, Minimal)    │
│ • Pin immutable version ──> [Approve & Generate Video]                 │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 3: VIDEO GENERATION & PREVIEW                                     │
│ • Durable background generation with stage progress indicator          │
│ • Real-time in-browser playback (@remotion/player)                     │
│ • Toggle Instagram Safe-Zone Overlay to verify readability             │
│ • Conversational revisions ("Make labels larger", "Pronounce SQL as sequel")│
│ • Download 1080x1920 MP4 (H.264/AAC)                                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 4: PUBLISH & SCHEDULE (INSTAGRAM REELS)                           │
│ • Connect Instagram Professional (Creator/Business) Account via Meta OAuth│
│ • AI-generated post caption & optimized hashtags (fully editable)      │
│ • Action: [Post Now] or [Schedule for Date/Time with explicit Timezone]│
│ • Immutable publish payload with outcome reconciliation                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. The 8 Reusable Motion-Graphics Patterns

To prevent generic stock video and ensure visual hierarchy, every scene maps to one of **eight parameterized motion patterns** rendered via Remotion:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 1. TITLE / HOOK        Bold kinetic headline, subtitle pulse, depth accent   │
│ 2. LABELED DIAGRAM     Central concept node, directional arrows, callouts    │
│ 3. PROCESS FLOW        Numbered steps connected by animated motion paths     │
│ 4. COMPARISON          Split-screen frame ("Old vs New", "Problem vs Solution")│
│ 5. TIMELINE            Chronological milestones with progressive reveal      │
│ 6. DYNAMIC CHART       Animated bar charts, percentage counters, trendlines  │
│ 7. STEP SEQUENCE       Stacked/cascading cards highlighting 1-2-3 takeaways │
│ 8. KINETIC SUMMARY     Punchy thesis statement, key takeaway, call-to-action │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Visual System & Safe-Area Constraints
- **Safe-Area Enforcement:** Subtitles, diagrams, and labels strictly avoid the bottom 25% (Instagram handle/caption zone), right 15% (interaction icons), and top 8% (system header).
- **Progressive Disclosure:** Elements animate in sync with narration phrases; diagrams never appear all at once.
- **Consistent Stroke & Palette:** Restrained accent palette, consistent vector stroke weights, high contrast against light or dark neutral backgrounds.
- **Fact-Based Data:** Charts only display user-supplied metrics or clearly marked illustrative figures; the AI never hallucinates fake quantitative evidence.

---

## 5. Functional Requirements

### FR-01: Authentication, Workspace & Data Isolation
- Require authentication for all stored projects and operations.
- Every user has an isolated workspace. Projects, idea conversations, media assets, and Instagram connections are strictly owned by that user session.
- Session-derived ownership on all backend endpoints; client-supplied user IDs are never trusted.
- Logging out does not cancel running background generation jobs.

### FR-02: Idea Input & AI Brainstorming
- Accept a seed topic, bulleted notes, or raw documentation (up to 20,000 characters).
- Optional brainstorming mode: User provides a broad domain (e.g. *"I teach distributed systems"* or *"We built a developer tool for caching"*), and the AI proposes 3–5 specific angles with hook strategies.
- Enforce input safety: User notes are treated as content, never as prompt instructions to override system safety rules.

### FR-03: AI Storyboard Engine (Powered by Gemini Interactions API)
- **Engine Core:** Uses Google DeepMind's modern **Gemini Interactions API** (`@google/genai` SDK `ai.interactions.create` with `model: "gemini-2.5-flash"` / `"gemini-1.5-flash"`).
- **Native Structured Output:** Enforces strict JSON Schema compliance via `response_format` / `response_mime_type: "application/json"`, guaranteeing zero parsing failures or hallucinated markdown wrappers.
- **Granular Scene Output Contract:** Every generated storyboard produces a strongly-typed array of scenes containing:
  1. **Narration Script (`narration`):** High-retention conversational voiceover text calibrated for human speech delivery (~2.5 words per second).
  2. **Typographic Hierarchy & Labels (`labels`):**
     - `badgeText`: Uppercase domain/context tag (e.g. `"// RUNTIME ARCHITECTURE"`).
     - `headline`: Big kinetic visual text anchor (e.g. `"The Container Illusion"`).
     - `subheadline`: Explanatory supporting phrase (e.g. `"Why Pods Actually Exist"`).
     - `calloutPoints`: List of 2–4 vector callout labels pointing to visual objects (e.g. `["Isolated Cgroups", "Shared Kernel"]`).
  3. **Visual Choices & Motion Mapping (`visualChoice`):**
     - `motionPattern`: Explicit mapping to one of the 8 Remotion Motion Patterns (`TitleHook`, `LabeledDiagram`, `ProcessFlow`, `Comparison`, `Timeline`, `DynamicChart`, `StepSequence`, `KineticSummary`).
     - `geometryType`: Spatial layout (`"isometric_3d"` | `"split_screen"` | `"radial_orbit"` | `"linear_flow"`).
     - `focalElements`: Specific technical/conceptual visual items to generate (e.g. `["kubernetes_pod_hex", "docker_container_cube", "laser_orbit_rings"]`).
     - `accentColor`: Hex color code matching brand/theme emphasis (e.g. `#38BDF8`, `#F43F5E`, `#10B981`).
     - `cameraMotion`: Dynamic virtual camera directive (`"dolly_in"` | `"pan_down"` | `"subtle_float"` | `"static_anchor"`).
  4. **Timing & Pacing Calibration (`timing`):**
     - `targetDurationSec`: Explicit duration allocated to the scene.
     - `wordCount`: Exact word count calculated against the selected pacing profile.
  5. **Audio & Pronunciation Directives (`audioDirectives`):**
     - Phonetic pronunciation overrides (e.g. `{"K8s": "Kubernetes", "SQL": "sequel"}`).
     - Pause markers for visual breathing room.
  6. **Caption Preset Selection (`captionStyle`):**
     - Selectable between `'vox-editorial'` (clean Inter font with frosted glass dock) and `'opus-karaoke'` (kinetic punchy uppercase pop).
- **Multi-Turn Conversational Revisions:** Utilizes persistent Gemini Interaction threads. When a user issues natural language edits in Step 2 (e.g. *"Change scene 3 from comparison to process flow"* or *"Make scene 2 explain cgroups instead"*), the Interactions API modifies only the target scene while preserving unchanged scenes and audio cache.
- **Embedded Storyboard Review:** Narration, visual choices, and labels are displayed together on intuitive scene cards. Users can perform inline typing edits or conversational chat edits with instant autosave.

### FR-04: Duration, Word Count & Pacing Calibration
- **30 Seconds (Fast & Punchy):** 65–75 words, 6–8 scenes, 2.5–3.5s per scene.
- **60 Seconds (Balanced Storyteller):** 130–150 words, 9–12 scenes, 4–5s per scene.
- **90 Seconds (Deep-Dive Explainer):** 195–225 words, 12–16 scenes, 5–7s per scene.
- Initial duration is estimated from word count; actual duration is measured once audio synthesis completes.
- If audio synthesis deviates by >10% from the target range, the timeline builder adapts pauses or flags the script for user adjustment.

### FR-05: Abstracted Audio & Speech Engine
- Unified `AudioProvider` interface supporting multiple backends:
  - **Default (Free Dev):** Microsoft Edge Neural TTS (`edge-tts`). 100% free, unlimited, zero API keys, 40+ high-fidelity neural voices.
  - **Studio Drop-in:** ElevenLabs (`eleven_multilingual_v2` / `eleven_turbo_v2_5`) enabled seamlessly when an `ELEVENLABS_API_KEY` is present.
- Curated voice presets available on the Idea screen (including Indian English Male/Female and Global English presets) with instant audio previews.
- Support pronunciation overrides (e.g. *"Pronounce SQL as sequel"* or *"Pronounce K8s as Kubernetes"*).
- Generates exact millisecond-level word boundary timestamps (`wordTimestamps`) for real-time subtitle alignment.

### FR-06: Synchronized Kinetic Captions & Safe Zone
- Captions are automatically generated from audio alignment timestamps (not estimated reading speed).
- Maximum of 2 lines visible simultaneously, styled with high contrast and active word highlighting.
- Editable caption text: Users can fix subtitle spelling without re-synthesizing voice audio.
- Positioned strictly above the 25% Instagram bottom overlay zone.

### FR-07: Conversational Revisions & Invalidation Matrix
The platform supports plain-language revision prompts at both Storyboard and Video Preview stages. To optimize speed and minimize compute, changes follow strict **Revision Invalidation Rules**:

| Change Requested | What is Reused | What is Rebuilt |
|---|---|---|
| **Visual layout, motion pattern, or colors** | Narration audio & alignment timestamps | Affected visual components & final render |
| **Caption spelling / display text only** | Audio, scene plan, & timestamps | Subtitle layout & final render |
| **Voice preset / narrator change** | Approved script text & visual assets | Audio synthesis, alignment, caption timing, render |
| **Spoken words or pronunciation override** | Unchanged scene visual assets | Affected scene audio, alignment, captions, render |
| **Scene reordering / addition / deletion** | Valid individual scene assets | Global timeline, scene transitions, render |
| **Major script rewrite** | Idea seed notes | New storyboard version (requires new approval) |
| **Instagram caption or scheduled time** | Final rendered video asset | Publish intent payload only |

### FR-08: Durable Generation Jobs & Background Execution
- Submitting video generation creates a durable background job with a unique Job ID.
- Browser closure or page refreshes do not cancel or corrupt in-flight rendering jobs.
- Clear stage progress indicator: `Preparing scenes` $\rightarrow$ `Synthesizing speech` $\rightarrow$ `Aligning timeline` $\rightarrow$ `Composing motion graphics` $\rightarrow$ `Validating output`.
- Deduplication: Repeated clicks on "Generate" reuse the existing operation key.

### FR-09: Real-Time Preview & MP4 Export
- Zero-wait preview powered by `@remotion/player` running natively in the browser.
- Full video controls: play/pause, seek timeline, audio volume, full-screen.
- Toggleable **"Instagram Safe-Zone Overlay"** (reveals platform UI boundaries).
- Local 1080 × 1920 MP4 export using Remotion Local Renderer and FFmpeg (H.264 video, AAC audio).
- Automated output validation before marking `Ready`: verifies file integrity, dimension conformity, audio presence, and duration compliance.

### FR-10: Instagram Connection & Social Publishing
- Official Meta Graph API integration using Instagram Login OAuth for Professional (Creator/Business) accounts.
- Per-user account connection; access tokens are encrypted and stored privately.
- Disconnecting an account pauses pending schedules and prompts for reauthorization.

### FR-11: Post Now & Scheduled Publishing Engine
- **Post Now:** Immediate upload and publish to Instagram Reels with approved caption and hashtags.
- **Smart Scheduling:**
  - Date and time picker with **explicit user timezone** (saved preference, browser timezone, or explicit selection; never guessed).
  - Minimum lead time of 5 minutes; UTC execution timestamp stored in database.
  - Editing a video project does not alter an already scheduled post; an explicit "Replace scheduled version" action is required.
- **Fail-Safe Reconciliation (No Duplicate Posts):**
  - If a network request to Meta times out after submission, the job enters `Outcome unknown`.
  - The worker reconciles the status with Meta's container API before any retry is permitted, preventing accidental duplicate posts.

---

## 6. Decoupled State & Data Architecture

To avoid race conditions and state corruption, the system tracks **5 independent state dimensions**:

```
┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────┐
│  STORYBOARD VERSION   │   │    GENERATION JOB     │   │     VIDEO VERSION     │
├───────────────────────┤   ├───────────────────────┤   ├───────────────────────┤
│ • Draft               │   │ • Queued              │   │ • Building            │
│ • Planning            │   │ • Running             │   │ • Validating          │
│ • Review ready        │   │ • Cancel requested    │   │ • Ready for review    │
│ • Approved            │   │ • Cancelled           │   │ • Approved            │
│ • Superseded          │   │ • Succeeded           │   │ • Failed              │
│ • Failed              │   │ • Failed              │   └───────────────────────┘
└───────────────────────┘   └───────────────────────┘
                 ┌───────────────────────┐   ┌───────────────────────┐
                 │    PUBLISH INTENT     │   │ INSTAGRAM CONNECTION  │
                 ├───────────────────────┤   ├───────────────────────┤
                 │ • Draft               │   │ • Connected           │
                 │ • Scheduled           │   │ • Reauth required     │
                 │ • Preparing media     │   │ • Disconnected        │
                 │ • Publishing          │   └───────────────────────┘
                 │ • Published           │
                 │ • Failed              │
                 │ • Needs attention     │
                 │ • Outcome unknown     │
                 │ • Cancelled           │
                 └───────────────────────┘
```

### Core Data Models (TypeScript Contracts)

#### Project Entity
```typescript
interface Project {
  id: string;
  ownerId: string;
  title: string;
  durationTarget: 30 | 60 | 90;
  pacingMode: 'fast_punchy' | 'balanced' | 'deep_dive';
  voicePreset: string;
  themeConfig: {
    palette: { primary: string; secondary: string; background: string; text: string; accent: string };
    fontFamily: string;
    soundDesignEnabled: boolean;
  };
  activeDraftStoryboardId?: string;
  latestApprovedVideoId?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### Storyboard Scene Entity
```typescript
interface StoryboardScene {
  id: string; // Stable UUID
  orderIndex: number;
  voiceoverText: string;
  pronunciationNotes?: Record<string, string>; // e.g. { "SQL": "sequel" }
  motionPattern: 
    | 'title_hook' 
    | 'labeled_diagram' 
    | 'process_flow' 
    | 'comparison' 
    | 'timeline' 
    | 'dynamic_chart' 
    | 'step_sequence' 
    | 'kinetic_summary';
  patternParams: Record<string, any>; // e.g. nodes, labels, chart values, split sides
  highlightKeywords: string[];
  visualAsset?: {
    type: 'lucide_icon' | 'flux_image' | 'code_snippet' | 'none';
    value: string;
  };
  sfxCue?: 'whoosh' | 'pop' | 'click' | 'none';
  estimatedDurationSeconds: number;
}
```

#### Audio & Alignment Entity
```typescript
interface AudioAlignment {
  sceneId: string;
  audioUrl: string;
  durationMs: number;
  wordTimestamps: Array<{
    word: string;
    startMs: number;
    endMs: number;
  }>;
}
```

---

## 7. Technical Stack & Infrastructure Design

| Layer | Technology | Role & Justification |
|---|---|---|
| **Frontend Framework** | **Next.js (App Router) + TypeScript** | High-performance React framework, Server Actions, modern routing. |
| **UI Components** | **Tailwind CSS + Shadcn UI** | Accessible, responsive, dark/light mode, mobile-friendly review screens. |
| **Motion Video Engine** | **Remotion (`@remotion/player` & `@remotion/renderer`)** | Zero-latency client preview + local/sandboxed server rendering. |
| **AI LLM Orchestrator** | **Google Gemini 1.5 / 3.8 Flash** | High-speed structured JSON storyboard outputs, hook brainstorming. (Free tier: 1,500 req/day). |
| **Primary Speech Engine** | **Microsoft Edge Neural TTS (`edge-tts`)** | 100% Free, unlimited, zero API keys, 40+ neural voices, exact millisecond timestamps. |
| **Studio Speech Engine** | **ElevenLabs API (`eleven_multilingual_v2`)** | Optional drop-in studio audio when user provides API key. |
| **Concept Art Engine** | **Pollinations.ai (Flux Schnell/Dev)** | Fast, 100% free programmatic AI image generation for narrative concept art. |
| **Vector Assets** | **Lucide Icons + SVG Canvas** | Razor-sharp resolution-independent motion primitives. |
| **Database & Auth** | **Supabase (PostgreSQL + Auth + Storage)** or **MongoDB + Better Auth** | User sessions, project history, asset metadata, row-level security. |
| **Durable Workflow** | **Inngest** or **QStash** | Reliable multi-step background pipeline and scheduled posting triggers. |
| **Social API** | **Meta Graph API (Instagram Content Publishing)** | Official Reels publishing & scheduling for Professional accounts. |

---

## 8. Quality Evaluation & Acceptance Criteria

### 8.1. Acceptance Checklist
- [ ] Creator completes 4-step workflow without touching a complex timeline editor.
- [ ] Storyboard cards display narration, motion pattern, preview schematic, and duration estimate.
- [ ] Plain-language revisions at Storyboard stage update only target scenes and preserve unaffected assets.
- [ ] Conversational video revisions (e.g. caption spelling or diagram scale) follow strict invalidation rules without re-rendering unnecessary layers.
- [ ] All exported videos strictly fall into 30s, 60s, or 90s target bounds (±3s margin).
- [ ] Dynamic captions stay strictly within the Instagram Safe-Zone (never hidden behind native platform UI).
- [ ] Word-level subtitle highlights align to spoken speech within 200ms.
- [ ] In-flight generation jobs survive browser tab closure and reconnect seamlessly upon return.
- [ ] Instagram scheduling respects UTC conversion with explicit user timezone.
- [ ] Post-timeout reconciliation prevents duplicate Instagram posts on flaky network responses.
- [ ] Complete development and testing pipeline functions at **$0.00 cost**.

---

## 9. Phased Delivery Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 0: The Core Engine Spike (Proof of Concept)                      │
│ • Validate Gemini structured JSON storyboard output                    │
│ • Generate Edge-TTS audio with millisecond word timestamps             │
│ • Remotion Composition with 1 motion pattern + kinetic word highlight   │
│ • Verify 1080x1920 local preview and MP4 export                        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Complete Idea-to-Export Studio                                │
│ • Next.js App, Workspace Dashboard, & Project Persistence              │
│ • AI Director Chat & Hook Brainstorming                                │
│ • Full Storyboard Inspector with 8 Reusable Motion Patterns            │
│ • Conversational Revision Engine with Invalidation Rules               │
│ • In-Browser Remotion Player & Local 1080p MP4 Exporter                │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Instagram Direct Delivery & Scheduling                        │
│ • Meta Graph API OAuth connection for Professional Accounts            │
│ • AI-crafted post caption & hashtag generator                          │
│ • Immediate "Post Now" & Background Scheduled Publishing Queue         │
│ • Safe-zone overlays & duplicate-post reconciliation                   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Production Polish & Scale                                     │
│ • 20-topic benchmark evaluation (processes, charts, comparisons)       │
│ • Cloud Remotion Lambda rendering candidate                            │
│ • Multi-platform export (16:9 YouTube, 1:1 LinkedIn)                   │
└────────────────────────────────────────────────────────────────────────┘
```
