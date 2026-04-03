/**
 * Apps API client for Wants platform
 * Manages user-generated applications
 */

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3001';
const API_VERSION = '/api/v1';
const API_URL = `${API_BASE_URL}${API_VERSION}`;

export interface UserApp {
  id: string;
  userId: string;
  name: string;
  description?: string;
  slug: string;
  conversationId?: string; // Link to the chat conversation where app was created
  status: 'draft' | 'generated' | 'building' | 'deployed' | 'failed' | 'archived';

  frontendFramework?: string;
  backendFramework?: string;
  mobileFramework?: string;

  hasFrontend: boolean;
  hasBackend: boolean;
  hasMobile: boolean;

  frontendUrl?: string;
  backendUrl?: string;
  iosAppStoreUrl?: string;
  androidPlayStoreUrl?: string;

  deployConfig?: Record<string, any>;
  secrets?: Record<string, any>;

  github?: {
    repoOwner: string;
    repoName: string;
    repoFullName: string;
    branch?: string;
    lastPushedAt?: string;
    lastPulledAt?: string;
    lastCommitSha?: string;
    autoSync?: boolean;
  } | null;

  thumbnailUrl?: string;
  previewImages?: string[];

  generationPrompt?: string;
  generationModel?: string;
  generationTokensUsed?: number;

  metadata?: Record<string, any>;
  tags?: string[];
  isFavorite: boolean;
  isPublic: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface AppListResponse {
  success: boolean;
  data?: {
    items: UserApp[];
    total: number;
    limit: number;
    offset: number;
  };
  error?: string;
}

export interface AppStats {
  total: number;
  byStatus: Record<string, number>;
  favorites: number;
  withGitHub: number;
  deployed: number;
}

export interface CreateAppDto {
  name: string;
  description?: string;
  slug?: string;
  frontendFramework?: string;
  backendFramework?: string;
  mobileFramework?: string;
  hasFrontend?: boolean;
  hasBackend?: boolean;
  hasMobile?: boolean;
  generationPrompt?: string;
  generationModel?: string;
  thumbnailUrl?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateAppDto {
  name?: string;
  description?: string;
  status?: UserApp['status'];
  frontendUrl?: string;
  backendUrl?: string;
  iosAppStoreUrl?: string;
  androidPlayStoreUrl?: string;
  deployConfig?: Record<string, any>;
  secrets?: Record<string, any>;
  thumbnailUrl?: string;
  previewImages?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  isFavorite?: boolean;
  isPublic?: boolean;
}

export interface UpdateGitHubSyncDto {
  repoOwner: string;
  repoName: string;
  repoFullName: string;
  branch?: string;
  lastPushedAt?: string;
  lastPulledAt?: string;
  lastCommitSha?: string;
  autoSync?: boolean;
}

class AppsApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        mode: 'cors',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  /**
   * Create a new app
   */
  async createApp(data: CreateAppDto): Promise<{ success: boolean; data?: UserApp; error?: string }> {
    return this.request('/apps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * List user apps with optional filters
   */
  async listApps(options?: {
    status?: string;
    isFavorite?: boolean;
    hasGitHub?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Promise<AppListResponse> {
    const params = new URLSearchParams();
    if (options?.status) params.append('status', options.status);
    if (options?.isFavorite !== undefined) params.append('isFavorite', String(options.isFavorite));
    if (options?.hasGitHub !== undefined) params.append('hasGitHub', String(options.hasGitHub));
    if (options?.search) params.append('search', options.search);
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));
    if (options?.orderBy) params.append('orderBy', options.orderBy);
    if (options?.order) params.append('order', options.order);

    const queryString = params.toString();
    return this.request(`/apps${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get a single app by ID
   */
  async getApp(appId: string): Promise<{ success: boolean; data?: UserApp; error?: string }> {
    return this.request(`/apps/${appId}`);
  }

  /**
   * Get app statistics
   */
  async getStats(): Promise<{ success: boolean; data?: AppStats; error?: string }> {
    return this.request('/apps/stats');
  }

  /**
   * Update app
   */
  async updateApp(appId: string, data: UpdateAppDto): Promise<{ success: boolean; data?: UserApp; error?: string }> {
    return this.request(`/apps/${appId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Partial update app
   */
  async patchApp(appId: string, data: Partial<UpdateAppDto>): Promise<{ success: boolean; data?: UserApp; error?: string }> {
    return this.request(`/apps/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(appId: string): Promise<{ success: boolean; data?: UserApp; error?: string }> {
    return this.request(`/apps/${appId}/favorite`, {
      method: 'POST',
    });
  }

  /**
   * Update GitHub sync info
   */
  async updateGitHubSync(appId: string, data: UpdateGitHubSyncDto): Promise<{ success: boolean; data?: UserApp; error?: string }> {
    return this.request(`/apps/${appId}/github`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Clear GitHub sync info
   */
  async clearGitHubSync(appId: string): Promise<{ success: boolean; data?: UserApp; error?: string }> {
    return this.request(`/apps/${appId}/github`, {
      method: 'DELETE',
    });
  }

  /**
   * Delete app
   */
  async deleteApp(appId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/apps/${appId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get app by conversation ID
   */
  async getAppByConversationId(conversationId: string): Promise<{ success: boolean; data?: UserApp; error?: string }> {
    return this.request(`/apps/by-conversation/${conversationId}`);
  }
}

export const appsApi = new AppsApiClient();
