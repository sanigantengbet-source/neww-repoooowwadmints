import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/auth';
import { getSettings, updateSettings } from '@/lib/settings';
import { validateSettings } from '@/lib/validation';

export async function GET() {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
  }

  try {
    const settings = await getSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({ error: 'Unable to retrieve settings.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = validateSettings(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const result = await updateSettings({
      siteName: body.siteName?.trim(),
      siteDescription: body.siteDescription?.trim(),
      maintenanceMode: Boolean(body.maintenanceMode),
      featuredToolLimit: Number(body.featuredToolLimit) || 6,
      popularToolLimit: Number(body.popularToolLimit) || 6,
    });

    return NextResponse.json({
      success: true,
      settings: result.settings,
      commitSha: result.commitSha,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to update settings.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
