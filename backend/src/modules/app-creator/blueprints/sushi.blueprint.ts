import { Blueprint } from './blueprint.interface';

/**
 * Sushi Restaurant / Japanese Restaurant Blueprint
 */
export const sushiBlueprint: Blueprint = {
  appType: 'sushi',
  description: 'Sushi restaurant app with menu, orders, reservations, and omakase bookings',

  coreEntities: ['menu_item', 'order', 'customer', 'reservation', 'chef', 'staff'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Menu', path: '/menu', icon: 'Fish' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Chefs', path: '/chefs', icon: 'ChefHat' },
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
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'appointment-calendar', entity: 'reservation', position: 'main' },
      { id: 'reservation-table', component: 'data-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/chefs', name: 'Chefs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'chef-grid', component: 'staff-grid', entity: 'chef', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'staff', position: 'main' },
    ]},
    { path: '/order', name: 'Order Online', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-menu', component: 'menu-grid', entity: 'menu_item', position: 'main' },
      { id: 'cart', component: 'cart', entity: 'order', position: 'main' },
    ]},
    { path: '/reserve', name: 'Make Reservation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'reservation-form', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'POST', path: '/menu', entity: 'menu_item', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/chefs', entity: 'chef', operation: 'list' },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    menu_item: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'japanese_name', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'enum', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'pieces', type: 'integer' },
        { name: 'ingredients', type: 'json' },
        { name: 'allergens', type: 'json' },
        { name: 'is_raw', type: 'boolean' },
        { name: 'is_vegetarian', type: 'boolean' },
        { name: 'is_gluten_free', type: 'boolean' },
        { name: 'spice_level', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_seasonal', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'order_type', type: 'enum', required: true },
        { name: 'table_number', type: 'string' },
        { name: 'items', type: 'json', required: true },
        { name: 'special_requests', type: 'text' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'service_charge', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'reservation' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'favorite_items', type: 'json' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'vip_status', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'reservation' },
      ],
    },
    reservation: {
      defaultFields: [
        { name: 'reservation_date', type: 'date', required: true },
        { name: 'reservation_time', type: 'datetime', required: true },
        { name: 'party_size', type: 'integer', required: true },
        { name: 'seating_preference', type: 'enum' },
        { name: 'occasion', type: 'string' },
        { name: 'special_requests', type: 'text' },
        { name: 'omakase_booking', type: 'boolean' },
        { name: 'chef_selected', type: 'string' },
        { name: 'status', type: 'enum', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'contact_phone', type: 'phone', required: true },
        { name: 'contact_email', type: 'email' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    chef: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'title', type: 'string' },
        { name: 'specialty', type: 'json' },
        { name: 'years_experience', type: 'integer' },
        { name: 'bio', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'omakase_available', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
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

export default sushiBlueprint;
