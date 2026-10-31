import path from 'path';
import fs from 'fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

async function main() {
  console.log('1. Bundling Remotion compositions...');
  const entryPoint = path.resolve('src/remotion/index.ts');
  const bundleLocation = await bundle({ entryPoint });
  console.log('Bundled successfully at:', bundleLocation);

  const reels = [
    { id: 'GeneticsReel', file: 'reel_genetics.mp4', poster: 'poster_genetics.png' },
    { id: 'KubernetesReel', file: 'reel_kubernetes.mp4', poster: 'poster_kubernetes.png' },
    { id: 'SaraighatReel', file: 'reel_saraighat.mp4', poster: 'poster_saraighat.png' },
  ];

  const outDir = path.resolve('public/videos');
  fs.mkdirSync(outDir, { recursive: true });

  for (const r of reels) {
    console.log(`\n======================================================`);
    console.log(`Rendering: ${r.id} -> ${r.file}...`);
    console.log(`======================================================`);

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: r.id,
    });

    const videoOut = path.join(outDir, r.file);
    const posterOut = path.join(outDir, r.poster);

    // 1. Render Still Poster (Frame 45 = 1.5s in)
    console.log(`Rendering poster frame to: ${posterOut}...`);
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: posterOut,
      frame: 45,
    });

    // 2. Render Full MP4 Video
    console.log(`Rendering MP4 video to: ${videoOut} (${composition.durationInFrames} frames @ 30fps)...`);
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: videoOut,
      onProgress: ({ renderedFrames, progress }) => {
        process.stdout.write(`Rendering: ${renderedFrames}/${composition.durationInFrames} frames (${Math.round(progress * 100)}%)\r`);
      },
    });

    const stats = fs.statSync(videoOut);
    console.log(`\nDONE: ${r.file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  }

  console.log('\n======================================================');
  console.log('ALL 3 SHOWCASE REELS RENDERED SUCCESSFULLY!');
  console.log('======================================================');
}

main().catch((err) => {
  console.error('Render failed:', err);
  process.exit(1);
});
