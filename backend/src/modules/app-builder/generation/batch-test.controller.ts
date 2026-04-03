/**
 * Batch Test Controller
 *
 * Tests all 3155 app types for missing definitions, component mappings, etc.
 * Does NOT:
 * - Deploy to Cloudflare
 * - Run npm install/dev
 * - Seed data
 * - Register with platform
 *
 * DOES:
 * - Detect app type
 * - Extract features
 * - Generate React frontend files
 * - Generate React Native files
 * - Generate Hono backend files
 * - Catch all errors from missing definitions
 */

import { Controller, Get, Query, Logger } from '@nestjs/common';
import { APP_TYPES_REGISTRY } from '../registries/app-types/index';
import { AppTypeDetectorService } from '../services/app-type-detector.service';
import { FeatureExtractorService } from '../services/feature-extractor.service';
import { SchemaDeriverService } from '../services/schema-deriver.service';
import { ReactRendererService } from '../services/react-renderer.service';
import { ReactNativeRendererService } from '../services/react-native-renderer.service';
import { HonoRendererService } from '../services/hono-renderer.service';
import { COMPONENTS_BY_ID } from '../registries/components/index';

interface TestResult {
  appTypeId: string;
  appTypeName: string;
  success: boolean;
  error?: string;
  errorType?: string;
  featureCount?: number;
  pageCount?: number;
  componentCount?: number;
  frontendFiles?: number;
  mobileFiles?: number;
  backendFiles?: number;
}

interface BatchTestSummary {
  totalAppTypes: number;
  tested: number;
  passed: number;
  failed: number;
  durationMs: number;
  failures: TestResult[];
  errorsByType: Record<string, number>;
}

@Controller('app-builder/batch-test')
export class BatchTestController {
  private readonly logger = new Logger(BatchTestController.name);

  @Get('run')
  async runBatchTest(
    @Query('startAt') startAt?: string,
    @Query('limit') limitStr?: string,
    @Query('appType') singleAppType?: string,
  ): Promise<BatchTestSummary> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    const errorsByType: Record<string, number> = {};

    // Get all app type IDs sorted alphabetically
    const allAppTypeIds = Object.keys(APP_TYPES_REGISTRY).sort();
    const totalAppTypes = allAppTypeIds.length;

    // Determine which app types to test
    let appTypeIds: string[];
    if (singleAppType) {
      // Test single app type
      appTypeIds = allAppTypeIds.filter(id => id === singleAppType);
      if (appTypeIds.length === 0) {
        return {
          totalAppTypes,
          tested: 0,
          passed: 0,
          failed: 1,
          durationMs: Date.now() - startTime,
          failures: [{
            appTypeId: singleAppType,
            appTypeName: 'Unknown',
            success: false,
            error: `App type '${singleAppType}' not found in registry`,
            errorType: 'NOT_FOUND',
          }],
          errorsByType: { 'NOT_FOUND': 1 },
        };
      }
    } else {
      // Apply pagination
      const startIndex = startAt ? allAppTypeIds.indexOf(startAt) : 0;
      const limit = limitStr ? parseInt(limitStr, 10) : totalAppTypes;
      appTypeIds = allAppTypeIds.slice(Math.max(0, startIndex), startIndex + limit);
    }

    this.logger.log(`Starting batch test: ${appTypeIds.length} app types`);

    // Initialize services once
    const keywordDetector = new AppTypeDetectorService();
    const featureExtractor = new FeatureExtractorService();
    const componentRegistry = {
      components: COMPONENTS_BY_ID,
      byCategory: new Map(),
      bySection: new Map(),
      byFeature: new Map(),
    };
    const schemaDeriver = new SchemaDeriverService(componentRegistry);
    const reactRenderer = new ReactRendererService();
    const reactNativeRenderer = new ReactNativeRendererService();
    const honoRenderer = new HonoRendererService();

    // Test each app type
    for (const appTypeId of appTypeIds) {
      const appType = APP_TYPES_REGISTRY[appTypeId];
      const result: TestResult = {
        appTypeId,
        appTypeName: appType?.name || 'Unknown',
        success: false,
      };

      try {
        // Use simple prompt based on app type name
        const prompt = `Create a ${appType.name} app`;

        // Step 1: Detect app type (using keyword detector directly with known type)
        const appTypeResult = await keywordDetector.detect(prompt);
        if (!appTypeResult.appType) {
          throw new Error(`DETECTION_FAILED: Could not detect app type from prompt`);
        }

        // Step 2: Extract features
        const featureResult = featureExtractor.extract(prompt, appType);
        const featureIds = featureResult.features.map(f => f.id);
        result.featureCount = featureIds.length;

        // Step 3: Get pages, components, entities
        const pages = featureExtractor.getPages(featureIds);
        const componentIds = featureExtractor.getComponents(featureIds);
        const entities = featureExtractor.getEntities(featureIds);
        const apiRoutes = featureExtractor.getApiRoutes(featureIds);

        result.pageCount = pages.length;
        result.componentCount = componentIds.length;

        const componentMap = new Map(
          componentIds
            .map(id => [id, COMPONENTS_BY_ID.get(id)])
            .filter(([_, c]) => c !== undefined) as [string, any][],
        );

        // Step 4: Derive schema
        const schemaResult = schemaDeriver.derive(
          componentIds,
          entities,
          appTypeId,
        );

        // Step 5: Generate keys (mock)
        const generatedKeys = {
          appId: 'test-app-id',
          databaseName: 'test_db',
          serviceRoleKey: 'test-service-key',
          anonKey: 'test-anon-key',
          jwtSecret: 'test-jwt-secret',
        };

        // Step 6: Set features on React renderer
        reactRenderer.setFeatures(featureResult.features);

        // Step 7: Build page instances
        const pageInstances = pages.map(page => ({
          id: page.id,
          route: page.route,
          title: page.title,
          templateId: page.templateId || 'default',
          section: page.section,
          components: page.components.map((compId, idx) => ({
            slotId: `slot-${idx}`,
            componentId: compId,
            props: {},
          })),
          dataFetching: [],
          auth: {
            required: page.authRequired,
            roles: page.roles,
          },
        }));

        // Mock branding config
        const mockBranding = {
          primaryColor: '#3b82f6',
          secondaryColor: '#64748b',
          accentColor: '#f59e0b',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          fontFamily: 'Inter',
          borderRadius: '0.5rem',
          logoUrl: null,
        };

        // Step 8: Generate React frontend
        const frontendFiles = reactRenderer.generateAll(
          pageInstances,
          componentMap,
          appType.name.replace(/\s+/g, ''),
          generatedKeys,
          mockBranding,
          'modern',
          'blue',
          appTypeId,
        );
        result.frontendFiles = frontendFiles.length;

        // Step 9: Generate React Native mobile
        reactNativeRenderer.setFeatures(featureResult.features);
        const mobileFiles = reactNativeRenderer.generateAll(
          pageInstances,
          componentMap,
          appType.name.replace(/\s+/g, ''),
          generatedKeys,
          mockBranding,
          'modern',
          'blue',
        );
        result.mobileFiles = mobileFiles.length;

        // Step 10: Generate Hono backend
        const backendFiles = honoRenderer.generateAll(
          apiRoutes,
          schemaResult.schema,
          appType.name.replace(/\s+/g, ''),
          generatedKeys,
        );
        result.backendFiles = backendFiles.length;

        result.success = true;
        this.logger.debug(`✅ ${appTypeId}: ${result.frontendFiles} frontend, ${result.mobileFiles} mobile, ${result.backendFiles} backend`);
      } catch (error: any) {
        result.success = false;
        result.error = error.message;

        // Categorize error type
        if (error.message.includes('Missing page definition')) {
          result.errorType = 'MISSING_PAGE_DEFINITION';
        } else if (error.message.includes('Missing component')) {
          result.errorType = 'MISSING_COMPONENT';
        } else if (error.message.includes('DETECTION_FAILED')) {
          result.errorType = 'DETECTION_FAILED';
        } else if (error.message.includes('Template ID')) {
          result.errorType = 'MISSING_TEMPLATE_MAPPING';
        } else {
          result.errorType = 'OTHER';
        }

        errorsByType[result.errorType] = (errorsByType[result.errorType] || 0) + 1;
        this.logger.warn(`❌ ${appTypeId}: ${error.message.substring(0, 100)}`);
      }

      results.push(result);
    }

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const failures = results.filter(r => !r.success);

    this.logger.log(`\n=== BATCH TEST COMPLETE ===`);
    this.logger.log(`Total: ${results.length}, Passed: ${passed}, Failed: ${failed}`);
    this.logger.log(`Error types:`, errorsByType);

    return {
      totalAppTypes,
      tested: results.length,
      passed,
      failed,
      durationMs: Date.now() - startTime,
      failures,
      errorsByType,
    };
  }

  @Get('quick')
  async quickTest(): Promise<{ message: string; sample: TestResult[] }> {
    // Test just the first 10 app types as a quick check
    const result = await this.runBatchTest(undefined, '10');
    return {
      message: `Quick test: ${result.passed}/${result.tested} passed`,
      sample: result.failures.slice(0, 5),
    };
  }

  @Get('stats')
  async getStats(): Promise<{ totalAppTypes: number; appTypes: string[] }> {
    const allAppTypeIds = Object.keys(APP_TYPES_REGISTRY).sort();
    return {
      totalAppTypes: allAppTypeIds.length,
      appTypes: allAppTypeIds.slice(0, 50), // First 50 as preview
    };
  }
}
