import { Blueprint } from './blueprint.interface';

/**
 * Exam Preparation Blueprint
 */
export const examprepBlueprint: Blueprint = {
  appType: 'examprep',
  description: 'Exam preparation service with students, courses, practice tests, and progress tracking',

  coreEntities: ['student', 'course', 'session', 'practicetest', 'studyplan', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Courses', path: '/courses', icon: 'BookOpen' },
        { label: 'Sessions', path: '/sessions', icon: 'Calendar' },
        { label: 'Practice Tests', path: '/practicetests', icon: 'ClipboardCheck' },
        { label: 'Study Plans', path: '/studyplans', icon: 'Target' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-sessions', component: 'appointment-list', entity: 'session', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/courses', name: 'Courses', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'course-grid', component: 'product-grid', entity: 'course', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-calendar', component: 'appointment-calendar', entity: 'session', position: 'main' },
    ]},
    { path: '/practicetests', name: 'Practice Tests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'practicetest-table', component: 'data-table', entity: 'practicetest', position: 'main' },
    ]},
    { path: '/studyplans', name: 'Study Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'studyplan-table', component: 'data-table', entity: 'studyplan', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/enroll', name: 'Enroll', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'enrollment-form', component: 'booking-wizard', entity: 'session', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/courses', entity: 'course', operation: 'list' },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create' },
    { method: 'GET', path: '/practicetests', entity: 'practicetest', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/studyplans', entity: 'studyplan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    student: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'parent_name', type: 'string' },
        { name: 'parent_email', type: 'email' },
        { name: 'parent_phone', type: 'phone' },
        { name: 'target_exam', type: 'enum', required: true },
        { name: 'exam_date', type: 'date' },
        { name: 'target_score', type: 'integer' },
        { name: 'baseline_score', type: 'integer' },
        { name: 'current_score', type: 'integer' },
        { name: 'strengths', type: 'json' },
        { name: 'weaknesses', type: 'json' },
        { name: 'learning_style', type: 'enum' },
        { name: 'availability', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'session' },
        { type: 'hasMany', target: 'practicetest' },
        { type: 'hasOne', target: 'studyplan' },
      ],
    },
    course: {
      defaultFields: [
        { name: 'course_name', type: 'string', required: true },
        { name: 'exam_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'format', type: 'enum' },
        { name: 'duration_weeks', type: 'integer' },
        { name: 'sessions_count', type: 'integer' },
        { name: 'hours_per_session', type: 'decimal' },
        { name: 'topics_covered', type: 'json' },
        { name: 'materials_included', type: 'json' },
        { name: 'practice_tests_included', type: 'integer' },
        { name: 'max_students', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'session' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'format', type: 'enum' },
        { name: 'topics_covered', type: 'json' },
        { name: 'homework_assigned', type: 'json' },
        { name: 'homework_completed', type: 'boolean' },
        { name: 'progress_notes', type: 'text' },
        { name: 'areas_to_improve', type: 'json' },
        { name: 'next_session_focus', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'course' },
      ],
    },
    practicetest: {
      defaultFields: [
        { name: 'test_name', type: 'string', required: true },
        { name: 'test_date', type: 'date', required: true },
        { name: 'test_type', type: 'enum' },
        { name: 'is_full_length', type: 'boolean' },
        { name: 'time_allowed_minutes', type: 'integer' },
        { name: 'time_used_minutes', type: 'integer' },
        { name: 'total_questions', type: 'integer' },
        { name: 'correct_answers', type: 'integer' },
        { name: 'score', type: 'integer' },
        { name: 'percentile', type: 'integer' },
        { name: 'section_scores', type: 'json' },
        { name: 'missed_topics', type: 'json' },
        { name: 'analysis', type: 'text' },
        { name: 'recommendations', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
      ],
    },
    studyplan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'target_date', type: 'date' },
        { name: 'target_score', type: 'integer' },
        { name: 'weekly_hours', type: 'integer' },
        { name: 'topics_schedule', type: 'json' },
        { name: 'milestones', type: 'json' },
        { name: 'current_progress', type: 'decimal' },
        { name: 'completed_topics', type: 'json' },
        { name: 'resources', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
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

export default examprepBlueprint;
