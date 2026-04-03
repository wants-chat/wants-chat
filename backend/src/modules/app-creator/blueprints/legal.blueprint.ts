import { Blueprint } from './blueprint.interface';

/**
 * Legal/Law Firm Blueprint
 */
export const legalBlueprint: Blueprint = {
  appType: 'legal',
  description: 'Law firm app with cases, clients, documents, appointments, and billing',

  coreEntities: ['case', 'client', 'document', 'appointment', 'invoice', 'attorney', 'time_entry'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Cases', path: '/cases', icon: 'Briefcase' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Documents', path: '/documents', icon: 'FileText' },
        { label: 'Calendar', path: '/calendar', icon: 'Calendar' },
        { label: 'Billing', path: '/billing', icon: 'DollarSign' },
      ]}},
      { id: 'case-stats', component: 'case-stats', position: 'main' },
      { id: 'active-cases', component: 'case-list', entity: 'case', position: 'main', props: { title: 'Active Cases', status: 'active' }},
      { id: 'upcoming-deadlines', component: 'deadline-list', entity: 'case', position: 'main' },
    ]},
    { path: '/cases', name: 'Cases', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'case-filters', component: 'case-filters', entity: 'case', position: 'main' },
      { id: 'case-table', component: 'case-table', entity: 'case', position: 'main' },
    ]},
    { path: '/cases/:id', name: 'Case Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'case-header', component: 'case-header', entity: 'case', position: 'main' },
      { id: 'case-documents', component: 'document-list', entity: 'document', position: 'main' },
      { id: 'case-timeline', component: 'case-timeline', entity: 'case', position: 'main' },
      { id: 'time-entries', component: 'time-entry-list', entity: 'time_entry', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main', props: { title: 'Clients', showCreate: true }},
    ]},
    { path: '/clients/:id', name: 'Client Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-profile', component: 'client-profile', entity: 'client', position: 'main' },
      { id: 'client-cases', component: 'case-list', entity: 'case', position: 'main' },
    ]},
    { path: '/billing', name: 'Billing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'billing-summary', component: 'billing-summary', position: 'main' },
      { id: 'invoice-list', component: 'invoice-list', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/cases', entity: 'case', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/cases/:id', entity: 'case', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/cases', entity: 'case', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/clients/:id', entity: 'client', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/time-entries', entity: 'time_entry', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    case: {
      defaultFields: [
        { name: 'case_number', type: 'string', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'court', type: 'string' },
        { name: 'judge', type: 'string' },
        { name: 'filing_date', type: 'date' },
        { name: 'deadlines', type: 'json' },
        { name: 'notes', type: 'text' },
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
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'company', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'case' }],
    },
    time_entry: {
      defaultFields: [
        { name: 'description', type: 'text', required: true },
        { name: 'hours', type: 'decimal', required: true },
        { name: 'rate', type: 'decimal', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'billable', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'case' },
        { type: 'belongsTo', target: 'attorney' },
      ],
    },
  },
};

export default legalBlueprint;
