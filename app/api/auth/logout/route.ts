import { NextResponse } from 'next/server';
import { clearAdminSessionCookie } from '@/lib/auth';

export async function POST() {
  await clearAdminSessionCookie();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}

export async function GET(req: Request) {
  await clearAdminSessionCookie();
  return NextResponse.redirect(new URL('/admin/login', req.url));
}
