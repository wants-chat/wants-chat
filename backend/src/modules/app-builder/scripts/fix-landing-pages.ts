/**
 * Script to fix landingPage heroTitle newlines
 * Changes actual newlines in heroTitle back to \n escape sequences
 */

import * as fs from 'fs';
import * as path from 'path';

const APP_TYPES_DIR = path.join(__dirname, '../registries/app-types');

function fixLandingPageNewlines(filePath: string): { fixed: boolean; error?: string } {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Pattern to match heroTitle with actual newlines
    // Looking for: heroTitle: 'something\nsomething else',
    const heroTitlePattern = /(heroTitle:\s*')([^']*\n[^']*)(',)/g;

    let hasChanges = false;
    content = content.replace(heroTitlePattern, (match, prefix, value, suffix) => {
      hasChanges = true;
      // Replace actual newlines with escaped \n
      const fixedValue = value.replace(/\n/g, '\\n');
      return `${prefix}${fixedValue}${suffix}`;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { fixed: true };
    }

    return { fixed: false };
  } catch (error: any) {
    return { fixed: false, error: error.message };
  }
}

async function main() {
  console.log('Fixing landingPage heroTitle newlines...\n');

  const files = fs.readdirSync(APP_TYPES_DIR)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts');

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const filePath = path.join(APP_TYPES_DIR, file);
    const result = fixLandingPageNewlines(filePath);

    if (result.fixed) {
      fixed++;
      console.log(`✅ Fixed: ${file}`);
    } else if (result.error) {
      errors++;
      console.log(`❌ Error: ${file} - ${result.error}`);
    } else {
      skipped++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total files: ${files.length}`);
  console.log(`Fixed: ${fixed}`);
  console.log(`Skipped (no issues): ${skipped}`);
  console.log(`Errors: ${errors}`);
}

main().catch(console.error);
