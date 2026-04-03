import { useState, useEffect, useCallback } from 'react';
import { 
  exercisesApiService, 
  GetExercisesParams, 
  PaginatedExercisesResponse,
  transformApiToExerciseDBEntry
} from '../../services/exercisesApi';

// Frontend types matching the component expectations
export interface ExerciseDBEntry {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sports';
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  imageUrl?: string;
  targetMuscles: string[];
  secondaryMuscles?: string[];
  steps: string[];
  tips?: string[];
  description?: string;
}

interface UseExercisesResult {
  exercises: ExerciseDBEntry[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalExercises: number;
  refetch: () => void;
  fetchExercises: (params?: GetExercisesParams) => Promise<void>;
}

export const useExercises = (
  initialParams?: GetExercisesParams
): UseExercisesResult => {
  const [exercises, setExercises] = useState<ExerciseDBEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalExercises, setTotalExercises] = useState(0);

  const fetchExercises = useCallback(async (params?: GetExercisesParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PaginatedExercisesResponse = await exercisesApiService.getExercises(params);
      
      // Transform API response to frontend format with error handling
      const transformedExercises = response.data.map((exercise, index) => {
        try {
          return transformApiToExerciseDBEntry(exercise);
        } catch (error) {
          console.error(`Error transforming exercise ${index}:`, error, exercise);
          // Return a fallback exercise instead of breaking the whole list
          return {
            id: exercise.id || `fallback-${index}`,
            name: exercise.name || 'Unknown Exercise',
            category: 'strength' as const,
            muscleGroups: exercise.muscle_groups || [],
            equipment: 'none',
            instructions: '',
            difficulty: 'beginner' as const,
            targetMuscles: exercise.muscle_groups || [],
            secondaryMuscles: [],
            steps: exercise.instructions || [],
            tips: [],
            description: exercise.description || ''
          };
        }
      });
      
      setExercises(transformedExercises);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);
      setTotalExercises(response.total);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch exercises';
      setError(errorMessage);
      console.error('Exercises fetch error:', errorMessage, err);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent loops

  const refetch = useCallback(() => {
    fetchExercises(initialParams);
  }, [fetchExercises, initialParams]);

  useEffect(() => {
    fetchExercises(initialParams);
  }, []); // Only run on mount

  return {
    exercises,
    loading,
    error,
    totalPages,
    currentPage,
    totalExercises,
    refetch,
    fetchExercises
  };
};

// Hook for getting exercises by category
export const useExercisesByCategory = (
  category?: string,
  limit?: number
) => {
  const params: GetExercisesParams = {};
  
  if (category && category !== 'all') {
    params.category = category;
  }
  
  if (limit) {
    params.limit = limit;
  }

  return useExercises(params);
};

// Hook for searching exercises
export const useExerciseSearch = (
  searchTerm?: string,
  category?: string
) => {
  const params: GetExercisesParams = {};
  
  if (searchTerm) {
    params.search = searchTerm;
  }
  
  if (category && category !== 'all') {
    params.category = category;
  }

  return useExercises(params);
};