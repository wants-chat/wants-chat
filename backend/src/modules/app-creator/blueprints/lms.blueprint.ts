import { Blueprint } from './blueprint.interface';

/**
 * Learning Management System (LMS) Blueprint
 *
 * Defines the structure for an LMS application:
 * - Courses and lessons
 * - Student enrollment
 * - Progress tracking
 * - Quizzes and assignments
 * - Certificates
 */
export const lmsBlueprint: Blueprint = {
  appType: 'lms',
  description: 'Learning management system with courses, lessons, and progress tracking',

  coreEntities: ['category', 'course', 'lesson', 'enrollment', 'progress', 'quiz', 'certificate', 'review'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    // Course Catalog
    {
      path: '/',
      name: 'Courses',
      layout: 'landing',
      sections: [
        {
          id: 'hero',
          component: 'hero',
          position: 'full',
          props: {
            title: 'Learn New Skills',
            subtitle: 'Access top-quality courses from industry experts',
            primaryCTA: 'Browse Courses',
            primaryCTALink: '/courses',
          },
        },
        {
          id: 'featured-courses',
          component: 'course-grid',
          entity: 'course',
          position: 'main',
          props: {
            title: 'Featured Courses',
            limit: 8,
            featured: true,
          },
        },
        {
          id: 'categories',
          component: 'data-grid',
          entity: 'category',
          position: 'main',
          props: {
            title: 'Browse by Category',
            columns: 4,
          },
        },
      ],
    },
    // All Courses
    {
      path: '/courses',
      name: 'All Courses',
      layout: 'two-column',
      sections: [
        {
          id: 'filters',
          component: 'filter-form',
          entity: 'course',
          position: 'sidebar',
          props: {
            filters: ['category', 'level', 'duration', 'price'],
          },
        },
        {
          id: 'courses',
          component: 'course-grid',
          entity: 'course',
          position: 'main',
          props: {
            showPagination: true,
          },
        },
      ],
    },
    // Course Detail
    {
      path: '/courses/:id',
      name: 'Course Detail',
      layout: 'single-column',
      sections: [
        {
          id: 'course-header',
          component: 'course-header',
          entity: 'course',
          position: 'main',
        },
        {
          id: 'curriculum',
          component: 'curriculum-list',
          entity: 'lesson',
          position: 'main',
          props: {
            title: 'Course Curriculum',
          },
        },
        {
          id: 'reviews',
          component: 'review-list',
          entity: 'review',
          position: 'main',
          props: {
            title: 'Student Reviews',
          },
        },
      ],
    },
    // Lesson Player
    {
      path: '/lessons/:id',
      name: 'Lesson',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'lesson-player',
          component: 'lesson-player',
          entity: 'lesson',
          position: 'main',
        },
        {
          id: 'lesson-sidebar',
          component: 'lesson-sidebar',
          entity: 'lesson',
          position: 'sidebar',
        },
      ],
    },
    // My Learning
    {
      path: '/my-learning',
      name: 'My Learning',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'enrolled-courses',
          component: 'enrolled-courses',
          entity: 'enrollment',
          position: 'main',
          props: {
            title: 'My Courses',
          },
        },
      ],
    },
    // Certificates
    {
      path: '/certificates',
      name: 'Certificates',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'certificates',
          component: 'certificate-grid',
          entity: 'certificate',
          position: 'main',
          props: {
            title: 'My Certificates',
          },
        },
      ],
    },
    // Quiz
    {
      path: '/quizzes/:id',
      name: 'Quiz',
      layout: 'single-column',
      requiresAuth: true,
      sections: [
        {
          id: 'quiz',
          component: 'quiz-player',
          entity: 'quiz',
          position: 'main',
        },
      ],
    },
    // Admin Dashboard
    {
      path: '/admin',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
          props: {
            links: [
              { label: 'Dashboard', path: '/admin', icon: 'LayoutDashboard' },
              { label: 'Courses', path: '/admin/courses', icon: 'BookOpen' },
              { label: 'Students', path: '/admin/students', icon: 'Users' },
              { label: 'Revenue', path: '/admin/revenue', icon: 'DollarSign' },
            ],
          },
        },
        {
          id: 'stats',
          component: 'stats-cards',
          position: 'main',
          props: {
            stats: ['students', 'courses', 'revenue', 'completions'],
          },
        },
        {
          id: 'recent-enrollments',
          component: 'data-table',
          entity: 'enrollment',
          position: 'main',
          props: {
            title: 'Recent Enrollments',
            limit: 10,
          },
        },
      ],
    },
    // Admin Courses
    {
      path: '/admin/courses',
      name: 'Manage Courses',
      layout: 'dashboard',
      requiresAuth: true,
      adminOnly: true,
      sections: [
        {
          id: 'sidebar',
          component: 'sidebar',
          position: 'sidebar',
        },
        {
          id: 'courses-table',
          component: 'data-table',
          entity: 'course',
          position: 'main',
          props: {
            title: 'Courses',
            showCreate: true,
            showEdit: true,
            showDelete: true,
            columns: ['title', 'instructor', 'students', 'rating', 'status'],
          },
        },
      ],
    },
  ],

  endpoints: [
    // Courses
    { method: 'GET', path: '/courses', entity: 'course', operation: 'list' },
    { method: 'GET', path: '/courses/:id', entity: 'course', operation: 'get' },
    { method: 'POST', path: '/courses', entity: 'course', operation: 'create', requiresAuth: true, adminOnly: true },
    { method: 'PUT', path: '/courses/:id', entity: 'course', operation: 'update', requiresAuth: true, adminOnly: true },
    { method: 'DELETE', path: '/courses/:id', entity: 'course', operation: 'delete', requiresAuth: true, adminOnly: true },
    { method: 'GET', path: '/courses/:id/lessons', entity: 'lesson', operation: 'list' },

    // Lessons
    { method: 'GET', path: '/lessons/:id', entity: 'lesson', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/lessons', entity: 'lesson', operation: 'create', requiresAuth: true, adminOnly: true },
    { method: 'PUT', path: '/lessons/:id', entity: 'lesson', operation: 'update', requiresAuth: true, adminOnly: true },

    // Enrollments
    { method: 'GET', path: '/enrollments', entity: 'enrollment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/courses/:id/enroll', entity: 'enrollment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/my-courses', entity: 'enrollment', operation: 'list', requiresAuth: true },

    // Progress
    { method: 'GET', path: '/courses/:id/progress', entity: 'progress', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/lessons/:id/complete', entity: 'progress', operation: 'create', requiresAuth: true },

    // Quizzes
    { method: 'GET', path: '/quizzes/:id', entity: 'quiz', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/quizzes/:id/submit', entity: 'quiz', operation: 'create', requiresAuth: true },

    // Certificates
    { method: 'GET', path: '/certificates', entity: 'certificate', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/certificates/:id', entity: 'certificate', operation: 'get', requiresAuth: true },
  ],

  entityConfig: {
    category: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'icon', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'course_count', type: 'integer' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'position', type: 'integer' },
      ],
      relationships: [
        { type: 'hasMany', target: 'course' },
      ],
    },
    course: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'slug', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'short_description', type: 'string' },
        { name: 'thumbnail_url', type: 'image' },
        { name: 'video_preview_url', type: 'url' },
        { name: 'price', type: 'decimal' },
        { name: 'level', type: 'enum' },
        { name: 'duration_hours', type: 'integer' },
        { name: 'lesson_count', type: 'integer' },
        { name: 'student_count', type: 'integer' },
        { name: 'rating', type: 'decimal' },
        { name: 'status', type: 'enum' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'requirements', type: 'json' },
        { name: 'learning_outcomes', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'belongsTo', target: 'user' },
        { type: 'hasMany', target: 'lesson' },
        { type: 'hasMany', target: 'enrollment' },
        { type: 'hasMany', target: 'quiz' },
      ],
    },
    lesson: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'content', type: 'text' },
        { name: 'video_url', type: 'url' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'position', type: 'integer' },
        { name: 'is_preview', type: 'boolean' },
        { name: 'attachments', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
        { type: 'hasMany', target: 'progress' },
      ],
    },
    enrollment: {
      defaultFields: [
        { name: 'status', type: 'enum', required: true },
        { name: 'progress_percent', type: 'integer' },
        { name: 'completed_at', type: 'datetime' },
        { name: 'expires_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    progress: {
      defaultFields: [
        { name: 'status', type: 'enum', required: true },
        { name: 'watch_time', type: 'integer' },
        { name: 'completed_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'lesson' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    quiz: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'questions', type: 'json', required: true },
        { name: 'passing_score', type: 'integer' },
        { name: 'time_limit_minutes', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
        { type: 'belongsTo', target: 'lesson' },
      ],
    },
    certificate: {
      defaultFields: [
        { name: 'certificate_number', type: 'string', required: true },
        { name: 'issued_at', type: 'datetime', required: true },
        { name: 'certificate_url', type: 'url' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
    review: {
      defaultFields: [
        { name: 'rating', type: 'integer', required: true },
        { name: 'title', type: 'string' },
        { name: 'content', type: 'text' },
        { name: 'is_verified', type: 'boolean' },
        { name: 'helpful_count', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
        { type: 'belongsTo', target: 'user' },
      ],
    },
  },
};

export default lmsBlueprint;
