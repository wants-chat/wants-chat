import { Blueprint } from './blueprint.interface';

/**
 * Florist Blueprint
 */
export const floristBlueprint: Blueprint = {
  appType: 'florist',
  description: 'Flower shop with arrangements, orders, delivery management, and event bookings',

  coreEntities: ['arrangement', 'order', 'customer', 'delivery', 'event', 'inventory'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Arrangements', path: '/arrangements', icon: 'Flower2' },
        { label: 'Deliveries', path: '/deliveries', icon: 'Truck' },
        { label: 'Events', path: '/events', icon: 'Calendar' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
      ]}},
      { id: 'florist-stats', component: 'florist-stats', position: 'main' },
      { id: 'today-orders', component: 'order-list-florist', entity: 'order', position: 'main' },
      { id: 'delivery-schedule', component: 'delivery-schedule-florist', entity: 'delivery', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-filters', component: 'order-filters-florist', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'order-table-florist', entity: 'order', position: 'main' },
    ]},
    { path: '/orders/:id', name: 'Order Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-detail', component: 'order-detail-florist', entity: 'order', position: 'main' },
    ]},
    { path: '/orders/new', name: 'New Order', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-form', component: 'order-form-florist', entity: 'order', position: 'main' },
    ]},
    { path: '/arrangements', name: 'Arrangements', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'arrangement-grid', component: 'arrangement-grid', entity: 'arrangement', position: 'main' },
    ]},
    { path: '/arrangements/:id', name: 'Arrangement Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'arrangement-detail', component: 'arrangement-detail', entity: 'arrangement', position: 'main' },
    ]},
    { path: '/deliveries', name: 'Deliveries', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'delivery-calendar', component: 'delivery-calendar-florist', entity: 'delivery', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-table', component: 'event-table-florist', entity: 'event', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-table', component: 'inventory-table-florist', entity: 'inventory', position: 'main' },
    ]},
    { path: '/shop', name: 'Online Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-shop', component: 'public-shop-florist', entity: 'arrangement', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/arrangements', entity: 'arrangement', operation: 'list' },
    { method: 'GET', path: '/deliveries', entity: 'delivery', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'inventory', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    arrangement: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'category', type: 'enum' },
        { name: 'occasion', type: 'enum' },
        { name: 'size', type: 'enum' },
        { name: 'image_url', type: 'image' },
        { name: 'flowers', type: 'json' },
        { name: 'is_available', type: 'boolean' },
        { name: 'seasonal', type: 'boolean' },
      ],
      relationships: [{ type: 'hasMany', target: 'order' }],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal', required: true },
        { name: 'delivery_fee', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'message_card', type: 'text' },
        { name: 'special_instructions', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasOne', target: 'delivery' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'addresses', type: 'json' },
        { name: 'total_orders', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'hasMany', target: 'order' }],
    },
    delivery: {
      defaultFields: [
        { name: 'delivery_date', type: 'date', required: true },
        { name: 'delivery_time', type: 'string' },
        { name: 'recipient_name', type: 'string', required: true },
        { name: 'recipient_phone', type: 'phone' },
        { name: 'address', type: 'json', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'driver_notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'order' }],
    },
    event: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'venue', type: 'string' },
        { name: 'budget', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'requirements', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    inventory: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', required: true },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'unit', type: 'string' },
        { name: 'cost', type: 'decimal' },
        { name: 'supplier', type: 'string' },
        { name: 'reorder_level', type: 'integer' },
      ],
      relationships: [],
    },
  },
};

export default floristBlueprint;
