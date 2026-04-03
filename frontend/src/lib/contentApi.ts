/**
 * Content Library API client for Wants platform
 * Manages user-generated content (images, videos, logos, etc.)
 */

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3001';
const API_VERSION = '/api/v1';
const API_URL = `${API_BASE_URL}${API_VERSION}`;

export interface UserContent {
  id: string;
  userId: string;
  contentType: 'image' | 'video' | 'logo' | 'pdf' | 'audio' | 'text';
  url: string;
  thumbnailUrl?: string;
  filename?: string;
  title?: string;
  prompt?: string;
  model?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
  metadata?: Record<string, any>;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  toolId?: string; // Tool ID for opening in contextual UI
}

export interface ContentListResponse {
  success: boolean;
  data?: {
    items: UserContent[];
    total: number;
    limit: number;
    offset: number;
  };
  error?: string;
}

export interface ContentStats {
  total: number;
  byType: Record<string, number>;
  favorites: number;
  recentCount: number;
}

class ContentApiClient {
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
   * List user content with optional filters
   */
  async listContent(options?: {
    contentType?: string;
    isFavorite?: boolean;
    limit?: number;
    offset?: number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }): Promise<ContentListResponse> {
    const params = new URLSearchParams();
    if (options?.contentType) params.append('contentType', options.contentType);
    if (options?.isFavorite !== undefined) params.append('isFavorite', String(options.isFavorite));
    if (options?.limit) params.append('limit', String(options.limit));
    if (options?.offset) params.append('offset', String(options.offset));
    if (options?.orderBy) params.append('orderBy', options.orderBy);
    if (options?.order) params.append('order', options.order);

    const queryString = params.toString();
    return this.request(`/content${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get a single content item
   */
  async getContent(contentId: string): Promise<{ success: boolean; data?: UserContent; error?: string }> {
    return this.request(`/content/${contentId}`);
  }

  /**
   * Get content statistics
   */
  async getStats(): Promise<{ success: boolean; data?: ContentStats; error?: string }> {
    return this.request('/content/stats');
  }

  /**
   * Update content (title, favorite, metadata)
   */
  async updateContent(
    contentId: string,
    data: { title?: string; isFavorite?: boolean; metadata?: Record<string, any> }
  ): Promise<{ success: boolean; data?: UserContent; error?: string }> {
    return this.request(`/content/${contentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(contentId: string): Promise<{ success: boolean; data?: UserContent; error?: string }> {
    return this.request(`/content/${contentId}/favorite`, {
      method: 'POST',
    });
  }

  /**
   * Delete content
   */
  async deleteContent(contentId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request(`/content/${contentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get signed URL for private content
   */
  async getSignedUrl(contentId: string, expiresIn?: number): Promise<{ success: boolean; data?: { url: string }; error?: string }> {
    const params = expiresIn ? `?expiresIn=${expiresIn}` : '';
    return this.request(`/content/${contentId}/signed-url${params}`);
  }
}

export const contentApi = new ContentApiClient();
