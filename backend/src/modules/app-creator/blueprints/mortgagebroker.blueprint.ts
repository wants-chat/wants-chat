import { Blueprint } from './blueprint.interface';

/**
 * Mortgage Broker Blueprint
 */
export const mortgagebrokerBlueprint: Blueprint = {
  appType: 'mortgagebroker',
  description: 'Mortgage broker app with applications, loans, clients, and lender relationships',

  coreEntities: ['application', 'loan', 'client', 'lender', 'document', 'task'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Applications', path: '/applications', icon: 'FileText' },
        { label: 'Loans', path: '/loans', icon: 'Home' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Lenders', path: '/lenders', icon: 'Building' },
        { label: 'Documents', path: '/documents', icon: 'FolderOpen' },
        { label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'pipeline', component: 'kanban-board', entity: 'application', position: 'main' },
    ]},
    { path: '/applications', name: 'Applications', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'application', position: 'main' },
      { id: 'application-table', component: 'data-table', entity: 'application', position: 'main' },
    ]},
    { path: '/loans', name: 'Loans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'loan-table', component: 'data-table', entity: 'loan', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/lenders', name: 'Lenders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lender-table', component: 'data-table', entity: 'lender', position: 'main' },
    ]},
    { path: '/documents', name: 'Documents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'document-table', component: 'data-table', entity: 'document', position: 'main' },
    ]},
    { path: '/tasks', name: 'Tasks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'task-board', component: 'kanban-board', entity: 'task', position: 'main' },
    ]},
    { path: '/apply', name: 'Apply for a Mortgage', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'application-form', component: 'booking-wizard', entity: 'application', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/applications', entity: 'application', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/applications', entity: 'application', operation: 'create' },
    { method: 'GET', path: '/loans', entity: 'loan', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/loans', entity: 'loan', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/lenders', entity: 'lender', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/documents', entity: 'document', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/tasks', entity: 'task', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tasks', entity: 'task', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    application: {
      defaultFields: [
        { name: 'application_number', type: 'string', required: true },
        { name: 'application_date', type: 'date', required: true },
        { name: 'loan_type', type: 'enum', required: true },
        { name: 'loan_purpose', type: 'enum', required: true },
        { name: 'property_address', type: 'json' },
        { name: 'property_type', type: 'enum' },
        { name: 'purchase_price', type: 'decimal' },
        { name: 'down_payment', type: 'decimal' },
        { name: 'loan_amount', type: 'decimal', required: true },
        { name: 'borrower_income', type: 'decimal' },
        { name: 'borrower_assets', type: 'decimal' },
        { name: 'credit_score', type: 'integer' },
        { name: 'dti_ratio', type: 'decimal' },
        { name: 'ltv_ratio', type: 'decimal' },
        { name: 'loan_officer', type: 'string' },
        { name: 'processor', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'lender' },
        { type: 'hasOne', target: 'loan' },
        { type: 'hasMany', target: 'document' },
        { type: 'hasMany', target: 'task' },
      ],
    },
    loan: {
      defaultFields: [
        { name: 'loan_number', type: 'string', required: true },
        { name: 'loan_type', type: 'enum', required: true },
        { name: 'loan_amount', type: 'decimal', required: true },
        { name: 'interest_rate', type: 'decimal', required: true },
        { name: 'loan_term', type: 'integer', required: true },
        { name: 'monthly_payment', type: 'decimal' },
        { name: 'apr', type: 'decimal' },
        { name: 'origination_fee', type: 'decimal' },
        { name: 'discount_points', type: 'decimal' },
        { name: 'closing_costs', type: 'decimal' },
        { name: 'rate_lock_date', type: 'date' },
        { name: 'rate_lock_expiry', type: 'date' },
        { name: 'closing_date', type: 'date' },
        { name: 'funded_date', type: 'date' },
        { name: 'commission_amount', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'application' },
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'lender' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'ssn_last_four', type: 'string' },
        { name: 'address', type: 'json' },
        { name: 'employment_status', type: 'enum' },
        { name: 'employer', type: 'string' },
        { name: 'job_title', type: 'string' },
        { name: 'annual_income', type: 'decimal' },
        { name: 'co_borrower', type: 'json' },
        { name: 'referral_source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'application' },
        { type: 'hasMany', target: 'loan' },
      ],
    },
    lender: {
      defaultFields: [
        { name: 'lender_name', type: 'string', required: true },
        { name: 'lender_type', type: 'enum', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'loan_products', type: 'json' },
        { name: 'rate_sheet_url', type: 'string' },
        { name: 'minimum_credit_score', type: 'integer' },
        { name: 'max_dti', type: 'decimal' },
        { name: 'max_ltv', type: 'decimal' },
        { name: 'compensation', type: 'json' },
        { name: 'turnaround_time', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'application' },
        { type: 'hasMany', target: 'loan' },
      ],
    },
    document: {
      defaultFields: [
        { name: 'document_name', type: 'string', required: true },
        { name: 'document_type', type: 'enum', required: true },
        { name: 'category', type: 'enum' },
        { name: 'uploaded_date', type: 'date' },
        { name: 'uploaded_by', type: 'string' },
        { name: 'file_url', type: 'string' },
        { name: 'file_size', type: 'integer' },
        { name: 'expiry_date', type: 'date' },
        { name: 'verified', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'application' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
    task: {
      defaultFields: [
        { name: 'task_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'task_type', type: 'enum' },
        { name: 'priority', type: 'enum' },
        { name: 'assigned_to', type: 'string' },
        { name: 'due_date', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'application' },
      ],
    },
  },
};

export default mortgagebrokerBlueprint;
