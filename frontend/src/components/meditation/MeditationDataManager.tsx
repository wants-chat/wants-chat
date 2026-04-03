import { useState, useEffect } from 'react';
import { useMeditation } from '../../hooks';
import { AudioContent, meditationService } from '../../services/meditationService';
import { api } from '../../lib/api';
import { MeditationOption } from '../../types/meditation/meditation-types';
import {
  enhanceCategoriesWithAudio,
  createFeaturedFormat,
  mapFeaturedToOptions,
} from '../../utils/meditation-helpers';
import { mdiMeditation, mdiBriefcase, mdiEmoticonSad } from '@mdi/js';

export const useMeditationDataManager = () => {
  const [meditationOptions, setMeditationOptions] = useState<MeditationOption[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [quickSessions, setQuickSessions] = useState<any[]>([]);
  const [featuredSessions, setFeaturedSessions] = useState<any[]>([]);
  const [weeklyStats, setWeeklyStats] = useState({ sessions: 0, minutes: 0 });
  const [avgDailyMinutes, setAvgDailyMinutes] = useState(0);

  // User stats state
  const [userStats, setUserStats] = useState({
    currentStreak: 0,
    totalSessions: 0,
    totalMinutes: 0,
    averageSession: 0,
    favoriteTime: 'Not Set',
    level: 12,
    todayGoal: 0,
    todayProgress: 0,
  });

  // Fetch meditation data from API including audio library
  const {
    categories,
    categoriesLoading,
    categoriesError,
    featured,
    featuredLoading,
    featuredError,
    audioLibrary,
    audioLoading,
  } = useMeditation();

  // Ensure audioLibrary is properly typed
  const typedAudioLibrary = audioLibrary as AudioContent[];

  // Combine loading states
  const loading = categoriesLoading || featuredLoading;
  const error = categoriesError || featuredError;

  // Update meditation options when API data changes
  useEffect(() => {
    if (!loading && !audioLoading && categories && categories.length > 0) {
      // Use categories from /categories/detailed and enhance with audio
      const enhancedOptions = enhanceCategoriesWithAudio(categories, typedAudioLibrary);
      setMeditationOptions(enhancedOptions);

      // Store in featured format for session player
      const featuredFormat = createFeaturedFormat(enhancedOptions);
      if (featuredFormat.length > 0) {
        sessionStorage.setItem('meditationFeatured', JSON.stringify(featuredFormat));
      }
    } else if (!loading && !audioLoading && featured && featured.length > 0) {
      // Fallback to featured data if categories not available
      const meditationOpts = mapFeaturedToOptions(featured);
      setMeditationOptions(meditationOpts);
      sessionStorage.setItem('meditationFeatured', JSON.stringify(featured));
    } else if (!loading && !audioLoading) {
      // Clear options if no data (will show skeleton or error)
      setMeditationOptions([]);
    }
  }, [categories, featured, loading, typedAudioLibrary, audioLoading]);

  // Calculate today's and weekly progress from sessions
  const calculateProgressFromSessions = async () => {
    try {
      // Fetch all sessions (no date filter since API has issues with date params)
      const response = await meditationService.getMeditationSessions({
        limit: 100
      });
      
      const sessions: any[] = response.data || [];
      
      // Filter for today's sessions using simple date string comparison
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      
      // Filter for this week's sessions
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const todaysSessions = sessions.filter((session: any) => {
        // The service transforms the data, so check for camelCase fields
        const sessionDateStr = session.createdAt || session.created_at || session.completedAt || session.completed_at;
        
        // Simple date comparison - check if the date string starts with today's date
        const isToday = sessionDateStr && sessionDateStr.startsWith(todayStr);
        
        // After transformation, 'completed' is a boolean based on completion_status
        // duration is in seconds (duration_minutes * 60)
        const isCompleted = session.completed === true || 
                          (session.duration && session.duration > 0); // Has duration means it was tracked
        
        return isToday && isCompleted;
      });
      
      // Simply combine today's sessions with other week sessions to ensure consistency
      const otherWeekSessions = sessions.filter((session: any) => {
        const sessionDateStr = session.createdAt || session.created_at || session.completedAt || session.completed_at;
        
        if (!sessionDateStr) return false;
        
        const sessionDateOnly = sessionDateStr.split('T')[0];
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        // Include sessions from this week but NOT today (to avoid double counting)
        const isThisWeek = sessionDateOnly >= weekStartStr && sessionDateOnly < todayStr;
        const isCompleted = session.completed === true || (session.duration && session.duration > 0);
        
        return isThisWeek && isCompleted;
      });
      
      // Combine today's sessions with other week sessions
      const weekSessions = [...todaysSessions, ...otherWeekSessions];
      
      // Calculate total minutes for today
      // Note: duration is in seconds after transformation, so convert to minutes
      const todayMinutes = todaysSessions.reduce((total, session: any) => {
        const durationInSeconds = session.duration || 0;
        return total + Math.round(durationInSeconds / 60);
      }, 0);
      
      // Calculate weekly stats
      const weekMinutes = weekSessions.reduce((total, session: any) => {
        const durationInSeconds = session.duration || 0;
        return total + Math.round(durationInSeconds / 60);
      }, 0);
      
      // Calculate average daily minutes (total weekly minutes / 7 days)
      const avgMinutes = Math.round(weekMinutes / 7);
      
      // Update weekly stats
      setWeeklyStats({ sessions: weekSessions.length, minutes: weekMinutes });
      setAvgDailyMinutes(avgMinutes);
      
      // Update today's stats in userStats
      setUserStats(prev => ({
        ...prev,
        todayProgress: todayMinutes
      }));
      
      return todayMinutes;
    } catch (error) {
      console.error('Failed to calculate progress:', error);
      return 0;
    }
  };

  // Load user stats on mount
  const loadUserStats = async () => {
    setStatsLoading(true);
    try {
      // Fetch streak data
      const streakData = await meditationService.getMeditationStreak();

      // Fetch session stats for the current streak period
      const statsData = await meditationService.getMeditationStats({ timeframe: 'all' });

      // Calculate weekly stats from enhanced stats
      const enhancedStats = await api.request('/meditation/stats/enhanced?timeframe=all');
      const currentWeek = enhancedStats.weekly_progress?.find(
        (week: any) => week.sessions > 0,
      ) || { sessions: 0, minutes: 0 };

      setUserStats((prev) => ({
        ...prev,
        currentStreak: streakData.currentStreak || 0,
        totalSessions: statsData.totalSessions || 0,
        totalMinutes: statsData.totalMinutes || 0,
        averageSession: statsData.averageSessionDuration || 0,
        level: enhancedStats.level || 1,
      }));
    } catch (error) {
      console.error('Failed to load user stats:', error);
      // Keep default values on error
    } finally {
      setStatsLoading(false);
    }
  };

  // Load meditation goals
  const loadGoals = async () => {
    setGoalsLoading(true);
    try {
      // Fetch goals and today's progress in parallel
      const [goalsData, todayMinutes] = await Promise.all([
        meditationService.getMeditationGoals(),
        calculateProgressFromSessions()
      ]);
      
      setGoals(goalsData);
      
      // Find the daily minutes goal
      const dailyMinutesGoal = goalsData.find(
        (g) => g.goal_type === 'daily_minutes' && g.status === 'active',
      );
      
      if (dailyMinutesGoal) {
        // Use calculated progress from sessions
        setUserStats((prev) => ({
          ...prev,
          todayGoal: dailyMinutesGoal.target_value || 15,
          todayProgress: todayMinutes,
        }));
      } else {
        // If no daily minutes goal, check for daily sessions goal
        const dailySessionsGoal = goalsData.find(
          (g) => g.goal_type === 'daily_sessions' && g.status === 'active',
        );
        
        if (dailySessionsGoal) {
          // For sessions goal, use actual minutes from today's sessions
          setUserStats((prev) => ({
            ...prev,
            todayGoal: dailySessionsGoal.target_value * 15, // Convert sessions to minutes
            todayProgress: todayMinutes,
          }));
        } else {
          // No goals found, use defaults
          setUserStats((prev) => ({
            ...prev,
            todayGoal: 20,
            todayProgress: todayMinutes,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setGoalsLoading(false);
    }
  };

  // Load quick sessions from audio library
  const loadQuickSessions = async () => {
    try {
      // Fetch audio data from the meditation/audio API
      const audioResponse = await api.request('/meditation/audio?limit=3');
      const audioData = audioResponse.data || [];

      if (Array.isArray(audioData) && audioData.length > 0) {
        // Map API response to quick sessions format
        const sessions = audioData.map((audio: any) => ({
          id: audio.id,
          title: audio.title,
          duration: Math.round((audio.duration_seconds || 600) / 60), // Convert seconds to minutes
          icon: mdiMeditation, // Default meditation icon
          audioUrl: audio.file_url,
          description: audio.description,
          narrator: audio.narrator,
          category: audio.category,
          type: audio.type
        }));
        setQuickSessions(sessions);
      } else {
        setQuickSessions([]);
      }
    } catch (error) {
      console.error('Failed to load quick sessions from API:', error);
      setQuickSessions([]);
    }
  };

  const loadFeaturedSessions = async () => {
    try {
      const featuredResponse = await meditationService.getFeaturedMeditations();
      const featuredCategories = featuredResponse?.categories || [];
      
      // Flatten featured sessions from all categories and subOptions
      const allFeaturedSessions = featuredCategories.flatMap(category => 
        category.subOptions.flatMap(subOption => 
          subOption.sessions.map(session => ({
            id: `${category.id}-${subOption.id}-${session.duration}`,
            title: session.title,
            description: subOption.description,
            duration: `${session.duration} min`,
            category: category.name,
            categoryId: category.id,
            subOptionId: subOption.id,
            audioUrl: session.audioUrl,
            sessionDuration: session.duration
          }))
        )
      );
      
      // Take first 3 featured sessions
      setFeaturedSessions(allFeaturedSessions.slice(0, 3));
    } catch (error) {
      console.error('Failed to load featured sessions:', error);
      setFeaturedSessions([]);
    }
  };

  // Load all data on mount
  useEffect(() => {
    loadUserStats();
    loadGoals();
    loadQuickSessions();
    loadFeaturedSessions();
  }, []);

  return {
    // Data
    meditationOptions,
    userStats,
    setUserStats,
    goals,
    quickSessions,
    featuredSessions,
    weeklyStats,
    avgDailyMinutes,
    typedAudioLibrary,

    // Loading states
    loading,
    statsLoading,
    goalsLoading,
    audioLoading,

    // Error states
    error,
    categoriesError,

    // Functions
    loadUserStats,
    loadGoals,
    calculateProgressFromSessions
  };
};