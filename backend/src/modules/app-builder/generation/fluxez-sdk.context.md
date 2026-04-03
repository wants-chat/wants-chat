# Fluxez SDK Capabilities Reference

This document describes all capabilities of the @fluxez/node-sdk that can be used in generated applications.

## SDK Initialization

```typescript
import { FluxezClient } from '@fluxez/node-sdk';

// Initialize in Cloudflare Workers
const fluxez = FluxezClient.fromCloudflareBindings(env);
```

## 1. Database (db)

Query builder for database operations.

### Query Methods
```typescript
// SELECT - get multiple rows
const items = await db.query.from('table_name')
  .select('*')
  .where('status', 'active')
  .orderBy('created_at', 'desc')
  .limit(20)
  .get();

// SELECT - get single row
const item = await db.query.from('table_name')
  .where('id', itemId)
  .first();

// INSERT
const result = await db.query.from('table_name')
  .insert({ column1: value1, column2: value2, created_at: new Date().toISOString() })
  .returning('*')
  .execute();
const insertedRow = result.data?.[0];

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

// COUNT
const count = await db.query.from('table_name').where('status', 'active').count();

// EXISTS
const exists = await db.query.from('table_name').where('email', email).exists();
```

### Where Clause Operators
- `.where('column', value)` - Equality (default)
- `.where('column', '>', value)` - Greater than
- `.where('column', '<', value)` - Less than
- `.where('column', '!=', value)` - Not equal
- `.where('column', 'LIKE', '%pattern%')` - Pattern matching

## 2. Authentication (auth)

User authentication and management.

```typescript
// Register new user
const result = await auth.register({
  email: 'user@example.com',
  password: 'password123',
  name: 'User Name', // optional
});

// Login
const result = await auth.login({
  email: 'user@example.com',
  password: 'password123',
});
// Returns: { token: string, user: UserObject }

// Verify JWT token
const user = await auth.verifyToken(token);
// Returns: { userId: string, email: string, name?: string }

// Get user by ID
const user = await auth.getUser(userId);

// Update user
await auth.updateUser(userId, { name: 'New Name' });

// Reset password request
await auth.requestPasswordReset(email);

// Reset password
await auth.resetPassword(token, newPassword);
```

## 3. Storage

File storage for images, documents, and other files.

```typescript
// Upload file
const result = await storage.upload(file, {
  folder: 'uploads',
  public: true, // optional, makes file publicly accessible
});
// Returns: { key: string, url: string, size: number }

// Get signed URL for private files
const url = await storage.getSignedUrl(key, { expiresIn: 3600 });

// Delete file
await storage.delete(key);

// List files
const files = await storage.list({ folder: 'uploads', limit: 100 });
```

## 4. Payment (Stripe)

Stripe payment processing.

```typescript
// Create checkout session
const session = await payment.createCheckoutSession({
  priceId: 'price_xxx',
  successUrl: 'https://app.com/success',
  cancelUrl: 'https://app.com/cancel',
  customerId: 'cus_xxx', // optional
  metadata: { orderId: '123' }, // optional
});
// Returns: { sessionId: string, url: string }

// Handle webhook
const event = await payment.handleWebhook(request, webhookSecret);

// Get customer
const customer = await payment.getCustomer(customerId);

// Create customer
const customer = await payment.createCustomer({
  email: 'user@example.com',
  name: 'User Name',
});

// Create subscription
const subscription = await payment.createSubscription({
  customerId: 'cus_xxx',
  priceId: 'price_xxx',
});

// Cancel subscription
await payment.cancelSubscription(subscriptionId);

// Get subscription
const subscription = await payment.getSubscription(subscriptionId);
```

## 5. Email

Send transactional emails.

```typescript
// Send single email
await email.send({
  to: 'user@example.com',
  from: 'noreply@yourapp.com',
  subject: 'Welcome!',
  html: '<h1>Hello</h1><p>Welcome to our app!</p>',
  text: 'Hello, Welcome to our app!', // optional plain text version
});

// Send bulk emails
await email.sendBulk([
  { to: 'user1@example.com', subject: 'Update', html: '...' },
  { to: 'user2@example.com', subject: 'Update', html: '...' },
]);

// Send with template
await email.sendTemplate({
  to: 'user@example.com',
  templateId: 'welcome-email',
  data: { name: 'John', verifyUrl: '...' },
});
```

## 6. Push Notifications

Send push notifications to mobile and web.

```typescript
// Send to single device
await push.send({
  token: 'device_token',
  title: 'New Message',
  body: 'You have a new message!',
  data: { messageId: '123' }, // optional custom data
});

// Send to topic
await push.sendToTopic({
  topic: 'news',
  title: 'Breaking News',
  body: 'Important update...',
});

// Send to multiple devices
await push.sendMulticast({
  tokens: ['token1', 'token2'],
  title: 'Announcement',
  body: 'New feature available!',
});

// Subscribe to topic
await push.subscribeToTopic(token, 'news');

// Unsubscribe from topic
await push.unsubscribeFromTopic(token, 'news');
```

## 7. Realtime (WebSockets)

Real-time pub/sub messaging.

```typescript
// Publish to channel
await realtime.publish('channel-name', {
  type: 'message',
  data: { text: 'Hello!' },
});

// Subscribe (frontend)
const channel = realtime.subscribe('channel-name');
channel.on('message', (data) => {
  console.log('Received:', data);
});

// Presence (show online users)
await realtime.presence.track('room-id', { userId, name, avatar });
const members = await realtime.presence.get('room-id');

// Private channels (authenticated users only)
await realtime.publish('private-user-123', { ... });
```

## 8. AI

AI/LLM capabilities.

```typescript
// Text generation
const result = await ai.generate({
  prompt: 'Write a product description for...',
  maxTokens: 500,
  temperature: 0.7,
});
// Returns: { content: string, usage: { tokens: number } }

// Chat completion
const result = await ai.chat({
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What is TypeScript?' },
  ],
  maxTokens: 500,
});

// Embeddings
const embeddings = await ai.embed({
  text: 'Document content...',
});
// Returns: { embedding: number[] }

// Vision (analyze images)
const result = await ai.vision({
  imageUrl: 'https://...',
  prompt: 'Describe this image',
});
```

## 9. Vector Database

Semantic search and embeddings storage.

```typescript
// Upsert vectors
await vector.upsert({
  namespace: 'documents',
  vectors: [
    { id: 'doc-1', values: [...embedding], metadata: { title: 'Doc 1' } },
    { id: 'doc-2', values: [...embedding], metadata: { title: 'Doc 2' } },
  ],
});

// Search by vector
const results = await vector.search({
  namespace: 'documents',
  vector: [...queryEmbedding],
  topK: 10,
  filter: { category: 'tech' }, // optional
});
// Returns: [{ id, score, metadata }]

// Delete vectors
await vector.delete({
  namespace: 'documents',
  ids: ['doc-1', 'doc-2'],
});

// Fetch by IDs
const vectors = await vector.fetch({
  namespace: 'documents',
  ids: ['doc-1'],
});
```

## 10. Unified Search

Full-text and semantic search across data.

```typescript
// Full-text search
const results = await search.search({
  index: 'products',
  query: 'wireless headphones',
  filters: { category: 'electronics' },
  limit: 20,
});

// Index document
await search.index({
  index: 'products',
  id: 'prod-123',
  document: {
    title: 'Wireless Headphones',
    description: 'High-quality...',
    category: 'electronics',
  },
});

// Delete from index
await search.delete({
  index: 'products',
  id: 'prod-123',
});

// Semantic search
const results = await search.semanticSearch({
  index: 'knowledge-base',
  query: 'How do I reset my password?',
  limit: 5,
});
```

## 11. Cache (KV Store)

Key-value caching.

```typescript
// Set value
await cache.set('key', { data: 'value' }, { ttl: 3600 }); // TTL in seconds

// Get value
const value = await cache.get('key');

// Delete
await cache.delete('key');

// Check existence
const exists = await cache.has('key');

// Get with default
const value = await cache.getOrSet('key', async () => {
  // Compute expensive value
  return computeValue();
}, { ttl: 3600 });
```

## 12. Queue

Background job processing.

```typescript
// Enqueue job
await queue.enqueue('email-queue', {
  type: 'send-welcome-email',
  data: { userId: '123', email: 'user@example.com' },
});

// Process jobs (in worker)
queue.process('email-queue', async (job) => {
  const { type, data } = job;
  // Handle job...
});

// Schedule job
await queue.schedule('reminders', {
  type: 'send-reminder',
  data: { userId: '123' },
}, { delay: 3600000 }); // 1 hour delay
```

## 13. Feature Flags

Feature management.

```typescript
// Check flag
const isEnabled = await features.isEnabled('new-dashboard', {
  userId: '123',
  email: 'user@example.com',
});

// Get flag value
const value = await features.getValue('max-uploads', {
  userId: '123',
  default: 10,
});
```

## Common Patterns

### Auth Middleware Pattern
```typescript
export const authMiddleware = async (c: Context, next: Next) => {
  const auth = c.get('auth');
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  const user = await auth.verifyToken(token);

  if (!user) {
    return c.json({ success: false, message: 'Invalid token' }, 401);
  }

  c.set('user', user);
  await next();
};
```

### Getting User ID in Routes
```typescript
// In a protected route
const user = c.get('user');
const userId = user.userId || user.id || user.sub;
```

### Data Transformation (snake_case to camelCase)
```typescript
function transformItem(item: any) {
  return {
    id: item.id,
    title: item.title,
    userId: item.user_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}
```

## Notes for Code Generation

1. Always use `.get()` or `.first()` for SELECT queries, never `.execute()` for SELECTs
2. Use `.execute()` only for INSERT/UPDATE/DELETE operations
3. Database columns use snake_case, transform to camelCase for API responses
4. Always validate JWT tokens for protected routes
5. Return arrays directly for list endpoints, objects for single items
6. Use `result.data?.[0]` to access inserted rows from INSERT...RETURNING
