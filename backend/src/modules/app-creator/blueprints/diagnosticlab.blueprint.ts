import { Blueprint } from './blueprint.interface';

/**
 * Diagnostic Lab / Medical Laboratory Blueprint
 */
export const diagnosticlabBlueprint: Blueprint = {
  appType: 'diagnosticlab',
  description: 'Diagnostic laboratory app with patients, test orders, sample tracking, results, and billing',

  coreEntities: ['patient', 'test_order', 'sample', 'test', 'result', 'lab_technician', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Test Orders', path: '/orders', icon: 'ClipboardList' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Samples', path: '/samples', icon: 'TestTube' },
        { label: 'Results', path: '/results', icon: 'FileText' },
        { label: 'Tests Catalog', path: '/tests', icon: 'Beaker' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'lab-stats', component: 'lab-stats', position: 'main' },
      { id: 'pending-orders', component: 'data-list', entity: 'test_order', position: 'main' },
    ]},
    { path: '/orders', name: 'Test Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-filters', component: 'filter-form', entity: 'test_order', position: 'main' },
      { id: 'order-table', component: 'data-table', entity: 'test_order', position: 'main' },
    ]},
    { path: '/orders/new', name: 'New Test Order', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'test-order-form', component: 'test-order-form', entity: 'test_order', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-filters', component: 'patient-filters', entity: 'patient', position: 'main' },
      { id: 'patient-table', component: 'data-table', entity: 'patient', position: 'main' },
    ]},
    { path: '/patients/:id', name: 'Patient Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-profile', component: 'patient-profile', entity: 'patient', position: 'main' },
      { id: 'lab-results', component: 'lab-results', entity: 'result', position: 'main' },
    ]},
    { path: '/samples', name: 'Samples', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sample-filters', component: 'filter-form', entity: 'sample', position: 'main' },
      { id: 'sample-table', component: 'data-table', entity: 'sample', position: 'main' },
    ]},
    { path: '/results', name: 'Results', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'result-filters', component: 'filter-form', entity: 'result', position: 'main' },
      { id: 'result-table', component: 'data-table', entity: 'result', position: 'main' },
    ]},
    { path: '/tests', name: 'Tests Catalog', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'test-list', component: 'data-table', entity: 'test', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'lab_technician', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'stats-cards', position: 'main' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'test_order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'test_order', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/orders/:id', entity: 'test_order', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/patients/:id', entity: 'patient', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/samples', entity: 'sample', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/samples', entity: 'sample', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/results', entity: 'result', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/results', entity: 'result', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/tests', entity: 'test', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'lab_technician', operation: 'list', requiresAuth: true },
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
        { name: 'allergies', type: 'json' },
        { name: 'medical_history', type: 'json' },
        { name: 'referring_physician', type: 'json' },
      ],
      relationships: [
        { type: 'hasMany', target: 'test_order' },
        { type: 'hasMany', target: 'sample' },
        { type: 'hasMany', target: 'result' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    test_order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'tests_ordered', type: 'json', required: true },
        { name: 'priority', type: 'enum', required: true },
        { name: 'clinical_indication', type: 'text' },
        { name: 'fasting_required', type: 'boolean' },
        { name: 'special_instructions', type: 'text' },
        { name: 'ordering_physician', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'due_date', type: 'datetime' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'hasMany', target: 'sample' },
        { type: 'hasMany', target: 'result' },
      ],
    },
    sample: {
      defaultFields: [
        { name: 'sample_id', type: 'string', required: true },
        { name: 'collection_date', type: 'datetime', required: true },
        { name: 'sample_type', type: 'enum', required: true },
        { name: 'container_type', type: 'string' },
        { name: 'volume', type: 'string' },
        { name: 'collection_site', type: 'string' },
        { name: 'collected_by', type: 'string' },
        { name: 'storage_location', type: 'string' },
        { name: 'temperature', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'rejection_reason', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'test_order' },
      ],
    },
    test: {
      defaultFields: [
        { name: 'test_code', type: 'string', required: true },
        { name: 'test_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'sample_requirements', type: 'json' },
        { name: 'turnaround_time', type: 'string' },
        { name: 'reference_ranges', type: 'json' },
        { name: 'methodology', type: 'string' },
        { name: 'cpt_code', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    result: {
      defaultFields: [
        { name: 'result_date', type: 'datetime', required: true },
        { name: 'test_name', type: 'string', required: true },
        { name: 'value', type: 'string', required: true },
        { name: 'unit', type: 'string' },
        { name: 'reference_range', type: 'string' },
        { name: 'flag', type: 'enum' },
        { name: 'interpretation', type: 'text' },
        { name: 'verified_by', type: 'string' },
        { name: 'verification_date', type: 'datetime' },
        { name: 'status', type: 'enum', required: true },
        { name: 'comments', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
        { type: 'belongsTo', target: 'test_order' },
        { type: 'belongsTo', target: 'sample' },
        { type: 'belongsTo', target: 'lab_technician' },
      ],
    },
    lab_technician: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'certifications', type: 'json' },
        { name: 'license_number', type: 'string' },
        { name: 'specializations', type: 'json' },
        { name: 'department', type: 'string' },
        { name: 'photo_url', type: 'image' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'result' },
      ],
    },
  },
};

export default diagnosticlabBlueprint;
