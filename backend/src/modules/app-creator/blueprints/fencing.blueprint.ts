import { Blueprint } from './blueprint.interface';

/**
 * Fencing Contractor Blueprint
 */
export const fencingBlueprint: Blueprint = {
  appType: 'fencing',
  description: 'Fencing contractor app with projects, estimates, installations, and customer management',

  coreEntities: ['project', 'customer', 'estimate', 'crew', 'material', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'Construction' },
        { label: 'Estimates', path: '/estimates', icon: 'Calculator' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Crews', path: '/crews', icon: 'UserCheck' },
        { label: 'Materials', path: '/materials', icon: 'Package' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'appointment-list', entity: 'project', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-calendar', component: 'appointment-calendar', entity: 'project', position: 'main' },
      { id: 'project-table', component: 'data-table', entity: 'project', position: 'main' },
    ]},
    { path: '/estimates', name: 'Estimates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'estimate-table', component: 'data-table', entity: 'estimate', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/crews', name: 'Crews', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'crew-grid', component: 'staff-grid', entity: 'crew', position: 'main' },
    ]},
    { path: '/materials', name: 'Materials', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'material-table', component: 'data-table', entity: 'material', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/quote', name: 'Get Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-form', component: 'booking-wizard', entity: 'estimate', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/estimates', entity: 'estimate', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/estimates', entity: 'estimate', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/crews', entity: 'crew', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/materials', entity: 'material', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'project_number', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'fence_type', type: 'enum', required: true },
        { name: 'fence_style', type: 'enum' },
        { name: 'material', type: 'enum' },
        { name: 'height', type: 'decimal' },
        { name: 'linear_feet', type: 'decimal' },
        { name: 'location', type: 'json', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'gate_count', type: 'integer' },
        { name: 'gate_types', type: 'json' },
        { name: 'permit_info', type: 'json' },
        { name: 'special_requirements', type: 'text' },
        { name: 'photos', type: 'json' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'crew' },
        { type: 'belongsTo', target: 'estimate' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'customer_type', type: 'enum', required: true },
        { name: 'company_name', type: 'string' },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'total_projects', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'estimate' },
      ],
    },
    estimate: {
      defaultFields: [
        { name: 'estimate_number', type: 'string', required: true },
        { name: 'estimate_date', type: 'date', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'fence_type', type: 'enum', required: true },
        { name: 'fence_style', type: 'enum' },
        { name: 'material', type: 'enum' },
        { name: 'height', type: 'decimal' },
        { name: 'linear_feet', type: 'decimal', required: true },
        { name: 'gate_specs', type: 'json' },
        { name: 'material_cost', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'permit_cost', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    crew: {
      defaultFields: [
        { name: 'crew_name', type: 'string', required: true },
        { name: 'crew_lead', type: 'string', required: true },
        { name: 'members', type: 'json' },
        { name: 'phone', type: 'phone' },
        { name: 'specializations', type: 'json' },
        { name: 'equipment', type: 'json' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
      ],
    },
    material: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'fence_type', type: 'enum' },
        { name: 'dimensions', type: 'json' },
        { name: 'sku', type: 'string' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'unit', type: 'string' },
        { name: 'reorder_level', type: 'integer' },
        { name: 'cost', type: 'decimal' },
        { name: 'price', type: 'decimal' },
        { name: 'supplier', type: 'string' },
      ],
      relationships: [],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'material_charges', type: 'decimal' },
        { name: 'labor_charges', type: 'decimal' },
        { name: 'permit_fees', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default fencingBlueprint;
