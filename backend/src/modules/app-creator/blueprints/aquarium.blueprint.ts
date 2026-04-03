import { Blueprint } from './blueprint.interface';

/**
 * Aquarium / Fish Store Blueprint
 */
export const aquariumBlueprint: Blueprint = {
  appType: 'aquarium',
  description: 'Aquarium store app with livestock, equipment, tanks, services, and customer management',

  coreEntities: ['livestock', 'equipment', 'tank', 'service', 'customer', 'order'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Livestock', path: '/livestock', icon: 'Fish' },
        { label: 'Equipment', path: '/equipment', icon: 'Package' },
        { label: 'Tanks', path: '/tanks', icon: 'Droplets' },
        { label: 'Services', path: '/services', icon: 'Wrench' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'recent-orders', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/livestock', name: 'Livestock', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'livestock-grid', component: 'product-grid', entity: 'livestock', position: 'main' },
    ]},
    { path: '/equipment', name: 'Equipment', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'equipment-grid', component: 'product-grid', entity: 'equipment', position: 'main' },
    ]},
    { path: '/tanks', name: 'Tanks', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'tank-grid', component: 'product-grid', entity: 'tank', position: 'main' },
    ]},
    { path: '/services', name: 'Services', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'service-calendar', component: 'appointment-calendar', entity: 'service', position: 'main' },
      { id: 'service-table', component: 'data-table', entity: 'service', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'livestock', position: 'main' },
      { id: 'livestock-display', component: 'product-grid', entity: 'livestock', position: 'main' },
    ]},
    { path: '/book-service', name: 'Book Service', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'service-form', component: 'booking-wizard', entity: 'service', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/livestock', entity: 'livestock', operation: 'list' },
    { method: 'GET', path: '/equipment', entity: 'equipment', operation: 'list' },
    { method: 'GET', path: '/tanks', entity: 'tank', operation: 'list' },
    { method: 'GET', path: '/services', entity: 'service', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/services', entity: 'service', operation: 'create' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
  ],

  entityConfig: {
    livestock: {
      defaultFields: [
        { name: 'common_name', type: 'string', required: true },
        { name: 'scientific_name', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'species_type', type: 'enum' },
        { name: 'water_type', type: 'enum', required: true },
        { name: 'size_current', type: 'string' },
        { name: 'size_max', type: 'string' },
        { name: 'tank_size_min', type: 'integer' },
        { name: 'temperature_range', type: 'json' },
        { name: 'ph_range', type: 'json' },
        { name: 'difficulty', type: 'enum' },
        { name: 'temperament', type: 'enum' },
        { name: 'diet', type: 'json' },
        { name: 'compatible_with', type: 'json' },
        { name: 'quantity', type: 'integer', required: true },
        { name: 'price', type: 'decimal', required: true },
        { name: 'origin', type: 'string' },
        { name: 'images', type: 'json' },
        { name: 'care_notes', type: 'text' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    equipment: {
      defaultFields: [
        { name: 'product_name', type: 'string', required: true },
        { name: 'sku', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'brand', type: 'string' },
        { name: 'model', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'specifications', type: 'json' },
        { name: 'tank_size_rated', type: 'integer' },
        { name: 'water_type', type: 'enum' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'warranty', type: 'string' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    tank: {
      defaultFields: [
        { name: 'tank_name', type: 'string', required: true },
        { name: 'brand', type: 'string' },
        { name: 'tank_type', type: 'enum', required: true },
        { name: 'shape', type: 'enum' },
        { name: 'dimensions', type: 'json' },
        { name: 'gallons', type: 'decimal', required: true },
        { name: 'material', type: 'enum' },
        { name: 'includes', type: 'json' },
        { name: 'stand_included', type: 'boolean' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'quantity', type: 'integer' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    service: {
      defaultFields: [
        { name: 'service_number', type: 'string', required: true },
        { name: 'service_date', type: 'date', required: true },
        { name: 'service_time', type: 'datetime' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'location', type: 'enum' },
        { name: 'address', type: 'json' },
        { name: 'tank_info', type: 'json' },
        { name: 'work_performed', type: 'json' },
        { name: 'water_parameters', type: 'json' },
        { name: 'products_used', type: 'json' },
        { name: 'recommendations', type: 'text' },
        { name: 'photos', type: 'json' },
        { name: 'labor_hours', type: 'decimal' },
        { name: 'total', type: 'decimal' },
        { name: 'next_service', type: 'date' },
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
        { name: 'tanks_owned', type: 'json' },
        { name: 'experience_level', type: 'enum' },
        { name: 'livestock_interests', type: 'json' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'service' },
      ],
    },
    order: {
      defaultFields: [
        { name: 'order_number', type: 'string', required: true },
        { name: 'order_date', type: 'date', required: true },
        { name: 'items', type: 'json', required: true },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'payment_method', type: 'enum' },
        { name: 'payment_status', type: 'enum' },
        { name: 'fulfillment_type', type: 'enum' },
        { name: 'pickup_date', type: 'date' },
        { name: 'acclimation_instructions', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default aquariumBlueprint;
