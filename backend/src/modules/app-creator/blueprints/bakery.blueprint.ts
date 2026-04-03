import { Blueprint } from './blueprint.interface';

/**
 * Bakery Blueprint
 */
export const bakeryBlueprint: Blueprint = {
  appType: 'bakery',
  description: 'Bakery with products, custom orders, catering, and inventory management',

  coreEntities: ['product', 'order', 'customer', 'custom_order', 'recipe', 'inventory'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Custom Orders', path: '/custom-orders', icon: 'Cake' },
        { label: 'Products', path: '/products', icon: 'CookingPot' },
        { label: 'Recipes', path: '/recipes', icon: 'BookOpen' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
      ]}},
      { id: 'bakery-stats', component: 'bakery-stats', position: 'main' },
      { id: 'today-orders', component: 'order-list-bakery', entity: 'order', position: 'main' },
      { id: 'custom-orders', component: 'custom-order-list', entity: 'custom_order', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-filters', component: 'order-filters-bakery', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'order-table-bakery', entity: 'order', position: 'main' },
    ]},
    { path: '/orders/:id', name: 'Order Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-detail', component: 'order-detail-bakery', entity: 'order', position: 'main' },
    ]},
    { path: '/custom-orders', name: 'Custom Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'custom-order-table', component: 'custom-order-table', entity: 'custom_order', position: 'main' },
    ]},
    { path: '/custom-orders/:id', name: 'Custom Order Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'custom-order-detail', component: 'custom-order-detail', entity: 'custom_order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid-bakery', entity: 'product', position: 'main' },
    ]},
    { path: '/products/:id', name: 'Product Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-detail', component: 'product-detail-bakery', entity: 'product', position: 'main' },
    ]},
    { path: '/recipes', name: 'Recipes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'recipe-grid', component: 'recipe-grid', entity: 'recipe', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-table', component: 'inventory-table-bakery', entity: 'inventory', position: 'main' },
    ]},
    { path: '/shop', name: 'Online Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-shop', component: 'public-shop-bakery', entity: 'product', position: 'main' },
    ]},
    { path: '/custom-cake', name: 'Custom Cake', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'custom-cake-form', component: 'custom-cake-form', entity: 'custom_order', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/custom-orders', entity: 'custom_order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/custom-orders', entity: 'custom_order', operation: 'create' },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/recipes', entity: 'recipe', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'inventory', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'ingredients', type: 'json' },
        { name: 'allergens', type: 'json' },
        { name: 'nutritional_info', type: 'json' },
        { name: 'is_available', type: 'boolean' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [{ type: 'belongsTo', target: 'recipe' }],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'pickup_date', type: 'date' },
        { name: 'pickup_time', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'total', type: 'decimal', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    custom_order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'servings', type: 'integer' },
        { name: 'flavor', type: 'string' },
        { name: 'filling', type: 'string' },
        { name: 'frosting', type: 'string' },
        { name: 'design', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'reference_images', type: 'json' },
        { name: 'price', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'total_orders', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'custom_order' },
      ],
    },
    recipe: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'string' },
        { name: 'yield_amount', type: 'string' },
        { name: 'prep_time', type: 'integer' },
        { name: 'bake_time', type: 'integer' },
        { name: 'ingredients', type: 'json', required: true },
        { name: 'instructions', type: 'text', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'product' }],
    },
    inventory: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'string' },
        { name: 'quantity', type: 'decimal', required: true },
        { name: 'unit', type: 'string', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'supplier', type: 'string' },
        { name: 'reorder_level', type: 'decimal' },
        { name: 'expiry_date', type: 'date' },
      ],
      relationships: [],
    },
  },
};

export default bakeryBlueprint;
