import { Blueprint } from './blueprint.interface';

/**
 * Electrician / Electrical Contractor Blueprint
 */
export const electricianBlueprint: Blueprint = {
  appType: 'electrician',
  description: 'Electrician app with service calls, estimates, jobs, and permit tracking',

  coreEntities: ['service_call', 'job', 'customer', 'estimate', 'invoice', 'technician'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Service Calls', path: '/calls', icon: 'Phone' },
        { label: 'Jobs', path: '/jobs', icon: 'Zap' },
        { label: 'Estimates', path: '/estimates', icon: 'Calculator' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Technicians', path: '/technicians', icon: 'UserCheck' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-calls', component: 'appointment-list', entity: 'service_call', position: 'main' },
    ]},
    { path: '/calls', name: 'Service Calls', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'call-calendar', component: 'appointment-calendar', entity: 'service_call', position: 'main' },
      { id: 'call-table', component: 'data-table', entity: 'service_call', position: 'main' },
    ]},
    { path: '/jobs', name: 'Jobs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-filters', component: 'filter-form', entity: 'job', position: 'main' },
      { id: 'job-table', component: 'data-table', entity: 'job', position: 'main' },
    ]},
    { path: '/estimates', name: 'Estimates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'estimate-table', component: 'data-table', entity: 'estimate', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'staff-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-wizard', entity: 'service_call', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/calls', entity: 'service_call', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/calls', entity: 'service_call', operation: 'create' },
    { method: 'GET', path: '/jobs', entity: 'job', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/jobs', entity: 'job', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/estimates', entity: 'estimate', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/estimates', entity: 'estimate', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    service_call: {
      defaultFields: [
        { name: 'call_number', type: 'string', required: true },
        { name: 'call_date', type: 'date', required: true },
        { name: 'scheduled_time', type: 'datetime', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'problem_description', type: 'text' },
        { name: 'priority', type: 'enum' },
        { name: 'address', type: 'json', required: true },
        { name: 'access_instructions', type: 'text' },
        { name: 'status', type: 'enum', required: true },
        { name: 'completed_at', type: 'datetime' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'technician' },
      ],
    },
    job: {
      defaultFields: [
        { name: 'job_number', type: 'string', required: true },
        { name: 'job_name', type: 'string', required: true },
        { name: 'job_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'address', type: 'json', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'actual_completion', type: 'date' },
        { name: 'permit_number', type: 'string' },
        { name: 'permit_status', type: 'enum' },
        { name: 'inspection_dates', type: 'json' },
        { name: 'contract_amount', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'estimate' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'property_type', type: 'enum' },
        { name: 'panel_info', type: 'json' },
        { name: 'service_history', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_call' },
        { type: 'hasMany', target: 'job' },
      ],
    },
    estimate: {
      defaultFields: [
        { name: 'estimate_number', type: 'string', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'scope_of_work', type: 'json' },
        { name: 'materials', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'labor_rate', type: 'decimal' },
        { name: 'material_cost', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'permit_cost', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string' },
        { name: 'license_expiry', type: 'date' },
        { name: 'certifications', type: 'json' },
        { name: 'skills', type: 'json' },
        { name: 'hire_date', type: 'date' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_call' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'job' },
      ],
    },
  },
};

export default electricianBlueprint;
