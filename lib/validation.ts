import type { Tool, Category, Settings, ToolStatus } from '@/types';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function sanitizeSlug(input: string): string {
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

  if (!tool.name || tool.name.trim().length === 0) {
    errors.name = 'Tool name is required.';
  } else if (tool.name.length > 80) {
    errors.name = 'Tool name must not exceed 80 characters.';
  }

  if (!tool.slug || tool.slug.trim().length === 0) {
    errors.slug = 'Slug is required.';
  } else {
    const cleanSlug = sanitizeSlug(tool.slug);
    if (cleanSlug !== tool.slug) {
      errors.slug = 'Slug must only contain lowercase letters, numbers, and hyphens.';
    } else {
      const duplicateSlug = existingTools.find(
        (t) => t.slug === tool.slug && (!isEdit || t.id !== tool.id)
      );
      if (duplicateSlug) {
        errors.slug = `The slug "${tool.slug}" is already in use by another tool.`;
      }
    }
  }

  if (!tool.description || tool.description.trim().length === 0) {
    errors.description = 'Short description is required.';
  } else if (tool.description.length > 200) {
    errors.description = 'Description must not exceed 200 characters.';
  }

  if (!tool.category || tool.category.trim().length === 0) {
    errors.category = 'Category is required.';
  }

  if (!tool.route || tool.route.trim().length === 0) {
    errors.route = 'Route path is required (e.g. /tools/my-tool).';
  } else {
    if (!tool.route.startsWith('/')) {
      errors.route = 'Route path must start with a leading slash ("/").';
    }
    const duplicateRoute = existingTools.find(
      (t) => t.route === tool.route && (!isEdit || t.id !== tool.id)
    );
    if (duplicateRoute) {
      errors.route = `The route "${tool.route}" is already used by another tool.`;
    }
  }

  if (!isEdit) {
    if (!tool.id || tool.id.trim().length === 0) {
      errors.id = 'ID is required.';
    } else {
      const duplicateId = existingTools.find((t) => t.id === tool.id);
      if (duplicateId) {
        errors.id = `The tool ID "${tool.id}" already exists.`;
      }
    }
  }

  const validStatuses: ToolStatus[] = ['active', 'draft', 'disabled'];
  if (tool.status && !validStatuses.includes(tool.status as ToolStatus)) {
    errors.status = 'Invalid status. Must be active, draft, or disabled.';
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
