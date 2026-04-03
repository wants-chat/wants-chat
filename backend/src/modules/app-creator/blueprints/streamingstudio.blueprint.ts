import { Blueprint } from './blueprint.interface';

/**
 * Streaming Studio Blueprint
 */
export const streamingstudioBlueprint: Blueprint = {
  appType: 'streamingstudio',
  description: 'Live streaming studio app with bookings, streams, hosts, and production services',

  coreEntities: ['booking', 'stream', 'client', 'host', 'studio', 'equipment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Streams', path: '/streams', icon: 'Video' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Hosts', path: '/hosts', icon: 'UserCheck' },
        { label: 'Studios', path: '/studios', icon: 'Tv' },
        { label: 'Equipment', path: '/equipment', icon: 'Camera' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-streams', component: 'appointment-list', entity: 'stream', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
    ]},
    { path: '/streams', name: 'Streams', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'stream-table', component: 'data-table', entity: 'stream', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/hosts', name: 'Hosts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'host-grid', component: 'staff-grid', entity: 'host', position: 'main' },
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
    { method: 'GET', path: '/streams', entity: 'stream', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/streams', entity: 'stream', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/hosts', entity: 'host', operation: 'list' },
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
        { name: 'stream_type', type: 'enum', required: true },
        { name: 'event_name', type: 'string' },
        { name: 'platforms', type: 'json' },
        { name: 'services_requested', type: 'json' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'crew_size', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'setup_time', type: 'integer' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'special_requirements', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'studio' },
        { type: 'belongsTo', target: 'host' },
      ],
    },
    stream: {
      defaultFields: [
        { name: 'stream_title', type: 'string', required: true },
        { name: 'stream_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'stream_type', type: 'enum', required: true },
        { name: 'platforms', type: 'json' },
        { name: 'stream_urls', type: 'json' },
        { name: 'resolution', type: 'string' },
        { name: 'bitrate', type: 'string' },
        { name: 'peak_viewers', type: 'integer' },
        { name: 'average_viewers', type: 'integer' },
        { name: 'total_views', type: 'integer' },
        { name: 'recording_url', type: 'string' },
        { name: 'chat_enabled', type: 'boolean' },
        { name: 'technical_notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'booking' },
        { type: 'belongsTo', target: 'studio' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'client_type', type: 'enum' },
        { name: 'industry', type: 'string' },
        { name: 'streaming_platforms', type: 'json' },
        { name: 'typical_event_types', type: 'json' },
        { name: 'billing_address', type: 'json' },
        { name: 'total_bookings', type: 'integer' },
        { name: 'total_stream_hours', type: 'decimal' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    host: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'stage_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'specializations', type: 'json' },
        { name: 'languages', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'reel_url', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    studio: {
      defaultFields: [
        { name: 'studio_name', type: 'string', required: true },
        { name: 'studio_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'size_sqft', type: 'integer' },
        { name: 'capacity', type: 'integer' },
        { name: 'camera_count', type: 'integer' },
        { name: 'max_resolution', type: 'string' },
        { name: 'equipment_list', type: 'json' },
        { name: 'backdrop_options', type: 'json' },
        { name: 'internet_speed', type: 'string' },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'half_day_rate', type: 'decimal' },
        { name: 'full_day_rate', type: 'decimal' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'stream' },
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
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'studio' },
      ],
    },
  },
};

export default streamingstudioBlueprint;
