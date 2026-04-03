#!/usr/bin/env node
/**
 * Remove landingPage config from all app-type files
 *
 * Uses bracket matching to properly remove the entire landingPage block
 * without corrupting the file structure.
 */

const fs = require('fs');
const path = require('path');

const APP_TYPES_DIR = path.join(__dirname, '../registries/app-types');

function findMatchingBrace(content, startIndex) {
  let depth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : '';

    // Handle string literals
    if ((char === '"' || char === "'") && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      continue;
    }

    if (inString) continue;

    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
}

function removeLandingPage(content) {
  // Find "landingPage:" or "landingPage :"
  const regex = /(\s*)landingPage\s*:\s*\{/;
  const match = regex.exec(content);

  if (!match) {
    return { content, changed: false };
  }

  const startIndex = match.index;
  const braceStart = content.indexOf('{', startIndex);
  const braceEnd = findMatchingBrace(content, braceStart);

  if (braceEnd === -1) {
    console.error('Could not find matching brace for landingPage');
    return { content, changed: false };
  }

  // Find where the block ends (including trailing comma and whitespace)
  let endIndex = braceEnd + 1;

  // Skip trailing comma and whitespace
  while (endIndex < content.length && /[\s,]/.test(content[endIndex])) {
    endIndex++;
  }

  // Remove the block
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex);

  // Clean up: ensure no double commas or trailing commas before closing brace
  let result = before + after;

  // Remove any trailing comma before a closing brace
  result = result.replace(/,(\s*)\}/g, '$1}');

  // Remove multiple consecutive blank lines
  result = result.replace(/\n{3,}/g, '\n\n');

  return { content: result, changed: true };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check if file has landingPage
    if (!content.includes('landingPage')) {
      return { file: filePath, status: 'skipped', reason: 'no landingPage' };
    }

    const result = removeLandingPage(content);

    if (result.changed) {
      fs.writeFileSync(filePath, result.content, 'utf-8');
      return { file: filePath, status: 'updated' };
    }

    return { file: filePath, status: 'unchanged' };
  } catch (error) {
    return { file: filePath, status: 'error', error: error.message };
  }
}

function main() {
  console.log('Removing landingPage blocks from app-type files (v3)...\n');

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
