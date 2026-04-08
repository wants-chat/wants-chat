/**
 * Platform Service
 *
 * Handles app registration in the Fluxez platform database,
 * database creation, and auth schema initialization.
 */

import { Pool, Client } from 'pg';
import * as crypto from 'crypto';

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface AppRegistration {
  appId: string;
  appName: string;
  databaseName: string;
  serviceRoleKey: string;
  anonKey: string;
  organizationId: string;
  projectId: string;
}

export interface CreateAppInput {
  name: string;
  description?: string;
  type?: string;
  framework?: string;
  frameworks?: string[];
  organizationId?: string;
  projectId?: string;
}

const DEFAULT_ORGANIZATION_ID = 'f4117a91-9873-4848-b793-6d651ca4724a';
const DEFAULT_PROJECT_ID = '01f587df-4b36-42e7-8a48-8c4320cee558';

export class PlatformService {
  private dbConfig: DbConfig;
  private organizationId: string;
  private projectId: string;

  constructor(dbConfig?: Partial<DbConfig>) {
    const host = dbConfig?.host || process.env.TENANT_DB_HOST;
    const user = dbConfig?.user || process.env.TENANT_DB_USER;
    const password = dbConfig?.password || process.env.TENANT_DB_PASSWORD;
    const database = dbConfig?.database || process.env.TENANT_DB_NAME;

    if (!host || !user || !password || !database) {
      throw new Error(
        'PlatformService requires TENANT_DB_HOST, TENANT_DB_USER, ' +
          'TENANT_DB_PASSWORD, and TENANT_DB_NAME to be set in the ' +
          'environment (or passed explicitly via the dbConfig argument).',
      );
    }

    this.dbConfig = {
      host,
      port: dbConfig?.port || parseInt(process.env.TENANT_DB_PORT || '5432'),
      user,
      password,
      database,
    };
    this.organizationId = process.env.ORGANIZATION_ID || DEFAULT_ORGANIZATION_ID;
    this.projectId = process.env.PROJECT_ID || DEFAULT_PROJECT_ID;
  }

  /**
   * Generate API key with prefix
   */
  private generateApiKey(prefix: string): string {
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `${prefix}_${randomBytes}`;
  }

  /**
   * Hash API key for storage
   */
  private hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Get database name from app ID
   */
  private getAppDatabaseName(appId: string): string {
    const sanitizedId = appId.replace(/-/g, '_');
    return `app_${sanitizedId}`;
  }

  /**
   * Register app in platform database and create app database
   */
  async createApp(input: CreateAppInput): Promise<AppRegistration> {
    const pool = new Pool(this.dbConfig);
    const client = await pool.connect();

    // Use input IDs if provided, otherwise fall back to instance/defaults
    const organizationId = input.organizationId || this.organizationId;
    const projectId = input.projectId || this.projectId;

    try {
      console.log(`\n🚀 Registering app: ${input.name}`);
      console.log(`   Organization: ${organizationId}`);
      console.log(`   Project: ${projectId}\n`);

      await client.query('BEGIN');

      const appId = crypto.randomUUID();
      const databaseName = this.getAppDatabaseName(appId);
      const serviceRoleKey = this.generateApiKey('service');
      const anonKey = this.generateApiKey('anon');

      const appSettings = {
        serviceRoleKey,
        anonKey,
        frameworks: input.frameworks || ['hono', 'react'],
      };

      // Check if app name already exists and make unique
      const existingApps = await client.query(`
        SELECT name FROM apps WHERE project_id = $1 AND name LIKE $2 || '%'
      `, [projectId, input.name]);

      let uniqueName = input.name;
      if (existingApps.rows.length > 0) {
        const existingNames = existingApps.rows.map((r: any) => r.name);
        let counter = 2;
        while (existingNames.includes(uniqueName)) {
          uniqueName = `${input.name} ${counter}`;
          counter++;
        }
      }

      // Create app record
      await client.query(`
        INSERT INTO apps (id, name, description, project_id, organization_id, database_name, type, framework, frameworks, status, settings, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        appId,
        uniqueName,
        input.description || null,
        projectId,
        organizationId,
        databaseName,
        input.type || 'web',
        input.framework || 'hono',
        JSON.stringify(input.frameworks || ['hono', 'react']),
        'active',
        JSON.stringify(appSettings),
        JSON.stringify({ registeredAt: new Date().toISOString(), generatedBy: 'app-builder' }),
      ]);

      // Create service role key
      await client.query(`
        INSERT INTO api_keys (id, name, key, hashed_key, app_id, project_id, organization_id, permissions, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        crypto.randomUUID(),
        `Service Role Key for ${uniqueName}`,
        serviceRoleKey,
        this.hashApiKey(serviceRoleKey),
        appId,
        projectId,
        organizationId,
        JSON.stringify(['*']),
        null,
      ]);

      // Create anon key
      await client.query(`
        INSERT INTO api_keys (id, name, key, hashed_key, app_id, project_id, organization_id, permissions, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        crypto.randomUUID(),
        `Anon Key for ${uniqueName}`,
        anonKey,
        this.hashApiKey(anonKey),
        appId,
        projectId,
        organizationId,
        JSON.stringify(['read']),
        null,
      ]);

      await client.query('COMMIT');

      console.log('✅ App registered in platform database!\n');
      console.log('📋 App Details:');
      console.log(`   ID: ${appId}`);
      console.log(`   Name: ${uniqueName}`);
      console.log(`   Database: ${databaseName}\n`);
      console.log('🔑 API Keys:');
      console.log(`   FLUXEZ_API_KEY = "${serviceRoleKey}"`);
      console.log(`   FLUXEZ_ANON_KEY = "${anonKey}"\n`);

      // Create app database
      await this.createAppDatabase(databaseName);

      // Initialize auth tables
      await this.initializeTenantTables(databaseName);

      return {
        appId,
        appName: uniqueName,
        databaseName,
        serviceRoleKey,
        anonKey,
        organizationId,
        projectId,
      };
    } catch (error: any) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  }

  /**
   * Check if database exists
   */
  async databaseExists(dbName: string): Promise<boolean> {
    const pool = new Pool(this.dbConfig);
    try {
      const result = await pool.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
      );
      return result.rows.length > 0;
    } finally {
      await pool.end();
    }
  }

  /**
   * Create app database
   */
  async createAppDatabase(dbName: string): Promise<void> {
    // Check if already exists
    const exists = await this.databaseExists(dbName);
    if (exists) {
      console.log(`   ⏭️  Database ${dbName} already exists, skipping creation`);
      return;
    }

    // Connect to postgres database to create new database
    const adminClient = new Client({
      ...this.dbConfig,
      database: 'postgres',
    });

    await adminClient.connect();
    try {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`   ✅ Created database: ${dbName}`);
    } finally {
      await adminClient.end();
    }
  }

  /**
   * Initialize tenant tables (auth schema)
   */
  async initializeTenantTables(dbName: string): Promise<void> {
    const appPool = new Pool({
      ...this.dbConfig,
      database: dbName,
    });

    const client = await appPool.connect();
    try {
      await client.query('BEGIN');

      // ====================================
      // EXTENSIONS
      // ====================================
      console.log(`   📦 Creating extensions...`);

      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

      try {
        await client.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
      } catch (e) { console.log(`   ⚠️  pg_trgm extension not available`); }

      try {
        await client.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);
      } catch (e) { console.log(`   ⚠️  unaccent extension not available`); }

      // ====================================
      // AUTH SCHEMA
      // ====================================
      console.log(`   📦 Creating auth schema...`);
      await client.query(`CREATE SCHEMA IF NOT EXISTS auth`);

      // ====================================
      // AUTH.USERS TABLE
      // ====================================
      console.log(`   📦 Creating auth.users table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          encrypted_password VARCHAR(255),
          email_confirmed_at TIMESTAMP WITH TIME ZONE,
          invited_at TIMESTAMP WITH TIME ZONE,
          confirmation_token VARCHAR(255),
          confirmation_sent_at TIMESTAMP WITH TIME ZONE,
          recovery_token VARCHAR(255),
          recovery_sent_at TIMESTAMP WITH TIME ZONE,
          email_change_token_new VARCHAR(255),
          email_change VARCHAR(255),
          email_change_sent_at TIMESTAMP WITH TIME ZONE,
          last_sign_in_at TIMESTAMP WITH TIME ZONE,
          role VARCHAR(50) DEFAULT 'user',
          raw_app_meta_data JSONB DEFAULT '{}',
          raw_user_meta_data JSONB DEFAULT '{}',
          is_super_admin BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          phone VARCHAR(15),
          phone_confirmed_at TIMESTAMP WITH TIME ZONE,
          phone_change VARCHAR(15),
          phone_change_token VARCHAR(255),
          phone_change_sent_at TIMESTAMP WITH TIME ZONE,
          confirmed_at TIMESTAMP WITH TIME ZONE,
          email_change_token_current VARCHAR(255),
          email_change_confirm_status SMALLINT DEFAULT 0,
          banned_until TIMESTAMP WITH TIME ZONE,
          reauthentication_token VARCHAR(255),
          reauthentication_sent_at TIMESTAMP WITH TIME ZONE,
          is_sso_user BOOLEAN DEFAULT false,
          deleted_at TIMESTAMP WITH TIME ZONE
        )
      `);

      // ====================================
      // AUTH.SESSIONS TABLE
      // ====================================
      console.log(`   📦 Creating auth.sessions table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.sessions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          token VARCHAR(255) UNIQUE NOT NULL,
          refresh_token VARCHAR(255),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          ip_address INET,
          user_agent TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // ====================================
      // AUTH.REFRESH_TOKENS TABLE
      // ====================================
      console.log(`   📦 Creating auth.refresh_tokens table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          token VARCHAR(255) UNIQUE NOT NULL,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          parent VARCHAR(255),
          revoked BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // ====================================
      // AUTH.IDENTITIES TABLE (for social logins)
      // ====================================
      console.log(`   📦 Creating auth.identities table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.identities (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          provider VARCHAR(255) NOT NULL,
          provider_id VARCHAR(255) NOT NULL,
          provider_data JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(provider, provider_id)
        )
      `);

      // ====================================
      // AUTH.TEAMS TABLE
      // ====================================
      console.log(`   📦 Creating auth.teams table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.teams (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          created_by UUID,
          total_members INTEGER DEFAULT 0,
          max_members INTEGER DEFAULT 100,
          settings JSONB DEFAULT '{}',
          search VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // ====================================
      // AUTH.TEAM_MEMBERS TABLE
      // ====================================
      console.log(`   📦 Creating auth.team_members table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.team_members (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          team_id UUID NOT NULL REFERENCES auth.teams(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          role VARCHAR(50) NOT NULL DEFAULT 'member',
          roles TEXT[] DEFAULT ARRAY['member']::TEXT[],
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          invited_at TIMESTAMP WITH TIME ZONE,
          invited_by UUID REFERENCES auth.users(id),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(team_id, user_id)
        )
      `);

      // ====================================
      // AUTH.TEAM_INVITATIONS TABLE
      // ====================================
      console.log(`   📦 Creating auth.team_invitations table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.team_invitations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          team_id UUID NOT NULL REFERENCES auth.teams(id) ON DELETE CASCADE,
          email VARCHAR(255) NOT NULL,
          user_id UUID REFERENCES auth.users(id),
          role VARCHAR(50) NOT NULL DEFAULT 'member',
          roles TEXT[] DEFAULT ARRAY['member']::TEXT[],
          invited_by UUID NOT NULL REFERENCES auth.users(id),
          token VARCHAR(255) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          accepted_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // ====================================
      // AUTH.PASSWORD_RESETS TABLE
      // ====================================
      console.log(`   📦 Creating auth.password_resets table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.password_resets (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // ====================================
      // AUTH.ROLES TABLE
      // ====================================
      console.log(`   📦 Creating auth.roles table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.roles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(50) UNIQUE NOT NULL,
          description TEXT,
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Seed default roles
      await client.query(`
        INSERT INTO auth.roles (name, description, is_default)
        SELECT 'admin', 'Administrator with full access', true
        WHERE NOT EXISTS (SELECT 1 FROM auth.roles WHERE name = 'admin')
      `);
      await client.query(`
        INSERT INTO auth.roles (name, description, is_default)
        SELECT 'user', 'Regular user with limited access', true
        WHERE NOT EXISTS (SELECT 1 FROM auth.roles WHERE name = 'user')
      `);

      // ====================================
      // AUTH.SETTINGS TABLE
      // ====================================
      console.log(`   📦 Creating auth.settings table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_id UUID,
          app_id UUID,
          require_email_verification BOOLEAN DEFAULT false,
          verification_url TEXT,
          verification_email_subject TEXT DEFAULT 'Verify your email',
          verification_email_template TEXT,
          min_password_length INTEGER DEFAULT 8,
          require_uppercase BOOLEAN DEFAULT false,
          require_lowercase BOOLEAN DEFAULT false,
          require_numbers BOOLEAN DEFAULT false,
          require_special_chars BOOLEAN DEFAULT false,
          session_duration_hours INTEGER DEFAULT 24,
          refresh_token_duration_days INTEGER DEFAULT 7,
          allow_registration BOOLEAN DEFAULT true,
          default_role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(project_id, app_id)
        )
      `);

      // ====================================
      // AUTH.SOCIAL_PROVIDERS TABLE
      // ====================================
      console.log(`   📦 Creating auth.social_providers table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.social_providers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          provider VARCHAR(50) NOT NULL,
          project_id UUID NOT NULL,
          app_id UUID,
          client_id VARCHAR(255) NOT NULL,
          client_secret VARCHAR(255),
          redirect_uri VARCHAR(500) NOT NULL,
          scopes JSONB,
          enabled BOOLEAN DEFAULT true,
          team_id VARCHAR(20),
          key_id VARCHAR(20),
          private_key TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(provider, project_id, app_id)
        )
      `);

      // ====================================
      // AUTH.OAUTH_STATES TABLE
      // ====================================
      console.log(`   📦 Creating auth.oauth_states table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.oauth_states (
          state TEXT PRIMARY KEY,
          provider VARCHAR(50) NOT NULL,
          project_id UUID NOT NULL,
          app_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `);

      // ====================================
      // AUTH.OAUTH_PKCE TABLE
      // ====================================
      console.log(`   📦 Creating auth.oauth_pkce table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.oauth_pkce (
          state TEXT PRIMARY KEY,
          code_verifier TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `);

      // ====================================
      // AUTH.OAUTH_TOKENS TABLE
      // ====================================
      console.log(`   📦 Creating auth.oauth_tokens table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.oauth_tokens (
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          provider VARCHAR(50) NOT NULL,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (user_id, provider)
        )
      `);

      // ====================================
      // AUTH.PAYMENT_PROVIDERS TABLE
      // ====================================
      console.log(`   📦 Creating auth.payment_providers table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.payment_providers (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
          project_id UUID NOT NULL,
          app_id UUID,
          publishable_key VARCHAR(255),
          secret_key TEXT,
          webhook_secret VARCHAR(255),
          stripe_connect_account_id VARCHAR(255),
          stripe_connect_onboarding_complete BOOLEAN DEFAULT false,
          stripe_connect_charges_enabled BOOLEAN DEFAULT false,
          stripe_connect_payouts_enabled BOOLEAN DEFAULT false,
          mode VARCHAR(20) DEFAULT 'test',
          enabled BOOLEAN DEFAULT true,
          use_platform_keys BOOLEAN DEFAULT true,
          platform_fee_percent DECIMAL(5,2) DEFAULT 0.5,
          subscription_enabled BOOLEAN DEFAULT true,
          one_time_enabled BOOLEAN DEFAULT true,
          price_ids JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(provider, project_id, app_id)
        )
      `);

      // ====================================
      // AUTH.PAYMENT_TRANSACTIONS TABLE
      // ====================================
      console.log(`   📦 Creating auth.payment_transactions table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.payment_transactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_id UUID NOT NULL,
          app_id UUID,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          type VARCHAR(50) NOT NULL,
          stripe_payment_intent_id VARCHAR(255),
          stripe_checkout_session_id VARCHAR(255),
          stripe_subscription_id VARCHAR(255),
          stripe_customer_id VARCHAR(255),
          amount INTEGER NOT NULL,
          currency VARCHAR(10) DEFAULT 'usd',
          status VARCHAR(50) NOT NULL,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // ====================================
      // AUTH.SUBSCRIPTIONS TABLE
      // ====================================
      console.log(`   📦 Creating auth.subscriptions table...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth.subscriptions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_id UUID NOT NULL,
          app_id UUID,
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          stripe_customer_id VARCHAR(255),
          stripe_subscription_id VARCHAR(255) UNIQUE,
          stripe_price_id VARCHAR(255),
          plan VARCHAR(100),
          interval VARCHAR(20),
          status VARCHAR(50) NOT NULL,
          current_period_start TIMESTAMP WITH TIME ZONE,
          current_period_end TIMESTAMP WITH TIME ZONE,
          cancel_at_period_end BOOLEAN DEFAULT false,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // ====================================
      // INDEXES
      // ====================================
      console.log(`   📦 Creating indexes...`);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);
        CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth.sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth.sessions(token);
        CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth.sessions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_token ON auth.refresh_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_auth_refresh_tokens_user_id ON auth.refresh_tokens(user_id);
        CREATE INDEX IF NOT EXISTS idx_auth_identities_user_id ON auth.identities(user_id);
        CREATE INDEX IF NOT EXISTS idx_auth_teams_name ON auth.teams(name);
        CREATE INDEX IF NOT EXISTS idx_auth_team_members_team_id ON auth.team_members(team_id);
        CREATE INDEX IF NOT EXISTS idx_auth_team_members_user_id ON auth.team_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_auth_team_invitations_token ON auth.team_invitations(token);
        CREATE INDEX IF NOT EXISTS idx_auth_team_invitations_email ON auth.team_invitations(email);
        CREATE INDEX IF NOT EXISTS idx_auth_password_resets_token ON auth.password_resets(token);
        CREATE INDEX IF NOT EXISTS idx_auth_subscriptions_user_id ON auth.subscriptions(user_id);
        CREATE INDEX IF NOT EXISTS idx_auth_payment_transactions_user_id ON auth.payment_transactions(user_id)
      `);

      await client.query('COMMIT');
      console.log(`   ✅ Initialized all auth tables\n`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
      await appPool.end();
    }
  }

  /**
   * Execute SQL on app database
   */
  async executeOnAppDatabase(dbName: string, sql: string, values?: any[]): Promise<any> {
    const appPool = new Pool({
      ...this.dbConfig,
      database: dbName,
    });

    const client = await appPool.connect();
    try {
      const result = values ? await client.query(sql, values) : await client.query(sql);
      console.log(`   ✅ Executed SQL on ${dbName}`);
      return result;
    } finally {
      client.release();
      await appPool.end();
    }
  }
}
