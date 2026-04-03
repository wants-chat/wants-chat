/**
 * Tools API Service
 *
 * SINGLE SOURCE OF TRUTH: Backend /api/v1/tools-registry
 *
 * This service fetches tools data from the backend API.
 * All tools data comes from /backend/src/data/tools-registry.ts
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

// Types (matching backend)
export interface ToolData {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: string;
  category: string;
  link?: string;
  isAI?: boolean;
  color?: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ToolsStats {
  total: number;
  categories: number;
  byCategory: Record<string, number>;
}

// Cache for tools data
let toolsCache: ToolData[] | null = null;
let categoriesCache: ToolCategory[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if cache is valid
 */
function isCacheValid(): boolean {
  return Date.now() - cacheTimestamp < CACHE_TTL;
}

/**
 * Fetch all tools from backend API
 */
export async function fetchAllTools(): Promise<ToolData[]> {
  if (toolsCache && isCacheValid()) {
    return toolsCache;
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/tools-registry`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tools: ${response.status}`);
    }
    const data = await response.json();
    toolsCache = data;
    cacheTimestamp = Date.now();
    return data;
  } catch (error) {
    console.error('Error fetching tools:', error);
    // Return cached data if available, even if stale
    if (toolsCache) {
      return toolsCache;
    }
    return [];
  }
}

/**
 * Fetch all categories from backend API
 */
export async function fetchCategories(): Promise<ToolCategory[]> {
  if (categoriesCache && isCacheValid()) {
    return categoriesCache;
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/tools-registry/categories`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    const data = await response.json();
    categoriesCache = data;
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (categoriesCache) {
      return categoriesCache;
    }
    return [];
  }
}

/**
 * Fetch tools stats from backend API
 */
export async function fetchToolsStats(): Promise<ToolsStats | null> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/tools-registry/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tools stats:', error);
    return null;
  }
}

/**
 * Search tools from backend API
 */
export async function searchToolsApi(query: string): Promise<ToolData[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/tools-registry/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Failed to search tools: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching tools:', error);
    // Fallback to local search on cached data
    if (toolsCache) {
      return searchTools(query);
    }
    return [];
  }
}

/**
 * Check if tool exists
 */
export async function checkToolExists(toolId: string): Promise<{ exists: boolean; tool?: ToolData }> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/tools-registry/exists/${encodeURIComponent(toolId)}`);
    if (!response.ok) {
      throw new Error(`Failed to check tool: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking tool exists:', error);
    return { exists: false };
  }
}

/**
 * Get tool by ID
 */
export async function fetchToolById(toolId: string): Promise<ToolData | null> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/tools-registry/${encodeURIComponent(toolId)}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.error) {
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching tool by ID:', error);
    return null;
  }
}

// ============================================
// Synchronous helpers (using cached data)
// ============================================

/**
 * Get all tools (sync, from cache)
 * Use fetchAllTools() to ensure data is loaded first
 */
export function getAllTools(): ToolData[] {
  return toolsCache || [];
}

/**
 * Get all categories (sync, from cache)
 */
export function getCategories(): ToolCategory[] {
  return categoriesCache || [];
}

/**
 * Search tools locally (sync, from cache)
 */
export function searchTools(query: string): ToolData[] {
  const tools = getAllTools();
  if (!query.trim()) {
    return [];
  }

  const q = query.toLowerCase();
  return tools.filter(tool =>
    tool.title.toLowerCase().includes(q) ||
    tool.description.toLowerCase().includes(q) ||
    tool.id.toLowerCase().includes(q)
  );
}

/**
 * Get tools by category (sync, from cache)
 */
export function getToolsByCategory(categoryId: string): ToolData[] {
  const tools = getAllTools();
  return tools.filter(tool => tool.category === categoryId);
}

/**
 * Get tool by ID (sync, from cache)
 */
export function getToolById(toolId: string): ToolData | undefined {
  const tools = getAllTools();
  return tools.find(tool => tool.id === toolId);
}

/**
 * Check if tool exists (sync, from cache)
 */
export function toolExists(toolId: string): boolean {
  const tools = getAllTools();
  return tools.some(tool => tool.id === toolId);
}

/**
 * Get category names map
 */
export function getCategoryNames(): Record<string, string> {
  const categories = getCategories();
  const map: Record<string, string> = {};
  categories.forEach(cat => {
    map[cat.id] = cat.name;
  });
  return map;
}

/**
 * Initialize tools cache (call on app startup)
 */
export async function initializeToolsCache(): Promise<void> {
  await Promise.all([
    fetchAllTools(),
    fetchCategories(),
  ]);
}

// For backwards compatibility - export cached data as variables
// Components should migrate to using the async functions
export { toolsCache as allTools, categoriesCache as toolCategories };
