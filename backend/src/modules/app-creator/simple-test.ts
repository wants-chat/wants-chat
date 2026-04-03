/**
 * Simple Test Script for App Generation
 * Run with: npx ts-node -r tsconfig-paths/register src/modules/app-creator/simple-test.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { AppCreatorService } from './app-creator.service';

async function runSimpleTest(): Promise<void> {
  console.log('Starting simple test...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['log', 'error', 'warn'],
    });

    console.log('NestJS app bootstrapped');

    const appCreatorService = app.get(AppCreatorService);
    console.log('AppCreatorService obtained');

    console.log('\nGenerating ecommerce app...');
    const result = await appCreatorService.createApp(
      {
        prompt: 'Create a simple e-commerce store with products and categories',
        appName: 'Test Ecommerce',
      },
      (step, status, message) => {
        console.log(`[${step}] ${status}: ${message || ''}`);
      },
    );

    console.log('\n=== RESULT ===');
    console.log('App ID:', result.id);
    console.log('App Type:', result.appType);
    console.log('Output Path:', result.outputPath);
    console.log('Build Result:', JSON.stringify((result as any).buildResult, null, 2));

    await app.close();
    console.log('\nTest completed!');
  } catch (error: any) {
    console.error('Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runSimpleTest();
