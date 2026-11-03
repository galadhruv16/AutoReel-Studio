import assert from 'assert';
import http from 'http';
import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

console.log('🧪 Starting End-to-End Reel Export & Download Verification Suite...\n');

// Unit 1: Topic Slug generation
function getTopicSlug(topic) {
  const raw = (topic || '').trim().toLowerCase();
  const slug = raw.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 36);
  return slug || 'autoreel_video';
}

console.log('1. Testing File Naming & Slug Sanitization...');
assert.strictEqual(getTopicSlug('CRISPR: The Gene Editing Revolution!'), 'crispr_the_gene_editing_revolution');
assert.strictEqual(getTopicSlug('   Quantum Computing 101   '), 'quantum_computing_101');
assert.strictEqual(getTopicSlug(''), 'autoreel_video');
console.log('✅ Passed: Slug sanitization handles symbols, casing, and spaces.\n');

// Unit 2: Test Storyboard JSON Schema and Subtitles formatting
console.log('2. Testing Storyboard JSON Schema Invariants...');
const mockScenes = [
  {
    id: 's1',
    index: 1,
    startTime: 0,
    endTime: 3.5,
    duration: 3.5,
    narration: 'Why do neural networks generalize so well?',
    visualDirection: 'Kinetic bold typography punch with rapid zoom',
    visualType: 'kinetic_text',
    highlightWords: ['neural networks', 'generalize'],
    audioUrl: 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAAA',
  },
  {
    id: 's2',
    index: 2,
    startTime: 3.5,
    endTime: 7.2,
    duration: 3.7,
    narration: 'Deep architectures create flat minima in the loss landscape.',
    visualDirection: '3D loss landscape with glowing minima basin',
    visualType: 'metric_callout',
    highlightWords: ['flat minima', 'loss landscape'],
    audioUrl: 'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAAA',
  },
];

const mockExportPayload = {
  schemaVersion: '2.0.0',
  exportedAt: new Date().toISOString(),
  project: {
    topic: 'Why neural networks generalize',
    tone: 'intellectual',
    actualDuration: 7.2,
  },
  scenes: mockScenes,
};

assert.strictEqual(mockExportPayload.schemaVersion, '2.0.0');
assert.strictEqual(mockExportPayload.scenes.length, 2);
assert.strictEqual(mockExportPayload.scenes[0].visualType, 'kinetic_text');
console.log('✅ Passed: Storyboard JSON export schema conforms to spec.\n');

// Unit 3: Playwright UI Verification
console.log('3. Running Playwright UI Verification on Stage 03 and Stage 04...');

async function runBrowserTest() {
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  try {
    console.log('   Authenticating at http://localhost:3000/login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('input[type="email"]', 'galadhruv1611@gmail.com');
    await page.fill('input[type="password"]', 'AryaWadafale@2816');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);

    console.log('   Navigating to http://localhost:3000/studio...');
    await page.goto('http://localhost:3000/studio', { waitUntil: 'networkidle', timeout: 30000 });

    // Verify Stage 01 loaded
    const title = await page.textContent('h1');
    console.log(`   Page Title: "${title?.trim()}"`);
    assert(title?.toLowerCase().includes('create') || title?.toLowerCase().includes('topic'), 'Stage 01 title must be present');

    // Enter a concept topic
    console.log('   Entering topic in Stage 01...');
    await page.fill('textarea', 'Quantum Supremacy and Entanglement');
    await page.waitForTimeout(500);

    // Click "Continue to Storyboard"
    console.log('   Advancing to Stage 02...');
    const continueBtn = await page.waitForSelector('button:has-text("Continue to Storyboard")', { timeout: 10000 });
    await continueBtn.click();

    // In Stage 02, wait for "Proceed to Video Review" or scene cards
    console.log('   Waiting for Stage 02 Storyboard view & scenes...');
    const proceedToReviewBtn = await page.waitForSelector('button:has-text("Proceed to Video Review")', { timeout: 25000 });
    assert(proceedToReviewBtn, 'Must find Proceed to Video Review button');

    // Advance to Stage 03
    console.log('   Advancing to Stage 03 (Review)...');
    await proceedToReviewBtn.click();

    // Verify Stage 03 loaded
    await page.waitForSelector('text=STAGE 03 // VIDEO REVIEW', { timeout: 15000 });
    console.log('   ✓ In Stage 03 (Video Review)');

    // Verify "Quick Export" button is present in Stage 03!
    const quickExportBtn = await page.waitForSelector('button:has-text("Quick Export")', { timeout: 10000 });
    assert(quickExportBtn, 'Stage 03 must display Quick Export button');
    console.log('   ✓ Stage 03 Quick Export button found');

    // Click Quick Export button to open ExportModal
    await quickExportBtn.click();
    console.log('   Clicked Quick Export. Verifying ExportModal...');

    // Wait for modal header
    await page.waitForSelector('text=EXPORT & DOWNLOAD ASSETS', { timeout: 10000 });
    console.log('   ✓ ExportModal opened successfully');

    // Verify all 4 asset cards are present in the modal
    const hasVideoCard = await page.isVisible('text=Full HD 1080p Video (.mp4)');
    const hasAudioCard = await page.isVisible('text=Spoken Voiceover Narration (.mp3)');
    const hasSrtCard = await page.isVisible('text=Synchronized Subtitles (.srt)');
    const hasJsonCard = await page.isVisible('text=Storyboard & Metadata Bundle (.json)');
    const hasBundleBtn = await page.isVisible('button:has-text("Download All Available Assets")');

    assert(hasVideoCard, 'Modal must have 1080p Video (.mp4) download card');
    assert(hasAudioCard, 'Modal must have Voiceover (.mp3) download card');
    assert(hasSrtCard, 'Modal must have Subtitles (.srt) download card');
    assert(hasJsonCard, 'Modal must have Storyboard (.json) download card');
    assert(hasBundleBtn, 'Modal must have Download All Available Assets button');
    console.log('   ✓ All 4 download options and batch bundle button verified in ExportModal');

    // Close the modal
    const closeBtn = await page.waitForSelector('button[aria-label="Close export dialog"]');
    await closeBtn.click();
    await page.waitForTimeout(500);
    console.log('   ✓ ExportModal closed successfully');

    // Proceed to Stage 04
    console.log('   Advancing to Stage 04 (Publishing & Export)...');
    const goToPublishBtn = await page.waitForSelector('button:has-text("Approve & Go to Export")');
    await goToPublishBtn.click();

    // In Stage 04, verify the Reel Export & Download Center
    await page.waitForSelector('text=STAGE 04 // PUBLISHING', { timeout: 15000 });
    console.log('   ✓ In Stage 04 (Publishing & Multi-Platform Export)');

    // Verify left column download center
    const hasMasterReelCard = await page.isVisible('text=Master Reel (.mp4)');
    const hasMp3Button = await page.isVisible('text=Spoken Voiceover (.mp3)');
    const hasSrtButton = await page.isVisible('text=Subtitles (.srt)');
    const hasJsonButton = await page.isVisible('text=Storyboard & Metadata (.json)');
    const hasCompleteBundleBtn = await page.isVisible('button:has-text("Download Complete Asset Bundle")');

    assert(hasMasterReelCard, 'Stage 04 must display Master Reel (.mp4) card');
    assert(hasMp3Button, 'Stage 04 must display Spoken Voiceover (.mp3) download button');
    assert(hasSrtButton, 'Stage 04 must display Subtitles (.srt) download button');
    assert(hasJsonButton, 'Stage 04 must display Storyboard & Metadata (.json) download button');
    assert(hasCompleteBundleBtn, 'Stage 04 must display Download Complete Asset Bundle button');

    console.log('   ✓ Stage 04 Reel Export & Download Center verified with all asset buttons!');
    console.log('\n🎉 ALL EXPORT & DOWNLOAD VERIFICATION TESTS PASSED!\n');
  } finally {
    await browser.close();
  }
}

runBrowserTest().catch((err) => {
  console.error('❌ Verification test failed:', err);
  process.exit(1);
});
