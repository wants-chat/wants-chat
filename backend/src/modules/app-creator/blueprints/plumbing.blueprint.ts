import { Blueprint } from './blueprint.interface';

/**
 * Plumbing Company Blueprint
 */
export const plumbingBlueprint: Blueprint = {
  appType: 'plumbing',
  description: 'Plumbing company with service calls, estimates, jobs, customers, and technicians',

  coreEntities: ['service_call', 'estimate', 'job', 'customer', 'technician', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Service Calls', path: '/service-calls', icon: 'Phone' },
        { label: 'Estimates', path: '/estimates', icon: 'FileText' },
        { label: 'Jobs', path: '/jobs', icon: 'Wrench' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Technicians', path: '/technicians', icon: 'UserCog' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'plumbing-stats', component: 'plumbing-stats', position: 'main' },
      { id: 'today-calls', component: 'service-call-list-today-plumbing', entity: 'service_call', position: 'main' },
      { id: 'pending-estimates', component: 'estimate-list-pending', entity: 'estimate', position: 'main' },
    ]},
    { path: '/service-calls', name: 'Service Calls', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-call-table', component: 'service-call-table-plumbing', entity: 'service_call', position: 'main' },
    ]},
    { path: '/service-calls/:id', name: 'Service Call Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-call-detail', component: 'service-call-detail-plumbing', entity: 'service_call', position: 'main' },
    ]},
    { path: '/estimates', name: 'Estimates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'estimate-table', component: 'estimate-table', entity: 'estimate', position: 'main' },
    ]},
    { path: '/estimates/:id', name: 'Estimate Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'estimate-detail', component: 'estimate-detail', entity: 'estimate', position: 'main' },
    ]},
    { path: '/jobs', name: 'Jobs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-table', component: 'job-table-plumbing', entity: 'job', position: 'main' },
    ]},
    { path: '/jobs/:id', name: 'Job Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-detail', component: 'job-detail-plumbing', entity: 'job', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-plumbing', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-detail', component: 'customer-detail-plumbing', entity: 'customer', position: 'main' },
      { id: 'customer-history', component: 'customer-service-history', entity: 'job', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'technician-grid-plumbing', entity: 'technician', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'invoice-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/request-service', name: 'Request Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-service', component: 'public-service-request-plumbing', entity: 'service_call', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/service-calls', entity: 'service_call', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/service-calls', entity: 'service_call', operation: 'create' },
    { method: 'GET', path: '/estimates', entity: 'estimate', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/estimates', entity: 'estimate', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/jobs', entity: 'job', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    service_call: {
      defaultFields: [
        { name: 'call_number', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'time_slot', type: 'string' },
        { name: 'type', type: 'enum', required: true },
        { name: 'priority', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'location_details', type: 'text' },
        { name: 'access_instructions', type: 'text' },
        { name: 'source', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'technician' },
        { type: 'hasOne', target: 'estimate' },
        { type: 'hasOne', target: 'job' },
      ],
    },
    estimate: {
      defaultFields: [
        { name: 'estimate_number', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'scope_of_work', type: 'text', required: true },
        { name: 'line_items', type: 'json' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'materials_cost', type: 'decimal' },
        { name: 'permit_cost', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'terms', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'service_call' },
        { type: 'hasOne', target: 'job' },
      ],
    },
    job: {
      defaultFields: [
        { name: 'job_number', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'completion_date', type: 'date' },
        { name: 'type', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'work_performed', type: 'text' },
        { name: 'materials_used', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'permit_number', type: 'string' },
        { name: 'inspection_date', type: 'date' },
        { name: 'inspection_status', type: 'enum' },
        { name: 'photos', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'estimate' },
        { type: 'belongsTo', target: 'technician' },
        { type: 'hasOne', target: 'invoice' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'customer_type', type: 'enum', required: true },
        { name: 'company_name', type: 'string' },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'billing_address', type: 'json' },
        { name: 'property_type', type: 'enum' },
        { name: 'property_year', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_call' },
        { type: 'hasMany', target: 'job' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'employee_id', type: 'string' },
        { name: 'license_number', type: 'string' },
        { name: 'license_expiry', type: 'date' },
        { name: 'certifications', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'vehicle', type: 'string' },
        { name: 'territory', type: 'string' },
        { name: 'schedule', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'photo', type: 'image' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_call' },
        { type: 'hasMany', target: 'job' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json' },
        { name: 'labor_total', type: 'decimal' },
        { name: 'materials_total', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_terms', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'job' },
      ],
    },
  },
};

export default plumbingBlueprint;
