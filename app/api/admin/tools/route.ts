import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/auth';
import { getAllTools, createTool, updateTool, deleteTool } from '@/lib/tools';
import { validateTool, sanitizeSlug } from '@/lib/validation';
import type { Tool } from '@/types';

export async function GET() {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
  }

  try {
    const tools = await getAllTools();
    return NextResponse.json({ tools });
  } catch (err) {
    console.error('Failed to get tools:', err);
    return NextResponse.json(
      { error: 'Unable to retrieve tools data right now.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const existingTools = await getAllTools();

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const rawSlug = typeof body.slug === 'string' ? body.slug.trim() : '';
    const cleanSlug = sanitizeSlug(rawSlug || name) || `tool-${Date.now().toString(36)}`;
    const id = (typeof body.id === 'string' && body.id.trim()) ? sanitizeSlug(body.id.trim()) : cleanSlug;
    const rawRoute = typeof body.route === 'string' ? body.route.trim() : '';
    const route = rawRoute ? (rawRoute.startsWith('/') ? rawRoute : `/${rawRoute}`) : `/tools/${cleanSlug}`;
    const category = (typeof body.category === 'string' && body.category.trim()) ? body.category.trim() : 'developer';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const icon = (typeof body.icon === 'string' && body.icon.trim()) ? body.icon.trim() : 'Wrench';
    const status = body.status || 'active';

    const preparedTool = {
      ...body,
      id,
      name,
      slug: cleanSlug,
      route,
      category,
      description,
      icon,
      status,
    };

    const validation = validateTool(preparedTool, existingTools, false);
    if (!validation.valid) {
      const errorMsg = Object.values(validation.errors).join(', ');
      return NextResponse.json(
        { error: `Validation failed: ${errorMsg}`, validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const newToolData: Omit<Tool, 'createdAt' | 'updatedAt'> = {
      id: preparedTool.id,
      name: preparedTool.name,
      slug: preparedTool.slug,
      description: preparedTool.description,
      longDescription: typeof body.longDescription === 'string' ? body.longDescription.trim() : '',
      category: preparedTool.category,
      tags: Array.isArray(body.tags)
        ? body.tags.map((t: string) => t.trim()).filter(Boolean)
        : typeof body.tags === 'string'
        ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [],
      icon: preparedTool.icon,
      route: preparedTool.route,
      status: preparedTool.status,
      featured: Boolean(body.featured),
      popular: Boolean(body.popular),
    };

    const result = await createTool(newToolData);
    return NextResponse.json({
      success: true,
      message: `Tool "${result.tool.name}" created successfully.`,
      tool: result.tool,
      commitSha: result.commitSha,
    });
  } catch (err) {
    console.error('Failed to create tool:', err);
    const message = err instanceof Error ? err.message : 'Unable to create tool right now.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Tool ID is required for updating.' }, { status: 400 });
    }

    const existingTools = await getAllTools();
    const existingTool = existingTools.find((t) => t.id === id);
    if (!existingTool) {
      return NextResponse.json({ error: `Tool with ID "${id}" does not exist.` }, { status: 404 });
    }

    const rawSlug = updates.slug !== undefined ? updates.slug : existingTool.slug;
    const cleanSlug = sanitizeSlug(rawSlug) || existingTool.slug;
    const rawRoute = updates.route !== undefined ? updates.route : (existingTool.route || `/tools/${cleanSlug}`);
    const route = rawRoute.startsWith('/') ? rawRoute : `/${rawRoute}`;

    const candidateTool = {
      ...existingTool,
      ...updates,
      slug: cleanSlug,
      route,
    };

    const validation = validateTool(candidateTool, existingTools, true);
    if (!validation.valid) {
      const errorMsg = Object.values(validation.errors).join(', ');
      return NextResponse.json(
        { error: `Validation failed: ${errorMsg}`, validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const cleanUpdates: Partial<Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>> = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
    if (updates.slug !== undefined) cleanUpdates.slug = cleanSlug;
    if (updates.description !== undefined) cleanUpdates.description = updates.description.trim();
    if (updates.longDescription !== undefined) cleanUpdates.longDescription = updates.longDescription.trim();
    if (updates.category !== undefined) cleanUpdates.category = updates.category.trim();
    if (updates.icon !== undefined) cleanUpdates.icon = updates.icon.trim();
    if (updates.route !== undefined) cleanUpdates.route = route;
    if (updates.status !== undefined) cleanUpdates.status = updates.status;
    if (updates.featured !== undefined) cleanUpdates.featured = Boolean(updates.featured);
    if (updates.popular !== undefined) cleanUpdates.popular = Boolean(updates.popular);
    if (updates.tags !== undefined) {
      cleanUpdates.tags = Array.isArray(updates.tags)
        ? updates.tags.map((t: string) => t.trim()).filter(Boolean)
        : typeof updates.tags === 'string'
        ? updates.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [];
    }

    const result = await updateTool(id, cleanUpdates);
    return NextResponse.json({
      success: true,
      message: `Tool "${result.tool.name}" updated successfully.`,
      tool: result.tool,
      commitSha: result.commitSha,
    });
  } catch (err) {
    console.error('Failed to update tool:', err);
    const message = err instanceof Error ? err.message : 'Unable to update tool right now.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Tool ID is required in query params.' }, { status: 400 });
    }

    const result = await deleteTool(id);
    return NextResponse.json({
      success: true,
      message: 'Tool removed successfully.',
      commitSha: result.commitSha,
    });
  } catch (err) {
    console.error('Failed to delete tool:', err);
    const message = err instanceof Error ? err.message : 'Unable to delete tool right now.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
