import { Blueprint } from './blueprint.interface';

/**
 * Dialysis Center Blueprint
 */
export const dialysisBlueprint: Blueprint = {
  appType: 'dialysis',
  description: 'Dialysis center app with patients, treatment schedules, machine management, and patient monitoring',

  coreEntities: ['patient', 'treatment_session', 'machine', 'nephrologist', 'nurse', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Schedule', path: '/schedule', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Treatments', path: '/treatments', icon: 'Activity' },
        { label: 'Machines', path: '/machines', icon: 'Cpu' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-schedule', component: 'appointment-list', entity: 'treatment_session', position: 'main' },
    ]},
    { path: '/schedule', name: 'Treatment Schedule', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'treatment-calendar', component: 'appointment-calendar', entity: 'treatment_session', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-filters', component: 'patient-filters', entity: 'patient', position: 'main' },
      { id: 'patient-table', component: 'data-table', entity: 'patient', position: 'main' },
    ]},
    { path: '/patients/:id', name: 'Patient Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-profile', component: 'patient-profile', entity: 'patient', position: 'main' },
      { id: 'treatment-history', component: 'data-list', entity: 'treatment_session', position: 'main' },
    ]},
    { path: '/treatments', name: 'Treatments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'treatment-list', component: 'data-table', entity: 'treatment_session', position: 'main' },
    ]},
    { path: '/machines', name: 'Machines', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'machine-grid', component: 'data-grid', entity: 'machine', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'nurse', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'stats-cards', position: 'main' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/treatments', entity: 'treatment_session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/treatments', entity: 'treatment_session', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id', entity: 'patient', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/machines', entity: 'machine', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'nurse', operation: 'list', requiresAuth: true },
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
        { name: 'address', type: 'json' },
        { name: 'insurance', type: 'json' },
        { name: 'blood_type', type: 'enum' },
        { name: 'dry_weight', type: 'decimal' },
        { name: 'access_type', type: 'enum' },
        { name: 'access_location', type: 'string' },
        { name: 'dialysis_schedule', type: 'json' },
        { name: 'comorbidities', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'nephrologist', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'treatment_session' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    treatment_session: {
      defaultFields: [
        { name: 'session_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'pre_weight', type: 'decimal' },
        { name: 'post_weight', type: 'decimal' },
        { name: 'uf_goal', type: 'decimal' },
        { name: 'uf_achieved', type: 'decimal' },
        { name: 'pre_bp', type: 'json' },
        { name: 'post_bp', type: 'json' },
        { name: 'pre_pulse', type: 'integer' },
        { name: 'post_pulse', type: 'integer' },
        { name: 'temperature', type: 'decimal' },
        { name: 'kt_v', type: 'decimal' },
        { name: 'blood_flow_rate', type: 'integer' },
        { name: 'dialysate_flow_rate', type: 'integer' },
        { name: 'access_assessment', type: 'text' },
        { name: 'complications', type: 'json' },
        { name: 'medications_given', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'machine' },
        { type: 'belongsTo', target: 'nurse' },
      ],
    },
    machine: {
      defaultFields: [
        { name: 'machine_id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'manufacturer', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'station_number', type: 'integer' },
        { name: 'installation_date', type: 'date' },
        { name: 'last_maintenance', type: 'date' },
        { name: 'next_maintenance', type: 'date' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'treatment_session' },
      ],
    },
    nurse: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'license_number', type: 'string' },
        { name: 'certifications', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'treatment_session' },
      ],
    },
  },
};

export default dialysisBlueprint;
