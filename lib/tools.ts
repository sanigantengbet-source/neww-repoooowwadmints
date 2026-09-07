import { revalidatePath } from 'next/cache';
import { getRepositoryFile, updateFile, parseJSONFile, TOOLS_PATH } from './github';
import type { Tool, ToolStatus } from '@/types';

const TOOLS_FILE_PATH = TOOLS_PATH;

/**
 * Retrieves all tools from the repository data source.
 */
export async function getAllTools(): Promise<Tool[]> {
  try {
    const file = await getRepositoryFile(TOOLS_FILE_PATH);
    const tools = parseJSONFile<Tool[]>(file.content, []);
    return tools;
  } catch (err) {
    console.error('Error loading tools:', err);
    return [];
  }
}

/**
 * Retrieves active public tools for the frontend with optional filters.
 */
export async function getPublicTools(filters?: {
  category?: string;
  tag?: string;
  query?: string;
  featured?: boolean;
  popular?: boolean;
}): Promise<Tool[]> {
  const tools = await getAllTools();
  let result = tools.filter((t) => t.status === 'active');

  if (filters?.category) {
    result = result.filter(
      (t) => t.category.toLowerCase() === filters.category!.toLowerCase()
    );
  }

  if (filters?.tag) {
    const tagQuery = filters.tag.toLowerCase();
    result = result.filter((t) =>
      t.tags?.some((tag) => tag.toLowerCase() === tagQuery)
    );
  }

  if (filters?.query) {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
        t.category.toLowerCase().includes(q)
    );
  }

  if (filters?.featured) {
    result = result.filter((t) => t.featured);
  }

  if (filters?.popular) {
    result = result.filter((t) => t.popular);
  }

  return result;
}

/**
 * Retrieves a tool by its unique URL slug.
 */
export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const tools = await getAllTools();
  return tools.find((t) => t.slug === slug) || null;
}

/**
 * Retrieves a tool by its ID.
 */
export async function getToolById(id: string): Promise<Tool | null> {
  const tools = await getAllTools();
  return tools.find((t) => t.id === id) || null;
}

/**
 * Adds a new tool and commits the update to GitHub.
 */
export async function createTool(
  newTool: Omit<Tool, 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; tool: Tool; commitSha?: string }> {
  const file = await getRepositoryFile(TOOLS_FILE_PATH);
  const tools = parseJSONFile<Tool[]>(file.content, []);

  // Safety check for duplicates
  if (tools.some((t) => t.id === newTool.id)) {
    throw new Error(`Tool with ID "${newTool.id}" already exists.`);
  }
  if (tools.some((t) => t.slug === newTool.slug)) {
    throw new Error(`Tool with slug "${newTool.slug}" already exists.`);
  }

  const now = new Date().toISOString();
  const toolRecord: Tool = {
    ...newTool,
    createdAt: now,
    updatedAt: now,
  };

  const updatedTools = [...tools, toolRecord];
  const newContent = JSON.stringify(updatedTools, null, 2) + '\n';
  const commitMessage = `feat: add ${toolRecord.name.toLowerCase()} tool`;

  const commitResult = await updateFile(TOOLS_FILE_PATH, newContent, commitMessage, file.sha);

  revalidatePath('/');
  revalidatePath('/tools');
  revalidatePath(`/tools/${toolRecord.slug}`);
  revalidatePath('/admin');
  revalidatePath('/admin/tools');

  return {
    success: true,
    tool: toolRecord,
    commitSha: commitResult.commitSha,
  };
}

/**
 * Updates an existing tool and commits to GitHub.
 */
export async function updateTool(
  id: string,
  updates: Partial<Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<{ success: boolean; tool: Tool; commitSha?: string }> {
  const file = await getRepositoryFile(TOOLS_FILE_PATH);
  const tools = parseJSONFile<Tool[]>(file.content, []);

  const toolIndex = tools.findIndex((t) => t.id === id);
  if (toolIndex === -1) {
    throw new Error(`Tool with ID "${id}" was not found.`);
  }

  const existingTool = tools[toolIndex];
  const updatedTool: Tool = {
    ...existingTool,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  tools[toolIndex] = updatedTool;
  const newContent = JSON.stringify(tools, null, 2) + '\n';
  const commitMessage = `fix: update ${updatedTool.name.toLowerCase()} tool`;

  const commitResult = await updateFile(TOOLS_FILE_PATH, newContent, commitMessage, file.sha);

  revalidatePath('/');
  revalidatePath('/tools');
  revalidatePath(`/tools/${updatedTool.slug}`);
  revalidatePath('/admin');
  revalidatePath('/admin/tools');

  return {
    success: true,
    tool: updatedTool,
    commitSha: commitResult.commitSha,
  };
}

/**
 * Deletes a tool from the catalog and commits the change to GitHub.
 */
export async function deleteTool(id: string): Promise<{ success: boolean; commitSha?: string }> {
  const file = await getRepositoryFile(TOOLS_FILE_PATH);
  const tools = parseJSONFile<Tool[]>(file.content, []);

  const tool = tools.find((t) => t.id === id);
  if (!tool) {
    throw new Error(`Tool with ID "${id}" was not found.`);
  }

  const filtered = tools.filter((t) => t.id !== id);
  const newContent = JSON.stringify(filtered, null, 2) + '\n';
  const commitMessage = `chore: remove ${tool.name.toLowerCase()} tool`;

  const commitResult = await updateFile(TOOLS_FILE_PATH, newContent, commitMessage, file.sha);

  revalidatePath('/');
  revalidatePath('/tools');
  revalidatePath('/admin');
  revalidatePath('/admin/tools');

  return {
    success: true,
    commitSha: commitResult.commitSha,
  };
}

/**
 * Toggles status (active, draft, disabled) of a tool
 */
export async function setToolStatus(id: string, status: ToolStatus) {
  return updateTool(id, { status });
}
