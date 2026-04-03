import { Blueprint } from './blueprint.interface';

/**
 * Thrift Store Blueprint
 */
export const thriftstoreBlueprint: Blueprint = {
  appType: 'thriftstore',
  description: 'Thrift store app with donations, inventory, volunteers, and sales',

  coreEntities: ['item', 'donation', 'donor', 'volunteer', 'sale', 'category'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
        { label: 'Donations', path: '/donations', icon: 'Gift' },
        { label: 'Donors', path: '/donors', icon: 'Heart' },
        { label: 'Volunteers', path: '/volunteers', icon: 'Users' },
        { label: 'Sales', path: '/sales', icon: 'DollarSign' },
        { label: 'Categories', path: '/categories', icon: 'Tag' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-donations', component: 'appointment-list', entity: 'donation', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'item', position: 'main' },
      { id: 'item-grid', component: 'product-grid', entity: 'item', position: 'main' },
    ]},
    { path: '/donations', name: 'Donations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donation-calendar', component: 'appointment-calendar', entity: 'donation', position: 'main' },
      { id: 'donation-table', component: 'data-table', entity: 'donation', position: 'main' },
    ]},
    { path: '/donors', name: 'Donors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'donor-table', component: 'data-table', entity: 'donor', position: 'main' },
    ]},
    { path: '/volunteers', name: 'Volunteers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'volunteer-table', component: 'data-table', entity: 'volunteer', position: 'main' },
    ]},
    { path: '/sales', name: 'Sales', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sale-table', component: 'data-table', entity: 'sale', position: 'main' },
    ]},
    { path: '/categories', name: 'Categories', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'category-table', component: 'data-table', entity: 'category', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'item', position: 'main' },
      { id: 'item-display', component: 'product-grid', entity: 'item', position: 'main' },
    ]},
    { path: '/donate', name: 'Schedule Donation', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'donation-form', component: 'booking-wizard', entity: 'donation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/inventory', entity: 'item', operation: 'list' },
    { method: 'GET', path: '/donations', entity: 'donation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/donations', entity: 'donation', operation: 'create' },
    { method: 'GET', path: '/donors', entity: 'donor', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/volunteers', entity: 'volunteer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/sales', entity: 'sale', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sales', entity: 'sale', operation: 'create' },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
  ],

  entityConfig: {
    item: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'condition', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'size', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'quantity', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'donation_date', type: 'date' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'belongsTo', target: 'donation' },
      ],
    },
    donation: {
      defaultFields: [
        { name: 'donation_number', type: 'string', required: true },
        { name: 'donation_date', type: 'date', required: true },
        { name: 'scheduled_time', type: 'datetime' },
        { name: 'donor_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'items_description', type: 'text' },
        { name: 'item_count', type: 'integer' },
        { name: 'estimated_value', type: 'decimal' },
        { name: 'pickup_required', type: 'boolean' },
        { name: 'pickup_address', type: 'json' },
        { name: 'receipt_issued', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'donor' },
        { type: 'hasMany', target: 'item' },
      ],
    },
    donor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'donation_count', type: 'integer' },
        { name: 'total_value', type: 'decimal' },
        { name: 'is_recurring', type: 'boolean' },
        { name: 'tax_receipts', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'donation' },
      ],
    },
    volunteer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'availability', type: 'json' },
        { name: 'skills', type: 'json' },
        { name: 'start_date', type: 'date' },
        { name: 'total_hours', type: 'decimal' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    sale: {
      defaultFields: [
        { name: 'sale_number', type: 'string', required: true },
        { name: 'sale_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'cashier', type: 'string' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    category: {
      defaultFields: [
        { name: 'category_name', type: 'string', required: true },
        { name: 'parent_category', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'pricing_guide', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'item' },
      ],
    },
  },
};

export default thriftstoreBlueprint;
