import fs from 'fs';
import path from 'path';
import { callStitchTool } from './stitch_client.mjs';

const projectId = '1801554914878734954';

const promptOptionA = `
Ultra-modern, professional SaaS desktop landing page for "AutoReel Studio" — a pro-grade motion graphics engine for technical founders and creators.

IMPORTANT DESIGN PHILOSOPHY — AVOID GENERIC AI SLOP:
- DO NOT use generic purple/cyan gradient glow blobs, DO NOT use cheesy 4-card feature grids with generic icons, DO NOT use fake social proof pills with pulsating green dots.
- INSTEAD: Emulate the craftsmanship, precision, and tactile density of Linear, Raycast, and Runway.

Aesthetic: "Linear / Raycast Studio Workbench"
- Color Palette: Deep matte charcoal/obsidian (#0B0C0E), titanium zinc cards (#14161B), precision hairline borders (#232630), crisp white typography (#EDEDED), muted slate metadata (#8A8F9E), and a single focused Cobalt Blue (#2563EB) accent for active states.
- Typography: Inter / Geist with tight letter-spacing (-0.02em) paired with JetBrains Mono for frame counters, timestamps, and technical badges.

Header:
- Sleek minimal navigation: "AutoReel Studio" logo with geometric aperture mark, nav links (Workbench, Motion Patterns, Documentation, Changelog), and a crisp dark titanium button "Sign In" + "Start Free ->".

Hero Section:
- Top Tag: Monospaced metadata tag "[ ENGINE v2.0 • 100% LOCAL RENDERING ]"
- Headline: "The video editor for people who write code, not keyframes."
- Subtitle: "Compile structured ideas and documentation into studio-grade vertical motion graphics. Frame-accurate audio sync, programmatic 3D vectors, and zero After Effects complexity."
- Interactive Prompt Bar: Sleek console input with placeholder "prompt: Why Kubernetes Pods actually exist..." and keyboard shortcut badge "[ ⌘ + Enter to Compile ]".

Central Hero Showcase (A Realistic Pro Creative Studio Workbench):
- A large, beautifully crafted desktop application window mockup framing the AutoReel Studio workspace:
  - Top Toolbar: Project title "Kubernetes_Container_Lie.reel", Resolution badge "1080x1920 (9:16)", Frame Rate "30 FPS", Audio Sync "WhisperX Word-Aligned".
  - Center Canvas: Real 9:16 vertical video player showing an isometric 3D Kubernetes Pod hologram with glowing cyan wireframe container, laser orbit rings, and a frosted dark glass subtitle dock: "If you think Kubernetes runs Docker directly...".
  - Right Inspector Panel: Scene properties (Pattern: "Isometric 3D", Focal Element: "pod_hex_mesh", Camera Push: "1.07x Dolly", Voice: "Christopher Neural").
  - Bottom Timeline Bar: Multi-track timeline showing Narration Track (audio waveform with word boundaries), Motion Track (4 scene clips: 01 Hook, 02 Architecture, 03 Comparison, 04 Summary), and Subtitle Track.

Interactive Motion Pattern Showcase:
- A horizontal switcher tab bar showing the 8 motion patterns: [ Isometric 3D ] [ Process Flow ] [ Labeled Diagram ] [ Split Comparison ] [ Timeline ] [ Dynamic Metric ].
- Selecting a pattern reveals a live interactive visual canvas demonstrating that pattern's geometric motion.

Architecture & Precision Comparison (No generic cards!):
- A high-density comparison table comparing:
  - "Traditional After Effects": 4–6 hours manual labor, keyframe drift, $250/mo plugin stack.
  - "Diffusion Video AI (Sora/Runway)": Uncontrollable hallucinations, blurry text, $0.40/second GPU cost.
  - "AutoReel Studio": 14.1s deterministic compile, razor-sharp SVG typography, 100% $0 local engine.

Call to Action:
- Minimalist, high-craft footer banner with GitHub integration badge, quick-start CLI command, and "Open Studio" button.
`;

const promptOptionB = `
Sophisticated, editorial SaaS desktop landing page for "AutoReel Studio" — an AI motion video engine.

IMPORTANT DESIGN PHILOSOPHY — AVOID GENERIC AI SLOP:
- DO NOT use generic AI template tropes. No generic cyan/purple glow vomiting, no repetitive 4-card grids.
- INSTEAD: Emulate the warmth, typographic power, and physical design depth of Pitch, Stripe Press, and Arc Browser.

Aesthetic: "Editorial Motion Journal"
- Color Palette: Deep midnight slate (#0A0E17), warm alabaster cream typography (#F8FAFC), rich indigo accents (#4F46E5), and a vibrant pop of energetic Tangerine (#FF4F00) for primary actions.
- Typography: High-contrast editorial serif/sans blend (Newsreader or Instrument Serif headlines paired with clean Inter body and subtle italicized emphasis).

Header:
- Editorial layout: Distinctive AutoReel wordmark, curated links (Philosophy, Patterns, Gallery, Pricing), and a warm Tangerine CTA button "Try Studio".

Hero Section:
- Headline: "Ideas deserve motion, not bullet points."
- Subtitle: "AutoReel transforms technical documentation, startup pitches, and complex concepts into cinematic vertical explainer reels that stop the scroll and actually teach."
- Action Row: High-contrast Tangerine button "Create Your First Reel" paired with "Explore the Gallery (60+ Reels)".

Showcase Centerpiece (Physical Staggered Video Cards):
- 3 beautifully textured vertical video cards (9:16 aspect ratio) displayed with physical overlapping depth and soft ambient drop shadows:
  1. Front Center Card: "The Kubernetes Illusion" (Featuring our 3D isometric Pod & Container hologram with elegant frosted glass captions).
  2. Left Staggered Card: "How Stripe Scales to 10k TPS" (Rich systems diagram with glowing packets and latency metrics).
  3. Right Staggered Card: "The Zero-Knowledge Paradox" (Mathematical cryptographic curve visualizer).
- Ambient video badges: "14.1s Render" • "Pure Vector Geometry" • "Instagram & Shorts Ready".

The "Before & After" Editorial Teardown:
- Left Column ("The Status Quo"): A dull, generic stock-video reel with robotic voice and generic subtitles that causes viewer swipe-away in 1.2s.
- Right Column ("The AutoReel Standard"): A kinetic, content-adaptive vector animation with calibrated human speech pacing and 92.4% retention.

Motion Patterns Gallery:
- An elegant gallery grid showing real animated technical patterns: System Architectures, Database Sharding, Machine Learning Attention, Algorithm Life Cycles.

Footer:
- Magazine-style editorial footer with manifesto quote, social links, and studio launch trigger.
`;

const promptOptionC = `
Stark, ultra-minimalist developer landing page for "AutoReel Studio" — programmatic vertical motion graphics.

IMPORTANT DESIGN PHILOSOPHY — AVOID GENERIC AI SLOP:
- DO NOT use generic rounded AI cards, generic gradients, or fake marketing fluff.
- INSTEAD: Emulate the stark, uncompromising technical precision of Vercel, Cron, and Supabase.

Aesthetic: "Minimalist Terminal / Monochrome Precision"
- Color Palette: Pure Stark Black (#000000), deep zinc surfaces (#0D0D11), crisp monochrome borders (#1E1E24), pure white text (#FFFFFF), muted zinc (#71717A), with a single laser Emerald Green (#10B981) accent for active telemetry and playback.
- Typography: Geist / Inter with JetBrains Mono for all code, timestamps, and commands.

Header:
- Breadcrumb navigation: "autoreel.studio / engine / v2.0", latency ping "● 12ms", links (Spec, Remotion Engine, Edge-TTS, Docs), and "Deploy Reel [ ⌘K ]".

Hero Section:
- Headline: "Programmatic explainer reels. Compiled in 14 seconds."
- Subtitle: "AutoReel is a code-driven video pipeline. Turn markdown scripts into frame-accurate 1080x1920 motion graphics using Remotion and Gemini. $0 cloud bills."
- Terminal Command Bar:
  $ npx autoreel compile --topic "Distributed Consensus in Raft" --duration 60s
  [ Output: 1080x1920 H.264 • 143 frames • 0 errors ]

Split Studio Interface Showcase:
- A stark 50/50 split viewport:
  - Left Viewport (The Code Spec): Code editor showing the JSON storyboard contract (scenes array, motionPattern: "Isometric3D", narration lines, millisecond word boundaries).
  - Right Viewport (The Live Video Output): 9:16 vertical video player rendering the exact Remotion composition with live playback scrubber, Instagram Safe-Zone overlay toggle, and audio waveform meter.

Technical Specs & Performance Grid:
- Stark, borderless technical data table:
  - Render Speed: 14.1 seconds for 60s reel (30fps H.264)
  - Cost Per Video: $0.00 (Local Edge-TTS + local Remotion bundler)
  - Typography: 1080x1920 crisp vector rasterization (zero compression artifacts)
  - API Integration: Drop-in Gemini Interactions API + ElevenLabs audio pipeline

Footer:
- Monospaced developer footer with terminal status indicator, GitHub repo link, and CLI quick-start.
`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateAndDownloadOption(name, prompt, outputSlug) {
  console.log(`\n======================================================`);
  console.log(`Generating: ${name} on Stitch...`);
  console.log(`======================================================`);

  const genResult = await callStitchTool('generate_screen_from_text', {
    projectId,
    prompt: prompt.trim(),
    deviceType: 'DESKTOP',
    modelId: 'GEMINI_3_8_FLASH',
  });

  // Extract screen from design
  let screen = null;
  if (genResult.outputComponents) {
    for (const comp of genResult.outputComponents) {
      if (comp.design?.screens?.length > 0) {
        screen = comp.design.screens[0];
        break;
      }
    }
  }

  if (!screen && (genResult.screen || genResult.name)) {
    screen = genResult.screen || genResult;
  }

  if (!screen) {
    console.log('Querying project for newly created screen...');
    await sleep(5000);
    const proj = await callStitchTool('get_project', { name: `projects/${projectId}` });
    const instances = proj.screenInstances || [];
    if (instances.length > 0) {
      const latest = instances[instances.length - 1];
      screen = await callStitchTool('get_screen', { name: latest.sourceScreen });
    }
  }

  if (!screen) {
    console.error(`Could not locate generated screen for ${name}!`);
    return null;
  }

  console.log(`Found screen: ${screen.id || screen.name}, title: "${screen.title}"`);

  // Download screenshot
  if (screen.screenshot?.name) {
    console.log(`Downloading Screenshot: ${screen.screenshot.name}...`);
    const imgRes = await callStitchTool('download_file', { name: screen.screenshot.name });
    if (imgRes.image) {
      const imgPath = `out/${outputSlug}.png`;
      fs.writeFileSync(path.resolve(imgPath), Buffer.from(imgRes.image, 'base64'));
      console.log(`SUCCESS! Saved screenshot: ${imgPath}`);
    }
  }

  // Download HTML
  if (screen.htmlCode?.name) {
    console.log(`Downloading HTML: ${screen.htmlCode.name}...`);
    const htmlRes = await callStitchTool('download_file', { name: screen.htmlCode.name });
    if (htmlRes.html) {
      const htmlPath = `out/${outputSlug}.html`;
      fs.writeFileSync(path.resolve(htmlPath), htmlRes.html, 'utf8');
      console.log(`SUCCESS! Saved HTML: ${htmlPath}`);
    }
  }

  return screen;
}

async function main() {
  console.log(`Starting Stitch Generation Pipeline for Project: ${projectId}`);
  
  // 1. Generate Option A
  await generateAndDownloadOption(
    'Option A: Linear/Raycast Studio Workbench',
    promptOptionA,
    'stitch_option_a_linear'
  );

  // 2. Generate Option B
  await generateAndDownloadOption(
    'Option B: Creative Agency Editorial (Pitch / Stripe Press)',
    promptOptionB,
    'stitch_option_b_editorial'
  );

  // 3. Generate Option C
  await generateAndDownloadOption(
    'Option C: Minimalist Terminal / Monochrome Precision (Vercel / Cron)',
    promptOptionC,
    'stitch_option_c_terminal'
  );

  console.log('\n======================================================');
  console.log('ALL 3 DESIGNS GENERATED AND DOWNLOADED SUCCESSFULLY!');
  console.log('======================================================');
}

main().catch(console.error);
