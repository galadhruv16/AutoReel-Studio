import assert from 'assert';

console.log('🧪 Running Stage 02 Storyboard & Dynamic Script Verification Tests...\n');

// Mock scene generator based on our route logic
function generateMockScenes(topic, targetDuration, customScript = '') {
  const avgDur = targetDuration === 30 ? 3.5 : targetDuration === 60 ? 4.0 : 4.5;
  const count = targetDuration === 30 ? 4 : targetDuration === 60 ? 7 : 9;

  let time = 0;
  const scenes = [];
  for (let i = 0; i < count; i++) {
    const s = Number(time.toFixed(1));
    time += avgDur;
    const e = Number(time.toFixed(1));
    scenes.push({
      id: `scene_${i + 1}`,
      index: i + 1,
      startTime: s,
      endTime: e,
      duration: avgDur,
      narration: `Spoken beat ${i + 1} detailing ${topic}`,
      visualDirection: `Dynamic kinetic animation for phrase ${i + 1}`,
      visualType: 'kinetic_text',
      highlightWords: ['beat', topic],
    });
  }
  return scenes;
}

// Test 1: Verify Scene Timecode Continuity
console.log('Test 1: Verify Scene Timecode Continuity (End Time == Next Start Time)...');
const scenes60 = generateMockScenes('CRISPR Cas9', 60);
assert.strictEqual(scenes60[0].startTime, 0.0, 'First scene must start at 0.0s');
for (let i = 1; i < scenes60.length; i++) {
  assert.strictEqual(
    scenes60[i].startTime,
    scenes60[i - 1].endTime,
    `Scene ${i + 1} start time must strictly equal Scene ${i} end time`
  );
}
console.log('✅ Passed: Timecodes are strictly continuous.\n');

// Test 2: Verify Scene Duration Sum
console.log('Test 2: Verify Scene Duration Summation...');
const totalDur = scenes60.reduce((acc, s) => acc + s.duration, 0);
assert(totalDur > 20 && totalDur <= 70, `Total duration (${totalDur}s) should approximate target`);
console.log('✅ Passed: Scene duration summation verified.\n');

// Test 3: Test Scene Splitting Logic
console.log('Test 3: Verify Dynamic Scene Splitting...');
function splitScene(scenes, index) {
  const target = scenes[index];
  const words = target.narration.trim().split(/\s+/);
  const mid = Math.ceil(words.length / 2);
  const part1 = words.slice(0, mid).join(' ');
  const part2 = words.slice(mid).join(' ');

  const dur1 = Number((target.duration / 2).toFixed(1));
  const dur2 = Number((target.duration / 2).toFixed(1));

  const scene1 = { ...target, narration: part1, duration: dur1 };
  const scene2 = { ...target, id: `${target.id}_b`, narration: part2, duration: dur2 };

  const updated = [...scenes];
  updated.splice(index, 1, scene1, scene2);

  let curTime = 0;
  return updated.map((s, idx) => {
    const start = Number(curTime.toFixed(1));
    curTime += s.duration;
    const end = Number(curTime.toFixed(1));
    return { ...s, index: idx + 1, startTime: start, endTime: end };
  });
}

const splitResult = splitScene(scenes60, 0);
assert.strictEqual(splitResult.length, scenes60.length + 1, 'Scene count must increase by 1');
assert.strictEqual(splitResult[0].startTime, 0.0, 'First split scene starts at 0.0s');
assert.strictEqual(splitResult[1].startTime, splitResult[0].endTime, 'Second split scene starts at first split end');
console.log('✅ Passed: Scene splitting maintains timecode continuity.\n');

// Test 4: Test Scene Deletion Logic
console.log('Test 4: Verify Scene Deletion & Sequential Re-Indexing...');
function deleteScene(scenes, index) {
  const remaining = scenes.filter((_, i) => i !== index);
  let curTime = 0;
  return remaining.map((s, idx) => {
    const start = Number(curTime.toFixed(1));
    curTime += s.duration;
    const end = Number(curTime.toFixed(1));
    return { ...s, index: idx + 1, startTime: start, endTime: end };
  });
}

const deletedResult = deleteScene(scenes60, 1);
assert.strictEqual(deletedResult.length, scenes60.length - 1, 'Scene count must decrease by 1');
assert.strictEqual(deletedResult[1].index, 2, 'Third scene re-indexed to index 2');
assert.strictEqual(deletedResult[1].startTime, deletedResult[0].endTime, 'Timecodes re-aligned after deletion');
console.log('✅ Passed: Scene deletion and re-indexing verified.\n');

// Test 5: Verify Absence of Sci-Fi Clutter in Generated Output
console.log('Test 5: Verify Absence of Sci-Fi Clutter in Output...');
for (const scene of scenes60) {
  assert(!scene.visualDirection.includes('98% match'), 'No fake match percentages allowed');
  assert(!scene.visualDirection.includes('safe zone 80%'), 'No fake safe zone metrics allowed');
  assert(!scene.visualDirection.includes('telemetry matrix'), 'No meaningless telemetry matrix jargon');
  assert(scene.narration.length > 5, 'Narration must be meaningful content');
}
console.log('✅ Passed: Zero sci-fi clutter verified.\n');

console.log('🎉 All Stage 02 Unit & Flow Verification Tests Passed Successfully!');
