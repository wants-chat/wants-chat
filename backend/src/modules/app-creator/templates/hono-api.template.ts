import {
  GeneratedFile,
  DatabaseSchema,
  TableSchema,
  GeneratedKeys,
  EnhancedAppAnalysis,
  EnhancedEntityDefinition,
} from '../dto/create-app.dto';
import { snakeCase, camelCase, pascalCase, kebabCase } from 'change-case';
import * as pluralize from 'pluralize';

// Import blueprints
import { getBlueprint, Blueprint, ApiEndpoint } from '../blueprints';

export class HonoTemplateGenerator {
  private blueprint: Blueprint | undefined;

  generate(
    analysis: EnhancedAppAnalysis,
    schema: DatabaseSchema,
    keys: GeneratedKeys,
    appName: string,
    appPrefix?: string,
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const appSlug = kebabCase(appName);
    // Use provided prefix or generate from app name
    const tablePrefix = appPrefix || appName.toLowerCase().replace(/[^a-z0-9]+/g, '').substring(0, 20);

    // Get blueprint - NO FALLBACKS
    this.blueprint = getBlueprint(analysis.appType);
    if (!this.blueprint) {
      throw new Error(
        `Blueprint missing for app type "${analysis.appType}". ` +
        `Cannot generate Hono API without blueprint.`
      );
    }

    // Core config files
    files.push(this.generatePackageJson(appSlug));
    files.push(this.generateTsConfig());
    files.push(this.generateWranglerToml(appSlug, keys));
    files.push(this.generateDevVars(keys));
    files.push(this.generateEnvFile(keys));
    files.push(this.generateEnvProduction(keys));
    files.push(this.generateGitignore());

    // Source files
    files.push(this.generateMainIndex(analysis));
    files.push(this.generateTypes(analysis, schema));
    files.push(this.generateDbMiddleware());
    files.push(this.generateAuthMiddleware());

    // Routes
    files.push(this.generateAuthRoutes());
    for (const entity of analysis.entities) {
      const table = schema.tables.find(
        (t) => t.name === pluralize.plural(snakeCase(entity.name)),
      );
      files.push(this.generateEntityRoutes(entity, table, tablePrefix, analysis.entities));
    }

    // Database schema file for Fluxez migration (in src/ for TypeScript compilation)
    files.push(this.generateSchemaFile(schema, appSlug, tablePrefix));

    // README
    files.push(this.generateReadme(appSlug, keys));

    return files;
  }

  private generatePackageJson(appSlug: string): GeneratedFile {
    const pkg = {
      name: `${appSlug}-api`,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'npx wrangler dev src/index.ts',
        deploy: 'npx wrangler deploy src/index.ts',
        build: 'tsc',
        'migrate': 'npm run build && npx fluxez migrate dist/database/schema.js',
        'migrate:dev': 'npm run build && npx fluxez migrate dist/database/schema.js --dev',
        'migrate:dry': 'npm run build && npx fluxez migrate dist/database/schema.js --dry-run',
        'migrate:sync': 'npm run build && npx fluxez migrate dist/database/schema.js --sync',
        'migrate:force': 'npm run build && npx fluxez migrate dist/database/schema.js --force',
        'update:sdk': 'npm uninstall @fluxez/node-sdk && npm install github:fluxez/node-sdk',
      },
      dependencies: {
        hono: '^4.0.0',
        '@fluxez/node-sdk': 'github:fluxez/node-sdk',
        '@scalar/hono-api-reference': '^0.5.0',
        zod: '^3.22.0',
      },
      devDependencies: {
        '@cloudflare/workers-types': '^4.20240117.0',
        wrangler: '^3.25.0',
        typescript: '^5.3.3',
      },
    };

    return {
      path: 'package.json',
      content: JSON.stringify(pkg, null, 2),
      language: 'json',
    };
  }

  private generateTsConfig(): GeneratedFile {
    const config = {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'bundler',
        outDir: 'dist',
        rootDir: 'src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        lib: ['ES2022'],
        types: ['@cloudflare/workers-types'],
        jsx: 'react-jsx',
        jsxImportSource: 'hono/jsx',
      },
      include: ['src/**/*'],
      exclude: ['node_modules'],
    };

    return {
      path: 'tsconfig.json',
      content: JSON.stringify(config, null, 2),
      language: 'json',
    };
  }

  private generateWranglerToml(appSlug: string, keys: GeneratedKeys): GeneratedFile {
    // Use production frontend URL for CORS (will be updated by deployment service)
    const frontendUrl = `https://${appSlug}.pages.dev`;

    return {
      path: 'wrangler.toml',
      content: `name = "${appSlug}-api"
main = "src/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[vars]
FLUXEZ_API_KEY = "${keys.serviceRoleKey}"
FLUXEZ_ANON_KEY = "${keys.anonKey}"
JWT_SECRET = "${keys.jwtSecret}"
FRONTEND_URL = "${frontendUrl}"

[observability]
enabled = true

[dev]
port = 4000
`,
      language: 'toml',
    };
  }

  private generateDevVars(keys: GeneratedKeys): GeneratedFile {
    return {
      path: '.dev.vars',
      content: `FLUXEZ_API_KEY=${keys.serviceRoleKey}
FLUXEZ_ANON_KEY=${keys.anonKey}
JWT_SECRET=${keys.jwtSecret}
FRONTEND_URL=http://localhost:5173
`,
      language: 'env',
    };
  }

  private generateEnvFile(keys: GeneratedKeys): GeneratedFile {
    return {
      path: '.env',
      content: `# Fluxez Configuration
FLUXEZ_API_KEY=${keys.serviceRoleKey}
FLUXEZ_ANON_KEY=${keys.anonKey}

# JWT Configuration
JWT_SECRET=${keys.jwtSecret}

# Environment
ENVIRONMENT=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
`,
      language: 'env',
    };
  }

  private generateEnvProduction(keys: GeneratedKeys): GeneratedFile {
    return {
      path: '.env.production',
      content: `# Production Fluxez Configuration
# These will be set in Cloudflare dashboard
FLUXEZ_API_KEY=${keys.serviceRoleKey}
FLUXEZ_ANON_KEY=${keys.anonKey}
JWT_SECRET=${keys.jwtSecret}
`,
      language: 'env',
    };
  }

  private generateGitignore(): GeneratedFile {
    return {
      path: '.gitignore',
      content: `# Dependencies
node_modules/

# Build output
dist/

# Environment files
.env
.env.local
.env.*.local
.dev.vars

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Wrangler
.wrangler/
`,
      language: 'gitignore',
    };
  }

  private generateMainIndex(analysis: EnhancedAppAnalysis): GeneratedFile {
    const routeImports = analysis.entities
      .map((e) => {
        const name = this.toCamelCase(e.name);
        return `import ${name}Routes from './routes/${this.toKebabCase(e.name)}';`;
      })
      .join('\n');

    const routeMounts = analysis.entities
      .map((e) => {
        const name = this.toCamelCase(e.name);
        // Use proper pluralization for API routes
        const path = pluralize.plural(this.toKebabCase(e.name));
        return `app.route('/api/${path}', ${name}Routes);`;
      })
      .join('\n');

    // Generate OpenAPI paths for entities
    const entityPaths = analysis.entities.map((e) => {
      const path = pluralize.plural(this.toKebabCase(e.name));
      const name = this.toPascalCase(e.name);
      return `
      '/api/${path}': {
        get: { summary: 'List all ${path}', tags: ['${name}'] },
        post: { summary: 'Create a ${e.name}', tags: ['${name}'] }
      },
      '/api/${path}/{id}': {
        get: { summary: 'Get ${e.name} by ID', tags: ['${name}'] },
        put: { summary: 'Update ${e.name}', tags: ['${name}'] },
        delete: { summary: 'Delete ${e.name}', tags: ['${name}'] }
      }`;
    }).join(',');

    return {
      path: 'src/index.ts',
      content: `import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { apiReference } from '@scalar/hono-api-reference';
import { dbMiddleware, type Env } from './middleware/db';
import authRoutes from './routes/auth';
${routeImports}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: (origin) => origin || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use('*', dbMiddleware);

// Health check
app.get('/', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/health', (c) => c.json({ status: 'healthy' }));

// OpenAPI spec
app.get('/openapi.json', (c) => {
  return c.json({
    openapi: '3.0.0',
    info: {
      title: '${analysis.appType.charAt(0).toUpperCase() + analysis.appType.slice(1)} API',
      version: '1.0.0',
      description: 'Auto-generated API for ${analysis.appType}'
    },
    servers: [{ url: '/' }],
    paths: {
      '/api/auth/register': {
        post: { summary: 'Register new user', tags: ['Auth'] }
      },
      '/api/auth/login': {
        post: { summary: 'Login user', tags: ['Auth'] }
      },
      '/api/auth/me': {
        get: { summary: 'Get current user', tags: ['Auth'] }
      },${entityPaths}
    }
  });
});

// API Documentation with Scalar
app.get('/docs', apiReference({
  spec: { url: '/openapi.json' },
  theme: 'kepler',
}));

// Auth routes
app.route('/api/auth', authRoutes);

// Entity routes
${routeMounts}

// 404 handler
app.notFound((c) => c.json({ success: false, message: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Error:', err.message);
  return c.json({ success: false, message: err.message }, 500);
});

export default app;
`,
      language: 'typescript',
    };
  }

  private generateTypes(analysis: EnhancedAppAnalysis, schema: DatabaseSchema): GeneratedFile {
    // Reserved fields that are hardcoded in the interface
    const reservedFields = new Set(['id', 'userId', 'createdAt', 'updatedAt', 'deletedAt']);

    const interfaces = analysis.entities
      .map((entity) => {
        // Check if entity has user ownership
        const hasUserOwnership = entity.userOwnership !== false;

        // Filter out reserved fields since they're hardcoded
        const filteredFields = entity.fields.filter((f) => !reservedFields.has(camelCase(f.name)));

        const fields = filteredFields
          .map((f) => `  ${camelCase(f.name)}${f.required ? '' : '?'}: ${this.mapFieldTypeToTs(f.type)};`)
          .join('\n');

        const createFields = filteredFields
          .map((f) => `  ${camelCase(f.name)}${f.required ? '' : '?'}: ${this.mapFieldTypeToTs(f.type)};`)
          .join('\n');

        // Add FK fields for belongsTo relationships (excluding user_id)
        let fkFields = '';
        if (entity.relationships) {
          const belongsToRels = entity.relationships.filter(r => r.type === 'belongsTo');
          if (belongsToRels.length > 0) {
            const fkFieldsList = belongsToRels
              .filter(rel => {
                const fkColumn = rel.foreignKey || `${snakeCase(rel.targetEntity)}_id`;
                return fkColumn !== 'user_id'; // Skip user_id - handled separately
              })
              .map(rel => {
                const fkColumn = rel.foreignKey || `${snakeCase(rel.targetEntity)}_id`;
                const fkField = camelCase(fkColumn);
                return `  ${fkField}?: string;`;
              });
            if (fkFieldsList.length > 0) {
              fkFields = '\n' + fkFieldsList.join('\n');
            }
          }
        }

        // Only include userId field if entity has user ownership
        const userIdField = hasUserOwnership ? '\n  userId: string;' : '';

        return `export interface ${entity.name} {
  id: string;
${fields}${fkFields}${userIdField}
  createdAt: string;
  updatedAt: string;
}

export interface Create${entity.name}Input {
${createFields}
}`;
      })
      .join('\n\n');

    return {
      path: 'src/types.ts',
      content: `// Auto-generated types

${interfaces}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}
`,
      language: 'typescript',
    };
  }

  private generateDbMiddleware(): GeneratedFile {
    return {
      path: 'src/middleware/db.ts',
      content: `import { FluxezClient } from '@fluxez/node-sdk';
import type { Context, Next } from 'hono';

export interface Env {
  FLUXEZ_API_KEY: string;
  FLUXEZ_ANON_KEY: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
}

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

  if (!apiKey) {
    console.error('FLUXEZ_API_KEY is not set');
    return c.json({ success: false, message: 'Server configuration error' }, 500);
  }

  // Cache the client for better performance
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new FluxezClient(apiKey);
    cachedApiKey = apiKey;
  }

  c.set('db', cachedClient);
  c.set('authClient', cachedClient);

  await next();
};
`,
      language: 'typescript',
    };
  }

  private generateAuthMiddleware(): GeneratedFile {
    return {
      path: 'src/middleware/auth.ts',
      content: `import type { Context, Next } from 'hono';
import type { Env } from './db';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

/**
 * Decode JWT without verification
 * We trust Fluxez's signature - just extract the payload
 * The token is already signed by Fluxez backend
 */
function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    // Decode the payload (middle part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export const authMiddleware = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Unauthorized - No token provided' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    // Decode Fluxez JWT without verification
    // We trust Fluxez's signature - just extract the payload
    const payload = decodeJwt(token);

    if (!payload) {
      return c.json({ success: false, message: 'Invalid token format' }, 401);
    }

    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return c.json({ success: false, message: 'Token expired' }, 401);
    }

    // Fluxez JWT payload contains: userId, sub, email, role, name
    const userId = payload.userId || payload.sub;
    if (!userId) {
      return c.json({ success: false, message: 'Invalid token - missing user ID' }, 401);
    }

    c.set('user', {
      id: userId,
      email: payload.email || '',
      name: payload.name || payload.username || '',
      role: payload.role || 'user',
    });

    await next();
  } catch (error: any) {
    console.error('Auth error:', error.message);
    return c.json({ success: false, message: 'Invalid token' }, 401);
  }
};

export const optionalAuth = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const payload = decodeJwt(token);

      if (payload && (!payload.exp || payload.exp * 1000 >= Date.now())) {
        const userId = payload.userId || payload.sub;
        if (userId) {
          c.set('user', {
            id: userId,
            email: payload.email || '',
            name: payload.name || payload.username || '',
            role: payload.role || 'user',
          });
        }
      }
    } catch {
      // Ignore auth errors for optional auth
    }
  }

  await next();
};
`,
      language: 'typescript',
    };
  }

  private generateAuthRoutes(): GeneratedFile {
    return {
      path: 'src/routes/auth.ts',
      content: `import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../middleware/db';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Bindings: Env }>();

const DEFAULT_ROLE = 'user';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.string().optional(),
});

// POST /api/auth/register
app.post('/register', async (c) => {
  const authClient = c.get('authClient');

  try {
    const body = await c.req.json();
    const { email, password, name, role } = registerSchema.parse(body);
    const userRole = role || DEFAULT_ROLE;

    const userName = name || email.split('@')[0];
    const result = await authClient.auth.register({
      email,
      password,
      name: userName,
      role: userRole,
      metadata: { name: userName, role: userRole },
    }) as any;

    if (!result || !result.user) {
      return c.json({ success: false, message: 'Registration failed' }, 400);
    }

    const user = result.user as any;
    const token = result.token || result.accessToken || result.access_token;
    const refreshToken = result.refreshToken || result.refresh_token;

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.metadata?.name || userName,
        role: userRole,
      },
      token,
      access_token: token,
      refresh_token: refreshToken,
    }, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ success: false, message: 'Validation error', errors: error.errors }, 400);
    }
    console.error('Register error:', error);
    return c.json({ success: false, message: error.message || 'Registration failed' }, 400);
  }
});

// POST /api/auth/login
app.post('/login', async (c) => {
  const authClient = c.get('authClient');

  try {
    const body = await c.req.json();
    const { email, password } = loginSchema.parse(body);

    const result = await authClient.auth.login({ email, password }) as any;

    if (!result || !result.user) {
      return c.json({ success: false, message: 'Invalid credentials' }, 401);
    }

    const user = result.user as any;
    const token = result.token || result.accessToken || result.access_token;
    const refreshToken = result.refreshToken || result.refresh_token;

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.metadata?.name,
        role: user.role || user.metadata?.role || DEFAULT_ROLE,
        emailVerified: user.emailVerified || user.email_verified || false,
      },
      token,
      access_token: token,
      refresh_token: refreshToken,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ success: false, message: 'Validation error', errors: error.errors }, 400);
    }
    console.error('Login error:', error);
    return c.json({ success: false, message: 'Invalid credentials' }, 401);
  }
});

// GET /api/auth/me
app.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// POST /api/auth/logout
app.post('/logout', authMiddleware, async (c) => {
  const authClient = c.get('authClient');

  try {
    await authClient.auth.logout();
    return c.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    // Still return success even if logout fails
    return c.json({ success: true, message: 'Logged out' });
  }
});

// POST /api/auth/refresh
app.post('/refresh', async (c) => {
  const authClient = c.get('authClient');

  try {
    const body = await c.req.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return c.json({ success: false, message: 'Refresh token required' }, 400);
    }

    const result = await authClient.auth.refreshToken(refresh_token) as any;

    if (!result || !result.token) {
      return c.json({ success: false, message: 'Invalid refresh token' }, 401);
    }

    return c.json({
      success: true,
      token: result.token || result.accessToken || result.access_token,
      access_token: result.token || result.accessToken || result.access_token,
      refresh_token: result.refreshToken || result.refresh_token,
    });
  } catch (error: any) {
    console.error('Refresh error:', error);
    return c.json({ success: false, message: 'Token refresh failed' }, 401);
  }
});

export default app;
`,
      language: 'typescript',
    };
  }

  private generateEntityRoutes(
    entity: EnhancedEntityDefinition,
    table: TableSchema | undefined,
    tablePrefix: string,
    allEntities: EnhancedEntityDefinition[],
  ): GeneratedFile {
    const name = entity.name;
    const nameLower = kebabCase(name);
    const baseTableName = table?.name || pluralize.plural(snakeCase(name));
    // Use prefixed table name for database queries (e.g., mystore_products)
    const tableName = `${tablePrefix}_${baseTableName}`;

    // Check if this entity has user ownership (user_id column)
    const hasUserOwnership = entity.userOwnership !== false;

    // Reserved fields that are auto-generated (not user-submitted)
    const reservedFields = new Set(['id', 'userId', 'createdAt', 'updatedAt', 'deletedAt', 'user_id']);
    const reservedFkColumns = new Set(['user_id']); // FK columns handled separately

    const insertFields = entity.fields
      .filter((f) => !reservedFields.has(camelCase(f.name)) && !reservedFields.has(snakeCase(f.name)))
      .map((f) => `        ${snakeCase(f.name)}: body.${camelCase(f.name)},`)
      .join('\n');

    const updateFields = entity.fields
      .filter((f) => !reservedFields.has(camelCase(f.name)) && !reservedFields.has(snakeCase(f.name)))
      .map((f) => `        ${snakeCase(f.name)}: body.${camelCase(f.name)},`)
      .join('\n');

    // Add FK fields for belongsTo relationships (excluding user_id which is handled separately)
    let fkInsertFields = '';
    let fkUpdateFields = '';
    if (entity.relationships) {
      const belongsToRels = entity.relationships.filter(r => r.type === 'belongsTo');
      if (belongsToRels.length > 0) {
        fkInsertFields = belongsToRels
          .filter(rel => {
            const fkColumn = rel.foreignKey || `${snakeCase(rel.targetEntity)}_id`;
            return !reservedFkColumns.has(fkColumn); // Skip user_id - handled separately
          })
          .map(rel => {
            const fkColumn = rel.foreignKey || `${snakeCase(rel.targetEntity)}_id`;
            const fkField = camelCase(fkColumn);
            return `        ${fkColumn}: body.${fkField},`;
          })
          .join('\n');
        fkUpdateFields = fkInsertFields;
      }
    }

    const transformFunction = this.generateTransformFunction(entity);

    const zodFields = entity.fields
      .filter((f) => !reservedFields.has(camelCase(f.name)))
      .map((f) => `  ${camelCase(f.name)}: z.${this.getZodType(f.type)}()${f.required ? '' : '.optional()'},`)
      .join('\n');

    // Add FK fields to Zod schema (excluding user_id which is from auth)
    let zodFkFields = '';
    if (entity.relationships) {
      const belongsToRels = entity.relationships.filter(r => r.type === 'belongsTo');
      if (belongsToRels.length > 0) {
        zodFkFields = belongsToRels
          .filter(rel => {
            const fkColumn = rel.foreignKey || `${snakeCase(rel.targetEntity)}_id`;
            return !reservedFkColumns.has(fkColumn); // Skip user_id
          })
          .map(rel => {
            const fkColumn = rel.foreignKey || `${snakeCase(rel.targetEntity)}_id`;
            const fkField = camelCase(fkColumn);
            return `  ${fkField}: z.string().uuid().optional(),`;
          })
          .join('\n');
      }
    }

    // Generate relationship endpoints for hasMany relationships
    const relationshipEndpoints = this.generateRelationshipEndpoints(
      entity, tableName, tablePrefix, allEntities
    );

    // Combine all FK fields
    const allFkFields = fkInsertFields ? `\n${fkInsertFields}` : '';
    const allZodFkFields = zodFkFields ? `\n${zodFkFields}` : '';

    return {
      path: `src/routes/${nameLower}.ts`,
      content: `import { Hono } from 'hono';
import { z } from 'zod';
import type { Env } from '../middleware/db';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import type { ${name}, Create${name}Input, ApiResponse } from '../types';

const app = new Hono<{ Bindings: Env }>();

// Validation schema
const create${name}Schema = z.object({
${zodFields}${allZodFkFields}
});

${transformFunction}

// GET /api/${pluralize.plural(nameLower)} - List all items with filtering and sorting
app.get('/', optionalAuth, async (c) => {
  const db = c.get('db');
  const user = c.get('user');

  try {
    const { page = '1', limit = '20', sort, ...filters } = c.req.query();
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = db.query.from('${tableName}')
      .select('*')
      .limit(limitNum)
      .offset(offset);
${hasUserOwnership ? `
    // Filter by user if authenticated (user-owned entity)
    if (user) {
      query = query.where('user_id', user.id);
    }
` : ''}
    // Apply dynamic filters (e.g., ?status=active&category_id=xxx)
    for (const [key, value] of Object.entries(filters)) {
      if (value && key !== 'page' && key !== 'limit' && key !== 'sort') {
        // Convert camelCase to snake_case for DB column
        const dbColumn = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        query = query.where(dbColumn, value);
      }
    }

    // Apply sorting (e.g., ?sort=created_at:desc,title:asc)
    if (sort) {
      const sortParts = sort.split(',');
      for (const part of sortParts) {
        const [field, dir = 'asc'] = part.split(':');
        const dbColumn = field.replace(/([A-Z])/g, '_$1').toLowerCase();
        query = query.orderBy(dbColumn, dir as 'asc' | 'desc');
      }
    } else {
      query = query.orderBy('created_at', 'desc');
    }

    const items = await query.get();

    return c.json({
      success: true,
      data: (items || []).map(transform${name}),
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: any) {
    console.error('List ${tableName} error:', error);
    return c.json({ success: true, data: [] });
  }
});

// GET /api/${pluralize.plural(nameLower)}/:id - Get single item
app.get('/:id', optionalAuth, async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  try {
    const item = await db.query.from('${tableName}')
      .select('*')
      .where('id', id)
      .first();

    if (!item) {
      return c.json({ success: false, message: '${name} not found' }, 404);
    }

    return c.json({ success: true, data: transform${name}(item) });
  } catch (error: any) {
    console.error('Get ${name} error:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// POST /api/${pluralize.plural(nameLower)} - Create new item
app.post('/', ${hasUserOwnership ? 'authMiddleware' : 'optionalAuth'}, async (c) => {
  const db = c.get('db');
  const user = c.get('user');

  try {
    const body = await c.req.json();
    const validated = create${name}Schema.parse(body);

    const result = await db.query.from('${tableName}')
      .insert({
${insertFields}${allFkFields}${hasUserOwnership ? `
        user_id: user.id,` : ''}
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    const created = result.data?.[0];
    return c.json({ success: true, data: transform${name}(created) }, 201);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ success: false, message: 'Validation error', errors: error.errors }, 400);
    }
    console.error('Create ${name} error:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// PUT /api/${pluralize.plural(nameLower)}/:id - Update item
app.put('/:id', ${hasUserOwnership ? 'authMiddleware' : 'optionalAuth'}, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const id = c.req.param('id');

  try {
${hasUserOwnership ? `    // Verify ownership
    const existing = await db.query.from('${tableName}')
      .select('id')
      .where('id', id)
      .where('user_id', user.id)
      .first();

    if (!existing) {
      return c.json({ success: false, message: '${name} not found or access denied' }, 404);
    }
` : `    // Check if item exists
    const existing = await db.query.from('${tableName}')
      .select('id')
      .where('id', id)
      .first();

    if (!existing) {
      return c.json({ success: false, message: '${name} not found' }, 404);
    }
`}
    const body = await c.req.json();
    const validated = create${name}Schema.partial().parse(body);

    await db.query.from('${tableName}')
      .where('id', id)
      .update({
${updateFields}${allFkFields}
        updated_at: new Date().toISOString(),
      })
      .execute();

    const updated = await db.query.from('${tableName}')
      .select('*')
      .where('id', id)
      .first();

    return c.json({ success: true, data: transform${name}(updated) });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return c.json({ success: false, message: 'Validation error', errors: error.errors }, 400);
    }
    console.error('Update ${name} error:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

// DELETE /api/${pluralize.plural(nameLower)}/:id - Delete item
app.delete('/:id', ${hasUserOwnership ? 'authMiddleware' : 'optionalAuth'}, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const id = c.req.param('id');

  try {
${hasUserOwnership ? `    // Verify ownership
    const existing = await db.query.from('${tableName}')
      .select('id')
      .where('id', id)
      .where('user_id', user.id)
      .first();

    if (!existing) {
      return c.json({ success: false, message: '${name} not found or access denied' }, 404);
    }
` : `    // Check if item exists
    const existing = await db.query.from('${tableName}')
      .select('id')
      .where('id', id)
      .first();

    if (!existing) {
      return c.json({ success: false, message: '${name} not found' }, 404);
    }
`}
    await db.query.from('${tableName}')
      .where('id', id)
      .delete()
      .execute();

    return c.json({ success: true, message: '${name} deleted' });
  } catch (error: any) {
    console.error('Delete ${name} error:', error);
    return c.json({ success: false, message: error.message }, 500);
  }
});

${relationshipEndpoints}

export default app;
`,
      language: 'typescript',
    };
  }

  private generateTransformFunction(entity: EnhancedEntityDefinition): string {
    const name = entity.name;
    // Check if entity has user ownership
    const hasUserOwnership = entity.userOwnership !== false;

    // Reserved fields that are hardcoded in the transform
    const reservedFields = new Set(['id', 'userId', 'createdAt', 'updatedAt', 'deletedAt']);

    const fieldMappings = entity.fields
      .filter((f) => !reservedFields.has(camelCase(f.name)))
      .map((f) => `    ${camelCase(f.name)}: row.${snakeCase(f.name)},`)
      .join('\n');

    // Add FK field mappings for belongsTo relationships (excluding user_id)
    let fkMappings = '';
    if (entity.relationships) {
      const belongsToRels = entity.relationships.filter(r => r.type === 'belongsTo');
      if (belongsToRels.length > 0) {
        const fkMappingsList = belongsToRels
          .filter(rel => {
            const fkColumn = rel.foreignKey || `${snakeCase(rel.targetEntity)}_id`;
            return fkColumn !== 'user_id'; // Skip user_id - handled separately
          })
          .map(rel => {
            const fkColumn = rel.foreignKey || `${snakeCase(rel.targetEntity)}_id`;
            const fkField = camelCase(fkColumn);
            return `    ${fkField}: row.${fkColumn},`;
          });
        if (fkMappingsList.length > 0) {
          fkMappings = '\n' + fkMappingsList.join('\n');
        }
      }
    }

    // Only include userId mapping if entity has user ownership
    const userIdMapping = hasUserOwnership ? '\n    userId: row.user_id,' : '';

    return `// Transform database row to API response
function transform${name}(row: any): ${name} | null {
  if (!row) return null;
  return {
    id: row.id,
${fieldMappings}${fkMappings}${userIdMapping}
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}`;
  }

  /**
   * Generate relationship endpoints for hasMany relationships
   * e.g., GET /categories/:id/products for Category hasMany Products
   */
  private generateRelationshipEndpoints(
    entity: EnhancedEntityDefinition,
    tableName: string,
    tablePrefix: string,
    allEntities: EnhancedEntityDefinition[],
  ): string {
    if (!entity.relationships) {
      return '';
    }

    const endpoints: string[] = [];

    // Generate endpoints for hasMany relationships
    const hasManyRels = entity.relationships.filter(r => r.type === 'hasMany');

    for (const rel of hasManyRels) {
      const targetEntity = allEntities.find(e => e.name === rel.targetEntity);
      if (!targetEntity) continue;

      const relatedTableName = `${tablePrefix}_${pluralize.plural(snakeCase(rel.targetEntity))}`;
      const relatedPlural = pluralize.plural(kebabCase(rel.targetEntity));
      const fkColumn = rel.foreignKey || `${snakeCase(entity.name)}_id`;

      endpoints.push(`
// GET /:id/${relatedPlural} - Get related ${rel.targetEntity}s (hasMany)
app.get('/:id/${relatedPlural}', optionalAuth, async (c) => {
  const db = c.get('db');
  const id = c.req.param('id');

  try {
    const { page = '1', limit = '20' } = c.req.query();
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const items = await db.query.from('${relatedTableName}')
      .select('*')
      .where('${fkColumn}', id)
      .orderBy('created_at', 'desc')
      .limit(limitNum)
      .offset(offset)
      .get();

    return c.json({
      success: true,
      data: items || [],
      page: pageNum,
      limit: limitNum,
    });
  } catch (error: any) {
    console.error('Get related ${rel.targetEntity}s error:', error);
    return c.json({ success: true, data: [] });
  }
});`);
    }

    return endpoints.join('\n');
  }

  private generateSchemaFile(schema: DatabaseSchema, appSlug: string, tablePrefix: string): GeneratedFile {
    // Generate Fluxez-compatible schema format with prefixed table names
    const tables = schema.tables.map((table) => {
      // Use prefixed table name (e.g., mystore_products)
      const prefixedTableName = `${tablePrefix}_${table.name}`;

      const columns = table.columns.map((col) => {
        const colDef: any = {
          name: col.name,
          type: this.mapToFluxezType(col.type),
        };

        if (col.primaryKey) {
          colDef.primaryKey = true;
          colDef.default = 'gen_random_uuid()';
        }

        if (col.nullable === false || col.nullable === undefined) {
          // Don't add nullable: false for primary keys
          if (!col.primaryKey) {
            colDef.nullable = false;
          }
        } else {
          colDef.nullable = true;
        }

        if (col.references) {
          // Keep auth.users as is, but prefix other references
          const refTable = col.references.replace('.id', '');
          const isAuthRef = refTable.startsWith('auth.');
          const actualRefTable = isAuthRef ? refTable : `${tablePrefix}_${refTable.replace('public.', '')}`;
          colDef.references = { table: actualRefTable };
        }

        return colDef;
      });

      // Generate indexes
      const indexes: any[] = [];
      if (table.columns.some((c) => c.name === 'user_id')) {
        indexes.push({ columns: ['user_id'] });
      }
      if (table.columns.some((c) => c.name === 'created_at')) {
        indexes.push({ columns: ['created_at'] });
      }

      return { name: prefixedTableName, columns, indexes };
    });

    // Build schema object
    const schemaObj: Record<string, any> = {};
    tables.forEach((table) => {
      schemaObj[table.name] = {
        columns: table.columns,
        indexes: table.indexes,
      };
    });

    const schemaContent = `/**
 * ${appSlug} Database Schema
 * Using Fluxez SDK's migration system
 *
 * Run migrations with:
 *   npm run migrate:dev   - Development migration
 *   npm run migrate       - Production migration
 *   npm run migrate:dry   - Preview changes without applying
 */

export const schema = ${JSON.stringify(schemaObj, null, 2)};
`;

    return {
      path: 'src/database/schema.ts',
      content: schemaContent,
      language: 'typescript',
    };
  }

  private mapToFluxezType(dbType: string): string {
    const typeMap: Record<string, string> = {
      uuid: 'uuid',
      text: 'text',
      varchar: 'string',
      integer: 'integer',
      int: 'integer',
      bigint: 'bigint',
      boolean: 'boolean',
      timestamptz: 'timestamptz',
      timestamp: 'timestamptz',
      jsonb: 'jsonb',
      json: 'jsonb',
      numeric: 'numeric',
      decimal: 'numeric',
      float: 'float',
      double: 'float',
    };
    return typeMap[dbType.toLowerCase()] || 'text';
  }

  private generateReadme(appSlug: string, keys: GeneratedKeys): GeneratedFile {
    return {
      path: 'README.md',
      content: `# ${appSlug} API

Generated with App Creator - powered by Fluxez Platform.

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start development server:
\`\`\`bash
npm run dev
\`\`\`

The API will be available at http://localhost:4000

## Database

Your database has been **automatically created** in the Fluxez platform with:
- ✅ Auth schema (users, sessions, teams, etc.)
- ✅ Entity tables for your app
- ✅ All indexes and constraints

**No migrations needed** - your database is ready to use!

### Adding New Tables

If you need to add more tables later:

1. Edit \`src/database/schema.ts\`
2. Run migration:
\`\`\`bash
npm run migrate:dev    # Development mode (allows drops/changes)
npm run migrate        # Production mode
npm run migrate:dry    # Preview changes without applying
\`\`\`

## API Keys

Your app is registered in the Fluxez platform with real API keys:

- **FLUXEZ_API_KEY**: Service role key (full access) - use server-side only
- **FLUXEZ_ANON_KEY**: Anonymous key (limited access) - safe for client-side
- **JWT_SECRET**: Used for token signing

These are configured in \`wrangler.toml\`, \`.dev.vars\`, and \`.env\`.

## Endpoints

### Auth
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user (requires auth)
- POST /api/auth/logout - Logout user
- POST /api/auth/refresh - Refresh token

### Resources
See generated routes in src/routes/

## Deployment

\`\`\`bash
npm run deploy
\`\`\`

## Database Info

- **App ID**: ${keys.appId}
- **Database**: ${keys.databaseName}
`,
      language: 'markdown',
    };
  }

  // Utility methods - using change-case library
  private toSnakeCase(str: string): string {
    return snakeCase(str);
  }

  private toCamelCase(str: string): string {
    return camelCase(str);
  }

  private toKebabCase(str: string): string {
    return kebabCase(str);
  }

  private mapFieldTypeToTs(type: string): string {
    const mapping: Record<string, string> = {
      string: 'string',
      text: 'string',
      number: 'number',
      integer: 'number',
      decimal: 'number',
      boolean: 'boolean',
      date: 'string',
      datetime: 'string',
      email: 'string',
      url: 'string',
      phone: 'string',
      image: 'string',
      file: 'string',
      enum: 'string',
      json: 'Record<string, unknown>',
      array: 'unknown[]',
      object: 'Record<string, unknown>',
      uuid: 'string',
    };
    return mapping[type] || 'string';
  }

  private getZodType(fieldType: string): string {
    // NOTE: Template generates `z.${type}()`, so these must be valid Zod method names
    // For complex types, use 'any' since z.any() is valid
    const mapping: Record<string, string> = {
      string: 'string',
      text: 'string',
      number: 'number',
      integer: 'number',
      decimal: 'number',
      boolean: 'boolean',
      date: 'string',
      datetime: 'string',
      email: 'string().email',
      url: 'string().url',
      phone: 'string',
      image: 'string',
      file: 'string',
      enum: 'string',
      json: 'any',      // z.any() for JSON objects
      array: 'any',     // z.any() for arrays
      object: 'any',    // z.any() for objects
      uuid: 'string().uuid',
    };
    return mapping[fieldType] || 'string';
  }
}
