import { Blueprint } from './blueprint.interface';

/**
 * Senior Wellness Blueprint
 */
export const seniorwellnessBlueprint: Blueprint = {
  appType: 'seniorwellness',
  description: 'Senior wellness center with members, classes, assessments, and social programs',

  coreEntities: ['member', 'class', 'assessment', 'instructor', 'socialprogram', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Classes', path: '/classes', icon: 'Calendar' },
        { label: 'Assessments', path: '/assessments', icon: 'ClipboardList' },
        { label: 'Instructors', path: '/instructors', icon: 'UserCheck' },
        { label: 'Social Programs', path: '/socialprograms', icon: 'Heart' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'todays-classes', component: 'appointment-list', entity: 'class', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'member', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-calendar', component: 'appointment-calendar', entity: 'class', position: 'main' },
    ]},
    { path: '/assessments', name: 'Assessments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'assessment-table', component: 'data-table', entity: 'assessment', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'staff-grid', entity: 'instructor', position: 'main' },
    ]},
    { path: '/socialprograms', name: 'Social Programs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'socialprogram-grid', component: 'product-grid', entity: 'socialprogram', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/join', name: 'Join', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'membership-form', component: 'booking-wizard', entity: 'member', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'member', operation: 'create' },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'GET', path: '/assessments', entity: 'assessment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/assessments', entity: 'assessment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/socialprograms', entity: 'socialprogram', operation: 'list' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'address', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'medical_conditions', type: 'json' },
        { name: 'mobility_level', type: 'enum' },
        { name: 'interests', type: 'json' },
        { name: 'membership_type', type: 'enum' },
        { name: 'join_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'assessment' },
      ],
    },
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'scheduled_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'location', type: 'string' },
        { name: 'intensity_level', type: 'enum' },
        { name: 'max_participants', type: 'integer' },
        { name: 'registered_count', type: 'integer' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'instructor' },
      ],
    },
    assessment: {
      defaultFields: [
        { name: 'assessment_date', type: 'date', required: true },
        { name: 'assessment_type', type: 'enum', required: true },
        { name: 'blood_pressure', type: 'json' },
        { name: 'heart_rate', type: 'integer' },
        { name: 'weight', type: 'decimal' },
        { name: 'balance_score', type: 'integer' },
        { name: 'flexibility_score', type: 'integer' },
        { name: 'strength_score', type: 'integer' },
        { name: 'cognitive_score', type: 'integer' },
        { name: 'recommendations', type: 'json' },
        { name: 'goals', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'next_assessment_date', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
        { type: 'belongsTo', target: 'instructor' },
      ],
    },
    instructor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'certifications', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'schedule', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'class' },
        { type: 'hasMany', target: 'assessment' },
      ],
    },
    socialprogram: {
      defaultFields: [
        { name: 'program_name', type: 'string', required: true },
        { name: 'program_type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'scheduled_date', type: 'date' },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'location', type: 'string' },
        { name: 'cost', type: 'decimal' },
        { name: 'max_participants', type: 'integer' },
        { name: 'registration_deadline', type: 'date' },
        { name: 'image_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'billing_period', type: 'json' },
        { name: 'line_items', type: 'json' },
        { name: 'membership_fee', type: 'decimal' },
        { name: 'program_fees', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
      ],
    },
  },
};

export default seniorwellnessBlueprint;
