import { NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: session.username,
      avatarUrl: session.avatarUrl,
      name: session.name,
      role: session.role,
    },
  });
}
