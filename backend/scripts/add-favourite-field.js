#!/usr/bin/env node

/**
 * This script adds the is_favourite column to all existing travel_plans records
 * by updating them via the Fluxez SDK
 */

const { FluxezSDK } = require('@fluxez/node-sdk');

async function addFavouriteField() {
  try {
    console.log('🚀 Initializing Fluxez SDK...\n');

    const FLUXEZ_API_KEY = process.env.FLUXEZ_API_KEY || 'service_9e7f889f14a7eafd0302d4f70dd14c295f3de7bc4773c12ff3769db72dabb073';

    const fluxez = new FluxezSDK({
      apiKey: FLUXEZ_API_KEY,
    });

    console.log('📊 Fetching all travel plans...\n');

    // Get all travel plans
    const plans = await fluxez.table('travel_plans').find({});

    console.log(`Found ${plans.length} travel plans\n`);

    if (plans.length === 0) {
      console.log('✅ No travel plans to update. The column will be created when you run npm run migrate.');
      return;
    }

    console.log('📝 Adding is_favourite field to existing records...\n');

    let updated = 0;
    let skipped = 0;

    for (const plan of plans) {
      try {
        // Check if plan already has is_favourite field
        if (plan.is_favourite !== undefined) {
          skipped++;
          continue;
        }

        // Add the field
        await fluxez.table('travel_plans').update(plan.id, {
          is_favourite: false
        });

        updated++;

        if (updated % 10 === 0) {
          console.log(`   Updated ${updated} records...`);
        }
      } catch (error) {
        console.error(`   ⚠️  Failed to update plan ${plan.id}:`, error.message);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Records updated: ${updated}`);
    console.log(`   Records skipped: ${skipped}`);
    console.log(`\nNow run: npm run migrate`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nStack:', error.stack);

    console.error('\n💡 Make sure:');
    console.error('   - Fluxez API key is correct');
    console.error('   - You have an active internet connection');
    console.error('   - The travel_plans table exists\n');

    process.exit(1);
  }
}

// Run migration
addFavouriteField();
