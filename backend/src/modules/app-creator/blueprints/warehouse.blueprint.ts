import { Blueprint } from './blueprint.interface';

/**
 * Warehouse/3PL Blueprint
 */
export const warehouseBlueprint: Blueprint = {
  appType: 'warehouse',
  description: 'Warehouse and 3PL management app with inventory, orders, shipments, and locations',

  coreEntities: ['product', 'inventory', 'location', 'order', 'shipment', 'receiving', 'pick_list', 'carrier'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Receiving', path: '/receiving', icon: 'PackagePlus' },
        { label: 'Shipments', path: '/shipments', icon: 'Truck' },
        { label: 'Locations', path: '/locations', icon: 'MapPin' },
        { label: 'Reports', path: '/reports', icon: 'BarChart' },
      ]}},
      { id: 'warehouse-stats', component: 'warehouse-stats', position: 'main' },
      { id: 'pending-orders', component: 'order-list', entity: 'order', position: 'main', props: { title: 'Pending Orders', status: 'pending' }},
      { id: 'low-stock', component: 'low-stock-alerts', entity: 'inventory', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-filters', component: 'inventory-filters', entity: 'inventory', position: 'main' },
      { id: 'inventory-table', component: 'inventory-table', entity: 'inventory', position: 'main' },
    ]},
    { path: '/inventory/:id', name: 'Product Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-detail', component: 'product-detail', entity: 'product', position: 'main' },
      { id: 'stock-levels', component: 'stock-levels', entity: 'inventory', position: 'main' },
      { id: 'movement-history', component: 'movement-history', entity: 'inventory', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-filters', component: 'order-filters', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'order-table', entity: 'order', position: 'main' },
    ]},
    { path: '/orders/:id', name: 'Order Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-header', component: 'order-header', entity: 'order', position: 'main' },
      { id: 'order-items', component: 'order-items', entity: 'order', position: 'main' },
      { id: 'pick-list', component: 'pick-list', entity: 'pick_list', position: 'main' },
    ]},
    { path: '/receiving', name: 'Receiving', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'receiving-list', component: 'receiving-list', entity: 'receiving', position: 'main' },
    ]},
    { path: '/receiving/new', name: 'New Receiving', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'receiving-form', component: 'receiving-form', entity: 'receiving', position: 'main' },
    ]},
    { path: '/shipments', name: 'Shipments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'shipment-filters', component: 'shipment-filters', entity: 'shipment', position: 'main' },
      { id: 'shipment-table', component: 'shipment-table', entity: 'shipment', position: 'main' },
    ]},
    { path: '/shipments/:id', name: 'Shipment Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'shipment-detail', component: 'shipment-detail', entity: 'shipment', position: 'main' },
      { id: 'tracking-info', component: 'tracking-info', entity: 'shipment', position: 'main' },
    ]},
    { path: '/locations', name: 'Locations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'location-map', component: 'location-map', entity: 'location', position: 'main' },
      { id: 'location-list', component: 'location-list', entity: 'location', position: 'main' },
    ]},
    { path: '/pick', name: 'Pick Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pick-queue', component: 'pick-queue', entity: 'pick_list', position: 'main' },
    ]},
    { path: '/reports', name: 'Reports', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-report', component: 'inventory-report', position: 'main' },
      { id: 'fulfillment-report', component: 'fulfillment-report', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/inventory', entity: 'inventory', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/inventory/:id', entity: 'inventory', operation: 'get', requiresAuth: true },
    { method: 'PUT', path: '/inventory/:id', entity: 'inventory', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders/:id', entity: 'order', operation: 'get', requiresAuth: true },
    { method: 'PATCH', path: '/orders/:id/status', entity: 'order', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/shipments', entity: 'shipment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/shipments', entity: 'shipment', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/receiving', entity: 'receiving', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/receiving', entity: 'receiving', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/locations', entity: 'location', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'sku', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'barcode', type: 'string' },
        { name: 'weight', type: 'decimal' },
        { name: 'dimensions', type: 'json' },
        { name: 'category', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'reorder_point', type: 'integer' },
        { name: 'reorder_quantity', type: 'integer' },
      ],
      relationships: [{ type: 'hasMany', target: 'inventory' }],
    },
    inventory: {
      defaultFields: [
        { name: 'quantity', type: 'integer', required: true },
        { name: 'available_quantity', type: 'integer' },
        { name: 'reserved_quantity', type: 'integer' },
        { name: 'lot_number', type: 'string' },
        { name: 'expiry_date', type: 'date' },
        { name: 'received_date', type: 'date' },
        { name: 'cost', type: 'decimal' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'product' },
        { type: 'belongsTo', target: 'location' },
      ],
    },
    location: {
      defaultFields: [
        { name: 'code', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum' },
        { name: 'zone', type: 'string' },
        { name: 'aisle', type: 'string' },
        { name: 'rack', type: 'string' },
        { name: 'shelf', type: 'string' },
        { name: 'bin', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'inventory' }],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'priority', type: 'enum' },
        { name: 'customer_name', type: 'string' },
        { name: 'shipping_address', type: 'json' },
        { name: 'items', type: 'json', required: true },
        { name: 'total_items', type: 'integer' },
        { name: 'ship_by_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasOne', target: 'shipment' },
        { type: 'hasOne', target: 'pick_list' },
      ],
    },
    shipment: {
      defaultFields: [
        { name: 'tracking_number', type: 'string' },
        { name: 'carrier', type: 'string', required: true },
        { name: 'service', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'weight', type: 'decimal' },
        { name: 'dimensions', type: 'json' },
        { name: 'shipping_cost', type: 'decimal' },
        { name: 'label_url', type: 'url' },
        { name: 'shipped_at', type: 'datetime' },
        { name: 'delivered_at', type: 'datetime' },
      ],
      relationships: [{ type: 'belongsTo', target: 'order' }],
    },
    receiving: {
      defaultFields: [
        { name: 'po_number', type: 'string' },
        { name: 'supplier', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'expected_date', type: 'date' },
        { name: 'received_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
  },
};

export default warehouseBlueprint;
