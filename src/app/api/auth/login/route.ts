import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: 'Server authentication configuration missing.' },
        { status: 500 }
      );
    }

    // Check credentials (case-insensitive email, exact password)
    const isValid =
      email &&
      password &&
      email.trim().toLowerCase() === adminEmail.trim().toLowerCase() &&
      password === adminPassword;

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid insider credentials. Access denied.' },
        { status: 401 }
      );
    }

    // Create signed token
    const token = await createSessionToken(adminEmail);

    const response = NextResponse.json({
      success: true,
      data: { email: adminEmail },
    });

    // Set secure HttpOnly cookie for 7 days
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
