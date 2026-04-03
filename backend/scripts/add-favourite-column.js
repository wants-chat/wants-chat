#!/usr/bin/env node

const axios = require('axios');

async function addFavouriteColumn() {
  try {
    console.log('🚀 Adding is_favourite column to travel_plans table');
    console.log('================================================\n');

    const FLUXEZ_API_KEY = process.env.FLUXEZ_API_KEY || 'service_9e7f889f14a7eafd0302d4f70dd14c295f3de7bc4773c12ff3769db72dabb073';

    // SQL to add the column
    const sql = `
      -- Add is_favourite column to travel_plans table
      ALTER TABLE travel_plans
      ADD COLUMN IF NOT EXISTS is_favourite BOOLEAN DEFAULT false;

      -- Create index for faster queries on favourite plans
      CREATE INDEX IF NOT EXISTS idx_travel_plans_user_favourite
      ON travel_plans(user_id, is_favourite);

      -- Update existing plans to have is_favourite = false (default)
      UPDATE travel_plans
      SET is_favourite = false
      WHERE is_favourite IS NULL;
    `;

    console.log('📝 Executing SQL migration...\n');

    // Execute raw SQL via Fluxez API
    const response = await axios.post(
      'https://api.fluxez.com/api/v1/query/raw',
      {
        sql: sql.trim()
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': FLUXEZ_API_KEY
        },
        timeout: 30000
      }
    );

    if (response.data.success || response.status === 200) {
      console.log('✅ Column added successfully!');
      console.log('   - is_favourite column created');
      console.log('   - Index created on (user_id, is_favourite)');
      console.log('   - Existing records updated to default value\n');
    } else {
      console.error('❌ Migration failed:', response.data.message || 'Unknown error');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response?.data?.error) {
      console.error('   Details:', error.response.data.error);
    }

    console.error('\n💡 This error might mean:');
    console.error('   - The column already exists (which is fine!)');
    console.error('   - There\'s a connection issue with Fluxez API');
    console.error('   - You need to run: npm run migrate\n');

    // Don't exit with error if column already exists
    if (error.message?.includes('already exists')) {
      console.log('✅ Column already exists, no action needed.');
      process.exit(0);
    }

    process.exit(1);
  }
}

// Run migration
addFavouriteColumn();
