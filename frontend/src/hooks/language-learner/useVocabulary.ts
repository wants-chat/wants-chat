/**
 * Vocabulary Learning hooks with React Query integration
 * Provides data fetching and mutations for vocabulary management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  languageApiService, 
  VocabularyWord, 
  CreateVocabularyRequest, 
  VocabularyQueryParams,
  PaginatedResponse 
} from '../../services/languageApi';

// ==============================================
// QUERY KEYS
// ==============================================

export const vocabularyKeys = {
  all: ['vocabulary'] as const,
  lists: () => [...vocabularyKeys.all, 'list'] as const,
  list: (filters: VocabularyQueryParams) => [...vocabularyKeys.lists(), filters] as const,
  details: () => [...vocabularyKeys.all, 'detail'] as const,
  detail: (id: string) => [...vocabularyKeys.details(), id] as const,
  byLanguage: (languageCode: string) => [...vocabularyKeys.all, 'language', languageCode] as const,
};

// ==============================================
// QUERY HOOKS
// ==============================================

/**
 * Hook to fetch vocabulary words with filtering and pagination
 */
export function useVocabulary(params?: VocabularyQueryParams) {
  return useQuery({
    queryKey: vocabularyKeys.list(params || {}),
    queryFn: () => languageApiService.getVocabulary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a single vocabulary word by ID
 */
export function useVocabularyWord(id: string) {
  return useQuery({
    queryKey: vocabularyKeys.detail(id),
    queryFn: () => languageApiService.getVocabularyById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch vocabulary by language code
 */
export function useVocabularyByLanguage(languageCode: string, params?: Omit<VocabularyQueryParams, 'language_code'>) {
  const queryParams = { ...params, language_code: languageCode };

  return useQuery({
    queryKey: vocabularyKeys.byLanguage(languageCode),
    queryFn: () => languageApiService.getVocabulary(queryParams),
    enabled: !!languageCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch vocabulary categories
 */
export function useVocabularyCategories(languageCode?: string) {
  return useQuery({
    queryKey: [...vocabularyKeys.all, 'categories', languageCode],
    queryFn: () => languageApiService.getVocabularyCategories(languageCode),
    staleTime: 30 * 60 * 1000, // 30 minutes - categories don't change often
  });
}

// ==============================================
// MUTATION HOOKS
// ==============================================

/**
 * Hook to create new vocabulary word
 */
export function useCreateVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vocabularyData: CreateVocabularyRequest) => 
      languageApiService.createVocabulary(vocabularyData),
    onSuccess: (newWord) => {
      // Invalidate and refetch vocabulary lists
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.lists() });
      
      // Update specific language cache if applicable
      if (newWord.language_code) {
        queryClient.invalidateQueries({ 
          queryKey: vocabularyKeys.byLanguage(newWord.language_code) 
        });
      }

      // Set the new word in cache
      queryClient.setQueryData(vocabularyKeys.detail(newWord.id), newWord);
    },
    onError: (error) => {
      console.error('Failed to create vocabulary word:', error);
    },
  });
}

/**
 * Hook to update vocabulary word
 */
export function useUpdateVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateVocabularyRequest> }) => 
      languageApiService.updateVocabulary(id, data),
    onSuccess: (updatedWord) => {
      // Update the specific word cache
      queryClient.setQueryData(vocabularyKeys.detail(updatedWord.id), updatedWord);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.lists() });
      
      // Update language-specific cache if applicable
      if (updatedWord.language_code) {
        queryClient.invalidateQueries({ 
          queryKey: vocabularyKeys.byLanguage(updatedWord.language_code) 
        });
      }
    },
    onError: (error) => {
      console.error('Failed to update vocabulary word:', error);
    },
  });
}

/**
 * Hook to delete vocabulary word
 */
export function useDeleteVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => languageApiService.deleteVocabulary(id),
    onSuccess: (_, deletedId) => {
      // Remove from all caches
      queryClient.removeQueries({ queryKey: vocabularyKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete vocabulary word:', error);
    },
  });
}

/**
 * Hook to mark vocabulary word as completed/learned
 */
export function useCompleteVocabulary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      languageApiService.completeVocabulary(id, isCompleted),
    onSuccess: (updatedWord) => {
      // Update the specific word cache
      queryClient.setQueryData(vocabularyKeys.detail(updatedWord.id), updatedWord);

      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: vocabularyKeys.lists() });

      // Update language-specific cache if applicable
      if (updatedWord.language_code) {
        queryClient.invalidateQueries({
          queryKey: vocabularyKeys.byLanguage(updatedWord.language_code)
        });
      }
    },
    onError: (error) => {
      console.error('Failed to mark vocabulary word as complete:', error);
    },
  });
}

// ==============================================
// HELPER HOOKS
// ==============================================

/**
 * Hook to get vocabulary statistics
 */
export function useVocabularyStats(languageCode?: string) {
  const { data: vocabulary, isLoading } = useVocabulary({ 
    language_code: languageCode,
    limit: 1000 // Get all for stats calculation
  });

  const stats = React.useMemo(() => {
    if (!vocabulary?.data) return null;

    const words = vocabulary.data;
    const totalWords = words.length;
    const learnedWords = words.filter(word => word.learned).length;
    const reviewedWords = words.filter(word => word.times_reviewed > 0).length;
    
    // Calculate difficulty distribution
    const difficultyDistribution = words.reduce((acc, word) => {
      const difficulty = word.difficulty_level || 5;
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Calculate category distribution
    const categoryDistribution = words.reduce((acc, word) => {
      const category = word.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalWords,
      learnedWords,
      reviewedWords,
      learningRate: totalWords > 0 ? (learnedWords / totalWords) * 100 : 0,
      difficultyDistribution,
      categoryDistribution,
    };
  }, [vocabulary?.data]);

  return {
    stats,
    isLoading,
  };
}

/**
 * Hook to get vocabulary words that need review
 */
export function useVocabularyForReview(languageCode?: string, limit = 20) {
  return useQuery({
    queryKey: [...vocabularyKeys.all, 'review', languageCode, limit],
    queryFn: async () => {
      const response = await languageApiService.getVocabulary({ 
        language_code: languageCode,
        limit: 1000 // Get all for proper filtering
      });
      
      // Filter words that need review (not learned or reviewed more than 24 hours ago)
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const wordsForReview = response.data
        .filter(word => {
          if (word.learned) return false;
          if (!word.last_reviewed) return true;
          return new Date(word.last_reviewed) < oneDayAgo;
        })
        .sort((a, b) => {
          // Priority: never reviewed > oldest reviewed > most errors
          if (!a.last_reviewed && !b.last_reviewed) return 0;
          if (!a.last_reviewed) return -1;
          if (!b.last_reviewed) return 1;
          return new Date(a.last_reviewed).getTime() - new Date(b.last_reviewed).getTime();
        })
        .slice(0, limit);

      return {
        ...response,
        data: wordsForReview,
        total: wordsForReview.length,
      };
    },
    enabled: !!languageCode,
    staleTime: 2 * 60 * 1000, // 2 minutes (fresh data for review)
  });
}

// ==============================================
// PREFETCH UTILITIES
// ==============================================

/**
 * Prefetch vocabulary for better UX
 */
export function usePrefetchVocabulary() {
  const queryClient = useQueryClient();

  const prefetchVocabulary = React.useCallback((params: VocabularyQueryParams) => {
    return queryClient.prefetchQuery({
      queryKey: vocabularyKeys.list(params),
      queryFn: () => languageApiService.getVocabulary(params),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchVocabularyWord = React.useCallback((id: string) => {
    return queryClient.prefetchQuery({
      queryKey: vocabularyKeys.detail(id),
      queryFn: () => languageApiService.getVocabularyById(id),
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchVocabulary,
    prefetchVocabularyWord,
  };
}

import React from 'react';