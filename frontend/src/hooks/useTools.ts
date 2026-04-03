/**
 * useTools Hook
 *
 * React hook for accessing tools data from the backend API.
 * SINGLE SOURCE OF TRUTH: Backend /api/v1/tools-registry
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchAllTools,
  fetchCategories,
  searchToolsApi,
  getAllTools,
  getCategories,
  getToolsByCategory,
  getToolById,
  searchTools,
  toolExists,
  ToolData,
  ToolCategory,
} from '../services/toolsApi';

interface UseToolsResult {
  tools: ToolData[];
  categories: ToolCategory[];
  loading: boolean;
  error: string | null;
  searchTools: (query: string) => ToolData[];
  getToolsByCategory: (categoryId: string) => ToolData[];
  getToolById: (toolId: string) => ToolData | undefined;
  toolExists: (toolId: string) => boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to access tools data
 */
export function useTools(): UseToolsResult {
  const [tools, setTools] = useState<ToolData[]>(getAllTools());
  const [categories, setCategories] = useState<ToolCategory[]>(getCategories());
  const [loading, setLoading] = useState(!tools.length);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [toolsData, categoriesData] = await Promise.all([
        fetchAllTools(),
        fetchCategories(),
      ]);
      setTools(toolsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only load if cache is empty
    if (!tools.length) {
      loadData();
    }
  }, []);

  return {
    tools,
    categories,
    loading,
    error,
    searchTools,
    getToolsByCategory,
    getToolById,
    toolExists,
    refetch: loadData,
  };
}

/**
 * Hook to search tools with debouncing
 */
export function useToolSearch(query: string, debounceMs: number = 300) {
  const [results, setResults] = useState<ToolData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        // Try API search first, fallback to local
        const data = await searchToolsApi(query);
        setResults(data);
      } catch {
        // Fallback to local search
        setResults(searchTools(query));
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return { results, loading };
}

/**
 * Hook to get tools by category
 */
export function useToolsByCategory(categoryId: string | null) {
  const { tools, loading } = useTools();

  const filteredTools = useMemo(() => {
    if (!categoryId) return tools;
    return tools.filter(tool => tool.category === categoryId);
  }, [tools, categoryId]);

  return { tools: filteredTools, loading };
}

/**
 * Hook to get a single tool by ID
 */
export function useTool(toolId: string | null) {
  const { tools, loading } = useTools();

  const tool = useMemo(() => {
    if (!toolId) return null;
    return tools.find(t => t.id === toolId) || null;
  }, [tools, toolId]);

  return { tool, loading, exists: !!tool };
}

export type { ToolData, ToolCategory };
