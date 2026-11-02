import { NextResponse } from 'next/server';
import { StudioScene } from '@/types/studio';
import { generateSrtContent } from '@/utils/srt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { scenes, filename = 'autoreel_subtitles.srt' } = body;
    const safeFilename = String(filename || 'autoreel_subtitles.srt')
      .replace(/[^a-zA-Z0-9_.-]/g, '_')
      .slice(0, 100);

    if (!scenes || !Array.isArray(scenes)) {
      return NextResponse.json(
        { success: false, error: 'scenes array is required' },
        { status: 400 }
      );
    }

    const srtContent = generateSrtContent(scenes as StudioScene[]);

    return new Response(srtContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'SRT export failed' },
      { status: 500 }
    );
  }
}
