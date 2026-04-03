import { Blueprint } from './blueprint.interface';

/**
 * Massage Therapy Blueprint
 */
export const massageBlueprint: Blueprint = {
  appType: 'massage',
  description: 'Massage therapy app with appointments, therapists, packages, and wellness tracking',

  coreEntities: ['appointment', 'service', 'customer', 'therapist', 'package', 'gift_card'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Services', path: '/services', icon: 'Heart' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Therapists', path: '/therapists', icon: 'UserCheck' },
        { label: 'Packages', path: '/packages', icon: 'Package' },
        { label: 'Gift Cards', path: '/giftcards', icon: 'Gift' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
      { id: 'appointment-table', component: 'data-table', entity: 'appointment', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'product-grid', entity: 'service', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/therapists', name: 'Therapists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'therapist-grid', component: 'staff-grid', entity: 'therapist', position: 'main' },
    ]},
    { path: '/packages', name: 'Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-grid', component: 'product-grid', entity: 'package', position: 'main' },
    ]},
    { path: '/giftcards', name: 'Gift Cards', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'giftcard-table', component: 'data-table', entity: 'gift_card', position: 'main' },
    ]},
    { path: '/book', name: 'Book Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
    { path: '/gift', name: 'Buy Gift Card', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'gift-form', component: 'booking-wizard', entity: 'gift_card', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'GET', path: '/clients', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/therapists', entity: 'therapist', operation: 'list' },
    { method: 'GET', path: '/packages', entity: 'package', operation: 'list' },
    { method: 'GET', path: '/giftcards', entity: 'gift_card', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/giftcards', entity: 'gift_card', operation: 'create' },
  ],

  entityConfig: {
    appointment: {
      defaultFields: [
        { name: 'appointment_number', type: 'string', required: true },
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'add_ons', type: 'json' },
        { name: 'pressure_preference', type: 'enum' },
        { name: 'focus_areas', type: 'json' },
        { name: 'avoid_areas', type: 'json' },
        { name: 'room', type: 'string' },
        { name: 'total', type: 'decimal' },
        { name: 'tip', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'therapist' },
        { type: 'belongsTo', target: 'package' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'service_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'benefits', type: 'json' },
        { name: 'duration_options', type: 'json' },
        { name: 'base_price', type: 'decimal', required: true },
        { name: 'add_ons', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_couples', type: 'boolean' },
        { name: 'is_signature', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
        { name: 'sort_order', type: 'integer' },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'birthday', type: 'date' },
        { name: 'health_conditions', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'pressure_preference', type: 'enum' },
        { name: 'preferred_therapist', type: 'string' },
        { name: 'intake_form_completed', type: 'boolean' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'package' },
      ],
    },
    therapist: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string' },
        { name: 'license_expiry', type: 'date' },
        { name: 'certifications', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'modalities', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'reviews_count', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
      ],
    },
    package: {
      defaultFields: [
        { name: 'package_name', type: 'string', required: true },
        { name: 'package_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'sessions_count', type: 'integer' },
        { name: 'session_duration', type: 'integer' },
        { name: 'services_included', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'savings', type: 'decimal' },
        { name: 'validity_days', type: 'integer' },
        { name: 'sessions_remaining', type: 'integer' },
        { name: 'expiry_date', type: 'date' },
        { name: 'is_active', type: 'boolean' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    gift_card: {
      defaultFields: [
        { name: 'card_number', type: 'string', required: true },
        { name: 'card_type', type: 'enum' },
        { name: 'initial_value', type: 'decimal', required: true },
        { name: 'current_balance', type: 'decimal' },
        { name: 'purchase_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'purchaser_name', type: 'string' },
        { name: 'purchaser_email', type: 'email' },
        { name: 'recipient_name', type: 'string' },
        { name: 'recipient_email', type: 'email' },
        { name: 'message', type: 'text' },
        { name: 'is_sent', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
  },
};

export default massageBlueprint;
