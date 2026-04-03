import { Blueprint } from './blueprint.interface';

/**
 * Skating Rink (Ice / Roller) Blueprint
 */
export const skatingrinkBlueprint: Blueprint = {
  appType: 'skatingrink',
  description: 'Skating rink app with sessions, rentals, lessons, parties, and memberships',

  coreEntities: ['session', 'customer', 'rental', 'lesson', 'party', 'membership'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Sessions', path: '/sessions', icon: 'Calendar' },
        { label: 'Rentals', path: '/rentals', icon: 'Package' },
        { label: 'Lessons', path: '/lessons', icon: 'GraduationCap' },
        { label: 'Parties', path: '/parties', icon: 'PartyPopper' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Memberships', path: '/memberships', icon: 'CreditCard' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'current-session', component: 'chart-widget', position: 'main' },
      { id: 'today-sessions', component: 'appointment-list', entity: 'session', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-calendar', component: 'appointment-calendar', entity: 'session', position: 'main' },
      { id: 'session-table', component: 'data-table', entity: 'session', position: 'main' },
    ]},
    { path: '/rentals', name: 'Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-table', component: 'data-table', entity: 'rental', position: 'main' },
    ]},
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-calendar', component: 'appointment-calendar', entity: 'lesson', position: 'main' },
      { id: 'lesson-table', component: 'data-table', entity: 'lesson', position: 'main' },
    ]},
    { path: '/parties', name: 'Parties', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'party-calendar', component: 'appointment-calendar', entity: 'party', position: 'main' },
      { id: 'party-table', component: 'data-table', entity: 'party', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/memberships', name: 'Memberships', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'membership-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/book', name: 'Book Session', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'session', position: 'main' },
    ]},
    { path: '/party-booking', name: 'Book Party', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'party-form', component: 'booking-wizard', entity: 'party', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list' },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create' },
    { method: 'GET', path: '/rentals', entity: 'rental', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list' },
    { method: 'POST', path: '/lessons', entity: 'lesson', operation: 'create' },
    { method: 'GET', path: '/parties', entity: 'party', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/parties', entity: 'party', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    session: {
      defaultFields: [
        { name: 'session_name', type: 'string', required: true },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'rink_type', type: 'enum', required: true },
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'capacity', type: 'integer' },
        { name: 'admitted', type: 'integer' },
        { name: 'admission_price', type: 'decimal' },
        { name: 'skate_rental_price', type: 'decimal' },
        { name: 'theme', type: 'string' },
        { name: 'dj', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'skate_size', type: 'string' },
        { name: 'skill_level', type: 'enum' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'rental' },
        { type: 'hasOne', target: 'membership' },
      ],
    },
    rental: {
      defaultFields: [
        { name: 'rental_number', type: 'string', required: true },
        { name: 'rental_date', type: 'datetime', required: true },
        { name: 'skate_type', type: 'enum', required: true },
        { name: 'skate_size', type: 'string', required: true },
        { name: 'checkout_time', type: 'datetime' },
        { name: 'return_time', type: 'datetime' },
        { name: 'deposit', type: 'decimal' },
        { name: 'price', type: 'decimal' },
        { name: 'condition_out', type: 'enum' },
        { name: 'condition_in', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'session' },
      ],
    },
    lesson: {
      defaultFields: [
        { name: 'lesson_name', type: 'string', required: true },
        { name: 'lesson_type', type: 'enum', required: true },
        { name: 'skill_level', type: 'enum', required: true },
        { name: 'age_group', type: 'enum' },
        { name: 'lesson_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'instructor', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'price', type: 'decimal' },
        { name: 'includes_rental', type: 'boolean' },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    party: {
      defaultFields: [
        { name: 'party_number', type: 'string', required: true },
        { name: 'party_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'party_type', type: 'enum' },
        { name: 'guest_of_honor', type: 'string' },
        { name: 'age', type: 'integer' },
        { name: 'num_guests', type: 'integer', required: true },
        { name: 'package_type', type: 'enum' },
        { name: 'skate_time_minutes', type: 'integer' },
        { name: 'party_room', type: 'string' },
        { name: 'party_room_minutes', type: 'integer' },
        { name: 'food_options', type: 'json' },
        { name: 'decorations', type: 'json' },
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
        { name: 'unlimited_sessions', type: 'boolean' },
        { name: 'sessions_included', type: 'integer' },
        { name: 'sessions_used', type: 'integer' },
        { name: 'free_rentals', type: 'boolean' },
        { name: 'lesson_discount', type: 'decimal' },
        { name: 'party_discount', type: 'decimal' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default skatingrinkBlueprint;
