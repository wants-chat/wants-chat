import { Blueprint } from './blueprint.interface';

/**
 * Tax Planning Blueprint
 */
export const taxplanningBlueprint: Blueprint = {
  appType: 'taxplanning',
  description: 'Tax planning service with clients, strategies, projections, and document management',

  coreEntities: ['client', 'taxplan', 'meeting', 'projection', 'document', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Tax Plans', path: '/taxplans', icon: 'FileText' },
        { label: 'Meetings', path: '/meetings', icon: 'Calendar' },
        { label: 'Projections', path: '/projections', icon: 'Calculator' },
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
    { path: '/taxplans', name: 'Tax Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'taxplan-table', component: 'data-table', entity: 'taxplan', position: 'main' },
    ]},
    { path: '/meetings', name: 'Meetings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'meeting-calendar', component: 'appointment-calendar', entity: 'meeting', position: 'main' },
    ]},
    { path: '/projections', name: 'Projections', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'projection-table', component: 'data-table', entity: 'projection', position: 'main' },
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
    { method: 'GET', path: '/taxplans', entity: 'taxplan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/meetings', entity: 'meeting', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/meetings', entity: 'meeting', operation: 'create' },
    { method: 'GET', path: '/projections', entity: 'projection', operation: 'list', requiresAuth: true },
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
        { name: 'address', type: 'json' },
        { name: 'filing_status', type: 'enum' },
        { name: 'dependents', type: 'integer' },
        { name: 'occupation', type: 'string' },
        { name: 'employer', type: 'string' },
        { name: 'self_employed', type: 'boolean' },
        { name: 'income_sources', type: 'json' },
        { name: 'investment_accounts', type: 'json' },
        { name: 'real_estate', type: 'json' },
        { name: 'business_interests', type: 'json' },
        { name: 'tax_situation', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'taxplan' },
        { type: 'hasMany', target: 'meeting' },
        { type: 'hasMany', target: 'projection' },
      ],
    },
    taxplan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'tax_year', type: 'integer', required: true },
        { name: 'created_date', type: 'date' },
        { name: 'review_date', type: 'date' },
        { name: 'income_strategy', type: 'json' },
        { name: 'deduction_strategy', type: 'json' },
        { name: 'retirement_strategy', type: 'json' },
        { name: 'investment_strategy', type: 'json' },
        { name: 'business_strategy', type: 'json' },
        { name: 'estate_strategy', type: 'json' },
        { name: 'charitable_strategy', type: 'json' },
        { name: 'estimated_savings', type: 'decimal' },
        { name: 'action_items', type: 'json' },
        { name: 'deadlines', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'projection' },
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
        { name: 'topics_covered', type: 'json' },
        { name: 'recommendations', type: 'json' },
        { name: 'action_items', type: 'json' },
        { name: 'documents_reviewed', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    projection: {
      defaultFields: [
        { name: 'projection_name', type: 'string', required: true },
        { name: 'tax_year', type: 'integer', required: true },
        { name: 'projection_date', type: 'date' },
        { name: 'gross_income', type: 'decimal' },
        { name: 'adjustments', type: 'json' },
        { name: 'agi', type: 'decimal' },
        { name: 'deductions', type: 'json' },
        { name: 'taxable_income', type: 'decimal' },
        { name: 'federal_tax', type: 'decimal' },
        { name: 'state_tax', type: 'decimal' },
        { name: 'self_employment_tax', type: 'decimal' },
        { name: 'credits', type: 'json' },
        { name: 'total_tax', type: 'decimal' },
        { name: 'effective_rate', type: 'decimal' },
        { name: 'marginal_rate', type: 'decimal' },
        { name: 'withholdings', type: 'decimal' },
        { name: 'estimated_payments', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'taxplan' },
      ],
    },
    document: {
      defaultFields: [
        { name: 'document_name', type: 'string', required: true },
        { name: 'document_type', type: 'enum', required: true },
        { name: 'tax_year', type: 'integer' },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'file_url', type: 'string' },
        { name: 'upload_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
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

export default taxplanningBlueprint;
