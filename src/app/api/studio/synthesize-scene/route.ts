import { NextResponse } from 'next/server';
import { synthesizeSpeechNode } from '@/lib/server/edgeTts';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, voice = 'alloy', sceneIndex = 1, rate = '+12%' } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Narration text is required' },
        { status: 400 }
      );
    }

    const cleanText = text.trim();
    const cleanVoice = voice.trim();
    const cleanRate = String(rate).trim();

    // Pure Node.js Edge TTS execution (zero Python dependency - works in Serverless & Vercel)
    const result = await synthesizeSpeechNode(cleanText, cleanVoice, cleanRate);

    return NextResponse.json({
      success: true,
      cached: false,
      data: {
        sceneIndex,
        text: cleanText,
        voice: cleanVoice,
        duration: result.durationSec,
        totalDurationMs: result.totalDurationMs,
        wordCount: result.wordCount,
        wordTimestamps: result.wordTimestamps,
        audioUrl: result.audioBase64 || null,
        audioHttpUrl: result.fingerprint ? `/api/studio/audio?id=${result.fingerprint}` : null,
        fingerprint: result.fingerprint,
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
