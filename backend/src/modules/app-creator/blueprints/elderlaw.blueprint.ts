import { Blueprint } from './blueprint.interface';

/**
 * Elder Law Blueprint
 */
export const elderlawBlueprint: Blueprint = {
  appType: 'elderlaw',
  description: 'Elder law practice with clients, cases, estate planning, and guardianship matters',

  coreEntities: ['client', 'case', 'document', 'appointment', 'billing', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Cases', path: '/cases', icon: 'Briefcase' },
        { label: 'Documents', path: '/documents', icon: 'FileText' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Billing', path: '/billing', icon: 'Clock' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/cases', name: 'Cases', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'case-board', component: 'kanban-board', entity: 'case', position: 'main' },
    ]},
    { path: '/documents', name: 'Documents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'document-table', component: 'data-table', entity: 'document', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-table', component: 'data-table', entity: 'billing', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/consultation', name: 'Consultation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'consultation-form', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/cases', entity: 'case', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/cases', entity: 'case', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/billing', entity: 'billing', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'address', type: 'json' },
        { name: 'client_type', type: 'enum' },
        { name: 'family_members', type: 'json' },
        { name: 'power_of_attorney', type: 'json' },
        { name: 'healthcare_proxy', type: 'json' },
        { name: 'referral_source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'case' },
        { type: 'hasMany', target: 'appointment' },
      ],
    },
    case: {
      defaultFields: [
        { name: 'case_number', type: 'string', required: true },
        { name: 'case_type', type: 'enum', required: true },
        { name: 'case_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'open_date', type: 'date', required: true },
        { name: 'close_date', type: 'date' },
        { name: 'court', type: 'string' },
        { name: 'judge', type: 'string' },
        { name: 'opposing_parties', type: 'json' },
        { name: 'opposing_counsel', type: 'json' },
        { name: 'deadlines', type: 'json' },
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
        { name: 'description', type: 'text' },
        { name: 'document_date', type: 'date' },
        { name: 'file_url', type: 'string' },
        { name: 'execution_date', type: 'date' },
        { name: 'witnesses', type: 'json' },
        { name: 'notarized', type: 'boolean' },
        { name: 'expiration_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'case' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'appointment_type', type: 'enum' },
        { name: 'location', type: 'string' },
        { name: 'attendees', type: 'json' },
        { name: 'agenda', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'follow_up_needed', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'case' },
      ],
    },
    billing: {
      defaultFields: [
        { name: 'entry_date', type: 'date', required: true },
        { name: 'billing_type', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'hours', type: 'decimal' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'flat_fee', type: 'decimal' },
        { name: 'expense_amount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'billable', type: 'boolean' },
        { name: 'billed', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'case' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'billing_period', type: 'json' },
        { name: 'line_items', type: 'json' },
        { name: 'fees', type: 'decimal' },
        { name: 'expenses', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'retainer_applied', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'case' },
      ],
    },
  },
};

export default elderlawBlueprint;
