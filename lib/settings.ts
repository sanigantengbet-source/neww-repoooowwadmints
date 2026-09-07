import { revalidatePath } from 'next/cache';
import { getRepositoryFile, updateFile, parseJSONFile, SETTINGS_PATH } from './github';
import type { Settings } from '@/types';

const SETTINGS_FILE_PATH = SETTINGS_PATH;

const DEFAULT_SETTINGS: Settings = {
  siteName: 'SANN TOOLS',
  siteDescription: 'Useful tools. One simple place.',
  maintenanceMode: false,
  featuredToolLimit: 6,
  popularToolLimit: 6,
};

export async function getSettings(): Promise<Settings> {
  try {
    const file = await getRepositoryFile(SETTINGS_FILE_PATH);
    return parseJSONFile<Settings>(file.content, DEFAULT_SETTINGS);
  } catch (err) {
    console.error('Error reading settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(
  updates: Partial<Settings>
): Promise<{ success: boolean; settings: Settings; commitSha?: string }> {
  const file = await getRepositoryFile(SETTINGS_FILE_PATH);
  const currentSettings = parseJSONFile<Settings>(file.content, DEFAULT_SETTINGS);

  const updatedSettings: Settings = {
    ...currentSettings,
    ...updates,
  };

  const newContent = JSON.stringify(updatedSettings, null, 2) + '\n';
  const commitMessage = 'chore: update platform settings';

  const commitResult = await updateFile(SETTINGS_FILE_PATH, newContent, commitMessage, file.sha);

  revalidatePath('/');
  revalidatePath('/tools');
  revalidatePath('/admin/settings');

  return {
    success: true,
    settings: updatedSettings,
    commitSha: commitResult.commitSha,
  };
}
