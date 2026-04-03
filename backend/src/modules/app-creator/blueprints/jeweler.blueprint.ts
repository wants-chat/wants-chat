import { Blueprint } from './blueprint.interface';

/**
 * Jewelry Store Blueprint
 */
export const jewelerBlueprint: Blueprint = {
  appType: 'jeweler',
  description: 'Jewelry store with products, repairs, custom orders, and appraisals',

  coreEntities: ['product', 'repair', 'custom_order', 'appraisal', 'customer', 'inventory'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Gem' },
        { label: 'Repairs', path: '/repairs', icon: 'Wrench' },
        { label: 'Custom Orders', path: '/custom-orders', icon: 'Sparkles' },
        { label: 'Appraisals', path: '/appraisals', icon: 'FileCheck' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
      ]}},
      { id: 'jeweler-stats', component: 'jeweler-stats', position: 'main' },
      { id: 'pending-repairs', component: 'repair-list-pending', entity: 'repair', position: 'main' },
      { id: 'custom-orders-progress', component: 'custom-order-list-progress', entity: 'custom_order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-filters', component: 'product-filters-jeweler', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid-jeweler', entity: 'product', position: 'main' },
    ]},
    { path: '/products/:id', name: 'Product Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-detail', component: 'product-detail-jeweler', entity: 'product', position: 'main' },
    ]},
    { path: '/repairs', name: 'Repairs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'repair-filters', component: 'repair-filters', entity: 'repair', position: 'main' },
      { id: 'repair-table', component: 'repair-table', entity: 'repair', position: 'main' },
    ]},
    { path: '/repairs/:id', name: 'Repair Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'repair-detail', component: 'repair-detail', entity: 'repair', position: 'main' },
    ]},
    { path: '/repairs/new', name: 'New Repair', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'repair-form', component: 'repair-form', entity: 'repair', position: 'main' },
    ]},
    { path: '/custom-orders', name: 'Custom Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'custom-order-table', component: 'custom-order-table-jeweler', entity: 'custom_order', position: 'main' },
    ]},
    { path: '/custom-orders/:id', name: 'Custom Order Detail', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'custom-order-detail', component: 'custom-order-detail-jeweler', entity: 'custom_order', position: 'main' },
    ]},
    { path: '/appraisals', name: 'Appraisals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'appraisal-table', component: 'appraisal-table', entity: 'appraisal', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'customer-table-jeweler', entity: 'customer', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'public-shop', component: 'public-shop-jeweler', entity: 'product', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'POST', path: '/products', entity: 'product', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/repairs', entity: 'repair', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/repairs', entity: 'repair', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/custom-orders', entity: 'custom_order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/appraisals', entity: 'appraisal', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'sku', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'metal_type', type: 'enum' },
        { name: 'metal_weight', type: 'decimal' },
        { name: 'gemstones', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'description', type: 'text' },
        { name: 'images', type: 'json' },
        { name: 'certification', type: 'string' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    repair: {
      defaultFields: [
        { name: 'ticket_number', type: 'string', required: true },
        { name: 'item_description', type: 'text', required: true },
        { name: 'repair_type', type: 'enum', required: true },
        { name: 'work_needed', type: 'text', required: true },
        { name: 'estimated_cost', type: 'decimal' },
        { name: 'final_cost', type: 'decimal' },
        { name: 'received_date', type: 'date', required: true },
        { name: 'promised_date', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'status', type: 'enum', required: true },
        { name: 'notes', type: 'text' },
        { name: 'photos', type: 'json' },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    custom_order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'design_type', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'specifications', type: 'json' },
        { name: 'design_sketches', type: 'json' },
        { name: 'materials', type: 'json' },
        { name: 'estimated_cost', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'final_cost', type: 'decimal' },
        { name: 'status', type: 'enum', required: true },
        { name: 'start_date', type: 'date' },
        { name: 'due_date', type: 'date' },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    appraisal: {
      defaultFields: [
        { name: 'appraisal_number', type: 'string', required: true },
        { name: 'item_description', type: 'text', required: true },
        { name: 'purpose', type: 'enum', required: true },
        { name: 'appraised_value', type: 'decimal' },
        { name: 'appraisal_date', type: 'date', required: true },
        { name: 'details', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'certificate_url', type: 'url' },
        { name: 'fee', type: 'decimal' },
      ],
      relationships: [{ type: 'belongsTo', target: 'customer' }],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'preferences', type: 'json' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'repair' },
        { type: 'hasMany', target: 'custom_order' },
        { type: 'hasMany', target: 'appraisal' },
      ],
    },
  },
};

export default jewelerBlueprint;
