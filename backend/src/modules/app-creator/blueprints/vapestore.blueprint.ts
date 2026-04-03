import { Blueprint } from './blueprint.interface';

/**
 * Vape Store Blueprint
 */
export const vapestoreBlueprint: Blueprint = {
  appType: 'vapestore',
  description: 'Vape shop app with products, e-liquids, devices, and customer loyalty',

  coreEntities: ['product', 'eliquid', 'device', 'customer', 'order', 'brand'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Package' },
        { label: 'E-Liquids', path: '/eliquids', icon: 'Droplet' },
        { label: 'Devices', path: '/devices', icon: 'Smartphone' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Brands', path: '/brands', icon: 'Award' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-orders', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/eliquids', name: 'E-Liquids', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'eliquid-grid', component: 'product-grid', entity: 'eliquid', position: 'main' },
    ]},
    { path: '/devices', name: 'Devices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'device-grid', component: 'product-grid', entity: 'device', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/brands', name: 'Brands', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'brand-table', component: 'data-table', entity: 'brand', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-display', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/eliquids', entity: 'eliquid', operation: 'list' },
    { method: 'GET', path: '/devices', entity: 'device', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/brands', entity: 'brand', operation: 'list' },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'brand' },
      ],
    },
    eliquid: {
      defaultFields: [
        { name: 'eliquid_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'flavor_profile', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'nicotine_strength', type: 'json' },
        { name: 'pg_vg_ratio', type: 'string' },
        { name: 'bottle_size', type: 'json' },
        { name: 'salt_nic', type: 'boolean' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'brand' },
      ],
    },
    device: {
      defaultFields: [
        { name: 'device_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'device_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'specifications', type: 'json' },
        { name: 'battery_capacity', type: 'string' },
        { name: 'wattage_range', type: 'string' },
        { name: 'tank_capacity', type: 'string' },
        { name: 'coil_compatibility', type: 'json' },
        { name: 'color_options', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'brand' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'age_verified', type: 'boolean' },
        { name: 'preferences', type: 'json' },
        { name: 'favorite_flavors', type: 'json' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'fulfillment_type', type: 'enum' },
        { name: 'age_verification', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    brand: {
      defaultFields: [
        { name: 'brand_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'website', type: 'string' },
        { name: 'country', type: 'string' },
        { name: 'logo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
        { type: 'hasMany', target: 'eliquid' },
        { type: 'hasMany', target: 'device' },
      ],
    },
  },
};

export default vapestoreBlueprint;
