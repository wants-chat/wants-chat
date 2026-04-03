import { Blueprint } from './blueprint.interface';

/**
 * Escape Room Blueprint
 */
export const escaperoomBlueprint: Blueprint = {
  appType: 'escaperoom',
  description: 'Escape room with rooms, bookings, teams, and game management',

  coreEntities: ['room', 'booking', 'team', 'game_session', 'customer', 'leaderboard'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Rooms', path: '/rooms', icon: 'DoorOpen' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Sessions', path: '/sessions', icon: 'Timer' },
        { label: 'Leaderboard', path: '/leaderboard', icon: 'Trophy' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
      ]}},
      { id: 'escaperoom-stats', component: 'escaperoom-stats', position: 'main' },
      { id: 'today-bookings', component: 'booking-list-today-escape', entity: 'booking', position: 'main' },
      { id: 'room-status', component: 'room-status-overview', entity: 'room', position: 'main' },
    ]},
    { path: '/rooms', name: 'Rooms', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'room-grid', component: 'room-grid-escape', entity: 'room', position: 'main' },
    ]},
    { path: '/rooms/:id', name: 'Room Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'room-detail', component: 'room-detail-escape', entity: 'room', position: 'main' },
      { id: 'room-schedule', component: 'room-schedule-escape', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'booking-calendar-escape', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings/:id', name: 'Booking Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-detail', component: 'booking-detail-escape', entity: 'booking', position: 'main' },
    ]},
    { path: '/sessions', name: 'Game Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-table', component: 'session-table-escape', entity: 'game_session', position: 'main' },
    ]},
    { path: '/sessions/:id', name: 'Session Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-detail', component: 'session-detail-escape', entity: 'game_session', position: 'main' },
    ]},
    { path: '/leaderboard', name: 'Leaderboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'leaderboard', component: 'leaderboard-escape', entity: 'leaderboard', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-escape', entity: 'customer', position: 'main' },
    ]},
    { path: '/book', name: 'Book Room', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-rooms', component: 'public-rooms-escape', entity: 'room', position: 'main' },
      { id: 'public-booking', component: 'public-booking-escape', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/rooms', entity: 'room', operation: 'list' },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/sessions', entity: 'game_session', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/leaderboard', entity: 'leaderboard', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    room: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'theme', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'difficulty', type: 'enum', required: true },
        { name: 'min_players', type: 'integer', required: true },
        { name: 'max_players', type: 'integer', required: true },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'images', type: 'json' },
        { name: 'success_rate', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'game_session' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string', required: true },
        { name: 'players', type: 'integer', required: true },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'special_occasion', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'room' },
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasOne', target: 'game_session' },
      ],
    },
    game_session: {
      defaultFields: [
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'team_name', type: 'string' },
        { name: 'players', type: 'integer' },
        { name: 'escaped', type: 'boolean' },
        { name: 'completion_time', type: 'integer' },
        { name: 'hints_used', type: 'integer' },
        { name: 'photo', type: 'image' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'room' },
        { type: 'belongsTo', target: 'booking' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'total_visits', type: 'integer' },
        { name: 'rooms_escaped', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'booking' }],
    },
    leaderboard: {
      defaultFields: [
        { name: 'team_name', type: 'string', required: true },
        { name: 'completion_time', type: 'integer', required: true },
        { name: 'players', type: 'integer' },
        { name: 'hints_used', type: 'integer' },
        { name: 'date', type: 'date', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'room' }],
    },
  },
};

export default escaperoomBlueprint;
