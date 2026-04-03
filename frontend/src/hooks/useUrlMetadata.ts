/**
 * Hook for fetching URL metadata and content
 */

import { useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface UrlMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
}

export interface UrlContent {
  url: string;
  sourceUrl?: string; // Normalized URL with protocol
  title: string;
  content: string;
  wordCount: number;
  readingTime: number;
}

export interface UrlSummary {
  url: string;
  sourceUrl?: string; // Normalized URL with protocol
  title: string;
  summary: string;
  keyPoints: string[];
  quotes?: string[];
  contentId?: string; // For content library reference
}

export interface UrlScreenshot {
  url: string;
  sourceUrl?: string; // Normalized URL with protocol
  imageUrl: string;
  width: number;
  height: number;
  fullPage: boolean;
  capturedAt: string;
  contentId?: string; // For content library reference
}

interface UseUrlMetadataReturn {
  // State
  metadata: UrlMetadata | null;
  content: UrlContent | null;
  summary: UrlSummary | null;
  screenshot: UrlScreenshot | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMetadata: (url: string) => Promise<UrlMetadata | null>;
  fetchContent: (url: string) => Promise<UrlContent | null>;
  fetchSummary: (url: string) => Promise<UrlSummary | null>;
  captureScreenshot: (url: string, options?: ScreenshotOptions) => Promise<UrlScreenshot | null>;
  reset: () => void;
}

interface ScreenshotOptions {
  fullPage?: boolean;
  width?: number;
  height?: number;
  selector?: string;
}

export function useUrlMetadata(): UseUrlMetadataReturn {
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
  const [content, setContent] = useState<UrlContent | null>(null);
  const [summary, setSummary] = useState<UrlSummary | null>(null);
  const [screenshot, setScreenshot] = useState<UrlScreenshot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = useCallback(async (url: string): Promise<UrlMetadata | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const encodedUrl = encodeURIComponent(url);
      const response = await api.get(`/web/metadata?url=${encodedUrl}`);
      setMetadata(response);
      return response;
    } catch (err: any) {
      const message = err.message || 'Failed to fetch metadata';
      setError(message);
      console.error('Error fetching URL metadata:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchContent = useCallback(async (url: string): Promise<UrlContent | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/web/fetch', { url });
      setContent(response);
      return response;
    } catch (err: any) {
      const message = err.message || 'Failed to fetch content';
      setError(message);
      console.error('Error fetching URL content:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async (url: string): Promise<UrlSummary | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/web/summarize', { url });
      setSummary(response);
      return response;
    } catch (err: any) {
      const message = err.message || 'Failed to summarize page';
      setError(message);
      console.error('Error fetching URL summary:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const captureScreenshot = useCallback(
    async (url: string, options?: ScreenshotOptions): Promise<UrlScreenshot | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.post('/web/screenshot', {
          url,
          fullPage: options?.fullPage ?? false,
          width: options?.width ?? 1280,
          height: options?.height ?? 800,
          selector: options?.selector,
        });
        setScreenshot(response);
        return response;
      } catch (err: any) {
        const message = err.message || 'Failed to capture screenshot';
        setError(message);
        console.error('Error capturing screenshot:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setMetadata(null);
    setContent(null);
    setSummary(null);
    setScreenshot(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    metadata,
    content,
    summary,
    screenshot,
    isLoading,
    error,
    fetchMetadata,
    fetchContent,
    fetchSummary,
    captureScreenshot,
    reset,
  };
}

export default useUrlMetadata;
