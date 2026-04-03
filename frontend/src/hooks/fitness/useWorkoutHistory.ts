import { useState, useEffect, useCallback } from 'react';
import { 
  workoutHistoryApiService, 
  GetWorkoutHistoryParams, 
  transformApiToWorkoutHistory} from '../../services/workoutHistoryApi';
import { useToast } from '../use-toast';

// Frontend types matching the component expectations
export interface WorkoutHistoryEntry {
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
  duration: number; // minutes
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned?: number;
  personalRecords?: number;
  weightRecorded?: number;
  bodyFatPercentage?: number;
  restingHeartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  mood?: 'excellent' | 'good' | 'average' | 'poor';
  energyLevel?: 'high' | 'medium' | 'low';
  sleepHours?: number;
  waterIntake?: number;
  notes?: string;
}

// Helper function to calculate workout stats from data
const calculateWorkoutStats = (workouts: WorkoutHistoryEntry[]): WorkoutHistoryStats => {
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, workout) => sum + workout.duration, 0);
  const totalCalories = workouts.reduce((sum, workout) => sum + (workout.caloriesBurned || 0), 0);
  
  // Calculate current streak
  const sortedWorkouts = [...workouts].sort((a, b) => b.date.getTime() - a.date.getTime());
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Calculate streaks (simplified - assumes one workout per day max)
  const workoutDates = new Set(sortedWorkouts.map(w => {
    const date = new Date(w.date);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }));
  
  const sortedDates = Array.from(workoutDates).sort((a, b) => b - a);
  
  // Current streak calculation
  for (let i = 0; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    
    if (currentDate.getTime() === expectedDate.getTime()) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Longest streak calculation
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const currentDate = new Date(sortedDates[i]);
      const prevDate = new Date(sortedDates[i - 1]);
      const diffDays = Math.abs(prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);
  
  // Weekly stats (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weeklyWorkouts = workouts.filter(w => new Date(w.date) >= weekAgo);
  const weeklyStats = {
    workouts: weeklyWorkouts.length,
    duration: weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0) / 60, // in hours
    calories: weeklyWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
  };
  
  return {
    totalWorkouts,
    currentStreak,
    longestStreak,
    totalDuration,
    totalCalories,
    weeklyStats
  };
};

export interface WorkoutHistoryStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalDuration: number;
  totalCalories: number;
  weeklyStats: {
    workouts: number;
    duration: number;
    calories: number;
  };
}

interface UseWorkoutHistoryResult {
  workouts: WorkoutHistoryEntry[];
  stats: WorkoutHistoryStats | null;
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  refetch: () => void;
  fetchWorkouts: (params?: GetWorkoutHistoryParams) => Promise<void>;
}

export const useWorkoutHistory = (
  initialParams?: GetWorkoutHistoryParams
): UseWorkoutHistoryResult => {
  const [workouts, setWorkouts] = useState<WorkoutHistoryEntry[]>([]);
  const [stats, setStats] = useState<WorkoutHistoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchWorkouts = useCallback(async (params?: GetWorkoutHistoryParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await workoutHistoryApiService.getWorkoutHistory(params);
      
      // Transform API response to frontend format
      const transformedWorkouts = response.data.map(transformApiToWorkoutHistory);
      
      setWorkouts(transformedWorkouts);
      
      // Calculate stats from the workout data since your API doesn't include stats yet
      const calculatedStats = calculateWorkoutStats(transformedWorkouts);
      setStats(calculatedStats);
      
      setTotalPages(response.total_pages || Math.ceil(response.total / (response.limit || 20)));
      setCurrentPage(response.page || 1);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch workout history';
      setError(errorMessage);
      // Remove toast to prevent dependency loops
      console.error('Workout history fetch error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent loops

  const refetch = useCallback(() => {
    fetchWorkouts(initialParams);
  }, [fetchWorkouts, initialParams]);

  useEffect(() => {
    fetchWorkouts(initialParams);
  }, []);

  return {
    workouts,
    stats,
    loading,
    error,
    totalPages,
    currentPage,
    refetch,
    fetchWorkouts
  };
};

// Hook for getting workout history for a specific date range
export const useWorkoutHistoryByDateRange = (
  startDate?: Date,
  endDate?: Date
) => {
  const params: GetWorkoutHistoryParams = {};
  
  if (startDate) {
    params.startDate = startDate.toISOString().split('T')[0];
  }
  
  if (endDate) {
    params.endDate = endDate.toISOString().split('T')[0];
  }

  return useWorkoutHistory(params);
};

// Hook for getting workout history for current month
export const useCurrentMonthWorkoutHistory = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return useWorkoutHistoryByDateRange(startOfMonth, endOfMonth);
};

// Hook for getting recent workout history (last N days)
export const useRecentWorkoutHistory = (days: number = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return useWorkoutHistoryByDateRange(startDate, endDate);
};