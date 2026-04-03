#!/usr/bin/env node

/**
 * Compile TypeScript schema to JavaScript for AppAtOnce migration
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const schemaPath = path.join(__dirname, '..', 'src', 'database', 'schema.ts');
const outputDir = path.join(__dirname, '..', 'dist', 'database');
const outputFile = path.join(outputDir, 'schema.js');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('📦 Compiling TypeScript schema...');

try {
  // Compile TypeScript to JavaScript
  execSync(`npx tsc ${schemaPath} --outDir ${outputDir} --module commonjs --target es2020 --esModuleInterop --skipLibCheck --resolveJsonModule`, {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  // Check if the output file was created
  if (fs.existsSync(outputFile)) {
    console.log('✅ Schema compiled successfully to:', outputFile);
    process.exit(0);
  } else {
    console.error('❌ Schema compilation failed - output file not found');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Compilation error:', error.message);
  process.exit(1);
}