import { useState, useCallback, useEffect } from 'react';
import { 
  fitnessProfileApiService, 
  transformOnboardingToApi,
  transformApiToFitnessProfile,
  transformApiBMIData
} from '../../services/fitnessProfileApi';
import { 
  UserFitnessProfile, 
  CreateFitnessProfileRequest,
  UpdateFitnessProfileRequest,
  FitnessProfileApiResponse,
  BMIData
} from '../../types/fitness';
import { useToast } from '../../hooks/use-toast';

// Hook to create a fitness profile
export interface UseCreateFitnessProfileOptions {
  onSuccess?: (profile: UserFitnessProfile) => void;
  onError?: (error: any) => void;
}

export const useCreateFitnessProfile = (options?: UseCreateFitnessProfileOptions) => {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const mutate = useCallback(async (data: CreateFitnessProfileRequest) => {
    try {
      setIsPending(true);
      const response = await fitnessProfileApiService.createProfile(data);
      const profile = transformApiToFitnessProfile(response);
      
      toast({
        title: "Profile Created!",
        description: "Your fitness profile has been saved successfully.",
      });
      
      options?.onSuccess?.(profile);
      return response;
    } catch (error) {
      console.error('Failed to create fitness profile:', error);
      
      toast({
        title: "Failed to Create Profile",
        description: "There was an error saving your fitness profile. Please try again.",
        variant: "destructive",
      });
      
      options?.onError?.(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [options, toast]);

  return {
    mutate,
    isPending,
  };
};

// Hook to fetch fitness profile with auto-loading
export const useFitnessProfile = (autoFetch: boolean = true) => {
  const [data, setData] = useState<UserFitnessProfile | null>(null);
  const [bmiData, setBmiData] = useState<BMIData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const { toast } = useToast();

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fitnessProfileApiService.getProfile();
      const profile = transformApiToFitnessProfile(response);
      const bmi = transformApiBMIData(response);
      setData(profile);
      setBmiData(bmi);
      return profile;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch fitness profile';
      setError(err);
      setData(null);
      setBmiData(null);
      // Remove toast from here to prevent dependency issues
      console.error('Fitness profile fetch error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove toast dependency

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch]); // Remove refetch dependency

  return {
    data,
    bmiData,
    isLoading,
    error,
    refetch,
  };
};

// Hook to update fitness profile
export interface UseUpdateFitnessProfileOptions {
  onSuccess?: (profile: UserFitnessProfile) => void;
  onError?: (error: any) => void;
}

export const useUpdateFitnessProfile = (options?: UseUpdateFitnessProfileOptions) => {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const mutate = useCallback(async (data: UpdateFitnessProfileRequest) => {
    try {
      setIsPending(true);
      const response = await fitnessProfileApiService.updateProfile(data);
      const profile = transformApiToFitnessProfile(response);
      
      toast({
        title: "Profile Updated!",
        description: "Your fitness profile has been updated successfully.",
      });
      
      options?.onSuccess?.(profile);
      return response;
    } catch (error) {
      console.error('Failed to update fitness profile:', error);
      
      toast({
        title: "Failed to Update Profile",
        description: "There was an error updating your fitness profile. Please try again.",
        variant: "destructive",
      });
      
      options?.onError?.(error);
      throw error;
    } finally {
      setIsPending(false);
    }
  }, [options, toast]);

  return {
    mutate,
    isPending,
  };
};

// Special hook for creating fitness profile from onboarding data
export interface UseCreateFitnessProfileFromOnboardingOptions {
  onSuccess?: (profile: UserFitnessProfile) => void;
  onError?: (error: any) => void;
}

export const useCreateFitnessProfileFromOnboarding = (options?: UseCreateFitnessProfileFromOnboardingOptions) => {
  const createMutation = useCreateFitnessProfile({
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

  const mutate = useCallback((onboardingData: {
    gender: 'male' | 'female' | 'other';
    age: number;
    height: number;
    weight: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_fitness';
    targetWeight?: number;
  }, workoutLocation: 'gym' | 'home' | 'both' = 'gym') => {
    const apiData = transformOnboardingToApi(onboardingData, workoutLocation);
    return createMutation.mutate(apiData);
  }, [createMutation]);

  return {
    ...createMutation,
    mutate,
  };
};