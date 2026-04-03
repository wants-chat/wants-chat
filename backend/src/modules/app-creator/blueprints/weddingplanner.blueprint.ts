import { Blueprint } from './blueprint.interface';

/**
 * Wedding Planner Blueprint
 */
export const weddingplannerBlueprint: Blueprint = {
  appType: 'weddingplanner',
  description: 'Wedding planning app with events, vendors, budgets, and timeline management',

  coreEntities: ['wedding', 'couple', 'vendor', 'task', 'budget', 'timeline'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Weddings', path: '/weddings', icon: 'Heart' },
        { label: 'Couples', path: '/couples', icon: 'Users' },
        { label: 'Vendors', path: '/vendors', icon: 'Briefcase' },
        { label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
        { label: 'Budgets', path: '/budgets', icon: 'DollarSign' },
        { label: 'Timeline', path: '/timeline', icon: 'Calendar' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-weddings', component: 'appointment-list', entity: 'wedding', position: 'main' },
    ]},
    { path: '/weddings', name: 'Weddings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'wedding-calendar', component: 'appointment-calendar', entity: 'wedding', position: 'main' },
    ]},
    { path: '/couples', name: 'Couples', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'couple-table', component: 'data-table', entity: 'couple', position: 'main' },
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
    { path: '/timeline', name: 'Timeline', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'timeline-table', component: 'data-table', entity: 'timeline', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/weddings', entity: 'wedding', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/weddings', entity: 'wedding', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/couples', entity: 'couple', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/vendors', entity: 'vendor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tasks', entity: 'task', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/budgets', entity: 'budget', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/timeline', entity: 'timeline', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    wedding: {
      defaultFields: [
        { name: 'wedding_name', type: 'string', required: true },
        { name: 'wedding_date', type: 'date', required: true },
        { name: 'ceremony_time', type: 'datetime' },
        { name: 'reception_time', type: 'datetime' },
        { name: 'venue', type: 'string' },
        { name: 'venue_address', type: 'json' },
        { name: 'guest_count', type: 'integer' },
        { name: 'theme', type: 'string' },
        { name: 'color_scheme', type: 'json' },
        { name: 'style', type: 'enum' },
        { name: 'total_budget', type: 'decimal' },
        { name: 'spent_amount', type: 'decimal' },
        { name: 'vendors_booked', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'couple' },
        { type: 'hasMany', target: 'task' },
        { type: 'hasMany', target: 'budget' },
        { type: 'hasMany', target: 'timeline' },
      ],
    },
    couple: {
      defaultFields: [
        { name: 'partner1_name', type: 'string', required: true },
        { name: 'partner2_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'engagement_date', type: 'date' },
        { name: 'how_met', type: 'text' },
        { name: 'preferences', type: 'json' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'referral_source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'wedding' },
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
        { name: 'price_range', type: 'string' },
        { name: 'rating', type: 'decimal' },
        { name: 'portfolio_url', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_preferred', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    task: {
      defaultFields: [
        { name: 'task_name', type: 'string', required: true },
        { name: 'task_category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'due_date', type: 'date' },
        { name: 'priority', type: 'enum' },
        { name: 'assigned_to', type: 'string' },
        { name: 'vendor_involved', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'completed_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'wedding' },
      ],
    },
    budget: {
      defaultFields: [
        { name: 'category', type: 'enum', required: true },
        { name: 'item_name', type: 'string', required: true },
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
        { type: 'belongsTo', target: 'wedding' },
      ],
    },
    timeline: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum' },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'vendors_involved', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'order', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'wedding' },
      ],
    },
  },
};

export default weddingplannerBlueprint;
