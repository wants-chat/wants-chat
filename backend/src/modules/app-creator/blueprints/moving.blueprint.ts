import { Blueprint } from './blueprint.interface';

/**
 * Moving Company Blueprint
 */
export const movingBlueprint: Blueprint = {
  appType: 'moving',
  description: 'Moving company with quotes, jobs, crews, and inventory tracking',

  coreEntities: ['move_job', 'customer', 'quote', 'crew', 'truck', 'inventory_item'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Jobs', path: '/jobs', icon: 'Truck' },
        { label: 'Quotes', path: '/quotes', icon: 'FileText' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Crews', path: '/crews', icon: 'UserCheck' },
        { label: 'Fleet', path: '/fleet', icon: 'Truck' },
      ]}},
      { id: 'moving-stats', component: 'moving-stats', position: 'main' },
      { id: 'upcoming-jobs', component: 'job-list-moving', entity: 'move_job', position: 'main' },
      { id: 'crew-schedule', component: 'crew-schedule-moving', entity: 'crew', position: 'main' },
    ]},
    { path: '/jobs', name: 'Jobs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-filters', component: 'job-filters-moving', entity: 'move_job', position: 'main' },
      { id: 'job-table', component: 'job-table-moving', entity: 'move_job', position: 'main' },
    ]},
    { path: '/jobs/:id', name: 'Job Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-header', component: 'job-header-moving', entity: 'move_job', position: 'main' },
      { id: 'job-inventory', component: 'job-inventory', entity: 'inventory_item', position: 'main' },
    ]},
    { path: '/jobs/new', name: 'New Job', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-form', component: 'job-form-moving', entity: 'move_job', position: 'main' },
    ]},
    { path: '/quotes', name: 'Quotes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-table', component: 'quote-table-moving', entity: 'quote', position: 'main' },
    ]},
    { path: '/quotes/:id', name: 'Quote Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-detail', component: 'quote-detail-moving', entity: 'quote', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-moving', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-moving', entity: 'customer', position: 'main' },
      { id: 'customer-jobs', component: 'customer-jobs-moving', entity: 'move_job', position: 'main' },
    ]},
    { path: '/crews', name: 'Crews', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'crew-grid', component: 'crew-grid', entity: 'crew', position: 'main' },
    ]},
    { path: '/fleet', name: 'Fleet', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'truck-grid', component: 'truck-grid', entity: 'truck', position: 'main' },
    ]},
    { path: '/get-quote', name: 'Get Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-request', component: 'quote-request-moving', entity: 'quote', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/jobs', entity: 'move_job', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/jobs', entity: 'move_job', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/quotes', entity: 'quote', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/quotes', entity: 'quote', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/crews', entity: 'crew', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/fleet', entity: 'truck', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    move_job: {
      defaultFields: [
        { name: 'job_number', type: 'string', required: true },
        { name: 'move_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'status', type: 'enum', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'origin_address', type: 'json', required: true },
        { name: 'destination_address', type: 'json', required: true },
        { name: 'distance', type: 'decimal' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'actual_hours', type: 'decimal' },
        { name: 'total_price', type: 'decimal' },
        { name: 'special_items', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'quote' },
        { type: 'belongsTo', target: 'crew' },
        { type: 'belongsTo', target: 'truck' },
      ],
    },
    quote: {
      defaultFields: [
        { name: 'quote_number', type: 'string', required: true },
        { name: 'move_type', type: 'enum', required: true },
        { name: 'move_date', type: 'date' },
        { name: 'origin_address', type: 'json', required: true },
        { name: 'destination_address', type: 'json', required: true },
        { name: 'home_size', type: 'string' },
        { name: 'estimated_weight', type: 'decimal' },
        { name: 'special_items', type: 'json' },
        { name: 'services', type: 'json' },
        { name: 'estimated_price', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'valid_until', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasOne', target: 'move_job' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'total_jobs', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'move_job' },
        { type: 'hasMany', target: 'quote' },
      ],
    },
    crew: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'leader_name', type: 'string' },
        { name: 'members', type: 'json' },
        { name: 'size', type: 'integer' },
        { name: 'phone', type: 'phone' },
        { name: 'availability', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'move_job' }],
    },
    truck: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'license_plate', type: 'string', required: true },
        { name: 'size', type: 'enum', required: true },
        { name: 'capacity_cubic_ft', type: 'integer' },
        { name: 'year', type: 'integer' },
        { name: 'mileage', type: 'integer' },
        { name: 'last_service', type: 'date' },
        { name: 'status', type: 'enum' },
      ],
      relationships: [{ type: 'hasMany', target: 'move_job' }],
    },
    inventory_item: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'string' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'condition', type: 'enum' },
        { name: 'weight', type: 'decimal' },
        { name: 'special_handling', type: 'boolean' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'move_job' }],
    },
  },
};

export default movingBlueprint;
