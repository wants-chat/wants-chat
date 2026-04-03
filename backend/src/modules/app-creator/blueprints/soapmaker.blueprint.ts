import { Blueprint } from './blueprint.interface';

/**
 * Soap Maker Blueprint
 */
export const soapmakerBlueprint: Blueprint = {
  appType: 'soapmaker',
  description: 'Handmade soap business app with products, wholesale, subscriptions, and batch tracking',

  coreEntities: ['product', 'order', 'batch', 'wholesale_account', 'subscription', 'customer'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'ShoppingBag' },
        { label: 'Orders', path: '/orders', icon: 'Package' },
        { label: 'Batches', path: '/batches', icon: 'Layers' },
        { label: 'Wholesale', path: '/wholesale', icon: 'Building' },
        { label: 'Subscriptions', path: '/subscriptions', icon: 'Repeat' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-orders', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/batches', name: 'Batches', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'batch-table', component: 'data-table', entity: 'batch', position: 'main' },
    ]},
    { path: '/wholesale', name: 'Wholesale', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'wholesale-table', component: 'data-table', entity: 'wholesale_account', position: 'main' },
    ]},
    { path: '/subscriptions', name: 'Subscriptions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'subscription-table', component: 'data-table', entity: 'subscription', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'POST', path: '/products', entity: 'product', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/batches', entity: 'batch', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/batches', entity: 'batch', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/wholesale', entity: 'wholesale_account', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/wholesale', entity: 'wholesale_account', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/subscriptions', entity: 'subscription', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'scent', type: 'string' },
        { name: 'ingredients', type: 'json' },
        { name: 'skin_benefits', type: 'json' },
        { name: 'weight', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'wholesale_price', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'is_vegan', type: 'boolean' },
        { name: 'is_palm_free', type: 'boolean' },
        { name: 'allergens', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'batch' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'order_type', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'shipping', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'shipping_address', type: 'json' },
        { name: 'shipping_method', type: 'enum' },
        { name: 'tracking_number', type: 'string' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'wholesale_account' },
      ],
    },
    batch: {
      defaultFields: [
        { name: 'batch_number', type: 'string', required: true },
        { name: 'batch_date', type: 'date', required: true },
        { name: 'product_type', type: 'string', required: true },
        { name: 'recipe', type: 'json' },
        { name: 'oils', type: 'json' },
        { name: 'additives', type: 'json' },
        { name: 'lye_water_ratio', type: 'string' },
        { name: 'superfat_percentage', type: 'decimal' },
        { name: 'quantity_made', type: 'integer' },
        { name: 'quantity_available', type: 'integer' },
        { name: 'cure_start_date', type: 'date' },
        { name: 'cure_end_date', type: 'date' },
        { name: 'cut_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
    wholesale_account: {
      defaultFields: [
        { name: 'company_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'business_type', type: 'enum' },
        { name: 'address', type: 'json' },
        { name: 'tax_id', type: 'string' },
        { name: 'discount_percentage', type: 'decimal' },
        { name: 'payment_terms', type: 'string' },
        { name: 'credit_limit', type: 'decimal' },
        { name: 'minimum_order', type: 'decimal' },
        { name: 'total_orders', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
      ],
    },
    subscription: {
      defaultFields: [
        { name: 'subscription_number', type: 'string', required: true },
        { name: 'plan_name', type: 'enum', required: true },
        { name: 'frequency', type: 'enum', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'next_shipment', type: 'date' },
        { name: 'product_preferences', type: 'json' },
        { name: 'skin_type', type: 'enum' },
        { name: 'allergies', type: 'json' },
        { name: 'shipping_address', type: 'json' },
        { name: 'payment_method', type: 'json' },
        { name: 'shipments_sent', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'skin_type', type: 'enum' },
        { name: 'scent_preferences', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'order_count', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'is_subscriber', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasOne', target: 'subscription' },
      ],
    },
  },
};

export default soapmakerBlueprint;
