import { useState, useEffect } from 'react';
import { exercisesApiService, ExerciseApiResponse } from '../../services/exercisesApi';

interface UseExerciseDetailsResult {
  exercise: ExerciseApiResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch exercise details by ID
 * @param exerciseId - The ID of the exercise to fetch
 * @param enabled - Whether to fetch the exercise (default: true)
 */
export const useExerciseDetails = (
  exerciseId: string | null | undefined,
  enabled: boolean = true
): UseExerciseDetailsResult => {
  const [exercise, setExercise] = useState<ExerciseApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseId || !enabled) {
      return;
    }

    const fetchExercise = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await exercisesApiService.getExerciseById(exerciseId);
        setExercise(response);
      } catch (err: any) {
        console.error(`Error fetching exercise ${exerciseId}:`, err);
        setError(err.message || 'Failed to fetch exercise details');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId, enabled]);

  return {
    exercise,
    loading,
    error,
  };
};

/**
 * Hook to fetch multiple exercises by their IDs
 * @param exerciseIds - Array of exercise IDs to fetch
 * @param enabled - Whether to fetch the exercises (default: true)
 */
export const useMultipleExerciseDetails = (
  exerciseIds: (string | null | undefined)[],
  enabled: boolean = true
): {
  exercises: Map<string, ExerciseApiResponse>;
  loading: boolean;
  error: string | null;
} => {
  const [exercises, setExercises] = useState<Map<string, ExerciseApiResponse>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || exerciseIds.length === 0) {
      return;
    }

    const validIds = exerciseIds.filter((id): id is string => !!id);
    if (validIds.length === 0) {
      return;
    }

    const fetchExercises = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all exercises in parallel
        const promises = validIds.map(id => exercisesApiService.getExerciseById(id));
        const results = await Promise.allSettled(promises);

        const exerciseMap = new Map<string, ExerciseApiResponse>();

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            exerciseMap.set(validIds[index], result.value);
          } else {
            console.error(`Error fetching exercise ${validIds[index]}:`, result.reason);
          }
        });

        setExercises(exerciseMap);
      } catch (err: any) {
        console.error('Error fetching exercises:', err);
        setError(err.message || 'Failed to fetch exercise details');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [JSON.stringify(exerciseIds), enabled]);

  return {
    exercises,
    loading,
    error,
  };
};
