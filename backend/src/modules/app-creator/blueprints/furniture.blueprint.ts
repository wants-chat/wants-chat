import { Blueprint } from './blueprint.interface';

/**
 * Furniture Store Blueprint
 */
export const furnitureBlueprint: Blueprint = {
  appType: 'furniture',
  description: 'Furniture store app with inventory, orders, delivery, and design services',

  coreEntities: ['product', 'order', 'customer', 'delivery', 'design_consultation', 'showroom'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Armchair' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingBag' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Deliveries', path: '/deliveries', icon: 'Truck' },
        { label: 'Consultations', path: '/consultations', icon: 'Palette' },
        { label: 'Showroom', path: '/showroom', icon: 'Home' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'pending-orders', component: 'kanban-board', entity: 'order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-board', component: 'kanban-board', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/deliveries', name: 'Deliveries', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'delivery-calendar', component: 'appointment-calendar', entity: 'delivery', position: 'main' },
      { id: 'delivery-map', component: 'tracking-map', entity: 'delivery', position: 'main' },
      { id: 'delivery-table', component: 'data-table', entity: 'delivery', position: 'main' },
    ]},
    { path: '/consultations', name: 'Design Consultations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'consultation-calendar', component: 'appointment-calendar', entity: 'design_consultation', position: 'main' },
      { id: 'consultation-table', component: 'data-table', entity: 'design_consultation', position: 'main' },
    ]},
    { path: '/showroom', name: 'Showroom', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'showroom-table', component: 'data-table', entity: 'showroom', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-display', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/book-consultation', name: 'Book Consultation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'consultation-form', component: 'booking-wizard', entity: 'design_consultation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/deliveries', entity: 'delivery', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/consultations', entity: 'design_consultation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/consultations', entity: 'design_consultation', operation: 'create' },
    { method: 'GET', path: '/showroom', entity: 'showroom', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'subcategory', type: 'string' },
        { name: 'brand', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'dimensions', type: 'json' },
        { name: 'weight', type: 'decimal' },
        { name: 'materials', type: 'json' },
        { name: 'colors', type: 'json' },
        { name: 'finishes', type: 'json' },
        { name: 'regular_price', type: 'decimal', required: true },
        { name: 'sale_price', type: 'decimal' },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'lead_time_days', type: 'integer' },
        { name: 'assembly_required', type: 'boolean' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'delivery_fee', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'payment_status', type: 'enum' },
        { name: 'financing', type: 'json' },
        { name: 'delivery_address', type: 'json' },
        { name: 'delivery_instructions', type: 'text' },
        { name: 'assembly_requested', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
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
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'addresses', type: 'json' },
        { name: 'preferred_contact', type: 'enum' },
        { name: 'design_style', type: 'json' },
        { name: 'room_measurements', type: 'json' },
        { name: 'total_orders', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'design_consultation' },
      ],
    },
    delivery: {
      defaultFields: [
        { name: 'delivery_number', type: 'string', required: true },
        { name: 'delivery_date', type: 'date', required: true },
        { name: 'time_window', type: 'json' },
        { name: 'address', type: 'json', required: true },
        { name: 'access_instructions', type: 'text' },
        { name: 'floor', type: 'integer' },
        { name: 'elevator', type: 'boolean' },
        { name: 'crew', type: 'json' },
        { name: 'truck', type: 'string' },
        { name: 'items_delivered', type: 'json' },
        { name: 'assembly_performed', type: 'json' },
        { name: 'signature', type: 'string' },
        { name: 'photos', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
      ],
    },
    design_consultation: {
      defaultFields: [
        { name: 'consultation_number', type: 'string', required: true },
        { name: 'consultation_date', type: 'date', required: true },
        { name: 'consultation_time', type: 'datetime', required: true },
        { name: 'consultation_type', type: 'enum', required: true },
        { name: 'location', type: 'enum' },
        { name: 'address', type: 'json' },
        { name: 'rooms', type: 'json' },
        { name: 'budget', type: 'decimal' },
        { name: 'style_preferences', type: 'json' },
        { name: 'designer', type: 'string' },
        { name: 'recommendations', type: 'json' },
        { name: 'proposed_items', type: 'json' },
        { name: 'quote_total', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    showroom: {
      defaultFields: [
        { name: 'display_name', type: 'string', required: true },
        { name: 'room_type', type: 'enum', required: true },
        { name: 'location', type: 'string' },
        { name: 'products_displayed', type: 'json' },
        { name: 'style', type: 'enum' },
        { name: 'theme', type: 'string' },
        { name: 'setup_date', type: 'date' },
        { name: 'photos', type: 'json' },
        { name: 'floor_plan', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
  },
};

export default furnitureBlueprint;
