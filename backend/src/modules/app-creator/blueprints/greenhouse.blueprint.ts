import { Blueprint } from './blueprint.interface';

/**
 * Greenhouse Blueprint
 */
export const greenhouseBlueprint: Blueprint = {
  appType: 'greenhouse',
  description: 'Greenhouse and nursery app with plants, growing zones, inventory, and sales',

  coreEntities: ['plant', 'zone', 'inventory', 'order', 'customer', 'supplier'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Plants', path: '/plants', icon: 'Flower2' },
        { label: 'Growing Zones', path: '/zones', icon: 'Grid3X3' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Suppliers', path: '/suppliers', icon: 'Truck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'inventory-summary', component: 'data-table', entity: 'inventory', position: 'main' },
    ]},
    { path: '/plants', name: 'Plants', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'plant', position: 'main' },
      { id: 'plant-grid', component: 'product-grid', entity: 'plant', position: 'main' },
    ]},
    { path: '/zones', name: 'Growing Zones', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'zone-grid', component: 'product-grid', entity: 'zone', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-table', component: 'data-table', entity: 'inventory', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/suppliers', name: 'Suppliers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'supplier-table', component: 'data-table', entity: 'supplier', position: 'main' },
    ]},
    { path: '/shop', name: 'Plant Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'plant-grid', component: 'product-grid', entity: 'plant', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/plants', entity: 'plant', operation: 'list' },
    { method: 'POST', path: '/plants', entity: 'plant', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/zones', entity: 'zone', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/zones', entity: 'zone', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'inventory', operation: 'list', requiresAuth: true },
    { method: 'PUT', path: '/inventory/:id', entity: 'inventory', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/suppliers', entity: 'supplier', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    plant: {
      defaultFields: [
        { name: 'plant_name', type: 'string', required: true },
        { name: 'scientific_name', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'size', type: 'enum' },
        { name: 'container_size', type: 'string' },
        { name: 'light_requirements', type: 'enum' },
        { name: 'water_requirements', type: 'enum' },
        { name: 'hardiness_zone', type: 'string' },
        { name: 'bloom_time', type: 'string' },
        { name: 'mature_height', type: 'string' },
        { name: 'mature_spread', type: 'string' },
        { name: 'growth_rate', type: 'enum' },
        { name: 'care_instructions', type: 'text' },
        { name: 'wholesale_price', type: 'decimal' },
        { name: 'retail_price', type: 'decimal', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'inventory' },
      ],
    },
    zone: {
      defaultFields: [
        { name: 'zone_name', type: 'string', required: true },
        { name: 'zone_type', type: 'enum', required: true },
        { name: 'area_sqft', type: 'decimal' },
        { name: 'temperature_min', type: 'decimal' },
        { name: 'temperature_max', type: 'decimal' },
        { name: 'humidity_min', type: 'decimal' },
        { name: 'humidity_max', type: 'decimal' },
        { name: 'light_type', type: 'enum' },
        { name: 'irrigation_type', type: 'string' },
        { name: 'bench_count', type: 'integer' },
        { name: 'capacity', type: 'integer' },
        { name: 'current_occupancy', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'inventory' },
      ],
    },
    inventory: {
      defaultFields: [
        { name: 'sku', type: 'string', required: true },
        { name: 'quantity_on_hand', type: 'integer', required: true },
        { name: 'quantity_reserved', type: 'integer' },
        { name: 'quantity_available', type: 'integer' },
        { name: 'reorder_point', type: 'integer' },
        { name: 'reorder_quantity', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'batch_number', type: 'string' },
        { name: 'propagation_date', type: 'date' },
        { name: 'ready_date', type: 'date' },
        { name: 'last_count_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'plant' },
        { type: 'belongsTo', target: 'zone' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'order_type', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'payment_status', type: 'enum' },
        { name: 'fulfillment_date', type: 'date' },
        { name: 'pickup_delivery', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'customer_type', type: 'enum', required: true },
        { name: 'company_name', type: 'string' },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'tax_exempt', type: 'boolean' },
        { name: 'tax_id', type: 'string' },
        { name: 'discount_percentage', type: 'decimal' },
        { name: 'credit_limit', type: 'decimal' },
        { name: 'payment_terms', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
      ],
    },
    supplier: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'product_categories', type: 'json' },
        { name: 'lead_time_days', type: 'integer' },
        { name: 'minimum_order', type: 'decimal' },
        { name: 'payment_terms', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default greenhouseBlueprint;
