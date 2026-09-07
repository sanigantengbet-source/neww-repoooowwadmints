import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { setAdminSessionCookie, getAdminUsername } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body.token === 'string' ? body.token.trim() : '';

    if (!token) {
      return NextResponse.json(
        { error: 'GitHub Personal Access Token wajib diisi.' },
        { status: 400 }
      );
    }

    const serverToken = (process.env.GITHUB_TOKEN || '').trim();
    const serverUsername = getAdminUsername();

    if (!serverToken || !serverUsername) {
      return NextResponse.json(
        {
          error:
            'Konfigurasi server belum lengkap: GITHUB_TOKEN dan GITHUB_USERNAME harus diset di environment server.',
        },
        { status: 500 }
      );
    }

    // 1. Verifikasi kecocokan token dengan environment server (timing-safe)
    const tokenBuf = Buffer.from(token);
    const serverBuf = Buffer.from(serverToken);
    const isTokenMatch =
      tokenBuf.length === serverBuf.length &&
      crypto.timingSafeEqual(tokenBuf, serverBuf);

    if (!isTokenMatch) {
      return NextResponse.json(
        {
          error:
            'Token yang dimasukkan tidak cocok dengan konfigurasi environment server. Akses ditolak.',
        },
        { status: 403 }
      );
    }

    // 2. Verifikasi token langsung ke GitHub REST API
    const ghRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'SANN-TOOLS-Auth-Server',
      },
      cache: 'no-store',
    });

    if (!ghRes.ok) {
      return NextResponse.json(
        { error: 'Token GitHub tidak valid atau tidak dapat diverifikasi ke GitHub API.' },
        { status: 401 }
      );
    }

    const userData = await ghRes.json();
    const authenticatedUsername = ((userData && userData.login) as string || '').toLowerCase();

    // 3. Verifikasi kepemilikan akun admin
    if (authenticatedUsername !== serverUsername) {
      return NextResponse.json(
        {
          error:
            'Akses Ditolak: Akun pemilik token tidak memiliki otorisasi administratif.',
        },
        { status: 403 }
      );
    }

    // 4. Buat session terenkripsi httpOnly (Token & username tidak dikirim ke client)
    await setAdminSessionCookie({
      username: userData.login,
      avatarUrl: userData.avatar_url,
      name: userData.name || userData.login,
    });

    return NextResponse.json({
      success: true,
      role: 'admin',
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server internal saat autentikasi.' },
      { status: 500 }
    );
  }
}
