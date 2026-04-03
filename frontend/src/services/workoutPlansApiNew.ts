import { api } from '../lib/api';

// API Response types matching your updated API structure
export interface WorkoutPlanApiResponse {
  id: string;
  user_id?: string; // Optional - admin plans don't have user_id
  name: string;
  description: string;
  duration: number; // Total plan duration in days
  difficulty: number; // 1-5 scale
  goal: string; // Fitness goal for this plan
  workouts: WorkoutDayApiResponse[];
  metadata: any; // Additional metadata object
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

export interface WorkoutDayApiResponse {
  day: number; // Day number in the plan (1-based)
  name: string; // Name of the workout day
  exercises: WorkoutExerciseApiResponse[];
}

export interface WorkoutExerciseApiResponse {
  exerciseId: string;
  exerciseName: string;
  muscleGroups: string[];
  category: string;
  equipment: string;
  sets: WorkoutSetApiResponse[];
}

export interface WorkoutSetApiResponse {
  reps: number;
  weight: number;
}

export interface PaginatedWorkoutPlansResponse {
  data: WorkoutPlanApiResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetWorkoutPlansParams {
  page?: number;
  limit?: number;
  user_id?: string;
  category?: string;
  duration?: number;
  plan_type?: 'gym' | 'home';
}

// Request types for creating/updating workout plans
export interface CreateWorkoutPlanRequest {
  name: string;
  description: string;
  duration: number;
  difficulty: number; // 1-5 scale (required)
  goal: string; // required
  plan_type?: 'gym' | 'home'; // Plan type based on workout location
  workouts: CreateWorkoutDayRequest[];
  metadata?: any;
}

export interface CreateWorkoutDayRequest {
  day: number;
  name: string;
  description?: string;
  exercises: CreateWorkoutExerciseRequest[];
  estimated_duration: number;
}

export interface CreateWorkoutExerciseRequest {
  exercise_id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_time?: number;
  notes?: string;
}

export interface CreateWorkoutSetRequest {
  reps: number;
  weight: number;
}

export interface UpdateWorkoutPlanRequest {
  name?: string;
  description?: string;
  duration?: number;
  difficulty?: number;
  goal?: string;
  workouts?: CreateWorkoutDayRequest[];
  metadata?: any;
}

class WorkoutPlansApiService {
  private baseUrl = '/fitness'; // Base path without /api/v1 since it's added by the api client

  async getWorkoutPlans(params?: GetWorkoutPlansParams): Promise<PaginatedWorkoutPlansResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.user_id) searchParams.append('user_id', params.user_id);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.duration) searchParams.append('duration', params.duration.toString());
    if (params?.plan_type) searchParams.append('plan_type', params.plan_type);

    const queryString = searchParams.toString();
    const url = `${this.baseUrl}/workouts${queryString ? `?${queryString}` : ''}`;
    
    return await api.request(url);
  }

  async getWorkoutPlanById(planId: string): Promise<WorkoutPlanApiResponse> {
    return await api.request(`${this.baseUrl}/workouts/${planId}`);
  }

  async createWorkoutPlan(data: CreateWorkoutPlanRequest): Promise<WorkoutPlanApiResponse> {
    return await api.request(`${this.baseUrl}/workouts`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateWorkoutPlan(planId: string, data: UpdateWorkoutPlanRequest): Promise<WorkoutPlanApiResponse> {
    return await api.request(`${this.baseUrl}/workouts/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteWorkoutPlan(planId: string): Promise<void> {
    await api.request(`${this.baseUrl}/workouts/${planId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get system workout plans (admin-created plans available to all users)
   */
  async getSystemWorkoutPlans(params?: GetWorkoutPlansParams): Promise<PaginatedWorkoutPlansResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.duration) searchParams.append('duration', params.duration.toString());

    const queryString = searchParams.toString();
    const url = `${this.baseUrl}/system-workout-plans${queryString ? `?${queryString}` : ''}`;

    return await api.request(url);
  }

  async getSystemWorkoutPlanById(planId: string): Promise<WorkoutPlanApiResponse> {
    return await api.request(`${this.baseUrl}/system-workout-plans/${planId}`);
  }
}

// Transform function to convert API response to frontend types
export const transformApiToWorkoutPlan = (apiPlan: WorkoutPlanApiResponse) => {
  // Safety checks
  if (!apiPlan || !apiPlan.id) {
    throw new Error('Invalid workout plan data: missing required fields');
  }

  // Map difficulty number to text
  const getDifficultyText = (diff: number): 'Beginner' | 'Intermediate' | 'Advanced' => {
    if (!diff || diff <= 2) return 'Beginner';
    if (diff <= 4) return 'Intermediate';
    return 'Advanced';
  };

  return {
    id: apiPlan.id,
    name: apiPlan.name || 'Untitled Plan',
    description: apiPlan.description || '',
    workouts: (apiPlan.workouts || []).map((workout) => {
      return {
        id: `${apiPlan.id}-day-${workout.day}`,
        name: workout.name || `Day ${workout.day}`,
        date: new Date(),
        exercises: (workout.exercises || []).map((exercise: any) => {
          return {
            exerciseId: exercise.exercise_id || exercise.exerciseId,
            sets: Array.isArray(exercise.sets)
              ? exercise.sets.map((set: any) => ({
                  reps: set.reps || 0,
                  weight: set.weight || 0,
                  duration: undefined,
                  distance: undefined,
                  restTime: undefined
                }))
              : Array.from({ length: exercise.sets || 1 }, () => ({
                  reps: exercise.reps || 10,
                  weight: exercise.weight || 0,
                  duration: undefined,
                  distance: undefined,
                  restTime: undefined
                })),
            notes: exercise.notes || undefined
          };
        }),
        duration: (workout as any).estimated_duration || 0,
        notes: (workout as any).description || ''
      };
    }),
    createdAt: new Date(apiPlan.created_at),
    updatedAt: new Date(apiPlan.updated_at),
    // Extended properties for UI
    duration: apiPlan.duration || 0,
    difficulty: getDifficultyText(apiPlan.difficulty),
    daysCompleted: 0, // Would come from user progress data
    totalDays: apiPlan.duration || 0,
    lastWorkoutDate: undefined,
    nextWorkoutDate: undefined,
    isFavorite: false, // Would come from user preferences or metadata
    isActive: false, // Would be determined by current active plan
    isCompleted: false, // Would be determined by progress
    category: determineWorkoutCategory(apiPlan.workouts || []),
    rating: undefined,
    completionCertificate: false
  };
};

// Helper function to determine workout category based on exercises
const determineWorkoutCategory = (workouts: WorkoutDayApiResponse[]): 'strength' | 'cardio' | 'flexibility' | 'mixed' => {
  const categories = new Set<string>();
  
  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      categories.add(exercise.category);
    });
  });

  if (categories.size === 1) {
    const category = categories.values().next().value;
    if (category === 'strength' || category === 'cardio' || category === 'flexibility') {
      return category;
    }
  }
  
  return 'mixed';
};

export const workoutPlansApiService = new WorkoutPlansApiService();
export default workoutPlansApiService;