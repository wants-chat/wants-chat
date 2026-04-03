import { Blueprint } from './blueprint.interface';

/**
 * Flight School Blueprint
 */
export const flightBlueprint: Blueprint = {
  appType: 'flight',
  description: 'Flight school with students, flight lessons, aircraft, instructors, and certifications',

  coreEntities: ['student', 'flight', 'aircraft', 'instructor', 'certification', 'ground_school'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Flight Log', path: '/flights', icon: 'Plane' },
        { label: 'Aircraft', path: '/aircraft', icon: 'PlaneTakeoff' },
        { label: 'Instructors', path: '/instructors', icon: 'UserCog' },
        { label: 'Ground School', path: '/ground-school', icon: 'GraduationCap' },
      ]}},
      { id: 'flight-stats', component: 'flight-stats', position: 'main' },
      { id: 'today-flights', component: 'flight-list-today', entity: 'flight', position: 'main' },
      { id: 'aircraft-status', component: 'aircraft-status-overview', entity: 'aircraft', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'student-table-flight', entity: 'student', position: 'main' },
    ]},
    { path: '/students/:id', name: 'Student Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-profile', component: 'student-profile-flight', entity: 'student', position: 'main' },
      { id: 'student-logbook', component: 'student-logbook', entity: 'flight', position: 'main' },
      { id: 'student-certifications', component: 'student-certifications', entity: 'certification', position: 'main' },
    ]},
    { path: '/flights', name: 'Flight Log', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'flight-calendar', component: 'flight-calendar', entity: 'flight', position: 'main' },
    ]},
    { path: '/flights/:id', name: 'Flight Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'flight-detail', component: 'flight-detail', entity: 'flight', position: 'main' },
    ]},
    { path: '/aircraft', name: 'Aircraft', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'aircraft-grid', component: 'aircraft-grid', entity: 'aircraft', position: 'main' },
    ]},
    { path: '/aircraft/:id', name: 'Aircraft Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'aircraft-detail', component: 'aircraft-detail', entity: 'aircraft', position: 'main' },
      { id: 'aircraft-maintenance', component: 'aircraft-maintenance-log', entity: 'aircraft', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'instructor-grid-flight', entity: 'instructor', position: 'main' },
    ]},
    { path: '/ground-school', name: 'Ground School', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ground-school-table', component: 'ground-school-table', entity: 'ground_school', position: 'main' },
    ]},
    { path: '/enroll', name: 'Enroll', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-enrollment', component: 'public-enrollment-flight', entity: 'student', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create' },
    { method: 'GET', path: '/flights', entity: 'flight', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/flights', entity: 'flight', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/aircraft', entity: 'aircraft', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/ground-school', entity: 'ground_school', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    student: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'address', type: 'json' },
        { name: 'medical_class', type: 'enum' },
        { name: 'medical_expiry', type: 'date' },
        { name: 'student_pilot_certificate', type: 'string' },
        { name: 'total_flight_hours', type: 'decimal' },
        { name: 'solo_hours', type: 'decimal' },
        { name: 'cross_country_hours', type: 'decimal' },
        { name: 'night_hours', type: 'decimal' },
        { name: 'instrument_hours', type: 'decimal' },
        { name: 'photo', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'flight' },
        { type: 'hasMany', target: 'certification' },
      ],
    },
    flight: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'departure_time', type: 'string', required: true },
        { name: 'arrival_time', type: 'string' },
        { name: 'flight_time', type: 'decimal' },
        { name: 'type', type: 'enum', required: true },
        { name: 'departure_airport', type: 'string' },
        { name: 'arrival_airport', type: 'string' },
        { name: 'route', type: 'text' },
        { name: 'maneuvers', type: 'json' },
        { name: 'landings', type: 'integer' },
        { name: 'night_landings', type: 'integer' },
        { name: 'weather_conditions', type: 'string' },
        { name: 'instructor_notes', type: 'text' },
        { name: 'student_notes', type: 'text' },
        { name: 'hobbs_start', type: 'decimal' },
        { name: 'hobbs_end', type: 'decimal' },
        { name: 'tach_start', type: 'decimal' },
        { name: 'tach_end', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'instructor' },
        { type: 'belongsTo', target: 'aircraft' },
      ],
    },
    aircraft: {
      defaultFields: [
        { name: 'tail_number', type: 'string', required: true },
        { name: 'make', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'year', type: 'integer' },
        { name: 'category', type: 'enum', required: true },
        { name: 'hourly_rate', type: 'decimal', required: true },
        { name: 'hobbs_time', type: 'decimal' },
        { name: 'tach_time', type: 'decimal' },
        { name: 'last_100hr', type: 'date' },
        { name: 'next_100hr', type: 'decimal' },
        { name: 'annual_due', type: 'date' },
        { name: 'equipment', type: 'json' },
        { name: 'insurance_expiry', type: 'date' },
        { name: 'image', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'hasMany', target: 'flight' }],
    },
    instructor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'certificate_number', type: 'string', required: true },
        { name: 'ratings', type: 'json' },
        { name: 'total_flight_hours', type: 'decimal' },
        { name: 'instruction_hours', type: 'decimal' },
        { name: 'medical_expiry', type: 'date' },
        { name: 'flight_review_due', type: 'date' },
        { name: 'specialties', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'schedule', type: 'json' },
        { name: 'photo', type: 'image' },
        { name: 'bio', type: 'text' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [{ type: 'hasMany', target: 'flight' }],
    },
    certification: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'certificate_number', type: 'string' },
        { name: 'issue_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'ratings', type: 'json' },
        { name: 'limitations', type: 'text' },
        { name: 'document', type: 'file' },
      ],
      relationships: [{ type: 'belongsTo', target: 'student' }],
    },
    ground_school: {
      defaultFields: [
        { name: 'course_name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'location', type: 'string' },
        { name: 'max_students', type: 'integer' },
        { name: 'current_students', type: 'integer' },
        { name: 'price', type: 'decimal' },
        { name: 'syllabus', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'instructor' }],
    },
  },
};

export default flightBlueprint;
