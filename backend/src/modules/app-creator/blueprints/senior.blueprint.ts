import { Blueprint } from './blueprint.interface';

/**
 * Senior Care/Assisted Living Blueprint
 */
export const seniorBlueprint: Blueprint = {
  appType: 'senior',
  description: 'Senior care facility with residents, care plans, activities, medications, and family communication',

  coreEntities: ['resident', 'care_plan', 'activity', 'medication', 'staff', 'family'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Residents', path: '/residents', icon: 'Users' },
        { label: 'Care Plans', path: '/care-plans', icon: 'ClipboardList' },
        { label: 'Activities', path: '/activities', icon: 'Calendar' },
        { label: 'Medications', path: '/medications', icon: 'Pill' },
        { label: 'Staff', path: '/staff', icon: 'UserCog' },
      ]}},
      { id: 'senior-stats', component: 'senior-stats', position: 'main' },
      { id: 'today-medications', component: 'medication-schedule-today', entity: 'medication', position: 'main' },
      { id: 'today-activities', component: 'activity-list-today-senior', entity: 'activity', position: 'main' },
    ]},
    { path: '/residents', name: 'Residents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'resident-grid', component: 'resident-grid', entity: 'resident', position: 'main' },
    ]},
    { path: '/residents/:id', name: 'Resident Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'resident-profile', component: 'resident-profile', entity: 'resident', position: 'main' },
      { id: 'resident-care', component: 'resident-care-summary', entity: 'care_plan', position: 'main' },
    ]},
    { path: '/care-plans', name: 'Care Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'care-plan-table', component: 'care-plan-table', entity: 'care_plan', position: 'main' },
    ]},
    { path: '/care-plans/:id', name: 'Care Plan Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'care-plan-detail', component: 'care-plan-detail', entity: 'care_plan', position: 'main' },
    ]},
    { path: '/activities', name: 'Activities', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'activity-calendar', component: 'activity-calendar-senior', entity: 'activity', position: 'main' },
    ]},
    { path: '/medications', name: 'Medications', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'medication-table', component: 'medication-table-senior', entity: 'medication', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-table', component: 'staff-table-senior', entity: 'staff', position: 'main' },
    ]},
    { path: '/family-portal', name: 'Family Portal', layout: 'single-column', requiresAuth: true, sections: [
      { id: 'family-portal', component: 'family-portal-senior', entity: 'resident', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/residents', entity: 'resident', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/residents', entity: 'resident', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/care-plans', entity: 'care_plan', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/care-plans', entity: 'care_plan', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/activities', entity: 'activity', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/medications', entity: 'medication', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    resident: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'room_number', type: 'string' },
        { name: 'admission_date', type: 'date' },
        { name: 'medical_conditions', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'mobility_status', type: 'enum' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'photo', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasOne', target: 'care_plan' },
        { type: 'hasMany', target: 'medication' },
        { type: 'hasMany', target: 'family' },
      ],
    },
    care_plan: {
      defaultFields: [
        { name: 'effective_date', type: 'date', required: true },
        { name: 'review_date', type: 'date' },
        { name: 'care_level', type: 'enum', required: true },
        { name: 'daily_care', type: 'json' },
        { name: 'therapy_needs', type: 'json' },
        { name: 'social_activities', type: 'json' },
        { name: 'goals', type: 'text' },
        { name: 'special_instructions', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'resident' }],
    },
    activity: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'time', type: 'string' },
        { name: 'duration_minutes', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'max_participants', type: 'integer' },
        { name: 'staff_required', type: 'integer' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [],
    },
    medication: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'dosage', type: 'string', required: true },
        { name: 'frequency', type: 'enum', required: true },
        { name: 'route', type: 'enum' },
        { name: 'times', type: 'json' },
        { name: 'prescriber', type: 'string' },
        { name: 'pharmacy', type: 'string' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'instructions', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'resident' }],
    },
    staff: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'department', type: 'string' },
        { name: 'hire_date', type: 'date' },
        { name: 'certifications', type: 'json' },
        { name: 'shift', type: 'enum' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [],
    },
    family: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'relationship', type: 'enum', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'is_primary_contact', type: 'boolean' },
        { name: 'is_emergency_contact', type: 'boolean' },
        { name: 'visit_schedule', type: 'json' },
        { name: 'portal_access', type: 'boolean' },
      ],
      relationships: [{ type: 'belongsTo', target: 'resident' }],
    },
  },
};

export default seniorBlueprint;
