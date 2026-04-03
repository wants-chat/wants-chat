import { Blueprint } from './blueprint.interface';

/**
 * Helpdesk/Support Blueprint
 *
 * Defines the structure for a helpdesk/support application:
 * - Tickets
 * - Knowledge Base
 * - FAQ
 * - Agents
 * - Customers
 * - SLA Management
 */
export const helpdeskBlueprint: Blueprint = {
  appType: 'helpdesk',
  description: 'Helpdesk app with tickets, knowledge base, and customer support management',

  coreEntities: ['ticket', 'article', 'category', 'agent', 'customer', 'reply', 'tag'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Customer Portal Home
    {
      path: '/',
      name: 'Support Center',
      layout: 'landing',
      sections: [
        {
          id: 'hero',
          component: 'hero',
          position: 'full',
          props: {
            title: 'How can we help you?',
            subtitle: 'Search our knowledge base or submit a support ticket',
            showSearch: true,
          },
        },
        {
          id: 'search',
          component: 'kb-search',
          position: 'main',
        },
        {
          id: 'popular-articles',
          component: 'article-grid',
          entity: 'article',
          position: 'main',
          props: {
            title: 'Popular Articles',
            limit: 6,
            popular: true,
          },
        },
        {
          id: 'categories',
          component: 'kb-categories',
          entity: 'category',
          position: 'main',
          props: {
            title: 'Browse by Category',
          },
        },
      ],
    },
    // Knowledge Base
    {
      path: '/knowledge-base',
      name: 'Knowledge Base',
      layout: 'two-column',
      sections: [
        {
          id: 'category-sidebar',
          component: 'kb-sidebar',
          entity: 'category',
          position: 'sidebar',
        },
        {
          id: 'article-list',
          component: 'article-list',
          entity: 'article',
          position: 'main',
        },
      ],
    },
    // Category Articles
    {
      path: '/knowledge-base/category/:id',
      name: 'Category',
      layout: 'two-column',
      sections: [
        {
          id: 'category-sidebar',
          component: 'kb-sidebar',
          entity: 'category',
          position: 'sidebar',
        },
        {
          id: 'category-articles',
          component: 'article-list',
          entity: 'article',
          position: 'main',
        },
      ],
    },
    // Article Detail
    {
      path: '/knowledge-base/article/:id',
      name: 'Article',
      layout: 'two-column',
      sections: [
        {
          id: 'article-sidebar',
          component: 'article-sidebar',
          position: 'sidebar',
        },
        {
          id: 'article-content',
          component: 'article-detail',
          entity: 'article',
          position: 'main',
        },
        {
          id: 'article-feedback',
          component: 'article-feedback',
          position: 'main',
        },
        {
          id: 'related-articles',
          component: 'related-articles',
          entity: 'article',
          position: 'main',
          props: {
            title: 'Related Articles',
          },
        },
      ],
    },
    // Submit Ticket
    {
      path: '/submit-ticket',
      name: 'Submit Ticket',
      layout: 'single-column',
      sections: [
        {
          id: 'ticket-form',
          component: 'ticket-form',
          entity: 'ticket',
          position: 'main',
        },
      ],
    },
    // Customer Dashboard
    {
      path: '/dashboard',
      name: 'My Tickets',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'My Tickets', path: '/dashboard', icon: 'Ticket' },
              { label: 'Submit Ticket', path: '/submit-ticket', icon: 'Plus' },
              { label: 'Knowledge Base', path: '/knowledge-base', icon: 'Book' },
              { label: 'Profile', path: '/dashboard/profile', icon: 'User' },
            ],
          },
        },
        {
          id: 'ticket-list',
          component: 'customer-tickets',
          entity: 'ticket',
          position: 'main',
          props: {
            title: 'My Support Tickets',
          },
        },
      ],
    },
    // Ticket Detail (Customer)
    {
      path: '/dashboard/tickets/:id',
      name: 'Ticket Detail',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'ticket-detail',
          component: 'ticket-detail',
          entity: 'ticket',
          position: 'main',
        },
        {
          id: 'ticket-replies',
          component: 'ticket-replies',
          entity: 'reply',
          position: 'main',
        },
        {
          id: 'reply-form',
          component: 'reply-form',
          entity: 'reply',
          position: 'main',
        },
      ],
    },
    // Agent Dashboard
    {
      path: '/agent',
      name: 'Agent Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/agent', icon: 'LayoutDashboard' },
              { label: 'Tickets', path: '/agent/tickets', icon: 'Ticket' },
              { label: 'Customers', path: '/agent/customers', icon: 'Users' },
              { label: 'Knowledge Base', path: '/agent/articles', icon: 'Book' },
              { label: 'Reports', path: '/agent/reports', icon: 'BarChart2' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['open_tickets', 'pending_tickets', 'resolved_today', 'avg_response_time'],
          },
        },
        {
          id: 'ticket-queue',
          component: 'ticket-queue',
          entity: 'ticket',
          position: 'main',
          props: {
            title: 'Ticket Queue',
          },
        },
      ],
    },
    // Agent Tickets
    {
      path: '/agent/tickets',
      name: 'All Tickets',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'ticket-filters',
          component: 'ticket-filters',
          position: 'main',
        },
        {
          id: 'ticket-table',
          component: 'data-table',
          entity: 'ticket',
          position: 'main',
          props: {
            title: 'All Tickets',
            columns: ['id', 'subject', 'customer', 'priority', 'status', 'assigned_to', 'created_at'],
          },
        },
      ],
    },
    // Agent Ticket Detail
    {
      path: '/agent/tickets/:id',
      name: 'Ticket',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'ticket-header',
          component: 'ticket-header',
          entity: 'ticket',
          position: 'main',
        },
        {
          id: 'ticket-info',
          component: 'ticket-info',
          entity: 'ticket',
          position: 'main',
        },
        {
          id: 'ticket-conversation',
          component: 'ticket-conversation',
          entity: 'reply',
          position: 'main',
        },
        {
          id: 'agent-reply-form',
          component: 'agent-reply-form',
          entity: 'reply',
          position: 'main',
        },
      ],
    },
    // Manage Articles
    {
      path: '/agent/articles',
      name: 'Manage Articles',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'article-table',
          component: 'data-table',
          entity: 'article',
          position: 'main',
          props: {
            title: 'Knowledge Base Articles',
            showCreate: true,
            columns: ['title', 'category', 'status', 'views', 'helpful_count', 'updated_at'],
          },
        },
      ],
    },
    // Create/Edit Article
    {
      path: '/agent/articles/new',
      name: 'New Article',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'article-form',
          component: 'article-form',
          entity: 'article',
          position: 'main',
        },
      ],
    },
  ],

  endpoints: [
    // Tickets
    { method: 'GET', path: '/tickets', entity: 'ticket', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tickets/:id', entity: 'ticket', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'ticket', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/tickets/:id', entity: 'ticket', operation: 'update', requiresAuth: true },
    { method: 'PATCH', path: '/tickets/:id/status', entity: 'ticket', operation: 'update', requiresAuth: true },
    { method: 'PATCH', path: '/tickets/:id/assign', entity: 'ticket', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/tickets/:id/replies', entity: 'reply', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets/:id/replies', entity: 'reply', operation: 'create', requiresAuth: true },

    // Articles
    { method: 'GET', path: '/articles', entity: 'article', operation: 'list' },
    { method: 'GET', path: '/articles/:id', entity: 'article', operation: 'get' },
    { method: 'POST', path: '/articles', entity: 'article', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/articles/:id', entity: 'article', operation: 'update', requiresAuth: true },
    { method: 'DELETE', path: '/articles/:id', entity: 'article', operation: 'delete', requiresAuth: true },
    { method: 'POST', path: '/articles/:id/feedback', entity: 'article', operation: 'custom' },

    // Categories
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
    { method: 'GET', path: '/categories/:id', entity: 'category', operation: 'get' },
    { method: 'GET', path: '/categories/:id/articles', entity: 'article', operation: 'list' },

    // Search
    { method: 'GET', path: '/search', entity: 'article', operation: 'list' },

    // Customer tickets
    { method: 'GET', path: '/my-tickets', entity: 'ticket', operation: 'list', requiresAuth: true },

    // Agent endpoints
    { method: 'GET', path: '/agent/stats', entity: 'ticket', operation: 'custom', requiresAuth: true },
    { method: 'GET', path: '/agent/queue', entity: 'ticket', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'subject', type: 'string', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'priority', type: 'enum', required: true },
        { name: 'type', type: 'enum' },
        { name: 'channel', type: 'enum' },
        { name: 'assigned_at', type: 'datetime' },
        { name: 'first_response_at', type: 'datetime' },
        { name: 'resolved_at', type: 'datetime' },
        { name: 'closed_at', type: 'datetime' },
        { name: 'sla_due_at', type: 'datetime' },
        { name: 'satisfaction_rating', type: 'integer' },
        { name: 'satisfaction_comment', type: 'text' },
        { name: 'attachments', type: 'json' },
        { name: 'custom_fields', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'agent' },
        { type: 'belongsTo', target: 'category' },
        { type: 'hasMany', target: 'reply' },
        { type: 'hasMany', target: 'tag' },
      ],
    },
    article: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'content', type: 'text', required: true },
        { name: 'excerpt', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'views', type: 'integer' },
        { name: 'helpful_count', type: 'integer' },
        { name: 'not_helpful_count', type: 'integer' },
        { name: 'featured_image', type: 'image' },
        { name: 'meta_title', type: 'string' },
        { name: 'meta_description', type: 'string' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'order', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'belongsTo', target: 'agent' },
        { type: 'hasMany', target: 'tag' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'icon', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'order', type: 'integer' },
        { name: 'is_public', type: 'boolean' },
        { name: 'article_count', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'hasMany', target: 'category' },
        { type: 'hasMany', target: 'article' },
        { type: 'hasMany', target: 'ticket' },
      ],
    },
    agent: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'avatar_url', type: 'image' },
        { name: 'role', type: 'enum', required: true },
        { name: 'department', type: 'string' },
        { name: 'status', type: 'enum' },
        { name: 'max_tickets', type: 'integer' },
        { name: 'current_tickets', type: 'integer' },
        { name: 'signature', type: 'text' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'ticket' },
        { type: 'hasMany', target: 'reply' },
        { type: 'hasMany', target: 'article' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'avatar_url', type: 'image' },
        { name: 'company', type: 'string' },
        { name: 'timezone', type: 'string' },
        { name: 'language', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'custom_fields', type: 'json' },
        { name: 'total_tickets', type: 'integer' },
        { name: 'satisfaction_score', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'ticket' },
      ],
    },
    reply: {
      defaultFields: [
        { name: 'content', type: 'text', required: true },
        { name: 'type', type: 'enum' },
        { name: 'is_internal', type: 'boolean' },
        { name: 'attachments', type: 'json' },
        { name: 'read_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'ticket' },
        { type: 'belongsTo', target: 'agent' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    tag: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'color', type: 'string' },
        { name: 'description', type: 'text' },
      ],
      relationships: [],
    },
  },
};

export default helpdeskBlueprint;
