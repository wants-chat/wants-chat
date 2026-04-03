import { Blueprint } from './blueprint.interface';

/**
 * Gift Shop / Souvenir Store Blueprint
 */
export const giftshopBlueprint: Blueprint = {
  appType: 'giftshop',
  description: 'Gift shop app with products, orders, gift wrapping, and custom orders',

  coreEntities: ['product', 'order', 'customer', 'category', 'gift_wrap', 'custom_order'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Gift' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Custom Orders', path: '/custom', icon: 'Sparkles' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Categories', path: '/categories', icon: 'Tag' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-orders', component: 'appointment-list', entity: 'order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/custom', name: 'Custom Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'custom-table', component: 'data-table', entity: 'custom_order', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/categories', name: 'Categories', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'category-table', component: 'data-table', entity: 'category', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-table', component: 'data-table', entity: 'product', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'shop-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/custom', entity: 'custom_order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/custom', entity: 'custom_order', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'sale_price', type: 'decimal' },
        { name: 'sku', type: 'string' },
        { name: 'barcode', type: 'string' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'reorder_level', type: 'integer' },
        { name: 'cost', type: 'decimal' },
        { name: 'vendor', type: 'string' },
        { name: 'images', type: 'json' },
        { name: 'tags', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'order_type', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'gift_wrap', type: 'boolean' },
        { name: 'gift_message', type: 'text' },
        { name: 'shipping_address', type: 'json' },
        { name: 'shipping_method', type: 'enum' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'shipping', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'addresses', type: 'json' },
        { name: 'preferences', type: 'json' },
        { name: 'total_orders', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'category_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'sort_order', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
    gift_wrap: {
      defaultFields: [
        { name: 'wrap_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    custom_order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'request_date', type: 'date', required: true },
        { name: 'item_type', type: 'enum' },
        { name: 'description', type: 'text', required: true },
        { name: 'personalization', type: 'json' },
        { name: 'reference_images', type: 'json' },
        { name: 'quantity', type: 'integer' },
        { name: 'due_date', type: 'date' },
        { name: 'estimated_price', type: 'decimal' },
        { name: 'final_price', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default giftshopBlueprint;
