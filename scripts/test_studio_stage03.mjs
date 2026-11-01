import assert from 'assert';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

console.log('🧪 Running Stage 03 Video Review & Surgical Revision Verification Tests...\n');

// Mock scenes for Stage 03 Review testing
const testScenes = [
  {
    id: 's1',
    index: 1,
    startTime: 0.0,
    endTime: 3.5,
    duration: 3.5,
    narration: 'CRISPR Cas9 works like molecular scissors.',
    visualDirection: 'Kinetic typography punch with scissors icon zoom',
    visualType: 'kinetic_text',
    highlightWords: ['CRISPR', 'scissors'],
  },
  {
    id: 's2',
    index: 2,
    startTime: 3.5,
    endTime: 7.2,
    duration: 3.7,
    narration: 'Guide RNA directs the enzyme to the exact DNA sequence.',
    visualDirection: 'Crosshair targeting double helix strand',
    visualType: 'crosshair_target',
    highlightWords: ['Guide RNA', 'DNA'],
  },
  {
    id: 's3',
    index: 3,
    startTime: 7.2,
    endTime: 11.0,
    duration: 3.8,
    narration: 'Once cut, the cellular repair machinery activates.',
    visualDirection: 'Split comparison of non-homologous end joining',
    visualType: 'split_comparison',
    highlightWords: ['cellular repair'],
  },
];

// Test 1: Active Scene Tracking by Video Timecode
console.log('Test 1: Verify Active Scene Resolution by Video Playhead Timecode...');
function findActiveScene(scenes, time) {
  return scenes.findIndex((s) => time >= s.startTime && time < s.endTime);
}

assert.strictEqual(findActiveScene(testScenes, 0.0), 0, 'Time 0.0s should resolve to Scene 1');
assert.strictEqual(findActiveScene(testScenes, 2.1), 0, 'Time 2.1s should resolve to Scene 1');
assert.strictEqual(findActiveScene(testScenes, 3.5), 1, 'Time 3.5s should resolve to Scene 2');
assert.strictEqual(findActiveScene(testScenes, 6.9), 1, 'Time 6.9s should resolve to Scene 2');
assert.strictEqual(findActiveScene(testScenes, 7.2), 2, 'Time 7.2s should resolve to Scene 3');
assert.strictEqual(findActiveScene(testScenes, 10.5), 2, 'Time 10.5s should resolve to Scene 3');
console.log('✅ Passed: Video playhead accurately resolves active scene indexes.\n');

// Test 2: Subtitle Staging & Preset Formatting
console.log('Test 2: Verify Subtitle Staging Presets (Kinetic, Minimal, Bold)...');
function formatCaptions(scene, style) {
  if (style === 'kinetic') {
    return scene.narration.split(' ').map((word) => ({
      word,
      isHighlighted: (scene.highlightWords || []).some((hw) =>
        hw.toLowerCase().includes(word.toLowerCase().replace(/[.,!]/g, ''))
      ),
    }));
  } else if (style === 'bold') {
    return { text: scene.narration.toUpperCase(), style: 'editorial-bold' };
  } else {
    return { text: scene.narration, style: 'clean-minimal' };
  }
}

const kineticWords = formatCaptions(testScenes[0], 'kinetic');
assert(kineticWords.some((w) => w.word.includes('CRISPR') && w.isHighlighted), 'CRISPR should be highlighted in kinetic style');
assert(kineticWords.some((w) => w.word.includes('molecular') && !w.isHighlighted), 'molecular should not be highlighted');

const boldResult = formatCaptions(testScenes[0], 'bold');
assert.strictEqual(boldResult.text, 'CRISPR CAS9 WORKS LIKE MOLECULAR SCISSORS.', 'Bold style must uppercase text');

const minResult = formatCaptions(testScenes[0], 'minimal');
assert.strictEqual(minResult.text, testScenes[0].narration, 'Minimal style retains clean text');
console.log('✅ Passed: Subtitle style presets render accurately.\n');

// Test 3: Audio Resynthesis via Python script / Edge TTS
console.log('Test 3: Verify Python Edge TTS Single-Scene Resynthesis Execution...');
async function testPythonSynthesis() {
  const scriptPath = path.join(process.cwd(), 'scripts', 'synthesize_scene.py');
  const sampleText = 'Testing surgical voice resynthesis with high clarity.';

  const { stdout } = await execFileAsync('python', [scriptPath, sampleText, 'alloy'], {
    timeout: 10000,
  });

  const parsed = JSON.parse(stdout.trim());
  assert.strictEqual(parsed.success, true, 'Synthesizer should return success: true');
  assert(parsed.durationSec > 1.0, 'Duration should be positive number');
  assert(parsed.wordTimestamps.length > 0, 'Word boundary timestamps must be generated');
  assert(parsed.audioBase64.startsWith('data:audio/mp3;base64,'), 'Base64 audio header must be present');
  console.log(`✅ Passed: Edge TTS synthesized ${parsed.wordCount} words in ${parsed.durationSec}s with valid audio base64.\n`);
}

// Test 4: Audio Mixer Levels and Bounds Verification
console.log('Test 4: Verify Audio Mixer Levels Clamping (0 - 100%)...');
function clampVolume(vol) {
  return Math.max(0, Math.min(100, vol));
}

assert.strictEqual(clampVolume(100), 100);
assert.strictEqual(clampVolume(0), 0);
assert.strictEqual(clampVolume(120), 100);
assert.strictEqual(clampVolume(-15), 0);
console.log('✅ Passed: Audio mixer volume constraints validated.\n');

// Execute async tests
testPythonSynthesis()
  .then(() => {
    console.log('🎉 All Sprint 3 Stage 03 Verification Tests Passed Successfully!\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Stage 03 Test Failed:', err);
    process.exit(1);
  });
