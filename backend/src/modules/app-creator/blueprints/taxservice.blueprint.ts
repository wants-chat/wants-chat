import { Blueprint } from './blueprint.interface';

/**
 * Tax Service Blueprint
 */
export const taxserviceBlueprint: Blueprint = {
  appType: 'taxservice',
  description: 'Tax preparation service app with clients, returns, documents, and appointments',

  coreEntities: ['client', 'tax_return', 'document', 'appointment', 'service', 'payment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Tax Returns', path: '/returns', icon: 'FileText' },
        { label: 'Documents', path: '/documents', icon: 'FolderOpen' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Services', path: '/services', icon: 'Briefcase' },
        { label: 'Payments', path: '/payments', icon: 'CreditCard' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'pending-returns', component: 'data-table', entity: 'tax_return', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/returns', name: 'Tax Returns', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'tax_return', position: 'main' },
      { id: 'return-table', component: 'data-table', entity: 'tax_return', position: 'main' },
    ]},
    { path: '/documents', name: 'Documents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'document-table', component: 'data-table', entity: 'document', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
      { id: 'appointment-list', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'plan-grid', entity: 'service', position: 'main' },
    ]},
    { path: '/payments', name: 'Payments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payment-table', component: 'data-table', entity: 'payment', position: 'main' },
    ]},
    { path: '/book', name: 'Schedule Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/returns', entity: 'tax_return', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/returns', entity: 'tax_return', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/documents', entity: 'document', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'GET', path: '/payments', entity: 'payment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/payments', entity: 'payment', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'client_number', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'ssn_last_four', type: 'string' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'address', type: 'json' },
        { name: 'filing_status', type: 'enum' },
        { name: 'dependents', type: 'json' },
        { name: 'income_sources', type: 'json' },
        { name: 'preferred_refund_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'tax_return' },
        { type: 'hasMany', target: 'document' },
        { type: 'hasMany', target: 'appointment' },
      ],
    },
    tax_return: {
      defaultFields: [
        { name: 'return_number', type: 'string', required: true },
        { name: 'tax_year', type: 'integer', required: true },
        { name: 'return_type', type: 'enum', required: true },
        { name: 'filing_status', type: 'enum', required: true },
        { name: 'gross_income', type: 'decimal' },
        { name: 'adjustments', type: 'decimal' },
        { name: 'deductions', type: 'decimal' },
        { name: 'taxable_income', type: 'decimal' },
        { name: 'tax_liability', type: 'decimal' },
        { name: 'payments_withheld', type: 'decimal' },
        { name: 'refund_amount', type: 'decimal' },
        { name: 'amount_owed', type: 'decimal' },
        { name: 'preparer', type: 'string' },
        { name: 'filed_date', type: 'date' },
        { name: 'accepted_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'document' },
      ],
    },
    document: {
      defaultFields: [
        { name: 'document_name', type: 'string', required: true },
        { name: 'document_type', type: 'enum', required: true },
        { name: 'tax_year', type: 'integer' },
        { name: 'file_url', type: 'string' },
        { name: 'file_size', type: 'integer' },
        { name: 'uploaded_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'tax_return' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'appointment_number', type: 'string', required: true },
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'client_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'appointment_type', type: 'enum', required: true },
        { name: 'preparer', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'service' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'service_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'return_types', type: 'json' },
        { name: 'includes', type: 'json' },
        { name: 'base_price', type: 'decimal', required: true },
        { name: 'complexity_fees', type: 'json' },
        { name: 'estimated_time', type: 'string' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    payment: {
      defaultFields: [
        { name: 'payment_number', type: 'string', required: true },
        { name: 'payment_date', type: 'date', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum', required: true },
        { name: 'services_rendered', type: 'json' },
        { name: 'tax_year', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'tax_return' },
      ],
    },
  },
};

export default taxserviceBlueprint;
