/**
 * Seed App Type Embeddings to Qdrant
 *
 * ONE-TIME script to generate embeddings for all app types and store in Qdrant.
 * This eliminates the expensive startup cost of generating embeddings on each server restart.
 *
 * Run: npx ts-node scripts/seed-app-type-embeddings.ts
 *
 * Requirements:
 * - QDRANT_HOST environment variable set
 * - OPENAI_API_KEY environment variable set
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const COLLECTION_NAME = 'app-types';
const VECTOR_SIZE = 1536; // text-embedding-3-small
const BATCH_SIZE = 100;
const EMBEDDING_MODEL = 'text-embedding-3-small';

// Import all app types
import { ALL_APP_TYPES } from '../src/modules/app-builder/registries/app-types/index';

async function main() {
  console.log('🚀 Starting App Type Embeddings Seed\n');

  // Validate environment
  const qdrantHost = process.env.QDRANT_HOST;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!qdrantHost) {
    console.error('❌ QDRANT_HOST not set');
    process.exit(1);
  }

  if (!openaiKey) {
    console.error('❌ OPENAI_API_KEY not set');
    process.exit(1);
  }

  // Initialize clients
  const qdrant = new QdrantClient({
    url: qdrantHost.startsWith('http') ? qdrantHost : `http://${qdrantHost}:6333`,
    checkCompatibility: false,
  });

  const openai = new OpenAI({ apiKey: openaiKey });

  console.log(`📊 Total app types: ${ALL_APP_TYPES.length}`);
  console.log(`🗄️  Qdrant host: ${qdrantHost}`);
  console.log(`🔤 Embedding model: ${EMBEDDING_MODEL}\n`);

  // Step 1: Create or recreate collection
  console.log('📁 Setting up collection...');
  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

    if (exists) {
      console.log(`   Deleting existing collection "${COLLECTION_NAME}"...`);
      await qdrant.deleteCollection(COLLECTION_NAME);
    }

    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine',
      },
      on_disk_payload: true,
    });

    console.log(`   ✅ Created collection "${COLLECTION_NAME}"\n`);
  } catch (error) {
    console.error('❌ Failed to setup collection:', error.message);
    process.exit(1);
  }

  // Step 2: Generate embeddings and insert in batches
  console.log('🔄 Generating embeddings and inserting into Qdrant...\n');

  let totalInserted = 0;
  const startTime = Date.now();

  for (let i = 0; i < ALL_APP_TYPES.length; i += BATCH_SIZE) {
    const batch = ALL_APP_TYPES.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(ALL_APP_TYPES.length / BATCH_SIZE);

    console.log(`   Batch ${batchNum}/${totalBatches} (${batch.length} app types)...`);

    try {
      // Create searchable text for each app type
      const texts = batch.map((app) => {
        const keywords = (app.keywords || []).slice(0, 5).join(', ');
        const synonyms = (app.synonyms || []).slice(0, 3).join(', ');
        return `${app.name}: ${app.description}. Keywords: ${keywords}. Also known as: ${synonyms}`;
      });

      // Generate embeddings
      const embeddingResponse = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: texts,
      });

      // Prepare points for Qdrant
      const points = batch.map((app, index) => ({
        id: hashToUUID(app.id),
        vector: embeddingResponse.data[index].embedding,
        payload: {
          id: app.id,
          name: app.name,
          category: app.category,
          description: app.description?.substring(0, 200),
          industry: app.industry || app.category,
        },
      }));

      // Insert into Qdrant
      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        points,
      });

      totalInserted += batch.length;
      console.log(`   ✅ Inserted ${totalInserted}/${ALL_APP_TYPES.length}`);

      // Small delay to avoid rate limits
      if (i + BATCH_SIZE < ALL_APP_TYPES.length) {
        await sleep(100);
      }
    } catch (error) {
      console.error(`   ❌ Batch ${batchNum} failed:`, error.message);
      // Continue with next batch
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Step 3: Verify
  console.log('\n📊 Verifying...');
  const info = await qdrant.getCollection(COLLECTION_NAME);
  console.log(`   Points in collection: ${info.points_count}`);
  console.log(`   Status: ${info.status}`);

  console.log('\n✅ Done!');
  console.log(`   Total inserted: ${totalInserted}`);
  console.log(`   Time elapsed: ${elapsed}s`);
  console.log(`   Collection: ${COLLECTION_NAME}`);
}

// Helper: Convert string to UUID format for Qdrant
function hashToUUID(str: string): string {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

// Helper: Sleep
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(console.error);
