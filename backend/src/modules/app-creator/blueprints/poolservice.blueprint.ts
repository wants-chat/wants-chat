import { Blueprint } from './blueprint.interface';

/**
 * Pool Service / Pool Maintenance Blueprint
 */
export const poolserviceBlueprint: Blueprint = {
  appType: 'poolservice',
  description: 'Pool service app with maintenance routes, chemical tracking, repairs, and customer management',

  coreEntities: ['pool', 'service_visit', 'customer', 'technician', 'repair', 'chemical_log'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Route Map', path: '/routes', icon: 'Map' },
        { label: 'Pools', path: '/pools', icon: 'Waves' },
        { label: 'Services', path: '/services', icon: 'Wrench' },
        { label: 'Repairs', path: '/repairs', icon: 'Tool' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Technicians', path: '/technicians', icon: 'UserCheck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-route', component: 'route-list', entity: 'service_visit', position: 'main' },
    ]},
    { path: '/routes', name: 'Route Map', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'route-map', component: 'tracking-map', entity: 'service_visit', position: 'main' },
    ]},
    { path: '/pools', name: 'Pools', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pool-table', component: 'data-table', entity: 'pool', position: 'main' },
    ]},
    { path: '/pools/:id', name: 'Pool Details', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pool-profile', component: 'property-details', entity: 'pool', position: 'main' },
      { id: 'chemical-chart', component: 'chart-widget', entity: 'chemical_log', position: 'main' },
    ]},
    { path: '/services', name: 'Service Visits', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-calendar', component: 'appointment-calendar', entity: 'service_visit', position: 'main' },
      { id: 'service-table', component: 'data-table', entity: 'service_visit', position: 'main' },
    ]},
    { path: '/repairs', name: 'Repairs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'repair-table', component: 'data-table', entity: 'repair', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'staff-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/quote', name: 'Get Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-form', component: 'booking-wizard', entity: 'pool', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/pools', entity: 'pool', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/pools', entity: 'pool', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/services', entity: 'service_visit', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/services', entity: 'service_visit', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/repairs', entity: 'repair', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    pool: {
      defaultFields: [
        { name: 'address', type: 'json', required: true },
        { name: 'pool_type', type: 'enum', required: true },
        { name: 'surface_type', type: 'enum' },
        { name: 'gallons', type: 'integer' },
        { name: 'dimensions', type: 'json' },
        { name: 'has_spa', type: 'boolean' },
        { name: 'spa_gallons', type: 'integer' },
        { name: 'pump_info', type: 'json' },
        { name: 'filter_info', type: 'json' },
        { name: 'heater_info', type: 'json' },
        { name: 'salt_system', type: 'boolean' },
        { name: 'access_info', type: 'text' },
        { name: 'service_day', type: 'enum' },
        { name: 'photos', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'service_visit' },
        { type: 'hasMany', target: 'chemical_log' },
      ],
    },
    service_visit: {
      defaultFields: [
        { name: 'visit_date', type: 'date', required: true },
        { name: 'arrival_time', type: 'datetime' },
        { name: 'departure_time', type: 'datetime' },
        { name: 'services_performed', type: 'json' },
        { name: 'chemicals_added', type: 'json' },
        { name: 'ph_level', type: 'decimal' },
        { name: 'chlorine_level', type: 'decimal' },
        { name: 'alkalinity', type: 'decimal' },
        { name: 'calcium_hardness', type: 'decimal' },
        { name: 'salt_level', type: 'decimal' },
        { name: 'water_temp', type: 'decimal' },
        { name: 'filter_psi', type: 'decimal' },
        { name: 'issues_found', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'pool' },
        { type: 'belongsTo', target: 'technician' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'billing_address', type: 'json' },
        { name: 'payment_method', type: 'json' },
        { name: 'service_plan', type: 'enum' },
        { name: 'monthly_rate', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'pool' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'certifications', type: 'json' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'assigned_routes', type: 'json' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_visit' },
      ],
    },
    repair: {
      defaultFields: [
        { name: 'repair_number', type: 'string', required: true },
        { name: 'reported_date', type: 'date', required: true },
        { name: 'scheduled_date', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'issue_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'diagnosis', type: 'text' },
        { name: 'parts_needed', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'photos', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'pool' },
        { type: 'belongsTo', target: 'technician' },
      ],
    },
    chemical_log: {
      defaultFields: [
        { name: 'log_date', type: 'datetime', required: true },
        { name: 'ph_level', type: 'decimal' },
        { name: 'chlorine_level', type: 'decimal' },
        { name: 'alkalinity', type: 'decimal' },
        { name: 'calcium_hardness', type: 'decimal' },
        { name: 'cyanuric_acid', type: 'decimal' },
        { name: 'salt_level', type: 'decimal' },
        { name: 'phosphate_level', type: 'decimal' },
        { name: 'water_temp', type: 'decimal' },
        { name: 'chemicals_added', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'pool' },
        { type: 'belongsTo', target: 'service_visit' },
      ],
    },
  },
};

export default poolserviceBlueprint;
