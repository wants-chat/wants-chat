import { Blueprint } from './blueprint.interface';

/**
 * Private Investigator Blueprint
 */
export const privateinvestigatorBlueprint: Blueprint = {
  appType: 'privateinvestigator',
  description: 'Private investigation agency with cases, clients, investigators, and evidence management',

  coreEntities: ['client', 'case', 'investigator', 'evidence', 'report', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Cases', path: '/cases', icon: 'Briefcase' },
        { label: 'Investigators', path: '/investigators', icon: 'Search' },
        { label: 'Evidence', path: '/evidence', icon: 'FileText' },
        { label: 'Reports', path: '/reports', icon: 'ClipboardList' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-cases', component: 'appointment-list', entity: 'case', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/cases', name: 'Cases', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'case-board', component: 'kanban-board', entity: 'case', position: 'main' },
    ]},
    { path: '/investigators', name: 'Investigators', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'investigator-grid', component: 'staff-grid', entity: 'investigator', position: 'main' },
    ]},
    { path: '/evidence', name: 'Evidence', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'evidence-table', component: 'data-table', entity: 'evidence', position: 'main' },
    ]},
    { path: '/reports', name: 'Reports', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'report-table', component: 'data-table', entity: 'report', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/consultation', name: 'Consultation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'consultation-form', component: 'booking-wizard', entity: 'client', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create' },
    { method: 'GET', path: '/cases', entity: 'case', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/cases', entity: 'case', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/investigators', entity: 'investigator', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/evidence', entity: 'evidence', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/evidence', entity: 'evidence', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/reports', entity: 'report', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'client_type', type: 'enum' },
        { name: 'company_name', type: 'string' },
        { name: 'referral_source', type: 'string' },
        { name: 'initial_contact_date', type: 'date' },
        { name: 'confidentiality_signed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'case' },
      ],
    },
    case: {
      defaultFields: [
        { name: 'case_number', type: 'string', required: true },
        { name: 'case_name', type: 'string', required: true },
        { name: 'case_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'open_date', type: 'date', required: true },
        { name: 'close_date', type: 'date' },
        { name: 'subjects', type: 'json' },
        { name: 'locations', type: 'json' },
        { name: 'objectives', type: 'json' },
        { name: 'priority', type: 'enum' },
        { name: 'budget', type: 'decimal' },
        { name: 'expenses_to_date', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'investigator' },
        { type: 'hasMany', target: 'evidence' },
        { type: 'hasMany', target: 'report' },
      ],
    },
    investigator: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string' },
        { name: 'license_expiry', type: 'date' },
        { name: 'specialties', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'certifications', type: 'json' },
        { name: 'equipment', type: 'json' },
        { name: 'availability', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'case' },
      ],
    },
    evidence: {
      defaultFields: [
        { name: 'evidence_id', type: 'string', required: true },
        { name: 'evidence_type', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'collected_date', type: 'date', required: true },
        { name: 'collected_time', type: 'datetime' },
        { name: 'location', type: 'json' },
        { name: 'file_urls', type: 'json' },
        { name: 'chain_of_custody', type: 'json' },
        { name: 'authenticity_verified', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'case' },
        { type: 'belongsTo', target: 'investigator' },
      ],
    },
    report: {
      defaultFields: [
        { name: 'report_number', type: 'string', required: true },
        { name: 'report_type', type: 'enum', required: true },
        { name: 'report_date', type: 'date', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'summary', type: 'text' },
        { name: 'content', type: 'text' },
        { name: 'findings', type: 'json' },
        { name: 'attachments', type: 'json' },
        { name: 'distributed_to', type: 'json' },
        { name: 'confidentiality_level', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'case' },
        { type: 'belongsTo', target: 'investigator' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'billing_period', type: 'json' },
        { name: 'line_items', type: 'json' },
        { name: 'hours_worked', type: 'decimal' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'expenses', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'retainer_applied', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'case' },
      ],
    },
  },
};

export default privateinvestigatorBlueprint;
