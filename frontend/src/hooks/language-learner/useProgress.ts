/**
 * Progress hooks with React Query integration
 * Provides data fetching and mutations for learning progress tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  languageApiService, 
  Progress, 
  UpdateProgressRequest, 
  ProgressQueryParams 
} from '../../services/languageApi';

// ==============================================
// QUERY KEYS
// ==============================================

export const progressKeys = {
  all: ['progress'] as const,
  lists: () => [...progressKeys.all, 'list'] as const,
  list: (filters: ProgressQueryParams) => [...progressKeys.lists(), filters] as const,
  byLanguage: (languageCode: string) => [...progressKeys.all, 'language', languageCode] as const,
  byActivity: (activityType: string) => [...progressKeys.all, 'activity', activityType] as const,
  analytics: (languageCode?: string) => [...progressKeys.all, 'analytics', languageCode] as const,
  dashboard: (languageCode?: string) => [...progressKeys.all, 'dashboard', languageCode] as const,
};

// ==============================================
// QUERY HOOKS
// ==============================================

/**
 * Hook to fetch progress records with filtering and pagination
 */
export function useProgress(params?: ProgressQueryParams) {
  return useQuery({
    queryKey: progressKeys.list(params || {}),
    queryFn: () => languageApiService.getProgress(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (progress changes frequently)
  });
}

/**
 * Hook to fetch progress by language
 */
export function useProgressByLanguage(languageCode: string, params?: Omit<ProgressQueryParams, 'language_code'>) {
  const queryParams = { ...params, language_code: languageCode };
  
  return useQuery({
    queryKey: progressKeys.byLanguage(languageCode),
    queryFn: () => languageApiService.getProgress(queryParams),
    enabled: !!languageCode,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get recent progress (last 7 days)
 */
export function useRecentProgress(languageCode?: string, days = 7) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return useQuery({
    queryKey: [...progressKeys.all, 'recent', languageCode, days],
    queryFn: () => languageApiService.getProgress({
      language_code: languageCode,
      start_date: startDate,
      end_date: endDate,
      sort_by: 'created_at',
      sort_order: 'desc',
      limit: 100
    }),
    staleTime: 2 * 60 * 1000,
  });
}

// ==============================================
// MUTATION HOOKS
// ==============================================

/**
 * Hook to create progress record
 */
export function useCreateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (progressData: UpdateProgressRequest) => 
      languageApiService.updateProgress(progressData),
    onSuccess: (newProgress) => {
      // Invalidate progress lists
      queryClient.invalidateQueries({ queryKey: progressKeys.lists() });
      
      // Update language-specific cache
      if (newProgress.language_code) {
        queryClient.invalidateQueries({ 
          queryKey: progressKeys.byLanguage(newProgress.language_code) 
        });
      }

      // Invalidate analytics and dashboard for fresh stats
      queryClient.invalidateQueries({ queryKey: progressKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: progressKeys.dashboard() });
      
      // Also invalidate study session stats as they're related
      queryClient.invalidateQueries({ queryKey: ['studySessions', 'stats'] });
    },
    onError: (error) => {
      console.error('Failed to create progress:', error);
    },
  });
}

/**
 * Hook to update progress
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (progressData: UpdateProgressRequest) => 
      languageApiService.updateProgress(progressData),
    onSuccess: (newProgress) => {
      // Invalidate progress lists
      queryClient.invalidateQueries({ queryKey: progressKeys.lists() });
      
      // Update language-specific cache
      if (newProgress.language_code) {
        queryClient.invalidateQueries({ 
          queryKey: progressKeys.byLanguage(newProgress.language_code) 
        });
      }

      // Invalidate analytics and dashboard for fresh stats
      queryClient.invalidateQueries({ queryKey: progressKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: progressKeys.dashboard() });
      
      // Also invalidate study session stats as they're related
      queryClient.invalidateQueries({ queryKey: ['studySessions', 'stats'] });
    },
    onError: (error) => {
      console.error('Failed to update progress:', error);
    },
  });
}

// ==============================================
// ANALYTICS HOOKS
// ==============================================

/**
 * Hook to get comprehensive progress analytics
 */
export function useProgressAnalytics(languageCode?: string, days = 30) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return useQuery({
    queryKey: progressKeys.analytics(languageCode),
    queryFn: async () => {
      const response = await languageApiService.getProgress({
        language_code: languageCode,
        start_date: startDate,
        end_date: endDate,
        limit: 1000 // Get all progress records for accurate analytics
      });

      const progressRecords = response.data;
      
      if (progressRecords.length === 0) {
        return {
          totalActivities: 0,
          totalPoints: 0,
          totalTimeMinutes: 0,
          averageAccuracy: 0,
          completionRate: 0,
          activityDistribution: {},
          dailyProgress: [],
          weeklyTrends: [],
          performanceMetrics: {
            improvement: 0,
            consistency: 0,
            engagement: 0,
          },
        };
      }

      // Basic stats
      const totalActivities = progressRecords.length;
      const totalPoints = progressRecords.reduce((sum, record) => sum + record.points_earned, 0);
      const totalTimeMinutes = progressRecords.reduce((sum, record) => sum + (record.time_spent || 0), 0) / 60; // Convert seconds to minutes
      
      // Completion rate
      const completedActivities = progressRecords.filter(record => record.completed).length;
      const completionRate = (completedActivities / totalActivities) * 100;

      // Average accuracy
      const recordsWithAccuracy = progressRecords.filter(record => record.accuracy !== null && record.accuracy !== undefined);
      const averageAccuracy = recordsWithAccuracy.length > 0
        ? recordsWithAccuracy.reduce((sum, record) => sum + (record.accuracy || 0), 0) / recordsWithAccuracy.length
        : 0;

      // Activity type distribution
      const activityDistribution = progressRecords.reduce((acc, record) => {
        acc[record.activity_type] = (acc[record.activity_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Daily progress for the specified period
      const dailyProgress = [];
      for (let i = 0; i < days; i++) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayRecords = progressRecords.filter(record => 
          record.created_at.split('T')[0] === dateStr
        );
        
        const dayPoints = dayRecords.reduce((sum, r) => sum + r.points_earned, 0);
        const dayTimeMinutes = dayRecords.reduce((sum, r) => sum + (r.time_spent || 0), 0) / 60;
        const dayAccuracy = dayRecords.length > 0
          ? dayRecords.filter(r => r.accuracy).reduce((sum, r) => sum + (r.accuracy || 0), 0) / dayRecords.filter(r => r.accuracy).length || 0
          : 0;
        
        dailyProgress.unshift({
          date: dateStr,
          activities: dayRecords.length,
          points: dayPoints,
          timeMinutes: dayTimeMinutes,
          accuracy: dayAccuracy,
          completed: dayRecords.filter(r => r.completed).length,
        });
      }

      // Weekly trends (group daily progress into weeks)
      const weeklyTrends = [];
      for (let i = 0; i < dailyProgress.length; i += 7) {
        const weekData = dailyProgress.slice(i, i + 7);
        const weekStart = weekData[0]?.date;
        const weekEnd = weekData[weekData.length - 1]?.date;
        
        if (weekData.length > 0) {
          weeklyTrends.push({
            week: `${weekStart} to ${weekEnd}`,
            activities: weekData.reduce((sum, day) => sum + day.activities, 0),
            points: weekData.reduce((sum, day) => sum + day.points, 0),
            timeMinutes: weekData.reduce((sum, day) => sum + day.timeMinutes, 0),
            averageAccuracy: weekData.reduce((sum, day) => sum + day.accuracy, 0) / weekData.length,
          });
        }
      }

      // Performance metrics
      const performanceMetrics = calculatePerformanceMetrics(dailyProgress, weeklyTrends);

      return {
        totalActivities,
        totalPoints,
        totalTimeMinutes,
        averageAccuracy,
        completionRate,
        activityDistribution,
        dailyProgress,
        weeklyTrends,
        performanceMetrics,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get dashboard summary data
 */
export function useProgressDashboard(languageCode?: string) {
  return useQuery({
    queryKey: progressKeys.dashboard(languageCode),
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch different time periods
      const [todayData, weekData, monthData] = await Promise.all([
        languageApiService.getProgress({
          language_code: languageCode,
          start_date: today,
          end_date: today,
          limit: 100
        }),
        languageApiService.getProgress({
          language_code: languageCode,
          start_date: weekAgo,
          limit: 500
        }),
        languageApiService.getProgress({
          language_code: languageCode,
          start_date: monthAgo,
          limit: 1000
        })
      ]);

      // Today's stats
      const todayStats = {
        activities: todayData.data.length,
        points: todayData.data.reduce((sum, r) => sum + r.points_earned, 0),
        timeMinutes: todayData.data.reduce((sum, r) => sum + (r.time_spent || 0), 0) / 60,
        completed: todayData.data.filter(r => r.completed).length,
      };

      // Week stats
      const weekStats = {
        activities: weekData.data.length,
        points: weekData.data.reduce((sum, r) => sum + r.points_earned, 0),
        timeMinutes: weekData.data.reduce((sum, r) => sum + (r.time_spent || 0), 0) / 60,
        completed: weekData.data.filter(r => r.completed).length,
      };

      // Month stats
      const monthStats = {
        activities: monthData.data.length,
        points: monthData.data.reduce((sum, r) => sum + r.points_earned, 0),
        timeMinutes: monthData.data.reduce((sum, r) => sum + (r.time_spent || 0), 0) / 60,
        completed: monthData.data.filter(r => r.completed).length,
      };

      // Calculate streaks and achievements
      const streakData = calculateProgressStreak(monthData.data);
      const achievements = calculateAchievements(monthStats);

      return {
        today: todayStats,
        week: weekStats,
        month: monthStats,
        streaks: streakData,
        achievements,
        recentActivities: monthData.data.slice(0, 10), // Last 10 activities
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Calculate performance metrics from progress data
 */
function calculatePerformanceMetrics(
  dailyProgress: Array<any>,
  weeklyTrends: Array<any>
) {
  // Improvement: Compare first week vs last week accuracy
  const improvement = weeklyTrends.length >= 2 
    ? ((weeklyTrends[weeklyTrends.length - 1].averageAccuracy - weeklyTrends[0].averageAccuracy) / weeklyTrends[0].averageAccuracy) * 100
    : 0;

  // Consistency: How many days had activity in the last 7 days
  const lastWeekActivity = dailyProgress.slice(-7);
  const activeDays = lastWeekActivity.filter(day => day.activities > 0).length;
  const consistency = (activeDays / 7) * 100;

  // Engagement: Average activities per active day
  const totalActivities = lastWeekActivity.reduce((sum, day) => sum + day.activities, 0);
  const engagement = activeDays > 0 ? totalActivities / activeDays : 0;

  return {
    improvement: Math.round(improvement * 100) / 100,
    consistency: Math.round(consistency * 100) / 100,
    engagement: Math.round(engagement * 100) / 100,
  };
}

/**
 * Calculate streak data from progress records
 */
function calculateProgressStreak(progressRecords: Progress[]) {
  // Group by date
  const dailyActivity: Record<string, boolean> = {};
  
  progressRecords.forEach(record => {
    const date = record.created_at.split('T')[0];
    dailyActivity[date] = true;
  });

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    if (dailyActivity[dateStr]) {
      if (i === 0 || currentStreak > 0) {
        currentStreak++;
      } else {
        break;
      }
    } else if (i === 0) {
      break;
    } else {
      break;
    }
  }

  // Calculate longest streak
  const sortedDates = Object.keys(dailyActivity).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const currentDate = new Date(dateStr);
    
    if (lastDate && (currentDate.getTime() - lastDate.getTime()) === 24 * 60 * 60 * 1000) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    lastDate = currentDate;
  }

  return {
    current: currentStreak,
    longest: longestStreak,
  };
}

/**
 * Calculate achievements based on progress stats
 */
function calculateAchievements(monthStats: any) {
  const achievements = [];

  if (monthStats.activities >= 100) {
    achievements.push({ id: 'centurion', name: 'Centurion', description: '100+ activities this month' });
  }
  
  if (monthStats.points >= 1000) {
    achievements.push({ id: 'point_master', name: 'Point Master', description: '1000+ points this month' });
  }
  
  if (monthStats.timeMinutes >= 600) {
    achievements.push({ id: 'time_warrior', name: 'Time Warrior', description: '10+ hours this month' });
  }

  return achievements;
}

// ==============================================
// SPECIALIZED HOOKS
// ==============================================

/**
 * Hook to track activity completion progress
 */
export function useActivityProgress(activityType: string, activityId: string) {
  return useQuery({
    queryKey: [...progressKeys.all, 'activity', activityType, activityId],
    queryFn: async () => {
      const response = await languageApiService.getProgress({
        activity_types: [activityType],
        limit: 100
      });
      
      // Find progress record for this specific activity
      const activityProgress = response.data.find(record => {
        switch (activityType) {
          case 'lesson_completed':
            return record.lesson_id === activityId;
          case 'story_completed':
            return record.story_id === activityId;
          case 'exercise_completed':
            return record.exercise_id === activityId;
          case 'vocabulary_learned':
            return record.vocabulary_id === activityId;
          default:
            return false;
        }
      });

      return activityProgress || null;
    },
    staleTime: 5 * 60 * 1000,
  });
}