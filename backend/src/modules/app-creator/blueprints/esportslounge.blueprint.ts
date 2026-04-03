import { Blueprint } from './blueprint.interface';

/**
 * Esports Lounge Blueprint
 */
export const esportsloungeBlueprint: Blueprint = {
  appType: 'esportslounge',
  description: 'Esports lounge app with gaming stations, tournaments, coaching, and cafe',

  coreEntities: ['station', 'tournament', 'coaching', 'membership', 'booking', 'team'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Stations', path: '/stations', icon: 'Monitor' },
        { label: 'Tournaments', path: '/tournaments', icon: 'Trophy' },
        { label: 'Coaching', path: '/coaching', icon: 'GraduationCap' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Teams', path: '/teams', icon: 'UsersRound' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-stations', component: 'data-table', entity: 'station', position: 'main' },
    ]},
    { path: '/stations', name: 'Stations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'station-grid', component: 'product-grid', entity: 'station', position: 'main' },
    ]},
    { path: '/tournaments', name: 'Tournaments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tournament-calendar', component: 'appointment-calendar', entity: 'tournament', position: 'main' },
      { id: 'tournament-table', component: 'data-table', entity: 'tournament', position: 'main' },
    ]},
    { path: '/coaching', name: 'Coaching', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'coaching-calendar', component: 'appointment-calendar', entity: 'coaching', position: 'main' },
      { id: 'coaching-table', component: 'data-table', entity: 'coaching', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/teams', name: 'Teams', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'team-table', component: 'data-table', entity: 'team', position: 'main' },
    ]},
    { path: '/play', name: 'Book a Station', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'station-display', component: 'product-grid', entity: 'station', position: 'main' },
      { id: 'booking-form', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
    { path: '/compete', name: 'Tournaments', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'tournament-display', component: 'product-grid', entity: 'tournament', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/stations', entity: 'station', operation: 'list' },
    { method: 'GET', path: '/tournaments', entity: 'tournament', operation: 'list' },
    { method: 'POST', path: '/tournaments/register', entity: 'tournament', operation: 'update' },
    { method: 'GET', path: '/coaching', entity: 'coaching', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/coaching', entity: 'coaching', operation: 'create' },
    { method: 'GET', path: '/members', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'membership', operation: 'create' },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/teams', entity: 'team', operation: 'list' },
  ],

  entityConfig: {
    station: {
      defaultFields: [
        { name: 'station_name', type: 'string', required: true },
        { name: 'station_type', type: 'enum', required: true },
        { name: 'platform', type: 'enum' },
        { name: 'pc_specs', type: 'json' },
        { name: 'peripherals', type: 'json' },
        { name: 'games_installed', type: 'json' },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'member_rate', type: 'decimal' },
        { name: 'streaming_capable', type: 'boolean' },
        { name: 'current_session', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    tournament: {
      defaultFields: [
        { name: 'tournament_name', type: 'string', required: true },
        { name: 'game', type: 'string', required: true },
        { name: 'tournament_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'format', type: 'enum', required: true },
        { name: 'team_size', type: 'integer' },
        { name: 'max_teams', type: 'integer' },
        { name: 'registered_teams', type: 'integer' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'prize_pool', type: 'decimal' },
        { name: 'prize_distribution', type: 'json' },
        { name: 'rules', type: 'text' },
        { name: 'bracket', type: 'json' },
        { name: 'stream_link', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'team' },
      ],
    },
    coaching: {
      defaultFields: [
        { name: 'session_number', type: 'string', required: true },
        { name: 'session_date', type: 'date', required: true },
        { name: 'session_time', type: 'datetime', required: true },
        { name: 'duration', type: 'integer', required: true },
        { name: 'student_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'game', type: 'string', required: true },
        { name: 'current_rank', type: 'string' },
        { name: 'goals', type: 'text' },
        { name: 'coach', type: 'string', required: true },
        { name: 'session_type', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'membership' },
      ],
    },
    membership: {
      defaultFields: [
        { name: 'member_number', type: 'string', required: true },
        { name: 'gamer_tag', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'games_played', type: 'json' },
        { name: 'ranks', type: 'json' },
        { name: 'hours_played', type: 'integer' },
        { name: 'tournament_wins', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'coaching' },
        { type: 'belongsTo', target: 'team' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration', type: 'integer' },
        { name: 'gamer_tag', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'game_preference', type: 'string' },
        { name: 'party_size', type: 'integer' },
        { name: 'stations_needed', type: 'integer' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'member_discount', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'station' },
        { type: 'belongsTo', target: 'membership' },
      ],
    },
    team: {
      defaultFields: [
        { name: 'team_name', type: 'string', required: true },
        { name: 'tag', type: 'string' },
        { name: 'captain', type: 'string', required: true },
        { name: 'members', type: 'json' },
        { name: 'games', type: 'json' },
        { name: 'achievements', type: 'json' },
        { name: 'tournament_history', type: 'json' },
        { name: 'logo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'membership' },
      ],
    },
  },
};

export default esportsloungeBlueprint;
