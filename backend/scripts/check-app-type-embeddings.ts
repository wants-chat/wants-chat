/**
 * Check App Type Embeddings in Qdrant
 *
 * Quick script to verify if embeddings are properly seeded.
 * Run: npx ts-node scripts/check-app-type-embeddings.ts
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const COLLECTION_NAME = 'app-types';

async function main() {
  console.log('🔍 Checking App Type Embeddings in Qdrant\n');

  const qdrantHost = process.env.QDRANT_HOST;

  if (!qdrantHost) {
    console.error('❌ QDRANT_HOST not set in .env.local');
    process.exit(1);
  }

  const url = qdrantHost.startsWith('http') ? qdrantHost : `http://${qdrantHost}:6333`;
  console.log(`📡 Connecting to: ${url}`);

  const qdrant = new QdrantClient({
    url,
    checkCompatibility: false,
  });

  try {
    // 1. Check connection
    const collections = await qdrant.getCollections();
    console.log(`✅ Connected to Qdrant`);
    console.log(`📁 Collections: ${collections.collections.map(c => c.name).join(', ')}\n`);

    // 2. Check app-types collection
    const hasAppTypes = collections.collections.some(c => c.name === COLLECTION_NAME);
    if (!hasAppTypes) {
      console.error(`❌ Collection "${COLLECTION_NAME}" NOT FOUND!`);
      console.log(`\n👉 Run: npx ts-node scripts/seed-app-type-embeddings.ts`);
      process.exit(1);
    }

    // 3. Get collection info
    const info = await qdrant.getCollection(COLLECTION_NAME);
    console.log(`📊 Collection "${COLLECTION_NAME}":`);
    console.log(`   Points: ${info.points_count}`);
    console.log(`   Status: ${info.status}`);
    console.log(`   Vector size: ${(info.config?.params?.vectors as any)?.size}`);

    if (info.points_count === 0) {
      console.error(`\n❌ Collection is EMPTY! No embeddings found.`);
      console.log(`\n👉 Run: npx ts-node scripts/seed-app-type-embeddings.ts`);
      process.exit(1);
    }

    // 4. Test a search
    console.log(`\n🧪 Testing search with "social network"...`);

    // Generate a test embedding (if OpenAI key is available)
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const OpenAI = require('openai').default;
      const openai = new OpenAI({ apiKey: openaiKey });

      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: 'Create a social network',
      });

      const results = await qdrant.search(COLLECTION_NAME, {
        vector: embeddingResponse.data[0].embedding,
        limit: 5,
        with_payload: true,
      });

      console.log(`\n📋 Top 5 matches for "social network":`);
      results.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.payload?.name} (${r.payload?.id}) - Score: ${(r.score * 100).toFixed(1)}%`);
      });

      // Check if social-network is in top results
      const hasSocialNetwork = results.some(r => r.payload?.id === 'social-network');
      if (hasSocialNetwork) {
        console.log(`\n✅ Embeddings working correctly! "social-network" found in results.`);
      } else {
        console.log(`\n⚠️  "social-network" NOT in top 5 results. Embeddings may need re-seeding.`);
      }
    } else {
      console.log(`   ⚠️  OPENAI_API_KEY not set - skipping search test`);
    }

    console.log(`\n✅ Qdrant check complete!`);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
