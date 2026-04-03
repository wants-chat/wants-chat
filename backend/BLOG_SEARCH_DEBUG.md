# Blog Search Debugging Guide

## Issue
Blog search returns all data instead of filtered results.

## Debugging Steps Added

1. **Blog Service Logging**:
   - Logs search query when provided
   - Logs the complete where conditions being sent to Fluxez
   - Logs the number of posts found

2. **Fluxez Service Logging**:
   - Logs conditions being applied in `select` method
   - Logs conditions being applied in `findMany` method

## Fixed Code

Updated the Fluxez service to properly handle `$or` conditions with operators like `$ilike`. The previous implementation wasn't correctly processing operators within OR conditions.

### What Was Changed:

In `fluxez.service.ts`, the OR condition handler now properly processes operators:

```typescript
// Before: Would treat { title: { $ilike: '%search%' } } as equality
qb.where(orKey, orValue);

// After: Properly handles operators within OR conditions
if (typeof orValue === 'object' && orValue !== null) {
  // Handle operators like $ilike, $like, etc.
  Object.entries(orValue).forEach(([op, val]) => {
    switch (op) {
      case '$ilike':
        qb.ilike(orKey, val);
        break;
      // ... other operators
    }
  });
}
```

## Testing the Fix

1. **Make a search request**:
   ```bash
   GET /api/v1/blog/posts?search=test
   ```

2. **Check console logs** for:
   ```
   [Blog Service] Search query: test
   [Blog Service] Where conditions: {
     "status": "published",
     "$or": [
       { "title": { "$ilike": "%test%" } },
       { "content": { "$ilike": "%test%" } },
       { "excerpt": { "$ilike": "%test%" } }
     ]
   }
   [Fluxez] Applying conditions to blog_posts: ...
   [Blog Service] Found posts: X
   ```

## Common Issues

### 1. Case Sensitivity
The search uses `$ilike` for case-insensitive search. If the database doesn't support `ilike`, it might fall back to case-sensitive search.

### 2. Empty Results vs All Results
- **Empty results**: Search is working but no matches found
- **All results**: Search conditions not being applied properly

### 3. Status Filter
By default, non-authenticated users only see published posts. Make sure test posts are published.

## Alternative Search Implementation

If the current implementation still doesn't work, here's an alternative approach using raw SQL:

```typescript
// In blog.service.ts
if (filters.search) {
  // Use raw SQL for search
  const searchResults = await this.fluxez.client
    .table('blog_posts')
    .select('*')
    .whereRaw(
      `(LOWER(title) LIKE LOWER(?) OR LOWER(content) LIKE LOWER(?) OR LOWER(excerpt) LIKE LOWER(?))`,
      [`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`]
    )
    .execute();
  
  // Use the IDs from search results
  if (searchResults.data && searchResults.data.length > 0) {
    whereConditions.id = { $in: searchResults.data.map(p => p.id) };
  } else {
    // No results found
    return { data: [], total: 0, page, limit, total_pages: 0 };
  }
}
```

## Verification Steps

1. Create a blog post with a unique title/content
2. Search for a unique word from that post
3. Verify only that post is returned
4. Search for a non-existent word
5. Verify empty results (not all posts)

## Expected Behavior

- Search for "test" → Returns only posts containing "test" in title, content, or excerpt
- Search for "xyz123" (non-existent) → Returns empty array, not all posts
- No search parameter → Returns all (published) posts