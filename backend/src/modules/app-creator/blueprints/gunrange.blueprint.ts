import { Blueprint } from './blueprint.interface';

/**
 * Gun / Shooting Range Blueprint
 */
export const gunrangeBlueprint: Blueprint = {
  appType: 'gunrange',
  description: 'Shooting range app with lane rentals, classes, memberships, and firearm services',

  coreEntities: ['lane_rental', 'customer', 'class', 'membership', 'rental_firearm', 'service'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Lane Rentals', path: '/lanes', icon: 'Target' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Classes', path: '/classes', icon: 'GraduationCap' },
        { label: 'Memberships', path: '/memberships', icon: 'CreditCard' },
        { label: 'Rentals', path: '/rentals', icon: 'Package' },
        { label: 'Services', path: '/services', icon: 'Wrench' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-lanes', component: 'appointment-list', entity: 'lane_rental', position: 'main' },
    ]},
    { path: '/lanes', name: 'Lane Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lane-calendar', component: 'appointment-calendar', entity: 'lane_rental', position: 'main' },
      { id: 'lane-table', component: 'data-table', entity: 'lane_rental', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-calendar', component: 'appointment-calendar', entity: 'class', position: 'main' },
      { id: 'class-table', component: 'data-table', entity: 'class', position: 'main' },
    ]},
    { path: '/memberships', name: 'Memberships', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'membership-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/rentals', name: 'Firearm Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-grid', component: 'product-grid', entity: 'rental_firearm', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-table', component: 'data-table', entity: 'service', position: 'main' },
    ]},
    { path: '/book', name: 'Book Lane', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'lane_rental', position: 'main' },
    ]},
    { path: '/register-class', name: 'Register for Class', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'class-display', component: 'product-grid', entity: 'class', position: 'main' },
      { id: 'register-form', component: 'booking-wizard', entity: 'class', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/lanes', entity: 'lane_rental', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/lanes', entity: 'lane_rental', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'POST', path: '/classes/register', entity: 'class', operation: 'create' },
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/rentals', entity: 'rental_firearm', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    lane_rental: {
      defaultFields: [
        { name: 'rental_number', type: 'string', required: true },
        { name: 'rental_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'lane_number', type: 'string', required: true },
        { name: 'lane_type', type: 'enum' },
        { name: 'num_shooters', type: 'integer', required: true },
        { name: 'shooters_info', type: 'json' },
        { name: 'firearms_rented', type: 'json' },
        { name: 'ammo_purchased', type: 'json' },
        { name: 'targets_purchased', type: 'json' },
        { name: 'eye_ear_protection', type: 'boolean' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'total', type: 'decimal' },
        { name: 'checked_in', type: 'boolean' },
        { name: 'notes', type: 'text' },
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
        { name: 'phone', type: 'phone', required: true },
        { name: 'date_of_birth', type: 'date' },
        { name: 'id_verified', type: 'boolean' },
        { name: 'id_type', type: 'enum' },
        { name: 'id_number', type: 'string' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'waiver_date', type: 'date' },
        { name: 'experience_level', type: 'enum' },
        { name: 'owns_firearms', type: 'boolean' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'lane_rental' },
        { type: 'hasOne', target: 'membership' },
      ],
    },
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'class_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'instructor', type: 'string' },
        { name: 'prerequisites', type: 'json' },
        { name: 'skill_level', type: 'enum' },
        { name: 'includes_range_time', type: 'boolean' },
        { name: 'includes_ammo', type: 'boolean' },
        { name: 'includes_firearm', type: 'boolean' },
        { name: 'capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'member_price', type: 'decimal' },
        { name: 'certification', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    membership: {
      defaultFields: [
        { name: 'membership_number', type: 'string', required: true },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'monthly_fee', type: 'decimal' },
        { name: 'annual_fee', type: 'decimal' },
        { name: 'free_lane_hours', type: 'integer' },
        { name: 'lane_discount', type: 'decimal' },
        { name: 'ammo_discount', type: 'decimal' },
        { name: 'class_discount', type: 'decimal' },
        { name: 'guest_privileges', type: 'integer' },
        { name: 'locker_number', type: 'string' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    rental_firearm: {
      defaultFields: [
        { name: 'firearm_id', type: 'string', required: true },
        { name: 'make', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'caliber', type: 'string', required: true },
        { name: 'firearm_type', type: 'enum', required: true },
        { name: 'serial_number', type: 'string' },
        { name: 'rental_price', type: 'decimal', required: true },
        { name: 'member_price', type: 'decimal' },
        { name: 'ammo_required', type: 'string' },
        { name: 'experience_required', type: 'enum' },
        { name: 'condition', type: 'enum' },
        { name: 'last_cleaned', type: 'date' },
        { name: 'last_serviced', type: 'date' },
        { name: 'image_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    service: {
      defaultFields: [
        { name: 'service_number', type: 'string', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'intake_date', type: 'date', required: true },
        { name: 'firearm_info', type: 'json', required: true },
        { name: 'work_requested', type: 'text' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'gunsmith', type: 'string' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default gunrangeBlueprint;
