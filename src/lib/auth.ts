// Lightweight, edge-compatible HMAC token auth using Web Crypto API

export const SESSION_COOKIE_NAME = 'autoreel_session';

const getSecretKey = async (): Promise<CryptoKey> => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Fatal: AUTH_SECRET environment variable must be set in production.');
    }
  }
  const effectiveSecret = secret || 'fallback-secret-key-autoreel-development-mode-only';
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(effectiveSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
};

// Base64Url encode/decode helpers
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function toBase64Url(str: string): string {
  return bytesToBase64Url(new TextEncoder().encode(str));
}

function fromBase64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function fromBase64Url(base64url: string): string {
  return new TextDecoder().decode(fromBase64UrlToBytes(base64url));
}

export interface SessionPayload {
  email: string;
  exp: number; // Unix timestamp in seconds
}

export async function createSessionToken(email: string): Promise<string> {
  const key = await getSecretKey();
  const payload: SessionPayload = {
    email,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days expiration
  };

  const headerStr = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadStr = toBase64Url(JSON.stringify(payload));
  const dataToSign = `${headerStr}.${payloadStr}`;

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(dataToSign)
  );

  const signatureStr = bytesToBase64Url(new Uint8Array(signatureBytes));
  return `${dataToSign}.${signatureStr}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerStr, payloadStr, signatureStr] = parts;
    const dataToVerify = `${headerStr}.${payloadStr}`;

    const key = await getSecretKey();
    const sigBytes = fromBase64UrlToBytes(signatureStr);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as BufferSource,
      new TextEncoder().encode(dataToVerify)
    );

    if (!isValid) return null;

    const payload: SessionPayload = JSON.parse(fromBase64Url(payloadStr));

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
