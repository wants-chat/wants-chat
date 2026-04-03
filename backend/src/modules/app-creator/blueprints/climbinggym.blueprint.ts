import { Blueprint } from './blueprint.interface';

/**
 * Rock Climbing Gym Blueprint
 */
export const climbinggymBlueprint: Blueprint = {
  appType: 'climbinggym',
  description: 'Climbing gym app with memberships, day passes, classes, and route tracking',

  coreEntities: ['membership', 'customer', 'day_pass', 'class', 'route', 'rental'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Check-In', path: '/checkin', icon: 'CheckCircle' },
        { label: 'Memberships', path: '/memberships', icon: 'CreditCard' },
        { label: 'Day Passes', path: '/passes', icon: 'Ticket' },
        { label: 'Classes', path: '/classes', icon: 'GraduationCap' },
        { label: 'Routes', path: '/routes', icon: 'Mountain' },
        { label: 'Rentals', path: '/rentals', icon: 'Package' },
        { label: 'Members', path: '/members', icon: 'Users' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'current-capacity', component: 'chart-widget', position: 'main' },
      { id: 'today-checkins', component: 'appointment-list', entity: 'day_pass', position: 'main' },
    ]},
    { path: '/checkin', name: 'Check-In', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'checkin-form', component: 'search-bar', entity: 'customer', position: 'main' },
      { id: 'checkin-list', component: 'data-table', entity: 'day_pass', position: 'main' },
    ]},
    { path: '/memberships', name: 'Memberships', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'membership-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/passes', name: 'Day Passes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pass-table', component: 'data-table', entity: 'day_pass', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-calendar', component: 'appointment-calendar', entity: 'class', position: 'main' },
      { id: 'class-table', component: 'data-table', entity: 'class', position: 'main' },
    ]},
    { path: '/routes', name: 'Routes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'route-table', component: 'data-table', entity: 'route', position: 'main' },
    ]},
    { path: '/rentals', name: 'Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-table', component: 'data-table', entity: 'rental', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/join', name: 'Join', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'pricing', component: 'plan-grid', entity: 'membership', position: 'main' },
    ]},
    { path: '/day-pass', name: 'Buy Day Pass', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'pass-form', component: 'booking-wizard', entity: 'day_pass', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/memberships', entity: 'membership', operation: 'create' },
    { method: 'GET', path: '/passes', entity: 'day_pass', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/passes', entity: 'day_pass', operation: 'create' },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'POST', path: '/classes/register', entity: 'class', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/routes', entity: 'route', operation: 'list' },
    { method: 'GET', path: '/rentals', entity: 'rental', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/members', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    membership: {
      defaultFields: [
        { name: 'membership_number', type: 'string', required: true },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'monthly_price', type: 'decimal' },
        { name: 'includes_classes', type: 'boolean' },
        { name: 'includes_rentals', type: 'boolean' },
        { name: 'guest_passes', type: 'integer' },
        { name: 'guest_passes_used', type: 'integer' },
        { name: 'freeze_available', type: 'boolean' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'payment_method', type: 'json' },
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
        { name: 'date_of_birth', type: 'date' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'waiver_date', type: 'date' },
        { name: 'belay_certified', type: 'boolean' },
        { name: 'lead_certified', type: 'boolean' },
        { name: 'total_visits', type: 'integer' },
        { name: 'routes_climbed', type: 'json' },
        { name: 'highest_grade', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasOne', target: 'membership' },
        { type: 'hasMany', target: 'day_pass' },
      ],
    },
    day_pass: {
      defaultFields: [
        { name: 'pass_number', type: 'string', required: true },
        { name: 'visit_date', type: 'date', required: true },
        { name: 'pass_type', type: 'enum', required: true },
        { name: 'rental_gear', type: 'json' },
        { name: 'belay_lesson', type: 'boolean' },
        { name: 'checkin_time', type: 'datetime' },
        { name: 'checkout_time', type: 'datetime' },
        { name: 'total', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'instructor', type: 'string' },
        { name: 'class_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'skill_level', type: 'enum' },
        { name: 'capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'price', type: 'decimal' },
        { name: 'member_price', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    route: {
      defaultFields: [
        { name: 'route_name', type: 'string', required: true },
        { name: 'route_type', type: 'enum', required: true },
        { name: 'grade', type: 'string', required: true },
        { name: 'color', type: 'string' },
        { name: 'wall_section', type: 'string' },
        { name: 'setter', type: 'string' },
        { name: 'set_date', type: 'date' },
        { name: 'takedown_date', type: 'date' },
        { name: 'ascents', type: 'integer' },
        { name: 'rating', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    rental: {
      defaultFields: [
        { name: 'rental_number', type: 'string', required: true },
        { name: 'rental_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'shoe_size', type: 'string' },
        { name: 'harness_size', type: 'string' },
        { name: 'checkout_time', type: 'datetime' },
        { name: 'return_time', type: 'datetime' },
        { name: 'total', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'day_pass' },
      ],
    },
  },
};

export default climbinggymBlueprint;
