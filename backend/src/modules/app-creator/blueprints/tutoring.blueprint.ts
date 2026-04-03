import { Blueprint } from './blueprint.interface';

/**
 * Tutoring Blueprint
 */
export const tutoringBlueprint: Blueprint = {
  appType: 'tutoring',
  description: 'Tutoring app with tutors, students, sessions, subjects, and scheduling',

  coreEntities: ['tutor', 'student', 'session', 'subject', 'booking', 'review'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Sessions', path: '/sessions', icon: 'Calendar' },
        { label: 'Tutors', path: '/tutors', icon: 'GraduationCap' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Subjects', path: '/subjects', icon: 'BookOpen' },
        { label: 'Reports', path: '/reports', icon: 'BarChart' },
      ]}},
      { id: 'tutoring-stats', component: 'tutoring-stats', position: 'main' },
      { id: 'upcoming-sessions', component: 'session-list-tutoring', entity: 'session', position: 'main' },
      { id: 'tutor-availability', component: 'tutor-availability-overview', entity: 'tutor', position: 'main' },
    ]},
    { path: '/sessions', name: 'Sessions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-calendar', component: 'session-calendar', entity: 'session', position: 'main' },
    ]},
    { path: '/sessions/:id', name: 'Session Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'session-detail', component: 'session-detail-tutoring', entity: 'session', position: 'main' },
    ]},
    { path: '/tutors', name: 'Tutors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tutor-filters', component: 'tutor-filters', entity: 'tutor', position: 'main' },
      { id: 'tutor-grid', component: 'tutor-grid', entity: 'tutor', position: 'main' },
    ]},
    { path: '/tutors/:id', name: 'Tutor Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tutor-profile', component: 'tutor-profile', entity: 'tutor', position: 'main' },
      { id: 'tutor-reviews', component: 'tutor-reviews', entity: 'review', position: 'main' },
      { id: 'tutor-schedule', component: 'tutor-schedule', entity: 'session', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'student-table-tutoring', entity: 'student', position: 'main' },
    ]},
    { path: '/students/:id', name: 'Student Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-profile', component: 'student-profile-tutoring', entity: 'student', position: 'main' },
      { id: 'student-progress', component: 'student-progress', entity: 'session', position: 'main' },
    ]},
    { path: '/subjects', name: 'Subjects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'subject-grid', component: 'subject-grid', entity: 'subject', position: 'main' },
    ]},
    { path: '/find-tutor', name: 'Find a Tutor', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'tutor-search', component: 'tutor-search', position: 'main' },
      { id: 'tutor-results', component: 'tutor-results', entity: 'tutor', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/sessions', entity: 'session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sessions', entity: 'session', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/tutors', entity: 'tutor', operation: 'list' },
    { method: 'GET', path: '/tutors/:id', entity: 'tutor', operation: 'get' },
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/students/:id', entity: 'student', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/subjects', entity: 'subject', operation: 'list' },
    { method: 'POST', path: '/reviews', entity: 'review', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    tutor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'subjects', type: 'json' },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'experience_years', type: 'integer' },
        { name: 'education', type: 'json' },
        { name: 'availability', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'total_sessions', type: 'integer' },
        { name: 'is_verified', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'session' },
        { type: 'hasMany', target: 'review' },
      ],
    },
    student: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'grade_level', type: 'string' },
        { name: 'school', type: 'string' },
        { name: 'subjects_needed', type: 'json' },
        { name: 'learning_goals', type: 'text' },
        { name: 'parent_contact', type: 'json' },
        { name: 'total_sessions', type: 'integer' },
      ],
      relationships: [{ type: 'hasMany', target: 'session' }],
    },
    session: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'meeting_link', type: 'url' },
        { name: 'topics_covered', type: 'json' },
        { name: 'homework', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'amount', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'tutor' },
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'subject' },
      ],
    },
    subject: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'grade_levels', type: 'json' },
        { name: 'icon', type: 'string' },
      ],
      relationships: [{ type: 'hasMany', target: 'tutor' }],
    },
  },
};

export default tutoringBlueprint;
