import { Blueprint } from './blueprint.interface';

/**
 * Liquor Store Blueprint
 */
export const liquorstoreBlueprint: Blueprint = {
  appType: 'liquorstore',
  description: 'Liquor store app with products, inventory, tastings, and delivery',

  coreEntities: ['product', 'tasting', 'customer', 'order', 'supplier', 'category'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Wine' },
        { label: 'Tastings', path: '/tastings', icon: 'GlassWater' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Suppliers', path: '/suppliers', icon: 'Truck' },
        { label: 'Categories', path: '/categories', icon: 'Tag' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-tastings', component: 'appointment-list', entity: 'tasting', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/tastings', name: 'Tastings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tasting-calendar', component: 'appointment-calendar', entity: 'tasting', position: 'main' },
      { id: 'tasting-table', component: 'data-table', entity: 'tasting', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/suppliers', name: 'Suppliers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'supplier-table', component: 'data-table', entity: 'supplier', position: 'main' },
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
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/tastings', entity: 'tasting', operation: 'list' },
    { method: 'POST', path: '/tastings/register', entity: 'tasting', operation: 'update' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/suppliers', entity: 'supplier', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'subcategory', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'brand', type: 'string' },
        { name: 'origin', type: 'string' },
        { name: 'abv', type: 'decimal' },
        { name: 'volume', type: 'string' },
        { name: 'vintage', type: 'integer' },
        { name: 'tasting_notes', type: 'text' },
        { name: 'pairing_suggestions', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'reorder_level', type: 'integer' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'belongsTo', target: 'supplier' },
      ],
    },
    tasting: {
      defaultFields: [
        { name: 'tasting_name', type: 'string', required: true },
        { name: 'tasting_type', type: 'enum', required: true },
        { name: 'tasting_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'featured_products', type: 'json' },
        { name: 'presenter', type: 'string' },
        { name: 'capacity', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'price', type: 'decimal' },
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
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'age_verified', type: 'boolean' },
        { name: 'preferences', type: 'json' },
        { name: 'wine_club_member', type: 'boolean' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'fulfillment_type', type: 'enum' },
        { name: 'delivery_address', type: 'json' },
        { name: 'age_verification', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    supplier: {
      defaultFields: [
        { name: 'supplier_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'license_number', type: 'string' },
        { name: 'product_categories', type: 'json' },
        { name: 'minimum_order', type: 'decimal' },
        { name: 'payment_terms', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'category_name', type: 'string', required: true },
        { name: 'parent_category', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'display_order', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
  },
};

export default liquorstoreBlueprint;
