/**
 * Achievements hooks with React Query integration
 * Provides data fetching for user achievements and badges
 */

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  languageApiService,
  Achievement
} from '../../services/languageApi';

// ==============================================
// QUERY KEYS
// ==============================================

export const achievementKeys = {
  all: ['achievements'] as const,
  users: () => [...achievementKeys.all, 'user'] as const,
  user: (userId: string) => [...achievementKeys.users(), userId] as const,
  unlocked: (userId: string) => [...achievementKeys.user(userId), 'unlocked'] as const,
  inProgress: (userId: string) => [...achievementKeys.user(userId), 'inProgress'] as const,
};

// ==============================================
// QUERY HOOKS
// ==============================================

/**
 * Hook to fetch user's achievements
 */
export function useUserAchievements(userId: string) {
  return useQuery({
    queryKey: achievementKeys.user(userId),
    queryFn: () => languageApiService.getUserAchievements(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get only unlocked achievements
 */
export function useUnlockedAchievements(userId: string) {
  const { data: achievements, ...rest } = useUserAchievements(userId);

  const unlockedAchievements = React.useMemo(() => {
    return achievements?.filter(achievement => achievement.unlocked) || [];
  }, [achievements]);

  return {
    data: unlockedAchievements,
    ...rest,
  };
}

/**
 * Hook to get achievements in progress (not yet unlocked)
 */
export function useInProgressAchievements(userId: string) {
  const { data: achievements, ...rest } = useUserAchievements(userId);

  const inProgressAchievements = React.useMemo(() => {
    return achievements?.filter(achievement => !achievement.unlocked) || [];
  }, [achievements]);

  return {
    data: inProgressAchievements,
    ...rest,
  };
}

// ==============================================
// HELPER HOOKS
// ==============================================

/**
 * Hook to get achievement statistics
 */
export function useAchievementStats(userId: string) {
  const { data: achievements, isLoading } = useUserAchievements(userId);

  const stats = React.useMemo(() => {
    if (!achievements) return null;

    const total = achievements.length;
    const unlocked = achievements.filter(a => a.unlocked).length;
    const inProgress = achievements.filter(a => !a.unlocked && a.progress > 0).length;
    const notStarted = achievements.filter(a => !a.unlocked && a.progress === 0).length;

    // Calculate completion percentage
    const completionRate = total > 0 ? (unlocked / total) * 100 : 0;

    // Group by badge type
    const byType = achievements.reduce((acc, achievement) => {
      const type = achievement.badge_type;
      if (!acc[type]) {
        acc[type] = { total: 0, unlocked: 0 };
      }
      acc[type].total++;
      if (achievement.unlocked) {
        acc[type].unlocked++;
      }
      return acc;
    }, {} as Record<string, { total: number; unlocked: number }>);

    // Recent unlocks (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUnlocks = achievements.filter(a => 
      a.unlocked && 
      a.unlocked_at && 
      new Date(a.unlocked_at) >= thirtyDaysAgo
    );

    // Next achievements to unlock (closest to completion)
    const nextToUnlock = achievements
      .filter(a => !a.unlocked)
      .sort((a, b) => (b.progress / b.target) - (a.progress / a.target))
      .slice(0, 3);

    return {
      total,
      unlocked,
      inProgress,
      notStarted,
      completionRate,
      byType,
      recentUnlocks,
      nextToUnlock,
    };
  }, [achievements]);

  return {
    stats,
    isLoading,
  };
}

/**
 * Hook to get achievement progress for a specific badge type
 */
export function useAchievementProgress(userId: string, badgeType: string) {
  const { data: achievements, isLoading } = useUserAchievements(userId);

  const progress = React.useMemo(() => {
    if (!achievements) return null;

    const typeAchievements = achievements.filter(a => a.badge_type === badgeType);
    
    if (typeAchievements.length === 0) return null;

    const total = typeAchievements.length;
    const unlocked = typeAchievements.filter(a => a.unlocked).length;
    const inProgress = typeAchievements.filter(a => !a.unlocked && a.progress > 0).length;

    // Find the current achievement being worked on
    const currentAchievement = typeAchievements.find(a => !a.unlocked && a.progress > 0);
    
    // Find the next achievement to start
    const nextAchievement = typeAchievements.find(a => !a.unlocked && a.progress === 0);

    return {
      badgeType,
      total,
      unlocked,
      inProgress,
      completionRate: (unlocked / total) * 100,
      currentAchievement,
      nextAchievement,
      allAchievements: typeAchievements,
    };
  }, [achievements, badgeType]);

  return {
    progress,
    isLoading,
  };
}

// ==============================================
// PREFETCH UTILITIES
// ==============================================

/**
 * Prefetch achievements data for better UX
 */
export function usePrefetchAchievements() {
  const queryClient = useQueryClient();

  const prefetchUserAchievements = React.useCallback((userId: string) => {
    return queryClient.prefetchQuery({
      queryKey: achievementKeys.user(userId),
      queryFn: () => languageApiService.getUserAchievements(userId),
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchUserAchievements,
  };
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Calculate if an achievement should show a celebration
 */
export function useAchievementCelebration(userId: string) {
  const { data: achievements } = useUserAchievements(userId);
  const [celebratedAchievements, setCelebratedAchievements] = React.useState<Set<string>>(new Set());

  const newUnlocks = React.useMemo(() => {
    if (!achievements) return [];

    // Find achievements that were recently unlocked but not yet celebrated
    const recentUnlocks = achievements.filter(achievement => {
      if (!achievement.unlocked || !achievement.unlocked_at) return false;
      
      // Check if unlocked in the last 5 minutes and not yet celebrated
      const unlockedAt = new Date(achievement.unlocked_at);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      return unlockedAt >= fiveMinutesAgo && !celebratedAchievements.has(achievement.id);
    });

    return recentUnlocks;
  }, [achievements, celebratedAchievements]);

  const markAsCelebrated = React.useCallback((achievementId: string) => {
    setCelebratedAchievements(prev => new Set([...prev, achievementId]));
  }, []);

  const celebrateAll = React.useCallback(() => {
    if (newUnlocks.length > 0) {
      setCelebratedAchievements(prev => {
        const newSet = new Set(prev);
        newUnlocks.forEach(achievement => newSet.add(achievement.id));
        return newSet;
      });
    }
  }, [newUnlocks]);

  return {
    newUnlocks,
    markAsCelebrated,
    celebrateAll,
    hasNewUnlocks: newUnlocks.length > 0,
  };
}