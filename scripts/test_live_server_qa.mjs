import { spawn } from 'child_process';
import assert from 'assert';

const PORT = 3088;
const BASE_URL = `http://localhost:${PORT}`;

const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

console.log(`${BOLD}${CYAN}================================================================${RESET}`);
console.log(`${BOLD}${CYAN}   AUTOREEL STUDIO — LIVE HTTP SERVER QA INTEGRATION SUITE      ${RESET}`);
console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return true;
    } catch {
      // not ready yet
    }
    await wait(500);
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`);
}

let passed = 0;
let total = 0;

async function runTest(name, fn) {
  total++;
  const t0 = Date.now();
  try {
    await fn();
    const dur = Date.now() - t0;
    passed++;
    console.log(`  ${GREEN}✓${RESET} ${name} (${dur}ms)`);
  } catch (err) {
    const dur = Date.now() - t0;
    console.log(`  ${RED}✗${RESET} ${name} (${dur}ms)`);
    console.error(`    ${RED}Error: ${err.message}${RESET}`);
  }
}

async function main() {
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    shell: true,
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => {
    // silence verbose server output or log if needed
  });
  server.stderr.on('data', (d) => {
    // console.error(`[Server Error]: ${d}`);
  });

  try {
    console.log('Waiting for HTTP listener...');
    await waitForServer(`${BASE_URL}/login`, 20000);
    console.log(`${GREEN}Server is live at ${BASE_URL}!${RESET}\n`);

    // TEST 1: Landing Page
    await runTest('GET / (Landing Page) returns 200 OK', async () => {
      const res = await fetch(`${BASE_URL}/`);
      assert.strictEqual(res.status, 200);
      const text = await res.text();
      assert(text.includes('AutoReel') || text.includes('studio') || text.includes('Studio'), 'Landing page content missing brand');
    });

    // TEST 2: Login Page
    await runTest('GET /login returns 200 OK', async () => {
      const res = await fetch(`${BASE_URL}/login`);
      assert.strictEqual(res.status, 200);
      const text = await res.text();
      assert(
        text.includes('Authentication') || text.includes('AutoReel') || text.includes('login'),
        'Login page structure missing'
      );
    });

    // TEST 3: Unauthenticated Access to Protected /studio Route
    await runTest('GET /studio without auth redirects to /login?redirect=%2Fstudio (HTTP 307)', async () => {
      const res = await fetch(`${BASE_URL}/studio`, { redirect: 'manual' });
      assert.strictEqual(res.status, 307);
      const location = res.headers.get('location') || '';
      assert(location.includes('/login'), `Expected redirect to /login, got: ${location}`);
    });

    // TEST 4: Unauthenticated Access to Studio API
    await runTest('POST /api/studio/generate-storyboard without auth returns 401 Unauthorized', async () => {
      const res = await fetch(`${BASE_URL}/api/studio/generate-storyboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: 'Quantum Computing' }),
      });
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert(json.error.includes('Unauthorized'), `Unexpected error message: ${json.error}`);
    });

    // TEST 5: Login with Invalid Credentials
    await runTest('POST /api/auth/login with invalid credentials returns 401 Access Denied', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'galadhruv1611@gmail.com', password: 'WrongPassword123!' }),
      });
      assert.strictEqual(res.status, 401);
      const json = await res.json();
      assert.strictEqual(json.success, false);
      assert(json.error.includes('Access denied'), `Expected Access denied, got: ${json.error}`);
    });

    // TEST 6: Login with Valid Admin Credentials
    let sessionCookie = '';
    await runTest('POST /api/auth/login with valid credentials returns 200 & Sets Session Cookie', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'galadhruv1611@gmail.com', password: 'AryaWadafale@2816' }),
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.email, 'galadhruv1611@gmail.com');

      const rawCookie = res.headers.get('set-cookie');
      assert(rawCookie && rawCookie.includes('autoreel_session='), 'Set-Cookie header missing autoreel_session');
      sessionCookie = rawCookie.split(';')[0];
    });

    // TEST 7: GET /api/auth/me with Authenticated Session Cookie
    await runTest('GET /api/auth/me with session cookie returns 200 & authenticated user', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Cookie: sessionCookie },
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.authenticated, true);
      assert.strictEqual(json.email, 'galadhruv1611@gmail.com');
    });

    // TEST 8: GET /studio with Authenticated Session Cookie
    await runTest('GET /studio with session cookie returns 200 OK (Access Granted)', async () => {
      const res = await fetch(`${BASE_URL}/studio`, {
        headers: { Cookie: sessionCookie },
      });
      assert.strictEqual(res.status, 200);
    });

    // TEST 9: POST /api/studio/generate-storyboard with Authenticated Session Cookie
    let generatedScenes = [];
    await runTest('POST /api/studio/generate-storyboard returns time-synced scenes across archetypes', async () => {
      const res = await fetch(`${BASE_URL}/api/studio/generate-storyboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          topic: 'CRISPR Cas9 Genomic Scissors',
          duration: 30,
          tone: 'engaging',
          voice: 'alloy',
        }),
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert(json.data.scenes && json.data.scenes.length >= 3, 'Must return at least 3 scenes');
      generatedScenes = json.data.scenes;
      assert.strictEqual(generatedScenes[0].startTime, 0.0);
    });

    // TEST 10: POST /api/studio/export-srt with Authenticated Session Cookie
    await runTest('POST /api/studio/export-srt generates SubRip formatted SRT file', async () => {
      const res = await fetch(`${BASE_URL}/api/studio/export-srt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          scenes: generatedScenes,
          filename: 'test_subtitles.srt',
        }),
      });
      assert.strictEqual(res.status, 200);
      const contentType = res.headers.get('content-type') || '';
      assert(contentType.includes('text/plain'), `Expected text/plain, got: ${contentType}`);
      const srtText = await res.text();
      assert(srtText.includes('00:00:00,000 -->'), 'SRT timestamp marker missing');
      assert(srtText.includes('1\n'), 'SRT index 1 missing');
    });

    // TEST 11: POST /api/studio/generate-publishing with Authenticated Session Cookie
    await runTest('POST /api/studio/generate-publishing generates multi-platform kit', async () => {
      const res = await fetch(`${BASE_URL}/api/studio/generate-publishing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          topic: 'CRISPR Cas9 Genomic Scissors',
          scenes: generatedScenes,
          duration: 30,
        }),
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert(json.data.youtube && json.data.youtube.title, 'YouTube kit missing');
      assert(json.data.tiktok && json.data.tiktok.title, 'TikTok kit missing');
      assert(json.data.instagram && json.data.instagram.title, 'Instagram kit missing');
      assert(json.data.linkedin && json.data.linkedin.title, 'LinkedIn kit missing');
    });

    // TEST 12: POST /api/studio/synthesize-scene with Authenticated Session Cookie
    await runTest('POST /api/studio/synthesize-scene executes Neural TTS synthesis', async () => {
      const res = await fetch(`${BASE_URL}/api/studio/synthesize-scene`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          text: 'DNA sequence analysis confirms high precision cutting.',
          voice: 'alloy',
          sceneIndex: 1,
        }),
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert(json.data.wordTimestamps && json.data.wordTimestamps.length > 0, 'Word timestamps missing');
      assert(json.data.audioUrl && json.data.audioUrl.length > 100, 'Audio URL/data URI missing');
    });

    // TEST 13: POST /api/studio/render-reel with Authenticated Session Cookie
    await runTest('POST /api/studio/render-reel compiles reel telemetry and returns video payload', async () => {
      const res = await fetch(`${BASE_URL}/api/studio/render-reel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: sessionCookie,
        },
        body: JSON.stringify({
          topic: 'CRISPR Cas9 Genomic Scissors',
          voice: 'alloy',
          captionStyle: 'kinetic',
          accentColor: '#FF4F00',
          scenes: generatedScenes,
          renderDynamic: false,
        }),
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert(json.data.videoUrl && json.data.videoUrl.endsWith('.mp4'), 'Video MP4 missing');
      assert(json.data.telemetry && json.data.telemetry.length === 5, 'Telemetry logs missing');
    });

    // TEST 14: Logout
    await runTest('POST /api/auth/logout clears session', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Cookie: sessionCookie },
      });
      assert.strictEqual(res.status, 200);
      const rawCookie = res.headers.get('set-cookie') || '';
      assert(rawCookie.includes('autoreel_session=;') || rawCookie.includes('Max-Age=0') || rawCookie.includes('expires='), 'Logout must expire cookie');
    });

  } finally {
    console.log('\nShutting down Next.js test server...');
    server.kill();
  }

  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}             LIVE SERVER QA RESULTS SUMMARY                     ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`Total HTTP Tests Executed : ${BOLD}${total}${RESET}`);
  console.log(`Tests Passed              : ${GREEN}${BOLD}${passed}${RESET}`);
  console.log(`Tests Failed              : ${total - passed === 0 ? GREEN : RED}${BOLD}${total - passed}${RESET}`);
  console.log(`Success Rate              : ${BOLD}${((passed / total) * 100).toFixed(1)}%${RESET}\n`);

  if (passed === total) {
    console.log(`${GREEN}${BOLD}🎉 ALL LIVE HTTP ENDPOINTS PASSED WITH 100% SUCCESS!${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}❌ SOME LIVE HTTP TESTS FAILED.${RESET}\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
