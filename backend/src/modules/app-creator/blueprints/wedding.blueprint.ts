import { Blueprint } from './blueprint.interface';

/**
 * Wedding Planning Blueprint
 */
export const weddingBlueprint: Blueprint = {
  appType: 'wedding',
  description: 'Wedding planning app with vendors, guests, tasks, budget, and timeline',

  coreEntities: ['vendor', 'guest', 'task', 'budget_item', 'timeline_event', 'seating'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Guests', path: '/guests', icon: 'Users' },
        { label: 'Vendors', path: '/vendors', icon: 'Store' },
        { label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
        { label: 'Budget', path: '/budget', icon: 'DollarSign' },
        { label: 'Timeline', path: '/timeline', icon: 'Calendar' },
        { label: 'Seating', path: '/seating', icon: 'Grid' },
      ]}},
      { id: 'wedding-countdown', component: 'wedding-countdown', position: 'main' },
      { id: 'wedding-stats', component: 'wedding-stats', position: 'main' },
      { id: 'upcoming-tasks', component: 'task-list-wedding', entity: 'task', position: 'main' },
    ]},
    { path: '/guests', name: 'Guest List', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guest-stats', component: 'guest-stats', position: 'main' },
      { id: 'guest-table', component: 'guest-table', entity: 'guest', position: 'main' },
    ]},
    { path: '/guests/new', name: 'Add Guest', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guest-form', component: 'guest-form', entity: 'guest', position: 'main' },
    ]},
    { path: '/vendors', name: 'Vendors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vendor-grid', component: 'vendor-grid-wedding', entity: 'vendor', position: 'main' },
    ]},
    { path: '/vendors/:id', name: 'Vendor Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vendor-detail', component: 'vendor-detail-wedding', entity: 'vendor', position: 'main' },
    ]},
    { path: '/tasks', name: 'Tasks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'task-board', component: 'task-board-wedding', entity: 'task', position: 'main' },
    ]},
    { path: '/budget', name: 'Budget', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'budget-summary', component: 'budget-summary-wedding', position: 'main' },
      { id: 'budget-table', component: 'budget-table-wedding', entity: 'budget_item', position: 'main' },
    ]},
    { path: '/timeline', name: 'Timeline', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'wedding-timeline', component: 'wedding-timeline', entity: 'timeline_event', position: 'main' },
    ]},
    { path: '/seating', name: 'Seating Chart', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'seating-chart', component: 'seating-chart', entity: 'seating', position: 'main' },
    ]},
    { path: '/rsvp/:code', name: 'RSVP', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'rsvp-form', component: 'rsvp-form', entity: 'guest', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/guests', entity: 'guest', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/guests/:id', entity: 'guest', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/guests', entity: 'guest', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/guests/:id', entity: 'guest', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/vendors', entity: 'vendor', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/vendors', entity: 'vendor', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/tasks', entity: 'task', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tasks', entity: 'task', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/budget', entity: 'budget_item', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/rsvp/:code', entity: 'guest', operation: 'update' },
  ],

  entityConfig: {
    guest: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'group', type: 'enum' },
        { name: 'rsvp_status', type: 'enum' },
        { name: 'plus_one', type: 'boolean' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'table_assignment', type: 'string' },
        { name: 'rsvp_code', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    vendor: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'website', type: 'url' },
        { name: 'cost', type: 'decimal' },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    task: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'due_date', type: 'date' },
        { name: 'category', type: 'enum' },
        { name: 'priority', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'assigned_to', type: 'string' },
      ],
      relationships: [{ type: 'belongsTo', target: 'vendor' }],
    },
    budget_item: {
      defaultFields: [
        { name: 'category', type: 'enum', required: true },
        { name: 'item', type: 'string', required: true },
        { name: 'estimated_cost', type: 'decimal', required: true },
        { name: 'actual_cost', type: 'decimal' },
        { name: 'paid', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'vendor' }],
    },
  },
};

export default weddingBlueprint;
