import { Blueprint } from './blueprint.interface';

/**
 * Laser Tag / Entertainment Center Blueprint
 */
export const lasertagBlueprint: Blueprint = {
  appType: 'lasertag',
  description: 'Laser tag arena app with bookings, parties, memberships, and leaderboards',

  coreEntities: ['arena', 'booking', 'customer', 'party', 'membership', 'game'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Arenas', path: '/arenas', icon: 'Target' },
        { label: 'Parties', path: '/parties', icon: 'PartyPopper' },
        { label: 'Memberships', path: '/memberships', icon: 'CreditCard' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Leaderboard', path: '/leaderboard', icon: 'Trophy' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-bookings', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/arenas', name: 'Arenas', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'arena-grid', component: 'data-table', entity: 'arena', position: 'main' },
    ]},
    { path: '/parties', name: 'Party Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'party-calendar', component: 'appointment-calendar', entity: 'party', position: 'main' },
      { id: 'party-table', component: 'data-table', entity: 'party', position: 'main' },
    ]},
    { path: '/memberships', name: 'Memberships', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'membership-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/leaderboard', name: 'Leaderboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'leaderboard', component: 'data-table', entity: 'game', position: 'main' },
    ]},
    { path: '/book', name: 'Book Session', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/arenas', entity: 'arena', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/parties', entity: 'party', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/parties', entity: 'party', operation: 'create' },
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/games', entity: 'game', operation: 'list' },
  ],

  entityConfig: {
    arena: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'theme', type: 'string' },
        { name: 'difficulty', type: 'enum' },
        { name: 'game_modes', type: 'json' },
        { name: 'equipment_count', type: 'integer' },
        { name: 'price_per_game', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'maintenance_notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'num_players', type: 'integer', required: true },
        { name: 'num_games', type: 'integer', required: true },
        { name: 'game_mode', type: 'enum' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'arena' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'gamer_tag', type: 'string' },
        { name: 'waiver_on_file', type: 'boolean' },
        { name: 'waiver_expiry', type: 'date' },
        { name: 'total_games', type: 'integer' },
        { name: 'high_score', type: 'integer' },
        { name: 'rank', type: 'string' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasOne', target: 'membership' },
      ],
    },
    party: {
      defaultFields: [
        { name: 'party_number', type: 'string', required: true },
        { name: 'party_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration_hours', type: 'decimal', required: true },
        { name: 'party_type', type: 'enum' },
        { name: 'guest_count', type: 'integer', required: true },
        { name: 'package_selected', type: 'json' },
        { name: 'num_games', type: 'integer' },
        { name: 'food_options', type: 'json' },
        { name: 'decorations', type: 'json' },
        { name: 'special_requests', type: 'text' },
        { name: 'total', type: 'decimal' },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'contact_phone', type: 'phone', required: true },
      ],
      relationships: [],
    },
    membership: {
      defaultFields: [
        { name: 'membership_number', type: 'string', required: true },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiration_date', type: 'date' },
        { name: 'price', type: 'decimal' },
        { name: 'games_included', type: 'integer' },
        { name: 'games_remaining', type: 'integer' },
        { name: 'discount_percent', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    game: {
      defaultFields: [
        { name: 'game_date', type: 'datetime', required: true },
        { name: 'game_mode', type: 'enum', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'team_red_score', type: 'integer' },
        { name: 'team_blue_score', type: 'integer' },
        { name: 'player_stats', type: 'json' },
        { name: 'mvp_player', type: 'string' },
        { name: 'high_scorer', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'arena' },
        { type: 'belongsTo', target: 'booking' },
      ],
    },
  },
};

export default lasertagBlueprint;
