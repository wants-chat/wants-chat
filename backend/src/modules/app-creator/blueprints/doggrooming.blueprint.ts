import { Blueprint } from './blueprint.interface';

/**
 * Dog Grooming Salon Blueprint
 */
export const doggroomingBlueprint: Blueprint = {
  appType: 'doggrooming',
  description: 'Dog grooming app with appointments, pets, groomers, and grooming packages',

  coreEntities: ['appointment', 'pet', 'customer', 'groomer', 'service', 'package'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Pets', path: '/pets', icon: 'Dog' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Groomers', path: '/groomers', icon: 'Scissors' },
        { label: 'Services', path: '/services', icon: 'Sparkles' },
        { label: 'Packages', path: '/packages', icon: 'Package' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
      { id: 'appointment-table', component: 'data-table', entity: 'appointment', position: 'main' },
    ]},
    { path: '/pets', name: 'Pets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pet-table', component: 'data-table', entity: 'pet', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/groomers', name: 'Groomers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'groomer-grid', component: 'staff-grid', entity: 'groomer', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'product-grid', entity: 'service', position: 'main' },
    ]},
    { path: '/packages', name: 'Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-grid', component: 'product-grid', entity: 'package', position: 'main' },
    ]},
    { path: '/book', name: 'Book Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/pets', entity: 'pet', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/pets', entity: 'pet', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/groomers', entity: 'groomer', operation: 'list' },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
    { method: 'GET', path: '/packages', entity: 'package', operation: 'list' },
  ],

  entityConfig: {
    appointment: {
      defaultFields: [
        { name: 'appointment_number', type: 'string', required: true },
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'drop_off_time', type: 'datetime', required: true },
        { name: 'pickup_time', type: 'datetime' },
        { name: 'services', type: 'json', required: true },
        { name: 'add_ons', type: 'json' },
        { name: 'special_instructions', type: 'text' },
        { name: 'coat_condition', type: 'enum' },
        { name: 'matting_level', type: 'enum' },
        { name: 'photos_before', type: 'json' },
        { name: 'photos_after', type: 'json' },
        { name: 'total', type: 'decimal' },
        { name: 'tip', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'pet' },
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'groomer' },
      ],
    },
    pet: {
      defaultFields: [
        { name: 'pet_name', type: 'string', required: true },
        { name: 'species', type: 'enum', required: true },
        { name: 'breed', type: 'string', required: true },
        { name: 'size', type: 'enum' },
        { name: 'weight_lbs', type: 'decimal' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'gender', type: 'enum' },
        { name: 'color', type: 'string' },
        { name: 'coat_type', type: 'enum' },
        { name: 'temperament', type: 'enum' },
        { name: 'special_handling', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'medical_conditions', type: 'json' },
        { name: 'vaccination_status', type: 'json' },
        { name: 'vet_info', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'grooming_preferences', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'appointment' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'preferred_groomer', type: 'string' },
        { name: 'preferred_contact', type: 'enum' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'pet' },
        { type: 'hasMany', target: 'appointment' },
      ],
    },
    groomer: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'certifications', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'breed_experience', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
      ],
    },
    service: {
      defaultFields: [
        { name: 'service_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'price_small', type: 'decimal' },
        { name: 'price_medium', type: 'decimal' },
        { name: 'price_large', type: 'decimal' },
        { name: 'price_xlarge', type: 'decimal' },
        { name: 'includes', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_addon', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
        { name: 'sort_order', type: 'integer' },
      ],
      relationships: [],
    },
    package: {
      defaultFields: [
        { name: 'package_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'services_included', type: 'json' },
        { name: 'price_small', type: 'decimal' },
        { name: 'price_medium', type: 'decimal' },
        { name: 'price_large', type: 'decimal' },
        { name: 'price_xlarge', type: 'decimal' },
        { name: 'savings', type: 'decimal' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_popular', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default doggroomingBlueprint;
