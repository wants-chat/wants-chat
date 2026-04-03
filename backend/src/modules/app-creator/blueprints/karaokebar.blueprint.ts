import { Blueprint } from './blueprint.interface';

/**
 * Karaoke Bar Blueprint
 */
export const karaokebarBlueprint: Blueprint = {
  appType: 'karaokebar',
  description: 'Karaoke bar app with rooms, song catalog, bookings, and party packages',

  coreEntities: ['room', 'song', 'booking', 'party_package', 'customer', 'order'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Rooms', path: '/rooms', icon: 'Music' },
        { label: 'Songs', path: '/songs', icon: 'ListMusic' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Packages', path: '/packages', icon: 'PartyPopper' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'tonight-bookings', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/rooms', name: 'Rooms', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'room-grid', component: 'product-grid', entity: 'room', position: 'main' },
    ]},
    { path: '/songs', name: 'Songs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'song', position: 'main' },
      { id: 'song-table', component: 'data-table', entity: 'song', position: 'main' },
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
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/book-room', name: 'Book a Room', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'room-display', component: 'product-grid', entity: 'room', position: 'main' },
      { id: 'booking-form', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
    { path: '/song-search', name: 'Song Catalog', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'song-list', component: 'data-table', entity: 'song', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/rooms', entity: 'room', operation: 'list' },
    { method: 'GET', path: '/songs', entity: 'song', operation: 'list' },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/packages', entity: 'party_package', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
  ],

  entityConfig: {
    room: {
      defaultFields: [
        { name: 'room_name', type: 'string', required: true },
        { name: 'room_type', type: 'enum', required: true },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'description', type: 'text' },
        { name: 'amenities', type: 'json' },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'minimum_hours', type: 'integer' },
        { name: 'weekend_rate', type: 'decimal' },
        { name: 'equipment', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    song: {
      defaultFields: [
        { name: 'song_title', type: 'string', required: true },
        { name: 'artist', type: 'string', required: true },
        { name: 'language', type: 'enum' },
        { name: 'genre', type: 'enum' },
        { name: 'year', type: 'integer' },
        { name: 'duration', type: 'integer' },
        { name: 'difficulty', type: 'enum' },
        { name: 'song_code', type: 'string' },
        { name: 'has_video', type: 'boolean' },
        { name: 'is_popular', type: 'boolean' },
        { name: 'play_count', type: 'integer' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'guest_name', type: 'string', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'email', type: 'email' },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'special_occasion', type: 'string' },
        { name: 'add_ons', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'room' },
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
        { name: 'includes', type: 'json' },
        { name: 'food_options', type: 'json' },
        { name: 'drink_options', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'price_per_person', type: 'decimal' },
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
        { name: 'favorite_songs', type: 'json' },
        { name: 'visit_count', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'order' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'room_number', type: 'string' },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'tip', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'server', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'booking' },
      ],
    },
  },
};

export default karaokebarBlueprint;
