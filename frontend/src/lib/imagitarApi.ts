/**
 * AI Generation API client for Wants platform
 * Connects to Wants backend for image, video, logo generation using Runware
 */

// API Configuration - uses Wants backend
const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3001';
const API_VERSION = '/api/v1';
const API_URL = `${API_BASE_URL}${API_VERSION}`;

export interface ImageGenerationParams {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  numberResults?: number;
  steps?: number;
  cfgScale?: number;
  negativePrompt?: string;
}

export interface VideoGenerationParams {
  prompt: string;
  model?: 'bytedance-2.2' | 'vidu-1.5' | 'klingai-1.0-pro' | 'klingai-2.6-pro';
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  fps?: number;
}

export interface GenerationResult {
  success: boolean;
  data?: {
    images?: Array<{ url: string; taskUUID?: string; cost?: number }>;
    taskId?: string;
    videoUrl?: string;
    status?: string;
    prompt?: string;
    model?: string;
    cost?: number;
  };
  error?: string;
}

class AIGenerationApiClient {
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

    // Get auth token from localStorage (if available)
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
   * Generate images from text prompt
   */
  async generateImage(params: ImageGenerationParams): Promise<GenerationResult> {
    return this.request('/ai/image/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: params.prompt,
        model: params.model,
        width: params.width || 1024,
        height: params.height || 1024,
        numberResults: params.numberResults || 1,
        steps: params.steps,
        cfgScale: params.cfgScale,
        negativePrompt: params.negativePrompt,
      }),
    });
  }

  /**
   * Generate logo images using FLUX.1 Schnell
   */
  async generateLogo(params: ImageGenerationParams): Promise<GenerationResult> {
    return this.request('/ai/image/generate-logo', {
      method: 'POST',
      body: JSON.stringify({
        prompt: params.prompt,
        width: params.width || 512,
        height: params.height || 512,
        numberResults: params.numberResults || 2,
        negativePrompt: params.negativePrompt,
      }),
    });
  }

  /**
   * Generate videos from text prompt
   */
  async generateVideo(params: VideoGenerationParams): Promise<GenerationResult> {
    return this.request('/ai/video/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: params.prompt,
        model: params.model || 'bytedance-2.2',
        duration: params.duration || 5,
        aspectRatio: params.aspectRatio || '16:9',
        fps: params.fps || 24,
      }),
    });
  }

  /**
   * Check video generation status
   */
  async getVideoStatus(taskId: string): Promise<GenerationResult> {
    return this.request(`/ai/video/status/${taskId}`, {
      method: 'GET',
    });
  }

  /**
   * Save generated video to content library
   */
  async saveVideo(params: {
    url: string;
    prompt: string;
    model?: string;
    width?: number;
    height?: number;
    duration?: number;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; data?: { contentId: string; url: string }; error?: string }> {
    return this.request('/ai/video/save', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const imagitarApi = new AIGenerationApiClient();
