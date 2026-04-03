import { Blueprint } from './blueprint.interface';

/**
 * Nutritionist/Dietitian Blueprint
 */
export const nutritionistBlueprint: Blueprint = {
  appType: 'nutritionist',
  description: 'Nutrition practice with clients, consultations, meal plans, and progress tracking',

  coreEntities: ['client', 'consultation', 'mealplan', 'recipe', 'progress', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Clients', path: '/clients', icon: 'Users' },
        { label: 'Consultations', path: '/consultations', icon: 'Calendar' },
        { label: 'Meal Plans', path: '/mealplans', icon: 'UtensilsCrossed' },
        { label: 'Recipes', path: '/recipes', icon: 'ChefHat' },
        { label: 'Progress', path: '/progress', icon: 'TrendingUp' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-consultations', component: 'appointment-list', entity: 'consultation', position: 'main' },
    ]},
    { path: '/clients', name: 'Clients', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'client-table', component: 'data-table', entity: 'client', position: 'main' },
    ]},
    { path: '/consultations', name: 'Consultations', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'consultation-calendar', component: 'appointment-calendar', entity: 'consultation', position: 'main' },
    ]},
    { path: '/mealplans', name: 'Meal Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'mealplan-table', component: 'data-table', entity: 'mealplan', position: 'main' },
    ]},
    { path: '/recipes', name: 'Recipes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'recipe-grid', component: 'product-grid', entity: 'recipe', position: 'main' },
    ]},
    { path: '/progress', name: 'Progress', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'progress-table', component: 'data-table', entity: 'progress', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/book', name: 'Book', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'booking-wizard', component: 'booking-wizard', entity: 'consultation', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/clients', entity: 'client', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/clients', entity: 'client', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/consultations', entity: 'consultation', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/consultations', entity: 'consultation', operation: 'create' },
    { method: 'GET', path: '/mealplans', entity: 'mealplan', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/recipes', entity: 'recipe', operation: 'list' },
    { method: 'GET', path: '/progress', entity: 'progress', operation: 'list', requiresAuth: true },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    client: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'gender', type: 'enum' },
        { name: 'height_cm', type: 'decimal' },
        { name: 'current_weight_kg', type: 'decimal' },
        { name: 'target_weight_kg', type: 'decimal' },
        { name: 'health_conditions', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'food_preferences', type: 'json' },
        { name: 'lifestyle_info', type: 'json' },
        { name: 'activity_level', type: 'enum' },
        { name: 'nutrition_goals', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'consultation' },
        { type: 'hasMany', target: 'mealplan' },
        { type: 'hasMany', target: 'progress' },
      ],
    },
    consultation: {
      defaultFields: [
        { name: 'consultation_date', type: 'date', required: true },
        { name: 'start_time', type: 'datetime', required: true },
        { name: 'end_time', type: 'datetime' },
        { name: 'consultation_type', type: 'enum', required: true },
        { name: 'current_weight', type: 'decimal' },
        { name: 'body_composition', type: 'json' },
        { name: 'dietary_analysis', type: 'text' },
        { name: 'goals_discussed', type: 'json' },
        { name: 'recommendations', type: 'json' },
        { name: 'action_items', type: 'json' },
        { name: 'follow_up_date', type: 'date' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    mealplan: {
      defaultFields: [
        { name: 'plan_name', type: 'string', required: true },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date' },
        { name: 'plan_type', type: 'enum' },
        { name: 'daily_calories', type: 'integer' },
        { name: 'macro_targets', type: 'json' },
        { name: 'meals', type: 'json' },
        { name: 'snacks', type: 'json' },
        { name: 'hydration_goal', type: 'string' },
        { name: 'supplements', type: 'json' },
        { name: 'special_instructions', type: 'text' },
        { name: 'shopping_list', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    recipe: {
      defaultFields: [
        { name: 'recipe_name', type: 'string', required: true },
        { name: 'category', type: 'enum', required: true },
        { name: 'meal_type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'ingredients', type: 'json' },
        { name: 'instructions', type: 'json' },
        { name: 'prep_time_minutes', type: 'integer' },
        { name: 'cook_time_minutes', type: 'integer' },
        { name: 'servings', type: 'integer' },
        { name: 'nutrition_info', type: 'json' },
        { name: 'dietary_tags', type: 'json' },
        { name: 'tips', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'is_featured', type: 'boolean' },
      ],
      relationships: [],
    },
    progress: {
      defaultFields: [
        { name: 'record_date', type: 'date', required: true },
        { name: 'weight_kg', type: 'decimal' },
        { name: 'body_fat_percent', type: 'decimal' },
        { name: 'muscle_mass_kg', type: 'decimal' },
        { name: 'measurements', type: 'json' },
        { name: 'energy_level', type: 'enum' },
        { name: 'sleep_quality', type: 'enum' },
        { name: 'digestion', type: 'enum' },
        { name: 'adherence_score', type: 'integer' },
        { name: 'food_diary', type: 'json' },
        { name: 'exercise_log', type: 'json' },
        { name: 'challenges', type: 'text' },
        { name: 'wins', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'insurance_info', type: 'json' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'client' },
      ],
    },
  },
};

export default nutritionistBlueprint;
