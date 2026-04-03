import { Blueprint } from './blueprint.interface';

/**
 * Pressure Washing Service Blueprint
 */
export const pressurewashingBlueprint: Blueprint = {
  appType: 'pressurewashing',
  description: 'Pressure washing app with service calls, estimates, crews, and recurring contracts',

  coreEntities: ['job', 'customer', 'estimate', 'crew', 'equipment', 'contract'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Jobs', path: '/jobs', icon: 'Droplets' },
        { label: 'Estimates', path: '/estimates', icon: 'Calculator' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Crews', path: '/crews', icon: 'UserCheck' },
        { label: 'Contracts', path: '/contracts', icon: 'FileText' },
        { label: 'Equipment', path: '/equipment', icon: 'Wrench' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-jobs', component: 'appointment-list', entity: 'job', position: 'main' },
    ]},
    { path: '/jobs', name: 'Jobs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'job-calendar', component: 'appointment-calendar', entity: 'job', position: 'main' },
      { id: 'job-table', component: 'data-table', entity: 'job', position: 'main' },
    ]},
    { path: '/estimates', name: 'Estimates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'estimate-table', component: 'data-table', entity: 'estimate', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/crews', name: 'Crews', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'crew-grid', component: 'staff-grid', entity: 'crew', position: 'main' },
    ]},
    { path: '/contracts', name: 'Contracts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'contract-table', component: 'data-table', entity: 'contract', position: 'main' },
    ]},
    { path: '/equipment', name: 'Equipment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'equipment-table', component: 'data-table', entity: 'equipment', position: 'main' },
    ]},
    { path: '/quote', name: 'Get Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-form', component: 'booking-wizard', entity: 'estimate', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/jobs', entity: 'job', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/jobs', entity: 'job', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/estimates', entity: 'estimate', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/estimates', entity: 'estimate', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/crews', entity: 'crew', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/contracts', entity: 'contract', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/equipment', entity: 'equipment', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    job: {
      defaultFields: [
        { name: 'job_number', type: 'string', required: true },
        { name: 'job_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'surfaces', type: 'json' },
        { name: 'square_footage', type: 'decimal' },
        { name: 'location', type: 'json', required: true },
        { name: 'access_notes', type: 'text' },
        { name: 'photos_before', type: 'json' },
        { name: 'photos_after', type: 'json' },
        { name: 'chemicals_used', type: 'json' },
        { name: 'water_usage_gallons', type: 'decimal' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'crew' },
        { type: 'belongsTo', target: 'estimate' },
        { type: 'belongsTo', target: 'contract' },
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
        { name: 'addresses', type: 'json' },
        { name: 'total_jobs', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'job' },
        { type: 'hasMany', target: 'estimate' },
        { type: 'hasMany', target: 'contract' },
      ],
    },
    estimate: {
      defaultFields: [
        { name: 'estimate_number', type: 'string', required: true },
        { name: 'estimate_date', type: 'date', required: true },
        { name: 'valid_until', type: 'date' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'location', type: 'json', required: true },
        { name: 'surfaces', type: 'json' },
        { name: 'square_footage', type: 'decimal' },
        { name: 'condition', type: 'enum' },
        { name: 'photos', type: 'json' },
        { name: 'labor_estimate', type: 'decimal' },
        { name: 'materials_estimate', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    crew: {
      defaultFields: [
        { name: 'crew_name', type: 'string', required: true },
        { name: 'crew_lead', type: 'string', required: true },
        { name: 'members', type: 'json' },
        { name: 'phone', type: 'phone' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'equipment_assigned', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'service_area', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'job' },
      ],
    },
    equipment: {
      defaultFields: [
        { name: 'equipment_name', type: 'string', required: true },
        { name: 'equipment_type', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'psi_rating', type: 'integer' },
        { name: 'gpm_rating', type: 'decimal' },
        { name: 'purchase_date', type: 'date' },
        { name: 'last_maintenance', type: 'date' },
        { name: 'next_maintenance', type: 'date' },
        { name: 'hours_used', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    contract: {
      defaultFields: [
        { name: 'contract_number', type: 'string', required: true },
        { name: 'contract_type', type: 'enum', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'frequency', type: 'enum', required: true },
        { name: 'services_included', type: 'json' },
        { name: 'locations', type: 'json' },
        { name: 'price_per_service', type: 'decimal' },
        { name: 'annual_value', type: 'decimal' },
        { name: 'auto_renew', type: 'boolean' },
        { name: 'terms', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default pressurewashingBlueprint;
