import { Blueprint } from './blueprint.interface';

/**
 * Urgent Care / Walk-in Clinic Blueprint
 */
export const urgentcareBlueprint: Blueprint = {
  appType: 'urgentcare',
  description: 'Urgent care clinic app with patient check-in, triage, treatments, and wait time tracking',

  coreEntities: ['patient', 'visit', 'triage', 'treatment', 'physician', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Check-In Queue', path: '/queue', icon: 'ListOrdered' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Visits', path: '/visits', icon: 'ClipboardList' },
        { label: 'Physicians', path: '/physicians', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'patient-queue', component: 'data-list', entity: 'visit', position: 'main' },
    ]},
    { path: '/queue', name: 'Check-In Queue', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'queue-list', component: 'data-table', entity: 'visit', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-filters', component: 'patient-filters', entity: 'patient', position: 'main' },
      { id: 'patient-table', component: 'data-table', entity: 'patient', position: 'main' },
    ]},
    { path: '/patients/:id', name: 'Patient Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-profile', component: 'patient-profile', entity: 'patient', position: 'main' },
      { id: 'visit-history', component: 'data-list', entity: 'visit', position: 'main' },
    ]},
    { path: '/visits', name: 'Visits', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'visit-filters', component: 'filter-form', entity: 'visit', position: 'main' },
      { id: 'visit-table', component: 'data-table', entity: 'visit', position: 'main' },
    ]},
    { path: '/visits/:id', name: 'Visit Details', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'visit-detail', component: 'detail-view', entity: 'visit', position: 'main' },
    ]},
    { path: '/physicians', name: 'Physicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'physician-grid', component: 'doctor-grid', entity: 'physician', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'stats-cards', position: 'main' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/checkin', name: 'Patient Check-In', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'checkin-form', component: 'create-form', entity: 'visit', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/visits', entity: 'visit', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/visits', entity: 'visit', operation: 'create' },
    { method: 'GET', path: '/visits/:id', entity: 'visit', operation: 'get', requiresAuth: true },
    { method: 'PUT', path: '/visits/:id', entity: 'visit', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id', entity: 'patient', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/physicians', entity: 'physician', operation: 'list', requiresAuth: true },
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
        { name: 'allergies', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'visit' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    visit: {
      defaultFields: [
        { name: 'check_in_time', type: 'datetime', required: true },
        { name: 'chief_complaint', type: 'text', required: true },
        { name: 'symptoms', type: 'json' },
        { name: 'symptom_duration', type: 'string' },
        { name: 'triage_level', type: 'enum' },
        { name: 'vital_signs', type: 'json' },
        { name: 'diagnosis', type: 'text' },
        { name: 'treatment_notes', type: 'text' },
        { name: 'prescriptions', type: 'json' },
        { name: 'follow_up', type: 'text' },
        { name: 'discharge_time', type: 'datetime' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'physician' },
        { type: 'hasOne', target: 'triage' },
        { type: 'hasMany', target: 'treatment' },
      ],
    },
    triage: {
      defaultFields: [
        { name: 'triage_time', type: 'datetime', required: true },
        { name: 'level', type: 'enum', required: true },
        { name: 'vital_signs', type: 'json', required: true },
        { name: 'pain_level', type: 'integer' },
        { name: 'symptoms', type: 'json' },
        { name: 'nurse_notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'visit' },
      ],
    },
    treatment: {
      defaultFields: [
        { name: 'treatment_time', type: 'datetime', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'medications_given', type: 'json' },
        { name: 'procedures', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'visit' },
        { type: 'belongsTo', target: 'physician' },
      ],
    },
    physician: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'specialty', type: 'enum' },
        { name: 'license_number', type: 'string' },
        { name: 'npi_number', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'visit' }],
    },
  },
};

export default urgentcareBlueprint;
