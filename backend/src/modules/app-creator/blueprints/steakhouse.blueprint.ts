import { Blueprint } from './blueprint.interface';

/**
 * Steakhouse / Fine Dining Restaurant Blueprint
 */
export const steakhouseBlueprint: Blueprint = {
  appType: 'steakhouse',
  description: 'Steakhouse app with menu, reservations, wine list, and private dining',

  coreEntities: ['menu_item', 'order', 'customer', 'reservation', 'wine', 'staff'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Reservations', path: '/reservations', icon: 'Calendar' },
        { label: 'Menu', path: '/menu', icon: 'Utensils' },
        { label: 'Wine List', path: '/wines', icon: 'Wine' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Staff', path: '/staff', icon: 'UserCheck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-reservations', component: 'appointment-list', entity: 'reservation', position: 'main' },
    ]},
    { path: '/reservations', name: 'Reservations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'reservation-calendar', component: 'appointment-calendar', entity: 'reservation', position: 'main' },
      { id: 'reservation-table', component: 'data-table', entity: 'reservation', position: 'main' },
    ]},
    { path: '/menu', name: 'Menu', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-categories', component: 'menu-categories', entity: 'menu_item', position: 'main' },
      { id: 'menu-grid', component: 'menu-grid', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/wines', name: 'Wine List', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'wine-filters', component: 'filter-form', entity: 'wine', position: 'main' },
      { id: 'wine-table', component: 'data-table', entity: 'wine', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/staff', name: 'Staff', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'staff-grid', component: 'staff-grid', entity: 'staff', position: 'main' },
    ]},
    { path: '/reserve', name: 'Make Reservation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'reservation-form', component: 'booking-wizard', entity: 'reservation', position: 'main' },
    ]},
    { path: '/menus', name: 'Our Menu', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-menu', component: 'menu-grid', entity: 'menu_item', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/reservations', entity: 'reservation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/reservations', entity: 'reservation', operation: 'create' },
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'POST', path: '/menu', entity: 'menu_item', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/wines', entity: 'wine', operation: 'list' },
    { method: 'POST', path: '/wines', entity: 'wine', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/staff', entity: 'staff', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    menu_item: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'enum', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cut_type', type: 'enum' },
        { name: 'weight_oz', type: 'decimal' },
        { name: 'aging_days', type: 'integer' },
        { name: 'grade', type: 'string' },
        { name: 'source', type: 'string' },
        { name: 'cooking_temps', type: 'json' },
        { name: 'sides_included', type: 'json' },
        { name: 'allergens', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_signature', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'datetime', required: true },
        { name: 'table_number', type: 'string' },
        { name: 'items', type: 'json', required: true },
        { name: 'wines_ordered', type: 'json' },
        { name: 'special_requests', type: 'text' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'gratuity', type: 'decimal' },
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
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'wine_preferences', type: 'json' },
        { name: 'steak_preferences', type: 'json' },
        { name: 'total_visits', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'vip_status', type: 'enum' },
        { name: 'notes', type: 'text' },
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
        { name: 'private_dining', type: 'boolean' },
        { name: 'occasion', type: 'string' },
        { name: 'special_requests', type: 'text' },
        { name: 'wine_pairing', type: 'boolean' },
        { name: 'deposit_required', type: 'boolean' },
        { name: 'deposit_paid', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'contact_phone', type: 'phone', required: true },
        { name: 'contact_email', type: 'email' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    wine: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'winery', type: 'string', required: true },
        { name: 'vintage', type: 'integer' },
        { name: 'region', type: 'string' },
        { name: 'country', type: 'string' },
        { name: 'varietal', type: 'string' },
        { name: 'category', type: 'enum' },
        { name: 'price_bottle', type: 'decimal', required: true },
        { name: 'price_glass', type: 'decimal' },
        { name: 'tasting_notes', type: 'text' },
        { name: 'food_pairings', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'inventory_count', type: 'integer' },
        { name: 'is_available', type: 'boolean' },
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
        { name: 'is_sommelier', type: 'boolean' },
        { name: 'hire_date', type: 'date' },
        { name: 'schedule', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default steakhouseBlueprint;
