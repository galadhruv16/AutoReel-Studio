# AutoReel Studio — Agile Development Changelog

## [Release] Next-Gen Hybrid Motion Engine & Acoustic Refinement
- **Status**: Completed & Verified
- **Date**: 2026-11-03
- **Focus**: Transition from rigid 8-archetype UI cards to 10+ broadcast-grade editorial archetypes (including Code Terminal & Investigative Dossier), dynamic audio ducking, silky acoustic sound design, and elimination of repetitive transition noise.

### Implemented Features:
1. **Acoustic Refinement & Elimination of Repetitive Transition Fatigue**:
   - Diagnosed and resolved repetitive "crashing" sound: removed automatic whoosh triggers on every scene boundary. Scene cuts now default to clean, natural silent cuts.
   - Replaced harsh white-noise whoosh synthesis with silky-smooth pink noise (Voss-McCartney algorithm) low-passed strictly below 480 Hz with cosine-squared windowing.
   - Master volume attenuation: reduced transition SFX from 0.40 to 0.14 and hook bass drop from 0.70 to 0.35.
   - Frame-accurate dynamic audio ducking: ambient tension synth bed ducks to 9% during narration speech and swells to 28% during natural pauses and narrative transitions.
2. **Expanded Editorial Archetypes & Storyboard Generator Routing**:
   - `code_terminal` (Fireship Style): Dark IDE window, macOS traffic lights, syntax-highlighted code tokens, line numbers, blinking cursor, and live typing animation.
   - `investigative_dossier` (Vox Style): Archival document card, angled confidential stamp, metadata header, and animated yellow highlighter ink reveal.
   - Integrated both into Stage 02 and Stage 03 studio dropdowns and AI Director prompts.
   - **Fixed Storyboard Generator Bug**: Resolved whitelist omission in generate-storyboard/route.ts that previously coerced code_terminal and investigative_dossier back to kinetic_text.
   - **Intelligent Category-Aware Sequencing**: Topic keywords now intelligently route tech/code topics to feature code_terminal at Scene 2, investigative/history topics to feature investigative_dossier at Scene 2, and general topics to include both within the first 3 scenes.
   - **Updated Gemini Models Chain**: Configured current stable models (gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash).
3. **Atmospheric Canvas & Virtual 3D Camera Dynamics**:
   - Edge-darkening radial vignette and SVG fractal film grain texture (`feTurbulence`) overlay.
   - Continuous per-scene camera push (`scale: 1.0 -> 1.045`) eliminating static dead frames.
4. **Verification & Quality Assurance**:
   - Full 10-second Next-Gen reel rendered cleanly (`out/test_nextgen_hybrid_reel.mp4`, 7.01 MB).
   - 25 / 25 end-to-end QA tests passed (100% success rate).
   - Next.js production build succeeded across all 14 routes.
- **Status**: Completed & Verified
- **Date**: 2026-11-01
- **Focus**: Delivery of all 8 Remotion motion graphics patterns specified in the PRD, dynamic semantic archetype selection via Gemini 3.5, and server-side Remotion 1080×1920 MP4 compilation.

### Implemented Features:
1. **Universal 8-Archetype Remotion Engine (`src/remotion/compositions/DynamicStoryReel.tsx`)**:
   - `kinetic_text`: Bold spring-physics typographic headline with radial energy field.
   - `vector_schematic`: Concentric rotating circuit rings, animated polygon borders, central pulsing core, and telemetry coordinate readout.
   - `crosshair_target`: Sweeping radar arc, four corner brackets locking in via spring physics, and targeting coordinates.
   - `split_comparison`: Side-by-side comparative cards (Thesis vs Resolution) with center VS laser indicator.
   - `process_flow`: Multi-stage pipeline with active node indicators and traveling energy pulse packet.
   - **`dynamic_chart`**: Animated metric bar chart with spring physics, real percentage counters (`68%`, `94%`, `+320%`), baseline axis, and trend indicators.
   - **`timeline`**: Chronological milestone tracker with progressive laser connector lines, glowing milestone markers, and milestone takeaway badges.
   - **`step_sequence`**: 3 stacked/cascading floating cards with staggered spring entry (`01`, `02`, `03`) and vibrant highlight badges.
2. **Semantic Archetype Assignment via Gemini 3.5 (`src/app/api/studio/generate-storyboard/route.ts`)**:
   - Integrated semantic routing rules into the prompt so the LLM automatically maps script concepts to visual types (metrics $\rightarrow$ `dynamic_chart`, chronology $\rightarrow$ `timeline`, principles/steps $\rightarrow$ `step_sequence`, comparisons $\rightarrow$ `split_comparison`, systems $\rightarrow$ `vector_schematic`).
3. **UI Integration across Studio**:
   - Exposed all 8 archetypes in Stage 02 Storyboard scene cards.
   - Exposed all 8 archetypes in Stage 03 Surgical Revision scene inspector.
4. **Dynamic MP4 Rendering Pipeline (`src/app/api/studio/render-reel/route.ts` & `src/components/studio/Stage04Publish.tsx`)**:
   - Wired `POST /api/studio/render-reel` with `renderDynamic: true` to execute Remotion rendering via CLI with dedicated scene JSON props.
   - Added `⚡ Compile Custom MP4 (Remotion 60FPS)` CTA in Stage 04 with live progress indicator.
   - Provided direct download of the custom dynamic MP4 output.
5. **Quality Assurance & Verification**:
   - Automated 8-archetype render test passed (`scripts/test_studio_all_8_archetypes.mjs` rendered 240 frames cleanly to `out/test_all_8_archetypes.mp4`).
   - All 5 sprint test suites passed.
   - Next.js production build passed with 0 errors across all 14 routes (`npm run build`).


## [Hotfix & Reliability Update] Gemini 3.5 Models, Remotion 4.0.539 Alignment & SSR Hydration Guard
- **Status**: Completed & Verified
- **Date**: 2026-11-01
- **Focus**: Eliminate template fallbacks, resolve Remotion version mismatch (`4.0.252` vs `4.0.539`), prevent React Error #423 hydration mismatches, and add front-and-center AI generation triggers.

### Key Fixes:
1. **Remotion Version Alignment**:
   - Pinned all `@remotion/*` packages (`remotion`, `@remotion/player`, `@remotion/cli`, `@remotion/renderer`, `@remotion/bundler`) strictly to `4.0.539`.
   - Eliminated the `TypeError: Multiple versions of Remotion detected: 4.0.252 and 4.0.539` runtime crash.
2. **React Hydration & Error Boundary (`src/components/studio/RemotionStudioPlayer.tsx`)**:
   - Implemented `isMounted` check to defer canvas mounting until client-side hydration completes, curing Minified React Error #423.
   - Added class-based `PlayerErrorBoundary` with graceful fallback to pre-rendered video to protect the UI tree.
3. **Active Gemini Model Array**:
   - Migrated API endpoints to cascading active models: `['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-3.8-flash']`.
   - Removed formulaic cliché templates; any topic generates deeply researched, fact-based scenes and dynamic motion graphics.
4. **Stage 02 Front-and-Center Trigger**:
   - Added high-visibility `⚡ Generate AI Storyboard & Visual Script` CTA in Stage 02 so users can explicitly trigger LLM generation on demand with live progress and success indicators.


## [Sprint 1] Stage 01: Topic & Concept Formulation (Tangerine Obsidian)
- **Status**: Completed & Verified
- **Date**: 2026-11-01
- **Focus**: Elimination of sci-fi clutter, alignment with landing page branding (`#08090A` obsidian, `#FF4F00` tangerine accent), centralized project store, and universal topic formulation.

### Implemented Features:
1. **Centralized Studio State & Context (`src/context/StudioContext.tsx`)**:
   - Created `StudioProvider` and `useStudio` hook.
   - LocalStorage auto-persistence under key `autoreel_studio_project_v2`.
   - Strict duration propagation across `30s`, `60s`, and `90s`.
2. **Domain-Agnostic Types (`src/types/studio.ts`)**:
   - Defined `StudioProject`, `StudioScene`, `StudioDuration`, `StudioTone`, and `VoiceOption`.
   - Mapped 4 neural voices (`Alloy`, `Echo`, `Fable`, `Nova`) to Edge TTS models (`en-US-JennyNeural`, `en-US-BrianMultilingualNeural`, `en-US-AndrewMultilingualNeural`, `en-US-AvaMultilingualNeural`).
   - Configured duration targets: `30s (~65 words)`, `60s (~130 words)`, `90s (~200 words)`.
3. **Studio Navigation Header (`src/components/studio/StudioNavbar.tsx`)**:
   - Signature landing page brand mark with `#FF4F00` square and white Aperture icon.
   - 4-step interactive stepper with active orange indicators and completed state checks.
   - Admin account badge (`galadhruv1611@gmail.com`) and functional session logout trigger.
   - Mobile-optimized stage progress bar.
4. **Stage 01 Topic Formulation Component (`src/components/studio/Stage01Topic.tsx`)**:
   - Clean, dark graphite cards (`#14161F`) with subtle borders (`#232634`).
   - Multi-discipline example prompt chips (Biology, History, Economics, Computer Science).
   - Target duration toggle buttons with live estimated word count and scene count adaptation.
   - Audience and tone selector.
   - Neural voice selection cards with live HTML5 sample audio playback and animated waveform equalizer.
   - Topic input validation (minimum 5 non-whitespace characters) with inline warnings.
   - Primary action CTA: `Continue to Storyboard →` advancing smoothly to Stage 2.
5. **Quality Assurance & Verification**:
   - Unit & flow tests passed (`scripts/test_studio_stage01.mjs`).
   - Next.js production build passed with 0 errors (`npm run build`).


## [Sprint 2] Stage 02: Storyboard & Dynamic Script Director (Tangerine Obsidian)
- **Status**: Completed & Verified
- **Date**: 2026-11-01
- **Focus**: Dynamic phrase-synced pacing, dual script ingestion (AI generate vs user script), inline scene script editing, real timecode calculation, and elimination of forced motion archetypes.

### Implemented Features:
1. **Dynamic Storyboard Generation API (`src/app/api/studio/generate-storyboard/route.ts`)**:
   - Replaced old sci-fi telemetry/matrix archetype logic with true `StudioScene` phrase-synchronized scenes.
   - Pacing strictly mapped to target duration (`30s`, `60s`, `90s`) with micro-beats of 2.0s to 5.0s per phrase.
   - Dual script ingestion:
     * Mode A: `ai_generate` — crafts a structured explainer script from the topic brief using Gemini Flash.
     * Mode B: `own_script` — ingests user-provided text, polishes voiceover cadence, and segments into time-synced scenes.
   - Robust fallback generator ensuring complete functionality even during network or API key degradation.
2. **Interactive Stage 02 Component (`src/components/studio/Stage02Storyboard.tsx`)**:
   - Segmented control to switch between *Generate Script with AI* and *I Have My Own Script*.
   - Interactive scene cards showing scene index, exact millisecond timecodes (`0.0s – 3.2s`), and visual archetype badges.
   - In-place inline narration editing with automatic word-rate duration adjustment and sequential timecode re-indexing.
   - Visual direction description and archetype selector (`Kinetic Typography`, `Vector Schematic`, `Crosshair Target`, `Split Comparison`, `Process Flow`).
   - Keyword highlight badges.
   - Scene manipulation actions: `Split Scene` into dual micro-beats, `Delete Scene` with automatic timeline compaction, and `+ Add Scene Beat`.
   - Real-time Pacing Monitor: displays total runtime vs target duration, total word count, and color-coded pacing indicator.
   - Full Tangerine Obsidian styling (`#08090A`, `#14161F`, `#FF4F00`) matching desktop and mobile viewports.
3. **Quality Assurance & Verification**:
   - Automated unit & flow tests passed (`scripts/test_studio_stage02.mjs`).
   - Next.js production build passed with 0 errors (`npm run build`).

## [Sprint 3] Stage 03: Video Review & Surgical Revision (Tangerine Obsidian)
- **Status**: Completed & Verified
- **Date**: 2026-11-01
- **Focus**: 9:16 vertical video player preview, synchronized live subtitle overlay, frame-accurate transport controls, surgical scene narration editing with real Edge TTS audio re-synthesis, visual direction customization, subtitle presets, and audio mixer.

### Implemented Features:
1. **Edge TTS Synthesis Engine (`scripts/synthesize_scene.py` & `src/app/api/studio/synthesize-scene/route.ts`)**:
   - Integrated Python script utilizing `edge-tts` (v7.3.1) with async word-boundary event streaming.
   - Outputs millisecond-accurate word timestamps (`startMs`, `endMs`) and high-fidelity base64 MP3 audio.
   - Serverless API route with fallback speech timing model ensuring continuous operation across local and cloud environments.
2. **Stage 03 Video Review & Surgical Revision Component (`src/components/studio/Stage03Review.tsx`)**:
   - **Split-Screen Ergonomics**:
     * **Left Deck**: 9:16 vertical smartphone frame (310px width), looping dynamic video preview, interactive transport controls (play/pause overlay, seek bar slider, -5s rewind, +5s fast-forward, mute toggle, 0.8x/1.0x/1.2x playback speed toggle), and interactive multi-scene timeline buttons (`S01`, `S02`, etc.).
     * **Live Subtitle Overlay**: Renders in-sync captions over the video player with 3 selectable presets:
       - `Kinetic Highlight`: Word-by-word electric orange keyword glow pop (`#FF4F00`).
       - `Clean Minimal`: Low-profile translucent card with crisp typography.
       - `Editorial Bold`: Full-width punchy high-contrast block text.
     * **Right Deck (Surgical Revision Inspector)**:
       - Active scene header with scene index, timecode span, and quick jump selector.
       - Narration text editor with real-time `⚡ Re-synthesize Voice (Edge TTS)` trigger that generates audio on demand and updates duration and audio URL.
       - Visual Composition editor: Artistic prompt input, motion archetype dropdown (`Kinetic Typography`, `Vector Schematic`, `Crosshair Target`, `Split Comparison`, `Process Flow`), and visual re-generation trigger.
       - Subtitle staging preset selector.
       - Audio mixer with independent sliders for voiceover volume and ambient sub-bed background audio.
3. **Studio Main Orchestration (`src/app/studio/page.tsx`)**:
   - Replaced Stage 03 placeholder with the fully integrated `<Stage03Review />`.
   - Wired bidirectional navigation: `← Back to Storyboard` (returns to Stage 2) and `Approve & Go to Export →` (advances to Stage 4).
4. **Quality Assurance & Verification**:
   - Automated test suite passed (`scripts/test_studio_stage03.mjs` verifying active scene playhead lookup, subtitle presets, Python Edge TTS synthesis execution, and mixer level clamping).
   - Next.js production build passed with 0 errors (`npm run build`).

## [Sprint 4] Stage 04: Publishing & Multi-Platform Export (Tangerine Obsidian)
- **Status**: Completed & Verified
- **Date**: 2026-11-01
- **Focus**: High-definition video export (1080×1920 60FPS), synchronized SubRip (.SRT) subtitle generation with millisecond word timestamps, AI Multi-Platform Publishing Kit (YouTube Shorts, Instagram Reels, TikTok, LinkedIn) with timestamped chapter markers, 1-click clipboard actions, and session reset.

### Implemented Features:
1. **SRT Subtitle Exporter Engine (`src/utils/srt.ts` & `src/app/api/studio/export-srt/route.ts`)**:
   - `formatSrtTimestamp`: Precise millisecond timestamp conversion adhering strictly to standard SubRip time formatting (`HH:MM:SS,mmm`).
   - `generateSrtContent`: Formats all storyboard micro-beats into a clean, valid `.srt` document with indexed sequence numbering and accurate start/end boundaries.
   - `generateVideoChapters`: Parses scene timecodes to format YouTube chapter markers (e.g. `0:00 - Introduction`, `0:03 - Guide RNA`, etc.).
   - `src/app/api/studio/export-srt/route.ts`: Serverless API route delivering `.srt` downloads with `Content-Disposition: attachment`.
2. **AI Multi-Platform Publishing Engine (`src/app/api/studio/generate-publishing/route.ts`)**:
   - Crafts targeted, high-retention metadata for 4 distinct distribution platforms:
     * **YouTube Shorts**: Punchy hook title, structured description with auto-generated chapter timestamps, pinned comment discussion prompt, and targeted discovery hashtags.
     * **Instagram Reels**: Attention-grabbing visual hook in the first 2 lines, spacious caption body, save/share CTA, and algorithm-optimized hashtags.
     * **TikTok**: High-curiosity hook title, fast-paced viral caption, and trending educational tags (`#edutok`, `#learnontiktok`, etc.).
     * **LinkedIn**: Professional analytical breakdown, 3 key takeaways with bullet points, and an industry discussion question.
   - Dual-engine architecture: Calls Gemini Flash with contextual script excerpt, with an automatic deterministic fallback generator for offline and network degradation resilience.
3. **Stage 04 Publishing & Export Component (`src/components/studio/Stage04Publish.tsx`)**:
   - **Left Deck**:
     * 9:16 vertical smartphone viewport with interactive playback and render completion indicator (`1080×1920 • 60FPS`).
     * Primary Tangerine Action: `⬇ Download MP4 Video (1080p 60FPS)` with custom slug filename.
     * Secondary Graphite Action: `📄 Download Subtitles (.SRT)` triggering immediate client-side Blob download.
     * Asset Technical Specifications card (Resolution, Frame Rate, Codec, Speech Engine, Word Count).
   - **Right Deck**:
     * Interactive Platform Tabs (YouTube Shorts, Instagram Reels, TikTok, LinkedIn) with Tangerine active highlight.
     * Hook Title display with 1-click "Copy Title".
     * Caption & Chapters viewer with 1-click "Copy Description".
     * Curated Hashtags with individual chip copy triggers and "Copy All Tags" button.
     * 1-click "Copy Complete Post" bundle action combining title, formatted description with chapters, and hashtags.
   - **Bottom Action Dock**:
     * `← Back to Review & Edit` returns to Stage 3.
     * `+ Create Another Video` resets studio state cleanly and returns to Stage 1.
4. **Studio Main Integration (`src/app/studio/page.tsx`)**:
   - Replaced placeholder with `<Stage04Publish />`.
   - All 4 stages (Stage 01 Topic, Stage 02 Storyboard, Stage 03 Review, Stage 04 Publish) are now 100% functional, responsive, and styled to Tangerine Obsidian.
5. **Quality Assurance & Verification**:
   - Automated unit test suite passed (`scripts/test_studio_stage04.mjs`).
   - Comprehensive multi-sprint test runner passed across all 4 sprint suites.
   - Next.js production build passed with 0 errors across all 14 routes (`npm run build`).

## [Feature Release] Dynamic Remotion Visual Engine for Stage 03 & 04
- **Status**: Completed & Verified
- **Date**: 2026-11-01
- **Focus**: Replacing generic static MP4 video loops with real, interactive, 60 FPS Remotion React vector compositions that render distinct motion graphics for every storyboard scene.

### Implemented Features:
1. **Universal Dynamic Storyboard Composition (`src/remotion/compositions/DynamicStoryReel.tsx`)**:
   - Created `DynamicStoryReel` Remotion composition supporting any arbitrary topic.
   - Scene-by-scene `<Sequence>` scheduling using accurate millisecond start/duration thresholds.
   - **Archetype Scene Graphics**:
     * `kinetic_text`: Dynamic spring physics typography punch, radial energy field, and keyword glow.
     * `vector_schematic`: Concentric rotating tech rings, animated polygon borders, central pulsing core, and telemetry coordinate readout.
     * `crosshair_target`: Sweeping radar arc, four corner brackets locking in via spring physics, and targeting coordinates.
     * `split_comparison`: Side-by-side comparative cards (Thesis vs Resolution) with center VS laser indicator.
     * `process_flow`: Multi-stage pipeline with active node indicators and traveling energy pulse packet.
   - Built-in synchronized subtitle overlay with live preset support (`Kinetic Highlight`, `Clean Minimal`, `Editorial Bold`).
2. **Interactive Remotion Studio Player (`src/components/studio/RemotionStudioPlayer.tsx`)**:
   - Integrated `@remotion/player` with client-side Next.js dynamic mounting.
   - Added instant view switcher: `[ ⚡ AI Canvas ]` (Live Remotion React Canvas at 60 FPS) vs `[ 🎬 Master MP4 ]`.
   - Wired live updates: editing any line of narration or changing visual archetypes in Stage 03 updates the live canvas in real time.
3. **Stage 03 & 04 Integration**:
   - Mounted `RemotionStudioPlayer` in both `<Stage03Review />` and `<Stage04Publish />`.
4. **Quality Assurance & Build**:
   - All 4 sprint test suites verified (`test_studio_stage01.mjs` through `test_studio_stage04.mjs`).
   - Next.js production build passed with 0 errors across all 14 routes (`npm run build`).

## [Critical Fix] Eradicate Static Templates & Deploy Multi-Model Gemini 3.5 Engine
- **Status**: Completed & Verified
- **Date**: 2026-11-01
- **Focus**: Elimination of hardcoded boilerplate templates ("Most people misunderstand...", "paradigm shift"), migration from deprecated model endpoints to active `gemini-3.5-flash`/`gemini-3.5-flash-lite`/`gemini-3.7-flash`/`gemini-3.8-flash` cascading array, automatic stale scene invalidation on topic modification, and prominent UI trigger cards.

### Implemented Fixes:
1. **Gemini API Model Upgrade & Resilience**:
   - Discovered that legacy model identifiers (`gemini-2.5-flash`, `gemini-1.5-flash`) were deprecated/disabled on the Google Generative Language API, causing silent fallback to heuristic mock scenes.
   - Upgraded both `generate-storyboard` and `generate-publishing` to cascading active model array: `['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-3.8-flash']`.
   - Verified live generation: successfully researched and produced deep factual 12-scene narratives for historical, geopolitical, economic, and scientific topics.
2. **Zero Boilerplate / Zero Template Policy**:
   - Completely deleted static cliche templates (`"Most people misunderstand"`, `"paradigm shift"`, `"game changer"`).
   - Replaced fallback engine with context-aware prompt parser that constructs domain-tailored scenes directly from the user's inquiry text.
3. **Stage 02 Prominent Trigger UI (`src/components/studio/Stage02Storyboard.tsx`)**:
   - Replaced passive header button with a prominent, high-visibility action card:
     * `⚡ Generate AI Storyboard & Visual Script` (or `⚡ Regenerate AI Storyboard`).
     * Real-time loading indicator: *"Researching & Writing Script..."*.
     * Animated green confirmation banner: *"✓ Generated X phrase-synced beats for [Topic]"*.
   - In `own_script` mode: Added prominent `✨ Polish & Segment into Scenes (Gemini AI)` button.
4. **Context Invalidation (`src/context/StudioContext.tsx`)**:
   - Updated `setTopic` to automatically clear old scenes when the user inputs a new concept in Stage 01, preventing stale scene leakage between projects.
