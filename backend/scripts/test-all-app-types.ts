/**
 * Test All App Types Script
 *
 * Comprehensive test that verifies all 3155+ app types generate successfully
 * for both React and React Native renderers.
 *
 * Run: npx ts-node scripts/test-all-app-types.ts [options]
 *
 * Options:
 *   --start=<app-type-id>   Start from a specific app type (for resuming)
 *   --limit=<number>        Limit the number of app types to test
 *   --type=<app-type-id>    Test a single app type only
 *   --verbose               Show detailed progress for each app type
 *   --json                  Output results as JSON
 */

import * as path from 'path';

// Resolve paths
const srcPath = path.join(__dirname, '../src');

// Import services and registries
import { APP_TYPES_REGISTRY } from '../src/modules/app-builder/registries/app-types/index';
import { AppTypeDetectorService } from '../src/modules/app-builder/services/app-type-detector.service';
import { FeatureExtractorService } from '../src/modules/app-builder/services/feature-extractor.service';
import { SchemaDeriverService } from '../src/modules/app-builder/services/schema-deriver.service';
import { ReactRendererService } from '../src/modules/app-builder/services/react-renderer.service';
import { ReactNativeRendererService } from '../src/modules/app-builder/services/react-native-renderer.service';
import { HonoRendererService } from '../src/modules/app-builder/services/hono-renderer.service';
import { COMPONENTS_BY_ID } from '../src/modules/app-builder/registries/components/index';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface TestResult {
  appTypeId: string;
  appTypeName: string;
  success: boolean;
  error?: string;
  errorType?: string;
  stack?: string;
  featureCount?: number;
  pageCount?: number;
  componentCount?: number;
  reactFiles?: number;
  reactNativeFiles?: number;
  backendFiles?: number;
  durationMs?: number;
}

interface TestSummary {
  totalAppTypes: number;
  tested: number;
  passed: number;
  failed: number;
  skipped: number;
  totalDurationMs: number;
  avgDurationMs: number;
  failures: TestResult[];
  errorsByType: Record<string, number>;
  topErrors: Array<{ error: string; count: number; appTypes: string[] }>;
}

// ─────────────────────────────────────────────────────────────
// Argument Parser
// ─────────────────────────────────────────────────────────────

function parseArgs(): {
  start?: string;
  limit?: number;
  singleType?: string;
  verbose: boolean;
  json: boolean;
} {
  const args = process.argv.slice(2);
  const result = {
    start: undefined as string | undefined,
    limit: undefined as number | undefined,
    singleType: undefined as string | undefined,
    verbose: false,
    json: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--start=')) {
      result.start = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      result.limit = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--type=')) {
      result.singleType = arg.split('=')[1];
    } else if (arg === '--verbose' || arg === '-v') {
      result.verbose = true;
    } else if (arg === '--json') {
      result.json = true;
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// Console Colors (for non-JSON output)
// ─────────────────────────────────────────────────────────────

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

// ─────────────────────────────────────────────────────────────
// Test Runner
// ─────────────────────────────────────────────────────────────

async function testAppType(
  appTypeId: string,
  keywordDetector: AppTypeDetectorService,
  featureExtractor: FeatureExtractorService,
  schemaDeriver: SchemaDeriverService,
  reactRenderer: ReactRendererService,
  reactNativeRenderer: ReactNativeRendererService,
  honoRenderer: HonoRendererService,
  verbose: boolean,
): Promise<TestResult> {
  const startTime = Date.now();
  const appType = APP_TYPES_REGISTRY[appTypeId];

  if (!appType) {
    return {
      appTypeId,
      appTypeName: 'Unknown',
      success: false,
      error: `App type '${appTypeId}' not found in registry`,
      errorType: 'NOT_FOUND',
      durationMs: Date.now() - startTime,
    };
  }

  const result: TestResult = {
    appTypeId,
    appTypeName: appType.name,
    success: false,
  };

  try {
    // Step 1: Create test prompt
    const prompt = `Create a ${appType.name} app`;
    if (verbose) console.log(colorize(`  Step 1: Detecting app type...`, 'gray'));

    // Step 2: Detect app type (using keyword detector)
    const appTypeResult = await keywordDetector.detect(prompt);
    if (!appTypeResult.appType) {
      throw new Error(`DETECTION_FAILED: Could not detect app type from prompt "${prompt}"`);
    }

    // Step 3: Extract features
    if (verbose) console.log(colorize(`  Step 2: Extracting features...`, 'gray'));
    const featureResult = featureExtractor.extract(prompt, appType);
    const featureIds = featureResult.features.map((f) => f.id);
    result.featureCount = featureIds.length;

    // Step 4: Get pages, components, entities
    if (verbose) console.log(colorize(`  Step 3: Getting pages and components...`, 'gray'));
    const pages = featureExtractor.getPages(featureIds);
    const componentIds = featureExtractor.getComponents(featureIds);
    const entities = featureExtractor.getEntities(featureIds);
    const apiRoutes = featureExtractor.getApiRoutes(featureIds);

    result.pageCount = pages.length;
    result.componentCount = componentIds.length;

    const componentMap = new Map(
      componentIds
        .map((id) => [id, COMPONENTS_BY_ID.get(id)])
        .filter(([_, c]) => c !== undefined) as [string, any][],
    );

    // Step 5: Derive schema
    if (verbose) console.log(colorize(`  Step 4: Deriving schema...`, 'gray'));
    const schemaResult = schemaDeriver.derive(componentIds, entities, appTypeId);

    // Step 6: Generate mock keys
    const generatedKeys = {
      appId: 'test-app-id',
      databaseName: 'test_db',
      serviceRoleKey: 'test-service-key',
      anonKey: 'test-anon-key',
      jwtSecret: 'test-jwt-secret',
    };

    // Step 7: Build page instances
    if (verbose) console.log(colorize(`  Step 5: Building page instances...`, 'gray'));
    const pageInstances = pages.map((page) => ({
      id: page.id,
      route: page.route,
      title: page.title,
      templateId: page.templateId || 'default',
      section: page.section,
      components: page.components.map((compId: string, idx: number) => ({
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

    // Step 8: Set features on renderers
    reactRenderer.setFeatures(featureResult.features);
    reactNativeRenderer.setFeatures(featureResult.features);

    // Step 9: Generate React frontend
    if (verbose) console.log(colorize(`  Step 6: Generating React frontend...`, 'gray'));
    const reactFiles = reactRenderer.generateAll(
      pageInstances,
      componentMap,
      appType.name.replace(/\s+/g, ''),
      generatedKeys,
      mockBranding,
      'modern',
      'blue',
      appTypeId,
    );
    result.reactFiles = reactFiles.length;

    // Step 10: Generate React Native mobile
    if (verbose) console.log(colorize(`  Step 7: Generating React Native mobile...`, 'gray'));
    const mobileFiles = reactNativeRenderer.generateAll(
      pageInstances,
      componentMap,
      appType.name.replace(/\s+/g, ''),
      generatedKeys,
      mockBranding,
      'modern',
      'blue',
    );
    result.reactNativeFiles = mobileFiles.length;

    // Step 11: Generate Hono backend
    if (verbose) console.log(colorize(`  Step 8: Generating Hono backend...`, 'gray'));
    const backendFiles = honoRenderer.generateAll(
      apiRoutes,
      schemaResult.schema,
      appType.name.replace(/\s+/g, ''),
      generatedKeys,
    );
    result.backendFiles = backendFiles.length;

    result.success = true;
    result.durationMs = Date.now() - startTime;
  } catch (error: any) {
    result.success = false;
    result.error = error.message;
    result.stack = error.stack;
    result.durationMs = Date.now() - startTime;

    // Categorize error type
    if (error.message.includes('Missing page definition')) {
      result.errorType = 'MISSING_PAGE_DEFINITION';
    } else if (error.message.includes('Missing component')) {
      result.errorType = 'MISSING_COMPONENT';
    } else if (error.message.includes('DETECTION_FAILED')) {
      result.errorType = 'DETECTION_FAILED';
    } else if (error.message.includes('Template ID') || error.message.includes('templateId')) {
      result.errorType = 'MISSING_TEMPLATE_MAPPING';
    } else if (error.message.includes('Cannot determine entity')) {
      result.errorType = 'MISSING_ENTITY';
    } else if (error.message.includes('Missing React Native component')) {
      result.errorType = 'MISSING_RN_COMPONENT';
    } else if (error.message.includes('not found in registry')) {
      result.errorType = 'NOT_FOUND';
    } else {
      result.errorType = 'OTHER';
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// Main Function
// ─────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const startTime = Date.now();
  const results: TestResult[] = [];
  const errorsByType: Record<string, number> = {};
  const errorMessages: Map<string, string[]> = new Map();

  // Get all app type IDs sorted alphabetically
  const allAppTypeIds = Object.keys(APP_TYPES_REGISTRY).sort();
  const totalAppTypes = allAppTypeIds.length;

  if (!args.json) {
    console.log(colorize('\n========================================', 'cyan'));
    console.log(colorize('  App Type Generation Test Suite', 'bright'));
    console.log(colorize('========================================\n', 'cyan'));
    console.log(`Total app types in registry: ${colorize(totalAppTypes.toString(), 'cyan')}`);
  }

  // Determine which app types to test
  let appTypeIds: string[];
  if (args.singleType) {
    appTypeIds = [args.singleType];
    if (!APP_TYPES_REGISTRY[args.singleType]) {
      console.error(colorize(`\nError: App type '${args.singleType}' not found in registry\n`, 'red'));
      process.exit(1);
    }
    if (!args.json) console.log(`Testing single app type: ${colorize(args.singleType, 'yellow')}`);
  } else {
    let startIndex = 0;
    if (args.start) {
      startIndex = allAppTypeIds.indexOf(args.start);
      if (startIndex === -1) {
        console.error(colorize(`\nError: Start app type '${args.start}' not found\n`, 'red'));
        process.exit(1);
      }
    }
    const limit = args.limit || totalAppTypes;
    appTypeIds = allAppTypeIds.slice(startIndex, startIndex + limit);
    if (!args.json) {
      console.log(`Testing ${colorize(appTypeIds.length.toString(), 'yellow')} app types`);
      if (args.start) console.log(`Starting from: ${colorize(args.start, 'yellow')}`);
      if (args.limit) console.log(`Limit: ${colorize(args.limit.toString(), 'yellow')}`);
    }
  }

  if (!args.json) console.log('\n' + colorize('Starting tests...', 'cyan') + '\n');

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

  // Progress tracking
  let passed = 0;
  let failed = 0;
  let tested = 0;

  // Test each app type
  for (const appTypeId of appTypeIds) {
    tested++;
    const progressPct = Math.round((tested / appTypeIds.length) * 100);

    if (!args.json && !args.verbose) {
      process.stdout.write(
        `\r  [${progressPct.toString().padStart(3)}%] Testing: ${appTypeId.padEnd(40)}`,
      );
    } else if (args.verbose && !args.json) {
      console.log(colorize(`\n[${tested}/${appTypeIds.length}] Testing: ${appTypeId}`, 'blue'));
    }

    const result = await testAppType(
      appTypeId,
      keywordDetector,
      featureExtractor,
      schemaDeriver,
      reactRenderer,
      reactNativeRenderer,
      honoRenderer,
      args.verbose,
    );

    results.push(result);

    if (result.success) {
      passed++;
      if (args.verbose && !args.json) {
        console.log(
          colorize(`  PASSED`, 'green') +
            colorize(` (${result.reactFiles} React, ${result.reactNativeFiles} RN, ${result.backendFiles} Backend)`, 'gray'),
        );
      }
    } else {
      failed++;
      errorsByType[result.errorType || 'OTHER'] = (errorsByType[result.errorType || 'OTHER'] || 0) + 1;

      // Track error messages for grouping
      const errorKey = result.error?.substring(0, 100) || 'Unknown error';
      if (!errorMessages.has(errorKey)) {
        errorMessages.set(errorKey, []);
      }
      errorMessages.get(errorKey)!.push(appTypeId);

      if (args.verbose && !args.json) {
        console.log(colorize(`  FAILED: ${result.error?.substring(0, 80)}...`, 'red'));
      }
    }
  }

  // Calculate summary
  const totalDurationMs = Date.now() - startTime;
  const avgDurationMs = results.length > 0 ? Math.round(totalDurationMs / results.length) : 0;

  // Get top errors
  const topErrors = Array.from(errorMessages.entries())
    .map(([error, appTypes]) => ({ error, count: appTypes.length, appTypes: appTypes.slice(0, 5) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const summary: TestSummary = {
    totalAppTypes,
    tested: results.length,
    passed,
    failed,
    skipped: totalAppTypes - results.length,
    totalDurationMs,
    avgDurationMs,
    failures: results.filter((r) => !r.success),
    errorsByType,
    topErrors,
  };

  // Output results
  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log('\n');
    console.log(colorize('\n========================================', 'cyan'));
    console.log(colorize('  TEST RESULTS SUMMARY', 'bright'));
    console.log(colorize('========================================\n', 'cyan'));

    console.log(`  Total App Types:  ${colorize(totalAppTypes.toString(), 'cyan')}`);
    console.log(`  Tested:           ${colorize(summary.tested.toString(), 'blue')}`);
    console.log(`  Passed:           ${colorize(passed.toString(), 'green')}`);
    console.log(`  Failed:           ${colorize(failed.toString(), failed > 0 ? 'red' : 'green')}`);
    console.log(`  Skipped:          ${colorize(summary.skipped.toString(), 'gray')}`);
    console.log(`  Duration:         ${colorize((totalDurationMs / 1000).toFixed(2) + 's', 'yellow')}`);
    console.log(`  Avg per type:     ${colorize(avgDurationMs + 'ms', 'yellow')}`);

    // Pass rate
    const passRate = results.length > 0 ? Math.round((passed / results.length) * 100) : 0;
    const passColor = passRate === 100 ? 'green' : passRate >= 90 ? 'yellow' : 'red';
    console.log(`  Pass Rate:        ${colorize(passRate + '%', passColor)}`);

    // Errors by type
    if (Object.keys(errorsByType).length > 0) {
      console.log(colorize('\n  Errors by Type:', 'yellow'));
      for (const [type, count] of Object.entries(errorsByType).sort((a, b) => b[1] - a[1])) {
        console.log(`    ${type.padEnd(30)} ${colorize(count.toString(), 'red')}`);
      }
    }

    // Top errors
    if (topErrors.length > 0) {
      console.log(colorize('\n  Top Error Messages:', 'yellow'));
      for (const { error, count, appTypes } of topErrors.slice(0, 5)) {
        console.log(`    [${count}x] ${error.substring(0, 60)}...`);
        console.log(colorize(`         Affected: ${appTypes.join(', ')}${appTypes.length < count ? '...' : ''}`, 'gray'));
      }
    }

    // First 10 failures
    if (failed > 0) {
      console.log(colorize('\n  First 10 Failures:', 'red'));
      for (const failure of summary.failures.slice(0, 10)) {
        console.log(`    ${colorize(failure.appTypeId.padEnd(35), 'yellow')} ${failure.errorType || 'OTHER'}`);
        console.log(colorize(`      ${failure.error?.substring(0, 70)}...`, 'gray'));
      }
      if (failed > 10) {
        console.log(colorize(`    ... and ${failed - 10} more failures`, 'gray'));
      }
    }

    console.log(colorize('\n========================================\n', 'cyan'));

    // Exit code
    if (failed > 0) {
      console.log(colorize(`Test suite FAILED with ${failed} failures.\n`, 'red'));
      process.exit(1);
    } else {
      console.log(colorize(`All ${passed} tests PASSED!\n`, 'green'));
      process.exit(0);
    }
  }
}

// Run
const args = parseArgs();

// Suppress console.warn for JSON output mode
if (args.json) {
  const originalWarn = console.warn;
  console.warn = () => {};
}

main().catch((error) => {
  console.error(colorize(`\nFatal error: ${error.message}\n`, 'red'));
  console.error(error.stack);
  process.exit(1);
});
