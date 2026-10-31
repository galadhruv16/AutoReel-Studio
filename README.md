# AutoReel Studio 🎬⚡

> **AI-Powered Code-Driven Short-Form Video Generation Engine**  
> Generate high-retention 9:16 vertical motion graphics explainer videos for technical architectures, scientific phenomena, and historical stories.

---

## 🌟 Key Highlights

- **Code-Driven Video Engine:** Built on **Remotion** and **React** for deterministic, mathematically timed vector graphics and typography.
- **Progressive Narrative Storytelling:** Multi-scene explainer format where illustrations, labels, and diagrams dynamically change in lockstep with the narration.
- **Synced Neural TTS Audio:** Microsoft Edge Neural TTS generating natural speech with millisecond word boundaries for synchronized kinetic captions.
- **Zero Heavy B-Roll Fluff:** Replaces generic stock footage with interactive SVG/CSS motion archetypes (isometric exploded stacks, sequential pipelines, mathematical telemetry curves, and dimensional ratio matrices).
- **Modern Next.js 14 Frontend:** Dark-themed web application with responsive phone reel mockup players, audio controls, and interactive motion archetypes.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v20+ recommended)
- Python 3.10+ (for Edge Neural TTS audio synthesis)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/galadhruv16/AutoReel-Studio.git
cd AutoReel-Studio

# Install JavaScript dependencies
npm install

# Install Python audio dependencies
pip install edge-tts
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your API keys as needed:
```env
GEMINI_API_KEY=your_key_here
```

### 4. Running the Web Studio
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Synthesizing Audio & Rendering Reels Locally
```bash
# Synthesize Edge-TTS narration with millisecond timestamps
python scripts/synthesize_3_reels_v2.py

# Render showcase reels via Remotion
node scripts/render_3_showcase_reels.mjs
```

---

## 📁 Project Structure

```
├── docs/                   # Architectural PRD, DB schema, API contracts, prompt design
├── public/
│   ├── audio/              # Synthesized MP3s & millisecond word boundary JSONs
│   └── videos/             # Rendered MP4 showcase reels and poster frames
├── scripts/                # Edge-TTS synthesizer and Remotion batch renderers
├── src/
│   ├── app/                # Next.js 14 App Router (Landing page & Studio routes)
│   ├── components/         # Landing UI, PhoneReelPlayer, and Motion Archetypes
│   └── remotion/           # Remotion root, compositions, captions, and motion patterns
└── package.json
```

---

## 📄 License
MIT License. Created by Dhruv Gala.
