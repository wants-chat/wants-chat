import { Blueprint } from './blueprint.interface';

/**
 * Chiropractor/Chiropractic Clinic Blueprint
 */
export const chiropractorBlueprint: Blueprint = {
  appType: 'chiropractor',
  description: 'Chiropractic clinic app with patients, spine assessments, adjustments, and billing',

  coreEntities: ['patient', 'appointment', 'adjustment', 'chiropractor', 'spine_assessment', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Assessments', path: '/assessments', icon: 'Clipboard' },
        { label: 'Chiropractors', path: '/chiropractors', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'chiropractor-stats', component: 'chiropractor-stats', position: 'main' },
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
      { id: 'spine-assessment', component: 'spine-assessment', entity: 'spine_assessment', position: 'main' },
      { id: 'adjustment-history', component: 'adjustment-history', entity: 'adjustment', position: 'main' },
    ]},
    { path: '/assessments', name: 'Spine Assessments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'assessment-list', component: 'data-table', entity: 'spine_assessment', position: 'main' },
    ]},
    { path: '/chiropractors', name: 'Chiropractors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'chiropractor-grid', component: 'doctor-grid', entity: 'chiropractor', position: 'main' },
    ]},
    { path: '/chiropractors/:id', name: 'Chiropractor Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'chiropractor-profile', component: 'doctor-profile', entity: 'chiropractor', position: 'main' },
      { id: 'chiropractor-schedule', component: 'doctor-schedule', entity: 'appointment', position: 'main' },
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
    { method: 'GET', path: '/assessments', entity: 'spine_assessment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/assessments', entity: 'spine_assessment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/adjustments', entity: 'adjustment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/adjustments', entity: 'adjustment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/chiropractors', entity: 'chiropractor', operation: 'list' },
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
        { name: 'occupation', type: 'string' },
        { name: 'chief_complaint', type: 'text' },
        { name: 'medical_history', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'spine_assessment' },
        { type: 'hasMany', target: 'adjustment' },
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
        { type: 'belongsTo', target: 'chiropractor' },
      ],
    },
    spine_assessment: {
      defaultFields: [
        { name: 'assessment_date', type: 'date', required: true },
        { name: 'posture_analysis', type: 'json' },
        { name: 'range_of_motion', type: 'json' },
        { name: 'palpation_findings', type: 'json' },
        { name: 'neurological_tests', type: 'json' },
        { name: 'x_ray_findings', type: 'text' },
        { name: 'subluxations', type: 'json' },
        { name: 'pain_scale', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'treatment_plan', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'chiropractor' },
      ],
    },
    adjustment: {
      defaultFields: [
        { name: 'date', type: 'datetime', required: true },
        { name: 'technique', type: 'enum', required: true },
        { name: 'regions_treated', type: 'json', required: true },
        { name: 'adjustments_made', type: 'json' },
        { name: 'patient_response', type: 'text' },
        { name: 'recommendations', type: 'text' },
        { name: 'next_visit_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'chiropractor' },
        { type: 'belongsTo', target: 'appointment' },
      ],
    },
    chiropractor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'specialization', type: 'enum' },
        { name: 'license_number', type: 'string' },
        { name: 'techniques', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
  },
};

export default chiropractorBlueprint;
