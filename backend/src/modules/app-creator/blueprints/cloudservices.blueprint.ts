import { Blueprint } from './blueprint.interface';

/**
 * Cloud Services Blueprint
 */
export const cloudservicesBlueprint: Blueprint = {
  appType: 'cloudservices',
  description: 'Cloud hosting services app with resources, subscriptions, billing, and support',

  coreEntities: ['resource', 'subscription', 'invoice', 'support_ticket', 'customer', 'usage'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Resources', path: '/resources', icon: 'Cloud' },
        { label: 'Subscriptions', path: '/subscriptions', icon: 'CreditCard' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
        { label: 'Support', path: '/support', icon: 'LifeBuoy' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Usage', path: '/usage', icon: 'BarChart' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'resource-overview', component: 'data-table', entity: 'resource', position: 'main' },
    ]},
    { path: '/resources', name: 'Resources', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'resource-table', component: 'data-table', entity: 'resource', position: 'main' },
    ]},
    { path: '/subscriptions', name: 'Subscriptions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'subscription-table', component: 'data-table', entity: 'subscription', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/support', name: 'Support', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-board', component: 'kanban-board', entity: 'support_ticket', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/usage', name: 'Usage', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'usage-table', component: 'data-table', entity: 'usage', position: 'main' },
    ]},
    { path: '/pricing', name: 'Pricing', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'pricing-table', component: 'plan-grid', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/resources', entity: 'resource', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/resources', entity: 'resource', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/subscriptions', entity: 'subscription', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/subscriptions', entity: 'subscription', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/support', entity: 'support_ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/support', entity: 'support_ticket', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/usage', entity: 'usage', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    resource: {
      defaultFields: [
        { name: 'resource_name', type: 'string', required: true },
        { name: 'resource_type', type: 'enum', required: true },
        { name: 'region', type: 'string' },
        { name: 'configuration', type: 'json' },
        { name: 'cpu', type: 'string' },
        { name: 'memory', type: 'string' },
        { name: 'storage', type: 'string' },
        { name: 'bandwidth', type: 'string' },
        { name: 'ip_address', type: 'string' },
        { name: 'hostname', type: 'string' },
        { name: 'os', type: 'string' },
        { name: 'hourly_cost', type: 'decimal' },
        { name: 'monthly_cost', type: 'decimal' },
        { name: 'provisioned_at', type: 'datetime' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'subscription' },
      ],
    },
    subscription: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'plan_type', type: 'enum', required: true },
        { name: 'billing_cycle', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'base_price', type: 'decimal', required: true },
        { name: 'included_resources', type: 'json' },
        { name: 'overage_rates', type: 'json' },
        { name: 'discount_percentage', type: 'decimal' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'payment_method', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'resource' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'billing_period_start', type: 'date' },
        { name: 'billing_period_end', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'credits', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'payment_date', type: 'date' },
        { name: 'payment_method', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'subscription' },
      ],
    },
    support_ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'subject', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'priority', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'affected_resources', type: 'json' },
        { name: 'resolution', type: 'text' },
        { name: 'sla_response_due', type: 'datetime' },
        { name: 'sla_resolution_due', type: 'datetime' },
        { name: 'first_response_at', type: 'datetime' },
        { name: 'resolved_at', type: 'datetime' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'company_name', type: 'string' },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'tax_id', type: 'string' },
        { name: 'account_type', type: 'enum' },
        { name: 'support_tier', type: 'enum' },
        { name: 'credit_balance', type: 'decimal' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'resource' },
        { type: 'hasMany', target: 'subscription' },
        { type: 'hasMany', target: 'invoice' },
        { type: 'hasMany', target: 'support_ticket' },
      ],
    },
    usage: {
      defaultFields: [
        { name: 'usage_date', type: 'date', required: true },
        { name: 'resource_type', type: 'enum', required: true },
        { name: 'metric', type: 'string', required: true },
        { name: 'quantity', type: 'decimal', required: true },
        { name: 'unit', type: 'string' },
        { name: 'unit_cost', type: 'decimal' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'included_in_plan', type: 'decimal' },
        { name: 'overage', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'resource' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default cloudservicesBlueprint;
