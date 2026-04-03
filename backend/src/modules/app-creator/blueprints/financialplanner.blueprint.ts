import { Blueprint } from './blueprint.interface';

/**
 * Financial Planner Blueprint
 */
export const financialplannerBlueprint: Blueprint = {
  appType: 'financialplanner',
  description: 'Financial planning practice with clients, plans, goals, and comprehensive wealth management',

  coreEntities: ['client', 'plan', 'meeting', 'goal', 'document', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Plans', path: '/plans', icon: 'FileText' },
        { label: 'Meetings', path: '/meetings', icon: 'Calendar' },
        { label: 'Goals', path: '/goals', icon: 'Target' },
        { label: 'Documents', path: '/documents', icon: 'FolderOpen' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-meetings', component: 'appointment-list', entity: 'meeting', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/plans', name: 'Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'plan-table', component: 'data-table', entity: 'plan', position: 'main' },
    ]},
    { path: '/meetings', name: 'Meetings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'meeting-calendar', component: 'appointment-calendar', entity: 'meeting', position: 'main' },
    ]},
    { path: '/goals', name: 'Goals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'goal-board', component: 'kanban-board', entity: 'goal', position: 'main' },
    ]},
    { path: '/documents', name: 'Documents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'document-table', component: 'data-table', entity: 'document', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'meeting', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/plans', entity: 'plan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/meetings', entity: 'meeting', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/meetings', entity: 'meeting', operation: 'create' },
    { method: 'GET', path: '/goals', entity: 'goal', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'spouse_name', type: 'string' },
        { name: 'address', type: 'json' },
        { name: 'occupation', type: 'string' },
        { name: 'employer', type: 'string' },
        { name: 'income_info', type: 'json' },
        { name: 'assets', type: 'json' },
        { name: 'liabilities', type: 'json' },
        { name: 'insurance_coverage', type: 'json' },
        { name: 'retirement_accounts', type: 'json' },
        { name: 'estate_documents', type: 'json' },
        { name: 'risk_profile', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'plan' },
        { type: 'hasMany', target: 'meeting' },
        { type: 'hasMany', target: 'goal' },
      ],
    },
    plan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'plan_type', type: 'enum', required: true },
        { name: 'created_date', type: 'date', required: true },
        { name: 'review_date', type: 'date' },
        { name: 'net_worth_analysis', type: 'json' },
        { name: 'cash_flow_analysis', type: 'json' },
        { name: 'retirement_projection', type: 'json' },
        { name: 'insurance_analysis', type: 'json' },
        { name: 'estate_planning', type: 'json' },
        { name: 'tax_planning', type: 'json' },
        { name: 'recommendations', type: 'json' },
        { name: 'action_items', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'goal' },
      ],
    },
    meeting: {
      defaultFields: [
        { name: 'meeting_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'meeting_type', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'agenda', type: 'json' },
        { name: 'topics_discussed', type: 'json' },
        { name: 'decisions_made', type: 'json' },
        { name: 'action_items', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    goal: {
      defaultFields: [
        { name: 'goal_name', type: 'string', required: true },
        { name: 'goal_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'target_amount', type: 'decimal' },
        { name: 'current_amount', type: 'decimal' },
        { name: 'target_date', type: 'date' },
        { name: 'monthly_contribution', type: 'decimal' },
        { name: 'priority', type: 'enum' },
        { name: 'funding_strategy', type: 'text' },
        { name: 'progress_percent', type: 'decimal' },
        { name: 'milestones', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'plan' },
      ],
    },
    document: {
      defaultFields: [
        { name: 'document_name', type: 'string', required: true },
        { name: 'document_type', type: 'enum', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'file_url', type: 'string' },
        { name: 'upload_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'is_shared', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'service_period', type: 'json' },
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
      ],
    },
  },
};

export default financialplannerBlueprint;
