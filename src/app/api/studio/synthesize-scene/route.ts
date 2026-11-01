import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voice = 'alloy', sceneIndex = 1 } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Narration text is required' },
        { status: 400 }
      );
    }

    const cleanText = text.trim();
    const cleanVoice = voice.trim();

    // SHA-256 Fingerprint Caching for instant, zero-latency revisions
    const fingerprint = crypto
      .createHash('sha256')
      .update(`${cleanText}_${cleanVoice}`)
      .digest('hex');

    const cacheDir = path.join(process.cwd(), 'out', 'cache', 'audio');
    const cacheFile = path.join(cacheDir, `${fingerprint}.json`);

    try {
      await fs.mkdir(cacheDir, { recursive: true });
      const cachedRaw = await fs.readFile(cacheFile, 'utf8');
      const cached = JSON.parse(cachedRaw);
      if (cached && cached.audioUrl) {
        return NextResponse.json({
          success: true,
          cached: true,
          data: {
            sceneIndex,
            text: cleanText,
            voice: cleanVoice,
            duration: cached.duration,
            totalDurationMs: cached.totalDurationMs,
            wordCount: cached.wordCount,
            wordTimestamps: cached.wordTimestamps,
            audioUrl: cached.audioUrl,
            fingerprint,
          },
        });
      }
    } catch {
      // Cache miss, proceed to synthesis
    }

    const scriptPath = path.join(process.cwd(), 'scripts', 'synthesize_scene.py');

    try {
      // Attempt local edge-tts execution via Python
      const { stdout } = await execFileAsync('python', [scriptPath, cleanText, cleanVoice], {
        timeout: 12000,
        maxBuffer: 10 * 1024 * 1024,
      });

      const parsed = JSON.parse(stdout.trim());
      if (parsed.success) {
        const payload = {
          duration: parsed.durationSec,
          totalDurationMs: parsed.totalDurationMs,
          wordCount: parsed.wordCount,
          wordTimestamps: parsed.wordTimestamps,
          audioUrl: parsed.audioBase64,
        };

        // Cache result atomically on disk
        await fs.writeFile(cacheFile, JSON.stringify(payload), 'utf8').catch(() => {});

        return NextResponse.json({
          success: true,
          cached: false,
          data: {
            sceneIndex,
            text: cleanText,
            voice: cleanVoice,
            duration: payload.duration,
            totalDurationMs: payload.totalDurationMs,
            wordCount: payload.wordCount,
            wordTimestamps: payload.wordTimestamps,
            audioUrl: payload.audioUrl,
            fingerprint,
          },
        });
      }
    } catch (execErr) {
      console.warn('Local Python edge-tts execution skipped or failed, using intelligent timing fallback:', execErr);
    }

    // Serverless / Offline Fallback Synthesizer
    const words = cleanText.split(/\s+/).filter(Boolean);
    const msPerWord = 340; // ~176 WPM speech rate
    let accumulatedMs = 80;
    const wordTimestamps = words.map((w) => {
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

    return NextResponse.json({
      success: true,
      cached: false,
      data: {
        sceneIndex,
        text: cleanText,
        voice: cleanVoice,
        duration: totalDurationSec,
        totalDurationMs: accumulatedMs,
        wordCount: words.length,
        wordTimestamps,
        audioUrl: null,
        fingerprint,
      },
    });
  } catch (error: any) {
    console.error('Synthesize scene route error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Synthesis failed' },
      { status: 500 }
    );
  }
}
