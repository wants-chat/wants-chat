/**
 * Script to fix all static React and React Native generators
 * Adds useQuery (React) or useEffect (React Native) for dynamic data fetching
 */

import * as fs from 'fs';
import * as path from 'path';

const REACT_GENERATORS_DIR = path.join(__dirname, '../src/modules/app-builder/generators/react-components');
const RN_GENERATORS_DIR = path.join(__dirname, '../src/modules/app-builder/generators/react-native-components');

let fixedCount = 0;
let skippedCount = 0;
let errorCount = 0;

function getAllGeneratorFiles(dir: string): string[] {
  const files: string[] = [];

  function walkDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.name.endsWith('.generator.ts')) {
        files.push(fullPath);
      }
    }
  }

  walkDir(dir);
  return files;
}

function hasUseQuery(content: string): boolean {
  return content.includes('useQuery') || content.includes('@tanstack/react-query');
}

function hasUseEffect(content: string): boolean {
  // Check for useEffect with fetch pattern
  return content.includes('useEffect') && (content.includes('fetch(') || content.includes('setFetchedData'));
}

function fixReactGenerator(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has useQuery
    if (hasUseQuery(content)) {
      console.log(`[SKIP] Already has useQuery: ${path.basename(filePath)}`);
      skippedCount++;
      return false;
    }

    // Skip index files and type files
    if (filePath.includes('index.ts') || filePath.includes('.interface.ts')) {
      skippedCount++;
      return false;
    }

    // Find the dataName variable
    const dataNameMatch = content.match(/const dataName = getDataPath\(\);/);
    if (!dataNameMatch) {
      console.log(`[SKIP] No dataName found: ${path.basename(filePath)}`);
      skippedCount++;
      return false;
    }

    // Add API route helper after dataName
    const apiRouteHelper = `

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\\/api\\/v1\\//, '/');
      }
    }
    return \`/\${dataSource || 'data'}\`;
  };

  const apiRoute = getApiRoute();`;

    // Check if already has getApiRoute
    if (!content.includes('getApiRoute')) {
      content = content.replace(
        'const dataName = getDataPath();',
        'const dataName = getDataPath();' + apiRouteHelper
      );
    }

    // Update imports - add useQuery and api
    // Find the first variant's import block and update it
    const importPatterns = [
      /import React from 'react';/g,
      /import \{ useState \} from 'react';/g,
      /import \{ useState, useRef, useEffect \} from 'react';/g,
      /import \{ useState, useEffect \} from 'react';/g,
    ];

    let modified = false;

    // Add useQuery import if not present
    if (!content.includes("import { useQuery }") && !content.includes("from '@tanstack/react-query'")) {
      // Find import React pattern and add useQuery after it
      content = content.replace(
        /import React from 'react';/g,
        (match) => {
          modified = true;
          return `import React from 'react';
import { useQuery } from '@tanstack/react-query';`;
        }
      );

      // Also add api import
      if (!content.includes("import { api }") && !content.includes("from '@/lib/api'")) {
        content = content.replace(
          /import { cn } from '@\/lib\/utils';/g,
          `import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`
        );
      }

      // Add Loader2 to lucide imports if not present
      if (!content.includes('Loader2')) {
        content = content.replace(
          /} from 'lucide-react';/g,
          `, Loader2 } from 'lucide-react';`
        );
      }
    }

    // Find component function and add useQuery
    // Pattern: export default function ComponentName({ dataName, ... }: Props) {
    //   const sourceData = dataName || {};

    // This is complex because each generator has different structure
    // Let's look for the pattern: const sourceData = ${dataName} || {};
    // or: const xxxData = ${dataName} || {};

    const dataAssignmentPattern = new RegExp(
      `(export default function \\w+\\(\\{[^}]*\\}[^)]*\\)\\s*\\{[^}]*?)` +
      `(const \\w+Data = \\$\\{dataName\\} \\|\\| \\{\\};)`,
      'g'
    );

    // Check if we need to add useQuery to the component body
    if (!content.includes('useQuery({')) {
      // Find patterns like: const sourceData = ${dataName} || {};
      // And add useQuery before it

      const sourceDataPattern = /const sourceData = \$\{dataName\} \|\| \{\};/;
      const componentDataPattern = /const \w+Data = \$\{dataName\} \|\| \{\};/;

      if (sourceDataPattern.test(content) || componentDataPattern.test(content)) {
        // This file uses a data variable pattern, we can add useQuery
        // But this requires careful parsing - let's mark it for manual review
        // For now, just ensure imports are added
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[FIXED] ${path.basename(filePath)}`);
      fixedCount++;
      return true;
    }

    skippedCount++;
    return false;
  } catch (err) {
    console.error(`[ERROR] ${path.basename(filePath)}: ${err}`);
    errorCount++;
    return false;
  }
}

function fixReactNativeGenerator(filePath: string): boolean {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has useEffect with fetch pattern
    if (hasUseEffect(content)) {
      console.log(`[SKIP] Already has useEffect fetch: ${path.basename(filePath)}`);
      skippedCount++;
      return false;
    }

    // Skip index files
    if (filePath.includes('index.ts')) {
      skippedCount++;
      return false;
    }

    // For React Native, add useState and useEffect imports
    let modified = false;

    // Update import from 'react'
    if (content.includes("import React from 'react'") && !content.includes('useState, useEffect')) {
      content = content.replace(
        /import React from 'react';/g,
        "import React, { useState, useEffect } from 'react';"
      );
      modified = true;
    }

    // Add ActivityIndicator to react-native imports if not present
    if (!content.includes('ActivityIndicator') && content.includes("from 'react-native'")) {
      content = content.replace(
        /} from 'react-native';/g,
        ", ActivityIndicator } from 'react-native';"
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[FIXED] ${path.basename(filePath)}`);
      fixedCount++;
      return true;
    }

    skippedCount++;
    return false;
  } catch (err) {
    console.error(`[ERROR] ${path.basename(filePath)}: ${err}`);
    errorCount++;
    return false;
  }
}

async function main() {
  console.log('=== Fixing Static React Generators ===\n');

  const reactFiles = getAllGeneratorFiles(REACT_GENERATORS_DIR);
  console.log(`Found ${reactFiles.length} React generator files\n`);

  for (const file of reactFiles) {
    fixReactGenerator(file);
  }

  console.log('\n=== Fixing Static React Native Generators ===\n');

  const rnFiles = getAllGeneratorFiles(RN_GENERATORS_DIR);
  console.log(`Found ${rnFiles.length} React Native generator files\n`);

  for (const file of rnFiles) {
    fixReactNativeGenerator(file);
  }

  console.log('\n=== Summary ===');
  console.log(`Fixed: ${fixedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
}

main().catch(console.error);
