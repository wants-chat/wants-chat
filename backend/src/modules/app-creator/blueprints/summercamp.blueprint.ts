import { Blueprint } from './blueprint.interface';

/**
 * Summer Camp Blueprint
 */
export const summercampBlueprint: Blueprint = {
  appType: 'summercamp',
  description: 'Summer camp app with sessions, campers, activities, and registrations',

  coreEntities: ['session', 'camper', 'registration', 'activity', 'counselor', 'cabin'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Sessions', path: '/sessions', icon: 'Calendar' },
        { label: 'Campers', path: '/campers', icon: 'Users' },
        { label: 'Registrations', path: '/registrations', icon: 'ClipboardList' },
        { label: 'Activities', path: '/activities', icon: 'Flag' },
        { label: 'Counselors', path: '/counselors', icon: 'UserCheck' },
        { label: 'Cabins', path: '/cabins', icon: 'Home' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-sessions', component: 'data-table', entity: 'session', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-grid', component: 'product-grid', entity: 'session', position: 'main' },
    ]},
    { path: '/campers', name: 'Campers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'camper-table', component: 'data-table', entity: 'camper', position: 'main' },
    ]},
    { path: '/registrations', name: 'Registrations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'registration-table', component: 'data-table', entity: 'registration', position: 'main' },
    ]},
    { path: '/activities', name: 'Activities', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'activity-grid', component: 'product-grid', entity: 'activity', position: 'main' },
    ]},
    { path: '/counselors', name: 'Counselors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'counselor-grid', component: 'staff-grid', entity: 'counselor', position: 'main' },
    ]},
    { path: '/cabins', name: 'Cabins', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'cabin-grid', component: 'product-grid', entity: 'cabin', position: 'main' },
    ]},
    { path: '/register', name: 'Register for Camp', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'session-grid', component: 'product-grid', entity: 'session', position: 'main' },
      { id: 'registration-form', component: 'booking-wizard', entity: 'registration', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list' },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/campers', entity: 'camper', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/campers', entity: 'camper', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/registrations', entity: 'registration', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/registrations', entity: 'registration', operation: 'create' },
    { method: 'GET', path: '/activities', entity: 'activity', operation: 'list' },
    { method: 'GET', path: '/counselors', entity: 'counselor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/cabins', entity: 'cabin', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    session: {
      defaultFields: [
        { name: 'session_name', type: 'string', required: true },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'age_group', type: 'string' },
        { name: 'min_age', type: 'integer' },
        { name: 'max_age', type: 'integer' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'enrolled', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'early_bird_price', type: 'decimal' },
        { name: 'early_bird_deadline', type: 'date' },
        { name: 'deposit', type: 'decimal' },
        { name: 'activities_included', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'registration' },
      ],
    },
    camper: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'grade', type: 'string' },
        { name: 'school', type: 'string' },
        { name: 'allergies', type: 'json' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'medical_conditions', type: 'text' },
        { name: 'special_needs', type: 'text' },
        { name: 'swimming_level', type: 'enum' },
        { name: 'parent1', type: 'json', required: true },
        { name: 'parent2', type: 'json' },
        { name: 'emergency_contact', type: 'json', required: true },
        { name: 'authorized_pickups', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'registration' },
      ],
    },
    registration: {
      defaultFields: [
        { name: 'registration_number', type: 'string', required: true },
        { name: 'registration_date', type: 'date', required: true },
        { name: 'add_ons', type: 'json' },
        { name: 'transportation', type: 'enum' },
        { name: 'extended_care', type: 'boolean' },
        { name: 'tshirt_size', type: 'string' },
        { name: 'cabin_preference', type: 'string' },
        { name: 'buddy_request', type: 'string' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'forms_completed', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'session' },
        { type: 'belongsTo', target: 'camper' },
        { type: 'belongsTo', target: 'cabin' },
      ],
    },
    activity: {
      defaultFields: [
        { name: 'activity_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'location', type: 'string' },
        { name: 'min_age', type: 'integer' },
        { name: 'max_participants', type: 'integer' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'safety_requirements', type: 'json' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    counselor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'role', type: 'enum', required: true },
        { name: 'certifications', type: 'json' },
        { name: 'first_aid_certified', type: 'boolean' },
        { name: 'cpr_certified', type: 'boolean' },
        { name: 'lifeguard_certified', type: 'boolean' },
        { name: 'background_check', type: 'boolean' },
        { name: 'start_date', type: 'date' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'cabin' },
      ],
    },
    cabin: {
      defaultFields: [
        { name: 'cabin_name', type: 'string', required: true },
        { name: 'cabin_type', type: 'enum' },
        { name: 'capacity', type: 'integer', required: true },
        { name: 'current_occupancy', type: 'integer' },
        { name: 'gender', type: 'enum' },
        { name: 'age_group', type: 'string' },
        { name: 'amenities', type: 'json' },
        { name: 'location', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'registration' },
        { type: 'hasMany', target: 'counselor' },
      ],
    },
  },
};

export default summercampBlueprint;
