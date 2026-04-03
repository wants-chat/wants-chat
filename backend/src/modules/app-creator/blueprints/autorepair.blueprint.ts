import { Blueprint } from './blueprint.interface';

/**
 * Auto Repair Shop Blueprint
 */
export const autorepairBlueprint: Blueprint = {
  appType: 'autorepair',
  description: 'Auto repair shop with service tickets, vehicle tracking, parts inventory, and estimates',

  coreEntities: ['vehicle', 'customer', 'service_ticket', 'estimate', 'part', 'technician'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Service Tickets', path: '/tickets', icon: 'Wrench' },
        { label: 'Estimates', path: '/estimates', icon: 'FileText' },
        { label: 'Vehicles', path: '/vehicles', icon: 'Car' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Technicians', path: '/technicians', icon: 'HardHat' },
        { label: 'Parts', path: '/parts', icon: 'Cog' },
      ]}},
      { id: 'repair-stats', component: 'repair-stats', position: 'main' },
      { id: 'active-tickets', component: 'ticket-list-active', entity: 'service_ticket', position: 'main' },
      { id: 'technician-workload', component: 'technician-workload', entity: 'technician', position: 'main' },
    ]},
    { path: '/tickets', name: 'Service Tickets', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-filters', component: 'ticket-filters-repair', entity: 'service_ticket', position: 'main' },
      { id: 'ticket-table', component: 'ticket-table-repair', entity: 'service_ticket', position: 'main' },
    ]},
    { path: '/tickets/:id', name: 'Ticket Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-header', component: 'ticket-header-repair', entity: 'service_ticket', position: 'main' },
      { id: 'ticket-services', component: 'ticket-services', entity: 'service_ticket', position: 'main' },
      { id: 'ticket-parts', component: 'ticket-parts', entity: 'part', position: 'main' },
    ]},
    { path: '/tickets/new', name: 'New Ticket', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ticket-form', component: 'ticket-form-repair', entity: 'service_ticket', position: 'main' },
    ]},
    { path: '/estimates', name: 'Estimates', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'estimate-table', component: 'estimate-table-repair', entity: 'estimate', position: 'main' },
    ]},
    { path: '/estimates/:id', name: 'Estimate Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'estimate-detail', component: 'estimate-detail-repair', entity: 'estimate', position: 'main' },
    ]},
    { path: '/vehicles', name: 'Vehicles', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vehicle-table', component: 'vehicle-table-repair', entity: 'vehicle', position: 'main' },
    ]},
    { path: '/vehicles/:id', name: 'Vehicle History', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vehicle-profile', component: 'vehicle-profile', entity: 'vehicle', position: 'main' },
      { id: 'vehicle-service-history', component: 'vehicle-service-history', entity: 'service_ticket', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-repair', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-repair', entity: 'customer', position: 'main' },
      { id: 'customer-vehicles', component: 'customer-vehicles', entity: 'vehicle', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'technician-grid', component: 'technician-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/parts', name: 'Parts Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'parts-table', component: 'parts-table', entity: 'part', position: 'main' },
    ]},
    { path: '/appointment', name: 'Book Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'service-booking', component: 'service-booking-repair', entity: 'service_ticket', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/tickets', entity: 'service_ticket', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/tickets', entity: 'service_ticket', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/estimates', entity: 'estimate', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/estimates', entity: 'estimate', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/vehicles', entity: 'vehicle', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/parts', entity: 'part', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    vehicle: {
      defaultFields: [
        { name: 'vin', type: 'string' },
        { name: 'make', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'year', type: 'integer', required: true },
        { name: 'color', type: 'string' },
        { name: 'license_plate', type: 'string' },
        { name: 'mileage', type: 'integer' },
        { name: 'engine', type: 'string' },
        { name: 'transmission', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'service_ticket' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'vehicle' },
        { type: 'hasMany', target: 'service_ticket' },
      ],
    },
    service_ticket: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'priority', type: 'enum' },
        { name: 'complaint', type: 'text', required: true },
        { name: 'diagnosis', type: 'text' },
        { name: 'services', type: 'json' },
        { name: 'parts_used', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'started_at', type: 'datetime' },
        { name: 'completed_at', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'vehicle' },
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'technician' },
      ],
    },
    estimate: {
      defaultFields: [
        { name: 'estimate_number', type: 'string', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'services', type: 'json' },
        { name: 'parts', type: 'json' },
        { name: 'labor_estimate', type: 'decimal' },
        { name: 'parts_estimate', type: 'decimal' },
        { name: 'total_estimate', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'valid_until', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'vehicle' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    technician: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'specialties', type: 'json' },
        { name: 'certifications', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'service_ticket' }],
    },
    part: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'part_number', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'string' },
        { name: 'cost', type: 'decimal', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'reorder_level', type: 'integer' },
        { name: 'supplier', type: 'string' },
      ],
      relationships: [],
    },
  },
};

export default autorepairBlueprint;
