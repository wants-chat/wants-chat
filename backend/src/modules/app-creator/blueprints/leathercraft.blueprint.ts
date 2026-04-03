import { Blueprint } from './blueprint.interface';

/**
 * Leather Craft Blueprint
 */
export const leathercraftBlueprint: Blueprint = {
  appType: 'leathercraft',
  description: 'Leather craft workshop app with products, custom orders, classes, and repairs',

  coreEntities: ['product', 'custom_order', 'class', 'repair', 'material', 'customer'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'ShoppingBag' },
        { label: 'Custom Orders', path: '/orders', icon: 'Package' },
        { label: 'Classes', path: '/classes', icon: 'GraduationCap' },
        { label: 'Repairs', path: '/repairs', icon: 'Wrench' },
        { label: 'Materials', path: '/materials', icon: 'Layers' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-orders', component: 'data-table', entity: 'custom_order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/orders', name: 'Custom Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-board', component: 'kanban-board', entity: 'custom_order', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-calendar', component: 'appointment-calendar', entity: 'class', position: 'main' },
    ]},
    { path: '/repairs', name: 'Repairs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'repair-table', component: 'data-table', entity: 'repair', position: 'main' },
    ]},
    { path: '/materials', name: 'Materials', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'material-table', component: 'data-table', entity: 'material', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'POST', path: '/products', entity: 'product', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'custom_order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'custom_order', operation: 'create' },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'POST', path: '/classes', entity: 'class', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/repairs', entity: 'repair', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/repairs', entity: 'repair', operation: 'create' },
    { method: 'GET', path: '/materials', entity: 'material', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'leather_type', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'dimensions', type: 'string' },
        { name: 'hardware', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'quantity', type: 'integer' },
        { name: 'made_to_order', type: 'boolean' },
        { name: 'lead_time_days', type: 'integer' },
        { name: 'customizable', type: 'boolean' },
        { name: 'customization_options', type: 'json' },
        { name: 'images', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    custom_order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'item_type', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'leather_type', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'dimensions', type: 'json' },
        { name: 'hardware', type: 'json' },
        { name: 'personalization', type: 'json' },
        { name: 'reference_images', type: 'json' },
        { name: 'due_date', type: 'date' },
        { name: 'quoted_price', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'final_price', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'progress_photos', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'class_type', type: 'enum', required: true },
        { name: 'skill_level', type: 'enum' },
        { name: 'class_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'project_made', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'max_students', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'materials_included', type: 'boolean' },
        { name: 'tools_provided', type: 'boolean' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    repair: {
      defaultFields: [
        { name: 'repair_number', type: 'string', required: true },
        { name: 'intake_date', type: 'date', required: true },
        { name: 'item_type', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'item_description', type: 'text' },
        { name: 'repair_needed', type: 'text', required: true },
        { name: 'intake_photos', type: 'json' },
        { name: 'estimated_cost', type: 'decimal' },
        { name: 'final_cost', type: 'decimal' },
        { name: 'due_date', type: 'date' },
        { name: 'completion_photos', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    material: {
      defaultFields: [
        { name: 'material_name', type: 'string', required: true },
        { name: 'material_type', type: 'enum', required: true },
        { name: 'leather_type', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'thickness', type: 'string' },
        { name: 'size', type: 'string' },
        { name: 'supplier', type: 'string' },
        { name: 'cost_per_unit', type: 'decimal' },
        { name: 'quantity_on_hand', type: 'decimal' },
        { name: 'reorder_point', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'preferences', type: 'json' },
        { name: 'order_count', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'custom_order' },
        { type: 'hasMany', target: 'repair' },
      ],
    },
  },
};

export default leathercraftBlueprint;
