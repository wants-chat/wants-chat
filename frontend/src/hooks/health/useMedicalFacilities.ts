/**
 * Custom hooks for Medical Facilities management
 * Provides React hooks for CRUD operations and state management
 */

import { useState, useCallback } from 'react';
import { useApi, usePaginatedApi, useMutation } from '../useApi';
import { healthService } from '../../services/healthService';
import { MedicalFacility, MedicalFacilityFormData, MedicalFacilityQueryParams } from '../../types/health';

/**
 * Hook to fetch all medical facilities with pagination and filtering
 */
export const useMedicalFacilities = (params?: MedicalFacilityQueryParams) => {
  const result = usePaginatedApi(
    useCallback((paginationParams) => {
      return healthService.getMedicalFacilities({ ...params, ...paginationParams });
    }, [params]),
    {
      initialPage: params?.page || 1,
      initialLimit: params?.limit || 20,
      enabled: true,
    }
  );

  return {
    facilities: result.data?.data || [],
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
 * Hook to fetch a single medical facility by ID
 */
export const useMedicalFacility = (id: string) => {
  const result = useApi(
    useCallback(() => healthService.getMedicalFacilityById(id), [id]),
    {
      enabled: !!id,
    }
  );

  return {
    facility: result.data,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to create a new medical facility
 */
export const useCreateMedicalFacility = () => {
  return useMutation(
    (facilityData: MedicalFacilityFormData) => healthService.createMedicalFacility(facilityData),
    {
      onSuccess: (data, variables) => {
        console.log('Medical facility created successfully:', data);
      },
      onError: (error, variables) => {
        console.error('Failed to create medical facility:', error);
      },
    }
  );
};

/**
 * Hook to update a medical facility
 */
export const useUpdateMedicalFacility = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<MedicalFacilityFormData> }) => 
      healthService.updateMedicalFacility(id, data),
    {
      onSuccess: (data, variables) => {
        console.log('Medical facility updated successfully:', data);
      },
      onError: (error, variables) => {
        console.error('Failed to update medical facility:', error);
      },
    }
  );
};

/**
 * Hook to delete a medical facility
 */
export const useDeleteMedicalFacility = () => {
  return useMutation(
    (id: string) => healthService.deleteMedicalFacility(id),
    {
      onSuccess: (data, variables) => {
        console.log('Medical facility deleted successfully');
      },
      onError: (error, variables) => {
        console.error('Failed to delete medical facility:', error);
      },
    }
  );
};

/**
 * Hook for managing medical facility form state with validation
 */
export const useMedicalFacilityForm = (initialData?: Partial<MedicalFacilityFormData>) => {
  const [formData, setFormData] = useState<MedicalFacilityFormData>({
    name: '',
    type: 'hospital',
    phone: '',
    address: '',
    hours: '',
    emergencyAvailable: false,
    distance: '',
    specialties: [],
    notes: '',
    website: '',
    insurance: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MedicalFacilityFormData, string>>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof MedicalFacilityFormData, string>> = {};

    if (!formData.name) newErrors.name = 'Facility name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    if (!formData.address) newErrors.address = 'Address is required';
    
    if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
      newErrors.website = 'Invalid website URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      type: 'hospital',
      phone: '',
      address: '',
      hours: '',
      emergencyAvailable: false,
      distance: '',
      specialties: [],
      notes: '',
      website: '',
      insurance: [],
      ...initialData,
    });
    setErrors({});
  }, [initialData]);

  const updateField = useCallback((field: keyof MedicalFacilityFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Helper methods for managing arrays (specialties, insurance)
  const addSpecialty = useCallback((specialty: string) => {
    if (specialty && !formData.specialties?.includes(specialty)) {
      updateField('specialties', [...(formData.specialties || []), specialty]);
    }
  }, [formData.specialties, updateField]);

  const removeSpecialty = useCallback((specialty: string) => {
    updateField('specialties', (formData.specialties || []).filter(s => s !== specialty));
  }, [formData.specialties, updateField]);

  const addInsurance = useCallback((insurance: string) => {
    if (insurance && !formData.insurance?.includes(insurance)) {
      updateField('insurance', [...(formData.insurance || []), insurance]);
    }
  }, [formData.insurance, updateField]);

  const removeInsurance = useCallback((insurance: string) => {
    updateField('insurance', (formData.insurance || []).filter(i => i !== insurance));
  }, [formData.insurance, updateField]);

  return {
    formData,
    errors,
    setFormData,
    setErrors,
    validateForm,
    resetForm,
    updateField,
    addSpecialty,
    removeSpecialty,
    addInsurance,
    removeInsurance,
    isValid: Object.keys(errors).length === 0,
  };
};

/**
 * Hook to get medical facilities by type
 */
export const useMedicalFacilitiesByType = (type: 'hospital' | 'clinic' | 'pharmacy' | 'lab' | 'urgent-care') => {
  return useMedicalFacilities({ type });
};

/**
 * Hook to get emergency-available medical facilities
 */
export const useEmergencyMedicalFacilities = () => {
  return useMedicalFacilities({ emergencyAvailable: true });
};