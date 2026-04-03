/**
 * Fitness Service
 * Handles all fitness-related API calls including workouts, exercises, plans, and progress tracking
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';

export interface Exercise {
  id: string;
  name: string;
  category: string;
  targetMuscleGroups: string[];
  equipment: string[];
  instructions: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  duration: number; // weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  sessions: WorkoutSession[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  name: string;
  day: number;
  exercises: WorkoutExercise[];
  estimatedDuration: number; // minutes
  restBetweenSets: number; // seconds
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise?: Exercise;
  sets: number;
  reps: number | { min: number; max: number };
  weight?: number;
  duration?: number; // seconds for time-based exercises
  distance?: number; // meters for cardio
  restTime?: number; // seconds
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  planId?: string;
  sessionId?: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  exercises: CompletedExercise[];
  totalCaloriesBurned?: number;
  notes?: string;
  rating?: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

export interface CompletedExercise {
  exerciseId: string;
  exercise?: Exercise;
  sets: CompletedSet[];
  notes?: string;
}

export interface CompletedSet {
  reps?: number;
  weight?: number;
  duration?: number; // seconds
  distance?: number; // meters
  restTime?: number; // seconds
  completed: boolean;
}

export interface FitnessGoal {
  id: string;
  userId: string;
  type: 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'flexibility' | 'general_fitness';
  target: number;
  current: number;
  unit: string;
  targetDate?: Date;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  type: 'weight' | 'body_fat' | 'muscle_mass' | 'chest' | 'waist' | 'hips' | 'bicep' | 'thigh';
  value: number;
  unit: string;
  recordedAt: Date;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FitnessStats {
  totalWorkouts: number;
  totalExerciseTime: number; // minutes
  averageWorkoutDuration: number;
  totalCaloriesBurned: number;
  currentStreak: number;
  longestStreak: number;
  favoriteExercises: Array<{ exercise: Exercise; count: number }>;
  weeklyProgress: Array<{ week: string; workouts: number; duration: number }>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  iconUrl?: string;
  category: string;
  criteria: {
    type: string;
    workoutCount?: number;
    [key: string]: any;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  targetPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  difficulty?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

class FitnessService {
  /**
   * Get all exercises with optional filtering
   */
  async getExercises(params?: QueryParams & { muscleGroup?: string; equipment?: string }): Promise<{ exercises: Exercise[]; total: number }> {
    try {
      return await api.request(`/fitness/exercises${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXERCISES_FETCH_FAILED'
      );
    }
  }

  /**
   * Get exercise by ID
   */
  async getExercise(id: string): Promise<Exercise> {
    try {
      return await api.request(`/fitness/exercises/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXERCISE_FETCH_FAILED'
      );
    }
  }

  /**
   * Get user's workout plans
   */
  async getWorkoutPlans(params?: QueryParams): Promise<{ plans: WorkoutPlan[]; total: number }> {
    try {
      return await api.request(`/fitness/workout-plans${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_PLANS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get workout plan by ID
   */
  async getWorkoutPlan(id: string): Promise<WorkoutPlan> {
    try {
      return await api.request(`/fitness/workout-plans/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_PLAN_FETCH_FAILED'
      );
    }
  }

  /**
   * Create a custom workout plan
   */
  async createWorkoutPlan(planData: Omit<WorkoutPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<WorkoutPlan> {
    try {
      return await api.request('/fitness/workout-plans', {
        method: 'POST',
        body: JSON.stringify(planData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_PLAN_CREATE_FAILED'
      );
    }
  }

  /**
   * Update workout plan
   */
  async updateWorkoutPlan(id: string, planData: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    try {
      return await api.request(`/fitness/workout-plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(planData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_PLAN_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete workout plan
   */
  async deleteWorkoutPlan(id: string): Promise<void> {
    try {
      await api.request(`/fitness/workout-plans/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_PLAN_DELETE_FAILED'
      );
    }
  }

  /**
   * Get workout activities/logs
   */
  async getWorkoutLogs(params?: QueryParams): Promise<{ data: WorkoutLog[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.getFitnessActivities(params);
      
      // Transform the response to match the expected format for usePaginatedApi
      if (response.logs) {
        return {
          data: response.logs,
          total: response.total || response.logs.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20
        };
      }
      
      // If response has data field (already in correct format)
      if (response.data) {
        return response;
      }
      
      // Fallback: wrap response in data field
      return {
        data: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_LOGS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get workout log by ID
   */
  async getWorkoutLog(id: string): Promise<WorkoutLog> {
    try {
      return await api.request(`/fitness/activities/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_LOG_FETCH_FAILED'
      );
    }
  }

  /**
   * Log a completed workout
   */
  async logWorkout(workoutData: Omit<WorkoutLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<WorkoutLog> {
    try {
      return await api.createFitnessActivity(workoutData);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_LOG_CREATE_FAILED'
      );
    }
  }

  /**
   * Update workout log
   */
  async updateWorkoutLog(id: string, workoutData: Partial<WorkoutLog>): Promise<WorkoutLog> {
    try {
      return await api.request(`/fitness/activities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(workoutData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_LOG_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete workout log
   */
  async deleteWorkoutLog(id: string): Promise<void> {
    try {
      await api.request(`/fitness/activities/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_LOG_DELETE_FAILED'
      );
    }
  }

  /**
   * Get fitness goals
   */
  async getFitnessGoals(params?: QueryParams): Promise<{ goals: FitnessGoal[]; total: number }> {
    try {
      return await api.request(`/fitness/goals${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FITNESS_GOALS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create fitness goal
   */
  async createFitnessGoal(goalData: Omit<FitnessGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<FitnessGoal> {
    try {
      return await api.request('/fitness/goals', {
        method: 'POST',
        body: JSON.stringify(goalData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FITNESS_GOAL_CREATE_FAILED'
      );
    }
  }

  /**
   * Update fitness goal
   */
  async updateFitnessGoal(id: string, goalData: Partial<FitnessGoal>): Promise<FitnessGoal> {
    try {
      return await api.request(`/fitness/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(goalData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FITNESS_GOAL_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete fitness goal
   */
  async deleteFitnessGoal(id: string): Promise<void> {
    try {
      await api.request(`/fitness/goals/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FITNESS_GOAL_DELETE_FAILED'
      );
    }
  }

  /**
   * Get body measurements
   */
  async getBodyMeasurements(params?: QueryParams): Promise<{ measurements: BodyMeasurement[]; total: number }> {
    try {
      return await api.request(`/fitness/measurements${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BODY_MEASUREMENTS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create body measurement
   */
  async createBodyMeasurement(measurementData: Omit<BodyMeasurement, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<BodyMeasurement> {
    try {
      return await api.request('/fitness/measurements', {
        method: 'POST',
        body: JSON.stringify(measurementData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BODY_MEASUREMENT_CREATE_FAILED'
      );
    }
  }

  /**
   * Get fitness statistics
   */
  async getFitnessStats(timeframe?: 'week' | 'month' | 'year' | 'all'): Promise<FitnessStats> {
    try {
      const queryString = timeframe ? `?${new URLSearchParams({ timeframe }).toString()}` : '';
      return await api.request(`/fitness/stats${queryString}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FITNESS_STATS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get fitness recommendations
   */
  async getFitnessRecommendations(): Promise<{
    recommendedWorkouts: WorkoutPlan[];
    suggestedExercises: Exercise[];
    goalRecommendations: Partial<FitnessGoal>[];
  }> {
    try {
      return await api.request('/fitness/recommendations');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FITNESS_RECOMMENDATIONS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get today's workouts
   */
  async getTodayWorkouts(planType?: 'gym' | 'home'): Promise<import('../types/fitness').TodayWorkoutsResponse> {
    try {
      // Only include plan_type if it's a valid value
      const validPlanType = planType && (planType === 'gym' || planType === 'home') ? planType : undefined;
      const url = validPlanType ? `/fitness/workouts/today?plan_type=${validPlanType}` : '/fitness/workouts/today';
      const response = await api.request(url);
      return response;
    } catch (error) {
      console.error('Error fetching today workouts:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TODAY_WORKOUTS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get fitness reminders
   */
  async getReminders(planType?: 'gym' | 'home', limit?: number): Promise<{ data: import('../types/fitness').Reminder[]; total: number }> {
    try {
      const searchParams = new URLSearchParams();
      // Only include plan_type if it's a valid value
      const validPlanType = planType && (planType === 'gym' || planType === 'home') ? planType : undefined;
      if (validPlanType) searchParams.append('plan_type', validPlanType);
      if (limit) searchParams.append('limit', limit.toString());

      const queryString = searchParams.toString();
      const url = `/fitness/reminders${queryString ? `?${queryString}` : ''}`;

      const response = await api.request(url);
      return response;
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REMINDERS_FETCH_FAILED'
      );
    }
  }

  /**
   * Dismiss a fitness reminder
   */
  async dismissReminder(reminderId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.request(`/fitness/reminders/${reminderId}/dismiss`, {
        method: 'PUT',
      });
      return response;
    } catch (error) {
      console.error('Error dismissing reminder:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'REMINDER_DISMISS_FAILED'
      );
    }
  }

  /**
   * Toggle favorite status for a workout plan
   */
  async toggleFavorite(planId: string): Promise<{ isFavorite: boolean }> {
    try {
      const response = await api.request(`/fitness/workout-plans/${planId}/favorite`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FAVORITE_TOGGLE_FAILED'
      );
    }
  }

  /**
   * Get user's favorite workout plans
   */
  async getFavorites(): Promise<WorkoutPlan[]> {
    try {
      const response = await api.request('/fitness/workout-plans/favorites');
      return response.data || response;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FAVORITES_FETCH_FAILED'
      );
    }
  }

  /**
   * Get current workout session
   */
  async getCurrentWorkoutSession(): Promise<import('../types/fitness').CurrentWorkoutSession> {
    try {
      const response = await api.request('/fitness/workout-session/current');
      return response;
    } catch (error) {
      console.error('Error fetching current workout session:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CURRENT_WORKOUT_SESSION_FETCH_FAILED'
      );
    }
  }

  /**
   * Create new workout session
   */
  async createWorkoutSession(sessionData: import('../types/fitness').CreateWorkoutSessionRequest): Promise<import('../types/fitness').CurrentWorkoutSession> {
    try {
      const response = await api.request('/fitness/workout-session', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
      return response;
    } catch (error) {
      console.error('Error creating workout session:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_SESSION_CREATE_FAILED'
      );
    }
  }

  /**
   * Update workout session
   */
  async updateWorkoutSession(sessionId: string, sessionData: import('../types/fitness').CreateWorkoutSessionRequest): Promise<import('../types/fitness').CurrentWorkoutSession> {
    try {
      const response = await api.request(`/fitness/workout-session/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(sessionData),
      });
      return response;
    } catch (error) {
      console.error('Error updating workout session:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_SESSION_UPDATE_FAILED'
      );
    }
  }

  /**
   * Complete workout session
   */
  async completeWorkoutSession(sessionId: string): Promise<void> {
    try {
      await api.request(`/fitness/workout-session/${sessionId}/complete`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error completing workout session:', error);
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'WORKOUT_SESSION_COMPLETE_FAILED'
      );
    }
  }

  /**
   * Get fitness achievements
   */
  async getAchievements(params?: QueryParams): Promise<{ data: Achievement[]; total: number; page: number; limit: number; total_pages: number }> {
    try {
      return await api.request(`/fitness/achievements${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'ACHIEVEMENTS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get fitness milestones
   */
  async getMilestones(params?: QueryParams): Promise<{ data: Milestone[]; total: number; page: number; limit: number; total_pages: number }> {
    try {
      return await api.request(`/fitness/milestones${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'MILESTONES_FETCH_FAILED'
      );
    }
  }
}

export const fitnessService = new FitnessService();