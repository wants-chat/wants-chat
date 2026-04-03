import { Blueprint } from './blueprint.interface';

/**
 * Donut Shop Blueprint
 */
export const donutshopBlueprint: Blueprint = {
  appType: 'donutshop',
  description: 'Donut shop app with menu, orders, catering, and loyalty rewards',

  coreEntities: ['order', 'menu_item', 'customer', 'catering', 'loyalty', 'inventory'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Menu', path: '/menu', icon: 'Cookie' },
        { label: 'Catering', path: '/catering', icon: 'Calendar' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Loyalty', path: '/loyalty', icon: 'Gift' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-orders', component: 'appointment-list', entity: 'order', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-queue', component: 'kanban-board', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/menu', name: 'Menu', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-grid', component: 'product-grid', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/catering', name: 'Catering', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'catering-calendar', component: 'appointment-calendar', entity: 'catering', position: 'main' },
      { id: 'catering-table', component: 'data-table', entity: 'catering', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/loyalty', name: 'Loyalty', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'loyalty-table', component: 'data-table', entity: 'loyalty', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-table', component: 'data-table', entity: 'inventory', position: 'main' },
    ]},
    { path: '/order', name: 'Order Online', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'menu-display', component: 'product-grid', entity: 'menu_item', position: 'main' },
      { id: 'order-form', component: 'booking-wizard', entity: 'order', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'GET', path: '/catering', entity: 'catering', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/catering', entity: 'catering', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/loyalty', entity: 'loyalty', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'inventory', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'order_type', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'pickup_time', type: 'datetime' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'payment_status', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    menu_item: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'dozen_price', type: 'decimal' },
        { name: 'half_dozen_price', type: 'decimal' },
        { name: 'calories', type: 'integer' },
        { name: 'allergens', type: 'json' },
        { name: 'is_seasonal', type: 'boolean' },
        { name: 'is_bestseller', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
        { name: 'sort_order', type: 'integer' },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'favorite_items', type: 'json' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'total_orders', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasOne', target: 'loyalty' },
      ],
    },
    catering: {
      defaultFields: [
        { name: 'catering_number', type: 'string', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'delivery_time', type: 'datetime' },
        { name: 'event_type', type: 'enum' },
        { name: 'guest_count', type: 'integer' },
        { name: 'items', type: 'json', required: true },
        { name: 'delivery_address', type: 'json' },
        { name: 'setup_required', type: 'boolean' },
        { name: 'special_requests', type: 'text' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    loyalty: {
      defaultFields: [
        { name: 'loyalty_number', type: 'string', required: true },
        { name: 'points', type: 'integer' },
        { name: 'lifetime_points', type: 'integer' },
        { name: 'tier', type: 'enum' },
        { name: 'free_items_earned', type: 'integer' },
        { name: 'free_items_redeemed', type: 'integer' },
        { name: 'birthday', type: 'date' },
        { name: 'birthday_reward_available', type: 'boolean' },
        { name: 'join_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    inventory: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'quantity', type: 'decimal', required: true },
        { name: 'unit', type: 'string' },
        { name: 'reorder_level', type: 'decimal' },
        { name: 'cost', type: 'decimal' },
        { name: 'supplier', type: 'string' },
        { name: 'last_restock', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
  },
};

export default donutshopBlueprint;
