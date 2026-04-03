import { Blueprint } from './blueprint.interface';

/**
 * Toy Store Blueprint
 */
export const toystoreBlueprint: Blueprint = {
  appType: 'toystore',
  description: 'Toy store app with products, gift registry, events, and customer loyalty',

  coreEntities: ['product', 'gift_registry', 'event', 'customer', 'order', 'category'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Gamepad2' },
        { label: 'Gift Registry', path: '/registry', icon: 'Gift' },
        { label: 'Events', path: '/events', icon: 'PartyPopper' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Categories', path: '/categories', icon: 'Tag' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-events', component: 'appointment-list', entity: 'event', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/registry', name: 'Gift Registry', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'registry-table', component: 'data-table', entity: 'gift_registry', position: 'main' },
    ]},
    { path: '/events', name: 'Events', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'event-calendar', component: 'appointment-calendar', entity: 'event', position: 'main' },
      { id: 'event-table', component: 'data-table', entity: 'event', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/categories', name: 'Categories', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'category-table', component: 'data-table', entity: 'category', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-display', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/create-registry', name: 'Create Registry', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'registry-form', component: 'booking-wizard', entity: 'gift_registry', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/registry', entity: 'gift_registry', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/registry', entity: 'gift_registry', operation: 'create' },
    { method: 'GET', path: '/events', entity: 'event', operation: 'list' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'brand', type: 'string' },
        { name: 'age_range', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'features', type: 'json' },
        { name: 'educational_value', type: 'json' },
        { name: 'safety_warnings', type: 'text' },
        { name: 'materials', type: 'json' },
        { name: 'dimensions', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'is_bestseller', type: 'boolean' },
        { name: 'is_new', type: 'boolean' },
        { name: 'images', type: 'json' },
        { name: 'video_url', type: 'string' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
      ],
    },
    gift_registry: {
      defaultFields: [
        { name: 'registry_number', type: 'string', required: true },
        { name: 'registry_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date' },
        { name: 'child_name', type: 'string' },
        { name: 'child_age', type: 'integer' },
        { name: 'parent_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'items', type: 'json' },
        { name: 'items_purchased', type: 'json' },
        { name: 'is_public', type: 'boolean' },
        { name: 'message', type: 'text' },
        { name: 'expiry_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    event: {
      defaultFields: [
        { name: 'event_name', type: 'string', required: true },
        { name: 'event_type', type: 'enum', required: true },
        { name: 'event_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'age_group', type: 'json' },
        { name: 'capacity', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'price', type: 'decimal' },
        { name: 'activities', type: 'json' },
        { name: 'featured_products', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'children', type: 'json' },
        { name: 'interests', type: 'json' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'birthday_club', type: 'boolean' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'gift_registry' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'gift_wrap', type: 'boolean' },
        { name: 'gift_message', type: 'text' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'fulfillment_type', type: 'enum' },
        { name: 'registry_id', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'category_name', type: 'string', required: true },
        { name: 'parent_category', type: 'string' },
        { name: 'age_group', type: 'json' },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
  },
};

export default toystoreBlueprint;
