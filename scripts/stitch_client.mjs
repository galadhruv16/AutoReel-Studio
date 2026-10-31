import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve('.env'), 'utf8');
let apiKey = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('STITCH_API_KEY=')) {
    apiKey = line.split('=')[1].trim();
  }
}

if (!apiKey) {
  throw new Error('STITCH_API_KEY is missing from .env');
}

export async function stitchRpc(method, params = {}) {
  const res = await fetch('https://stitch.googleapis.com/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Stitch RPC Error (${data.error.code}): ${data.error.message}`);
  }
  return data.result;
}

export async function callStitchTool(name, args = {}) {
  const result = await stitchRpc('tools/call', {
    name,
    arguments: args,
  });

  const content = result?.content?.[0]?.text;
  if (content) {
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }
  return result;
}
