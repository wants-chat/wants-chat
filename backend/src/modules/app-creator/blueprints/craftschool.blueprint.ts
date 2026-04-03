import { Blueprint } from './blueprint.interface';

/**
 * Craft School Blueprint
 */
export const craftschoolBlueprint: Blueprint = {
  appType: 'craftschool',
  description: 'Craft and maker school with students, workshops, instructors, and project gallery',

  coreEntities: ['student', 'workshop', 'instructor', 'enrollment', 'project', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Workshops', path: '/workshops', icon: 'Scissors' },
        { label: 'Instructors', path: '/instructors', icon: 'GraduationCap' },
        { label: 'Enrollments', path: '/enrollments', icon: 'UserPlus' },
        { label: 'Projects', path: '/projects', icon: 'Hammer' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-workshops', component: 'appointment-list', entity: 'workshop', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/workshops', name: 'Workshops', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'workshop-grid', component: 'product-grid', entity: 'workshop', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'staff-grid', entity: 'instructor', position: 'main' },
    ]},
    { path: '/enrollments', name: 'Enrollments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'enrollment-table', component: 'data-table', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-grid', component: 'product-grid', entity: 'project', position: 'main' },
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
    { method: 'GET', path: '/workshops', entity: 'workshop', operation: 'list' },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/enrollments', entity: 'enrollment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/enrollments', entity: 'enrollment', operation: 'create' },
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list' },
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
        { name: 'craft_interests', type: 'json' },
        { name: 'preferred_crafts', type: 'json' },
        { name: 'goals', type: 'text' },
        { name: 'has_own_tools', type: 'boolean' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'enrollment' },
        { type: 'hasMany', target: 'project' },
      ],
    },
    workshop: {
      defaultFields: [
        { name: 'workshop_name', type: 'string', required: true },
        { name: 'craft_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'skill_level', type: 'enum' },
        { name: 'age_group', type: 'enum' },
        { name: 'workshop_date', type: 'date' },
        { name: 'start_time', type: 'datetime' },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'class_size', type: 'integer' },
        { name: 'enrolled_count', type: 'integer' },
        { name: 'project_made', type: 'string' },
        { name: 'materials_included', type: 'boolean' },
        { name: 'materials_list', type: 'json' },
        { name: 'tools_provided', type: 'boolean' },
        { name: 'tools_needed', type: 'json' },
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
        { name: 'craft_expertise', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'credentials', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'teaching_approach', type: 'text' },
        { name: 'portfolio_url', type: 'string' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'workshop' },
      ],
    },
    enrollment: {
      defaultFields: [
        { name: 'enrollment_date', type: 'date', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'tools_needed', type: 'json' },
        { name: 'attendance', type: 'boolean' },
        { name: 'project_completed', type: 'boolean' },
        { name: 'feedback', type: 'text' },
        { name: 'rating', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'workshop' },
      ],
    },
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'craft_type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'materials_used', type: 'json' },
        { name: 'techniques_used', type: 'json' },
        { name: 'completion_date', type: 'date' },
        { name: 'hours_spent', type: 'decimal' },
        { name: 'images', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_public', type: 'boolean' },
        { name: 'likes_count', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'workshop' },
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

export default craftschoolBlueprint;
