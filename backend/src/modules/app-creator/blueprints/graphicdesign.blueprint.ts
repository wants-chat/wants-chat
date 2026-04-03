import { Blueprint } from './blueprint.interface';

/**
 * Graphic Design Agency Blueprint
 */
export const graphicdesignBlueprint: Blueprint = {
  appType: 'graphicdesign',
  description: 'Graphic design agency app with projects, designers, clients, and asset management',

  coreEntities: ['project', 'designer', 'client', 'asset', 'revision', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'Palette' },
        { label: 'Designers', path: '/designers', icon: 'Users' },
        { label: 'Clients', path: '/clients', icon: 'Briefcase' },
        { label: 'Assets', path: '/assets', icon: 'Image' },
        { label: 'Revisions', path: '/revisions', icon: 'RefreshCw' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'data-table', entity: 'project', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-board', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/designers', name: 'Designers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'designer-grid', component: 'staff-grid', entity: 'designer', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/assets', name: 'Assets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'asset-grid', component: 'product-grid', entity: 'asset', position: 'main' },
    ]},
    { path: '/revisions', name: 'Revisions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'revision-table', component: 'data-table', entity: 'revision', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/portfolio', name: 'Portfolio', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'portfolio-grid', component: 'product-grid', entity: 'project', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/designers', entity: 'designer', operation: 'list' },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/assets', entity: 'asset', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/revisions', entity: 'revision', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'brief', type: 'text' },
        { name: 'start_date', type: 'date' },
        { name: 'deadline', type: 'date' },
        { name: 'deliverables', type: 'json' },
        { name: 'specifications', type: 'json' },
        { name: 'brand_guidelines_url', type: 'string' },
        { name: 'reference_images', type: 'json' },
        { name: 'revisions_included', type: 'integer' },
        { name: 'revisions_used', type: 'integer' },
        { name: 'budget', type: 'decimal' },
        { name: 'actual_cost', type: 'decimal' },
        { name: 'progress_percent', type: 'integer' },
        { name: 'is_portfolio', type: 'boolean' },
        { name: 'thumbnail_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'designer' },
        { type: 'hasMany', target: 'asset' },
        { type: 'hasMany', target: 'revision' },
      ],
    },
    designer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'specializations', type: 'json' },
        { name: 'software_skills', type: 'json' },
        { name: 'years_experience', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'portfolio_url', type: 'string' },
        { name: 'dribbble_url', type: 'string' },
        { name: 'behance_url', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'industry', type: 'string' },
        { name: 'brand_colors', type: 'json' },
        { name: 'brand_fonts', type: 'json' },
        { name: 'brand_assets_url', type: 'string' },
        { name: 'billing_address', type: 'json' },
        { name: 'payment_terms', type: 'string' },
        { name: 'total_projects', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    asset: {
      defaultFields: [
        { name: 'asset_name', type: 'string', required: true },
        { name: 'asset_type', type: 'enum', required: true },
        { name: 'file_format', type: 'string' },
        { name: 'dimensions', type: 'string' },
        { name: 'color_mode', type: 'enum' },
        { name: 'dpi', type: 'integer' },
        { name: 'file_size', type: 'string' },
        { name: 'source_file_url', type: 'string' },
        { name: 'preview_url', type: 'image' },
        { name: 'export_files', type: 'json' },
        { name: 'version', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'tags', type: 'json' },
        { name: 'is_final', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
      ],
    },
    revision: {
      defaultFields: [
        { name: 'revision_number', type: 'integer', required: true },
        { name: 'revision_date', type: 'date', required: true },
        { name: 'requested_by', type: 'string' },
        { name: 'feedback', type: 'text', required: true },
        { name: 'changes_made', type: 'text' },
        { name: 'files_updated', type: 'json' },
        { name: 'time_spent', type: 'decimal' },
        { name: 'is_billable', type: 'boolean' },
        { name: 'completed_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit_received', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_date', type: 'date' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'project' },
      ],
    },
  },
};

export default graphicdesignBlueprint;
