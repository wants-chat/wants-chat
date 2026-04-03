import { Blueprint } from './blueprint.interface';

/**
 * Sailing School Blueprint
 */
export const sailingschoolBlueprint: Blueprint = {
  appType: 'sailingschool',
  description: 'Sailing school with students, courses, boats, and certification programs',

  coreEntities: ['student', 'course', 'boat', 'instructor', 'enrollment', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Courses', path: '/courses', icon: 'GraduationCap' },
        { label: 'Boats', path: '/boats', icon: 'Sailboat' },
        { label: 'Instructors', path: '/instructors', icon: 'UserCheck' },
        { label: 'Enrollments', path: '/enrollments', icon: 'Calendar' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-courses', component: 'appointment-list', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/courses', name: 'Courses', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'course-grid', component: 'product-grid', entity: 'course', position: 'main' },
    ]},
    { path: '/boats', name: 'Boats', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'boat-grid', component: 'product-grid', entity: 'boat', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'staff-grid', entity: 'instructor', position: 'main' },
    ]},
    { path: '/enrollments', name: 'Enrollments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'enrollment-table', component: 'data-table', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/enroll', name: 'Enroll', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'enrollment-form', component: 'booking-wizard', entity: 'enrollment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/courses', entity: 'course', operation: 'list' },
    { method: 'GET', path: '/boats', entity: 'boat', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/enrollments', entity: 'enrollment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/enrollments', entity: 'enrollment', operation: 'create' },
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
        { name: 'sailing_experience', type: 'enum' },
        { name: 'swim_ability', type: 'enum' },
        { name: 'current_certifications', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'medical_conditions', type: 'text' },
        { name: 'goals', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'enrollment' },
      ],
    },
    course: {
      defaultFields: [
        { name: 'course_name', type: 'string', required: true },
        { name: 'certification_level', type: 'enum', required: true },
        { name: 'certifying_body', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'prerequisites', type: 'json' },
        { name: 'duration_days', type: 'integer' },
        { name: 'hours_on_water', type: 'integer' },
        { name: 'classroom_hours', type: 'integer' },
        { name: 'topics_covered', type: 'json' },
        { name: 'boat_type_used', type: 'string' },
        { name: 'max_students', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'includes_materials', type: 'boolean' },
        { name: 'schedule', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'enrollment' },
      ],
    },
    boat: {
      defaultFields: [
        { name: 'boat_name', type: 'string', required: true },
        { name: 'boat_type', type: 'enum', required: true },
        { name: 'manufacturer', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'year', type: 'integer' },
        { name: 'length_feet', type: 'decimal' },
        { name: 'crew_capacity', type: 'integer' },
        { name: 'sail_area', type: 'decimal' },
        { name: 'features', type: 'json' },
        { name: 'safety_equipment', type: 'json' },
        { name: 'maintenance_status', type: 'enum' },
        { name: 'last_inspection', type: 'date' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    instructor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'certifications', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'specialties', type: 'json' },
        { name: 'languages', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'availability', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'enrollment' },
      ],
    },
    enrollment: {
      defaultFields: [
        { name: 'enrollment_date', type: 'date', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'payment_status', type: 'enum' },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'attendance_record', type: 'json' },
        { name: 'progress_notes', type: 'text' },
        { name: 'skills_achieved', type: 'json' },
        { name: 'certification_earned', type: 'boolean' },
        { name: 'certification_number', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'course' },
        { type: 'belongsTo', target: 'instructor' },
      ],
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
        { type: 'belongsTo', target: 'enrollment' },
      ],
    },
  },
};

export default sailingschoolBlueprint;
