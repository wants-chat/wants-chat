import { Blueprint } from './blueprint.interface';

/**
 * Darts Bar Blueprint
 */
export const dartsBlueprint: Blueprint = {
  appType: 'darts',
  description: 'Darts bar app with boards, leagues, tournaments, and bar service',

  coreEntities: ['board', 'league', 'tournament', 'customer', 'reservation', 'match'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Boards', path: '/boards', icon: 'Target' },
        { label: 'Leagues', path: '/leagues', icon: 'Trophy' },
        { label: 'Tournaments', path: '/tournaments', icon: 'Award' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Matches', path: '/matches', icon: 'Swords' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-boards', component: 'data-table', entity: 'board', position: 'main' },
    ]},
    { path: '/boards', name: 'Boards', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'board-grid', component: 'product-grid', entity: 'board', position: 'main' },
    ]},
    { path: '/leagues', name: 'Leagues', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'league-table', component: 'data-table', entity: 'league', position: 'main' },
    ]},
    { path: '/tournaments', name: 'Tournaments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tournament-calendar', component: 'appointment-calendar', entity: 'tournament', position: 'main' },
      { id: 'tournament-table', component: 'data-table', entity: 'tournament', position: 'main' },
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
    { path: '/matches', name: 'Matches', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'match-table', component: 'data-table', entity: 'match', position: 'main' },
    ]},
    { path: '/reserve', name: 'Reserve a Board', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'reservation-form', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/boards', entity: 'board', operation: 'list' },
    { method: 'GET', path: '/leagues', entity: 'league', operation: 'list' },
    { method: 'GET', path: '/tournaments', entity: 'tournament', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/matches', entity: 'match', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    board: {
      defaultFields: [
        { name: 'board_number', type: 'string', required: true },
        { name: 'board_type', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'electronic', type: 'boolean' },
        { name: 'location', type: 'string' },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'features', type: 'json' },
        { name: 'current_session', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
        { type: 'hasMany', target: 'match' },
      ],
    },
    league: {
      defaultFields: [
        { name: 'league_name', type: 'string', required: true },
        { name: 'game_format', type: 'enum', required: true },
        { name: 'season', type: 'string', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'play_night', type: 'enum' },
        { name: 'teams', type: 'json' },
        { name: 'standings', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'prize_pool', type: 'decimal' },
        { name: 'rules', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    tournament: {
      defaultFields: [
        { name: 'tournament_name', type: 'string', required: true },
        { name: 'game_format', type: 'enum', required: true },
        { name: 'tournament_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'format', type: 'enum' },
        { name: 'max_players', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'prize_distribution', type: 'json' },
        { name: 'bracket', type: 'json' },
        { name: 'rules', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'skill_level', type: 'enum' },
        { name: 'preferred_game', type: 'enum' },
        { name: 'average_score', type: 'decimal' },
        { name: 'high_score', type: 'integer' },
        { name: 'league_memberships', type: 'json' },
        { name: 'visit_count', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
        { type: 'hasMany', target: 'match' },
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
        { type: 'belongsTo', target: 'board' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    match: {
      defaultFields: [
        { name: 'match_number', type: 'string', required: true },
        { name: 'match_date', type: 'date', required: true },
        { name: 'game_format', type: 'enum', required: true },
        { name: 'players', type: 'json', required: true },
        { name: 'scores', type: 'json' },
        { name: 'winner', type: 'string' },
        { name: 'high_checkout', type: 'integer' },
        { name: 'is_league_match', type: 'boolean' },
        { name: 'is_tournament_match', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'board' },
        { type: 'belongsTo', target: 'league' },
        { type: 'belongsTo', target: 'tournament' },
      ],
    },
  },
};

export default dartsBlueprint;
