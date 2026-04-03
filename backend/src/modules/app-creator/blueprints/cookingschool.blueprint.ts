import { Blueprint } from './blueprint.interface';

/**
 * Cooking School Blueprint
 */
export const cookingschoolBlueprint: Blueprint = {
  appType: 'cookingschool',
  description: 'Culinary school with students, classes, chefs, and recipe library',

  coreEntities: ['student', 'class', 'chef', 'enrollment', 'recipe', 'invoice'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Dashboard', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Dashboard', path: '/', icon: 'LayoutDashboard' },
        { label: 'Students', path: '/students', icon: 'Users' },
        { label: 'Classes', path: '/classes', icon: 'ChefHat' },
        { label: 'Chefs', path: '/chefs', icon: 'UtensilsCrossed' },
        { label: 'Enrollments', path: '/enrollments', icon: 'UserPlus' },
        { label: 'Recipes', path: '/recipes', icon: 'BookOpen' },
        { label: 'Invoices', path: '/invoices', icon: 'Receipt' },
      ]}},
      { id: 'stats', component: 'stats-cards', position: 'main' },
      { id: 'upcoming-classes', component: 'appointment-list', entity: 'class', position: 'main' },
    ]},
    { path: '/students', name: 'Students', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'student-table', component: 'data-table', entity: 'student', position: 'main' },
    ]},
    { path: '/classes', name: 'Classes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'class-grid', component: 'product-grid', entity: 'class', position: 'main' },
    ]},
    { path: '/chefs', name: 'Chefs', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'chef-grid', component: 'staff-grid', entity: 'chef', position: 'main' },
    ]},
    { path: '/enrollments', name: 'Enrollments', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'enrollment-table', component: 'data-table', entity: 'enrollment', position: 'main' },
    ]},
    { path: '/recipes', name: 'Recipes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'recipe-grid', component: 'product-grid', entity: 'recipe', position: 'main' },
    ]},
    { path: '/invoices', name: 'Invoices', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'invoice-table', component: 'data-table', entity: 'invoice', position: 'main' },
    ]},
    { path: '/register', name: 'Register', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'registration-form', component: 'booking-wizard', entity: 'enrollment', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/students', entity: 'student', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/students', entity: 'student', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/classes', entity: 'class', operation: 'list' },
    { method: 'GET', path: '/chefs', entity: 'chef', operation: 'list' },
    { method: 'GET', path: '/enrollments', entity: 'enrollment', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/enrollments', entity: 'enrollment', operation: 'create' },
    { method: 'GET', path: '/recipes', entity: 'recipe', operation: 'list' },
    { method: 'GET', path: '/invoices', entity: 'invoice', operation: 'list', requiresAuth: true },
  ],

  entityConfig: {
    student: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'date_of_birth', type: 'date' },
        { name: 'skill_level', type: 'enum' },
        { name: 'cooking_interests', type: 'json' },
        { name: 'dietary_restrictions', type: 'json' },
        { name: 'allergies', type: 'json' },
        { name: 'goals', type: 'text' },
        { name: 'emergency_contact', type: 'json' },
        { name: 'photo_url', type: 'image' },
        { name: 'notes', type: 'text' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'enrollment' },
      ],
    },
    class: {
      defaultFields: [
        { name: 'class_name', type: 'string', required: true },
        { name: 'cuisine_type', type: 'enum', required: true },
        { name: 'class_type', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'skill_level', type: 'enum' },
        { name: 'schedule', type: 'json' },
        { name: 'class_date', type: 'date' },
        { name: 'start_time', type: 'datetime' },
        { name: 'duration_hours', type: 'decimal' },
        { name: 'class_size', type: 'integer' },
        { name: 'enrolled_count', type: 'integer' },
        { name: 'menu', type: 'json' },
        { name: 'ingredients_provided', type: 'boolean' },
        { name: 'equipment_needed', type: 'json' },
        { name: 'price', type: 'decimal', required: true },
        { name: 'image_url', type: 'image' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'chef' },
        { type: 'hasMany', target: 'enrollment' },
        { type: 'hasMany', target: 'recipe' },
      ],
    },
    chef: {
      defaultFields: [
        { name: 'first_name', type: 'string', required: true },
        { name: 'last_name', type: 'string', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'phone', type: 'phone' },
        { name: 'title', type: 'string' },
        { name: 'specializations', type: 'json' },
        { name: 'cuisine_expertise', type: 'json' },
        { name: 'experience_years', type: 'integer' },
        { name: 'credentials', type: 'json' },
        { name: 'bio', type: 'text' },
        { name: 'teaching_style', type: 'text' },
        { name: 'photo_url', type: 'image' },
        { name: 'availability', type: 'json' },
        { name: 'is_active', type: 'boolean' },
      ],
      relationships: [
        { type: 'hasMany', target: 'class' },
        { type: 'hasMany', target: 'recipe' },
      ],
    },
    enrollment: {
      defaultFields: [
        { name: 'enrollment_date', type: 'date', required: true },
        { name: 'payment_status', type: 'enum' },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'dietary_notes', type: 'text' },
        { name: 'allergies_confirmed', type: 'boolean' },
        { name: 'attendance', type: 'boolean' },
        { name: 'feedback', type: 'text' },
        { name: 'rating', type: 'integer' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
        { type: 'belongsTo', target: 'class' },
      ],
    },
    recipe: {
      defaultFields: [
        { name: 'recipe_name', type: 'string', required: true },
        { name: 'cuisine', type: 'enum' },
        { name: 'category', type: 'enum' },
        { name: 'description', type: 'text' },
        { name: 'ingredients', type: 'json' },
        { name: 'instructions', type: 'json' },
        { name: 'prep_time_minutes', type: 'integer' },
        { name: 'cook_time_minutes', type: 'integer' },
        { name: 'servings', type: 'integer' },
        { name: 'difficulty', type: 'enum' },
        { name: 'dietary_info', type: 'json' },
        { name: 'nutrition_info', type: 'json' },
        { name: 'tips', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'video_url', type: 'string' },
        { name: 'is_public', type: 'boolean' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'chef' },
        { type: 'belongsTo', target: 'class' },
      ],
    },
    invoice: {
      defaultFields: [
        { name: 'invoice_number', type: 'string', required: true },
        { name: 'invoice_date', type: 'date', required: true },
        { name: 'due_date', type: 'date' },
        { name: 'line_items', type: 'json' },
        { name: 'subtotal', type: 'decimal' },
        { name: 'discount', type: 'decimal' },
        { name: 'tax', type: 'decimal' },
        { name: 'total', type: 'decimal', required: true },
        { name: 'amount_paid', type: 'decimal' },
        { name: 'balance_due', type: 'decimal' },
        { name: 'payment_method', type: 'enum' },
        { name: 'notes', type: 'text' },
        { name: 'status', type: 'enum', required: true },
      ],
      relationships: [
        { type: 'belongsTo', target: 'student' },
      ],
    },
  },
};

export default cookingschoolBlueprint;
