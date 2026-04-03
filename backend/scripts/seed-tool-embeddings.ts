/**
 * Seed Tool Embeddings for Semantic Search
 *
 * =====================================================
 * SINGLE SOURCE OF TRUTH: src/data/tools-registry.ts
 * =====================================================
 *
 * This script reads tools from the centralized registry
 * and seeds them into Qdrant for semantic search.
 *
 * Run with:
 *   npx ts-node -r tsconfig-paths/register scripts/seed-tool-embeddings.ts
 *
 * Force re-seed:
 *   npx ts-node -r tsconfig-paths/register scripts/seed-tool-embeddings.ts --force
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ToolSearchService } from '../src/modules/tool-search/tool-search.service';
import { QdrantService } from '../src/modules/qdrant/qdrant.service';
import { AiService } from '../src/modules/ai/ai.service';
import {
  allTools,
  toolCategories,
  toolSynonyms,
  toolUseCases,
  categoryNames,
  autoGenerateSynonyms,
  getTotalToolsCount,
} from '../src/data/tools-registry';

async function bootstrap() {
  const forceReseed = process.argv.includes('--force');

  console.log('🚀 Starting tool embeddings seeder...\n');
  console.log(`📊 Source: src/data/tools-registry.ts (SINGLE SOURCE OF TRUTH)`);
  console.log(`📊 Total tools: ${getTotalToolsCount()}`);
  console.log(`📊 Categories: ${toolCategories.length}\n`);

  // Create NestJS application context with reduced logging
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  // Get services
  const toolSearchService = app.get(ToolSearchService);
  const qdrantService = app.get(QdrantService);
  const aiService = app.get(AiService);

  // Wait for Qdrant to be ready (max 30 seconds)
  console.log('⏳ Waiting for Qdrant to initialize...');
  const qdrantReady = await qdrantService.waitForInit(30000);
  if (!qdrantReady) {
    console.error('❌ Qdrant failed to initialize within 30 seconds.');
    console.error('   Please check QDRANT_HOST and QDRANT_PORT in .env');
    await app.close();
    process.exit(1);
  }
  console.log('✅ Qdrant is ready!\n');

  // Check AI service
  if (!aiService.isConfigured()) {
    console.error('❌ AI service is not configured.');
    console.error('   Please check OPENAI_API_KEY in .env');
    await app.close();
    process.exit(1);
  }
  console.log('✅ AI service is ready!\n');

  // Wait for ToolSearchService to complete its async initialization
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check if already seeded
  const existingCount = await toolSearchService.getToolCount();
  if (existingCount > 0 && !forceReseed) {
    console.log(`⚠️  Qdrant already has ${existingCount} tools.`);
    console.log('   Use --force to re-seed.\n');
    await app.close();
    return;
  }

  // Clear existing tools if force reseeding
  if (forceReseed && existingCount > 0) {
    console.log('🧹 Clearing existing tool embeddings...');
    await toolSearchService.clearAllTools();
    console.log('✅ Cleared existing embeddings.\n');
  }

  // Prepare tools with synonyms and use cases
  const toolsWithData = allTools.map(tool => {
    const manualSynonyms = toolSynonyms[tool.id] || [];
    const autoSynonyms = autoGenerateSynonyms(tool);
    const useCases = toolUseCases[tool.id] || [];

    return {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      category: tool.category,
      categoryName: categoryNames[tool.category] || tool.category,
      type: tool.type,
      icon: tool.icon,
      synonyms: [...new Set([...manualSynonyms, ...autoSynonyms])],
      useCases,
      multilingual: [], // Can add multilingual support later
    };
  });

  console.log(`📊 Seeding ${toolsWithData.length} tools...\n`);

  const result = await toolSearchService.seedTools(toolsWithData);

  console.log('\n✅ Seeding complete!');
  console.log(`   Success: ${result.success}`);
  console.log(`   Failed: ${result.failed}`);

  // Test a few searches
  console.log('\n🔍 Testing searches...\n');

  const testQueries = [
    'resize image',
    'create chart',
    'qr code',
    'bmi',
    'password',
    'timer',
    'email',
    'json',
    'dental chart',  // Should match health tracking, NOT data visualization
    'seating chart', // Should match event planning, NOT data visualization
  ];

  for (const query of testQueries) {
    const results = await toolSearchService.searchTools(query, 3);
    if (results.tools.length > 0) {
      console.log(`  "${query}" → ${results.tools.map(t => `${t.title} (${t.score.toFixed(2)})`).join(', ')}`);
    } else {
      console.log(`  "${query}" → No results`);
    }
  }

  await app.close();
  console.log('\n✨ Done!');
}

bootstrap().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
