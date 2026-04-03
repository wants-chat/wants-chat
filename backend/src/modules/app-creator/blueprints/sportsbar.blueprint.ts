import { Blueprint } from './blueprint.interface';

/**
 * Sports Bar Blueprint
 */
export const sportsbarBlueprint: Blueprint = {
  appType: 'sportsbar',
  description: 'Sports bar app with menu, events, reservations, games, and loyalty',

  coreEntities: ['menu_item', 'event', 'reservation', 'game', 'customer', 'order'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Menu', path: '/menu', icon: 'UtensilsCrossed' },
        { label: 'Events', path: '/events', icon: 'PartyPopper' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Games', path: '/games', icon: 'Trophy' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-games', component: 'appointment-list', entity: 'game', position: 'main' },
    ]},
    { path: '/menu', name: 'Menu', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-grid', component: 'product-grid', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
      { id: 'event-table', component: 'data-table', entity: 'event', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'appointment-calendar', entity: 'reservation', position: 'main' },
      { id: 'reservation-table', component: 'data-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/games', name: 'Games', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'game-table', component: 'data-table', entity: 'game', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/public-menu', name: 'Menu', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'menu-display', component: 'product-grid', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/book-table', name: 'Reserve Table', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'reservation-form', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/games', entity: 'game', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
  ],

  entityConfig: {
    menu_item: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'ingredients', type: 'json' },
        { name: 'allergens', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'happy_hour_price', type: 'decimal' },
        { name: 'game_day_special', type: 'boolean' },
        { name: 'spice_level', type: 'enum' },
        { name: 'is_shareable', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
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
        { name: 'cover_charge', type: 'decimal' },
        { name: 'drink_specials', type: 'json' },
        { name: 'food_specials', type: 'json' },
        { name: 'featured_games', type: 'json' },
        { name: 'capacity', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'reservation_time', type: 'datetime', required: true },
        { name: 'guest_name', type: 'string', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'email', type: 'email' },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'table_preference', type: 'enum' },
        { name: 'special_requests', type: 'text' },
        { name: 'game_watching', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    game: {
      defaultFields: [
        { name: 'game_title', type: 'string', required: true },
        { name: 'sport', type: 'enum', required: true },
        { name: 'league', type: 'string' },
        { name: 'team_home', type: 'string', required: true },
        { name: 'team_away', type: 'string', required: true },
        { name: 'game_date', type: 'date', required: true },
        { name: 'game_time', type: 'datetime', required: true },
        { name: 'tv_channel', type: 'string' },
        { name: 'screens_assigned', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'drink_specials', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'favorite_teams', type: 'json' },
        { name: 'favorite_drinks', type: 'json' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'table_number', type: 'string' },
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
      ],
    },
  },
};

export default sportsbarBlueprint;
