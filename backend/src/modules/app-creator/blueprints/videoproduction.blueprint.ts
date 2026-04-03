import { Blueprint } from './blueprint.interface';

/**
 * Video Production Blueprint
 */
export const videoproductionBlueprint: Blueprint = {
  appType: 'videoproduction',
  description: 'Video production company app with projects, shoots, crew, and equipment management',

  coreEntities: ['project', 'shoot', 'client', 'crew', 'equipment', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'Video' },
        { label: 'Shoots', path: '/shoots', icon: 'Calendar' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Crew', path: '/crew', icon: 'UserCheck' },
        { label: 'Equipment', path: '/equipment', icon: 'Camera' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'data-table', entity: 'project', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-board', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/shoots', name: 'Shoots', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'shoot-calendar', component: 'appointment-calendar', entity: 'shoot', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/crew', name: 'Crew', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'crew-grid', component: 'staff-grid', entity: 'crew', position: 'main' },
    ]},
    { path: '/equipment', name: 'Equipment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'equipment-table', component: 'data-table', entity: 'equipment', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/shoots', entity: 'shoot', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/shoots', entity: 'shoot', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/crew', entity: 'crew', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/equipment', entity: 'equipment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
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
        { name: 'actual_cost', type: 'decimal' },
        { name: 'deliverables', type: 'json' },
        { name: 'video_specs', type: 'json' },
        { name: 'script', type: 'text' },
        { name: 'storyboard_url', type: 'string' },
        { name: 'production_notes', type: 'text' },
        { name: 'files', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'shoot' },
        { type: 'hasOne', target: 'invoice' },
      ],
    },
    shoot: {
      defaultFields: [
        { name: 'shoot_date', type: 'date', required: true },
        { name: 'call_time', type: 'datetime', required: true },
        { name: 'wrap_time', type: 'datetime' },
        { name: 'shoot_type', type: 'enum' },
        { name: 'location', type: 'string' },
        { name: 'location_address', type: 'json' },
        { name: 'location_notes', type: 'text' },
        { name: 'crew_assigned', type: 'json' },
        { name: 'equipment_list', type: 'json' },
        { name: 'shot_list', type: 'json' },
        { name: 'catering_notes', type: 'text' },
        { name: 'weather_backup', type: 'string' },
        { name: 'daily_report', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
      ],
    },
    client: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'industry', type: 'string' },
        { name: 'client_type', type: 'enum' },
        { name: 'billing_contact', type: 'json' },
        { name: 'payment_terms', type: 'string' },
        { name: 'total_projects', type: 'integer' },
        { name: 'total_revenue', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    crew: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'department', type: 'enum' },
        { name: 'skills', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'equipment_owned', type: 'json' },
        { name: 'day_rate', type: 'decimal' },
        { name: 'reel_url', type: 'string' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_contractor', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    equipment: {
      defaultFields: [
        { name: 'equipment_name', type: 'string', required: true },
        { name: 'equipment_type', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'specifications', type: 'json' },
        { name: 'accessories', type: 'json' },
        { name: 'purchase_date', type: 'date' },
        { name: 'purchase_price', type: 'decimal' },
        { name: 'rental_rate', type: 'decimal' },
        { name: 'condition', type: 'enum' },
        { name: 'last_maintenance', type: 'date' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date', required: true },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit_received', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
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
  },
};

export default videoproductionBlueprint;
