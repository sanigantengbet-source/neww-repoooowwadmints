import { cookies } from 'next/headers';
import crypto from 'crypto';
import type { AdminSession } from '@/types';

export const ADMIN_COOKIE_NAME = 'sann_admin_session';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Derives a cryptographic HMAC signing secret server-side from GITHUB_TOKEN and GITHUB_USERNAME.
 * This guarantees strong signing without requiring an extra AUTH_SECRET environment variable.
 */
function getAuthSecret(): string {
  const token = (process.env.GITHUB_TOKEN || '').trim();
  const username = (process.env.GITHUB_USERNAME || '').trim();
  return crypto
    .createHash('sha256')
    .update(`sann_auth_${username}_${token}_salt_secret_key`)
    .digest('hex');
}

/**
 * Retrieves the configured administrative GitHub username.
 */
export function getAdminUsername(): string {
  return (process.env.GITHUB_USERNAME || '').trim().toLowerCase();
}

/**
 * Backward-compatible helper for admin username.
 */
export function getAdminWhitelistUsername(): string {
  return getAdminUsername();
}

/**
 * Signs a session payload using HMAC-SHA256
 */
export function signSession(session: Omit<AdminSession, 'role'>): string {
  const secret = getAuthSecret();
  const payload: AdminSession = {
    ...session,
    role: 'admin',
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadStr)
    .digest('base64url');
  return `${payloadStr}.${signature}`;
}

/**
 * Verifies and parses a signed session token.
 * Returns null if token is tampered, expired, or invalid.
 */
export function verifySessionToken(token: string): AdminSession | null {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [payloadStr, signature] = token.split('.');
  if (!payloadStr || !signature) {
    return null;
  }

  const secret = getAuthSecret();
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payloadStr)
    .digest('base64url');

  const expectedBuffer = Buffer.from(expectedSig);
  const actualBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(payloadStr, 'base64url').toString('utf-8');
    const session: AdminSession = JSON.parse(jsonStr);

    if (Date.now() > session.expiresAt) {
      return null;
    }

    const whitelist = getAdminWhitelistUsername();
    if (whitelist && session.username.toLowerCase() !== whitelist) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Verifies current server request session from cookies.
 * Server-side only.
 */
export async function getVerifiedAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!cookie?.value) {
    return null;
  }
  return verifySessionToken(cookie.value);
}

/**
 * Checks whether user GitHub username matches the configured admin username.
 */
export function isWhitelistedAdmin(githubUsername: string): boolean {
  const admin = getAdminUsername();
  if (!admin) {
    return false;
  }
  return githubUsername.trim().toLowerCase() === admin;
}

/**
 * Sets the admin session cookie on the response.
 * httpOnly prevents client-side JavaScript access.
 */
export async function setAdminSessionCookie(sessionData: Omit<AdminSession, 'role' | 'expiresAt'>) {
  const cookieStore = await cookies();
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const token = signSession({
    ...sessionData,
    expiresAt,
  });

  const isProduction = process.env.NODE_ENV === 'production';

  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the admin session cookie on logout
 */
export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
