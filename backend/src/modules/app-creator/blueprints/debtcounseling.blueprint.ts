import { Blueprint } from './blueprint.interface';

/**
 * Debt Counseling Blueprint
 */
export const debtcounselingBlueprint: Blueprint = {
  appType: 'debtcounseling',
  description: 'Debt counseling agency with clients, debt plans, creditors, and payment tracking',

  coreEntities: ['client', 'debtplan', 'session', 'creditor', 'payment', 'document'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Debt Plans', path: '/debtplans', icon: 'FileText' },
        { label: 'Sessions', path: '/sessions', icon: 'Calendar' },
        { label: 'Creditors', path: '/creditors', icon: 'Building' },
        { label: 'Payments', path: '/payments', icon: 'DollarSign' },
        { label: 'Documents', path: '/documents', icon: 'FolderOpen' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-sessions', component: 'appointment-list', entity: 'session', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/debtplans', name: 'Debt Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'debtplan-table', component: 'data-table', entity: 'debtplan', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-calendar', component: 'appointment-calendar', entity: 'session', position: 'main' },
    ]},
    { path: '/creditors', name: 'Creditors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'creditor-table', component: 'data-table', entity: 'creditor', position: 'main' },
    ]},
    { path: '/payments', name: 'Payments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payment-table', component: 'data-table', entity: 'payment', position: 'main' },
    ]},
    { path: '/documents', name: 'Documents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'document-table', component: 'data-table', entity: 'document', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'session', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/debtplans', entity: 'debtplan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create' },
    { method: 'GET', path: '/creditors', entity: 'creditor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/payments', entity: 'payment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'employment_status', type: 'enum' },
        { name: 'employer', type: 'string' },
        { name: 'monthly_income', type: 'decimal' },
        { name: 'monthly_expenses', type: 'decimal' },
        { name: 'total_debt', type: 'decimal' },
        { name: 'debt_types', type: 'json' },
        { name: 'hardship_reason', type: 'text' },
        { name: 'financial_goals', type: 'json' },
        { name: 'referral_source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'debtplan' },
        { type: 'hasMany', target: 'session' },
        { type: 'hasMany', target: 'creditor' },
      ],
    },
    debtplan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'plan_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'target_completion', type: 'date' },
        { name: 'total_debt_enrolled', type: 'decimal' },
        { name: 'current_balance', type: 'decimal' },
        { name: 'monthly_payment', type: 'decimal' },
        { name: 'payment_day', type: 'integer' },
        { name: 'debts_included', type: 'json' },
        { name: 'negotiated_settlements', type: 'json' },
        { name: 'interest_reductions', type: 'json' },
        { name: 'progress_percent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'payment' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'topics_covered', type: 'json' },
        { name: 'budget_review', type: 'json' },
        { name: 'action_items', type: 'json' },
        { name: 'resources_provided', type: 'json' },
        { name: 'counselor_notes', type: 'text' },
        { name: 'next_session_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    creditor: {
      defaultFields: [
        { name: 'creditor_name', type: 'string', required: true },
        { name: 'creditor_type', type: 'enum', required: true },
        { name: 'account_number', type: 'string' },
        { name: 'original_balance', type: 'decimal' },
        { name: 'current_balance', type: 'decimal' },
        { name: 'interest_rate', type: 'decimal' },
        { name: 'minimum_payment', type: 'decimal' },
        { name: 'payment_due_date', type: 'integer' },
        { name: 'contact_info', type: 'json' },
        { name: 'negotiation_notes', type: 'text' },
        { name: 'settlement_amount', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    payment: {
      defaultFields: [
        { name: 'payment_date', type: 'date', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'payment_type', type: 'enum' },
        { name: 'creditor_payments', type: 'json' },
        { name: 'service_fee', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'confirmation_number', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'debtplan' },
      ],
    },
    document: {
      defaultFields: [
        { name: 'document_name', type: 'string', required: true },
        { name: 'document_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'file_url', type: 'string' },
        { name: 'upload_date', type: 'date' },
        { name: 'is_signed', type: 'boolean' },
        { name: 'signed_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
  },
};

export default debtcounselingBlueprint;
