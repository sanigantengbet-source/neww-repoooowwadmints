import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // OAuth credentials (GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET) have been deprecated
  // in favor of simplified token verification with GITHUB_TOKEN and GITHUB_USERNAME.
  return NextResponse.redirect(new URL('/admin/login', req.url));
}
