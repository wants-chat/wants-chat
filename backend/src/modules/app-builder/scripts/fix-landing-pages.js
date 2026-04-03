#!/usr/bin/env node
/**
 * Fix app-type files by properly removing landingPage remnants
 *
 * This script:
 * 1. Parses each file to find the export object
 * 2. Removes any landingPage-related content
 * 3. Ensures the file is valid TypeScript
 */

const fs = require('fs');
const path = require('path');

const APP_TYPES_DIR = path.join(__dirname, '../registries/app-types');

// Properties that are part of landingPage that should be removed if found at wrong level
const LANDING_PAGE_PROPS = [
  'heroTitle',
  'heroSubtitle',
  'primaryCta',
  'secondaryCta',
  'bottomCta',
  'mainEntity',
  'entityDisplayName',
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    // Pattern 1: Remove complete landingPage block
    // Matches landingPage: { ... }, with nested content
    content = content.replace(/\s*landingPage:\s*\{[\s\S]*?\n\s{2}\},?\n/g, '\n');

    // Pattern 2: Remove orphaned landingPage properties at root level
    // These are properties that shouldn't exist outside landingPage
    for (const prop of LANDING_PAGE_PROPS) {
      // Remove property with object value
      const objRegex = new RegExp(`\\s*${prop}:\\s*\\{[\\s\\S]*?\\n\\s{2,4}\\},?\\n`, 'g');
      content = content.replace(objRegex, '\n');

      // Remove property with array value
      const arrRegex = new RegExp(`\\s*${prop}:\\s*\\[[\\s\\S]*?\\n\\s{2,4}\\],?\\n`, 'g');
      content = content.replace(arrRegex, '\n');

      // Remove property with string value
      const strRegex = new RegExp(`\\s*${prop}:\\s*['"][^'"]*['"],?\\n`, 'g');
      content = content.replace(strRegex, '\n');
    }

    // Pattern 3: Remove orphaned "features" array that looks like landingPage features
    // (has icon, title, description objects)
    content = content.replace(/\s*features:\s*\[\s*\{[\s\S]*?icon[\s\S]*?title[\s\S]*?description[\s\S]*?\}\s*\],?\n/g, '\n');

    // Pattern 4: Fix broken structure - remove dangling },
    content = content.replace(/,\s*\},\s*\n\s*icon:/g, ',\n  icon:');
    content = content.replace(/\}\s*,\s*\n\s*icon:/g, '\n  icon:');

    // Pattern 5: Clean up multiple blank lines
    content = content.replace(/\n{3,}/g, '\n\n');

    // Pattern 6: Fix closing brace issues
    content = content.replace(/\},\s*\};/g, '},\n};');

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
  console.log('Fixing app-type files...\n');

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
      if (fixed <= 20) {
        console.log(`✓ Fixed: ${path.basename(file)}`);
      }
    } else if (result.status === 'error') {
      errors++;
      console.log(`✗ Error: ${path.basename(file)} - ${result.error}`);
    } else {
      unchanged++;
    }
  }

  if (fixed > 20) {
    console.log(`... and ${fixed - 20} more files fixed`);
  }

  console.log('\n--- Summary ---');
  console.log(`Fixed: ${fixed}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${files.length}`);
}

main();
