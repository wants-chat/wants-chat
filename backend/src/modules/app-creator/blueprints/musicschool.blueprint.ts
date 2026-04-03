import { Blueprint } from './blueprint.interface';

/**
 * Music School Blueprint
 */
export const musicschoolBlueprint: Blueprint = {
  appType: 'musicschool',
  description: 'Music school app with students, instructors, lessons, instruments, and recitals',

  coreEntities: ['student', 'instructor', 'lesson', 'instrument', 'recital', 'enrollment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Instructors', path: '/instructors', icon: 'Music' },
        { label: 'Lessons', path: '/lessons', icon: 'Calendar' },
        { label: 'Instruments', path: '/instruments', icon: 'Piano' },
        { label: 'Recitals', path: '/recitals', icon: 'Mic2' },
      ]}},
      { id: 'music-stats', component: 'music-school-stats', position: 'main' },
      { id: 'today-lessons', component: 'lesson-list-music', entity: 'lesson', position: 'main' },
      { id: 'upcoming-recitals', component: 'recital-list', entity: 'recital', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'student-table-music', entity: 'student', position: 'main' },
    ]},
    { path: '/students/:id', name: 'Student Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-profile', component: 'student-profile-music', entity: 'student', position: 'main' },
      { id: 'student-lessons', component: 'student-lessons', entity: 'lesson', position: 'main' },
      { id: 'student-progress', component: 'student-progress-music', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'instructor-grid-music', entity: 'instructor', position: 'main' },
    ]},
    { path: '/instructors/:id', name: 'Instructor Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-profile', component: 'instructor-profile-music', entity: 'instructor', position: 'main' },
      { id: 'instructor-schedule', component: 'instructor-schedule-music', entity: 'lesson', position: 'main' },
    ]},
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-calendar', component: 'lesson-calendar-music', entity: 'lesson', position: 'main' },
    ]},
    { path: '/instruments', name: 'Instruments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instrument-grid', component: 'instrument-grid', entity: 'instrument', position: 'main' },
    ]},
    { path: '/recitals', name: 'Recitals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'recital-list', component: 'recital-list-full', entity: 'recital', position: 'main' },
    ]},
    { path: '/recitals/:id', name: 'Recital Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'recital-detail', component: 'recital-detail', entity: 'recital', position: 'main' },
      { id: 'recital-performers', component: 'recital-performers', entity: 'student', position: 'main' },
    ]},
    { path: '/enroll', name: 'Enroll', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'enrollment-form', component: 'enrollment-form-music', entity: 'enrollment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/students/:id', entity: 'student', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/instructors/:id', entity: 'instructor', operation: 'get' },
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/lessons', entity: 'lesson', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/instruments', entity: 'instrument', operation: 'list' },
    { method: 'GET', path: '/recitals', entity: 'recital', operation: 'list' },
  ],

  entityConfig: {
    student: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'instruments', type: 'json' },
        { name: 'skill_level', type: 'enum' },
        { name: 'enrollment_date', type: 'date' },
        { name: 'status', type: 'enum' },
        { name: 'parent_contact', type: 'json' },
        { name: 'photo_url', type: 'image' },
      ],
      relationships: [
        { type: 'hasMany', target: 'lesson' },
        { type: 'hasMany', target: 'enrollment' },
      ],
    },
    instructor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'instruments', type: 'json', required: true },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'lesson' }],
    },
    lesson: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration', type: 'integer', required: true },
        { name: 'type', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'room', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'homework', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'instructor' },
        { type: 'belongsTo', target: 'instrument' },
      ],
    },
    instrument: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
      ],
      relationships: [],
    },
    recital: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'date', type: 'datetime', required: true },
        { name: 'venue', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'program', type: 'json' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [{ type: 'hasMany', target: 'student' }],
    },
  },
};

export default musicschoolBlueprint;
