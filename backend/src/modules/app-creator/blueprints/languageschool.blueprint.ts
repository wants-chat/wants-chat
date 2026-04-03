import { Blueprint } from './blueprint.interface';

/**
 * Language School Blueprint
 */
export const languageschoolBlueprint: Blueprint = {
  appType: 'languageschool',
  description: 'Language school app with courses, students, teachers, classes, and progress tracking',

  coreEntities: ['course', 'student', 'teacher', 'class', 'level_test', 'material'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Courses', path: '/courses', icon: 'Languages' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Teachers', path: '/teachers', icon: 'UserCheck' },
        { label: 'Classes', path: '/classes', icon: 'Calendar' },
        { label: 'Level Tests', path: '/tests', icon: 'ClipboardCheck' },
        { label: 'Materials', path: '/materials', icon: 'BookOpen' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-classes', component: 'appointment-list', entity: 'class', position: 'main' },
    ]},
    { path: '/courses', name: 'Courses', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'course-grid', component: 'product-grid', entity: 'course', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/teachers', name: 'Teachers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'teacher-grid', component: 'staff-grid', entity: 'teacher', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-calendar', component: 'appointment-calendar', entity: 'class', position: 'main' },
      { id: 'class-table', component: 'data-table', entity: 'class', position: 'main' },
    ]},
    { path: '/tests', name: 'Level Tests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'test-table', component: 'data-table', entity: 'level_test', position: 'main' },
    ]},
    { path: '/materials', name: 'Materials', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'material-table', component: 'data-table', entity: 'material', position: 'main' },
    ]},
    { path: '/enroll', name: 'Enroll', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'course-display', component: 'product-grid', entity: 'course', position: 'main' },
      { id: 'enroll-form', component: 'booking-wizard', entity: 'student', position: 'main' },
    ]},
    { path: '/level-test', name: 'Take Level Test', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'test-form', component: 'booking-wizard', entity: 'level_test', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/courses', entity: 'course', operation: 'list' },
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create' },
    { method: 'GET', path: '/teachers', entity: 'teacher', operation: 'list' },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tests', entity: 'level_test', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tests', entity: 'level_test', operation: 'create' },
    { method: 'GET', path: '/materials', entity: 'material', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    course: {
      defaultFields: [
        { name: 'course_name', type: 'string', required: true },
        { name: 'language', type: 'enum', required: true },
        { name: 'level', type: 'enum', required: true },
        { name: 'format', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'duration_weeks', type: 'integer' },
        { name: 'hours_per_week', type: 'decimal' },
        { name: 'class_size', type: 'integer' },
        { name: 'schedule', type: 'json' },
        { name: 'curriculum', type: 'json' },
        { name: 'learning_objectives', type: 'json' },
        { name: 'materials_required', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'student' },
        { type: 'hasMany', target: 'class' },
      ],
    },
    student: {
      defaultFields: [
        { name: 'student_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'native_language', type: 'enum' },
        { name: 'target_language', type: 'enum', required: true },
        { name: 'current_level', type: 'enum' },
        { name: 'learning_goals', type: 'json' },
        { name: 'availability', type: 'json' },
        { name: 'preferred_format', type: 'enum' },
        { name: 'enrollment_date', type: 'date' },
        { name: 'attendance_rate', type: 'decimal' },
        { name: 'progress', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
        { type: 'hasMany', target: 'class' },
        { type: 'hasMany', target: 'level_test' },
      ],
    },
    teacher: {
      defaultFields: [
        { name: 'teacher_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'native_language', type: 'enum' },
        { name: 'languages_taught', type: 'json', required: true },
        { name: 'certifications', type: 'json' },
        { name: 'education', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'specialties', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'schedule', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'class' },
      ],
    },
    class: {
      defaultFields: [
        { name: 'class_number', type: 'string', required: true },
        { name: 'class_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'format', type: 'enum' },
        { name: 'location', type: 'string' },
        { name: 'meeting_link', type: 'string' },
        { name: 'topic', type: 'string' },
        { name: 'lesson_plan', type: 'json' },
        { name: 'materials_used', type: 'json' },
        { name: 'attendance', type: 'json' },
        { name: 'homework', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'course' },
        { type: 'belongsTo', target: 'teacher' },
      ],
    },
    level_test: {
      defaultFields: [
        { name: 'test_number', type: 'string', required: true },
        { name: 'test_date', type: 'date', required: true },
        { name: 'language', type: 'enum', required: true },
        { name: 'test_type', type: 'enum', required: true },
        { name: 'reading_score', type: 'decimal' },
        { name: 'writing_score', type: 'decimal' },
        { name: 'listening_score', type: 'decimal' },
        { name: 'speaking_score', type: 'decimal' },
        { name: 'overall_score', type: 'decimal' },
        { name: 'level_assigned', type: 'enum' },
        { name: 'strengths', type: 'json' },
        { name: 'areas_to_improve', type: 'json' },
        { name: 'recommendations', type: 'text' },
        { name: 'examiner', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
      ],
    },
    material: {
      defaultFields: [
        { name: 'material_name', type: 'string', required: true },
        { name: 'material_type', type: 'enum', required: true },
        { name: 'language', type: 'enum', required: true },
        { name: 'level', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'topics', type: 'json' },
        { name: 'file_url', type: 'string' },
        { name: 'video_url', type: 'string' },
        { name: 'audio_url', type: 'string' },
        { name: 'pages', type: 'integer' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'price', type: 'decimal' },
        { name: 'is_free', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default languageschoolBlueprint;
