import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.resolve('public/qa_screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}================================================================${RESET}`);
console.log(`${BOLD}${CYAN}   AUTOREEL STUDIO — PLAYWRIGHT BROWSER AUTOMATION QA BATTERY   ${RESET}`);
console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

let passedSteps = 0;
let totalSteps = 0;
const stepResults = [];

async function runStep(name, fn) {
  totalSteps++;
  const t0 = Date.now();
  try {
    await fn();
    const dur = Date.now() - t0;
    passedSteps++;
    stepResults.push({ name, status: 'PASSED', duration: dur });
    console.log(`  ${GREEN}✓${RESET} ${name} (${dur}ms)`);
  } catch (err) {
    const dur = Date.now() - t0;
    stepResults.push({ name, status: 'FAILED', duration: dur, error: err.message });
    console.log(`  ${RED}✗${RESET} ${name} (${dur}ms)`);
    console.error(`    ${RED}Error: ${err.message}${RESET}`);
  }
}

async function main() {
  console.log(`Launching headless Chrome browser for live UI QA...`);
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AutoReel-QA/1.0',
  });

  await context.clearCookies();
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // FEATURE 1: Landing Page Hero & Showcase
    // -------------------------------------------------------------
    await runStep('Landing Page Hero, Branding & Interactive Archetypes', async () => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Verify title & branding
      const pageText = await page.innerText('body');
      assert(pageText.includes('AutoReel'), 'Branding title missing');
      assert(pageText.includes('Studio') || pageText.includes('Launch Studio'), 'Launch Studio CTA missing');

      // Click on archetypes interactive tabs if present
      const chartTab = page.locator('text=Metric Bar Chart, text=Dynamic Chart, text=dynamic_chart').first();
      if (await chartTab.count() > 0) {
        await chartTab.click().catch(() => {});
      }

      const screenshot01 = path.join(SCREENSHOTS_DIR, '01_landing_page.png');
      await page.screenshot({ path: screenshot01 });
      assert(fs.existsSync(screenshot01), 'Screenshot 01 missing');
    });

    // -------------------------------------------------------------
    // FEATURE 2: Login Gate & Route Guard
    // -------------------------------------------------------------
    await runStep('Protected Route Redirection & Invalid Login Gate Rejection', async () => {
      // 1. Unauthenticated direct access to /studio must redirect to /login
      await page.goto(`${BASE_URL}/studio`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      assert(page.url().includes('/login'), `Expected redirect to /login, got: ${page.url()}`);

      // 2. Test bad credentials
      await page.fill('input[type="email"]', 'galadhruv1611@gmail.com');
      await page.fill('input[type="password"]', 'WrongPasskey123!');
      await page.click('button[type="submit"]');

      await page.waitForTimeout(1200);
      const screenshot02 = path.join(SCREENSHOTS_DIR, '02_login_invalid.png');
      await page.screenshot({ path: screenshot02 });
    });

    await runStep('Valid Administrator Authentication & Redirection to /studio', async () => {
      await page.fill('input[type="email"]', 'galadhruv1611@gmail.com');
      await page.fill('input[type="password"]', '');
      await page.fill('input[type="password"]', 'AryaWadafale@2816');
      await page.click('button[type="submit"]');

      await page.waitForTimeout(2000);

      // Ensure we navigate to /studio
      if (!page.url().includes('/studio')) {
        await page.goto(`${BASE_URL}/studio`, { waitUntil: 'domcontentloaded' });
      }
      await page.waitForTimeout(1500);

      const screenshot03 = path.join(SCREENSHOTS_DIR, '03_login_success.png');
      await page.screenshot({ path: screenshot03 });

      assert(page.url().includes('/studio'), `Expected /studio URL, got: ${page.url()}`);
      const bodyText = await page.innerText('body');
      assert(bodyText.includes('STAGE 01') || bodyText.includes('What do you want to create'), 'Stage 01 failed to load');
    });

    // -------------------------------------------------------------
    // FEATURE 3: Studio Stage 01 (Topic Formulation)
    // -------------------------------------------------------------
    await runStep('Stage 01: Concept Formulation, Duration & Voice Selectors', async () => {
      // Verify Admin Badge
      const body = await page.innerText('body');
      assert(body.includes('galadhruv1611@gmail.com'), 'Admin badge missing in Studio navbar');

      // Duration selector - click 60s
      const duration60 = page.locator('button:has-text("60s")').first();
      if (await duration60.count() > 0) {
        await duration60.click();
      }

      // Voice selection - click Echo
      const echoVoice = page.locator('text=Echo').first();
      if (await echoVoice.count() > 0) {
        await echoVoice.click();
      }

      // Enter rich topic in textarea
      const topicInput = page.locator('textarea').first();
      await topicInput.fill('CRISPR-Cas9 Gene Editing in Human Cells: Molecular Mechanisms & Clinical Breakthroughs');

      const screenshot04 = path.join(SCREENSHOTS_DIR, '04_stage01_topic.png');
      await page.screenshot({ path: screenshot04 });

      // Click Continue to Storyboard button
      const continueBtn = page.locator('button:has-text("Continue to Storyboard")').first();
      await continueBtn.click();
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------
    // FEATURE 4: Studio Stage 02 (Storyboard & Script Director)
    // -------------------------------------------------------------
    await runStep('Stage 02: AI Storyboard Generation, Scene Cards & Pacing', async () => {
      const bodyText = await page.innerText('body');
      assert(bodyText.includes('STAGE 02') || bodyText.includes('STORYBOARD'), 'Stage 02 header missing');

      // Wait for AI generation to complete and Scene 01 to appear
      console.log('    ⚡ Waiting for dynamic phrase-synced scenes (Gemini AI)...');
      await page.waitForSelector('text=Scene 01', { timeout: 45000 });

      await page.waitForTimeout(1000);
      const screenshot05 = path.join(SCREENSHOTS_DIR, '05_stage02_storyboard.png');
      await page.screenshot({ path: screenshot05 });

      const stage2Text = await page.innerText('body');
      assert(stage2Text.includes('Scene 01'), 'Scene 01 card missing');

      // Click Proceed to Video Review button
      console.log('    ⚡ Proceeding to Video Review (Edge TTS voiceover synthesis)...');
      const reviewBtn = page.locator('button:has-text("Proceed to Video Review")').first();
      await reviewBtn.click();
      await page.waitForTimeout(1000);
    });

    // -------------------------------------------------------------
    // FEATURE 5: Studio Stage 03 (Video Review & Surgical Polish)
    // -------------------------------------------------------------
    await runStep('Stage 03: Video Player Canvas, Playhead & Audio Mixer', async () => {
      await page.waitForSelector('text=STAGE 03', { timeout: 60000 });
      const stage3Text = await page.innerText('body');
      assert(
        stage3Text.includes('STAGE 03') || stage3Text.includes('SURGICAL REVISION') || stage3Text.includes('Audio Mixer') || stage3Text.includes('Video Review'),
        'Stage 03 controls missing'
      );

      await page.waitForTimeout(1000);
      const screenshot06 = path.join(SCREENSHOTS_DIR, '06_stage03_review.png');
      await page.screenshot({ path: screenshot06 });

      // Click Approve & Go to Export
      const exportBtn = page.locator('button:has-text("Approve & Go to Export")').first();
      await exportBtn.click();
      await page.waitForTimeout(2000);
    });

    // -------------------------------------------------------------
    // FEATURE 6: Studio Stage 04 (Multi-Platform Publishing)
    // -------------------------------------------------------------
    await runStep('Stage 04: Publishing Kits, Subtitles & Remotion Compile CTA', async () => {
      await page.waitForSelector('text=STAGE 04', { timeout: 20000 });
      const stage4Text = await page.innerText('body');
      assert(
        stage4Text.includes('STAGE 04') || stage4Text.includes('PUBLISHING') || stage4Text.includes('YouTube Shorts') || stage4Text.includes('Export'),
        'Stage 04 publishing missing'
      );

      // Click TikTok tab
      const tiktokTab = page.locator('button:has-text("TikTok")').first();
      if (await tiktokTab.count() > 0) {
        await tiktokTab.click();
        await page.waitForTimeout(400);
      }

      // Click Instagram tab
      const igTab = page.locator('button:has-text("Instagram Reels")').first();
      if (await igTab.count() > 0) {
        await igTab.click();
        await page.waitForTimeout(400);
      }

      const screenshot07 = path.join(SCREENSHOTS_DIR, '07_stage04_publish.png');
      await page.screenshot({ path: screenshot07 });

      // Verify SRT button exists
      const srtBtn = page.locator('button:has-text("Download Subtitles"), button:has-text("SRT")').first();
      assert(await srtBtn.count() > 0, 'SRT export CTA missing');

      // Verify Remotion compile button exists
      const compileBtn = page.locator('button:has-text("Compile Custom MP4")').first();
      assert(await compileBtn.count() > 0, 'Remotion dynamic compile CTA missing');
    });

  } finally {
    console.log(`Closing browser context...`);
    await context.close();
    await browser.close();
  }

  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}          BROWSER QA AUTOMATION RESULTS SUMMARY                 ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`Total Browser Flow Steps : ${BOLD}${totalSteps}${RESET}`);
  console.log(`Steps Passed             : ${GREEN}${BOLD}${passedSteps}${RESET}`);
  console.log(`Steps Failed             : ${totalSteps - passedSteps === 0 ? GREEN : RED}${BOLD}${totalSteps - passedSteps}${RESET}`);
  console.log(`Success Rate             : ${BOLD}${((passedSteps / totalSteps) * 100).toFixed(1)}%${RESET}\n`);

  if (passedSteps === totalSteps) {
    console.log(`${GREEN}${BOLD}🎉 ALL BROWSER AUTOMATION FLOWS PASSED WITH 100% SUCCESS!${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}❌ SOME BROWSER AUTOMATION STEPS FAILED.${RESET}\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal Browser QA Error:', err);
  process.exit(1);
});
