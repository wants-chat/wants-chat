/**
 * Custom hooks for Emergency Contacts management
 * Provides React hooks for CRUD operations and state management
 */

import { useState, useCallback } from 'react';
import { useApi, usePaginatedApi, useMutation } from '../useApi';
import { healthService } from '../../services/healthService';
import { EmergencyContactFormData, EmergencyContactQueryParams } from '../../types/health';

/**
 * Hook to fetch all emergency contacts with pagination and filtering
 */
export const useEmergencyContacts = (params?: EmergencyContactQueryParams) => {
  const result = usePaginatedApi(
    useCallback((paginationParams) => {
      return healthService.getEmergencyContacts({ ...params, ...paginationParams });
    }, [params]),
    {
      initialPage: params?.page || 1,
      initialLimit: params?.limit || 20,
      enabled: true,
    }
  );

  return {
    contacts: result.data?.data || [],
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
 * Hook to fetch a single emergency contact by ID
 */
export const useEmergencyContact = (id: string) => {
  const result = useApi(
    useCallback(() => healthService.getEmergencyContactById(id), [id]),
    {
      enabled: !!id,
    }
  );

  return {
    contact: result.data,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to create a new emergency contact
 */
export const useCreateEmergencyContact = () => {
  return useMutation(
    (contactData: EmergencyContactFormData) => healthService.createEmergencyContact(contactData),
    {
      onSuccess: (data, variables) => {
        console.log('Emergency contact created successfully:', data);
      },
      onError: (error, variables) => {
        console.error('Failed to create emergency contact:', error);
      },
    }
  );
};

/**
 * Hook to update an emergency contact
 */
export const useUpdateEmergencyContact = () => {
  return useMutation(
    ({ id, data }: { id: string; data: Partial<EmergencyContactFormData> }) => 
      healthService.updateEmergencyContact(id, data),
    {
      onSuccess: (data, variables) => {
        console.log('Emergency contact updated successfully:', data);
      },
      onError: (error, variables) => {
        console.error('Failed to update emergency contact:', error);
      },
    }
  );
};

/**
 * Hook to delete an emergency contact
 */
export const useDeleteEmergencyContact = () => {
  return useMutation(
    (id: string) => healthService.deleteEmergencyContact(id),
    {
      onSuccess: (data, variables) => {
        console.log('Emergency contact deleted successfully');
      },
      onError: (error, variables) => {
        console.error('Failed to delete emergency contact:', error);
      },
    }
  );
};

/**
 * Hook to set an emergency contact as primary
 */
export const useSetPrimaryEmergencyContact = () => {
  return useMutation(
    (id: string) => healthService.setPrimaryEmergencyContact(id),
    {
      onSuccess: (data, variables) => {
        console.log('Emergency contact set as primary successfully');
      },
      onError: (error, variables) => {
        console.error('Failed to set primary emergency contact:', error);
      },
    }
  );
};

/**
 * Hook for managing emergency contact form state with validation
 */
export const useEmergencyContactForm = (initialData?: Partial<EmergencyContactFormData>) => {
  const [formData, setFormData] = useState<EmergencyContactFormData>({
    name: '',
    relationship: 'friend',
    phone: '',
    alternatePhone: '',
    email: '',
    address: '',
    isPrimary: false,
    category: 'personal',
    notes: '',
    availability: '',
    specialization: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmergencyContactFormData, string>>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof EmergencyContactFormData, string>> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.alternatePhone && !/^\+?[\d\s()-]+$/.test(formData.alternatePhone)) {
      newErrors.alternatePhone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      relationship: 'friend',
      phone: '',
      alternatePhone: '',
      email: '',
      address: '',
      isPrimary: false,
      category: 'personal',
      notes: '',
      availability: '',
      specialization: '',
      ...initialData,
    });
    setErrors({});
  }, [initialData]);

  const updateField = useCallback((field: keyof EmergencyContactFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  return {
    formData,
    errors,
    setFormData,
    setErrors,
    validateForm,
    resetForm,
    updateField,
    isValid: Object.keys(errors).length === 0,
  };
};

/**
 * Hook to get primary emergency contact
 */
export const usePrimaryEmergencyContact = () => {
  const result = useApi(
    useCallback(() => healthService.getEmergencyContacts({ isPrimary: true, limit: 1 }), []),
    {
      enabled: true,
    }
  );
  
  return {
    primaryContact: result.data?.data?.[0] || null,
    isLoading: result.loading,
    error: result.error,
    refetch: result.refetch,
  };
};

/**
 * Hook to get emergency contacts by category
 */
export const useEmergencyContactsByCategory = (category: 'personal' | 'medical' | 'emergency-service') => {
  return useEmergencyContacts({ category });
};