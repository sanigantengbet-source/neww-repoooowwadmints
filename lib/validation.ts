import type { Tool, Category, Settings, ToolStatus } from '@/types';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function sanitizeSlug(input: string): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateTool(
  tool: Partial<Tool>,
  existingTools: Tool[],
  isEdit = false
): ValidationResult {
  const errors: Record<string, string> = {};

  // Tool name
  const name = (tool.name || '').trim();
  if (!name) {
    errors.name = 'Tool name is required.';
  } else if (name.length > 100) {
    errors.name = 'Tool name must not exceed 100 characters.';
  }

  // Slug
  const rawSlug = (tool.slug || '').trim();
  const cleanSlug = sanitizeSlug(rawSlug || name);
  if (!cleanSlug) {
    errors.slug = 'Valid slug or name is required.';
  } else {
    const duplicateSlug = existingTools.find(
      (t) => (t.slug === cleanSlug || t.slug === rawSlug) && (!isEdit || t.id !== tool.id)
    );
    if (duplicateSlug) {
      errors.slug = `The slug "${cleanSlug}" is already in use by another tool.`;
    }
  }

  // Description
  const description = (tool.description || '').trim();
  if (!description) {
    errors.description = 'Short description is required.';
  } else if (description.length > 300) {
    errors.description = 'Description must not exceed 300 characters.';
  }

  // Category
  const category = (tool.category || '').trim();
  if (!category) {
    errors.category = 'Category is required.';
  }

  // Route
  const route = (tool.route || `/tools/${cleanSlug}`).trim();
  if (!route.startsWith('/')) {
    errors.route = 'Route path must start with a leading slash ("/").';
  } else {
    const duplicateRoute = existingTools.find(
      (t) => t.route === route && (!isEdit || t.id !== tool.id)
    );
    if (duplicateRoute) {
      errors.route = `The route "${route}" is already used by another tool.`;
    }
  }

  // ID validation
  const id = (tool.id || cleanSlug).trim();
  if (!id) {
    errors.id = 'ID is required.';
  } else if (!isEdit) {
    const duplicateId = existingTools.find((t) => t.id === id);
    if (duplicateId) {
      errors.id = `The tool ID "${id}" already exists.`;
    }
  }

  const validStatuses: ToolStatus[] = ['active', 'draft', 'disabled', 'deprecated'];
  if (tool.status && !validStatuses.includes(tool.status as ToolStatus)) {
    errors.status = 'Invalid status. Must be active, draft, disabled, or deprecated.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCategory(
  cat: Partial<Category>,
  existing: Category[],
  isEdit = false
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!cat.name || cat.name.trim().length === 0) {
    errors.name = 'Category name is required.';
  }

  if (!cat.id || cat.id.trim().length === 0) {
    errors.id = 'Category ID is required.';
  } else {
    const cleanId = sanitizeSlug(cat.id);
    if (cleanId !== cat.id) {
      errors.id = 'Category ID must be lowercase alphanumeric and hyphens.';
    } else if (!isEdit && existing.some((c) => c.id === cat.id)) {
      errors.id = 'Category ID already exists.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSettings(settings: Partial<Settings>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!settings.siteName || settings.siteName.trim().length === 0) {
    errors.siteName = 'Site name is required.';
  }

  if (
    settings.featuredToolLimit !== undefined &&
    (isNaN(settings.featuredToolLimit) || settings.featuredToolLimit < 1)
  ) {
    errors.featuredToolLimit = 'Featured limit must be at least 1.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
