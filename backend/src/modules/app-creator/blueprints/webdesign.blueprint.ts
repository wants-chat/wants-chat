import { Blueprint } from './blueprint.interface';

/**
 * Web Design Agency Blueprint
 */
export const webdesignBlueprint: Blueprint = {
  appType: 'webdesign',
  description: 'Web design agency app with projects, clients, proposals, and invoicing',

  coreEntities: ['project', 'client', 'proposal', 'invoice', 'team_member', 'task'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'FolderOpen' },
        { label: 'Clients', path: '/clients', icon: 'Building' },
        { label: 'Proposals', path: '/proposals', icon: 'FileText' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
        { label: 'Team', path: '/team', icon: 'Users' },
        { label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-board', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/proposals', name: 'Proposals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'proposal-table', component: 'data-table', entity: 'proposal', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/team', name: 'Team', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'team-grid', component: 'staff-grid', entity: 'team_member', position: 'main' },
    ]},
    { path: '/tasks', name: 'Tasks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'task-board', component: 'kanban-board', entity: 'task', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/proposals', entity: 'proposal', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/proposals', entity: 'proposal', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/invoices', entity: 'invoice', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/team', entity: 'team_member', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tasks', entity: 'task', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'start_date', type: 'date' },
        { name: 'deadline', type: 'date' },
        { name: 'budget', type: 'decimal' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'hours_logged', type: 'decimal' },
        { name: 'tech_stack', type: 'json' },
        { name: 'live_url', type: 'string' },
        { name: 'staging_url', type: 'string' },
        { name: 'repository_url', type: 'string' },
        { name: 'design_files', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'task' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'website', type: 'string' },
        { name: 'industry', type: 'string' },
        { name: 'payment_terms', type: 'string' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'total_projects', type: 'integer' },
        { name: 'total_revenue', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'proposal' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    proposal: {
      defaultFields: [
        { name: 'proposal_number', type: 'string', required: true },
        { name: 'proposal_date', type: 'date', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'scope', type: 'text' },
        { name: 'deliverables', type: 'json' },
        { name: 'timeline', type: 'json' },
        { name: 'pricing', type: 'json' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'terms', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
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
    team_member: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'skills', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'portfolio_url', type: 'string' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'task' },
      ],
    },
    task: {
      defaultFields: [
        { name: 'task_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'priority', type: 'enum' },
        { name: 'due_date', type: 'date' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'actual_hours', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'team_member' },
      ],
    },
  },
};

export default webdesignBlueprint;
