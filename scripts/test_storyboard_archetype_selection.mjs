// scripts/test_storyboard_archetype_selection.mjs
// Test script to verify that code_terminal and investigative_dossier are properly selected and emitted by generate-storyboard

import { POST } from '../src/app/api/studio/generate-storyboard/route.ts';

async function runTest() {
  console.log('🧪 Starting Storyboard Archetype Selection Tests...\n');

  // Test 1: Tech/Coding topic
  console.log('--- Test 1: Technical / Coding Topic ---');
  const techReq = new Request('http://localhost:3000/api/studio/generate-storyboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'How the Linux Kernel Boots: Low Level Code & Syscalls',
      duration: 30,
      scriptMode: 'ai_generate',
    }),
  });

  const techRes = await POST(techReq);
  const techData = await techRes.json();
  if (!techData.success) {
    throw new Error(`Test 1 failed: ${techData.error}`);
  }

  const techArchetypes = techData.data.scenes.map((s) => s.visualType);
  console.log('Tech Topic Scenes Archetypes:', techArchetypes);
  if (!techArchetypes.includes('code_terminal')) {
    throw new Error('FAIL: Tech topic did NOT include code_terminal!');
  }
  console.log('✅ PASS: Tech topic successfully generated "code_terminal" scene!');

  // Test 2: Historical / Investigative Topic
  console.log('\n--- Test 2: Historical / Investigative Topic ---');
  const histReq = new Request('http://localhost:3000/api/studio/generate-storyboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'The 1971 Indo-Pak War & Secret Naval Cables Investigation',
      duration: 30,
      scriptMode: 'ai_generate',
    }),
  });

  const histRes = await POST(histReq);
  const histData = await histRes.json();
  if (!histData.success) {
    throw new Error(`Test 2 failed: ${histData.error}`);
  }

  const histArchetypes = histData.data.scenes.map((s) => s.visualType);
  console.log('Investigative Topic Scenes Archetypes:', histArchetypes);
  if (!histArchetypes.includes('investigative_dossier')) {
    throw new Error('FAIL: Investigative topic did NOT include investigative_dossier!');
  }
  console.log('✅ PASS: Investigative topic successfully generated "investigative_dossier" scene!');

  // Test 3: General Science Topic (6 scenes / 30s)
  console.log('\n--- Test 3: General Topic Diversity (30s) ---');
  const genReq = new Request('http://localhost:3000/api/studio/generate-storyboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'CRISPR Gene Editing in Human Cells',
      duration: 30,
      scriptMode: 'ai_generate',
    }),
  });

  const genRes = await POST(genReq);
  const genData = await genRes.json();
  if (!genData.success) {
    throw new Error(`Test 3 failed: ${genData.error}`);
  }

  const genArchetypes = genData.data.scenes.map((s) => s.visualType);
  console.log('General Topic Scenes Archetypes:', genArchetypes);
  if (!genArchetypes.includes('investigative_dossier') || !genArchetypes.includes('code_terminal')) {
    throw new Error('FAIL: General topic did NOT include both investigative_dossier and code_terminal!');
  }
  console.log('✅ PASS: General topic contains both "investigative_dossier" and "code_terminal"!');

  // Test 4: Custom Script Mode
  console.log('\n--- Test 4: Custom Script Mode ---');
  const customScriptText =
    'First we analyze the system architecture. Next we examine the runtime code implementation in TypeScript. Then we review the declassified audit records. After that we measure benchmark performance gains.';
  const customReq = new Request('http://localhost:3000/api/studio/generate-storyboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: 'Custom Script Pipeline',
      duration: 30,
      scriptMode: 'own_script',
      customScript: customScriptText,
    }),
  });

  const customRes = await POST(customReq);
  const customData = await customRes.json();
  if (!customData.success) {
    throw new Error(`Test 4 failed: ${customData.error}`);
  }

  const customArchetypes = customData.data.scenes.map((s) => s.visualType);
  console.log('Custom Script Scenes Archetypes:', customArchetypes);
  if (!customArchetypes.includes('code_terminal') && !customArchetypes.includes('investigative_dossier')) {
    throw new Error('FAIL: Custom script did NOT include next-gen archetypes!');
  }
  console.log('✅ PASS: Custom script successfully rotated next-gen archetypes!');

  console.log('\n🎉 ALL 4 ARCHETYPE SELECTION TESTS PASSED WITH 100% SUCCESS!');
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
