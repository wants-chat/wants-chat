import { Blueprint } from './blueprint.interface';

/**
 * Recipe Blueprint
 */
export const recipeBlueprint: Blueprint = {
  appType: 'recipe',
  description: 'Recipe app with recipes, ingredients, meal plans, and shopping lists',

  coreEntities: ['recipe', 'ingredient', 'category', 'collection', 'meal_plan', 'review'],

  commonFields: { timestamps: true, softDelete: true, userOwnership: true },

  pages: [
    { path: '/', name: 'Discover', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar', props: { links: [
        { label: 'Discover', path: '/', icon: 'Compass' },
        { label: 'Categories', path: '/categories', icon: 'Grid' },
        { label: 'My Recipes', path: '/my-recipes', icon: 'ChefHat' },
        { label: 'Meal Plans', path: '/meal-plans', icon: 'Calendar' },
        { label: 'Shopping List', path: '/shopping-list', icon: 'ShoppingCart' },
      ]}},
      { id: 'featured', component: 'featured-recipes', entity: 'recipe', position: 'main' },
      { id: 'popular', component: 'recipe-grid', entity: 'recipe', position: 'main', props: { title: 'Popular Recipes' }},
    ]},
    { path: '/recipes/:id', name: 'Recipe', layout: 'single-column', requiresAuth: false, sections: [
      { id: 'recipe-header', component: 'recipe-header', entity: 'recipe', position: 'main' },
      { id: 'recipe-ingredients', component: 'ingredient-list', entity: 'ingredient', position: 'main' },
      { id: 'recipe-steps', component: 'recipe-steps', entity: 'recipe', position: 'main' },
      { id: 'recipe-nutrition', component: 'nutrition-info', entity: 'recipe', position: 'main' },
      { id: 'reviews', component: 'review-list', entity: 'review', position: 'main' },
    ]},
    { path: '/categories', name: 'Categories', layout: 'dashboard', requiresAuth: false, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'category-grid', component: 'category-grid', entity: 'category', position: 'main' },
    ]},
    { path: '/my-recipes', name: 'My Recipes', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'my-recipes', component: 'recipe-grid', entity: 'recipe', position: 'main' },
    ]},
    { path: '/recipes/new', name: 'Add Recipe', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'recipe-form', component: 'recipe-form', entity: 'recipe', position: 'main' },
    ]},
    { path: '/meal-plans', name: 'Meal Plans', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'meal-planner', component: 'meal-planner', entity: 'meal_plan', position: 'main' },
    ]},
    { path: '/shopping-list', name: 'Shopping List', layout: 'dashboard', requiresAuth: true, sections: [
      { id: 'sidebar', component: 'sidebar', position: 'sidebar' },
      { id: 'shopping-list', component: 'shopping-list', entity: 'ingredient', position: 'main' },
    ]},
  ],

  endpoints: [
    { method: 'GET', path: '/recipes', entity: 'recipe', operation: 'list' },
    { method: 'GET', path: '/recipes/:id', entity: 'recipe', operation: 'get' },
    { method: 'POST', path: '/recipes', entity: 'recipe', operation: 'create', requiresAuth: true },
    { method: 'GET', path: '/categories', entity: 'category', operation: 'list' },
    { method: 'GET', path: '/meal-plans', entity: 'meal_plan', operation: 'list', requiresAuth: true },
    { method: 'POST', path: '/meal-plans', entity: 'meal_plan', operation: 'create', requiresAuth: true },
    { method: 'POST', path: '/recipes/:id/reviews', entity: 'review', operation: 'create', requiresAuth: true },
  ],

  entityConfig: {
    recipe: {
      defaultFields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'text' },
        { name: 'image_url', type: 'image' },
        { name: 'prep_time', type: 'integer' },
        { name: 'cook_time', type: 'integer' },
        { name: 'servings', type: 'integer' },
        { name: 'difficulty', type: 'enum' },
        { name: 'ingredients', type: 'json', required: true },
        { name: 'instructions', type: 'json', required: true },
        { name: 'nutrition', type: 'json' },
        { name: 'rating', type: 'decimal' },
        { name: 'review_count', type: 'integer' },
        { name: 'tags', type: 'json' },
      ],
      relationships: [
        { type: 'belongsTo', target: 'category' },
        { type: 'hasMany', target: 'review' },
      ],
    },
  },
};

export default recipeBlueprint;
