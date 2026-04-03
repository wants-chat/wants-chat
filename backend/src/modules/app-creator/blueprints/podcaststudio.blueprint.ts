import { Blueprint } from './blueprint.interface';

/**
 * Podcast Studio Blueprint
 */
export const podcaststudioBlueprint: Blueprint = {
  appType: 'podcaststudio',
  description: 'Podcast studio app with bookings, episodes, producers, and distribution',

  coreEntities: ['booking', 'episode', 'client', 'producer', 'studio', 'show'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Episodes', path: '/episodes', icon: 'Mic' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Producers', path: '/producers', icon: 'UserCheck' },
        { label: 'Studios', path: '/studios', icon: 'Radio' },
        { label: 'Shows', path: '/shows', icon: 'Podcast' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-bookings', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
    ]},
    { path: '/episodes', name: 'Episodes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'episode-table', component: 'data-table', entity: 'episode', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/producers', name: 'Producers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'producer-grid', component: 'staff-grid', entity: 'producer', position: 'main' },
    ]},
    { path: '/studios', name: 'Studios', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'studio-grid', component: 'product-grid', entity: 'studio', position: 'main' },
    ]},
    { path: '/shows', name: 'Shows', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'show-grid', component: 'product-grid', entity: 'show', position: 'main' },
    ]},
    { path: '/book', name: 'Book Studio', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/episodes', entity: 'episode', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/episodes', entity: 'episode', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/producers', entity: 'producer', operation: 'list' },
    { method: 'GET', path: '/studios', entity: 'studio', operation: 'list' },
    { method: 'GET', path: '/shows', entity: 'show', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'guest_count', type: 'integer' },
        { name: 'services_requested', type: 'json' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'estimated_total', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'special_requests', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'studio' },
        { type: 'belongsTo', target: 'producer' },
        { type: 'belongsTo', target: 'show' },
      ],
    },
    episode: {
      defaultFields: [
        { name: 'episode_title', type: 'string', required: true },
        { name: 'episode_number', type: 'integer' },
        { name: 'season_number', type: 'integer' },
        { name: 'record_date', type: 'date', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'description', type: 'text' },
        { name: 'guests', type: 'json' },
        { name: 'topics', type: 'json' },
        { name: 'show_notes', type: 'text' },
        { name: 'transcript', type: 'text' },
        { name: 'audio_file_url', type: 'string' },
        { name: 'video_file_url', type: 'string' },
        { name: 'artwork_url', type: 'image' },
        { name: 'publish_date', type: 'date' },
        { name: 'platforms_published', type: 'json' },
        { name: 'download_count', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'show' },
        { type: 'belongsTo', target: 'booking' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'company', type: 'string' },
        { name: 'client_type', type: 'enum' },
        { name: 'podcast_experience', type: 'enum' },
        { name: 'total_bookings', type: 'integer' },
        { name: 'total_episodes', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'preferred_producer', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'show' },
      ],
    },
    producer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'specializations', type: 'json' },
        { name: 'skills', type: 'json' },
        { name: 'years_experience', type: 'integer' },
        { name: 'shows_produced', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
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
        { name: 'capacity', type: 'integer' },
        { name: 'microphone_count', type: 'integer' },
        { name: 'equipment_list', type: 'json' },
        { name: 'software', type: 'json' },
        { name: 'has_video', type: 'boolean' },
        { name: 'has_remote_guest', type: 'boolean' },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'half_day_rate', type: 'decimal' },
        { name: 'full_day_rate', type: 'decimal' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    show: {
      defaultFields: [
        { name: 'show_name', type: 'string', required: true },
        { name: 'show_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'hosts', type: 'json' },
        { name: 'genre', type: 'enum' },
        { name: 'format', type: 'enum' },
        { name: 'target_duration', type: 'integer' },
        { name: 'release_schedule', type: 'string' },
        { name: 'artwork_url', type: 'image' },
        { name: 'rss_feed', type: 'string' },
        { name: 'platforms', type: 'json' },
        { name: 'total_episodes', type: 'integer' },
        { name: 'total_downloads', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'episode' },
      ],
    },
  },
};

export default podcaststudioBlueprint;
