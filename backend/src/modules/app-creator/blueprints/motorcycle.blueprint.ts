import { Blueprint } from './blueprint.interface';

/**
 * Motorcycle Dealership / Repair Shop Blueprint
 */
export const motorcycleBlueprint: Blueprint = {
  appType: 'motorcycle',
  description: 'Motorcycle dealership app with inventory, service, parts, and customers',

  coreEntities: ['motorcycle', 'service_order', 'customer', 'part', 'technician', 'sale'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Inventory', path: '/inventory', icon: 'Bike' },
        { label: 'Service', path: '/service', icon: 'Wrench' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Parts', path: '/parts', icon: 'Package' },
        { label: 'Technicians', path: '/technicians', icon: 'UserCheck' },
        { label: 'Sales', path: '/sales', icon: 'DollarSign' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'service-queue', component: 'kanban-board', entity: 'service_order', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'motorcycle-grid', component: 'product-grid', entity: 'motorcycle', position: 'main' },
    ]},
    { path: '/service', name: 'Service', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-calendar', component: 'appointment-calendar', entity: 'service_order', position: 'main' },
      { id: 'service-table', component: 'data-table', entity: 'service_order', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/parts', name: 'Parts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'parts-table', component: 'data-table', entity: 'part', position: 'main' },
    ]},
    { path: '/technicians', name: 'Technicians', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tech-grid', component: 'staff-grid', entity: 'technician', position: 'main' },
    ]},
    { path: '/sales', name: 'Sales', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sales-table', component: 'data-table', entity: 'sale', position: 'main' },
    ]},
    { path: '/browse', name: 'Browse Motorcycles', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'motorcycle', position: 'main' },
      { id: 'motorcycle-display', component: 'product-grid', entity: 'motorcycle', position: 'main' },
    ]},
    { path: '/service-appointment', name: 'Schedule Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'service-form', component: 'booking-wizard', entity: 'service_order', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/inventory', entity: 'motorcycle', operation: 'list' },
    { method: 'GET', path: '/service', entity: 'service_order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/service', entity: 'service_order', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/parts', entity: 'part', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/technicians', entity: 'technician', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/sales', entity: 'sale', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    motorcycle: {
      defaultFields: [
        { name: 'stock_number', type: 'string', required: true },
        { name: 'vin', type: 'string', required: true },
        { name: 'year', type: 'integer', required: true },
        { name: 'make', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'trim', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'engine_cc', type: 'integer' },
        { name: 'color', type: 'string' },
        { name: 'mileage', type: 'integer' },
        { name: 'condition', type: 'enum' },
        { name: 'msrp', type: 'decimal' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'features', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    service_order: {
      defaultFields: [
        { name: 'work_order_number', type: 'string', required: true },
        { name: 'drop_off_date', type: 'date', required: true },
        { name: 'drop_off_time', type: 'datetime' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'motorcycle_info', type: 'json', required: true },
        { name: 'mileage_in', type: 'integer' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'services_requested', type: 'json' },
        { name: 'diagnosis', type: 'text' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'parts_total', type: 'decimal' },
        { name: 'labor_total', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'warranty_claim', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'technician' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'motorcycles_owned', type: 'json' },
        { name: 'riding_experience', type: 'enum' },
        { name: 'license_type', type: 'enum' },
        { name: 'preferred_contact', type: 'enum' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'total_services', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_order' },
        { type: 'hasMany', target: 'sale' },
      ],
    },
    part: {
      defaultFields: [
        { name: 'part_number', type: 'string', required: true },
        { name: 'oem_number', type: 'string' },
        { name: 'part_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'compatible_makes', type: 'json' },
        { name: 'compatible_models', type: 'json' },
        { name: 'brand', type: 'string' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'reorder_level', type: 'integer' },
        { name: 'cost', type: 'decimal' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'location', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    technician: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'certifications', type: 'json' },
        { name: 'brand_certifications', type: 'json' },
        { name: 'specialties', type: 'json' },
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'schedule', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'service_order' },
      ],
    },
    sale: {
      defaultFields: [
        { name: 'sale_number', type: 'string', required: true },
        { name: 'sale_date', type: 'date', required: true },
        { name: 'sale_type', type: 'enum', required: true },
        { name: 'motorcycle_info', type: 'json' },
        { name: 'salesperson', type: 'string' },
        { name: 'trade_in', type: 'json' },
        { name: 'trade_in_value', type: 'decimal' },
        { name: 'sale_price', type: 'decimal', required: true },
        { name: 'fees', type: 'json' },
        { name: 'taxes', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'financing', type: 'json' },
        { name: 'warranty_sold', type: 'json' },
        { name: 'accessories_sold', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'motorcycle' },
      ],
    },
  },
};

export default motorcycleBlueprint;
