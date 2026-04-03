// Meal Plan Types - Aligned with Backend Schema

export type MealPlanType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert' | 'appetizer' | 'drink';

// Individual meal in a plan
export interface MealPlanMeal {
  id?: string; // Frontend-generated for tracking
  recipeId: string;
  recipe?: any; // Populated when needed (using Recipe type from recipe.ts)
  mealType: MealType;
  plannedDate: string; // ISO date string
  servings: number;
  notes?: string;
  completed?: boolean; // Track if meal was prepared
}

// Main meal plan structure - matches backend
export interface MealPlan {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  planType: MealPlanType;
  startDate: string; // ISO date
  endDate: string; // ISO date
  meals: MealPlanMeal[];
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

// Create/Update DTOs
export interface CreateMealPlanDto {
  name: string;
  description?: string;
  planType: MealPlanType;
  startDate: string;
  endDate: string;
  meals: Omit<MealPlanMeal, 'id' | 'recipe'>[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateMealPlanDto extends Partial<CreateMealPlanDto> {}

// Calendar view specific
export interface CalendarMeal {
  date: string;
  dayOfWeek: string;
  meals: {
    breakfast: MealPlanMeal[];
    lunch: MealPlanMeal[];
    dinner: MealPlanMeal[];
    snack: MealPlanMeal[];
    dessert: MealPlanMeal[];
  };
}

// API Response
export interface MealPlanResponse {
  data: MealPlan[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Query parameters
export interface MealPlanQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  plan_type?: MealPlanType;
  search?: string;
  start_date?: string;
  end_date?: string;
  tags?: string[];
}

// Shopping list generation
export interface ShoppingListFromMealPlan {
  mealPlanId: string;
  startDate?: string;
  endDate?: string;
  groupByCategory?: boolean;
}