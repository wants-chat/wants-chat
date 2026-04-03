import { Blueprint } from './blueprint.interface';

/**
 * Laundry Service Blueprint
 */
export const laundryBlueprint: Blueprint = {
  appType: 'laundry',
  description: 'Laundry service app with orders, pickups, deliveries, and pricing',

  coreEntities: ['order', 'customer', 'service', 'driver', 'pricing', 'address'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Pickups', path: '/pickups', icon: 'Truck' },
        { label: 'Deliveries', path: '/deliveries', icon: 'Package' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Pricing', path: '/pricing', icon: 'DollarSign' },
      ]}},
      { id: 'laundry-stats', component: 'laundry-stats', position: 'main' },
      { id: 'pending-orders', component: 'order-list-laundry', entity: 'order', position: 'main' },
      { id: 'today-schedule', component: 'delivery-schedule', entity: 'order', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-filters', component: 'order-filters-laundry', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'order-table-laundry', entity: 'order', position: 'main' },
    ]},
    { path: '/orders/:id', name: 'Order Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-detail', component: 'order-detail-laundry', entity: 'order', position: 'main' },
      { id: 'order-timeline', component: 'order-timeline-laundry', entity: 'order', position: 'main' },
    ]},
    { path: '/orders/new', name: 'New Order', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-form', component: 'order-form-laundry', entity: 'order', position: 'main' },
    ]},
    { path: '/pickups', name: 'Pickups', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pickup-list', component: 'pickup-list', entity: 'order', position: 'main' },
    ]},
    { path: '/deliveries', name: 'Deliveries', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'delivery-list', component: 'delivery-list-laundry', entity: 'order', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-laundry', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-laundry', entity: 'customer', position: 'main' },
      { id: 'customer-orders', component: 'customer-orders-laundry', entity: 'order', position: 'main' },
    ]},
    { path: '/pricing', name: 'Pricing', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pricing-table', component: 'pricing-table-laundry', entity: 'pricing', position: 'main' },
    ]},
    { path: '/book', name: 'Book Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'booking-form-laundry', entity: 'order', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders/:id', entity: 'order', operation: 'get', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'PATCH', path: '/orders/:id/status', entity: 'order', operation: 'update', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers/:id', entity: 'customer', operation: 'get', requiresAuth: true },
    { method: 'GET', path: '/pricing', entity: 'pricing', operation: 'list' },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list' },
  ],

  entityConfig: {
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'total_weight', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'delivery_fee', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'pickup_date', type: 'datetime' },
        { name: 'delivery_date', type: 'datetime' },
        { name: 'pickup_address', type: 'json' },
        { name: 'delivery_address', type: 'json' },
        { name: 'special_instructions', type: 'text' },
        { name: 'payment_status', type: 'enum' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'driver' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'addresses', type: 'json' },
        { name: 'preferences', type: 'json' },
        { name: 'total_orders', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
      ],
      relationships: [{ type: 'hasMany', target: 'order' }],
    },
    service: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'enum' },
        { name: 'turnaround_hours', type: 'integer' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    pricing: {
      defaultFields: [
        { name: 'item_type', type: 'string', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'unit', type: 'enum' },
        { name: 'service_type', type: 'enum' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [{ type: 'belongsTo', target: 'service' }],
    },
  },
};

export default laundryBlueprint;
