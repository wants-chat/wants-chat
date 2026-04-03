/**
 * Recipe Types
 * All recipe-related type definitions
 */

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  cuisine?: string;
  imageUrl?: string;
  videoUrl?: string;
  userId: string;
  isPublic: boolean;
  isFavorited: boolean;
  rating: number;
  ratingsCount: number;
  tags?: string[];
  nutrition?: RecipeNutrition;
  createdAt: string;
  updatedAt: string;
  aiAnalyzed?: boolean;
}

export interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

export interface CreateRecipeData {
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  cuisine?: string;
  image?: File;
  isPublic?: boolean;
  tags?: string[];
  nutrition?: RecipeNutrition;
}

export interface UpdateRecipeData {
  title?: string;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  cuisine?: string;
  image?: File;
  isPublic?: boolean;
  tags?: string[];
  nutrition?: RecipeNutrition;
}

// Legacy Recipe type for backwards compatibility with existing components
export interface LegacyRecipe {
  id: string;
  title: string;
  description: string;
  image?: string;
  video?: string;
  cookTime: number;
  prepTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  rating: number;
  isFavorite: boolean;
  createdAt: string;
  aiAnalyzed?: boolean;
}

// Recipe filter types
export interface RecipeFilters {
  search?: string;
  category?: string;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  isPublic?: boolean;
  isFavorited?: boolean;
  maxPrepTime?: number;
  maxCookTime?: number;
  userId?: string;
  sortBy?: 'title' | 'createdAt' | 'rating' | 'prepTime' | 'cookTime';
  sortOrder?: 'asc' | 'desc';
}

// Recipe form types
export interface RecipeFormData extends Omit<Recipe, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingsCount'> {
  image?: File;
}

// Upload method types
export type UploadMethod = 'manual' | 'image' | 'video' | 'url';

// Chat message types for AI assistant
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Meal plan types
export interface MealPlan {
  [day: string]: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
  };
}

// Component prop types
export interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite?: (recipeId: string, isCurrentlyFavorited: boolean) => void;
  onViewDetails?: (recipeId: string) => void;
}

export interface RecipeListProps {
  recipes: Recipe[];
  loading?: boolean;
  onToggleFavorite?: (recipeId: string, isCurrentlyFavorited: boolean) => void;
}

export interface RecipeFiltersProps {
  filters: RecipeFilters;
  onFiltersChange: (filters: RecipeFilters) => void;
  cuisines: string[];
  totalRecipes: number;
  filteredCount: number;
}