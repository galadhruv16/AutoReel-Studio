import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log('🧪 Testing Next-Gen Hybrid Motion Engine across 10 Archetypes with Audio Ducking & Procedural SFX...');

const testProps = {
  topic: 'Declassified Architecture: Inside the Zero-Trust Revolution',
  captionStyle: 'kinetic',
  accentColor: '#FF4F00',
  musicUrl: 'audio/music/ambient_tension.wav',
  enableSfx: true,
  enableMusicDucking: true,
  scenes: [
    {
      id: 'sc_1',
      index: 1,
      startTime: 0,
      endTime: 2,
      duration: 2,
      narration: 'Every corporate firewall you trusted was an elaborate illusion.',
      visualDirection: 'Cinematic Hook with Sub-bass drop and zoom punch',
      visualType: 'kinetic_text',
      sfxCue: 'bass_drop',
      highlightWords: ['corporate', 'illusion'],
    },
    {
      id: 'sc_2',
      index: 2,
      startTime: 2,
      endTime: 4,
      duration: 2,
      narration: 'Declassified memos from 1994 reveal the origin of perimeter defense.',
      visualDirection: 'Investigative Dossier with yellow highlighter ink reveal',
      visualType: 'investigative_dossier',
      sfxCue: 'whoosh',
      cue: 'perimeter defense',
      cueFrame: 12,
      graphicData: {
        badge: 'INTERNAL MEMO // 1994',
        headline: 'OPERATION SHADOW WALL',
        subtext: 'The entire perimeter was compromised before implementation.',
        keyTags: ['DARPA', 'FIREWALL', 'PROTOCOL'],
      },
    },
    {
      id: 'sc_3',
      index: 3,
      startTime: 4,
      endTime: 6,
      duration: 2,
      narration: 'Modern zero-trust replaces blind faith with cryptographic validation.',
      visualDirection: 'Code and Terminal explainer with live keystrokes',
      visualType: 'code_terminal',
      sfxCue: 'typewriter',
      cue: 'cryptographic validation',
      cueFrame: 10,
      graphicData: {
        badge: 'policy_enforcer.ts',
        headline: 'MUTUAL TLS HANDSHAKE',
        subtext: 'Rejecting unauthenticated packet ingress',
        statNumber: '0.4ms',
        statLabel: 'Enforcement Latency',
      },
    },
    {
      id: 'sc_4',
      index: 4,
      startTime: 6,
      endTime: 8,
      duration: 2,
      narration: 'Traditional VPNs vs dynamic micro-segmented access tokens.',
      visualDirection: 'Split comparison with center laser divide',
      visualType: 'split_comparison',
      sfxCue: 'none',
      highlightWords: ['VPNs', 'tokens'],
    },
    {
      id: 'sc_5',
      index: 5,
      startTime: 8,
      endTime: 10,
      duration: 2,
      narration: 'Security breaches collapsed by ninety-four percent worldwide.',
      visualDirection: 'Dynamic Metric Chart with tactile pop audio chime',
      visualType: 'dynamic_chart',
      sfxCue: 'pop',
      cue: 'ninety-four percent',
      cueFrame: 8,
      graphicData: {
        badge: 'GLOBAL BENCHMARK',
        headline: 'INCIDENT REDUCTION',
        statNumber: '94%',
        statLabel: 'Breach Reduction',
      },
    },
  ],
};

const outDir = path.resolve('out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const propsFile = path.join(outDir, 'nextgen_archetypes_props.json');
fs.writeFileSync(propsFile, JSON.stringify(testProps, null, 2), 'utf-8');

const outputFile = path.join(outDir, 'test_nextgen_hybrid_reel.mp4');

console.log('Rendering 10-second Next-Gen Reel (300 frames @ 30 FPS)...');
try {
  const cmd = `npx remotion render src/remotion/index.ts DynamicStoryReel "${outputFile}" --props="${propsFile}" --frames=0-300 --concurrency=4`;
  console.log(`Executing: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
  console.log('✅ Render succeeded! Output verified at:', outputFile);
  const stats = fs.statSync(outputFile);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
} catch (err) {
  console.error('❌ Render failed:', err);
  process.exit(1);
}
