import { Blueprint } from './blueprint.interface';

/**
 * Courier / Delivery Service Blueprint
 */
export const courierBlueprint: Blueprint = {
  appType: 'courier',
  description: 'Courier service app with deliveries, drivers, tracking, and proof of delivery',

  coreEntities: ['delivery', 'driver', 'customer', 'route', 'vehicle', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Deliveries', path: '/deliveries', icon: 'Package' },
        { label: 'Routes', path: '/routes', icon: 'Map' },
        { label: 'Drivers', path: '/drivers', icon: 'UserCheck' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Vehicles', path: '/vehicles', icon: 'Truck' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'live-tracking', component: 'tracking-map', entity: 'delivery', position: 'main' },
    ]},
    { path: '/deliveries', name: 'Deliveries', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'delivery-filters', component: 'filter-form', entity: 'delivery', position: 'main' },
      { id: 'delivery-table', component: 'data-table', entity: 'delivery', position: 'main' },
    ]},
    { path: '/routes', name: 'Routes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'route-map', component: 'tracking-map', entity: 'route', position: 'main' },
      { id: 'route-table', component: 'data-table', entity: 'route', position: 'main' },
    ]},
    { path: '/drivers', name: 'Drivers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'driver-grid', component: 'staff-grid', entity: 'driver', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/vehicles', name: 'Vehicles', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vehicle-table', component: 'data-table', entity: 'vehicle', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/ship', name: 'Ship Package', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'shipping-form', component: 'booking-wizard', entity: 'delivery', position: 'main' },
    ]},
    { path: '/track', name: 'Track Package', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'tracking-form', component: 'search-bar', entity: 'delivery', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/deliveries', entity: 'delivery', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/deliveries', entity: 'delivery', operation: 'create' },
    { method: 'GET', path: '/deliveries/:id', entity: 'delivery', operation: 'get' },
    { method: 'GET', path: '/routes', entity: 'route', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/drivers', entity: 'driver', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/vehicles', entity: 'vehicle', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    delivery: {
      defaultFields: [
        { name: 'tracking_number', type: 'string', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'pickup_address', type: 'json', required: true },
        { name: 'pickup_contact', type: 'json' },
        { name: 'pickup_time', type: 'datetime' },
        { name: 'delivery_address', type: 'json', required: true },
        { name: 'delivery_contact', type: 'json' },
        { name: 'delivery_time', type: 'datetime' },
        { name: 'package_details', type: 'json' },
        { name: 'weight_lbs', type: 'decimal' },
        { name: 'dimensions', type: 'json' },
        { name: 'special_instructions', type: 'text' },
        { name: 'signature_required', type: 'boolean' },
        { name: 'proof_of_delivery', type: 'json' },
        { name: 'rate', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'tracking_history', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'driver' },
        { type: 'belongsTo', target: 'route' },
      ],
    },
    driver: {
      defaultFields: [
        { name: 'driver_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'license_number', type: 'string' },
        { name: 'license_expiry', type: 'date' },
        { name: 'photo_url', type: 'image' },
        { name: 'current_location', type: 'json' },
        { name: 'deliveries_completed', type: 'integer' },
        { name: 'rating', type: 'decimal' },
        { name: 'schedule', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'vehicle' },
        { type: 'hasMany', target: 'delivery' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'company_name', type: 'string' },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'addresses', type: 'json' },
        { name: 'account_type', type: 'enum' },
        { name: 'billing_info', type: 'json' },
        { name: 'total_shipments', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
      ],
      relationships: [
        { type: 'hasMany', target: 'delivery' },
      ],
    },
    route: {
      defaultFields: [
        { name: 'route_name', type: 'string', required: true },
        { name: 'route_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime' },
        { name: 'end_time', type: 'datetime' },
        { name: 'stops', type: 'json' },
        { name: 'optimized_order', type: 'json' },
        { name: 'total_distance', type: 'decimal' },
        { name: 'total_deliveries', type: 'integer' },
        { name: 'completed_deliveries', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'driver' },
        { type: 'belongsTo', target: 'vehicle' },
        { type: 'hasMany', target: 'delivery' },
      ],
    },
    vehicle: {
      defaultFields: [
        { name: 'vehicle_id', type: 'string', required: true },
        { name: 'vehicle_type', type: 'enum', required: true },
        { name: 'make', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'year', type: 'integer' },
        { name: 'license_plate', type: 'string' },
        { name: 'capacity_lbs', type: 'decimal' },
        { name: 'cargo_dimensions', type: 'json' },
        { name: 'gps_tracking', type: 'json' },
        { name: 'insurance_expiry', type: 'date' },
        { name: 'last_maintenance', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'route' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'deliveries', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'fuel_surcharge', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default courierBlueprint;
