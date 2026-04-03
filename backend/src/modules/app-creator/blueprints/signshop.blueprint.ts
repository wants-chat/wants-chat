import { Blueprint } from './blueprint.interface';

/**
 * Sign Shop / Large Format Printing Blueprint
 */
export const signshopBlueprint: Blueprint = {
  appType: 'signshop',
  description: 'Sign shop app with projects, quotes, production, installation, and customer management',

  coreEntities: ['project', 'quote', 'customer', 'production_order', 'installation', 'material'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'PenTool' },
        { label: 'Quotes', path: '/quotes', icon: 'FileText' },
        { label: 'Production', path: '/production', icon: 'Printer' },
        { label: 'Installations', path: '/installations', icon: 'Hammer' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Materials', path: '/materials', icon: 'Layers' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-board', component: 'kanban-board', entity: 'project', position: 'main' },
      { id: 'project-table', component: 'data-table', entity: 'project', position: 'main' },
    ]},
    { path: '/quotes', name: 'Quotes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-table', component: 'data-table', entity: 'quote', position: 'main' },
    ]},
    { path: '/production', name: 'Production', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'production-board', component: 'kanban-board', entity: 'production_order', position: 'main' },
      { id: 'production-table', component: 'data-table', entity: 'production_order', position: 'main' },
    ]},
    { path: '/installations', name: 'Installations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'install-calendar', component: 'appointment-calendar', entity: 'installation', position: 'main' },
      { id: 'install-table', component: 'data-table', entity: 'installation', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/materials', name: 'Materials', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'material-table', component: 'data-table', entity: 'material', position: 'main' },
    ]},
    { path: '/request-quote', name: 'Request Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-form', component: 'booking-wizard', entity: 'quote', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/quotes', entity: 'quote', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/quotes', entity: 'quote', operation: 'create' },
    { method: 'GET', path: '/production', entity: 'production_order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/installations', entity: 'installation', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/materials', entity: 'material', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'project_number', type: 'string', required: true },
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'sign_types', type: 'json' },
        { name: 'quantity', type: 'integer' },
        { name: 'dimensions', type: 'json' },
        { name: 'location_info', type: 'json' },
        { name: 'artwork_files', type: 'json' },
        { name: 'proofs', type: 'json' },
        { name: 'proof_approved', type: 'boolean' },
        { name: 'due_date', type: 'date' },
        { name: 'total', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasOne', target: 'quote' },
        { type: 'hasMany', target: 'production_order' },
        { type: 'hasOne', target: 'installation' },
      ],
    },
    quote: {
      defaultFields: [
        { name: 'quote_number', type: 'string', required: true },
        { name: 'quote_date', type: 'date', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'company', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'project_description', type: 'text' },
        { name: 'sign_types', type: 'json' },
        { name: 'quantity', type: 'integer' },
        { name: 'dimensions', type: 'json' },
        { name: 'materials_quoted', type: 'json' },
        { name: 'installation_required', type: 'boolean' },
        { name: 'permits_required', type: 'boolean' },
        { name: 'line_items', type: 'json' },
        { name: 'total', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'company_name', type: 'string' },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'billing_address', type: 'json' },
        { name: 'business_type', type: 'string' },
        { name: 'brand_guidelines', type: 'json' },
        { name: 'total_projects', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'payment_terms', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'quote' },
      ],
    },
    production_order: {
      defaultFields: [
        { name: 'production_number', type: 'string', required: true },
        { name: 'item_name', type: 'string', required: true },
        { name: 'sign_type', type: 'enum', required: true },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'dimensions', type: 'json' },
        { name: 'materials', type: 'json' },
        { name: 'print_specs', type: 'json' },
        { name: 'finishing', type: 'json' },
        { name: 'artwork_file', type: 'string' },
        { name: 'machine', type: 'string' },
        { name: 'operator', type: 'string' },
        { name: 'start_date', type: 'date' },
        { name: 'due_date', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'qc_notes', type: 'text' },
        { name: 'photos', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
      ],
    },
    installation: {
      defaultFields: [
        { name: 'installation_number', type: 'string', required: true },
        { name: 'install_date', type: 'date', required: true },
        { name: 'install_time', type: 'datetime' },
        { name: 'address', type: 'json', required: true },
        { name: 'site_contact', type: 'string' },
        { name: 'site_phone', type: 'phone' },
        { name: 'crew', type: 'json' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'permit_info', type: 'json' },
        { name: 'site_photos_before', type: 'json' },
        { name: 'site_photos_after', type: 'json' },
        { name: 'work_performed', type: 'text' },
        { name: 'sign_off', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
      ],
    },
    material: {
      defaultFields: [
        { name: 'material_name', type: 'string', required: true },
        { name: 'material_type', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'product_code', type: 'string' },
        { name: 'width', type: 'decimal' },
        { name: 'quantity', type: 'decimal', required: true },
        { name: 'unit', type: 'enum' },
        { name: 'reorder_level', type: 'decimal' },
        { name: 'cost_per_unit', type: 'decimal' },
        { name: 'supplier', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
  },
};

export default signshopBlueprint;
