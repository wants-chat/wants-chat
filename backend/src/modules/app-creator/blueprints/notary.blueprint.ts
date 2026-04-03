import { Blueprint } from './blueprint.interface';

/**
 * Notary Public Blueprint
 */
export const notaryBlueprint: Blueprint = {
  appType: 'notary',
  description: 'Notary public app with appointments, documents, clients, and mobile signings',

  coreEntities: ['appointment', 'document', 'client', 'signing', 'service', 'payment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Documents', path: '/documents', icon: 'FileText' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Signings', path: '/signings', icon: 'PenTool' },
        { label: 'Services', path: '/services', icon: 'Briefcase' },
        { label: 'Payments', path: '/payments', icon: 'CreditCard' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
      { id: 'appointment-list', component: 'data-table', entity: 'appointment', position: 'main' },
    ]},
    { path: '/documents', name: 'Documents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'document', position: 'main' },
      { id: 'document-table', component: 'data-table', entity: 'document', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/signings', name: 'Signings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'signing-table', component: 'data-table', entity: 'signing', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'plan-grid', entity: 'service', position: 'main' },
    ]},
    { path: '/payments', name: 'Payments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payment-table', component: 'data-table', entity: 'payment', position: 'main' },
    ]},
    { path: '/book', name: 'Book Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'service-grid', component: 'plan-grid', entity: 'service', position: 'main' },
      { id: 'booking-form', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/documents', entity: 'document', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/signings', entity: 'signing', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/signings', entity: 'signing', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'GET', path: '/payments', entity: 'payment', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    appointment: {
      defaultFields: [
        { name: 'appointment_number', type: 'string', required: true },
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'appointment_time', type: 'datetime', required: true },
        { name: 'client_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'document_type', type: 'string' },
        { name: 'number_of_documents', type: 'integer' },
        { name: 'number_of_signatures', type: 'integer' },
        { name: 'location_type', type: 'enum' },
        { name: 'address', type: 'json' },
        { name: 'special_instructions', type: 'text' },
        { name: 'estimated_fee', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'service' },
        { type: 'hasMany', target: 'signing' },
      ],
    },
    document: {
      defaultFields: [
        { name: 'document_number', type: 'string', required: true },
        { name: 'document_type', type: 'enum', required: true },
        { name: 'document_name', type: 'string', required: true },
        { name: 'signer_names', type: 'json' },
        { name: 'date_notarized', type: 'date' },
        { name: 'notary_act', type: 'enum' },
        { name: 'id_verified', type: 'boolean' },
        { name: 'id_type', type: 'string' },
        { name: 'journal_entry', type: 'string' },
        { name: 'thumbprint_taken', type: 'boolean' },
        { name: 'file_url', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'signing' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'id_on_file', type: 'boolean' },
        { name: 'id_type', type: 'string' },
        { name: 'id_expiry', type: 'date' },
        { name: 'company_name', type: 'string' },
        { name: 'referral_source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'document' },
        { type: 'hasMany', target: 'signing' },
      ],
    },
    signing: {
      defaultFields: [
        { name: 'signing_number', type: 'string', required: true },
        { name: 'signing_date', type: 'date', required: true },
        { name: 'signing_time', type: 'datetime', required: true },
        { name: 'location', type: 'json', required: true },
        { name: 'signing_type', type: 'enum', required: true },
        { name: 'documents_notarized', type: 'integer' },
        { name: 'signatures_witnessed', type: 'integer' },
        { name: 'oaths_administered', type: 'integer' },
        { name: 'travel_fee', type: 'decimal' },
        { name: 'notary_fee', type: 'decimal' },
        { name: 'total_fee', type: 'decimal' },
        { name: 'mileage', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'appointment' },
        { type: 'hasMany', target: 'document' },
        { type: 'hasOne', target: 'payment' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'service_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'base_fee', type: 'decimal', required: true },
        { name: 'per_signature_fee', type: 'decimal' },
        { name: 'travel_fee', type: 'decimal' },
        { name: 'after_hours_fee', type: 'decimal' },
        { name: 'weekend_fee', type: 'decimal' },
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
        { name: 'receipt_sent', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'signing' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
  },
};

export default notaryBlueprint;
