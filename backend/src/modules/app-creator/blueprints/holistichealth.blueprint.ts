import { Blueprint } from './blueprint.interface';

/**
 * Holistic Health Center Blueprint
 */
export const holistichealthBlueprint: Blueprint = {
  appType: 'holistichealth',
  description: 'Holistic health center with clients, services, practitioners, and wellness programs',

  coreEntities: ['client', 'appointment', 'practitioner', 'service', 'program', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Practitioners', path: '/practitioners', icon: 'UserCheck' },
        { label: 'Services', path: '/services', icon: 'Sparkles' },
        { label: 'Programs', path: '/programs', icon: 'LayoutList' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
    ]},
    { path: '/practitioners', name: 'Practitioners', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'practitioner-grid', component: 'staff-grid', entity: 'practitioner', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'product-grid', entity: 'service', position: 'main' },
    ]},
    { path: '/programs', name: 'Programs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'program-grid', component: 'product-grid', entity: 'program', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/practitioners', entity: 'practitioner', operation: 'list' },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'GET', path: '/programs', entity: 'program', operation: 'list' },
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
        { name: 'address', type: 'json' },
        { name: 'health_concerns', type: 'json' },
        { name: 'wellness_goals', type: 'json' },
        { name: 'preferred_modalities', type: 'json' },
        { name: 'lifestyle_info', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'program' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'reason', type: 'text' },
        { name: 'session_notes', type: 'text' },
        { name: 'recommendations', type: 'json' },
        { name: 'follow_up_actions', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'practitioner' },
        { type: 'belongsTo', target: 'service' },
      ],
    },
    practitioner: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'title', type: 'string' },
        { name: 'specializations', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'philosophy', type: 'text' },
        { name: 'availability', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'service' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'service_name', type: 'string', required: true },
        { name: 'modality', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'benefits', type: 'json' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'what_to_expect', type: 'text' },
        { name: 'contraindications', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'practitioner' },
      ],
    },
    program: {
      defaultFields: [
        { name: 'program_name', type: 'string', required: true },
        { name: 'program_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'duration_weeks', type: 'integer' },
        { name: 'sessions_included', type: 'integer' },
        { name: 'modalities_included', type: 'json' },
        { name: 'goals', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
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

export default holistichealthBlueprint;
