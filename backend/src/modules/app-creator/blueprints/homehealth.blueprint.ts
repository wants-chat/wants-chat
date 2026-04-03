import { Blueprint } from './blueprint.interface';

/**
 * Home Health Blueprint
 */
export const homehealthBlueprint: Blueprint = {
  appType: 'homehealth',
  description: 'Home health agency with patients, caregivers, visits, and care plans',

  coreEntities: ['patient', 'caregiver', 'visit', 'careplan', 'medication', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Caregivers', path: '/caregivers', icon: 'UserCheck' },
        { label: 'Visits', path: '/visits', icon: 'Calendar' },
        { label: 'Care Plans', path: '/careplans', icon: 'ClipboardList' },
        { label: 'Medications', path: '/medications', icon: 'Pill' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'todays-visits', component: 'appointment-list', entity: 'visit', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-table', component: 'data-table', entity: 'patient', position: 'main' },
    ]},
    { path: '/caregivers', name: 'Caregivers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'caregiver-grid', component: 'staff-grid', entity: 'caregiver', position: 'main' },
    ]},
    { path: '/visits', name: 'Visits', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'visit-calendar', component: 'appointment-calendar', entity: 'visit', position: 'main' },
    ]},
    { path: '/careplans', name: 'Care Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'careplan-table', component: 'data-table', entity: 'careplan', position: 'main' },
    ]},
    { path: '/medications', name: 'Medications', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'medication-table', component: 'data-table', entity: 'medication', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/caregivers', entity: 'caregiver', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/visits', entity: 'visit', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/visits', entity: 'visit', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/careplans', entity: 'careplan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/medications', entity: 'medication', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    patient: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json', required: true },
        { name: 'emergency_contacts', type: 'json' },
        { name: 'primary_physician', type: 'json' },
        { name: 'medical_conditions', type: 'json' },
        { name: 'insurance_info', type: 'json' },
        { name: 'referral_source', type: 'string' },
        { name: 'admission_date', type: 'date' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'visit' },
        { type: 'hasOne', target: 'careplan' },
      ],
    },
    caregiver: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'languages', type: 'json' },
        { name: 'hire_date', type: 'date' },
        { name: 'availability', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
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
        { name: 'services_provided', type: 'json' },
        { name: 'vitals', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'patient_condition', type: 'text' },
        { name: 'follow_up_needed', type: 'boolean' },
        { name: 'mileage', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'caregiver' },
      ],
    },
    careplan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'review_date', type: 'date' },
        { name: 'diagnosis', type: 'json' },
        { name: 'goals', type: 'json' },
        { name: 'interventions', type: 'json' },
        { name: 'frequency', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'special_instructions', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
    medication: {
      defaultFields: [
        { name: 'medication_name', type: 'string', required: true },
        { name: 'dosage', type: 'string', required: true },
        { name: 'frequency', type: 'string' },
        { name: 'route', type: 'enum' },
        { name: 'prescriber', type: 'string' },
        { name: 'pharmacy', type: 'json' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'refills_remaining', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'service_period', type: 'json' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'insurance_covered', type: 'decimal' },
        { name: 'patient_responsibility', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
  },
};

export default homehealthBlueprint;
