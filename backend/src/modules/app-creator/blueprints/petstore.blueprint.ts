import { Blueprint } from './blueprint.interface';

/**
 * Pet Store Blueprint
 */
export const petstoreBlueprint: Blueprint = {
  appType: 'petstore',
  description: 'Pet store app with products, live animals, grooming, and customer loyalty',

  coreEntities: ['product', 'animal', 'grooming_appointment', 'customer', 'order', 'category'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Products', path: '/products', icon: 'Package' },
        { label: 'Animals', path: '/animals', icon: 'PawPrint' },
        { label: 'Grooming', path: '/grooming', icon: 'Scissors' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Categories', path: '/categories', icon: 'Tag' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'today-grooming', component: 'appointment-list', entity: 'grooming_appointment', position: 'main' },
    ]},
    { path: '/products', name: 'Products', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'product', position: 'main' },
      { id: 'product-grid', component: 'product-grid', entity: 'product', position: 'main' },
    ]},
    { path: '/animals', name: 'Animals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'animal-grid', component: 'product-grid', entity: 'animal', position: 'main' },
    ]},
    { path: '/grooming', name: 'Grooming', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'grooming-calendar', component: 'appointment-calendar', entity: 'grooming_appointment', position: 'main' },
      { id: 'grooming-table', component: 'data-table', entity: 'grooming_appointment', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
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
    { path: '/book-grooming', name: 'Book Grooming', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'grooming-form', component: 'booking-wizard', entity: 'grooming_appointment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/products', entity: 'product', operation: 'list' },
    { method: 'GET', path: '/animals', entity: 'animal', operation: 'list' },
    { method: 'GET', path: '/grooming', entity: 'grooming_appointment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/grooming', entity: 'grooming_appointment', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
  ],

  entityConfig: {
    product: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'brand', type: 'string' },
        { name: 'pet_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'size', type: 'string' },
        { name: 'weight', type: 'decimal' },
        { name: 'ingredients', type: 'json' },
        { name: 'life_stage', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'reorder_level', type: 'integer' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
      ],
    },
    animal: {
      defaultFields: [
        { name: 'animal_id', type: 'string', required: true },
        { name: 'species', type: 'enum', required: true },
        { name: 'breed', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'gender', type: 'enum' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'age', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'size', type: 'enum' },
        { name: 'temperament', type: 'text' },
        { name: 'health_info', type: 'json' },
        { name: 'vaccinations', type: 'json' },
        { name: 'source', type: 'string' },
        { name: 'arrival_date', type: 'date' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'care_requirements', type: 'text' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    grooming_appointment: {
      defaultFields: [
        { name: 'appointment_number', type: 'string', required: true },
        { name: 'appointment_date', type: 'date', required: true },
        { name: 'appointment_time', type: 'datetime', required: true },
        { name: 'pet_name', type: 'string', required: true },
        { name: 'pet_type', type: 'enum', required: true },
        { name: 'breed', type: 'string' },
        { name: 'size', type: 'enum' },
        { name: 'services', type: 'json', required: true },
        { name: 'groomer', type: 'string' },
        { name: 'special_instructions', type: 'text' },
        { name: 'total', type: 'decimal' },
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
        { name: 'phone', type: 'phone', required: true },
        { name: 'address', type: 'json' },
        { name: 'pets', type: 'json' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'preferred_brands', type: 'json' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'grooming_appointment' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'loyalty_discount', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'fulfillment_type', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    category: {
      defaultFields: [
        { name: 'category_name', type: 'string', required: true },
        { name: 'parent_category', type: 'string' },
        { name: 'pet_type', type: 'enum' },
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

export default petstoreBlueprint;
