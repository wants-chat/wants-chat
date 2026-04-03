import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../hooks';
import { useSelectedLesson } from '../../hooks/useSelectedLesson';
import { languageApiService, ComprehensiveUserProgress } from '../../services/languageApi';
import type { Lesson } from '../../services/languageLessonsApi';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import Header from '../../components/landing/Header';
import {
  BookOpen,
  Flame,
  Heart,
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
  Gift,
} from 'lucide-react';

const LanguageLearnerDashboard: React.FC = () => {
  console.log('🎯 LanguageLearnerDashboard component rendered');

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  // Temporarily disable useLanguage to prevent infinite loops
  // const { profile, loading, error, updateProfile } = useLanguage();
  const profile = null;
  const loading = false;
  const error = null;
  const { lessonId } = useSelectedLesson();

  console.log('🎯 Dashboard render:', {
    isAuthenticated,
    user: user?.name,
    profile: null,
    lessonId,
    loading,
    error: !!error,
  });
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hasNavigated, setHasNavigated] = useState(false);
  const [userProgress, setUserProgress] = useState<ComprehensiveUserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  // Manual lesson fetching with debugging
  useEffect(() => {
    console.log('Dashboard: lessonId changed to:', lessonId);

    if (lessonId) {
      const hasToken = !!localStorage.getItem('life_os_access_token');
      console.log(
        'Dashboard: Starting manual lesson fetch for ID:',
        lessonId,
        'hasToken:',
        hasToken,
      );

      if (!hasToken) {
        console.log('Dashboard: No token available, cannot fetch lesson');
        setLessonError('Authentication required to load lesson');
        return;
      }

      setLessonLoading(true);
      setLessonError(null);

      // Import and call the API service directly
      import('../../services/languageLessonsApi')
        .then(({ languageLessonsApiService }) => {
          console.log('Dashboard: API service imported, calling getLessonById');
          return languageLessonsApiService.getLessonById(lessonId);
        })
        .then((lesson) => {
          console.log('Dashboard: Lesson fetched successfully:', lesson);
          setSelectedLesson(lesson);
          setLessonLoading(false);
        })
        .catch((error) => {
          console.error('Dashboard: Lesson fetch failed:', error);
          setLessonError(error.message);
          setLessonLoading(false);
        });
    } else {
      console.log('Dashboard: No lessonId, clearing lesson data');
      setSelectedLesson(null);
      setLessonLoading(false);
      setLessonError(null);
    }
  }, [lessonId]);

  // Separate useEffect for navigation logic (runs only when auth state changes)
  useEffect(() => {
    console.log('🎯 Navigation check:', {
      isAuthenticated,
      loading,
      profile: !!profile,
      hasNavigated,
    });

    // Prevent multiple navigations
    if (hasNavigated) return;

    // Only redirect if we're not loading and have determined the final auth state
    if (loading) return; // Still loading, don't make navigation decisions yet

    if (!isAuthenticated) {
      const savedOnboarding = localStorage.getItem('languageLearnerOnboarding');
      const savedUser = localStorage.getItem('languageLearnerUser');

      if (!savedOnboarding && !savedUser) {
        console.log('🎯 Redirecting to onboarding - no auth and no local data');
        setHasNavigated(true);
        navigate('/language-learner/onboarding');
        return;
      }
    }

    // If authenticated but no profile and no localStorage data
    if (isAuthenticated && !profile) {
      const savedOnboarding = localStorage.getItem('languageLearnerOnboarding');
      const savedUser = localStorage.getItem('languageLearnerUser');

      if (!savedOnboarding && !savedUser) {
        console.log('🎯 Redirecting to onboarding - authenticated but no profile or local data');
        setHasNavigated(true);
        navigate('/language-learner/onboarding');
        return;
      }
    }
  }, [isAuthenticated, loading, profile, navigate, hasNavigated]);

  // Separate useEffect for timer (runs once)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []); // Empty dependency array - only run once

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
        params.include_details = false;

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

  if (loading || (lessonId && lessonLoading) || progressLoading) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects variant="subtle" />
        <Header />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
            <span className="ml-4 text-lg text-white/70">
              {progressLoading ? 'Loading progress data...' : lessonId && lessonLoading ? 'Loading lesson data...' : 'Loading language profile...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have data either from API or localStorage
  const savedOnboarding = localStorage.getItem('languageLearnerOnboarding');
  const savedUser = localStorage.getItem('languageLearnerUser');

  console.log('🎯 Dashboard data check:', {
    isAuthenticated,
    hasSavedOnboarding: !!savedOnboarding,
    hasSavedUser: !!savedUser,
    profile: !!profile,
    hasToken: !!localStorage.getItem('life_os_access_token'),
  });

  // Allow showing the dashboard if we have a lesson ID, even without full authentication
  const hasToken = !!localStorage.getItem('life_os_access_token');

  if (!isAuthenticated && !savedOnboarding && !savedUser && !lessonId) {
    console.log('🎯 Dashboard: No auth, no localStorage data, and no lessonId, returning null');
    return null;
  }

  // If we have a lesson ID but no authentication, show a login prompt
  if (!isAuthenticated && !hasToken && lessonId) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects variant="subtle" />
        <Header />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <GlassCard className="max-w-md text-center">
            <h2 className="text-xl font-semibold text-white mb-2">Lesson Available</h2>
            <p className="text-white/60 mb-4">
              You have a lesson selected, but you need to log in to view it.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/auth/login')} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                Log In to View Lesson
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/language-learner/onboarding')}
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Start Fresh
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Use saved data if profile is not available from API
  const userData = profile || (savedUser ? JSON.parse(savedUser) : null);

  if (!userData && !savedOnboarding) {
    return null;
  }

  // Only show error page if both profile and lesson loading failed, and we have no fallback data
  if (error && lessonError && !savedOnboarding && !savedUser) {
    return (
      <div className="min-h-screen relative">
        <BackgroundEffects variant="subtle" />
        <Header />
        <div className="relative z-10 flex items-center justify-center min-h-[80vh]">
          <GlassCard className="text-center max-w-md">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error loading data</h2>
            <p className="text-white/60 mb-4">{lessonError || error}</p>
            <Button onClick={() => navigate('/language-learner/onboarding')} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              Go to Onboarding
            </Button>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Calculate level based on total XP (1 level per 200 XP)
  const calculateLevel = (xp: number): number => {
    return Math.max(1, Math.floor(xp / 200) + 1);
  };

  // Get current lesson progress from API data
  const getCurrentLessonProgress = () => {
    if (!userProgress?.lessons_progress?.length) return null;

    // Find the first in-progress lesson, or the most recently started
    const inProgressLesson = userProgress.lessons_progress.find(l => l.status === 'in_progress');
    if (inProgressLesson) return inProgressLesson;

    // If no in-progress, find the first not-started lesson
    const notStartedLesson = userProgress.lessons_progress.find(l => l.status === 'not_started');
    return notStartedLesson || userProgress.lessons_progress[0];
  };

  // Get upcoming lessons from API data
  const getUpcomingLessons = () => {
    if (!userProgress?.lessons_progress?.length) return [];

    return userProgress.lessons_progress
      .filter(l => l.status !== 'completed')
      .slice(0, 3)
      .map(l => ({
        id: l.lesson_id,
        title: l.title,
        locked: false,
        progress: l.progress_percentage
      }));
  };

  // Generate achievements based on API data
  const generateAchievements = () => {
    const streakDays = userProgress?.overall_progress?.streak_days ?? 0;
    const completedLessons = userProgress?.overall_progress?.completed_lessons ?? 0;
    const totalXp = userProgress?.overall_progress?.total_points_earned ?? 0;

    return [
      {
        id: 1,
        title: 'Week Warrior',
        description: '7-day streak!',
        icon: Flame,
        unlocked: streakDays >= 7
      },
      {
        id: 2,
        title: 'First Crown',
        description: 'Complete your first lesson',
        icon: Crown,
        unlocked: completedLessons >= 1
      },
      {
        id: 3,
        title: 'XP Master',
        description: 'Earn 1000 XP',
        icon: Zap,
        unlocked: totalXp >= 1000
      },
    ];
  };

  const currentLessonProgress = getCurrentLessonProgress();
  const totalXp = userProgress?.overall_progress?.total_points_earned ?? 0;

  // Use real API data - fallback to 0 for missing data
  const dashboardData = {
    streak: userProgress?.overall_progress?.streak_days ?? 0,
    xp: totalXp,
    level: calculateLevel(totalXp),
    todayProgress: Math.min(userProgress?.overall_progress?.total_time_spent ?? 0, 60), // minutes today (capped at 60)
    todayGoal: selectedLesson?.metadata?.onboarding_preferences?.dailyGoal || 15,
    weeklyXp: [], // Will be empty if not available from API
    currentLesson: currentLessonProgress ? {
      id: currentLessonProgress.lesson_id,
      title: currentLessonProgress.title,
      description: selectedLesson?.description || 'Continue your learning journey',
      progress: currentLessonProgress.progress_percentage,
      estimatedTime: selectedLesson?.duration_minutes || 10,
      difficulty: selectedLesson?.difficulty || 'Beginner',
      xpReward: 15,
    } : {
      id: selectedLesson?.id || '',
      title: selectedLesson?.title || 'Start Learning',
      description: selectedLesson?.description || 'Begin your language journey',
      progress: 0,
      estimatedTime: selectedLesson?.duration_minutes || 10,
      difficulty: selectedLesson?.difficulty || 'Beginner',
      xpReward: 15,
    },
    recentAchievements: generateAchievements(),
    upcomingLessons: getUpcomingLessons(),
    weeklyGoal: {
      target: 5, // lessons per week
      completed: userProgress?.overall_progress?.completed_lessons ?? 0,
      remaining: Math.max(0, 5 - (userProgress?.overall_progress?.completed_lessons ?? 0)),
    },
    friends: [], // Friends feature not yet implemented - show empty
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    if (dashboardData.todayProgress >= dashboardData.todayGoal) {
      return "Amazing! You've reached your daily goal! 🎉";
    }
    if (dashboardData.todayProgress > 0) {
      const remaining = dashboardData.todayGoal - dashboardData.todayProgress;
      return `Great start! Just ${remaining} more minutes to reach your goal.`;
    }
    return 'Ready to start your learning session today?';
  };

  const progressPercentage = Math.min((dashboardData.todayProgress / dashboardData.todayGoal) * 100, 100);

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-teal-500/20 rounded-2xl">
              <BookOpen className="h-10 w-10 text-teal-400" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Language Learning Dashboard
          </h1>
          <p className="text-lg text-white/60">
            {getGreeting()}, {user?.name || 'Learner'}! {getMotivationalMessage()}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <GlassCard className="text-center" hover={false} glow>
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
                <Flame className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{dashboardData.streak}</div>
            <div className="text-sm text-white/60">Day Streak</div>
          </GlassCard>

          <GlassCard className="text-center" hover={false} glow>
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500">
                <Crown className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{dashboardData.xp.toLocaleString()}</div>
            <div className="text-sm text-white/60">Total XP</div>
          </GlassCard>

          <GlassCard className="text-center" hover={false} glow>
            <div className="flex justify-center mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{dashboardData.level}</div>
            <div className="text-sm text-white/60">Level</div>
          </GlassCard>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Goal Progress */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-white">Daily Goal</span>
                </div>
                <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30">
                  {dashboardData.todayProgress}/{dashboardData.todayGoal} min
                </Badge>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Progress</span>
                    <span className="font-medium text-white">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                {dashboardData.todayProgress >= dashboardData.todayGoal ? (
                  <div className="flex items-center text-emerald-400 text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Goal completed! Bonus XP earned!
                  </div>
                ) : (
                  <div className="text-sm text-white/60">
                    Keep going! {dashboardData.todayGoal - dashboardData.todayProgress} minutes to reach your
                    goal.
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Continue Learning */}
            <GlassCard className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10" hover={false} glow>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">
                  {selectedLesson ? 'Selected Lesson' : 'Continue Learning'}
                </span>
              </div>
              <p className="text-white/60 mb-4">
                {selectedLesson ? 'Ready to start your lesson' : 'Pick up where you left off'}
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">
                      {selectedLesson?.title || dashboardData.currentLesson.title}
                    </h3>
                    <p className="text-sm text-white/60">
                      {selectedLesson?.description || dashboardData.currentLesson.description}
                    </p>
                    {selectedLesson && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-white/10 text-white/80 border-white/20 text-xs">
                          {selectedLesson.language_code?.toUpperCase() || 'N/A'}
                        </Badge>
                        <Badge className="bg-white/10 text-white/80 border-white/20 text-xs">
                          {selectedLesson.skill || 'N/A'}
                        </Badge>
                        {selectedLesson.tags?.slice(0, 2).map((tag) => (
                          <Badge key={tag} className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 mb-2">
                      {selectedLesson?.difficulty || dashboardData.currentLesson.difficulty}
                    </Badge>
                    <div className="text-sm text-white/60">
                      ~{selectedLesson?.duration_minutes || dashboardData.currentLesson.estimatedTime}{' '}
                      min
                    </div>
                  </div>
                </div>

                {!selectedLesson && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Lesson Progress</span>
                      <span className="font-medium text-white">{dashboardData.currentLesson.progress}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${dashboardData.currentLesson.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {selectedLesson && selectedLesson.content && selectedLesson.content.length > 0 && (
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <p className="text-sm font-medium text-white mb-1">Lesson Preview:</p>
                    <p className="text-sm text-white/60">
                      {selectedLesson.content[0]?.data?.text}
                    </p>
                    {selectedLesson.content[0]?.data?.translation && (
                      <p className="text-xs text-teal-400 mt-1 italic">
                        {selectedLesson.content[0].data.translation}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  className="w-full h-12 text-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  onClick={() => {
                    if (lessonId) {
                      navigate(`/language-learner/learning?lesson_id=${lessonId}`);
                    } else {
                      navigate('/language-learner/learning');
                    }
                  }}
                >
                  <Play className="h-5 w-5 mr-2" />
                  {lessonId ? 'Start Lesson' : 'Continue Lesson'} (+
                  {dashboardData.currentLesson.xpReward} XP)
                </Button>
              </div>
            </GlassCard>

            {/* Upcoming Lessons */}
            <GlassCard hover={false}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Up Next</span>
              </div>
              <p className="text-white/60 mb-4">Ready for your next challenge?</p>
              <div className="space-y-3">
                {dashboardData.upcomingLessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                      lesson.locked
                        ? 'bg-white/5'
                        : 'bg-white/10 hover:bg-white/15 cursor-pointer border border-white/10 hover:border-white/20'
                    }`}
                    onClick={
                      !lesson.locked
                        ? () => {
                            if (lessonId) {
                              navigate(`/language-learner/learning?lesson_id=${lessonId}`);
                            } else {
                              navigate('/language-learner/lesson');
                            }
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          lesson.locked ? 'bg-white/10' : 'bg-gradient-to-r from-teal-500 to-cyan-500'
                        }`}
                      >
                        {lesson.locked ? (
                          <Lock className="h-5 w-5 text-white/40" />
                        ) : lesson.progress > 0 ? (
                          <BookOpen className="h-5 w-5 text-white" />
                        ) : (
                          <Play className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h4
                          className={`font-medium ${
                            lesson.locked ? 'text-white/40' : 'text-white'
                          }`}
                        >
                          {lesson.title}
                        </h4>
                        {lesson.progress > 0 && (
                          <div className="text-xs text-white/60">
                            {lesson.progress}% completed
                          </div>
                        )}
                      </div>
                    </div>
                    {!lesson.locked && <ArrowRight className="h-4 w-4 text-white/60" />}
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Recent Achievements */}
            <GlassCard hover={false}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Recent Achievements</span>
              </div>
              <div className="space-y-3">
                {dashboardData.recentAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                        achievement.unlocked
                          ? 'bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          achievement.unlocked
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500'
                            : 'bg-white/10'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${achievement.unlocked ? 'text-white' : 'text-white/40'}`} />
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            achievement.unlocked ? 'text-white' : 'text-white/40'
                          }`}
                        >
                          {achievement.title}
                        </h4>
                        <p className="text-sm text-white/60">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && <CheckCircle className="h-5 w-5 text-emerald-400" />}
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <GlassCard hover={false}>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  onClick={() => {
                    if (lessonId) {
                      navigate(`/language-learner/learning?lesson_id=${lessonId}`);
                    } else {
                      navigate('/language-learner/practice');
                    }
                  }}
                >
                  <Target className="h-5 w-5 mr-3 text-teal-400" />
                  {lessonId ? 'View Lesson Units' : 'Practice Weak Skills'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  onClick={() => navigate('/language-learner/sounds')}
                >
                  <Volume2 className="h-5 w-5 mr-3 text-teal-400" />
                  Pronunciation Practice
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  onClick={() => navigate('/language-learner/stories')}
                >
                  <MessageCircle className="h-5 w-5 mr-3 text-teal-400" />
                  Read Stories
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30"
                  onClick={() => navigate('/language-learner/vocabulary')}
                >
                  <BookOpen className="h-5 w-5 mr-3 text-teal-400" />
                  Review Vocabulary
                </Button>
              </div>
            </GlassCard>

            {/* Weekly Goal */}
            <GlassCard hover={false}>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Weekly Goal</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">Lessons completed</span>
                  <span className="font-medium text-white">
                    {dashboardData.weeklyGoal.completed}/{dashboardData.weeklyGoal.target}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${(dashboardData.weeklyGoal.completed / dashboardData.weeklyGoal.target) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-white/60">
                  {dashboardData.weeklyGoal.remaining} more lessons to reach your weekly goal!
                </div>
              </div>
            </GlassCard>

            {/* Friends Leaderboard */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-white">Friends</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-teal-400 hover:text-teal-300 hover:bg-white/5"
                  onClick={() => navigate('/language-learner/leaderboard')}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3">
                {dashboardData.friends.map((friend, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{friend.avatar}</span>
                      <div>
                        <h4 className="font-medium text-white">{friend.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-white/60">
                          <Crown className="h-3 w-3 text-yellow-400" />
                          <span>{friend.xp.toLocaleString()} XP</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Flame className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-white">{friend.streak}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Study Reminder */}
            <GlassCard className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10" hover={false} glow>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">Perfect Time to Learn!</h3>
                <p className="text-sm text-white/60 mb-4">
                  Studies show that learning before {selectedLesson?.metadata?.onboarding_preferences?.reminderTime || '7:00 PM'}{' '}
                  improves retention by 40%.
                </p>
                <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                  Start Session
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageLearnerDashboard;
