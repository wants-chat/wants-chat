/**
 * Hook for managing today's habit completions
 */

import { useState, useEffect, useMemo } from 'react';
import { useHabits, useMarkHabitComplete, useUnmarkHabitComplete, useHabitCompletions } from './useHabits';
import type { Habit, HabitCompletion } from './useHabits';
import { api } from '../../lib/api';

interface TodayHabitsData {
  habits: Habit[];
  completedToday: string[];
  completionsByHabit: Map<string, HabitCompletion>;
  progressByHabit: Map<string, number>; // Track progress values for measurable habits
  loading: boolean;
  error: string | null;
  toggleHabitCompletion: (habitId: string) => Promise<void>;
  updateHabitProgress: (habitId: string, value: number) => Promise<void>;
  isToggling: boolean;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage today's habits and their completion status
 */
export function useTodayHabits(): TodayHabitsData {
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [completionsByHabit, setCompletionsByHabit] = useState<Map<string, HabitCompletion>>(new Map());
  const [progressByHabit, setProgressByHabit] = useState<Map<string, number>>(new Map());
  const [isToggling, setIsToggling] = useState(false);
  
  // Fetch active habits
  const { data: habitsData, loading: habitsLoading, error: habitsError, refetch: refetchHabits } = useHabits({ 
    is_active: true 
  });
  
  // The API returns { data: [...], total, page, limit } after mapping
  const habits = (habitsData?.data || []) as Habit[];
  
  
  // Mutations
  const markComplete = useMarkHabitComplete();
  const unmarkComplete = useUnmarkHabitComplete();
  
  // Get today's date string
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  // Fetch today's completions for all habits
  useEffect(() => {
    const fetchTodayCompletions = async () => {
      if (!habits.length) return;

      const completedIds: string[] = [];
      const completionsMap = new Map<string, HabitCompletion>();

      // For each habit, check if it was completed today using the API client
      const progressMap = new Map<string, number>();

      for (const habit of habits) {
        try {
          // Use the centralized API client to fetch today's completions
          const data = await api.getHabitCompletions(habit.id, {
            from_date: today,
            to_date: today
          });

          const completions = data.completions || [];

          if (completions.length > 0) {
            // Verify the completion actually belongs to this habit (check both camelCase and snake_case)
            const validCompletions = completions.filter((comp: any) =>
              (comp.habitId || comp.habit_id) === habit.id
            );

            if (validCompletions.length > 0) {
              const completion = validCompletions[0];
              completedIds.push(habit.id);
              completionsMap.set(habit.id, completion);

              // Track progress value for measurable habits (backend returns actualValue/actual_value)
              const actualValue = completion.actualValue ?? completion.actual_value;
              if (actualValue !== undefined && actualValue !== null) {
                progressMap.set(habit.id, actualValue);
              }
            }
          }

          // Initialize progress to 0 if not set
          if (!progressMap.has(habit.id)) {
            progressMap.set(habit.id, 0);
          }
        } catch (error) {
          console.error(`Failed to fetch completions for habit ${habit.id}:`, error);
          progressMap.set(habit.id, 0);
        }
      }

      setCompletedToday(completedIds);
      setCompletionsByHabit(completionsMap);
      setProgressByHabit(progressMap);
    };

    fetchTodayCompletions();
  }, [habits, today]);
  
  // Toggle habit completion
  const toggleHabitCompletion = async (habitId: string) => {
    setIsToggling(true);
    try {
      const isCompleted = completedToday.includes(habitId);
      
      if (isCompleted) {
        // Unmark as complete - call backend DELETE endpoint
        const completion = completionsByHabit.get(habitId);
        if (completion && completion.id) {
          await unmarkComplete.mutate({ habitId, completionId: completion.id });
        }

        // Update local state
        setCompletedToday(prev => prev.filter(id => id !== habitId));
        setCompletionsByHabit(prev => {
          const newMap = new Map(prev);
          newMap.delete(habitId);
          return newMap;
        });
      } else {
        // Mark as complete
        await markComplete.mutate({ 
          habitId, 
          data: {
            completed_at: new Date().toISOString()
          }
        });
        
        // Update local state
        setCompletedToday(prev => [...prev, habitId]);
        // Create a mock completion object since mutate doesn't return the result
        const newCompletion: HabitCompletion = {
          id: `temp-${habitId}-${Date.now()}`,
          habitId: habitId,
          userId: '', // Will be filled by backend
          completedAt: new Date().toISOString(),
          completedDate: today,
          createdAt: new Date().toISOString(),
          // Legacy fields for backward compatibility
          habit_id: habitId,
          user_id: '',
          completed_at: new Date().toISOString(),
          completed_date: today,
          created_at: new Date().toISOString()
        };
        setCompletionsByHabit(prev => {
          const newMap = new Map(prev);
          newMap.set(habitId, newCompletion);
          return newMap;
        });
      }
      
      // Refetch habits to update streaks and stats
      await refetchHabits();
    } catch (error) {
      console.error('Failed to toggle habit completion:', error);
      throw error;
    } finally {
      setIsToggling(false);
    }
  };
  
  // Update progress for a measurable habit
  const updateHabitProgress = async (habitId: string, value: number) => {
    setIsToggling(true);
    try {
      const habit = habits.find(h => h.id === habitId);
      const existingCompletion = completionsByHabit.get(habitId);

      // If there's an existing completion for today, we need to update it
      // For now, we'll create/update via the mark complete API with the value
      if (existingCompletion && existingCompletion.id && !existingCompletion.id.startsWith('temp-')) {
        // Update existing completion - unmark and re-mark with new value
        await unmarkComplete.mutate({ habitId, completionId: existingCompletion.id });
      }

      // Mark complete with the new value (backend expects actual_value)
      await markComplete.mutate({
        habitId,
        data: {
          completed_at: new Date().toISOString(),
          actual_value: value
        }
      });

      // Update local state
      setProgressByHabit(prev => {
        const newMap = new Map(prev);
        newMap.set(habitId, value);
        return newMap;
      });

      // If progress reaches target, mark as completed (check both camelCase and snake_case)
      const habitTargetValue = habit?.targetValue ?? habit?.target_value;
      if (habit && habitTargetValue && value >= habitTargetValue) {
        if (!completedToday.includes(habitId)) {
          setCompletedToday(prev => [...prev, habitId]);
        }
      }

      // Create/update completion record in local state
      const newCompletion: HabitCompletion = {
        id: existingCompletion?.id || `temp-${habitId}-${Date.now()}`,
        habitId: habitId,
        userId: '',
        completedAt: new Date().toISOString(),
        completedDate: today,
        actualValue: value,
        createdAt: new Date().toISOString(),
        // Legacy fields for backward compatibility
        habit_id: habitId,
        user_id: '',
        completed_at: new Date().toISOString(),
        completed_date: today,
        actual_value: value,
        created_at: new Date().toISOString()
      };
      setCompletionsByHabit(prev => {
        const newMap = new Map(prev);
        newMap.set(habitId, newCompletion);
        return newMap;
      });

      // Refetch to get updated data from server
      await refetchHabits();
    } catch (error) {
      console.error('Failed to update habit progress:', error);
      throw error;
    } finally {
      setIsToggling(false);
    }
  };

  // Combined refetch function
  const refetch = async () => {
    await refetchHabits();
    // Re-fetch today's completions would go here
  };

  return {
    habits,
    completedToday,
    completionsByHabit,
    progressByHabit,
    loading: habitsLoading || markComplete.loading || unmarkComplete.loading,
    error: habitsError,
    toggleHabitCompletion,
    updateHabitProgress,
    isToggling,
    refetch
  };
}

/**
 * Hook to get completion status for a specific habit today
 */
export function useHabitCompletedToday(habitId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data, loading, error, refetch } = useHabitCompletions(habitId, {
    startDate: today,
    endDate: today
  });
  
  const completions = (data?.data || []) as HabitCompletion[];
  const isCompletedToday = completions.length > 0;
  const todayCompletion = completions[0] || null;
  
  return {
    isCompletedToday,
    todayCompletion,
    loading,
    error,
    refetch
  };
}