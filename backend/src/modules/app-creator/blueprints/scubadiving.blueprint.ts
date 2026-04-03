import { Blueprint } from './blueprint.interface';

/**
 * Scuba Diving Blueprint
 */
export const scubadivingBlueprint: Blueprint = {
  appType: 'scubadiving',
  description: 'Scuba diving center with courses, dive trips, certifications, and equipment rental',

  coreEntities: ['student', 'course', 'divetrip', 'certification', 'equipment', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Courses', path: '/courses', icon: 'GraduationCap' },
        { label: 'Dive Trips', path: '/divetrips', icon: 'Waves' },
        { label: 'Certifications', path: '/certifications', icon: 'Award' },
        { label: 'Equipment', path: '/equipment', icon: 'Package' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-trips', component: 'appointment-list', entity: 'divetrip', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/courses', name: 'Courses', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'course-grid', component: 'product-grid', entity: 'course', position: 'main' },
    ]},
    { path: '/divetrips', name: 'Dive Trips', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'divetrip-calendar', component: 'appointment-calendar', entity: 'divetrip', position: 'main' },
    ]},
    { path: '/certifications', name: 'Certifications', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'certification-table', component: 'data-table', entity: 'certification', position: 'main' },
    ]},
    { path: '/equipment', name: 'Equipment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'equipment-grid', component: 'product-grid', entity: 'equipment', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'divetrip', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/courses', entity: 'course', operation: 'list' },
    { method: 'GET', path: '/divetrips', entity: 'divetrip', operation: 'list' },
    { method: 'POST', path: '/divetrips', entity: 'divetrip', operation: 'create' },
    { method: 'GET', path: '/certifications', entity: 'certification', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/equipment', entity: 'equipment', operation: 'list' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    student: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'address', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'medical_info', type: 'json' },
        { name: 'swim_ability', type: 'enum' },
        { name: 'dive_experience', type: 'enum' },
        { name: 'current_certifications', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'certification' },
      ],
    },
    course: {
      defaultFields: [
        { name: 'course_name', type: 'string', required: true },
        { name: 'certification_agency', type: 'enum', required: true },
        { name: 'level', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'prerequisites', type: 'json' },
        { name: 'duration_days', type: 'integer' },
        { name: 'pool_sessions', type: 'integer' },
        { name: 'open_water_dives', type: 'integer' },
        { name: 'max_depth_meters', type: 'integer' },
        { name: 'includes_equipment', type: 'boolean' },
        { name: 'includes_materials', type: 'boolean' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'schedule', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'certification' },
      ],
    },
    divetrip: {
      defaultFields: [
        { name: 'trip_name', type: 'string', required: true },
        { name: 'trip_date', type: 'date', required: true },
        { name: 'departure_time', type: 'datetime' },
        { name: 'return_time', type: 'datetime' },
        { name: 'dive_site', type: 'string' },
        { name: 'number_of_dives', type: 'integer' },
        { name: 'max_depth_meters', type: 'integer' },
        { name: 'minimum_certification', type: 'enum' },
        { name: 'max_participants', type: 'integer' },
        { name: 'registered_count', type: 'integer' },
        { name: 'includes_equipment', type: 'boolean' },
        { name: 'includes_lunch', type: 'boolean' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    certification: {
      defaultFields: [
        { name: 'certification_number', type: 'string', required: true },
        { name: 'agency', type: 'enum', required: true },
        { name: 'level', type: 'string', required: true },
        { name: 'issue_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'instructor_name', type: 'string' },
        { name: 'dive_shop', type: 'string' },
        { name: 'card_url', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'course' },
      ],
    },
    equipment: {
      defaultFields: [
        { name: 'equipment_name', type: 'string', required: true },
        { name: 'equipment_type', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'size', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'rental_rate', type: 'decimal' },
        { name: 'sale_price', type: 'decimal' },
        { name: 'quantity_available', type: 'integer' },
        { name: 'condition', type: 'enum' },
        { name: 'last_serviced', type: 'date' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
      ],
    },
  },
};

export default scubadivingBlueprint;
