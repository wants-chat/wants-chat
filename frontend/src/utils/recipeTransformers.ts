/**
 * Recipe data transformation utilities
 * Handles conversion between frontend and backend formats
 */

import { Recipe, CreateRecipeData, UpdateRecipeData } from '../types/recipe';

/**
 * Transform frontend recipe data for backend API
 */
export function transformRecipeForBackend(data: CreateRecipeData | UpdateRecipeData) {
  const transformed: any = {};

  // Map basic fields
  if ('title' in data) transformed.title = data.title;
  if ('description' in data) transformed.description = data.description;
  if ('servings' in data) transformed.servings = data.servings;
  if ('difficulty' in data) transformed.difficulty = data.difficulty;
  if ('tags' in data) transformed.tags = data.tags;
  if ('cuisine' in data) transformed.cuisine = data.cuisine;
  if ('category' in data) transformed.category = data.category;
  
  // Map field names that differ - backend expects these field names
  if ('prepTime' in data) transformed.prep_time = data.prepTime;
  if ('cookTime' in data) transformed.cook_time = data.cookTime;
  if ('isPublic' in data) transformed.is_public = data.isPublic;
  
  // Handle image - can be imageUrl, image_url, or image (base64)
  if ('imageUrl' in data) transformed.image_url = data.imageUrl;
  if ('image_url' in data) transformed.image_url = data.image_url;
  if ('image' in data && data.image) transformed.image_url = data.image;
  
  // Calculate total time if prep and cook time are provided
  if (transformed.prep_time && transformed.cook_time) {
    transformed.total_time = transformed.prep_time + transformed.cook_time;
  }
  
  // Transform ingredients: string[] to object[]
  if ('ingredients' in data && data.ingredients) {
    // Check if ingredients are already objects (properly formatted)
    if (data.ingredients.length > 0 && typeof data.ingredients[0] === 'object' && 'name' in data.ingredients[0]) {
      transformed.ingredients = data.ingredients;
    } else {
      // Transform string ingredients to objects
      transformed.ingredients = data.ingredients.map((ing) => {
        if (typeof ing === 'object' && 'name' in ing) {
          return ing; // Already formatted
        }
        // Try to parse structured format like "2 cups flour"
        const match = ing.match(/^(\d+(?:\.\d+)?)\s*(\w+)?\s+(.+)$/);
        if (match) {
          return {
            name: match[3],
            amount: match[1],
            unit: match[2] || ''
          };
        }
        // Fallback: treat entire string as name
        return {
          name: ing,
          amount: '',
          unit: ''
        };
      });
    }
  }
  
  // Transform instructions: string[] to object[]
  if ('instructions' in data && data.instructions) {
    // Check if instructions are already objects (properly formatted)
    if (data.instructions.length > 0 && typeof data.instructions[0] === 'object' && 'description' in data.instructions[0]) {
      transformed.instructions = data.instructions;
    } else {
      // Transform string instructions to objects
      transformed.instructions = data.instructions.map((inst, index) => {
        if (typeof inst === 'object' && 'description' in inst) {
          return inst; // Already formatted
        }
        return {
          step: index + 1,
          description: inst
        };
      });
    }
  }
  
  // Transform nutrition
  if ('nutrition' in data && data.nutrition) {
    transformed.nutrition = {
      calories: data.nutrition.calories,
      protein_g: data.nutrition.protein,
      carbs_g: data.nutrition.carbs,
      fat_g: data.nutrition.fat,
      fiber_g: data.nutrition.fiber,
      sugar_g: data.nutrition.sugar
    };
  }
  
  return transformed;
}

/**
 * Transform backend recipe data for frontend display
 */
export function transformRecipeFromBackend(recipe: any): Recipe {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    
    // Map field names
    prepTime: recipe.prep_time_minutes || recipe.prep_time || 0,
    cookTime: recipe.cook_time_minutes || recipe.cook_time || 0,
    category: recipe.meal_type || recipe.category || '',
    imageUrl: recipe.image_url || recipe.imageUrl,
    videoUrl: recipe.video_url || recipe.videoUrl,
    isPublic: recipe.is_public !== undefined ? recipe.is_public : recipe.isPublic,
    ratingsCount: recipe.rating_count || recipe.ratingsCount || 0,
    
    // Transform complex fields
    ingredients: transformIngredientsFromBackend(recipe.ingredients),
    instructions: transformInstructionsFromBackend(recipe.instructions),
    nutrition: transformNutritionFromBackend(recipe.nutrition),
    
    // Direct mappings
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    userId: recipe.user_id || recipe.userId,
    isFavorited: recipe.is_favorited || recipe.isFavorited || false,
    rating: recipe.rating || 0,
    tags: recipe.tags || [],
    cuisine: recipe.cuisine || recipe.source || '',
    
    // Timestamps
    createdAt: recipe.created_at || recipe.createdAt,
    updatedAt: recipe.updated_at || recipe.updatedAt,
    aiAnalyzed: recipe.ai_analyzed || recipe.aiAnalyzed || false
  };
}

/**
 * Transform ingredients from backend format to frontend format
 */
function transformIngredientsFromBackend(ingredients: any): string[] {
  if (!ingredients) return [];
  
  // If already an array of strings, return as-is
  if (Array.isArray(ingredients) && ingredients.every(ing => typeof ing === 'string')) {
    return ingredients;
  }
  
  // If array of objects, transform to strings
  if (Array.isArray(ingredients)) {
    return ingredients.map(ing => {
      if (typeof ing === 'string') return ing;
      if (ing.amount && ing.unit && ing.name) {
        return `${ing.amount} ${ing.unit} ${ing.name}`.trim();
      }
      if (ing.amount && ing.name) {
        return `${ing.amount} ${ing.name}`.trim();
      }
      return ing.name || '';
    });
  }
  
  return [];
}

/**
 * Transform instructions from backend format to frontend format
 */
function transformInstructionsFromBackend(instructions: any): string[] {
  if (!instructions) return [];
  
  // If already an array of strings, return as-is
  if (Array.isArray(instructions) && instructions.every(inst => typeof inst === 'string')) {
    return instructions;
  }
  
  // If array of objects, extract descriptions
  if (Array.isArray(instructions)) {
    return instructions
      .sort((a, b) => (a.step || 0) - (b.step || 0))
      .map(inst => {
        if (typeof inst === 'string') return inst;
        return inst.description || '';
      });
  }
  
  return [];
}

/**
 * Transform nutrition from backend format to frontend format
 */
function transformNutritionFromBackend(nutrition: any): Recipe['nutrition'] {
  if (!nutrition) return undefined;
  
  return {
    calories: nutrition.calories,
    protein: nutrition.protein_g || nutrition.protein,
    carbs: nutrition.carbs_g || nutrition.carbs,
    fat: nutrition.fat_g || nutrition.fat,
    fiber: nutrition.fiber_g || nutrition.fiber,
    sugar: nutrition.sugar_g || nutrition.sugar
  };
}

/**
 * Transform recipe filters for backend API
 */
export function transformFiltersForBackend(filters: any) {
  const transformed: any = {};
  
  if (filters.search) transformed.search = filters.search;
  if (filters.category) transformed.meal_type = filters.category;
  if (filters.cuisine) transformed.cuisine = filters.cuisine;
  if (filters.difficulty) transformed.difficulty = filters.difficulty;
  if (filters.tags) transformed.tags = filters.tags;
  if (filters.isPublic !== undefined) transformed.is_public = filters.isPublic;
  if (filters.isFavorited !== undefined) transformed.is_favorited = filters.isFavorited;
  if (filters.maxPrepTime) transformed.max_prep_time = filters.maxPrepTime;
  if (filters.maxCookTime) transformed.max_cook_time = filters.maxCookTime;
  if (filters.userId) transformed.user_id = filters.userId;
  if (filters.sortBy) {
    // Map frontend sort fields to backend
    const sortMapping: Record<string, string> = {
      'prepTime': 'prep_time',
      'cookTime': 'cook_time',
      'createdAt': 'created_at',
      'title': 'title',
      'rating': 'rating'
    };
    transformed.sort_by = sortMapping[filters.sortBy] || filters.sortBy;
  }
  if (filters.sortOrder) transformed.sort_order = filters.sortOrder;
  
  return transformed;
}