import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileParam = searchParams.get('file');
    const nameParam = searchParams.get('name') || 'autoreel_video.mp4';

    if (!fileParam) {
      return new NextResponse('File parameter missing', { status: 400 });
    }

    // Security check: only allow files inside public/renders or public/videos
    const cleanPath = fileParam.replace(/^\/+/, '');
    const allowedPrefixes = ['renders/', 'videos/', 'audio/'];
    const isAllowed = allowedPrefixes.some((p) => cleanPath.startsWith(p));
    if (!isAllowed || cleanPath.includes('..')) {
      return new NextResponse('Forbidden path', { status: 403 });
    }

    const absolutePath = path.resolve(process.cwd(), 'public', cleanPath);
    if (!fs.existsSync(absolutePath)) {
      return new NextResponse('File not found on server', { status: 404 });
    }

    const stat = fs.statSync(absolutePath);
    const fileStream = fs.createReadStream(absolutePath);

    // Clean filename for Content-Disposition header
    const safeFilename = nameParam.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Create a Web ReadableStream from Node read stream
    const readable = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
      cancel() {
        fileStream.destroy();
      },
    });

    const contentType = cleanPath.endsWith('.mp3')
      ? 'audio/mpeg'
      : cleanPath.endsWith('.json')
      ? 'application/json'
      : cleanPath.endsWith('.srt')
      ? 'text/plain; charset=utf-8'
      : 'video/mp4';

    return new NextResponse(readable, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    return new NextResponse(err?.message || 'Download error', { status: 500 });
  }
}
