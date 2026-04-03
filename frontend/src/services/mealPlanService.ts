import { api } from '../lib/api';
import { 
  MealPlan, 
  CreateMealPlanDto, 
  UpdateMealPlanDto, 
  MealPlanResponse,
  MealPlanQueryParams,
  MealPlanMeal
} from '../types/mealPlan';

// Re-export the types for backward compatibility
export type { MealPlan, CreateMealPlanDto as CreateMealPlanRequest, MealPlanQueryParams as MealPlanQuery };
export type PaginatedMealPlans = MealPlanResponse;

export interface ShoppingListItem {
  ingredient: string;
  amount: string;
  unit: string;
  recipe_ids: string[];
  checked?: boolean;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  items: ShoppingListItem[];
  recipe_ids: string[];
  created_at: string;
  updated_at: string;
}

// Service functions using the existing API client
// Helper function to transform backend meal plan to frontend format
const transformMealPlan = (backendPlan: any): MealPlan => {
  console.log('Transforming backend meal plan:', backendPlan);
  
  // Handle both full meal plan response and partial update response
  const transformed = {
    id: backendPlan.id,
    userId: backendPlan.user_id || backendPlan.userId,
    name: backendPlan.name,
    description: backendPlan.description || '',
    planType: backendPlan.plan_type || backendPlan.planType,
    startDate: backendPlan.start_date || backendPlan.startDate,
    endDate: backendPlan.end_date || backendPlan.endDate,
    meals: (backendPlan.meals || []).map((meal: any) => ({
      id: meal.id,
      recipeId: meal.recipe_id || meal.recipeId,
      recipe: meal.recipe,
      mealType: meal.meal_type || meal.mealType,
      plannedDate: meal.planned_date || meal.plannedDate,
      servings: meal.servings || 1,
      notes: meal.notes || '',
      completed: meal.is_completed || meal.completed || false
    })),
    tags: backendPlan.tags || [],
    metadata: backendPlan.metadata || {},
    createdAt: backendPlan.created_at || backendPlan.createdAt,
    updatedAt: backendPlan.updated_at || backendPlan.updatedAt
  };
  
  console.log('Transformed meal plan:', transformed);
  return transformed;
};

export const mealPlanService = {
  // Store the helper function as a property for use in methods
  transformMealPlan,
  
  async createMealPlan(data: CreateMealPlanDto): Promise<MealPlan> {
    // Transform to backend format if needed
    const backendData = {
      name: data.name,
      description: data.description,
      plan_type: data.planType,
      start_date: data.startDate,
      end_date: data.endDate,
      meals: data.meals.map(meal => ({
        recipe_id: meal.recipeId,
        meal_type: meal.mealType,
        planned_date: meal.plannedDate,
        servings: meal.servings,
        notes: meal.notes
      })),
      tags: data.tags,
      metadata: data.metadata
    };
    const response = await api.createMealPlan(backendData);
    return this.transformMealPlan(response);
  },

  async getMealPlans(query?: MealPlanQueryParams): Promise<MealPlanResponse> {
    try {
      // Transform query parameters to backend format, filtering out undefined values
      const backendQuery = query ? Object.entries({
        page: query.page,
        limit: query.limit,
        sort_by: query.sort_by,
        sort_order: query.sort_order,
        plan_type: query.plan_type,
        search: query.search,
        start_date: query.start_date,
        end_date: query.end_date,
        tags: query.tags
      }).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {} as any) : undefined;
      
      const response = await api.getMealPlans(backendQuery);
      
      // Transform response to match frontend types
      const transformedData = (response.data || []).map(this.transformMealPlan);
      
      return {
        data: transformedData,
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
        total_pages: response.total_pages || 0
      };
    } catch (error) {
      console.warn('Error fetching meal plans:', error);
      // Return empty response on error
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        total_pages: 0
      };
    }
  },

  async getMealPlan(id: string): Promise<MealPlan> {
    console.log('Fetching meal plan with id:', id);
    const response = await api.getMealPlan(id);
    console.log('getMealPlan response from API:', response);
    
    const transformed = this.transformMealPlan(response);
    console.log('getMealPlan transformed result:', transformed);
    
    return transformed;
  },

  async updateMealPlan(id: string, data: UpdateMealPlanDto, currentMealPlan?: MealPlan): Promise<MealPlan> {
    // Transform to backend format if needed
    const backendData: any = {};
    if (data.name) backendData.name = data.name;
    if (data.description !== undefined) backendData.description = data.description;
    if (data.planType) backendData.plan_type = data.planType;
    if (data.startDate) backendData.start_date = data.startDate;
    if (data.endDate) backendData.end_date = data.endDate;
    if (data.meals) {
      backendData.meals = data.meals.map(meal => {
        // Clean meal object - only include expected properties
        const cleanMeal: any = {
          recipe_id: meal.recipeId,
          meal_type: meal.mealType,
          planned_date: meal.plannedDate,
          servings: meal.servings || 1,
          notes: meal.notes || ''
        };
        
        // Remove any undefined values
        Object.keys(cleanMeal).forEach(key => {
          if (cleanMeal[key] === undefined) {
            delete cleanMeal[key];
          }
        });
        
        return cleanMeal;
      });
    }
    if (data.tags) backendData.tags = data.tags;
    if (data.metadata) {
      // Clean metadata to remove any is_favorited or other unwanted properties
      const cleanMetadata = { ...data.metadata };
      delete cleanMetadata.is_favorited;
      delete cleanMetadata.isFavorited;
      backendData.metadata = cleanMetadata;
    }
    
    // Log the data being sent for debugging
    console.log('Sending meal plan update:', backendData);
    
    const response = await api.updateMealPlan(id, backendData);
    console.log('Update response from API:', response);
    
    const transformed = this.transformMealPlan(response);
    console.log('Final transformed result:', transformed);
    
    return transformed;
  },

  async deleteMealPlan(id: string): Promise<void> {
    return api.deleteMealPlan(id);
  },

  async generateShoppingListFromMealPlan(mealPlanId: string): Promise<ShoppingList> {
    return api.generateShoppingListFromMealPlan(mealPlanId);
  },

  // Utility method to get current week's meal plan
  async getCurrentWeekMealPlan(): Promise<MealPlan | null> {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as start
      
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const result = await this.getMealPlans({
        start_date: startOfWeek.toISOString().split('T')[0],
        end_date: endOfWeek.toISOString().split('T')[0],
        plan_type: 'weekly',
        limit: 1
      });

      return result.data.length > 0 ? result.data[0] : null;
    } catch (error) {
      console.warn('No meal plan found for current week:', error);
      return null;
    }
  },

  // Utility method to create a new weekly meal plan
  async createWeeklyMealPlan(startDate: Date, name?: string): Promise<MealPlan> {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return this.createMealPlan({
      name: name || `Week of ${startDate.toLocaleDateString()}`,
      description: 'Weekly meal plan',
      planType: 'weekly',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      meals: [],
      tags: []
    });
  }
};