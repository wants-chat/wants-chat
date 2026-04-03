import { Blueprint } from './blueprint.interface';

/**
 * Winery / Vineyard Blueprint
 */
export const wineryBlueprint: Blueprint = {
  appType: 'winery',
  description: 'Winery app with wines, tastings, tours, wine club, and vineyard management',

  coreEntities: ['wine', 'tasting', 'tour', 'wine_club_member', 'event', 'vineyard'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Wines', path: '/wines', icon: 'Wine' },
        { label: 'Tastings', path: '/tastings', icon: 'GlassWater' },
        { label: 'Tours', path: '/tours', icon: 'Map' },
        { label: 'Wine Club', path: '/wine-club', icon: 'Users' },
        { label: 'Events', path: '/events', icon: 'PartyPopper' },
        { label: 'Vineyard', path: '/vineyard', icon: 'Grape' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-tastings', component: 'appointment-list', entity: 'tasting', position: 'main' },
    ]},
    { path: '/wines', name: 'Wines', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'wine-grid', component: 'product-grid', entity: 'wine', position: 'main' },
    ]},
    { path: '/tastings', name: 'Tastings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tasting-calendar', component: 'appointment-calendar', entity: 'tasting', position: 'main' },
      { id: 'tasting-table', component: 'data-table', entity: 'tasting', position: 'main' },
    ]},
    { path: '/tours', name: 'Tours', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tour-calendar', component: 'appointment-calendar', entity: 'tour', position: 'main' },
      { id: 'tour-table', component: 'data-table', entity: 'tour', position: 'main' },
    ]},
    { path: '/wine-club', name: 'Wine Club', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'wine_club_member', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
      { id: 'event-table', component: 'data-table', entity: 'event', position: 'main' },
    ]},
    { path: '/vineyard', name: 'Vineyard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vineyard-table', component: 'data-table', entity: 'vineyard', position: 'main' },
    ]},
    { path: '/book-tasting', name: 'Book Tasting', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'tasting', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop Wines', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'wine-shop', component: 'product-grid', entity: 'wine', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/wines', entity: 'wine', operation: 'list' },
    { method: 'GET', path: '/tastings', entity: 'tasting', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tastings', entity: 'tasting', operation: 'create' },
    { method: 'GET', path: '/tours', entity: 'tour', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tours', entity: 'tour', operation: 'create' },
    { method: 'GET', path: '/wine-club', entity: 'wine_club_member', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/wine-club', entity: 'wine_club_member', operation: 'create' },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/vineyard', entity: 'vineyard', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    wine: {
      defaultFields: [
        { name: 'wine_name', type: 'string', required: true },
        { name: 'vintage', type: 'integer', required: true },
        { name: 'varietal', type: 'enum', required: true },
        { name: 'wine_type', type: 'enum', required: true },
        { name: 'appellation', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'tasting_notes', type: 'text' },
        { name: 'food_pairings', type: 'json' },
        { name: 'alcohol_content', type: 'decimal' },
        { name: 'bottle_size', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'club_price', type: 'decimal' },
        { name: 'inventory', type: 'integer' },
        { name: 'awards', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'vineyard' },
      ],
    },
    tasting: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'tasting_date', type: 'date', required: true },
        { name: 'tasting_time', type: 'datetime', required: true },
        { name: 'guest_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'tasting_type', type: 'enum', required: true },
        { name: 'wines_tasted', type: 'json' },
        { name: 'special_occasion', type: 'string' },
        { name: 'total', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    tour: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'tour_date', type: 'date', required: true },
        { name: 'tour_time', type: 'datetime', required: true },
        { name: 'guest_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'tour_type', type: 'enum', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'includes_tasting', type: 'boolean' },
        { name: 'price', type: 'decimal' },
        { name: 'special_requests', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    wine_club_member: {
      defaultFields: [
        { name: 'member_number', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'membership_tier', type: 'enum', required: true },
        { name: 'join_date', type: 'date', required: true },
        { name: 'address', type: 'json' },
        { name: 'shipment_frequency', type: 'enum' },
        { name: 'wine_preferences', type: 'json' },
        { name: 'bottles_per_shipment', type: 'integer' },
        { name: 'payment_method', type: 'json' },
        { name: 'total_orders', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'capacity', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'ticket_price', type: 'decimal' },
        { name: 'member_price', type: 'decimal' },
        { name: 'wines_featured', type: 'json' },
        { name: 'catering', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    vineyard: {
      defaultFields: [
        { name: 'block_name', type: 'string', required: true },
        { name: 'varietal', type: 'enum', required: true },
        { name: 'acreage', type: 'decimal' },
        { name: 'year_planted', type: 'integer' },
        { name: 'vine_count', type: 'integer' },
        { name: 'rootstock', type: 'string' },
        { name: 'soil_type', type: 'string' },
        { name: 'irrigation_type', type: 'enum' },
        { name: 'yield_tons', type: 'decimal' },
        { name: 'harvest_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'wine' },
      ],
    },
  },
};

export default wineryBlueprint;
