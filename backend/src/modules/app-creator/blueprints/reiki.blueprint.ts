import { Blueprint } from './blueprint.interface';

/**
 * Reiki/Energy Healing Blueprint
 */
export const reikiBlueprint: Blueprint = {
  appType: 'reiki',
  description: 'Reiki and energy healing practice with clients, sessions, practitioners, and training',

  coreEntities: ['client', 'session', 'practitioner', 'training', 'product', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Sessions', path: '/sessions', icon: 'Calendar' },
        { label: 'Practitioners', path: '/practitioners', icon: 'Heart' },
        { label: 'Training', path: '/training', icon: 'GraduationCap' },
        { label: 'Products', path: '/products', icon: 'Package' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-sessions', component: 'appointment-list', entity: 'session', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-calendar', component: 'appointment-calendar', entity: 'session', position: 'main' },
    ]},
    { path: '/practitioners', name: 'Practitioners', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'practitioner-grid', component: 'staff-grid', entity: 'practitioner', position: 'main' },
    ]},
    { path: '/training', name: 'Training', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'training-grid', component: 'product-grid', entity: 'training', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'session', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create' },
    { method: 'GET', path: '/practitioners', entity: 'practitioner', operation: 'list' },
    { method: 'GET', path: '/training', entity: 'training', operation: 'list' },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'healing_goals', type: 'json' },
        { name: 'health_concerns', type: 'json' },
        { name: 'energy_sensitivities', type: 'text' },
        { name: 'reiki_experience', type: 'enum' },
        { name: 'preferred_practitioner', type: 'string' },
        { name: 'session_preferences', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'session' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'modality', type: 'enum' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'location_type', type: 'enum' },
        { name: 'intention_set', type: 'text' },
        { name: 'pre_session_notes', type: 'text' },
        { name: 'areas_treated', type: 'json' },
        { name: 'practitioner_observations', type: 'text' },
        { name: 'client_feedback', type: 'text' },
        { name: 'recommendations', type: 'json' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'price', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'practitioner' },
      ],
    },
    practitioner: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'title', type: 'string' },
        { name: 'reiki_level', type: 'enum', required: true },
        { name: 'lineage', type: 'string' },
        { name: 'certifications', type: 'json' },
        { name: 'specializations', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'availability', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'session' },
        { type: 'hasMany', target: 'training' },
      ],
    },
    training: {
      defaultFields: [
        { name: 'training_name', type: 'string', required: true },
        { name: 'level', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'curriculum', type: 'json' },
        { name: 'duration_hours', type: 'integer' },
        { name: 'format', type: 'enum' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'max_students', type: 'integer' },
        { name: 'enrolled_count', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'includes_attunement', type: 'boolean' },
        { name: 'certificate_provided', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'practitioner' },
      ],
    },
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'benefits', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'stock_quantity', type: 'integer' },
        { name: 'is_reiki_charged', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
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

export default reikiBlueprint;
