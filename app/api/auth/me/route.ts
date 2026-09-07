import { NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    role: 'admin',
  });
}

