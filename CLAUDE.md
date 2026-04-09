# Wants AI Development Guide

This document provides the definitive patterns and best practices for developing on the Wants AI platform. All code in this repository should follow these patterns.

## Project Overview

**Wants AI** is an intent-driven AI platform that renders contextual user interfaces based on user intent. Unlike traditional chatbots that only generate text, Wants AI detects what users want to accomplish and dynamically renders the appropriate UI.

### Key Stats
- **1,100+ Tools** - Across all industries and use cases
- **30+ AI Models** - GPT-4, Claude, Gemini, Llama, Mistral, and more
- **100+ Integrations** - Connect with popular services

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion
- **Backend**: NestJS, raw `pg` (PostgreSQL), Redis, Socket.io
- **AI**: Multi-provider unified API (OpenRouter) with streaming support

---

## Table of Contents

1. [Database Query Patterns](#database-query-patterns)
2. [Backend Route Patterns](#backend-route-patterns)
3. [Authentication Patterns](#authentication-patterns)
4. [Data Transformation](#data-transformation)
5. [Error Handling](#error-handling)
6. [Frontend API Patterns](#frontend-api-patterns)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## Database Query Patterns

The backend uses a `DatabaseService` that wraps the raw `pg` Pool. Inject it into any NestJS service via the constructor. The full implementation lives in `backend/src/modules/database/database.service.ts`.

### Methods

| Method | Returns | Use Case |
|--------|---------|----------|
| `db.query<T>(sql, params?)` | `QueryResult<T>` (`{ rows, rowCount, command }`) | Raw parameterized SQL — use for anything non-trivial |
| `db.findOne<T>(table, conditions)` | `T \| null` | Single row by equality conditions |
| `db.findMany<T>(table, conditions?, options?)` | `T[]` | Multiple rows; `options` supports `orderBy`, `order`, `limit`, `offset` |
| `db.insert<T>(table, data)` | `T` | Inserts and returns the row (`RETURNING *`) |
| `db.update<T>(table, conditions, data)` | `T[]` | Updates matching rows and returns them |
| `db.transaction<T>(callback)` | `T` | Wraps `BEGIN`/`COMMIT`/`ROLLBACK` around a `PoolClient` |

### Examples

```typescript
// SELECT one
const user = await this.db.findOne<User>('users', { id: userId });

// SELECT many with sort/limit
const items = await this.db.findMany('tools', { status: 'active' }, {
  orderBy: 'created_at',
  order: 'DESC',
  limit: 20,
});

// INSERT (returns the inserted row)
const created = await this.db.insert('tools', {
  name: 'BMI Calculator',
  user_id: userId,
  created_at: new Date(),
});

// UPDATE
const [updated] = await this.db.update(
  'tools',
  { id: toolId },
  { name: newName, updated_at: new Date() },
);

// Raw SQL for joins, aggregates, JSONB ops, etc.
const result = await this.db.query<{ count: string }>(
  'SELECT COUNT(*) AS count FROM tools WHERE user_id = $1',
  [userId],
);
const total = parseInt(result.rows[0].count, 10);
```

---

## Backend Route Patterns

Routes are NestJS controllers. There is no Hono in the platform backend — `hono` only appears in `app-creator/templates/` because that's the framework the **generated** user apps use.

### Basic Controller Structure

```typescript
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ToolsService } from './tools.service';

@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  // Public route
  @Get()
  async list() {
    return this.toolsService.findAll();
  }

  // Protected route
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async listMine(@Req() req: any) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.toolsService.findByUser(userId);
  }
}
```

The matching service injects `DatabaseService`:

```typescript
@Injectable()
export class ToolsService {
  constructor(private readonly db: DatabaseService) {}

  findByUser(userId: string) {
    return this.db.findMany('tools', { user_id: userId }, { orderBy: 'created_at', order: 'DESC' });
  }
}
```

---

## Authentication Patterns

### Getting User ID in a Controller

```typescript
// JwtAuthGuard attaches the decoded JWT payload to req.user.
// Always handle multiple possible user ID fields for forward compatibility.
const userId = req.user.userId || req.user.id || req.user.sub;
```

### Protecting a Route

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
async profile(@Req() req: any) { ... }
```

The guard implementation lives in `backend/src/modules/auth/`. Use it via `@UseGuards(JwtAuthGuard)` — do not write per-route token-parsing code.

---

## Data Transformation

Database uses snake_case, frontend expects camelCase.

```typescript
function transformItem(item: any) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    userId: item.user_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}
```

### Common Field Mappings

| Database | Frontend |
|----------|----------|
| `user_id` | `userId` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `is_active` | `isActive` |

---

## Error Handling

Let NestJS surface errors via exceptions — don't swallow them into `{ success: false }` payloads. The global exception filter turns thrown HTTP exceptions into the right status codes.

```typescript
async findOne(id: string) {
  const tool = await this.db.findOne('tools', { id });
  if (!tool) throw new NotFoundException('Tool not found');
  return this.transform(tool);
}

async listForUser(userId: string) {
  try {
    return await this.db.findMany('tools', { user_id: userId });
  } catch (error) {
    this.logger.error('Failed to list tools', error);
    throw new InternalServerErrorException();
  }
}
```

---

## Frontend API Patterns

### API Client

```typescript
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: any) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: any) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
};
```

### React Query

```typescript
export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: () => api.get<Item[]>('/items'),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateItemInput) => api.post<Item>('/items', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });
}
```

---

## Common Mistakes to Avoid

1. **Reaching for `db.query.from(...)` builder syntax** - That API only exists in `app-creator/templates/` (code we *generate* for user apps). The platform backend uses `db.findOne` / `db.findMany` / `db.insert` / `db.update` / raw `db.query(sql, params)`.
2. **Writing Hono-style controllers** - The platform backend is NestJS. Use `@Controller`, `@Get`, `@UseGuards`, etc.
3. **Not transforming data for frontend** - Always convert `snake_case` to `camelCase` before returning.
4. **Not handling JSON fields** - Parse JSON strings from the database when columns are `jsonb` text.
5. **Inconsistent user ID extraction** - Always use `req.user.userId || req.user.id || req.user.sub`.
6. **Not verifying ownership** - Check ownership before update/delete operations.

---

## File Structure

```
wants/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── landing/      # Landing page sections
│   │   │   ├── tools/        # 1,100+ tool components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── pages/            # Page components
│   │   ├── config/           # Configuration (SEO, etc.)
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── data/             # Static data (tools, categories)
│   │   └── lib/              # Utilities
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── modules/          # NestJS modules
│   │   └── main.ts           # Entry point
│   └── package.json
└── CLAUDE.md                 # This file
```

---

## Quick Reference

```typescript
// Get all rows
await this.db.findMany('tools', { status: 'active' });

// Get single row
await this.db.findOne('tools', { id });

// Insert (returns the created row)
await this.db.insert('tools', { name, user_id: userId });

// Update (returns the updated rows)
await this.db.update('tools', { id }, { name, updated_at: new Date() });

// Delete
await this.db.query('DELETE FROM tools WHERE id = $1', [id]);
```

### Response Formats

NestJS controllers return plain objects/arrays — Nest serializes them to JSON automatically. Use HTTP status codes via `@HttpCode()` or thrown exceptions (`NotFoundException`, `UnauthorizedException`, etc.) rather than wrapping every response in `{ success, data }`.

```typescript
return item;                                     // 200 with the item
return [];                                       // 200 with empty list
throw new NotFoundException('Tool not found');   // 404
throw new UnauthorizedException();               // 401
```
