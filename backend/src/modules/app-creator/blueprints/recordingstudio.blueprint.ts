import { Blueprint } from './blueprint.interface';

/**
 * Recording Studio Blueprint
 */
export const recordingstudioBlueprint: Blueprint = {
  appType: 'recordingstudio',
  description: 'Recording studio app with bookings, sessions, engineers, and equipment management',

  coreEntities: ['booking', 'session', 'client', 'engineer', 'studio', 'equipment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Sessions', path: '/sessions', icon: 'Music' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Engineers', path: '/engineers', icon: 'UserCheck' },
        { label: 'Studios', path: '/studios', icon: 'Home' },
        { label: 'Equipment', path: '/equipment', icon: 'Settings' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-bookings', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-table', component: 'data-table', entity: 'session', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/engineers', name: 'Engineers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'engineer-grid', component: 'staff-grid', entity: 'engineer', position: 'main' },
    ]},
    { path: '/studios', name: 'Studios', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'studio-grid', component: 'product-grid', entity: 'studio', position: 'main' },
    ]},
    { path: '/equipment', name: 'Equipment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'equipment-table', component: 'data-table', entity: 'equipment', position: 'main' },
    ]},
    { path: '/book', name: 'Book Studio', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/engineers', entity: 'engineer', operation: 'list' },
    { method: 'GET', path: '/studios', entity: 'studio', operation: 'list' },
    { method: 'GET', path: '/equipment', entity: 'equipment', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'project_name', type: 'string' },
        { name: 'project_type', type: 'enum' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'equipment_requested', type: 'json' },
        { name: 'additional_services', type: 'json' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'studio' },
        { type: 'belongsTo', target: 'engineer' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'actual_hours', type: 'decimal' },
        { name: 'session_type', type: 'enum' },
        { name: 'project_name', type: 'string' },
        { name: 'tracks_recorded', type: 'integer' },
        { name: 'files_delivered', type: 'json' },
        { name: 'equipment_used', type: 'json' },
        { name: 'session_notes', type: 'text' },
        { name: 'technical_notes', type: 'text' },
        { name: 'mix_notes', type: 'text' },
        { name: 'files_backed_up', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'booking' },
        { type: 'belongsTo', target: 'engineer' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'artist_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'company', type: 'string' },
        { name: 'client_type', type: 'enum' },
        { name: 'genres', type: 'json' },
        { name: 'preferred_engineer', type: 'string' },
        { name: 'billing_address', type: 'json' },
        { name: 'total_sessions', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    engineer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'specializations', type: 'json' },
        { name: 'genres', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'years_experience', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'bio', type: 'text' },
        { name: 'portfolio', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'session' },
      ],
    },
    studio: {
      defaultFields: [
        { name: 'studio_name', type: 'string', required: true },
        { name: 'studio_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'size_sqft', type: 'integer' },
        { name: 'capacity', type: 'integer' },
        { name: 'acoustics', type: 'string' },
        { name: 'equipment_list', type: 'json' },
        { name: 'console', type: 'string' },
        { name: 'monitors', type: 'string' },
        { name: 'daw_software', type: 'json' },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'day_rate', type: 'decimal' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    equipment: {
      defaultFields: [
        { name: 'equipment_name', type: 'string', required: true },
        { name: 'equipment_type', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'specifications', type: 'json' },
        { name: 'purchase_date', type: 'date' },
        { name: 'purchase_price', type: 'decimal' },
        { name: 'rental_rate', type: 'decimal' },
        { name: 'condition', type: 'enum' },
        { name: 'last_maintenance', type: 'date' },
        { name: 'location', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'studio' },
      ],
    },
  },
};

export default recordingstudioBlueprint;
