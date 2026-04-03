import { Blueprint } from './blueprint.interface';

/**
 * Bowling Alley / Entertainment Center Blueprint
 */
export const bowlingBlueprint: Blueprint = {
  appType: 'bowling',
  description: 'Bowling alley app with lane reservations, leagues, parties, and shoe rentals',

  coreEntities: ['lane', 'reservation', 'customer', 'league', 'party', 'rental'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Lanes', path: '/lanes', icon: 'Target' },
        { label: 'Leagues', path: '/leagues', icon: 'Trophy' },
        { label: 'Parties', path: '/parties', icon: 'PartyPopper' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Rentals', path: '/rentals', icon: 'Package' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'lane-status', component: 'data-table', entity: 'lane', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'appointment-calendar', entity: 'reservation', position: 'main' },
      { id: 'reservation-table', component: 'data-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/lanes', name: 'Lanes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lane-grid', component: 'data-table', entity: 'lane', position: 'main' },
    ]},
    { path: '/leagues', name: 'Leagues', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'league-table', component: 'data-table', entity: 'league', position: 'main' },
    ]},
    { path: '/parties', name: 'Party Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'party-calendar', component: 'appointment-calendar', entity: 'party', position: 'main' },
      { id: 'party-table', component: 'data-table', entity: 'party', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/rentals', name: 'Equipment Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-table', component: 'data-table', entity: 'rental', position: 'main' },
    ]},
    { path: '/book', name: 'Reserve Lane', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
    { path: '/party', name: 'Book Party', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'party-form', component: 'booking-wizard', entity: 'party', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/lanes', entity: 'lane', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/leagues', entity: 'league', operation: 'list' },
    { method: 'GET', path: '/parties', entity: 'party', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/parties', entity: 'party', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/rentals', entity: 'rental', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    lane: {
      defaultFields: [
        { name: 'lane_number', type: 'integer', required: true },
        { name: 'lane_type', type: 'enum' },
        { name: 'has_bumpers', type: 'boolean' },
        { name: 'has_auto_scoring', type: 'boolean' },
        { name: 'max_players', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'maintenance_notes', type: 'text' },
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
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'num_players', type: 'integer', required: true },
        { name: 'num_lanes', type: 'integer', required: true },
        { name: 'shoe_sizes', type: 'json' },
        { name: 'bumpers_requested', type: 'boolean' },
        { name: 'special_requests', type: 'text' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
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
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'shoe_size', type: 'string' },
        { name: 'average_score', type: 'integer' },
        { name: 'total_games', type: 'integer' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    league: {
      defaultFields: [
        { name: 'league_name', type: 'string', required: true },
        { name: 'league_type', type: 'enum' },
        { name: 'day_of_week', type: 'enum', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'season_start', type: 'date' },
        { name: 'season_end', type: 'date' },
        { name: 'num_teams', type: 'integer' },
        { name: 'teams', type: 'json' },
        { name: 'standings', type: 'json' },
        { name: 'fee_per_week', type: 'decimal' },
        { name: 'lane_assignment', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    party: {
      defaultFields: [
        { name: 'party_number', type: 'string', required: true },
        { name: 'party_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration_hours', type: 'decimal', required: true },
        { name: 'party_type', type: 'enum' },
        { name: 'guest_count', type: 'integer', required: true },
        { name: 'num_lanes', type: 'integer', required: true },
        { name: 'package_selected', type: 'json' },
        { name: 'food_options', type: 'json' },
        { name: 'decorations', type: 'json' },
        { name: 'special_requests', type: 'text' },
        { name: 'total', type: 'decimal' },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'contact_phone', type: 'phone', required: true },
        { name: 'contact_email', type: 'email' },
      ],
      relationships: [],
    },
    rental: {
      defaultFields: [
        { name: 'rental_type', type: 'enum', required: true },
        { name: 'size', type: 'string' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'rented_at', type: 'datetime', required: true },
        { name: 'returned_at', type: 'datetime' },
        { name: 'price', type: 'decimal' },
        { name: 'condition_notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'reservation' },
      ],
    },
  },
};

export default bowlingBlueprint;
