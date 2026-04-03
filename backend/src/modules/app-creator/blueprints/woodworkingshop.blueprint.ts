import { Blueprint } from './blueprint.interface';

/**
 * Woodworking Shop Blueprint
 */
export const woodworkingshopBlueprint: Blueprint = {
  appType: 'woodworkingshop',
  description: 'Woodworking shop app with projects, classes, custom orders, and tool rentals',

  coreEntities: ['project', 'class', 'custom_order', 'product', 'tool_rental', 'customer'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Projects', path: '/projects', icon: 'Hammer' },
        { label: 'Classes', path: '/classes', icon: 'GraduationCap' },
        { label: 'Custom Orders', path: '/orders', icon: 'Package' },
        { label: 'Products', path: '/products', icon: 'ShoppingBag' },
        { label: 'Tool Rentals', path: '/rentals', icon: 'Wrench' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'active-projects', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/projects', name: 'Projects', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'project-board', component: 'kanban-board', entity: 'project', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-calendar', component: 'appointment-calendar', entity: 'class', position: 'main' },
    ]},
    { path: '/orders', name: 'Custom Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'custom_order', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/rentals', name: 'Tool Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-table', component: 'data-table', entity: 'tool_rental', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/projects', entity: 'project', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/projects', entity: 'project', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'POST', path: '/classes', entity: 'class', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'custom_order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'custom_order', operation: 'create' },
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/rentals', entity: 'tool_rental', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/rentals', entity: 'tool_rental', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    project: {
      defaultFields: [
        { name: 'project_name', type: 'string', required: true },
        { name: 'project_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'wood_species', type: 'json' },
        { name: 'dimensions', type: 'json' },
        { name: 'finish_type', type: 'string' },
        { name: 'start_date', type: 'date' },
        { name: 'due_date', type: 'date' },
        { name: 'estimated_hours', type: 'decimal' },
        { name: 'actual_hours', type: 'decimal' },
        { name: 'materials_cost', type: 'decimal' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'total_price', type: 'decimal' },
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
        { name: 'project_built', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'max_students', type: 'integer' },
        { name: 'enrolled', type: 'integer' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'materials_included', type: 'boolean' },
        { name: 'tools_provided', type: 'boolean' },
        { name: 'age_requirement', type: 'integer' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    custom_order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'item_type', type: 'enum', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'wood_species', type: 'json' },
        { name: 'dimensions', type: 'json' },
        { name: 'finish', type: 'string' },
        { name: 'hardware', type: 'json' },
        { name: 'reference_images', type: 'json' },
        { name: 'due_date', type: 'date' },
        { name: 'quoted_price', type: 'decimal' },
        { name: 'deposit', type: 'decimal' },
        { name: 'final_price', type: 'decimal' },
        { name: 'payment_status', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'wood_species', type: 'string' },
        { name: 'dimensions', type: 'string' },
        { name: 'finish', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'quantity', type: 'integer' },
        { name: 'made_to_order', type: 'boolean' },
        { name: 'lead_time_days', type: 'integer' },
        { name: 'images', type: 'json' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    tool_rental: {
      defaultFields: [
        { name: 'tool_name', type: 'string', required: true },
        { name: 'tool_type', type: 'enum', required: true },
        { name: 'rental_date', type: 'date', required: true },
        { name: 'return_date', type: 'date', required: true },
        { name: 'daily_rate', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'total_cost', type: 'decimal' },
        { name: 'condition_out', type: 'text' },
        { name: 'condition_in', type: 'text' },
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
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'customer_type', type: 'enum' },
        { name: 'project_count', type: 'integer' },
        { name: 'total_spent', type: 'decimal' },
        { name: 'preferences', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'project' },
        { type: 'hasMany', target: 'custom_order' },
        { type: 'hasMany', target: 'tool_rental' },
      ],
    },
  },
};

export default woodworkingshopBlueprint;
