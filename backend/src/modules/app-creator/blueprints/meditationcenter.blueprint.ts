import { Blueprint } from './blueprint.interface';

/**
 * Meditation Center Blueprint
 */
export const meditationcenterBlueprint: Blueprint = {
  appType: 'meditationcenter',
  description: 'Meditation center app with sessions, classes, memberships, and wellness programs',

  coreEntities: ['session', 'class', 'member', 'instructor', 'package', 'booking'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Sessions', path: '/sessions', icon: 'Clock' },
        { label: 'Classes', path: '/classes', icon: 'BookOpen' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Instructors', path: '/instructors', icon: 'UserCheck' },
        { label: 'Packages', path: '/packages', icon: 'Package' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-sessions', component: 'appointment-list', entity: 'session', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-calendar', component: 'appointment-calendar', entity: 'session', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-grid', component: 'product-grid', entity: 'class', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'member', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'staff-grid', entity: 'instructor', position: 'main' },
    ]},
    { path: '/packages', name: 'Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-grid', component: 'plan-grid', entity: 'package', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-table', component: 'data-table', entity: 'booking', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-schedule', component: 'appointment-calendar', entity: 'session', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list' },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'POST', path: '/classes', entity: 'class', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'member', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/packages', entity: 'package', operation: 'list' },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
  ],

  entityConfig: {
    session: {
      defaultFields: [
        { name: 'session_name', type: 'string', required: true },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer', required: true },
        { name: 'meditation_style', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'level', type: 'enum' },
        { name: 'room', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'is_online', type: 'boolean' },
        { name: 'online_link', type: 'string' },
        { name: 'props_needed', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'instructor' },
        { type: 'belongsTo', target: 'class' },
      ],
    },
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'meditation_style', type: 'enum' },
        { name: 'level', type: 'enum' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'benefits', type: 'json' },
        { name: 'techniques_taught', type: 'json' },
        { name: 'recurring_schedule', type: 'json' },
        { name: 'drop_in_price', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'session' },
      ],
    },
    member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'membership_type', type: 'enum' },
        { name: 'membership_start', type: 'date' },
        { name: 'membership_end', type: 'date' },
        { name: 'sessions_remaining', type: 'integer' },
        { name: 'meditation_experience', type: 'enum' },
        { name: 'health_conditions', type: 'text' },
        { name: 'goals', type: 'json' },
        { name: 'preferred_styles', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    instructor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'specializations', type: 'json' },
        { name: 'meditation_styles', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'training_lineage', type: 'text' },
        { name: 'years_experience', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'session' },
      ],
    },
    package: {
      defaultFields: [
        { name: 'package_name', type: 'string', required: true },
        { name: 'package_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'sessions_included', type: 'integer' },
        { name: 'validity_days', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'classes_included', type: 'json' },
        { name: 'benefits', type: 'json' },
        { name: 'is_unlimited', type: 'boolean' },
        { name: 'guest_passes', type: 'integer' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    booking: {
      defaultFields: [
        { name: 'booking_date', type: 'date', required: true },
        { name: 'booking_number', type: 'string', required: true },
        { name: 'booking_type', type: 'enum' },
        { name: 'payment_status', type: 'enum' },
        { name: 'payment_method', type: 'enum' },
        { name: 'amount', type: 'decimal' },
        { name: 'checked_in', type: 'boolean' },
        { name: 'check_in_time', type: 'datetime' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
        { type: 'belongsTo', target: 'session' },
        { type: 'belongsTo', target: 'package' },
      ],
    },
  },
};

export default meditationcenterBlueprint;
