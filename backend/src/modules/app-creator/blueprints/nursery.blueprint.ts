import { Blueprint } from './blueprint.interface';

/**
 * Plant Nursery/Garden Center Blueprint
 */
export const nurseryBlueprint: Blueprint = {
  appType: 'nursery',
  description: 'Plant nursery/garden center with plants, inventory, orders, and landscaping services',

  coreEntities: ['plant', 'category', 'order', 'customer', 'service', 'inventory'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Plants', path: '/plants', icon: 'Flower2' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Services', path: '/services', icon: 'Shovel' },
      ]}},
      { id: 'nursery-stats', component: 'nursery-stats', position: 'main' },
      { id: 'recent-orders', component: 'order-list-recent-nursery', entity: 'order', position: 'main' },
      { id: 'low-stock', component: 'plant-low-stock', entity: 'plant', position: 'main' },
    ]},
    { path: '/plants', name: 'Plants', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'plant-filters', component: 'plant-filters', entity: 'plant', position: 'main' },
      { id: 'plant-grid', component: 'plant-grid', entity: 'plant', position: 'main' },
    ]},
    { path: '/plants/:id', name: 'Plant Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'plant-detail', component: 'plant-detail', entity: 'plant', position: 'main' },
      { id: 'plant-care', component: 'plant-care-info', entity: 'plant', position: 'main' },
    ]},
    { path: '/plants/new', name: 'Add Plant', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'plant-form', component: 'plant-form', entity: 'plant', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-table', component: 'inventory-table-nursery', entity: 'inventory', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-filters', component: 'order-filters-nursery', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'order-table-nursery', entity: 'order', position: 'main' },
    ]},
    { path: '/orders/:id', name: 'Order Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-detail', component: 'order-detail-nursery', entity: 'order', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-nursery', entity: 'customer', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-grid', component: 'service-grid-nursery', entity: 'service', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-catalog', component: 'public-catalog-nursery', entity: 'plant', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/plants', entity: 'plant', operation: 'list' },
    { method: 'POST', path: '/plants', entity: 'plant', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'inventory', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
  ],

  entityConfig: {
    plant: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'scientific_name', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'size', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'description', type: 'text' },
        { name: 'care_instructions', type: 'text' },
        { name: 'sunlight', type: 'enum' },
        { name: 'water_needs', type: 'enum' },
        { name: 'hardiness_zone', type: 'string' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'inventory' }],
    },
    inventory: {
      defaultFields: [
        { name: 'quantity', type: 'integer', required: true },
        { name: 'location', type: 'string' },
        { name: 'pot_size', type: 'string' },
        { name: 'cost', type: 'decimal' },
        { name: 'received_date', type: 'date' },
      ],
      relationships: [{ type: 'belongsTo', target: 'plant' }],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal', required: true },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'delivery_method', type: 'enum' },
        { name: 'delivery_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'order' }],
    },
    service: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal' },
        { name: 'price_type', type: 'enum' },
        { name: 'duration', type: 'string' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default nurseryBlueprint;
