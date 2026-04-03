import { Blueprint } from './blueprint.interface';

/**
 * Tea Shop / Boba Tea Blueprint
 */
export const teashopBlueprint: Blueprint = {
  appType: 'teashop',
  description: 'Tea shop/boba app with menu, orders, loyalty program, and customizations',

  coreEntities: ['order', 'menu_item', 'customer', 'topping', 'loyalty', 'promotion'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Menu', path: '/menu', icon: 'Coffee' },
        { label: 'Toppings', path: '/toppings', icon: 'Circle' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Loyalty', path: '/loyalty', icon: 'Gift' },
        { label: 'Promotions', path: '/promotions', icon: 'Tag' },
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
    { path: '/toppings', name: 'Toppings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'topping-table', component: 'data-table', entity: 'topping', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/loyalty', name: 'Loyalty Program', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'loyalty-table', component: 'data-table', entity: 'loyalty', position: 'main' },
    ]},
    { path: '/promotions', name: 'Promotions', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'promo-table', component: 'data-table', entity: 'promotion', position: 'main' },
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
    { method: 'GET', path: '/toppings', entity: 'topping', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/loyalty', entity: 'loyalty', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/promotions', entity: 'promotion', operation: 'list' },
  ],

  entityConfig: {
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'order_type', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'customizations', type: 'json' },
        { name: 'pickup_time', type: 'datetime' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
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
        { name: 'base_price', type: 'decimal', required: true },
        { name: 'sizes', type: 'json' },
        { name: 'ice_options', type: 'json' },
        { name: 'sweetness_options', type: 'json' },
        { name: 'default_toppings', type: 'json' },
        { name: 'available_toppings', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'calories', type: 'integer' },
        { name: 'caffeine_mg', type: 'integer' },
        { name: 'is_featured', type: 'boolean' },
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
        { name: 'favorite_orders', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'total_orders', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasOne', target: 'loyalty' },
      ],
    },
    topping: {
      defaultFields: [
        { name: 'topping_name', type: 'string', required: true },
        { name: 'category', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'calories', type: 'integer' },
        { name: 'is_popular', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
        { name: 'sort_order', type: 'integer' },
      ],
      relationships: [],
    },
    loyalty: {
      defaultFields: [
        { name: 'loyalty_number', type: 'string', required: true },
        { name: 'tier', type: 'enum' },
        { name: 'points', type: 'integer' },
        { name: 'lifetime_points', type: 'integer' },
        { name: 'free_drinks_earned', type: 'integer' },
        { name: 'free_drinks_used', type: 'integer' },
        { name: 'birthday', type: 'date' },
        { name: 'birthday_reward_used', type: 'boolean' },
        { name: 'join_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    promotion: {
      defaultFields: [
        { name: 'promo_name', type: 'string', required: true },
        { name: 'promo_code', type: 'string' },
        { name: 'promo_type', type: 'enum', required: true },
        { name: 'discount_type', type: 'enum' },
        { name: 'discount_value', type: 'decimal' },
        { name: 'min_purchase', type: 'decimal' },
        { name: 'applicable_items', type: 'json' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'usage_limit', type: 'integer' },
        { name: 'times_used', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default teashopBlueprint;
