import { Blueprint } from './blueprint.interface';

/**
 * Electronics Store Blueprint
 */
export const electronicsstoreBlueprint: Blueprint = {
  appType: 'electronicsstore',
  description: 'Electronics store app with products, repairs, trade-ins, and warranties',

  coreEntities: ['product', 'repair', 'trade_in', 'customer', 'order', 'warranty'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Laptop' },
        { label: 'Repairs', path: '/repairs', icon: 'Wrench' },
        { label: 'Trade-Ins', path: '/trade-ins', icon: 'RefreshCw' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Warranties', path: '/warranties', icon: 'Shield' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'pending-repairs', component: 'kanban-board', entity: 'repair', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/repairs', name: 'Repairs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'repair-board', component: 'kanban-board', entity: 'repair', position: 'main' },
      { id: 'repair-table', component: 'data-table', entity: 'repair', position: 'main' },
    ]},
    { path: '/trade-ins', name: 'Trade-Ins', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'trade-table', component: 'data-table', entity: 'trade_in', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/warranties', name: 'Warranties', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'warranty-table', component: 'data-table', entity: 'warranty', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-display', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/repair-request', name: 'Request Repair', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'repair-form', component: 'booking-wizard', entity: 'repair', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/repairs', entity: 'repair', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/repairs', entity: 'repair', operation: 'create' },
    { method: 'GET', path: '/trade-ins', entity: 'trade_in', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/trade-ins', entity: 'trade_in', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/warranties', entity: 'warranty', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'brand', type: 'string', required: true },
        { name: 'model', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'specifications', type: 'json' },
        { name: 'condition', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'warranty_months', type: 'integer' },
        { name: 'upc', type: 'string' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    repair: {
      defaultFields: [
        { name: 'repair_number', type: 'string', required: true },
        { name: 'intake_date', type: 'date', required: true },
        { name: 'device_type', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'serial_number', type: 'string' },
        { name: 'issue_description', type: 'text', required: true },
        { name: 'diagnosis', type: 'text' },
        { name: 'repair_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'technician', type: 'string' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'under_warranty', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    trade_in: {
      defaultFields: [
        { name: 'trade_number', type: 'string', required: true },
        { name: 'trade_date', type: 'date', required: true },
        { name: 'device_type', type: 'enum', required: true },
        { name: 'brand', type: 'string', required: true },
        { name: 'model', type: 'string', required: true },
        { name: 'serial_number', type: 'string' },
        { name: 'condition', type: 'enum', required: true },
        { name: 'condition_notes', type: 'text' },
        { name: 'functional_status', type: 'json' },
        { name: 'accessories_included', type: 'json' },
        { name: 'estimated_value', type: 'decimal' },
        { name: 'offered_value', type: 'decimal' },
        { name: 'accepted', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'purchase_history', type: 'json' },
        { name: 'rewards_points', type: 'integer' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'repair' },
        { type: 'hasMany', target: 'trade_in' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'trade_in_credit', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'financing_plan', type: 'string' },
        { name: 'fulfillment_type', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    warranty: {
      defaultFields: [
        { name: 'warranty_number', type: 'string', required: true },
        { name: 'purchase_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date', required: true },
        { name: 'product_info', type: 'json', required: true },
        { name: 'serial_number', type: 'string' },
        { name: 'warranty_type', type: 'enum', required: true },
        { name: 'coverage', type: 'json' },
        { name: 'price', type: 'decimal' },
        { name: 'claims', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'order' },
      ],
    },
  },
};

export default electronicsstoreBlueprint;
