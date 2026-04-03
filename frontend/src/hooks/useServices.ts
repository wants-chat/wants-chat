/**
 * Service-specific hooks
 * Convenient hooks for commonly used API calls
 */

import React from 'react';
import { useApi, useMutation, usePaginatedApi } from './useApi';
import {
  healthService,
  fitnessService,
  financeService,
  meditationService,
  travelService,
  notificationService,
  userService,
  aiService,
} from '../services';
import type { Medication } from '../types/health/medications';
import type {
  HealthMetric,
  Prescription,
  AppointmentFormData,
  InsuranceFormData,
  PregnancyFormData,
  PaternalCheckupAppointmentFormData,
  WorkoutLog,
  Expense,
  MeditationSession,
  TravelPlan,
  TravelActivity,
  Accommodation,
  Transportation,
  TravelDocument,
  UserProfile,
  QueryParams,
} from '../services';

import type {
  SeriousConditionFormData,
  QueryParams as SeriousConditionQueryParams,
} from '../types/health/serious-conditions';

// Health Service Hooks
export const useHealthProfile = () => {
  return useApi(() => healthService.getHealthProfile(), {
    refetchOnMount: true,
  });
};

export const useHealthMetrics = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => healthService.getHealthMetrics({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useCreateHealthMetric = () => {
  return useMutation(
    (data: Omit<HealthMetric, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
      healthService.createHealthMetric(data)
  );
};

// Prescription Hooks  
export const usePrescriptions = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => healthService.getPrescriptions({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useCreatePrescription = () => {
  return useMutation(
    (data: Omit<Prescription, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
      healthService.createPrescription(data)
  );
};

export const useUpdatePrescription = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<Prescription> }) =>
      healthService.updatePrescription(id, data)
  );
};

export const useDeletePrescription = () => {
  return useMutation(
    ({ prescriptionId, medicationName }: { prescriptionId: string; medicationName: string }) => 
      healthService.deletePrescription(prescriptionId, medicationName)
  );
};

export const useUpdateIndividualMedication = () => {
  return useMutation(
    ({ prescriptionId, medicationName, medicationData }: { 
      prescriptionId: string; 
      medicationName: string; 
      medicationData: Partial<Medication> 
    }) => 
      healthService.updateIndividualMedication(prescriptionId, medicationName, medicationData)
  );
};

// Insurance Hooks  
export const useInsurance = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => healthService.getInsurance({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useInsuranceById = (id: string | null) => {
  const idRef = React.useRef<string | null>(id);
  idRef.current = id;
  
  const result = useApi(
    React.useCallback(() => {
      const currentId = idRef.current;
      return currentId ? healthService.getInsuranceById(currentId) : Promise.resolve(null);
    }, []),
    {
      enabled: Boolean(id),
      refetchOnMount: true,
    }
  );

  return result;
};

export const useCreateInsurance = () => {
  return useMutation(
    (data: InsuranceFormData) =>
      healthService.createInsurance(data)
  );
};

export const useUpdateInsurance = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<InsuranceFormData> }) =>
      healthService.updateInsurance(id, data)
  );
};

export const useDeleteInsurance = () => {
  return useMutation(
    (id: string) => healthService.deleteInsurance(id)
  );
};

// Pregnancy Hooks  
export const usePregnancyRecords = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => healthService.getPregnancyRecords({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const usePregnancyRecordById = (id: string | null) => {
  const idRef = React.useRef<string | null>(id);
  idRef.current = id;
  
  const result = useApi(
    React.useCallback(() => {
      const currentId = idRef.current;
      return currentId ? healthService.getPregnancyRecordById(currentId) : Promise.resolve(null);
    }, []),
    {
      enabled: Boolean(id),
      refetchOnMount: true,
    }
  );

  return result;
};

export const useCreatePregnancyRecord = () => {
  return useMutation(
    (data: PregnancyFormData) =>
      healthService.createPregnancyRecord(data)
  );
};

export const useUpdatePregnancyRecord = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<PregnancyFormData> }) =>
      healthService.updatePregnancyRecord(id, data)
  );
};

export const useDeletePregnancyRecord = () => {
  return useMutation(
    (id: string) => healthService.deletePregnancyRecord(id)
  );
};

// Paternal Checkup Appointment Hooks  
export const usePaternalCheckupAppointments = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => healthService.getPaternalCheckupAppointments({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const usePaternalCheckupAppointmentById = (id: string | null) => {
  const idRef = React.useRef<string | null>(id);
  idRef.current = id;
  
  const result = useApi(
    React.useCallback(() => {
      const currentId = idRef.current;
      return currentId ? healthService.getPaternalCheckupAppointmentById(currentId) : Promise.resolve(null);
    }, []),
    {
      enabled: Boolean(id),
      refetchOnMount: true,
    }
  );

  return result;
};

export const useCreatePaternalCheckupAppointment = () => {
  return useMutation(
    (data: PaternalCheckupAppointmentFormData) =>
      healthService.createPaternalCheckupAppointment(data)
  );
};

export const useUpdatePaternalCheckupAppointment = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<PaternalCheckupAppointmentFormData> }) =>
      healthService.updatePaternalCheckupAppointment(id, data)
  );
};

export const useDeletePaternalCheckupAppointment = () => {
  return useMutation(
    (id: string) => healthService.deletePaternalCheckupAppointment(id)
  );
};

// Test Results Hooks
export const useTestResults = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => healthService.getTestResults({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useTestResult = (id: string | null) => {
  const idRef = React.useRef<string | null>(id);
  idRef.current = id;
  
  const result = useApi(
    React.useCallback(() => {
      const currentId = idRef.current;
      return currentId ? healthService.getTestResultById(currentId) : Promise.resolve(null);
    }, []),
    {
      refetchOnMount: true,
      enabled: !!id
    }
  );

  // Refetch when ID changes
  const previousIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (id && id !== previousIdRef.current) {
      previousIdRef.current = id;
      result.refetch();
    }
  }, [id, result.refetch]);

  return result;
};

export const useCreateTestResult = () => {
  return useMutation(
    (data: any) => healthService.createTestResult(data)
  );
};

export const useUpdateTestResult = () => {
  return useMutation(
    ({ id, data }: { id: string; data: any }) =>
      healthService.updateTestResult(id, data)
  );
};

export const useDeleteTestResult = () => {
  return useMutation(
    (id: string) => healthService.deleteTestResult(id)
  );
};

// Appointment Hooks
export const useAppointments = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => healthService.getAppointments({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useAppointment = (id: string | null) => {
  return useApi(
    () => id ? healthService.getAppointment(id) : Promise.resolve(null),
    {
      refetchOnMount: true,
      enabled: !!id
    }
  );
};

export const useCreateAppointment = () => {
  return useMutation(
    (data: AppointmentFormData) =>
      healthService.createAppointment(data)
  );
};

export const useUpdateAppointment = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<AppointmentFormData> }) =>
      healthService.updateAppointment(id, data)
  );
};

export const useDeleteAppointment = () => {
  return useMutation(
    (id: string) => healthService.deleteAppointment(id)
  );
};

// Fitness Service Hooks
export const useWorkoutLogs = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => fitnessService.getWorkoutLogs({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useLogWorkout = () => {
  return useMutation(
    (data: Omit<WorkoutLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
      fitnessService.logWorkout(data)
  );
};

export const useFitnessStats = (timeframe?: 'week' | 'month' | 'year' | 'all') => {
  return useApi(() => fitnessService.getFitnessStats(timeframe), {
    refetchOnMount: true,
  });
};

export const useExercises = (params?: { muscleGroup?: string; equipment?: string }) => {
  return useApi(() => fitnessService.getExercises(params), {
    refetchOnMount: true,
  });
};

// Finance Service Hooks
export const useFinancialSummary = () => {
  return useApi(() => financeService.getFinancialSummary(), {
    refetchOnMount: true,
  });
};

export const useExpenses = (params?: QueryParams) => {
  const stableParams = React.useMemo(() => params || {}, [JSON.stringify(params)]);

  const apiFunction = React.useCallback(
    (paginationParams: { page: number; limit: number; [key: string]: any }) =>
      financeService.getExpenses({ ...stableParams, ...paginationParams }),
    [stableParams]
  );

  return usePaginatedApi(
    apiFunction,
    { refetchOnMount: true, retryOnError: false }
  );
};

export const useCreateExpense = () => {
  return useMutation(
    (data: any) => financeService.createExpense(data)
  );
};

export const useUpdateExpense = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<Expense> }) =>
      financeService.updateExpense(id, data)
  );
};

export const useDeleteExpense = () => {
  return useMutation(
    (id: string) => financeService.deleteExpense(id)
  );
};

export const useIncome = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => financeService.getIncome({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useCreateIncome = () => {
  return useMutation(
    (data: any) => financeService.createIncome(data)
  );
};

export const useCreateBudget = () => {
  return useMutation(
    (data: any) => financeService.createBudget(data)
  );
};

export const useUpdateBudget = () => {
  return useMutation(
    ({ id, data }: { id: string; data: any }) =>
      financeService.updateBudget(id, data)
  );
};

export const useDeleteBudget = () => {
  return useMutation(
    (id: string) => financeService.deleteBudget(id)
  );
};

export const useSpendingCategories = () => {
  return useApi(() => financeService.getSpendingCategories(), {
    refetchOnMount: true,
  });
};

export const useBudgets = () => {
  return useApi(() => financeService.getBudgets(), {
    refetchOnMount: true,
  });
};

export const useTransactionAnalytics = (
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom',
  startDate?: string,
  endDate?: string
) => {
  return useApi(() => financeService.getTransactionAnalytics(period, startDate, endDate), {
    refetchOnMount: true,
  });
};

// Meditation Service Hooks
export const useMeditationSessions = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => meditationService.getMeditationSessions({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useCreateMeditationSession = () => {
  return useMutation(
    (data: Omit<MeditationSession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
      meditationService.createMeditationSession(data)
  );
};

export const useMeditationStats = (timeframe?: 'week' | 'month' | 'year' | 'all') => {
  return useApi(() => meditationService.getMeditationStats(timeframe ? { timeframe } : undefined), {
    refetchOnMount: true,
  });
};

export const useMeditationPrograms = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => meditationService.getMeditationPrograms({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useUserPrograms = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => meditationService.getUserPrograms({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useMentalHealthLogs = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => meditationService.getMentalHealthLogs({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

// Travel Service Hooks
export const useTravelPlans = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => travelService.getTravelPlans({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useTravelPlan = (id: string) => {
  return useApi(() => travelService.getTravelPlan(id), {
    enabled: !!id,
    refetchOnMount: true,
  });
};

export const useCreateTravelPlan = () => {
  return useMutation(
    (data: Omit<TravelPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
      travelService.createTravelPlan(data)
  );
};

export const useTravelStats = () => {
  return useApi(() => travelService.getTravelStats(), {
    refetchOnMount: true,
  });
};

export const useDestinations = (params?: { search?: string; country?: string; region?: string }) => {
  return useApi(() => travelService.getDestinations(params), {
    refetchOnMount: true,
  });
};

export const useUpdateTravelPlan = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<TravelPlan> }) =>
      travelService.updateTravelPlan(id, data)
  );
};

export const useDeleteTravelPlan = () => {
  return useMutation(
    (id: string) => travelService.deleteTravelPlan(id)
  );
};

export const useAddActivityToPlan = () => {
  return useMutation(
    ({ planId, activityData }: { planId: string; activityData: Omit<TravelActivity, 'id' | 'planId' | 'createdAt' | 'updatedAt'> }) =>
      travelService.addActivityToPlan(planId, activityData)
  );
};

export const useUpdateActivity = () => {
  return useMutation(
    ({ planId, activityId, activityData }: { planId: string; activityId: string; activityData: Partial<TravelActivity> }) =>
      travelService.updateActivity(planId, activityId, activityData)
  );
};

export const useDeleteActivity = () => {
  return useMutation(
    ({ planId, activityId }: { planId: string; activityId: string }) =>
      travelService.deleteActivity(planId, activityId)
  );
};

export const useAddAccommodationToPlan = () => {
  return useMutation(
    ({ planId, accommodationData }: { planId: string; accommodationData: Omit<Accommodation, 'id' | 'planId' | 'createdAt' | 'updatedAt'> }) =>
      travelService.addAccommodationToPlan(planId, accommodationData)
  );
};

export const useUpdateAccommodation = () => {
  return useMutation(
    ({ planId, accommodationId, accommodationData }: { planId: string; accommodationId: string; accommodationData: Partial<Accommodation> }) =>
      travelService.updateAccommodation(planId, accommodationId, accommodationData)
  );
};

export const useAddTransportationToPlan = () => {
  return useMutation(
    ({ planId, transportationData }: { planId: string; transportationData: Omit<Transportation, 'id' | 'planId' | 'createdAt' | 'updatedAt'> }) =>
      travelService.addTransportationToPlan(planId, transportationData)
  );
};

export const useUpdateTransportation = () => {
  return useMutation(
    ({ planId, transportationId, transportationData }: { planId: string; transportationId: string; transportationData: Partial<Transportation> }) =>
      travelService.updateTransportation(planId, transportationId, transportationData)
  );
};

export const useAddDocumentToPlan = () => {
  return useMutation(
    ({ planId, documentData }: { planId: string; documentData: Omit<TravelDocument, 'id' | 'planId' | 'createdAt' | 'updatedAt'> }) =>
      travelService.addDocumentToPlan(planId, documentData)
  );
};

export const useUpdateDocument = () => {
  return useMutation(
    ({ planId, documentId, documentData }: { planId: string; documentId: string; documentData: Partial<TravelDocument> }) =>
      travelService.updateDocument(planId, documentId, documentData)
  );
};

// Notification Service Hooks
export const useNotifications = (params?: QueryParams) => {
  return usePaginatedApi(
    (paginationParams) => notificationService.getNotifications({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useNotificationSummary = () => {
  return useApi(() => notificationService.getNotificationSummary(), {
    refetchOnMount: true,
  });
};

export const useMarkNotificationRead = () => {
  return useMutation((id: string) => notificationService.markNotificationRead(id));
};

export const useReminders = (params?: QueryParams & { includeCompleted?: boolean; overdue?: boolean }) => {
  return usePaginatedApi(
    (paginationParams) => notificationService.getReminders({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useUpcomingReminders = (hours: number = 24) => {
  return useApi(() => notificationService.getUpcomingReminders(hours), {
    refetchOnMount: true,
  });
};

export const useCreateReminder = () => {
  return useMutation(
    (data: any) => notificationService.createReminder(data)
  );
};

// User Service Hooks
export const useUserProfile = () => {
  return useApi(() => userService.getUserProfile(), {
    refetchOnMount: true,
  });
};

export const useUpdateUserProfile = () => {
  return useMutation(
    (data: Partial<UserProfile>) => userService.updateUserProfile(data)
  );
};

export const useUserStats = () => {
  return useApi(() => userService.getUserStats(), {
    refetchOnMount: true,
  });
};

export const useUserGoals = (params?: { status?: string; category?: string }) => {
  return usePaginatedApi(
    (paginationParams) => userService.getUserGoals({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useCreateUserGoal = () => {
  return useMutation(
    (data: any) => userService.createUserGoal(data)
  );
};

export const useUserAchievements = (params?: { category?: string; rarity?: string }) => {
  return usePaginatedApi(
    (paginationParams) => userService.getUserAchievements({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useConnectedAccounts = () => {
  return useApi(() => userService.getConnectedAccounts(), {
    refetchOnMount: true,
  });
};

// AI Service Hooks
export const useGenerateWorkoutRecommendation = () => {
  return useMutation(
    (preferences: any) => aiService.generateWorkoutRecommendation(preferences)
  );
};

export const useGenerateMealPlan = () => {
  return useMutation(
    (preferences: any) => aiService.generateMealPlan(preferences)
  );
};

export const useGetBudgetAdvice = () => {
  return useMutation(
    (financialData: any) => aiService.getBudgetAdvice(financialData)
  );
};

export const useGenerateTravelItinerary = () => {
  return useMutation(
    (preferences: any) => aiService.generateTravelItinerary(preferences)
  );
};

export const useGenerateMeditationProgram = () => {
  return useMutation(
    (preferences: any) => aiService.generateMeditationProgram(preferences)
  );
};

export const useGetHealthInsights = () => {
  return useMutation(
    (healthData: any) => aiService.getHealthInsights(healthData)
  );
};

export const useChatConversations = () => {
  return usePaginatedApi(
    (paginationParams) => aiService.getChatConversations(paginationParams),
    { refetchOnMount: true }
  );
};

export const useChatConversation = (id: string) => {
  return useApi(() => aiService.getChatConversation(id), {
    enabled: !!id,
    refetchOnMount: true,
  });
};

export const useSendChatMessage = () => {
  return useMutation(
    ({ conversationId, message }: { conversationId: string; message: string }) =>
      aiService.sendChatMessage(conversationId, message)
  );
};

export const useAIUsageStats = () => {
  return useApi(() => aiService.getUsageStats(), {
    refetchOnMount: true,
  });
};

export const useAnalyzeText = () => {
  return useMutation(
    ({ text, analysisType }: { text: string; analysisType: 'sentiment' | 'keywords' | 'summary' | 'all' }) =>
      aiService.analyzeText(text, analysisType)
  );
};

// Serious Conditions Hooks
export const useSeriousConditions = (params?: SeriousConditionQueryParams) => {
  return usePaginatedApi(
    (paginationParams) => healthService.getSeriousConditions({ ...params, ...paginationParams }),
    { refetchOnMount: true }
  );
};

export const useSeriousConditionById = (id: string | null) => {
  const idRef = React.useRef<string | null>(id);
  idRef.current = id;
  
  const result = useApi(
    React.useCallback(() => {
      const currentId = idRef.current;
      return currentId ? healthService.getSeriousConditionById(currentId) : Promise.resolve(null);
    }, []),
    {
      enabled: Boolean(id),
      refetchOnMount: true,
    }
  );

  return result;
};

export const useCreateSeriousCondition = () => {
  return useMutation(
    (data: SeriousConditionFormData) =>
      healthService.createSeriousCondition(data)
  );
};

export const useUpdateSeriousCondition = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<SeriousConditionFormData> }) =>
      healthService.updateSeriousCondition(id, data)
  );
};

export const useDeleteSeriousCondition = () => {
  return useMutation(
    (id: string) => healthService.deleteSeriousCondition(id)
  );
};

// Vital Records Hooks
export const useVitalRecords = (params?: QueryParams) => {
  return useApi(
    () => healthService.getVitalRecords(params),
    { refetchOnMount: true }
  );
};

export const useVitalRecordById = (id: string | null) => {
  const idRef = React.useRef<string | null>(id);
  idRef.current = id;

  const result = useApi(
    React.useCallback(() => {
      const currentId = idRef.current;
      return currentId ? healthService.getVitalRecordById(currentId) : Promise.resolve(null);
    }, []),
    {
      enabled: Boolean(id),
      refetchOnMount: true,
    }
  );

  return result;
};

export const useCreateVitalRecord = () => {
  return useMutation(
    (data: any) => healthService.createVitalRecord(data)
  );
};

export const useUpdateVitalRecord = () => {
  return useMutation(
    ({ id, data }: { id: string; data: any }) =>
      healthService.updateVitalRecord(id, data)
  );
};

export const useDeleteVitalRecord = () => {
  return useMutation(
    (id: string) => healthService.deleteVitalRecord(id)
  );
};

// Export the single-API dashboard hook from its dedicated file
export { useDashboardData } from './useDashboardData';