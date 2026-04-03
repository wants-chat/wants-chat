import { Blueprint } from './blueprint.interface';

/**
 * Metal Fabrication Blueprint
 */
export const metalfabricationBlueprint: Blueprint = {
  appType: 'metalfabrication',
  description: 'Metal fabrication shop app with quotes, jobs, materials, and project tracking',

  coreEntities: ['quote', 'job', 'material', 'customer', 'drawing', 'timetrack'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Quotes', path: '/quotes', icon: 'Calculator' },
        { label: 'Jobs', path: '/jobs', icon: 'Hammer' },
        { label: 'Materials', path: '/materials', icon: 'Boxes' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Drawings', path: '/drawings', icon: 'PenTool' },
        { label: 'Time Tracking', path: '/time', icon: 'Clock' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-jobs', component: 'kanban-board', entity: 'job', position: 'main' },
    ]},
    { path: '/quotes', name: 'Quotes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-table', component: 'data-table', entity: 'quote', position: 'main' },
    ]},
    { path: '/jobs', name: 'Jobs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'job', position: 'main' },
      { id: 'job-board', component: 'kanban-board', entity: 'job', position: 'main' },
    ]},
    { path: '/materials', name: 'Materials', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'material-table', component: 'data-table', entity: 'material', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/drawings', name: 'Drawings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'drawing-table', component: 'data-table', entity: 'drawing', position: 'main' },
    ]},
    { path: '/time', name: 'Time Tracking', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'time-table', component: 'data-table', entity: 'timetrack', position: 'main' },
    ]},
    { path: '/request-quote', name: 'Request a Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-form', component: 'booking-wizard', entity: 'quote', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/quotes', entity: 'quote', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/quotes', entity: 'quote', operation: 'create' },
    { method: 'GET', path: '/jobs', entity: 'job', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/jobs', entity: 'job', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/materials', entity: 'material', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/materials', entity: 'material', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/customers', entity: 'customer', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/drawings', entity: 'drawing', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/time', entity: 'timetrack', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/time', entity: 'timetrack', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    quote: {
      defaultFields: [
        { name: 'quote_number', type: 'string', required: true },
        { name: 'quote_date', type: 'date', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'customer_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'project_description', type: 'text', required: true },
        { name: 'specifications', type: 'json' },
        { name: 'material_costs', type: 'decimal' },
        { name: 'labor_costs', type: 'decimal' },
        { name: 'finishing_costs', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'lead_time', type: 'string' },
        { name: 'attachments', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasOne', target: 'job' },
        { type: 'hasMany', target: 'drawing' },
      ],
    },
    job: {
      defaultFields: [
        { name: 'job_number', type: 'string', required: true },
        { name: 'job_name', type: 'string', required: true },
        { name: 'priority', type: 'enum' },
        { name: 'start_date', type: 'date' },
        { name: 'due_date', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'description', type: 'text' },
        { name: 'processes', type: 'json' },
        { name: 'materials_needed', type: 'json' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'actual_hours', type: 'decimal' },
        { name: 'material_cost', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'sale_price', type: 'decimal' },
        { name: 'assigned_to', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'quote' },
        { type: 'hasMany', target: 'drawing' },
        { type: 'hasMany', target: 'timetrack' },
      ],
    },
    material: {
      defaultFields: [
        { name: 'material_code', type: 'string', required: true },
        { name: 'material_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'material_type', type: 'string' },
        { name: 'dimensions', type: 'json' },
        { name: 'unit_of_measure', type: 'string' },
        { name: 'quantity_on_hand', type: 'decimal' },
        { name: 'unit_cost', type: 'decimal' },
        { name: 'reorder_point', type: 'decimal' },
        { name: 'supplier', type: 'string' },
        { name: 'lead_time_days', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'customer_number', type: 'string', required: true },
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'industry', type: 'string' },
        { name: 'tax_exempt', type: 'boolean' },
        { name: 'payment_terms', type: 'enum' },
        { name: 'credit_limit', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'quote' },
        { type: 'hasMany', target: 'job' },
      ],
    },
    drawing: {
      defaultFields: [
        { name: 'drawing_number', type: 'string', required: true },
        { name: 'revision', type: 'string' },
        { name: 'drawing_name', type: 'string', required: true },
        { name: 'drawing_type', type: 'enum' },
        { name: 'file_url', type: 'string' },
        { name: 'material', type: 'string' },
        { name: 'thickness', type: 'decimal' },
        { name: 'dimensions', type: 'json' },
        { name: 'quantity', type: 'integer' },
        { name: 'processes', type: 'json' },
        { name: 'tolerances', type: 'json' },
        { name: 'finish', type: 'string' },
        { name: 'created_by', type: 'string' },
        { name: 'approved_by', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'job' },
        { type: 'belongsTo', target: 'quote' },
      ],
    },
    timetrack: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'employee_name', type: 'string', required: true },
        { name: 'work_type', type: 'enum', required: true },
        { name: 'process', type: 'string' },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'hours', type: 'decimal', required: true },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'job' },
      ],
    },
  },
};

export default metalfabricationBlueprint;
