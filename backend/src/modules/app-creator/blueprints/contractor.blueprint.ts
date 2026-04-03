import { Blueprint } from './blueprint.interface';

/**
 * General Contractor / Construction Company Blueprint
 */
export const contractorBlueprint: Blueprint = {
  appType: 'contractor',
  description: 'General contractor app with projects, estimates, subcontractors, and client management',

  coreEntities: ['project', 'estimate', 'client', 'subcontractor', 'invoice', 'material'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'Building' },
        { label: 'Estimates', path: '/estimates', icon: 'Calculator' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Subcontractors', path: '/subcontractors', icon: 'HardHat' },
        { label: 'Materials', path: '/materials', icon: 'Package' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'project-grid', entity: 'project', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-filters', component: 'filter-form', entity: 'project', position: 'main' },
      { id: 'project-table', component: 'data-table', entity: 'project', position: 'main' },
    ]},
    { path: '/projects/:id', name: 'Project Details', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-details', component: 'project-content', entity: 'project', position: 'main' },
      { id: 'project-timeline', component: 'milestone-tracker', entity: 'project', position: 'main' },
    ]},
    { path: '/estimates', name: 'Estimates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'estimate-table', component: 'data-table', entity: 'estimate', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/subcontractors', name: 'Subcontractors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'subcontractor-table', component: 'data-table', entity: 'subcontractor', position: 'main' },
    ]},
    { path: '/materials', name: 'Materials', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'material-table', component: 'data-table', entity: 'material', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/quote', name: 'Request Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-form', component: 'booking-wizard', entity: 'estimate', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/projects/:id', entity: 'project', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/estimates', entity: 'estimate', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/estimates', entity: 'estimate', operation: 'create' },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/subcontractors', entity: 'subcontractor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/materials', entity: 'material', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_number', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'address', type: 'json', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'actual_completion', type: 'date' },
        { name: 'contract_amount', type: 'decimal' },
        { name: 'budget', type: 'decimal' },
        { name: 'spent', type: 'decimal' },
        { name: 'phases', type: 'json' },
        { name: 'permits', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'progress_percent', type: 'integer' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    estimate: {
      defaultFields: [
        { name: 'estimate_number', type: 'string', required: true },
        { name: 'project_description', type: 'text', required: true },
        { name: 'scope_of_work', type: 'json' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'material_cost', type: 'decimal' },
        { name: 'markup_percent', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'terms', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string' },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'property_address', type: 'json' },
        { name: 'source', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'total_projects', type: 'integer' },
        { name: 'total_revenue', type: 'decimal' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'estimate' },
      ],
    },
    subcontractor: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'trade', type: 'enum', required: true },
        { name: 'license_number', type: 'string' },
        { name: 'insurance_expiry', type: 'date' },
        { name: 'w9_on_file', type: 'boolean' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'rating', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    material: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum' },
        { name: 'unit', type: 'string' },
        { name: 'cost_per_unit', type: 'decimal', required: true },
        { name: 'supplier', type: 'string' },
        { name: 'supplier_sku', type: 'string' },
        { name: 'quantity_on_hand', type: 'decimal' },
        { name: 'reorder_level', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
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
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_terms', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'client' },
      ],
    },
  },
};

export default contractorBlueprint;
