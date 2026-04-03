import { Blueprint } from './blueprint.interface';

/**
 * Dermatology Clinic Blueprint
 */
export const dermatologyBlueprint: Blueprint = {
  appType: 'dermatology',
  description: 'Dermatology clinic app with patients, skin conditions, biopsies, treatments, and billing',

  coreEntities: ['patient', 'appointment', 'skin_condition', 'biopsy', 'treatment', 'dermatologist', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Conditions', path: '/conditions', icon: 'Activity' },
        { label: 'Biopsies', path: '/biopsies', icon: 'Microscope' },
        { label: 'Dermatologists', path: '/dermatologists', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'dermatology-stats', component: 'dermatology-stats', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments/new', name: 'New Appointment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-form', component: 'appointment-form', entity: 'appointment', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-filters', component: 'patient-filters', entity: 'patient', position: 'main' },
      { id: 'patient-table', component: 'data-table', entity: 'patient', position: 'main' },
    ]},
    { path: '/patients/:id', name: 'Patient Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-profile', component: 'patient-profile', entity: 'patient', position: 'main' },
      { id: 'skin-condition-tracker', component: 'skin-condition-tracker', entity: 'skin_condition', position: 'main' },
      { id: 'treatment-history', component: 'treatment-history', entity: 'treatment', position: 'main' },
    ]},
    { path: '/conditions', name: 'Skin Conditions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'condition-list', component: 'data-table', entity: 'skin_condition', position: 'main' },
    ]},
    { path: '/biopsies', name: 'Biopsies', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'biopsy-tracker', component: 'biopsy-tracker', entity: 'biopsy', position: 'main' },
    ]},
    { path: '/dermatologists', name: 'Dermatologists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'dermatologist-grid', component: 'doctor-grid', entity: 'dermatologist', position: 'main' },
    ]},
    { path: '/dermatologists/:id', name: 'Dermatologist Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'dermatologist-profile', component: 'doctor-profile', entity: 'dermatologist', position: 'main' },
      { id: 'dermatologist-schedule', component: 'doctor-schedule', entity: 'appointment', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'stats-cards', position: 'main' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'online-booking', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id', entity: 'patient', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/conditions', entity: 'skin_condition', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/conditions', entity: 'skin_condition', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/biopsies', entity: 'biopsy', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/biopsies', entity: 'biopsy', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/treatments', entity: 'treatment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/dermatologists', entity: 'dermatologist', operation: 'list' },
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
        { name: 'skin_type', type: 'enum' },
        { name: 'allergies', type: 'json' },
        { name: 'current_medications', type: 'json' },
        { name: 'medical_history', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'skin_condition' },
        { type: 'hasMany', target: 'biopsy' },
        { type: 'hasMany', target: 'treatment' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    appointment: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'reason', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'dermatologist' },
      ],
    },
    skin_condition: {
      defaultFields: [
        { name: 'diagnosis_date', type: 'date', required: true },
        { name: 'condition_type', type: 'enum', required: true },
        { name: 'icd_code', type: 'string' },
        { name: 'location', type: 'json' },
        { name: 'severity', type: 'enum' },
        { name: 'symptoms', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'dermatologist' },
        { type: 'hasMany', target: 'treatment' },
      ],
    },
    biopsy: {
      defaultFields: [
        { name: 'biopsy_date', type: 'date', required: true },
        { name: 'biopsy_type', type: 'enum', required: true },
        { name: 'site_location', type: 'string', required: true },
        { name: 'clinical_indication', type: 'text' },
        { name: 'specimen_id', type: 'string' },
        { name: 'lab_name', type: 'string' },
        { name: 'pathology_report', type: 'text' },
        { name: 'diagnosis', type: 'text' },
        { name: 'result_date', type: 'date' },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'dermatologist' },
        { type: 'belongsTo', target: 'skin_condition' },
      ],
    },
    treatment: {
      defaultFields: [
        { name: 'treatment_date', type: 'date', required: true },
        { name: 'treatment_type', type: 'enum', required: true },
        { name: 'procedure_name', type: 'string' },
        { name: 'medications', type: 'json' },
        { name: 'instructions', type: 'text' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'outcome', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'dermatologist' },
        { type: 'belongsTo', target: 'skin_condition' },
      ],
    },
    dermatologist: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'specialization', type: 'enum' },
        { name: 'license_number', type: 'string' },
        { name: 'board_certifications', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
  },
};

export default dermatologyBlueprint;
