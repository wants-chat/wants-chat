import { Blueprint } from './blueprint.interface';

/**
 * Axe Throwing Venue Blueprint
 */
export const axethrowingBlueprint: Blueprint = {
  appType: 'axethrowing',
  description: 'Axe throwing venue app with bookings, lanes, leagues, and events',

  coreEntities: ['booking', 'customer', 'lane', 'league', 'event', 'membership'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Lanes', path: '/lanes', icon: 'Target' },
        { label: 'Leagues', path: '/leagues', icon: 'Trophy' },
        { label: 'Events', path: '/events', icon: 'PartyPopper' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Memberships', path: '/memberships', icon: 'CreditCard' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-bookings', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/lanes', name: 'Lanes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lane-grid', component: 'product-grid', entity: 'lane', position: 'main' },
    ]},
    { path: '/leagues', name: 'Leagues', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'league-table', component: 'data-table', entity: 'league', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
      { id: 'event-table', component: 'data-table', entity: 'event', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/memberships', name: 'Memberships', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'membership-table', component: 'data-table', entity: 'membership', position: 'main' },
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
    { method: 'GET', path: '/lanes', entity: 'lane', operation: 'list' },
    { method: 'GET', path: '/leagues', entity: 'league', operation: 'list' },
    { method: 'POST', path: '/leagues/join', entity: 'league', operation: 'update' },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/events', entity: 'event', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'num_throwers', type: 'integer', required: true },
        { name: 'thrower_names', type: 'json' },
        { name: 'experience_level', type: 'enum' },
        { name: 'includes_coaching', type: 'boolean' },
        { name: 'total', type: 'decimal' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'checked_in', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'lane' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'waiver_date', type: 'date' },
        { name: 'skill_level', type: 'enum' },
        { name: 'best_score', type: 'integer' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasOne', target: 'membership' },
      ],
    },
    lane: {
      defaultFields: [
        { name: 'lane_number', type: 'string', required: true },
        { name: 'lane_type', type: 'enum', required: true },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'has_projector', type: 'boolean' },
        { name: 'games_available', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    league: {
      defaultFields: [
        { name: 'league_name', type: 'string', required: true },
        { name: 'league_type', type: 'enum', required: true },
        { name: 'skill_level', type: 'enum' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'day_of_week', type: 'enum' },
        { name: 'start_time', type: 'datetime' },
        { name: 'weeks', type: 'integer' },
        { name: 'team_size', type: 'integer' },
        { name: 'max_teams', type: 'integer' },
        { name: 'registered_teams', type: 'integer' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'prizes', type: 'json' },
        { name: 'standings', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'rules', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    event: {
      defaultFields: [
        { name: 'event_number', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'num_guests', type: 'integer', required: true },
        { name: 'guest_of_honor', type: 'string' },
        { name: 'lanes_reserved', type: 'integer' },
        { name: 'package_type', type: 'enum' },
        { name: 'catering', type: 'json' },
        { name: 'add_ons', type: 'json' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'special_requests', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    membership: {
      defaultFields: [
        { name: 'membership_number', type: 'string', required: true },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'monthly_price', type: 'decimal' },
        { name: 'free_hours', type: 'integer' },
        { name: 'hours_used', type: 'integer' },
        { name: 'guest_discount', type: 'decimal' },
        { name: 'league_discount', type: 'decimal' },
        { name: 'merch_discount', type: 'decimal' },
        { name: 'priority_booking', type: 'boolean' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default axethrowingBlueprint;
