import { Blueprint } from './blueprint.interface';

/**
 * Virtual Reality Arcade Blueprint
 */
export const virtualrealityBlueprint: Blueprint = {
  appType: 'virtualreality',
  description: 'VR arcade app with stations, experiences, bookings, and party packages',

  coreEntities: ['station', 'experience', 'booking', 'party_package', 'customer', 'session'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Stations', path: '/stations', icon: 'Monitor' },
        { label: 'Experiences', path: '/experiences', icon: 'Gamepad2' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Packages', path: '/packages', icon: 'PartyPopper' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Sessions', path: '/sessions', icon: 'Clock' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-sessions', component: 'data-table', entity: 'session', position: 'main' },
    ]},
    { path: '/stations', name: 'Stations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'station-grid', component: 'product-grid', entity: 'station', position: 'main' },
    ]},
    { path: '/experiences', name: 'Experiences', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'experience-grid', component: 'product-grid', entity: 'experience', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/packages', name: 'Party Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-grid', component: 'plan-grid', entity: 'party_package', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-table', component: 'data-table', entity: 'session', position: 'main' },
    ]},
    { path: '/games', name: 'VR Experiences', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'experience-display', component: 'product-grid', entity: 'experience', position: 'main' },
    ]},
    { path: '/book', name: 'Book a Session', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/stations', entity: 'station', operation: 'list' },
    { method: 'GET', path: '/experiences', entity: 'experience', operation: 'list' },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/packages', entity: 'party_package', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    station: {
      defaultFields: [
        { name: 'station_name', type: 'string', required: true },
        { name: 'station_type', type: 'enum', required: true },
        { name: 'headset_model', type: 'string' },
        { name: 'pc_specs', type: 'json' },
        { name: 'play_area_size', type: 'string' },
        { name: 'supported_experiences', type: 'json' },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'max_players', type: 'integer' },
        { name: 'current_session', type: 'json' },
        { name: 'last_maintenance', type: 'date' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'session' },
      ],
    },
    experience: {
      defaultFields: [
        { name: 'experience_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'min_age', type: 'integer' },
        { name: 'intensity_level', type: 'enum' },
        { name: 'motion_sickness_risk', type: 'enum' },
        { name: 'duration', type: 'integer' },
        { name: 'min_players', type: 'integer' },
        { name: 'max_players', type: 'integer' },
        { name: 'difficulty', type: 'enum' },
        { name: 'trailer_url', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'is_popular', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration', type: 'integer', required: true },
        { name: 'guest_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'experience_preferences', type: 'json' },
        { name: 'age_verified', type: 'boolean' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'station' },
        { type: 'belongsTo', target: 'party_package' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    party_package: {
      defaultFields: [
        { name: 'package_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'duration', type: 'integer', required: true },
        { name: 'min_guests', type: 'integer' },
        { name: 'max_guests', type: 'integer' },
        { name: 'stations_included', type: 'integer' },
        { name: 'experiences_included', type: 'json' },
        { name: 'food_options', type: 'json' },
        { name: 'party_room', type: 'boolean' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'deposit_required', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'waiver_on_file', type: 'boolean' },
        { name: 'favorite_experiences', type: 'json' },
        { name: 'vr_comfort_level', type: 'enum' },
        { name: 'visit_count', type: 'integer' },
        { name: 'total_play_time', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'session' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_number', type: 'string', required: true },
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'player_name', type: 'string', required: true },
        { name: 'experiences_played', type: 'json' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'score_data', type: 'json' },
        { name: 'amount', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'station' },
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'booking' },
      ],
    },
  },
};

export default virtualrealityBlueprint;
