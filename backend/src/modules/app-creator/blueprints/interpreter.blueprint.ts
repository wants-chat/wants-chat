import { Blueprint } from './blueprint.interface';

/**
 * Interpreter Services Blueprint
 */
export const interpreterBlueprint: Blueprint = {
  appType: 'interpreter',
  description: 'Interpretation services app with bookings, interpreters, clients, and scheduling',

  coreEntities: ['booking', 'interpreter', 'client', 'session', 'invoice', 'language'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Interpreters', path: '/interpreters', icon: 'Users' },
        { label: 'Clients', path: '/clients', icon: 'Briefcase' },
        { label: 'Sessions', path: '/sessions', icon: 'MessageSquare' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
        { label: 'Languages', path: '/languages', icon: 'Globe' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-bookings', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
    ]},
    { path: '/interpreters', name: 'Interpreters', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'interpreter-grid', component: 'staff-grid', entity: 'interpreter', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-table', component: 'data-table', entity: 'session', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/languages', name: 'Languages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'language-table', component: 'data-table', entity: 'language', position: 'main' },
    ]},
    { path: '/book', name: 'Book Interpreter', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/interpreters', entity: 'interpreter', operation: 'list' },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/languages', entity: 'language', operation: 'list' },
  ],

  entityConfig: {
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'service_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'interpretation_type', type: 'enum', required: true },
        { name: 'source_language', type: 'string', required: true },
        { name: 'target_language', type: 'string', required: true },
        { name: 'subject_matter', type: 'string' },
        { name: 'location_type', type: 'enum' },
        { name: 'location_address', type: 'json' },
        { name: 'remote_platform', type: 'string' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'travel_fee', type: 'decimal' },
        { name: 'equipment_fee', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'special_requirements', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'interpreter' },
        { type: 'hasOne', target: 'session' },
      ],
    },
    interpreter: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'native_language', type: 'string', required: true },
        { name: 'language_pairs', type: 'json', required: true },
        { name: 'interpretation_modes', type: 'json' },
        { name: 'specializations', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'court_certified', type: 'boolean' },
        { name: 'medical_certified', type: 'boolean' },
        { name: 'years_experience', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'travel_radius', type: 'integer' },
        { name: 'has_equipment', type: 'boolean' },
        { name: 'availability', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'session' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'industry', type: 'string' },
        { name: 'client_type', type: 'enum' },
        { name: 'common_languages', type: 'json' },
        { name: 'billing_address', type: 'json' },
        { name: 'payment_terms', type: 'string' },
        { name: 'total_bookings', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_date', type: 'date', required: true },
        { name: 'actual_start', type: 'datetime' },
        { name: 'actual_end', type: 'datetime' },
        { name: 'actual_duration', type: 'decimal' },
        { name: 'interpretation_mode', type: 'enum' },
        { name: 'attendee_count', type: 'integer' },
        { name: 'session_notes', type: 'text' },
        { name: 'technical_issues', type: 'text' },
        { name: 'client_feedback', type: 'text' },
        { name: 'rating', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'booking' },
        { type: 'belongsTo', target: 'interpreter' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_date', type: 'date' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'booking' },
      ],
    },
    language: {
      defaultFields: [
        { name: 'language_name', type: 'string', required: true },
        { name: 'language_code', type: 'string' },
        { name: 'is_common', type: 'boolean' },
        { name: 'interpreter_count', type: 'integer' },
        { name: 'standard_rate', type: 'decimal' },
        { name: 'rush_rate', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default interpreterBlueprint;
