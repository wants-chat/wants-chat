import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { QdrantClient } from '@qdrant/js-client-rest';
import OpenAI from 'openai';

// Convert string ID to UUID format
function stringToUUID(str: string): string {
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const COLLECTION_NAME = 'wants_intent_patterns';
const VECTOR_SIZE = 1536;
const BATCH_SIZE = 50;

interface IntentPattern {
  id: string;
  pattern: string;
  category: string;
  subCategory?: string;
  uiType: string;
  serviceBackend: string;
  endpoint?: string;
  title: string;
  description: string;
  icon?: string;
  metadata?: Record<string, any>;
}

async function main() {
  console.log('\n🌱 Intent Pattern Seeder');
  console.log('========================\n');

  // Check required environment variables
  const qdrantHost = process.env.QDRANT_HOST;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!qdrantHost) {
    console.error('❌ QDRANT_HOST not configured');
    process.exit(1);
  }

  if (!openaiKey) {
    console.error('❌ OPENAI_API_KEY not configured');
    process.exit(1);
  }

  // Initialize clients
  const qdrantPort = parseInt(process.env.QDRANT_PORT || '6333', 10);
  let qdrantUrl = qdrantHost.startsWith('http') ? qdrantHost : `http://${qdrantHost}:${qdrantPort}`;

  const qdrantConfig: any = {
    url: qdrantUrl,
    checkCompatibility: false, // Server v1.12.5, client v1.16.2
  };
  if (process.env.QDRANT_API_KEY) {
    qdrantConfig.apiKey = process.env.QDRANT_API_KEY;
  }

  const qdrant = new QdrantClient(qdrantConfig);
  const openai = new OpenAI({ apiKey: openaiKey });

  console.log(`📡 Connecting to Qdrant: ${qdrantUrl}`);
  console.log(`🤖 Using OpenAI embedding model: text-embedding-3-small\n`);

  try {
    // Test connection
    await qdrant.getCollections();
    console.log('✅ Qdrant connection successful\n');
  } catch (error) {
    console.error('❌ Failed to connect to Qdrant:', error.message);
    process.exit(1);
  }

  // Load patterns from JSON
  const patternsPath = path.join(__dirname, 'seeds/intent-patterns.json');
  if (!fs.existsSync(patternsPath)) {
    console.error('❌ Patterns file not found:', patternsPath);
    process.exit(1);
  }

  const patternsData = JSON.parse(fs.readFileSync(patternsPath, 'utf-8'));
  const patterns: IntentPattern[] = patternsData.patterns;

  console.log(`📋 Loaded ${patterns.length} patterns from ${patternsPath}\n`);

  // Check if collection exists
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

  // Check command line args
  const args = process.argv.slice(2);
  const forceRecreate = args.includes('--force') || args.includes('-f');

  if (exists) {
    if (forceRecreate) {
      console.log('🗑️  Deleting existing collection (--force flag)...');
      await qdrant.deleteCollection(COLLECTION_NAME);
    } else {
      const info = await qdrant.getCollection(COLLECTION_NAME);
      console.log(`📊 Collection exists with ${info.points_count} patterns`);
      console.log('   Use --force to recreate from scratch\n');

      // Check if we need to add new patterns
      const existingCount = info.points_count;
      if (existingCount >= patterns.length) {
        console.log('✅ All patterns already seeded. Exiting.\n');
        process.exit(0);
      }
    }
  }

  // Create collection if needed
  if (!exists || forceRecreate) {
    console.log(`📦 Creating collection: ${COLLECTION_NAME}`);
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: 'Cosine',
      },
      on_disk_payload: true,
    });
    console.log('✅ Collection created\n');
  }

  // Seed patterns in batches
  console.log('🚀 Seeding patterns...\n');
  let success = 0;
  let failed = 0;

  for (let i = 0; i < patterns.length; i += BATCH_SIZE) {
    const batch = patterns.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(patterns.length / BATCH_SIZE);

    try {
      console.log(`   Batch ${batchNum}/${totalBatches}: Generating embeddings for ${batch.length} patterns...`);

      // Generate embeddings
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch.map((p) => p.pattern),
      });

      const embeddings = response.data.map((item) => item.embedding);

      // Prepare points - convert string IDs to UUIDs
      const points = batch.map((pattern, idx) => ({
        id: stringToUUID(pattern.id),
        vector: embeddings[idx],
        payload: {
          ...pattern,
          originalId: pattern.id, // Keep original ID in payload
        } as unknown as Record<string, unknown>,
      }));

      // Upsert to Qdrant
      await qdrant.upsert(COLLECTION_NAME, {
        wait: true,
        points,
      });

      success += batch.length;
      console.log(`   ✅ Batch ${batchNum} complete (${success}/${patterns.length} patterns)\n`);

      // Small delay to avoid rate limits
      if (i + BATCH_SIZE < patterns.length) {
        await new Promise((r) => setTimeout(r, 500));
      }
    } catch (error) {
      console.error(`   ❌ Batch ${batchNum} failed:`, error.message);
      if (error.data) {
        console.error(`   Error details:`, JSON.stringify(error.data, null, 2));
      }
      failed += batch.length;
    }
  }

  // Summary
  console.log('\n========================');
  console.log('📊 Seeding Summary');
  console.log('========================');
  console.log(`   ✅ Success: ${success}`);
  console.log(`   ❌ Failed:  ${failed}`);
  console.log(`   📋 Total:   ${patterns.length}\n`);

  // Verify
  const finalInfo = await qdrant.getCollection(COLLECTION_NAME);
  console.log(`📊 Collection now has ${finalInfo.points_count} patterns\n`);

  console.log('✅ Seeding complete!\n');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
