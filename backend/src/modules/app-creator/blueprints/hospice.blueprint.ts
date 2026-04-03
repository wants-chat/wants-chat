import { Blueprint } from './blueprint.interface';

/**
 * Hospice Care Blueprint
 */
export const hospiceBlueprint: Blueprint = {
  appType: 'hospice',
  description: 'Hospice care app with patients, care teams, visit scheduling, and family communication',

  coreEntities: ['patient', 'caregiver', 'visit', 'care_plan', 'family_member', 'medication', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Schedule', path: '/schedule', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Care Team', path: '/team', icon: 'UserCheck' },
        { label: 'Visits', path: '/visits', icon: 'MapPin' },
        { label: 'Family Portal', path: '/family', icon: 'Heart' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'home-care-stats', position: 'main' },
      { id: 'today-visits', component: 'visit-schedule-map', entity: 'visit', position: 'main' },
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
    ]},
    { path: '/team', name: 'Care Team', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'team-grid', component: 'caregiver-assignment', entity: 'caregiver', position: 'main' },
    ]},
    { path: '/visits', name: 'Visits', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'visit-list', component: 'data-table', entity: 'visit', position: 'main' },
    ]},
    { path: '/family', name: 'Family Portal', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'family-list', component: 'data-table', entity: 'family_member', position: 'main' },
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
    { method: 'GET', path: '/care-plans', entity: 'care_plan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    patient: {
      defaultFields: [
        { name: 'patient_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum' },
        { name: 'address', type: 'json', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'insurance', type: 'json' },
        { name: 'primary_diagnosis', type: 'text', required: true },
        { name: 'prognosis', type: 'text' },
        { name: 'admission_date', type: 'date', required: true },
        { name: 'attending_physician', type: 'json' },
        { name: 'advance_directives', type: 'json' },
        { name: 'dnr_status', type: 'boolean' },
        { name: 'comfort_level', type: 'enum' },
        { name: 'allergies', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'special_needs', type: 'json' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'visit' },
        { type: 'hasMany', target: 'care_plan' },
        { type: 'hasMany', target: 'family_member' },
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
        { name: 'role', type: 'enum', required: true },
        { name: 'credentials', type: 'json' },
        { name: 'license_number', type: 'string' },
        { name: 'specializations', type: 'json' },
        { name: 'service_area', type: 'json' },
        { name: 'schedule', type: 'json' },
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
        { name: 'scheduled_time', type: 'datetime', required: true },
        { name: 'actual_start', type: 'datetime' },
        { name: 'actual_end', type: 'datetime' },
        { name: 'visit_type', type: 'enum', required: true },
        { name: 'pain_assessment', type: 'json' },
        { name: 'symptom_management', type: 'json' },
        { name: 'vital_signs', type: 'json' },
        { name: 'medications_given', type: 'json' },
        { name: 'patient_condition', type: 'text' },
        { name: 'family_communication', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'caregiver' },
      ],
    },
    care_plan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'goals_of_care', type: 'json', required: true },
        { name: 'symptom_management', type: 'json' },
        { name: 'medication_plan', type: 'json' },
        { name: 'visit_frequency', type: 'json' },
        { name: 'spiritual_support', type: 'text' },
        { name: 'family_support', type: 'text' },
        { name: 'bereavement_plan', type: 'text' },
        { name: 'status', type: 'enum' },
        { name: 'review_date', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
    family_member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'relationship', type: 'enum', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'is_primary_contact', type: 'boolean' },
        { name: 'is_healthcare_proxy', type: 'boolean' },
        { name: 'communication_preferences', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
  },
};

export default hospiceBlueprint;
