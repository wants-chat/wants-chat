/**
 * Analytics hooks with React Query integration
 * Provides data fetching for user analytics and learning insights
 */

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  languageApiService,
  UserAnalytics
} from '../../services/languageApi';

// ==============================================
// QUERY KEYS
// ==============================================

export const analyticsKeys = {
  all: ['analytics'] as const,
  users: () => [...analyticsKeys.all, 'user'] as const,
  user: (userId: string) => [...analyticsKeys.users(), userId] as const,
  insights: (userId: string) => [...analyticsKeys.user(userId), 'insights'] as const,
  trends: (userId: string) => [...analyticsKeys.user(userId), 'trends'] as const,
};

// ==============================================
// QUERY HOOKS
// ==============================================

/**
 * Hook to fetch user's analytics data
 */
export function useUserAnalytics(userId: string) {
  return useQuery({
    queryKey: analyticsKeys.user(userId),
    queryFn: () => languageApiService.getUserAnalytics(userId),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// ==============================================
// HELPER HOOKS
// ==============================================

/**
 * Hook to get learning insights from analytics data
 */
export function useLearningInsights(userId: string) {
  const { data: analytics, isLoading } = useUserAnalytics(userId);

  const insights = React.useMemo(() => {
    if (!analytics) return null;

    // Performance insights
    const performanceLevel = analytics.accuracy_rate >= 90 ? 'excellent' :
                           analytics.accuracy_rate >= 75 ? 'good' :
                           analytics.accuracy_rate >= 60 ? 'fair' : 'needs_improvement';

    // Study pattern insights
    const studyPatternInsights = [];
    
    if (analytics.study_consistency >= 80) {
      studyPatternInsights.push({
        type: 'positive',
        title: 'Excellent Consistency',
        message: 'You\'re maintaining a great study routine!',
        icon: '🔥'
      });
    } else if (analytics.study_consistency < 50) {
      studyPatternInsights.push({
        type: 'improvement',
        title: 'Improve Consistency',
        message: 'Try to study a little bit every day for better results.',
        icon: '📅'
      });
    }

    if (analytics.average_session_length > 30) {
      studyPatternInsights.push({
        type: 'positive',
        title: 'Great Focus',
        message: 'Your long study sessions show excellent dedication!',
        icon: '🎯'
      });
    } else if (analytics.average_session_length < 10) {
      studyPatternInsights.push({
        type: 'suggestion',
        title: 'Extend Sessions',
        message: 'Try longer study sessions for deeper learning.',
        icon: '⏰'
      });
    }

    // Skill insights
    const skillInsights = [];
    
    if (analytics.strongest_skills.length > 0) {
      skillInsights.push({
        type: 'strength',
        title: 'Top Skills',
        skills: analytics.strongest_skills,
        message: `You excel at ${analytics.strongest_skills.join(', ')}!`,
        icon: '💪'
      });
    }

    if (analytics.weakest_skills.length > 0) {
      skillInsights.push({
        type: 'weakness',
        title: 'Focus Areas',
        skills: analytics.weakest_skills,
        message: `Practice more ${analytics.weakest_skills.join(', ')} for improvement.`,
        icon: '📈'
      });
    }

    // Improvement insights
    const improvementRate = analytics.improvement_rate;
    const improvementInsight = improvementRate > 10 ? {
      type: 'positive',
      title: 'Rapid Progress',
      message: `You're improving ${improvementRate.toFixed(1)}% faster!`,
      icon: '🚀'
    } : improvementRate > 0 ? {
      type: 'positive',
      title: 'Steady Progress',
      message: 'You\'re making consistent improvements!',
      icon: '📊'
    } : {
      type: 'suggestion',
      title: 'Boost Your Progress',
      message: 'Try varying your study methods for better results.',
      icon: '💡'
    };

    return {
      performanceLevel,
      studyPatternInsights,
      skillInsights,
      improvementInsight,
      overallScore: calculateOverallScore(analytics),
    };
  }, [analytics]);

  return {
    insights,
    isLoading,
  };
}

/**
 * Hook to get learning trends from analytics
 */
export function useLearningTrends(userId: string) {
  const { data: analytics, isLoading } = useUserAnalytics(userId);

  const trends = React.useMemo(() => {
    if (!analytics) return null;

    // Weekly XP trend
    const weeklyXPTrend = analytics.weekly_xp.length >= 2 ? 
      analytics.weekly_xp[analytics.weekly_xp.length - 1] - analytics.weekly_xp[analytics.weekly_xp.length - 2] : 0;

    // Streak trend
    const streakTrend = analytics.daily_streak >= 7 ? 'strong' :
                       analytics.daily_streak >= 3 ? 'moderate' : 'weak';

    // Study time trend
    const avgDailyMinutes = analytics.average_session_length;
    const timeTrend = avgDailyMinutes >= 30 ? 'high' :
                     avgDailyMinutes >= 15 ? 'moderate' : 'low';

    // Vocabulary acquisition rate
    const vocabRate = analytics.words_per_day;
    const vocabTrend = vocabRate >= 10 ? 'excellent' :
                      vocabRate >= 5 ? 'good' :
                      vocabRate >= 2 ? 'fair' : 'slow';

    return {
      weeklyXPTrend,
      streakTrend,
      timeTrend,
      vocabTrend,
      isImproving: weeklyXPTrend > 0 && analytics.improvement_rate > 0,
      recommendations: generateRecommendations(analytics),
    };
  }, [analytics]);

  return {
    trends,
    isLoading,
  };
}

/**
 * Hook to get study recommendations based on analytics
 */
export function useStudyRecommendations(userId: string) {
  const { data: analytics, isLoading } = useUserAnalytics(userId);

  const recommendations = React.useMemo(() => {
    if (!analytics) return [];

    const recs = [];

    // Time-based recommendations
    if (analytics.favorite_study_time) {
      recs.push({
        type: 'timing',
        priority: 'high',
        title: 'Optimize Study Time',
        description: `You learn best during ${analytics.favorite_study_time}. Schedule your sessions then!`,
        action: 'Schedule study sessions',
        icon: '⏰'
      });
    }

    // Consistency recommendations
    if (analytics.study_consistency < 70) {
      recs.push({
        type: 'consistency',
        priority: 'high',
        title: 'Build Study Habit',
        description: 'Try studying for just 10 minutes daily to build momentum.',
        action: 'Set daily reminder',
        icon: '📅'
      });
    }

    // Skill-based recommendations
    if (analytics.weakest_skills.length > 0) {
      recs.push({
        type: 'skills',
        priority: 'medium',
        title: 'Focus on Weak Areas',
        description: `Spend extra time on ${analytics.weakest_skills[0]} this week.`,
        action: 'Practice weak skills',
        icon: '🎯'
      });
    }

    // Session length recommendations
    if (analytics.average_session_length < 15) {
      recs.push({
        type: 'duration',
        priority: 'medium',
        title: 'Extend Study Sessions',
        description: 'Aim for 20-30 minute sessions for better retention.',
        action: 'Plan longer sessions',
        icon: '⏱️'
      });
    }

    // Goal-based recommendations
    analytics.upcoming_goals.forEach(goal => {
      const progress = (goal.current / goal.target) * 100;
      if (progress < 50) {
        recs.push({
          type: 'goal',
          priority: 'medium',
          title: `Catch up on ${goal.type}`,
          description: `You're ${progress.toFixed(0)}% towards your ${goal.type} goal.`,
          action: 'Focus on goal',
          icon: '🏆'
        });
      }
    });

    return recs.sort((a, b) => {
      const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });
  }, [analytics]);

  return {
    recommendations,
    isLoading,
  };
}

// ==============================================
// PREFETCH UTILITIES
// ==============================================

/**
 * Prefetch analytics data for better UX
 */
export function usePrefetchAnalytics() {
  const queryClient = useQueryClient();

  const prefetchUserAnalytics = React.useCallback((userId: string) => {
    return queryClient.prefetchQuery({
      queryKey: analyticsKeys.user(userId),
      queryFn: () => languageApiService.getUserAnalytics(userId),
      staleTime: 15 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchUserAnalytics,
  };
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Calculate an overall learning score from analytics
 */
function calculateOverallScore(analytics: UserAnalytics): number {
  const accuracyScore = (analytics.accuracy_rate / 100) * 25;
  const consistencyScore = (analytics.study_consistency / 100) * 25;
  const streakScore = Math.min(analytics.daily_streak / 30, 1) * 20;
  const improvementScore = Math.min(analytics.improvement_rate / 20, 1) * 15;
  const engagementScore = Math.min(analytics.total_study_sessions / 100, 1) * 15;

  return Math.round(accuracyScore + consistencyScore + streakScore + improvementScore + engagementScore);
}

/**
 * Generate personalized recommendations based on analytics
 */
function generateRecommendations(analytics: UserAnalytics) {
  const recommendations = [];

  // Accuracy-based
  if (analytics.accuracy_rate < 70) {
    recommendations.push('Focus on understanding before speed');
  }

  // Consistency-based
  if (analytics.study_consistency < 60) {
    recommendations.push('Set a daily study reminder');
  }

  // Time-based
  if (analytics.average_session_length < 10) {
    recommendations.push('Try longer study sessions');
  }

  // Skill-based
  if (analytics.weakest_skills.length > 0) {
    recommendations.push(`Practice more ${analytics.weakest_skills[0]}`);
  }

  return recommendations;
}

/**
 * Hook to compare current period vs previous period
 */
export function useAnalyticsComparison(userId: string, days = 7) {
  const { data: analytics, isLoading } = useUserAnalytics(userId);

  const comparison = React.useMemo(() => {
    if (!analytics) return null;

    // For now, we'll use the weekly XP data as a proxy
    // In a real implementation, you'd fetch data for different time periods
    const currentWeekXP = analytics.weekly_xp[analytics.weekly_xp.length - 1] || 0;
    const previousWeekXP = analytics.weekly_xp[analytics.weekly_xp.length - 2] || 0;
    
    const xpChange = currentWeekXP - previousWeekXP;
    const xpChangePercent = previousWeekXP > 0 ? (xpChange / previousWeekXP) * 100 : 0;

    return {
      xp: {
        current: currentWeekXP,
        previous: previousWeekXP,
        change: xpChange,
        changePercent: xpChangePercent,
        trend: xpChange > 0 ? 'up' : xpChange < 0 ? 'down' : 'stable'
      },
      // Add more comparisons as needed
    };
  }, [analytics]);

  return {
    comparison,
    isLoading,
  };
}