import { Blueprint } from './blueprint.interface';

/**
 * Go-Kart Racing / Indoor Karting Blueprint
 */
export const gokartingBlueprint: Blueprint = {
  appType: 'gokarting',
  description: 'Go-kart racing app with bookings, races, memberships, and leaderboards',

  coreEntities: ['booking', 'race', 'customer', 'membership', 'kart', 'event'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Races', path: '/races', icon: 'Flag' },
        { label: 'Leaderboard', path: '/leaderboard', icon: 'Trophy' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Memberships', path: '/memberships', icon: 'CreditCard' },
        { label: 'Karts', path: '/karts', icon: 'Car' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-races', component: 'appointment-list', entity: 'race', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/races', name: 'Races', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'race-table', component: 'data-table', entity: 'race', position: 'main' },
    ]},
    { path: '/leaderboard', name: 'Leaderboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'leaderboard', component: 'data-table', entity: 'race', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/memberships', name: 'Memberships', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'membership-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/karts', name: 'Karts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'kart-table', component: 'data-table', entity: 'kart', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-table', component: 'data-table', entity: 'event', position: 'main' },
    ]},
    { path: '/book', name: 'Book Now', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
    { path: '/parties', name: 'Book Party', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'party-form', component: 'booking-wizard', entity: 'event', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/races', entity: 'race', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/karts', entity: 'kart', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/events', entity: 'event', operation: 'create' },
  ],

  entityConfig: {
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'session_time', type: 'datetime', required: true },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'num_racers', type: 'integer', required: true },
        { name: 'racer_info', type: 'json' },
        { name: 'race_format', type: 'enum' },
        { name: 'track', type: 'enum' },
        { name: 'helmet_rental', type: 'boolean' },
        { name: 'total', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'race' },
      ],
    },
    race: {
      defaultFields: [
        { name: 'race_number', type: 'string', required: true },
        { name: 'race_date', type: 'datetime', required: true },
        { name: 'track', type: 'enum', required: true },
        { name: 'race_type', type: 'enum' },
        { name: 'laps', type: 'integer' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'racer_name', type: 'string' },
        { name: 'best_lap_time', type: 'decimal' },
        { name: 'average_lap_time', type: 'decimal' },
        { name: 'total_time', type: 'decimal' },
        { name: 'lap_times', type: 'json' },
        { name: 'position', type: 'integer' },
        { name: 'points_earned', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'booking' },
        { type: 'belongsTo', target: 'kart' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'racer_name', type: 'string' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'waiver_date', type: 'date' },
        { name: 'best_lap_time', type: 'decimal' },
        { name: 'total_races', type: 'integer' },
        { name: 'points', type: 'integer' },
        { name: 'rank', type: 'string' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'race' },
        { type: 'hasOne', target: 'membership' },
      ],
    },
    membership: {
      defaultFields: [
        { name: 'membership_number', type: 'string', required: true },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'monthly_price', type: 'decimal' },
        { name: 'races_included', type: 'integer' },
        { name: 'races_used', type: 'integer' },
        { name: 'discount_percent', type: 'decimal' },
        { name: 'priority_booking', type: 'boolean' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    kart: {
      defaultFields: [
        { name: 'kart_number', type: 'string', required: true },
        { name: 'kart_type', type: 'enum', required: true },
        { name: 'engine_type', type: 'enum' },
        { name: 'speed_class', type: 'enum' },
        { name: 'color', type: 'string' },
        { name: 'last_maintenance', type: 'date' },
        { name: 'next_maintenance', type: 'date' },
        { name: 'total_laps', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'race' },
      ],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'num_guests', type: 'integer' },
        { name: 'guest_of_honor', type: 'string' },
        { name: 'packages', type: 'json' },
        { name: 'catering', type: 'json' },
        { name: 'private_track', type: 'boolean' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'special_requests', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default gokartingBlueprint;
