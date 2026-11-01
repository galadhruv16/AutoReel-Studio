import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve('.env'), 'utf8');
let apiKey = '';
for (const line of envFile.split('\n')) {
  if (line.startsWith('STITCH_API_KEY=')) {
    apiKey = line.split('=')[1].trim();
  }
}

const screens = [
  { id: 'page1_desktop', file: 'projects/1801554914878734954/files/a213df780ec14aafb469186bbb146f33' },
  { id: 'page1_mobile', file: 'projects/1801554914878734954/files/553f6a448dfd4a038946bd0eed79cbd0' },
  { id: 'page2_desktop', file: 'projects/1801554914878734954/files/6a15a0e05a2f4a9bbd2018e49f01a235' },
  { id: 'page2_mobile', file: 'projects/1801554914878734954/files/3781044b206a4c648493726310a96b17' },
  { id: 'page3_desktop', file: 'projects/1801554914878734954/files/20a2f1c70417414f9a2a2d4cf8439f98' },
  { id: 'page3_mobile', file: 'projects/1801554914878734954/files/1be5d4a233384a1787f8f0ab378b7672' },
  { id: 'page4_desktop', file: 'projects/1801554914878734954/files/087648e4d2744ddf9900acfc77188450' },
  { id: 'page4_mobile', file: 'projects/1801554914878734954/files/6d473c6582ff44e0b9f0dc2f0317fe31' },
];

const outDir = path.resolve('public/designs');
fs.mkdirSync(outDir, { recursive: true });

async function downloadScreens() {
  for (const s of screens) {
    console.log(`Downloading ${s.id}...`);
    try {
      const url = `https://stitch.googleapis.com/v1/${s.file}:download`;
      const res = await fetch(url, {
        headers: { 'X-Goog-Api-Key': apiKey },
      });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const dest = path.join(outDir, `${s.id}.png`);
        fs.writeFileSync(dest, Buffer.from(buffer));
        console.log(`Saved ${dest} (${buffer.byteLength} bytes)`);
      } else {
        console.error(`Failed ${s.id}: HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(`Error downloading ${s.id}:`, err.message);
    }
  }
}

downloadScreens();
