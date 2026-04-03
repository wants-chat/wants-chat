/**
 * Hook for managing deep research sessions
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { api } from '../lib/api';

// Research session status
export type ResearchStatus =
  | 'pending'
  | 'planning'
  | 'searching'
  | 'extracting'
  | 'analyzing'
  | 'synthesizing'
  | 'fact_checking'
  | 'generating'
  | 'completed'
  | 'failed'
  | 'cancelled';

// Research source
export interface ResearchSource {
  id: string;
  url: string;
  title: string;
  relevanceScore: number;
  credibilityScore: number;
  metadata?: Record<string, unknown>;
}

// Research finding
export interface ResearchFinding {
  id: string;
  sourceId: string;
  sourceUrl: string;
  type: 'fact' | 'statistic' | 'quote' | 'insight' | 'definition';
  content: string;
  confidence: number;
  tags: string[];
}

// Research output
export interface ResearchOutput {
  id: string;
  format: 'markdown' | 'json' | 'pdf';
  url?: string;
  content?: string;
  generatedAt: string;
}

// Research session
export interface ResearchSession {
  id: string;
  query: string;
  status: ResearchStatus;
  progress: number;
  currentStep?: string;
  sources: ResearchSource[];
  findings: ResearchFinding[];
  synthesis?: string;
  outputs: ResearchOutput[];
  error?: string;
  startedAt: string;
  completedAt?: string;
}

// Research progress
export interface ResearchProgress {
  sessionId: string;
  status: ResearchStatus;
  progress: number;
  currentStep?: string;
  message: string;
  details?: {
    sourcesFound: number;
    sourcesProcessed: number;
    findingsExtracted: number;
  };
}

// Start research options
export interface StartResearchOptions {
  query: string;
  depth?: 'quick' | 'standard' | 'deep';
  maxSources?: number;
  outputFormats?: ('markdown' | 'json' | 'pdf')[];
  includeImages?: boolean;
  domain?: string;
  targetUrl?: string;
}

// Hook return type
interface UseResearchReturn {
  // State
  session: ResearchSession | null;
  progress: ResearchProgress | null;
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;

  // Actions
  startResearch: (options: StartResearchOptions) => Promise<ResearchSession | null>;
  getProgress: (sessionId: string) => Promise<ResearchProgress | null>;
  getSession: (sessionId: string) => Promise<ResearchSession | null>;
  cancelResearch: (sessionId: string, reason?: string) => Promise<boolean>;
  getReport: (sessionId: string, format?: 'markdown' | 'json') => Promise<string | null>;
  reset: () => void;
}

export function useResearch(): UseResearchReturn {
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Poll for progress updates
  const startPolling = useCallback((sessionId: string) => {
    stopPolling();
    setIsPolling(true);
    sessionIdRef.current = sessionId;

    const poll = async () => {
      try {
        const response = await api.get<ResearchProgress>(`/research/${sessionId}/progress`);
        setProgress(response);

        // Check if completed or failed
        if (['completed', 'failed', 'cancelled'].includes(response.status)) {
          stopPolling();
          // Fetch full session on completion
          const fullSession = await api.get<ResearchSession>(`/research/${sessionId}`);
          setSession(fullSession);
        }
      } catch (err: any) {
        console.error('Error polling research progress:', err);
        // Don't stop polling on transient errors
      }
    };

    // Poll immediately, then every 2 seconds
    poll();
    pollingRef.current = setInterval(poll, 2000);
  }, [stopPolling]);

  // Start a new research session
  const startResearch = useCallback(async (options: StartResearchOptions): Promise<ResearchSession | null> => {
    setIsLoading(true);
    setError(null);
    setSession(null);
    setProgress(null);

    try {
      const response = await api.post<{
        success: boolean;
        sessionId: string;
        message: string;
        estimatedTime?: number;
      }>('/research/start', {
        query: options.query,
        depth: options.depth || 'standard',
        maxSources: options.maxSources || 10,
        outputFormats: options.outputFormats || ['markdown'],
        includeImages: options.includeImages ?? false,
        domain: options.domain,
        targetUrl: options.targetUrl,
      });

      if (response.success && response.sessionId) {
        // Start polling for progress
        startPolling(response.sessionId);

        // Return initial session state
        const initialSession: ResearchSession = {
          id: response.sessionId,
          query: options.query,
          status: 'pending',
          progress: 0,
          sources: [],
          findings: [],
          outputs: [],
          startedAt: new Date().toISOString(),
        };
        setSession(initialSession);
        return initialSession;
      }

      throw new Error(response.message || 'Failed to start research');
    } catch (err: any) {
      const message = err.message || 'Failed to start research';
      setError(message);
      console.error('Error starting research:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [startPolling]);

  // Get progress for a session
  const getProgress = useCallback(async (sessionId: string): Promise<ResearchProgress | null> => {
    try {
      const response = await api.get<ResearchProgress>(`/research/${sessionId}/progress`);
      setProgress(response);
      return response;
    } catch (err: any) {
      console.error('Error getting research progress:', err);
      return null;
    }
  }, []);

  // Get full session details
  const getSession = useCallback(async (sessionId: string): Promise<ResearchSession | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<ResearchSession>(`/research/${sessionId}`);
      setSession(response);
      return response;
    } catch (err: any) {
      const message = err.message || 'Failed to get research session';
      setError(message);
      console.error('Error getting research session:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel a research session
  const cancelResearch = useCallback(async (sessionId: string, reason?: string): Promise<boolean> => {
    try {
      stopPolling();
      await api.delete(`/research/${sessionId}`, { reason });

      setSession(prev => prev ? { ...prev, status: 'cancelled' } : null);
      setProgress(prev => prev ? { ...prev, status: 'cancelled' } : null);

      return true;
    } catch (err: any) {
      console.error('Error cancelling research:', err);
      return false;
    }
  }, [stopPolling]);

  // Get the research report
  const getReport = useCallback(async (
    sessionId: string,
    format: 'markdown' | 'json' = 'markdown'
  ): Promise<string | null> => {
    try {
      const response = await api.get<{ content: string; format: string }>(
        `/research/${sessionId}/report?format=${format}`
      );
      return response.content;
    } catch (err: any) {
      console.error('Error getting research report:', err);
      return null;
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    stopPolling();
    setSession(null);
    setProgress(null);
    setIsLoading(false);
    setError(null);
    sessionIdRef.current = null;
  }, [stopPolling]);

  return {
    session,
    progress,
    isLoading,
    isPolling,
    error,
    startResearch,
    getProgress,
    getSession,
    cancelResearch,
    getReport,
    reset,
  };
}

export default useResearch;
