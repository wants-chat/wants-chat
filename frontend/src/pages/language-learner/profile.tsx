import React, { useState, useMemo } from 'react';
import { Calendar, Trophy, Target, Clock, Flame, Award, Bell, Crown, Star, TrendingUp, BookOpen, RotateCcw, X, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Switch } from '../../components/ui/switch';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import LanguageFlag from '../../components/language-learner/ui/LanguageFlag';
import XPCounter from '../../components/language-learner/ui/XPCounter';
import StreakCounter from '../../components/language-learner/dashboard/StreakCounter';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { languageApiService, ComprehensiveUserProgress, LessonProgressResponse, VocabularyWord, PaginatedResponse, LearningAnalytics, SimpleAchievement } from '../../services/languageApi';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';

// Import API hooks
import {
  useUserLeaderboardPosition,
  useProgressAnalytics,
  useProgressDashboard,
  useStudySessionStats,
  useVocabularyStats,
  useLessons
} from '../../hooks/language-learner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: Date;
  category: 'streak' | 'xp' | 'lessons' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface LearningStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalLessons: number;
  totalPractice: number;
  averageScore: number;
  timeStudied: number; // in minutes
  wordsLearned: number;
  currentLevel: number;
  joinDate: Date;
  lastActive: Date;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { lessonId } = useSelectedLesson();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [userProgress, setUserProgress] = useState<ComprehensiveUserProgress | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgressResponse | null>(null);
  const [vocabularyData, setVocabularyData] = useState<{ total: number; completed: number } | null>(null);
  const [analyticsData, setAnalyticsData] = useState<LearningAnalytics | null>(null);
  const [achievementsData, setAchievementsData] = useState<SimpleAchievement[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const hasFetchedRef = React.useRef(false);

  // Memoize params to prevent infinite re-renders
  const lessonsParams = useMemo(() => ({ language_code: 'es', limit: 1000 }), []);

  // API Hooks
  const { data: userPosition, isLoading: isLoadingUserPosition, error: userPositionError } = useUserLeaderboardPosition('es');
  const { data: progressAnalytics, isLoading: isLoadingAnalytics } = useProgressAnalytics('es', 30);
  const { data: progressDashboard, isLoading: isLoadingDashboard } = useProgressDashboard('es');
  const { data: studySessionStats, isLoading: isLoadingStudyStats } = useStudySessionStats('es', 30);
  const { stats: vocabularyStats, isLoading: isLoadingVocabStats } = useVocabularyStats('es');
  // const { data: lessonsData, isLoading: isLoadingLessons } = useLessons(lessonsParams);

  // Fetch all data once on mount
  React.useEffect(() => {
    if (!user?.id || !isAuthenticated || hasFetchedRef.current) return;

    const fetchAllData = async () => {
      setIsInitialLoading(true);
      hasFetchedRef.current = true;

      try {
        // Fetch all data in parallel
        const [progress, lessonProg, vocabData, analytics, achievements] = await Promise.all([
          // User progress
          (async () => {
            try {
              const params: any = { include_details: false };
              if (lessonId) params.lesson_id = lessonId;
              return await languageApiService.getComprehensiveUserProgress(user.id, params);
            } catch (error) {
              console.error('Failed to fetch user progress:', error);
              return null;
            }
          })(),
          // Lesson progress
          (async () => {
            try {
              if (!lessonId) return null;
              return await languageApiService.getLessonProgress(user.id, lessonId);
            } catch (error) {
              console.error('Failed to fetch lesson progress:', error);
              return null;
            }
          })(),
          // Vocabulary data
          (async () => {
            try {
              const response = await languageApiService.getVocabulary({
                language_code: 'es',
                page: 1,
                limit: 1000
              });
              return {
                total: response.total,
                completed: response.data.filter(word => word.is_completed).length
              };
            } catch (error) {
              console.error('Failed to fetch vocabulary data:', error);
              return null;
            }
          })(),
          // Analytics data
          (async () => {
            try {
              const params: any = { period: 'all' };
              if (lessonId) params.lesson_id = lessonId;
              return await languageApiService.getLearningAnalytics(user.id, params);
            } catch (error) {
              console.error('Failed to fetch analytics data:', error);
              return null;
            }
          })(),
          // Achievements
          (async () => {
            try {
              return await languageApiService.getAchievements({ language_code: 'es' });
            } catch (error) {
              console.error('Failed to fetch achievements:', error);
              return [];
            }
          })()
        ]);

        setUserProgress(progress);
        setLessonProgress(lessonProg);
        setVocabularyData(vocabData);
        setAnalyticsData(analytics);
        setAchievementsData(achievements);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchAllData();
  }, [user?.id, isAuthenticated, lessonId]);


  // Derive user stats from API data
  const userStats: LearningStats = useMemo(() => {
    if (!userPosition || !progressAnalytics || !studySessionStats || !vocabularyStats) {
      return {
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalLessons: 0,
        totalPractice: 0,
        averageScore: 0,
        timeStudied: 0,
        wordsLearned: 0,
        currentLevel: 1,
        joinDate: new Date(),
        lastActive: new Date()
      };
    }

    return {
      totalXP: userPosition.total_xp || 0,
      currentStreak: userPosition.current_streak || 0,
      longestStreak: userPosition.best_streak || 0,
      totalLessons: userPosition.lessons_completed || 0,
      totalPractice: studySessionStats.totalSessions || 0,
      averageScore: Math.round(studySessionStats.averageAccuracy || 0),
      timeStudied: Math.round(studySessionStats.totalTimeMinutes || 0),
      wordsLearned: vocabularyStats.totalWords || 0,
      currentLevel: Math.floor((userPosition.total_xp || 0) / 1000) + 1,
      joinDate: new Date('2024-01-15'), // This would come from user profile API
      lastActive: new Date()
    };
  }, [userPosition, progressAnalytics, studySessionStats, vocabularyStats]);


  // Derive weekly XP data from analytics API
  const weeklyXp = useMemo(() => {
    if (!analyticsData?.study_time?.daily_breakdown || analyticsData.study_time.daily_breakdown.length === 0) {
      return [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
    }

    const breakdown = analyticsData.study_time.daily_breakdown;
    const weekData = [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

    // Map API dates to correct day positions
    breakdown.forEach(dayData => {
      const date = new Date(dayData.date + 'T00:00:00');
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const arrayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekData[arrayIndex] = dayData.xp || 0;
    });

    return weekData;
  }, [analyticsData]);

  // Derive monthly data from analytics API
  const monthlyData = useMemo(() => {
    if (!analyticsData?.study_time?.daily_breakdown) {
      return [];
    }

    // Group daily breakdown by month
    const monthlyMap = new Map();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    analyticsData.study_time.daily_breakdown.forEach(day => {
      const date = new Date(day.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = monthNames[date.getMonth()];

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthName, xp: 0, lessons: 0 });
      }

      const monthData = monthlyMap.get(monthKey);
      monthData.xp += day.xp;
      monthData.lessons += day.exercises_completed;
    });

    return Array.from(monthlyMap.values()).slice(-6); // Last 6 months
  }, [analyticsData]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 dark:border-gray-600';
      case 'rare':
        return 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'epic':
        return 'border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'legendary':
        return 'border-yellow-400 dark:border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20';
      default:
        return 'border-gray-300 dark:border-gray-600';
    }
  };

  const formatTimeStudied = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const getCurrentLevel = (xp: number) => {
    return Math.floor(xp / 1000) + 1;
  };

  const getXPForNextLevel = (currentXP: number) => {
    const currentLevel = getCurrentLevel(currentXP);
    return currentLevel * 1000;
  };

  // Map icon names to emojis
  const getAchievementIcon = (iconUrl: string | undefined) => {
    if (!iconUrl) return '🏆';
    const iconMap: Record<string, string> = {
      'icon_1': '👶',
      'icon_2': '📚',
      'icon_3': '🎓',
      'icon_4': '💪',
      'icon_5': '⭐',
      'icon_6': '📖',
      'icon_7': '🧠',
      'icon_8': '💰',
      'icon_9': '💎',
      'icon_10': '👑'
    };
    const iconName = iconUrl.split('/').pop()?.replace('.png', '') || '';
    return iconMap[iconName] || '🏆';
  };

  // Loading state
  const isLoading = isLoadingUserPosition || isLoadingAnalytics || isLoadingDashboard || isLoadingStudyStats || isLoadingVocabStats;

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white/70">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Handle error states
  if (userPositionError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="max-w-md mx-auto text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Profile</h2>
          <p className="text-white/60 mb-6">
            {userPositionError.message || 'Failed to load your learning profile.'}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => window.location.reload()} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => navigate('/language-learner/dashboard')} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              Back to Dashboard
            </Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Show loading skeleton while initial data is being fetched
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Learning Profile
          </h1>
          <p className="text-white/60">
            Track your progress and achievements
          </p>
        </div>

        {/* Loading Skeleton */}
        <GlassCard className="animate-pulse" hover={false}>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-white/10 rounded w-48"></div>
              <div className="h-4 bg-white/10 rounded w-32"></div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="animate-pulse" hover={false}>
              <div className="h-4 bg-white/10 rounded w-20 mb-2"></div>
              <div className="h-8 bg-white/10 rounded w-16"></div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <GlassCard key={i} className="animate-pulse" hover={false}>
              <div className="h-5 bg-white/10 rounded w-32 mb-4"></div>
              <div className="h-32 bg-white/10 rounded"></div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Learning Profile
        </h1>
        <p className="text-white/60">
          Track your progress and achievements
        </p>
      </div>

      <div>
        {/* Profile Header */}
        <GlassCard className="mb-6 bg-gradient-to-r from-teal-500/10 to-cyan-500/10" hover={false} glow>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-teal-500/30">
                {(user?.name || 'L').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user?.name || 'Language Learner'}
                </h2>
                <div className="flex items-center space-x-3 mt-2">
                  <LanguageFlag languageCode="es" showName languageName="Spanish" />
                  {userPosition?.rank_position && (
                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                      Rank #{userPosition.rank_position}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {userProgress?.overall_progress?.streak_days ?? 0}
                </div>
                <div className="text-sm text-white/60">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {(userProgress?.overall_progress?.total_points_earned ?? 0).toLocaleString()}
                </div>
                <div className="text-sm text-white/60">Total XP</div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Statistics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Statistics</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Progress */}
              <GlassCard hover={false}>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-white">Course Progress</span>
                </div>
                {!lessonProgress ? (
                  <div className="text-center animate-pulse">
                    <div className="h-8 bg-white/10 rounded w-24 mx-auto mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-32 mx-auto mb-4"></div>
                    <div className="h-3 bg-white/10 rounded w-full"></div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {lessonProgress.lesson_progress.units_completed}/{lessonProgress.lesson_progress.total_units}
                    </div>
                    <div className="text-sm text-white/60 mb-4">
                      Units completed
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${(lessonProgress.lesson_progress.units_completed / lessonProgress.lesson_progress.total_units) * 100}%` }}
                      />
                    </div>
                    <div className="text-center text-xs text-white/40 mt-2">
                      {Math.round((lessonProgress.lesson_progress.units_completed / lessonProgress.lesson_progress.total_units) * 100)}% complete
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Word Learning Progress */}
              <GlassCard hover={false}>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-white">Word Learning Progress</span>
                </div>
                {!vocabularyData ? (
                  <div className="text-center animate-pulse">
                    <div className="h-8 bg-white/10 rounded w-24 mx-auto mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-32 mx-auto mb-4"></div>
                    <div className="h-3 bg-white/10 rounded w-full"></div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {vocabularyData.completed}/{vocabularyData.total}
                    </div>
                    <div className="text-sm text-white/60 mb-4">
                      Words learned
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                        style={{ width: `${(vocabularyData.completed / vocabularyData.total) * 100}%` }}
                      />
                    </div>
                    <div className="text-center text-xs text-white/40 mt-2">
                      {Math.round((vocabularyData.completed / vocabularyData.total) * 100)}% mastered
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Monthly Progress Chart */}
              <GlassCard className="md:col-span-2" hover={false}>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-white">Monthly Progress</span>
                </div>
                {!analyticsData ? (
                  <div className="text-center py-8 text-white/60">Loading monthly progress...</div>
                ) : monthlyData.length === 0 ? (
                  <div className="text-center py-8 text-white/60">No activity data available yet</div>
                ) : (
                  <div className="space-y-4">
                    {monthlyData.map((month, index) => (
                      <div key={`${month.month}-${index}`} className="flex items-center space-x-4">
                        <div className="w-12 text-sm text-white/60">
                          {month.month}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-white">{month.xp} XP</span>
                            <span className="text-white/60">{month.lessons} exercises</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                              style={{ width: `${month.xp > 0 ? Math.min((month.xp / 100) * 100, 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-teal-400" />
            Achievements
          </h2>
          {achievementsData.length === 0 ? (
            <div className="text-center py-8 text-white/60">Loading achievements...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {achievementsData.map((achievement) => (
                <GlassCard
                  key={achievement.id}
                  className={`text-center p-4 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-500/30'
                      : 'opacity-60'
                  }`}
                  hover={false}
                >
                  <div className={`text-4xl mb-2 ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {getAchievementIcon(achievement.icon_url)}
                  </div>
                  <h3 className="font-semibold text-sm text-white mb-1">
                    {achievement.name}
                  </h3>
                  <p className="text-xs text-white/60">
                    {achievement.unlocked_at
                      ? new Date(achievement.unlocked_at).toLocaleDateString()
                      : `${achievement.points} pts`}
                  </p>
                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 h-1.5 rounded-full"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-white/40 mt-1">
                        {achievement.current}/{achievement.target}
                      </p>
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* This Week's Progress Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">This Week's Progress</h2>
          <div className="space-y-6">
            <GlassCard hover={false}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">This Week's Progress</span>
              </div>
              <p className="text-white/60 mb-6">Keep up the momentum!</p>

              {weeklyXp && weeklyXp.length > 0 && weeklyXp.some(xp => xp > 0) ? (
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/10 rounded-xl p-4 border border-teal-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-teal-400" />
                        <p className="text-sm font-medium text-white/70">Total XP</p>
                      </div>
                      <p className="text-3xl font-bold text-teal-400">
                        {weeklyXp.reduce((a, b) => a + b, 0)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="h-4 w-4 text-emerald-400" />
                        <p className="text-sm font-medium text-white/70">Active Days</p>
                      </div>
                      <p className="text-3xl font-bold text-emerald-400">
                        {weeklyXp.filter(xp => xp > 0).length}
                      </p>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  <div className="relative">
                    {/* Y-axis label */}
                    <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
                      <span className="text-sm font-semibold text-white/70">XP</span>
                    </div>

                    {/* Chart area */}
                    <div className="flex gap-4">
                      {/* Y-axis scale */}
                      <div className="flex flex-col-reverse justify-between h-64 py-2 text-xs text-white/60 font-medium">
                        {(() => {
                          const maxXp = Math.max(...weeklyXp) || 1;
                          const step = Math.ceil(maxXp / 5);
                          const scale = Array.from({ length: 6 }, (_, i) => step * i);
                          return scale.map((value, i) => (
                            <div key={i} className="leading-none">{value}</div>
                          ));
                        })()}
                      </div>

                      {/* Chart with grid */}
                      <div className="flex-1 relative">
                        {/* Horizontal grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between py-2">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="border-t border-white/10" />
                          ))}
                        </div>

                        {/* Bars */}
                        <div className="relative h-64 flex items-end justify-around gap-2 px-4">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                            const xpValue = weeklyXp[index] || 0;
                            const maxXp = Math.max(...weeklyXp) || 1;
                            const heightPercent = maxXp > 0 ? (xpValue / maxXp) * 100 : 0;
                            const today = new Date().getDay();
                            const todayIndex = today === 0 ? 6 : today - 1;
                            const isToday = index === todayIndex;

                            const colors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#f97316', '#a855f7', '#ec4899'];
                            const color = colors[index];

                            return (
                              <div key={day} className="flex flex-col items-center flex-1 group">
                                <div className="relative w-full flex flex-col items-center justify-end mb-2" style={{ height: '240px' }}>
                                  {xpValue > 0 && (
                                    <>
                                      <div className="text-xs font-semibold text-white mb-1">
                                        {xpValue}
                                      </div>
                                      <div
                                        className="w-full rounded-sm transition-all duration-300 group-hover:brightness-110 relative"
                                        style={{
                                          height: `${Math.max(heightPercent, 2)}%`,
                                          backgroundColor: color,
                                          border: isToday ? '2px solid currentColor' : 'none',
                                          boxShadow: isToday ? '0 0 0 2px rgba(255,255,255,0.3), 0 0 0 4px currentColor' : 'none'
                                        }}
                                      >
                                        <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm rotate-90">
                                          {day}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                                <span className={`text-sm font-medium mt-1 ${
                                  isToday ? 'text-white font-bold' : 'text-white/60'
                                }`}>
                                  {day}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* X-axis */}
                        <div className="border-t-2 border-white/30 ml-4" />
                      </div>
                    </div>

                    {/* X-axis label */}
                    <div className="text-center mt-3">
                      <span className="text-sm font-semibold text-white/70">Days</span>
                    </div>

                    {/* Y-axis */}
                    <div className="absolute left-12 top-2 bottom-16 w-0.5 bg-white/30" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  No activity this week yet. Start learning to see your progress!
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;