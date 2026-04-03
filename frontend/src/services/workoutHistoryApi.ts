import { api } from '../lib/api';

// API Response types (updated to match your actual API structure)
export interface WorkoutHistoryApiResponse {
  id: string;
  userId: string; // Your API uses userId, not user_id
  name: string;
  date: string; // ISO date string
  exercises: WorkoutExerciseApiResponse[];
  duration: number; // minutes
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned?: number; // Your API uses camelCase
  personalRecords?: number; // Your API uses camelCase
  notes?: string;
  
  // Health metrics
  weightRecorded?: number; // Your API uses camelCase
  bodyFatPercentage?: number; // Your API uses camelCase
  restingHeartRate?: number; // Your API uses camelCase
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  mood?: 'excellent' | 'good' | 'average' | 'poor';
  energyLevel?: 'high' | 'medium' | 'low'; // Your API uses camelCase
  sleepHours?: number; // Your API uses camelCase
  waterIntake?: number; // Your API uses camelCase, liters
  
  createdAt: string; // Your API uses camelCase
  updatedAt: string; // Your API uses camelCase
}

// Your API returns exercises in this format
export interface WorkoutExerciseApiResponse {
  name: string;
  reps: number;
  sets: number; // Number of sets, not array of sets
  weight?: number;
  duration?: number; // seconds
  distance?: number; // meters
  notes?: string;
}

// This is for future API improvements if you want to support detailed sets
export interface DetailedWorkoutSetApiResponse {
  reps: number;
  weight?: number;
  duration?: number; // seconds
  distance?: number; // meters
  restTime?: number; // seconds
}

export interface WorkoutHistoryStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalDuration: number; // minutes
  totalCalories: number;
  weeklyStats: {
    workouts: number;
    duration: number; // hours
    calories: number;
  };
}

export interface GetWorkoutHistoryParams {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  page?: number;
  limit?: number;
  intensity?: 'low' | 'medium' | 'high';
}

export interface PaginatedWorkoutHistoryResponse {
  data: WorkoutHistoryApiResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages?: number; // Made optional since your API might not include this
}

class WorkoutHistoryApiService {
  private baseUrl = '/fitness'; // Base path without /api/v1 since it's added by the api client

  async getWorkoutHistory(params?: GetWorkoutHistoryParams): Promise<PaginatedWorkoutHistoryResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.intensity) searchParams.append('intensity', params.intensity);

    const queryString = searchParams.toString();
    const url = `${this.baseUrl}/workout-history${queryString ? `?${queryString}` : ''}`;
    
    return await api.request(url);
  }

  async getWorkoutById(workoutId: string): Promise<WorkoutHistoryApiResponse> {
    return await api.request(`${this.baseUrl}/workout-history/${workoutId}`);
  }

  async createWorkout(data: CreateWorkoutRequest): Promise<WorkoutHistoryApiResponse> {
    return await api.request(`${this.baseUrl}/workout-history`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateWorkout(workoutId: string, data: Partial<CreateWorkoutRequest>): Promise<WorkoutHistoryApiResponse> {
    return await api.request(`${this.baseUrl}/workout-history/${workoutId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    await api.request(`${this.baseUrl}/workout-history/${workoutId}`, {
      method: 'DELETE'
    });
  }
}

// Request types for creating workouts
export interface CreateWorkoutRequest {
  name: string;
  date: string; // ISO date string
  exercises: CreateWorkoutExerciseRequest[];
  duration: number; // minutes
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned?: number;
  personalRecords?: number;
  notes?: string;
  
  // Health metrics
  weightRecorded?: number;
  bodyFatPercentage?: number;
  restingHeartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  mood?: 'excellent' | 'good' | 'average' | 'poor';
  energyLevel?: 'high' | 'medium' | 'low';
  sleepHours?: number;
  waterIntake?: number;
}

export interface CreateWorkoutExerciseRequest {
  name: string;
  reps: number;
  sets: number;
  weight?: number;
  duration?: number; // seconds
  distance?: number; // meters
  notes?: string;
}

// Transform function to convert API response to frontend types
export const transformApiToWorkoutHistory = (apiResponse: WorkoutHistoryApiResponse) => {
  return {
    id: apiResponse.id,
    name: apiResponse.name,
    date: new Date(apiResponse.date),
    // Transform your API's exercise structure to match frontend expectations
    exercises: apiResponse.exercises.map(exercise => ({
      exerciseId: exercise.name.toLowerCase().replace(/\s+/g, '-'), // Generate an ID from name
      sets: Array.from({ length: exercise.sets }, (_, index) => ({
        reps: exercise.reps,
        weight: exercise.weight,
        duration: exercise.duration,
        distance: exercise.distance
      })),
      notes: exercise.notes
    })),
    duration: apiResponse.duration,
    intensity: apiResponse.intensity,
    caloriesBurned: apiResponse.caloriesBurned,
    personalRecords: apiResponse.personalRecords,
    weightRecorded: apiResponse.weightRecorded,
    bodyFatPercentage: apiResponse.bodyFatPercentage,
    restingHeartRate: apiResponse.restingHeartRate,
    bloodPressure: apiResponse.bloodPressure,
    mood: apiResponse.mood,
    energyLevel: apiResponse.energyLevel,
    sleepHours: apiResponse.sleepHours,
    waterIntake: apiResponse.waterIntake,
    notes: apiResponse.notes
  };
};

export const workoutHistoryApiService = new WorkoutHistoryApiService();
export default workoutHistoryApiService;