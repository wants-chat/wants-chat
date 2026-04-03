import { Blueprint } from './blueprint.interface';

/**
 * Roofing Contractor Blueprint
 */
export const roofingBlueprint: Blueprint = {
  appType: 'roofing',
  description: 'Roofing contractor app with inspections, estimates, projects, and warranty tracking',

  coreEntities: ['inspection', 'project', 'customer', 'estimate', 'warranty', 'crew'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Inspections', path: '/inspections', icon: 'Search' },
        { label: 'Projects', path: '/projects', icon: 'Home' },
        { label: 'Estimates', path: '/estimates', icon: 'Calculator' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Warranties', path: '/warranties', icon: 'Shield' },
        { label: 'Crews', path: '/crews', icon: 'HardHat' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'project-grid', entity: 'project', position: 'main' },
    ]},
    { path: '/inspections', name: 'Inspections', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inspection-calendar', component: 'appointment-calendar', entity: 'inspection', position: 'main' },
      { id: 'inspection-table', component: 'data-table', entity: 'inspection', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-filters', component: 'filter-form', entity: 'project', position: 'main' },
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
    { path: '/warranties', name: 'Warranties', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'warranty-table', component: 'data-table', entity: 'warranty', position: 'main' },
    ]},
    { path: '/crews', name: 'Crews', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'crew-grid', component: 'staff-grid', entity: 'crew', position: 'main' },
    ]},
    { path: '/inspection', name: 'Request Inspection', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'inspection-form', component: 'booking-wizard', entity: 'inspection', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/inspections', entity: 'inspection', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/inspections', entity: 'inspection', operation: 'create' },
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/estimates', entity: 'estimate', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/warranties', entity: 'warranty', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/crews', entity: 'crew', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    inspection: {
      defaultFields: [
        { name: 'inspection_number', type: 'string', required: true },
        { name: 'inspection_date', type: 'datetime', required: true },
        { name: 'inspection_type', type: 'enum', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'roof_type', type: 'enum' },
        { name: 'roof_age', type: 'integer' },
        { name: 'square_footage', type: 'decimal' },
        { name: 'pitch', type: 'string' },
        { name: 'findings', type: 'json' },
        { name: 'damage_areas', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'drone_photos', type: 'json' },
        { name: 'recommendations', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    project: {
      defaultFields: [
        { name: 'project_number', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'address', type: 'json', required: true },
        { name: 'roof_type', type: 'enum' },
        { name: 'material', type: 'enum', required: true },
        { name: 'color', type: 'string' },
        { name: 'square_footage', type: 'decimal' },
        { name: 'start_date', type: 'date' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'actual_completion', type: 'date' },
        { name: 'contract_amount', type: 'decimal' },
        { name: 'permit_number', type: 'string' },
        { name: 'insurance_claim', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'estimate' },
        { type: 'hasOne', target: 'warranty' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'insurance_info', type: 'json' },
        { name: 'source', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'inspection' },
        { type: 'hasMany', target: 'project' },
      ],
    },
    estimate: {
      defaultFields: [
        { name: 'estimate_number', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'material', type: 'enum', required: true },
        { name: 'square_footage', type: 'decimal' },
        { name: 'material_cost', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'tear_off_cost', type: 'decimal' },
        { name: 'permit_cost', type: 'decimal' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'total', type: 'decimal', required: true },
        { name: 'financing_options', type: 'json' },
        { name: 'valid_until', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'inspection' },
      ],
    },
    warranty: {
      defaultFields: [
        { name: 'warranty_number', type: 'string', required: true },
        { name: 'warranty_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'expiration_date', type: 'date', required: true },
        { name: 'manufacturer_warranty', type: 'json' },
        { name: 'workmanship_warranty', type: 'json' },
        { name: 'coverage_details', type: 'text' },
        { name: 'transferable', type: 'boolean' },
        { name: 'registration_number', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'project' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    crew: {
      defaultFields: [
        { name: 'crew_name', type: 'string', required: true },
        { name: 'crew_lead', type: 'string', required: true },
        { name: 'members', type: 'json' },
        { name: 'phone', type: 'phone' },
        { name: 'certifications', type: 'json' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'equipment', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default roofingBlueprint;
