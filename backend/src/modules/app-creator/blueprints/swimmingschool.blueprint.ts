import { Blueprint } from './blueprint.interface';

/**
 * Swimming School / Swim Lessons Blueprint
 */
export const swimmingschoolBlueprint: Blueprint = {
  appType: 'swimmingschool',
  description: 'Swimming school app with lessons, students, instructors, and level assessments',

  coreEntities: ['lesson', 'student', 'instructor', 'assessment', 'enrollment', 'pool'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Lessons', path: '/lessons', icon: 'Waves' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Instructors', path: '/instructors', icon: 'UserCheck' },
        { label: 'Assessments', path: '/assessments', icon: 'ClipboardCheck' },
        { label: 'Enrollments', path: '/enrollments', icon: 'FileText' },
        { label: 'Pools', path: '/pools', icon: 'Circle' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-lessons', component: 'appointment-list', entity: 'lesson', position: 'main' },
    ]},
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-calendar', component: 'appointment-calendar', entity: 'lesson', position: 'main' },
      { id: 'lesson-table', component: 'data-table', entity: 'lesson', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'staff-grid', entity: 'instructor', position: 'main' },
    ]},
    { path: '/assessments', name: 'Assessments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'assessment-table', component: 'data-table', entity: 'assessment', position: 'main' },
    ]},
    { path: '/enrollments', name: 'Enrollments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'enrollment-table', component: 'data-table', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/pools', name: 'Pools', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pool-table', component: 'data-table', entity: 'pool', position: 'main' },
    ]},
    { path: '/register', name: 'Register', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'register-form', component: 'booking-wizard', entity: 'enrollment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create' },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/assessments', entity: 'assessment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/enrollments', entity: 'enrollment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/enrollments', entity: 'enrollment', operation: 'create' },
    { method: 'GET', path: '/pools', entity: 'pool', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    lesson: {
      defaultFields: [
        { name: 'lesson_name', type: 'string', required: true },
        { name: 'lesson_type', type: 'enum', required: true },
        { name: 'skill_level', type: 'enum', required: true },
        { name: 'age_group', type: 'enum' },
        { name: 'lesson_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'capacity', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'skills_covered', type: 'json' },
        { name: 'lane_number', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'instructor' },
        { type: 'belongsTo', target: 'pool' },
      ],
    },
    student: {
      defaultFields: [
        { name: 'student_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'age_group', type: 'enum' },
        { name: 'parent_name', type: 'string' },
        { name: 'parent_email', type: 'email' },
        { name: 'parent_phone', type: 'phone' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'current_level', type: 'enum' },
        { name: 'skills_mastered', type: 'json' },
        { name: 'skills_in_progress', type: 'json' },
        { name: 'water_comfort', type: 'enum' },
        { name: 'medical_info', type: 'json' },
        { name: 'waiver_signed', type: 'boolean' },
        { name: 'photo_url', type: 'image' },
        { name: 'start_date', type: 'date' },
        { name: 'lessons_completed', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'enrollment' },
        { type: 'hasMany', target: 'assessment' },
      ],
    },
    instructor: {
      defaultFields: [
        { name: 'instructor_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'certifications', type: 'json' },
        { name: 'cpr_certified', type: 'boolean' },
        { name: 'cpr_expiry', type: 'date' },
        { name: 'lifeguard_certified', type: 'boolean' },
        { name: 'wsi_certified', type: 'boolean' },
        { name: 'specialties', type: 'json' },
        { name: 'age_groups', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'lesson' },
      ],
    },
    assessment: {
      defaultFields: [
        { name: 'assessment_date', type: 'date', required: true },
        { name: 'assessment_type', type: 'enum', required: true },
        { name: 'current_level', type: 'enum' },
        { name: 'skills_evaluated', type: 'json' },
        { name: 'skill_scores', type: 'json' },
        { name: 'water_safety', type: 'json' },
        { name: 'stroke_technique', type: 'json' },
        { name: 'endurance', type: 'json' },
        { name: 'recommended_level', type: 'enum' },
        { name: 'passed', type: 'boolean' },
        { name: 'areas_to_improve', type: 'json' },
        { name: 'instructor_comments', type: 'text' },
        { name: 'parent_notified', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'instructor' },
      ],
    },
    enrollment: {
      defaultFields: [
        { name: 'enrollment_number', type: 'string', required: true },
        { name: 'enrollment_date', type: 'date', required: true },
        { name: 'session', type: 'string', required: true },
        { name: 'lesson_type', type: 'enum' },
        { name: 'skill_level', type: 'enum' },
        { name: 'preferred_days', type: 'json' },
        { name: 'preferred_times', type: 'json' },
        { name: 'lessons_count', type: 'integer' },
        { name: 'lessons_attended', type: 'integer' },
        { name: 'makeups_available', type: 'integer' },
        { name: 'price', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
      ],
    },
    pool: {
      defaultFields: [
        { name: 'pool_name', type: 'string', required: true },
        { name: 'pool_type', type: 'enum' },
        { name: 'location', type: 'json' },
        { name: 'length_meters', type: 'decimal' },
        { name: 'width_meters', type: 'decimal' },
        { name: 'depth_shallow', type: 'decimal' },
        { name: 'depth_deep', type: 'decimal' },
        { name: 'lanes', type: 'integer' },
        { name: 'water_temp', type: 'decimal' },
        { name: 'is_heated', type: 'boolean' },
        { name: 'is_indoor', type: 'boolean' },
        { name: 'amenities', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'lesson' },
      ],
    },
  },
};

export default swimmingschoolBlueprint;
