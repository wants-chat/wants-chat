// @ts-nocheck
import { api } from '../lib/api';
import { 
  UserFitnessProfile,
  CreateFitnessProfileRequest,
  UpdateFitnessProfileRequest,
  FitnessProfileApiResponse
} from '../types/fitness';

class FitnessProfileApiService {
  private baseUrl = '/fitness';

  async createProfile(data: CreateFitnessProfileRequest): Promise<FitnessProfileApiResponse> {
    return await api.request(`${this.baseUrl}/profile`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getProfile(): Promise<FitnessProfileApiResponse> {
    return await api.request(`${this.baseUrl}/profile`);
  }

  async updateProfile(data: UpdateFitnessProfileRequest): Promise<FitnessProfileApiResponse> {
    return await api.request(`${this.baseUrl}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProfile(): Promise<void> {
    await api.request(`${this.baseUrl}/profile`, {
      method: 'DELETE'
    });
  }
}

// Transform function to convert OnboardingData + additional fields to API format
export const transformOnboardingToApi = (
  onboardingData: {
    gender: 'male' | 'female' | 'other';
    age: number;
    height: number;
    weight: number;
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_fitness';
    targetWeight?: number;
  },
  workoutLocation: 'gym' | 'home' | 'both' = 'gym'
): CreateFitnessProfileRequest => {
  return {
    gender: onboardingData.gender,
    age: onboardingData.age,
    height: onboardingData.height,
    weight: onboardingData.weight,
    activityLevel: onboardingData.activityLevel,
    fitnessGoal: onboardingData.fitnessGoal,
    targetWeight: onboardingData.targetWeight,
    workoutLocation
  };
};

// Transform function to convert API response to UserFitnessProfile
export const transformApiToFitnessProfile = (apiResponse: FitnessProfileApiResponse): UserFitnessProfile => {
  return {
    id: apiResponse.id,
    userId: apiResponse.user_id,
    gender: apiResponse.gender,
    age: apiResponse.age,
    height: apiResponse.height,
    weight: apiResponse.weight,
    activityLevel: apiResponse.activityLevel,
    fitnessGoal: apiResponse.fitnessGoal,
    targetWeight: apiResponse.targetWeight,
    workoutLocation: apiResponse.workoutLocation,
    points: apiResponse.points,
    achievements: apiResponse.achievements,
    createdAt: new Date(apiResponse.created_at),
    updatedAt: new Date(apiResponse.updated_at)
  };
};

// Transform API BMI data to frontend format
export const transformApiBMIData = (apiResponse: FitnessProfileApiResponse) => {
  return {
    value: apiResponse.bmi.value,
    category: apiResponse.bmi.category,
    date: new Date(apiResponse.updated_at)
  };
};

export const fitnessProfileApiService = new FitnessProfileApiService();
export default fitnessProfileApiService;