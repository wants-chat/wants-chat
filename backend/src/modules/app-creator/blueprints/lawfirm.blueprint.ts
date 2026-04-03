import { Blueprint } from './blueprint.interface';

/**
 * Law Firm Blueprint
 */
export const lawfirmBlueprint: Blueprint = {
  appType: 'lawfirm',
  description: 'Law firm with cases, clients, documents, billing, and calendar management',

  coreEntities: ['case', 'client', 'attorney', 'document', 'time_entry', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Cases', path: '/cases', icon: 'Scale' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Attorneys', path: '/attorneys', icon: 'Briefcase' },
        { label: 'Documents', path: '/documents', icon: 'FileText' },
        { label: 'Time & Billing', path: '/billing', icon: 'Clock' },
        { label: 'Calendar', path: '/calendar', icon: 'Calendar' },
      ]}},
      { id: 'law-stats', component: 'law-stats', position: 'main' },
      { id: 'active-cases', component: 'case-list-active', entity: 'case', position: 'main' },
      { id: 'upcoming-deadlines', component: 'deadline-list', entity: 'case', position: 'main' },
    ]},
    { path: '/cases', name: 'Cases', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'case-filters', component: 'case-filters-law', entity: 'case', position: 'main' },
      { id: 'case-table', component: 'case-table-law', entity: 'case', position: 'main' },
    ]},
    { path: '/cases/:id', name: 'Case Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'case-header', component: 'case-header-law', entity: 'case', position: 'main' },
      { id: 'case-documents', component: 'case-documents', entity: 'document', position: 'main' },
      { id: 'case-timeline', component: 'case-timeline', entity: 'case', position: 'main' },
    ]},
    { path: '/cases/new', name: 'New Case', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'case-form', component: 'case-form-law', entity: 'case', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-law', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile-law', entity: 'client', position: 'main' },
      { id: 'client-cases', component: 'client-cases', entity: 'case', position: 'main' },
      { id: 'client-invoices', component: 'client-invoices-law', entity: 'invoice', position: 'main' },
    ]},
    { path: '/attorneys', name: 'Attorneys', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'attorney-grid', component: 'attorney-grid', entity: 'attorney', position: 'main' },
    ]},
    { path: '/attorneys/:id', name: 'Attorney Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'attorney-profile', component: 'attorney-profile', entity: 'attorney', position: 'main' },
      { id: 'attorney-cases', component: 'attorney-cases', entity: 'case', position: 'main' },
    ]},
    { path: '/documents', name: 'Documents', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'document-browser', component: 'document-browser-law', entity: 'document', position: 'main' },
    ]},
    { path: '/billing', name: 'Time & Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-stats', component: 'billing-stats-law', position: 'main' },
      { id: 'time-tracker', component: 'time-tracker-law', entity: 'time_entry', position: 'main' },
      { id: 'invoice-table', component: 'invoice-table-law', entity: 'invoice', position: 'main' },
    ]},
    { path: '/calendar', name: 'Calendar', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'legal-calendar', component: 'legal-calendar', entity: 'case', position: 'main' },
    ]},
    { path: '/consultation', name: 'Request Consultation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'consultation-form', component: 'consultation-form', entity: 'client', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/cases', entity: 'case', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/cases', entity: 'case', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/attorneys', entity: 'attorney', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/documents', entity: 'document', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/time-entries', entity: 'time_entry', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    case: {
      defaultFields: [
        { name: 'case_number', type: 'string', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'practice_area', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'open_date', type: 'date', required: true },
        { name: 'close_date', type: 'date' },
        { name: 'court', type: 'string' },
        { name: 'judge', type: 'string' },
        { name: 'opposing_counsel', type: 'json' },
        { name: 'deadlines', type: 'json' },
        { name: 'billing_type', type: 'enum' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'retainer', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'attorney' },
        { type: 'hasMany', target: 'document' },
        { type: 'hasMany', target: 'time_entry' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'company', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'total_billed', type: 'decimal' },
        { name: 'outstanding_balance', type: 'decimal' },
      ],
      relationships: [
        { type: 'hasMany', target: 'case' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    attorney: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'bar_number', type: 'string' },
        { name: 'practice_areas', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_partner', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'case' }],
    },
    document: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'file_url', type: 'url', required: true },
        { name: 'file_type', type: 'string' },
        { name: 'file_size', type: 'integer' },
        { name: 'description', type: 'text' },
        { name: 'confidential', type: 'boolean' },
        { name: 'version', type: 'integer' },
      ],
      relationships: [{ type: 'belongsTo', target: 'case' }],
    },
    time_entry: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'hours', type: 'decimal', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'activity_type', type: 'enum' },
        { name: 'billable', type: 'boolean' },
        { name: 'rate', type: 'decimal' },
        { name: 'amount', type: 'decimal' },
        { name: 'invoiced', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'case' },
        { type: 'belongsTo', target: 'attorney' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'issue_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal', required: true },
        { name: 'adjustments', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'paid_amount', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'case' },
      ],
    },
  },
};

export default lawfirmBlueprint;
