import { Blueprint } from './blueprint.interface';

/**
 * Post Production Blueprint
 */
export const postproductionBlueprint: Blueprint = {
  appType: 'postproduction',
  description: 'Post production house app with projects, editing, VFX, color grading, and delivery',

  coreEntities: ['project', 'task', 'client', 'editor', 'asset', 'deliverable'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'Film' },
        { label: 'Tasks', path: '/tasks', icon: 'CheckSquare' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Editors', path: '/editors', icon: 'UserCheck' },
        { label: 'Assets', path: '/assets', icon: 'Folder' },
        { label: 'Deliverables', path: '/deliverables', icon: 'Send' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'data-table', entity: 'project', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-board', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/tasks', name: 'Tasks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'task-board', component: 'kanban-board', entity: 'task', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/editors', name: 'Editors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'editor-grid', component: 'staff-grid', entity: 'editor', position: 'main' },
    ]},
    { path: '/assets', name: 'Assets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'asset-table', component: 'data-table', entity: 'asset', position: 'main' },
    ]},
    { path: '/deliverables', name: 'Deliverables', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'deliverable-table', component: 'data-table', entity: 'deliverable', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/tasks', entity: 'task', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tasks', entity: 'task', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/editors', entity: 'editor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/assets', entity: 'asset', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/deliverables', entity: 'deliverable', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'start_date', type: 'date' },
        { name: 'deadline', type: 'date', required: true },
        { name: 'runtime_minutes', type: 'integer' },
        { name: 'resolution', type: 'string' },
        { name: 'frame_rate', type: 'string' },
        { name: 'codec', type: 'string' },
        { name: 'services', type: 'json' },
        { name: 'budget', type: 'decimal' },
        { name: 'actual_cost', type: 'decimal' },
        { name: 'current_version', type: 'string' },
        { name: 'revision_count', type: 'integer' },
        { name: 'project_folder', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'task' },
        { type: 'hasMany', target: 'asset' },
        { type: 'hasMany', target: 'deliverable' },
      ],
    },
    task: {
      defaultFields: [
        { name: 'task_name', type: 'string', required: true },
        { name: 'task_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'priority', type: 'enum' },
        { name: 'start_date', type: 'date' },
        { name: 'due_date', type: 'date' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'actual_hours', type: 'decimal' },
        { name: 'sequence_range', type: 'string' },
        { name: 'timecode_in', type: 'string' },
        { name: 'timecode_out', type: 'string' },
        { name: 'revision_notes', type: 'text' },
        { name: 'review_link', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'editor' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'client_type', type: 'enum' },
        { name: 'industry', type: 'string' },
        { name: 'billing_address', type: 'json' },
        { name: 'payment_terms', type: 'string' },
        { name: 'preferred_codecs', type: 'json' },
        { name: 'delivery_specs', type: 'json' },
        { name: 'total_projects', type: 'integer' },
        { name: 'total_revenue', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
      ],
    },
    editor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'department', type: 'enum' },
        { name: 'specializations', type: 'json' },
        { name: 'software_skills', type: 'json' },
        { name: 'hardware_skills', type: 'json' },
        { name: 'years_experience', type: 'integer' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'reel_url', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'task' },
      ],
    },
    asset: {
      defaultFields: [
        { name: 'asset_name', type: 'string', required: true },
        { name: 'asset_type', type: 'enum', required: true },
        { name: 'file_path', type: 'string' },
        { name: 'file_size', type: 'string' },
        { name: 'resolution', type: 'string' },
        { name: 'codec', type: 'string' },
        { name: 'frame_rate', type: 'string' },
        { name: 'duration', type: 'string' },
        { name: 'timecode_start', type: 'string' },
        { name: 'reel_name', type: 'string' },
        { name: 'camera', type: 'string' },
        { name: 'lut_applied', type: 'string' },
        { name: 'ingested_at', type: 'datetime' },
        { name: 'notes', type: 'text' },
        { name: 'is_approved', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
      ],
    },
    deliverable: {
      defaultFields: [
        { name: 'deliverable_name', type: 'string', required: true },
        { name: 'deliverable_type', type: 'enum', required: true },
        { name: 'version', type: 'string' },
        { name: 'resolution', type: 'string' },
        { name: 'codec', type: 'string' },
        { name: 'frame_rate', type: 'string' },
        { name: 'aspect_ratio', type: 'string' },
        { name: 'audio_specs', type: 'json' },
        { name: 'file_path', type: 'string' },
        { name: 'file_size', type: 'string' },
        { name: 'delivery_platform', type: 'string' },
        { name: 'delivered_at', type: 'datetime' },
        { name: 'delivery_method', type: 'enum' },
        { name: 'client_approved', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
      ],
    },
  },
};

export default postproductionBlueprint;
