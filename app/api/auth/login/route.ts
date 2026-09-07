import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { setAdminSessionCookie, getAdminUsername } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userProvidedToken = typeof body.token === 'string' ? body.token.trim() : '';
    const useServerConfig = Boolean(body.useServerConfig);

    const serverUsername = getAdminUsername();
    const serverToken = (process.env.GITHUB_TOKEN || '').trim();

    if (!serverUsername) {
      return NextResponse.json(
        {
          error:
            'Server configuration missing: GITHUB_USERNAME is required in environment variables.',
        },
        { status: 500 }
      );
    }

    // Determine which token to verify with GitHub
    let tokenToVerify = userProvidedToken;

    if (!tokenToVerify && (useServerConfig || serverToken)) {
      tokenToVerify = serverToken;
    }

    if (!tokenToVerify) {
      return NextResponse.json(
        {
          error:
            'GitHub token is required. Please provide a Personal Access Token or configure GITHUB_TOKEN in your environment.',
        },
        { status: 400 }
      );
    }

    // Verify token directly with GitHub API
    const ghRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenToVerify}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'SANN-TOOLS-Auth-Server',
      },
      cache: 'no-store',
    });

    if (!ghRes.ok) {
      return NextResponse.json(
        {
          error:
            'GitHub authentication failed. Please check that your Personal Access Token is valid and not expired.',
        },
        { status: 401 }
      );
    }

    const userData = await ghRes.json();
    const authenticatedUsername = (userData.login as string || '').toLowerCase();

    // Strict Authorization check: Authenticated GitHub user MUST match GITHUB_USERNAME
    if (authenticatedUsername !== serverUsername) {
      return NextResponse.json(
        {
          error: `Access Denied: Authenticated GitHub user @${userData.login} does not match configured admin @${serverUsername}.`,
        },
        { status: 403 }
      );
    }

    // If a user typed a token manually and serverToken is configured, ensure it matches
    if (userProvidedToken && serverToken) {
      const tokenBuf = Buffer.from(userProvidedToken);
      const serverBuf = Buffer.from(serverToken);
      const isTokenMatch =
        tokenBuf.length === serverBuf.length &&
        crypto.timingSafeEqual(tokenBuf, serverBuf);

      if (!isTokenMatch) {
        return NextResponse.json(
          {
            error:
              'Access Denied: The provided token does not match the configured repository admin token.',
          },
          { status: 403 }
        );
      }
    }

    // Success: set secure, httpOnly, signed session cookie.
    // The token itself is NEVER included in cookie, NEVER sent in response, and NEVER exposed to frontend.
    await setAdminSessionCookie({
      username: userData.login,
      avatarUrl: userData.avatar_url,
      name: userData.name || userData.login,
    });

    return NextResponse.json({
      success: true,
      user: {
        username: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
