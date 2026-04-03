/**
 * Test Script for App Generation with Auto-Check and Auto-Repair
 *
 * Tests 5 different app types:
 * 1. ecommerce - E-commerce store
 * 2. blog - Blog platform
 * 3. booking - Appointment booking
 * 4. healthcare - Medical clinic
 * 5. restaurant - Restaurant/food ordering
 *
 * Run with: npx ts-node -r tsconfig-paths/register src/modules/app-creator/test-app-generation.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { AppCreatorService } from './app-creator.service';
import { GeneratedAppWithBuild } from './dto/create-app.dto';

interface TestCase {
  name: string;
  prompt: string;
  expectedAppType: string;
}

const testCases: TestCase[] = [
  {
    name: 'E-commerce Store',
    prompt: 'Create an e-commerce store with products, categories, shopping cart, and order management',
    expectedAppType: 'ecommerce',
  },
  {
    name: 'Blog Platform',
    prompt: 'Build a blog with posts, categories, tags, and comments. Authors can create and edit posts.',
    expectedAppType: 'blog',
  },
  {
    name: 'Booking System',
    prompt: 'Create an appointment booking system for a salon with services, staff, time slots, and customer bookings',
    expectedAppType: 'salon',
  },
  {
    name: 'Healthcare Clinic',
    prompt: 'Build a healthcare clinic management system with doctors, patients, appointments, and medical records',
    expectedAppType: 'clinic',
  },
  {
    name: 'Restaurant Ordering',
    prompt: 'Create a restaurant ordering system with menu items, categories, customer orders, and table reservations',
    expectedAppType: 'restaurant',
  },
];

interface TestResult {
  testCase: TestCase;
  success: boolean;
  app?: GeneratedAppWithBuild;
  error?: string;
  duration: number;
  buildStatus?: string;
  buildErrors?: number;
  repairAttempts?: number;
}

async function runTests(): Promise<void> {
  console.log('='.repeat(80));
  console.log('APP GENERATION TEST SUITE');
  console.log('Testing Auto-Check and Auto-Repair functionality');
  console.log('='.repeat(80));
  console.log('');

  // Bootstrap NestJS application
  console.log('Bootstrapping NestJS application...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const appCreatorService = app.get(AppCreatorService);
  console.log('AppCreatorService initialized');
  console.log('');

  const results: TestResult[] = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log('-'.repeat(80));
    console.log(`TEST ${i + 1}/${testCases.length}: ${testCase.name}`);
    console.log(`Prompt: "${testCase.prompt.substring(0, 60)}..."`);
    console.log('-'.repeat(80));

    const startTime = Date.now();

    try {
      const generatedApp = await appCreatorService.createApp(
        {
          prompt: testCase.prompt,
          appName: `Test ${testCase.name}`,
        },
        (step, status, message) => {
          console.log(`  [${step}] ${status}: ${message || ''}`);
        },
      ) as GeneratedAppWithBuild;

      const duration = Date.now() - startTime;
      const buildResult = generatedApp.buildResult;

      results.push({
        testCase,
        success: true,
        app: generatedApp,
        duration,
        buildStatus: buildResult?.status,
        buildErrors: buildResult?.totalErrors,
        repairAttempts: buildResult?.repairAttempts,
      });

      console.log('');
      console.log(`  ✅ SUCCESS`);
      console.log(`  App Type: ${generatedApp.appType}`);
      console.log(`  Output: ${generatedApp.outputPath}`);
      console.log(`  Build Status: ${buildResult?.status || 'unknown'}`);
      console.log(`  Total Errors: ${buildResult?.totalErrors || 0}`);
      console.log(`  Repair Attempts: ${buildResult?.repairAttempts || 0}`);
      console.log(`  Duration: ${(duration / 1000).toFixed(1)}s`);
    } catch (error: any) {
      const duration = Date.now() - startTime;

      results.push({
        testCase,
        success: false,
        error: error.message,
        duration,
      });

      console.log('');
      console.log(`  ❌ FAILED`);
      console.log(`  Error: ${error.message}`);
      console.log(`  Duration: ${(duration / 1000).toFixed(1)}s`);
    }

    console.log('');
  }

  // Print summary
  console.log('='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const buildSuccess = results.filter((r) => r.buildStatus === 'success' || r.buildStatus === 'repaired').length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`Total Tests: ${testCases.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Build Success: ${buildSuccess}/${passed}`);
  console.log(`Total Duration: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log(`Average Duration: ${(totalDuration / testCases.length / 1000).toFixed(1)}s`);
  console.log('');

  console.log('DETAILED RESULTS:');
  console.log('-'.repeat(80));

  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    const buildStatus = result.buildStatus ? ` [Build: ${result.buildStatus}]` : '';
    const repairs = result.repairAttempts ? ` [Repairs: ${result.repairAttempts}]` : '';
    console.log(`${status} ${result.testCase.name}${buildStatus}${repairs} (${(result.duration / 1000).toFixed(1)}s)`);

    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  console.log('');
  console.log('='.repeat(80));

  // Exit
  await app.close();
  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
