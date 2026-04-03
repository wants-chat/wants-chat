import { Blueprint } from './blueprint.interface';

/**
 * Montessori School Blueprint
 */
export const montessoriBlueprint: Blueprint = {
  appType: 'montessori',
  description: 'Montessori school app with students, classrooms, progress tracking, and parent communication',

  coreEntities: ['student', 'classroom', 'progress', 'lesson', 'guide', 'communication'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Classrooms', path: '/classrooms', icon: 'Home' },
        { label: 'Progress', path: '/progress', icon: 'TrendingUp' },
        { label: 'Lessons', path: '/lessons', icon: 'BookOpen' },
        { label: 'Guides', path: '/guides', icon: 'UserCheck' },
        { label: 'Communication', path: '/communication', icon: 'MessageSquare' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-activity', component: 'data-table', entity: 'progress', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/classrooms', name: 'Classrooms', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'classroom-grid', component: 'product-grid', entity: 'classroom', position: 'main' },
    ]},
    { path: '/progress', name: 'Progress', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'progress-table', component: 'data-table', entity: 'progress', position: 'main' },
    ]},
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-table', component: 'data-table', entity: 'lesson', position: 'main' },
    ]},
    { path: '/guides', name: 'Guides', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'guide-grid', component: 'staff-grid', entity: 'guide', position: 'main' },
    ]},
    { path: '/communication', name: 'Communication', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'communication-table', component: 'data-table', entity: 'communication', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/classrooms', entity: 'classroom', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/classrooms', entity: 'classroom', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/progress', entity: 'progress', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/progress', entity: 'progress', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/guides', entity: 'guide', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/communication', entity: 'communication', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/communication', entity: 'communication', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    student: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'enrollment_date', type: 'date' },
        { name: 'program', type: 'enum' },
        { name: 'schedule', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'medical_conditions', type: 'text' },
        { name: 'medications', type: 'json' },
        { name: 'parent1', type: 'json', required: true },
        { name: 'parent2', type: 'json' },
        { name: 'emergency_contacts', type: 'json' },
        { name: 'authorized_pickups', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'classroom' },
        { type: 'hasMany', target: 'progress' },
      ],
    },
    classroom: {
      defaultFields: [
        { name: 'classroom_name', type: 'string', required: true },
        { name: 'level', type: 'enum', required: true },
        { name: 'age_range', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'current_enrollment', type: 'integer' },
        { name: 'curriculum_areas', type: 'json' },
        { name: 'daily_schedule', type: 'json' },
        { name: 'materials', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'student' },
        { type: 'hasMany', target: 'guide' },
      ],
    },
    progress: {
      defaultFields: [
        { name: 'observation_date', type: 'date', required: true },
        { name: 'curriculum_area', type: 'enum', required: true },
        { name: 'lesson_name', type: 'string' },
        { name: 'skill', type: 'string' },
        { name: 'presentation_type', type: 'enum' },
        { name: 'mastery_level', type: 'enum' },
        { name: 'concentration', type: 'enum' },
        { name: 'independence', type: 'enum' },
        { name: 'repetition_count', type: 'integer' },
        { name: 'work_duration', type: 'integer' },
        { name: 'observations', type: 'text' },
        { name: 'next_steps', type: 'text' },
        { name: 'photos', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'guide' },
        { type: 'belongsTo', target: 'lesson' },
      ],
    },
    lesson: {
      defaultFields: [
        { name: 'lesson_name', type: 'string', required: true },
        { name: 'curriculum_area', type: 'enum', required: true },
        { name: 'sub_area', type: 'string' },
        { name: 'level', type: 'enum' },
        { name: 'age_range', type: 'string' },
        { name: 'prerequisites', type: 'json' },
        { name: 'materials_needed', type: 'json' },
        { name: 'presentation_steps', type: 'json' },
        { name: 'control_of_error', type: 'text' },
        { name: 'direct_aim', type: 'text' },
        { name: 'indirect_aim', type: 'text' },
        { name: 'extensions', type: 'json' },
        { name: 'vocabulary', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'progress' },
      ],
    },
    guide: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'certifications', type: 'json' },
        { name: 'montessori_training', type: 'json' },
        { name: 'specializations', type: 'json' },
        { name: 'hire_date', type: 'date' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'classroom' },
        { type: 'hasMany', target: 'progress' },
      ],
    },
    communication: {
      defaultFields: [
        { name: 'communication_date', type: 'date', required: true },
        { name: 'communication_type', type: 'enum', required: true },
        { name: 'subject', type: 'string', required: true },
        { name: 'message', type: 'text', required: true },
        { name: 'recipients', type: 'enum' },
        { name: 'attachments', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'requires_response', type: 'boolean' },
        { name: 'response_deadline', type: 'date' },
        { name: 'responses', type: 'json' },
        { name: 'sent_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'classroom' },
        { type: 'belongsTo', target: 'guide' },
      ],
    },
  },
};

export default montessoriBlueprint;
