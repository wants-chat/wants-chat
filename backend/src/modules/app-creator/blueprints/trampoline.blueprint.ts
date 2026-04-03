import { Blueprint } from './blueprint.interface';

/**
 * Trampoline Park Blueprint
 */
export const trampolineBlueprint: Blueprint = {
  appType: 'trampoline',
  description: 'Trampoline park app with bookings, waivers, parties, and memberships',

  coreEntities: ['booking', 'customer', 'waiver', 'membership', 'party', 'session'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Check-In', path: '/checkin', icon: 'CheckCircle' },
        { label: 'Parties', path: '/parties', icon: 'PartyPopper' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Memberships', path: '/memberships', icon: 'CreditCard' },
        { label: 'Waivers', path: '/waivers', icon: 'FileText' },
        { label: 'Sessions', path: '/sessions', icon: 'Clock' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'current-capacity', component: 'chart-widget', position: 'main' },
      { id: 'today-bookings', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/checkin', name: 'Check-In', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'checkin-form', component: 'search-bar', entity: 'booking', position: 'main' },
      { id: 'checkin-list', component: 'data-table', entity: 'booking', position: 'main' },
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
    { path: '/waivers', name: 'Waivers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'waiver-table', component: 'data-table', entity: 'waiver', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-table', component: 'data-table', entity: 'session', position: 'main' },
    ]},
    { path: '/book', name: 'Book Jump Time', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
    { path: '/waiver', name: 'Sign Waiver', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'waiver-form', component: 'booking-wizard', entity: 'waiver', position: 'main' },
    ]},
    { path: '/party-booking', name: 'Book Party', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'party-form', component: 'booking-wizard', entity: 'party', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/parties', entity: 'party', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/parties', entity: 'party', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/waivers', entity: 'waiver', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/waivers', entity: 'waiver', operation: 'create' },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    booking: {
      defaultFields: [
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_date', type: 'date', required: true },
        { name: 'session_time', type: 'datetime', required: true },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'num_jumpers', type: 'integer', required: true },
        { name: 'jumper_info', type: 'json' },
        { name: 'grip_socks', type: 'integer' },
        { name: 'attractions', type: 'json' },
        { name: 'total', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'checked_in', type: 'boolean' },
        { name: 'checkin_time', type: 'datetime' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'session' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'waiver' },
        { type: 'hasOne', target: 'membership' },
      ],
    },
    waiver: {
      defaultFields: [
        { name: 'waiver_number', type: 'string', required: true },
        { name: 'signed_date', type: 'datetime', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'jumper_name', type: 'string', required: true },
        { name: 'jumper_dob', type: 'date', required: true },
        { name: 'is_minor', type: 'boolean' },
        { name: 'guardian_name', type: 'string' },
        { name: 'guardian_relationship', type: 'string' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'medical_conditions', type: 'text' },
        { name: 'signature', type: 'string' },
        { name: 'photo_consent', type: 'boolean' },
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
        { name: 'jumps_included', type: 'integer' },
        { name: 'jumps_used', type: 'integer' },
        { name: 'discount_percent', type: 'decimal' },
        { name: 'party_discount', type: 'decimal' },
        { name: 'free_socks', type: 'boolean' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    party: {
      defaultFields: [
        { name: 'party_number', type: 'string', required: true },
        { name: 'party_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'package_type', type: 'enum', required: true },
        { name: 'guest_of_honor', type: 'string' },
        { name: 'age', type: 'integer' },
        { name: 'num_guests', type: 'integer', required: true },
        { name: 'room', type: 'string' },
        { name: 'jump_time_minutes', type: 'integer' },
        { name: 'party_room_minutes', type: 'integer' },
        { name: 'food_options', type: 'json' },
        { name: 'cake', type: 'json' },
        { name: 'decorations', type: 'json' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'special_requests', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'booked', type: 'integer' },
        { name: 'checked_in', type: 'integer' },
        { name: 'attractions_open', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
  },
};

export default trampolineBlueprint;
