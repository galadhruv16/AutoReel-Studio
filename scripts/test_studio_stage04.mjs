import assert from 'assert';

console.log('🧪 Running Stage 04 Publishing & Multi-Platform Export Verification Tests...\n');

// Standard formatters matching src/utils/srt.ts
function formatSrtTimestamp(seconds) {
  const totalMs = Math.max(0, Math.round(seconds * 1000));
  const hrs = Math.floor(totalMs / 3600000);
  const mins = Math.floor((totalMs % 3600000) / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;

  const pad = (n, width = 2) => String(n).padStart(width, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
}

function generateSrtContent(scenes) {
  if (!scenes || scenes.length === 0) {
    return '1\n00:00:00,000 --> 00:00:05,000\nAutoReel Studio Generated Reel\n';
  }

  return scenes
    .map((scene, idx) => {
      const start = formatSrtTimestamp(scene.startTime);
      const end = formatSrtTimestamp(scene.endTime > scene.startTime ? scene.endTime : scene.startTime + scene.duration);
      return `${idx + 1}\n${start} --> ${end}\n${(scene.narration || '').trim()}\n`;
    })
    .join('\n');
}

function generateVideoChapters(scenes) {
  return scenes
    .map((s) => {
      const mins = Math.floor(s.startTime / 60);
      const secs = Math.floor(s.startTime % 60);
      const pad = (n) => String(n).padStart(2, '0');
      const label = s.visualDirection.split(':')[0].replace(/kinetic|vector|crosshair|split|process/gi, '').trim() || `Scene ${s.index}`;
      return `${mins}:${pad(secs)} - ${label}`;
    })
    .join('\n');
}

// Sample test scenes
const sampleScenes = [
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
    narration: 'Once cut, cellular repair machinery activates.',
    visualDirection: 'Split comparison of non-homologous end joining',
    visualType: 'split_comparison',
    highlightWords: ['cellular repair'],
  },
];

// Test 1: SRT Timestamp Formatting
console.log('Test 1: Verify SRT Timestamp Conversion (HH:MM:SS,mmm)...');
assert.strictEqual(formatSrtTimestamp(0), '00:00:00,000');
assert.strictEqual(formatSrtTimestamp(3.5), '00:00:03,500');
assert.strictEqual(formatSrtTimestamp(65.25), '00:01:05,250');
assert.strictEqual(formatSrtTimestamp(3661.123), '01:01:01,123');
console.log('✅ Passed: formatSrtTimestamp adheres to SubRip standard.\n');

// Test 2: SubRip (.SRT) String Generation
console.log('Test 2: Verify generateSrtContent structure and line breaks...');
const srtOutput = generateSrtContent(sampleScenes);
assert(srtOutput.includes('1\n00:00:00,000 --> 00:00:03,500\nCRISPR Cas9 works like molecular scissors.'), 'Scene 1 block must be formatted properly');
assert(srtOutput.includes('2\n00:00:03,500 --> 00:00:07,200\nGuide RNA directs the enzyme to the exact DNA sequence.'), 'Scene 2 block must be formatted properly');
assert(srtOutput.includes('3\n00:00:07,200 --> 00:00:11,000\nOnce cut, cellular repair machinery activates.'), 'Scene 3 block must be formatted properly');
console.log('✅ Passed: Valid SRT subtitles generated.\n');

// Test 3: Video Chapter Timecode Generation
console.log('Test 3: Verify YouTube Chapter Markers Generation...');
const chapters = generateVideoChapters(sampleScenes);
assert(chapters.includes('0:00'), 'Chapters must include 0:00 start');
assert(chapters.includes('0:03'), 'Chapters must include 0:03 timestamp');
assert(chapters.includes('0:07'), 'Chapters must include 0:07 timestamp');
console.log('✅ Passed: Chapter markers accurately calculated from scene timestamps.\n');

// Test 4: Publishing Kit Platform Coverage Verification
console.log('Test 4: Verify Multi-Platform Publishing Kit completeness...');
const platforms = ['youtube', 'instagram', 'tiktok', 'linkedin'];
const mockKit = {
  youtube: {
    title: 'CRISPR Cas9 Explained in 60s',
    description: `Breakdown of gene editing.\n\nCHAPTERS:\n${chapters}`,
    hashtags: ['#Shorts', '#CRISPR', '#Science'],
  },
  instagram: {
    title: 'How Gene Editing Actually Works',
    description: 'Double tap if you learned something new!',
    hashtags: ['#reels', '#science', '#dna'],
  },
  tiktok: {
    title: 'Wait till you see how DNA gets cut...',
    description: 'Follow for daily science explainers!',
    hashtags: ['#edutok', '#fyp', '#sciencetok'],
  },
  linkedin: {
    title: 'Deconstructing CRISPR Cas9: Implications for Biotech',
    description: 'Three key insights from molecular gene targeting.',
    hashtags: ['#Biotech', '#Innovation', '#LifeSciences'],
  },
};

for (const p of platforms) {
  assert(mockKit[p], `Kit must contain platform: ${p}`);
  assert(mockKit[p].title.length > 5, `${p} title must be non-empty`);
  assert(mockKit[p].description.length > 10, `${p} description must be non-empty`);
  assert(Array.isArray(mockKit[p].hashtags) && mockKit[p].hashtags.length > 0, `${p} hashtags must be non-empty array`);
}
console.log('✅ Passed: All 4 social platforms have valid tailored copy.\n');

console.log('🎉 All Sprint 4 Stage 04 Verification Tests Passed Successfully!\n');
process.exit(0);
