import { Blueprint } from './blueprint.interface';

/**
 * App Development Agency Blueprint
 */
export const appdevelopmentBlueprint: Blueprint = {
  appType: 'appdevelopment',
  description: 'App development agency app with projects, sprints, releases, and client portal',

  coreEntities: ['project', 'sprint', 'feature', 'release', 'client', 'developer'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'FolderOpen' },
        { label: 'Sprints', path: '/sprints', icon: 'Rocket' },
        { label: 'Features', path: '/features', icon: 'Puzzle' },
        { label: 'Releases', path: '/releases', icon: 'Tag' },
        { label: 'Clients', path: '/clients', icon: 'Building' },
        { label: 'Developers', path: '/developers', icon: 'Code' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-sprints', component: 'kanban-board', entity: 'sprint', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-table', component: 'data-table', entity: 'project', position: 'main' },
    ]},
    { path: '/sprints', name: 'Sprints', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sprint-board', component: 'kanban-board', entity: 'sprint', position: 'main' },
    ]},
    { path: '/features', name: 'Features', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'feature-board', component: 'kanban-board', entity: 'feature', position: 'main' },
    ]},
    { path: '/releases', name: 'Releases', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'release-table', component: 'data-table', entity: 'release', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/developers', name: 'Developers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'developer-grid', component: 'staff-grid', entity: 'developer', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/sprints', entity: 'sprint', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sprints', entity: 'sprint', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/features', entity: 'feature', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/features', entity: 'feature', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/releases', entity: 'release', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/developers', entity: 'developer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'platform', type: 'json' },
        { name: 'tech_stack', type: 'json' },
        { name: 'start_date', type: 'date' },
        { name: 'target_launch', type: 'date' },
        { name: 'budget', type: 'decimal' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'repository_url', type: 'string' },
        { name: 'production_url', type: 'string' },
        { name: 'staging_url', type: 'string' },
        { name: 'documentation_url', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'sprint' },
        { type: 'hasMany', target: 'release' },
      ],
    },
    sprint: {
      defaultFields: [
        { name: 'sprint_name', type: 'string', required: true },
        { name: 'sprint_number', type: 'integer' },
        { name: 'goal', type: 'text' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'velocity', type: 'integer' },
        { name: 'story_points_total', type: 'integer' },
        { name: 'story_points_completed', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'hasMany', target: 'feature' },
      ],
    },
    feature: {
      defaultFields: [
        { name: 'feature_name', type: 'string', required: true },
        { name: 'feature_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'acceptance_criteria', type: 'json' },
        { name: 'story_points', type: 'integer' },
        { name: 'priority', type: 'enum' },
        { name: 'labels', type: 'json' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'actual_hours', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'sprint' },
        { type: 'belongsTo', target: 'developer' },
      ],
    },
    release: {
      defaultFields: [
        { name: 'version', type: 'string', required: true },
        { name: 'release_name', type: 'string' },
        { name: 'release_type', type: 'enum', required: true },
        { name: 'release_date', type: 'date' },
        { name: 'features_included', type: 'json' },
        { name: 'bug_fixes', type: 'json' },
        { name: 'release_notes', type: 'text' },
        { name: 'changelog', type: 'text' },
        { name: 'download_url', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'industry', type: 'string' },
        { name: 'portal_access', type: 'boolean' },
        { name: 'total_projects', type: 'integer' },
        { name: 'total_revenue', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
      ],
    },
    developer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'seniority', type: 'enum' },
        { name: 'skills', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'github_url', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'feature' },
      ],
    },
  },
};

export default appdevelopmentBlueprint;
