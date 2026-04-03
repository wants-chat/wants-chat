import { Blueprint } from './blueprint.interface';

/**
 * Pediatrics Clinic Blueprint
 */
export const pediatricsBlueprint: Blueprint = {
  appType: 'pediatrics',
  description: 'Pediatric clinic app with patients, growth tracking, vaccinations, and well-child visits',

  coreEntities: ['patient', 'parent', 'appointment', 'growth_record', 'vaccination', 'pediatrician', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Baby' },
        { label: 'Growth Charts', path: '/growth', icon: 'TrendingUp' },
        { label: 'Vaccinations', path: '/vaccinations', icon: 'Syringe' },
        { label: 'Pediatricians', path: '/pediatricians', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'pediatrics-stats', component: 'pediatrics-stats', position: 'main' },
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
      { id: 'growth-chart', component: 'growth-chart', entity: 'growth_record', position: 'main' },
      { id: 'vaccination-schedule', component: 'vaccination-schedule', entity: 'vaccination', position: 'main' },
    ]},
    { path: '/growth', name: 'Growth Charts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'growth-list', component: 'data-table', entity: 'growth_record', position: 'main' },
    ]},
    { path: '/vaccinations', name: 'Vaccinations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vaccination-list', component: 'data-table', entity: 'vaccination', position: 'main' },
    ]},
    { path: '/pediatricians', name: 'Pediatricians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pediatrician-grid', component: 'doctor-grid', entity: 'pediatrician', position: 'main' },
    ]},
    { path: '/pediatricians/:id', name: 'Pediatrician Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pediatrician-profile', component: 'doctor-profile', entity: 'pediatrician', position: 'main' },
      { id: 'pediatrician-schedule', component: 'doctor-schedule', entity: 'appointment', position: 'main' },
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
    { method: 'GET', path: '/growth', entity: 'growth_record', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/growth', entity: 'growth_record', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/vaccinations', entity: 'vaccination', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/vaccinations', entity: 'vaccination', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/pediatricians', entity: 'pediatrician', operation: 'list' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    patient: {
      defaultFields: [
        { name: 'patient_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'gender', type: 'enum', required: true },
        { name: 'birth_weight', type: 'decimal' },
        { name: 'birth_length', type: 'decimal' },
        { name: 'blood_type', type: 'enum' },
        { name: 'allergies', type: 'json' },
        { name: 'chronic_conditions', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'parent' },
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'growth_record' },
        { type: 'hasMany', target: 'vaccination' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    parent: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'relationship', type: 'enum' },
        { name: 'address', type: 'json' },
        { name: 'insurance', type: 'json' },
        { name: 'emergency_contact', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'patient' },
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
        { type: 'belongsTo', target: 'pediatrician' },
      ],
    },
    growth_record: {
      defaultFields: [
        { name: 'measurement_date', type: 'date', required: true },
        { name: 'age_months', type: 'integer', required: true },
        { name: 'weight_kg', type: 'decimal', required: true },
        { name: 'height_cm', type: 'decimal', required: true },
        { name: 'head_circumference_cm', type: 'decimal' },
        { name: 'bmi', type: 'decimal' },
        { name: 'weight_percentile', type: 'decimal' },
        { name: 'height_percentile', type: 'decimal' },
        { name: 'head_percentile', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'pediatrician' },
      ],
    },
    vaccination: {
      defaultFields: [
        { name: 'vaccine_name', type: 'string', required: true },
        { name: 'vaccine_code', type: 'string' },
        { name: 'dose_number', type: 'integer', required: true },
        { name: 'scheduled_date', type: 'date', required: true },
        { name: 'administered_date', type: 'date' },
        { name: 'lot_number', type: 'string' },
        { name: 'manufacturer', type: 'string' },
        { name: 'site', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'reaction', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'pediatrician' },
      ],
    },
    pediatrician: {
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

export default pediatricsBlueprint;
