import { NextRequest, NextResponse } from 'next/server';
import { getCachedAudioBuffer } from '@/lib/server/edgeTts';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Audio ID is required' }, { status: 400 });
    }

    const buffer = await getCachedAudioBuffer(id.trim());

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'Audio file not found or expired' }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to serve audio' }, { status: 500 });
  }
}
