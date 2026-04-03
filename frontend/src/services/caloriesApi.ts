import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';
import { ActivityLevel, GoalType, MealType } from '../types/calories-tracker';

// Types for API requests and responses
export interface OnboardingData {
  goal: GoalType;
  gender: 'male' | 'female' | 'other';
  age: number;
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number;
  activity_level: ActivityLevel;
  weight_change_rate: number;
  daily_calories: number;
  protein_percentage: number;
  carbs_percentage: number;
  fat_percentage: number;
}

export interface UserProfile {
  profile: {
    id: string;
    gender: string;
    age: number;
    height_cm: number;
    current_weight_kg: number;
    target_weight_kg: number;
    activity_level: string;
  };
  goals: {
    goal_type: string;
    weight_change_rate: number;
    daily_calories: number;
    protein_percentage: number;
    carbs_percentage: number;
    fat_percentage: number;
  };
}

export interface UpdateProfileData {
  profile_image?: string;
  age?: number;
  height_cm?: number;
  current_weight_kg?: number;
  activity_level?: string;
  target_weight_kg?: number;
  daily_calories?: number;
  protein_percentage?: number;
  carbs_percentage?: number;
  fat_percentage?: number;
}

export interface UpdateGoalsData {
  daily_calories: number;
  protein_percentage: number;
  carbs_percentage: number;
  fat_percentage: number;
}

export interface CreateCustomFoodData {
  name: string;
  brand?: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
}

export interface SearchFoodsParams {
  q: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface LogFoodEntryData {
  food_id: string;
  quantity: number;
  unit: string;
  meal_type: MealType;
  consumed_at: string;
}

export interface UpdateFoodLogData {
  quantity?: number;
  unit?: string;
}

export interface LogWeightEntryData {
  weight_kg: number;
  date: string;
}

export interface UpdateWaterIntakeData {
  glasses: number;
  date: string;
}

export interface LogExerciseData {
  exercise_name: string;
  duration_minutes: number;
  calories_burned: number;
  logged_at?: string;
}

// Fasting Types
export interface FastingPlan {
  id: string;
  name: string;
  duration: number;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  benefits: string[];
  schedule: string;
  popular: boolean;
}

export interface FastingSession {
  id: string;
  user_id?: string;
  plan_id: string;
  plan_name?: string;
  start_time: string;
  end_time?: string;
  target_duration: number;
  actual_duration?: number;
  status: 'active' | 'completed' | 'cancelled';
  completed: boolean;
  elapsed_time?: number;
  remaining_time?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FastingStats {
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  total_fasting_hours: number;
  average_fast_duration: number;
  longest_fast: number;
  current_streak: number;
  longest_streak: number;
  favorite_plan: string;
  completion_rate: number;
  last_7_days: {
    sessions: number;
    total_hours: number;
    completion_rate: number;
  };
  last_30_days: {
    sessions: number;
    total_hours: number;
    completion_rate: number;
  };
}

export interface FastingStreak {
  current_streak: number;
  longest_streak: number;
  streak_start_date: string;
  last_fast_date: string;
  next_fast_deadline: string;
}

export interface FastingReminder {
  id: string;
  plan_id: string;
  reminder_time: string;
  days_of_week: string[];
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StartFastingSessionData {
  plan_id: string;
  target_duration: number;
  start_time: string;
}

export interface CompleteFastingSessionData {
  end_time: string;
  actual_duration: number;
}

export interface CancelFastingSessionData {
  end_time: string;
  actual_duration: number;
  reason?: string;
}

export interface CreateFastingReminderData {
  plan_id: string;
  reminder_time: string;
  days_of_week: string[];
  enabled: boolean;
}

export interface FastingHistoryParams {
  limit?: number;
  offset?: number;
  status?: 'active' | 'completed' | 'cancelled';
  from_date?: string;
  to_date?: string;
}

// Calories Tracker API Service
class CaloriesApiService {
  private baseURL = '/calories';

  // =============================================
  // ONBOARDING & PROFILE
  // =============================================

  async completeOnboarding(data: OnboardingData) {
    try {
      return await api.request(`${this.baseURL}/users/onboarding`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ONBOARDING_FAILED'
      );
    }
  }

  async getUserProfile() {
    try {
      return await api.request(`${this.baseURL}/users/profile`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROFILE_FETCH_FAILED'
      );
    }
  }

  async updateUserProfile(data: UpdateProfileData) {
    try {
      console.log('[caloriesApi] updateUserProfile called with data keys:', Object.keys(data));
      if (data.profile_image) {
        console.log('[caloriesApi] profile_image length:', data.profile_image.length);
      }
      const result = await api.request(`${this.baseURL}/users/profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      console.log('[caloriesApi] updateUserProfile result:', result);
      return result;
    } catch (error) {
      console.error('[caloriesApi] updateUserProfile error:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROFILE_UPDATE_FAILED'
      );
    }
  }

  async updateGoals(data: UpdateGoalsData) {
    try {
      return await api.request(`${this.baseURL}/users/goals`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'GOALS_UPDATE_FAILED'
      );
    }
  }

  // =============================================
  // FOOD MANAGEMENT
  // =============================================

  async searchFoods(params: SearchFoodsParams) {
    try {
      // Build query string manually to preserve number types
      const queryParts: string[] = [];
      
      if (params.q) {
        queryParts.push(`q=${encodeURIComponent(params.q)}`);
      }
      
      if (params.category) {
        queryParts.push(`category=${encodeURIComponent(params.category)}`);
      }
      
      if (params.limit !== undefined) {
        queryParts.push(`limit=${params.limit}`);
      }
      
      if (params.offset !== undefined) {
        queryParts.push(`offset=${params.offset}`);
      }
      
      const queryString = queryParts.join('&');
      return await api.request(`${this.baseURL}/foods/search?${queryString}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FOOD_SEARCH_FAILED'
      );
    }
  }

  async getRecentFoods(limit?: number) {
    try {
      const queryString = limit ? `?limit=${limit}` : '';
      return await api.request(`${this.baseURL}/foods/recent${queryString}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'RECENT_FOODS_FETCH_FAILED'
      );
    }
  }

  async getFavoriteFoods() {
    try {
      return await api.request(`${this.baseURL}/foods/favorites`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FAVORITE_FOODS_FETCH_FAILED'
      );
    }
  }

  async addToFavorites(foodId: string) {
    try {
      return await api.request(`${this.baseURL}/foods/${foodId}/favorite`, {
        method: 'POST',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ADD_TO_FAVORITES_FAILED'
      );
    }
  }

  async removeFromFavorites(foodId: string) {
    try {
      return await api.request(`${this.baseURL}/foods/${foodId}/favorite`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REMOVE_FROM_FAVORITES_FAILED'
      );
    }
  }

  async getAllFoods(limit?: number, offset?: number) {
    try {
      const queryParts: string[] = [];
      
      if (limit !== undefined) {
        queryParts.push(`limit=${limit}`);
      }
      
      if (offset !== undefined) {
        queryParts.push(`offset=${offset}`);
      }
      
      const queryString = queryParts.join('&');
      return await api.request(`${this.baseURL}/foods/all${queryString ? '?' + queryString : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FOODS_FETCH_FAILED'
      );
    }
  }

  async createCustomFood(data: CreateCustomFoodData) {
    try {
      return await api.request(`${this.baseURL}/foods/custom`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CUSTOM_FOOD_CREATE_FAILED'
      );
    }
  }

  // =============================================
  // FOOD LOGGING
  // =============================================

  async logFoodEntry(data: LogFoodEntryData) {
    try {
      return await api.request(`${this.baseURL}/food-logs`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FOOD_LOG_CREATE_FAILED'
      );
    }
  }

  async getTodaysFoodLogs() {
    try {
      return await api.request(`${this.baseURL}/food-logs/today`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FOOD_LOGS_FETCH_FAILED'
      );
    }
  }

  async getFoodLogsByDate(date: string) {
    try {
      return await api.request(`${this.baseURL}/food-logs/date/${date}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FOOD_LOGS_FETCH_FAILED'
      );
    }
  }

  async updateFoodLog(id: string, data: UpdateFoodLogData) {
    try {
      return await api.request(`${this.baseURL}/food-logs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FOOD_LOG_UPDATE_FAILED'
      );
    }
  }

  async deleteFoodLog(id: string) {
    try {
      return await api.request(`${this.baseURL}/food-logs/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FOOD_LOG_DELETE_FAILED'
      );
    }
  }

  // =============================================
  // WEIGHT TRACKING
  // =============================================

  async logWeightEntry(data: LogWeightEntryData) {
    try {
      return await api.request(`${this.baseURL}/weight-logs`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WEIGHT_LOG_CREATE_FAILED'
      );
    }
  }

  async getWeightLogs() {
    try {
      return await api.request(`${this.baseURL}/weight-logs`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WEIGHT_LOGS_FETCH_FAILED'
      );
    }
  }

  async getWeightProgress(period?: 'week' | 'month' | '3months' | '6months' | 'year' | 'all') {
    try {
      const queryString = period ? `?period=${period}` : '';
      return await api.request(`${this.baseURL}/weight-logs/progress${queryString}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WEIGHT_PROGRESS_FETCH_FAILED'
      );
    }
  }

  // =============================================
  // WATER INTAKE
  // =============================================

  async updateWaterIntake(data: UpdateWaterIntakeData) {
    try {
      return await api.request(`${this.baseURL}/water-logs/increment`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WATER_INTAKE_UPDATE_FAILED'
      );
    }
  }

  async decrementWaterIntake(data: UpdateWaterIntakeData) {
    try {
      return await api.request(`${this.baseURL}/water-logs/decrement`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WATER_INTAKE_DECREMENT_FAILED'
      );
    }
  }

  async getTodaysWaterIntake() {
    try {
      return await api.request(`${this.baseURL}/water-logs/today`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WATER_INTAKE_FETCH_FAILED'
      );
    }
  }

  // =============================================
  // EXERCISE TRACKING
  // =============================================

  async logExercise(data: LogExerciseData) {
    try {
      return await api.request(`${this.baseURL}/exercise-logs`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXERCISE_LOG_CREATE_FAILED'
      );
    }
  }

  async getTodaysExercises() {
    try {
      return await api.request(`${this.baseURL}/exercise-logs/today`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXERCISES_FETCH_FAILED'
      );
    }
  }

  // =============================================
  // DASHBOARD & ANALYTICS
  // =============================================

  async getDashboardSummary() {
    try {
      return await api.request(`${this.baseURL}/dashboard/summary`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'DASHBOARD_FETCH_FAILED'
      );
    }
  }

  async getWeeklyAnalytics() {
    try {
      return await api.request(`${this.baseURL}/analytics/weekly`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ANALYTICS_FETCH_FAILED'
      );
    }
  }

  // =============================================
  // AI & RECOMMENDATIONS
  // =============================================

  async getNutritionRecommendations() {
    try {
      return await api.request(`${this.baseURL}/ai/nutrition-recommendations`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'NUTRITION_RECOMMENDATIONS_FETCH_FAILED'
      );
    }
  }

  async generateMealPlan(preferences: {
    duration: 'day' | 'week' | 'month';
    dietary_restrictions?: string[];
    excluded_foods?: string[];
    budget?: 'low' | 'medium' | 'high';
    cooking_time?: 'quick' | 'moderate' | 'elaborate';
  }) {
    try {
      return await api.request(`${this.baseURL}/ai/generate-meal-plan`, {
        method: 'POST',
        body: JSON.stringify(preferences),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MEAL_PLAN_GENERATION_FAILED'
      );
    }
  }

  async getPersonalizedInsights() {
    try {
      return await api.request(`${this.baseURL}/ai/personalized-insights`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PERSONALIZED_INSIGHTS_FETCH_FAILED'
      );
    }
  }

  async analyzeFoodPhoto(photoData: FormData) {
    try {
      return await api.request(`${this.baseURL}/ai/analyze-food-photo`, {
        method: 'POST',
        body: photoData,
        headers: {
          // Let the browser set the Content-Type with boundary for FormData
        },
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FOOD_PHOTO_ANALYSIS_FAILED'
      );
    }
  }

  async getSmartFoodSuggestions(mealType: MealType, preferences?: {
    max_calories?: number;
    min_protein?: number;
    cuisine_type?: string;
    preparation_time?: number;
  }) {
    try {
      const queryParts: string[] = [`meal_type=${mealType}`];
      
      if (preferences?.max_calories !== undefined) {
        queryParts.push(`max_calories=${preferences.max_calories}`);
      }
      if (preferences?.min_protein !== undefined) {
        queryParts.push(`min_protein=${preferences.min_protein}`);
      }
      if (preferences?.cuisine_type) {
        queryParts.push(`cuisine_type=${encodeURIComponent(preferences.cuisine_type)}`);
      }
      if (preferences?.preparation_time !== undefined) {
        queryParts.push(`preparation_time=${preferences.preparation_time}`);
      }
      
      const queryString = queryParts.join('&');
      return await api.request(`${this.baseURL}/ai/smart-suggestions?${queryString}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SMART_SUGGESTIONS_FETCH_FAILED'
      );
    }
  }

  // =============================================
  // PROGRESS TRACKING
  // =============================================

  async getDailyStats(days: number = 30) {
    try {
      return await api.request(`${this.baseURL}/daily-stats?days=${days}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'DAILY_STATS_FETCH_FAILED'
      );
    }
  }

  async getProgressPhotos() {
    try {
      return await api.request(`${this.baseURL}/progress-photos`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRESS_PHOTOS_FETCH_FAILED'
      );
    }
  }

  async uploadProgressPhoto(formData: FormData) {
    try {
      return await api.request(`${this.baseURL}/progress-photos`, {
        method: 'POST',
        body: formData,
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRESS_PHOTO_UPLOAD_FAILED'
      );
    }
  }

  async getProgressSummary(days: number = 30) {
    try {
      return await api.request(`${this.baseURL}/progress-summary?days=${days}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'PROGRESS_SUMMARY_FETCH_FAILED'
      );
    }
  }

  // =============================================
  // FASTING
  // =============================================

  async getFastingPlans() {
    try {
      return await api.request(`${this.baseURL}/fasting/plans`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FASTING_PLANS_FETCH_FAILED'
      );
    }
  }

  async startFastingSession(data: StartFastingSessionData) {
    try {
      return await api.request(`${this.baseURL}/fasting/sessions/start`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FASTING_SESSION_START_FAILED'
      );
    }
  }

  async getCurrentFastingSession() {
    try {
      return await api.request(`${this.baseURL}/fasting/sessions/current`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CURRENT_FASTING_SESSION_FETCH_FAILED'
      );
    }
  }

  async completeFastingSession(sessionId: string, data: CompleteFastingSessionData) {
    try {
      return await api.request(`${this.baseURL}/fasting/sessions/${sessionId}/complete`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FASTING_SESSION_COMPLETE_FAILED'
      );
    }
  }

  async cancelFastingSession(sessionId: string, data: CancelFastingSessionData) {
    try {
      return await api.request(`${this.baseURL}/fasting/sessions/${sessionId}/cancel`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FASTING_SESSION_CANCEL_FAILED'
      );
    }
  }

  async getFastingHistory(params?: FastingHistoryParams) {
    try {
      const queryParts: string[] = [];
      
      if (params?.limit !== undefined) {
        queryParts.push(`limit=${params.limit}`);
      }
      if (params?.offset !== undefined) {
        queryParts.push(`offset=${params.offset}`);
      }
      if (params?.status) {
        queryParts.push(`status=${params.status}`);
      }
      if (params?.from_date) {
        queryParts.push(`from_date=${encodeURIComponent(params.from_date)}`);
      }
      if (params?.to_date) {
        queryParts.push(`to_date=${encodeURIComponent(params.to_date)}`);
      }
      
      const queryString = queryParts.join('&');
      return await api.request(`${this.baseURL}/fasting/sessions/history${queryString ? '?' + queryString : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FASTING_HISTORY_FETCH_FAILED'
      );
    }
  }

  async getFastingStats() {
    try {
      return await api.request(`${this.baseURL}/fasting/stats`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FASTING_STATS_FETCH_FAILED'
      );
    }
  }

  async getFastingStreak() {
    try {
      return await api.request(`${this.baseURL}/fasting/streak`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FASTING_STREAK_FETCH_FAILED'
      );
    }
  }

  async createFastingReminder(data: CreateFastingReminderData) {
    try {
      return await api.request(`${this.baseURL}/fasting/reminders`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FASTING_REMINDER_CREATE_FAILED'
      );
    }
  }

  async getFastingReminders() {
    try {
      return await api.request(`${this.baseURL}/fasting/reminders`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FASTING_REMINDERS_FETCH_FAILED'
      );
    }
  }

  async updateFastingReminder(reminderId: string, data: Partial<CreateFastingReminderData>) {
    try {
      return await api.request(`${this.baseURL}/fasting/reminders/${reminderId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FASTING_REMINDER_UPDATE_FAILED'
      );
    }
  }

  async deleteFastingReminder(reminderId: string) {
    try {
      return await api.request(`${this.baseURL}/fasting/reminders/${reminderId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FASTING_REMINDER_DELETE_FAILED'
      );
    }
  }

  // =============================================
  // ACHIEVEMENTS
  // =============================================

  async getUserAchievements() {
    try {
      return await api.request(`${this.baseURL}/users/achievements`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ACHIEVEMENTS_FETCH_FAILED'
      );
    }
  }
}

// Create and export a singleton instance
const caloriesApi = new CaloriesApiService();
export default caloriesApi;