import { Blueprint } from './blueprint.interface';

/**
 * Personal Chef Blueprint
 */
export const personalchefBlueprint: Blueprint = {
  appType: 'personalchef',
  description: 'Personal chef app with clients, menus, bookings, and meal preparation',

  coreEntities: ['client', 'booking', 'menu', 'meal', 'recipe', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Bookings', path: '/bookings', icon: 'Calendar' },
        { label: 'Menus', path: '/menus', icon: 'Book' },
        { label: 'Meals', path: '/meals', icon: 'UtensilsCrossed' },
        { label: 'Recipes', path: '/recipes', icon: 'ChefHat' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-bookings', component: 'appointment-list', entity: 'booking', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/bookings', name: 'Bookings', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'booking-calendar', component: 'appointment-calendar', entity: 'booking', position: 'main' },
    ]},
    { path: '/menus', name: 'Menus', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'menu-grid', component: 'product-grid', entity: 'menu', position: 'main' },
    ]},
    { path: '/meals', name: 'Meals', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'meal-grid', component: 'product-grid', entity: 'meal', position: 'main' },
    ]},
    { path: '/recipes', name: 'Recipes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'recipe-table', component: 'data-table', entity: 'recipe', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'booking', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/bookings', entity: 'booking', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/bookings', entity: 'booking', operation: 'create' },
    { method: 'GET', path: '/menus', entity: 'menu', operation: 'list' },
    { method: 'GET', path: '/meals', entity: 'meal', operation: 'list' },
    { method: 'GET', path: '/recipes', entity: 'recipe', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'address', type: 'json' },
        { name: 'household_size', type: 'integer' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'food_preferences', type: 'json' },
        { name: 'dislikes', type: 'json' },
        { name: 'cuisine_preferences', type: 'json' },
        { name: 'kitchen_equipment', type: 'json' },
        { name: 'budget_range', type: 'string' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'booking' },
        { type: 'hasMany', target: 'menu' },
      ],
    },
    booking: {
      defaultFields: [
        { name: 'booking_date', type: 'date', required: true },
        { name: 'service_date', type: 'date', required: true },
        { name: 'arrival_time', type: 'datetime' },
        { name: 'service_type', type: 'enum', required: true },
        { name: 'service_duration', type: 'integer' },
        { name: 'guest_count', type: 'integer' },
        { name: 'occasion', type: 'string' },
        { name: 'menu_selected', type: 'json' },
        { name: 'special_requests', type: 'text' },
        { name: 'grocery_included', type: 'boolean' },
        { name: 'grocery_budget', type: 'decimal' },
        { name: 'service_fee', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'deposit', type: 'decimal' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'menu' },
      ],
    },
    menu: {
      defaultFields: [
        { name: 'menu_name', type: 'string', required: true },
        { name: 'menu_type', type: 'enum', required: true },
        { name: 'description', type: 'text' },
        { name: 'cuisine_type', type: 'string' },
        { name: 'courses', type: 'json' },
        { name: 'serves', type: 'integer' },
        { name: 'prep_time_hours', type: 'decimal' },
        { name: 'dietary_tags', type: 'json' },
        { name: 'price_per_person', type: 'decimal' },
        { name: 'grocery_cost_estimate', type: 'decimal' },
        { name: 'image_url', type: 'image' },
        { name: 'is_featured', type: 'boolean' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'hasMany', target: 'meal' },
      ],
    },
    meal: {
      defaultFields: [
        { name: 'meal_name', type: 'string', required: true },
        { name: 'meal_type', type: 'enum', required: true },
        { name: 'course', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'ingredients', type: 'json' },
        { name: 'prep_time_minutes', type: 'integer' },
        { name: 'cook_time_minutes', type: 'integer' },
        { name: 'servings', type: 'integer' },
        { name: 'calories_per_serving', type: 'integer' },
        { name: 'nutrition_info', type: 'json' },
        { name: 'dietary_tags', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'is_signature', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'menu' },
        { type: 'belongsTo', target: 'recipe' },
      ],
    },
    recipe: {
      defaultFields: [
        { name: 'recipe_name', type: 'string', required: true },
        { name: 'recipe_type', type: 'enum' },
        { name: 'cuisine', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'ingredients', type: 'json' },
        { name: 'instructions', type: 'json' },
        { name: 'prep_time_minutes', type: 'integer' },
        { name: 'cook_time_minutes', type: 'integer' },
        { name: 'servings', type: 'integer' },
        { name: 'difficulty', type: 'enum' },
        { name: 'tips', type: 'text' },
        { name: 'variations', type: 'json' },
        { name: 'image_url', type: 'image' },
        { name: 'source', type: 'string' },
      ],
      relationships: [
        { type: 'hasMany', target: 'meal' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'grocery_costs', type: 'decimal' },
        { name: 'service_fee', type: 'decimal' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
        { type: 'belongsTo', target: 'booking' },
      ],
    },
  },
};

export default personalchefBlueprint;
