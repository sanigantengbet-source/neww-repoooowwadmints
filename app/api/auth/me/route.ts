import { NextResponse } from 'next/server';
import { getVerifiedAdminSession, getAdminUsername } from '@/lib/auth';

export async function GET() {
  const session = await getVerifiedAdminSession();
  const configuredAdmin = getAdminUsername();
  const hasServerToken = Boolean(process.env.GITHUB_TOKEN);

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      configuredAdmin: configuredAdmin || null,
      hasServerToken,
    });
  }

  return NextResponse.json({
    authenticated: true,
    configuredAdmin,
    hasServerToken,
    session: {
      username: session.username,
      avatarUrl: session.avatarUrl,
      name: session.name,
      role: session.role,
      expiresAt: session.expiresAt,
    },
    user: {
      username: session.username,
      avatarUrl: session.avatarUrl,
      name: session.name,
      role: session.role,
    },
  });
}
