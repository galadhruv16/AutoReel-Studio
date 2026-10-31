import fs from 'fs';
import path from 'path';
import { callStitchTool } from './stitch_client.mjs';

const projectId = '1801554914878734954';

const promptDesign1 = `
High-converting SaaS landing page for "AutoReel Studio" — an AI-powered short-form motion video SaaS creating 9:16 vertical explainer reels for Instagram, TikTok, and YouTube Shorts.

Aesthetic Direction: "Cinematic Vox / Dark Cyber".
- Color Palette: Deep Void background (#05070D), glowing Electric Cyan (#00F0FF) accents, Cyber Violet (#8B5CF6) gradients, and subtle Warm Amber highlights.
- Header: Logo "AutoReel Studio" with a glowing aperture icon, nav links (Features, Motion Patterns, Showcase, Pricing, Docs), and "Launch Studio" gradient button.
- Hero Section:
  - Badge: "Built for Technical Founders & Content Creators" with glowing pulse dot.
  - Headline: "Turn Complex Ideas into High-Retention Explainer Reels in 60 Seconds"
  - Subtitle: "The first AI video engine pairing Vox-style 3D isometric vector motion with millisecond voiceover sync. Zero After Effects. Zero stock video fluff."
  - Action buttons: "Start Creating Free (No Credit Card)" and "Watch 30s Interactive Demo".
- Core Showcase:
  - 3 vertical phone mockup screens (9:16 aspect ratio) displayed side-by-side on an angled perspective stage:
    1. Left Phone: "How Stripe Scales to 10k TPS" (Architecture diagram reel with data packets).
    2. Center Phone (Primary Focus): "The Kubernetes Container Lie" (Spatial isometric Pod & Container hologram, laser orbits, and frosted glass kinetic subtitles).
    3. Right Phone: "Zero-Knowledge Proofs Explained" (Cryptographic visual math reel).
  - Floating badge pills around phones: "1080x1920 30fps", "Millisecond Word Sync", "100% Free Local Render".
- Features Section:
  - 4 cards with glowing gradient borders:
    1. "Spatial 3D Vector Motion" — Dynamic isometric geometry, self-drawing lasers, zero boring dashboard cards.
    2. "AI Storyboard Co-Pilot" — Powered by Gemini Interactions API for multi-turn conversational script editing.
    3. "Millisecond Kinetic Captions" — Submagic / Vox-style frosted glass karaoke subtitles with zero layout shifting.
    4. "1-Click Social Scheduler" — Direct dispatch to Instagram Reels & TikTok with duplicate post protection.
- Social Proof & Metrics: "14.1s Render Time", "$0 Local Dev Cost", "8 Parameterized Motion Patterns".
- Call to Action Banner at bottom: "Ready to stop making boring videos? Launch AutoReel Studio today."
`;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadScreenFiles(screenName, outputBase) {
  console.log(`Fetching screen details for ${screenName}...`);
  const screen = await callStitchTool('get_screen', { name: screenName });
  console.log('Screen title:', screen.title);

  // Download HTML if available
  if (screen.htmlCode?.name) {
    console.log(`Downloading HTML code: ${screen.htmlCode.name}...`);
    const fileRes = await callStitchTool('download_file', { name: screen.htmlCode.name });
    if (fileRes.html) {
      const htmlPath = `${outputBase}.html`;
      fs.writeFileSync(path.resolve(htmlPath), fileRes.html, 'utf8');
      console.log(`Saved HTML: ${htmlPath}`);
    }
  }

  // Download Screenshot if available
  if (screen.screenshot?.name) {
    console.log(`Downloading Screenshot image: ${screen.screenshot.name}...`);
    const imgRes = await callStitchTool('download_file', { name: screen.screenshot.name });
    if (imgRes.image) {
      const imgPath = `${outputBase}.png`;
      const buf = Buffer.from(imgRes.image, 'base64');
      fs.writeFileSync(path.resolve(imgPath), buf);
      console.log(`Saved Screenshot: ${imgPath}`);
    }
  }
}

async function main() {
  console.log(`Triggering generation on Stitch for Project: ${projectId}...`);
  console.log('Generating Design 1: Cinematic Vox / Dark Cyber...');

  const genResult = await callStitchTool('generate_screen_from_text', {
    projectId,
    prompt: promptDesign1.trim(),
    deviceType: 'DESKTOP',
    modelId: 'GEMINI_3_8_FLASH',
  });

  console.log('Generation result:', JSON.stringify(genResult, null, 2));

  // Extract screen name
  let screenName = genResult.screen?.name || genResult.name;
  if (!screenName && genResult.outputComponents) {
    console.log('Output components:', genResult.outputComponents);
  }

  // If not immediately present, inspect project screens
  if (!screenName) {
    console.log('Querying project for newly created screen...');
    await sleep(5000);
    const proj = await callStitchTool('get_project', { name: `projects/${projectId}` });
    const instances = proj.screenInstances || [];
    console.log(`Found ${instances.length} screens in project.`);
    if (instances.length > 0) {
      screenName = instances[instances.length - 1].sourceScreen;
    }
  }

  if (screenName) {
    // Poll get_screen until files are ready
    for (let attempt = 1; attempt <= 10; attempt++) {
      console.log(`Checking screen status (attempt ${attempt}/10)...`);
      const screenObj = await callStitchTool('get_screen', { name: screenName });
      if (screenObj.htmlCode || screenObj.screenshot) {
        console.log('Files are available!');
        await downloadScreenFiles(screenName, 'out/stitch_design_1_vox');
        break;
      }
      console.log('Waiting 15 seconds for Stitch rendering...');
      await sleep(15000);
    }
  }

  console.log('Design 1 process complete!');
}

main().catch(console.error);
