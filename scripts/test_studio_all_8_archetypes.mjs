import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

console.log('🧪 Testing Remotion Rendering across All 8 Motion Graphics Patterns...');

const testProps = {
  topic: 'The Evolution of Computing & Machine Intelligence',
  captionStyle: 'kinetic',
  accentColor: '#FF4F00',
  scenes: [
    {
      id: 'sc_1',
      index: 1,
      startTime: 0,
      endTime: 1,
      duration: 1,
      narration: 'Computing began with simple mechanical relays.',
      visualDirection: 'Kinetic typography punch with rapid zoom-in',
      visualType: 'kinetic_text',
      highlightWords: ['mechanical', 'relays'],
    },
    {
      id: 'sc_2',
      index: 2,
      startTime: 1,
      endTime: 2,
      duration: 1,
      narration: 'Then microprocessors revolutionized system architectures.',
      visualDirection: 'Concentric vector circuit rings with telemetry coordinates',
      visualType: 'vector_schematic',
      highlightWords: ['microprocessors', 'architectures'],
    },
    {
      id: 'sc_3',
      index: 3,
      startTime: 2,
      endTime: 3,
      duration: 1,
      narration: 'Targeting specific operational bottlenecks changed everything.',
      visualDirection: 'Targeting crosshair HUD scanning core coordinates',
      visualType: 'crosshair_target',
      highlightWords: ['bottlenecks', 'targeting'],
    },
    {
      id: 'sc_4',
      index: 4,
      startTime: 3,
      endTime: 4,
      duration: 1,
      narration: 'Traditional CPUs vs modern parallel GPU accelerators.',
      visualDirection: 'Comparative split cards with laser divider line',
      visualType: 'split_comparison',
      highlightWords: ['CPUs', 'GPU'],
    },
    {
      id: 'sc_5',
      index: 5,
      startTime: 4,
      endTime: 5,
      duration: 1,
      narration: 'Data streams through pipelined execution stages.',
      visualDirection: 'Sequential multi-node pipeline with pulse packets',
      visualType: 'process_flow',
      highlightWords: ['Data', 'execution'],
    },
    {
      id: 'sc_6',
      index: 6,
      startTime: 5,
      endTime: 6,
      duration: 1,
      narration: 'Throughput expanded by over 300 percent.',
      visualDirection: 'Animated metric bar chart with percentage growth',
      visualType: 'dynamic_chart',
      highlightWords: ['Throughput', '300'],
    },
    {
      id: 'sc_7',
      index: 7,
      startTime: 6,
      endTime: 7,
      duration: 1,
      narration: 'Tracking the milestones from vacuum tubes to neural chips.',
      visualDirection: 'Chronological timeline with progressive laser markers',
      visualType: 'timeline',
      highlightWords: ['milestones', 'neural'],
    },
    {
      id: 'sc_8',
      index: 8,
      startTime: 7,
      endTime: 8,
      duration: 1,
      narration: 'Three core principles define the modern AI paradigm.',
      visualDirection: 'Cascading takeaway cards with numbered badges',
      visualType: 'step_sequence',
      highlightWords: ['Three', 'paradigm'],
    },
  ],
};

const outDir = path.resolve('out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const propsFile = path.join(outDir, 'all_8_archetypes_props.json');
fs.writeFileSync(propsFile, JSON.stringify(testProps, null, 2), 'utf-8');

const outputFile = path.join(outDir, 'test_all_8_archetypes.mp4');

console.log('Rendering 8-second test reel spanning all 8 archetypes...');
try {
  const cmd = `npx remotion render src/remotion/index.ts DynamicStoryReel "${outputFile}" --props="${propsFile}" --frames=0-240 --concurrency=4`;
  console.log(`Executing: ${cmd}`);
  const output = execSync(cmd, { stdio: 'inherit' });
  console.log('✅ Render succeeded! Output verified at:', outputFile);
} catch (err) {
  console.error('❌ Render failed:', err);
  process.exit(1);
}
