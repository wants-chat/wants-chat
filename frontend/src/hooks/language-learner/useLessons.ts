/**
 * Language Lessons hooks
 * Provides data fetching and mutations for language lessons
 */

import { useState, useEffect, useCallback } from 'react';
import { languageLessonsApiService, Lesson, CreateLessonRequest, UpdateLessonRequest, QueryParams, transformOnboardingToLesson } from '../../services/languageLessonsApi';
import { getErrorMessage } from '../../lib/api';

// Hook return types
export interface UseLessonsReturn {
  lessons: Lesson[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  refetch: () => Promise<void>;
}

export interface UseLessonMutationReturn {
  mutate: (...args: any[]) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch lessons with optional filtering
 */
export function useLessons(params?: QueryParams): UseLessonsReturn {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await languageLessonsApiService.getLessons(params);
      
      setLessons(response.data);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.total_pages);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch lessons:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return {
    lessons,
    loading,
    error,
    total,
    page,
    totalPages,
    refetch: fetchLessons,
  };
}

/**
 * Hook to create a new lesson
 */
export function useCreateLesson(options?: {
  onSuccess?: (lesson: Lesson) => void;
  onError?: (error: string) => void;
}): UseLessonMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (lessonData: CreateLessonRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const newLesson = await languageLessonsApiService.createLesson(lessonData);
      
      options?.onSuccess?.(newLesson);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      options?.onError?.(errorMessage);
      console.error('Failed to create lesson:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    mutate,
    loading,
    error,
  };
}

/**
 * Hook to update a lesson
 */
export function useUpdateLesson(options?: {
  onSuccess?: (lesson: Lesson) => void;
  onError?: (error: string) => void;
}): UseLessonMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string, lessonData: UpdateLessonRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedLesson = await languageLessonsApiService.updateLesson(id, lessonData);
      
      options?.onSuccess?.(updatedLesson);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      options?.onError?.(errorMessage);
      console.error('Failed to update lesson:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    mutate,
    loading,
    error,
  };
}

/**
 * Hook to delete a lesson
 */
export function useDeleteLesson(options?: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}): UseLessonMutationReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await languageLessonsApiService.deleteLesson(id);
      
      options?.onSuccess?.();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      options?.onError?.(errorMessage);
      console.error('Failed to delete lesson:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options]);

  return {
    mutate,
    loading,
    error,
  };
}

/**
 * Hook to get a single lesson by ID
 */
export function useLesson(id: string) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLesson = useCallback(async () => {
    console.log('useLesson fetchLesson called with id:', id);
    if (!id) {
      console.log('useLesson: no id provided, skipping fetch');
      setLoading(false);
      return;
    }
    
    try {
      console.log('useLesson: starting fetch for id:', id);
      setLoading(true);
      setError(null);
      
      const lessonData = await languageLessonsApiService.getLessonById(id);
      console.log('useLesson: received lesson data:', lessonData);
      setLesson(lessonData);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to fetch lesson:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  return {
    lesson,
    loading,
    error,
    refetch: fetchLesson,
  };
}

/**
 * Hook to get lessons by language code
 */
export function useLessonsByLanguage(languageCode: string, params?: Omit<QueryParams, 'language_code'>) {
  return useLessons({ ...params, language_code: languageCode });
}

/**
 * Hook to create a lesson from onboarding data
 */
export function useCreateLessonFromOnboarding(options?: {
  onSuccess?: (lesson: Lesson) => void;
  onError?: (error: string) => void;
}) {
  const createLessonMutation = useCreateLesson(options);

  const createFromOnboarding = useCallback(async (onboardingData: any) => {
    const lessonData = transformOnboardingToLesson(onboardingData);
    await createLessonMutation.mutate(lessonData);
  }, [createLessonMutation]);

  return {
    mutate: createFromOnboarding,
    loading: createLessonMutation.loading,
    error: createLessonMutation.error,
  };
}