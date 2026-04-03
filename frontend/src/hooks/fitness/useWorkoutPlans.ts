import React, { useState, useCallback } from 'react';
import { 
  workoutPlansApiService, 
  transformWorkoutPlanToApi,
  transformApiToWorkoutPlan,
  transformPaginatedApiToWorkoutPlans
} from '../../services/workoutPlansApi';
import { 
  WorkoutPlan, 
  CreateWorkoutRequest,
  GetWorkoutsParams} from '../../types/fitness';
import { useToast } from '../../hooks/use-toast';

// Hook to create a workout plan
export interface UseCreateWorkoutPlanOptions {
  onSuccess?: (data: WorkoutPlan) => void;
  onError?: (error: any) => void;
}

export const useCreateWorkoutPlan = (options?: UseCreateWorkoutPlanOptions) => {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const mutate = useCallback(async (data: CreateWorkoutRequest) => {
    try {
      setIsPending(true);
      const response = await workoutPlansApiService.createWorkout(data);
      const workoutPlan = transformApiToWorkoutPlan(response);
      
      toast({
        title: "Workout Plan Created!",
        description: `"${workoutPlan.name}" has been saved successfully.`,
      });
      
      options?.onSuccess?.(workoutPlan);
      return response;
    } catch (error) {
      console.error('Failed to create workout plan:', error);
      
      toast({
        title: "Failed to Create Workout Plan",
        description: "There was an error saving your workout plan. Please try again.",
        variant: "destructive",
      });
      
      options?.onError?.(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [options, toast]);

  return {
    mutate,
    isPending,
  };
};

// Hook to fetch workout plans with pagination support
export const useWorkoutPlans = (params?: GetWorkoutsParams) => {
  const [data, setData] = useState<WorkoutPlan[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await workoutPlansApiService.getWorkouts(params);
      const workoutPlans = transformPaginatedApiToWorkoutPlans(response);
      setData(workoutPlans);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        total_pages: response.total_pages
      });
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  return {
    data,
    pagination,
    isLoading,
    error,
    refetch,
  };
};

// Hook to fetch a single workout plan
export const useWorkoutPlan = (id: string) => {
  const [data, setData] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await workoutPlansApiService.getWorkoutById(id);
      console.log('API Response for workout plan:', response);
      const workoutPlan = transformApiToWorkoutPlan(response);
      console.log('Transformed workout plan:', workoutPlan);
      setData(workoutPlan);
    } catch (err) {
      console.error('Error fetching workout plan:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Auto-fetch when id is provided
  React.useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};

// Hook to update a workout plan
export interface UseUpdateWorkoutPlanOptions {
  onSuccess?: (data: WorkoutPlan) => void;
  onError?: (error: any) => void;
}

export const useUpdateWorkoutPlan = (options?: UseUpdateWorkoutPlanOptions) => {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const mutate = useCallback(async (id: string, data: Partial<CreateWorkoutRequest>) => {
    try {
      setIsPending(true);
      const response = await workoutPlansApiService.updateWorkout(id, data);
      const workoutPlan = transformApiToWorkoutPlan(response);
      
      toast({
        title: "Workout Plan Updated!",
        description: `"${workoutPlan.name}" has been updated successfully.`,
      });
      
      options?.onSuccess?.(workoutPlan);
      return response;
    } catch (error) {
      console.error('Failed to update workout plan:', error);
      
      toast({
        title: "Failed to Update Workout Plan",
        description: "There was an error updating your workout plan. Please try again.",
        variant: "destructive",
      });
      
      options?.onError?.(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [options, toast]);

  return {
    mutate,
    isPending,
  };
};

// Special hook for creating workout plan from custom plan builder
export interface UseCreateWorkoutPlanFromBuilderOptions {
  onSuccess?: (data: WorkoutPlan) => void;
  onError?: (error: any) => void;
  exerciseDatabase: any[];
  planType?: 'gym' | 'home'; // Add plan type support
}

export const useCreateWorkoutPlanFromBuilder = (options: UseCreateWorkoutPlanFromBuilderOptions) => {
  const createMutation = useCreateWorkoutPlan({
    onSuccess: options.onSuccess,
    onError: options.onError,
  });

  const mutate = useCallback((workoutPlan: WorkoutPlan) => {
    const apiData = transformWorkoutPlanToApi(workoutPlan, options.exerciseDatabase, options.planType);
    return createMutation.mutate(apiData);
  }, [createMutation, options.exerciseDatabase, options.planType]);

  return {
    ...createMutation,
    mutate,
  };
};

// Special hook for updating workout plan from custom plan builder
export interface UseUpdateWorkoutPlanFromBuilderOptions {
  onSuccess?: (data: WorkoutPlan) => void;
  onError?: (error: any) => void;
  exerciseDatabase: any[];
  planType?: 'gym' | 'home'; // Add plan type support
}

export const useUpdateWorkoutPlanFromBuilder = (options: UseUpdateWorkoutPlanFromBuilderOptions) => {
  const updateMutation = useUpdateWorkoutPlan({
    onSuccess: options.onSuccess,
    onError: options.onError,
  });

  const mutate = useCallback((id: string, workoutPlan: WorkoutPlan) => {
    const apiData = transformWorkoutPlanToApi(workoutPlan, options.exerciseDatabase, options.planType);
    return updateMutation.mutate(id, apiData);
  }, [updateMutation, options.exerciseDatabase, options.planType]);

  return {
    ...updateMutation,
    mutate,
  };
};