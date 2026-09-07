export type ToolStatus = 'active' | 'draft' | 'disabled' | 'deprecated';

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  tags: string[];
  icon: string;
  route: string;
  status: ToolStatus;
  featured: boolean;
  popular: boolean;
  author?: string;
  version?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Settings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  featuredToolLimit: number;
  popularToolLimit: number;
}

export interface AdminSession {
  username: string;
  avatarUrl?: string;
  name?: string;
  role: 'admin';
  expiresAt: number;
}

export interface GitHubFileResponse {
  sha: string;
  content: string;
  encoding?: string;
}
