import { Blueprint } from './blueprint.interface';

/**
 * Consulting Blueprint
 */
export const consultingBlueprint: Blueprint = {
  appType: 'consulting',
  description: 'Consulting app with clients, projects, invoices, and time tracking',

  coreEntities: ['client', 'project', 'engagement', 'time_entry', 'invoice', 'deliverable'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Building2' },
        { label: 'Projects', path: '/projects', icon: 'Briefcase' },
        { label: 'Time Tracking', path: '/time', icon: 'Clock' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
        { label: 'Reports', path: '/reports', icon: 'BarChart' },
      ]}},
      { id: 'consulting-stats', component: 'consulting-stats', position: 'main' },
      { id: 'active-projects', component: 'project-list-consulting', entity: 'project', position: 'main' },
      { id: 'recent-time', component: 'recent-time-entries', entity: 'time_entry', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-consulting', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-header', component: 'client-header-consulting', entity: 'client', position: 'main' },
      { id: 'client-projects', component: 'client-projects-consulting', entity: 'project', position: 'main' },
      { id: 'client-invoices', component: 'client-invoices', entity: 'invoice', position: 'main' },
    ]},
    { path: '/clients/new', name: 'New Client', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-form', component: 'client-form-consulting', entity: 'client', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-filters', component: 'project-filters-consulting', entity: 'project', position: 'main' },
      { id: 'project-table', component: 'project-table-consulting', entity: 'project', position: 'main' },
    ]},
    { path: '/projects/:id', name: 'Project Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-header', component: 'project-header-consulting', entity: 'project', position: 'main' },
      { id: 'project-timeline', component: 'project-timeline-consulting', entity: 'deliverable', position: 'main' },
      { id: 'project-time', component: 'project-time-entries', entity: 'time_entry', position: 'main' },
    ]},
    { path: '/time', name: 'Time Tracking', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'time-tracker', component: 'time-tracker-consulting', position: 'main' },
      { id: 'time-entries', component: 'time-entry-table', entity: 'time_entry', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-stats', component: 'invoice-stats-consulting', position: 'main' },
      { id: 'invoice-table', component: 'invoice-table-consulting', entity: 'invoice', position: 'main' },
    ]},
    { path: '/invoices/:id', name: 'Invoice Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-detail', component: 'invoice-detail-consulting', entity: 'invoice', position: 'main' },
    ]},
    { path: '/invoices/new', name: 'New Invoice', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-form', component: 'invoice-form-consulting', entity: 'invoice', position: 'main' },
    ]},
    { path: '/reports', name: 'Reports', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'revenue-report', component: 'revenue-report-consulting', position: 'main' },
      { id: 'utilization-report', component: 'utilization-report', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/clients/:id', entity: 'client', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/projects/:id', entity: 'project', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/time-entries', entity: 'time_entry', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/time-entries', entity: 'time_entry', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/invoices', entity: 'invoice', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'company', type: 'string' },
        { name: 'industry', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'website', type: 'url' },
        { name: 'billing_rate', type: 'decimal' },
        { name: 'status', type: 'enum' },
        { name: 'total_revenue', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    project: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'code', type: 'string' },
        { name: 'type', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'budget', type: 'decimal' },
        { name: 'billing_type', type: 'enum' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'total_hours', type: 'decimal' },
        { name: 'total_billed', type: 'decimal' },
        { name: 'description', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'time_entry' },
        { type: 'hasMany', target: 'deliverable' },
      ],
    },
    time_entry: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'hours', type: 'decimal', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'billable', type: 'boolean' },
        { name: 'rate', type: 'decimal' },
        { name: 'amount', type: 'decimal' },
        { name: 'status', type: 'enum' },
        { name: 'invoiced', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'invoice' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'issue_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'subtotal', type: 'decimal', required: true },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'paid_date', type: 'date' },
        { name: 'paid_amount', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'line_items', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'project' },
      ],
    },
    deliverable: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'due_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
        { name: 'completed_date', type: 'date' },
        { name: 'files', type: 'json' },
      ],
      relationships: [{ type: 'belongsTo', target: 'project' }],
    },
  },
};

export default consultingBlueprint;
