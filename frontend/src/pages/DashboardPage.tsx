// @ts-nocheck
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Heart,
  Brain,
  DollarSign,
  Plane,
  Activity,
  Calendar,
  TrendingUp,
  Bell,
  RefreshCw,
  AlertCircle,
  Grid3X3,
  Zap,
  BookOpen,
  Languages,
  Utensils,
  CheckCircle,
  FileText,
  Settings2,
  Clock,
  PartyPopper
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useDashboardData, useRealTime } from '../hooks';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { socketService } from '../services';
import QuickAccessApps from '../components/dashboard/QuickAccessApps';
import Header from '../components/landing/Header';
import { SEO } from '../components/SEO';
import { PAGE_SEO } from '../config/seo';
import { useAppPreferences } from '../contexts/AppPreferencesContext';
import { BackgroundEffects } from '../components/ui/BackgroundEffects';

// Helper function to get app icon, color, and route based on module name
const getAppConfig = (moduleName: string) => {
  const configs: Record<string, { icon: any; color: string; route: string; description: string }> = {
    meditation: {
      icon: Brain,
      color: 'from-purple-500 to-indigo-500',
      route: '/meditation',
      description: 'Mindfulness & relaxation'
    },
    language: {
      icon: Languages,
      color: 'from-fuchsia-500 to-purple-500',
      route: '/language-learner',
      description: 'Learn new languages'
    },
    todos: {
      icon: Calendar,
      color: 'from-amber-500 to-yellow-500',
      route: '/todo',
      description: 'Task & schedule management'
    },
    travel: {
      icon: Plane,
      color: 'from-blue-500 to-cyan-500',
      route: '/travel-planner',
      description: 'AI-powered trip planning'
    },
    blog: {
      icon: BookOpen,
      color: 'from-rose-500 to-pink-500',
      route: '/blog',
      description: 'Write & share your thoughts'
    },
    health: {
      icon: Activity,
      color: 'from-orange-500 to-red-500',
      route: '/health',
      description: 'Medical records & vitals'
    },
    calories: {
      icon: Utensils,
      color: 'from-green-500 to-emerald-500',
      route: '/calories-tracker',
      description: 'Track your nutrition'
    },
    fitness: {
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      route: '/fitness',
      description: 'Track workouts & progress'
    },
    finance: {
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      route: '/expense-tracker',
      description: 'Budget & financial planning'
    }
  };

  return configs[moduleName] || {
    icon: Grid3X3,
    color: 'from-gray-500 to-slate-500',
    route: '/dashboard',
    description: 'Application module'
  };
};

// Helper function to format time ago
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = Math.abs(now.getTime() - date.getTime());
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
};

// Helper function to map API icon names to lucide-react icons
const getActivityIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    AttachMoney: DollarSign,
    CheckCircle: CheckCircle,
    FlightTakeoff: Plane,
    Article: FileText,
    SelfImprovement: Brain,
    Language: Languages,
    Favorite: Heart,
    FitnessCenter: Activity,
  };
  return iconMap[iconName] || Activity;
};

// Helper function to map icon colors to Tailwind gradient classes
const getActivityColorClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    green: {
      bg: 'from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10',
      icon: 'from-green-500 to-emerald-500',
      border: 'border-green-200/50 dark:border-green-700/30'
    },
    teal: {
      bg: 'from-teal-50 to-cyan-50 dark:from-teal-900/10 dark:to-cyan-900/10',
      icon: 'from-teal-500 to-cyan-500',
      border: 'border-teal-200/50 dark:border-teal-700/30'
    },
    sky: {
      bg: 'from-sky-50 to-blue-50 dark:from-sky-900/10 dark:to-blue-900/10',
      icon: 'from-sky-500 to-blue-500',
      border: 'border-sky-200/50 dark:border-sky-700/30'
    },
    orange: {
      bg: 'from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10',
      icon: 'from-orange-500 to-amber-500',
      border: 'border-orange-200/50 dark:border-orange-700/30'
    },
    purple: {
      bg: 'from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10',
      icon: 'from-purple-500 to-indigo-500',
      border: 'border-purple-200/50 dark:border-purple-700/30'
    },
    indigo: {
      bg: 'from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10',
      icon: 'from-indigo-500 to-purple-500',
      border: 'border-indigo-200/50 dark:border-indigo-700/30'
    },
    blue: {
      bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10',
      icon: 'from-blue-500 to-cyan-500',
      border: 'border-blue-200/50 dark:border-blue-700/30'
    },
    red: {
      bg: 'from-red-50 to-pink-50 dark:from-red-900/10 dark:to-pink-900/10',
      icon: 'from-red-500 to-pink-500',
      border: 'border-red-200/50 dark:border-red-700/30'
    }
  };
  return colorMap[color] || colorMap.blue;
};

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState(socketService.getConnectionStatus());
  const { appOnboardingCompleted, isAppSelected, selectedApps, isLoading: preferencesLoading } = useAppPreferences();

  // Check if onboarding is completed
  // Old users with localStorage onboarding are grandfathered in
  // New users need appOnboardingCompleted from API
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    // Wait for preferences to load before checking
    if (!preferencesLoading) {
      // User has completed onboarding if EITHER:
      // 1. Old localStorage flag is 'true' (grandfathered old users)
      // 2. New API appOnboardingCompleted is true
      const hasCompletedOnboarding = onboardingCompleted === 'true' || appOnboardingCompleted;
      if (!hasCompletedOnboarding) {
        navigate('/onboarding');
        return;
      }
    }
  }, [navigate, appOnboardingCompleted, preferencesLoading]);

  // Get dashboard data from API
  const dashboardData = useDashboardData();
  const refetchAll = dashboardData.refetchAll;

  // Memoize real-time callbacks to prevent unnecessary re-renders
  const handleNotification = useCallback((notification: any) => {
    console.log('Received notification:', notification);
  }, []);

  const handleDataUpdate = useCallback((update: any) => {
    console.log('Received data update:', update);
    if (update.type === 'fitness_activity' || update.type === 'health_metric' ||
        update.type === 'expense' || update.type === 'meditation_session') {
      refetchAll();
    }
  }, [refetchAll]);

  const handleAchievement = useCallback((achievement: any) => {
    console.log('Achievement unlocked:', achievement);
  }, []);

  const handleReminder = useCallback((reminder: any) => {
    console.log('Reminder triggered:', reminder);
  }, []);

  // Setup real-time features
  useRealTime({
    onNotification: handleNotification,
    onDataUpdate: handleDataUpdate,
    onAchievement: handleAchievement,
    onReminder: handleReminder
  });
  
  // Monitor connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(socketService.getConnectionStatus());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);



  // Filter usedApps based on selected apps
  const filteredUsedApps = useMemo(() => {
    if (!dashboardData.usedApps) return [];
    // Map module names to app IDs for filtering
    const moduleToAppId: Record<string, string> = {
      meditation: 'meditation',
      fitness: 'fitness',
      calories: 'calories-tracker',
      health: 'health-tracker',
      finance: 'expense-tracker',
      travel: 'travel-planner',
      language: 'language-learner',
      todos: 'todo',
      blog: 'blog'
    };
    return dashboardData.usedApps.filter(app => {
      const moduleName = app.moduleName || app.module_name;
      const appId = moduleToAppId[moduleName] || moduleName;
      return isAppSelected(appId);
    });
  }, [dashboardData.usedApps, isAppSelected]);

  // Calculate quick stats from real data
  const quickStats = [
    {
      label: t('dashboard.stats.selectedApps'),
      value: String(selectedApps.length || 12),
      icon: Grid3X3
    },
    {
      label: t('dashboard.stats.todayActivities'),
      value: String(dashboardData.todayActivitiesCount || 0),
      icon: Activity
    },
    {
      label: t('dashboard.stats.activeApps'),
      value: String(filteredUsedApps.length || 0),
      icon: Zap
    },
    {
      label: t('dashboard.stats.unreadNotifications'),
      value: dashboardData.notificationSummary?.unread ?
        String(dashboardData.notificationSummary.unread) : '0',
      icon: Bell
    },
  ];

  return (
    <>
      <SEO
        title={PAGE_SEO.dashboard.title}
        description={PAGE_SEO.dashboard.description}
        url={PAGE_SEO.dashboard.url}
        noindex={true}
      />
      <div className="min-h-screen relative">
      {/* Animated Background */}
      <BackgroundEffects variant="subtle" />

      {/* Landing Page Header */}
      <Header />

      {/* Main Content */}
      <main className="py-8 space-y-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {t('dashboard.welcomeBack', { name: user?.name || user?.email?.split('@')[0] || 'User' })}
            </h1>
            <p className="text-white/60 mt-1">
              {t('dashboard.overview')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app-settings')}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              {t('dashboard.manageApps')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dashboardData.refetchAll()}
              disabled={dashboardData.isLoading}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${dashboardData.isLoading ? 'animate-spin' : ''}`} />
              {t('dashboard.refresh')}
            </Button>
          </div>
        </motion.div>
        {/* Loading/Error State */}
        {dashboardData.hasError && (
          <Card className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-sm text-white">{t('dashboard.failedToLoad')}</p>
                  <p className="text-xs text-white/80 mt-1">{t('dashboard.checkConnection')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {quickStats.map((stat, index) => {
            const colors = [
              'from-teal-500 to-cyan-500',
              'from-emerald-500 to-green-500',
              'from-purple-500 to-indigo-500',
              'from-amber-500 to-orange-500'
            ];
            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white/60">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">
                      {dashboardData.isLoading ? (
                        <span className="inline-block w-10 h-8 bg-white/20 animate-pulse rounded-lg" />
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${colors[index]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                {/* Background decoration */}
                <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-10 bg-gradient-to-r ${colors[index]}`} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Personal Stats Overview - Simplified */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    {t('dashboard.personalStats.title')}
                  </h2>
                  <p className="text-white/60 mt-2">
                    {t('dashboard.personalStats.subtitle')}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                  <span>{t('dashboard.personalStats.syncedData')}</span>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Body Metrics Card - Combined BMI, Weight, Height */}
                {isAppSelected('health-tracker') && (
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition-shadow duration-200 col-span-2">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Body Metrics</h4>
                  </div>
                  {dashboardData.isLoading ? (
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-6 w-16 bg-white/20 animate-pulse rounded"></div>
                          <div className="h-3 w-12 bg-white/10 animate-pulse rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {/* BMI */}
                      <div className="flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-xl rounded-lg border border-white/10">
                        <div className="text-xs font-semibold text-white/60 mb-1">BMI</div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {dashboardData.healthSummary?.bmi?.toFixed(1) || '--'}
                        </div>
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          dashboardData.healthSummary?.bmi
                            ? (dashboardData.healthSummary.bmi < 18.5
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : dashboardData.healthSummary.bmi < 25
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : dashboardData.healthSummary.bmi < 30
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {dashboardData.healthSummary?.bmi
                            ? (dashboardData.healthSummary.bmi < 18.5 ? 'Low'
                              : dashboardData.healthSummary.bmi < 25 ? 'Normal'
                              : dashboardData.healthSummary.bmi < 30 ? 'High'
                              : 'Very High')
                            : 'N/A'}
                        </div>
                      </div>

                      {/* Weight */}
                      <div className="flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-xl rounded-lg border border-white/10">
                        <div className="text-xs font-semibold text-white/60 mb-1">Weight</div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {dashboardData.healthSummary?.weight || '--'}
                        </div>
                        <div className="text-xs text-white/60">kg</div>
                      </div>

                      {/* Height */}
                      <div className="flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-xl rounded-lg border border-white/10">
                        <div className="text-xs font-semibold text-white/60 mb-1">Height</div>
                        <div className="text-2xl font-bold text-white mb-1">
                          {dashboardData.healthSummary?.height || '--'}
                        </div>
                        <div className="text-xs text-white/60">cm</div>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Calories Today Card */}
                {isAppSelected('calories-tracker') && (
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-xs font-semibold text-white/60">Calories</h4>
                  </div>
                  {dashboardData.isLoading ? (
                    <div className="space-y-2">
                      <div className="h-7 w-12 bg-white/20 animate-pulse rounded"></div>
                      <div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-white mb-1">
                        {dashboardData.healthSummary?.todayCalories || 0}
                      </div>
                      <p className="text-xs text-white/60">cal today</p>
                    </>
                  )}
                </div>
                )}

                {/* Workouts Card */}
                {isAppSelected('fitness') && (
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-xs font-semibold text-white/60">Workouts</h4>
                  </div>
                  {dashboardData.isLoading ? (
                    <div className="space-y-2">
                      <div className="h-7 w-12 bg-white/20 animate-pulse rounded"></div>
                      <div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-white mb-1">
                        {dashboardData.fitnessStats?.totalWorkouts || 0}
                      </div>
                      <p className="text-xs text-white/60">total sessions</p>
                    </>
                  )}
                </div>
                )}

                {/* Meditation Card - Sessions & Hours */}
                {isAppSelected('meditation') && (
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-xs font-semibold text-white/60">Meditation</h4>
                  </div>
                  {dashboardData.isLoading ? (
                    <div className="space-y-2">
                      <div className="h-7 w-12 bg-white/20 animate-pulse rounded"></div>
                      <div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-1">
                        <div className="text-2xl font-bold text-white">
                          {dashboardData.meditationStats?.totalSessions || 0}
                        </div>
                        <span className="text-lg">🧘</span>
                      </div>
                      <p className="text-xs text-white/60">
                        {dashboardData.meditationStats?.totalMinutes
                          ? `${(dashboardData.meditationStats.totalMinutes / 60).toFixed(1)} hours total`
                          : 'sessions completed'}
                      </p>
                    </>
                  )}
                </div>
                )}

                {/* Expenses This Month Card */}
                {isAppSelected('expense-tracker') && (
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-xs font-semibold text-white/60">Expenses</h4>
                  </div>
                  {dashboardData.isLoading ? (
                    <div className="space-y-2">
                      <div className="h-7 w-16 bg-white/20 animate-pulse rounded"></div>
                      <div className="h-3 w-20 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-white mb-1">
                        ${dashboardData.expenseSummary?.monthTotal?.toFixed(0) || '0'}
                      </div>
                      <p className="text-xs text-white/60">this month</p>
                    </>
                  )}
                </div>
                )}

                {/* Total Transactions Card */}
                {isAppSelected('expense-tracker') && (
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-xs font-semibold text-white/60">Transactions</h4>
                  </div>
                  {dashboardData.isLoading ? (
                    <div className="space-y-2">
                      <div className="h-7 w-12 bg-white/20 animate-pulse rounded"></div>
                      <div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-white mb-1">
                        {dashboardData.expenseSummary?.transactionCount || 0}
                      </div>
                      <p className="text-xs text-white/60">this month</p>
                    </>
                  )}
                </div>
                )}

                {/* Blog Posts Card */}
                {isAppSelected('blog') && (
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-xs font-semibold text-white/60">Blog Posts</h4>
                  </div>
                  {dashboardData.isLoading ? (
                    <div className="space-y-2">
                      <div className="h-7 w-12 bg-white/20 animate-pulse rounded"></div>
                      <div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-1">
                        <div className="text-2xl font-bold text-white">
                          {dashboardData.blogStats?.totalPosts || 0}
                        </div>
                        <span className="text-lg">📝</span>
                      </div>
                      <p className="text-xs text-white/60">
                        {dashboardData.blogStats?.totalViews
                          ? `${dashboardData.blogStats.totalViews} views`
                          : 'total posts'}
                      </p>
                    </>
                  )}
                </div>
                )}

                {/* Travel Plans Card */}
                {isAppSelected('travel-planner') && (
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Plane className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-xs font-semibold text-white/60">Travel Plans</h4>
                  </div>
                  {dashboardData.isLoading ? (
                    <div className="space-y-2">
                      <div className="h-7 w-12 bg-white/20 animate-pulse rounded"></div>
                      <div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-1">
                        <div className="text-2xl font-bold text-white">
                          {dashboardData.travelStats?.totalTrips || 0}
                        </div>
                        <span className="text-lg">✈️</span>
                      </div>
                      <p className="text-xs text-white/60">
                        {dashboardData.travelStats?.upcomingTrips
                          ? `${dashboardData.travelStats.upcomingTrips} upcoming`
                          : 'trips planned'}
                      </p>
                    </>
                  )}
                </div>
                )}

                {/* Todo Tasks Card */}
                {isAppSelected('todo') && (
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-xs font-semibold text-white/60">Todo Tasks</h4>
                  </div>
                  {dashboardData.isLoading ? (
                    <div className="space-y-2">
                      <div className="h-7 w-12 bg-white/20 animate-pulse rounded"></div>
                      <div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-1">
                        <div className="text-2xl font-bold text-white">
                          {dashboardData.todoStats?.completedTasks || 0}
                        </div>
                        <span className="text-lg">✅</span>
                      </div>
                      <p className="text-xs text-white/60">
                        {dashboardData.todoStats?.pendingTasks
                          ? `${dashboardData.todoStats.pendingTasks} pending`
                          : 'completed tasks'}
                      </p>
                    </>
                  )}
                </div>
                )}

                {/* Language Learning Card */}
                {isAppSelected('language-learner') && (
                <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:shadow-lg transition-shadow duration-200 relative">
                  {/* Achievement badge for language milestones */}
                  {!dashboardData.isLoading && dashboardData.languageStats?.wordsLearned >= 1000 && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-fuchsia-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xs">
                          {dashboardData.languageStats.wordsLearned >= 5000 ? '🏆' :
                           dashboardData.languageStats.wordsLearned >= 3000 ? '🌟' : '⭐'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-xs font-semibold text-white/60">Languages</h4>
                  </div>
                  {dashboardData.isLoading ? (
                    <div className="space-y-2">
                      <div className="h-7 w-12 bg-white/20 animate-pulse rounded"></div>
                      <div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2 mb-1">
                        <div className="text-2xl font-bold text-white">
                          {dashboardData.languageStats?.wordsLearned || 0}
                        </div>
                        <span className="text-lg">🌍</span>
                      </div>
                      <p className="text-xs text-white/60">
                        {dashboardData.languageStats?.lessonsCompleted
                          ? `${dashboardData.languageStats.lessonsCompleted} lessons`
                          : 'words learned'}
                      </p>

                      {/* Language level indicator */}
                      {dashboardData.languageStats?.wordsLearned > 0 && (
                        <div className="mt-2">
                          <span className="text-xs font-semibold text-fuchsia-400">
                            {dashboardData.languageStats.wordsLearned >= 5000 ? 'Advanced' :
                             dashboardData.languageStats.wordsLearned >= 3000 ? 'Intermediate' :
                             dashboardData.languageStats.wordsLearned >= 1000 ? 'Elementary' : 'Beginner'}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                )}

              </div>
            </div>
          </div>
        </motion.div>

        {/* Recently Browsed Apps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Grid3X3 className="h-4 w-4 text-white" />
                  </div>
                  {t('dashboard.myApps.title')}
                </h2>
                <p className="text-white/60 mt-2">
                  {t('dashboard.myApps.subtitle')}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span>{t('dashboard.myApps.appsAvailable', { count: filteredUsedApps.length || 0 })}</span>
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            {dashboardData.isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card
                    key={index}
                    className="bg-white/5 backdrop-blur-xl border border-white/10"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-14 h-14 bg-white/20 animate-pulse rounded-2xl" />
                        <div className="space-y-2 w-full">
                          <div className="h-4 bg-white/20 animate-pulse rounded" />
                          <div className="h-3 bg-white/10 animate-pulse rounded" />
                          <div className="h-3 bg-white/10 animate-pulse rounded w-3/4 mx-auto" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {filteredUsedApps && filteredUsedApps.length > 0 ? (
                  filteredUsedApps.map((app, index) => {
                    const config = getAppConfig(app.moduleName || app.module_name);
                    return (
                      <Card
                        key={index}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden"
                        onClick={() => navigate(config.route)}
                      >
                        {/* Subtle background pattern */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-300`} />

                        {/* Top accent line */}
                        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${config.color} opacity-60`} />

                        <CardContent className="p-5 relative">
                          <div className="flex flex-col items-center text-center space-y-3">
                            {/* Icon */}
                            <div className={`w-14 h-14 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-300`}>
                              <config.icon className="h-7 w-7 text-white" />
                            </div>

                            {/* App info */}
                            <div className="space-y-2">
                              <h3 className="font-semibold text-sm text-white leading-tight">
                                {app.displayName || app.display_name}
                              </h3>
                              <p className="text-xs text-white/60 leading-relaxed">
                                {config.description}
                              </p>
                              <div className="flex items-center justify-center gap-1 text-xs text-white/60">
                                <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                                <span>{formatTimeAgo(app.lastActivity || app.last_activity)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Hover indicator */}
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className={`w-6 h-6 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center`}>
                              <Activity className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Grid3X3 className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/60">{t('dashboard.myApps.noApps')}</p>
                    <p className="text-xs text-white/40 mt-2">
                      {t('dashboard.myApps.startUsing')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </motion.div>

        {/* Quick Access Apps (Your Essential Apps) */}
        <QuickAccessApps />

        {/* Today's Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  {t('dashboard.todayActivity.title')}
                </h2>
                <p className="text-white/60 mt-2">
                  {t('dashboard.todayActivity.subtitle')}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                <span>{t('dashboard.todayActivity.liveUpdates')}</span>
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-3">
              {dashboardData.isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10">
                    <div className="w-12 h-12 bg-white/20 animate-pulse rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/20 animate-pulse rounded-lg w-3/4" />
                      <div className="h-3 bg-white/10 animate-pulse rounded-lg w-1/2" />
                    </div>
                    <div className="w-16 h-3 bg-white/20 animate-pulse rounded-lg" />
                  </div>
                ))
              ) : dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                // Real activity items from API
                dashboardData.recentActivities.map((activity) => {
                  const Icon = getActivityIcon(activity.icon);
                  const colors = getActivityColorClasses(activity.iconColor || activity.icon_color);

                  return (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 hover:shadow-sm transition-all duration-200 group cursor-pointer"
                      onClick={() => navigate(activity.link)}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${colors.icon} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200 flex-shrink-0`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white leading-tight">
                          {activity.title}
                        </h4>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed truncate">
                          {activity.description}
                        </p>
                      </div>
                      <div className="text-xs text-white/60 font-medium whitespace-nowrap">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Empty state
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">{t('dashboard.todayActivity.noActivity')}</p>
                  <p className="text-xs text-white/40 mt-2">
                    {t('dashboard.todayActivity.startUsing')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        </motion.div>
        </div>
      </main>
    </div>
    </>
  );
};