import { Blueprint } from './blueprint.interface';

/**
 * Shuffleboard Venue Blueprint
 */
export const shuffleboardBlueprint: Blueprint = {
  appType: 'shuffleboard',
  description: 'Shuffleboard venue app with tables, leagues, parties, and bar service',

  coreEntities: ['table', 'league', 'party_booking', 'customer', 'reservation', 'tournament'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Tables', path: '/tables', icon: 'Move' },
        { label: 'Leagues', path: '/leagues', icon: 'Trophy' },
        { label: 'Parties', path: '/parties', icon: 'PartyPopper' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Tournaments', path: '/tournaments', icon: 'Award' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-reservations', component: 'appointment-list', entity: 'reservation', position: 'main' },
    ]},
    { path: '/tables', name: 'Tables', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'table-grid', component: 'product-grid', entity: 'table', position: 'main' },
    ]},
    { path: '/leagues', name: 'Leagues', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'league-table', component: 'data-table', entity: 'league', position: 'main' },
    ]},
    { path: '/parties', name: 'Parties', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'party-calendar', component: 'appointment-calendar', entity: 'party_booking', position: 'main' },
      { id: 'party-table', component: 'data-table', entity: 'party_booking', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'appointment-calendar', entity: 'reservation', position: 'main' },
      { id: 'reservation-table', component: 'data-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/tournaments', name: 'Tournaments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tournament-table', component: 'data-table', entity: 'tournament', position: 'main' },
    ]},
    { path: '/reserve', name: 'Reserve a Table', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'reservation-form', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
    { path: '/book-party', name: 'Book a Party', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'party-form', component: 'booking-wizard', entity: 'party_booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/tables', entity: 'table', operation: 'list' },
    { method: 'GET', path: '/leagues', entity: 'league', operation: 'list' },
    { method: 'GET', path: '/parties', entity: 'party_booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/parties', entity: 'party_booking', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/tournaments', entity: 'tournament', operation: 'list' },
  ],

  entityConfig: {
    table: {
      defaultFields: [
        { name: 'table_number', type: 'string', required: true },
        { name: 'table_size', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'prime_rate', type: 'decimal' },
        { name: 'condition', type: 'enum' },
        { name: 'last_maintenance', type: 'date' },
        { name: 'current_session', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    league: {
      defaultFields: [
        { name: 'league_name', type: 'string', required: true },
        { name: 'season', type: 'string', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'play_night', type: 'enum' },
        { name: 'format', type: 'enum' },
        { name: 'teams', type: 'json' },
        { name: 'standings', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'prize_pool', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    party_booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'party_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'host_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'party_type', type: 'enum' },
        { name: 'guest_count', type: 'integer', required: true },
        { name: 'tables_reserved', type: 'integer' },
        { name: 'package', type: 'string' },
        { name: 'food_beverage', type: 'json' },
        { name: 'total', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'special_requests', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'skill_level', type: 'enum' },
        { name: 'league_memberships', type: 'json' },
        { name: 'visit_count', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
        { type: 'hasMany', target: 'party_booking' },
      ],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_number', type: 'string', required: true },
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'guest_name', type: 'string', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'email', type: 'email' },
        { name: 'party_size', type: 'integer' },
        { name: 'estimated_hours', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'table' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    tournament: {
      defaultFields: [
        { name: 'tournament_name', type: 'string', required: true },
        { name: 'tournament_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'format', type: 'enum' },
        { name: 'max_players', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'prize_distribution', type: 'json' },
        { name: 'bracket', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
  },
};

export default shuffleboardBlueprint;
