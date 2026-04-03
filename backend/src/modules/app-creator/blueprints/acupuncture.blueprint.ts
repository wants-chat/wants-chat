import { Blueprint } from './blueprint.interface';

/**
 * Acupuncture / Traditional Chinese Medicine Clinic Blueprint
 */
export const acupunctureBlueprint: Blueprint = {
  appType: 'acupuncture',
  description: 'Acupuncture clinic app with patients, treatment sessions, herbal prescriptions, and wellness tracking',

  coreEntities: ['patient', 'appointment', 'treatment_session', 'herbal_prescription', 'practitioner', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Treatments', path: '/treatments', icon: 'Activity' },
        { label: 'Herbal Rx', path: '/prescriptions', icon: 'Leaf' },
        { label: 'Practitioners', path: '/practitioners', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar', entity: 'appointment', position: 'main' },
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
    { path: '/prescriptions', name: 'Herbal Prescriptions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'prescription-list', component: 'data-table', entity: 'herbal_prescription', position: 'main' },
    ]},
    { path: '/practitioners', name: 'Practitioners', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'practitioner-grid', component: 'doctor-grid', entity: 'practitioner', position: 'main' },
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
    { method: 'GET', path: '/treatments', entity: 'treatment_session', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/treatments', entity: 'treatment_session', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/prescriptions', entity: 'herbal_prescription', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/practitioners', entity: 'practitioner', operation: 'list' },
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
        { name: 'chief_complaint', type: 'text' },
        { name: 'tcm_diagnosis', type: 'json' },
        { name: 'constitution_type', type: 'enum' },
        { name: 'pulse_diagnosis', type: 'json' },
        { name: 'tongue_diagnosis', type: 'json' },
        { name: 'medical_history', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'medications', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'treatment_session' },
        { type: 'hasMany', target: 'herbal_prescription' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    treatment_session: {
      defaultFields: [
        { name: 'session_date', type: 'datetime', required: true },
        { name: 'treatment_type', type: 'enum', required: true },
        { name: 'points_used', type: 'json' },
        { name: 'needle_retention_time', type: 'integer' },
        { name: 'moxa_used', type: 'boolean' },
        { name: 'cupping_used', type: 'boolean' },
        { name: 'gua_sha_used', type: 'boolean' },
        { name: 'patient_response', type: 'text' },
        { name: 'pulse_before', type: 'json' },
        { name: 'pulse_after', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'recommendations', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'practitioner' },
        { type: 'belongsTo', target: 'appointment' },
      ],
    },
    herbal_prescription: {
      defaultFields: [
        { name: 'prescription_date', type: 'date', required: true },
        { name: 'formula_name', type: 'string' },
        { name: 'herbs', type: 'json', required: true },
        { name: 'dosage_instructions', type: 'text', required: true },
        { name: 'duration_days', type: 'integer' },
        { name: 'form', type: 'enum' },
        { name: 'cautions', type: 'text' },
        { name: 'dietary_advice', type: 'text' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'practitioner' },
      ],
    },
    practitioner: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'credentials', type: 'json' },
        { name: 'license_number', type: 'string' },
        { name: 'specializations', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
  },
};

export default acupunctureBlueprint;
