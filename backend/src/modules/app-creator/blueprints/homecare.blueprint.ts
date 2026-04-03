import { Blueprint } from './blueprint.interface';

/**
 * Home Care / Home Health Agency Blueprint
 */
export const homecareBlueprint: Blueprint = {
  appType: 'homecare',
  description: 'Home care agency app with patients, caregivers, visit scheduling, and care plans',

  coreEntities: ['patient', 'caregiver', 'visit', 'care_plan', 'task', 'medication', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Schedule', path: '/schedule', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Caregivers', path: '/caregivers', icon: 'UserCheck' },
        { label: 'Visits', path: '/visits', icon: 'MapPin' },
        { label: 'Care Plans', path: '/care-plans', icon: 'ClipboardList' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'home-care-stats', component: 'home-care-stats', position: 'main' },
      { id: 'visit-schedule-map', component: 'visit-schedule-map', entity: 'visit', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'visit-calendar', component: 'appointment-calendar', entity: 'visit', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-filters', component: 'patient-filters', entity: 'patient', position: 'main' },
      { id: 'patient-table', component: 'data-table', entity: 'patient', position: 'main' },
    ]},
    { path: '/patients/:id', name: 'Patient Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-profile', component: 'patient-profile', entity: 'patient', position: 'main' },
      { id: 'care-plan', component: 'data-list', entity: 'care_plan', position: 'main' },
      { id: 'visit-history', component: 'data-list', entity: 'visit', position: 'main' },
    ]},
    { path: '/caregivers', name: 'Caregivers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'caregiver-grid', component: 'staff-grid', entity: 'caregiver', position: 'main' },
    ]},
    { path: '/caregivers/:id', name: 'Caregiver Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'caregiver-assignment', component: 'caregiver-assignment', entity: 'caregiver', position: 'main' },
    ]},
    { path: '/visits', name: 'Visits', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'visit-list', component: 'data-table', entity: 'visit', position: 'main' },
    ]},
    { path: '/care-plans', name: 'Care Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'care-plan-list', component: 'data-table', entity: 'care_plan', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'stats-cards', position: 'main' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/visits', entity: 'visit', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/visits', entity: 'visit', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id', entity: 'patient', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/caregivers', entity: 'caregiver', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/caregivers/:id', entity: 'caregiver', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/caregivers', entity: 'caregiver', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/care-plans', entity: 'care_plan', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/care-plans', entity: 'care_plan', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    patient: {
      defaultFields: [
        { name: 'patient_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'address', type: 'json', required: true },
        { name: 'insurance', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'primary_diagnosis', type: 'text' },
        { name: 'medical_conditions', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'mobility_status', type: 'enum' },
        { name: 'cognitive_status', type: 'enum' },
        { name: 'special_needs', type: 'json' },
        { name: 'physician', type: 'json' },
        { name: 'admission_date', type: 'date' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'visit' },
        { type: 'hasMany', target: 'care_plan' },
        { type: 'hasMany', target: 'medication' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    caregiver: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'role', type: 'enum', required: true },
        { name: 'certifications', type: 'json' },
        { name: 'license_number', type: 'string' },
        { name: 'specializations', type: 'json' },
        { name: 'languages', type: 'json' },
        { name: 'availability', type: 'json' },
        { name: 'max_patients', type: 'integer' },
        { name: 'service_area', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'visit' },
      ],
    },
    visit: {
      defaultFields: [
        { name: 'visit_date', type: 'date', required: true },
        { name: 'scheduled_start', type: 'datetime', required: true },
        { name: 'scheduled_end', type: 'datetime', required: true },
        { name: 'actual_start', type: 'datetime' },
        { name: 'actual_end', type: 'datetime' },
        { name: 'visit_type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'tasks_completed', type: 'json' },
        { name: 'vitals', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'patient_condition', type: 'text' },
        { name: 'concerns', type: 'text' },
        { name: 'mileage', type: 'decimal' },
        { name: 'signature', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'caregiver' },
        { type: 'hasMany', target: 'task' },
      ],
    },
    care_plan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'frequency', type: 'json', required: true },
        { name: 'goals', type: 'json' },
        { name: 'services', type: 'json', required: true },
        { name: 'medications', type: 'json' },
        { name: 'dietary_requirements', type: 'json' },
        { name: 'activity_restrictions', type: 'json' },
        { name: 'physician_orders', type: 'text' },
        { name: 'status', type: 'enum' },
        { name: 'review_date', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
    task: {
      defaultFields: [
        { name: 'task_name', type: 'string', required: true },
        { name: 'task_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'scheduled_time', type: 'datetime' },
        { name: 'completed_time', type: 'datetime' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'visit' },
      ],
    },
    medication: {
      defaultFields: [
        { name: 'medication_name', type: 'string', required: true },
        { name: 'dosage', type: 'string', required: true },
        { name: 'frequency', type: 'string', required: true },
        { name: 'route', type: 'enum' },
        { name: 'prescriber', type: 'string' },
        { name: 'pharmacy', type: 'json' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'instructions', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
  },
};

export default homecareBlueprint;
