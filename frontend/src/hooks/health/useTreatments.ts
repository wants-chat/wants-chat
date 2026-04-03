/**
 * Custom hooks for Treatment management
 * Provides React hooks for CRUD operations and state management
 */

import { useState, useCallback } from 'react';
import { useApi, usePaginatedApi, useMutation } from '../useApi';
import { healthService } from '../../services/healthService';
import { 
  Treatment, 
  CreateTreatmentRequest, 
  UpdateTreatmentRequest, 
  TreatmentQueryParams, 
  TreatmentType,
  TreatmentFrequency,
  TreatmentPriority,
  TreatmentStatus
} from '../../types/health';

/**
 * Hook to fetch all treatments with pagination and filtering
 */
export const useTreatments = (params?: TreatmentQueryParams) => {
  const result = usePaginatedApi(
    useCallback((paginationParams) => {
      return healthService.getTreatments({ ...params, ...paginationParams });
    }, [params]),
    {
      initialPage: params?.page || 1,
      initialLimit: params?.limit || 20,
      enabled: true,
    }
  );

  return {
    treatments: result.data?.data || [],
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
 * Hook to fetch a single treatment by ID
 */
export const useTreatment = (id: string) => {
  const result = useApi(
    useCallback(() => healthService.getTreatmentById(id), [id]),
    {
      enabled: !!id,
    }
  );

  return {
    treatment: result.data,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to create a new treatment
 */
export const useCreateTreatment = (options?: {
  onSuccess?: (data: Treatment, variables: CreateTreatmentRequest) => void;
  onError?: (error: string, variables: CreateTreatmentRequest) => void;
}) => {
  return useMutation(
    (treatmentData: CreateTreatmentRequest) => healthService.createTreatment(treatmentData),
    {
      onSuccess: (data, variables) => {
        console.log('Treatment created successfully:', data);
        options?.onSuccess?.(data, variables);
      },
      onError: (error, variables) => {
        console.error('Failed to create treatment:', error);
        options?.onError?.(error, variables);
      },
    }
  );
};

/**
 * Hook to update a treatment
 */
export const useUpdateTreatment = () => {
  return useMutation(
    ({ id, data }: { id: string; data: UpdateTreatmentRequest }) => 
      healthService.updateTreatment(id, data),
    {
      onSuccess: (data, variables) => {
        console.log('Treatment updated successfully:', data);
      },
      onError: (error, variables) => {
        console.error('Failed to update treatment:', error);
      },
    }
  );
};

/**
 * Hook to delete a treatment
 */
export const useDeleteTreatment = () => {
  return useMutation(
    (id: string) => healthService.deleteTreatment(id),
    {
      onSuccess: (data, variables) => {
        console.log('Treatment deleted successfully');
      },
      onError: (error, variables) => {
        console.error('Failed to delete treatment:', error);
      },
    }
  );
};

/**
 * Hook to update treatment status
 */
export const useUpdateTreatmentStatus = () => {
  return useMutation(
    ({ id, status }: { id: string; status: TreatmentStatus }) => 
      healthService.updateTreatmentStatus(id, status),
    {
      onSuccess: (data, variables) => {
        console.log('Treatment status updated successfully:', data);
      },
      onError: (error, variables) => {
        console.error('Failed to update treatment status:', error);
      },
    }
  );
};

/**
 * Hook to get upcoming treatments
 */
export const useUpcomingTreatments = (limit: number = 5) => {
  const result = useApi(
    useCallback(() => healthService.getUpcomingTreatments(limit), [limit]),
    {
      enabled: true,
    }
  );

  return {
    upcomingTreatments: result.data || [],
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Interface for treatment form data (matches AddTreatment component structure)
 */
export interface TreatmentFormData {
  name: string;
  type: TreatmentType;
  frequency: TreatmentFrequency;
  startDate: string;
  endDate: string;
  doctor: string;
  location: string;
  duration: string;
  dosage: string;
  instructions: string;
  priority: TreatmentPriority;
  reminder: boolean;
  reminderTime: string;
  notes: string;
  sideEffects: string[];
  cost: string;
  insurance: string;
}

/**
 * Hook for managing treatment form state with validation
 */
export const useTreatmentForm = (initialData?: Partial<TreatmentFormData>) => {
  const [formData, setFormData] = useState<TreatmentFormData>(() => {
    const defaultData: TreatmentFormData = {
      name: '',
      type: 'medication',
      frequency: 'daily',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      doctor: '',
      location: '',
      duration: '',
      dosage: '',
      instructions: '',
      priority: 'medium',
      reminder: true,
      reminderTime: '30',
      notes: '',
      sideEffects: [],
      cost: '',
      insurance: '',
    };

    // Ensure all string fields from initialData are strings, not undefined
    if (initialData) {
      return {
        ...defaultData,
        ...initialData,
        // Ensure string fields are never undefined
        name: initialData.name ?? defaultData.name,
        endDate: initialData.endDate ?? defaultData.endDate,
        duration: initialData.duration ?? defaultData.duration,
        dosage: initialData.dosage ?? defaultData.dosage,
        instructions: initialData.instructions ?? defaultData.instructions,
        reminderTime: initialData.reminderTime ?? defaultData.reminderTime,
        notes: initialData.notes ?? defaultData.notes,
        cost: initialData.cost ?? defaultData.cost,
        insurance: initialData.insurance ?? defaultData.insurance,
        sideEffects: initialData.sideEffects ?? defaultData.sideEffects,
      };
    }

    return defaultData;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TreatmentFormData, string>>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof TreatmentFormData, string>> = {};

    if (!formData.name) newErrors.name = 'Treatment name is required';
    if (!formData.doctor) newErrors.doctor = 'Doctor/Provider name is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    
    if (formData.type === 'medication' && !formData.dosage) {
      newErrors.dosage = 'Dosage is required for medications';
    }

    if (formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Validate cost format if provided
    if (formData.cost && !/^\$?\d*\.?\d*$/.test(formData.cost.replace(/[,$]/g, ''))) {
      newErrors.cost = 'Invalid cost format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    const defaultData: TreatmentFormData = {
      name: '',
      type: 'medication',
      frequency: 'daily',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      doctor: '',
      location: '',
      duration: '',
      dosage: '',
      instructions: '',
      priority: 'medium',
      reminder: true,
      reminderTime: '30',
      notes: '',
      sideEffects: [],
      cost: '',
      insurance: '',
    };

    // Ensure all string fields from initialData are strings, not undefined
    const resetData = initialData ? {
      ...defaultData,
      ...initialData,
      // Ensure string fields are never undefined
      name: initialData.name ?? defaultData.name,
      endDate: initialData.endDate ?? defaultData.endDate,
      duration: initialData.duration ?? defaultData.duration,
      dosage: initialData.dosage ?? defaultData.dosage,
      instructions: initialData.instructions ?? defaultData.instructions,
      reminderTime: initialData.reminderTime ?? defaultData.reminderTime,
      notes: initialData.notes ?? defaultData.notes,
      cost: initialData.cost ?? defaultData.cost,
      insurance: initialData.insurance ?? defaultData.insurance,
      sideEffects: initialData.sideEffects ?? defaultData.sideEffects,
    } : defaultData;

    setFormData(resetData);
    setErrors({});
  }, [initialData]);

  const updateField = useCallback((field: keyof TreatmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const addSideEffect = useCallback((sideEffect: string) => {
    if (sideEffect && !formData.sideEffects.includes(sideEffect)) {
      setFormData(prev => ({
        ...prev,
        sideEffects: [...prev.sideEffects, sideEffect]
      }));
    }
  }, [formData.sideEffects]);

  const removeSideEffect = useCallback((sideEffect: string) => {
    setFormData(prev => ({
      ...prev,
      sideEffects: prev.sideEffects.filter(effect => effect !== sideEffect)
    }));
  }, []);

  const setFormDataValues = useCallback((newFormData: Partial<TreatmentFormData>) => {
    setFormData(prevData => ({
      ...prevData,
      ...newFormData,
      // Ensure all string fields are never undefined
      name: newFormData.name ?? prevData.name,
      endDate: newFormData.endDate ?? prevData.endDate,
      duration: newFormData.duration ?? prevData.duration,
      dosage: newFormData.dosage ?? prevData.dosage,
      instructions: newFormData.instructions ?? prevData.instructions,
      reminderTime: newFormData.reminderTime ?? prevData.reminderTime,
      notes: newFormData.notes ?? prevData.notes,
      cost: newFormData.cost ?? prevData.cost,
      insurance: newFormData.insurance ?? prevData.insurance,
      sideEffects: newFormData.sideEffects ?? prevData.sideEffects,
    }));
    // Clear any existing errors when setting new form data
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    setFormData: setFormDataValues,
    setErrors,
    validateForm,
    resetForm,
    updateField,
    addSideEffect,
    removeSideEffect,
    isValid: Object.keys(errors).length === 0,
  } as const;
};

/**
 * Hook to get treatments by type
 */
export const useTreatmentsByType = (type: TreatmentType) => {
  return useTreatments({ type });
};

/**
 * Hook to get treatments by status
 */
export const useTreatmentsByStatus = (status: TreatmentStatus) => {
  return useTreatments({ status });
};

/**
 * Hook to get treatments by priority
 */
export const useTreatmentsByPriority = (priority: TreatmentPriority) => {
  return useTreatments({ priority });
};

/**
 * Hook to get active treatments (scheduled or active status)
 */
export const useActiveTreatments = () => {
  const scheduledTreatments = useTreatmentsByStatus('scheduled');
  const activeTreatments = useTreatmentsByStatus('active');
  
  return {
    treatments: [...scheduledTreatments.treatments, ...activeTreatments.treatments],
    isLoading: scheduledTreatments.isLoading || activeTreatments.isLoading,
    error: scheduledTreatments.error || activeTreatments.error,
    refetch: () => {
      scheduledTreatments.refetch();
      activeTreatments.refetch();
    }
  };
};

/**
 * Hook to get treatment statistics
 */
export const useTreatmentStats = () => {
  const allTreatments = useTreatments();
  
  const stats = useCallback(() => {
    if (!allTreatments.treatments.length) {
      return {
        total: 0,
        scheduled: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        byType: {},
        byPriority: {},
      };
    }

    const treatments = allTreatments.treatments;
    const byStatus = treatments.reduce((acc, treatment) => {
      acc[treatment.status] = (acc[treatment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = treatments.reduce((acc, treatment) => {
      acc[treatment.type] = (acc[treatment.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = treatments.reduce((acc, treatment) => {
      acc[treatment.priority] = (acc[treatment.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: treatments.length,
      scheduled: byStatus.scheduled || 0,
      active: byStatus.active || 0,
      completed: byStatus.completed || 0,
      cancelled: byStatus.cancelled || 0,
      paused: byStatus.paused || 0,
      byType,
      byPriority,
    };
  }, [allTreatments.treatments]);

  return {
    stats: stats(),
    isLoading: allTreatments.isLoading,
    error: allTreatments.error,
    refetch: allTreatments.refetch,
  };
};