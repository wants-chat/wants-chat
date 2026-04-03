import { Blueprint } from './blueprint.interface';

/**
 * Food Truck Blueprint
 */
export const foodtruckBlueprint: Blueprint = {
  appType: 'foodtruck',
  description: 'Food truck app with menu, locations, schedule, and orders',

  coreEntities: ['menu_item', 'order', 'location', 'schedule', 'customer', 'category'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Menu', path: '/menu', icon: 'UtensilsCrossed' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Schedule', path: '/schedule', icon: 'Calendar' },
        { label: 'Locations', path: '/locations', icon: 'MapPin' },
        { label: 'Reports', path: '/reports', icon: 'BarChart' },
      ]}},
      { id: 'foodtruck-stats', component: 'foodtruck-stats', position: 'main' },
      { id: 'active-orders', component: 'active-orders-foodtruck', entity: 'order', position: 'main' },
      { id: 'today-location', component: 'today-location', entity: 'schedule', position: 'main' },
    ]},
    { path: '/menu', name: 'Menu', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-grid', component: 'menu-grid-foodtruck', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/menu/:id', name: 'Menu Item', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-item-detail', component: 'menu-item-detail-foodtruck', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/menu/new', name: 'Add Menu Item', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-item-form', component: 'menu-item-form', entity: 'menu_item', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-queue', component: 'order-queue-foodtruck', entity: 'order', position: 'main' },
    ]},
    { path: '/orders/:id', name: 'Order Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-detail', component: 'order-detail-foodtruck', entity: 'order', position: 'main' },
    ]},
    { path: '/schedule', name: 'Schedule', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'schedule-calendar', component: 'schedule-calendar-foodtruck', entity: 'schedule', position: 'main' },
    ]},
    { path: '/locations', name: 'Locations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'location-list', component: 'location-list-foodtruck', entity: 'location', position: 'main' },
    ]},
    { path: '/order', name: 'Order Online', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'truck-location', component: 'truck-location', entity: 'schedule', position: 'main' },
      { id: 'public-menu', component: 'public-menu-foodtruck', entity: 'menu_item', position: 'main' },
      { id: 'order-form', component: 'order-form-foodtruck', entity: 'order', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/menu', entity: 'menu_item', operation: 'list' },
    { method: 'GET', path: '/menu/:id', entity: 'menu_item', operation: 'get' },
    { method: 'POST', path: '/menu', entity: 'menu_item', operation: 'create', requiresAuth: true },
    { method: 'PUT', path: '/menu/:id', entity: 'menu_item', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'PATCH', path: '/orders/:id/status', entity: 'order', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/schedule', entity: 'schedule', operation: 'list' },
    { method: 'GET', path: '/locations', entity: 'location', operation: 'list' },
  ],

  entityConfig: {
    menu_item: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'is_available', type: 'boolean' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'allergens', type: 'json' },
        { name: 'spice_level', type: 'enum' },
        { name: 'prep_time', type: 'integer' },
        { name: 'calories', type: 'integer' },
      ],
      relationships: [{ type: 'belongsTo', target: 'category' }],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal', required: true },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'customer_name', type: 'string' },
        { name: 'customer_phone', type: 'phone' },
        { name: 'pickup_time', type: 'datetime' },
        { name: 'special_instructions', type: 'text' },
        { name: 'payment_method', type: 'enum' },
        { name: 'payment_status', type: 'enum' },
      ],
      relationships: [{ type: 'belongsTo', target: 'location' }],
    },
    location: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'address', type: 'string', required: true },
        { name: 'coordinates', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_favorite', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'schedule' }],
    },
    schedule: {
      defaultFields: [
        { name: 'date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime', required: true },
        { name: 'status', type: 'enum' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'location' }],
    },
  },
};

export default foodtruckBlueprint;
