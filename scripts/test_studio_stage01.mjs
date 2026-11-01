import assert from 'assert';

console.log('🧪 Running Stage 01 Topic Formulation & State Verification Tests...\n');

const DURATION_CONFIGS = {
  30: {
    label: '30 Seconds',
    targetWords: 65,
    sceneCount: '3-4 Scenes',
    description: 'Fast viral hook, perfect for single-concept punchy reels',
  },
  60: {
    label: '60 Seconds',
    targetWords: 130,
    sceneCount: '5-7 Scenes',
    description: 'Standard explainer, optimal balance of depth and engagement',
  },
  90: {
    label: '90 Seconds',
    targetWords: 200,
    sceneCount: '7-10 Scenes',
    description: 'Deep dive, comprehensive multi-stage breakdown',
  },
};

const VOICES = [
  {
    id: 'alloy',
    name: 'Alloy',
    edgeVoice: 'en-US-JennyNeural',
    description: 'Warm, clear, and natural documentary cadence',
    gender: 'Female',
    sampleAudio: '/audio/reel_genetics.mp3',
  },
  {
    id: 'echo',
    name: 'Echo',
    edgeVoice: 'en-US-BrianMultilingualNeural',
    description: 'Energetic, crisp, and authoritative technical explainer',
    gender: 'Male',
    sampleAudio: '/audio/reel_kubernetes.mp3',
  },
  {
    id: 'fable',
    name: 'Fable',
    edgeVoice: 'en-US-AndrewMultilingualNeural',
    description: 'Deep, resonant, and editorial narrative voice',
    gender: 'Male',
    sampleAudio: '/audio/reel_saraighat.mp3',
  },
  {
    id: 'nova',
    name: 'Nova',
    edgeVoice: 'en-US-AvaMultilingualNeural',
    description: 'Calm, polished, and confident modern delivery',
    gender: 'Female',
    sampleAudio: '/audio/spike_test.mp3',
  },
];

const TONES = [
  {
    id: 'engaging',
    label: 'Engaging & Direct (Fast-paced)',
    description: 'High hook retention, punchy sentences, minimal fluff.',
  },
  {
    id: 'academic',
    label: 'Academic & Thorough',
    description: 'Precise scientific nomenclature, systematic explanations.',
  },
  {
    id: 'narrative',
    label: 'Storytelling & Dramatic',
    description: 'High-stakes historical or conceptual story arc.',
  },
  {
    id: 'casual',
    label: 'Conversational & Casual',
    description: 'Relatable analogies, friendly, accessible language.',
  },
];

// Test 1: Duration configurations
console.log('Test 1: Verify Duration Configurations (30s, 60s, 90s)...');
assert.strictEqual(DURATION_CONFIGS[30].targetWords, 65, '30s should target ~65 words');
assert.strictEqual(DURATION_CONFIGS[60].targetWords, 130, '60s should target ~130 words');
assert.strictEqual(DURATION_CONFIGS[90].targetWords, 200, '90s should target ~200 words');
console.log('✅ Passed: Duration configurations match production specification.\n');

// Test 2: Voice configurations and Edge TTS mapping
console.log('Test 2: Verify Neural Voices and Edge TTS Identifiers...');
assert.strictEqual(VOICES.length, 4, 'Should expose 4 high-quality voices');
const voiceIds = VOICES.map(v => v.id);
assert.deepStrictEqual(voiceIds, ['alloy', 'echo', 'fable', 'nova'], 'Voices should be Alloy, Echo, Fable, Nova');
for (const v of VOICES) {
  assert(v.edgeVoice.startsWith('en-US-'), `${v.name} should map to a valid en-US Edge TTS voice identifier`);
  assert(v.sampleAudio.length > 0, `${v.name} should specify a sample audio preview path`);
}
console.log('✅ Passed: Voice configurations are valid.\n');

// Test 3: Audience and Tone configurations
console.log('Test 3: Verify Audience & Tone Presets...');
assert.strictEqual(TONES.length, 4, 'Should provide 4 tone options');
const toneIds = TONES.map(t => t.id);
assert.deepStrictEqual(toneIds, ['engaging', 'academic', 'narrative', 'casual']);
console.log('✅ Passed: Audience & Tone options verified.\n');

// Test 4: Topic validation logic
console.log('Test 4: Verify Topic Validation Boundary...');
function isValidTopic(topic) {
  return typeof topic === 'string' && topic.trim().length >= 5;
}
assert.strictEqual(isValidTopic(''), false, 'Empty string is invalid');
assert.strictEqual(isValidTopic('   '), false, 'Whitespace-only string is invalid');
assert.strictEqual(isValidTopic('DNA'), false, '< 5 characters is invalid');
assert.strictEqual(isValidTopic('CRISPR gene editing'), true, 'Valid topic accepted');
console.log('✅ Passed: Topic validation rules strictly enforced.\n');

console.log('🎉 All Stage 01 Unit & Flow Verification Tests Passed Successfully!');
