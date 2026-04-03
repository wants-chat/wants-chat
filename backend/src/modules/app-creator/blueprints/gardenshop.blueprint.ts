import { Blueprint } from './blueprint.interface';

/**
 * Garden Shop Blueprint
 */
export const gardenshopBlueprint: Blueprint = {
  appType: 'gardenshop',
  description: 'Garden shop app with plants, landscaping services, workshops, and seasonal planning',

  coreEntities: ['plant', 'landscaping', 'workshop', 'customer', 'order', 'season_plan'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Plants', path: '/plants', icon: 'Flower2' },
        { label: 'Landscaping', path: '/landscaping', icon: 'TreeDeciduous' },
        { label: 'Workshops', path: '/workshops', icon: 'GraduationCap' },
        { label: 'Customers', path: '/customers', icon: 'Users' },
        { label: 'Orders', path: '/orders', icon: 'ShoppingCart' },
        { label: 'Season Plans', path: '/season-plans', icon: 'Calendar' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-landscaping', component: 'appointment-list', entity: 'landscaping', position: 'main' },
    ]},
    { path: '/plants', name: 'Plants', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'plant', position: 'main' },
      { id: 'plant-grid', component: 'product-grid', entity: 'plant', position: 'main' },
    ]},
    { path: '/landscaping', name: 'Landscaping', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'landscaping-calendar', component: 'appointment-calendar', entity: 'landscaping', position: 'main' },
      { id: 'landscaping-table', component: 'data-table', entity: 'landscaping', position: 'main' },
    ]},
    { path: '/workshops', name: 'Workshops', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'workshop-calendar', component: 'appointment-calendar', entity: 'workshop', position: 'main' },
      { id: 'workshop-table', component: 'data-table', entity: 'workshop', position: 'main' },
    ]},
    { path: '/customers', name: 'Customers', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'customer-table', component: 'data-table', entity: 'customer', position: 'main' },
    ]},
    { path: '/orders', name: 'Orders', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'order-table', component: 'data-table', entity: 'order', position: 'main' },
    ]},
    { path: '/season-plans', name: 'Season Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'plan-table', component: 'data-table', entity: 'season_plan', position: 'main' },
    ]},
    { path: '/shop', name: 'Shop', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'search', component: 'search-bar', position: 'main' },
      { id: 'filters', component: 'filter-form', entity: 'plant', position: 'main' },
      { id: 'plant-display', component: 'product-grid', entity: 'plant', position: 'main' },
    ]},
    { path: '/book-landscaping', name: 'Book Landscaping', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'landscaping-form', component: 'booking-wizard', entity: 'landscaping', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/plants', entity: 'plant', operation: 'list' },
    { method: 'GET', path: '/landscaping', entity: 'landscaping', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/landscaping', entity: 'landscaping', operation: 'create' },
    { method: 'GET', path: '/workshops', entity: 'workshop', operation: 'list' },
    { method: 'POST', path: '/workshops/register', entity: 'workshop', operation: 'update' },
    { method: 'GET', path: '/customers', entity: 'customer', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/orders', entity: 'order', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/orders', entity: 'order', operation: 'create' },
    { method: 'GET', path: '/season-plans', entity: 'season_plan', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    plant: {
      defaultFields: [
        { name: 'plant_name', type: 'string', required: true },
        { name: 'common_name', type: 'string' },
        { name: 'scientific_name', type: 'string' },
        { name: 'category', type: 'enum', required: true },
        { name: 'plant_type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'care_instructions', type: 'text' },
        { name: 'sunlight', type: 'enum' },
        { name: 'water_needs', type: 'enum' },
        { name: 'hardiness_zone', type: 'json' },
        { name: 'mature_size', type: 'json' },
        { name: 'bloom_time', type: 'string' },
        { name: 'pot_size', type: 'string' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'cost', type: 'decimal' },
        { name: 'quantity', type: 'integer' },
        { name: 'location', type: 'string' },
        { name: 'images', type: 'json' },
        { name: 'is_available', type: 'boolean' },
      ],
      relationships: [],
    },
    landscaping: {
      defaultFields: [
        { name: 'job_number', type: 'string', required: true },
        { name: 'scheduled_date', type: 'date', required: true },
        { name: 'scheduled_time', type: 'datetime' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'property_address', type: 'json', required: true },
        { name: 'property_size', type: 'string' },
        { name: 'crew', type: 'json' },
        { name: 'materials_needed', type: 'json' },
        { name: 'labor_estimate', type: 'decimal' },
        { name: 'materials_estimate', type: 'decimal' },
        { name: 'total_estimate', type: 'decimal' },
        { name: 'actual_cost', type: 'decimal' },
        { name: 'completed_date', type: 'date' },
        { name: 'before_photos', type: 'json' },
        { name: 'after_photos', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    workshop: {
      defaultFields: [
        { name: 'workshop_name', type: 'string', required: true },
        { name: 'workshop_type', type: 'enum', required: true },
        { name: 'workshop_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'description', type: 'text' },
        { name: 'instructor', type: 'string' },
        { name: 'skill_level', type: 'enum' },
        { name: 'materials_included', type: 'json' },
        { name: 'capacity', type: 'integer' },
        { name: 'registered', type: 'integer' },
        { name: 'price', type: 'decimal' },
        { name: 'location', type: 'string' },
        { name: 'image_url', type: 'image' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [],
    },
    customer: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'garden_info', type: 'json' },
        { name: 'plant_preferences', type: 'json' },
        { name: 'hardiness_zone', type: 'string' },
        { name: 'loyalty_points', type: 'integer' },
        { name: 'total_purchases', type: 'decimal' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'hasMany', target: 'order' },
        { type: 'hasMany', target: 'landscaping' },
        { type: 'hasMany', target: 'season_plan' },
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
        { name: 'fulfillment_type', type: 'enum' },
        { name: 'delivery_address', type: 'json' },
        { name: 'delivery_date', type: 'date' },
        { name: 'planting_service', type: 'boolean' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
    season_plan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'season', type: 'enum', required: true },
        { name: 'year', type: 'integer', required: true },
        { name: 'garden_areas', type: 'json' },
        { name: 'plants_planned', type: 'json' },
        { name: 'tasks', type: 'json' },
        { name: 'budget', type: 'decimal' },
        { name: 'actual_spend', type: 'decimal' },
        { name: 'reminders', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'customer' },
      ],
    },
  },
};

export default gardenshopBlueprint;
