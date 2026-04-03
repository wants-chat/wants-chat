import { Blueprint } from './blueprint.interface';

/**
 * House Painting / Painting Contractor Blueprint
 */
export const paintingBlueprint: Blueprint = {
  appType: 'painting',
  description: 'Painting contractor app with projects, estimates, crews, and color consultation',

  coreEntities: ['project', 'customer', 'estimate', 'painter', 'color_consultation', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'Brush' },
        { label: 'Estimates', path: '/estimates', icon: 'Calculator' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Painters', path: '/painters', icon: 'UserCheck' },
        { label: 'Color Consults', path: '/consults', icon: 'Palette' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'appointment-list', entity: 'project', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-calendar', component: 'appointment-calendar', entity: 'project', position: 'main' },
      { id: 'project-table', component: 'data-table', entity: 'project', position: 'main' },
    ]},
    { path: '/estimates', name: 'Estimates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'estimate-table', component: 'data-table', entity: 'estimate', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/painters', name: 'Painters', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'painter-grid', component: 'staff-grid', entity: 'painter', position: 'main' },
    ]},
    { path: '/consults', name: 'Color Consultations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'consult-table', component: 'data-table', entity: 'color_consultation', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/quote', name: 'Get Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-form', component: 'booking-wizard', entity: 'estimate', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/estimates', entity: 'estimate', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/estimates', entity: 'estimate', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/painters', entity: 'painter', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/consults', entity: 'color_consultation', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'project_number', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'location', type: 'json', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'rooms', type: 'json' },
        { name: 'exterior_areas', type: 'json' },
        { name: 'square_footage', type: 'decimal' },
        { name: 'paint_colors', type: 'json' },
        { name: 'paint_brands', type: 'json' },
        { name: 'prep_work', type: 'json' },
        { name: 'photos_before', type: 'json' },
        { name: 'photos_after', type: 'json' },
        { name: 'special_requirements', type: 'text' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'painter' },
        { type: 'belongsTo', target: 'estimate' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'customer_type', type: 'enum', required: true },
        { name: 'company_name', type: 'string' },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'total_projects', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'estimate' },
      ],
    },
    estimate: {
      defaultFields: [
        { name: 'estimate_number', type: 'string', required: true },
        { name: 'estimate_date', type: 'date', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'rooms', type: 'json' },
        { name: 'exterior_areas', type: 'json' },
        { name: 'square_footage', type: 'decimal' },
        { name: 'prep_work_needed', type: 'json' },
        { name: 'paint_estimate', type: 'json' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'material_cost', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    painter: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'role', type: 'enum' },
        { name: 'specializations', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
      ],
    },
    color_consultation: {
      defaultFields: [
        { name: 'consult_date', type: 'datetime', required: true },
        { name: 'consultation_type', type: 'enum' },
        { name: 'room_photos', type: 'json' },
        { name: 'color_preferences', type: 'json' },
        { name: 'color_recommendations', type: 'json' },
        { name: 'selected_colors', type: 'json' },
        { name: 'sample_colors', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'project' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'material_charges', type: 'decimal' },
        { name: 'labor_charges', type: 'decimal' },
        { name: 'prep_work_charges', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default paintingBlueprint;
