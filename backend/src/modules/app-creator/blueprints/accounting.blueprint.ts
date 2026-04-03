import { Blueprint } from './blueprint.interface';

/**
 * Accounting Firm Blueprint
 */
export const accountingBlueprint: Blueprint = {
  appType: 'accounting',
  description: 'Accounting firm with clients, engagements, tax returns, and financial reporting',

  coreEntities: ['client', 'engagement', 'tax_return', 'document', 'task', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Building2' },
        { label: 'Engagements', path: '/engagements', icon: 'Briefcase' },
        { label: 'Tax Returns', path: '/tax-returns', icon: 'FileText' },
        { label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
        { label: 'Documents', path: '/documents', icon: 'Folder' },
        { label: 'Billing', path: '/billing', icon: 'Receipt' },
      ]}},
      { id: 'accounting-stats', component: 'accounting-stats', position: 'main' },
      { id: 'upcoming-deadlines', component: 'deadline-list-accounting', entity: 'engagement', position: 'main' },
      { id: 'pending-tasks', component: 'task-list-accounting', entity: 'task', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-filters', component: 'client-filters-accounting', entity: 'client', position: 'main' },
      { id: 'client-table', component: 'client-table-accounting', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile-accounting', entity: 'client', position: 'main' },
      { id: 'client-engagements', component: 'client-engagements', entity: 'engagement', position: 'main' },
      { id: 'client-documents', component: 'client-documents-accounting', entity: 'document', position: 'main' },
    ]},
    { path: '/clients/new', name: 'New Client', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-form', component: 'client-form-accounting', entity: 'client', position: 'main' },
    ]},
    { path: '/engagements', name: 'Engagements', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'engagement-filters', component: 'engagement-filters', entity: 'engagement', position: 'main' },
      { id: 'engagement-table', component: 'engagement-table', entity: 'engagement', position: 'main' },
    ]},
    { path: '/engagements/:id', name: 'Engagement Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'engagement-header', component: 'engagement-header', entity: 'engagement', position: 'main' },
      { id: 'engagement-tasks', component: 'engagement-tasks', entity: 'task', position: 'main' },
    ]},
    { path: '/tax-returns', name: 'Tax Returns', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tax-return-filters', component: 'tax-return-filters', entity: 'tax_return', position: 'main' },
      { id: 'tax-return-table', component: 'tax-return-table', entity: 'tax_return', position: 'main' },
    ]},
    { path: '/tax-returns/:id', name: 'Tax Return Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tax-return-detail', component: 'tax-return-detail', entity: 'tax_return', position: 'main' },
    ]},
    { path: '/tasks', name: 'Tasks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'task-board', component: 'task-board-accounting', entity: 'task', position: 'main' },
    ]},
    { path: '/documents', name: 'Documents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'document-browser', component: 'document-browser-accounting', entity: 'document', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'billing-stats-accounting', position: 'main' },
      { id: 'invoice-table', component: 'invoice-table-accounting', entity: 'invoice', position: 'main' },
    ]},
    { path: '/client-portal', name: 'Client Portal', layout: 'single-column', requiresAuth: true, sections: [
      { id: 'client-portal', component: 'client-portal-accounting', entity: 'document', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/engagements', entity: 'engagement', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tax-returns', entity: 'tax_return', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tasks', entity: 'task', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'company', type: 'string' },
        { name: 'ein', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'fiscal_year_end', type: 'string' },
        { name: 'industry', type: 'string' },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'engagement' },
        { type: 'hasMany', target: 'tax_return' },
        { type: 'hasMany', target: 'document' },
      ],
    },
    engagement: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'year', type: 'integer', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'due_date', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'fee', type: 'decimal' },
        { name: 'assigned_to', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'task' },
      ],
    },
    tax_return: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'year', type: 'integer', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'extended_due_date', type: 'date' },
        { name: 'filed_date', type: 'date' },
        { name: 'refund_amount', type: 'decimal' },
        { name: 'amount_due', type: 'decimal' },
        { name: 'preparer', type: 'string' },
        { name: 'reviewer', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'engagement' },
      ],
    },
    task: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
        { name: 'priority', type: 'enum' },
        { name: 'due_date', type: 'date' },
        { name: 'assigned_to', type: 'string' },
        { name: 'completed_date', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'engagement' },
      ],
    },
    document: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'year', type: 'integer' },
        { name: 'file_url', type: 'url', required: true },
        { name: 'file_type', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'uploaded_by', type: 'string' },
      ],
      relationships: [{ type: 'belongsTo', target: 'client' }],
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
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'engagement' },
      ],
    },
  },
};

export default accountingBlueprint;
