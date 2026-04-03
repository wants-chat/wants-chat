/**
 * App Files Service
 * Handles fetching file trees and content from the backend
 */

import { api } from '../lib/api';

export interface FileTreeItem {
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  children?: FileTreeItem[];
}

export interface FileContent {
  content: string;
  path: string;
  language: string;
}

export interface AppInfo {
  hasFrontend: boolean;
  hasBackend: boolean;
  hasMobile?: boolean;
}

export interface ReadmeContent {
  content: string;
  exists: boolean;
}

class AppFilesService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data or fetch new data
   */
  private async getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data as T;
    }
    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Get app info (what types of code are available)
   */
  async getAppInfo(appId: string): Promise<AppInfo> {
    return this.getCachedOrFetch(`info:${appId}`, async () => {
      // api.get returns data directly, not wrapped in { data }
      return await api.get(`/app-files/${appId}/info`);
    });
  }

  /**
   * Get file tree for frontend, backend, or mobile
   */
  async getFileTree(appId: string, type: 'frontend' | 'backend' | 'mobile'): Promise<FileTreeItem[]> {
    return this.getCachedOrFetch(`tree:${appId}:${type}`, async () => {
      try {
        // api.get returns data directly, not wrapped in { data }
        const data = await api.get(`/app-files/${appId}/files/${type}`);
        // Ensure we always return an array
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error(`Failed to fetch ${type} file tree for ${appId}:`, error);
        return []; // Return empty array on error
      }
    });
  }

  /**
   * Get file content
   */
  async getFileContent(appId: string, type: 'frontend' | 'backend' | 'mobile', filePath: string): Promise<FileContent> {
    return this.getCachedOrFetch(`content:${appId}:${type}:${filePath}`, async () => {
      // api.post returns data directly, not wrapped in { data }
      return await api.post(`/app-files/${appId}/content/${type}`, { filePath });
    });
  }

  /**
   * Get README content for an app
   */
  async getReadme(appId: string): Promise<ReadmeContent> {
    return this.getCachedOrFetch(`readme:${appId}`, async () => {
      try {
        // api.get returns data directly, not wrapped in { data }
        const data = await api.get(`/app-files/${appId}/readme`);
        return data as ReadmeContent;
      } catch (error) {
        console.error(`Failed to fetch README for ${appId}:`, error);
        return { content: '', exists: false };
      }
    });
  }

  /**
   * Download app as ZIP archive
   */
  async downloadApp(appId: string): Promise<Blob> {
    const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/v1/app-files/${appId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Update file content
   */
  async updateFileContent(
    appId: string,
    type: 'frontend' | 'backend' | 'mobile',
    filePath: string,
    content: string
  ): Promise<{ success: boolean; path: string }> {
    // Clear cache for this file
    this.cache.delete(`content:${appId}:${type}:${filePath}`);

    return await api.put(`/app-files/${appId}/content/${type}`, { filePath, content });
  }

  /**
   * Clear cache for an app
   */
  clearCache(appId?: string): void {
    if (appId) {
      for (const key of this.cache.keys()) {
        if (key.includes(appId)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

export const appFilesService = new AppFilesService();
