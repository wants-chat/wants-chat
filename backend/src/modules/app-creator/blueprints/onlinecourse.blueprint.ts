import { Blueprint } from './blueprint.interface';

/**
 * Online Course Platform Blueprint
 */
export const onlinecourseBlueprint: Blueprint = {
  appType: 'onlinecourse',
  description: 'Online course platform with courses, students, lessons, and progress tracking',

  coreEntities: ['course', 'student', 'lesson', 'enrollment', 'quiz', 'certificate'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Courses', path: '/courses', icon: 'BookOpen' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Lessons', path: '/lessons', icon: 'FileText' },
        { label: 'Enrollments', path: '/enrollments', icon: 'UserPlus' },
        { label: 'Quizzes', path: '/quizzes', icon: 'ClipboardCheck' },
        { label: 'Certificates', path: '/certificates', icon: 'Award' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-enrollments', component: 'data-table', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/courses', name: 'Courses', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'course-grid', component: 'product-grid', entity: 'course', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-table', component: 'data-table', entity: 'lesson', position: 'main' },
    ]},
    { path: '/enrollments', name: 'Enrollments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'enrollment-table', component: 'data-table', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/quizzes', name: 'Quizzes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quiz-table', component: 'data-table', entity: 'quiz', position: 'main' },
    ]},
    { path: '/certificates', name: 'Certificates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'certificate-table', component: 'data-table', entity: 'certificate', position: 'main' },
    ]},
    { path: '/catalog', name: 'Catalog', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'course-catalog', component: 'product-grid', entity: 'course', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/courses', entity: 'course', operation: 'list' },
    { method: 'POST', path: '/courses', entity: 'course', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/enrollments', entity: 'enrollment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/enrollments', entity: 'enrollment', operation: 'create' },
    { method: 'GET', path: '/quizzes', entity: 'quiz', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/certificates', entity: 'certificate', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    course: {
      defaultFields: [
        { name: 'course_title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'enum' },
        { name: 'level', type: 'enum' },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'lesson_count', type: 'integer' },
        { name: 'instructor', type: 'string' },
        { name: 'instructor_bio', type: 'text' },
        { name: 'prerequisites', type: 'json' },
        { name: 'learning_outcomes', type: 'json' },
        { name: 'price', type: 'decimal' },
        { name: 'sale_price', type: 'decimal' },
        { name: 'thumbnail_url', type: 'image' },
        { name: 'preview_video_url', type: 'string' },
        { name: 'is_published', type: 'boolean' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'lesson' },
        { type: 'hasMany', target: 'enrollment' },
        { type: 'hasMany', target: 'quiz' },
      ],
    },
    student: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'avatar_url', type: 'image' },
        { name: 'bio', type: 'text' },
        { name: 'learning_goals', type: 'json' },
        { name: 'preferred_subjects', type: 'json' },
        { name: 'signup_date', type: 'date' },
        { name: 'last_active', type: 'datetime' },
        { name: 'total_courses', type: 'integer' },
        { name: 'completed_courses', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'enrollment' },
        { type: 'hasMany', target: 'certificate' },
      ],
    },
    lesson: {
      defaultFields: [
        { name: 'lesson_title', type: 'string', required: true },
        { name: 'lesson_number', type: 'integer', required: true },
        { name: 'description', type: 'text' },
        { name: 'content_type', type: 'enum' },
        { name: 'video_url', type: 'string' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'content', type: 'text' },
        { name: 'resources', type: 'json' },
        { name: 'is_free_preview', type: 'boolean' },
        { name: 'is_published', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
      ],
    },
    enrollment: {
      defaultFields: [
        { name: 'enrollment_date', type: 'date', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'progress_percent', type: 'decimal' },
        { name: 'lessons_completed', type: 'json' },
        { name: 'current_lesson', type: 'integer' },
        { name: 'last_accessed', type: 'datetime' },
        { name: 'completion_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
        { type: 'belongsTo', target: 'student' },
      ],
    },
    quiz: {
      defaultFields: [
        { name: 'quiz_title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'questions', type: 'json' },
        { name: 'time_limit_minutes', type: 'integer' },
        { name: 'passing_score', type: 'integer' },
        { name: 'max_attempts', type: 'integer' },
        { name: 'randomize_questions', type: 'boolean' },
        { name: 'show_answers', type: 'boolean' },
        { name: 'is_published', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
        { type: 'belongsTo', target: 'lesson' },
      ],
    },
    certificate: {
      defaultFields: [
        { name: 'certificate_number', type: 'string', required: true },
        { name: 'issue_date', type: 'date', required: true },
        { name: 'course_completed', type: 'string' },
        { name: 'final_score', type: 'decimal' },
        { name: 'hours_completed', type: 'decimal' },
        { name: 'skills_acquired', type: 'json' },
        { name: 'certificate_url', type: 'string' },
        { name: 'verification_code', type: 'string' },
        { name: 'expiry_date', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'course' },
      ],
    },
  },
};

export default onlinecourseBlueprint;
