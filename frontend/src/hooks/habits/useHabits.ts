/**
 * Habit tracking hooks - CACHE BUSTER v2.0 - ALL API CALLS DISABLED
 */

import React, { useCallback } from 'react';
import { api } from '../../lib/api';
import { useApi, useMutation, usePaginatedApi } from '../useApi';

// Types - matching backend schema (camelCase after CamelCaseInterceptor)
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category?: string;
  frequencyType: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  weeklyDays?: number[]; // 0=Sunday, 6=Saturday
  monthlyDay?: number; // Day of month for monthly habits
  targetValue?: number;
  targetUnit?: string;
  color: string;
  icon: string;
  reminderEnabled: boolean;
  reminderTime?: string;
  isActive: boolean;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  // Legacy snake_case for backward compatibility
  user_id?: string;
  frequency_type?: 'daily' | 'weekly' | 'monthly';
  target_count?: number;
  weekly_days?: number[];
  monthly_day?: number;
  target_value?: number;
  target_unit?: string;
  reminder_enabled?: boolean;
  reminder_time?: string;
  is_active?: boolean;
  current_streak?: number;
  best_streak?: number;
  total_completions?: number;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  completedAt: string;
  completedDate: string;
  actualValue?: number; // Backend field name for progress value
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  // Legacy snake_case for backward compatibility
  habit_id?: string;
  user_id?: string;
  completed_at?: string;
  completed_date?: string;
  actual_value?: number;
  created_at?: string;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  streakStartDate: string | null;
  streakEndDate: string | null;
}

export interface HabitStats {
  habitId: string;
  totalCompletions: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  averageValue?: number;
  completionsThisWeek: number;
  completionsThisMonth: number;
  completionsThisYear: number;
  weeklyTrend: number;
  monthlyTrend: number;
}

export interface CreateHabitData {
  name: string;
  description?: string;
  category?: string;
  frequency_type: 'daily' | 'weekly' | 'monthly';
  target_count?: number; // How many times per period (default: 1)
  weekly_days?: number[]; // For weekly habits (0=Sunday, 6=Saturday)
  monthly_day?: number; // For monthly habits (1-31)
  target_value?: number; // Measurable target (e.g., steps, minutes)
  target_unit?: string; // Unit for target_value
  color?: string;
  icon?: string;
  reminder_enabled?: boolean;
  reminder_time?: string; // HH:MM format
  start_date?: string; // ISO 8601 format
  end_date?: string; // ISO 8601 format
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateHabitData {
  name?: string;
  description?: string;
  category?: string;
  frequency_type?: 'daily' | 'weekly' | 'monthly';
  frequency_value?: number;
  frequency_days?: string[];
  target_value?: number;
  target_unit?: string;
  color?: string;
  icon?: string;
  reminder_enabled?: boolean;
  reminder_time?: string;
  is_active?: boolean;
}

export interface MarkHabitCompleteData {
  completed_at?: string;
  actual_value?: number; // Backend expects actual_value for measurable habits
  notes?: string;
  metadata?: Record<string, any>;
}

// Habit hooks

/**
 * Get all habits for the current user with filtering and pagination
 */
export function useHabits(params?: {
  page?: number;
  limit?: number;
  is_active?: boolean;
  is_archived?: boolean;
  category?: string;
  frequency_type?: 'daily' | 'weekly' | 'monthly';
  start_date_from?: string;
  start_date_to?: string;
  search?: string;
  tags?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  due_today?: boolean;
  has_reminders?: boolean;
}) {
  const [data, setData] = React.useState<{ data: Habit[]; total: number; page: number; limit: number } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(params?.page || 1);
  const [currentLimit, setCurrentLimit] = React.useState(params?.limit || 20);

  const fetchHabits = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build query parameters
      const queryParams: any = {
        page: currentPage,
        limit: currentLimit,
        ...params
      };

      // Remove undefined values
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await api.getHabits(queryParams);

      // Transform response to match expected format
      const habitsData = response.habits || [];
      const pagination = response.pagination || {};

      setData({
        data: habitsData,
        total: pagination.total || 0,
        page: pagination.page || 1,
        limit: pagination.limit || 20
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch habits');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentLimit, params?.is_active, params?.is_archived, params?.category, params?.frequency_type, params?.start_date_from, params?.start_date_to, params?.search, params?.tags, params?.sort_by, params?.sort_order, params?.due_today, params?.has_reminders]);

  React.useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const nextPage = React.useCallback(() => {
    if (data && currentPage < Math.ceil(data.total / currentLimit)) {
      setCurrentPage(prev => prev + 1);
    }
  }, [data, currentPage, currentLimit]);

  const prevPage = React.useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToPage = React.useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const changeLimit = React.useCallback((newLimit: number) => {
    setCurrentLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  }, []);

  return {
    data,
    loading,
    error,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    refetch: fetchHabits
  };
}

/**
 * Get a single habit by ID
 */
export function useHabit(habitId: string | null) {
  const [habit, setHabit] = React.useState<Habit | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!habitId) {
      setHabit(null);
      return;
    }

    const fetchHabit = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.getHabitById(habitId);
        // The API returns { habit: {...} }, so we need to extract the habit
        const habitData = response.habit || response;
        setHabit(habitData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch habit');
        setHabit(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHabit();
  }, [habitId]);

  return {
    data: habit,
    loading,
    error,
    refetch: () => {
      if (habitId) {
        const fetchHabit = async () => {
          setLoading(true);
          setError(null);
          try {
            const response = await api.getHabitById(habitId);
            // The API returns { habit: {...} }, so we need to extract the habit
            const habitData = response.habit || response;
            setHabit(habitData);
          } catch (err: any) {
            setError(err.message || 'Failed to fetch habit');
            setHabit(null);
          } finally {
            setLoading(false);
          }
        };
        fetchHabit();
      }
    }
  };
}

/**
 * Create a new habit
 */
export function useCreateHabit() {
  return useMutation<Habit, CreateHabitData>(
    (data) => api.createHabit(data),
    {
      onSuccess: (data) => {
        console.log('Habit created successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to create habit:', error);
      },
    }
  );
}

/**
 * Update an existing habit
 */
export function useUpdateHabit() {
  return useMutation<Habit, { id: string; data: UpdateHabitData }>(
    ({ id, data }) => api.updateHabit(id, data),
    {
      onSuccess: (data) => {
        console.log('Habit updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update habit:', error);
      },
    }
  );
}

/**
 * Delete a habit
 */
export function useDeleteHabit() {
  return useMutation<void, string>(
    (id) => api.deleteHabit(id),
    {
      onSuccess: () => {
        console.log('Habit deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete habit:', error);
      },
    }
  );
}

// Habit completion hooks

/**
 * Get habit completions - DISABLED
 */
export function useHabitCompletions(
  habitId: string | null,
  params?: {
    startDate?: string;
    endDate?: string;
    sortBy?: 'completedAt' | 'value';
    sortOrder?: 'asc' | 'desc';
  }
) {
  return {
    data: {
      data: [],
      total: 0,
      page: 1,
      limit: 10
    },
    loading: false,
    error: null,
    nextPage: () => {},
    prevPage: () => {},
    goToPage: () => {},
    changeLimit: () => {},
    refetch: () => Promise.resolve()
  };
}

/**
 * Mark a habit as completed
 */
export function useMarkHabitComplete() {
  return useMutation<HabitCompletion, { habitId: string; data?: MarkHabitCompleteData }>(
    ({ habitId, data }) => api.markHabitComplete(habitId, data),
    {
      onSuccess: (data) => {
        console.log('Habit marked as complete:', data);
      },
      onError: (error) => {
        console.error('Failed to mark habit as complete:', error);
      },
    }
  );
}

/**
 * Unmark a habit completion
 */
export function useUnmarkHabitComplete() {
  return useMutation<void, { habitId: string; completionId: string }>(
    ({ habitId, completionId }) => api.unmarkHabitComplete(habitId, completionId),
    {
      onSuccess: () => {
        console.log('Habit completion removed successfully');
      },
      onError: (error) => {
        console.error('Failed to remove habit completion:', error);
      },
    }
  );
}

// Habit statistics hooks

/**
 * Get habit streak information - DISABLED
 */
export function useHabitStreak(habitId: string | null) {
  return {
    data: {
      habitId: habitId || '',
      currentStreak: 0,
      longestStreak: 0,
      streakStartDate: null,
      streakEndDate: null
    },
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
}

/**
 * Get habit statistics - DISABLED
 */
export function useHabitStats(
  habitId: string | null,
  params?: {
    period?: 'week' | 'month' | 'year' | 'all';
    startDate?: string;
    endDate?: string;
  }
) {
  return {
    data: {
      habitId: habitId || '',
      totalCompletions: 0,
      completionRate: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageValue: 0,
      completionsThisWeek: 0,
      completionsThisMonth: 0,
      completionsThisYear: 0,
      weeklyTrend: 0,
      monthlyTrend: 0
    },
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
}

// Utility hooks

/**
 * Combined hook for habit actions
 */
export function useHabitActions() {
  const markComplete = useMarkHabitComplete();
  const unmarkComplete = useUnmarkHabitComplete();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  return {
    // Mark completion
    markComplete: markComplete.mutate,
    unmarkComplete: unmarkComplete.mutate,

    // Update habit
    update: updateHabit.mutate,

    // Delete habit
    delete: deleteHabit.mutate,

    // Toggle active status
    toggleActive: useCallback(async (id: string, isCurrentlyActive: boolean): Promise<void> => {
      try {
        await updateHabit.mutate({ id, data: { is_active: !isCurrentlyActive } });
        console.log('Habit active status toggled successfully');
      } catch (error) {
        console.error('Failed to toggle habit active status:', error);
        throw error;
      }
    }, [updateHabit.mutate]),

    // Loading states
    isMarking: markComplete.loading,
    isUnmarking: unmarkComplete.loading,
    isUpdating: updateHabit.loading,
    isDeleting: deleteHabit.loading,
  };
}

/**
 * Get active habits only
 */
export function useActiveHabits(params?: {
  category?: string;
  frequency_type?: 'daily' | 'weekly' | 'monthly';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useHabits({
    ...params,
    is_active: true,
  });
}

/**
 * Get daily habits
 */
export function useDailyHabits(params?: {
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useHabits({
    ...params,
    is_active: true,
    frequency_type: 'daily',
  });
}

/**
 * Get habits by category
 */
export function useHabitsByCategory(
  category: string,
  params?: {
    is_active?: boolean;
    frequency_type?: 'daily' | 'weekly' | 'monthly';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  return useHabits({
    ...params,
    category,
  });
}

/**
 * Hook for habit dashboard data
 */
export function useHabitDashboard() {
  const allHabits = useActiveHabits();
  const dailyHabits = useDailyHabits();

  return {
    totalHabits: allHabits.data?.total || 0,
    dailyHabits: dailyHabits.data?.data || [],
    loading: allHabits.loading || dailyHabits.loading,
    error: allHabits.error || dailyHabits.error,
    refetch: useCallback(() => {
      allHabits.refetch();
      dailyHabits.refetch();
    }, [allHabits, dailyHabits]),
  };
}

/**
 * Hook for habit completion tracking
 */
export function useHabitCompletionTracking(habitId: string | null) {
  const habit = useHabit(habitId);
  
  const completions = useHabitCompletions(habitId, {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
  });
  
  const streak = useHabitStreak(habitId);
  const stats = useHabitStats(habitId, { period: 'month' });

  const markComplete = useMarkHabitComplete();
  const unmarkComplete = useUnmarkHabitComplete();

  // Check if habit is completed today (check both camelCase and snake_case)
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = (completions.data?.data as HabitCompletion[])?.some(completion =>
    (completion.completedAt || completion.completed_at || '').startsWith(today)
  ) || false;

  // Get today's completion if exists (check both camelCase and snake_case)
  const todayCompletion = (completions.data?.data as HabitCompletion[])?.find(completion =>
    (completion.completedAt || completion.completed_at || '').startsWith(today)
  );

  return {
    habit: habit.data,
    completions: completions.data?.data || [],
    streak: streak.data,
    stats: stats.data,
    isCompletedToday,
    todayCompletion,
    
    // Actions
    markCompleteToday: useCallback(async (data?: MarkHabitCompleteData): Promise<void> => {
      if (!habitId) {
        throw new Error('Habit ID is required');
      }
      try {
        await markComplete.mutate({ habitId, data });
        await Promise.all([
          completions.refetch(),
          streak.refetch(),
          stats.refetch()
        ]);
      } catch (error) {
        console.error('Failed to mark habit complete:', error);
        throw error;
      }
    }, [habitId, markComplete.mutate, completions.refetch, streak.refetch, stats.refetch]),

    unmarkCompleteToday: useCallback(async (): Promise<void> => {
      if (!habitId || !todayCompletion) {
        throw new Error('Habit ID and today completion are required');
      }
      try {
        await unmarkComplete.mutate({ habitId, completionId: todayCompletion.id });
        await Promise.all([
          completions.refetch(),
          streak.refetch(),
          stats.refetch()
        ]);
      } catch (error) {
        console.error('Failed to unmark habit completion:', error);
        throw error;
      }
    }, [habitId, todayCompletion, unmarkComplete.mutate, completions.refetch, streak.refetch, stats.refetch]),

    // Loading states
    loading: habit.loading || completions.loading || streak.loading || stats.loading,
    isMarking: markComplete.loading || unmarkComplete.loading,

    // Refetch all data
    refetch: useCallback(async () => {
      await Promise.all([
        habit.refetch(),
        completions.refetch(),
        streak.refetch(),
        stats.refetch()
      ]);
    }, [habit.refetch, completions.refetch, streak.refetch, stats.refetch]),
  };
}

/**
 * Hook for bulk habit operations
 */
export function useBulkHabitOperations() {
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  const markComplete = useMarkHabitComplete();

  return {
    bulkMarkComplete: useCallback(async (habitIds: string[], data?: MarkHabitCompleteData): Promise<void> => {
      const promises = habitIds.map(habitId => 
        markComplete.mutate({ habitId, data })
      );
      await Promise.all(promises);
    }, [markComplete.mutate]),

    bulkToggleActive: useCallback(async (habitIds: string[], isActive: boolean): Promise<void> => {
      const promises = habitIds.map(id => 
        updateHabit.mutate({ id, data: { is_active: isActive } })
      );
      await Promise.all(promises);
    }, [updateHabit.mutate]),

    bulkUpdateCategory: useCallback(async (habitIds: string[], category: string): Promise<void> => {
      const promises = habitIds.map(id => 
        updateHabit.mutate({ id, data: { category } })
      );
      await Promise.all(promises);
    }, [updateHabit.mutate]),

    bulkDelete: useCallback(async (habitIds: string[]): Promise<void> => {
      const promises = habitIds.map(id => 
        deleteHabit.mutate(id)
      );
      await Promise.all(promises);
    }, [deleteHabit.mutate]),

    isPerforming: updateHabit.loading || deleteHabit.loading || markComplete.loading,
  };
}

/**
 * Get user's habit statistics overview from API
 */
export function useUserHabitStatistics() {
  return useApi(
    useCallback(() => api.getUserHabitStatistics(), []),
    { immediate: true }
  );
}

/**
 * Get available habit categories from API
 */
export function useHabitCategories() {
  return useApi(
    useCallback(() => api.getHabitCategories(), []),
    { immediate: true }
  );
}

/**
 * Get available frequency types from API
 */
export function useHabitFrequencyTypes() {
  return useApi(
    useCallback(() => api.getHabitFrequencyTypes(), []),
    { immediate: true }
  );
}

/**
 * Get available habit icons - static list (no API needed)
 */
export function useHabitIcons() {
  return {
    data: ['🏃‍♂️', '📚', '💪', '🧘‍♀️', '🎯', '✅', '⭐', '🔥', '🌟', '💎', '🏆', '🎨', '🎵', '🍎', '💤', '🧠'],
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  };
}

/**
 * Hook for habit analytics
 */
export function useHabitAnalytics(period?: 'week' | 'month' | 'year') {
  const habits = useActiveHabits();

  // Calculate overall statistics
  const analytics = React.useMemo(() => {
    const habitsData = (habits.data?.data as Habit[]) || [];
    const totalHabits = habitsData.length;
    
    if (totalHabits === 0) {
      return {
        totalHabits: 0,
        avgCompletionRate: 0,
        avgStreak: 0,
        topStreakHabits: [],
        topCompletionHabits: []
      };
    }

    const avgCompletionRate = habitsData.reduce((sum, habit) => sum + ((habit.totalCompletions ?? habit.total_completions ?? 0) / 30), 0) / totalHabits; // Assuming 30 days
    const totalStreaks = habitsData.reduce((sum, habit) => sum + (habit.currentStreak ?? habit.current_streak ?? 0), 0);
    const avgStreak = totalStreaks / totalHabits;

    // Get habits with highest streaks
    const topStreakHabits = [...habitsData]
      .sort((a, b) => (b.currentStreak ?? b.current_streak ?? 0) - (a.currentStreak ?? a.current_streak ?? 0))
      .slice(0, 5);

    // Get habits with best completion rates
    const topCompletionHabits = [...habitsData]
      .sort((a, b) => (b.totalCompletions ?? b.total_completions ?? 0) - (a.totalCompletions ?? a.total_completions ?? 0))
      .slice(0, 5);

    return {
      totalHabits,
      avgCompletionRate: Math.round(avgCompletionRate * 100) / 100,
      avgStreak: Math.round(avgStreak * 100) / 100,
      topStreakHabits,
      topCompletionHabits,
    };
  }, [habits.data?.data]);

  return {
    ...analytics,
    loading: habits.loading,
    error: habits.error,
    refetch: habits.refetch,
  };
}

/**
 * Hook for fetching individual habit analytics with completion trend and activity distribution
 */
export function useIndividualHabitAnalytics(habitId: string | null, period: 'week' | 'month' | 'year' = 'week') {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAnalytics = React.useCallback(async () => {
    if (!habitId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.getHabitAnalytics(habitId, period);
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch habit analytics');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [habitId, period]);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics
  };
}

/**
 * Hook for fetching habits with their completions for a specific date range (for calendar view)
 */
export function useHabitsWithCompletions(startDate: string, endDate: string) {
  const [data, setData] = React.useState<{
    habits: Habit[];
    completionsByHabitAndDate: Map<string, Set<string>>;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all active habits
      const habitsResponse = await api.getHabits({ is_active: true, limit: 100 });
      const habits = habitsResponse.habits || [];

      // Create a map to store completions: habitId -> Set of completion dates
      const completionsByHabitAndDate = new Map<string, Set<string>>();

      // Fetch completions for each habit in the date range
      await Promise.all(
        habits.map(async (habit: Habit) => {
          try {
            const completionsResponse = await api.getHabitCompletions(habit.id, {
              from_date: startDate,
              to_date: endDate
            });

            const completions = completionsResponse.completions || [];
            const completionDates = new Set(
              completions.map((c: any) => c.completed_date.split('T')[0])
            );

            completionsByHabitAndDate.set(habit.id, completionDates);
          } catch (err) {
            console.error(`Failed to fetch completions for habit ${habit.id}:`, err);
            completionsByHabitAndDate.set(habit.id, new Set());
          }
        })
      );

      setData({ habits, completionsByHabitAndDate });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch habits with completions');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    habits: data?.habits || [],
    completionsByHabitAndDate: data?.completionsByHabitAndDate || new Map(),
    loading,
    error,
    refetch: fetchData
  };
}