import { revalidatePath } from 'next/cache';
import { getRepositoryFile, updateFile, parseJSONFile, CATEGORIES_PATH } from './github';
import { getAllTools } from './tools';
import type { Category } from '@/types';

const CATEGORIES_FILE_PATH = CATEGORIES_PATH;

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'developer',
    name: 'Developer',
    description: 'Essential formatters, encoders, and converters for web developers.',
    icon: 'Code2',
  },
  {
    id: 'security',
    name: 'Security & Identity',
    description: 'Cryptographic tokens, hash helpers, secure passwords, and UUIDs.',
    icon: 'ShieldCheck',
  },
  {
    id: 'text',
    name: 'Text & Content',
    description: 'String manipulation, text analysis, case transforms, and slugification.',
    icon: 'Type',
  },
  {
    id: 'generator',
    name: 'Generators',
    description: 'Fast browser generators for QR codes, random strings, and keys.',
    icon: 'QrCode',
  },
  {
    id: 'utilities',
    name: 'General Utilities',
    description: 'Everyday time, unit, and color transformation tools.',
    icon: 'Wrench',
  },
];

/**
 * Retrieves all categories.
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    const file = await getRepositoryFile(CATEGORIES_FILE_PATH);
    const parsed = parseJSONFile<Category[]>(file.content, []);
    if (parsed && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_CATEGORIES;
  } catch (err) {
    console.error('Error reading categories, using defaults:', err);
    return DEFAULT_CATEGORIES;
  }
}

/**
 * Retrieves a category by ID.
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getAllCategories();
  return categories.find((c) => c.id === id) || null;
}

/**
 * Creates a new category and commits to GitHub.
 */
export async function createCategory(
  category: Category
): Promise<{ success: boolean; category: Category; commitSha?: string }> {
  const file = await getRepositoryFile(CATEGORIES_FILE_PATH);
  const categories = parseJSONFile<Category[]>(file.content, []);

  if (categories.some((c) => c.id === category.id)) {
    throw new Error(`Category with ID "${category.id}" already exists.`);
  }

  const updatedCategories = [...categories, category];
  const newContent = JSON.stringify(updatedCategories, null, 2) + '\n';
  const commitMessage = `feat: add ${category.name.toLowerCase()} category`;

  const commitResult = await updateFile(CATEGORIES_FILE_PATH, newContent, commitMessage, file.sha);

  revalidatePath('/');
  revalidatePath('/tools');
  revalidatePath('/admin/categories');

  return {
    success: true,
    category,
    commitSha: commitResult.commitSha,
  };
}

/**
 * Updates a category and commits to GitHub.
 */
export async function updateCategory(
  id: string,
  updates: Partial<Omit<Category, 'id'>>
): Promise<{ success: boolean; category: Category; commitSha?: string }> {
  const file = await getRepositoryFile(CATEGORIES_FILE_PATH);
  const categories = parseJSONFile<Category[]>(file.content, []);

  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error(`Category with ID "${id}" was not found.`);
  }

  const updatedCategory: Category = {
    ...categories[index],
    ...updates,
  };

  categories[index] = updatedCategory;
  const newContent = JSON.stringify(categories, null, 2) + '\n';
  const commitMessage = `fix: update ${updatedCategory.name.toLowerCase()} category`;

  const commitResult = await updateFile(CATEGORIES_FILE_PATH, newContent, commitMessage, file.sha);

  revalidatePath('/');
  revalidatePath('/tools');
  revalidatePath('/admin/categories');

  return {
    success: true,
    category: updatedCategory,
    commitSha: commitResult.commitSha,
  };
}

/**
 * Deletes a category if not in use by any tools.
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; commitSha?: string }> {
  // Check if any tool uses this category
  const tools = await getAllTools();
  const linkedTools = tools.filter((t) => t.category === id);
  if (linkedTools.length > 0) {
    throw new Error(
      `Cannot delete category "${id}" because it is currently used by ${linkedTools.length} tool(s): ${linkedTools
        .map((t) => t.name)
        .slice(0, 3)
        .join(', ')}${linkedTools.length > 3 ? '...' : ''}. Reassign or remove these tools first.`
    );
  }

  const file = await getRepositoryFile(CATEGORIES_FILE_PATH);
  const categories = parseJSONFile<Category[]>(file.content, []);

  const cat = categories.find((c) => c.id === id);
  if (!cat) {
    throw new Error(`Category with ID "${id}" was not found.`);
  }

  const filtered = categories.filter((c) => c.id !== id);
  const newContent = JSON.stringify(filtered, null, 2) + '\n';
  const commitMessage = `chore: remove ${cat.name.toLowerCase()} category`;

  const commitResult = await updateFile(CATEGORIES_FILE_PATH, newContent, commitMessage, file.sha);

  revalidatePath('/');
  revalidatePath('/tools');
  revalidatePath('/admin/categories');

  return {
    success: true,
    commitSha: commitResult.commitSha,
  };
}
