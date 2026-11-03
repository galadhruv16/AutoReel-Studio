import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export const VOICE_MAP: Record<string, string> = {
  alloy: 'en-US-JennyNeural',
  echo: 'en-US-BrianMultilingualNeural',
  fable: 'en-US-AndrewMultilingualNeural',
  nova: 'en-US-AvaMultilingualNeural',
  onyx: 'en-US-GuyNeural',
  shimmer: 'en-US-MichelleNeural',
};

export interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
}

export interface SynthesisResult {
  success: boolean;
  text: string;
  voice: string;
  rate: string;
  durationSec: number;
  totalDurationMs: number;
  wordCount: number;
  wordTimestamps: WordTimestamp[];
  audioBase64: string;
  audioUrl: string;
  fingerprint: string;
}

// In-memory global cache for warm serverless invocations
declare global {
  // eslint-disable-next-line no-var
  var __autoreel_audio_cache__: Map<string, SynthesisResult> | undefined;
  // eslint-disable-next-line no-var
  var __autoreel_buffer_cache__: Map<string, Buffer> | undefined;
}

const memoryCache = globalThis.__autoreel_audio_cache__ || new Map<string, SynthesisResult>();
globalThis.__autoreel_audio_cache__ = memoryCache;

const bufferCache = globalThis.__autoreel_buffer_cache__ || new Map<string, Buffer>();
globalThis.__autoreel_buffer_cache__ = bufferCache;

function resolveVoice(voiceKey: string): string {
  const normalized = (voiceKey || '').toLowerCase().trim();
  if (VOICE_MAP[normalized]) {
    return VOICE_MAP[normalized];
  }
  if (voiceKey.includes('Neural')) {
    return voiceKey;
  }
  return 'en-US-JennyNeural';
}

function getCacheDir(): string {
  return path.join(os.tmpdir(), 'autoreel_audio_cache');
}

export async function getCachedAudioBuffer(fingerprint: string): Promise<Buffer | null> {
  if (bufferCache.has(fingerprint)) {
    return bufferCache.get(fingerprint)!;
  }

  const cacheDir = getCacheDir();
  const audioFilePath = path.join(cacheDir, `${fingerprint}.mp3`);
  try {
    const buf = await fs.readFile(audioFilePath);
    bufferCache.set(fingerprint, buf);
    return buf;
  } catch {
    return null;
  }
}

export async function synthesizeSpeechNode(
  text: string,
  voiceKey = 'alloy',
  rate = '+12%'
): Promise<SynthesisResult> {
  const cleanText = text.trim();
  const cleanVoice = voiceKey.trim();
  const cleanRate = String(rate).trim();
  const resolvedVoice = resolveVoice(cleanVoice);

  // Compute deterministic SHA-256 fingerprint
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${cleanText}_${resolvedVoice}_${cleanRate}_v4`)
    .digest('hex');

  // 1. Check in-memory cache
  if (memoryCache.has(fingerprint)) {
    return memoryCache.get(fingerprint)!;
  }

  // 2. Check temp disk cache
  const cacheDir = getCacheDir();
  const cacheFilePath = path.join(cacheDir, `${fingerprint}.json`);
  const audioFilePath = path.join(cacheDir, `${fingerprint}.mp3`);
  try {
    const cachedData = await fs.readFile(cacheFilePath, 'utf8');
    const parsed = JSON.parse(cachedData) as SynthesisResult;
    if (parsed && parsed.audioBase64) {
      memoryCache.set(fingerprint, parsed);
      const buf = Buffer.from(parsed.audioBase64.replace(/^data:audio\/mp3;base64,/, ''), 'base64');
      bufferCache.set(fingerprint, buf);
      return parsed;
    }
  } catch {
    // Disk cache miss
  }

  // 3. Synthesize via pure Node.js Edge TTS
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(resolvedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, {
      wordBoundaryEnabled: true,
    });

    const { audioStream, metadataStream } = tts.toStream(cleanText, { rate: cleanRate });

    const audioChunks: Buffer[] = [];
    audioStream.on('data', (chunk: Buffer) => {
      audioChunks.push(chunk);
    });

    const wordTimestamps: WordTimestamp[] = [];
    if (metadataStream) {
      metadataStream.on('data', (raw: Buffer | string) => {
        try {
          const parsed = JSON.parse(raw.toString());
          if (parsed?.Metadata) {
            for (const item of parsed.Metadata) {
              if (item.Type === 'WordBoundary' && item.Data) {
                const startMs = Math.round(item.Data.Offset / 10000);
                const durationMs = Math.round(item.Data.Duration / 10000);
                wordTimestamps.push({
                  word: item.Data.text?.Text || '',
                  startMs,
                  endMs: startMs + durationMs,
                });
              }
            }
          }
        } catch {
          // Ignore JSON metadata parse fragment errors
        }
      });
    }

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Edge TTS stream timed out after 5000ms'));
      }, 5000);
      audioStream.on('end', () => {
        clearTimeout(timer);
        resolve();
      });
      audioStream.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    const audioBuffer = Buffer.concat(audioChunks);
    if (audioBuffer.length === 0) {
      throw new Error('Edge TTS produced an empty audio buffer');
    }

    // 250ms acoustic release buffer so final syllable never chops off
    const lastWordEnd = wordTimestamps.length > 0 ? wordTimestamps[wordTimestamps.length - 1].endMs : 0;
    const estimatedFromBytes = Math.round((audioBuffer.length / (48000 / 8)) * 1000);
    const totalDurationMs = Math.max(lastWordEnd + 250, estimatedFromBytes);
    const durationSec = Number((totalDurationMs / 1000.0).toFixed(2));
    const audioBase64 = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;

    const result: SynthesisResult = {
      success: true,
      text: cleanText,
      voice: resolvedVoice,
      rate: cleanRate,
      durationSec,
      totalDurationMs,
      wordCount: wordTimestamps.length,
      wordTimestamps,
      audioBase64,
      audioUrl: audioBase64,
      fingerprint,
    };

    // Save to memory cache
    memoryCache.set(fingerprint, result);
    bufferCache.set(fingerprint, audioBuffer);

    // Save to temp disk cache asynchronously
    fs.mkdir(cacheDir, { recursive: true })
      .then(async () => {
        await fs.writeFile(cacheFilePath, JSON.stringify(result), 'utf8');
        await fs.writeFile(audioFilePath, audioBuffer);
      })
      .catch(() => {});

    return result;
  } catch (ttsErr) {
    console.warn('Pure Node msedge-tts error, falling back to intelligent timing model:', ttsErr);

    // Offline / Network Failure Fallback
    const words = cleanText.split(/\s+/).filter(Boolean);
    const msPerWord = 340;
    let accumulatedMs = 80;
    const wordTimestamps: WordTimestamp[] = words.map((w) => {
      const start = accumulatedMs;
      const end = start + msPerWord;
      accumulatedMs = end + 30;
      return {
        word: w,
        startMs: start,
        endMs: end,
      };
    });

    const totalDurationSec = Number((accumulatedMs / 1000.0).toFixed(2));

    return {
      success: false,
      text: cleanText,
      voice: resolvedVoice,
      rate: cleanRate,
      durationSec: totalDurationSec,
      totalDurationMs: accumulatedMs,
      wordCount: words.length,
      wordTimestamps,
      audioBase64: '',
      audioUrl: '',
      fingerprint,
    };
  }
}
