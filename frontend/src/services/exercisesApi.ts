import { api } from '../lib/api';

// API Response types matching your exercise API structure
export interface ExerciseApiResponse {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'flexibility' | 'strength';
  description: string;
  instructions: string[];
  muscle_groups: string[];
  equipment: string[];
  difficulty: number; // 1-5 scale
  video_url: string;
  image_url: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface PaginatedExercisesResponse {
  data: ExerciseApiResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface GetExercisesParams {
  page?: number;
  limit?: number;
  category?: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: number;
  search?: string;
}

class ExercisesApiService {
  private baseUrl = '/fitness'; // Base path without /api/v1 since it's added by the api client

  async getExercises(params?: GetExercisesParams): Promise<PaginatedExercisesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);
    if (params?.muscle_group) searchParams.append('muscle_group', params.muscle_group);
    if (params?.equipment) searchParams.append('equipment', params.equipment);
    if (params?.difficulty) searchParams.append('difficulty', params.difficulty.toString());
    if (params?.search) searchParams.append('search', params.search);

    const queryString = searchParams.toString();
    const url = `${this.baseUrl}/exercises${queryString ? `?${queryString}` : ''}`;
    
    return await api.request(url);
  }

  async getExerciseById(exerciseId: string): Promise<ExerciseApiResponse> {
    return await api.request(`${this.baseUrl}/exercises/${exerciseId}`);
  }

  // If you plan to allow custom exercises
  async createExercise(data: CreateExerciseRequest): Promise<ExerciseApiResponse> {
    return await api.request(`${this.baseUrl}/exercises`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateExercise(exerciseId: string, data: UpdateExerciseRequest): Promise<ExerciseApiResponse> {
    return await api.request(`${this.baseUrl}/exercises/${exerciseId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteExercise(exerciseId: string): Promise<void> {
    await api.request(`${this.baseUrl}/exercises/${exerciseId}`, {
      method: 'DELETE'
    });
  }
}

// Request types for creating/updating exercises (if needed)
export interface CreateExerciseRequest {
  name: string;
  category: string;
  description: string;
  instructions: string[];
  muscle_groups: string[];
  equipment: string[];
  difficulty: number;
  video_url?: string;
  image_url?: string;
  metadata?: any;
}

export interface UpdateExerciseRequest {
  name?: string;
  category?: string;
  description?: string;
  instructions?: string[];
  muscle_groups?: string[];
  equipment?: string[];
  difficulty?: number;
  video_url?: string;
  image_url?: string;
  metadata?: any;
}

// Transform function to convert API response to frontend ExerciseDBEntry format
export const transformApiToExerciseDBEntry = (apiExercise: ExerciseApiResponse) => {
  // Map difficulty number to text
  const getDifficultyText = (diff: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (diff <= 2) return 'beginner';
    if (diff <= 4) return 'intermediate';
    return 'advanced';
  };

  return {
    id: apiExercise.id,
    name: apiExercise.name,
    category: apiExercise.category as 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sports',
    muscleGroups: apiExercise.muscle_groups || [],
    equipment: apiExercise.equipment?.[0] || 'none', // Take first equipment or default to 'none'
    instructions: apiExercise.instructions.join('\n'), // Join instructions into single string
    difficulty: getDifficultyText(apiExercise.difficulty),
    videoUrl: apiExercise.video_url,
    imageUrl: apiExercise.image_url,
    targetMuscles: apiExercise.muscle_groups || [],
    secondaryMuscles: [], // Could be derived from metadata if available
    steps: apiExercise.instructions || [],
    tips: [], // Could be derived from metadata if available
    description: apiExercise.description
  };
};

export const exercisesApiService = new ExercisesApiService();
export default exercisesApiService;