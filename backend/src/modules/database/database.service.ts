import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult as PgQueryResult } from 'pg';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
  keepAlive: boolean;
  keepAliveInitialDelayMillis: number;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  country_code?: string;
  location?: string;
  website?: string;
  email_verified: boolean;
  email_verification_token?: string;
  email_verification_expires?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  oauth_provider?: string;
  oauth_id?: string;
  metadata?: Record<string, any>;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;
  private readonly dbConfig: DatabaseConfig;

  constructor(private readonly configService: ConfigService) {
    this.dbConfig = {
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      database: this.configService.get<string>('DB_NAME', 'wantsdb'),
      user: this.configService.get<string>('DB_USER', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', ''),
      ssl: this.configService.get<boolean>('DB_SSL', false),
      max: this.configService.get<number>('DB_POOL_MAX', 20),
      min: this.configService.get<number>('DB_POOL_MIN', 2), // Keep minimum connections warm
      idleTimeoutMillis: this.configService.get<number>(
        'DB_IDLE_TIMEOUT',
        60000, // Increased to 60 seconds to reduce connection churn
      ),
      connectionTimeoutMillis: this.configService.get<number>(
        'DB_CONNECTION_TIMEOUT',
        10000, // Increased to 10 seconds for remote databases
      ),
      keepAlive: true, // Enable TCP keepalive
      keepAliveInitialDelayMillis: 30000, // Start keepalive after 30 seconds
    };
  }

  async onModuleInit(): Promise<void> {
    try {
      this.pool = new Pool({
        host: this.dbConfig.host,
        port: this.dbConfig.port,
        database: this.dbConfig.database,
        user: this.dbConfig.user,
        password: this.dbConfig.password,
        ssl: this.dbConfig.ssl ? { rejectUnauthorized: false } : false,
        max: this.dbConfig.max,
        min: this.dbConfig.min,
        idleTimeoutMillis: this.dbConfig.idleTimeoutMillis,
        connectionTimeoutMillis: this.dbConfig.connectionTimeoutMillis,
        keepAlive: this.dbConfig.keepAlive,
        keepAliveInitialDelayMillis: this.dbConfig.keepAliveInitialDelayMillis,
      });

      // Handle pool errors
      this.pool.on('error', (err) => {
        this.logger.error('Unexpected pool client error:', err.message);
      });

      this.pool.on('connect', () => {
        this.logger.debug('New client connected to pool');
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      this.logger.log(
        `✅ Database connected: ${this.dbConfig.database}@${this.dbConfig.host}:${this.dbConfig.port} (pool: min=${this.dbConfig.min}, max=${this.dbConfig.max})`,
      );

      // Run auto-migrations for required tables
      await this.ensureRequiredTables();
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error.message);
      throw error;
    }
  }

  /**
   * Ensures all required tables exist with proper columns
   * This runs on every startup to handle schema updates
   */
  private async ensureRequiredTables(): Promise<void> {
    this.logger.log('Ensuring all required database tables exist...');

    try {
      // Research sessions table
      await this.query(`
        CREATE TABLE IF NOT EXISTS research_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          query TEXT NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending',
          progress INTEGER DEFAULT 0,
          started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Add missing columns to research_sessions (idempotent)
      const researchColumns = [
        { name: 'options', type: 'JSONB', default: "'{}'" },
        { name: 'current_step', type: 'TEXT', default: null },
        { name: 'plan', type: 'JSONB', default: null },
        { name: 'sources', type: 'JSONB', default: "'[]'" },
        { name: 'findings', type: 'JSONB', default: "'[]'" },
        { name: 'synthesis', type: 'TEXT', default: null },
        { name: 'fact_check_results', type: 'JSONB', default: "'[]'" },
        { name: 'outputs', type: 'JSONB', default: "'[]'" },
        { name: 'error', type: 'TEXT', default: null },
        { name: 'metadata', type: 'JSONB', default: "'{}'" },
      ];

      for (const col of researchColumns) {
        await this.query(`
          DO $$ BEGIN
            ALTER TABLE research_sessions ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${col.default ? ` DEFAULT ${col.default}` : ''};
          EXCEPTION WHEN duplicate_column THEN NULL;
          END $$;
        `);
      }

      // Create indexes for research_sessions
      await this.query(`CREATE INDEX IF NOT EXISTS idx_research_sessions_user_id ON research_sessions(user_id)`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_research_sessions_status ON research_sessions(status)`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_research_sessions_started_at ON research_sessions(started_at DESC)`);

      // User apps table for storing generated applications
      await this.query(`
        CREATE TABLE IF NOT EXISTS user_apps (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          slug VARCHAR(255) NOT NULL,
          conversation_id UUID,
          app_type VARCHAR(100),
          output_path TEXT,
          status VARCHAR(50) DEFAULT 'draft',
          frontend_framework VARCHAR(50),
          backend_framework VARCHAR(50),
          mobile_framework VARCHAR(50),
          has_frontend BOOLEAN DEFAULT false,
          has_backend BOOLEAN DEFAULT false,
          has_mobile BOOLEAN DEFAULT false,
          frontend_url TEXT,
          backend_url TEXT,
          ios_app_store_url TEXT,
          android_play_store_url TEXT,
          deploy_config JSONB DEFAULT '{}',
          secrets JSONB DEFAULT '{}',
          github_repo_owner VARCHAR(255),
          github_repo_name VARCHAR(255),
          github_repo_full_name VARCHAR(500),
          github_branch VARCHAR(255),
          github_last_pushed_at TIMESTAMPTZ,
          github_last_pulled_at TIMESTAMPTZ,
          github_last_commit_sha VARCHAR(255),
          github_auto_sync BOOLEAN DEFAULT false,
          thumbnail_url TEXT,
          preview_images JSONB DEFAULT '[]',
          generation_prompt TEXT,
          generation_model VARCHAR(255),
          generation_tokens_used INTEGER,
          metadata JSONB DEFAULT '{}',
          tags JSONB DEFAULT '[]',
          is_favorite BOOLEAN DEFAULT false,
          is_public BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, slug)
        )
      `);

      // Create indexes for user_apps
      await this.query(`CREATE INDEX IF NOT EXISTS idx_user_apps_user_id ON user_apps(user_id)`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_user_apps_slug ON user_apps(slug)`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_user_apps_status ON user_apps(status)`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_user_apps_created_at ON user_apps(created_at)`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_user_apps_conversation_id ON user_apps(conversation_id)`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_user_apps_app_type ON user_apps(app_type)`);

      // App Maker pages table for storing generated page designs
      await this.query(`
        CREATE TABLE IF NOT EXISTS app_maker_pages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          page_type VARCHAR(50) NOT NULL,
          tree_json JSONB NOT NULL,
          prompt TEXT,
          version INTEGER DEFAULT 1,
          output_path TEXT,
          status VARCHAR(50) DEFAULT 'draft',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      await this.query(`CREATE INDEX IF NOT EXISTS idx_app_maker_pages_user_id ON app_maker_pages(user_id)`);
      await this.query(`CREATE INDEX IF NOT EXISTS idx_app_maker_pages_created_at ON app_maker_pages(created_at DESC)`);

      this.logger.log('✅ All required database tables ready');
    } catch (error) {
      this.logger.warn(`Failed to ensure required tables: ${error.message}`);
    }
  }

  /**
   * Get current pool statistics for monitoring
   */
  getPoolStats(): { total: number; idle: number; waiting: number } {
    return {
      total: this.pool?.totalCount || 0,
      idle: this.pool?.idleCount || 0,
      waiting: this.pool?.waitingCount || 0,
    };
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('Database connection pool closed');
    }
  }

  // ============================================
  // Core Query Methods
  // ============================================

  async query<T = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result: PgQueryResult = await this.pool.query(text, params);
      const duration = Date.now() - start;

      if (duration > 1000) {
        this.logger.warn(`Slow query (${duration}ms): ${text.substring(0, 100)}...`);
      }

      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
        command: result.command,
      };
    } catch (error) {
      this.logger.error(`Query error: ${error.message}`, text);
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================
  // CRUD Operations
  // ============================================

  async findOne<T = any>(
    table: string,
    conditions: Record<string, any>,
  ): Promise<T | null> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys
      .map((key, i) => `"${key}" = $${i + 1}`)
      .join(' AND ');

    const result = await this.query<T>(
      `SELECT * FROM "${table}" WHERE ${whereClause} LIMIT 1`,
      values,
    );

    return result.rows[0] || null;
  }

  async findMany<T = any>(
    table: string,
    conditions: Record<string, any> = {},
    options: {
      orderBy?: string;
      order?: 'ASC' | 'DESC';
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<T[]> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    let query = `SELECT * FROM "${table}"`;

    if (keys.length > 0) {
      const whereClause = keys
        .map((key, i) => `"${key}" = $${i + 1}`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    if (options.orderBy) {
      query += ` ORDER BY "${options.orderBy}" ${options.order || 'ASC'}`;
    }

    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    if (options.offset) {
      query += ` OFFSET ${options.offset}`;
    }

    const result = await this.query<T>(query, values);
    return result.rows;
  }

  async insert<T = any>(
    table: string,
    data: Record<string, any>,
  ): Promise<T> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const columns = keys.map((k) => `"${k}"`).join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const result = await this.query<T>(
      `INSERT INTO "${table}" (${columns}) VALUES (${placeholders}) RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  async update<T = any>(
    table: string,
    conditions: Record<string, any>,
    data: Record<string, any>,
  ): Promise<T[]> {
    const conditionKeys = Object.keys(conditions);
    const conditionValues = Object.values(conditions);
    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);

    const setClause = dataKeys
      .map((key, i) => `"${key}" = $${i + 1}`)
      .join(', ');
    const whereClause = conditionKeys
      .map((key, i) => `"${key}" = $${dataKeys.length + i + 1}`)
      .join(' AND ');

    const sql = `UPDATE "${table}" SET ${setClause} WHERE ${whereClause} RETURNING *`;
    const params = [...dataValues, ...conditionValues];

    this.logger.debug(`[UPDATE] SQL: ${sql}`);
    this.logger.debug(`[UPDATE] Params: ${JSON.stringify(params)}`);

    const result = await this.query<T>(sql, params);

    this.logger.debug(`[UPDATE] Rows affected: ${result.rowCount}, Returned: ${result.rows?.length || 0}`);

    return result.rows;
  }

  async delete(
    table: string,
    conditions: Record<string, any>,
  ): Promise<number> {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys
      .map((key, i) => `"${key}" = $${i + 1}`)
      .join(' AND ');

    const result = await this.query(
      `DELETE FROM "${table}" WHERE ${whereClause}`,
      values,
    );

    return result.rowCount;
  }

  // ============================================
  // User Management
  // ============================================

  async createUser(data: {
    email: string;
    password: string;
    name?: string;
    username?: string;
    metadata?: Record<string, any>;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.insert<User>('users', {
      email: data.email.toLowerCase(),
      password_hash: passwordHash,
      name: data.name,
      username: data.username || data.email.split('@')[0],
      email_verified: false,
      email_verification_token: verificationToken,
      email_verification_expires: verificationExpires,
      metadata: data.metadata || {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.findOne<User>('users', { email: email.toLowerCase() });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.findOne<User>('users', { id });
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await this.update('users', { id: userId }, { last_login_at: new Date() });
  }

  async verifyUserEmail(token: string): Promise<User | null> {
    const user = await this.findOne<User>('users', {
      email_verification_token: token,
    });

    if (!user) return null;

    if (
      user.email_verification_expires &&
      new Date() > user.email_verification_expires
    ) {
      return null;
    }

    const [updatedUser] = await this.update<User>(
      'users',
      { id: user.id },
      {
        email_verified: true,
        email_verification_token: null,
        email_verification_expires: null,
        updated_at: new Date(),
      },
    );

    return updatedUser;
  }

  async createPasswordResetToken(email: string): Promise<string | null> {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.update(
      'users',
      { id: user.id },
      {
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
        updated_at: new Date(),
      },
    );

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.findOne<User>('users', {
      password_reset_token: token,
    });

    if (!user) return false;

    if (
      user.password_reset_expires &&
      new Date() > user.password_reset_expires
    ) {
      return false;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.update(
      'users',
      { id: user.id },
      {
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires: null,
        updated_at: new Date(),
      },
    );

    return true;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.findUserById(userId);
    if (!user) return false;

    const isValid = await this.validatePassword(
      currentPassword,
      user.password_hash,
    );
    if (!isValid) return false;

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.update(
      'users',
      { id: user.id },
      {
        password_hash: passwordHash,
        updated_at: new Date(),
      },
    );

    return true;
  }

  async updateUser(
    userId: string,
    data: Partial<User>,
  ): Promise<User | null> {
    const [updated] = await this.update<User>(
      'users',
      { id: userId },
      { ...data, updated_at: new Date() },
    );
    return updated || null;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const count = await this.delete('users', { id: userId });
    return count > 0;
  }

  // ============================================
  // OAuth User Management
  // ============================================

  async findOrCreateOAuthUser(data: {
    email: string;
    name?: string;
    avatar_url?: string;
    oauth_provider: string;
    oauth_id: string;
  }): Promise<User> {
    // First try to find by OAuth ID
    let user = await this.findOne<User>('users', {
      oauth_provider: data.oauth_provider,
      oauth_id: data.oauth_id,
    });

    if (user) {
      // Update last login
      await this.updateUserLastLogin(user.id);
      return user;
    }

    // Try to find by email
    user = await this.findUserByEmail(data.email);

    if (user) {
      // Link OAuth to existing account
      const [updated] = await this.update<User>(
        'users',
        { id: user.id },
        {
          oauth_provider: data.oauth_provider,
          oauth_id: data.oauth_id,
          last_login_at: new Date(),
          updated_at: new Date(),
        },
      );
      return updated;
    }

    // Create new user
    const newUser = await this.insert<User>('users', {
      email: data.email.toLowerCase(),
      name: data.name,
      avatar_url: data.avatar_url,
      username: data.email.split('@')[0],
      email_verified: true, // OAuth emails are verified
      oauth_provider: data.oauth_provider,
      oauth_id: data.oauth_id,
      metadata: {},
      created_at: new Date(),
      updated_at: new Date(),
    });

    return newUser;
  }
}
