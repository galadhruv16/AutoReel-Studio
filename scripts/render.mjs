import path from 'path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import fs from 'fs';

async function main() {
  console.log('1. Bundling Remotion composition...');
  const entryPoint = path.resolve('src/remotion/index.ts');
  const bundleLocation = await bundle({
    entryPoint,
    // Webpack override if needed
  });
  console.log('Bundled successfully at:', bundleLocation);

  const outputLocation = path.resolve(process.argv[2] || 'out/spike_test.mp4');
  const compId = process.argv[3] || 'MainReel';

  console.log(`2. Selecting composition: ${compId}...`);
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: compId,
  });
  fs.mkdirSync(path.dirname(outputLocation), { recursive: true });

  console.log('3. Rendering video to:', outputLocation);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation,
    onProgress: ({ renderedFrames, encodedFrames, progress }) => {
      process.stdout.write(`Rendering: ${renderedFrames}/${composition.durationInFrames} frames (${Math.round(progress * 100)}%)\r`);
    },
  });

  console.log('\nSUCCESS! Render complete:', outputLocation);
  const stats = fs.statSync(outputLocation);
  console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error('Render failed:', err);
  process.exit(1);
});
