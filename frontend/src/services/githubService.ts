import { api } from '../lib/api';

export interface GitHubConnection {
  id: string;
  userId: string;
  githubId: string;
  githubLogin: string;
  githubName?: string;
  githubEmail?: string;
  githubAvatar?: string;
  installationId: string;
  isActive: boolean;
  lastSyncedAt?: string;
  createdAt: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description?: string;
  isPrivate: boolean;
  defaultBranch: string;
  htmlUrl: string;
  cloneUrl: string;
}

export interface AppGitHubLink {
  id: string;
  appId: string;
  userId: string;
  repoOwner: string;
  repoName: string;
  repoFullName: string;
  branch: string;
  lastPushedAt?: string;
  lastPulledAt?: string;
  lastCommitSha?: string;
  autoSync: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubSyncStatus {
  appId: string;
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  isConnected: boolean;
  lastPushedAt?: string;
  lastPulledAt?: string;
  lastCommitSha?: string;
  hasLocalChanges: boolean;
  hasRemoteChanges: boolean;
}

export interface PushToGitHubRequest {
  appId: string;
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  commitMessage?: string;
  createIfNotExists?: boolean;
}

export interface PullFromGitHubRequest {
  appId: string;
  repoOwner: string;
  repoName: string;
  branch?: string;
}

export interface CreateRepoRequest {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

class GitHubService {
  private baseUrl = '/app-github';

  /**
   * Get installation URL for connecting GitHub
   */
  async getInstallUrl(returnUrl?: string): Promise<{ url: string }> {
    const params = returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : '';
    return api.get(`${this.baseUrl}/oauth/install-url${params}`);
  }

  /**
   * Get current GitHub connection status
   */
  async getConnection(): Promise<GitHubConnection | null> {
    try {
      return await api.get(`${this.baseUrl}/connection`);
    } catch {
      return null;
    }
  }

  /**
   * Disconnect GitHub
   */
  async disconnect(): Promise<void> {
    await api.delete(`${this.baseUrl}/disconnect`);
  }

  /**
   * List accessible repositories
   */
  async listRepositories(): Promise<GitHubRepo[]> {
    return api.get(`${this.baseUrl}/repositories`);
  }

  /**
   * Create a new repository
   */
  async createRepository(data: CreateRepoRequest): Promise<GitHubRepo> {
    return api.post(`${this.baseUrl}/repositories`, data);
  }

  /**
   * Push app code to GitHub
   */
  async pushToGitHub(data: PushToGitHubRequest): Promise<AppGitHubLink> {
    return api.post(`${this.baseUrl}/push`, data);
  }

  /**
   * Pull code from GitHub to app
   */
  async pullFromGitHub(data: PullFromGitHubRequest): Promise<AppGitHubLink> {
    return api.post(`${this.baseUrl}/pull`, data);
  }

  /**
   * Get sync status for an app
   */
  async getSyncStatus(appId: string): Promise<GitHubSyncStatus | null> {
    try {
      return await api.get(`${this.baseUrl}/apps/${appId}/status`);
    } catch {
      return null;
    }
  }

  /**
   * Get GitHub link for an app
   */
  async getAppLink(appId: string): Promise<AppGitHubLink | null> {
    try {
      return await api.get(`${this.baseUrl}/apps/${appId}/link`);
    } catch {
      return null;
    }
  }
}

export const githubService = new GitHubService();
