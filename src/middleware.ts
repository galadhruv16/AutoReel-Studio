import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  // 1. If accessing /login while already logged in -> redirect to /studio
  if (pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/studio', request.url));
    }
    return NextResponse.next();
  }

  // 2. Protect /studio and all internal pages
  if (pathname.startsWith('/studio')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Protect internal Studio API routes (exempt audio stream endpoint so media players & Remotion can stream safely)
  if (pathname.startsWith('/api/studio') && !pathname.startsWith('/api/studio/audio')) {
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Insider access credentials required.' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/studio/:path*', '/studio', '/login', '/api/studio/:path*'],
};
