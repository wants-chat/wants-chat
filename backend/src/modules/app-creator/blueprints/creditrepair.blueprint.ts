import { Blueprint } from './blueprint.interface';

/**
 * Credit Repair Blueprint
 */
export const creditrepairBlueprint: Blueprint = {
  appType: 'creditrepair',
  description: 'Credit repair service with clients, disputes, credit reports, and progress tracking',

  coreEntities: ['client', 'dispute', 'creditreport', 'consultation', 'task', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Disputes', path: '/disputes', icon: 'Scale' },
        { label: 'Credit Reports', path: '/creditreports', icon: 'FileText' },
        { label: 'Consultations', path: '/consultations', icon: 'Calendar' },
        { label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-consultations', component: 'appointment-list', entity: 'consultation', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/disputes', name: 'Disputes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'dispute-board', component: 'kanban-board', entity: 'dispute', position: 'main' },
    ]},
    { path: '/creditreports', name: 'Credit Reports', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'creditreport-table', component: 'data-table', entity: 'creditreport', position: 'main' },
    ]},
    { path: '/consultations', name: 'Consultations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'consultation-calendar', component: 'appointment-calendar', entity: 'consultation', position: 'main' },
    ]},
    { path: '/tasks', name: 'Tasks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'task-board', component: 'kanban-board', entity: 'task', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'consultation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/disputes', entity: 'dispute', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/creditreports', entity: 'creditreport', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/consultations', entity: 'consultation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/consultations', entity: 'consultation', operation: 'create' },
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
        { name: 'ssn_last_four', type: 'string' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'credit_goals', type: 'json' },
        { name: 'starting_scores', type: 'json' },
        { name: 'current_scores', type: 'json' },
        { name: 'package_enrolled', type: 'enum' },
        { name: 'enrollment_date', type: 'date' },
        { name: 'referral_source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'dispute' },
        { type: 'hasMany', target: 'creditreport' },
        { type: 'hasMany', target: 'consultation' },
      ],
    },
    dispute: {
      defaultFields: [
        { name: 'dispute_reason', type: 'string', required: true },
        { name: 'bureau', type: 'enum', required: true },
        { name: 'creditor_name', type: 'string' },
        { name: 'account_number', type: 'string' },
        { name: 'account_type', type: 'enum' },
        { name: 'balance_reported', type: 'decimal' },
        { name: 'dispute_type', type: 'enum' },
        { name: 'dispute_letter', type: 'text' },
        { name: 'date_sent', type: 'date' },
        { name: 'response_deadline', type: 'date' },
        { name: 'response_received', type: 'date' },
        { name: 'response_details', type: 'text' },
        { name: 'outcome', type: 'enum' },
        { name: 'points_gained', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    creditreport: {
      defaultFields: [
        { name: 'report_date', type: 'date', required: true },
        { name: 'bureau', type: 'enum', required: true },
        { name: 'credit_score', type: 'integer' },
        { name: 'score_model', type: 'enum' },
        { name: 'total_accounts', type: 'integer' },
        { name: 'negative_items', type: 'integer' },
        { name: 'collections', type: 'integer' },
        { name: 'public_records', type: 'integer' },
        { name: 'inquiries', type: 'integer' },
        { name: 'credit_utilization', type: 'decimal' },
        { name: 'accounts_detail', type: 'json' },
        { name: 'negative_items_detail', type: 'json' },
        { name: 'file_url', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    consultation: {
      defaultFields: [
        { name: 'consultation_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'consultation_type', type: 'enum', required: true },
        { name: 'topics_covered', type: 'json' },
        { name: 'credit_analysis', type: 'text' },
        { name: 'recommendations', type: 'json' },
        { name: 'action_items', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'next_consultation', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    task: {
      defaultFields: [
        { name: 'task_name', type: 'string', required: true },
        { name: 'task_type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'due_date', type: 'date' },
        { name: 'priority', type: 'enum' },
        { name: 'assigned_to', type: 'string' },
        { name: 'completed_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
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

export default creditrepairBlueprint;
