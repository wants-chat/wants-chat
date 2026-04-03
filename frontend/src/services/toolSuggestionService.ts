/**
 * Tool Suggestion Service
 * Provides intelligent tool recommendations using semantic search
 *
 * Uses backend Qdrant vector search for query-based suggestions,
 * with local fallback for file types and related tools.
 */

import { api } from '../lib/api';
import {
  getAllTools,
  getCategories,
  ToolData,
  ToolCategory,
} from './toolsApi';

// File type to tool mappings (local - doesn't need semantic search)
const fileTypeToolMap: Record<string, string[]> = {
  // Images
  'image/jpeg': ['image-resizer', 'image-compressor', 'image-converter', 'image-cropper', 'background-remover'],
  'image/png': ['image-resizer', 'image-compressor', 'image-converter', 'image-cropper', 'background-remover'],
  'image/gif': ['gif-maker', 'image-converter', 'image-resizer'],
  'image/webp': ['image-converter', 'image-resizer', 'image-compressor'],
  'image/svg+xml': ['svg-editor', 'svg-optimizer', 'image-converter'],
  'image/*': ['image-resizer', 'image-compressor', 'image-converter', 'image-cropper', 'background-remover'],

  // Documents
  'application/pdf': ['pdf-merger', 'pdf-splitter', 'pdf-compressor', 'pdf-to-word'],
  'application/msword': ['word-counter', 'text-analyzer', 'doc-converter'],
  'text/plain': ['word-counter', 'text-sorter', 'remove-duplicates', 'find-replace', 'case-converter'],
  'text/csv': ['csv-json-converter', 'csv-viewer', 'data-analyzer'],
  'text/html': ['html-preview', 'html-formatter', 'html-validator'],
  'text/markdown': ['markdown-preview', 'markdown-editor'],

  // Code
  'application/json': ['json-formatter', 'json-validator', 'csv-json-converter'],
  'application/javascript': ['js-beautifier', 'js-minifier', 'code-formatter'],
  'text/javascript': ['js-beautifier', 'js-minifier', 'code-formatter'],
  'text/css': ['css-beautifier', 'css-minifier', 'css-formatter'],
  'application/xml': ['xml-formatter', 'xml-validator'],

  // Audio
  'audio/mpeg': ['audio-converter', 'audio-trimmer', 'audio-compressor'],
  'audio/*': ['audio-converter', 'audio-trimmer', 'audio-compressor'],

  // Video
  'video/mp4': ['video-compressor', 'video-converter', 'video-trimmer', 'gif-maker'],
  'video/*': ['video-compressor', 'video-converter', 'video-trimmer'],

  // Archives
  'application/zip': ['zip-extractor', 'file-compressor'],
};

// Related tools mappings (local - explicit relationships)
const relatedToolsMap: Record<string, string[]> = {
  'image-resizer': ['image-compressor', 'image-cropper', 'image-converter', 'background-remover'],
  'image-compressor': ['image-resizer', 'image-optimizer', 'image-converter'],
  'qr-generator': ['barcode-generator', 'qr-scanner'],
  'json-formatter': ['json-validator', 'csv-json-converter', 'xml-formatter'],
  'word-counter': ['character-counter', 'reading-time', 'text-analyzer'],
  'bmi-calculator': ['calorie-calculator', 'macro-calculator', 'ideal-weight'],
  'loan-calculator': ['mortgage-calculator', 'car-loan-calculator', 'interest-calculator'],
  'mortgage-calculator': ['loan-calculator', 'mortgage-comparison'],
  'tip-calculator': ['split-bill', 'discount-calculator'],
  'egg-timer': ['pomodoro-timer', 'countdown-timer', 'grilling-timer'],
  'pomodoro-timer': ['countdown-timer', 'interval-timer', 'stopwatch'],
  'grilling-timer': ['meat-thawing', 'steak-doneness', 'egg-timer'],
  'steak-doneness': ['grilling-timer', 'meat-thawing'],
  'pizza-dough': ['sourdough-starter', 'recipe-scaler'],
  'poetry-generator': ['story-generator', 'song-lyrics', 'writing-prompt-generator'],
  'email-composer': ['cover-letter', 'linkedin-post', 'paraphraser'],
  'password-generator': ['uuid-generator', 'hash-generator'],
};

export interface ToolSuggestion {
  tool: ToolData;
  relevanceScore: number;
  matchType: 'semantic' | 'keyword' | 'category' | 'file-type' | 'related' | 'title' | 'description';
}

export interface SuggestedToolsResult {
  tools: ToolSuggestion[];
  query: string;
  fileType?: string;
  totalMatches: number;
}

// API response type
interface ToolSearchApiResult {
  toolId: string;
  title: string;
  description: string;
  category: string;
  categoryName: string;
  icon: string;
  type: string;
  score: number;
}

interface ToolSearchApiResponse {
  tools: ToolSearchApiResult[];
  query: string;
  totalMatches: number;
}

class ToolSuggestionService {
  // Cache for API results (5 min TTL)
  private cache: Map<string, { data: ToolSuggestion[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Search tools using semantic vector search (via backend API)
   * Falls back to local search if API unavailable
   */
  async searchToolsAsync(query: string, limit: number = 10): Promise<SuggestedToolsResult> {
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return { tools: [], query: '', totalMatches: 0 };
    }

    // Check cache first
    const cacheKey = `${normalizedQuery}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return {
        tools: cached.data,
        query: normalizedQuery,
        totalMatches: cached.data.length,
      };
    }

    try {
      // Call backend semantic search API
      const queryParams = new URLSearchParams({
        q: normalizedQuery,
        limit: String(limit),
      });
      const response = await api.get(`/tools/search?${queryParams.toString()}`);

      const apiTools = response?.tools || [];

      // Map API results to ToolSuggestion format
      const tools: ToolSuggestion[] = apiTools.map((result: ToolSearchApiResult) => {
        // Find local tool data for full info
        const localTool = getAllTools().find(t => t.id === result.toolId);

        return {
          tool: localTool || {
            id: result.toolId,
            title: result.title,
            description: result.description,
            category: result.category,
            icon: result.icon,
            type: result.type,
          },
          relevanceScore: result.score * 100, // Convert to 0-100 scale
          matchType: 'semantic' as const,
        };
      });

      // Cache results
      this.cache.set(cacheKey, { data: tools, timestamp: Date.now() });

      return {
        tools,
        query: normalizedQuery,
        totalMatches: response?.totalMatches || tools.length,
      };
    } catch (error) {
      console.warn('Semantic search API unavailable, using local fallback:', error);
      // Fallback to local search
      return this.searchTools(query, limit);
    }
  }

  /**
   * Synchronous local search (fallback when API unavailable)
   */
  searchTools(query: string, limit: number = 10): SuggestedToolsResult {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/).filter(w => w.length > 1);
    const suggestions: Map<string, ToolSuggestion> = new Map();

    if (!normalizedQuery) {
      return { tools: [], query: '', totalMatches: 0 };
    }

    // 1. Exact title match (highest priority)
    getAllTools().forEach(tool => {
      const titleLower = tool.title.toLowerCase();
      if (titleLower === normalizedQuery) {
        this.addOrUpdateSuggestion(suggestions, tool, 100, 'title');
      } else if (titleLower.includes(normalizedQuery)) {
        this.addOrUpdateSuggestion(suggestions, tool, 80, 'title');
      }
    });

    // 2. Title word matches
    words.forEach(word => {
      getAllTools().forEach(tool => {
        if (tool.id.includes(word)) {
          this.addOrUpdateSuggestion(suggestions, tool, 60, 'title');
        }
        if (tool.title.toLowerCase().split(/\s+/).some(w => w.startsWith(word))) {
          this.addOrUpdateSuggestion(suggestions, tool, 55, 'title');
        }
      });
    });

    // 3. Description matches
    getAllTools().forEach(tool => {
      const descLower = tool.description.toLowerCase();
      if (words.some(word => word.length > 2 && descLower.includes(word))) {
        this.addOrUpdateSuggestion(suggestions, tool, 40, 'description');
      }
    });

    // 4. Category matches
    const matchedCategories = getCategories().filter(cat =>
      words.some(word => cat.name.toLowerCase().includes(word) || cat.id.includes(word))
    );
    matchedCategories.forEach(cat => {
      getAllTools().filter(t => t.category === cat.id).forEach(tool => {
        this.addOrUpdateSuggestion(suggestions, tool, 30, 'category');
      });
    });

    // Sort by relevance score
    const sortedTools = Array.from(suggestions.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return {
      tools: sortedTools,
      query: normalizedQuery,
      totalMatches: suggestions.size,
    };
  }

  /**
   * Get tools for a specific file type (local - fast)
   */
  getToolsForFileType(mimeType: string, limit: number = 10): SuggestedToolsResult {
    const suggestions: Map<string, ToolSuggestion> = new Map();

    // Direct match
    if (fileTypeToolMap[mimeType]) {
      fileTypeToolMap[mimeType].forEach((toolId, index) => {
        const tool = getAllTools().find(t => t.id === toolId);
        if (tool) {
          this.addOrUpdateSuggestion(suggestions, tool, 100 - index * 5, 'file-type');
        }
      });
    }

    // Wildcard match (e.g., 'image/*')
    const [type] = mimeType.split('/');
    const wildcardKey = `${type}/*`;
    if (fileTypeToolMap[wildcardKey]) {
      fileTypeToolMap[wildcardKey].forEach((toolId, index) => {
        const tool = getAllTools().find(t => t.id === toolId);
        if (tool) {
          this.addOrUpdateSuggestion(suggestions, tool, 80 - index * 5, 'file-type');
        }
      });
    }

    // Category-based fallback
    const categoryMap: Record<string, string> = {
      image: 'image-tools',
      audio: 'music',
      video: 'image-tools',
      text: 'text-tools',
      application: 'developer',
    };
    if (categoryMap[type]) {
      getAllTools()
        .filter(t => t.category === categoryMap[type])
        .slice(0, 10)
        .forEach((tool, index) => {
          if (!suggestions.has(tool.id)) {
            this.addOrUpdateSuggestion(suggestions, tool, 50 - index * 2, 'category');
          }
        });
    }

    const sortedTools = Array.from(suggestions.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return {
      tools: sortedTools,
      query: '',
      fileType: mimeType,
      totalMatches: suggestions.size,
    };
  }

  /**
   * Get related tools for a given tool (local - explicit mappings)
   */
  getRelatedTools(toolId: string, limit: number = 6): ToolSuggestion[] {
    const suggestions: Map<string, ToolSuggestion> = new Map();
    const currentTool = getAllTools().find(t => t.id === toolId);

    if (!currentTool) return [];

    // 1. Explicit related tools (highest priority)
    if (relatedToolsMap[toolId]) {
      relatedToolsMap[toolId].forEach((relatedId, index) => {
        const tool = getAllTools().find(t => t.id === relatedId);
        if (tool) {
          this.addOrUpdateSuggestion(suggestions, tool, 100 - index * 10, 'related');
        }
      });
    }

    // 2. Same category tools
    getAllTools()
      .filter(t => t.category === currentTool.category && t.id !== toolId)
      .slice(0, 10)
      .forEach((tool, index) => {
        this.addOrUpdateSuggestion(suggestions, tool, 60 - index * 3, 'category');
      });

    return Array.from(suggestions.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(categoryId: string): ToolData[] {
    return getAllTools().filter(t => t.category === categoryId);
  }

  /**
   * Get all categories with tool counts
   */
  getCategoriesWithCounts(): Array<{ category: ToolCategory; count: number }> {
    return getCategories().map(cat => ({
      category: cat,
      count: getAllTools().filter(t => t.category === cat.id).length,
    }));
  }

  /**
   * Clear the search cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  private addOrUpdateSuggestion(
    map: Map<string, ToolSuggestion>,
    tool: ToolData,
    score: number,
    matchType: ToolSuggestion['matchType']
  ): void {
    const existing = map.get(tool.id);
    if (!existing || existing.relevanceScore < score) {
      map.set(tool.id, { tool, relevanceScore: score, matchType });
    }
  }
}

export const toolSuggestionService = new ToolSuggestionService();
