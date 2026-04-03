import { Blueprint } from './blueprint.interface';

/**
 * Deli / Sandwich Shop Blueprint
 */
export const deliBlueprint: Blueprint = {
  appType: 'deli',
  description: 'Deli/sandwich shop app with menu, orders, catering, and loyalty program',

  coreEntities: ['menu_item', 'order', 'catering_order', 'customer', 'ingredient', 'special'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Menu', path: '/menu', icon: 'UtensilsCrossed' },
        { label: 'Catering', path: '/catering', icon: 'Truck' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Ingredients', path: '/ingredients', icon: 'Carrot' },
        { label: 'Specials', path: '/specials', icon: 'Star' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'pending-orders', component: 'kanban-board', entity: 'order', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-board', component: 'kanban-board', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/menu', name: 'Menu', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-grid', component: 'product-grid', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/catering', name: 'Catering', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'catering-calendar', component: 'appointment-calendar', entity: 'catering_order', position: 'main' },
      { id: 'catering-table', component: 'data-table', entity: 'catering_order', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/ingredients', name: 'Ingredients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'ingredient-table', component: 'data-table', entity: 'ingredient', position: 'main' },
    ]},
    { path: '/specials', name: 'Specials', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'special-grid', component: 'product-grid', entity: 'special', position: 'main' },
    ]},
    { path: '/order', name: 'Order Online', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'menu-display', component: 'product-grid', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/catering-request', name: 'Request Catering', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'catering-form', component: 'booking-wizard', entity: 'catering_order', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'GET', path: '/catering', entity: 'catering_order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/catering', entity: 'catering_order', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/ingredients', entity: 'ingredient', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/specials', entity: 'special', operation: 'list' },
  ],

  entityConfig: {
    menu_item: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'ingredients', type: 'json' },
        { name: 'price_small', type: 'decimal' },
        { name: 'price_regular', type: 'decimal', required: true },
        { name: 'price_large', type: 'decimal' },
        { name: 'calories', type: 'integer' },
        { name: 'allergens', type: 'json' },
        { name: 'dietary_info', type: 'json' },
        { name: 'is_signature', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
        { name: 'sort_order', type: 'integer' },
      ],
      relationships: [],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'order_time', type: 'datetime', required: true },
        { name: 'order_type', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'customer_name', type: 'string' },
        { name: 'phone', type: 'phone' },
        { name: 'pickup_time', type: 'datetime' },
        { name: 'special_instructions', type: 'text' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    catering_order: {
      defaultFields: [
        { name: 'catering_number', type: 'string', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'event_time', type: 'datetime', required: true },
        { name: 'event_type', type: 'enum' },
        { name: 'guest_count', type: 'integer', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'delivery_address', type: 'json' },
        { name: 'menu_selections', type: 'json', required: true },
        { name: 'dietary_requirements', type: 'json' },
        { name: 'setup_included', type: 'boolean' },
        { name: 'serving_ware', type: 'enum' },
        { name: 'deposit', type: 'decimal' },
        { name: 'total', type: 'decimal' },
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
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'favorite_items', type: 'json' },
        { name: 'dietary_preferences', type: 'json' },
        { name: 'total_orders', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'catering_order' },
      ],
    },
    ingredient: {
      defaultFields: [
        { name: 'ingredient_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'supplier', type: 'string' },
        { name: 'unit', type: 'enum' },
        { name: 'quantity', type: 'decimal' },
        { name: 'reorder_level', type: 'decimal' },
        { name: 'cost_per_unit', type: 'decimal' },
        { name: 'is_allergen', type: 'boolean' },
        { name: 'allergen_type', type: 'enum' },
        { name: 'expiry_date', type: 'date' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    special: {
      defaultFields: [
        { name: 'special_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'day_of_week', type: 'enum' },
        { name: 'start_date', type: 'date' },
        { name: 'end_date', type: 'date' },
        { name: 'menu_items', type: 'json' },
        { name: 'regular_price', type: 'decimal' },
        { name: 'special_price', type: 'decimal' },
        { name: 'discount_percent', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default deliBlueprint;
