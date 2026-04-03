import { Blueprint } from './blueprint.interface';

/**
 * Professional Home Organizer Blueprint
 */
export const homeorganizerBlueprint: Blueprint = {
  appType: 'homeorganizer',
  description: 'Professional organizing app with clients, projects, sessions, and decluttering tracking',

  coreEntities: ['client', 'project', 'session', 'room', 'task', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Projects', path: '/projects', icon: 'Folder' },
        { label: 'Sessions', path: '/sessions', icon: 'Calendar' },
        { label: 'Rooms', path: '/rooms', icon: 'Home' },
        { label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-sessions', component: 'appointment-list', entity: 'session', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-board', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-calendar', component: 'appointment-calendar', entity: 'session', position: 'main' },
    ]},
    { path: '/rooms', name: 'Rooms', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'room-grid', component: 'product-grid', entity: 'room', position: 'main' },
    ]},
    { path: '/tasks', name: 'Tasks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'task-board', component: 'kanban-board', entity: 'task', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'session', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create' },
    { method: 'GET', path: '/rooms', entity: 'room', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tasks', entity: 'task', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'home_type', type: 'enum' },
        { name: 'home_size', type: 'string' },
        { name: 'household_members', type: 'integer' },
        { name: 'organizing_goals', type: 'json' },
        { name: 'problem_areas', type: 'json' },
        { name: 'organizing_style', type: 'enum' },
        { name: 'budget_range', type: 'string' },
        { name: 'referral_source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'session' },
      ],
    },
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'start_date', type: 'date' },
        { name: 'target_completion', type: 'date' },
        { name: 'actual_completion', type: 'date' },
        { name: 'rooms_included', type: 'json' },
        { name: 'goals', type: 'json' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'actual_hours', type: 'decimal' },
        { name: 'budget', type: 'decimal' },
        { name: 'supplies_needed', type: 'json' },
        { name: 'before_photos', type: 'json' },
        { name: 'after_photos', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'session' },
        { type: 'hasMany', target: 'room' },
        { type: 'hasMany', target: 'task' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'session_type', type: 'enum' },
        { name: 'rooms_worked', type: 'json' },
        { name: 'work_completed', type: 'text' },
        { name: 'items_donated', type: 'integer' },
        { name: 'items_trashed', type: 'integer' },
        { name: 'items_sold', type: 'integer' },
        { name: 'supplies_used', type: 'json' },
        { name: 'homework_assigned', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'next_session_focus', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'project' },
      ],
    },
    room: {
      defaultFields: [
        { name: 'room_name', type: 'string', required: true },
        { name: 'room_type', type: 'enum', required: true },
        { name: 'current_condition', type: 'enum' },
        { name: 'target_condition', type: 'enum' },
        { name: 'main_issues', type: 'json' },
        { name: 'goals', type: 'json' },
        { name: 'zones', type: 'json' },
        { name: 'storage_solutions', type: 'json' },
        { name: 'before_photo', type: 'image' },
        { name: 'after_photo', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
      ],
    },
    task: {
      defaultFields: [
        { name: 'task_name', type: 'string', required: true },
        { name: 'task_type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'assigned_to', type: 'enum' },
        { name: 'room', type: 'string' },
        { name: 'due_date', type: 'date' },
        { name: 'priority', type: 'enum' },
        { name: 'estimated_time', type: 'integer' },
        { name: 'actual_time', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'completed_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'service_hours', type: 'decimal' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'supplies_cost', type: 'decimal' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'project' },
      ],
    },
  },
};

export default homeorganizerBlueprint;
