import { Blueprint } from './blueprint.interface';

/**
 * Doula/Birth Services Blueprint
 */
export const doulaBlueprint: Blueprint = {
  appType: 'doula',
  description: 'Birth doula app with clients, appointments, birth plans, and postpartum support',

  coreEntities: ['client', 'appointment', 'birthplan', 'visit', 'resource', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Birth Plans', path: '/birthplans', icon: 'FileText' },
        { label: 'Visits', path: '/visits', icon: 'Home' },
        { label: 'Resources', path: '/resources', icon: 'BookOpen' },
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
    { path: '/birthplans', name: 'Birth Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'birthplan-table', component: 'data-table', entity: 'birthplan', position: 'main' },
    ]},
    { path: '/visits', name: 'Visits', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'visit-table', component: 'data-table', entity: 'visit', position: 'main' },
    ]},
    { path: '/resources', name: 'Resources', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'resource-grid', component: 'product-grid', entity: 'resource', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/contact', name: 'Contact', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'contact-form', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/birthplans', entity: 'birthplan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/visits', entity: 'visit', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/resources', entity: 'resource', operation: 'list' },
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
        { name: 'partner_name', type: 'string' },
        { name: 'partner_phone', type: 'phone' },
        { name: 'due_date', type: 'date', required: true },
        { name: 'provider_name', type: 'string' },
        { name: 'provider_type', type: 'enum' },
        { name: 'birth_location', type: 'string' },
        { name: 'birth_type', type: 'enum' },
        { name: 'medical_history', type: 'json' },
        { name: 'previous_births', type: 'json' },
        { name: 'package_selected', type: 'enum' },
        { name: 'referral_source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasOne', target: 'birthplan' },
        { type: 'hasMany', target: 'visit' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'appointment_type', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'location_type', type: 'enum' },
        { name: 'purpose', type: 'text' },
        { name: 'topics_covered', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'follow_up_items', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    birthplan: {
      defaultFields: [
        { name: 'birth_preferences', type: 'json' },
        { name: 'pain_management', type: 'json' },
        { name: 'labor_preferences', type: 'json' },
        { name: 'delivery_preferences', type: 'json' },
        { name: 'cesarean_preferences', type: 'json' },
        { name: 'immediate_postpartum', type: 'json' },
        { name: 'newborn_care', type: 'json' },
        { name: 'feeding_preferences', type: 'json' },
        { name: 'support_people', type: 'json' },
        { name: 'photography_preferences', type: 'json' },
        { name: 'special_requests', type: 'text' },
        { name: 'created_date', type: 'date' },
        { name: 'last_updated', type: 'date' },
        { name: 'version', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    visit: {
      defaultFields: [
        { name: 'visit_date', type: 'date', required: true },
        { name: 'visit_time', type: 'datetime' },
        { name: 'visit_type', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'services_provided', type: 'json' },
        { name: 'client_status', type: 'text' },
        { name: 'baby_status', type: 'text' },
        { name: 'feeding_notes', type: 'text' },
        { name: 'emotional_support', type: 'text' },
        { name: 'recommendations', type: 'json' },
        { name: 'next_steps', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    resource: {
      defaultFields: [
        { name: 'resource_name', type: 'string', required: true },
        { name: 'resource_type', type: 'enum', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'content', type: 'text' },
        { name: 'file_url', type: 'string' },
        { name: 'external_url', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'tags', type: 'json' },
        { name: 'is_public', type: 'boolean' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'package_name', type: 'string' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_plan', type: 'json' },
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

export default doulaBlueprint;
