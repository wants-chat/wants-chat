import { Blueprint } from './blueprint.interface';

/**
 * Logistics/Shipping Blueprint
 *
 * Defines the structure for a logistics/shipping application:
 * - Shipments tracking
 * - Fleet management
 * - Drivers
 * - Routes
 * - Warehouses
 */
export const logisticsBlueprint: Blueprint = {
  appType: 'logistics',
  description: 'Logistics app with shipments, fleet management, drivers, and tracking',

  coreEntities: ['shipment', 'vehicle', 'driver', 'route', 'warehouse', 'delivery', 'package'],

  commonFields: {
    timestamps: true,
    softDelete: true,
    userOwnership: true,
  },

  pages: [
    {
      path: '/',
      name: 'Dashboard',
      layout: 'dashboard',
      requiresAuth: true,
      sections: [
        { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
          { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
          { label: 'Shipments', path: '/shipments', icon: 'Package' },
          { label: 'Fleet', path: '/fleet', icon: 'Truck' },
          { label: 'Drivers', path: '/drivers', icon: 'Users' },
          { label: 'Routes', path: '/routes', icon: 'MapPin' },
          { label: 'Tracking', path: '/tracking', icon: 'Navigation' },
        ]}},
        { id: 'logistics-stats', component: 'logistics-stats', position: 'main' },
        { id: 'active-shipments', component: 'shipment-map', entity: 'shipment', position: 'main' },
        { id: 'recent-deliveries', component: 'delivery-list', entity: 'delivery', position: 'main', props: { title: 'Recent Deliveries', limit: 5 }},
      ],
    },
    { path: '/shipments', name: 'Shipments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'shipments-table', component: 'shipment-table', entity: 'shipment', position: 'main' },
    ]},
    { path: '/shipments/:id', name: 'Shipment Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'shipment-detail', component: 'shipment-detail', entity: 'shipment', position: 'main' },
      { id: 'shipment-timeline', component: 'shipment-timeline', entity: 'shipment', position: 'main' },
    ]},
    { path: '/fleet', name: 'Fleet', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'vehicle-grid', component: 'vehicle-grid', entity: 'vehicle', position: 'main' },
    ]},
    { path: '/drivers', name: 'Drivers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'driver-list', component: 'driver-list', entity: 'driver', position: 'main' },
    ]},
    { path: '/tracking', name: 'Live Tracking', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tracking-map', component: 'tracking-map', entity: 'shipment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/shipments', entity: 'shipment', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/shipments/:id', entity: 'shipment', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/shipments', entity: 'shipment', operation: 'create', requiresAuth: true },
    { method: 'PATCH', path: '/shipments/:id/status', entity: 'shipment', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/shipments/:id/tracking', entity: 'shipment', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/vehicles', entity: 'vehicle', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/drivers', entity: 'driver', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/deliveries', entity: 'delivery', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    shipment: {
      defaultFields: [
        { name: 'tracking_number', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'origin_address', type: 'json', required: true },
        { name: 'destination_address', type: 'json', required: true },
        { name: 'estimated_delivery', type: 'datetime' },
        { name: 'actual_delivery', type: 'datetime' },
        { name: 'weight', type: 'decimal' },
        { name: 'dimensions', type: 'json' },
        { name: 'current_location', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'driver' },
        { type: 'belongsTo', target: 'vehicle' },
        { type: 'hasMany', target: 'package' },
      ],
    },
    vehicle: {
      defaultFields: [
        { name: 'plate_number', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'make', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'capacity', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'current_location', type: 'json' },
        { name: 'fuel_level', type: 'integer' },
        { name: 'mileage', type: 'integer' },
      ],
      relationships: [{ type: 'belongsTo', target: 'driver' }],
    },
    driver: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'license_number', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'rating', type: 'decimal' },
        { name: 'avatar_url', type: 'image' },
      ],
      relationships: [
        { type: 'hasMany', target: 'shipment' },
        { type: 'hasMany', target: 'vehicle' },
      ],
    },
  },
};

export default logisticsBlueprint;
