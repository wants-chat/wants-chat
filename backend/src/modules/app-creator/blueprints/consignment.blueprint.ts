import { Blueprint } from './blueprint.interface';

/**
 * Consignment Store Blueprint
 */
export const consignmentBlueprint: Blueprint = {
  appType: 'consignment',
  description: 'Consignment store app with consignors, items, payouts, and sales tracking',

  coreEntities: ['item', 'consignor', 'payout', 'sale', 'contract', 'category'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
        { label: 'Consignors', path: '/consignors', icon: 'Users' },
        { label: 'Payouts', path: '/payouts', icon: 'DollarSign' },
        { label: 'Sales', path: '/sales', icon: 'ShoppingCart' },
        { label: 'Contracts', path: '/contracts', icon: 'FileText' },
        { label: 'Categories', path: '/categories', icon: 'Tag' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'pending-payouts', component: 'data-table', entity: 'payout', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'item', position: 'main' },
      { id: 'item-grid', component: 'product-grid', entity: 'item', position: 'main' },
    ]},
    { path: '/consignors', name: 'Consignors', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'consignor-table', component: 'data-table', entity: 'consignor', position: 'main' },
    ]},
    { path: '/payouts', name: 'Payouts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'payout-table', component: 'data-table', entity: 'payout', position: 'main' },
    ]},
    { path: '/sales', name: 'Sales', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'sale-table', component: 'data-table', entity: 'sale', position: 'main' },
    ]},
    { path: '/contracts', name: 'Contracts', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'contract-table', component: 'data-table', entity: 'contract', position: 'main' },
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
    { path: '/consign', name: 'Consign Items', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'consign-form', component: 'booking-wizard', entity: 'contract', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/inventory', entity: 'item', operation: 'list' },
    { method: 'GET', path: '/consignors', entity: 'consignor', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/consignors', entity: 'consignor', operation: 'create' },
    { method: 'GET', path: '/payouts', entity: 'payout', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/payouts', entity: 'payout', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/sales', entity: 'sale', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/sales', entity: 'sale', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/contracts', entity: 'contract', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
  ],

  entityConfig: {
    item: {
      defaultFields: [
        { name: 'item_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'brand', type: 'string' },
        { name: 'size', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'condition', type: 'enum', required: true },
        { name: 'consigned_price', type: 'decimal', required: true },
        { name: 'selling_price', type: 'decimal', required: true },
        { name: 'commission_rate', type: 'decimal' },
        { name: 'received_date', type: 'date' },
        { name: 'expiry_date', type: 'date' },
        { name: 'sold_date', type: 'date' },
        { name: 'location', type: 'string' },
        { name: 'images', type: 'json' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'consignor' },
        { type: 'belongsTo', target: 'contract' },
        { type: 'belongsTo', target: 'category' },
      ],
    },
    consignor: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'payment_info', type: 'json' },
        { name: 'default_commission', type: 'decimal' },
        { name: 'item_count', type: 'integer' },
        { name: 'total_sales', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'item' },
        { type: 'hasMany', target: 'contract' },
        { type: 'hasMany', target: 'payout' },
      ],
    },
    payout: {
      defaultFields: [
        { name: 'payout_number', type: 'string', required: true },
        { name: 'payout_date', type: 'date', required: true },
        { name: 'amount', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'items_included', type: 'json' },
        { name: 'period_start', type: 'date' },
        { name: 'period_end', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'consignor' },
      ],
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
    contract: {
      defaultFields: [
        { name: 'contract_number', type: 'string', required: true },
        { name: 'contract_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date', required: true },
        { name: 'commission_rate', type: 'decimal', required: true },
        { name: 'item_list', type: 'json' },
        { name: 'terms', type: 'text' },
        { name: 'signed', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'consignor' },
        { type: 'hasMany', target: 'item' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'category_name', type: 'string', required: true },
        { name: 'parent_category', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'default_commission', type: 'decimal' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'item' },
      ],
    },
  },
};

export default consignmentBlueprint;
