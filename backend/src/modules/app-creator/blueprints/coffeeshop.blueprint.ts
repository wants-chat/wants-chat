import { Blueprint } from './blueprint.interface';

/**
 * Coffee Shop / Cafe Blueprint
 */
export const coffeeshopBlueprint: Blueprint = {
  appType: 'coffeeshop',
  description: 'Coffee shop app with menu, orders, loyalty program, and customer management',

  coreEntities: ['menu_item', 'order', 'customer', 'loyalty_member', 'staff', 'inventory_item'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Menu', path: '/menu', icon: 'Coffee' },
        { label: 'Loyalty', path: '/loyalty', icon: 'Award' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
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
    { path: '/loyalty', name: 'Loyalty Program', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'loyalty-stats', component: 'stats-cards', position: 'main' },
      { id: 'member-table', component: 'data-table', entity: 'loyalty_member', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-filters', component: 'filter-form', entity: 'customer', position: 'main' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'low-stock-alert', component: 'low-stock-alert', entity: 'inventory_item', position: 'main' },
      { id: 'inventory-table', component: 'data-table', entity: 'inventory_item', position: 'main' },
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
    { method: 'PUT', path: '/orders/:id', entity: 'order', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'POST', path: '/menu', entity: 'menu_item', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/loyalty', entity: 'loyalty_member', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'inventory_item', operation: 'list', requiresAuth: true },
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
        { name: 'customizations', type: 'json' },
        { name: 'ingredients', type: 'json' },
        { name: 'allergens', type: 'json' },
        { name: 'calories', type: 'integer' },
        { name: 'caffeine_mg', type: 'integer' },
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
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'pickup_time', type: 'datetime' },
        { name: 'notes', type: 'text' },
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
        { name: 'favorite_drink', type: 'string' },
        { name: 'preferences', type: 'json' },
        { name: 'total_orders', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'last_visit', type: 'datetime' },
      ],
      relationships: [
        { type: 'hasOne', target: 'loyalty_member' },
        { type: 'hasMany', target: 'order' },
      ],
    },
    loyalty_member: {
      defaultFields: [
        { name: 'member_id', type: 'string', required: true },
        { name: 'join_date', type: 'date', required: true },
        { name: 'points_balance', type: 'integer' },
        { name: 'lifetime_points', type: 'integer' },
        { name: 'tier', type: 'enum' },
        { name: 'birthday', type: 'date' },
        { name: 'rewards_redeemed', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    inventory_item: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum' },
        { name: 'unit', type: 'string' },
        { name: 'quantity', type: 'decimal', required: true },
        { name: 'reorder_level', type: 'decimal' },
        { name: 'cost_per_unit', type: 'decimal' },
        { name: 'supplier', type: 'string' },
        { name: 'last_restocked', type: 'date' },
        { name: 'expiration_date', type: 'date' },
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
        { name: 'hourly_rate', type: 'decimal' },
        { name: 'photo_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default coffeeshopBlueprint;
