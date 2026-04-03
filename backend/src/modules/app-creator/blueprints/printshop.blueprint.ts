import { Blueprint } from './blueprint.interface';

/**
 * Printing Shop Blueprint
 */
export const printshopBlueprint: Blueprint = {
  appType: 'printshop',
  description: 'Print shop with custom orders, quote requests, job tracking, and file management',

  coreEntities: ['job', 'customer', 'quote', 'product', 'file', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Jobs', path: '/jobs', icon: 'Printer' },
        { label: 'Quotes', path: '/quotes', icon: 'FileText' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Products', path: '/products', icon: 'Package' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'printshop-stats', component: 'printshop-stats', position: 'main' },
      { id: 'active-jobs', component: 'job-list-printshop', entity: 'job', position: 'main' },
      { id: 'pending-quotes', component: 'quote-list-printshop', entity: 'quote', position: 'main' },
    ]},
    { path: '/jobs', name: 'Jobs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-filters', component: 'job-filters-printshop', entity: 'job', position: 'main' },
      { id: 'job-table', component: 'job-table-printshop', entity: 'job', position: 'main' },
    ]},
    { path: '/jobs/:id', name: 'Job Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-detail', component: 'job-detail-printshop', entity: 'job', position: 'main' },
      { id: 'job-files', component: 'job-files', entity: 'file', position: 'main' },
    ]},
    { path: '/jobs/new', name: 'New Job', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-form', component: 'job-form-printshop', entity: 'job', position: 'main' },
    ]},
    { path: '/quotes', name: 'Quotes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-table', component: 'quote-table-printshop', entity: 'quote', position: 'main' },
    ]},
    { path: '/quotes/:id', name: 'Quote Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quote-detail', component: 'quote-detail-printshop', entity: 'quote', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-printshop', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-printshop', entity: 'customer', position: 'main' },
      { id: 'customer-jobs', component: 'customer-jobs', entity: 'job', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid-printshop', entity: 'product', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'invoice-table-printshop', entity: 'invoice', position: 'main' },
    ]},
    { path: '/quote-request', name: 'Request Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-request-form', component: 'quote-request-printshop', entity: 'quote', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/jobs', entity: 'job', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/jobs', entity: 'job', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/quotes', entity: 'quote', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/quotes', entity: 'quote', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    job: {
      defaultFields: [
        { name: 'job_number', type: 'string', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'priority', type: 'enum' },
        { name: 'specifications', type: 'json', required: true },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'price', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'quote' },
        { type: 'hasMany', target: 'file' },
      ],
    },
    quote: {
      defaultFields: [
        { name: 'quote_number', type: 'string', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'specifications', type: 'json' },
        { name: 'quantity', type: 'integer' },
        { name: 'estimated_price', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasOne', target: 'job' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'company', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'tax_exempt', type: 'boolean' },
        { name: 'total_jobs', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'job' },
        { type: 'hasMany', target: 'quote' },
      ],
    },
    product: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'base_price', type: 'decimal', required: true },
        { name: 'price_per_unit', type: 'decimal' },
        { name: 'specifications', type: 'json' },
        { name: 'turnaround_days', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    file: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'string', required: true },
        { name: 'size', type: 'integer' },
        { name: 'url', type: 'url', required: true },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'job' }],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'issue_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal', required: true },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'paid_amount', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'job' },
      ],
    },
  },
};

export default printshopBlueprint;
