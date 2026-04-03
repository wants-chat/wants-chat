import { Blueprint } from './blueprint.interface';

/**
 * Sporting Goods Store Blueprint
 */
export const sportinggoodsBlueprint: Blueprint = {
  appType: 'sportinggoods',
  description: 'Sporting goods store app with products, rentals, services, and team sales',

  coreEntities: ['product', 'rental', 'service', 'customer', 'team_order', 'category'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Dumbbell' },
        { label: 'Rentals', path: '/rentals', icon: 'Clock' },
        { label: 'Services', path: '/services', icon: 'Wrench' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Team Orders', path: '/team-orders', icon: 'Users' },
        { label: 'Categories', path: '/categories', icon: 'Tag' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'pending-services', component: 'kanban-board', entity: 'service', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/rentals', name: 'Rentals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'rental-calendar', component: 'appointment-calendar', entity: 'rental', position: 'main' },
      { id: 'rental-table', component: 'data-table', entity: 'rental', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-board', component: 'kanban-board', entity: 'service', position: 'main' },
      { id: 'service-table', component: 'data-table', entity: 'service', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/team-orders', name: 'Team Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'team-table', component: 'data-table', entity: 'team_order', position: 'main' },
    ]},
    { path: '/categories', name: 'Categories', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'category-table', component: 'data-table', entity: 'category', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-display', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/rent', name: 'Rent Equipment', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'rental-form', component: 'booking-wizard', entity: 'rental', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/rentals', entity: 'rental', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/rentals', entity: 'rental', operation: 'create' },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/services', entity: 'service', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/team-orders', entity: 'team_order', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string', required: true },
        { name: 'brand', type: 'string' },
        { name: 'sport', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'size', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'gender', type: 'enum' },
        { name: 'age_group', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'is_rentable', type: 'boolean' },
        { name: 'rental_price', type: 'decimal' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
      ],
    },
    rental: {
      defaultFields: [
        { name: 'rental_number', type: 'string', required: true },
        { name: 'rental_start', type: 'date', required: true },
        { name: 'rental_end', type: 'date', required: true },
        { name: 'items_rented', type: 'json', required: true },
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
    service: {
      defaultFields: [
        { name: 'service_number', type: 'string', required: true },
        { name: 'intake_date', type: 'date', required: true },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'equipment_type', type: 'string', required: true },
        { name: 'equipment_info', type: 'json' },
        { name: 'issue_description', type: 'text' },
        { name: 'work_performed', type: 'text' },
        { name: 'parts_used', type: 'json' },
        { name: 'technician', type: 'string' },
        { name: 'labor_cost', type: 'decimal' },
        { name: 'parts_cost', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'estimated_completion', type: 'date' },
        { name: 'completed_date', type: 'date' },
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
        { name: 'sports_interests', type: 'json' },
        { name: 'shoe_size', type: 'string' },
        { name: 'clothing_size', type: 'string' },
        { name: 'team_affiliation', type: 'string' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'rental' },
        { type: 'hasMany', target: 'service' },
      ],
    },
    team_order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'team_name', type: 'string', required: true },
        { name: 'organization', type: 'string' },
        { name: 'contact_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'sport', type: 'enum' },
        { name: 'items', type: 'json', required: true },
        { name: 'customization', type: 'json' },
        { name: 'sizes_breakdown', type: 'json' },
        { name: 'delivery_date', type: 'date' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    category: {
      defaultFields: [
        { name: 'category_name', type: 'string', required: true },
        { name: 'parent_category', type: 'string' },
        { name: 'sport', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'product' },
      ],
    },
  },
};

export default sportinggoodsBlueprint;
