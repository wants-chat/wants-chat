/**
 * App Type Detector Service
 *
 * Detects the app type from user prompt using a multi-stage approach:
 * 1. Exact match on app type ID
 * 2. Synonym match
 * 3. Keyword scoring
 * 4. Fuzzy matching (Levenshtein distance)
 * 5. AI fallback (only if confidence < 50%)
 *
 * Design: Deterministic matching is preferred over AI to prevent hallucination.
 */

import {
  AppTypeDefinition,
  AppTypeDetectionResult,
  AppTypeRegistry,
} from '../interfaces/app-type.interface';
import { ALL_APP_TYPES, APP_TYPES_BY_ID } from '../registries/app-types/index';

export interface AppTypeDetectorConfig {
  /** Minimum confidence to accept a match */
  minConfidence: number;
  /** Enable AI fallback for low-confidence matches */
  enableAIFallback: boolean;
  /** AI service for fallback (injected) */
  aiService?: AIServiceInterface;
}

interface AIServiceInterface {
  detectAppType(prompt: string, availableTypes: string[]): Promise<{
    appTypeId: string;
    confidence: number;
    reasoning: string;
  }>;
}

const DEFAULT_CONFIG: AppTypeDetectorConfig = {
  minConfidence: 0.5,
  enableAIFallback: true,
};

/**
 * Create default registry from exported app types
 */
function createDefaultRegistry(): AppTypeRegistry {
  return {
    appTypes: APP_TYPES_BY_ID,
    byCategory: new Map(),
    byKeyword: new Map(),
  };
}

export class AppTypeDetectorService {
  private registry: AppTypeRegistry;
  private config: AppTypeDetectorConfig;

  constructor(
    registry?: AppTypeRegistry,
    config: Partial<AppTypeDetectorConfig> = {}
  ) {
    this.registry = registry || createDefaultRegistry();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Detect app type from user prompt
   */
  async detect(prompt: string): Promise<AppTypeDetectionResult> {
    const normalizedPrompt = this.normalizeString(prompt);
    const promptWords = this.extractWords(normalizedPrompt);

    // Stage 1: Exact match on app type ID
    const exactMatch = this.findExactMatch(normalizedPrompt);
    if (exactMatch) {
      return exactMatch;
    }

    // Stage 2: Synonym match
    const synonymMatch = this.findSynonymMatch(normalizedPrompt);
    if (synonymMatch && synonymMatch.confidence >= this.config.minConfidence) {
      return synonymMatch;
    }

    // Stage 3: Keyword scoring
    const keywordMatch = this.findKeywordMatch(promptWords);
    if (keywordMatch && keywordMatch.confidence >= this.config.minConfidence) {
      return keywordMatch;
    }

    // Stage 4: Fuzzy matching
    const fuzzyMatch = this.findFuzzyMatch(normalizedPrompt);
    if (fuzzyMatch && fuzzyMatch.confidence >= this.config.minConfidence) {
      return fuzzyMatch;
    }

    // Stage 5: AI fallback
    if (this.config.enableAIFallback && this.config.aiService) {
      const aiMatch = await this.findAIMatch(prompt);
      if (aiMatch && aiMatch.confidence >= this.config.minConfidence) {
        return aiMatch;
      }
    }

    // No match found - return custom app type
    return this.getCustomAppType(prompt);
  }

  /**
   * Stage 1: Exact match on app type ID
   */
  private findExactMatch(normalized: string): AppTypeDetectionResult | null {
    for (const [id, appType] of this.registry.appTypes) {
      if (this.normalizeString(id) === normalized) {
        return {
          appTypeId: id,
          appType,
          method: 'exact',
          confidence: 1.0,
          matchedKeywords: [id],
        };
      }
    }
    return null;
  }

  /**
   * Stage 2: Synonym match
   */
  private findSynonymMatch(normalized: string): AppTypeDetectionResult | null {
    for (const [id, appType] of this.registry.appTypes) {
      for (const synonym of appType.synonyms) {
        if (this.normalizeString(synonym) === normalized) {
          return {
            appTypeId: id,
            appType,
            method: 'exact',
            confidence: 0.95,
            matchedKeywords: [synonym],
          };
        }

        // Also check if prompt contains the full synonym
        if (normalized.includes(this.normalizeString(synonym))) {
          return {
            appTypeId: id,
            appType,
            method: 'exact',
            confidence: 0.9,
            matchedKeywords: [synonym],
          };
        }
      }
    }
    return null;
  }

  /**
   * Stage 3: Keyword scoring
   */
  private findKeywordMatch(promptWords: string[]): AppTypeDetectionResult | null {
    let bestMatch: AppTypeDetectionResult | null = null;
    let highestScore = 0;

    for (const [id, appType] of this.registry.appTypes) {
      const { score, matchedKeywords } = this.calculateKeywordScore(
        promptWords,
        appType
      );

      // Check negative keywords
      const hasNegative = appType.negativeKeywords?.some((neg) =>
        promptWords.includes(this.normalizeString(neg))
      );
      if (hasNegative) {
        continue; // Skip this app type
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          appTypeId: id,
          appType,
          method: 'keyword',
          confidence: Math.min(score, 0.95),
          matchedKeywords,
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate keyword match score
   */
  private calculateKeywordScore(
    promptWords: string[],
    appType: AppTypeDefinition
  ): { score: number; matchedKeywords: string[] } {
    const matchedKeywords: string[] = [];
    let score = 0;

    // Score keywords
    for (const keyword of appType.keywords) {
      const normalizedKeyword = this.normalizeString(keyword);
      const keywordParts = normalizedKeyword.split('-');

      // Exact word match
      if (promptWords.includes(normalizedKeyword)) {
        score += 0.3;
        matchedKeywords.push(keyword);
        continue;
      }

      // Multi-word keyword - check if all parts present
      if (keywordParts.length > 1) {
        const allPartsPresent = keywordParts.every((part) =>
          promptWords.some((word) => word.includes(part) || part.includes(word))
        );
        if (allPartsPresent) {
          score += 0.25;
          matchedKeywords.push(keyword);
          continue;
        }
      }

      // Partial match
      for (const word of promptWords) {
        if (
          normalizedKeyword.includes(word) ||
          word.includes(normalizedKeyword)
        ) {
          score += 0.15;
          matchedKeywords.push(keyword);
          break;
        }
      }
    }

    // Bonus for app type ID match
    const appTypeWords = appType.id.split('-');
    for (const word of appTypeWords) {
      if (promptWords.includes(word)) {
        score += 0.1;
      }
    }

    return { score, matchedKeywords };
  }

  /**
   * Stage 4: Fuzzy matching using Levenshtein distance
   */
  private findFuzzyMatch(normalized: string): AppTypeDetectionResult | null {
    let bestMatch: AppTypeDetectionResult | null = null;
    let highestScore = 0;

    for (const [id, appType] of this.registry.appTypes) {
      // Check against app type ID
      const idScore = this.calculateSimilarity(normalized, id);
      if (idScore > highestScore && idScore >= 0.7) {
        highestScore = idScore;
        bestMatch = {
          appTypeId: id,
          appType,
          method: 'fuzzy',
          confidence: idScore * 0.8, // Reduce confidence for fuzzy
          matchedKeywords: [id],
        };
      }

      // Check against keywords
      for (const keyword of appType.keywords) {
        const keywordScore = this.calculateSimilarity(
          normalized,
          this.normalizeString(keyword)
        );
        if (keywordScore > highestScore && keywordScore >= 0.8) {
          highestScore = keywordScore;
          bestMatch = {
            appTypeId: id,
            appType,
            method: 'fuzzy',
            confidence: keywordScore * 0.75,
            matchedKeywords: [keyword],
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Stage 5: AI fallback
   */
  private async findAIMatch(prompt: string): Promise<AppTypeDetectionResult | null> {
    if (!this.config.aiService) {
      return null;
    }

    try {
      const availableTypes = Array.from(this.registry.appTypes.keys());
      const result = await this.config.aiService.detectAppType(prompt, availableTypes);

      const appType = this.registry.appTypes.get(result.appTypeId);
      if (!appType) {
        return null;
      }

      return {
        appTypeId: result.appTypeId,
        appType,
        method: 'ai',
        confidence: result.confidence,
        matchedKeywords: [],
        reasoning: result.reasoning,
      };
    } catch (error) {
      console.error('AI app type detection failed:', error);
      return null;
    }
  }

  /**
   * Get custom app type for unmatched prompts
   */
  private getCustomAppType(prompt: string): AppTypeDetectionResult {
    // Return a generic custom app type
    const customAppType: AppTypeDefinition = {
      id: 'custom',
      name: 'Custom Application',
      category: 'custom',
      description: prompt,
      keywords: [],
      synonyms: [],
      sections: [
        {
          id: 'frontend',
          name: 'Frontend',
          enabled: true,
          basePath: '/',
          layout: 'public',
        },
        {
          id: 'admin',
          name: 'Admin',
          enabled: true,
          basePath: '/admin',
          requiredRole: 'admin',
          layout: 'admin',
        },
      ],
      roles: [
        {
          id: 'admin',
          name: 'Administrator',
          level: 100,
          isDefault: false,
          accessibleSections: ['frontend', 'admin'],
          defaultRoute: '/admin',
        },
        {
          id: 'user',
          name: 'User',
          level: 10,
          isDefault: true,
          accessibleSections: ['frontend'],
          defaultRoute: '/',
        },
      ],
      defaultFeatures: ['user-auth'],
      optionalFeatures: [],
      requiresAuth: true,
      requiresPayment: false,
      multiTenant: false,
      complexity: 'medium',
      defaultColorScheme: 'blue',
      defaultDesignVariant: 'minimal',
      examplePrompts: [],
    };

    return {
      appTypeId: 'custom',
      appType: customAppType,
      method: 'ai',
      confidence: 0.3,
      matchedKeywords: [],
      reasoning: 'No matching app type found, using custom template',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // UTILITY METHODS
  // ─────────────────────────────────────────────────────────────

  /**
   * Normalize string for matching
   */
  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Extract meaningful words from string
   */
  private extractWords(str: string): string[] {
    const stopWords = new Set([
      'i', 'want', 'to', 'build', 'create', 'make', 'develop', 'need',
      'a', 'an', 'the', 'for', 'my', 'our', 'their', 'is', 'are',
      'with', 'that', 'have', 'can', 'you', 'me', 'us', 'app',
      'application', 'platform', 'system', 'site', 'website', 'please',
    ]);

    return str
      .split('-')
      .filter((word) => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Calculate similarity using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) {
      return 1.0;
    }

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
