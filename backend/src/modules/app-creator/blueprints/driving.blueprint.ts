import { Blueprint } from './blueprint.interface';

/**
 * Driving School Blueprint
 */
export const drivingBlueprint: Blueprint = {
  appType: 'driving',
  description: 'Driving school with students, lessons, instructors, vehicles, and license tracking',

  coreEntities: ['student', 'lesson', 'instructor', 'vehicle', 'package', 'test'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Lessons', path: '/lessons', icon: 'Calendar' },
        { label: 'Instructors', path: '/instructors', icon: 'UserCog' },
        { label: 'Vehicles', path: '/vehicles', icon: 'Car' },
        { label: 'Packages', path: '/packages', icon: 'Package' },
      ]}},
      { id: 'driving-stats', component: 'driving-stats', position: 'main' },
      { id: 'today-lessons', component: 'lesson-list-today-driving', entity: 'lesson', position: 'main' },
      { id: 'upcoming-tests', component: 'test-list-upcoming', entity: 'test', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'student-table-driving', entity: 'student', position: 'main' },
    ]},
    { path: '/students/:id', name: 'Student Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-profile', component: 'student-profile-driving', entity: 'student', position: 'main' },
      { id: 'student-progress', component: 'student-progress-driving', entity: 'lesson', position: 'main' },
    ]},
    { path: '/lessons', name: 'Lessons', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'lesson-calendar', component: 'lesson-calendar-driving', entity: 'lesson', position: 'main' },
    ]},
    { path: '/instructors', name: 'Instructors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'instructor-grid', component: 'instructor-grid-driving', entity: 'instructor', position: 'main' },
    ]},
    { path: '/vehicles', name: 'Vehicles', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vehicle-grid', component: 'vehicle-grid-driving', entity: 'vehicle', position: 'main' },
    ]},
    { path: '/packages', name: 'Packages', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'package-grid', component: 'package-grid-driving', entity: 'package', position: 'main' },
    ]},
    { path: '/tests', name: 'Tests', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'test-table', component: 'test-table-driving', entity: 'test', position: 'main' },
    ]},
    { path: '/enroll', name: 'Enroll', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-enrollment', component: 'public-enrollment-driving', entity: 'student', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create' },
    { method: 'GET', path: '/lessons', entity: 'lesson', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/lessons', entity: 'lesson', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/instructors', entity: 'instructor', operation: 'list' },
    { method: 'GET', path: '/vehicles', entity: 'vehicle', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/packages', entity: 'package', operation: 'list' },
    { method: 'GET', path: '/tests', entity: 'test', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    student: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'address', type: 'json' },
        { name: 'permit_number', type: 'string' },
        { name: 'permit_expiry', type: 'date' },
        { name: 'license_type', type: 'enum' },
        { name: 'lessons_completed', type: 'integer' },
        { name: 'total_hours', type: 'decimal' },
        { name: 'photo', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'lesson' },
        { type: 'hasMany', target: 'test' },
        { type: 'belongsTo', target: 'package' },
      ],
    },
    lesson: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'string', required: true },
        { name: 'duration_hours', type: 'decimal', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'pickup_location', type: 'string' },
        { name: 'skills_covered', type: 'json' },
        { name: 'performance_notes', type: 'text' },
        { name: 'areas_for_improvement', type: 'json' },
        { name: 'road_conditions', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'instructor' },
        { type: 'belongsTo', target: 'vehicle' },
      ],
    },
    instructor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string', required: true },
        { name: 'certification_expiry', type: 'date' },
        { name: 'years_experience', type: 'integer' },
        { name: 'specialties', type: 'json' },
        { name: 'languages', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'photo', type: 'image' },
        { name: 'bio', type: 'text' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [{ type: 'hasMany', target: 'lesson' }],
    },
    vehicle: {
      defaultFields: [
        { name: 'make', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'year', type: 'integer', required: true },
        { name: 'license_plate', type: 'string', required: true },
        { name: 'vin', type: 'string' },
        { name: 'transmission', type: 'enum', required: true },
        { name: 'features', type: 'json' },
        { name: 'insurance_expiry', type: 'date' },
        { name: 'last_maintenance', type: 'date' },
        { name: 'mileage', type: 'integer' },
        { name: 'image', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'hasMany', target: 'lesson' }],
    },
    package: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'lesson_hours', type: 'integer', required: true },
        { name: 'includes_test', type: 'boolean' },
        { name: 'includes_vehicle_for_test', type: 'boolean' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'validity_days', type: 'integer' },
        { name: 'features', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'student' }],
    },
    test: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'examiner', type: 'string' },
        { name: 'result', type: 'enum' },
        { name: 'score', type: 'integer' },
        { name: 'errors', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'vehicle' },
      ],
    },
  },
};

export default drivingBlueprint;
