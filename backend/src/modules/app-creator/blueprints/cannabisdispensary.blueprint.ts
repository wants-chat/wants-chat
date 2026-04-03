import { Blueprint } from './blueprint.interface';

/**
 * Cannabis Dispensary Blueprint
 */
export const cannabisdispensaryBlueprint: Blueprint = {
  appType: 'cannabisdispensary',
  description: 'Cannabis dispensary app with products, inventory, compliance, and patient management',

  coreEntities: ['product', 'patient', 'order', 'inventory_batch', 'compliance_record', 'strain'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Cannabis' },
        { label: 'Patients', path: '/patients', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Inventory', path: '/inventory', icon: 'Package' },
        { label: 'Compliance', path: '/compliance', icon: 'ClipboardCheck' },
        { label: 'Strains', path: '/strains', icon: 'Leaf' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'low-inventory', component: 'data-table', entity: 'inventory_batch', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/patients', name: 'Patients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'patient-table', component: 'data-table', entity: 'patient', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/inventory', name: 'Inventory', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'inventory-table', component: 'data-table', entity: 'inventory_batch', position: 'main' },
    ]},
    { path: '/compliance', name: 'Compliance', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'compliance-table', component: 'data-table', entity: 'compliance_record', position: 'main' },
    ]},
    { path: '/strains', name: 'Strains', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'strain-table', component: 'data-table', entity: 'strain', position: 'main' },
    ]},
    { path: '/menu', name: 'Menu', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-display', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/patients', entity: 'patient', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/patients', entity: 'patient', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/inventory', entity: 'inventory_batch', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/compliance', entity: 'compliance_record', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/strains', entity: 'strain', operation: 'list' },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'thc_content', type: 'decimal' },
        { name: 'cbd_content', type: 'decimal' },
        { name: 'terpenes', type: 'json' },
        { name: 'weight', type: 'decimal' },
        { name: 'unit', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'medical_only', type: 'boolean' },
        { name: 'lab_results', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'strain' },
      ],
    },
    patient: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'date_of_birth', type: 'date', required: true },
        { name: 'patient_id', type: 'string' },
        { name: 'medical_card_number', type: 'string' },
        { name: 'medical_card_expiry', type: 'date' },
        { name: 'physician', type: 'string' },
        { name: 'conditions', type: 'json' },
        { name: 'allotment', type: 'json' },
        { name: 'purchase_history', type: 'json' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'is_verified', type: 'boolean' },
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
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'budtender', type: 'string' },
        { name: 'order_type', type: 'enum' },
        { name: 'allotment_used', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'patient' },
      ],
    },
    inventory_batch: {
      defaultFields: [
        { name: 'batch_number', type: 'string', required: true },
        { name: 'metrc_tag', type: 'string' },
        { name: 'received_date', type: 'date', required: true },
        { name: 'expiry_date', type: 'date' },
        { name: 'supplier', type: 'string' },
        { name: 'original_quantity', type: 'decimal', required: true },
        { name: 'current_quantity', type: 'decimal' },
        { name: 'unit', type: 'enum' },
        { name: 'cost_per_unit', type: 'decimal' },
        { name: 'lab_results', type: 'json' },
        { name: 'storage_location', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'product' },
      ],
    },
    compliance_record: {
      defaultFields: [
        { name: 'record_type', type: 'enum', required: true },
        { name: 'record_date', type: 'date', required: true },
        { name: 'description', type: 'text' },
        { name: 'metrc_manifest', type: 'string' },
        { name: 'quantity', type: 'decimal' },
        { name: 'from_location', type: 'string' },
        { name: 'to_location', type: 'string' },
        { name: 'employee', type: 'string' },
        { name: 'documents', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    strain: {
      defaultFields: [
        { name: 'strain_name', type: 'string', required: true },
        { name: 'strain_type', type: 'enum', required: true },
        { name: 'genetics', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'effects', type: 'json' },
        { name: 'flavors', type: 'json' },
        { name: 'medical_uses', type: 'json' },
        { name: 'avg_thc', type: 'decimal' },
        { name: 'avg_cbd', type: 'decimal' },
        { name: 'grow_difficulty', type: 'enum' },
        { name: 'flowering_time', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
  },
};

export default cannabisdispensaryBlueprint;
