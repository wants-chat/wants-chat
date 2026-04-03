import { Blueprint } from './blueprint.interface';

/**
 * Blog App Blueprint
 *
 * Defines the structure for a blog/CMS application:
 * - Posts with categories and tags
 * - Comments system
 * - Author profiles
 * - Search and filtering
 */
export const blogBlueprint: Blueprint = {
  appType: 'blog',
  description: 'Blog or CMS with posts, categories, tags, and comments',

  coreEntities: ['post', 'category', 'tag', 'comment', 'author'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Public Pages
    {
      path: '/',
      name: 'Home',
      layout: 'landing',
      sections: [
        {
          id: 'hero',
          component: 'hero',
          position: 'full',
          props: {
            title: 'Welcome to Our Blog',
            subtitle: 'Stories, Ideas & Insights',
            primaryCTA: 'Read Latest',
            primaryCTALink: '/posts',
          },
        },
        {
          id: 'featured-posts',
          component: 'blog-list',
          entity: 'post',
          position: 'main',
          props: {
            title: 'Featured Posts',
            limit: 3,
            featured: true,
            layout: 'grid',
          },
        },
        {
          id: 'recent-posts',
          component: 'blog-list',
          entity: 'post',
          position: 'main',
          props: {
            title: 'Recent Posts',
            limit: 6,
            layout: 'list',
          },
        },
      ],
    },
    {
      path: '/posts',
      name: 'All Posts',
      layout: 'two-column',
      sections: [
        {
          id: 'blog-sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            widgets: ['search', 'categories', 'tags', 'recent-posts'],
          },
        },
        {
          id: 'posts-list',
          component: 'blog-list',
          entity: 'post',
          position: 'main',
          props: {
            showPagination: true,
            itemsPerPage: 10,
            layout: 'list',
          },
        },
      ],
    },
    {
      path: '/posts/:slug',
      name: 'Post Detail',
      layout: 'two-column',
      sections: [
        {
          id: 'post-content',
          component: 'blog-detail',
          entity: 'post',
          position: 'main',
        },
        {
          id: 'post-sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            widgets: ['author-bio', 'table-of-contents', 'related-posts'],
          },
        },
        {
          id: 'comments',
          component: 'comment-section',
          entity: 'comment',
          position: 'main',
          props: {
            parentEntity: 'post',
            allowReplies: true,
          },
        },
      ],
    },
    {
      path: '/categories/:slug',
      name: 'Category Posts',
      layout: 'two-column',
      sections: [
        {
          id: 'category-sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            widgets: ['categories', 'tags'],
          },
        },
        {
          id: 'category-posts',
          component: 'blog-list',
          entity: 'post',
          position: 'main',
          props: {
            filterBy: 'category',
            showPagination: true,
          },
        },
      ],
    },
    {
      path: '/tags/:slug',
      name: 'Tagged Posts',
      layout: 'two-column',
      sections: [
        {
          id: 'tag-sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            widgets: ['categories', 'tags'],
          },
        },
        {
          id: 'tagged-posts',
          component: 'blog-list',
          entity: 'post',
          position: 'main',
          props: {
            filterBy: 'tag',
            showPagination: true,
          },
        },
      ],
    },
    {
      path: '/authors/:slug',
      name: 'Author Profile',
      layout: 'single-column',
      sections: [
        {
          id: 'author-profile',
          component: 'profile-view',
          entity: 'author',
          position: 'main',
        },
        {
          id: 'author-posts',
          component: 'blog-list',
          entity: 'post',
          position: 'main',
          props: {
            filterBy: 'author',
            title: 'Posts by Author',
          },
        },
      ],
    },

    // Admin Pages
    {
      path: '/admin/posts',
      name: 'Manage Posts',
      layout: 'dashboard',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'admin-sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Posts', path: '/admin/posts' },
              { label: 'Categories', path: '/admin/categories' },
              { label: 'Tags', path: '/admin/tags' },
              { label: 'Comments', path: '/admin/comments' },
            ],
          },
        },
        {
          id: 'posts-table',
          component: 'data-table',
          entity: 'post',
          position: 'main',
          props: {
            showCreate: true,
            showEdit: true,
            showDelete: true,
            columns: ['title', 'category', 'status', 'author', 'created_at'],
            showStatusDropdown: true,
          },
        },
      ],
    },
    {
      path: '/admin/posts/new',
      name: 'Create Post',
      layout: 'single-column',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'post-editor',
          component: 'create-form',
          entity: 'post',
          position: 'main',
          props: {
            richTextFields: ['content'],
            selectFields: ['category_id', 'tags'],
          },
        },
      ],
    },
    {
      path: '/admin/posts/:id/edit',
      name: 'Edit Post',
      layout: 'single-column',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'post-editor',
          component: 'edit-form',
          entity: 'post',
          position: 'main',
          props: {
            richTextFields: ['content'],
            selectFields: ['category_id', 'tags'],
          },
        },
      ],
    },
    {
      path: '/admin/categories',
      name: 'Manage Categories',
      layout: 'dashboard',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'admin-sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Posts', path: '/admin/posts' },
              { label: 'Categories', path: '/admin/categories' },
              { label: 'Tags', path: '/admin/tags' },
              { label: 'Comments', path: '/admin/comments' },
            ],
          },
        },
        {
          id: 'categories-table',
          component: 'data-table',
          entity: 'category',
          position: 'main',
          props: {
            showCreate: true,
            showEdit: true,
            showDelete: true,
          },
        },
      ],
    },
    {
      path: '/admin/comments',
      name: 'Manage Comments',
      layout: 'dashboard',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'admin-sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Posts', path: '/admin/posts' },
              { label: 'Categories', path: '/admin/categories' },
              { label: 'Tags', path: '/admin/tags' },
              { label: 'Comments', path: '/admin/comments' },
            ],
          },
        },
        {
          id: 'comments-table',
          component: 'data-table',
          entity: 'comment',
          position: 'main',
          props: {
            showDelete: true,
            columns: ['content', 'author', 'post_title', 'status', 'created_at'],
            showStatusDropdown: true,
          },
        },
      ],
    },
  ],

  endpoints: [
    // Post endpoints
    { method: 'GET', path: '/posts', entity: 'post', operation: 'list' },
    { method: 'GET', path: '/posts/:slug', entity: 'post', operation: 'get' },
    { method: 'POST', path: '/posts', entity: 'post', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/posts/:id', entity: 'post', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/posts/:id', entity: 'post', operation: 'delete', requiresAuth: true },

    // Category endpoints
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
    { method: 'GET', path: '/categories/:slug', entity: 'category', operation: 'get' },
    { method: 'GET', path: '/categories/:slug/posts', entity: 'post', operation: 'list' },
    { method: 'POST', path: '/categories', entity: 'category', operation: 'create', requiresAuth: true, adminOnly: true },
    { method: 'PUT', path: '/categories/:id', entity: 'category', operation: 'update', requiresAuth: true, adminOnly: true },
    { method: 'DELETE', path: '/categories/:id', entity: 'category', operation: 'delete', requiresAuth: true, adminOnly: true },

    // Tag endpoints
    { method: 'GET', path: '/tags', entity: 'tag', operation: 'list' },
    { method: 'GET', path: '/tags/:slug', entity: 'tag', operation: 'get' },
    { method: 'GET', path: '/tags/:slug/posts', entity: 'post', operation: 'list' },

    // Comment endpoints
    { method: 'GET', path: '/posts/:id/comments', entity: 'comment', operation: 'list' },
    { method: 'POST', path: '/posts/:id/comments', entity: 'comment', operation: 'create', requiresAuth: true },
    { method: 'DELETE', path: '/comments/:id', entity: 'comment', operation: 'delete', requiresAuth: true },

    // Author endpoints
    { method: 'GET', path: '/authors', entity: 'author', operation: 'list' },
    { method: 'GET', path: '/authors/:slug', entity: 'author', operation: 'get' },
    { method: 'GET', path: '/authors/:slug/posts', entity: 'post', operation: 'list' },
  ],

  entityConfig: {
    post: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'excerpt', type: 'text' },
        { name: 'content', type: 'text', required: true },
        { name: 'featured_image', type: 'image' },
        { name: 'status', type: 'enum' }, // draft, published
        { name: 'published_at', type: 'datetime' },
        { name: 'meta_title', type: 'string' },
        { name: 'meta_description', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'belongsTo', target: 'author' },
        { type: 'manyToMany', target: 'tag' },
        { type: 'hasMany', target: 'comment' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
      ],
      relationships: [
        { type: 'hasMany', target: 'post' },
      ],
    },
    tag: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
      ],
      relationships: [
        { type: 'manyToMany', target: 'post' },
      ],
    },
    comment: {
      defaultFields: [
        { name: 'content', type: 'text', required: true },
        { name: 'author_name', type: 'string' },
        { name: 'author_email', type: 'email' },
        { name: 'status', type: 'enum' }, // pending, approved, spam
        { name: 'parent_id', type: 'string' }, // Self-reference for replies (nullable FK handled at app level)
      ],
      relationships: [
        { type: 'belongsTo', target: 'post' },
        { type: 'belongsTo', target: 'user' },
        // Note: parent_id is a self-reference field, not a relationship, to avoid circular dependency
      ],
    },
    author: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'bio', type: 'text' },
        { name: 'avatar_url', type: 'image' },
        { name: 'website', type: 'url' },
        { name: 'twitter', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'post' },
      ],
    },
  },
};

export default blogBlueprint;
