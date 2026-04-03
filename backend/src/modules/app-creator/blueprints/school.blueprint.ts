import { Blueprint } from './blueprint.interface';

/**
 * School Administration Blueprint
 */
export const schoolBlueprint: Blueprint = {
  appType: 'school',
  description: 'School administration app with students, teachers, classes, grades, and attendance',

  coreEntities: ['student', 'teacher', 'class', 'course', 'grade', 'attendance', 'parent', 'assignment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'GraduationCap' },
        { label: 'Teachers', path: '/teachers', icon: 'Users' },
        { label: 'Classes', path: '/classes', icon: 'BookOpen' },
        { label: 'Grades', path: '/grades', icon: 'FileText' },
        { label: 'Attendance', path: '/attendance', icon: 'ClipboardCheck' },
        { label: 'Schedule', path: '/schedule', icon: 'Calendar' },
      ]}},
      { id: 'school-stats', component: 'school-stats', position: 'main' },
      { id: 'today-attendance', component: 'attendance-summary', entity: 'attendance', position: 'main' },
      { id: 'upcoming-events', component: 'school-events', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-filters', component: 'student-filters', entity: 'student', position: 'main' },
      { id: 'student-table', component: 'student-table', entity: 'student', position: 'main' },
    ]},
    { path: '/students/:id', name: 'Student Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-profile', component: 'student-profile', entity: 'student', position: 'main' },
      { id: 'student-grades', component: 'student-grades', entity: 'grade', position: 'main' },
      { id: 'student-attendance', component: 'student-attendance', entity: 'attendance', position: 'main' },
    ]},
    { path: '/teachers', name: 'Teachers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'teacher-table', component: 'teacher-table', entity: 'teacher', position: 'main' },
    ]},
    { path: '/teachers/:id', name: 'Teacher Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'teacher-profile', component: 'teacher-profile', entity: 'teacher', position: 'main' },
      { id: 'teacher-classes', component: 'teacher-classes', entity: 'class', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-grid', component: 'class-grid', entity: 'class', position: 'main' },
    ]},
    { path: '/classes/:id', name: 'Class Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-header', component: 'class-header', entity: 'class', position: 'main' },
      { id: 'class-students', component: 'class-students', entity: 'student', position: 'main' },
      { id: 'class-assignments', component: 'assignment-list', entity: 'assignment', position: 'main' },
    ]},
    { path: '/grades', name: 'Grades', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'grade-filters', component: 'grade-filters', entity: 'grade', position: 'main' },
      { id: 'gradebook', component: 'gradebook', entity: 'grade', position: 'main' },
    ]},
    { path: '/attendance', name: 'Attendance', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'attendance-date', component: 'attendance-date-picker', position: 'main' },
      { id: 'attendance-form', component: 'attendance-form', entity: 'attendance', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'schedule-calendar', component: 'schedule-calendar', entity: 'class', position: 'main' },
    ]},
    { path: '/report-cards', name: 'Report Cards', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'report-card-generator', component: 'report-card-generator', entity: 'student', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/students/:id', entity: 'student', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/students/:id', entity: 'student', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/teachers', entity: 'teacher', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/teachers/:id', entity: 'teacher', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/classes/:id', entity: 'class', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/grades', entity: 'grade', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/grades', entity: 'grade', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/attendance', entity: 'attendance', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/attendance', entity: 'attendance', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    student: {
      defaultFields: [
        { name: 'student_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'grade_level', type: 'integer', required: true },
        { name: 'enrollment_date', type: 'date' },
        { name: 'status', type: 'enum' },
        { name: 'address', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'medical_info', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'grade' },
        { type: 'hasMany', target: 'attendance' },
        { type: 'belongsTo', target: 'parent' },
      ],
    },
    teacher: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'subjects', type: 'json' },
        { name: 'hire_date', type: 'date' },
        { name: 'status', type: 'enum' },
        { name: 'photo_url', type: 'image' },
        { name: 'qualifications', type: 'json' },
      ],
      relationships: [{ type: 'hasMany', target: 'class' }],
    },
    class: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'code', type: 'string', required: true },
        { name: 'subject', type: 'string', required: true },
        { name: 'grade_level', type: 'integer' },
        { name: 'room', type: 'string' },
        { name: 'schedule', type: 'json' },
        { name: 'capacity', type: 'integer' },
        { name: 'semester', type: 'string' },
        { name: 'year', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'teacher' },
        { type: 'hasMany', target: 'student' },
        { type: 'hasMany', target: 'assignment' },
      ],
    },
    grade: {
      defaultFields: [
        { name: 'score', type: 'decimal', required: true },
        { name: 'max_score', type: 'decimal', required: true },
        { name: 'letter_grade', type: 'string' },
        { name: 'type', type: 'enum' },
        { name: 'comments', type: 'text' },
        { name: 'graded_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'assignment' },
        { type: 'belongsTo', target: 'class' },
      ],
    },
    attendance: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'check_in_time', type: 'datetime' },
        { name: 'check_out_time', type: 'datetime' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'class' },
      ],
    },
  },
};

export default schoolBlueprint;
