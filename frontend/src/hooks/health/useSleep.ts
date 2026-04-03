/**
 * Custom hooks for Sleep Tracking management
 * Provides React hooks for CRUD operations and state management
 */

import { useCallback, useState } from 'react';
import { useApi, usePaginatedApi, useMutation } from '../useApi';
import { sleepService } from '../../services/sleepService';
import type {
  SleepLog,
  CreateSleepLogRequest,
  UpdateSleepLogRequest,
  SleepLogQueryParams,
  SleepGoal,
  CreateSleepGoalRequest,
  UpdateSleepGoalRequest,
  SleepGoalProgress,
  SleepAlarm,
  CreateSleepAlarmRequest,
  UpdateSleepAlarmRequest,
  BedtimeReminder,
  CreateBedtimeReminderRequest,
  UpdateBedtimeReminderRequest,
  SleepSummary,
  SleepSummaryQueryParams,
  OptimalWakeTime,
} from '../../types/health/sleep';

// ============================================
// SLEEP LOGS HOOKS
// ============================================

/**
 * Hook to fetch all sleep logs with pagination and filtering
 */
export const useSleepLogs = (params?: SleepLogQueryParams) => {
  const result = usePaginatedApi(
    useCallback((paginationParams) => {
      return sleepService.getSleepLogs({ ...params, ...paginationParams });
    }, [params]),
    {
      initialPage: params?.page || 1,
      initialLimit: params?.limit || 10,
      enabled: true,
    }
  );

  return {
    sleepLogs: result.data?.data || [],
    total: result.data?.total || 0,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    nextPage: result.nextPage,
    prevPage: result.prevPage,
    goToPage: result.goToPage,
    changeLimit: result.changeLimit,
    canGoNext: result.canGoNext,
    canGoPrev: result.canGoPrev,
  };
};

/**
 * Hook to fetch a single sleep log by ID
 */
export const useSleepLog = (id: string) => {
  const result = useApi(
    useCallback(() => sleepService.getSleepLogById(id), [id]),
    {
      enabled: !!id,
    }
  );

  return {
    sleepLog: result.data,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to fetch the latest sleep log
 */
export const useLatestSleepLog = () => {
  const result = useApi(
    useCallback(() => sleepService.getLatestSleepLog(), []),
    {
      enabled: true,
    }
  );

  return {
    latestSleepLog: result.data,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to fetch sleep summary statistics
 */
export const useSleepSummary = (params?: SleepSummaryQueryParams) => {
  const result = useApi(
    useCallback(() => sleepService.getSleepSummary(params), [params]),
    {
      enabled: true,
    }
  );

  return {
    summary: result.data,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to create a new sleep log
 */
export const useCreateSleepLog = (options?: {
  onSuccess?: (data: SleepLog, variables: CreateSleepLogRequest) => void;
  onError?: (error: string, variables: CreateSleepLogRequest) => void;
}) => {
  return useMutation(
    (logData: CreateSleepLogRequest) => sleepService.createSleepLog(logData),
    {
      onSuccess: (data, variables) => {
        console.log('Sleep log created successfully:', data);
        options?.onSuccess?.(data, variables);
      },
      onError: (error, variables) => {
        console.error('Failed to create sleep log:', error);
        options?.onError?.(error, variables);
      },
    }
  );
};

/**
 * Hook to update a sleep log
 */
export const useUpdateSleepLog = (options?: {
  onSuccess?: (data: SleepLog) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateSleepLogRequest }) =>
      sleepService.updateSleepLog(id, data),
    {
      onSuccess: (data) => {
        console.log('Sleep log updated successfully:', data);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to update sleep log:', error);
        options?.onError?.(error);
      },
    }
  );
};

/**
 * Hook to delete a sleep log
 */
export const useDeleteSleepLog = (options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    (id: string) => sleepService.deleteSleepLog(id),
    {
      onSuccess: () => {
        console.log('Sleep log deleted successfully');
        options?.onSuccess?.();
      },
      onError: (error) => {
        console.error('Failed to delete sleep log:', error);
        options?.onError?.(error);
      },
    }
  );
};

// ============================================
// SLEEP GOALS HOOKS
// ============================================

/**
 * Hook to fetch user's sleep goals
 */
export const useSleepGoal = () => {
  const result = useApi(
    useCallback(() => sleepService.getSleepGoal(), []),
    {
      enabled: true,
    }
  );

  return {
    sleepGoal: result.data,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to fetch sleep goal progress
 */
export const useSleepGoalProgress = () => {
  const result = useApi(
    useCallback(() => sleepService.getSleepGoalProgress(), []),
    {
      enabled: true,
    }
  );

  return {
    progress: result.data,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to create or update sleep goals
 */
export const useCreateOrUpdateSleepGoal = (options?: {
  onSuccess?: (data: SleepGoal) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    (goalData: CreateSleepGoalRequest) => sleepService.createOrUpdateSleepGoal(goalData),
    {
      onSuccess: (data) => {
        console.log('Sleep goal saved successfully:', data);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to save sleep goal:', error);
        options?.onError?.(error);
      },
    }
  );
};

// ============================================
// SLEEP ALARMS HOOKS
// ============================================

/**
 * Hook to fetch all sleep alarms
 */
export const useSleepAlarms = () => {
  const result = useApi(
    useCallback(() => sleepService.getSleepAlarms(), []),
    {
      enabled: true,
    }
  );

  return {
    sleepAlarms: result.data || [],
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to fetch a single sleep alarm by ID
 */
export const useSleepAlarm = (id: string) => {
  const result = useApi(
    useCallback(() => sleepService.getSleepAlarmById(id), [id]),
    {
      enabled: !!id,
    }
  );

  return {
    sleepAlarm: result.data,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to create a new sleep alarm
 */
export const useCreateSleepAlarm = (options?: {
  onSuccess?: (data: SleepAlarm) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    (alarmData: CreateSleepAlarmRequest) => sleepService.createSleepAlarm(alarmData),
    {
      onSuccess: (data) => {
        console.log('Sleep alarm created successfully:', data);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to create sleep alarm:', error);
        options?.onError?.(error);
      },
    }
  );
};

/**
 * Hook to update a sleep alarm
 */
export const useUpdateSleepAlarm = (options?: {
  onSuccess?: (data: SleepAlarm) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateSleepAlarmRequest }) =>
      sleepService.updateSleepAlarm(id, data),
    {
      onSuccess: (data) => {
        console.log('Sleep alarm updated successfully:', data);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to update sleep alarm:', error);
        options?.onError?.(error);
      },
    }
  );
};

/**
 * Hook to toggle sleep alarm active status
 */
export const useToggleSleepAlarm = (options?: {
  onSuccess?: (data: SleepAlarm) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    (id: string) => sleepService.toggleSleepAlarm(id),
    {
      onSuccess: (data) => {
        console.log('Sleep alarm toggled successfully:', data);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to toggle sleep alarm:', error);
        options?.onError?.(error);
      },
    }
  );
};

/**
 * Hook to delete a sleep alarm
 */
export const useDeleteSleepAlarm = (options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    (id: string) => sleepService.deleteSleepAlarm(id),
    {
      onSuccess: () => {
        console.log('Sleep alarm deleted successfully');
        options?.onSuccess?.();
      },
      onError: (error) => {
        console.error('Failed to delete sleep alarm:', error);
        options?.onError?.(error);
      },
    }
  );
};

/**
 * Hook to calculate optimal wake time
 */
export const useOptimalWakeTime = () => {
  const [optimalWakeTime, setOptimalWakeTime] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateOptimalWakeTime = useCallback(async (bedtime: string) => {
    if (!bedtime) return null;

    setIsLoading(true);
    setError(null);

    try {
      const result = await sleepService.calculateOptimalWakeTime(bedtime);
      setOptimalWakeTime(result);
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to calculate optimal wake time';
      setError(errorMsg);
      console.error('Failed to calculate optimal wake time:', errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    optimalWakeTime,
    calculateOptimalWakeTime,
    isLoading,
    error,
  };
};

// ============================================
// BEDTIME REMINDERS HOOKS
// ============================================

/**
 * Hook to fetch all bedtime reminders
 */
export const useBedtimeReminders = () => {
  const result = useApi(
    useCallback(() => sleepService.getBedtimeReminders(), []),
    {
      enabled: true,
    }
  );

  return {
    bedtimeReminders: result.data || [],
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to fetch a single bedtime reminder by ID
 */
export const useBedtimeReminder = (id: string) => {
  const result = useApi(
    useCallback(() => sleepService.getBedtimeReminderById(id), [id]),
    {
      enabled: !!id,
    }
  );

  return {
    bedtimeReminder: result.data,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to create a new bedtime reminder
 */
export const useCreateBedtimeReminder = (options?: {
  onSuccess?: (data: BedtimeReminder) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    (reminderData: CreateBedtimeReminderRequest) => sleepService.createBedtimeReminder(reminderData),
    {
      onSuccess: (data) => {
        console.log('Bedtime reminder created successfully:', data);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to create bedtime reminder:', error);
        options?.onError?.(error);
      },
    }
  );
};

/**
 * Hook to update a bedtime reminder
 */
export const useUpdateBedtimeReminder = (options?: {
  onSuccess?: (data: BedtimeReminder) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateBedtimeReminderRequest }) =>
      sleepService.updateBedtimeReminder(id, data),
    {
      onSuccess: (data) => {
        console.log('Bedtime reminder updated successfully:', data);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to update bedtime reminder:', error);
        options?.onError?.(error);
      },
    }
  );
};

/**
 * Hook to toggle bedtime reminder active status
 */
export const useToggleBedtimeReminder = (options?: {
  onSuccess?: (data: BedtimeReminder) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    (id: string) => sleepService.toggleBedtimeReminder(id),
    {
      onSuccess: (data) => {
        console.log('Bedtime reminder toggled successfully:', data);
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        console.error('Failed to toggle bedtime reminder:', error);
        options?.onError?.(error);
      },
    }
  );
};

/**
 * Hook to delete a bedtime reminder
 */
export const useDeleteBedtimeReminder = (options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  return useMutation(
    (id: string) => sleepService.deleteBedtimeReminder(id),
    {
      onSuccess: () => {
        console.log('Bedtime reminder deleted successfully');
        options?.onSuccess?.();
      },
      onError: (error) => {
        console.error('Failed to delete bedtime reminder:', error);
        options?.onError?.(error);
      },
    }
  );
};
