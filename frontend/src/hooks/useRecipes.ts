/**
 * Recipe management hooks
 */

import { useCallback, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { useApi, useMutation, usePaginatedApi } from './useApi';
import {
  transformRecipeForBackend,
  transformRecipeFromBackend,
  transformFiltersForBackend
} from '../utils/recipeTransformers';

// Types
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
  userId: string;
  isPublic: boolean;
  isFavorited: boolean;
  rating: number;
  ratingsCount: number;
  tags?: string[];
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MealPlan {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  userId: string;
  meals: MealPlanDay[];
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanDay {
  date: string;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  snacks?: Recipe[];
}

export interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  userId: string;
  items: ShoppingListItem[];
  mealPlanId?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  category?: string;
  completed: boolean;
  notes?: string;
}

export interface RecipeRating {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  recipeId: string;
  createdAt: string;
  updatedAt: string;
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
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
  };
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
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugar?: number;
  };
}

export interface CreateMealPlanData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  meals: Array<{
    date: string;
    breakfastId?: string;
    lunchId?: string;
    dinnerId?: string;
    snackIds?: string[];
  }>;
}

export interface UpdateMealPlanData {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  meals?: Array<{
    date: string;
    breakfastId?: string;
    lunchId?: string;
    dinnerId?: string;
    snackIds?: string[];
  }>;
}

export interface CreateShoppingListData {
  name: string;
  description?: string;
  mealPlanId?: string;
  items: Array<{
    name: string;
    quantity: string;
    unit?: string;
    category?: string;
    notes?: string;
  }>;
}

export interface UpdateShoppingListData {
  name?: string;
  description?: string;
  completed?: boolean;
}

export interface AddShoppingListItemData {
  name: string;
  quantity: string;
  unit?: string;
  category?: string;
  notes?: string;
}

export interface UpdateShoppingListItemData {
  name?: string;
  quantity?: string;
  unit?: string;
  category?: string;
  completed?: boolean;
  notes?: string;
}

export interface RateRecipeData {
  rating: number;
  comment?: string;
}

// Recipe hooks

/**
 * Get recipes with filtering and pagination
 */
export function useRecipes(params?: {
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
}) {
  return usePaginatedApi<Recipe>(
    useCallback(
      async ({ page, limit }) => {
        const transformedParams = transformFiltersForBackend({ ...params, page, limit });
        const response = await api.getRecipes(transformedParams);

        // Transform response data
        if (response && response.data) {
          response.data = response.data.map(transformRecipeFromBackend);
        }

        return response;
      },
      [params]
    ),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Get public recipes with filtering and pagination
 */
export function usePublicRecipes(params?: {
  page?: number;
  limit?: number;
  search?: string;
  cuisine?: string;
  difficulty?: string;
  meal_type?: string;
  dietary_restrictions?: string[];
  tags?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  public_only?: boolean;
  with_images?: boolean;
  min_rating?: number;
}) {
  const paramsKey = JSON.stringify(params);
  const isFirstRender = useRef(true);

  const result = useApi(
    useCallback(
      async () => {
        const response = await api.getPublicRecipes(params);

        // Transform response data if needed
        if (response && response.data) {
          response.data = response.data.map(transformRecipeFromBackend);
        }

        return response;
      },
      [paramsKey]
    ),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );

  // Refetch whenever params change (but not on first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    result.refetch();
  }, [paramsKey]);

  return result;
}

/**
 * Get single recipe by ID
 */
export function useRecipe(id: string | null) {
  return useApi<Recipe>(
    async () => {
      const response = await api.getRecipe(id!);
      return transformRecipeFromBackend(response);
    },
    {
      enabled: !!id,
      refetchOnMount: true,
    }
  );
}

/**
 * Create a new recipe
 */
export function useCreateRecipe() {
  return useMutation<Recipe, CreateRecipeData>(
    async (data) => {
      const transformed = transformRecipeForBackend(data);
      
      // Always send as JSON - FormData handling can be added later if needed
      const response = await api.createRecipe(transformed);
      return transformRecipeFromBackend(response);
    },
    {
      onSuccess: (data) => {
        console.log('Recipe created successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to create recipe:', error);
      },
    }
  );
}

/**
 * Update an existing recipe
 */
export function useUpdateRecipe() {
  return useMutation<Recipe, { id: string; data: UpdateRecipeData }>(
    async ({ id, data }) => {
      const transformed = transformRecipeForBackend(data);
      
      // Send as JSON - FormData handling can be added later if needed for image upload
      const response = await api.updateRecipe(id, transformed);
      return transformRecipeFromBackend(response);
    },
    {
      onSuccess: (data) => {
        console.log('Recipe updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update recipe:', error);
      },
    }
  );
}

/**
 * Delete a recipe
 */
export function useDeleteRecipe() {
  return useMutation<void, string>(
    (id) => api.deleteRecipe(id),
    {
      onSuccess: () => {
        console.log('Recipe deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete recipe:', error);
      },
    }
  );
}

/**
 * Favorite/unfavorite a recipe
 */
export function useFavoriteRecipe(onSuccess?: () => void) {
  return useMutation<Recipe, string>(
    async (id) => {
      const response = await api.favoriteRecipe(id);
      return transformRecipeFromBackend(response);
    },
    {
      onSuccess: (data) => {
        console.log('Recipe favorited successfully:', data);
        onSuccess?.();
      },
      onError: (error) => {
        console.error('Failed to favorite recipe:', error);
      },
    }
  );
}

/**
 * Unfavorite a recipe
 */
export function useUnfavoriteRecipe(onSuccess?: () => void) {
  return useMutation<void, string>(
    async (id) => {
      await api.unfavoriteRecipe(id);
      // No return needed - unfavorite endpoint returns void
    },
    {
      onSuccess: () => {
        console.log('Recipe unfavorited successfully');
        onSuccess?.();
      },
      onError: (error) => {
        console.error('Failed to unfavorite recipe:', error);
      },
    }
  );
}

/**
 * Rate a recipe
 */
export function useRateRecipe() {
  return useMutation<RecipeRating, { id: string; data: RateRecipeData }>(
    ({ id, data }) => api.rateRecipe(id, data),
    {
      onSuccess: (data) => {
        console.log('Recipe rated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to rate recipe:', error);
      },
    }
  );
}

// Meal Plan hooks

/**
 * Get meal plans
 */
export function useMealPlans(params?: {
  startDate?: string;
  endDate?: string;
  sortBy?: 'name' | 'startDate' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}) {
  return usePaginatedApi(
    useCallback(
      ({ page, limit }) => api.getMealPlans({ ...params, page, limit }),
      [params]
    ),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Create a meal plan
 */
export function useCreateMealPlan() {
  return useMutation<MealPlan, CreateMealPlanData>(
    (data) => api.createMealPlan(data),
    {
      onSuccess: (data) => {
        console.log('Meal plan created successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to create meal plan:', error);
      },
    }
  );
}

/**
 * Update a meal plan
 */
export function useUpdateMealPlan() {
  return useMutation<MealPlan, { id: string; data: UpdateMealPlanData }>(
    ({ id, data }) => api.updateMealPlan(id, data),
    {
      onSuccess: (data) => {
        console.log('Meal plan updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update meal plan:', error);
      },
    }
  );
}

/**
 * Delete a meal plan
 */
export function useDeleteMealPlan() {
  return useMutation<void, string>(
    (id) => api.deleteMealPlan(id),
    {
      onSuccess: () => {
        console.log('Meal plan deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete meal plan:', error);
      },
    }
  );
}

// Shopping List hooks

/**
 * Get shopping lists
 */
export function useShoppingLists(params?: {
  completed?: boolean;
  mealPlanId?: string;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}) {
  return usePaginatedApi(
    useCallback(
      ({ page, limit }) => api.getShoppingLists({ ...params, page, limit }),
      [params]
    ),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Create a shopping list
 */
export function useCreateShoppingList() {
  return useMutation<ShoppingList, CreateShoppingListData>(
    (data) => api.createShoppingList(data),
    {
      onSuccess: (data) => {
        console.log('Shopping list created successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to create shopping list:', error);
      },
    }
  );
}

/**
 * Update a shopping list
 */
export function useUpdateShoppingList() {
  return useMutation<ShoppingList, { id: string; data: UpdateShoppingListData }>(
    ({ id, data }) => api.updateShoppingList(id, data),
    {
      onSuccess: (data) => {
        console.log('Shopping list updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update shopping list:', error);
      },
    }
  );
}

/**
 * Delete a shopping list
 */
export function useDeleteShoppingList() {
  return useMutation<void, string>(
    (id) => api.deleteShoppingList(id),
    {
      onSuccess: () => {
        console.log('Shopping list deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete shopping list:', error);
      },
    }
  );
}

/**
 * Add item to shopping list
 */
export function useAddShoppingListItem() {
  return useMutation<ShoppingListItem, { listId: string; data: AddShoppingListItemData }>(
    ({ listId, data }) => api.addItemToShoppingList(listId, data),
    {
      onSuccess: (data) => {
        console.log('Item added to shopping list successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to add item to shopping list:', error);
      },
    }
  );
}

/**
 * Update shopping list item
 */
export function useUpdateShoppingListItem() {
  return useMutation<ShoppingListItem, { listId: string; itemId: string; data: UpdateShoppingListItemData }>(
    ({ listId, itemId, data }) => api.updateShoppingListItem(listId, itemId, data),
    {
      onSuccess: (data) => {
        console.log('Shopping list item updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update shopping list item:', error);
      },
    }
  );
}

/**
 * Remove item from shopping list
 */
export function useRemoveShoppingListItem() {
  return useMutation<void, { listId: string; itemId: string }>(
    ({ listId, itemId }) => api.removeItemFromShoppingList(listId, itemId),
    {
      onSuccess: () => {
        console.log('Item removed from shopping list successfully');
      },
      onError: (error) => {
        console.error('Failed to remove item from shopping list:', error);
      },
    }
  );
}

// Utility hooks

/**
 * Combined hook for recipe actions
 */
export function useRecipeActions(onDataChange?: () => void) {
  const favoriteRecipe = useFavoriteRecipe(onDataChange);
  const unfavoriteRecipe = useUnfavoriteRecipe(onDataChange);
  const rateRecipe = useRateRecipe();
  const deleteRecipe = useDeleteRecipe();

  return {
    toggleFavorite: useCallback(async (id: string, isCurrentlyFavorited: boolean, onSuccess?: () => void) => {
      try {
        if (isCurrentlyFavorited) {
          await unfavoriteRecipe.mutateAsync(id);
        } else {
          await favoriteRecipe.mutateAsync(id);
        }
        onSuccess?.();
      } catch (error) {
        console.error('Failed to toggle recipe favorite:', error);
        throw error;
      }
    }, [favoriteRecipe, unfavoriteRecipe]),

    rate: rateRecipe.mutate,
    delete: deleteRecipe.mutate,

    isFavoriting: favoriteRecipe.loading || unfavoriteRecipe.loading,
    isRating: rateRecipe.loading,
    isDeleting: deleteRecipe.loading,
  };
}

/**
 * Get user's favorite recipes
 */
export function useFavoriteRecipes(params?: {
  category?: string;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
}) {
  return useRecipes({
    ...params,
    isFavorited: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
}

/**
 * Get user's own recipes
 */
export function useMyRecipes(params?: {
  category?: string;
  isPublic?: boolean;
  sortBy?: 'title' | 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}) {
  return useRecipes({
    ...params,
    // Note: Backend should filter by current user automatically
  });
}

/**
 * Hook for recipe search
 */
export function useRecipeSearch(searchTerm: string, filters?: {
  category?: string;
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  maxPrepTime?: number;
  maxCookTime?: number;
}) {
  return useRecipes({
    search: searchTerm,
    ...filters,
    isPublic: true,
    sortBy: 'rating',
    sortOrder: 'desc',
  });
}

/**
 * Hook for shopping list item management
 */
export function useShoppingListItemActions() {
  const updateItem = useUpdateShoppingListItem();
  const removeItem = useRemoveShoppingListItem();

  return {
    toggleCompleted: useCallback(async (listId: string, itemId: string, isCurrentlyCompleted: boolean) => {
      try {
        await updateItem.mutate({
          listId,
          itemId,
          data: { completed: !isCurrentlyCompleted }
        });
      } catch (error) {
        console.error('Failed to toggle item completion:', error);
        throw error;
      }
    }, [updateItem]),

    update: updateItem.mutate,
    remove: removeItem.mutate,

    isUpdating: updateItem.loading,
    isRemoving: removeItem.loading,
  };
}

/**
 * Hook for meal planning dashboard
 */
export function useMealPlanningDashboard() {
  const mealPlans = useMealPlans({
    sortBy: 'startDate',
    sortOrder: 'desc',
  });
  
  const shoppingLists = useShoppingLists({
    completed: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const favoriteRecipes = useFavoriteRecipes();

  return {
    mealPlans: mealPlans.data?.data || [],
    shoppingLists: shoppingLists.data?.data || [],
    favoriteRecipes: favoriteRecipes.data?.data || [],

    loading: mealPlans.loading || shoppingLists.loading || favoriteRecipes.loading,
    error: mealPlans.error || shoppingLists.error || favoriteRecipes.error,

    refetch: useCallback(() => {
      mealPlans.refetch();
      shoppingLists.refetch();
      favoriteRecipes.refetch();
    }, [mealPlans, shoppingLists, favoriteRecipes]),
  };
}

/**
 * Hook for recipe analytics
 */
export function useRecipeAnalytics() {
  const myRecipes = useMyRecipes();
  const favoriteRecipes = useFavoriteRecipes();

  const totalRecipes = myRecipes.data?.total || 0;
  const totalFavorites = favoriteRecipes.data?.total || 0;
  
  const avgRating = (myRecipes.data?.data || []).reduce((sum, recipe) => sum + (recipe.rating || 0), 0) / totalRecipes || 0;
  const totalRatings = (myRecipes.data?.data || []).reduce((sum, recipe) => sum + (recipe.ratingsCount || 0), 0) || 0;

  // Get most popular recipes (highest rated)
  const topRatedRecipes = myRecipes.data?.data
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5) || [];

  // Get recipes by category
  const recipesByCategory = myRecipes.data?.data.reduce((acc, recipe) => {
    acc[recipe.category] = (acc[recipe.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    totalRecipes,
    totalFavorites,
    avgRating: Math.round(avgRating * 100) / 100,
    totalRatings,
    topRatedRecipes,
    recipesByCategory,

    loading: myRecipes.loading || favoriteRecipes.loading,
    error: myRecipes.error || favoriteRecipes.error,
    
    refetch: useCallback(() => {
      myRecipes.refetch();
      favoriteRecipes.refetch();
    }, [myRecipes, favoriteRecipes]),
  };
}

/**
 * Get recipe ratings
 */
export function useRecipeRatings(recipeId: string | null) {
  return usePaginatedApi(
    useCallback(
      ({ page, limit }) => api.getRecipeRatings(recipeId!, { page, limit }),
      [recipeId]
    ),
    {
      enabled: !!recipeId,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Get all favorite recipes (without pagination)
 */
export function useGetFavoriteRecipes() {
  return useApi<Recipe[]>(
    () => api.getFavoriteRecipes().then(recipes => recipes.map(transformRecipeFromBackend)),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Get popular recipes
 */
export function useGetPopularRecipes(limit: number = 10) {
  return useApi<Recipe[]>(
    () => api.getPopularRecipes(limit).then(recipes => recipes.map(transformRecipeFromBackend)),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Alias for useGetPopularRecipes for backward compatibility
 */
export const usePopularRecipes = useGetPopularRecipes;

/**
 * Get recipe statistics
 */
export function useRecipeStats() {
  return useApi(
    () => api.getRecipeStats(),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Get single meal plan
 */
export function useGetMealPlan(id: string | null) {
  return useApi(
    () => api.getMealPlan(id!),
    {
      enabled: !!id,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Get single shopping list
 */
export function useGetShoppingList(id: string | null) {
  return useApi(
    () => api.getShoppingList(id!),
    {
      enabled: !!id,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );
}

/**
 * Generate shopping list from meal plan
 */
export function useGenerateShoppingListFromMealPlan() {
  return useMutation(
    (mealPlanId: string) => api.generateShoppingListFromMealPlan(mealPlanId),
    {
      onSuccess: (data) => {
        console.log('Shopping list generated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to generate shopping list:', error);
      },
    }
  );
}