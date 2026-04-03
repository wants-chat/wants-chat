import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

// New API response structure based on /api/v1/dashboard/user-dashboard (camelCase from backend)
interface BodyMetrics {
  bmi: number;
  weightKg: number;
  heightCm: number;
}

interface Calories {
  kcalToday: number;
  dailyGoal: number;
  percentageOfGoal: number;
}

interface Workouts {
  totalSessions: number;
  totalMinutes: number;
  totalCaloriesBurned?: number;
}

interface Meditation {
  sessionsCompleted: number;
  totalMinutes: number;
  currentStreak: number;
}

interface Finance {
  expensesThisMonth: number;
  transactionsThisMonth: number;
  currency: string;
}

interface Blog {
  totalPosts: number;
  publishedPosts: number;
  totalViews: number;
  totalLikes: number;
}

interface Travel {
  tripsPlanned: number;
  upcomingTrips: number;
  completedTrips: number;
}

interface Todos {
  completedTasks: number;
  pendingTasks: number;
  totalTasks: number;
}

interface Languages {
  wordsLearned: number;
  languagesCount: number;
  totalStudyTime: number;
  languageCode?: string;
  totalPoints?: number;
  currentStreak?: number;
  lessonsCompleted?: number;
  exercisesCompleted?: number;
  vocabularyLearned?: number;
  averageAccuracy?: number;
  timeSpent?: number;
}

export interface UsedApp {
  moduleName: string;
  displayName: string;
  recordCount: number;
  lastActivity: string;
  isActive: boolean;
  // Support both camelCase and snake_case for backwards compatibility
  module_name?: string;
  display_name?: string;
  record_count?: number;
  last_activity?: string;
  is_active?: boolean;
}

export interface RecentActivity {
  id: string;
  module: string;
  activityType: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  timestamp: string;
  entityId: string;
  link: string;
  // Support both camelCase and snake_case
  activity_type?: string;
  icon_color?: string;
  entity_id?: string;
}

interface UserDashboardResponse {
  bodyMetrics: BodyMetrics;
  calories: Calories;
  workouts: Workouts;
  meditation: Meditation;
  finance: Finance;
  blog: Blog;
  travel: Travel;
  todos: Todos;
  languages: Languages;
  usedApps: UsedApp[];
  lastUpdated: string;
}

// Legacy interface for backward compatibility with DashboardPage component
interface DashboardData {
  // Health & Body Metrics
  healthSummary?: {
    bmi?: number;
    weight?: number;
    height?: number;
    todayCalories?: number;
  };

  // Fitness
  fitnessStats?: {
    totalWorkouts: number;
    totalExerciseTime?: number;
    weeklyProgress?: any[];
    recentActivities?: any[];
  };

  // Finance
  expenseSummary?: {
    monthTotal?: number;
    transactionCount?: number;
    currency?: string;
  };

  // Meditation
  meditationStats?: {
    totalSessions: number;
    totalMinutes: number;
    totalMindfulMinutes?: number;
    currentStreak: number;
    longestStreak?: number;
  };

  // Blog
  blogStats?: {
    totalPosts: number;
    publishedPosts?: number;
    totalViews: number;
    totalLikes?: number;
  };

  // Travel
  travelStats?: {
    totalTrips: number;
    upcomingTrips: number;
    completedTrips?: number;
    countriesVisited?: number;
  };

  // Todos
  todoStats?: {
    completedTasks: number;
    pendingTasks: number;
    totalTasks?: number;
  };

  // Languages
  languageStats?: {
    wordsLearned: number;
    languagesCount?: number;
    totalStudyTime?: number;
    lessonsCompleted?: number;
    exercisesCompleted?: number;
    currentStreak?: number;
  };

  // Notifications
  notificationSummary?: {
    unread: number;
    total?: number;
    recent?: any[];
  };

  // Used Apps
  usedApps?: UsedApp[];

  // Recent Activity
  recentActivities?: RecentActivity[];
  todayActivitiesCount?: number;

  // Legacy fields
  healthProfile?: any;
  financialSummary?: any;
  upcomingReminders?: any[];
  userStats?: any;
  quickAccessApps?: any[];
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      // Fetch dashboard data and today's activity in parallel
      const [response, todayActivityResponse] = await Promise.all([
        api.request<UserDashboardResponse>('/dashboard/user-dashboard'),
        api.request<{ activities: RecentActivity[]; total: number }>('/dashboard/recent-activity?period=today')
      ]);

      // Transform the new API response to match the legacy interface
      // Use optional chaining to handle missing data gracefully
      // Backend returns camelCase due to CamelCaseInterceptor
      const transformedData: DashboardData = {
        // Health & Body Metrics
        healthSummary: {
          bmi: response.bodyMetrics?.bmi ?? 0,
          weight: response.bodyMetrics?.weightKg ?? 0,
          height: response.bodyMetrics?.heightCm ?? 0,
          todayCalories: response.calories?.kcalToday ?? 0,
        },

        // Fitness
        fitnessStats: {
          totalWorkouts: response.workouts?.totalSessions ?? 0,
          totalExerciseTime: response.workouts?.totalMinutes ?? 0,
          weeklyProgress: [],
          recentActivities: []
        },

        // Finance
        expenseSummary: {
          monthTotal: response.finance?.expensesThisMonth ?? 0,
          transactionCount: response.finance?.transactionsThisMonth ?? 0,
          currency: response.finance?.currency ?? 'USD'
        },

        // Meditation
        meditationStats: {
          totalSessions: response.meditation?.sessionsCompleted ?? 0,
          totalMinutes: response.meditation?.totalMinutes ?? 0,
          totalMindfulMinutes: response.meditation?.totalMinutes ?? 0,
          currentStreak: response.meditation?.currentStreak ?? 0,
          longestStreak: response.meditation?.currentStreak ?? 0
        },

        // Blog
        blogStats: {
          totalPosts: response.blog?.totalPosts ?? 0,
          publishedPosts: response.blog?.publishedPosts ?? 0,
          totalViews: response.blog?.totalViews ?? 0,
          totalLikes: response.blog?.totalLikes ?? 0
        },

        // Travel
        travelStats: {
          totalTrips: response.travel?.tripsPlanned ?? 0,
          upcomingTrips: response.travel?.upcomingTrips ?? 0,
          completedTrips: response.travel?.completedTrips ?? 0,
          countriesVisited: 0
        },

        // Todos
        todoStats: {
          completedTasks: response.todos?.completedTasks ?? 0,
          pendingTasks: response.todos?.pendingTasks ?? 0,
          totalTasks: response.todos?.totalTasks ?? 0
        },

        // Languages
        languageStats: {
          wordsLearned: response.languages?.wordsLearned ?? 0,
          languagesCount: response.languages?.languagesCount ?? 0,
          totalStudyTime: response.languages?.totalStudyTime ?? 0,
          lessonsCompleted: response.languages?.lessonsCompleted ?? 0,
          exercisesCompleted: response.languages?.exercisesCompleted ?? 0,
          currentStreak: response.languages?.currentStreak ?? 0
        },

        // Used Apps - normalize to support both camelCase and snake_case in DashboardPage
        usedApps: (response.usedApps || []).map(app => ({
          ...app,
          module_name: app.moduleName || app.module_name,
          display_name: app.displayName || app.display_name,
          record_count: app.recordCount || app.record_count,
          last_activity: app.lastActivity || app.last_activity,
          is_active: app.isActive || app.is_active,
        })),

        // Today's Activity (showing in Recent Activity section)
        recentActivities: todayActivityResponse.activities || [],
        todayActivitiesCount: todayActivityResponse.total || 0,

        // Notifications - placeholder (not in new API)
        notificationSummary: {
          unread: 0,
          total: 0,
          recent: []
        },

        // Legacy fields
        upcomingReminders: [],
        userStats: {
          achievements: {
            total: 0,
            recent: []
          }
        },
        quickAccessApps: []
      };

      setData(transformedData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setHasError(true);

      // Set fallback data
      setData({
        healthSummary: {
          bmi: 0,
          weight: 0,
          height: 0,
          todayCalories: 0
        },
        fitnessStats: {
          totalWorkouts: 0,
          totalExerciseTime: 0,
          weeklyProgress: [],
          recentActivities: []
        },
        expenseSummary: {
          monthTotal: 0,
          transactionCount: 0,
          currency: 'USD'
        },
        meditationStats: {
          totalSessions: 0,
          totalMinutes: 0,
          totalMindfulMinutes: 0,
          currentStreak: 0,
          longestStreak: 0
        },
        blogStats: {
          totalPosts: 0,
          publishedPosts: 0,
          totalViews: 0,
          totalLikes: 0
        },
        travelStats: {
          totalTrips: 0,
          upcomingTrips: 0,
          completedTrips: 0,
          countriesVisited: 0
        },
        todoStats: {
          completedTasks: 0,
          pendingTasks: 0,
          totalTasks: 0
        },
        languageStats: {
          wordsLearned: 0,
          languagesCount: 0,
          totalStudyTime: 0,
          lessonsCompleted: 0
        },
        usedApps: [],
        recentActivities: [],
        todayActivitiesCount: 0,
        notificationSummary: {
          unread: 0,
          total: 0,
          recent: []
        },
        upcomingReminders: [],
        userStats: {
          achievements: {
            total: 0,
            recent: []
          }
        },
        quickAccessApps: []
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refetchAll = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...data,
    isLoading,
    hasError,
    refetchAll
  };
};