import { api } from '../lib/api';
import type { SystemWorkoutPlan } from '../hooks/fitness/useSystemWorkoutPlans';

// API Response types for system workout plans
export interface SystemWorkoutPlanApiResponse {
  id: string;
  name: string;
  description: string;
  duration: number; // Total plan duration in days
  difficulty: number; // 1-5 scale
  goal: string; // Fitness goal for this plan
  workouts: SystemWorkoutDayApiResponse[];
  metadata: any; // Additional metadata object
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface SystemWorkoutDayApiResponse {
  day: number; // Day number in the plan (1-based)
  name: string; // Name of the workout day (e.g., "Chest & Triceps")
  description: string; // Workout description
  exercises: SystemWorkoutExerciseApiResponse[];
  estimated_duration: number; // Estimated workout duration in minutes
}

export interface SystemWorkoutExerciseApiResponse {
  exercise_id: string; // UUID of the exercise
  name: string; // Exercise name (e.g., "Bench Press")
  sets: number; // Number of sets
  reps: number; // Reps per set
  weight: number; // Weight in kg
  rest_time: number; // Rest time between sets in seconds
  notes: string; // Additional notes for the exercise
}

export interface PaginatedSystemWorkoutPlansResponse {
  data: SystemWorkoutPlanApiResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetSystemWorkoutPlansParams {
  page?: number;
  limit?: number;
  difficulty?: number;
  goal?: string;
  duration?: number;
  search?: string;
}

class SystemWorkoutPlansApiService {
  private baseUrl = '/fitness'; // Base path without /api/v1 since it's added by the api client

  async getSystemWorkoutPlans(params?: GetSystemWorkoutPlansParams): Promise<PaginatedSystemWorkoutPlansResponse> {
    
    const searchParams = new URLSearchParams();
    
    // Ensure parameters are valid before adding them
    if (params?.page) {
      const page = Number(params.page);
      if (Number.isInteger(page) && page >= 1) {
        searchParams.append('page', page.toString());
      }
    }
    
    if (params?.limit) {
      const limit = Number(params.limit);
      if (Number.isInteger(limit) && limit >= 1 && limit <= 100) {
        searchParams.append('limit', limit.toString());
      } else {
        console.warn('Invalid limit parameter:', params.limit, 'using default limit of 20');
        searchParams.append('limit', '20'); // Default to 20 if invalid
      }
    }
    
    if (params?.difficulty) {
      const difficulty = Number(params.difficulty);
      if (Number.isInteger(difficulty) && difficulty >= 1 && difficulty <= 5) {
        searchParams.append('difficulty', difficulty.toString());
      }
    }
    
    if (params?.goal && typeof params.goal === 'string' && params.goal.trim().length > 0) {
      searchParams.append('goal', params.goal.trim());
    }
    
    if (params?.duration) {
      const duration = Number(params.duration);
      if (Number.isInteger(duration) && duration > 0) {
        searchParams.append('duration', duration.toString());
      }
    }
    
    if (params?.search && typeof params.search === 'string' && params.search.trim().length > 0) {
      searchParams.append('search', params.search.trim());
    }

    const queryString = searchParams.toString();
    const url = `${this.baseUrl}/system-workout-plans${queryString ? `?${queryString}` : ''}`;

    return await api.request(url);
  }

  async getSystemWorkoutPlanById(planId: string): Promise<SystemWorkoutPlanApiResponse> {
    return await api.request(`${this.baseUrl}/system-workout-plans/${planId}`);
  }
}

// Transform function to convert system workout plan API response to frontend format
export const transformSystemApiToWorkoutPlan = (apiPlan: SystemWorkoutPlanApiResponse): SystemWorkoutPlan => {
  
  // Safety checks
  if (!apiPlan || !apiPlan.id) {
    throw new Error('Invalid system workout plan data: missing required fields');
  }
  
  // Map difficulty number to text
  const getDifficultyText = (diff: number): 'Beginner' | 'Intermediate' | 'Advanced' => {
    if (!diff || diff <= 2) return 'Beginner';
    if (diff <= 4) return 'Intermediate';
    return 'Advanced';
  };

  // Map category based on goal
  const getCategoryFromGoal = (goal: string): 'strength' | 'cardio' | 'flexibility' | 'mixed' => {
    const goalLower = goal.toLowerCase();
    if (goalLower.includes('strength') || goalLower.includes('muscle')) return 'strength';
    if (goalLower.includes('cardio') || goalLower.includes('endurance')) return 'cardio';
    if (goalLower.includes('flexibility') || goalLower.includes('yoga')) return 'flexibility';
    return 'mixed';
  };

  return {
    id: apiPlan.id,
    name: apiPlan.name || 'Untitled Plan',
    description: apiPlan.description || '',
    workouts: (apiPlan.workouts || []).map((workout) => ({
      id: `${apiPlan.id}-day-${workout.day}`,
      name: workout.name || `Day ${workout.day}`,
      date: new Date(),
      exercises: (workout.exercises || []).map(exercise => ({
        exerciseId: exercise.exercise_id,
        sets: Array.from({ length: exercise.sets }, () => ({
          reps: exercise.reps,
          weight: exercise.weight,
          duration: undefined,
          distance: undefined,
          restTime: exercise.rest_time
        })),
        notes: exercise.notes || undefined
      })),
      duration: workout.estimated_duration || 0,
      notes: workout.description || ''
    })),
    createdAt: new Date(apiPlan.created_at),
    updatedAt: new Date(apiPlan.updated_at),
    // Extended properties for UI
    duration: apiPlan.duration || 0,
    difficulty: getDifficultyText(apiPlan.difficulty),
    daysCompleted: 0, // System plans don't have user progress
    totalDays: apiPlan.duration || 0,
    lastWorkoutDate: undefined,
    nextWorkoutDate: undefined,
    isFavorite: false, // System plans aren't favoritable
    isActive: false,
    isCompleted: false,
    category: getCategoryFromGoal(apiPlan.goal || ''),
    rating: undefined,
    completionCertificate: false,
    // Additional properties for system plans
    isSystemPlan: true, // Flag to identify system plans
    goal: apiPlan.goal,
    isCustomizable: false // System plans are not customizable
  };
};

export const systemWorkoutPlansApiService = new SystemWorkoutPlansApiService();
export default systemWorkoutPlansApiService;