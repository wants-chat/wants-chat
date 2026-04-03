import { Blueprint } from './blueprint.interface';

/**
 * Surf School Blueprint
 */
export const surfschoolBlueprint: Blueprint = {
  appType: 'surfschool',
  description: 'Surf school with students, lessons, instructors, and equipment rental',

  coreEntities: ['student', 'lesson', 'instructor', 'booking', 'equipment', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Lessons', path: '/lessons', icon: 'Waves' },
        { label: 'Instructors', path: '/instructors', icon: 'UserCheck' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Equipment', path: '/equipment', icon: 'Package' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'todays-lessons', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-grid', component: 'product-grid', entity: 'lesson', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'staff-grid', entity: 'instructor', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
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
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list' },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
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
        { name: 'skill_level', type: 'enum' },
        { name: 'swim_ability', type: 'enum' },
        { name: 'height', type: 'string' },
        { name: 'weight', type: 'string' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'medical_conditions', type: 'text' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    lesson: {
      defaultFields: [
        { name: 'lesson_name', type: 'string', required: true },
        { name: 'lesson_type', type: 'enum', required: true },
        { name: 'skill_level', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'max_students', type: 'integer' },
        { name: 'includes_equipment', type: 'boolean' },
        { name: 'includes_wetsuit', type: 'boolean' },
        { name: 'age_minimum', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'group_price', type: 'decimal' },
        { name: 'image_url', type: 'image' },
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
        { name: 'certifications', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'languages', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'availability', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'participant_count', type: 'integer' },
        { name: 'participants', type: 'json' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'beach_location', type: 'string' },
        { name: 'lesson_fee', type: 'decimal' },
        { name: 'equipment_fee', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'special_requests', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'lesson' },
        { type: 'belongsTo', target: 'instructor' },
      ],
    },
    equipment: {
      defaultFields: [
        { name: 'equipment_name', type: 'string', required: true },
        { name: 'equipment_type', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'size', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'rental_rate', type: 'decimal' },
        { name: 'sale_price', type: 'decimal' },
        { name: 'quantity_available', type: 'integer' },
        { name: 'condition', type: 'enum' },
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
        { type: 'belongsTo', target: 'booking' },
      ],
    },
  },
};

export default surfschoolBlueprint;
