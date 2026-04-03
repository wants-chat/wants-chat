import { Blueprint } from './blueprint.interface';

/**
 * Home Improvement Store Blueprint
 */
export const homeimprovementBlueprint: Blueprint = {
  appType: 'homeimprovement',
  description: 'Home improvement store app with products, rentals, installations, and project planning',

  coreEntities: ['product', 'rental', 'installation', 'customer', 'order', 'project'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Package' },
        { label: 'Rentals', path: '/rentals', icon: 'Drill' },
        { label: 'Installations', path: '/installations', icon: 'Hammer' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Projects', path: '/projects', icon: 'Clipboard' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'pending-installations', component: 'appointment-list', entity: 'installation', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/rentals', name: 'Tool Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-calendar', component: 'appointment-calendar', entity: 'rental', position: 'main' },
      { id: 'rental-table', component: 'data-table', entity: 'rental', position: 'main' },
    ]},
    { path: '/installations', name: 'Installations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'installation-calendar', component: 'appointment-calendar', entity: 'installation', position: 'main' },
      { id: 'installation-table', component: 'data-table', entity: 'installation', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-board', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-display', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/book-installation', name: 'Book Installation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'installation-form', component: 'booking-wizard', entity: 'installation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/rentals', entity: 'rental', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/rentals', entity: 'rental', operation: 'create' },
    { method: 'GET', path: '/installations', entity: 'installation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/installations', entity: 'installation', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'brand', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'subcategory', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'specifications', type: 'json' },
        { name: 'dimensions', type: 'json' },
        { name: 'weight', type: 'decimal' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'aisle_location', type: 'string' },
        { name: 'is_rentable', type: 'boolean' },
        { name: 'rental_price', type: 'decimal' },
        { name: 'installation_available', type: 'boolean' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    rental: {
      defaultFields: [
        { name: 'rental_number', type: 'string', required: true },
        { name: 'rental_date', type: 'date', required: true },
        { name: 'return_date', type: 'date', required: true },
        { name: 'tool_info', type: 'json', required: true },
        { name: 'customer_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone', required: true },
        { name: 'id_on_file', type: 'boolean' },
        { name: 'deposit', type: 'decimal' },
        { name: 'rental_total', type: 'decimal' },
        { name: 'checked_out', type: 'boolean' },
        { name: 'checked_in', type: 'boolean' },
        { name: 'condition_notes', type: 'text' },
        { name: 'damage_charges', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    installation: {
      defaultFields: [
        { name: 'installation_number', type: 'string', required: true },
        { name: 'scheduled_date', type: 'date', required: true },
        { name: 'scheduled_time', type: 'datetime', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'products', type: 'json' },
        { name: 'address', type: 'json', required: true },
        { name: 'customer_name', type: 'string', required: true },
        { name: 'phone', type: 'phone', required: true },
        { name: 'installer', type: 'string' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'materials_cost', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'completed_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'order' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'property_info', type: 'json' },
        { name: 'contractor_license', type: 'string' },
        { name: 'is_pro', type: 'boolean' },
        { name: 'pro_discount', type: 'decimal' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'rental' },
        { type: 'hasMany', target: 'installation' },
        { type: 'hasMany', target: 'project' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'pro_discount', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'fulfillment_type', type: 'enum' },
        { name: 'delivery_address', type: 'json' },
        { name: 'delivery_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'room', type: 'string' },
        { name: 'dimensions', type: 'json' },
        { name: 'materials_list', type: 'json' },
        { name: 'estimated_cost', type: 'decimal' },
        { name: 'actual_cost', type: 'decimal' },
        { name: 'start_date', type: 'date' },
        { name: 'target_completion', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'progress_photos', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default homeimprovementBlueprint;
