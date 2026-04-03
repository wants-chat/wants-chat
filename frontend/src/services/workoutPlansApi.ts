import { api } from '../lib/api';
import { 
  WorkoutPlan, 
  WorkoutPlanApiResponse, 
  PaginatedWorkoutPlanResponse,
  CreateWorkoutRequest,
  GetWorkoutsParams
} from '../types/fitness';

class WorkoutPlansApiService {
  private baseUrl = '/fitness';

  async createWorkout(data: CreateWorkoutRequest): Promise<WorkoutPlanApiResponse> {
    return await api.request(`${this.baseUrl}/workouts`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getWorkouts(params?: GetWorkoutsParams): Promise<PaginatedWorkoutPlanResponse> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return await api.request(`${this.baseUrl}/workouts${queryString}`);
  }

  async getWorkoutById(id: string): Promise<WorkoutPlanApiResponse> {
    return await api.request(`${this.baseUrl}/workouts/${id}`);
  }

  async updateWorkout(id: string, data: Partial<CreateWorkoutRequest>): Promise<WorkoutPlanApiResponse> {
    return await api.request(`${this.baseUrl}/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteWorkout(id: string): Promise<void> {
    await api.request(`${this.baseUrl}/workouts/${id}`, {
      method: 'DELETE'
    });
  }
}

// Transform function to convert WorkoutPlan to API format
export const transformWorkoutPlanToApi = (
  plan: WorkoutPlan,
  exerciseDatabase: any[],
  planType?: 'gym' | 'home'
): CreateWorkoutRequest => {
  return {
    name: plan.name,
    description: plan.description || '',
    duration: plan.workouts.length,
    difficulty: 3, // Default to intermediate difficulty (1-5 scale)
    goal: 'muscle_building', // Default goal
    plan_type: planType, // Include plan type based on workout location
    workouts: plan.workouts.map((workout, index) => ({
      day: index + 1,
      name: workout.name,
      description: workout.notes || '',
      estimated_duration: workout.duration || 60, // Default to 60 minutes
      exercises: workout.exercises.map((exercise) => {
        const exerciseDetails = exerciseDatabase.find(e => e.id === exercise.exerciseId);

        // Calculate total sets and average reps/weight from all sets
        const totalSets = exercise.sets.length || 1;
        const avgReps = Math.round(exercise.sets.reduce((sum, set) => sum + (set.reps || 0), 0) / totalSets) || 1;
        const avgWeight = Math.round(exercise.sets.reduce((sum, set) => sum + (set.weight || 0), 0) / totalSets) || 0;

        return {
          exercise_id: exercise.exerciseId || 'default-exercise-id',
          name: exerciseDetails?.name || 'Unknown Exercise',
          sets: totalSets,
          reps: avgReps,
          weight: avgWeight,
          rest_time: 90, // Default rest time in seconds
          notes: exercise.notes || ''
        };
      })
    })),
    metadata: {}
  };
};

// Transform function to convert API response to WorkoutPlan
export const transformApiToWorkoutPlan = (apiResponse: WorkoutPlanApiResponse): WorkoutPlan => {
  return {
    id: apiResponse.id,
    name: apiResponse.name,
    description: apiResponse.description,
    workouts: apiResponse.workouts.map((workout) => ({
      id: `${apiResponse.id}-day-${workout.day}`,
      name: workout.name,
      date: new Date(),
      exercises: workout.exercises.map((exercise: any) => ({
        exerciseId: exercise.exercise_id || exercise.exerciseId,
        sets: Array.isArray(exercise.sets)
          ? exercise.sets.map((set: any) => ({
              reps: set.reps,
              weight: set.weight
            }))
          : Array.from({ length: exercise.sets || 1 }, () => ({
              reps: exercise.reps || 10,
              weight: exercise.weight || 0
            })),
        notes: exercise.notes || ''
      })),
      duration: 0, // Default duration, not provided by API
      notes: '' // No notes field in API response
    })),
    createdAt: new Date(apiResponse.created_at),
    updatedAt: new Date(apiResponse.updated_at)
  };
};

// Transform function to convert paginated API response to WorkoutPlan array
export const transformPaginatedApiToWorkoutPlans = (apiResponse: PaginatedWorkoutPlanResponse): WorkoutPlan[] => {
  return apiResponse.data.map(transformApiToWorkoutPlan);
};

// Transform function to convert system workout plan to user workout plan format
export const transformSystemPlanToUserPlan = (
  systemPlan: any,
  exerciseDatabase: any[]
): CreateWorkoutRequest => {
  return {
    name: systemPlan.name || 'Untitled Plan',
    description: systemPlan.description || '',
    duration: parseInt(systemPlan.duration) || 30,
    difficulty: parseInt(systemPlan.difficulty) || 3,
    goal: systemPlan.goal || 'muscle_building',
    workouts: systemPlan.workouts.map((workout: any) => ({
      day: parseInt(workout.day) || 1,
      name: workout.name || 'Workout Day',
      description: workout.description || '',
      estimated_duration: parseInt(workout.estimated_duration) || 60,
      exercises: workout.exercises.map((exercise: any) => {
        return {
          exercise_id: exercise.exercise_id || 'default-exercise-id',
          name: exercise.name || 'Unknown Exercise',
          sets: parseInt(exercise.sets) || 1,
          reps: parseInt(exercise.reps) || 1,
          weight: parseInt(exercise.weight) || 0,
          rest_time: parseInt(exercise.rest_time) || 90,
          notes: exercise.notes || ''
        };
      })
    })),
    metadata: systemPlan.metadata || {}
  };
};

export const workoutPlansApiService = new WorkoutPlansApiService();
export default workoutPlansApiService;