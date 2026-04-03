import { Blueprint } from './blueprint.interface';

/**
 * Orthodontics Clinic Blueprint
 */
export const orthodonticsBlueprint: Blueprint = {
  appType: 'orthodontics',
  description: 'Orthodontics clinic app with patients, braces/aligners tracking, treatment progress, and billing',

  coreEntities: ['patient', 'appointment', 'treatment_plan', 'progress_record', 'orthodontist', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Treatment Plans', path: '/treatments', icon: 'ClipboardList' },
        { label: 'Orthodontists', path: '/orthodontists', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'dental-stats', position: 'main' },
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
      { id: 'treatment-progress', component: 'progress-tracker', entity: 'progress_record', position: 'main' },
    ]},
    { path: '/treatments', name: 'Treatment Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'treatment-list', component: 'data-table', entity: 'treatment_plan', position: 'main' },
    ]},
    { path: '/orthodontists', name: 'Orthodontists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'orthodontist-grid', component: 'doctor-grid', entity: 'orthodontist', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'stats-cards', position: 'main' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book Consultation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'online-booking', component: 'booking-wizard', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id', entity: 'patient', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/treatments', entity: 'treatment_plan', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/treatments', entity: 'treatment_plan', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/orthodontists', entity: 'orthodontist', operation: 'list' },
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
        { name: 'parent_guardian', type: 'json' },
        { name: 'referring_dentist', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'treatment_plan' },
        { type: 'hasMany', target: 'progress_record' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    treatment_plan: {
      defaultFields: [
        { name: 'treatment_type', type: 'enum', required: true },
        { name: 'appliance_type', type: 'enum' },
        { name: 'estimated_duration', type: 'integer' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'estimated_end_date', type: 'date' },
        { name: 'goals', type: 'json' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'orthodontist' },
        { type: 'hasMany', target: 'progress_record' },
      ],
    },
    progress_record: {
      defaultFields: [
        { name: 'record_date', type: 'date', required: true },
        { name: 'photos', type: 'json' },
        { name: 'measurements', type: 'json' },
        { name: 'adjustments_made', type: 'text' },
        { name: 'next_steps', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'treatment_plan' },
        { type: 'belongsTo', target: 'orthodontist' },
      ],
    },
    orthodontist: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'appointment' }],
    },
  },
};

export default orthodonticsBlueprint;
