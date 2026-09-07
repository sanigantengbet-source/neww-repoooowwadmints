import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/auth';
import { getAllTools, createTool, updateTool, deleteTool } from '@/lib/tools';
import { validateTool } from '@/lib/validation';
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

    const validation = validateTool(body, existingTools, false);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const newToolData: Omit<Tool, 'createdAt' | 'updatedAt'> = {
      id: body.id.trim(),
      name: body.name.trim(),
      slug: body.slug.trim(),
      description: body.description.trim(),
      longDescription: body.longDescription?.trim() || '',
      category: body.category.trim(),
      tags: Array.isArray(body.tags)
        ? body.tags.map((t: string) => t.trim()).filter(Boolean)
        : typeof body.tags === 'string'
        ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [],
      icon: body.icon?.trim() || 'Wrench',
      route: body.route.trim(),
      status: body.status || 'active',
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

    const validation = validateTool({ ...existingTool, ...updates }, existingTools, true);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const cleanUpdates: Partial<Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>> = {};
    if (updates.name !== undefined) cleanUpdates.name = updates.name.trim();
    if (updates.slug !== undefined) cleanUpdates.slug = updates.slug.trim();
    if (updates.description !== undefined) cleanUpdates.description = updates.description.trim();
    if (updates.longDescription !== undefined) cleanUpdates.longDescription = updates.longDescription.trim();
    if (updates.category !== undefined) cleanUpdates.category = updates.category.trim();
    if (updates.icon !== undefined) cleanUpdates.icon = updates.icon.trim();
    if (updates.route !== undefined) cleanUpdates.route = updates.route.trim();
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
