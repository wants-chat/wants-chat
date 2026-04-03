#!/usr/bin/env node

const { AppAtOnce } = require('@appatonce/node-sdk');
require('dotenv').config();

async function fixColumnTypes() {
  const sdk = new AppAtOnce({
    projectId: process.env.APPATONCE_PROJECT_ID,
    apiKey: process.env.APPATONCE_API_KEY,
    apiUrl: process.env.APPATONCE_API_URL || 'https://api.appatonce.com'
  });

  console.log('🔧 Fixing column types...\n');

  try {
    // First, we need to handle the type conversion with explicit casting
    const alterCommands = [
      // Fix health_profiles.height_cm - convert to numeric
      `ALTER TABLE health_profiles 
       ALTER COLUMN height_cm TYPE numeric 
       USING height_cm::numeric`,
       
      // Fix health_profiles.weight_kg if needed
      `ALTER TABLE health_profiles 
       ALTER COLUMN weight_kg TYPE numeric 
       USING weight_kg::numeric`,
    ];

    for (const command of alterCommands) {
      console.log(`Executing: ${command.split('\n')[0]}...`);
      try {
        await sdk.db.query(command);
        console.log('✅ Success\n');
      } catch (error) {
        if (error.message.includes('already of type')) {
          console.log('ℹ️  Column already has correct type\n');
        } else {
          console.error(`❌ Failed: ${error.message}\n`);
        }
      }
    }

    console.log('✅ Column types fixed successfully!');
    console.log('\n📌 Now you can run: npm run migrate:dev');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixColumnTypes();