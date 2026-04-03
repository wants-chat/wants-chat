import { useState, useEffect, useCallback } from 'react';
import {
  workoutPlansApiService,
  GetWorkoutPlansParams,
  PaginatedWorkoutPlansResponse,
  transformApiToWorkoutPlan,
  CreateWorkoutPlanRequest,
  UpdateWorkoutPlanRequest,
  WorkoutPlanApiResponse
} from '../../services/workoutPlansApiNew';
import { useToast } from '../use-toast';

// Frontend types matching the component expectations
export interface ExtendedWorkoutPlan {
  id: string;
  name: string;
  description?: string;
  workouts: Array<{
    id: string;
    name: string;
    date: Date;
    exercises: Array<{
      exerciseId: string;
      sets: Array<{
        reps: number;
        weight?: number;
        duration?: number;
        distance?: number;
        restTime?: number;
      }>;
      notes?: string;
    }>;
    duration: number;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  // Extended properties for UI
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  daysCompleted: number;
  totalDays: number;
  lastWorkoutDate?: Date;
  nextWorkoutDate?: Date;
  isFavorite: boolean;
  isActive: boolean;
  isCompleted: boolean;
  category: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  rating?: number;
  completionCertificate?: boolean;
}

interface UseWorkoutPlansResult {
  workoutPlans: ExtendedWorkoutPlan[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalPlans: number;
  refetch: () => void;
  fetchWorkoutPlans: (params?: GetWorkoutPlansParams) => Promise<void>;
  createWorkoutPlan: (data: CreateWorkoutPlanRequest) => Promise<void>;
  updateWorkoutPlan: (planId: string, data: UpdateWorkoutPlanRequest) => Promise<void>;
  deleteWorkoutPlan: (planId: string) => Promise<void>;
}

export const useWorkoutPlans = (
  initialParams?: GetWorkoutPlansParams,
  autoFetch = true // Add parameter to control auto-fetching
): UseWorkoutPlansResult => {
  const [workoutPlans, setWorkoutPlans] = useState<ExtendedWorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlans, setTotalPlans] = useState(0);
  const { toast } = useToast();

  const fetchWorkoutPlans = useCallback(async (params?: GetWorkoutPlansParams) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both user plans and system (admin) plans in parallel
      const [userResponse, systemResponse] = await Promise.all([
        workoutPlansApiService.getWorkoutPlans(params).catch(() => ({ data: [], total: 0, page: 1, limit: 10, total_pages: 0 })),
        workoutPlansApiService.getSystemWorkoutPlans(params).catch(() => ({ data: [], total: 0, page: 1, limit: 10, total_pages: 0 }))
      ]);

      // Combine both responses
      const allPlans: WorkoutPlanApiResponse[] = [
        ...(systemResponse.data || []), // System plans first
        ...(userResponse.data || [])
      ];

      // Transform API response to frontend format with error handling
      const transformedPlans = allPlans.map((plan, index) => {
        try {
          return transformApiToWorkoutPlan(plan);
        } catch (error) {
          console.error(`Error transforming plan ${index}:`, error, plan);
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to transform workout plan data: ${errorMessage}`);
        }
      });

      const totalCount = (userResponse.total || 0) + (systemResponse.total || 0);

      setWorkoutPlans(transformedPlans);
      setTotalPages(Math.ceil(totalCount / (params?.limit || 10)));
      setCurrentPage(params?.page || 1);
      setTotalPlans(totalCount);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch workout plans';
      setError(errorMessage);
      // Remove toast to prevent dependency loops
      console.error('Workout plans fetch error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent loops

  const createWorkoutPlan = async (data: CreateWorkoutPlanRequest) => {
    try {
      setLoading(true);
      
      const newPlan = await workoutPlansApiService.createWorkoutPlan(data);
      const transformedPlan = transformApiToWorkoutPlan(newPlan);
      
      setWorkoutPlans(prev => [transformedPlan, ...prev]);
      setTotalPlans(prev => prev + 1);
      
      toast({
        title: 'Success',
        description: 'Workout plan created successfully',
        variant: 'default'
      });
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create workout plan';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err; // Re-throw so calling code can handle it
    } finally {
      setLoading(false);
    }
  };

  const updateWorkoutPlan = async (planId: string, data: UpdateWorkoutPlanRequest) => {
    try {
      setLoading(true);
      
      const updatedPlan = await workoutPlansApiService.updateWorkoutPlan(planId, data);
      const transformedPlan = transformApiToWorkoutPlan(updatedPlan);
      
      setWorkoutPlans(prev => prev.map(plan => 
        plan.id === planId ? transformedPlan : plan
      ));
      
      toast({
        title: 'Success',
        description: 'Workout plan updated successfully',
        variant: 'default'
      });
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update workout plan';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err; // Re-throw so calling code can handle it
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkoutPlan = async (planId: string) => {
    try {
      setLoading(true);
      
      await workoutPlansApiService.deleteWorkoutPlan(planId);
      
      setWorkoutPlans(prev => prev.filter(plan => plan.id !== planId));
      setTotalPlans(prev => prev - 1);
      
      toast({
        title: 'Success',
        description: 'Workout plan deleted successfully',
        variant: 'default'
      });
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete workout plan';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err; // Re-throw so calling code can handle it
    } finally {
      setLoading(false);
    }
  };

  const refetch = useCallback(() => {
    fetchWorkoutPlans(initialParams);
  }, [fetchWorkoutPlans, initialParams]);

  useEffect(() => {
    if (autoFetch) {
      fetchWorkoutPlans(initialParams);
    }
  }, []); // Only run on mount if autoFetch is enabled

  return {
    workoutPlans,
    loading,
    error,
    totalPages,
    currentPage,
    totalPlans,
    refetch,
    fetchWorkoutPlans,
    createWorkoutPlan,
    updateWorkoutPlan,
    deleteWorkoutPlan
  };
};

// Hook for getting a single workout plan (tries user plan first, then system plan)
export const useWorkoutPlan = (planId: string) => {
  const [workoutPlan, setWorkoutPlan] = useState<ExtendedWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSystemPlan, setIsSystemPlan] = useState(false);
  const { toast } = useToast();

  const fetchWorkoutPlan = async () => {
    if (!planId) return;

    try {
      setLoading(true);
      setError(null);
      setIsSystemPlan(false);

      let response;

      // First try to fetch from user plans
      try {
        response = await workoutPlansApiService.getWorkoutPlanById(planId);
        setIsSystemPlan(false);
      } catch (userPlanError: any) {
        // If user plan not found (404), try system plans
        const is404 = userPlanError.statusCode === 404 ||
                      userPlanError.message?.includes('404') ||
                      userPlanError.message?.toLowerCase().includes('not found');
        if (is404) {
          response = await workoutPlansApiService.getSystemWorkoutPlanById(planId);
          setIsSystemPlan(true);
        } else {
          throw userPlanError;
        }
      }

      const transformedPlan = transformApiToWorkoutPlan(response);
      setWorkoutPlan(transformedPlan);

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch workout plan';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlan();
  }, [planId]);

  return {
    workoutPlan,
    loading,
    error,
    isSystemPlan,
    refetch: fetchWorkoutPlan
  };
};