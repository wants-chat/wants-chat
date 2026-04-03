#!/usr/bin/env node
/**
 * Fix app-type files by properly removing landingPage remnants v2
 *
 * This version handles:
 * - Orphaned features array with icon/title/description objects
 * - Dangling }, from landingPage closure
 */

const fs = require('fs');
const path = require('path');

const APP_TYPES_DIR = path.join(__dirname, '../registries/app-types');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Pattern: Remove orphaned features array that's part of landingPage
    // This matches features: [ { icon: ..., title: ..., description: ... }, ... ],
    // followed by an optional }, at the end
    content = content.replace(
      /,?\s*features:\s*\[\s*\{[\s\S]*?icon[\s\S]*?\}\s*,?\s*\]\s*,?\s*\}\s*,?\s*(?=\};)/g,
      '\n'
    );

    // Pattern: Remove just the dangling }, before };
    content = content.replace(/,?\s*\},\s*(?=\};)/g, '\n');

    // Clean up multiple blank lines
    content = content.replace(/\n{3,}/g, '\n\n');

    // Ensure proper closing
    content = content.replace(/\],\s*\n\s*\};/g, '],\n};');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { file: filePath, status: 'fixed' };
    }

    return { file: filePath, status: 'unchanged' };
  } catch (error) {
    return { file: filePath, status: 'error', error: error.message };
  }
}

function main() {
  console.log('Fixing app-type files (v2)...\n');

  const files = fs.readdirSync(APP_TYPES_DIR)
    .filter(f => f.endsWith('.ts'))
    .map(f => path.join(APP_TYPES_DIR, f));

  console.log(`Found ${files.length} app-type files\n`);

  let fixed = 0;
  let unchanged = 0;
  let errors = 0;

  for (const file of files) {
    const result = fixFile(file);

    if (result.status === 'fixed') {
      fixed++;
      if (fixed <= 30) {
        console.log(`✓ Fixed: ${path.basename(file)}`);
      }
    } else if (result.status === 'error') {
      errors++;
      console.log(`✗ Error: ${path.basename(file)} - ${result.error}`);
    } else {
      unchanged++;
    }
  }

  if (fixed > 30) {
    console.log(`... and ${fixed - 30} more files fixed`);
  }

  console.log('\n--- Summary ---');
  console.log(`Fixed: ${fixed}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${files.length}`);
}

main();
