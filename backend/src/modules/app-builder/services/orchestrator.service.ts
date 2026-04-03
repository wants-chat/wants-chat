/**
 * App Builder Orchestrator Service
 *
 * The main entry point that coordinates all generation steps:
 *
 * 1. Detect app type from prompt
 * 2. Extract features based on app type
 * 3. Resolve pages and components from features
 * 4. Derive database schema from components
 * 5. Apply AI customization (branding only)
 * 6. Render React frontend
 * 7. Render Hono backend
 * 8. Return complete generated app
 *
 * Key Principle: ALL structure is deterministic from registries.
 * AI is ONLY used for customization (colors, branding).
 */

import { v4 as uuidv4 } from 'uuid';
import {
  GenerationRequest,
  GenerationResult,
  GenerationStep,
  GeneratedFile,
} from '../interfaces/generation.interface';
import { DatabaseSchema } from '../interfaces/schema.interface';
import { FeaturePage } from '../interfaces/feature.interface';
import { AppTypeDetectorService } from './app-type-detector.service';
import { FeatureExtractorService } from './feature-extractor.service';
import { SchemaDeriverService } from './schema-deriver.service';
import { AICustomizationService } from './ai-customization.service';
import { ReactRendererService } from './react-renderer.service';
import { HonoRendererService } from './hono-renderer.service';
import { ReactNativeRendererService } from './react-native-renderer.service';
import { COMPONENTS_BY_ID } from '../registries/components/index';

export interface OrchestratorConfig {
  /** Output directory base path */
  outputDir: string;

  /** Enable verbose logging */
  verbose?: boolean;

  /** Skip certain generation steps */
  skipSteps?: ('frontend' | 'backend' | 'schema' | 'mobile')[];
}

export class OrchestratorService {
  private appTypeDetector: AppTypeDetectorService;
  private featureExtractor: FeatureExtractorService;
  private schemaDeriver: SchemaDeriverService;
  private aiCustomization: AICustomizationService;
  private reactRenderer: ReactRendererService;
  private honoRenderer: HonoRendererService;
  private reactNativeRenderer: ReactNativeRendererService;
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.appTypeDetector = new AppTypeDetectorService();
    this.featureExtractor = new FeatureExtractorService();

    // Import component registry for schema deriver
    const { COMPONENTS_BY_ID } = require('../registries/components/index');
    const componentRegistry = {
      components: COMPONENTS_BY_ID,
      byCategory: new Map(),
      bySection: new Map(),
      byFeature: new Map(),
    };
    this.schemaDeriver = new SchemaDeriverService(componentRegistry);
    this.aiCustomization = new AICustomizationService();
    this.reactRenderer = new ReactRendererService();
    this.honoRenderer = new HonoRendererService();
    this.reactNativeRenderer = new ReactNativeRendererService();
  }

  /**
   * Main generation entry point
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    const appId = uuidv4();
    const steps: GenerationStep[] = [];
    const allFiles: GeneratedFile[] = [];

    const progress = (message: string, pct: number) => {
      if (request.onProgress) {
        request.onProgress(message, pct);
      }
      if (this.config.verbose) {
        console.log(`[${pct}%] ${message}`);
      }
    };

    try {
      // =========================================
      // STEP 1: Detect App Type
      // =========================================
      progress('Detecting app type...', 5);
      const step1Start = Date.now();

      const appTypeResult = await this.appTypeDetector.detect(request.prompt);

      if (!appTypeResult.appType) {
        throw new Error('Could not determine app type from prompt');
      }

      steps.push({
        name: 'detect-app-type',
        status: 'completed',
        progress: 100,
        duration: Date.now() - step1Start,
        data: {
          appType: appTypeResult.appType?.id || 'unknown',
          confidence: appTypeResult.confidence,
          method: appTypeResult.method,
        },
      });

      progress(`Detected: ${appTypeResult.appType?.name || 'Unknown'} (${Math.round(appTypeResult.confidence * 100)}% confidence)`, 15);

      // =========================================
      // STEP 2: Extract Features
      // =========================================
      progress('Extracting features...', 20);
      const step2Start = Date.now();

      const featureResult = this.featureExtractor.extract(
        request.prompt,
        appTypeResult.appType
      );

      // Extract features detected by keyword
      const detectedByKeyword: string[] = [];
      for (const [featureId, details] of featureResult.detectionDetails) {
        if (details.method === 'keyword') {
          detectedByKeyword.push(featureId);
        }
      }

      steps.push({
        name: 'extract-features',
        status: 'completed',
        progress: 100,
        duration: Date.now() - step2Start,
        data: {
          features: featureResult.features.map(f => f.id),
          detectedByKeyword,
        },
      });

      progress(`Extracted ${featureResult.features.length} features`, 30);

      // =========================================
      // STEP 3: Resolve Pages and Components
      // =========================================
      progress('Resolving pages and components...', 35);
      const step3Start = Date.now();

      const featureIds = featureResult.features.map(f => f.id);
      const pages = this.featureExtractor.getPages(featureIds);
      const componentIds = this.featureExtractor.getComponents(featureIds);
      const entities = this.featureExtractor.getEntities(featureIds);
      const apiRoutes = this.featureExtractor.getApiRoutes(featureIds);

      // Build component map from IDs
      const componentMap = new Map(
        componentIds
          .map(id => [id, COMPONENTS_BY_ID.get(id)])
          .filter(([_, c]) => c !== undefined) as [string, any][]
      );

      steps.push({
        name: 'resolve-structure',
        status: 'completed',
        progress: 100,
        duration: Date.now() - step3Start,
        data: {
          pageCount: pages.length,
          componentCount: componentIds.length,
          entityCount: entities.length,
          routeCount: apiRoutes.length,
        },
      });

      progress(`Resolved ${pages.length} pages, ${componentIds.length} components`, 40);

      // =========================================
      // STEP 4: Derive Database Schema
      // =========================================
      let schema: DatabaseSchema = {
        tables: [],
        relations: [],
        enums: [],
        version: 1,
        generatedAt: new Date().toISOString(),
        appType: appTypeResult.appType?.id || 'unknown',
        features: featureResult.features.map(f => f.id),
      };

      if (!this.config.skipSteps?.includes('schema')) {
        progress('Deriving database schema...', 45);
        const step4Start = Date.now();

        const schemaResult = this.schemaDeriver.derive(
          componentIds,
          entities,
          appTypeResult.appType!.id
        );

        schema = schemaResult.schema;

        steps.push({
          name: 'derive-schema',
          status: 'completed',
          progress: 100,
          duration: Date.now() - step4Start,
          data: {
            tableCount: schema.tables.length,
            warnings: schemaResult.warnings,
          },
        });

        progress(`Derived ${schema.tables.length} database tables`, 50);
      }

      // =========================================
      // STEP 5: AI Customization (Minimal!)
      // =========================================
      progress('Applying customization...', 55);
      const step5Start = Date.now();

      const customization = this.aiCustomization.extractCustomization({
        prompt: request.prompt,
        appType: appTypeResult.appType!.id,
        enabledFeatures: featureIds,
      });

      // Override with explicit customization from request
      if (request.customization?.appName) {
        customization.metadata.appName = request.customization.appName;
      }

      const appName = customization.metadata.appName || this.generateAppName(appTypeResult.appType!.name);

      steps.push({
        name: 'customize',
        status: 'completed',
        progress: 100,
        duration: Date.now() - step5Start,
        data: {
          appName,
          brandingExtracted: customization.confidence > 0.5,
          featureConfigs: customization.featureConfigs.length,
        },
      });

      progress(`App name: ${appName}`, 60);

      // =========================================
      // STEP 6: Generate React Frontend
      // =========================================
      if (!this.config.skipSteps?.includes('frontend')) {
        progress('Generating React frontend...', 65);
        const step6Start = Date.now();

        // Convert pages to PageInstance format
        const pageInstances = this.convertPagesToInstances(pages, appTypeResult.appType!.id);

        const frontendFiles = this.reactRenderer.generateAll(
          pageInstances,
          componentMap,
          appName,
          undefined, // keys
          customization.branding,
          customization.designVariant || 'minimal',
          customization.colorScheme || 'blue',
          appTypeResult.appType!.id // Pass app type for content generation
        );

        allFiles.push(...frontendFiles);

        // Add CSS variables for branding
        const cssVars = this.aiCustomization.generateCSSVariables(customization.branding);
        allFiles.push({
          path: 'frontend/src/styles/variables.css',
          content: cssVars,
          type: 'style',
          method: 'template',
        });

        steps.push({
          name: 'generate-frontend',
          status: 'completed',
          progress: 100,
          duration: Date.now() - step6Start,
          data: {
            fileCount: frontendFiles.length,
          },
        });

        progress(`Generated ${frontendFiles.length} frontend files`, 70);
      }

      // =========================================
      // STEP 6b: Generate React Native Mobile App
      // =========================================
      if (!this.config.skipSteps?.includes('mobile')) {
        progress('Generating React Native mobile app...', 72);
        const step6bStart = Date.now();

        // Convert pages to PageInstance format for React Native
        const pageInstances = this.convertPagesToInstances(pages, appTypeResult.appType!.id);

        // Get design variant and color scheme from customization
        const designVariant = request.customization?.designVariant || customization.designVariant || 'minimal';
        const colorScheme = request.customization?.colorScheme || customization.colorScheme || 'blue';

        // Set features on React Native renderer for entity-aware data binding
        this.reactNativeRenderer.setFeatures(featureResult.features);
        const mobileFiles = this.reactNativeRenderer.generateAll(
          pageInstances,
          componentMap,
          appName,
          undefined, // keys
          customization.branding,
          designVariant,
          colorScheme
        );

        allFiles.push(...mobileFiles);

        steps.push({
          name: 'generate-mobile',
          status: 'completed',
          progress: 100,
          duration: Date.now() - step6bStart,
          data: {
            fileCount: mobileFiles.length,
          },
        });

        progress(`Generated ${mobileFiles.length} mobile app files`, 75);
      }

      // =========================================
      // STEP 7: Generate Hono Backend
      // =========================================
      if (!this.config.skipSteps?.includes('backend')) {
        progress('Generating Hono backend...', 80);
        const step7Start = Date.now();

        const backendFiles = this.honoRenderer.generateAll(
          apiRoutes,
          schema,
          appName
        );

        allFiles.push(...backendFiles);

        steps.push({
          name: 'generate-backend',
          status: 'completed',
          progress: 100,
          duration: Date.now() - step7Start,
          data: {
            fileCount: backendFiles.length,
          },
        });

        progress(`Generated ${backendFiles.length} backend files`, 90);
      }

      // =========================================
      // STEP 8: Generate SQL Schema
      // =========================================
      if (!this.config.skipSteps?.includes('schema') && schema.tables.length > 0) {
        progress('Generating SQL schema...', 95);

        const sql = this.schemaDeriver.generateSQL(schema);
        allFiles.push({
          path: 'backend/schema/schema.sql',
          content: sql,
          type: 'schema',
          method: 'template',
        });

        progress('SQL schema generated', 98);
      }

      // =========================================
      // COMPLETE
      // =========================================
      progress('Generation complete!', 100);

      const totalTime = Date.now() - startTime;

      return {
        appId,
        appName,
        outputPath: `${this.config.outputDir}/${appId}`,
        steps,
        files: allFiles,
        schema,
        appType: appTypeResult.appType!.id,
        features: featureIds,
        totalTime,
      };

    } catch (error: any) {
      // Mark current step as failed
      if (steps.length > 0) {
        steps[steps.length - 1].status = 'failed';
        steps[steps.length - 1].error = error.message;
      }

      throw error;
    }
  }

  /**
   * Convert feature pages to page instances for rendering
   */
  private convertPagesToInstances(
    pages: FeaturePage[],
    appType: string
  ): any[] {
    return pages.map(page => ({
      id: page.id,
      route: page.route,
      title: page.title,
      layout: page.layout || 'default',
      section: page.section,
      authRequired: page.authRequired,
      roles: page.roles || [],
      components: page.components.map(compId => ({
        componentId: compId,
        props: {},
      })),
    }));
  }

  /**
   * Generate app name from app type if not provided
   */
  private generateAppName(appTypeName: string): string {
    const prefix = appTypeName.split(' ')[0];
    const suffix = ['Hub', 'Pro', 'App', 'Platform'][Math.floor(Math.random() * 4)];
    return `${prefix}${suffix}`;
  }

  /**
   * Validate generation request
   */
  validateRequest(request: GenerationRequest): string[] {
    const errors: string[] = [];

    if (!request.prompt || request.prompt.trim().length < 10) {
      errors.push('Prompt must be at least 10 characters');
    }

    if (!request.organizationId) {
      errors.push('Organization ID is required');
    }

    if (!request.projectId) {
      errors.push('Project ID is required');
    }

    if (request.frameworks && !Array.isArray(request.frameworks)) {
      errors.push('Frameworks must be an array');
    }

    return errors;
  }

  /**
   * Get generation summary for display
   */
  getGenerationSummary(result: GenerationResult): string {
    const lines = [
      `App: ${result.appName}`,
      `Type: ${result.appType}`,
      `Features: ${result.features.join(', ')}`,
      `Files: ${result.files.length}`,
      `Tables: ${result.schema.tables.length}`,
      `Time: ${result.totalTime}ms`,
    ];

    return lines.join('\n');
  }
}

/**
 * Factory function to create orchestrator with default config
 */
export function createOrchestrator(outputDir: string = './generated'): OrchestratorService {
  return new OrchestratorService({
    outputDir,
    verbose: process.env.NODE_ENV !== 'production',
  });
}
