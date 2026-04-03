import { Blueprint } from './blueprint.interface';

/**
 * Martial Arts School / Dojo Blueprint
 */
export const martialartsschoolBlueprint: Blueprint = {
  appType: 'martialartsschool',
  description: 'Martial arts school app with classes, students, belt ranks, and tournaments',

  coreEntities: ['class', 'student', 'instructor', 'belt_test', 'tournament', 'membership'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Classes', path: '/classes', icon: 'Calendar' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Instructors', path: '/instructors', icon: 'Award' },
        { label: 'Belt Tests', path: '/belttests', icon: 'Medal' },
        { label: 'Tournaments', path: '/tournaments', icon: 'Trophy' },
        { label: 'Memberships', path: '/memberships', icon: 'CreditCard' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-classes', component: 'appointment-list', entity: 'class', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-calendar', component: 'appointment-calendar', entity: 'class', position: 'main' },
      { id: 'class-table', component: 'data-table', entity: 'class', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'staff-grid', entity: 'instructor', position: 'main' },
    ]},
    { path: '/belttests', name: 'Belt Tests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'belttest-calendar', component: 'appointment-calendar', entity: 'belt_test', position: 'main' },
      { id: 'belttest-table', component: 'data-table', entity: 'belt_test', position: 'main' },
    ]},
    { path: '/tournaments', name: 'Tournaments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tournament-table', component: 'data-table', entity: 'tournament', position: 'main' },
    ]},
    { path: '/memberships', name: 'Memberships', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'membership-table', component: 'data-table', entity: 'membership', position: 'main' },
    ]},
    { path: '/enroll', name: 'Enroll', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'enroll-form', component: 'booking-wizard', entity: 'student', position: 'main' },
    ]},
    { path: '/trial', name: 'Free Trial', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'trial-form', component: 'booking-wizard', entity: 'class', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create' },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/belttests', entity: 'belt_test', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tournaments', entity: 'tournament', operation: 'list' },
    { method: 'GET', path: '/memberships', entity: 'membership', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'martial_art', type: 'enum', required: true },
        { name: 'class_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'skill_level', type: 'enum' },
        { name: 'age_group', type: 'enum' },
        { name: 'belt_requirements', type: 'json' },
        { name: 'capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'room', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'instructor' },
      ],
    },
    student: {
      defaultFields: [
        { name: 'student_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'age_group', type: 'enum' },
        { name: 'parent_info', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'martial_art', type: 'enum' },
        { name: 'current_belt', type: 'string' },
        { name: 'belt_history', type: 'json' },
        { name: 'start_date', type: 'date' },
        { name: 'classes_attended', type: 'integer' },
        { name: 'tournament_wins', type: 'integer' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'medical_info', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasOne', target: 'membership' },
      ],
    },
    instructor: {
      defaultFields: [
        { name: 'instructor_id', type: 'string', required: true },
        { name: 'title', type: 'string' },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'martial_arts', type: 'json' },
        { name: 'current_rank', type: 'string' },
        { name: 'years_training', type: 'integer' },
        { name: 'years_teaching', type: 'integer' },
        { name: 'certifications', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'class' },
      ],
    },
    belt_test: {
      defaultFields: [
        { name: 'test_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'testing_for', type: 'string', required: true },
        { name: 'martial_art', type: 'enum' },
        { name: 'requirements', type: 'json' },
        { name: 'techniques_tested', type: 'json' },
        { name: 'forms_tested', type: 'json' },
        { name: 'sparring_required', type: 'boolean' },
        { name: 'board_breaking', type: 'boolean' },
        { name: 'written_test', type: 'boolean' },
        { name: 'fee', type: 'decimal' },
        { name: 'result', type: 'enum' },
        { name: 'score', type: 'decimal' },
        { name: 'examiner_notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'instructor' },
      ],
    },
    tournament: {
      defaultFields: [
        { name: 'tournament_name', type: 'string', required: true },
        { name: 'tournament_date', type: 'date', required: true },
        { name: 'location', type: 'json' },
        { name: 'martial_arts', type: 'json' },
        { name: 'divisions', type: 'json' },
        { name: 'events', type: 'json' },
        { name: 'registration_deadline', type: 'date' },
        { name: 'registration_fee', type: 'decimal' },
        { name: 'participants', type: 'json' },
        { name: 'results', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    membership: {
      defaultFields: [
        { name: 'membership_number', type: 'string', required: true },
        { name: 'membership_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'monthly_price', type: 'decimal' },
        { name: 'classes_per_week', type: 'integer' },
        { name: 'martial_arts_included', type: 'json' },
        { name: 'includes_sparring_gear', type: 'boolean' },
        { name: 'includes_belt_tests', type: 'boolean' },
        { name: 'family_discount', type: 'decimal' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
      ],
    },
  },
};

export default martialartsschoolBlueprint;
