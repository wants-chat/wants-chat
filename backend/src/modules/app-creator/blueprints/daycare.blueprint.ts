import { Blueprint } from './blueprint.interface';

/**
 * Daycare/Childcare Center Blueprint
 */
export const daycareBlueprint: Blueprint = {
  appType: 'daycare',
  description: 'Childcare center with children, enrollment, attendance, activities, and parent communication',

  coreEntities: ['child', 'enrollment', 'attendance', 'activity', 'parent', 'staff'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Children', path: '/children', icon: 'Baby' },
        { label: 'Attendance', path: '/attendance', icon: 'ClipboardCheck' },
        { label: 'Activities', path: '/activities', icon: 'Palette' },
        { label: 'Parents', path: '/parents', icon: 'Users' },
        { label: 'Staff', path: '/staff', icon: 'UserCog' },
      ]}},
      { id: 'daycare-stats', component: 'daycare-stats', position: 'main' },
      { id: 'today-attendance', component: 'attendance-today', entity: 'attendance', position: 'main' },
      { id: 'today-activities', component: 'activity-list-today', entity: 'activity', position: 'main' },
    ]},
    { path: '/children', name: 'Children', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'child-grid', component: 'child-grid', entity: 'child', position: 'main' },
    ]},
    { path: '/children/:id', name: 'Child Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'child-profile', component: 'child-profile', entity: 'child', position: 'main' },
      { id: 'child-attendance', component: 'child-attendance-history', entity: 'attendance', position: 'main' },
    ]},
    { path: '/attendance', name: 'Attendance', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'attendance-tracker', component: 'attendance-tracker', entity: 'attendance', position: 'main' },
    ]},
    { path: '/activities', name: 'Activities', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'activity-calendar', component: 'activity-calendar-daycare', entity: 'activity', position: 'main' },
    ]},
    { path: '/parents', name: 'Parents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'parent-table', component: 'parent-table', entity: 'parent', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-table', component: 'staff-table-daycare', entity: 'staff', position: 'main' },
    ]},
    { path: '/enroll', name: 'Enrollment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-enrollment', component: 'public-enrollment-daycare', entity: 'enrollment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/children', entity: 'child', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/children', entity: 'child', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/attendance', entity: 'attendance', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/attendance', entity: 'attendance', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/activities', entity: 'activity', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/parents', entity: 'parent', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/enrollments', entity: 'enrollment', operation: 'create' },
  ],

  entityConfig: {
    child: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'classroom', type: 'string' },
        { name: 'allergies', type: 'json' },
        { name: 'medical_notes', type: 'text' },
        { name: 'emergency_contacts', type: 'json' },
        { name: 'authorized_pickups', type: 'json' },
        { name: 'photo', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'parent' },
        { type: 'hasMany', target: 'attendance' },
      ],
    },
    enrollment: {
      defaultFields: [
        { name: 'enrollment_date', type: 'date', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'schedule', type: 'json', required: true },
        { name: 'program', type: 'enum', required: true },
        { name: 'monthly_rate', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'documents', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'child' }],
    },
    attendance: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'check_in', type: 'datetime' },
        { name: 'check_out', type: 'datetime' },
        { name: 'checked_in_by', type: 'string' },
        { name: 'checked_out_by', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'child' }],
    },
    activity: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'classroom', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'materials', type: 'json' },
        { name: 'photos', type: 'json' },
      ],
      relationships: [],
    },
    parent: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'secondary_phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'employer', type: 'string' },
        { name: 'work_phone', type: 'phone' },
        { name: 'relationship', type: 'enum' },
      ],
      relationships: [{ type: 'hasMany', target: 'child' }],
    },
    staff: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'classroom', type: 'string' },
        { name: 'hire_date', type: 'date' },
        { name: 'certifications', type: 'json' },
        { name: 'background_check', type: 'boolean' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [],
    },
  },
};

export default daycareBlueprint;
