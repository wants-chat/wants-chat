#!/usr/bin/env node
/**
 * Script to remove landingPage config from all app-type files
 *
 * The landingPage block is being removed because:
 * - Landing page design should come from UI components
 * - Each app-type defines which components it needs via landingPageComponents
 * - UI generators create type-appropriate content
 */

const fs = require('fs');
const path = require('path');

const APP_TYPES_DIR = path.join(__dirname, '../registries/app-types');

// Regex to match the entire landingPage block
// Matches: landingPage: { ... }, (including nested objects and arrays)
const LANDING_PAGE_REGEX = /\s*landingPage:\s*\{[\s\S]*?\n\s*\},?\n/g;

function removeLandingPage(content) {
  // Remove the landingPage block
  let result = content.replace(LANDING_PAGE_REGEX, '\n');

  // Clean up any double newlines that might result
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check if file has landingPage
    if (!content.includes('landingPage:')) {
      return { file: filePath, status: 'skipped', reason: 'no landingPage' };
    }

    const newContent = removeLandingPage(content);

    // Only write if content changed
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      return { file: filePath, status: 'updated' };
    }

    return { file: filePath, status: 'unchanged' };
  } catch (error) {
    return { file: filePath, status: 'error', error: error.message };
  }
}

function main() {
  console.log('Removing landingPage blocks from app-type files...\n');

  const files = fs.readdirSync(APP_TYPES_DIR)
    .filter(f => f.endsWith('.ts'))
    .map(f => path.join(APP_TYPES_DIR, f));

  console.log(`Found ${files.length} app-type files\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const result = processFile(file);

    if (result.status === 'updated') {
      updated++;
      // Only log first 20 updates to avoid spam
      if (updated <= 20) {
        console.log(`✓ Updated: ${path.basename(file)}`);
      }
    } else if (result.status === 'error') {
      errors++;
      console.log(`✗ Error: ${path.basename(file)} - ${result.error}`);
    } else {
      skipped++;
    }
  }

  if (updated > 20) {
    console.log(`... and ${updated - 20} more files updated`);
  }

  console.log('\n--- Summary ---');
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${files.length}`);
}

main();
