import { Blueprint } from './blueprint.interface';

/**
 * Tailor/Alterations Shop Blueprint
 */
export const tailorBlueprint: Blueprint = {
  appType: 'tailor',
  description: 'Tailor/alterations shop with orders, measurements, fittings, and custom garments',

  coreEntities: ['order', 'customer', 'garment', 'measurement', 'fitting', 'fabric'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ClipboardList' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Fittings', path: '/fittings', icon: 'Calendar' },
        { label: 'Fabrics', path: '/fabrics', icon: 'Palette' },
      ]}},
      { id: 'tailor-stats', component: 'tailor-stats', position: 'main' },
      { id: 'orders-in-progress', component: 'order-list-progress-tailor', entity: 'order', position: 'main' },
      { id: 'upcoming-fittings', component: 'fitting-list-upcoming', entity: 'fitting', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-filters', component: 'order-filters-tailor', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'order-table-tailor', entity: 'order', position: 'main' },
    ]},
    { path: '/orders/:id', name: 'Order Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-header', component: 'order-header-tailor', entity: 'order', position: 'main' },
      { id: 'order-garments', component: 'order-garments', entity: 'garment', position: 'main' },
      { id: 'order-fittings', component: 'order-fittings', entity: 'fitting', position: 'main' },
    ]},
    { path: '/orders/new', name: 'New Order', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-form', component: 'order-form-tailor', entity: 'order', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-tailor', entity: 'customer', position: 'main' },
    ]},
    { path: '/customers/:id', name: 'Customer Profile', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-profile', component: 'customer-profile-tailor', entity: 'customer', position: 'main' },
      { id: 'customer-measurements', component: 'customer-measurements', entity: 'measurement', position: 'main' },
      { id: 'customer-orders', component: 'customer-orders-tailor', entity: 'order', position: 'main' },
    ]},
    { path: '/fittings', name: 'Fittings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'fitting-calendar', component: 'fitting-calendar', entity: 'fitting', position: 'main' },
    ]},
    { path: '/fabrics', name: 'Fabrics', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'fabric-grid', component: 'fabric-grid', entity: 'fabric', position: 'main' },
    ]},
    { path: '/book', name: 'Book Appointment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-form', component: 'public-booking-tailor', entity: 'fitting', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/fittings', entity: 'fitting', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/fittings', entity: 'fitting', operation: 'create' },
    { method: 'GET', path: '/fabrics', entity: 'fabric', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_type', type: 'enum', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'rush_order', type: 'boolean' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'balance', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasMany', target: 'garment' },
        { type: 'hasMany', target: 'fitting' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'preferences', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'measurement' },
      ],
    },
    garment: {
      defaultFields: [
        { name: 'type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'alterations', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'photos', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
        { type: 'belongsTo', target: 'fabric' },
      ],
    },
    measurement: {
      defaultFields: [
        { name: 'measurement_date', type: 'date', required: true },
        { name: 'measurements', type: 'json', required: true },
        { name: 'notes', type: 'text' },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    fitting: {
      defaultFields: [
        { name: 'fitting_date', type: 'datetime', required: true },
        { name: 'fitting_number', type: 'integer' },
        { name: 'status', type: 'enum', required: true },
        { name: 'adjustments', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    fabric: {
      defaultFields: [
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum' },
        { name: 'color', type: 'string' },
        { name: 'pattern', type: 'string' },
        { name: 'price_per_yard', type: 'decimal' },
        { name: 'quantity_yards', type: 'decimal' },
        { name: 'supplier', type: 'string' },
        { name: 'image', type: 'image' },
      ],
      relationships: [],
    },
  },
};

export default tailorBlueprint;
