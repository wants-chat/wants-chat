import { Blueprint } from './blueprint.interface';

/**
 * Dental/Clinic Blueprint
 */
export const dentalBlueprint: Blueprint = {
  appType: 'dental',
  description: 'Dental clinic app with patients, appointments, treatments, and billing',

  coreEntities: ['patient', 'appointment', 'treatment', 'dentist', 'invoice', 'medical_record'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Treatments', path: '/treatments', icon: 'Stethoscope' },
        { label: 'Dentists', path: '/dentists', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'dental-stats', component: 'dental-stats', position: 'main' },
      { id: 'today-appointments', component: 'appointment-list-dental', entity: 'appointment', position: 'main' },
      { id: 'dentist-schedule', component: 'dentist-schedule-overview', entity: 'dentist', position: 'main' },
    ]},
    { path: '/appointments', name: 'Appointments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-calendar', component: 'appointment-calendar-dental', entity: 'appointment', position: 'main' },
    ]},
    { path: '/appointments/new', name: 'New Appointment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appointment-form', component: 'appointment-form-dental', entity: 'appointment', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-filters', component: 'patient-filters', entity: 'patient', position: 'main' },
      { id: 'patient-table', component: 'patient-table-dental', entity: 'patient', position: 'main' },
    ]},
    { path: '/patients/:id', name: 'Patient Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-profile', component: 'patient-profile-dental', entity: 'patient', position: 'main' },
      { id: 'dental-chart', component: 'dental-chart', entity: 'medical_record', position: 'main' },
      { id: 'treatment-history', component: 'treatment-history', entity: 'treatment', position: 'main' },
    ]},
    { path: '/treatments', name: 'Treatments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'treatment-catalog', component: 'treatment-catalog', entity: 'treatment', position: 'main' },
    ]},
    { path: '/dentists', name: 'Dentists', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'dentist-grid', component: 'dentist-grid', entity: 'dentist', position: 'main' },
    ]},
    { path: '/dentists/:id', name: 'Dentist Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'dentist-profile', component: 'dentist-profile', entity: 'dentist', position: 'main' },
      { id: 'dentist-schedule', component: 'dentist-schedule', entity: 'appointment', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'billing-stats-dental', position: 'main' },
      { id: 'invoice-table', component: 'invoice-table-dental', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'online-booking', component: 'online-booking-dental', entity: 'appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create' },
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id', entity: 'patient', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/treatments', entity: 'treatment', operation: 'list' },
    { method: 'GET', path: '/dentists', entity: 'dentist', operation: 'list' },
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
        { name: 'medical_conditions', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'appointment' },
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
        { type: 'belongsTo', target: 'dentist' },
      ],
    },
    treatment: {
      defaultFields: [
        { name: 'code', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'duration', type: 'integer' },
        { name: 'tooth_number', type: 'string' },
        { name: 'surface', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'dentist' },
        { type: 'belongsTo', target: 'appointment' },
      ],
    },
    dentist: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'specialization', type: 'enum' },
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

export default dentalBlueprint;
