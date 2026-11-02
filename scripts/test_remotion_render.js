const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function test() {
  const dummyProps = {
    topic: 'Test Audio Render',
    scenes: [
      {
        id: 'test_1',
        index: 1,
        startTime: 0,
        endTime: 3,
        duration: 3,
        narration: 'Testing audio render in remotion',
        visualDirection: 'Kinetic',
        visualType: 'kinetic_text',
        audioUrl: 'data:audio/mp3;base64,//NkxAAAAANIAAAAAExBTUVVVVU='
      }
    ],
    captionStyle: 'kinetic',
    accentColor: '#FF4F00'
  };

  const propsFile = path.resolve('out/test_audio_props.json');
  fs.mkdirSync(path.dirname(propsFile), { recursive: true });
  fs.writeFileSync(propsFile, JSON.stringify(dummyProps));
  const outFile = path.resolve('out/test_audio_render.mp4');

  const cmd = `npx remotion render src/remotion/index.ts DynamicStoryReel "${outFile}" --props="${propsFile}" --frames=0-30`;
  console.log('Running render cmd:', cmd);
  exec(cmd, (err, stdout, stderr) => {
    if (err) console.error('Err:', err.message);
    console.log('Stdout:', stdout);
    console.log('Stderr:', stderr);
  });
}
test();
