/**
 * Database Migration Script for Wants
 * Usage: npm run migrate
 *
 * This script runs all pending migrations in order.
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

interface Migration {
  id: number;
  name: string;
  executed_at: Date;
}

async function getPool(): Promise<Pool> {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'wantsdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
}

async function ensureMigrationsTable(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

async function getExecutedMigrations(pool: Pool): Promise<string[]> {
  const result = await pool.query<Migration>(
    'SELECT name FROM _migrations ORDER BY id ASC'
  );
  return result.rows.map(row => row.name);
}

async function getMigrationFiles(): Promise<string[]> {
  const migrationsDir = path.join(__dirname, 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found, creating it...');
    fs.mkdirSync(migrationsDir, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  return files;
}

async function runMigration(pool: Pool, fileName: string): Promise<void> {
  const filePath = path.join(__dirname, 'migrations', fileName);
  const sql = fs.readFileSync(filePath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Execute migration SQL
    await client.query(sql);

    // Record migration
    await client.query(
      'INSERT INTO _migrations (name) VALUES ($1)',
      [fileName]
    );

    await client.query('COMMIT');
    console.log(`✅ Executed: ${fileName}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting database migration...\n');

  const pool = await getPool();

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log(`📡 Connected to database: ${process.env.DB_NAME || 'wantsdb'}`);

    // Ensure migrations table exists
    await ensureMigrationsTable(pool);

    // Get executed migrations
    const executed = await getExecutedMigrations(pool);
    console.log(`📋 Previously executed migrations: ${executed.length}`);

    // Get migration files
    const files = await getMigrationFiles();
    console.log(`📁 Found migration files: ${files.length}\n`);

    // Find pending migrations
    const pending = files.filter(f => !executed.includes(f));

    if (pending.length === 0) {
      console.log('✨ No pending migrations to run.');
      return;
    }

    console.log(`🔄 Running ${pending.length} pending migration(s)...\n`);

    for (const file of pending) {
      await runMigration(pool, file);
    }

    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
