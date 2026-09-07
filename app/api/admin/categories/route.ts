import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminSession } from '@/lib/auth';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/categories';
import { validateCategory } from '@/lib/validation';
import type { Category } from '@/types';

export async function GET() {
  const session = await getVerifiedAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
  }

  try {
    const categories = await getAllCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    return NextResponse.json(
      { error: 'Unable to retrieve categories right now.' },
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
    const existing = await getAllCategories();

    const validation = validateCategory(body, existing, false);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const newCategory: Category = {
      id: body.id.trim(),
      name: body.name.trim(),
      description: body.description?.trim() || '',
      icon: body.icon?.trim() || 'Folder',
    };

    const result = await createCategory(newCategory);
    return NextResponse.json({
      success: true,
      category: result.category,
      commitSha: result.commitSha,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to create category.';
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
      return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
    }

    const existing = await getAllCategories();
    const validation = validateCategory({ id, ...updates }, existing, true);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const result = await updateCategory(id, updates);
    return NextResponse.json({
      success: true,
      category: result.category,
      commitSha: result.commitSha,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to update category.';
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
      return NextResponse.json({ error: 'Category ID is required in query params.' }, { status: 400 });
    }

    const result = await deleteCategory(id);
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.',
      commitSha: result.commitSha,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unable to delete category.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
