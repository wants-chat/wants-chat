/**
 * Hono Template Renderer Service
 *
 * Generates Hono backend routes and middleware following Fluxez platform patterns.
 * Uses @fluxez/node-sdk from GitHub for database and auth operations.
 */

import * as crypto from 'crypto';
import { snakeCase, kebabCase } from 'change-case';
import * as pluralize from 'pluralize';
import { FeatureApiRoute } from '../interfaces/feature.interface';
import { DatabaseSchema, DbTable } from '../interfaces/schema.interface';
import { GeneratedFile } from '../interfaces/generation.interface';

export interface HonoRendererConfig {
  useFluxezSdk: boolean;
  addCors: boolean;
  addRateLimit: boolean;
}

export interface GeneratedKeys {
  appId: string;
  databaseName: string;
  serviceRoleKey: string;
  anonKey: string;
  jwtSecret: string;
}

const DEFAULT_CONFIG: HonoRendererConfig = {
  useFluxezSdk: true,
  addCors: true,
  addRateLimit: true,
};

export class HonoRendererService {
  private config: HonoRendererConfig;

  constructor(config: Partial<HonoRendererConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate Fluxez API keys
   */
  generateKeys(appName: string): GeneratedKeys {
    const appId = crypto.randomUUID();
    const sanitizedId = appId.replace(/-/g, '_');
    const databaseName = `app_${sanitizedId}`;
    const serviceRoleKey = `service_${crypto.randomBytes(32).toString('hex')}`;
    const anonKey = `anon_${crypto.randomBytes(32).toString('hex')}`;
    const jwtSecret = `jwt_${crypto.randomBytes(32).toString('hex')}`;

    return {
      appId,
      databaseName,
      serviceRoleKey,
      anonKey,
      jwtSecret,
    };
  }

  /**
   * Generate all Hono backend files
   */
  generateAll(
    apiRoutes: FeatureApiRoute[],
    schema: DatabaseSchema,
    appName: string,
    keys?: GeneratedKeys,
    defaultRole?: string,
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const generatedKeys = keys || this.generateKeys(appName);
    const appPrefix = this.getAppPrefix(appName);

    // 1. Generate base config files
    files.push(this.generatePackageJson(appName));
    files.push(this.generateTsConfig());
    files.push(this.generateWranglerToml(appName, generatedKeys));
    files.push(this.generateEnvFile(generatedKeys));  // Actual .env file
    files.push(this.generateEnvExample(generatedKeys));
    files.push(this.generateDevVars(generatedKeys));
    files.push(this.generateEnvProduction(generatedKeys));
    files.push(this.generateGitignore());

    // 2. Generate main entry point
    files.push(this.generateIndex(apiRoutes, appName));

    // 3. Generate middleware
    files.push(this.generateDbMiddleware());
    files.push(this.generateAuthMiddleware());
    files.push(this.generateErrorHandler());

    // 4. Generate auth routes (REQUIRED - uses FluxezClient.auth)
    files.push(this.generateAuthRoutes(defaultRole));

    // 5. Generate entity routes
    const entities = this.groupRoutesByEntity(apiRoutes);
    for (const [entity, routes] of entities) {
      files.push(this.generateEntityRoutes(entity, routes, schema, appPrefix));
    }

    // 6. Generate database schema
    files.push(this.generateSchemaTs(schema, appPrefix));
    files.push(this.generateSchemaFile(schema, appPrefix));

    // 7. Generate types
    files.push(this.generateTypesFile(schema, appPrefix));

    // 8. Generate SDK utilities
    files.push(this.generateSdkUtils());

    // 9. Generate README
    files.push(this.generateReadme(appName, generatedKeys));

    return files;
  }

  /**
   * Extract a short, smart prefix from app name using change-case and pluralize
   * Examples:
   * - "an online bookstore with user reviews" -> "bookstore"
   * - "Task Management System" -> "task"
   * - "E-Commerce Platform" -> "ecommerce"
   */
  private getAppPrefix(appName: string): string {
    // Common words to filter out
    const stopWords = new Set([
      'a', 'an', 'the', 'with', 'and', 'or', 'for', 'to', 'in', 'on', 'of',
      'create', 'build', 'make', 'online', 'app', 'application', 'system',
      'platform', 'tool', 'website', 'site', 'web', 'that', 'has', 'have',
      'can', 'should', 'will', 'user', 'users', 'management', 'manager'
    ]);

    // Keywords that are good table prefixes (prioritize these)
    const keywords = [
      'bookstore', 'book', 'store', 'shop', 'ecommerce', 'commerce',
      'blog', 'post', 'article', 'news', 'content',
      'task', 'todo', 'project', 'issue', 'ticket',
      'inventory', 'stock', 'warehouse', 'product',
      'crm', 'customer', 'client', 'contact', 'lead',
      'finance', 'budget', 'expense', 'invoice', 'payment',
      'recipe', 'food', 'restaurant', 'menu', 'order',
      'fitness', 'health', 'workout', 'gym', 'exercise',
      'travel', 'trip', 'booking', 'hotel', 'flight',
      'event', 'calendar', 'schedule', 'meeting', 'appointment',
      'chat', 'message', 'social', 'forum', 'community',
      'course', 'learning', 'education', 'school', 'class',
      'job', 'career', 'resume', 'hiring', 'recruit',
      'real', 'estate', 'property', 'listing', 'rental',
      'music', 'video', 'media', 'streaming', 'podcast',
      'game', 'quiz', 'trivia', 'poll', 'survey'
    ];

    const nameLower = appName.toLowerCase();

    // First, check if any keyword is in the name
    for (const keyword of keywords) {
      if (nameLower.includes(keyword)) {
        // Use snakeCase from change-case
        return snakeCase(keyword);
      }
    }

    // Extract words using snakeCase conversion, then find meaningful word
    const snakeCased = snakeCase(appName);
    const words = snakeCased
      .split('_')
      .filter(w => w.length > 2 && !stopWords.has(w));

    if (words.length > 0) {
      // Return first meaningful word, max 12 chars, singularized
      const word = words[0].substring(0, 12);
      return pluralize.singular(word);
    }

    // Fallback: use first 8 chars of snake_cased name
    return snakeCased.replace(/_/g, '').substring(0, 8) || 'app';
  }

  /**
   * Convert string to snake_case using change-case
   */
  private toSnakeCase(str: string): string {
    return snakeCase(str);
  }

  /**
   * Convert string to kebab-case using change-case
   */
  private toKebabCase(str: string): string {
    return kebabCase(str);
  }

  /**
   * Pluralize a word using pluralize package
   */
  private pluralizeWord(word: string): string {
    return pluralize.plural(word);
  }

  /**
   * Singularize a word using pluralize package
   */
  private singularizeWord(word: string): string {
    return pluralize.singular(word);
  }

  /**
   * Generate package.json with proper Fluxez SDK from GitHub
   */
  private generatePackageJson(appName: string): GeneratedFile {
    const name = appName.toLowerCase().replace(/\s+/g, '-');

    const content = JSON.stringify({
      name: `${name}-api`,
      version: '1.0.0',
      type: 'module',
      scripts: {
        dev: 'wrangler dev',
        build: 'wrangler deploy --dry-run --outdir=dist',
        deploy: 'wrangler deploy',
        'update:sdk': 'npm uninstall @fluxez/node-sdk && npm install github:fluxez/node-sdk',
        migrate: 'npx fluxez migrate src/db/schema.ts',
        'migrate:dry': 'npx fluxez migrate src/db/schema.ts --dry-run',
        'migrate:dev': 'npx fluxez migrate src/db/schema.ts --dev',
        'migrate:sync': 'npx fluxez migrate src/db/schema.ts --sync',
        'migrate:force': 'npx fluxez migrate src/db/schema.ts --force',
        'migrate:prod': 'npx dotenv -e .env.production -- npx fluxez migrate src/db/schema.ts',
      },
      dependencies: {
        hono: '^4.0.0',
        '@fluxez/node-sdk': 'github:fluxez/node-sdk',
        zod: '^3.23.0',
        '@scalar/hono-api-reference': '^0.5.0',
      },
      devDependencies: {
        '@cloudflare/workers-types': '^4.20241127.0',
        typescript: '^5.6.0',
        wrangler: '^3.91.0',
        tsx: '^4.7.0',
        dotenv: '^16.3.0',
      },
    }, null, 2);

    return {
      path: 'backend/package.json',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate tsconfig.json
   */
  private generateTsConfig(): GeneratedFile {
    const content = JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        lib: ['ES2022'],
        types: ['@cloudflare/workers-types'],
        strict: true,
        skipLibCheck: true,
        esModuleInterop: true,
        outDir: 'dist',
        rootDir: 'src',
      },
      include: ['src'],
      exclude: ['node_modules'],
    }, null, 2);

    return {
      path: 'backend/tsconfig.json',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate wrangler.toml with Fluxez keys
   */
  private generateWranglerToml(appName: string, keys: GeneratedKeys): GeneratedFile {
    const name = appName.toLowerCase().replace(/\s+/g, '-');

    const content = `name = "${name}-api"
main = "src/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[vars]
FLUXEZ_API_KEY = "${keys.serviceRoleKey}"
FLUXEZ_ANON_KEY = "${keys.anonKey}"
JWT_SECRET = "${keys.jwtSecret}"
FRONTEND_URL = "https://${name}.app.fluxez.com"

[observability]
enabled = true

[dev]
port = 4000
`;

    return {
      path: 'backend/wrangler.toml',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate actual .env file (for local development)
   */
  private generateEnvFile(keys: GeneratedKeys): GeneratedFile {
    const content = `# Fluxez Configuration
FLUXEZ_API_KEY=${keys.serviceRoleKey}
FLUXEZ_ANON_KEY=${keys.anonKey}

# JWT Configuration
JWT_SECRET=${keys.jwtSecret}

# Environment
ENVIRONMENT=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
`;

    return {
      path: 'backend/.env',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate .env.example
   */
  private generateEnvExample(keys: GeneratedKeys): GeneratedFile {
    const content = `# Fluxez Configuration
FLUXEZ_API_KEY=${keys.serviceRoleKey}
FLUXEZ_ANON_KEY=${keys.anonKey}

# JWT Configuration
JWT_SECRET=${keys.jwtSecret}

# Environment
ENVIRONMENT=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
`;

    return {
      path: 'backend/.env.example',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate .dev.vars (for wrangler dev)
   */
  private generateDevVars(keys: GeneratedKeys): GeneratedFile {
    const content = `FLUXEZ_API_KEY=${keys.serviceRoleKey}
FLUXEZ_ANON_KEY=${keys.anonKey}
JWT_SECRET=${keys.jwtSecret}
FRONTEND_URL=http://localhost:5173
`;

    return {
      path: 'backend/.dev.vars',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate .env.production
   */
  private generateEnvProduction(keys: GeneratedKeys): GeneratedFile {
    const content = `# Production Fluxez Configuration
FLUXEZ_API_KEY=${keys.serviceRoleKey}
FLUXEZ_ANON_KEY=${keys.anonKey}
`;

    return {
      path: 'backend/.env.production',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate .gitignore
   */
  private generateGitignore(): GeneratedFile {
    const content = `node_modules/
dist/
.dev.vars
.env
.env.local
.wrangler/
`;

    return {
      path: 'backend/.gitignore',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Generate main index.ts with route registration
   */
  private generateIndex(apiRoutes: FeatureApiRoute[], appName: string): GeneratedFile {
    const entities = new Set(apiRoutes.map((r) => r.entity));
    const imports = Array.from(entities)
      .map((entity) => `import ${entity}Routes from './routes/${entity}';`)
      .join('\n');

    const mounts = Array.from(entities)
      .map((entity) => `api.route('/${entity}', ${entity}Routes);`)
      .join('\n');

    const name = appName.toLowerCase().replace(/\s+/g, '-');

    const content = `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiReference } from '@scalar/hono-api-reference';
import { dbMiddleware, type Env } from './middleware/db';
import { optionalAuth } from './middleware/auth';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
${imports}

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', cors({
  origin: (origin) => origin || '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
}));
app.use('*', dbMiddleware);
app.use('*', optionalAuth);

// Error handling
app.onError(errorHandler);

// Health check
app.get('/health', (c) => {
  const baseUrl = new URL(c.req.url).origin;
  return c.json({
    status: 'ok',
    appId: '${name}',
    timestamp: new Date().toISOString(),
    documentation: \`\${baseUrl}/docs\`,
    apiBase: \`\${baseUrl}/api\`,
  });
});

// API routes
const api = new Hono<{ Bindings: Env }>();
api.route('/auth', authRoutes);
${mounts}

app.route('/api', api);

// OpenAPI Documentation
const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: '${appName} API',
    version: '1.0.0',
    description: 'API for ${appName}',
  },
  servers: [{ url: '/api', description: 'API' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {},
};

app.get('/docs', apiReference({
  theme: 'purple',
  spec: { url: '/openapi.json' },
}));

app.get('/openapi.json', (c) => c.json(openApiSpec));

// Root endpoint
app.get('/', (c) => {
  const baseUrl = new URL(c.req.url).origin;
  return c.json({
    name: '${appName} API',
    version: '1.0.0',
    documentation: \`\${baseUrl}/docs\`,
    health: \`\${baseUrl}/health\`,
  });
});

// 404 handler
app.notFound((c) => c.json({ success: false, message: 'Not Found' }, 404));

export default app;
`;

    return {
      path: 'backend/src/index.ts',
      content,
      type: 'route',
      method: 'template',
    };
  }

  /**
   * Generate database middleware using FluxezClient
   */
  private generateDbMiddleware(): GeneratedFile {
    const content = `import { FluxezClient } from '@fluxez/node-sdk';
import type { Context, Next } from 'hono';

interface Env {
  FLUXEZ_API_KEY: string;
  FLUXEZ_ANON_KEY: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
}

export type { Env };

declare module 'hono' {
  interface ContextVariableMap {
    db: FluxezClient;
    authClient: FluxezClient;
  }
}

let cachedClient: FluxezClient | null = null;
let cachedApiKey: string | null = null;

export const dbMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const apiKey = c.env.FLUXEZ_API_KEY;

  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new FluxezClient(apiKey);
    cachedApiKey = apiKey;
  }

  c.set('db', cachedClient);
  c.set('authClient', cachedClient);

  await next();
};

// Helper function for compatibility - returns cached client
export function getDbClient(c: Context): FluxezClient {
  return c.get('db');
}

// Helper function for compatibility - creates client with optional token
export function getFluxezClient(env: Env, token?: string): FluxezClient {
  if (!cachedClient || cachedApiKey !== env.FLUXEZ_API_KEY) {
    cachedClient = new FluxezClient(env.FLUXEZ_API_KEY);
    cachedApiKey = env.FLUXEZ_API_KEY;
  }
  return cachedClient;
}
`;

    return {
      path: 'backend/src/middleware/db.ts',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Generate SDK utilities with module usage examples
   */
  private generateSdkUtils(): GeneratedFile {
    const content = `// @ts-nocheck
/**
 * Fluxez SDK Utilities
 *
 * This file provides helper functions for common SDK operations.
 * Import these utilities in your routes for cleaner code.
 * Note: This file uses @ts-nocheck as the SDK API may vary between versions.
 */

import { Context } from 'hono';
import type { FluxezClient } from '@fluxez/node-sdk';

// Get the FluxezClient from context
export function getClient(c: Context): FluxezClient {
  return c.get('db');
}

// ============================================
// FILE STORAGE UTILITIES
// ============================================

/**
 * Upload a file to storage
 * @param c - Hono context
 * @param bucket - Storage bucket name
 * @param file - File to upload
 * @param options - Upload options
 */
export async function uploadFile(
  c: Context,
  bucket: string,
  file: File | Blob,
  options?: { path?: string; public?: boolean }
) {
  const db = getClient(c);
  return db.storage.upload(bucket, file, options);
}

/**
 * Get public URL for a file
 * @param c - Hono context
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 */
export function getFileUrl(c: Context, bucket: string, path: string): string {
  const db = getClient(c);
  return db.storage.getPublicUrl(bucket, path);
}

/**
 * Delete a file from storage
 * @param c - Hono context
 * @param bucket - Storage bucket name
 * @param path - File path to delete
 */
export async function deleteFile(c: Context, bucket: string, path: string) {
  const db = getClient(c);
  return db.storage.delete(bucket, path);
}

/**
 * List files in a bucket
 * @param c - Hono context
 * @param bucket - Storage bucket name
 * @param options - List options (prefix, limit, offset)
 */
export async function listFiles(
  c: Context,
  bucket: string,
  options?: { prefix?: string; limit?: number; offset?: number }
) {
  const db = getClient(c);
  return db.storage.list(bucket, options);
}

// ============================================
// AI TEXT GENERATION UTILITIES
// ============================================

/**
 * Generate text using AI
 * @param c - Hono context
 * @param prompt - Text prompt
 * @param options - Generation options
 */
export async function generateText(
  c: Context,
  prompt: string,
  options?: { model?: string; maxTokens?: number; temperature?: number }
) {
  const db = getClient(c);
  return db.ai.generateText({
    model: options?.model || 'gpt-4o-mini',
    prompt,
    maxTokens: options?.maxTokens || 500,
    temperature: options?.temperature || 0.7,
  });
}

/**
 * Chat completion with AI
 * @param c - Hono context
 * @param messages - Chat messages array
 * @param options - Chat options
 */
export async function chatCompletion(
  c: Context,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: { model?: string; maxTokens?: number }
) {
  const db = getClient(c);
  return db.ai.chat({
    model: options?.model || 'gpt-4o-mini',
    messages,
    maxTokens: options?.maxTokens || 1000,
  });
}

// ============================================
// EMAIL UTILITIES
// ============================================

/**
 * Send an email
 * @param c - Hono context
 * @param to - Recipient email
 * @param subject - Email subject
 * @param html - HTML content
 * @param from - Sender email (optional)
 */
export async function sendEmail(
  c: Context,
  to: string,
  subject: string,
  html: string,
  from?: string
) {
  const db = getClient(c);
  return db.email.send({
    to,
    subject,
    html,
    from: from || 'noreply@fluxez.app',
  });
}

/**
 * Send email using a template
 * @param c - Hono context
 * @param to - Recipient email
 * @param templateId - Template ID
 * @param variables - Template variables
 */
export async function sendTemplateEmail(
  c: Context,
  to: string,
  templateId: string,
  variables: Record<string, string>
) {
  const db = getClient(c);
  return db.email.sendTemplate({
    to,
    templateId,
    variables,
  });
}

// ============================================
// PUSH NOTIFICATION UTILITIES
// ============================================

/**
 * Send push notification to a user
 * @param c - Hono context
 * @param userId - Target user ID
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Additional data payload
 */
export async function sendPushNotification(
  c: Context,
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  const db = getClient(c);
  return db.push.send({
    userId,
    title,
    body,
    data,
  });
}

/**
 * Send push notifications to multiple users
 * @param c - Hono context
 * @param notifications - Array of notifications
 */
export async function sendBatchPushNotifications(
  c: Context,
  notifications: Array<{
    userId: string;
    title: string;
    body: string;
    data?: Record<string, any>;
  }>
) {
  const db = getClient(c);
  return db.push.sendBatch(notifications);
}

// ============================================
// REALTIME & CHANNEL UTILITIES
// ============================================

/**
 * Broadcast message to a channel
 * @param c - Hono context
 * @param channel - Channel name
 * @param event - Event type
 * @param data - Message data
 */
export async function broadcastToChannel(
  c: Context,
  channel: string,
  event: string,
  data: any
) {
  const db = getClient(c);
  return db.channels.broadcast(channel, { type: event, data });
}

/**
 * Track user presence in a channel
 * @param c - Hono context
 * @param channel - Channel name
 * @param userId - User ID
 * @param status - Presence status
 */
export async function trackPresence(
  c: Context,
  channel: string,
  userId: string,
  status: Record<string, any>
) {
  const db = getClient(c);
  return db.realtime.trackPresence(channel, userId, status);
}

// ============================================
// EXAMPLE ROUTE USAGE
// ============================================

/*
// Example: File upload route
app.post('/upload', authMiddleware, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return c.json({ success: false, message: 'No file provided' }, 400);
  }

  const uploaded = await uploadFile(c, 'uploads', file, {
    path: \`images/\${Date.now()}-\${file.name}\`,
    public: true,
  });

  return c.json({ success: true, data: uploaded });
});

// Example: AI-powered description generator
app.post('/generate-description', authMiddleware, async (c) => {
  const { product } = await c.req.json();

  const description = await generateText(c,
    \`Write a compelling product description for: \${product}\`,
    { maxTokens: 200 }
  );

  return c.json({ success: true, data: description });
});

// Example: Welcome email on registration
app.post('/register', async (c) => {
  // ... registration logic ...

  await sendEmail(c,
    user.email,
    'Welcome to Our App!',
    \`<h1>Welcome \${user.name}!</h1><p>Thanks for joining.</p>\`
  );

  return c.json({ success: true, data: user });
});

// Example: Real-time notifications
app.post('/messages', authMiddleware, async (c) => {
  // ... save message logic ...

  // Notify recipient in real-time
  await broadcastToChannel(c, \`user-\${recipientId}\`, 'new-message', {
    from: senderId,
    message: content,
  });

  // Also send push notification
  await sendPushNotification(c, recipientId, 'New Message', content);

  return c.json({ success: true });
});
*/
`;

    return {
      path: 'backend/src/utils/sdk.ts',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Generate auth middleware with JWT decoding
   */
  private generateAuthMiddleware(): GeneratedFile {
    const content = `import { Context, Next } from 'hono';

interface AuthUser {
  id: string;
  sub?: string;
  userId?: string;
  email: string;
  role?: string;
  name?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

function decodeJwt(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: payload.userId || payload.sub || payload.id || '',
      sub: payload.sub,
      userId: payload.userId,
      email: payload.email || '',
      role: payload.role,
      name: payload.name,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch {
    return null;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Unauthorized - No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const user = decodeJwt(token);

  if (!user) {
    return c.json({ success: false, message: 'Unauthorized - Invalid or expired token' }, 401);
  }

  c.set('user', user);
  await next();
};

export const optionalAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = decodeJwt(token);
    if (user) {
      c.set('user', user);
    }
  }
  await next();
};

// Helper function for compatibility with existing routes
export function getUser(c: Context): AuthUser {
  return c.get('user');
}
`;

    return {
      path: 'backend/src/middleware/auth.ts',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Generate error handler
   */
  private generateErrorHandler(): GeneratedFile {
    const content = `import { Context } from 'hono';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err);

  if (err instanceof ZodError) {
    return c.json({
      success: false,
      message: 'Validation error',
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    }, 400);
  }

  return c.json({
    success: false,
    message: err.message || 'Internal server error',
  }, 500);
};
`;

    return {
      path: 'backend/src/middleware/error.ts',
      content,
      type: 'component',
      method: 'template',
    };
  }

  /**
   * Generate auth routes using FluxezClient.auth methods
   */
  private generateAuthRoutes(defaultRole: string = 'user'): GeneratedFile {
    const content = `import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

// Default role for new registrations (from app type definition)
const DEFAULT_ROLE = '${defaultRole}';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.string().optional(), // Allow explicit role for admin-created users
});

app.post('/login', async (c) => {
  const authClient = c.get('authClient');
  try {
    const body = await c.req.json();
    const { email, password } = loginSchema.parse(body);
    const result = (await authClient.auth.login({ email, password })) as any;

    if (!result || !result.user) {
      return c.json({ success: false, message: 'Invalid credentials' }, 401);
    }

    const user = result.user as any;
    const token = result.token || result.accessToken || result.access_token;
    const refreshToken = result.refreshToken || result.refresh_token;

    // Return in Fluxez-compatible format (flat structure with snake_case)
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.metadata?.name,
        username: user.username || user.metadata?.username,
        role: user.role || user.metadata?.role || DEFAULT_ROLE,
        emailVerified: user.emailVerified || user.email_verified || false,
      },
      token,
      access_token: token,
      refresh_token: refreshToken,
    });
  } catch (error: any) {
    return c.json({ success: false, message: 'Login failed' }, 401);
  }
});

app.post('/register', async (c) => {
  const authClient = c.get('authClient');
  try {
    const body = await c.req.json();
    const { email, password, name, role } = registerSchema.parse(body);
    // Use provided role or fall back to app's default role
    const userRole = role || DEFAULT_ROLE;
    const result = (await authClient.auth.register({ email, password, name, role: userRole, metadata: { name, role: userRole } })) as any;

    if (!result || !result.user) {
      return c.json({ success: false, message: 'Registration failed' }, 400);
    }

    const user = result.user as any;
    const token = result.token || result.accessToken || result.access_token;
    const refreshToken = result.refreshToken || result.refresh_token;

    // Return in Fluxez-compatible format (flat structure with snake_case)
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.metadata?.name || name,
        username: user.username || user.metadata?.username,
        role: userRole,
        emailVerified: user.emailVerified || user.email_verified || false,
      },
      token,
      access_token: token,
      refresh_token: refreshToken,
    }, 201);
  } catch (error: any) {
    return c.json({ success: false, message: 'Registration failed' }, 400);
  }
});

app.get('/me', authMiddleware, async (c) => {
  const user = c.get('user') as any;
  // Return user directly (Fluxez-compatible format)
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role || DEFAULT_ROLE,
    },
  });
});

app.post('/logout', async (c) => c.json({ success: true, message: 'Logged out successfully' }));

export default app;
`;

    return {
      path: 'backend/src/routes/auth.ts',
      content,
      type: 'route',
      method: 'template',
    };
  }

  /**
   * Generate routes for an entity using Fluxez SDK patterns
   */
  private generateEntityRoutes(
    entity: string,
    routes: FeatureApiRoute[],
    schema: DatabaseSchema,
    appPrefix: string
  ): GeneratedFile {
    const table = schema.tables.find((t) => t.name === entity || t.name === `${appPrefix}_${entity}`);
    const tableName = table ? `${appPrefix}_${table.name.replace(`${appPrefix}_`, '')}` : `${appPrefix}_${entity}`;

    const routeHandlers = routes.map((route) => {
      return this.generateRouteHandler(route, tableName);
    }).join('\n\n');

    const content = `import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import type { Env } from '../middleware/db';

const app = new Hono<{ Bindings: Env }>();

${routeHandlers}

export default app;
`;

    return {
      path: `backend/src/routes/${entity}.ts`,
      content,
      type: 'route',
      method: 'template',
    };
  }

  /**
   * Generate a single route handler using Fluxez SDK patterns
   */
  private generateRouteHandler(route: FeatureApiRoute, tableName: string): string {
    const method = route.method.toLowerCase();
    const path = route.path.replace(`/${route.entity}`, '') || '/';
    const middleware = route.auth ? 'authMiddleware, ' : '';

    // Infer operation from method and path if handler is 'crud' and operation is not specified
    let operation = route.operation;
    if (!operation && route.handler === 'crud') {
      operation = this.inferCrudOperation(route.method, path);
    }

    let handler: string;

    switch (operation) {
      case 'list':
        handler = this.generateListHandler(tableName);
        break;
      case 'get':
        handler = this.generateGetHandler(tableName);
        break;
      case 'create':
        handler = this.generateCreateHandler(tableName);
        break;
      case 'update':
        handler = this.generateUpdateHandler(tableName);
        break;
      case 'delete':
        handler = this.generateDeleteHandler(tableName);
        break;
      default:
        // Generate custom handler based on path pattern
        handler = this.generateCustomHandler(tableName, path, route.method);
    }

    return `// ${route.description}
app.${method}('${path}', ${middleware}async (c) => {
  const db = c.get('db');
  const user = c.get('user');
${handler}
});`;
  }

  /**
   * Infer CRUD operation from HTTP method and path
   * Maps standard REST patterns to operations
   */
  private inferCrudOperation(method: string, path: string): 'list' | 'get' | 'create' | 'update' | 'delete' | undefined {
    const upperMethod = method.toUpperCase();
    const hasIdParam = path.includes(':id') || path.includes(':slug');

    switch (upperMethod) {
      case 'GET':
        // GET / → list, GET /:id or /:slug → get
        return hasIdParam ? 'get' : 'list';
      case 'POST':
        return 'create';
      case 'PUT':
      case 'PATCH':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return undefined;
    }
  }

  private generateListHandler(tableName: string): string {
    return `  try {
    const { page, limit, status, search } = c.req.query();
    const pageNum = parseInt(page || '1');
    const limitNum = Math.min(parseInt(limit || '20'), 50);

    let query = db.query.from('${tableName}')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limitNum)
      .offset((pageNum - 1) * limitNum);

    if (status) {
      query = query.where('status', status);
    }

    const items = await query.get();

    return c.json({ success: true, data: items || [] });
  } catch (error: any) {
    console.error('List ${tableName} error:', error);
    return c.json({ success: true, data: [] });
  }`;
  }

  private generateGetHandler(tableName: string): string {
    return `  const id = c.req.param('id');
  try {
    const item = await db.findOne('${tableName}', { id });

    if (!item) {
      return c.json({ success: false, message: 'Not found' }, 404);
    }

    return c.json({ success: true, data: item });
  } catch (error: any) {
    console.error('Get ${tableName} error:', error);
    return c.json({ success: false, message: 'Failed to fetch item' }, 500);
  }`;
  }

  private generateCreateHandler(tableName: string): string {
    return `  try {
    const data = await c.req.json();
    const userId = user?.id;
    const now = new Date().toISOString();

    const result = await db.insert('${tableName}', {
      id: crypto.randomUUID(),
      ...data,
      user_id: userId,
      created_at: now,
      updated_at: now,
    });

    return c.json({ success: true, data: result.data?.[0] || result }, 201);
  } catch (error: any) {
    console.error('Create ${tableName} error:', error);
    return c.json({ success: false, message: error.message || 'Failed to create item' }, 400);
  }`;
  }

  private generateUpdateHandler(tableName: string): string {
    return `  const id = c.req.param('id');
  try {
    const data = await c.req.json();
    const userId = user?.id;

    // Verify ownership
    const existing = await db.findOne('${tableName}', { id });

    if (!existing) {
      return c.json({ success: false, message: 'Not found' }, 404);
    }

    if (existing.user_id !== userId) {
      return c.json({ success: false, message: 'Not authorized' }, 403);
    }

    const result = await db.query.from('${tableName}')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .where('id', id)
      .returning('*')
      .execute();

    return c.json({ success: true, data: result.data?.[0] });
  } catch (error: any) {
    console.error('Update ${tableName} error:', error);
    return c.json({ success: false, message: error.message || 'Failed to update item' }, 400);
  }`;
  }

  private generateDeleteHandler(tableName: string): string {
    return `  const id = c.req.param('id');
  try {
    const userId = user?.id;

    // Verify ownership
    const existing = await db.findOne('${tableName}', { id });

    if (!existing) {
      return c.json({ success: false, message: 'Not found' }, 404);
    }

    if (existing.user_id !== userId) {
      return c.json({ success: false, message: 'Not authorized' }, 403);
    }

    await db.delete('${tableName}', { id });

    return c.json({ success: true, data: { id } });
  } catch (error: any) {
    console.error('Delete ${tableName} error:', error);
    return c.json({ success: false, message: error.message || 'Failed to delete item' }, 400);
  }`;
  }

  /**
   * Generate custom operation handler based on path pattern
   */
  private generateCustomHandler(tableName: string, path: string, method: string): string {
    const lowerPath = path.toLowerCase();
    const upperMethod = method.toUpperCase();

    // Status change operations (publish, unpublish, archive, activate, deactivate)
    if (lowerPath.includes('/publish')) {
      return this.generateStatusChangeHandler(tableName, 'published');
    }
    if (lowerPath.includes('/unpublish') || lowerPath.includes('/draft')) {
      return this.generateStatusChangeHandler(tableName, 'draft');
    }
    if (lowerPath.includes('/archive')) {
      return this.generateStatusChangeHandler(tableName, 'archived');
    }
    if (lowerPath.includes('/activate')) {
      return this.generateStatusChangeHandler(tableName, 'active');
    }
    if (lowerPath.includes('/deactivate') || lowerPath.includes('/disable')) {
      return this.generateStatusChangeHandler(tableName, 'inactive');
    }

    // Approval workflow
    if (lowerPath.includes('/approve')) {
      return this.generateStatusChangeHandler(tableName, 'approved');
    }
    if (lowerPath.includes('/reject')) {
      return this.generateStatusChangeHandler(tableName, 'rejected');
    }
    if (lowerPath.includes('/complete')) {
      return this.generateStatusChangeHandler(tableName, 'completed');
    }
    if (lowerPath.includes('/cancel')) {
      return this.generateStatusChangeHandler(tableName, 'cancelled');
    }

    // Bulk operations
    if (lowerPath.includes('/bulk-delete') || lowerPath.includes('/bulk/delete')) {
      return this.generateBulkDeleteHandler(tableName);
    }
    if (lowerPath.includes('/bulk-update') || lowerPath.includes('/bulk/update')) {
      return this.generateBulkUpdateHandler(tableName);
    }

    // Search operation
    if (lowerPath.includes('/search')) {
      return this.generateSearchHandler(tableName);
    }

    // Export operation
    if (lowerPath.includes('/export')) {
      return this.generateExportHandler(tableName);
    }

    // Run/Execute operation (reports, jobs, etc.)
    if (lowerPath.includes('/run') || lowerPath.includes('/execute')) {
      return this.generateRunHandler(tableName);
    }

    // Clone/Duplicate operation
    if (lowerPath.includes('/clone') || lowerPath.includes('/duplicate')) {
      return this.generateCloneHandler(tableName);
    }

    // Count operation
    if (lowerPath.includes('/count')) {
      return this.generateCountHandler(tableName);
    }

    // Stats/Analytics operation
    if (lowerPath.includes('/stats') || lowerPath.includes('/analytics')) {
      return this.generateStatsHandler(tableName);
    }

    // Default: return a working placeholder that logs the operation
    return `  try {
    const id = c.req.param('id');
    const body = ${upperMethod === 'GET' ? '{}' : 'await c.req.json()'};

    // Custom operation placeholder - implement specific logic as needed
    console.log('Custom operation on ${tableName}:', { id, body });

    if (id) {
      const item = await db.findOne('${tableName}', { id });
      if (!item) {
        return c.json({ success: false, message: 'Not found' }, 404);
      }
      return c.json({ success: true, data: item });
    }

    return c.json({ success: true, message: 'Operation completed' });
  } catch (error: any) {
    console.error('Custom operation error:', error);
    return c.json({ success: false, message: error.message || 'Operation failed' }, 500);
  }`;
  }

  private generateStatusChangeHandler(tableName: string, newStatus: string): string {
    return `  const id = c.req.param('id');
  try {
    const userId = user?.id;

    const existing = await db.findOne('${tableName}', { id });
    if (!existing) {
      return c.json({ success: false, message: 'Not found' }, 404);
    }

    const result = await db.query.from('${tableName}')
      .update({
        status: '${newStatus}',
        updated_at: new Date().toISOString(),
      })
      .where('id', id)
      .returning('*')
      .execute();

    return c.json({ success: true, data: result.data?.[0] });
  } catch (error: any) {
    console.error('Status change error:', error);
    return c.json({ success: false, message: error.message || 'Failed to update status' }, 400);
  }`;
  }

  private generateBulkDeleteHandler(tableName: string): string {
    return `  try {
    const { ids } = await c.req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return c.json({ success: false, message: 'No IDs provided' }, 400);
    }

    for (const id of ids) {
      await db.delete('${tableName}', { id });
    }

    return c.json({ success: true, deleted: ids.length });
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    return c.json({ success: false, message: error.message || 'Bulk delete failed' }, 400);
  }`;
  }

  private generateBulkUpdateHandler(tableName: string): string {
    return `  try {
    const { ids, data } = await c.req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return c.json({ success: false, message: 'No IDs provided' }, 400);
    }

    for (const id of ids) {
      await db.query.from('${tableName}')
        .update({ ...data, updated_at: new Date().toISOString() })
        .where('id', id)
        .execute();
    }

    return c.json({ success: true, updated: ids.length });
  } catch (error: any) {
    console.error('Bulk update error:', error);
    return c.json({ success: false, message: error.message || 'Bulk update failed' }, 400);
  }`;
  }

  private generateSearchHandler(tableName: string): string {
    return `  try {
    const { q, query, search, field, limit: searchLimit } = c.req.query();
    const searchTerm = q || query || search || '';
    const limitNum = Math.min(parseInt(searchLimit || '20'), 50);

    if (!searchTerm) {
      return c.json({ success: true, data: [] });
    }

    // Search in common text fields
    const items = await db.query.from('${tableName}')
      .select('*')
      .where('title', 'ILIKE', \`%\${searchTerm}%\`)
      .orWhere('name', 'ILIKE', \`%\${searchTerm}%\`)
      .orWhere('description', 'ILIKE', \`%\${searchTerm}%\`)
      .limit(limitNum)
      .get();

    return c.json({ success: true, data: items || [] });
  } catch (error: any) {
    console.error('Search error:', error);
    return c.json({ success: true, data: [] });
  }`;
  }

  private generateExportHandler(tableName: string): string {
    return `  try {
    const { format = 'json' } = c.req.query();

    const items = await db.query.from('${tableName}')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(1000)
      .get();

    if (format === 'csv') {
      // Simple CSV export
      if (!items || items.length === 0) {
        return c.text('');
      }
      const headers = Object.keys(items[0]).join(',');
      const rows = items.map(item => Object.values(item).map(v => JSON.stringify(v)).join(','));
      return c.text([headers, ...rows].join('\\n'), 200, {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="${tableName}.csv"'
      });
    }

    return c.json({ success: true, data: items, count: items?.length || 0 });
  } catch (error: any) {
    console.error('Export error:', error);
    return c.json({ success: false, message: error.message || 'Export failed' }, 500);
  }`;
  }

  private generateRunHandler(tableName: string): string {
    return `  const id = c.req.param('id');
  try {
    const existing = await db.findOne('${tableName}', { id });
    if (!existing) {
      return c.json({ success: false, message: 'Not found' }, 404);
    }

    // Update status to running/executed
    const result = await db.query.from('${tableName}')
      .update({
        status: 'executed',
        last_run_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .where('id', id)
      .returning('*')
      .execute();

    return c.json({ success: true, data: result.data?.[0], executed: true });
  } catch (error: any) {
    console.error('Run operation error:', error);
    return c.json({ success: false, message: error.message || 'Run failed' }, 500);
  }`;
  }

  private generateCloneHandler(tableName: string): string {
    return `  const id = c.req.param('id');
  try {
    const existing = await db.findOne('${tableName}', { id });
    if (!existing) {
      return c.json({ success: false, message: 'Not found' }, 404);
    }

    // Remove id and timestamps, add copy suffix
    const { id: _id, created_at, updated_at, ...cloneData } = existing;
    if (cloneData.title) cloneData.title = cloneData.title + ' (Copy)';
    if (cloneData.name) cloneData.name = cloneData.name + ' (Copy)';

    const result = await db.query.from('${tableName}')
      .insert({
        ...cloneData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return c.json({ success: true, data: result.data?.[0] }, 201);
  } catch (error: any) {
    console.error('Clone error:', error);
    return c.json({ success: false, message: error.message || 'Clone failed' }, 400);
  }`;
  }

  private generateCountHandler(tableName: string): string {
    return `  try {
    const { status, user_id: filterUserId } = c.req.query();

    let query = db.query.from('${tableName}').select('COUNT(*) as count');

    if (status) {
      query = query.where('status', status);
    }
    if (filterUserId) {
      query = query.where('user_id', filterUserId);
    }

    const result = await query.first();

    return c.json({ success: true, count: parseInt(result?.count || '0') });
  } catch (error: any) {
    console.error('Count error:', error);
    return c.json({ success: true, count: 0 });
  }`;
  }

  private generateStatsHandler(tableName: string): string {
    return `  try {
    const userId = user?.id;

    // Get basic stats
    const total = await db.query.from('${tableName}')
      .select('COUNT(*) as count')
      .first();

    const byStatus = await db.query.from('${tableName}')
      .select('status, COUNT(*) as count')
      .groupBy('status')
      .get();

    const recent = await db.query.from('${tableName}')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(5)
      .get();

    return c.json({
      success: true,
      stats: {
        total: parseInt(total?.count || '0'),
        byStatus: byStatus || [],
        recent: recent || [],
      }
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return c.json({ success: true, stats: { total: 0, byStatus: [], recent: [] } });
  }`;
  }

  /**
   * Generate schema.ts in Fluxez format
   */
  private generateSchemaTs(schema: DatabaseSchema, appPrefix: string): GeneratedFile {
    const tables = schema.tables.map((table) => {
      const tableName = `${appPrefix}_${table.name.replace(`${appPrefix}_`, '')}`;
      const columns = table.columns.map((col) => {
        const colDef: any = {
          name: col.name,
          type: this.mapToFluxezType(col.type),
        };
        if (col.constraints.includes('primary_key')) colDef.primaryKey = true;
        if (col.constraints.includes('not_null')) colDef.nullable = false;
        if (col.default) {
          // Clean up default values for Fluxez format
          colDef.default = this.cleanDefaultValue(col.default, col.type);
        }
        return colDef;
      });

      const indexes = table.indexes?.map((idx) => ({
        columns: idx.columns,
      })) || [];

      return `  ${tableName}: {
    columns: ${JSON.stringify(columns, null, 6).replace(/\n/g, '\n    ')},
    indexes: ${JSON.stringify(indexes, null, 6).replace(/\n/g, '\n    ')},
  }`;
    }).join(',\n\n');

    const content = `/**
 * Database Schema
 * Run migrations with: npm run migrate
 * Preview changes: npm run migrate:dry
 */
export const schema = {
${tables}
};
`;

    return {
      path: 'backend/src/db/schema.ts',
      content,
      type: 'schema',
      method: 'template',
    };
  }

  /**
   * Clean default values for Fluxez schema format
   * Fluxez expects: "draft" not "'draft'"
   * SQL functions like NOW(), gen_random_uuid() should be passed through
   */
  private cleanDefaultValue(value: string, type: string): string {
    // SQL functions - pass through as-is
    const sqlFunctions = ['NOW()', 'gen_random_uuid()', 'uuid_generate_v4()', 'CURRENT_TIMESTAMP'];
    const upperValue = value.toUpperCase();
    for (const fn of sqlFunctions) {
      if (upperValue === fn.toUpperCase() || upperValue.includes(fn.toUpperCase())) {
        return value;
      }
    }

    // Boolean values
    if (upperValue === 'TRUE' || upperValue === 'FALSE') {
      return value;
    }

    // Numeric values
    if (!isNaN(Number(value))) {
      return value;
    }

    // NULL
    if (upperValue === 'NULL') {
      return value;
    }

    // String values - strip outer SQL quotes if present
    // e.g., "'draft'" -> "draft"
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }

    return value;
  }

  private mapToFluxezType(type: string): string {
    const typeMap: Record<string, string> = {
      'UUID': 'uuid',
      'VARCHAR': 'text',
      'TEXT': 'text',
      'INTEGER': 'integer',
      'INT': 'integer',
      'BIGINT': 'bigint',
      'NUMERIC': 'numeric',
      'DECIMAL': 'numeric',
      'BOOLEAN': 'boolean',
      'DATE': 'date',
      'TIME': 'time',
      'TIMESTAMP': 'timestamptz',
      'TIMESTAMPTZ': 'timestamptz',
      'JSONB': 'jsonb',
      'JSON': 'jsonb',
    };
    return typeMap[type.toUpperCase()] || type.toLowerCase();
  }

  /**
   * Generate schema SQL file
   */
  private generateSchemaFile(schema: DatabaseSchema, appPrefix: string): GeneratedFile {
    const sql = this.generateSchemaSql(schema, appPrefix);

    return {
      path: 'backend/src/schema.sql',
      content: sql,
      type: 'schema',
      method: 'template',
    };
  }

  private generateSchemaSql(schema: DatabaseSchema, appPrefix: string): string {
    let sql = `-- Auto-generated database schema
-- Generated at: ${schema.generatedAt}
-- App prefix: ${appPrefix}

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

`;

    for (const table of schema.tables) {
      const tableName = `${appPrefix}_${table.name.replace(`${appPrefix}_`, '')}`;
      sql += this.generateTableSql(table, tableName);
      sql += '\n\n';
    }

    // Generate indexes
    for (const table of schema.tables) {
      const tableName = `${appPrefix}_${table.name.replace(`${appPrefix}_`, '')}`;
      if (table.indexes) {
        for (const idx of table.indexes) {
          const indexName = `idx_${tableName}_${idx.columns.join('_')}`;
          sql += `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${idx.columns.join(', ')});\n`;
        }
      }
    }

    return sql;
  }

  private generateTableSql(table: DbTable, tableName: string): string {
    const columns = table.columns.map((col) => {
      let def = `  ${col.name} ${col.type.toUpperCase()}`;
      if (col.typeParams) def += `(${col.typeParams})`;
      if (col.constraints.includes('primary_key')) def += ' PRIMARY KEY';
      if (col.constraints.includes('not_null')) def += ' NOT NULL';
      if (col.constraints.includes('unique')) def += ' UNIQUE';
      if (col.default) def += ` DEFAULT ${col.default}`;
      return def;
    }).join(',\n');

    return `CREATE TABLE IF NOT EXISTS ${tableName} (
${columns}
);`;
  }

  /**
   * Generate types file
   */
  private generateTypesFile(schema: DatabaseSchema, appPrefix: string): GeneratedFile {
    const interfaces = schema.tables.map((table) => {
      const tableName = table.name.replace(`${appPrefix}_`, '');
      const interfaceName = this.toPascalCase(tableName);

      const props = table.columns.map((col) => {
        const tsType = this.mapToTsType(col.type);
        const optional = !col.constraints.includes('not_null') && !col.constraints.includes('primary_key');
        return `  ${col.name}${optional ? '?' : ''}: ${tsType};`;
      }).join('\n');

      return `export interface ${interfaceName} {
${props}
}`;
    }).join('\n\n');

    const content = `// Auto-generated TypeScript types

${interfaces}

// Common response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
`;

    return {
      path: 'backend/src/types/index.ts',
      content,
      type: 'component',
      method: 'template',
    };
  }

  private mapToTsType(sqlType: string): string {
    const typeMap: Record<string, string> = {
      'UUID': 'string',
      'VARCHAR': 'string',
      'TEXT': 'string',
      'INTEGER': 'number',
      'INT': 'number',
      'BIGINT': 'number',
      'NUMERIC': 'number',
      'DECIMAL': 'number',
      'BOOLEAN': 'boolean',
      'DATE': 'string',
      'TIME': 'string',
      'TIMESTAMP': 'string',
      'TIMESTAMPTZ': 'string',
      'JSONB': 'Record<string, any>',
      'JSON': 'Record<string, any>',
    };
    return typeMap[sqlType.toUpperCase()] || 'any';
  }

  private toPascalCase(str: string): string {
    return str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Generate README
   */
  private generateReadme(appName: string, keys: GeneratedKeys): GeneratedFile {
    const content = `# ${appName} Backend API

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy to Cloudflare Workers
npm run deploy
\`\`\`

## Environment Variables

The following keys have been generated for this app:

- \`FLUXEZ_API_KEY\`: Service role key (full access)
- \`FLUXEZ_ANON_KEY\`: Anonymous key (read-only)
- \`JWT_SECRET\`: JWT signing secret

These are already configured in \`wrangler.toml\` and \`.dev.vars\`.

## Database Migrations

\`\`\`bash
# Preview changes
npm run migrate:dry

# Run migrations
npm run migrate

# Run production migrations
npm run migrate:prod
\`\`\`

## API Endpoints

- \`GET /health\` - Health check
- \`GET /docs\` - API documentation
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - Login user
- \`GET /api/auth/me\` - Get current user

## Fluxez SDK Modules

The FluxezClient provides access to various modules. Here are usage examples:

### Database Operations

\`\`\`typescript
const db = c.get('db');

// Query all rows
const items = await db.query.from('items').select('*').get();

// Find single row
const item = await db.findOne('items', { id: itemId });

// Insert data
const result = await db.insert('items', {
  id: crypto.randomUUID(),
  title: 'New Item',
  created_at: new Date().toISOString(),
});

// Update data
await db.query.from('items')
  .update({ title: 'Updated' })
  .where('id', itemId)
  .execute();

// Delete data
await db.delete('items', { id: itemId });

// Raw SQL query
const result = await db.raw('SELECT * FROM items WHERE status = $1', ['active']);
\`\`\`

### File Storage

\`\`\`typescript
const db = c.get('db');

// Upload a file
const file = await c.req.formData().get('file');
const uploaded = await db.storage.upload('bucket-name', file, {
  path: 'uploads/',
  public: true,
});

// Get file URL
const url = db.storage.getPublicUrl('bucket-name', 'uploads/file.jpg');

// Delete a file
await db.storage.delete('bucket-name', 'uploads/file.jpg');

// List files in bucket
const files = await db.storage.list('bucket-name', { prefix: 'uploads/' });
\`\`\`

### AI Text Generation

\`\`\`typescript
const db = c.get('db');

// Generate text using AI
const response = await db.ai.generateText({
  model: 'gpt-4o-mini',
  prompt: 'Write a product description for...',
  maxTokens: 500,
});

// Chat completion
const chatResponse = await db.ai.chat({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
  ],
});
\`\`\`

### Email Sending

\`\`\`typescript
const db = c.get('db');

// Send an email
await db.email.send({
  to: 'user@example.com',
  subject: 'Welcome to ${appName}!',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
  from: 'noreply@yourapp.com',
});

// Send with template
await db.email.sendTemplate({
  to: 'user@example.com',
  templateId: 'welcome-email',
  variables: { name: 'John', appName: '${appName}' },
});
\`\`\`

### Push Notifications

\`\`\`typescript
const db = c.get('db');

// Send push notification
await db.push.send({
  userId: userId,
  title: 'New Message',
  body: 'You have a new message!',
  data: { type: 'message', id: messageId },
});

// Send to multiple users
await db.push.sendBatch([
  { userId: user1Id, title: 'Update', body: 'New features available!' },
  { userId: user2Id, title: 'Update', body: 'New features available!' },
]);
\`\`\`

### Realtime & Channels

\`\`\`typescript
const db = c.get('db');

// Broadcast to a channel
await db.channels.broadcast('room-123', {
  type: 'message',
  data: { text: 'Hello everyone!' },
});

// Subscribe to presence
await db.realtime.trackPresence('room-123', userId, {
  online: true,
  status: 'active',
});
\`\`\`

## App Details

- **App ID**: \`${keys.appId}\`
- **Database**: \`${keys.databaseName}\`
`;

    return {
      path: 'backend/README.md',
      content,
      type: 'config',
      method: 'template',
    };
  }

  /**
   * Group routes by entity
   */
  private groupRoutesByEntity(routes: FeatureApiRoute[]): Map<string, FeatureApiRoute[]> {
    const grouped = new Map<string, FeatureApiRoute[]>();

    for (const route of routes) {
      const entity = route.entity;
      if (!grouped.has(entity)) {
        grouped.set(entity, []);
      }
      grouped.get(entity)!.push(route);
    }

    return grouped;
  }
}
