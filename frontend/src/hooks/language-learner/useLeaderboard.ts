/**
 * Leaderboard hooks with React Query integration
 * Provides data fetching for leaderboard and ranking functionality
 */

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  languageApiService, 
  LeaderboardEntry, 
  LeaderboardQueryParams 
} from '../../services/languageApi';

// ==============================================
// QUERY KEYS
// ==============================================

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  global: (params: LeaderboardQueryParams) => [...leaderboardKeys.all, 'global', params] as const,
  user: (languageCode?: string) => [...leaderboardKeys.all, 'user', languageCode] as const,
  byLanguage: (languageCode: string) => [...leaderboardKeys.all, 'language', languageCode] as const,
  byPeriod: (period: string) => [...leaderboardKeys.all, 'period', period] as const,
};

// ==============================================
// QUERY HOOKS
// ==============================================

/**
 * Hook to fetch global leaderboard
 */
export function useGlobalLeaderboard(params?: LeaderboardQueryParams) {
  return useQuery({
    queryKey: leaderboardKeys.global(params || {}),
    queryFn: () => languageApiService.getGlobalLeaderboard(params),
    staleTime: 5 * 60 * 1000, // 5 minutes (leaderboard doesn't change frequently)
  });
}

/**
 * Hook to fetch user's leaderboard position
 */
export function useUserLeaderboardPosition(languageCode?: string) {
  return useQuery({
    queryKey: leaderboardKeys.user(languageCode),
    queryFn: () => languageApiService.getUserLeaderboardPosition(languageCode),
    staleTime: 2 * 60 * 1000, // 2 minutes (user position might change more frequently)
  });
}

/**
 * Hook to fetch leaderboard by specific language
 */
export function useLeaderboardByLanguage(languageCode: string, params?: Omit<LeaderboardQueryParams, 'language_code'>) {
  const queryParams = { ...params, language_code: languageCode };
  
  return useQuery({
    queryKey: leaderboardKeys.byLanguage(languageCode),
    queryFn: () => languageApiService.getGlobalLeaderboard(queryParams),
    enabled: !!languageCode,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch leaderboard by time period
 */
export function useLeaderboardByPeriod(
  period: 'daily' | 'weekly' | 'monthly' | 'all_time',
  languageCode?: string,
  limit = 50
) {
  const params: LeaderboardQueryParams = { period, limit };
  if (languageCode) params.language_code = languageCode;

  return useQuery({
    queryKey: leaderboardKeys.byPeriod(period),
    queryFn: () => languageApiService.getGlobalLeaderboard(params),
    staleTime: period === 'daily' ? 60 * 1000 : 5 * 60 * 1000, // Daily updates more frequently
  });
}

/**
 * Hook to get top performers in different categories
 */
export function useTopPerformers(languageCode?: string) {
  return useQuery({
    queryKey: [...leaderboardKeys.all, 'topPerformers', languageCode],
    queryFn: async () => {
      const [weeklyTop, monthlyTop, allTimeTop] = await Promise.all([
        languageApiService.getGlobalLeaderboard({ 
          language_code: languageCode, 
          period: 'weekly', 
          limit: 10 
        }),
        languageApiService.getGlobalLeaderboard({ 
          language_code: languageCode, 
          period: 'monthly', 
          limit: 10 
        }),
        languageApiService.getGlobalLeaderboard({ 
          language_code: languageCode, 
          period: 'all_time', 
          limit: 10 
        })
      ]);

      return {
        weekly: weeklyTop.data,
        monthly: monthlyTop.data,
        allTime: allTimeTop.data,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ==============================================
// HELPER HOOKS
// ==============================================

/**
 * Hook to get leaderboard statistics and insights
 */
export function useLeaderboardStats(languageCode?: string) {
  const { data: globalLeaderboard } = useGlobalLeaderboard({ 
    language_code: languageCode, 
    limit: 100 
  });
  const { data: userPosition } = useUserLeaderboardPosition(languageCode);

  const stats = React.useMemo(() => {
    if (!globalLeaderboard?.data || !userPosition) return null;

    const leaderboard = globalLeaderboard.data;
    const totalUsers = globalLeaderboard.total;
    
    // Calculate user percentile
    const userRank = userPosition.rank_position || leaderboard.findIndex(entry => entry.user_id === userPosition.user_id) + 1;
    const percentile = totalUsers > 0 ? ((totalUsers - userRank + 1) / totalUsers) * 100 : 0;

    // XP distribution analysis
    const xpValues = leaderboard.map(entry => entry.total_xp).filter(xp => xp > 0);
    const avgXp = xpValues.length > 0 ? xpValues.reduce((sum, xp) => sum + xp, 0) / xpValues.length : 0;
    const maxXp = Math.max(...xpValues, 0);
    const minXp = Math.min(...xpValues.filter(xp => xp > 0), 0);

    // Streak analysis
    const streakValues = leaderboard.map(entry => entry.current_streak).filter(streak => streak > 0);
    const avgStreak = streakValues.length > 0 ? streakValues.reduce((sum, streak) => sum + streak, 0) / streakValues.length : 0;
    const maxStreak = Math.max(...streakValues, 0);

    // User vs average comparison
    const userVsAvg = {
      xpDifference: userPosition.total_xp - avgXp,
      streakDifference: userPosition.current_streak - avgStreak,
      lessonsCompletedDifference: userPosition.lessons_completed - (leaderboard.reduce((sum, entry) => sum + entry.lessons_completed, 0) / leaderboard.length),
    };

    return {
      userRank,
      totalUsers,
      percentile: Math.round(percentile * 100) / 100,
      xpStats: {
        average: Math.round(avgXp),
        max: maxXp,
        min: minXp,
        userXp: userPosition.total_xp,
      },
      streakStats: {
        average: Math.round(avgStreak * 100) / 100,
        max: maxStreak,
        userStreak: userPosition.current_streak,
      },
      userVsAverage: {
        xpDifference: Math.round(userVsAvg.xpDifference),
        streakDifference: Math.round(userVsAvg.streakDifference * 100) / 100,
        lessonsCompletedDifference: Math.round(userVsAvg.lessonsCompletedDifference * 100) / 100,
      },
    };
  }, [globalLeaderboard, userPosition]);

  return {
    stats,
    isLoading: !globalLeaderboard || !userPosition,
  };
}

/**
 * Hook to get user's rank progression over time
 */
export function useUserRankProgression(languageCode?: string) {
  return useQuery({
    queryKey: [...leaderboardKeys.all, 'rankProgression', languageCode],
    queryFn: async () => {
      // Get user position for different time periods
      const [weeklyPos, monthlyPos, allTimePos] = await Promise.all([
        languageApiService.getGlobalLeaderboard({ 
          language_code: languageCode, 
          period: 'weekly', 
          limit: 1000 
        }).then(response => {
          const userPos = languageApiService.getUserLeaderboardPosition(languageCode);
          return userPos;
        }),
        languageApiService.getGlobalLeaderboard({ 
          language_code: languageCode, 
          period: 'monthly', 
          limit: 1000 
        }).then(response => {
          const userPos = languageApiService.getUserLeaderboardPosition(languageCode);
          return userPos;
        }),
        languageApiService.getUserLeaderboardPosition(languageCode)
      ]);

      return {
        weekly: await weeklyPos,
        monthly: await monthlyPos,
        allTime: await allTimePos,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get nearby users in the leaderboard (users around current user's rank)
 */
export function useNearbyLeaderboard(languageCode?: string, range = 5) {
  const { data: userPosition } = useUserLeaderboardPosition(languageCode);
  
  return useQuery({
    queryKey: [...leaderboardKeys.all, 'nearby', languageCode, range],
    queryFn: async () => {
      if (!userPosition?.rank_position) return { data: [], total: 0 };

      const userRank = userPosition.rank_position;
      const startRank = Math.max(1, userRank - range);
      const endRank = userRank + range;
      
      // Calculate page and limit to get the range we need
      const page = Math.ceil(startRank / 10);
      const limit = (endRank - startRank + 1) * 2; // Get more to ensure we have enough

      const response = await languageApiService.getGlobalLeaderboard({
        language_code: languageCode,
        page,
        limit,
      });

      // Filter to get only the users in our desired range
      const nearbyUsers = response.data.filter(user => {
        const rank = user.rank || user.rank_position || 0;
        return rank >= startRank && rank <= endRank;
      });

      return {
        data: nearbyUsers,
        total: nearbyUsers.length,
        userRank,
        range: { start: startRank, end: endRank }
      };
    },
    enabled: !!userPosition?.rank_position,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get achievement-based leaderboards
 */
export function useAchievementLeaderboards(languageCode?: string) {
  return useQuery({
    queryKey: [...leaderboardKeys.all, 'achievements', languageCode],
    queryFn: async () => {
      const response = await languageApiService.getGlobalLeaderboard({
        language_code: languageCode,
        limit: 100
      });

      const leaderboard = response.data;

      // Create different achievement-based leaderboards
      const streakLeaders = [...leaderboard]
        .sort((a, b) => b.current_streak - a.current_streak)
        .slice(0, 10);

      const bestStreakLeaders = [...leaderboard]
        .sort((a, b) => b.best_streak - a.best_streak)
        .slice(0, 10);

      const lessonLeaders = [...leaderboard]
        .sort((a, b) => b.lessons_completed - a.lessons_completed)
        .slice(0, 10);

      const achievementLeaders = [...leaderboard]
        .sort((a, b) => b.achievements_count - a.achievements_count)
        .slice(0, 10);

      return {
        streakLeaders,
        bestStreakLeaders,
        lessonLeaders,
        achievementLeaders,
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ==============================================
// PREFETCH UTILITIES
// ==============================================

/**
 * Prefetch leaderboard data for better UX
 */
export function usePrefetchLeaderboard() {
  const queryClient = useQueryClient();

  const prefetchGlobalLeaderboard = React.useCallback((params: LeaderboardQueryParams) => {
    return queryClient.prefetchQuery({
      queryKey: leaderboardKeys.global(params),
      queryFn: () => languageApiService.getGlobalLeaderboard(params),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchUserPosition = React.useCallback((languageCode?: string) => {
    return queryClient.prefetchQuery({
      queryKey: leaderboardKeys.user(languageCode),
      queryFn: () => languageApiService.getUserLeaderboardPosition(languageCode),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchGlobalLeaderboard,
    prefetchUserPosition,
  };
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Calculate user's improvement over time
 */
export function calculateUserImprovement(currentEntry: LeaderboardEntry, previousEntries: LeaderboardEntry[]) {
  if (previousEntries.length === 0) return null;

  const lastEntry = previousEntries[previousEntries.length - 1];
  
  return {
    xpGrowth: currentEntry.total_xp - lastEntry.total_xp,
    streakChange: currentEntry.current_streak - lastEntry.current_streak,
    lessonsGrowth: currentEntry.lessons_completed - lastEntry.lessons_completed,
    rankChange: (lastEntry.rank_position || 0) - (currentEntry.rank_position || 0), // Positive means rank improved
  };
}

/**
 * Get user tier based on XP
 */
export function getUserTier(xp: number): { tier: string; color: string; minXp: number; maxXp: number } {
  const tiers = [
    { tier: 'Bronze', color: '#CD7F32', minXp: 0, maxXp: 499 },
    { tier: 'Silver', color: '#C0C0C0', minXp: 500, maxXp: 1499 },
    { tier: 'Gold', color: '#FFD700', minXp: 1500, maxXp: 2999 },
    { tier: 'Platinum', color: '#E5E4E2', minXp: 3000, maxXp: 4999 },
    { tier: 'Diamond', color: '#B9F2FF', minXp: 5000, maxXp: 9999 },
    { tier: 'Master', color: '#FF6B6B', minXp: 10000, maxXp: Infinity },
  ];

  return tiers.find(tier => xp >= tier.minXp && xp <= tier.maxXp) || tiers[0];
}