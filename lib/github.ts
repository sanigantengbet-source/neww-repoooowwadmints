import fs from 'fs/promises';
import path from 'path';
import type { GitHubFileResponse } from '@/types';

// Server-side only GitHub API client
// GitHub token is strictly kept server-side and never forwarded to the browser.
export const GITHUB_REPO = 'sann-tools';
export const GITHUB_BRANCH = 'main';
export const TOOLS_PATH = 'data/tools.json';
export const CATEGORIES_PATH = 'data/categories.json';
export const SETTINGS_PATH = 'data/settings.json';

export function getGitHubConfig() {
  const username = (process.env.GITHUB_USERNAME || '').trim();
  const token = (process.env.GITHUB_TOKEN || '').trim();

  return {
    token,
    owner: username,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    toolsPath: TOOLS_PATH,
    categoriesPath: CATEGORIES_PATH,
    settingsPath: SETTINGS_PATH,
  };
}

/**
 * Checks whether remote GitHub integration is fully configured.
 */
export function isGitHubConfigured(): boolean {
  const config = getGitHubConfig();
  return Boolean(config.token && config.owner);
}

/**
 * Reads a file from the repository via GitHub REST API.
 * If GitHub credentials are not configured, falls back to reading the bundled data file.
 */
export async function getRepositoryFile(filePath: string): Promise<GitHubFileResponse> {
  const config = getGitHubConfig();

  if (isGitHubConfigured()) {
    try {
      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}?ref=${config.branch}`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${config.token}`,
          'User-Agent': 'SANN-TOOLS-Server',
        },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return {
          sha: data.sha,
          content,
          encoding: 'utf-8',
        };
      }

      if (response.status === 404) {
        // File does not exist yet on remote branch, fall back to local disk if available
      } else {
        console.warn(`GitHub REST API returned status ${response.status} for ${filePath}`);
      }
    } catch (err) {
      console.warn(`Failed to fetch ${filePath} from GitHub REST API, falling back to bundled file:`, err instanceof Error ? err.message : String(err));
    }
  }

  // Local filesystem fallback (ideal for local development and build phases)
  try {
    const localPath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(localPath, 'utf-8');
    return {
      sha: 'local-sha-bundled',
      content,
      encoding: 'utf-8',
    };
  } catch (fsErr) {
    throw new Error(`Unable to read ${filePath} from either GitHub API or local fallback.`);
  }
}

/**
 * Alias for getRepositoryFile
 */
export async function getFile(filePath: string): Promise<GitHubFileResponse> {
  return getRepositoryFile(filePath);
}

/**
 * Updates a file in the GitHub repository using PUT /repos/{owner}/{repo}/contents/{path}
 * Requires the latest file SHA to prevent race conditions and overwrites.
 */
export async function updateFile(
  filePath: string,
  content: string,
  commitMessage: string,
  sha?: string
): Promise<{ success: boolean; commitSha?: string; message: string }> {
  const config = getGitHubConfig();

  if (!isGitHubConfigured()) {
    // In local dev without GitHub token, we can save to local disk if in development mode
    if (process.env.NODE_ENV !== 'production') {
      try {
        const localPath = path.join(process.cwd(), filePath);
        await fs.writeFile(localPath, content, 'utf-8');
        return {
          success: true,
          commitSha: 'local-dev-write',
          message: 'Saved changes to local workspace file (GitHub token not configured).',
        };
      } catch (err) {
        throw new Error('Failed to write to local storage: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }
    throw new Error('GitHub token or repository is not configured in server environment variables.');
  }

  // If no SHA passed, fetch the latest SHA from GitHub first to ensure safe concurrency
  let fileSha = sha;
  if (!fileSha || fileSha === 'local-sha-bundled') {
    try {
      const existing = await getRepositoryFile(filePath);
      fileSha = existing.sha;
    } catch {
      fileSha = undefined;
    }
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;
  const base64Content = Buffer.from(content, 'utf-8').toString('base64');

  const bodyPayload: Record<string, unknown> = {
    message: commitMessage,
    content: base64Content,
    branch: config.branch,
  };

  if (fileSha && fileSha !== 'local-sha-bundled') {
    bodyPayload.sha = fileSha;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'SANN-TOOLS-Server',
    },
    body: JSON.stringify(bodyPayload),
  });

  if (response.status === 409) {
    throw new Error('Data has changed. Please refresh and try again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = (errorData && typeof errorData.message === 'string')
      ? errorData.message
      : `GitHub API error (status ${response.status})`;
    throw new Error(`Unable to update ${filePath} on GitHub: ${message}`);
  }

  const result = await response.json();
  return {
    success: true,
    commitSha: result.commit?.sha || 'committed',
    message: 'Successfully committed changes to GitHub repository.',
  };
}

/**
 * Creates a commit with the updated file content.
 */
export async function createCommit(
  filePath: string,
  content: string,
  commitMessage: string,
  sha?: string
) {
  return updateFile(filePath, content, commitMessage, sha);
}

/**
 * Safe JSON parser for GitHub file contents.
 */
export function parseJSONFile<T>(rawContent: string, defaultValue: T): T {
  try {
    return JSON.parse(rawContent) as T;
  } catch (err) {
    console.error('Failed to parse JSON file content:', err);
    return defaultValue;
  }
}
