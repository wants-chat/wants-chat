import { Blueprint } from './blueprint.interface';

/**
 * Ice Cream Shop / Gelato Parlor Blueprint
 */
export const icecreamBlueprint: Blueprint = {
  appType: 'icecream',
  description: 'Ice cream shop app with flavors, orders, catering, and loyalty rewards',

  coreEntities: ['flavor', 'order', 'customer', 'catering_order', 'topping', 'staff'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Flavors', path: '/flavors', icon: 'IceCream' },
        { label: 'Catering', path: '/catering', icon: 'Cake' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Toppings', path: '/toppings', icon: 'Cherry' },
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
    { path: '/flavors', name: 'Flavors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'flavor-grid', component: 'menu-grid', entity: 'flavor', position: 'main' },
    ]},
    { path: '/catering', name: 'Catering Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'catering-calendar', component: 'appointment-calendar', entity: 'catering_order', position: 'main' },
      { id: 'catering-table', component: 'data-table', entity: 'catering_order', position: 'main' },
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
    { path: '/menu', name: 'Our Flavors', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-flavors', component: 'menu-grid', entity: 'flavor', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/flavors', entity: 'flavor', operation: 'list' },
    { method: 'POST', path: '/flavors', entity: 'flavor', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/catering', entity: 'catering_order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/catering', entity: 'catering_order', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/toppings', entity: 'topping', operation: 'list' },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    flavor: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'enum', required: true },
        { name: 'base_type', type: 'enum' },
        { name: 'price_per_scoop', type: 'decimal', required: true },
        { name: 'ingredients', type: 'json' },
        { name: 'allergens', type: 'json' },
        { name: 'is_dairy_free', type: 'boolean' },
        { name: 'is_vegan', type: 'boolean' },
        { name: 'is_sugar_free', type: 'boolean' },
        { name: 'calories_per_serving', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'color', type: 'string' },
        { name: 'is_seasonal', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'serving_type', type: 'enum' },
        { name: 'toppings', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
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
        { name: 'birthday', type: 'date' },
        { name: 'favorite_flavors', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'total_visits', type: 'integer' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
      ],
    },
    catering_order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'event_time', type: 'datetime', required: true },
        { name: 'event_type', type: 'enum' },
        { name: 'guest_count', type: 'integer', required: true },
        { name: 'flavors_selected', type: 'json', required: true },
        { name: 'toppings_bar', type: 'boolean' },
        { name: 'cones_cups', type: 'json' },
        { name: 'delivery_address', type: 'json' },
        { name: 'setup_required', type: 'boolean' },
        { name: 'special_requests', type: 'text' },
        { name: 'quote_amount', type: 'decimal' },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'contact_phone', type: 'phone', required: true },
        { name: 'contact_email', type: 'email' },
      ],
      relationships: [],
    },
    topping: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'allergens', type: 'json' },
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
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default icecreamBlueprint;
