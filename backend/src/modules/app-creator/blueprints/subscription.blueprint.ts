import { Blueprint } from './blueprint.interface';

/**
 * Subscription Billing Blueprint
 */
export const subscriptionBlueprint: Blueprint = {
  appType: 'subscription',
  description: 'Subscription billing app with plans, subscribers, invoices, and analytics',

  coreEntities: ['plan', 'subscriber', 'subscription', 'invoice', 'payment', 'usage'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Plans', path: '/plans', icon: 'CreditCard' },
        { label: 'Subscribers', path: '/subscribers', icon: 'Users' },
        { label: 'Invoices', path: '/invoices', icon: 'FileText' },
        { label: 'Analytics', path: '/analytics', icon: 'BarChart' },
      ]}},
      { id: 'mrr-stats', component: 'mrr-stats', position: 'main' },
      { id: 'subscriber-chart', component: 'subscriber-chart', position: 'main' },
      { id: 'recent-activity', component: 'subscription-activity', entity: 'subscription', position: 'main' },
    ]},
    { path: '/plans', name: 'Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'plan-grid', component: 'plan-grid', entity: 'plan', position: 'main' },
    ]},
    { path: '/plans/new', name: 'Create Plan', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'plan-form', component: 'plan-form', entity: 'plan', position: 'main' },
    ]},
    { path: '/subscribers', name: 'Subscribers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'subscriber-table', component: 'subscriber-table', entity: 'subscriber', position: 'main' },
    ]},
    { path: '/subscribers/:id', name: 'Subscriber Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'subscriber-profile', component: 'subscriber-profile', entity: 'subscriber', position: 'main' },
      { id: 'subscription-history', component: 'subscription-history', entity: 'subscription', position: 'main' },
      { id: 'invoice-list', component: 'invoice-list', entity: 'invoice', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'invoice-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/analytics', name: 'Analytics', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'revenue-chart', component: 'revenue-chart', position: 'main' },
      { id: 'churn-metrics', component: 'churn-metrics', position: 'main' },
      { id: 'plan-distribution', component: 'plan-distribution', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/plans', entity: 'plan', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/plans', entity: 'plan', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/plans/:id', entity: 'plan', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/subscribers', entity: 'subscriber', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/subscribers/:id', entity: 'subscriber', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/subscriptions', entity: 'subscription', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/subscriptions', entity: 'subscription', operation: 'create', requiresAuth: true },
    { method: 'PATCH', path: '/subscriptions/:id/cancel', entity: 'subscription', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/analytics/mrr', entity: 'subscription', operation: 'custom', requiresAuth: true },
  ],

  entityConfig: {
    plan: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'billing_interval', type: 'enum', required: true },
        { name: 'features', type: 'json' },
        { name: 'trial_days', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
        { name: 'is_popular', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'subscription' }],
    },
    subscription: {
      defaultFields: [
        { name: 'status', type: 'enum', required: true },
        { name: 'current_period_start', type: 'datetime', required: true },
        { name: 'current_period_end', type: 'datetime', required: true },
        { name: 'cancel_at_period_end', type: 'boolean' },
        { name: 'canceled_at', type: 'datetime' },
        { name: 'trial_end', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'subscriber' },
        { type: 'belongsTo', target: 'plan' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
  },
};

export default subscriptionBlueprint;
