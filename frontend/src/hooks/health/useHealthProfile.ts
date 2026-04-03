/**
 * Custom hooks for Health Profile management
 * Provides React hooks for CRUD operations and state management
 */

import { useState, useCallback, useMemo } from 'react';
import { useApi, useMutation } from '../useApi';
import { healthService } from '../../services/healthService';
import { HealthProfile } from '../../types/health';

/**
 * Hook to fetch user's health profile
 */
export const useHealthProfile = () => {
  const result = useApi(
    useCallback(async () => {
      try {
        const profile = await healthService.getHealthProfile();
        return profile;
      } catch (error) {
        // If profile doesn't exist (404), return null instead of throwing
        if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
          return null;
        }
        throw error;
      }
    }, []),
    {
      enabled: true,
      refetchOnMount: true, // Always refetch when component mounts
    }
  );

  // Determine if we've completed initial load based on the result state
  const hasCompletedInitialLoad = (result.data !== null) || result.isError || (!result.loading && result.data === null);

  return {
    profile: result.data,
    isLoading: result.loading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
    hasProfile: !!result.data && !result.isError,
    hasCompletedInitialLoad,
  };
};

/**
 * Hook to create a new health profile
 */
export const useCreateHealthProfile = (options?: {
  onSuccess?: (data: HealthProfile, variables: any) => void;
  onError?: (error: string, variables: any) => void;
}) => {
  return useMutation(
    (profileData: any) => healthService.createHealthProfile(profileData),
    {
      onSuccess: (data, variables) => {
        console.log('Health profile created successfully:', data);
        options?.onSuccess?.(data, variables);
      },
      onError: (error, variables) => {
        console.error('Failed to create health profile:', error);
        options?.onError?.(error, variables);
      },
    }
  );
};

/**
 * Hook to update health profile
 */
export const useUpdateHealthProfile = (options?: {
  onSuccess?: (data: HealthProfile, variables: any) => void;
  onError?: (error: string, variables: any) => void;
}) => {
  return useMutation(
    (profileData: Partial<HealthProfile>) => healthService.updateHealthProfile(profileData),
    {
      onSuccess: (data, variables) => {
        console.log('Health profile updated successfully:', data);
        options?.onSuccess?.(data, variables);
      },
      onError: (error, variables) => {
        console.error('Failed to update health profile:', error);
        options?.onError?.(error, variables);
      },
    }
  );
};

/**
 * Interface for health profile form data (matches PersonalMedicalInfoForm structure)
 */
export interface HealthProfileFormData {
  name: string;
  age: string;
  gender: string;
  height: string;
  weight: string;
  bloodType: string;
  allergies: string;
  medications: string;
  emergencyContact: string;
  emergencyCountryCode: string;
  emergencyPhone: string;
  fitnessLevel: string;
  fitnessGoals: string;
}

/**
 * Hook for managing health profile form state with validation
 */
export const useHealthProfileForm = (initialData?: Partial<HealthProfileFormData>) => {
  const [formData, setFormData] = useState<HealthProfileFormData>(() => {
    const defaultData: HealthProfileFormData = {
      name: '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      bloodType: '',
      allergies: '',
      medications: '',
      emergencyContact: '',
      emergencyCountryCode: '+1',
      emergencyPhone: '',
      fitnessLevel: 'moderately_active',
      fitnessGoals: ''
    };

    // Ensure all string fields from initialData are strings, not undefined
    if (initialData) {
      return {
        ...defaultData,
        ...initialData,
        // Ensure string fields are never undefined
        name: initialData.name ?? defaultData.name,
        age: initialData.age ?? defaultData.age,
        gender: initialData.gender ?? defaultData.gender,
        height: initialData.height ?? defaultData.height,
        weight: initialData.weight ?? defaultData.weight,
        bloodType: initialData.bloodType ?? defaultData.bloodType,
        allergies: initialData.allergies ?? defaultData.allergies,
        medications: initialData.medications ?? defaultData.medications,
        emergencyContact: initialData.emergencyContact ?? defaultData.emergencyContact,
        emergencyCountryCode: initialData.emergencyCountryCode ?? defaultData.emergencyCountryCode,
        emergencyPhone: initialData.emergencyPhone ?? defaultData.emergencyPhone,
        fitnessLevel: initialData.fitnessLevel ?? defaultData.fitnessLevel,
        fitnessGoals: initialData.fitnessGoals ?? defaultData.fitnessGoals,
      };
    }

    return defaultData;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof HealthProfileFormData, string>>>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof HealthProfileFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 150) {
      newErrors.age = 'Please enter a valid age';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact name is required';
    }
    
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Emergency contact phone is required';
    }

    // Validate height if provided
    if (formData.height && (parseInt(formData.height) < 50 || parseInt(formData.height) > 300)) {
      newErrors.height = 'Please enter a valid height (50-300 cm)';
    }

    // Validate weight if provided
    if (formData.weight && (parseInt(formData.weight) < 20 || parseInt(formData.weight) > 500)) {
      newErrors.weight = 'Please enter a valid weight (20-500 kg)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    const defaultData: HealthProfileFormData = {
      name: '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      bloodType: '',
      allergies: '',
      medications: '',
      emergencyContact: '',
      emergencyCountryCode: '+1',
      emergencyPhone: '',
      fitnessLevel: 'moderately_active',
      fitnessGoals: ''
    };

    // Ensure all string fields from initialData are strings, not undefined
    const resetData = initialData ? {
      ...defaultData,
      ...initialData,
      // Ensure string fields are never undefined
      name: initialData.name ?? defaultData.name,
      age: initialData.age ?? defaultData.age,
      gender: initialData.gender ?? defaultData.gender,
      height: initialData.height ?? defaultData.height,
      weight: initialData.weight ?? defaultData.weight,
      bloodType: initialData.bloodType ?? defaultData.bloodType,
      allergies: initialData.allergies ?? defaultData.allergies,
      medications: initialData.medications ?? defaultData.medications,
      emergencyContact: initialData.emergencyContact ?? defaultData.emergencyContact,
      emergencyCountryCode: initialData.emergencyCountryCode ?? defaultData.emergencyCountryCode,
      emergencyPhone: initialData.emergencyPhone ?? defaultData.emergencyPhone,
    } : defaultData;

    setFormData(resetData);
    setErrors({});
  }, [initialData]);

  const updateField = useCallback((field: keyof HealthProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    setErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: undefined };
      }
      return prev;
    });
  }, []); // Remove errors dependency to prevent loop

  const setFormDataValues = useCallback((newFormData: Partial<HealthProfileFormData>) => {
    setFormData(prevData => ({
      ...prevData,
      ...newFormData,
      // Ensure all string fields are never undefined
      name: newFormData.name ?? prevData.name,
      age: newFormData.age ?? prevData.age,
      gender: newFormData.gender ?? prevData.gender,
      height: newFormData.height ?? prevData.height,
      weight: newFormData.weight ?? prevData.weight,
      bloodType: newFormData.bloodType ?? prevData.bloodType,
      allergies: newFormData.allergies ?? prevData.allergies,
      medications: newFormData.medications ?? prevData.medications,
      emergencyContact: newFormData.emergencyContact ?? prevData.emergencyContact,
      emergencyCountryCode: newFormData.emergencyCountryCode ?? prevData.emergencyCountryCode,
      emergencyPhone: newFormData.emergencyPhone ?? prevData.emergencyPhone,
      fitnessLevel: newFormData.fitnessLevel ?? prevData.fitnessLevel,
      fitnessGoals: newFormData.fitnessGoals ?? prevData.fitnessGoals,
    }));
    // Clear any existing errors when setting new form data
    setErrors({});
  }, []); // Stable callback, no dependencies

  return {
    formData,
    errors,
    setFormData: setFormDataValues,
    setErrors,
    validateForm,
    resetForm,
    updateField,
    isValid: Object.keys(errors).length === 0,
  } as const;
};

/**
 * Transform form data to API format (matching the exact API schema)
 */
export const transformFormToApi = (formData: HealthProfileFormData) => {
  const apiData: any = {};

  // Only include fields that have values
  if (formData.height) apiData.height_cm = parseInt(formData.height);
  if (formData.weight) apiData.weight_kg = parseInt(formData.weight);
  if (formData.bloodType) apiData.blood_type = formData.bloodType;
  
  // Transform comma-separated strings to arrays
  if (formData.allergies) {
    apiData.allergies = formData.allergies.split(',').map(s => s.trim()).filter(s => s);
  } else {
    apiData.allergies = [];
  }
  
  if (formData.medications) {
    apiData.medications = formData.medications.split(',').map(s => s.trim()).filter(s => s);
  } else {
    apiData.medications = [];
  }
  
  // Add empty medical_conditions array (not in form but required by API)
  apiData.medical_conditions = [];
  
  // Add fitness fields from form data
  apiData.fitness_level = formData.fitnessLevel || "moderately_active";
  
  if (formData.fitnessGoals) {
    apiData.fitness_goals = formData.fitnessGoals.split(',').map(s => s.trim()).filter(s => s);
  } else {
    apiData.fitness_goals = [];
  }
  
  if (formData.emergencyContact && formData.emergencyPhone) {
    apiData.emergency_contact = {
      name: formData.emergencyContact,
      phone: `${formData.emergencyCountryCode} ${formData.emergencyPhone}`
    };
  } else {
    apiData.emergency_contact = {};
  }

  return apiData;
};

/**
 * Transform API data to form format (matching the actual API schema)
 */
export const transformApiToForm = (profile: any): HealthProfileFormData => {
  // Parse emergency contact phone if it exists
  let emergencyCountryCode = '+1';
  let emergencyPhone = '';
  
  if (profile.emergency_contact?.phone) {
    const phoneMatch = profile.emergency_contact.phone.match(/^(\+\d+(?:-\d+)?)\s*(.*)$/);
    if (phoneMatch) {
      emergencyCountryCode = phoneMatch[1];
      emergencyPhone = phoneMatch[2];
    } else {
      emergencyPhone = profile.emergency_contact.phone;
    }
  }

  return {
    name: profile.name || '',
    age: profile.age ? profile.age.toString() : '',
    gender: profile.gender || '',
    height: profile.height_cm ? profile.height_cm.toString() : '',
    weight: profile.weight_kg ? profile.weight_kg.toString() : '',
    bloodType: profile.blood_type || '',
    allergies: Array.isArray(profile.allergies) ? profile.allergies.join(', ') : (profile.allergies || ''),
    medications: Array.isArray(profile.medications) ? profile.medications.join(', ') : (profile.medications || ''),
    emergencyContact: profile.emergency_contact?.name || '',
    emergencyCountryCode,
    emergencyPhone,
    fitnessLevel: profile.fitness_level || 'moderately_active',
    fitnessGoals: Array.isArray(profile.fitness_goals) ? profile.fitness_goals.join(', ') : (profile.fitness_goals || '')
  };
};

/**
 * Hook to check profile completion status
 */
export const useProfileCompletion = () => {
  const { profile, isLoading } = useHealthProfile();
  
  const completionStatus = useMemo(() => {
    if (!profile) {
      return { isComplete: false, completionPercentage: 0, missingFields: [] };
    }

    const requiredFields = ['name', 'age', 'gender'];
    const optionalFields = ['height', 'weight', 'bloodType', 'emergencyContact'];
    
    const completedRequired = requiredFields.filter(field => {
      if (field === 'emergencyContact') {
        return profile.emergencyContact?.name && profile.emergencyContact?.phoneNumber;
      }
      return profile[field as keyof HealthProfile];
    });

    const completedOptional = optionalFields.filter(field => {
      if (field === 'emergencyContact') {
        return profile.emergencyContact?.name && profile.emergencyContact?.phoneNumber;
      }
      return profile[field as keyof HealthProfile];
    });

    const missingRequired = requiredFields.filter(field => !completedRequired.includes(field));
    const totalFields = requiredFields.length + optionalFields.length;
    const completedFields = completedRequired.length + completedOptional.length;
    
    return {
      isComplete: missingRequired.length === 0,
      completionPercentage: Math.round((completedFields / totalFields) * 100),
      missingFields: missingRequired,
      completedRequired: completedRequired.length,
      totalRequired: requiredFields.length,
      completedOptional: completedOptional.length,
      totalOptional: optionalFields.length,
    };
  }, [profile]);

  return {
    ...completionStatus,
    profile,
    isLoading,
  };
};