import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Calendar,
  Flame,
  Target,
  Settings,
  Download,
  ArrowLeft,
  Camera,
  Pencil,
} from 'lucide-react';
import Icon from '@mdi/react';
import { mdiMeditation } from '@mdi/js';
import { meditationService } from '../../services/meditationService';
import { useAuth } from '../../contexts/AuthContext';

// Import extracted components
import { QuickStats } from '../../components/meditation/QuickStats';
import { WeeklyProgress } from '../../components/meditation/WeeklyProgress';
import { RecentSessions } from '../../components/meditation/RecentSessions';
import { Achievements } from '../../components/meditation/Achievements';
import { MeditationCalendar } from '../../components/meditation/MeditationCalendar';

interface UserMeditationData {
  name: string;
  email: string;
  memberSince: string;
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageSession: number;
  thisWeekMinutes: number;
  thisMonthMinutes: number;
  favoriteTime: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  profileImage?: string;
}

const MeditationProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Calendar state - will be set based on available session data

  // Profile state
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);

  // API Data state
  const [userData, setUserData] = useState<UserMeditationData | null>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [historySessions, setHistorySessions] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState(120);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile data on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch enhanced stats and streak data separately
        let enhancedStats: any = {
          total_sessions: 0,
          total_minutes: 0,
          average_session_length: 0,
          preferredTimeOfDay: 'Morning',
          level: 1,
          xp: 0,
          nextLevelXp: 100,
        };

        let streakData: any = {
          current_streak: 0,
          longest_streak: 0,
          last_meditation_date: null,
          is_streak_at_risk: false,
          days_since_last_meditation: 0,
        };

        try {
          // Fetch enhanced stats from the correct endpoint
          const [statsResponse, streakResponse] = await Promise.allSettled([
            meditationService.getEnhancedStats('week'),
            meditationService.getMeditationStreak(),
          ]);

          if (statsResponse.status === 'fulfilled') {
            enhancedStats = statsResponse.value;
          } else {
            console.warn('Failed to fetch enhanced stats:', statsResponse.reason);
          }

          if (streakResponse.status === 'fulfilled') {
            streakData = streakResponse.value;
          } else {
            console.warn('Failed to fetch streak data:', streakResponse.reason);
          }
        } catch (err) {
          console.warn('Failed to fetch meditation data:', err);
        }

        // Load ALL meditation sessions from API for comprehensive processing
        let allSessionsData: any[] = [];
        setSessionsLoading(true);
        try {
          // Start with a reasonable batch size
          const batchSize = 100;
          let page = 1;
          let hasMoreData = true;

          while (hasMoreData) {
            const batch = await meditationService.getMeditationSessions({
              page,
              limit: batchSize,
              order: 'desc',
            });

            if (batch.data && batch.data.length > 0) {
              allSessionsData = allSessionsData.concat(batch.data);

              // Calculate total pages from total and limit
              const totalPages = Math.ceil(batch.total / batch.limit);

              // Check if we've reached the end
              if (batch.data.length < batchSize || page >= totalPages) {
                hasMoreData = false;
              } else {
                page++;
              }
            } else {
              hasMoreData = false;
            }
          }
        } catch (sessionsErr) {
          console.warn('Failed to fetch all sessions:', sessionsErr);
        } finally {
          setSessionsLoading(false);
        }

        // Fetch goals to get weekly goal target
        let weeklyGoalValue = 120;
        try {
          const goals = await meditationService.getMeditationGoals();
          const weeklyGoal = goals.find(
            (g) => g.goal_type === 'weekly_minutes' && g.status === 'active',
          );
          if (weeklyGoal) {
            weeklyGoalValue = weeklyGoal.target_value;
          }
        } catch (goalErr) {
          console.warn('Failed to fetch goals:', goalErr);
        }

        // Map API data to UI format using correct field names
        // Enhanced stats already includes basic stats from getMeditationStats
        const userProfileData: UserMeditationData = {
          name: user?.name || '', // Use actual logged-in user's name
          email: user?.email || '', // Use actual logged-in user's email
          memberSince: user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
            : '',
          // Use enhanced stats which already include streak data from getMeditationStats
          totalSessions: enhancedStats.total_sessions || 0,
          totalMinutes: enhancedStats.total_minutes || 0,
          currentStreak: enhancedStats.current_streak || streakData.currentStreak || streakData.current_streak || 0,
          longestStreak: enhancedStats.longest_streak || streakData.longestStreak || streakData.longest_streak || 0,
          averageSession: Math.round(enhancedStats.average_session_length || 0),
          thisWeekMinutes: enhancedStats.total_minutes || 0, // Using weekly stats
          thisMonthMinutes: enhancedStats.total_minutes || 0, // Would need monthly endpoint
          favoriteTime: enhancedStats.preferredTimeOfDay || '',
          level: enhancedStats.level || 1,
          xp: enhancedStats.xp || 0,
          nextLevelXp: enhancedStats.nextLevelXp || 100,
          profileImage: user?.avatarUrl, // Use actual logged-in user's avatar
        };

        // Process achievements from API - define all possible achievements
        const allPossibleAchievements = [
          { type: 'first_session', title: 'First Steps', description: 'Complete your first meditation session', icon: '🎯' },
          { type: 'week_streak', title: 'Week Warrior', description: 'Maintain a 7-day meditation streak', icon: '🔥' },
          { type: 'ten_hours', title: 'Dedicated Practitioner', description: 'Meditate for a total of 10 hours', icon: '⏰' },
          { type: 'level_5', title: 'Rising Star', description: 'Reach level 5', icon: '⭐' },
          { type: 'month_streak', title: 'Mindful Month', description: '30 day streak', icon: '📅' },
          { type: 'century_club', title: 'Century Club', description: '100 total sessions', icon: '💯' },
          { type: 'zen_master', title: 'Zen Master', description: '1000 minutes meditated', icon: '🧘' },
          { type: 'early_bird', title: 'Early Bird', description: '10 morning sessions', icon: '🌅' },
        ];

        // Get unlocked achievements from API (already in enhancedStats.achievements)
        const unlockedAchievements = enhancedStats.achievements || [];

        // Map all achievements with their unlocked status
        const mappedAchievements = allPossibleAchievements.map((achievement, index) => {
          const unlocked = unlockedAchievements.find((a: any) =>
            (a.type || a.achievement_type) === achievement.type || a.name === achievement.title
          );
          return {
            id: index + 1,
            title: achievement.title,
            description: achievement.description,
            icon: unlocked?.icon || achievement.icon,
            unlocked: !!unlocked,
            date: unlocked?.unlockedAt
              ? new Date(unlocked.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : undefined,
          };
        });

        setAchievements(mappedAchievements);

        console.log('🧘 Enhanced stats from API:', enhancedStats);
        console.log('🔥 Streak data from API:', streakData);

        // Process all sessions data for different purposes

        // Filter completed sessions for calculations
        const completedSessions = allSessionsData.filter((s) => s.completed === true);

        // Set all data for different uses
        setAllSessions(allSessionsData);
        setHistorySessions(allSessionsData); // Use all sessions for history calendar

        // Get recent sessions (last 10)
        const recentSessionsData = allSessionsData.slice(0, 10);
        setRecentSessions(recentSessionsData);

        // Calculate weekly data and goal
        const weeklyDataCalculated = calculateWeeklyData(allSessionsData);
        setWeeklyData(weeklyDataCalculated);
        setWeeklyGoal(weeklyGoalValue);

        // Calculate actual weekly progress from all sessions
        const weeklyMinutes = weeklyDataCalculated.reduce((total, day) => total + day.minutes, 0);

        // Update user data with actual weekly progress
        userProfileData.thisWeekMinutes = weeklyMinutes;

        // Calculate enhanced user stats from all sessions using the same logic as main page
        // Filter completed sessions - check for both field variations and actual completion
        const actualCompletedSessions = allSessionsData.filter((session) => {
          // Check completion status using multiple field names (similar to main page logic)
          const isCompleted =
            session.completed === true ||
            session.session_status === 'completed' ||
            (session.completedAt && session.completedAt !== null) ||
            (session.completed_at && session.completed_at !== null) ||
            (session.rating && session.rating > 0);
          return isCompleted;
        });

        console.log('📊 All sessions count:', allSessionsData.length);
        console.log('✅ Completed sessions count:', actualCompletedSessions.length);
        if (allSessionsData.length > 0) {
          console.log('📋 Sample session:', allSessionsData[0]);
        }

        // Calculate totals using correct field names
        const totalMinutesFromSessions = actualCompletedSessions.reduce((total, session) => {
          // session.duration is in seconds per API interface
          const durationInMinutes = session.duration ? Math.round(session.duration / 60) : 0;
          return total + durationInMinutes;
        }, 0);

        const totalSessionsCount = actualCompletedSessions.length;

        // Use API stats if available (more accurate as they use backend calculations)
        // Fall back to client-side calculation if API stats are 0 but we have sessions
        if (enhancedStats.total_sessions > 0) {
          // API has data, use it
          console.log('📈 Using API stats - sessions:', enhancedStats.total_sessions, 'minutes:', enhancedStats.total_minutes);
        } else if (totalSessionsCount > 0) {
          // API returned 0 but we calculated sessions locally - use local calculations
          console.log('📈 Using local stats - sessions:', totalSessionsCount, 'minutes:', totalMinutesFromSessions);
          userProfileData.totalSessions = totalSessionsCount;
          userProfileData.totalMinutes = totalMinutesFromSessions;
          userProfileData.averageSession =
            totalSessionsCount > 0 ? Math.round(totalMinutesFromSessions / totalSessionsCount) : 0;
        }

        // Force update by setting user data after all processing is complete
        setUserData(userProfileData);

        // Debug session dates to understand the data
        if (allSessionsData.length > 0) {
          const sessionDates = allSessionsData
            .map((s) => {
              const date = new Date(s.completedAt || s.createdAt);
              return {
                date: date,
                month: date.getMonth(),
                year: date.getFullYear(),
                completed: s.completed,
              };
            })
            .filter((s) => s.completed === true);

          // Calendar initialization is now handled inside MeditationCalendar component
        }

        // Set error if data loading fails
      } catch (err: any) {
        console.error('Failed to load profile data:', err);
        // Only show error if we have no data at all
        setError('Unable to load profile data. Please try again.');
        // Still set some default data so the page renders
        setUserData({
          name: user?.name || '',
          email: user?.email || '',
          memberSince: user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })
            : '',
          totalSessions: 0,
          totalMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageSession: 0,
          thisWeekMinutes: 0,
          thisMonthMinutes: 0,
          favoriteTime: '',
          level: 1,
          xp: 0,
          nextLevelXp: 100,
          profileImage: user?.avatarUrl,
        });
        // Set empty achievements on error
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]); // Include user in dependency array so profile updates when user changes


  // Calculate weekly data from sessions
  const calculateWeeklyData = (sessions: any[]) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - dayOfWeek); // Go to Sunday of current week
    startOfCurrentWeek.setHours(0, 0, 0, 0); // Set to start of day
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const weekData = dayNames.map((dayName, index) => {
      const dayDate = new Date(startOfCurrentWeek);
      dayDate.setDate(startOfCurrentWeek.getDate() + index);

      // Find sessions for this day
      const daySessions = sessions.filter((session) => {
        // Use completedAt if available, otherwise use createdAt (camelCase)
        const sessionDateStr = session.completedAt || session.createdAt;
        if (!sessionDateStr) return false;

        const sessionDate = new Date(sessionDateStr);

        // Consider a session completed if:
        // 1. It has completed flag set to true, OR
        // 2. It has a rating (which indicates it was completed), OR
        // 3. It has completedAt timestamp AND duration > 0
        const isCompleted =
          session.completed === true ||
          (session.rating && session.rating > 0) ||
          (session.completedAt && session.duration && session.duration > 0);

        // Compare dates by setting them to same time for accurate comparison
        const sessionDateOnly = new Date(
          sessionDate.getFullYear(),
          sessionDate.getMonth(),
          sessionDate.getDate(),
        );
        const dayDateOnly = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());
        const isThisDay = sessionDateOnly.getTime() === dayDateOnly.getTime();

        return isThisDay && isCompleted;
      });

      const totalMinutes = daySessions.reduce((total, session) => {
        // session.duration is in seconds
        const durationInMinutes = session.duration ? Math.round(session.duration / 60) : 0;
        return total + durationInMinutes;
      }, 0);

      return {
        day: dayName.substring(0, 3),
        minutes: totalMinutes,
        completed: totalMinutes > 0,
        date: new Date(dayDate),
        sessions: daySessions.length,
      };
    });

    return weekData;
  };

  // Format session data for display
  const formatRecentSessions = (sessions: any[]) => {
    if (!sessions || sessions.length === 0) return [];

    return sessions.slice(0, 5).map((session, index) => {
      // Format session type - using transformed field name from service
      const sessionType = session.type || 'mindfulness'; // Service transforms to 'type'
      const formattedType = sessionType
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (l: string) => l.toUpperCase());

      // Format date - using transformed field names
      const sessionDate = session.completedAt || session.createdAt;
      let dateStr = 'Recently';
      if (sessionDate) {
        const date = new Date(sessionDate);
        const now = new Date();

        // Compare calendar days instead of 24-hour periods
        const sessionDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffMs = nowDateOnly.getTime() - sessionDateOnly.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // Handle valid dates properly
        if (!isNaN(date.getTime())) {
          if (diffDays === 0) {
            dateStr = 'Today';
          } else if (diffDays === 1) {
            dateStr = 'Yesterday';
          } else if (diffDays === -1) {
            dateStr = 'Tomorrow';
          } else if (diffDays > 1 && diffDays < 7) {
            dateStr = diffDays + ' days ago';
          } else if (diffDays < -1 && diffDays > -7) {
            dateStr = Math.abs(diffDays) + ' days ahead';
          } else {
            dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
        }
      }

      // Handle duration - service transforms duration_minutes to duration (in seconds), convert back to minutes
      const duration = session.duration ? Math.round(session.duration / 60) : 0;

      const result = {
        id: session.id,
        type: formattedType,
        duration: duration,
        date: dateStr,
        mood: {
          before: session.mood_before ?? null,
          after: session.mood_after ?? null,
        },
        notes: session.notes,
        rating: session.rating,
      };

      return result;
    });
  };

  // Generate meditation history from real API data
  const generateMeditationHistory = () => {
    const history: { date: Date; sessions: any[] }[] = [];

    if (historySessions.length === 0) {
      return history;
    }

    // Group sessions by date
    const sessionsByDate: { [key: string]: any[] } = {};

    historySessions.forEach((session, index) => {
      const rawDate =
        session.completedAt || session.completed_at || session.createdAt || session.created_at;
      const sessionDate = new Date(rawDate);

      // Skip sessions with invalid dates
      if (isNaN(sessionDate.getTime())) {
        return;
      }

      const dateKey = sessionDate.toDateString();

      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = [];
      }

      // Only include completed sessions - check both transformed and original field
      const isCompleted =
        session.completed === true ||
        session.session_status === 'completed' ||
        (session.completedAt && session.duration > 0);

      if (isCompleted) {
        const durationMinutes = session.duration
          ? Math.round(session.duration / 60)
          : session.duration_minutes || 0;
        sessionsByDate[dateKey].push({
          id: session.id,
          type:
            session.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
            '',
          duration: durationMinutes,
          time: new Date(
            session.completedAt || session.completed_at || session.createdAt || session.created_at,
          ).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
          intensity: session.difficulty_level || session.difficulty || '',
          mood: {
            before: session.mood_before ?? null,
            after: session.mood_after ?? null,
          },
          rating: session.completion_rating || session.rating || 0,
          notes: session.notes || '',
          technique: session.technique || '',
          environment: session.environment || '',
        });
      }
    });

    // Convert to the expected format
    Object.entries(sessionsByDate).forEach(([dateKey, sessions]) => {
      history.push({
        date: new Date(dateKey),
        sessions: sessions,
      });
    });

    return history.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  // Get intensity color based on difficulty level or duration
  const getIntensityColor = (intensity: string, duration?: number) => {
    if (duration) {
      if (duration >= 20) return 'bg-red-500/20 border-red-500/30';
      if (duration >= 10) return 'bg-primary/20 border-primary/30';
      return 'bg-emerald-500/20 border-emerald-500/30';
    }

    switch (intensity) {
      case 'advanced':
        return 'bg-red-500/20 border-red-500/30';
      case 'intermediate':
        return 'bg-primary/20 border-primary/30';
      case 'beginner':
      default:
        return 'bg-emerald-500/20 border-emerald-500/30';
    }
  };

  // Generate meditation history - memoized to update when historySessions changes
  const meditationHistory = useMemo(() => {
    return generateMeditationHistory();
  }, [historySessions]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/meditation')}
              className="rounded-full text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          </div>

          {/* Loading Skeletons */}
          <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <div className="flex items-center gap-4">
              <Skeleton className="w-20 h-20 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-40 bg-white/10" />
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="h-2 w-full bg-white/10" />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
                <Skeleton className="h-16 w-full bg-white/10" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/meditation')}
              className="rounded-full text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          </div>
          <Card className="p-6 text-center bg-white/10 backdrop-blur-xl border border-white/20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">Try Again</Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/meditation')}
            className="rounded-full text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
        </div>

        {/* Profile Header - Fitness Style */}
        <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-xl border border-white/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar with Photo Upload */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-teal-500/20 border-2 border-teal-400/30 overflow-hidden">
                {profileImage || userData.profileImage ? (
                  <img
                    src={profileImage || userData.profileImage}
                    alt={userData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon path={mdiMeditation} size={2} className="text-teal-400" />
                  </div>
                )}
              </div>

              {/* Photo Upload Overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </label>
              </div>

              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  // Handle photo upload
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const imageUrl = event.target?.result as string;
                      setProfileImage(imageUrl);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-2 w-full">
              {/* Name and Edit */}
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{userData.name}</h2>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-white/10">
                  <Pencil className="h-4 w-4 text-teal-400" />
                </Button>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                <Badge
                  variant="outline"
                  className="px-2 py-1 text-xs bg-teal-500/20 text-teal-400 border-teal-400/30"
                >
                  Level {userData.level}
                </Badge>
                <div className="flex items-center gap-1 text-white/60">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span>{userData.currentStreak} day streak</span>
                </div>
                <div className="flex items-center gap-1 text-white/60">
                  <Calendar className="h-4 w-4 text-teal-400" />
                  <span>Since {userData.memberSince}</span>
                </div>
              </div>

              {/* XP Progress */}
              {/* <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Level Progress</span>
                  <span className="font-medium text-primary">
                    {Math.round((userData.xp / userData.nextLevelXp) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(userData.xp / userData.nextLevelXp) * 100}%` }}
                  />
                </div>
              </div> */}
            </div>

            {/* Action Buttons */}
            {/* <div className="flex gap-2 self-start sm:self-center">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div> */}
          </div>
        </Card>

        {/* Quick Stats */}
        <QuickStats
          totalSessions={userData.totalSessions}
          totalMinutes={userData.totalMinutes}
          currentStreak={userData.currentStreak}
          longestStreak={userData.longestStreak}
        />

        {/* Weekly Progress */}
        <WeeklyProgress
          thisWeekMinutes={userData.thisWeekMinutes}
          weeklyGoal={weeklyGoal}
          weeklyData={weeklyData}
        />

        {/* Recent Sessions & Achievements */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Sessions */}
          <RecentSessions
            sessions={formatRecentSessions(recentSessions)}
            sessionsLoading={sessionsLoading}
          />

          {/* Achievements */}
          <Achievements achievements={achievements} />
        </div>

        {/* Motivational Footer */}
        <Card className="p-4 bg-teal-500/20 backdrop-blur-xl border border-teal-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <Target className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Keep Growing!</h3>
                <p className="text-xs text-white/60">
                  With every breath you take in meditation, you plant seeds of growth within
                  yourself
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              onClick={() => navigate('/meditation')}
            >
              Start Session
            </Button>
          </div>
        </Card>

        {/* Meditation History Calendar - Full Width */}
        <MeditationCalendar
          meditationHistory={meditationHistory}
          sessionsLoading={sessionsLoading}
        />
      </div>
    </div>
  );
};

export default MeditationProfile;
