import { Blueprint } from './blueprint.interface';

/**
 * Spiritual Retreat Center Blueprint
 */
export const spiritualretreatBlueprint: Blueprint = {
  appType: 'spiritualretreat',
  description: 'Spiritual retreat center app with programs, accommodations, bookings, and facilitators',

  coreEntities: ['program', 'accommodation', 'booking', 'guest', 'facilitator', 'activity'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Programs', path: '/programs', icon: 'Sparkles' },
        { label: 'Accommodations', path: '/accommodations', icon: 'Home' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Guests', path: '/guests', icon: 'Users' },
        { label: 'Facilitators', path: '/facilitators', icon: 'UserCheck' },
        { label: 'Activities', path: '/activities', icon: 'Activity' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-programs', component: 'appointment-list', entity: 'program', position: 'main' },
    ]},
    { path: '/programs', name: 'Programs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'program-grid', component: 'product-grid', entity: 'program', position: 'main' },
    ]},
    { path: '/accommodations', name: 'Accommodations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'accommodation-grid', component: 'product-grid', entity: 'accommodation', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/guests', name: 'Guests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guest-table', component: 'data-table', entity: 'guest', position: 'main' },
    ]},
    { path: '/facilitators', name: 'Facilitators', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'facilitator-grid', component: 'staff-grid', entity: 'facilitator', position: 'main' },
    ]},
    { path: '/activities', name: 'Activities', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'activity-calendar', component: 'appointment-calendar', entity: 'activity', position: 'main' },
    ]},
    { path: '/retreats', name: 'Retreats', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'program-grid', component: 'product-grid', entity: 'program', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/programs', entity: 'program', operation: 'list' },
    { method: 'POST', path: '/programs', entity: 'program', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/accommodations', entity: 'accommodation', operation: 'list' },
    { method: 'POST', path: '/accommodations', entity: 'accommodation', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/guests', entity: 'guest', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/facilitators', entity: 'facilitator', operation: 'list' },
    { method: 'GET', path: '/activities', entity: 'activity', operation: 'list' },
  ],

  entityConfig: {
    program: {
      defaultFields: [
        { name: 'program_name', type: 'string', required: true },
        { name: 'program_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'description', type: 'text' },
        { name: 'theme', type: 'string' },
        { name: 'tradition', type: 'string' },
        { name: 'daily_schedule', type: 'json' },
        { name: 'activities_included', type: 'json' },
        { name: 'capacity', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'early_bird_price', type: 'decimal' },
        { name: 'early_bird_deadline', type: 'date' },
        { name: 'includes_meals', type: 'boolean' },
        { name: 'includes_accommodation', type: 'boolean' },
        { name: 'requirements', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'facilitator' },
      ],
    },
    accommodation: {
      defaultFields: [
        { name: 'room_name', type: 'string', required: true },
        { name: 'room_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'beds', type: 'json' },
        { name: 'amenities', type: 'json' },
        { name: 'has_bathroom', type: 'boolean' },
        { name: 'has_view', type: 'boolean' },
        { name: 'view_type', type: 'string' },
        { name: 'accessibility_features', type: 'json' },
        { name: 'nightly_rate', type: 'decimal', required: true },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'check_in', type: 'date', required: true },
        { name: 'check_out', type: 'date', required: true },
        { name: 'num_guests', type: 'integer', required: true },
        { name: 'dietary_requirements', type: 'json' },
        { name: 'special_requests', type: 'text' },
        { name: 'room_total', type: 'decimal' },
        { name: 'program_total', type: 'decimal' },
        { name: 'extras_total', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'payment_method', type: 'enum' },
        { name: 'arrival_time', type: 'string' },
        { name: 'transportation_needed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'guest' },
        { type: 'belongsTo', target: 'program' },
        { type: 'belongsTo', target: 'accommodation' },
      ],
    },
    guest: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'medical_conditions', type: 'text' },
        { name: 'experience_level', type: 'enum' },
        { name: 'spiritual_interests', type: 'json' },
        { name: 'previous_visits', type: 'integer' },
        { name: 'how_heard', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    facilitator: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'title', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'specializations', type: 'json' },
        { name: 'traditions', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'years_experience', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'teaching_style', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'website', type: 'string' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'program' },
        { type: 'hasMany', target: 'activity' },
      ],
    },
    activity: {
      defaultFields: [
        { name: 'activity_name', type: 'string', required: true },
        { name: 'activity_type', type: 'enum', required: true },
        { name: 'activity_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'location', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'is_included', type: 'boolean' },
        { name: 'additional_fee', type: 'decimal' },
        { name: 'what_to_bring', type: 'json' },
        { name: 'skill_level', type: 'enum' },
        { name: 'is_optional', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'program' },
        { type: 'belongsTo', target: 'facilitator' },
      ],
    },
  },
};

export default spiritualretreatBlueprint;
