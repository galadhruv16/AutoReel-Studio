import { spawn } from 'child_process';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9222;
const USER_DATA = path.resolve('out/browser_test_profile');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBrowserVerification() {
  console.log('[1/4] Launching Headless Chrome on port 9222...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--remote-debugging-address=127.0.0.1',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${USER_DATA}`,
    'about:blank'
  ], { stdio: 'ignore' });

  await sleep(2500);

  try {
    console.log('[2/4] Connecting to Chrome DevTools Protocol...');
    const verRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
    const targets = await verRes.json();
    const wsUrl = targets[0]?.webSocketDebuggerUrl;

    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pending = new Map();
    const errors = [];
    const logs = [];

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise((resolve) => {
      ws.onopen = resolve;
    });

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg.result);
        pending.delete(msg.id);
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        const args = msg.params.args.map((a) => a.value || a.description || '').join(' ');
        logs.push(`[Console ${msg.params.type}] ${args}`);
        if (msg.params.type === 'error') {
          errors.push(`Console error: ${args}`);
        }
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text;
        errors.push(`Uncaught Exception: ${desc}`);
      }
    };

    await send('Page.enable');
    await send('Runtime.enable');

    console.log('[3/4] Navigating to http://localhost:3000/login ...');
    await send('Page.navigate', { url: 'http://localhost:3000/login' });
    await sleep(3500);

    console.log('[4/4] Logging in and navigating to /studio ...');
    // Evaluate login credentials in the page
    await send('Runtime.evaluate', {
      expression: `
        (async () => {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'demo@autoreel.studio', password: 'demo' })
          });
          if (res.ok) {
            window.location.href = '/studio';
          }
        })()
      `,
      awaitPromise: true
    });

    await sleep(4000);

    console.log('\n--- BROWSER CONSOLE LOGS ---');
    logs.forEach((l) => console.log(l));

    console.log('\n--- ERROR AUDIT ---');
    if (errors.length === 0) {
      console.log('SUCCESS: Zero uncaught exceptions, zero console errors, zero Remotion mismatches!');
    } else {
      console.error(`FAILED: Found ${errors.length} errors:`);
      errors.forEach((e) => console.error('  - ' + e));
      process.exit(1);
    }
  } finally {
    chromeProcess.kill();
  }
}

runBrowserVerification().catch((e) => {
  console.error('Test runner failure:', e);
  process.exit(1);
});
