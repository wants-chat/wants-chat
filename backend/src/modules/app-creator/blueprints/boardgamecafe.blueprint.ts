import { Blueprint } from './blueprint.interface';

/**
 * Board Game Cafe Blueprint
 */
export const boardgamecafeBlueprint: Blueprint = {
  appType: 'boardgamecafe',
  description: 'Board game cafe app with games, tables, events, food/drinks, and memberships',

  coreEntities: ['game', 'table', 'event', 'menu_item', 'membership', 'reservation'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Games', path: '/games', icon: 'Dice5' },
        { label: 'Tables', path: '/tables', icon: 'Table' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Menu', path: '/menu', icon: 'Coffee' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Reservations', path: '/reservations', icon: 'CalendarCheck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-reservations', component: 'appointment-list', entity: 'reservation', position: 'main' },
    ]},
    { path: '/games', name: 'Games', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'game', position: 'main' },
      { id: 'game-grid', component: 'product-grid', entity: 'game', position: 'main' },
    ]},
    { path: '/tables', name: 'Tables', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'table-grid', component: 'product-grid', entity: 'table', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
      { id: 'event-table', component: 'data-table', entity: 'event', position: 'main' },
    ]},
    { path: '/menu', name: 'Menu', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-grid', component: 'product-grid', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'appointment-calendar', entity: 'reservation', position: 'main' },
      { id: 'reservation-table', component: 'data-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/library', name: 'Game Library', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'game', position: 'main' },
      { id: 'game-display', component: 'product-grid', entity: 'game', position: 'main' },
    ]},
    { path: '/reserve', name: 'Reserve a Table', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'reservation-form', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/games', entity: 'game', operation: 'list' },
    { method: 'GET', path: '/tables', entity: 'table', operation: 'list' },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'GET', path: '/members', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'membership', operation: 'create' },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
  ],

  entityConfig: {
    game: {
      defaultFields: [
        { name: 'game_name', type: 'string', required: true },
        { name: 'publisher', type: 'string' },
        { name: 'category', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'min_players', type: 'integer', required: true },
        { name: 'max_players', type: 'integer', required: true },
        { name: 'play_time', type: 'string' },
        { name: 'complexity', type: 'enum' },
        { name: 'age_range', type: 'string' },
        { name: 'bgg_rating', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'checked_out', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    table: {
      defaultFields: [
        { name: 'table_name', type: 'string', required: true },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'table_type', type: 'enum' },
        { name: 'location', type: 'string' },
        { name: 'amenities', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'minimum_hours', type: 'integer' },
        { name: 'current_reservation', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'featured_games', type: 'json' },
        { name: 'host', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'member_discount', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    menu_item: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'ingredients', type: 'json' },
        { name: 'allergens', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'member_price', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    membership: {
      defaultFields: [
        { name: 'member_number', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'favorite_games', type: 'json' },
        { name: 'visit_count', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'guest_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'games_requested', type: 'json' },
        { name: 'occasion', type: 'string' },
        { name: 'table_fee', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'table' },
        { type: 'belongsTo', target: 'membership' },
      ],
    },
  },
};

export default boardgamecafeBlueprint;
