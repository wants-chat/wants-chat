// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';
import { Lesson, languageLessonsApiService } from '../../services/languageLessonsApi';
import { languageApiService, ComprehensiveUserProgress, SimpleLeaderboardEntry, SimpleAchievement, LearningAnalytics } from '../../services/languageApi';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { GlassCard } from '../../components/ui/GlassCard';
import {
  BookOpen,
  Flame,
  Crown,
  Target,
  Trophy,
  Calendar,
  TrendingUp,
  Play,
  Lock,
  CheckCircle,
  Star,
  Clock,
  Volume2,
  MessageCircle,
  Award,
  Users,
  BarChart3,
  ArrowRight,
  Zap,
  Gift
} from 'lucide-react';

const LanguageLearnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { lessonId } = useSelectedLesson();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userProgress, setUserProgress] = useState<ComprehensiveUserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<SimpleLeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<SimpleAchievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [achievementsError, setAchievementsError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has completed onboarding
    const savedOnboarding = localStorage.getItem('languageLearnerOnboarding');
    const savedUser = localStorage.getItem('languageLearnerUser');

    if (!savedOnboarding && !savedUser) {
      navigate('/language-learner/onboarding');
      return;
    }

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Fetch user progress data
  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user?.id || !isAuthenticated) return;

      setProgressLoading(true);
      setProgressError(null);

      try {
        const params: any = {};
        if (lessonId) {
          params.lesson_id = lessonId;
        }
        params.include_details = false; // Set to true if you want detailed exercise progress

        const progress = await languageApiService.getComprehensiveUserProgress(user.id, params);
        setUserProgress(progress);
      } catch (error) {
        console.error('Failed to fetch user progress:', error);
        setProgressError(error instanceof Error ? error.message : 'Failed to load progress data');
      } finally {
        setProgressLoading(false);
      }
    };

    fetchUserProgress();
  }, [user?.id, isAuthenticated, lessonId]);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!isAuthenticated) return;

      setLeaderboardLoading(true);
      setLeaderboardError(null);

      try {
        const leaderboardData = await languageApiService.getLeaderboard({
          page: 1,
          limit: 5, // Only fetch top 5 for dashboard preview
          sort_by: 'total_points',
          sort_order: 'desc',
          period: 'all_time'
        });
        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setLeaderboardError(error instanceof Error ? error.message : 'Failed to load leaderboard');
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboard();
  }, [isAuthenticated]);

  // Fetch achievements data
  useEffect(() => {
    const fetchAchievements = async () => {
      if (!isAuthenticated) return;

      setAchievementsLoading(true);
      setAchievementsError(null);

      try {
        const savedOnboarding = localStorage.getItem('languageLearnerOnboarding');
        const onboardingData = savedOnboarding ? JSON.parse(savedOnboarding) : null;
        const targetLanguageCode = onboardingData?.targetLanguage || 'es'; // Default to Spanish

        const achievementsData = await languageApiService.getAchievements({
          language_code: targetLanguageCode
        });
        setAchievements(achievementsData);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
        setAchievementsError(error instanceof Error ? error.message : 'Failed to load achievements');
      } finally {
        setAchievementsLoading(false);
      }
    };

    fetchAchievements();
  }, [isAuthenticated]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.id || !isAuthenticated) return;

      setAnalyticsLoading(true);
      setAnalyticsError(null);

      try {
        const analyticsData = await languageApiService.getLearningAnalytics(user.id, {
          period: '7d' // 7 days for weekly analytics
        });
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setAnalyticsError(error instanceof Error ? error.message : 'Failed to load analytics');
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id, isAuthenticated]);

  // Fetch lesson data when lessonId is available
  useEffect(() => {
    if (lessonId) {
      const hasToken = !!localStorage.getItem('life_os_access_token');

      if (!hasToken) {
        return;
      }

      setLessonLoading(true);

      // Call the API service directly
      languageLessonsApiService.getLessonById(lessonId)
        .then((lesson) => {
          setSelectedLesson(lesson);
          setLessonLoading(false);
        })
        .catch((error) => {
          console.error('Dashboard: Lesson fetch failed:', error);
          setLessonLoading(false);
        });
    } else {
      setSelectedLesson(null);
      setLessonLoading(false);
    }
  }, [lessonId]);

  // Get saved user data from localStorage
  const savedOnboarding = localStorage.getItem('languageLearnerOnboarding');
  const savedUser = localStorage.getItem('languageLearnerUser');
  
  if (!savedOnboarding && !savedUser) {
    return null;
  }

  const onboardingData = savedOnboarding ? JSON.parse(savedOnboarding) : null;
  const userData = savedUser ? JSON.parse(savedUser) : null;

  // Determine daily goal source
  const lessonDailyGoal = selectedLesson?.metadata?.onboarding_preferences?.dailyGoal;
  const localDailyGoal = onboardingData?.dailyGoal;
  const finalDailyGoal = lessonDailyGoal || localDailyGoal || 15;

  // Memoize weekly XP calculation to prevent double loading
  const weeklyXp = useMemo(() => {
    // Try to get real analytics data first
    if (analytics?.study_time?.daily_breakdown && analytics.study_time.daily_breakdown.length > 0) {
      const breakdown = analytics.study_time.daily_breakdown;

      // Initialize week array [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
      const weekData = [0, 0, 0, 0, 0, 0, 0];

      // Map API dates to correct day positions
      breakdown.forEach(dayData => {
        const date = new Date(dayData.date + 'T00:00:00'); // Add time to avoid timezone issues
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Convert to our array index: Monday=0, Tuesday=1, ..., Sunday=6
        const arrayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // Use points_earned or total_minutes or exercises_completed as XP proxy
        const dailyXP = dayData.points_earned || (dayData.total_minutes * 5) || (dayData.exercises_completed * 10) || 0;

        weekData[arrayIndex] = dailyXP;
      });

      return weekData;
    }

    // Fallback: Create a week with some activity for today
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekData = [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun

    // Map Sunday (0) to index 6, Monday (1) to index 0, etc.
    const todayIndex = today === 0 ? 6 : today - 1;

    // Add some XP for today if we have any progress indicators
    if (userProgress?.overall_progress?.total_points_earned > 0) {
      weekData[todayIndex] = userProgress.overall_progress.total_points_earned; // Show actual total XP for today
    }

    return weekData;
  }, [analytics, userProgress?.overall_progress?.total_points_earned, analyticsLoading]);

  // Use only real API data - no mock data
  const dashboardData = useMemo(() => ({
    streak: userProgress?.overall_progress?.streak_days || 0,
    xp: userProgress?.overall_progress?.total_points_earned || 0,
    level: Math.floor((userProgress?.overall_progress?.total_points_earned || 0) / 100) + 1,
    todayProgress: analytics?.study_time?.total_minutes || 0,
    todayGoal: finalDailyGoal,
    weeklyXp,
    currentLesson: selectedLesson ? {
      title: selectedLesson.title,
      progress: 0, // Calculate from user progress if needed
      nextLesson: 'Continue Learning'
    } : null,
    achievements: achievements.map(achievement => ({
      title: achievement.name,
      icon: achievement.unlocked ? Star : BookOpen,
      unlocked: achievement.unlocked,
      description: achievement.description,
      points: achievement.points,
      progress: achievement.progress || 0,
      target: achievement.target || 100
    })),
    friends: leaderboard.map((entry, index) => ({
      name: entry.user_id === user?.id ? 'Me' : entry.username,
      xp: entry.total_points,
      avatar: entry.profile_image || '👤',
      rank: entry.rank,
      isUser: entry.user_id === user?.id
    }))
  }), [userProgress, analytics, finalDailyGoal, weeklyXp, selectedLesson, achievements, leaderboard, user?.id]);

  // Language mapping
  const languages: { [key: string]: { name: string; flag: string } } = {
    'es': { name: 'Spanish', flag: '🇪🇸' },
    'fr': { name: 'French', flag: '🇫🇷' },
    'de': { name: 'German', flag: '🇩🇪' },
    'it': { name: 'Italian', flag: '🇮🇹' },
    'pt': { name: 'Portuguese', flag: '🇵🇹' },
    'ja': { name: 'Japanese', flag: '🇯🇵' },
    'ko': { name: 'Korean', flag: '🇰🇷' },
    'zh': { name: 'Chinese', flag: '🇨🇳' },
    'ru': { name: 'Russian', flag: '🇷🇺' },
    'ar': { name: 'Arabic', flag: '🇸🇦' },
    'hi': { name: 'Hindi', flag: '🇮🇳' },
    'nl': { name: 'Dutch', flag: '🇳🇱' }
  };

  const targetLanguage = languages[onboardingData?.targetLanguage] || { name: 'Spanish', flag: '🇪🇸' };

  const getTimeOfDayGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const progressPercentage = Math.round((dashboardData.todayProgress / dashboardData.todayGoal) * 100);

  // Show loading state
  if (progressLoading || lessonLoading || leaderboardLoading || achievementsLoading || analyticsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
        <span className="ml-4 text-lg text-white/70">Loading dashboard...</span>
      </div>
    );
  }

  // Show error state
  if (progressError || leaderboardError || achievementsError || analyticsError) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <GlassCard className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Error loading data</h2>
          <p className="text-white/60 mb-4">
            {progressError || leaderboardError || achievementsError || analyticsError}
          </p>
          <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
            Try Again
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {getTimeOfDayGreeting()}, {userData?.name || 'Learner'}!
            </h1>
            <p className="text-white/60">
              {selectedLesson ? selectedLesson.title : `Let's continue your ${targetLanguage.name} journey`}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <GlassCard className="text-center px-4 py-2" hover={false}>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-2xl font-bold text-white">{dashboardData.streak}</span>
              </div>
              <span className="text-xs text-white/60">day streak</span>
            </GlassCard>
            <GlassCard className="text-center px-4 py-2" hover={false}>
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{dashboardData.xp}</span>
              </div>
              <span className="text-xs text-white/60">total XP</span>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                {selectedLesson ? 'Selected Lesson' : 'Continue Learning'}
              </span>
            </div>
            {selectedLesson ? (
              // Show real lesson data
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-1">{selectedLesson.title}</h3>
                  <p className="text-sm text-white/60">{selectedLesson.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="text-xs bg-white/10 text-white/70 border-white/20">
                      {selectedLesson.language_code?.toUpperCase() || 'N/A'}
                    </Badge>
                    <Badge className="text-xs bg-white/10 text-white/70 border-white/20">
                      {selectedLesson.skill || 'N/A'}
                    </Badge>
                    <Badge className="text-xs bg-teal-500/20 text-teal-300 border-teal-500/30">
                      {selectedLesson.difficulty || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  size="lg"
                  onClick={() => {
                    if (lessonId) {
                      navigate(`/language-learner/learning?lesson_id=${lessonId}`);
                    } else {
                      navigate('/language-learner/learning');
                    }
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Lesson
                </Button>
              </>
            ) : dashboardData.currentLesson ? (
              // Show current lesson progress
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{dashboardData.currentLesson.title}</h3>
                    <p className="text-sm text-white/60">{dashboardData.currentLesson.nextLesson}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-400 mb-1">
                      {dashboardData.currentLesson.progress}%
                    </div>
                    <span className="text-xs text-white/60">Complete</span>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                    style={{ width: `${dashboardData.currentLesson.progress}%` }}
                  />
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  size="lg"
                  onClick={() => navigate('/language-learner/learning')}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Continue Lesson
                </Button>
              </>
            ) : (
              // No lesson selected
              <div className="text-center py-4">
                <div className="text-4xl mb-2">📚</div>
                <h3 className="text-lg font-semibold text-white mb-1">Ready to Learn?</h3>
                <p className="text-sm text-white/60 mb-4">Select a lesson to continue your journey</p>
                <Button
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  size="lg"
                  onClick={() => navigate('/language-learner/learning')}
                >
                  Browse Lessons
                </Button>
              </div>
            )}
          </GlassCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard
              className="cursor-pointer text-center"
              hover={true}
              onClick={() => navigate('/language-learner/practice')}
            >
              <Target className="h-8 w-8 text-teal-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-white">Practice</span>
            </GlassCard>
            <GlassCard
              className="cursor-pointer text-center"
              hover={true}
              onClick={() => navigate('/language-learner/stories')}
            >
              <MessageCircle className="h-8 w-8 text-teal-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-white">Stories</span>
            </GlassCard>
            <GlassCard
              className="cursor-pointer text-center"
              hover={true}
              onClick={() => navigate('/language-learner/sounds')}
            >
              <Volume2 className="h-8 w-8 text-teal-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-white">Sounds</span>
            </GlassCard>
            <GlassCard
              className="cursor-pointer text-center"
              hover={true}
              onClick={() => navigate('/language-learner/vocabulary')}
            >
              <BookOpen className="h-8 w-8 text-teal-400 mx-auto mb-2" />
              <span className="text-sm font-medium text-white">Vocabulary</span>
            </GlassCard>
          </div>

          {/* Weekly Progress */}
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold text-white">This Week's Progress</span>
                <p className="text-sm text-white/60">Keep up the momentum!</p>
              </div>
            </div>
            {dashboardData.weeklyXp && dashboardData.weeklyXp.length > 0 && dashboardData.weeklyXp.some(xp => xp > 0) ? (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-teal-500/10 rounded-xl p-4 border border-teal-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-teal-400" />
                      <p className="text-sm font-medium text-white/70">Total XP</p>
                    </div>
                    <p className="text-3xl font-bold text-teal-400">
                      {dashboardData.weeklyXp.reduce((a, b) => a + b, 0)}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="h-4 w-4 text-emerald-400" />
                      <p className="text-sm font-medium text-white/70">Active Days</p>
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">
                      {dashboardData.weeklyXp.filter(xp => xp > 0).length}
                    </p>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="relative h-48 flex items-end justify-around gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const xpValue = dashboardData.weeklyXp[index] || 0;
                    const maxXp = Math.max(...dashboardData.weeklyXp) || 1;
                    const heightPercent = maxXp > 0 ? (xpValue / maxXp) * 100 : 0;
                    const today = new Date().getDay();
                    const todayIndex = today === 0 ? 6 : today - 1;
                    const isToday = index === todayIndex;

                    return (
                      <div key={day} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full flex flex-col items-center justify-end mb-2" style={{ height: '140px' }}>
                          {xpValue > 0 && (
                            <div className="text-xs font-semibold text-white/70 mb-1">
                              {xpValue}
                            </div>
                          )}
                          <div
                            className={`w-full max-w-8 rounded-t transition-all duration-300 ${isToday ? 'bg-gradient-to-t from-teal-500 to-cyan-500' : 'bg-white/20'}`}
                            style={{
                              height: `${Math.max(heightPercent, 5)}%`,
                            }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${isToday ? 'text-teal-400' : 'text-white/50'}`}>
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <div className="p-4 rounded-full bg-white/5 mb-3">
                  <BarChart3 className="h-8 w-8 text-white/30" />
                </div>
                <p className="text-sm font-medium text-white/60 mb-1">No progress data yet</p>
                <p className="text-xs text-white/40">Start learning to see your weekly progress!</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Leaderboard Preview */}
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Leaderboard</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
                onClick={() => navigate('/language-learner/leaderboard')}
              >
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {dashboardData.friends.map((friend) => (
                <div
                  key={friend.rank}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    friend.isUser ? 'bg-teal-500/20 border border-teal-500/30' : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white/60">
                      {friend.rank}
                    </span>
                    <span className="text-2xl">{friend.avatar}</span>
                    <span className="font-medium text-white">{friend.name}</span>
                  </div>
                  <span className="font-semibold text-teal-400">{friend.xp} XP</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Achievements */}
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Achievements</span>
              </div>
              <Badge className="bg-white/10 text-white/70 border-white/20">Level {dashboardData.level}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {dashboardData.achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg text-center border ${
                      achievement.unlocked
                        ? 'bg-teal-500/10 border-teal-500/20'
                        : 'bg-white/5 border-white/10 opacity-60'
                    }`}
                    title={achievement.description}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${
                      achievement.unlocked ? 'text-teal-400' : 'text-white/30'
                    }`} />
                    <span className="text-xs font-medium block text-white">
                      {achievement.title}
                    </span>
                    {achievement.points && (
                      <span className="text-xs text-white/50 block mt-1">
                        {achievement.points} pts
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default LanguageLearnerDashboard;