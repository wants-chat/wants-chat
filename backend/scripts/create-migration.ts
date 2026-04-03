/**
 * Create Migration Script for Wants
 * Usage: npm run migration:create <migration_name>
 *
 * Creates a new timestamped migration file.
 */

import * as fs from 'fs';
import * as path from 'path';

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

function getTimestamp(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    padZero(now.getMonth() + 1),
    padZero(now.getDate()),
    padZero(now.getHours()),
    padZero(now.getMinutes()),
    padZero(now.getSeconds()),
  ].join('');
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Please provide a migration name');
    console.error('Usage: npm run migration:create <migration_name>');
    console.error('Example: npm run migration:create add_users_table');
    process.exit(1);
  }

  const migrationName = toSnakeCase(args.join('_'));
  const timestamp = getTimestamp();
  const fileName = `${timestamp}_${migrationName}.sql`;

  const migrationsDir = path.join(__dirname, 'migrations');

  // Ensure migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const filePath = path.join(migrationsDir, fileName);

  const template = `-- Migration: ${migrationName}
-- Created at: ${new Date().toISOString()}

-- Write your migration SQL here

-- Example: Create a table
-- CREATE TABLE IF NOT EXISTS example (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- Example: Add a column
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS new_column VARCHAR(255);

-- Example: Create an index
-- CREATE INDEX IF NOT EXISTS idx_example_name ON example(name);
`;

  fs.writeFileSync(filePath, template);

  console.log(`✅ Created migration: ${fileName}`);
  console.log(`📁 Location: ${filePath}`);
}

main();
