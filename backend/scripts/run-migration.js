/**
 * Simple migration runner script
 * Usage: node scripts/run-migration.js <migration-file>
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const migrationFile = process.argv[2];

  if (!migrationFile) {
    console.error('Usage: node scripts/run-migration.js <migration-file>');
    console.error('Example: node scripts/run-migration.js scripts/migrations/20251228000000_memory_system_tables.sql');
    process.exit(1);
  }

  const fullPath = path.resolve(__dirname, '..', migrationFile);

  if (!fs.existsSync(fullPath)) {
    console.error(`Migration file not found: ${fullPath}`);
    process.exit(1);
  }

  const pool = new Pool({
    host: process.env.DB_HOST || '46.62.236.114',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'wantsdb',
    user: process.env.DB_USER || 'fluxez',
    password: process.env.DB_PASSWORD || 'Dev_Kx7Rm4Nq9Ws2Pv8Zx3Cy6Dt5Bv',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log(`\n🔄 Running migration: ${migrationFile}`);
    console.log(`📍 Database: ${pool.options.host}:${pool.options.port}/${pool.options.database}`);

    const sql = fs.readFileSync(fullPath, 'utf8');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('✅ Migration completed successfully!\n');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.detail) console.error('   Detail:', error.detail);
    if (error.hint) console.error('   Hint:', error.hint);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
