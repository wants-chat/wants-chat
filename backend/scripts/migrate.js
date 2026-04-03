#!/usr/bin/env node

/**
 * Migration script for AppAtOnce database
 * This script compiles and runs TypeScript schema migrations
 */

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if API key is set
if (!process.env.APPATONCE_API_KEY) {
  console.error('❌ Error: APPATONCE_API_KEY is not set in .env file');
  process.exit(1);
}

// Get command line arguments
const args = process.argv.slice(2);
const schemaPath = path.join(__dirname, '..', 'src', 'database', 'schema.ts');

// Check if schema file exists
if (!fs.existsSync(schemaPath)) {
  console.error('❌ Error: Schema file not found at', schemaPath);
  process.exit(1);
}

console.log('🚀 AppAtOnce Database Migration');
console.log('================================\n');

try {
  // First, compile the TypeScript schema
  console.log('📦 Compiling TypeScript schema...');
  execSync('npx tsc src/database/schema.ts --outDir dist/database --module commonjs --target es2020 --esModuleInterop --skipLibCheck', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  // Now run the migration with the compiled JavaScript
  console.log('\n🔄 Running migration...');
  const compiledSchemaPath = path.join(__dirname, '..', 'dist', 'database', 'schema.js');
  
  const migrationCommand = `npx appatonce migrate ${compiledSchemaPath} ${args.join(' ')}`;
  console.log(`Executing: ${migrationCommand}\n`);
  
  execSync(migrationCommand, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: process.env
  });

  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}