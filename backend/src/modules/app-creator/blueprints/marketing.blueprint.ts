import { Blueprint } from './blueprint.interface';

/**
 * Marketing Agency Blueprint
 */
export const marketingBlueprint: Blueprint = {
  appType: 'marketing',
  description: 'Marketing agency with campaigns, clients, projects, and performance tracking',

  coreEntities: ['campaign', 'client', 'project', 'asset', 'report', 'task'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Campaigns', path: '/campaigns', icon: 'Megaphone' },
        { label: 'Clients', path: '/clients', icon: 'Building2' },
        { label: 'Projects', path: '/projects', icon: 'FolderKanban' },
        { label: 'Assets', path: '/assets', icon: 'Image' },
        { label: 'Reports', path: '/reports', icon: 'BarChart' },
      ]}},
      { id: 'marketing-stats', component: 'marketing-stats', position: 'main' },
      { id: 'active-campaigns', component: 'campaign-list-active', entity: 'campaign', position: 'main' },
      { id: 'pending-tasks', component: 'task-list-marketing', entity: 'task', position: 'main' },
    ]},
    { path: '/campaigns', name: 'Campaigns', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'campaign-filters', component: 'campaign-filters-marketing', entity: 'campaign', position: 'main' },
      { id: 'campaign-grid', component: 'campaign-grid-marketing', entity: 'campaign', position: 'main' },
    ]},
    { path: '/campaigns/:id', name: 'Campaign Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'campaign-header', component: 'campaign-header-marketing', entity: 'campaign', position: 'main' },
      { id: 'campaign-performance', component: 'campaign-performance', entity: 'campaign', position: 'main' },
      { id: 'campaign-assets', component: 'campaign-assets', entity: 'asset', position: 'main' },
    ]},
    { path: '/campaigns/new', name: 'New Campaign', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'campaign-form', component: 'campaign-form-marketing', entity: 'campaign', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'client-table-marketing', entity: 'client', position: 'main' },
    ]},
    { path: '/clients/:id', name: 'Client Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-header', component: 'client-header-marketing', entity: 'client', position: 'main' },
      { id: 'client-campaigns', component: 'client-campaigns', entity: 'campaign', position: 'main' },
      { id: 'client-performance', component: 'client-performance-marketing', entity: 'report', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-board', component: 'project-board-marketing', entity: 'project', position: 'main' },
    ]},
    { path: '/projects/:id', name: 'Project Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-header', component: 'project-header-marketing', entity: 'project', position: 'main' },
      { id: 'project-tasks', component: 'project-tasks-marketing', entity: 'task', position: 'main' },
    ]},
    { path: '/assets', name: 'Assets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'asset-browser', component: 'asset-browser', entity: 'asset', position: 'main' },
    ]},
    { path: '/reports', name: 'Reports', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'report-generator', component: 'report-generator', entity: 'report', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/campaigns', entity: 'campaign', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/campaigns', entity: 'campaign', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/assets', entity: 'asset', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/reports', entity: 'report', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/tasks', entity: 'task', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    campaign: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'budget', type: 'decimal' },
        { name: 'spent', type: 'decimal' },
        { name: 'channels', type: 'json' },
        { name: 'goals', type: 'json' },
        { name: 'kpis', type: 'json' },
        { name: 'description', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'asset' },
        { type: 'hasMany', target: 'report' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'industry', type: 'string' },
        { name: 'website', type: 'url' },
        { name: 'contact_name', type: 'string' },
        { name: 'contact_email', type: 'email', required: true },
        { name: 'contact_phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'monthly_retainer', type: 'decimal' },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'campaign' },
        { type: 'hasMany', target: 'project' },
      ],
    },
    project: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'due_date', type: 'date' },
        { name: 'budget', type: 'decimal' },
        { name: 'description', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'campaign' },
        { type: 'hasMany', target: 'task' },
        { type: 'hasMany', target: 'asset' },
      ],
    },
    asset: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'file_url', type: 'url', required: true },
        { name: 'file_type', type: 'string' },
        { name: 'dimensions', type: 'json' },
        { name: 'status', type: 'enum' },
        { name: 'tags', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'campaign' },
        { type: 'belongsTo', target: 'project' },
      ],
    },
    report: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'period_start', type: 'date', required: true },
        { name: 'period_end', type: 'date', required: true },
        { name: 'metrics', type: 'json' },
        { name: 'insights', type: 'text' },
        { name: 'recommendations', type: 'text' },
        { name: 'file_url', type: 'url' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'campaign' },
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
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'actual_hours', type: 'decimal' },
      ],
      relationships: [{ type: 'belongsTo', target: 'project' }],
    },
  },
};

export default marketingBlueprint;
