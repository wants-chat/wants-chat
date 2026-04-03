import { Blueprint } from './blueprint.interface';

/**
 * Pizzeria / Pizza Restaurant Blueprint
 */
export const pizzeriaBlueprint: Blueprint = {
  appType: 'pizzeria',
  description: 'Pizzeria app with menu, orders, delivery, and catering',

  coreEntities: ['menu_item', 'order', 'customer', 'delivery', 'topping', 'staff'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Menu', path: '/menu', icon: 'Pizza' },
        { label: 'Deliveries', path: '/deliveries', icon: 'Truck' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Toppings', path: '/toppings', icon: 'CircleDot' },
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
    { path: '/deliveries', name: 'Deliveries', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'delivery-map', component: 'tracking-map', entity: 'delivery', position: 'main' },
      { id: 'delivery-table', component: 'data-table', entity: 'delivery', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/toppings', name: 'Toppings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'topping-table', component: 'data-table', entity: 'topping', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'staff', position: 'main' },
    ]},
    { path: '/order', name: 'Order Online', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-menu', component: 'menu-grid', entity: 'menu_item', position: 'main' },
      { id: 'pizza-builder', component: 'product-form', entity: 'order', position: 'main' },
      { id: 'cart', component: 'cart', entity: 'order', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'POST', path: '/menu', entity: 'menu_item', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/deliveries', entity: 'delivery', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/toppings', entity: 'topping', operation: 'list' },
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
        { name: 'crust_options', type: 'json' },
        { name: 'default_toppings', type: 'json' },
        { name: 'is_specialty', type: 'boolean' },
        { name: 'calories', type: 'integer' },
        { name: 'allergens', type: 'json' },
        { name: 'image_url', type: 'image' },
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
        { name: 'special_instructions', type: 'text' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'delivery_fee', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'tip', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
        { name: 'estimated_time', type: 'datetime' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasOne', target: 'delivery' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'addresses', type: 'json' },
        { name: 'favorite_orders', type: 'json' },
        { name: 'total_orders', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'loyalty_points', type: 'integer' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
      ],
    },
    delivery: {
      defaultFields: [
        { name: 'delivery_address', type: 'json', required: true },
        { name: 'driver_name', type: 'string' },
        { name: 'dispatched_at', type: 'datetime' },
        { name: 'delivered_at', type: 'datetime' },
        { name: 'status', type: 'enum', required: true },
        { name: 'delivery_notes', type: 'text' },
        { name: 'customer_signature', type: 'string' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
      ],
    },
    topping: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'allergens', type: 'json' },
        { name: 'is_premium', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
        { name: 'image_url', type: 'image' },
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
        { name: 'is_driver', type: 'boolean' },
        { name: 'vehicle_info', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default pizzeriaBlueprint;
