/**
 * Feature Extractor Service
 *
 * Extracts features from user prompt based on:
 * 1. App type default features
 * 2. Keyword matching in prompt
 * 3. Dependency resolution
 *
 * Design: All features are predefined. NO AI generation of features.
 */

import {
  FeatureDefinition,
  FeatureRegistry,
  FeatureExtractionResult,
  FeaturePage,
  FeatureApiRoute,
  FeatureEntity,
} from '../interfaces/feature.interface';
import { AppTypeDefinition } from '../interfaces/app-type.interface';
import { ALL_FEATURES, FEATURES_BY_ID } from '../registries/features/index';

export interface FeatureExtractorConfig {
  /** Include optional features matched by keywords */
  includeOptionalFeatures: boolean;
  /** Auto-resolve dependencies */
  autoResolveDependencies: boolean;
  /** Maximum features to include */
  maxFeatures: number;
}

const DEFAULT_CONFIG: FeatureExtractorConfig = {
  includeOptionalFeatures: true,
  autoResolveDependencies: true,
  maxFeatures: 50,
};

/**
 * Create default registry from exported features
 */
function createDefaultRegistry(): FeatureRegistry {
  return {
    features: FEATURES_BY_ID,
    byCategory: new Map(),
    byAppType: new Map(),
  };
}

export class FeatureExtractorService {
  private registry: FeatureRegistry;
  private config: FeatureExtractorConfig;

  constructor(
    registry?: FeatureRegistry,
    config: Partial<FeatureExtractorConfig> = {}
  ) {
    this.registry = registry || createDefaultRegistry();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Extract features for an app type from user prompt
   */
  extract(prompt: string, appType: AppTypeDefinition): FeatureExtractionResult {
    const normalizedPrompt = this.normalizeString(prompt);
    const promptWords = this.extractWords(normalizedPrompt);

    const detectionMethods: FeatureExtractionResult['detectionMethods'] = [];
    const selectedFeatures = new Set<string>();
    const autoAddedDependencies: string[] = [];

    // Step 1: Add default features for this app type
    for (const featureId of appType.defaultFeatures) {
      if (this.registry.features.has(featureId)) {
        selectedFeatures.add(featureId);
        detectionMethods.push({
          featureId,
          method: 'app-type-default',
          confidence: 1.0,
        });
      }
    }

    // Step 2: Check for optional features via keyword matching
    if (this.config.includeOptionalFeatures) {
      for (const featureId of appType.optionalFeatures) {
        const feature = this.registry.features.get(featureId);
        if (!feature) continue;

        const keywordMatch = this.matchKeywords(promptWords, feature);
        if (keywordMatch.matched) {
          selectedFeatures.add(featureId);
          detectionMethods.push({
            featureId,
            method: 'keyword',
            confidence: keywordMatch.confidence,
          });
        }
      }
    }

    // Step 3: Check all features for strong keyword matches (not just app type's optional)
    for (const [featureId, feature] of this.registry.features) {
      if (selectedFeatures.has(featureId)) continue;
      if (appType.incompatibleFeatures?.includes(featureId)) continue;

      const keywordMatch = this.matchKeywords(promptWords, feature);
      if (keywordMatch.matched && keywordMatch.confidence >= 0.7) {
        selectedFeatures.add(featureId);
        detectionMethods.push({
          featureId,
          method: 'keyword',
          confidence: keywordMatch.confidence,
        });
      }
    }

    // Step 4: Resolve dependencies
    if (this.config.autoResolveDependencies) {
      const resolvedDeps = this.resolveDependencies(selectedFeatures);
      for (const depId of resolvedDeps) {
        if (!selectedFeatures.has(depId)) {
          selectedFeatures.add(depId);
          autoAddedDependencies.push(depId);
          detectionMethods.push({
            featureId: depId,
            method: 'dependency',
            confidence: 1.0,
          });
        }
      }
    }

    // Step 5: Remove conflicting features (keep higher confidence ones)
    this.removeConflicts(selectedFeatures, detectionMethods);

    // Step 6: Sort by priority (core features first)
    const sortedFeatures = this.sortByPriority(Array.from(selectedFeatures));

    // Step 7: Apply max features limit
    const finalFeatureIds = sortedFeatures.slice(0, this.config.maxFeatures);

    // Convert feature IDs to full definitions
    const finalFeatures = finalFeatureIds
      .map((id) => this.registry.features.get(id))
      .filter((f): f is FeatureDefinition => f !== undefined);

    // Build detection details map
    const detectionDetails = new Map<string, { method: 'app-type-default' | 'keyword' | 'dependency'; matchedKeywords?: string[] }>();
    for (const dm of detectionMethods) {
      if (finalFeatureIds.includes(dm.featureId)) {
        detectionDetails.set(dm.featureId, { method: dm.method });
      }
    }

    return {
      features: finalFeatures,
      detectionMethods: detectionMethods.filter((d) =>
        finalFeatureIds.includes(d.featureId)
      ),
      detectionDetails,
      autoAddedDependencies,
    };
  }

  /**
   * Match keywords from prompt against feature
   */
  private matchKeywords(
    promptWords: string[],
    feature: FeatureDefinition
  ): { matched: boolean; confidence: number } {
    let matchCount = 0;
    let totalWeight = 0;

    for (const keyword of feature.activationKeywords) {
      const normalizedKeyword = this.normalizeString(keyword);
      const keywordParts = normalizedKeyword.split('-');
      const weight = keywordParts.length > 1 ? 1.5 : 1.0; // Multi-word keywords have higher weight

      // Exact match
      if (promptWords.includes(normalizedKeyword)) {
        matchCount += weight;
        totalWeight += weight;
        continue;
      }

      // Multi-word keyword - check all parts
      if (keywordParts.length > 1) {
        const partsMatched = keywordParts.filter((part) =>
          promptWords.some((word) => word.includes(part) || part.includes(word))
        ).length;

        if (partsMatched === keywordParts.length) {
          matchCount += weight * 0.9;
          totalWeight += weight;
          continue;
        } else if (partsMatched > 0) {
          matchCount += weight * (partsMatched / keywordParts.length) * 0.5;
          totalWeight += weight;
          continue;
        }
      }

      // Partial match
      for (const word of promptWords) {
        if (normalizedKeyword.includes(word) && word.length >= 4) {
          matchCount += weight * 0.3;
          totalWeight += weight;
          break;
        }
      }
    }

    if (totalWeight === 0) {
      return { matched: false, confidence: 0 };
    }

    const confidence = matchCount / feature.activationKeywords.length;
    return {
      matched: confidence >= 0.3,
      confidence: Math.min(confidence, 1.0),
    };
  }

  /**
   * Resolve all dependencies recursively
   */
  private resolveDependencies(selectedFeatures: Set<string>): string[] {
    const allDependencies: string[] = [];
    const visited = new Set<string>();

    const resolve = (featureId: string) => {
      if (visited.has(featureId)) return;
      visited.add(featureId);

      const feature = this.registry.features.get(featureId);
      if (!feature) return;

      for (const depId of feature.dependencies) {
        if (!selectedFeatures.has(depId) && !allDependencies.includes(depId)) {
          allDependencies.push(depId);
          resolve(depId); // Recursively resolve nested dependencies
        }
      }
    };

    for (const featureId of selectedFeatures) {
      resolve(featureId);
    }

    return allDependencies;
  }

  /**
   * Remove conflicting features (keep higher confidence)
   */
  private removeConflicts(
    selectedFeatures: Set<string>,
    detectionMethods: FeatureExtractionResult['detectionMethods']
  ): void {
    const toRemove: string[] = [];

    for (const featureId of selectedFeatures) {
      const feature = this.registry.features.get(featureId);
      if (!feature?.conflicts) continue;

      for (const conflictId of feature.conflicts) {
        if (selectedFeatures.has(conflictId)) {
          // Compare confidence and remove lower one
          const featureConf = detectionMethods.find(
            (d) => d.featureId === featureId
          )?.confidence ?? 0;
          const conflictConf = detectionMethods.find(
            (d) => d.featureId === conflictId
          )?.confidence ?? 0;

          if (featureConf >= conflictConf) {
            toRemove.push(conflictId);
          } else {
            toRemove.push(featureId);
          }
        }
      }
    }

    for (const id of toRemove) {
      selectedFeatures.delete(id);
    }
  }

  /**
   * Sort features by priority
   */
  private sortByPriority(features: string[]): string[] {
    const priorityOrder: Record<string, number> = {
      core: 0,
      security: 1,
      commerce: 2,
      booking: 3,
      content: 4,
      communication: 5,
      business: 6,
      analytics: 7,
      integration: 8,
      utility: 9,
    };

    return features.sort((a, b) => {
      const featureA = this.registry.features.get(a);
      const featureB = this.registry.features.get(b);

      const priorityA = priorityOrder[featureA?.category ?? 'utility'] ?? 99;
      const priorityB = priorityOrder[featureB?.category ?? 'utility'] ?? 99;

      return priorityA - priorityB;
    });
  }

  /**
   * Get all pages from selected features
   * @param featureIds - List of feature IDs to extract pages from
   * @param appType - Optional app type to use for landing page components override
   */
  getPages(featureIds: string[], appType?: AppTypeDefinition): FeatureDefinition['pages'] {
    const allPages: FeatureDefinition['pages'] = [];
    const seenRoutes = new Set<string>();

    for (const featureId of featureIds) {
      const feature = this.registry.features.get(featureId);
      if (!feature) continue;

      for (const page of feature.pages) {
        // Avoid duplicate routes
        if (!seenRoutes.has(page.route)) {
          seenRoutes.add(page.route);

          // Override landing page components with app-type's landingPageComponents
          if (
            featureId === 'landing-page' &&
            page.route === '/' &&
            appType?.landingPageComponents &&
            appType.landingPageComponents.length > 0
          ) {
            allPages.push({
              ...page,
              components: appType.landingPageComponents,
            });
          } else {
            allPages.push(page);
          }
        }
      }
    }

    return allPages;
  }

  /**
   * Get all components from selected features
   * @param featureIds - List of feature IDs to extract components from
   * @param appType - Optional app type to include landing page components
   */
  getComponents(featureIds: string[], appType?: AppTypeDefinition): string[] {
    const allComponents = new Set<string>();

    for (const featureId of featureIds) {
      const feature = this.registry.features.get(featureId);
      if (!feature) continue;

      for (const componentId of feature.components) {
        allComponents.add(componentId);
      }
    }

    // Add app-type's landing page components if landing-page feature is included
    if (
      featureIds.includes('landing-page') &&
      appType?.landingPageComponents
    ) {
      for (const componentId of appType.landingPageComponents) {
        allComponents.add(componentId);
      }
    }

    return Array.from(allComponents);
  }

  /**
   * Get all entities from selected features
   */
  getEntities(featureIds: string[]): FeatureDefinition['entities'] {
    const allEntities: FeatureDefinition['entities'] = [];
    const seenNames = new Set<string>();

    for (const featureId of featureIds) {
      const feature = this.registry.features.get(featureId);
      if (!feature) continue;

      for (const entity of feature.entities) {
        if (!seenNames.has(entity.name)) {
          seenNames.add(entity.name);
          allEntities.push(entity);
        }
      }
    }

    return allEntities;
  }

  /**
   * Get all API routes from selected features
   */
  getApiRoutes(featureIds: string[]): FeatureDefinition['apiRoutes'] {
    const allRoutes: FeatureDefinition['apiRoutes'] = [];
    const seenPaths = new Set<string>();

    for (const featureId of featureIds) {
      const feature = this.registry.features.get(featureId);
      if (!feature) continue;

      for (const route of feature.apiRoutes) {
        const key = `${route.method}:${route.path}`;
        if (!seenPaths.has(key)) {
          seenPaths.add(key);
          allRoutes.push(route);
        }
      }
    }

    return allRoutes;
  }

  // ─────────────────────────────────────────────────────────────
  // UTILITY METHODS
  // ─────────────────────────────────────────────────────────────

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private extractWords(str: string): string[] {
    const stopWords = new Set([
      'i', 'want', 'to', 'build', 'create', 'make', 'develop', 'need',
      'a', 'an', 'the', 'for', 'my', 'our', 'with', 'and', 'also',
    ]);

    return str
      .split('-')
      .filter((word) => word.length > 2 && !stopWords.has(word));
  }
}
