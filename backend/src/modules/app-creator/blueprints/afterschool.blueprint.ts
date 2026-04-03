import { Blueprint } from './blueprint.interface';

/**
 * After School Program Blueprint
 */
export const afterschoolBlueprint: Blueprint = {
  appType: 'afterschool',
  description: 'After school program app with enrollments, activities, attendance, and billing',

  coreEntities: ['enrollment', 'student', 'activity', 'attendance', 'staff', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Enrollments', path: '/enrollments', icon: 'ClipboardList' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Activities', path: '/activities', icon: 'Star' },
        { label: 'Attendance', path: '/attendance', icon: 'CheckSquare' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-attendance', component: 'data-table', entity: 'attendance', position: 'main' },
    ]},
    { path: '/enrollments', name: 'Enrollments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'enrollment-table', component: 'data-table', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/activities', name: 'Activities', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'activity-calendar', component: 'appointment-calendar', entity: 'activity', position: 'main' },
    ]},
    { path: '/attendance', name: 'Attendance', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'attendance-table', component: 'data-table', entity: 'attendance', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'staff', position: 'main' },
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
    { method: 'GET', path: '/enrollments', entity: 'enrollment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/enrollments', entity: 'enrollment', operation: 'create' },
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/activities', entity: 'activity', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/attendance', entity: 'attendance', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/attendance', entity: 'attendance', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    enrollment: {
      defaultFields: [
        { name: 'enrollment_number', type: 'string', required: true },
        { name: 'enrollment_date', type: 'date', required: true },
        { name: 'program_type', type: 'enum', required: true },
        { name: 'days_enrolled', type: 'json', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'pickup_time', type: 'string' },
        { name: 'activities_selected', type: 'json' },
        { name: 'monthly_fee', type: 'decimal', required: true },
        { name: 'registration_fee', type: 'decimal' },
        { name: 'sibling_discount', type: 'boolean' },
        { name: 'financial_aid', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
      ],
    },
    student: {
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
        { name: 'parent1', type: 'json', required: true },
        { name: 'parent2', type: 'json' },
        { name: 'emergency_contact', type: 'json', required: true },
        { name: 'authorized_pickups', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'enrollment' },
        { type: 'hasMany', target: 'attendance' },
      ],
    },
    activity: {
      defaultFields: [
        { name: 'activity_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'day_of_week', type: 'enum' },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'max_participants', type: 'integer' },
        { name: 'additional_fee', type: 'decimal' },
        { name: 'supplies_needed', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'staff' },
      ],
    },
    attendance: {
      defaultFields: [
        { name: 'attendance_date', type: 'date', required: true },
        { name: 'check_in_time', type: 'datetime' },
        { name: 'check_out_time', type: 'datetime' },
        { name: 'checked_in_by', type: 'string' },
        { name: 'checked_out_by', type: 'string' },
        { name: 'pickup_person', type: 'string' },
        { name: 'absent', type: 'boolean' },
        { name: 'absence_reason', type: 'string' },
        { name: 'activities_attended', type: 'json' },
        { name: 'snack_provided', type: 'boolean' },
        { name: 'homework_completed', type: 'boolean' },
        { name: 'behavior_notes', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
      ],
    },
    staff: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'hire_date', type: 'date' },
        { name: 'certifications', type: 'json' },
        { name: 'background_check', type: 'boolean' },
        { name: 'first_aid_certified', type: 'boolean' },
        { name: 'cpr_certified', type: 'boolean' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'activity' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'billing_period', type: 'string' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'payment_date', type: 'date' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'enrollment' },
      ],
    },
  },
};

export default afterschoolBlueprint;
