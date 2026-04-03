import { Blueprint } from './blueprint.interface';

/**
 * Wholesale Blueprint
 */
export const wholesaleBlueprint: Blueprint = {
  appType: 'wholesale',
  description: 'Wholesale distribution app with customers, orders, products, and pricing tiers',

  coreEntities: ['customer', 'order', 'product', 'invoice', 'price_tier', 'shipment'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ClipboardList' },
        { label: 'Products', path: '/products', icon: 'Package' },
        { label: 'Invoices', path: '/invoices', icon: 'FileText' },
        { label: 'Price Tiers', path: '/pricing', icon: 'Tag' },
        { label: 'Shipments', path: '/shipments', icon: 'Truck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-orders', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/pricing', name: 'Price Tiers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'pricing-table', component: 'plan-grid', entity: 'price_tier', position: 'main' },
    ]},
    { path: '/shipments', name: 'Shipments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'shipment-table', component: 'data-table', entity: 'shipment', position: 'main' },
    ]},
    { path: '/catalog', name: 'Product Catalog', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/customers', entity: 'customer', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'POST', path: '/products', entity: 'product', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/pricing', entity: 'price_tier', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/shipments', entity: 'shipment', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    customer: {
      defaultFields: [
        { name: 'customer_number', type: 'string', required: true },
        { name: 'business_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'billing_address', type: 'json' },
        { name: 'shipping_address', type: 'json' },
        { name: 'tax_id', type: 'string' },
        { name: 'resale_certificate', type: 'string' },
        { name: 'credit_limit', type: 'decimal' },
        { name: 'payment_terms', type: 'enum' },
        { name: 'sales_rep', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'price_tier' },
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'invoice' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'po_number', type: 'string' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'shipping', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'requested_date', type: 'date' },
        { name: 'ship_date', type: 'date' },
        { name: 'shipping_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'hasOne', target: 'invoice' },
        { type: 'hasOne', target: 'shipment' },
      ],
    },
    product: {
      defaultFields: [
        { name: 'sku', type: 'string', required: true },
        { name: 'product_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'enum' },
        { name: 'brand', type: 'string' },
        { name: 'unit_of_measure', type: 'string' },
        { name: 'case_pack', type: 'integer' },
        { name: 'cost', type: 'decimal' },
        { name: 'msrp', type: 'decimal' },
        { name: 'weight', type: 'decimal' },
        { name: 'dimensions', type: 'json' },
        { name: 'quantity_on_hand', type: 'integer' },
        { name: 'reorder_point', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'shipping', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
        { type: 'belongsTo', target: 'order' },
      ],
    },
    price_tier: {
      defaultFields: [
        { name: 'tier_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'discount_type', type: 'enum', required: true },
        { name: 'discount_value', type: 'decimal', required: true },
        { name: 'minimum_order', type: 'decimal' },
        { name: 'product_pricing', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'customer' },
      ],
    },
    shipment: {
      defaultFields: [
        { name: 'shipment_number', type: 'string', required: true },
        { name: 'ship_date', type: 'date', required: true },
        { name: 'carrier', type: 'string' },
        { name: 'tracking_number', type: 'string' },
        { name: 'shipping_method', type: 'enum' },
        { name: 'weight', type: 'decimal' },
        { name: 'packages', type: 'integer' },
        { name: 'shipping_cost', type: 'decimal' },
        { name: 'ship_to_address', type: 'json' },
        { name: 'delivery_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
      ],
    },
  },
};

export default wholesaleBlueprint;
