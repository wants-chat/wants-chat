import { useCallback } from 'react';
import { useApi, useMutation } from './useApi';
import { mealPlanService } from '../services/mealPlanService';
import { CreateMealPlanDto, MealPlanQueryParams, UpdateMealPlanDto } from '../types/mealPlan';

// Hook to fetch meal plans with pagination and filtering
export function useMealPlans(query?: MealPlanQueryParams) {
  return useApi(
    useCallback(() => mealPlanService.getMealPlans(query), [
      query?.page,
      query?.limit,
      query?.sort_by,
      query?.sort_order,
      query?.plan_type,
      query?.search,
      query?.start_date,
      query?.end_date,
      query?.tags?.join(',')
    ]),
    {
      refetchOnMount: true,
    }
  );
}

// Hook to fetch a specific meal plan
export function useMealPlan(id: string | null) {
  return useApi(
    useCallback(() => mealPlanService.getMealPlan(id!), [id]),
    {
      enabled: !!id,
      refetchOnMount: true,
    }
  );
}

// Hook to get current week's meal plan
export function useCurrentWeekMealPlan() {
  return useApi(
    useCallback(async () => {
      try {
        return await mealPlanService.getCurrentWeekMealPlan();
      } catch (error) {
        console.warn('No meal plan found for current week:', error);
        return null;
      }
    }, []),
    {
      refetchOnMount: true,
    }
  );
}

// Hook to create a meal plan
export function useCreateMealPlan(refetchFn?: () => void) {
  return useMutation(
    (data: CreateMealPlanDto) => mealPlanService.createMealPlan(data),
    {
      onSuccess: (newMealPlan) => {
        console.log('Meal plan created:', newMealPlan);
        if (refetchFn) refetchFn();
      },
    }
  );
}

// Hook to update a meal plan
export function useUpdateMealPlan(refetchFn?: () => void) {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateMealPlanDto }) =>
      mealPlanService.updateMealPlan(id, data),
    {
      onSuccess: (updatedMealPlan) => {
        console.log('Meal plan updated:', updatedMealPlan);
        if (refetchFn) refetchFn();
      },
    }
  );
}

// Hook to delete a meal plan
export function useDeleteMealPlan(refetchFn?: () => void) {
  return useMutation(
    (id: string) => mealPlanService.deleteMealPlan(id),
    {
      onSuccess: () => {
        console.log('Meal plan deleted');
        if (refetchFn) refetchFn();
      },
    }
  );
}

// Hook to generate shopping list from meal plan
export function useGenerateShoppingList() {
  return useMutation(
    (mealPlanId: string) => mealPlanService.generateShoppingListFromMealPlan(mealPlanId)
  );
}

// Hook to create a weekly meal plan for a specific date
export function useCreateWeeklyMealPlan(refetchFn?: () => void) {
  return useMutation(
    ({ startDate, name }: { startDate: Date; name?: string }) =>
      mealPlanService.createWeeklyMealPlan(startDate, name),
    {
      onSuccess: (newMealPlan) => {
        console.log('Weekly meal plan created:', newMealPlan);
        if (refetchFn) refetchFn();
      },
    }
  );
}

// Utility hook that combines multiple meal plan queries for dashboard
export function useMealPlansDashboard() {
  const currentWeek = useCurrentWeekMealPlan();
  const recentPlans = useMealPlans({ limit: 5 });

  const refetchAll = useCallback(() => {
    currentWeek.refetch();
    recentPlans.refetch();
  }, [currentWeek, recentPlans]);

  return {
    currentWeekPlan: currentWeek.data,
    recentPlans: recentPlans.data?.data || [],
    isLoading: currentWeek.loading || recentPlans.loading,
    error: currentWeek.error || recentPlans.error,
    refetch: refetchAll,
    refetchCurrentWeek: currentWeek.refetch,
    refetchRecentPlans: recentPlans.refetch
  };
}