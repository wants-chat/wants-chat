import { Blueprint } from './blueprint.interface';

/**
 * Art School Blueprint
 */
export const artschoolBlueprint: Blueprint = {
  appType: 'artschool',
  description: 'Art school with students, classes, instructors, and portfolio management',

  coreEntities: ['student', 'class', 'instructor', 'enrollment', 'portfolio', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Classes', path: '/classes', icon: 'Palette' },
        { label: 'Instructors', path: '/instructors', icon: 'GraduationCap' },
        { label: 'Enrollments', path: '/enrollments', icon: 'UserPlus' },
        { label: 'Portfolios', path: '/portfolios', icon: 'Image' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-classes', component: 'appointment-list', entity: 'class', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-grid', component: 'product-grid', entity: 'class', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'staff-grid', entity: 'instructor', position: 'main' },
    ]},
    { path: '/enrollments', name: 'Enrollments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'enrollment-table', component: 'data-table', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/portfolios', name: 'Portfolios', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'portfolio-grid', component: 'product-grid', entity: 'portfolio', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/register', name: 'Register', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'registration-form', component: 'booking-wizard', entity: 'enrollment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/enrollments', entity: 'enrollment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/enrollments', entity: 'enrollment', operation: 'create' },
    { method: 'GET', path: '/portfolios', entity: 'portfolio', operation: 'list', requiresAuth: true },
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
        { name: 'skill_level', type: 'enum' },
        { name: 'art_interests', type: 'json' },
        { name: 'preferred_media', type: 'json' },
        { name: 'goals', type: 'text' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'enrollment' },
        { type: 'hasMany', target: 'portfolio' },
      ],
    },
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'art_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'skill_level', type: 'enum' },
        { name: 'age_group', type: 'enum' },
        { name: 'schedule', type: 'json' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'duration_weeks', type: 'integer' },
        { name: 'class_size', type: 'integer' },
        { name: 'enrolled_count', type: 'integer' },
        { name: 'materials_included', type: 'boolean' },
        { name: 'materials_list', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'instructor' },
        { type: 'hasMany', target: 'enrollment' },
      ],
    },
    instructor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'specializations', type: 'json' },
        { name: 'education', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'teaching_philosophy', type: 'text' },
        { name: 'portfolio_url', type: 'string' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'class' },
      ],
    },
    enrollment: {
      defaultFields: [
        { name: 'enrollment_date', type: 'date', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'attendance_record', type: 'json' },
        { name: 'progress_notes', type: 'text' },
        { name: 'materials_received', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'class' },
      ],
    },
    portfolio: {
      defaultFields: [
        { name: 'portfolio_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'art_pieces', type: 'json' },
        { name: 'cover_image', type: 'image' },
        { name: 'created_date', type: 'date' },
        { name: 'is_public', type: 'boolean' },
        { name: 'view_count', type: 'integer' },
        { name: 'likes_count', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
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

export default artschoolBlueprint;
