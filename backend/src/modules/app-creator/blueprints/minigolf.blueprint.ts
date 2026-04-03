import { Blueprint } from './blueprint.interface';

/**
 * Mini Golf / Putt-Putt Blueprint
 */
export const minigolfBlueprint: Blueprint = {
  appType: 'minigolf',
  description: 'Mini golf app with tee times, courses, parties, and tournaments',

  coreEntities: ['course', 'booking', 'customer', 'party', 'tournament', 'scorecard'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Tee Times', path: '/bookings', icon: 'Calendar' },
        { label: 'Courses', path: '/courses', icon: 'Flag' },
        { label: 'Parties', path: '/parties', icon: 'PartyPopper' },
        { label: 'Tournaments', path: '/tournaments', icon: 'Trophy' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Scorecards', path: '/scorecards', icon: 'ClipboardList' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-bookings', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Tee Times', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/courses', name: 'Courses', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'course-grid', component: 'data-table', entity: 'course', position: 'main' },
    ]},
    { path: '/parties', name: 'Party Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'party-calendar', component: 'appointment-calendar', entity: 'party', position: 'main' },
      { id: 'party-table', component: 'data-table', entity: 'party', position: 'main' },
    ]},
    { path: '/tournaments', name: 'Tournaments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tournament-table', component: 'data-table', entity: 'tournament', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/scorecards', name: 'Scorecards', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'scorecard-table', component: 'data-table', entity: 'scorecard', position: 'main' },
    ]},
    { path: '/book', name: 'Book Tee Time', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/courses', entity: 'course', operation: 'list' },
    { method: 'GET', path: '/parties', entity: 'party', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/parties', entity: 'party', operation: 'create' },
    { method: 'GET', path: '/tournaments', entity: 'tournament', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/scorecards', entity: 'scorecard', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    course: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'theme', type: 'string' },
        { name: 'num_holes', type: 'integer', required: true },
        { name: 'par', type: 'integer', required: true },
        { name: 'difficulty', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'features', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'estimated_time', type: 'integer' },
        { name: 'is_indoor', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
        { name: 'image_url', type: 'image' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'tee_time', type: 'datetime', required: true },
        { name: 'num_players', type: 'integer', required: true },
        { name: 'club_rental', type: 'integer' },
        { name: 'ball_color', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'course' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'total_rounds', type: 'integer' },
        { name: 'best_score', type: 'integer' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'scorecard' },
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
        { name: 'courses_reserved', type: 'json' },
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
    tournament: {
      defaultFields: [
        { name: 'tournament_name', type: 'string', required: true },
        { name: 'tournament_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'format', type: 'enum' },
        { name: 'entry_fee', type: 'decimal' },
        { name: 'max_participants', type: 'integer' },
        { name: 'current_participants', type: 'integer' },
        { name: 'prizes', type: 'json' },
        { name: 'rules', type: 'text' },
        { name: 'status', type: 'enum', required: true },
        { name: 'results', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
      ],
    },
    scorecard: {
      defaultFields: [
        { name: 'play_date', type: 'datetime', required: true },
        { name: 'scores_by_hole', type: 'json', required: true },
        { name: 'total_score', type: 'integer', required: true },
        { name: 'par_difference', type: 'integer' },
        { name: 'is_verified', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'course' },
        { type: 'belongsTo', target: 'booking' },
      ],
    },
  },
};

export default minigolfBlueprint;
