import { Blueprint } from './blueprint.interface';

/**
 * IVF / Fertility Clinic Blueprint
 */
export const ivfclinicBlueprint: Blueprint = {
  appType: 'ivfclinic',
  description: 'IVF fertility clinic app with patients, treatment cycles, embryo tracking, and outcome monitoring',

  coreEntities: ['patient', 'partner', 'appointment', 'treatment_cycle', 'embryo', 'physician', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Appointments', path: '/appointments', icon: 'Calendar' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Cycles', path: '/cycles', icon: 'RefreshCw' },
        { label: 'Embryo Lab', path: '/embryos', icon: 'Microscope' },
        { label: 'Physicians', path: '/physicians', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-cycles', component: 'data-list', entity: 'treatment_cycle', position: 'main' },
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
      { id: 'cycle-history', component: 'data-list', entity: 'treatment_cycle', position: 'main' },
    ]},
    { path: '/cycles', name: 'Treatment Cycles', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'cycle-filters', component: 'filter-form', entity: 'treatment_cycle', position: 'main' },
      { id: 'cycle-table', component: 'data-table', entity: 'treatment_cycle', position: 'main' },
    ]},
    { path: '/cycles/:id', name: 'Cycle Details', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'cycle-detail', component: 'detail-view', entity: 'treatment_cycle', position: 'main' },
      { id: 'embryo-list', component: 'data-list', entity: 'embryo', position: 'main' },
    ]},
    { path: '/embryos', name: 'Embryo Lab', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'embryo-table', component: 'data-table', entity: 'embryo', position: 'main' },
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
  ],

  endpoints: [
    { method: 'GET', path: '/appointments', entity: 'appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/appointments', entity: 'appointment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id', entity: 'patient', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/cycles', entity: 'treatment_cycle', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/cycles', entity: 'treatment_cycle', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/embryos', entity: 'embryo', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/physicians', entity: 'physician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    patient: {
      defaultFields: [
        { name: 'patient_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'address', type: 'json' },
        { name: 'insurance', type: 'json' },
        { name: 'amh_level', type: 'decimal' },
        { name: 'fsh_level', type: 'decimal' },
        { name: 'antral_follicle_count', type: 'integer' },
        { name: 'diagnosis', type: 'json' },
        { name: 'previous_treatments', type: 'json' },
        { name: 'medical_history', type: 'json' },
        { name: 'allergies', type: 'json' },
      ],
      relationships: [
        { type: 'hasOne', target: 'partner' },
        { type: 'hasMany', target: 'appointment' },
        { type: 'hasMany', target: 'treatment_cycle' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    partner: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'sperm_analysis', type: 'json' },
        { name: 'medical_history', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
    treatment_cycle: {
      defaultFields: [
        { name: 'cycle_number', type: 'integer', required: true },
        { name: 'cycle_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'stimulation_protocol', type: 'json' },
        { name: 'medications', type: 'json' },
        { name: 'monitoring_schedule', type: 'json' },
        { name: 'retrieval_date', type: 'date' },
        { name: 'eggs_retrieved', type: 'integer' },
        { name: 'eggs_fertilized', type: 'integer' },
        { name: 'transfer_date', type: 'date' },
        { name: 'embryos_transferred', type: 'integer' },
        { name: 'beta_hcg_date', type: 'date' },
        { name: 'beta_hcg_result', type: 'decimal' },
        { name: 'outcome', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'physician' },
        { type: 'hasMany', target: 'embryo' },
      ],
    },
    embryo: {
      defaultFields: [
        { name: 'embryo_id', type: 'string', required: true },
        { name: 'creation_date', type: 'date', required: true },
        { name: 'day', type: 'integer', required: true },
        { name: 'grade', type: 'string' },
        { name: 'cell_count', type: 'integer' },
        { name: 'fragmentation', type: 'enum' },
        { name: 'blastocyst_grade', type: 'string' },
        { name: 'pgt_result', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'freeze_date', type: 'date' },
        { name: 'thaw_date', type: 'date' },
        { name: 'storage_location', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'treatment_cycle' },
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
        { name: 'board_certifications', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'treatment_cycle' }],
    },
  },
};

export default ivfclinicBlueprint;
