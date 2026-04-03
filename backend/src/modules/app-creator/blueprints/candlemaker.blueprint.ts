import { Blueprint } from './blueprint.interface';

/**
 * Candle Maker Blueprint
 */
export const candlemakerBlueprint: Blueprint = {
  appType: 'candlemaker',
  description: 'Candle making business app with products, custom orders, subscriptions, and workshops',

  coreEntities: ['product', 'order', 'subscription', 'workshop', 'inventory', 'customer'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'ShoppingBag' },
        { label: 'Orders', path: '/orders', icon: 'Package' },
        { label: 'Subscriptions', path: '/subscriptions', icon: 'Repeat' },
        { label: 'Workshops', path: '/workshops', icon: 'GraduationCap' },
        { label: 'Inventory', path: '/inventory', icon: 'Layers' },
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
    { path: '/subscriptions', name: 'Subscriptions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'subscription-table', component: 'data-table', entity: 'subscription', position: 'main' },
    ]},
    { path: '/workshops', name: 'Workshops', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'workshop-calendar', component: 'appointment-calendar', entity: 'workshop', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-table', component: 'data-table', entity: 'inventory', position: 'main' },
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
    { method: 'GET', path: '/subscriptions', entity: 'subscription', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/subscriptions', entity: 'subscription', operation: 'create' },
    { method: 'GET', path: '/workshops', entity: 'workshop', operation: 'list' },
    { method: 'POST', path: '/workshops', entity: 'workshop', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'inventory', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'scent', type: 'string', required: true },
        { name: 'scent_notes', type: 'json' },
        { name: 'wax_type', type: 'string' },
        { name: 'size', type: 'string' },
        { name: 'burn_time', type: 'string' },
        { name: 'vessel_type', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'quantity', type: 'integer' },
        { name: 'is_seasonal', type: 'boolean' },
        { name: 'is_limited', type: 'boolean' },
        { name: 'images', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'shipping', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'shipping_address', type: 'json' },
        { name: 'shipping_method', type: 'enum' },
        { name: 'tracking_number', type: 'string' },
        { name: 'gift_message', type: 'text' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
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
        { name: 'scent_preferences', type: 'json' },
        { name: 'excluded_scents', type: 'json' },
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
    workshop: {
      defaultFields: [
        { name: 'workshop_name', type: 'string', required: true },
        { name: 'workshop_type', type: 'enum', required: true },
        { name: 'workshop_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'scents_featured', type: 'json' },
        { name: 'candles_made', type: 'integer' },
        { name: 'max_participants', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'private_event', type: 'boolean' },
        { name: 'location', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    inventory: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'type', type: 'string' },
        { name: 'supplier', type: 'string' },
        { name: 'sku', type: 'string' },
        { name: 'quantity_on_hand', type: 'decimal', required: true },
        { name: 'unit', type: 'string' },
        { name: 'cost_per_unit', type: 'decimal' },
        { name: 'reorder_point', type: 'decimal' },
        { name: 'reorder_quantity', type: 'decimal' },
        { name: 'last_ordered', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'scent_preferences', type: 'json' },
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

export default candlemakerBlueprint;
