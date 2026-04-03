/**
 * Stories hooks with React Query integration
 * Provides data fetching and mutations for story management
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  languageApiService, 
  Story, 
  CreateStoryRequest, 
  StoryQueryParams,
  PaginatedResponse 
} from '../../services/languageApi';

// ==============================================
// QUERY KEYS
// ==============================================

export const storyKeys = {
  all: ['stories'] as const,
  lists: () => [...storyKeys.all, 'list'] as const,
  list: (filters: StoryQueryParams) => [...storyKeys.lists(), filters] as const,
  details: () => [...storyKeys.all, 'detail'] as const,
  detail: (id: string) => [...storyKeys.details(), id] as const,
  byLanguage: (languageCode: string) => [...storyKeys.all, 'language', languageCode] as const,
  byLevel: (level: string) => [...storyKeys.all, 'level', level] as const,
  byCategory: (category: string) => [...storyKeys.all, 'category', category] as const,
};

// ==============================================
// QUERY HOOKS
// ==============================================

/**
 * Hook to fetch stories with filtering and pagination
 */
export function useStories(params?: StoryQueryParams) {
  return useQuery({
    queryKey: storyKeys.list(params || {}),
    queryFn: () => languageApiService.getStories(params),
    staleTime: 10 * 60 * 1000, // 10 minutes (stories don't change frequently)
  });
}

/**
 * Hook to fetch a single story by ID
 */
export function useStory(id: string) {
  return useQuery({
    queryKey: storyKeys.detail(id),
    queryFn: () => languageApiService.getStoryById(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to fetch stories by language code
 */
export function useStoriesByLanguage(languageCode: string, params?: Omit<StoryQueryParams, 'language_code'>) {
  const queryParams = { ...params, language_code: languageCode };
  
  return useQuery({
    queryKey: storyKeys.byLanguage(languageCode),
    queryFn: () => languageApiService.getStories(queryParams),
    enabled: !!languageCode,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch stories by difficulty level
 */
export function useStoriesByLevel(level: 'beginner' | 'intermediate' | 'advanced', languageCode?: string) {
  const params: StoryQueryParams = { level };
  if (languageCode) params.language_code = languageCode;

  return useQuery({
    queryKey: storyKeys.byLevel(level),
    queryFn: () => languageApiService.getStories(params),
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook to fetch stories by category
 */
export function useStoriesByCategory(category: string, languageCode?: string) {
  const params: StoryQueryParams = { category };
  if (languageCode) params.language_code = languageCode;

  return useQuery({
    queryKey: storyKeys.byCategory(category),
    queryFn: () => languageApiService.getStories(params),
    staleTime: 10 * 60 * 1000,
  });
}

// ==============================================
// MUTATION HOOKS
// ==============================================

/**
 * Hook to create new story
 */
export function useCreateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storyData: CreateStoryRequest) => 
      languageApiService.createStory(storyData),
    onSuccess: (newStory) => {
      // Invalidate and refetch story lists
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
      
      // Update specific caches
      if (newStory.language_code) {
        queryClient.invalidateQueries({ 
          queryKey: storyKeys.byLanguage(newStory.language_code) 
        });
      }
      
      if (newStory.level) {
        queryClient.invalidateQueries({ 
          queryKey: storyKeys.byLevel(newStory.level) 
        });
      }

      if (newStory.category) {
        queryClient.invalidateQueries({ 
          queryKey: storyKeys.byCategory(newStory.category) 
        });
      }

      // Set the new story in cache
      queryClient.setQueryData(storyKeys.detail(newStory.id), newStory);
    },
    onError: (error) => {
      console.error('Failed to create story:', error);
    },
  });
}

/**
 * Hook to update story
 */
export function useUpdateStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStoryRequest> }) => 
      languageApiService.updateStory(id, data),
    onSuccess: (updatedStory) => {
      // Update the specific story cache
      queryClient.setQueryData(storyKeys.detail(updatedStory.id), updatedStory);
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
      
      // Update specific caches
      if (updatedStory.language_code) {
        queryClient.invalidateQueries({ 
          queryKey: storyKeys.byLanguage(updatedStory.language_code) 
        });
      }
    },
    onError: (error) => {
      console.error('Failed to update story:', error);
    },
  });
}

/**
 * Hook to delete story
 */
export function useDeleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => languageApiService.deleteStory(id),
    onSuccess: (_, deletedId) => {
      // Remove from all caches
      queryClient.removeQueries({ queryKey: storyKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete story:', error);
    },
  });
}

/**
 * Hook to complete a story
 */
export function useCompleteStory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completionRate }: { id: string; completionRate?: number }) => 
      languageApiService.completeStory(id, completionRate),
    onSuccess: (completedStory) => {
      // Update the specific story cache
      queryClient.setQueryData(storyKeys.detail(completedStory.id), completedStory);
      
      // Invalidate lists to show updated completion status
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
      
      if (completedStory.language_code) {
        queryClient.invalidateQueries({ 
          queryKey: storyKeys.byLanguage(completedStory.language_code) 
        });
      }
    },
    onError: (error) => {
      console.error('Failed to complete story:', error);
    },
  });
}

// ==============================================
// HELPER HOOKS
// ==============================================

/**
 * Hook to get story statistics
 */
export function useStoryStats(languageCode?: string) {
  const { data: stories, isLoading } = useStories({ 
    language_code: languageCode,
    limit: 1000 // Get all for stats calculation
  });

  const stats = React.useMemo(() => {
    if (!stories?.data) return null;

    const storyList = stories.data;
    const totalStories = storyList.length;
    const completedStories = storyList.filter(story => story.is_completed).length;
    const inProgressStories = storyList.filter(story => story.completion_rate > 0 && !story.is_completed).length;
    
    // Calculate level distribution
    const levelDistribution = storyList.reduce((acc, story) => {
      acc[story.level] = (acc[story.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate category distribution
    const categoryDistribution = storyList.reduce((acc, story) => {
      acc[story.category] = (acc[story.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average completion rate
    const totalCompletionRate = storyList.reduce((sum, story) => sum + story.completion_rate, 0);
    const avgCompletionRate = totalStories > 0 ? totalCompletionRate / totalStories : 0;

    // Calculate total reading time
    const totalReadingTime = storyList.reduce((sum, story) => sum + story.estimated_time, 0);
    const completedReadingTime = storyList
      .filter(story => story.is_completed)
      .reduce((sum, story) => sum + story.estimated_time, 0);

    return {
      totalStories,
      completedStories,
      inProgressStories,
      completionRate: totalStories > 0 ? (completedStories / totalStories) * 100 : 0,
      avgCompletionRate,
      levelDistribution,
      categoryDistribution,
      totalReadingTime,
      completedReadingTime,
    };
  }, [stories?.data]);

  return {
    stats,
    isLoading,
  };
}

/**
 * Hook to get recommended stories for user
 */
export function useRecommendedStories(languageCode: string, userLevel?: 'beginner' | 'intermediate' | 'advanced', limit = 10) {
  return useQuery({
    queryKey: [...storyKeys.all, 'recommended', languageCode, userLevel, limit],
    queryFn: async () => {
      const params: StoryQueryParams = { 
        language_code: languageCode,
        limit: 50, // Get more stories for better filtering
        is_completed: false, // Only uncompleted stories
      };

      // Filter by user level if provided
      if (userLevel) {
        params.level = userLevel;
      }

      const response = await languageApiService.getStories(params);
      
      // Sort by rating and select top stories
      const recommendedStories = response.data
        .sort((a, b) => {
          // Prioritize highly rated, shorter stories for better engagement
          const scoreA = (a.rating || 0) * 2 - a.difficulty * 0.5 - (a.estimated_time / 60);
          const scoreB = (b.rating || 0) * 2 - b.difficulty * 0.5 - (b.estimated_time / 60);
          return scoreB - scoreA;
        })
        .slice(0, limit);

      return {
        ...response,
        data: recommendedStories,
        total: recommendedStories.length,
      };
    },
    enabled: !!languageCode,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get stories in progress
 */
export function useStoriesInProgress(languageCode?: string) {
  return useQuery({
    queryKey: [...storyKeys.all, 'inProgress', languageCode],
    queryFn: async () => {
      const response = await languageApiService.getStories({ 
        language_code: languageCode,
        is_completed: false,
        limit: 100 
      });
      
      // Filter stories that have been started (completion_rate > 0)
      const inProgressStories = response.data
        .filter(story => story.completion_rate > 0)
        .sort((a, b) => b.completion_rate - a.completion_rate); // Most progressed first

      return {
        ...response,
        data: inProgressStories,
        total: inProgressStories.length,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (more frequent updates for progress)
  });
}

// ==============================================
// PREFETCH UTILITIES
// ==============================================

/**
 * Prefetch stories for better UX
 */
export function usePrefetchStories() {
  const queryClient = useQueryClient();

  const prefetchStories = React.useCallback((params: StoryQueryParams) => {
    return queryClient.prefetchQuery({
      queryKey: storyKeys.list(params),
      queryFn: () => languageApiService.getStories(params),
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchStory = React.useCallback((id: string) => {
    return queryClient.prefetchQuery({
      queryKey: storyKeys.detail(id),
      queryFn: () => languageApiService.getStoryById(id),
      staleTime: 15 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchStories,
    prefetchStory,
  };
}