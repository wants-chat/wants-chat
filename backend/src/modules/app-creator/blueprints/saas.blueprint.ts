import { Blueprint } from './blueprint.interface';

/**
 * SaaS Dashboard Blueprint
 *
 * Defines the structure for a SaaS application:
 * - User dashboard with analytics
 * - Subscription/billing management
 * - Team management
 * - Settings and profile
 */
export const saasBlueprint: Blueprint = {
  appType: 'saas',
  description: 'SaaS dashboard with analytics, subscriptions, and team management',

  coreEntities: ['workspace', 'member', 'subscription', 'invoice', 'activity', 'setting'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Dashboard
    {
      path: '/',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
              { label: 'Analytics', path: '/analytics', icon: 'BarChart' },
              { label: 'Team', path: '/team', icon: 'Users' },
              { label: 'Billing', path: '/billing', icon: 'CreditCard' },
              { label: 'Settings', path: '/settings', icon: 'Settings' },
            ],
          },
        },
        {
          id: 'stats-overview',
          component: 'stats-cards',
          position: 'main',
          props: {
            title: 'Overview',
          },
        },
        {
          id: 'recent-activity',
          component: 'activity-feed',
          entity: 'activity',
          position: 'main',
          props: {
            title: 'Recent Activity',
            limit: 10,
          },
        },
      ],
    },
    {
      path: '/analytics',
      name: 'Analytics',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'charts',
          component: 'analytics-charts',
          position: 'main',
          props: {
            title: 'Analytics',
          },
        },
      ],
    },
    {
      path: '/team',
      name: 'Team',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'team-list',
          component: 'team-list',
          entity: 'member',
          position: 'main',
          props: {
            title: 'Team Members',
            showInvite: true,
          },
        },
      ],
    },
    {
      path: '/billing',
      name: 'Billing',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'subscription',
          component: 'subscription-card',
          entity: 'subscription',
          position: 'main',
        },
        {
          id: 'invoices',
          component: 'data-table',
          entity: 'invoice',
          position: 'main',
          props: {
            title: 'Invoice History',
            columns: ['id', 'amount', 'status', 'created_at'],
          },
        },
      ],
    },
    {
      path: '/settings',
      name: 'Settings',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'settings-form',
          component: 'settings-form',
          entity: 'setting',
          position: 'main',
        },
      ],
    },
  ],

  endpoints: [
    // Workspace
    { method: 'GET', path: '/workspaces', entity: 'workspace', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/workspaces/:id', entity: 'workspace', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/workspaces', entity: 'workspace', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/workspaces/:id', entity: 'workspace', operation: 'update', requiresAuth: true },

    // Members
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members/invite', entity: 'member', operation: 'create', requiresAuth: true },
    { method: 'DELETE', path: '/members/:id', entity: 'member', operation: 'delete', requiresAuth: true },

    // Subscriptions
    { method: 'GET', path: '/subscription', entity: 'subscription', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/subscription', entity: 'subscription', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/subscription', entity: 'subscription', operation: 'update', requiresAuth: true },

    // Invoices
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices/:id', entity: 'invoice', operation: 'get', requiresAuth: true },

    // Activity
    { method: 'GET', path: '/activities', entity: 'activity', operation: 'list', requiresAuth: true },

    // Settings
    { method: 'GET', path: '/settings', entity: 'setting', operation: 'get', requiresAuth: true },
    { method: 'PUT', path: '/settings', entity: 'setting', operation: 'update', requiresAuth: true },
  ],

  entityConfig: {
    workspace: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'logo_url', type: 'image' },
        { name: 'plan', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'member' },
        { type: 'hasOne', target: 'subscription' },
      ],
    },
    member: {
      defaultFields: [
        { name: 'email', type: 'email', required: true },
        { name: 'role', type: 'enum', required: true },
        { name: 'status', type: 'enum' },
        { name: 'invited_at', type: 'datetime' },
        { name: 'joined_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'workspace' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    subscription: {
      defaultFields: [
        { name: 'plan', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'current_period_start', type: 'datetime' },
        { name: 'current_period_end', type: 'datetime' },
        { name: 'cancel_at', type: 'datetime' },
        { name: 'stripe_subscription_id', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'workspace' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'amount', type: 'decimal', required: true },
        { name: 'currency', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'paid_at', type: 'datetime' },
        { name: 'invoice_url', type: 'url' },
        { name: 'stripe_invoice_id', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'workspace' },
      ],
    },
    activity: {
      defaultFields: [
        { name: 'action', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'metadata', type: 'json' },
        { name: 'ip_address', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'user' },
        { type: 'belongsTo', target: 'workspace' },
      ],
    },
    setting: {
      defaultFields: [
        { name: 'key', type: 'string', required: true },
        { name: 'value', type: 'json' },
        { name: 'type', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'workspace' },
      ],
    },
  },
};

export default saasBlueprint;
