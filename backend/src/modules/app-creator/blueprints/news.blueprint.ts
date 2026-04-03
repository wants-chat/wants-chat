import { Blueprint } from './blueprint.interface';

/**
 * News/Magazine Blueprint
 */
export const newsBlueprint: Blueprint = {
  appType: 'news',
  description: 'News/magazine app with articles, categories, authors, and subscriptions',

  coreEntities: ['article', 'category', 'author', 'tag', 'comment', 'subscription'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Home', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Home', path: '/', icon: 'Home' },
        { label: 'Latest', path: '/latest', icon: 'Clock' },
        { label: 'Categories', path: '/categories', icon: 'Grid' },
        { label: 'Saved', path: '/saved', icon: 'Bookmark' },
      ]}},
      { id: 'featured', component: 'featured-article', entity: 'article', position: 'main' },
      { id: 'latest', component: 'article-grid', entity: 'article', position: 'main' },
    ]},
    { path: '/articles/:id', name: 'Article', layout: 'two-column', requiresAuth: false, sections: [
      { id: 'article-content', component: 'article-content', entity: 'article', position: 'main' },
      { id: 'author-card', component: 'author-card', entity: 'author', position: 'sidebar' },
      { id: 'related', component: 'related-articles', entity: 'article', position: 'sidebar' },
      { id: 'comments', component: 'comment-section', entity: 'comment', position: 'main' },
    ]},
    { path: '/categories/:slug', name: 'Category', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'category-header', component: 'category-header', entity: 'category', position: 'main' },
      { id: 'category-articles', component: 'article-grid', entity: 'article', position: 'main' },
    ]},
    { path: '/authors/:id', name: 'Author', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'author-profile', component: 'author-profile', entity: 'author', position: 'main' },
      { id: 'author-articles', component: 'article-grid', entity: 'article', position: 'main' },
    ]},
    { path: '/saved', name: 'Saved Articles', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'saved-articles', component: 'article-grid', entity: 'article', position: 'main', props: { title: 'Saved' }},
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/articles', entity: 'article', operation: 'list' },
    { method: 'GET', path: '/articles/:id', entity: 'article', operation: 'get' },
    { method: 'POST', path: '/articles', entity: 'article', operation: 'create', requiresAuth: true, adminOnly: true },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
    { method: 'GET', path: '/authors', entity: 'author', operation: 'list' },
    { method: 'GET', path: '/authors/:id', entity: 'author', operation: 'get' },
    { method: 'POST', path: '/articles/:id/bookmark', entity: 'article', operation: 'update', requiresAuth: true },
  ],

  entityConfig: {
    article: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'excerpt', type: 'text' },
        { name: 'content', type: 'text', required: true },
        { name: 'featured_image', type: 'image' },
        { name: 'reading_time', type: 'integer' },
        { name: 'views', type: 'integer' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_premium', type: 'boolean' },
        { name: 'published_at', type: 'datetime' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'author' },
        { type: 'belongsTo', target: 'category' },
        { type: 'hasMany', target: 'comment' },
      ],
    },
    author: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'bio', type: 'text' },
        { name: 'avatar_url', type: 'image' },
        { name: 'twitter', type: 'string' },
        { name: 'article_count', type: 'integer' },
      ],
      relationships: [{ type: 'hasMany', target: 'article' }],
    },
  },
};

export default newsBlueprint;
