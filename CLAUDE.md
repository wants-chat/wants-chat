# Wants AI Development Guide

This document provides the definitive patterns and best practices for developing on the Wants AI platform. All code in this repository should follow these patterns.

## Project Overview

**Wants AI** is an intent-driven AI platform that renders contextual user interfaces based on user intent. Unlike traditional chatbots that only generate text, Wants AI detects what users want to accomplish and dynamically renders the appropriate UI.

### Key Stats
- **1100+ Tools** - Across all industries and use cases
- **30+ AI Models** - GPT-4, Claude, Gemini, Llama, Mistral, and more
- **100+ Integrations** - Connect with popular services

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, shadcn/ui, Framer Motion
- **Backend**: NestJS, Supabase, Socket.io
- **AI**: Multi-provider unified API with streaming support

---

## Table of Contents

1. [Pricing Configuration](#pricing-configuration)
2. [Database Query Patterns](#database-query-patterns)
3. [Backend Route Patterns](#backend-route-patterns)
4. [Authentication Patterns](#authentication-patterns)
5. [Data Transformation](#data-transformation)
6. [Error Handling](#error-handling)
7. [Frontend API Patterns](#frontend-api-patterns)
8. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

---

## Pricing Configuration

All pricing, plans, and FAQ content is centralized in `/frontend/src/config/pricing.ts`.

### Updating Pricing
To change pricing, features, or FAQ:
1. Edit `/frontend/src/config/pricing.ts`
2. Changes automatically reflect across all pages

### Current Plans
| Plan | Price | AI Models | Key Features |
|------|-------|-----------|--------------|
| Free | $0 | Gemini 2.0 Flash only | 3 AI messages/day, 100+ tools, 3 pins |
| Pro | $19.99/mo | All 30+ models | 2,500 messages, 100 images, 10 videos |
| Team | $49.99/mo | All 30+ models | Unlimited AI, 5 team members, API |
| Enterprise | $149.99/mo | All + custom | Unlimited everything, SSO, dedicated support |

**Important**: Free users only have access to Gemini 2.0 Flash, not all AI models.

---

## Database Query Patterns

### Query Methods Overview

| Method | Returns | Use Case |
|--------|---------|----------|
| `.get()` | `T[]` | SELECT queries returning multiple rows |
| `.first()` | `T \| null` | SELECT queries returning single row |
| `.execute()` | `QueryResult<T>` | INSERT/UPDATE/DELETE operations |

### SELECT Queries

```typescript
// ✅ CORRECT - Get multiple rows
const items = await db.query.from('table_name')
  .select('*')
  .where('status', 'active')
  .orderBy('created_at', 'desc')
  .limit(20)
  .get();

// ✅ CORRECT - Get single row
const item = await db.query.from('table_name')
  .select('*')
  .where('id', itemId)
  .first();

// ❌ WRONG - Don't use execute() for SELECT
const items = await db.query.from('table_name')
  .select('*')
  .execute(); // Returns QueryResult, not array!
```

### WHERE Clauses

```typescript
// ✅ CORRECT - Simple equality
.where('column', value)

// ✅ CORRECT - With operator
.where('column', '>', value)
.where('column', 'LIKE', '%pattern%')
```

### INSERT/UPDATE/DELETE

```typescript
// INSERT with returning
const result = await db.query.from('table_name')
  .insert({ column1: value1, created_at: new Date().toISOString() })
  .returning('*')
  .execute();
const insertedRow = result.data?.[0] ?? null;

// UPDATE
await db.query.from('table_name')
  .where('id', itemId)
  .update({ column1: newValue, updated_at: new Date().toISOString() })
  .execute();

// DELETE
await db.query.from('table_name')
  .where('id', itemId)
  .delete()
  .execute();
```

---

## Backend Route Patterns

### Basic Route Structure

```typescript
import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';

const app = new Hono();

// Public route
app.get('/', async (c) => {
  const db = c.get('db');
  // ... query logic
});

// Protected route
app.get('/me', authMiddleware, async (c) => {
  const db = c.get('db');
  const user = c.get('user');
  const userId = user.userId || user.id || user.sub;
  // ... query logic
});

export default app;
```

### Standard CRUD Patterns

See the full backend guide in the codebase for complete examples of:
- List endpoints with pagination
- Single item endpoints
- Create endpoints with validation
- Update endpoints with ownership verification
- Delete endpoints with ownership verification

---

## Authentication Patterns

### Getting User ID

```typescript
// Always handle multiple possible user ID fields
const user = c.get('user');
const userId = user.userId || user.id || user.sub;
```

### Auth Middleware

```typescript
export const authMiddleware = async (c: Context, next: Next) => {
  const auth = c.get('auth');
  if (!auth) return c.json({ success: false, message: 'Unauthorized' }, 401);

  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ success: false, message: 'Invalid token' }, 401);
    }
    const token = authHeader.substring(7);
    const user = await auth.verifyToken(token);
    if (!user) return c.json({ success: false, message: 'Invalid token' }, 401);
    c.set('user', user);
    await next();
  } catch (error) {
    return c.json({ success: false, message: 'Authentication failed' }, 401);
  }
};
```

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

```typescript
try {
  // ... query logic
} catch (error: any) {
  console.error('Operation error:', error);
  // For list endpoints - return empty array
  return c.json([]);
  // For single item endpoints - return error object
  return c.json({ success: false, message: error.message }, 500);
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

1. **Using execute() for SELECT queries** - Use `.get()` or `.first()` instead
2. **Not transforming data for frontend** - Always convert snake_case to camelCase
3. **Not handling JSON fields** - Parse JSON strings from database
4. **Inconsistent user ID extraction** - Always use `user.userId || user.id || user.sub`
5. **Not verifying ownership** - Check ownership before update/delete operations
6. **Hardcoding pricing** - Use `/frontend/src/config/pricing.ts`

---

## File Structure

```
wants/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── landing/      # Landing page sections
│   │   │   ├── tools/        # 1100+ tool components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── pages/            # Page components
│   │   ├── config/           # Configuration (pricing, SEO)
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
db.query.from('table').select('*').get()

// Get single row
db.query.from('table').where('id', id).first()

// Insert
const result = await db.query.from('table').insert(data).returning('*').execute()
const row = result.data?.[0]

// Update
db.query.from('table').where('id', id).update(data).execute()

// Delete
db.query.from('table').where('id', id).delete().execute()
```

### Response Formats

```typescript
c.json({ success: true, data: item })        // Success with data
c.json({ success: true, message: 'Done' })   // Success with message
c.json({ success: false, message: '...' }, 404)  // Error
c.json(items)                                 // List endpoint
```
