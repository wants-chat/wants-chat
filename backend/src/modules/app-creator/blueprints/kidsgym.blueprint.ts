import { Blueprint } from './blueprint.interface';

/**
 * Kids Gym Blueprint
 */
export const kidsgymBlueprint: Blueprint = {
  appType: 'kidsgym',
  description: 'Kids fitness/gymnastics app with classes, memberships, camps, and evaluations',

  coreEntities: ['class', 'enrollment', 'member', 'camp', 'coach', 'evaluation'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Classes', path: '/classes', icon: 'Calendar' },
        { label: 'Enrollments', path: '/enrollments', icon: 'ClipboardList' },
        { label: 'Members', path: '/members', icon: 'Users' },
        { label: 'Camps', path: '/camps', icon: 'Flag' },
        { label: 'Coaches', path: '/coaches', icon: 'UserCheck' },
        { label: 'Evaluations', path: '/evaluations', icon: 'Star' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-classes', component: 'appointment-list', entity: 'class', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-calendar', component: 'appointment-calendar', entity: 'class', position: 'main' },
    ]},
    { path: '/enrollments', name: 'Enrollments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'enrollment-table', component: 'data-table', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/members', name: 'Members', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'member-table', component: 'data-table', entity: 'member', position: 'main' },
    ]},
    { path: '/camps', name: 'Camps', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'camp-grid', component: 'product-grid', entity: 'camp', position: 'main' },
    ]},
    { path: '/coaches', name: 'Coaches', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'coach-grid', component: 'staff-grid', entity: 'coach', position: 'main' },
    ]},
    { path: '/evaluations', name: 'Evaluations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'evaluation-table', component: 'data-table', entity: 'evaluation', position: 'main' },
    ]},
    { path: '/programs', name: 'Programs', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'class-grid', component: 'product-grid', entity: 'class', position: 'main' },
    ]},
    { path: '/enroll', name: 'Enroll', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'enrollment-form', component: 'booking-wizard', entity: 'enrollment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'POST', path: '/classes', entity: 'class', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/enrollments', entity: 'enrollment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/enrollments', entity: 'enrollment', operation: 'create' },
    { method: 'GET', path: '/members', entity: 'member', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/members', entity: 'member', operation: 'create' },
    { method: 'GET', path: '/camps', entity: 'camp', operation: 'list' },
    { method: 'GET', path: '/coaches', entity: 'coach', operation: 'list' },
    { method: 'GET', path: '/evaluations', entity: 'evaluation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/evaluations', entity: 'evaluation', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'level', type: 'enum' },
        { name: 'age_min', type: 'integer' },
        { name: 'age_max', type: 'integer' },
        { name: 'day_of_week', type: 'enum' },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'description', type: 'text' },
        { name: 'skills_taught', type: 'json' },
        { name: 'max_students', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'monthly_fee', type: 'decimal', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'coach' },
        { type: 'hasMany', target: 'enrollment' },
      ],
    },
    enrollment: {
      defaultFields: [
        { name: 'enrollment_number', type: 'string', required: true },
        { name: 'enrollment_date', type: 'date', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'trial_class', type: 'boolean' },
        { name: 'classes_selected', type: 'json' },
        { name: 'monthly_fee', type: 'decimal', required: true },
        { name: 'registration_fee', type: 'decimal' },
        { name: 'sibling_discount', type: 'boolean' },
        { name: 'uniform_ordered', type: 'boolean' },
        { name: 'uniform_size', type: 'string' },
        { name: 'payment_method', type: 'enum' },
        { name: 'auto_pay', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
        { type: 'belongsTo', target: 'class' },
      ],
    },
    member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'current_level', type: 'enum' },
        { name: 'allergies', type: 'json' },
        { name: 'medical_conditions', type: 'text' },
        { name: 'parent1', type: 'json', required: true },
        { name: 'parent2', type: 'json' },
        { name: 'emergency_contact', type: 'json', required: true },
        { name: 'authorized_pickups', type: 'json' },
        { name: 'photo_release', type: 'boolean' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'enrollment' },
        { type: 'hasMany', target: 'evaluation' },
      ],
    },
    camp: {
      defaultFields: [
        { name: 'camp_name', type: 'string', required: true },
        { name: 'camp_type', type: 'enum', required: true },
        { name: 'age_min', type: 'integer' },
        { name: 'age_max', type: 'integer' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'daily_schedule', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'max_campers', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'early_bird_price', type: 'decimal' },
        { name: 'extended_care', type: 'boolean' },
        { name: 'extended_care_fee', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    coach: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'specialties', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'safety_certified', type: 'boolean' },
        { name: 'first_aid_certified', type: 'boolean' },
        { name: 'background_check', type: 'boolean' },
        { name: 'years_experience', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'class' },
      ],
    },
    evaluation: {
      defaultFields: [
        { name: 'evaluation_date', type: 'date', required: true },
        { name: 'evaluation_type', type: 'enum', required: true },
        { name: 'current_level', type: 'enum' },
        { name: 'skills_assessed', type: 'json' },
        { name: 'strength_scores', type: 'json' },
        { name: 'flexibility_scores', type: 'json' },
        { name: 'technique_scores', type: 'json' },
        { name: 'overall_score', type: 'decimal' },
        { name: 'ready_for_advancement', type: 'boolean' },
        { name: 'recommended_level', type: 'enum' },
        { name: 'areas_for_improvement', type: 'json' },
        { name: 'coach_comments', type: 'text' },
        { name: 'parent_notified', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'member' },
        { type: 'belongsTo', target: 'coach' },
      ],
    },
  },
};

export default kidsgymBlueprint;
