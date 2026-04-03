import { Blueprint } from './blueprint.interface';

/**
 * Billiards/Pool Hall Blueprint
 */
export const billiardsBlueprint: Blueprint = {
  appType: 'billiards',
  description: 'Billiards hall app with tables, leagues, tournaments, lessons, and bar service',

  coreEntities: ['table', 'league', 'tournament', 'lesson', 'customer', 'reservation'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Tables', path: '/tables', icon: 'Circle' },
        { label: 'Leagues', path: '/leagues', icon: 'Trophy' },
        { label: 'Tournaments', path: '/tournaments', icon: 'Award' },
        { label: 'Lessons', path: '/lessons', icon: 'GraduationCap' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-tables', component: 'data-table', entity: 'table', position: 'main' },
    ]},
    { path: '/tables', name: 'Tables', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'table-grid', component: 'product-grid', entity: 'table', position: 'main' },
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
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-calendar', component: 'appointment-calendar', entity: 'lesson', position: 'main' },
      { id: 'lesson-table', component: 'data-table', entity: 'lesson', position: 'main' },
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
    { path: '/reserve', name: 'Reserve a Table', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'reservation-form', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/tables', entity: 'table', operation: 'list' },
    { method: 'GET', path: '/leagues', entity: 'league', operation: 'list' },
    { method: 'GET', path: '/tournaments', entity: 'tournament', operation: 'list' },
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/lessons', entity: 'lesson', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
  ],

  entityConfig: {
    table: {
      defaultFields: [
        { name: 'table_number', type: 'string', required: true },
        { name: 'table_type', type: 'enum', required: true },
        { name: 'size', type: 'string' },
        { name: 'brand', type: 'string' },
        { name: 'condition', type: 'enum' },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'prime_rate', type: 'decimal' },
        { name: 'location', type: 'string' },
        { name: 'features', type: 'json' },
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
        { name: 'game_type', type: 'enum', required: true },
        { name: 'season', type: 'string', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'night', type: 'enum' },
        { name: 'teams', type: 'json' },
        { name: 'standings', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'prize_pool', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    tournament: {
      defaultFields: [
        { name: 'tournament_name', type: 'string', required: true },
        { name: 'game_type', type: 'enum', required: true },
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
    lesson: {
      defaultFields: [
        { name: 'lesson_number', type: 'string', required: true },
        { name: 'lesson_date', type: 'date', required: true },
        { name: 'lesson_time', type: 'datetime', required: true },
        { name: 'duration', type: 'integer', required: true },
        { name: 'student_name', type: 'string', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'email', type: 'email' },
        { name: 'skill_level', type: 'enum' },
        { name: 'focus_areas', type: 'json' },
        { name: 'instructor', type: 'string' },
        { name: 'price', type: 'decimal' },
        { name: 'notes', type: 'text' },
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
        { name: 'preferred_game', type: 'enum' },
        { name: 'league_memberships', type: 'json' },
        { name: 'visit_count', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
        { type: 'hasMany', target: 'lesson' },
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
        { name: 'table_preference', type: 'enum' },
        { name: 'estimated_hours', type: 'integer' },
        { name: 'deposit', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'table' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default billiardsBlueprint;
