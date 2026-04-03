import { Blueprint } from './blueprint.interface';

/**
 * Dance Studio Blueprint
 */
export const dancestudioBlueprint: Blueprint = {
  appType: 'dancestudio',
  description: 'Dance studio app with classes, students, instructors, and performances',

  coreEntities: ['dance_class', 'student', 'instructor', 'enrollment', 'performance', 'schedule'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Classes', path: '/classes', icon: 'Music2' },
        { label: 'Schedule', path: '/schedule', icon: 'Calendar' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Instructors', path: '/instructors', icon: 'Star' },
        { label: 'Performances', path: '/performances', icon: 'Sparkles' },
      ]}},
      { id: 'dance-stats', component: 'dance-studio-stats', position: 'main' },
      { id: 'today-classes', component: 'class-list-dance', entity: 'dance_class', position: 'main' },
      { id: 'upcoming-performances', component: 'performance-list', entity: 'performance', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-filters', component: 'class-filters-dance', entity: 'dance_class', position: 'main' },
      { id: 'class-grid', component: 'class-grid-dance', entity: 'dance_class', position: 'main' },
    ]},
    { path: '/classes/:id', name: 'Class Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-detail', component: 'class-detail-dance', entity: 'dance_class', position: 'main' },
      { id: 'class-roster', component: 'class-roster', entity: 'student', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'schedule-calendar', component: 'schedule-calendar-dance', entity: 'schedule', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'student-table-dance', entity: 'student', position: 'main' },
    ]},
    { path: '/students/:id', name: 'Student Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-profile', component: 'student-profile-dance', entity: 'student', position: 'main' },
      { id: 'student-enrollments', component: 'student-enrollments', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'instructor-grid-dance', entity: 'instructor', position: 'main' },
    ]},
    { path: '/instructors/:id', name: 'Instructor Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-profile', component: 'instructor-profile-dance', entity: 'instructor', position: 'main' },
      { id: 'instructor-classes', component: 'instructor-classes-dance', entity: 'dance_class', position: 'main' },
    ]},
    { path: '/performances', name: 'Performances', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'performance-list', component: 'performance-list-full', entity: 'performance', position: 'main' },
    ]},
    { path: '/register', name: 'Register', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'class-browser', component: 'class-browser-dance', entity: 'dance_class', position: 'main' },
      { id: 'registration-form', component: 'registration-form-dance', entity: 'enrollment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/classes', entity: 'dance_class', operation: 'list' },
    { method: 'GET', path: '/classes/:id', entity: 'dance_class', operation: 'get' },
    { method: 'POST', path: '/classes', entity: 'dance_class', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/students/:id', entity: 'student', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/schedule', entity: 'schedule', operation: 'list' },
    { method: 'GET', path: '/performances', entity: 'performance', operation: 'list' },
    { method: 'POST', path: '/enrollments', entity: 'enrollment', operation: 'create' },
  ],

  entityConfig: {
    dance_class: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'style', type: 'enum', required: true },
        { name: 'level', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'age_group', type: 'string' },
        { name: 'duration', type: 'integer' },
        { name: 'price', type: 'decimal' },
        { name: 'max_students', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'instructor' },
        { type: 'hasMany', target: 'enrollment' },
      ],
    },
    student: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'enrollment_date', type: 'date' },
        { name: 'status', type: 'enum' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'enrollment' }],
    },
    instructor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'styles', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'experience_years', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'dance_class' }],
    },
    enrollment: {
      defaultFields: [
        { name: 'enrollment_date', type: 'date', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'paid', type: 'boolean' },
        { name: 'amount', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'dance_class' },
      ],
    },
    performance: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'date', type: 'datetime', required: true },
        { name: 'venue', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'ticket_price', type: 'decimal' },
        { name: 'status', type: 'enum' },
        { name: 'image_url', type: 'image' },
      ],
      relationships: [],
    },
  },
};

export default dancestudioBlueprint;
