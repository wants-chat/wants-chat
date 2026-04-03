import { Blueprint } from './blueprint.interface';

/**
 * Event Planner Blueprint
 */
export const eventplannerBlueprint: Blueprint = {
  appType: 'eventplanner',
  description: 'Event planning app with events, clients, vendors, and logistics management',

  coreEntities: ['event', 'client', 'vendor', 'task', 'budget', 'contract'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Vendors', path: '/vendors', icon: 'Briefcase' },
        { label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
        { label: 'Budgets', path: '/budgets', icon: 'DollarSign' },
        { label: 'Contracts', path: '/contracts', icon: 'FileText' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-events', component: 'appointment-list', entity: 'event', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/vendors', name: 'Vendors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vendor-grid', component: 'product-grid', entity: 'vendor', position: 'main' },
    ]},
    { path: '/tasks', name: 'Tasks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'task-board', component: 'kanban-board', entity: 'task', position: 'main' },
    ]},
    { path: '/budgets', name: 'Budgets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'budget-table', component: 'data-table', entity: 'budget', position: 'main' },
    ]},
    { path: '/contracts', name: 'Contracts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'contract-table', component: 'data-table', entity: 'contract', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/events', entity: 'event', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/events', entity: 'event', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/vendors', entity: 'vendor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tasks', entity: 'task', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/budgets', entity: 'budget', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/contracts', entity: 'contract', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'venue', type: 'string' },
        { name: 'venue_address', type: 'json' },
        { name: 'guest_count', type: 'integer' },
        { name: 'theme', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'agenda', type: 'json' },
        { name: 'total_budget', type: 'decimal' },
        { name: 'spent_amount', type: 'decimal' },
        { name: 'vendors_booked', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'task' },
        { type: 'hasMany', target: 'budget' },
        { type: 'hasMany', target: 'contract' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string' },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'client_type', type: 'enum' },
        { name: 'industry', type: 'string' },
        { name: 'billing_address', type: 'json' },
        { name: 'payment_terms', type: 'string' },
        { name: 'total_events', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'event' },
      ],
    },
    vendor: {
      defaultFields: [
        { name: 'vendor_name', type: 'string', required: true },
        { name: 'vendor_type', type: 'enum', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'website', type: 'string' },
        { name: 'address', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'services', type: 'json' },
        { name: 'pricing', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'insurance_info', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_preferred', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    task: {
      defaultFields: [
        { name: 'task_name', type: 'string', required: true },
        { name: 'task_category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'due_date', type: 'date' },
        { name: 'priority', type: 'enum' },
        { name: 'assigned_to', type: 'string' },
        { name: 'dependencies', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'completed_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'event' },
      ],
    },
    budget: {
      defaultFields: [
        { name: 'category', type: 'enum', required: true },
        { name: 'item_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'estimated_cost', type: 'decimal' },
        { name: 'actual_cost', type: 'decimal' },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_due_date', type: 'date' },
        { name: 'vendor_name', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'event' },
      ],
    },
    contract: {
      defaultFields: [
        { name: 'contract_name', type: 'string', required: true },
        { name: 'contract_type', type: 'enum' },
        { name: 'vendor_name', type: 'string' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'contract_value', type: 'decimal' },
        { name: 'terms', type: 'text' },
        { name: 'cancellation_policy', type: 'text' },
        { name: 'document_url', type: 'string' },
        { name: 'signed_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'event' },
        { type: 'belongsTo', target: 'vendor' },
      ],
    },
  },
};

export default eventplannerBlueprint;
