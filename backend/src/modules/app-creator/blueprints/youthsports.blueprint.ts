import { Blueprint } from './blueprint.interface';

/**
 * Youth Sports Blueprint
 */
export const youthsportsBlueprint: Blueprint = {
  appType: 'youthsports',
  description: 'Youth sports league app with teams, seasons, games, and registrations',

  coreEntities: ['team', 'player', 'season', 'game', 'registration', 'coach'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Teams', path: '/teams', icon: 'Users' },
        { label: 'Players', path: '/players', icon: 'User' },
        { label: 'Seasons', path: '/seasons', icon: 'Calendar' },
        { label: 'Games', path: '/games', icon: 'Trophy' },
        { label: 'Registrations', path: '/registrations', icon: 'ClipboardList' },
        { label: 'Coaches', path: '/coaches', icon: 'UserCheck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-games', component: 'appointment-list', entity: 'game', position: 'main' },
    ]},
    { path: '/teams', name: 'Teams', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'team-grid', component: 'product-grid', entity: 'team', position: 'main' },
    ]},
    { path: '/players', name: 'Players', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'player-table', component: 'data-table', entity: 'player', position: 'main' },
    ]},
    { path: '/seasons', name: 'Seasons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'season-table', component: 'data-table', entity: 'season', position: 'main' },
    ]},
    { path: '/games', name: 'Games', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'game-calendar', component: 'appointment-calendar', entity: 'game', position: 'main' },
    ]},
    { path: '/registrations', name: 'Registrations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'registration-table', component: 'data-table', entity: 'registration', position: 'main' },
    ]},
    { path: '/coaches', name: 'Coaches', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'coach-grid', component: 'staff-grid', entity: 'coach', position: 'main' },
    ]},
    { path: '/register', name: 'Register', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'season-grid', component: 'product-grid', entity: 'season', position: 'main' },
      { id: 'registration-form', component: 'booking-wizard', entity: 'registration', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/teams', entity: 'team', operation: 'list' },
    { method: 'POST', path: '/teams', entity: 'team', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/players', entity: 'player', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/players', entity: 'player', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/seasons', entity: 'season', operation: 'list' },
    { method: 'POST', path: '/seasons', entity: 'season', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/games', entity: 'game', operation: 'list' },
    { method: 'POST', path: '/games', entity: 'game', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/registrations', entity: 'registration', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/registrations', entity: 'registration', operation: 'create' },
    { method: 'GET', path: '/coaches', entity: 'coach', operation: 'list' },
  ],

  entityConfig: {
    team: {
      defaultFields: [
        { name: 'team_name', type: 'string', required: true },
        { name: 'sport', type: 'enum', required: true },
        { name: 'age_group', type: 'string' },
        { name: 'division', type: 'string' },
        { name: 'colors', type: 'json' },
        { name: 'home_field', type: 'string' },
        { name: 'practice_schedule', type: 'json' },
        { name: 'roster_size', type: 'integer' },
        { name: 'wins', type: 'integer' },
        { name: 'losses', type: 'integer' },
        { name: 'ties', type: 'integer' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'season' },
        { type: 'belongsTo', target: 'coach' },
        { type: 'hasMany', target: 'player' },
      ],
    },
    player: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'jersey_number', type: 'string' },
        { name: 'position', type: 'string' },
        { name: 'school', type: 'string' },
        { name: 'grade', type: 'string' },
        { name: 'parent1', type: 'json', required: true },
        { name: 'parent2', type: 'json' },
        { name: 'emergency_contact', type: 'json', required: true },
        { name: 'medical_info', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'team' },
        { type: 'hasOne', target: 'registration' },
      ],
    },
    season: {
      defaultFields: [
        { name: 'season_name', type: 'string', required: true },
        { name: 'sport', type: 'enum', required: true },
        { name: 'year', type: 'integer', required: true },
        { name: 'season_type', type: 'enum' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'registration_open', type: 'date' },
        { name: 'registration_close', type: 'date' },
        { name: 'registration_fee', type: 'decimal', required: true },
        { name: 'early_bird_fee', type: 'decimal' },
        { name: 'late_fee', type: 'decimal' },
        { name: 'max_teams', type: 'integer' },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'team' },
        { type: 'hasMany', target: 'game' },
        { type: 'hasMany', target: 'registration' },
      ],
    },
    game: {
      defaultFields: [
        { name: 'game_date', type: 'date', required: true },
        { name: 'game_time', type: 'datetime', required: true },
        { name: 'location', type: 'string' },
        { name: 'field', type: 'string' },
        { name: 'game_type', type: 'enum' },
        { name: 'home_team_score', type: 'integer' },
        { name: 'away_team_score', type: 'integer' },
        { name: 'referee', type: 'string' },
        { name: 'weather', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'season' },
      ],
    },
    registration: {
      defaultFields: [
        { name: 'registration_number', type: 'string', required: true },
        { name: 'registration_date', type: 'date', required: true },
        { name: 'team_preference', type: 'string' },
        { name: 'coach_request', type: 'string' },
        { name: 'carpool_interest', type: 'boolean' },
        { name: 'volunteer_interest', type: 'boolean' },
        { name: 'fee_amount', type: 'decimal', required: true },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'payment_method', type: 'enum' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'medical_release', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'player' },
        { type: 'belongsTo', target: 'season' },
      ],
    },
    coach: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'sports', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'background_check', type: 'boolean' },
        { name: 'concussion_training', type: 'boolean' },
        { name: 'first_aid_certified', type: 'boolean' },
        { name: 'years_experience', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'team' },
      ],
    },
  },
};

export default youthsportsBlueprint;
