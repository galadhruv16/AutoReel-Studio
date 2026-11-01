# AutoReel Studio — Agile Development Changelog

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
