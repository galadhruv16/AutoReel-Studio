import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve(process.cwd(), 'public', 'audio', 'samples');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const samples = [
  { id: 'rohan', voice: 'en-IN-PrabhatNeural', text: "Hello! I'm Rohan. Ready to narrate your educational explainer with natural cadence." },
  { id: 'priya', voice: 'en-IN-NeerjaNeural', text: "Hello! I'm Priya. Ready to deliver warm, articulate, and engaging educational narration." },
  { id: 'alloy', voice: 'en-US-JennyNeural', text: "Hi! I'm Alloy. Let's make a compelling, balanced documentary explainer together." },
  { id: 'echo', voice: 'en-US-BrianMultilingualNeural', text: "Hey! I'm Echo, your fast, crisp, and authoritative technical explainer voice." },
  { id: 'fable', voice: 'en-US-AndrewMultilingualNeural', text: "Welcome. I'm Fable, bringing editorial depth, weight, and narrative resonance to your concept." },
  { id: 'nova', voice: 'en-US-AvaMultilingualNeural', text: "Hi, I'm Nova. Clean, calm, and polished delivery designed for high retention." },
  { id: 'ryan', voice: 'en-GB-RyanNeural', text: "Greetings. I'm Ryan, offering articulate, distinguished British narration for deep analytical topics." },
  { id: 'sonia', voice: 'en-GB-SoniaNeural', text: "Hello there! I'm Sonia, bringing expressive, modern, and engaging storytelling to your video." }
];

async function generateAll() {
  console.log('Generating voice sample previews into public/audio/samples/...');
  for (const s of samples) {
    const outFile = path.join(outDir, `${s.id}.mp3`);
    console.log(`Synthesizing ${s.id} (${s.voice})...`);
    try {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(s.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(s.text, { rate: '+5%' });
      const chunks = [];
      await new Promise((resolve, reject) => {
        audioStream.on('data', chunk => chunks.push(chunk));
        audioStream.on('end', () => {
          fs.writeFileSync(outFile, Buffer.concat(chunks));
          resolve();
        });
        audioStream.on('error', reject);
      });
      console.log(`Saved ${outFile}`);
    } catch (e) {
      console.error(`Failed to synthesize ${s.id}:`, e);
    }
  }
  console.log('Voice sample generation completed!');
}

generateAll();
