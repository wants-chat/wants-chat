import { Blueprint } from './blueprint.interface';

/**
 * Trucking / Freight Company Blueprint
 */
export const truckingBlueprint: Blueprint = {
  appType: 'trucking',
  description: 'Trucking company app with loads, drivers, trucks, dispatch, and compliance',

  coreEntities: ['load', 'driver', 'truck', 'customer', 'dispatch', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Loads', path: '/loads', icon: 'Package' },
        { label: 'Dispatch', path: '/dispatch', icon: 'Map' },
        { label: 'Drivers', path: '/drivers', icon: 'UserCheck' },
        { label: 'Trucks', path: '/trucks', icon: 'Truck' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-loads', component: 'tracking-map', entity: 'load', position: 'main' },
    ]},
    { path: '/loads', name: 'Loads', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'load-filters', component: 'filter-form', entity: 'load', position: 'main' },
      { id: 'load-table', component: 'data-table', entity: 'load', position: 'main' },
    ]},
    { path: '/dispatch', name: 'Dispatch Board', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'dispatch-map', component: 'tracking-map', entity: 'dispatch', position: 'main' },
      { id: 'dispatch-table', component: 'data-table', entity: 'dispatch', position: 'main' },
    ]},
    { path: '/drivers', name: 'Drivers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'driver-grid', component: 'staff-grid', entity: 'driver', position: 'main' },
    ]},
    { path: '/trucks', name: 'Fleet', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'truck-table', component: 'data-table', entity: 'truck', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/quote', name: 'Get Quote', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'quote-form', component: 'booking-wizard', entity: 'load', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/loads', entity: 'load', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/loads', entity: 'load', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/dispatch', entity: 'dispatch', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/drivers', entity: 'driver', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/trucks', entity: 'truck', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    load: {
      defaultFields: [
        { name: 'load_number', type: 'string', required: true },
        { name: 'load_type', type: 'enum', required: true },
        { name: 'commodity', type: 'string' },
        { name: 'weight_lbs', type: 'decimal' },
        { name: 'pickup_location', type: 'json', required: true },
        { name: 'pickup_date', type: 'datetime', required: true },
        { name: 'delivery_location', type: 'json', required: true },
        { name: 'delivery_date', type: 'datetime' },
        { name: 'distance_miles', type: 'decimal' },
        { name: 'rate', type: 'decimal' },
        { name: 'rate_per_mile', type: 'decimal' },
        { name: 'accessorials', type: 'json' },
        { name: 'special_instructions', type: 'text' },
        { name: 'bol_number', type: 'string' },
        { name: 'po_number', type: 'string' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'driver' },
        { type: 'belongsTo', target: 'truck' },
      ],
    },
    driver: {
      defaultFields: [
        { name: 'driver_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'cdl_number', type: 'string', required: true },
        { name: 'cdl_state', type: 'string' },
        { name: 'cdl_expiry', type: 'date' },
        { name: 'cdl_class', type: 'enum' },
        { name: 'endorsements', type: 'json' },
        { name: 'medical_card_expiry', type: 'date' },
        { name: 'hire_date', type: 'date' },
        { name: 'home_terminal', type: 'string' },
        { name: 'pay_type', type: 'enum' },
        { name: 'pay_rate', type: 'decimal' },
        { name: 'hos_status', type: 'json' },
        { name: 'current_location', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'truck' },
        { type: 'hasMany', target: 'load' },
      ],
    },
    truck: {
      defaultFields: [
        { name: 'unit_number', type: 'string', required: true },
        { name: 'truck_type', type: 'enum', required: true },
        { name: 'make', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'year', type: 'integer' },
        { name: 'vin', type: 'string' },
        { name: 'license_plate', type: 'string' },
        { name: 'dot_inspection_date', type: 'date' },
        { name: 'registration_expiry', type: 'date' },
        { name: 'insurance_expiry', type: 'date' },
        { name: 'mileage', type: 'integer' },
        { name: 'fuel_type', type: 'enum' },
        { name: 'trailer_type', type: 'enum' },
        { name: 'eld_device', type: 'string' },
        { name: 'gps_tracking', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'load' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'billing_address', type: 'json' },
        { name: 'mc_number', type: 'string' },
        { name: 'credit_limit', type: 'decimal' },
        { name: 'payment_terms', type: 'string' },
        { name: 'factoring', type: 'boolean' },
        { name: 'total_loads', type: 'integer' },
        { name: 'total_revenue', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'load' },
      ],
    },
    dispatch: {
      defaultFields: [
        { name: 'dispatch_date', type: 'date', required: true },
        { name: 'assigned_loads', type: 'json' },
        { name: 'route_plan', type: 'json' },
        { name: 'estimated_miles', type: 'decimal' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'fuel_stops', type: 'json' },
        { name: 'rest_stops', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'driver' },
        { type: 'belongsTo', target: 'truck' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'fuel_surcharge', type: 'decimal' },
        { name: 'accessorials', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'load' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default truckingBlueprint;
