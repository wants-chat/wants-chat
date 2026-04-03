import { Blueprint } from './blueprint.interface';

/**
 * Nightclub Blueprint
 */
export const nightclubBlueprint: Blueprint = {
  appType: 'nightclub',
  description: 'Nightclub app with events, VIP, bottle service, guest lists, and promoters',

  coreEntities: ['event', 'vip_table', 'bottle_service', 'guest_list', 'promoter', 'reservation'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Events', path: '/events', icon: 'Music' },
        { label: 'VIP Tables', path: '/vip', icon: 'Crown' },
        { label: 'Bottle Service', path: '/bottles', icon: 'Wine' },
        { label: 'Guest Lists', path: '/guestlist', icon: 'ClipboardList' },
        { label: 'Promoters', path: '/promoters', icon: 'Users' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'tonight-reservations', component: 'data-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
      { id: 'event-table', component: 'data-table', entity: 'event', position: 'main' },
    ]},
    { path: '/vip', name: 'VIP Tables', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vip-table', component: 'data-table', entity: 'vip_table', position: 'main' },
    ]},
    { path: '/bottles', name: 'Bottle Service', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'bottle-grid', component: 'product-grid', entity: 'bottle_service', position: 'main' },
    ]},
    { path: '/guestlist', name: 'Guest Lists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guestlist-table', component: 'data-table', entity: 'guest_list', position: 'main' },
    ]},
    { path: '/promoters', name: 'Promoters', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'promoter-table', component: 'data-table', entity: 'promoter', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'appointment-calendar', entity: 'reservation', position: 'main' },
      { id: 'reservation-table', component: 'data-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/upcoming', name: 'Events', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'event-display', component: 'product-grid', entity: 'event', position: 'main' },
    ]},
    { path: '/reserve-table', name: 'Reserve Table', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'reservation-form', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/vip', entity: 'vip_table', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/bottles', entity: 'bottle_service', operation: 'list' },
    { method: 'GET', path: '/guestlist', entity: 'guest_list', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/guestlist', entity: 'guest_list', operation: 'create' },
    { method: 'GET', path: '/promoters', entity: 'promoter', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
  ],

  entityConfig: {
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'doors_open', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'headliner', type: 'string' },
        { name: 'supporting_acts', type: 'json' },
        { name: 'music_genre', type: 'json' },
        { name: 'dress_code', type: 'enum' },
        { name: 'age_requirement', type: 'integer' },
        { name: 'cover_charge', type: 'decimal' },
        { name: 'presale_price', type: 'decimal' },
        { name: 'capacity', type: 'integer' },
        { name: 'flyer_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    vip_table: {
      defaultFields: [
        { name: 'table_name', type: 'string', required: true },
        { name: 'location', type: 'enum', required: true },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'minimum_spend', type: 'decimal', required: true },
        { name: 'base_price', type: 'decimal' },
        { name: 'premium_nights_price', type: 'decimal' },
        { name: 'included_bottles', type: 'integer' },
        { name: 'view_description', type: 'text' },
        { name: 'amenities', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    bottle_service: {
      defaultFields: [
        { name: 'bottle_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'size', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'mixers_included', type: 'json' },
        { name: 'serves', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    guest_list: {
      defaultFields: [
        { name: 'guest_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'men_count', type: 'integer' },
        { name: 'women_count', type: 'integer' },
        { name: 'arrival_time', type: 'datetime' },
        { name: 'checked_in', type: 'boolean' },
        { name: 'check_in_time', type: 'datetime' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'event' },
        { type: 'belongsTo', target: 'promoter' },
      ],
    },
    promoter: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'commission_rate', type: 'decimal' },
        { name: 'specialty', type: 'json' },
        { name: 'total_guests', type: 'integer' },
        { name: 'total_earnings', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'guest_list' },
      ],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'guest_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'bottle_packages', type: 'json' },
        { name: 'estimated_spend', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'special_requests', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'event' },
        { type: 'belongsTo', target: 'vip_table' },
        { type: 'belongsTo', target: 'promoter' },
      ],
    },
  },
};

export default nightclubBlueprint;
