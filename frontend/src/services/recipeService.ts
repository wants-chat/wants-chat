// @ts-nocheck
/**
 * Recipe Service - Comprehensive recipe management
 */

import { api } from '../lib/api';

// Types
export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings: number;
  difficulty?: string;
  cuisine?: string;
  category?: string;
  ingredients: any[];
  instructions: any[];
  nutrition?: any;
  tags?: string[];
  rating?: number;
  rating_count?: number;
  view_count?: number;
  favorite_count?: number;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MealPlan {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  plan_type?: string;
  start_date: string;
  end_date: string;
  meals: any[];
  tags?: string[];
  total_recipes?: number;
  total_calories?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  items: any[];
  meal_plan_id?: string;
  recipe_ids?: string[];
  store?: string;
  estimated_total?: number;
  total_items?: number;
  completed_items?: number;
  completion_percentage?: number;
  tags?: string[];
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface RecipeStats {
  totalRecipes: number;
  publicRecipes: number;
  privateRecipes: number;
  totalFavorites: number;
  totalRatings: number;
  averageRating: number;
  totalMealPlans: number;
  totalShoppingLists: number;
  recipesByCategory: Record<string, number>;
  recipesByDifficulty: Record<string, number>;
  mostUsedIngredients: Array<{ name: string; count: number }>;
  recentActivity: any[];
}

export interface RecipeRating {
  id: string;
  user_id: string;
  recipe_id: string;
  rating: number;
  review?: string;
  created_at: string;
  updated_at: string;
}

class RecipeService {
  // =============================================
  // RECIPE OPERATIONS
  // =============================================

  /**
   * Get all recipes with filtering
   */
  async getRecipes(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    cuisine?: string;
    difficulty?: string;
    tags?: string[];
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) {
    try {
      const response = await api.getRecipes(params);
      return response;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  }

  /**
   * Get single recipe by ID
   */
  async getRecipe(id: string): Promise<Recipe> {
    try {
      const response = await api.getRecipe(id);
      return response;
    } catch (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }
  }

  /**
   * Create a new recipe
   */
  async createRecipe(data: Partial<Recipe>): Promise<Recipe> {
    try {
      const response = await api.createRecipe(data);
      return response;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  }

  /**
   * Update an existing recipe
   */
  async updateRecipe(id: string, data: Partial<Recipe>): Promise<Recipe> {
    try {
      const response = await api.updateRecipe(id, data);
      return response;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  }

  /**
   * Delete a recipe
   */
  async deleteRecipe(id: string): Promise<void> {
    try {
      await api.deleteRecipe(id);
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  }

  /**
   * Get popular/trending recipes
   */
  async getPopularRecipes(limit?: number): Promise<Recipe[]> {
    try {
      const response = await api.getPopularRecipes(limit);
      return response;
    } catch (error) {
      console.error('Error fetching popular recipes:', error);
      throw error;
    }
  }

  // =============================================
  // FAVORITES OPERATIONS
  // =============================================

  /**
   * Add recipe to favorites
   */
  async addToFavorites(recipeId: string): Promise<void> {
    try {
      await api.favoriteRecipe(recipeId);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove recipe from favorites
   */
  async removeFromFavorites(recipeId: string): Promise<void> {
    try {
      await api.unfavoriteRecipe(recipeId);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite recipes
   */
  async getFavoriteRecipes(): Promise<Recipe[]> {
    try {
      const response = await api.getFavoriteRecipes();
      return response;
    } catch (error) {
      console.error('Error fetching favorite recipes:', error);
      throw error;
    }
  }

  // =============================================
  // RATING OPERATIONS
  // =============================================

  /**
   * Rate a recipe
   */
  async rateRecipe(recipeId: string, rating: number, review?: string): Promise<RecipeRating> {
    try {
      const response = await api.rateRecipe(recipeId, { rating, review });
      return response;
    } catch (error) {
      console.error('Error rating recipe:', error);
      throw error;
    }
  }

  /**
   * Get recipe ratings
   */
  async getRecipeRatings(recipeId: string, params?: { page?: number; limit?: number }) {
    try {
      const response = await api.getRecipeRatings(recipeId, params);
      return response;
    } catch (error) {
      console.error('Error fetching recipe ratings:', error);
      throw error;
    }
  }

  // =============================================
  // MEAL PLAN OPERATIONS
  // =============================================

  /**
   * Get all meal plans
   */
  async getMealPlans(params?: {
    page?: number;
    limit?: number;
    plan_type?: string;
    search?: string;
    tags?: string[];
    start_date?: string;
    end_date?: string;
  }) {
    try {
      const response = await api.getMealPlans(params);
      return response;
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      throw error;
    }
  }

  /**
   * Get single meal plan by ID
   */
  async getMealPlan(id: string): Promise<MealPlan> {
    try {
      const response = await api.getMealPlan(id);
      return response;
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      throw error;
    }
  }

  /**
   * Create a new meal plan
   */
  async createMealPlan(data: {
    name: string;
    description?: string;
    plan_type: string;
    start_date: string;
    end_date: string;
    meals: any[];
    tags?: string[];
  }): Promise<MealPlan> {
    try {
      const response = await api.createMealPlan(data);
      return response;
    } catch (error) {
      console.error('Error creating meal plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing meal plan
   */
  async updateMealPlan(id: string, data: Partial<MealPlan>): Promise<MealPlan> {
    try {
      const response = await api.updateMealPlan(id, data);
      return response;
    } catch (error) {
      console.error('Error updating meal plan:', error);
      throw error;
    }
  }

  /**
   * Delete a meal plan
   */
  async deleteMealPlan(id: string): Promise<void> {
    try {
      await api.deleteMealPlan(id);
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  }

  // =============================================
  // SHOPPING LIST OPERATIONS
  // =============================================

  /**
   * Get all shopping lists
   */
  async getShoppingLists(params?: {
    page?: number;
    limit?: number;
    search?: string;
    store?: string;
  }) {
    try {
      const response = await api.getShoppingLists(params);
      return response;
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
      throw error;
    }
  }

  /**
   * Get single shopping list by ID
   */
  async getShoppingList(id: string): Promise<ShoppingList> {
    try {
      const response = await api.getShoppingList(id);
      return response;
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      throw error;
    }
  }

  /**
   * Create a new shopping list
   */
  async createShoppingList(data: {
    name: string;
    description?: string;
    items: any[];
    recipe_ids?: string[];
    store?: string;
    tags?: string[];
  }): Promise<ShoppingList> {
    try {
      const response = await api.createShoppingList(data);
      return response;
    } catch (error) {
      console.error('Error creating shopping list:', error);
      throw error;
    }
  }

  /**
   * Generate shopping list from meal plan
   */
  async generateShoppingListFromMealPlan(mealPlanId: string): Promise<ShoppingList> {
    try {
      const response = await api.generateShoppingListFromMealPlan(mealPlanId);
      return response;
    } catch (error) {
      console.error('Error generating shopping list:', error);
      throw error;
    }
  }

  /**
   * Update an existing shopping list
   */
  async updateShoppingList(id: string, data: Partial<ShoppingList>): Promise<ShoppingList> {
    try {
      const response = await api.updateShoppingList(id, data);
      return response;
    } catch (error) {
      console.error('Error updating shopping list:', error);
      throw error;
    }
  }

  /**
   * Delete a shopping list
   */
  async deleteShoppingList(id: string): Promise<void> {
    try {
      await api.deleteShoppingList(id);
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      throw error;
    }
  }

  // =============================================
  // SHOPPING LIST ITEM OPERATIONS
  // =============================================

  /**
   * Add item to shopping list
   */
  async addItemToShoppingList(
    listId: string,
    item: {
      name: string;
      quantity: string;
      category?: string;
      estimated_price?: number;
      notes?: string;
    }
  ): Promise<ShoppingList> {
    try {
      const response = await api.addItemToShoppingList(listId, item);
      return response;
    } catch (error) {
      console.error('Error adding item to shopping list:', error);
      throw error;
    }
  }

  /**
   * Update shopping list item
   */
  async updateShoppingListItem(
    listId: string,
    itemId: string,
    data: {
      name?: string;
      quantity?: string;
      category?: string;
      completed?: boolean;
      estimated_price?: number;
      notes?: string;
    }
  ): Promise<ShoppingList> {
    try {
      const response = await api.updateShoppingListItem(listId, itemId, data);
      return response;
    } catch (error) {
      console.error('Error updating shopping list item:', error);
      throw error;
    }
  }

  /**
   * Remove item from shopping list
   */
  async removeItemFromShoppingList(listId: string, itemId: string): Promise<ShoppingList> {
    try {
      const response = await api.removeItemFromShoppingList(listId, itemId);
      return response;
    } catch (error) {
      console.error('Error removing item from shopping list:', error);
      throw error;
    }
  }

  /**
   * Toggle item completion status
   */
  async toggleShoppingListItem(listId: string, itemId: string, completed: boolean): Promise<ShoppingList> {
    try {
      const response = await this.updateShoppingListItem(listId, itemId, { completed });
      return response;
    } catch (error) {
      console.error('Error toggling shopping list item:', error);
      throw error;
    }
  }

  // =============================================
  // STATISTICS OPERATIONS
  // =============================================

  /**
   * Get user recipe statistics
   */
  async getRecipeStats(): Promise<RecipeStats> {
    try {
      const response = await api.getRecipeStats();
      // Backend now returns camelCase (CLAUDE.md Rule #2)
      return {
        totalRecipes: response.totalRecipes || 0,
        publicRecipes: 0,
        privateRecipes: 0,
        totalFavorites: response.favoriteRecipes || 0,
        totalRatings: response.totalRatings || 0,
        averageRating: response.averageRating || 0,
        totalMealPlans: response.totalMealPlans || 0,
        totalShoppingLists: response.activeShoppingLists || 0,
        recipesByCategory: {},
        recipesByDifficulty: {
          easy: 0,
          medium: 0,
          hard: 0,
        },
        mostUsedIngredients: [],
        recentActivity: [],
      };
    } catch (error) {
      console.error('Error fetching recipe stats:', error);
      throw error;
    }
  }

  // =============================================
  // HELPER METHODS
  // =============================================

  /**
   * Search recipes
   */
  async searchRecipes(query: string, filters?: any) {
    return this.getRecipes({
      search: query,
      ...filters,
    });
  }

  /**
   * Get recipes by category
   */
  async getRecipesByCategory(category: string, params?: any) {
    return this.getRecipes({
      category,
      ...params,
    });
  }

  /**
   * Get recipes by cuisine
   */
  async getRecipesByCuisine(cuisine: string, params?: any) {
    return this.getRecipes({
      cuisine,
      ...params,
    });
  }

  /**
   * Check if recipe is favorited
   */
  async isRecipeFavorited(recipeId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavoriteRecipes();
      return favorites.some(recipe => recipe.id === recipeId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  /**
   * Get meal plan for date range
   */
  async getMealPlanForDateRange(startDate: string, endDate: string) {
    return this.getMealPlans({
      start_date: startDate,
      end_date: endDate,
    });
  }

  /**
   * Get completed shopping lists
   */
  async getCompletedShoppingLists() {
    const lists = await this.getShoppingLists();
    return lists.data?.filter((list: ShoppingList) =>
      (list.completion_percentage ?? 0) === 100
    ) || [];
  }

  /**
   * Get active shopping lists
   */
  async getActiveShoppingLists() {
    const lists = await this.getShoppingLists();
    return lists.data?.filter((list: ShoppingList) =>
      (list.completion_percentage ?? 0) < 100
    ) || [];
  }
}

// Create and export singleton instance
export const recipeService = new RecipeService();
export default recipeService;