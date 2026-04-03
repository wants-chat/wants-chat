import { Blueprint } from './blueprint.interface';

/**
 * Manufacturing Blueprint
 */
export const manufacturingBlueprint: Blueprint = {
  appType: 'manufacturing',
  description: 'Manufacturing app with orders, production, inventory, and quality control',

  coreEntities: ['order', 'product', 'production_run', 'inventory', 'quality_check', 'supplier'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Orders', path: '/orders', icon: 'ClipboardList' },
        { label: 'Products', path: '/products', icon: 'Package' },
        { label: 'Production', path: '/production', icon: 'Factory' },
        { label: 'Inventory', path: '/inventory', icon: 'Boxes' },
        { label: 'Quality', path: '/quality', icon: 'CheckCircle' },
        { label: 'Suppliers', path: '/suppliers', icon: 'Truck' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'production-status', component: 'kanban-board', entity: 'production_run', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'filters', component: 'filter-form', entity: 'order', position: 'main' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/production', name: 'Production', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'production-board', component: 'kanban-board', entity: 'production_run', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-table', component: 'data-table', entity: 'inventory', position: 'main' },
    ]},
    { path: '/quality', name: 'Quality Control', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'quality-table', component: 'data-table', entity: 'quality_check', position: 'main' },
    ]},
    { path: '/suppliers', name: 'Suppliers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'supplier-table', component: 'data-table', entity: 'supplier', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/products', entity: 'product', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/production', entity: 'production_run', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/production', entity: 'production_run', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'inventory', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/quality', entity: 'quality_check', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/quality', entity: 'quality_check', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/suppliers', entity: 'supplier', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'customer_name', type: 'string', required: true },
        { name: 'customer_po', type: 'string' },
        { name: 'line_items', type: 'json', required: true },
        { name: 'total_quantity', type: 'integer' },
        { name: 'total_amount', type: 'decimal' },
        { name: 'due_date', type: 'date' },
        { name: 'ship_date', type: 'date' },
        { name: 'shipping_address', type: 'json' },
        { name: 'priority', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'hasMany', target: 'production_run' },
      ],
    },
    product: {
      defaultFields: [
        { name: 'sku', type: 'string', required: true },
        { name: 'product_name', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'category', type: 'enum' },
        { name: 'unit_of_measure', type: 'string' },
        { name: 'bom', type: 'json' },
        { name: 'production_time', type: 'integer' },
        { name: 'unit_cost', type: 'decimal' },
        { name: 'unit_price', type: 'decimal' },
        { name: 'min_order_qty', type: 'integer' },
        { name: 'specifications', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'inventory' },
        { type: 'hasMany', target: 'production_run' },
      ],
    },
    production_run: {
      defaultFields: [
        { name: 'run_number', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'quantity_ordered', type: 'integer', required: true },
        { name: 'quantity_produced', type: 'integer' },
        { name: 'quantity_rejected', type: 'integer' },
        { name: 'work_center', type: 'string' },
        { name: 'operator', type: 'string' },
        { name: 'materials_used', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'order' },
        { type: 'belongsTo', target: 'product' },
        { type: 'hasMany', target: 'quality_check' },
      ],
    },
    inventory: {
      defaultFields: [
        { name: 'item_type', type: 'enum', required: true },
        { name: 'item_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'bin', type: 'string' },
        { name: 'quantity_on_hand', type: 'integer', required: true },
        { name: 'quantity_reserved', type: 'integer' },
        { name: 'quantity_available', type: 'integer' },
        { name: 'reorder_point', type: 'integer' },
        { name: 'reorder_quantity', type: 'integer' },
        { name: 'unit_cost', type: 'decimal' },
        { name: 'last_counted', type: 'date' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'product' },
        { type: 'belongsTo', target: 'supplier' },
      ],
    },
    quality_check: {
      defaultFields: [
        { name: 'check_number', type: 'string', required: true },
        { name: 'check_date', type: 'date', required: true },
        { name: 'check_type', type: 'enum', required: true },
        { name: 'inspector', type: 'string' },
        { name: 'sample_size', type: 'integer' },
        { name: 'defects_found', type: 'integer' },
        { name: 'measurements', type: 'json' },
        { name: 'pass_fail', type: 'boolean' },
        { name: 'corrective_action', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'production_run' },
      ],
    },
    supplier: {
      defaultFields: [
        { name: 'supplier_name', type: 'string', required: true },
        { name: 'contact_name', type: 'string' },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'materials_supplied', type: 'json' },
        { name: 'lead_time_days', type: 'integer' },
        { name: 'payment_terms', type: 'string' },
        { name: 'rating', type: 'enum' },
        { name: 'certifications', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'inventory' },
      ],
    },
  },
};

export default manufacturingBlueprint;
