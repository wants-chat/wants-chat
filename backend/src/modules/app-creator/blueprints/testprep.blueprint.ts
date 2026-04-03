import { Blueprint } from './blueprint.interface';

/**
 * Test Preparation Center Blueprint
 */
export const testprepBlueprint: Blueprint = {
  appType: 'testprep',
  description: 'Test prep center app with courses, students, practice tests, and tutoring',

  coreEntities: ['course', 'student', 'practice_test', 'tutor', 'session', 'score'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Courses', path: '/courses', icon: 'BookOpen' },
        { label: 'Students', path: '/students', icon: 'GraduationCap' },
        { label: 'Practice Tests', path: '/tests', icon: 'FileText' },
        { label: 'Tutors', path: '/tutors', icon: 'UserCheck' },
        { label: 'Sessions', path: '/sessions', icon: 'Calendar' },
        { label: 'Score Reports', path: '/scores', icon: 'TrendingUp' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-sessions', component: 'appointment-list', entity: 'session', position: 'main' },
    ]},
    { path: '/courses', name: 'Courses', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'course-grid', component: 'product-grid', entity: 'course', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/tests', name: 'Practice Tests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'test-table', component: 'data-table', entity: 'practice_test', position: 'main' },
    ]},
    { path: '/tutors', name: 'Tutors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tutor-grid', component: 'staff-grid', entity: 'tutor', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-calendar', component: 'appointment-calendar', entity: 'session', position: 'main' },
      { id: 'session-table', component: 'data-table', entity: 'session', position: 'main' },
    ]},
    { path: '/scores', name: 'Score Reports', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'score-chart', component: 'chart-widget', entity: 'score', position: 'main' },
      { id: 'score-table', component: 'data-table', entity: 'score', position: 'main' },
    ]},
    { path: '/enroll', name: 'Enroll', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'course-display', component: 'product-grid', entity: 'course', position: 'main' },
      { id: 'enroll-form', component: 'booking-wizard', entity: 'student', position: 'main' },
    ]},
    { path: '/book-session', name: 'Book Session', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'session', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/courses', entity: 'course', operation: 'list' },
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create' },
    { method: 'GET', path: '/tests', entity: 'practice_test', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tutors', entity: 'tutor', operation: 'list' },
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create' },
    { method: 'GET', path: '/scores', entity: 'score', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    course: {
      defaultFields: [
        { name: 'course_name', type: 'string', required: true },
        { name: 'test_type', type: 'enum', required: true },
        { name: 'format', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'duration_weeks', type: 'integer' },
        { name: 'sessions_included', type: 'integer' },
        { name: 'schedule', type: 'json' },
        { name: 'curriculum', type: 'json' },
        { name: 'materials_included', type: 'json' },
        { name: 'practice_tests_included', type: 'integer' },
        { name: 'guarantee', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'start_date', type: 'date' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'student' },
      ],
    },
    student: {
      defaultFields: [
        { name: 'student_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'parent_info', type: 'json' },
        { name: 'target_test', type: 'enum', required: true },
        { name: 'target_score', type: 'integer' },
        { name: 'test_date', type: 'date' },
        { name: 'baseline_score', type: 'integer' },
        { name: 'current_score', type: 'integer' },
        { name: 'school', type: 'string' },
        { name: 'grade', type: 'enum' },
        { name: 'enrollment_date', type: 'date' },
        { name: 'sessions_used', type: 'integer' },
        { name: 'sessions_remaining', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
        { type: 'hasMany', target: 'session' },
        { type: 'hasMany', target: 'score' },
      ],
    },
    practice_test: {
      defaultFields: [
        { name: 'test_name', type: 'string', required: true },
        { name: 'test_type', type: 'enum', required: true },
        { name: 'version', type: 'string' },
        { name: 'section', type: 'enum' },
        { name: 'num_questions', type: 'integer' },
        { name: 'time_limit', type: 'integer' },
        { name: 'difficulty', type: 'enum' },
        { name: 'official', type: 'boolean' },
        { name: 'year', type: 'integer' },
        { name: 'materials_url', type: 'string' },
        { name: 'answer_key', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'score' },
      ],
    },
    tutor: {
      defaultFields: [
        { name: 'tutor_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'tests_specialized', type: 'json', required: true },
        { name: 'subjects', type: 'json' },
        { name: 'own_scores', type: 'json' },
        { name: 'education', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'schedule', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'session' },
      ],
    },
    session: {
      defaultFields: [
        { name: 'session_number', type: 'string', required: true },
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'session_type', type: 'enum', required: true },
        { name: 'format', type: 'enum' },
        { name: 'focus_area', type: 'json' },
        { name: 'topics_covered', type: 'json' },
        { name: 'homework_assigned', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'rating', type: 'decimal' },
        { name: 'feedback', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'tutor' },
      ],
    },
    score: {
      defaultFields: [
        { name: 'score_date', type: 'date', required: true },
        { name: 'test_type', type: 'enum', required: true },
        { name: 'is_official', type: 'boolean' },
        { name: 'total_score', type: 'integer', required: true },
        { name: 'section_scores', type: 'json' },
        { name: 'percentile', type: 'integer' },
        { name: 'time_taken', type: 'integer' },
        { name: 'questions_correct', type: 'integer' },
        { name: 'questions_wrong', type: 'integer' },
        { name: 'questions_skipped', type: 'integer' },
        { name: 'weak_areas', type: 'json' },
        { name: 'strong_areas', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'practice_test' },
      ],
    },
  },
};

export default testprepBlueprint;
