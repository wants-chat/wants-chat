import { useState, useEffect, useCallback } from 'react';
import { 
  systemWorkoutPlansApiService, 
  GetSystemWorkoutPlansParams, 
  PaginatedSystemWorkoutPlansResponse,
  transformSystemApiToWorkoutPlan
} from '../../services/systemWorkoutPlansApi';

// Frontend types for system workout plans (extends the regular plan with system-specific properties)
export interface SystemWorkoutPlan {
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
  // System plan specific properties
  isSystemPlan: true;
  goal: string;
  isCustomizable: false;
}

interface UseSystemWorkoutPlansResult {
  systemWorkoutPlans: SystemWorkoutPlan[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalPlans: number;
  refetch: () => void;
  fetchSystemWorkoutPlans: (params?: GetSystemWorkoutPlansParams) => Promise<void>;
}

export const useSystemWorkoutPlans = (
  initialParams?: GetSystemWorkoutPlansParams,
  autoFetch = true // Add parameter to control auto-fetching
): UseSystemWorkoutPlansResult => {
  const [systemWorkoutPlans, setSystemWorkoutPlans] = useState<SystemWorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPlans, setTotalPlans] = useState(0);

  const fetchSystemWorkoutPlans = useCallback(async (params?: GetSystemWorkoutPlansParams) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate and sanitize parameters
      const cleanParams: GetSystemWorkoutPlansParams = {};
      
      if (params?.page && Number.isInteger(params.page) && params.page >= 1) {
        cleanParams.page = params.page;
      }
      
      if (params?.limit && Number.isInteger(params.limit) && params.limit >= 1 && params.limit <= 100) {
        cleanParams.limit = params.limit;
      }
      
      if (params?.difficulty && Number.isInteger(params.difficulty) && params.difficulty >= 1 && params.difficulty <= 5) {
        cleanParams.difficulty = params.difficulty;
      }
      
      if (params?.goal && typeof params.goal === 'string' && params.goal.trim().length > 0) {
        cleanParams.goal = params.goal.trim();
      }
      
      if (params?.duration && Number.isInteger(params.duration) && params.duration > 0) {
        cleanParams.duration = params.duration;
      }
      
      if (params?.search && typeof params.search === 'string' && params.search.trim().length > 0) {
        cleanParams.search = params.search.trim();
      }
      
      const response: PaginatedSystemWorkoutPlansResponse = await systemWorkoutPlansApiService.getSystemWorkoutPlans(cleanParams);
      
      // Transform API response to frontend format with error handling
      const transformedPlans: SystemWorkoutPlan[] = response.data.map((plan, index) => {
        try {
          return transformSystemApiToWorkoutPlan(plan);
        } catch (error) {
          console.error(`Error transforming system plan ${index}:`, error, plan);
          // Return a fallback plan instead of breaking the whole list
          return {
            id: plan.id || `fallback-${index}`,
            name: plan.name || 'Unknown Plan',
            description: plan.description || '',
            workouts: [],
            createdAt: new Date(plan.created_at || new Date()),
            updatedAt: new Date(plan.updated_at || new Date()),
            duration: plan.duration || 0,
            difficulty: 'Beginner' as const,
            daysCompleted: 0,
            totalDays: plan.duration || 0,
            lastWorkoutDate: undefined,
            nextWorkoutDate: undefined,
            isFavorite: false,
            isActive: false,
            isCompleted: false,
            category: 'mixed' as const,
            rating: undefined,
            completionCertificate: false,
            isSystemPlan: true as const,
            goal: plan.goal || '',
            isCustomizable: false as const
          };
        }
      });
      
      setSystemWorkoutPlans(transformedPlans);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);
      setTotalPlans(response.total);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch system workout plans';
      setError(errorMessage);
      console.error('System workout plans fetch error:', errorMessage, err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent loops

  const refetch = useCallback(() => {
    fetchSystemWorkoutPlans(initialParams);
  }, [fetchSystemWorkoutPlans, initialParams]);

  useEffect(() => {
    if (autoFetch) {
      fetchSystemWorkoutPlans(initialParams);
    }
  }, []); // Only run on mount if autoFetch is enabled

  return {
    systemWorkoutPlans,
    loading,
    error,
    totalPages,
    currentPage,
    totalPlans,
    refetch,
    fetchSystemWorkoutPlans
  };
};

// Hook for getting system workout plans by difficulty
export const useSystemWorkoutPlansByDifficulty = (
  difficulty?: number,
  limit?: number
) => {
  const params: GetSystemWorkoutPlansParams = {};
  
  if (difficulty) {
    params.difficulty = difficulty;
  }
  
  if (limit) {
    params.limit = limit;
  }

  return useSystemWorkoutPlans(params);
};

// Hook for getting system workout plans by goal
export const useSystemWorkoutPlansByGoal = (
  goal?: string,
  limit?: number
) => {
  const params: GetSystemWorkoutPlansParams = {};
  
  if (goal) {
    params.goal = goal;
  }
  
  if (limit) {
    params.limit = limit;
  }

  return useSystemWorkoutPlans(params);
};