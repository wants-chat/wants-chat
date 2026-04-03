import { Blueprint } from './blueprint.interface';

/**
 * Juice Bar / Smoothie Shop Blueprint
 */
export const juicebarBlueprint: Blueprint = {
  appType: 'juicebar',
  description: 'Juice bar app with menu, custom blends, subscriptions, and health tracking',

  coreEntities: ['menu_item', 'order', 'customer', 'subscription', 'ingredient', 'staff'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Menu', path: '/menu', icon: 'Leaf' },
        { label: 'Subscriptions', path: '/subscriptions', icon: 'RefreshCw' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Ingredients', path: '/ingredients', icon: 'Package' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'order-queue', component: 'order-queue', entity: 'order', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-filters', component: 'order-filters', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/menu', name: 'Menu', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-categories', component: 'menu-categories', entity: 'menu_item', position: 'main' },
      { id: 'menu-grid', component: 'menu-grid', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/subscriptions', name: 'Subscriptions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'subscription-stats', component: 'stats-cards', position: 'main' },
      { id: 'subscription-table', component: 'data-table', entity: 'subscription', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/ingredients', name: 'Ingredients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'low-stock-alert', component: 'low-stock-alert', entity: 'ingredient', position: 'main' },
      { id: 'ingredient-table', component: 'data-table', entity: 'ingredient', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'staff', position: 'main' },
    ]},
    { path: '/order', name: 'Order Online', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-menu', component: 'menu-grid', entity: 'menu_item', position: 'main' },
      { id: 'cart', component: 'cart', entity: 'order', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'POST', path: '/menu', entity: 'menu_item', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/subscriptions', entity: 'subscription', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/ingredients', entity: 'ingredient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    menu_item: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'enum', required: true },
        { name: 'size_options', type: 'json' },
        { name: 'base_price', type: 'decimal', required: true },
        { name: 'ingredients', type: 'json', required: true },
        { name: 'add_ons', type: 'json' },
        { name: 'boosts', type: 'json' },
        { name: 'calories', type: 'integer' },
        { name: 'protein_g', type: 'integer' },
        { name: 'sugar_g', type: 'integer' },
        { name: 'fiber_g', type: 'integer' },
        { name: 'allergens', type: 'json' },
        { name: 'dietary_tags', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'order_type', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'customizations', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'pickup_time', type: 'datetime' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'subscription' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'dietary_preferences', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'health_goals', type: 'json' },
        { name: 'favorite_items', type: 'json' },
        { name: 'total_orders', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
      ],
      relationships: [
        { type: 'hasOne', target: 'subscription' },
        { type: 'hasMany', target: 'order' },
      ],
    },
    subscription: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'frequency', type: 'enum', required: true },
        { name: 'items_per_delivery', type: 'integer' },
        { name: 'selected_items', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'next_delivery', type: 'date' },
        { name: 'delivery_address', type: 'json' },
        { name: 'status', type: 'enum', required: true },
        { name: 'pause_until', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    ingredient: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum' },
        { name: 'unit', type: 'string' },
        { name: 'quantity', type: 'decimal', required: true },
        { name: 'reorder_level', type: 'decimal' },
        { name: 'cost_per_unit', type: 'decimal' },
        { name: 'supplier', type: 'string' },
        { name: 'is_organic', type: 'boolean' },
        { name: 'expiration_date', type: 'date' },
        { name: 'nutritional_info', type: 'json' },
      ],
      relationships: [],
    },
    staff: {
      defaultFields: [
        { name: 'employee_id', type: 'string', required: true },
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'role', type: 'enum', required: true },
        { name: 'hire_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default juicebarBlueprint;
