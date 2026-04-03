import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Play,
  Clock,
  Star,
  BookOpen,
  CheckCircle,
  Target,
  Award,
  Zap,
} from 'lucide-react';
import Icon from '@mdi/react';
import { mdiMeditation } from '@mdi/js';
import { meditationService } from '../../services/meditationService';

interface MeditationProgram {
  id: string | number;
  name: string;
  title?: string; // Added for backward compatibility with mock data
  description: string;
  instructor?: string;
  difficulty: string;
  durationDays: number;
  sessionsCount: number;
  sessions?: number; // Added for backward compatibility
  category: string;
  imageUrl?: string;
  tags?: string[];
  isPremium?: boolean;
  totalDuration?: string; // Added for UI display
  // Frontend additions
  rating?: number;
  completed?: number;
  nextSession?: number;
  accentColor?: string;
  isEnrolled?: boolean; // Added for enrollment status
  enrollmentId?: string;
  enrollmentStatus?: string;
  lastSessionDate?: string;
  progressPercentage?: number;
}

// Extended stats interface with today's goal tracking
interface ExtendedMeditationStats {
  totalSessions: number;
  totalDuration: number;
  currentStreak: number;
  longestStreak: number;
  averageSessionDuration: number;
  todayGoal: number;
  todayProgress: number;
}

const MeditationSeries: React.FC = () => {
  const navigate = useNavigate();

  // State for API data
  const [programs, setPrograms] = useState<MeditationProgram[]>([]);
  const [userEnrollments, setUserEnrollments] = useState<any[]>([]);
  const [audioSessions, setAudioSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ExtendedMeditationStats | null>(null);

  // Load programs and stats on mount
  useEffect(() => {
    const loadSeriesData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch programs and user enrollments from API
        let programsData = [];
        let enrollmentsData = [];
        try {
          programsData = await meditationService.getPrograms();
        } catch (err) {
          console.warn('Failed to fetch programs:', err);
        }

        // Fetch user enrollments to check which programs are enrolled
        try {
          // Use the new endpoint /meditation/programs/enrolled
          enrollmentsData = await meditationService.getEnrolledPrograms();
          console.log('📋 Enrolled programs data:', enrollmentsData);
          setUserEnrollments(enrollmentsData);

        } catch (err) {
          console.warn('Failed to fetch enrolled programs:', err);
          setUserEnrollments([]);
        }

        // Fetch audio sessions for Quick Start section
        let audioData = [];
        try {
          const audioResponse = await meditationService.getMeditationAudio({ limit: 10 });
          audioData = audioResponse.data || [];
          setAudioSessions(audioData);
        } catch (audioErr: any) {
          console.warn(
            '⚠️ Audio API not available, using static Quick Start options:',
            audioErr?.message || audioErr,
          );
          setAudioSessions([]);
        }

        // Try to fetch user stats, but don't fail if it errors
        let userStats: ExtendedMeditationStats;
        try {
          const fetchedStats = await meditationService.getEnhancedStats('30d');
          // Map the fetched stats to our extended stats interface
          userStats = {
            totalSessions: fetchedStats.totalSessions || 0,
            totalDuration: fetchedStats.totalDuration || 0,
            currentStreak: fetchedStats.currentStreak || 0,
            longestStreak: fetchedStats.longestStreak || 0,
            averageSessionDuration: fetchedStats.averageSessionDuration || 0,
            todayGoal: 20, // Default value, will be updated below
            todayProgress: 0, // Default value, will be updated below
          };
        } catch (statsErr) {
          console.warn('Failed to fetch enhanced stats, continuing without stats:', statsErr);
          // Use default stats
          userStats = {
            totalSessions: 0,
            totalDuration: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageSessionDuration: 0,
            todayGoal: 20,
            todayProgress: 0,
          };
        }

        // Fetch goals and today's progress to make Today's Goal section dynamic
        try {
          const [goalsData, todayMinutes] = await Promise.all([
            meditationService.getMeditationGoals(),
            calculateTodayProgress()
          ]);
          
          // Find the daily minutes goal
          const dailyMinutesGoal = goalsData.find(
            (g) => g.goal_type === 'daily_minutes' && g.status === 'active',
          );
          
          if (dailyMinutesGoal) {
            userStats.todayGoal = dailyMinutesGoal.target_value || 20;
            userStats.todayProgress = todayMinutes;
          } else {
            // If no daily minutes goal, check for daily sessions goal
            const dailySessionsGoal = goalsData.find(
              (g) => g.goal_type === 'daily_sessions' && g.status === 'active',
            );
            
            if (dailySessionsGoal) {
              userStats.todayGoal = dailySessionsGoal.target_value * 15; // Convert sessions to minutes
              userStats.todayProgress = todayMinutes;
            } else {
              // No goals found, use defaults
              userStats.todayGoal = 20;
              userStats.todayProgress = todayMinutes;
            }
          }
        } catch (goalsErr) {
          console.warn('Failed to fetch goals, using defaults:', goalsErr);
          // Keep defaults already set above
        }

        // Helper function to find enrollment for a program
        const findEnrollment = (programId: string | number) => {
          const programIdStr = String(programId);
          const found = enrollmentsData.find((enrollment) => {
            // The enrolled programs endpoint returns {enrollment_id, program: {id, ...}, progress: {...}}
            if (enrollment.program && enrollment.program.id) {
              return String(enrollment.program.id) === programIdStr;
            }
            // Fallback for other possible formats
            const enrollmentProgramId = String(
              enrollment.program_id || enrollment.programId || enrollment.id,
            );
            return enrollmentProgramId === programIdStr;
          });
          return found;
        };

        console.log('📊 All programs from API:', programsData.map(p => ({ id: p.id, name: p.name })));
        console.log('📊 Enrollments matching status:', enrollmentsData.map(e => ({
          programId: e.program?.id || e.program_id,
          status: e.progress?.status || e.status,
          completedSessions: e.progress?.completed_sessions
        })));

        // Map programs to include UI-specific fields and enrollment status
        const enhancedPrograms = programsData.map((program: any, index: number) => {
          const enrollment = findEnrollment(program.id);
          const isEnrolled = !!enrollment;


          // Extract progress data from the nested structure
          const progressData = enrollment?.progress || {};
          const completedSessions =
            progressData.completed_sessions || enrollment?.completed_sessions || 0;
          const currentSession = progressData.current_session || enrollment?.current_session || 1;
          const enrollmentStatus = progressData.status || enrollment?.status || 'not_enrolled';
          const totalSessions = program.sessionsCount || program.sessions_count || 0;

          return {
            ...program,
            title: program.name, // Map for backward compatibility
            sessions: totalSessions,
            sessionsCount: totalSessions,
            durationDays: program.durationDays || program.duration_days,
            totalDuration: `${totalSessions * 15} min`, // Estimate
            rating: program.rating || 0,
            // Real enrollment data
            isEnrolled,
            completed: completedSessions,
            totalSessions: totalSessions,
            nextSession: currentSession,
            enrollmentId: enrollment?.enrollment_id || enrollment?.id,
            enrollmentStatus: enrollmentStatus,
            lastSessionDate: progressData.last_session_date || enrollment?.last_session_date,
            progressPercentage: progressData.progress_percentage || 0,
            // UI fields
            accentColor: index % 2 === 0 ? 'primary' : 'emerald-600',
            isPremium: program.isPremium || program.is_premium || false,
            instructor: program.instructor || '',
          };
        });

        setPrograms(enhancedPrograms);
        setStats(userStats);

        // Don't show error if we at least have some data
        if (programsData.length === 0 && !userStats) {
          setError('Unable to load meditation data. Please try again later.');
        }
      } catch (err: any) {
        console.error('Failed to load series data:', err);
        setError(err.message || 'Failed to load meditation programs');
      } finally {
        setLoading(false);
      }
    };

    loadSeriesData();
  }, []);

  // Use only API data - no fallback
  const seriesData = programs;

  // Function to calculate today's meditation progress
  const calculateTodayProgress = async () => {
    try {
      // Fetch all sessions (no date filter since API has issues with date params)
      const response = await meditationService.getMeditationSessions({
        limit: 100
      });
      
      const sessions: any[] = response.data || [];
      
      // Filter for today's sessions using simple date string comparison
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      
      const todaysSessions = sessions.filter((session: any) => {
        // The service transforms the data, so check for camelCase fields
        const sessionDateStr = session.createdAt || session.completedAt;
        
        // Simple date comparison - check if the date string starts with today's date
        const isToday = sessionDateStr && sessionDateStr.startsWith(todayStr);
        
        // Also check if the session is completed to count it towards progress
        const isCompleted = session.completed === true;
        
        return isToday && isCompleted;
      });
      
      // Sum up duration of today's completed sessions
      const todayMinutes = todaysSessions.reduce((total, session) => {
        // Use actualDuration if available (for completed sessions), otherwise use duration
        const durationSeconds = session.actualDuration || session.duration || 0;
        return total + Math.round(durationSeconds / 60);
      }, 0);
      
      
      return todayMinutes;
    } catch (error) {
      console.error('Failed to calculate progress:', error);
      return 0;
    }
  };

  const handleStartSeries = (series: any) => {
    // Navigate to the series detail page to show all sessions
    navigate(`/meditation/series/${series.id}`);
  };

  const handleContinueSeries = (series: any) => {
    // Navigate to the series detail page to show all sessions
    navigate(`/meditation/series/${series.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-white/10 backdrop-blur-xl border border-white/20 text-emerald-400';
      case 'Intermediate':
        return 'bg-white/10 backdrop-blur-xl border border-white/20 text-yellow-400';
      case 'Advanced':
        return 'bg-white/10 backdrop-blur-xl border border-white/20 text-red-400';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Meditation Series</h1>
            <p className="text-white/60">Loading programs...</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <Skeleton className="h-16 w-full bg-white/20" />
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
              <Skeleton className="h-32 w-full mb-4 bg-white/20" />
              <Skeleton className="h-4 w-3/4 mb-2 bg-white/20" />
              <Skeleton className="h-4 w-full bg-white/20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !loading && programs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Meditation Series</h1>
            <p className="text-white/60">
              Structured programs to guide your mindfulness journey
            </p>
          </div>
        </div>

        <Card className="p-6 text-center bg-white/10 backdrop-blur-xl border border-white/20">
          <Icon path={mdiMeditation} size={2} className="text-white/40 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section - Following fitness layout pattern */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Meditation Series</h1>
          <p className="text-white/60">
            Structured programs to guide your mindfulness journey
          </p>
        </div>
      </div>

      {/* Stats Overview - Following fitness dashboard pattern */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
          <div className="space-y-2">
            <p className="text-2xl font-bold text-white">
              {seriesData.filter((p) => p.isEnrolled && p.enrollmentStatus === 'active').length}
            </p>
            <p className="text-sm text-white/60">Enrolled Programs</p>
          </div>
        </Card>
        <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
          <div className="space-y-2">
            <p className="text-2xl font-bold text-teal-400">
              {seriesData.filter((p) => {
                const totalSessions = p.sessions || p.sessionsCount || 0;
                const completedSessions = p.completed || 0;
                // In progress = enrolled with active status AND not completed all sessions
                return p.isEnrolled &&
                  p.enrollmentStatus === 'active' &&
                  completedSessions < totalSessions;
              }).length}
            </p>
            <p className="text-sm text-white/60">Series In Progress</p>
          </div>
        </Card>
        <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
          <div className="space-y-2">
            <p className="text-2xl font-bold text-white">{seriesData.length}</p>
            <p className="text-sm text-white/60">Programs Available</p>
          </div>
        </Card>
        <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
          <div className="space-y-2">
            <p className="text-2xl font-bold text-teal-400">
              {seriesData.filter((p) =>
                p.isEnrolled && p.enrollmentStatus === 'completed'
              ).length}
            </p>
            <p className="text-sm text-white/60">Completed Programs</p>
          </div>
        </Card>
      </div>

      {/* Primary Section - Featured/Current Series */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Current Series */}
        {(() => {
          // Find the first enrolled program that's in progress (active status, not all sessions completed)
          const currentSeries = seriesData.find(
            (s) =>
              s.isEnrolled &&
              s.enrollmentStatus === 'active' &&
              (s.completed || 0) < (s.sessions || s.sessionsCount || 0),
          );

          if (currentSeries) {
            const totalSessions = currentSeries.sessions || currentSeries.sessionsCount || 0;
            const completedSessions = currentSeries.completed || 0;
            const progressPercentage =
              totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

            return (
              <Card className="lg:col-span-2 p-6 bg-teal-500/20 border border-teal-400/30">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Continue Your Journey
                    </h3>
                    <p className="text-white/60">Pick up where you left off</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                    <Play className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <Icon path={mdiMeditation} size={1.5} className="text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">
                        {currentSeries.title || currentSeries.name}
                      </h4>
                      <p className="text-white/60 mb-2">{currentSeries.description}</p>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>
                          Session {currentSeries.nextSession || completedSessions + 1} of{' '}
                          {totalSessions}
                        </span>
                        {currentSeries.difficulty && (
                          <>
                            <span>•</span>
                            <span>{currentSeries.difficulty}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Progress</span>
                      <span className="text-sm font-medium text-white">
                        {completedSessions}/{totalSessions} sessions (
                        {Math.round(progressPercentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }} />
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                    onClick={() => handleContinueSeries(currentSeries)}
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Continue Series
                  </Button>
                </div>
              </Card>
            );
          } else {
            // Show a "Start Your Journey" card if no series in progress
            return (
              <Card className="lg:col-span-2 p-6 bg-teal-500/20 border border-teal-400/30">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Start Your Journey
                    </h3>
                    <p className="text-white/60">
                      Choose a program to begin your mindfulness practice
                    </p>
                  </div>
                  <Badge className="bg-cyan-500 text-white">
                    <Zap className="h-3 w-3 mr-1" />
                    Ready to Start
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-teal-500/20 flex items-center justify-center">
                      <Icon path={mdiMeditation} size={1.5} className="text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white">Discover Meditation</h4>
                      <p className="text-white/60 mb-2">
                        Explore structured programs designed for your mindfulness journey
                      </p>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{seriesData.length} programs available</span>
                        <span>•</span>
                        <span>All skill levels</span>
                        <span>•</span>
                        <span>Guided sessions</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full bg-teal-500/10 border border-teal-400 text-teal-400 hover:scale-105 transition-all duration-200"
                    onClick={() => {
                      // Scroll to All Series section
                      document
                        .querySelector('.grid.grid-cols-1.md\\:grid-cols-2')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Browse All Programs
                  </Button>
                </div>
              </Card>
            );
          }
        })()}

        {/* Sidebar - Quick Actions */}
        <div className="space-y-6">
          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">Today's Goal</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Daily Practice</span>
                {loading ? (
                  <Skeleton className="h-4 w-20 bg-white/20" />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {stats?.todayProgress || 0} / {stats?.todayGoal || 20} min
                  </span>
                )}
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full" style={{ width: `${Math.min(((stats?.todayProgress || 0) / (stats?.todayGoal || 20)) * 100, 100)}%` }} />
              </div>
              {!loading && (
                <p className="text-xs text-white/60">
                  {(stats?.todayProgress || 0) >= (stats?.todayGoal || 20) ? (
                    <>
                      Goal achieved! Great work on your meditation practice today.
                    </>
                  ) : (
                    <>
                      {(stats?.todayGoal || 20) - (stats?.todayProgress || 0)} minutes remaining to reach your goal
                    </>
                  )}
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Start</h4>
            <div className="space-y-2">
              {audioSessions.length > 0 ? (
                audioSessions.slice(0, 3).map((session, index) => {
                  const durationMin = Math.round((session.duration_seconds || 600) / 60);

                  return (
                    <Button
                      key={session.id || index}
                      className="w-full justify-between h-10 px-3 bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
                      onClick={() => {
                        // Always use the audio ID route if we have an ID
                        navigate(`/meditation/player/${session.id}`);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Icon path={mdiMeditation} size={0.7} className="text-teal-400" />
                        <span className="text-sm">{session.title}</span>
                      </div>
                      <span className="text-xs text-white/60">{durationMin} min</span>
                    </Button>
                  );
                })
              ) : (
                <p className="text-sm text-white/60 text-center py-4">
                  No audio sessions available
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Secondary Section - All Series */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">All Series</h3>
          <p className="text-sm text-white/60">{seriesData.length} programs available</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesData.map((series) => {
            const totalSessions = series.sessions || series.sessionsCount || 0;
            const completedSessions = series.completed || 0;
            const progressPercentage =
              totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

            // Use real enrollment status
            const isEnrolled = series.isEnrolled || false;
            const isStarted = isEnrolled && completedSessions > 0;
            const isCompleted =
              isEnrolled && completedSessions === totalSessions && totalSessions > 0;
            const canContinue = isEnrolled && !isCompleted;

            return (
              <Card
                key={series.id}
                className="p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group bg-white/10 backdrop-blur-xl border border-white/20 hover:border-teal-400/50"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white group-hover:text-teal-400 transition-colors mb-2">
                        {series.title || series.name}
                      </h4>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {series.description}
                      </p>
                      {series.instructor && (
                        <p className="text-xs text-white/60 mt-2">
                          <span className="font-medium text-white/80">Instructor:</span> {series.instructor}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {series.isPremium && (
                        <Badge className="bg-white/10 backdrop-blur-xl border border-white/20 text-amber-400 text-xs">
                          Premium
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge className="bg-emerald-500 text-white text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {isStarted && !isCompleted && (
                        <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs">
                          <Play className="h-3 w-3 mr-1" />
                          In Progress
                        </Badge>
                      )}
                      {isEnrolled && !isStarted && (
                        <Badge className="bg-cyan-500 text-white text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Enrolled
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Progress (if enrolled) */}
                  {isEnrolled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/60">
                          {isCompleted ? 'Completed' : 'Progress'}
                        </span>
                        <span className="text-xs font-medium text-white">
                          {completedSessions}/{totalSessions} sessions
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-1.5 rounded-full" style={{ width: `${progressPercentage}%` }} />
                      </div>
                      {series.lastSessionDate && (
                        <p className="text-xs text-white/60">
                          Last session: {new Date(series.lastSessionDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{series.sessions || series.sessionsCount} sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{series.totalDuration || `${series.durationDays || 7} days`}</span>
                    </div>
                    {series.difficulty && (
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>{series.difficulty}</span>
                      </div>
                    )}
                    {series.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                        <span>{series.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  {series.tags && series.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {series.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                        <Badge
                          key={tagIndex}
                          variant="secondary"
                          className="text-xs bg-white/10 text-white/80"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {series.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-white/10 text-white/80">
                          +{series.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    {isCompleted ? (
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleStartSeries(series)}
                      >
                        <Award className="h-4 w-4 mr-2" />
                        View Completed
                      </Button>
                    ) : canContinue ? (
                      <Button
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                        onClick={() => handleContinueSeries(series)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Continue Series
                      </Button>
                    ) : isEnrolled && !isStarted ? (
                      <Button
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                        onClick={() => handleStartSeries(series)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Program
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-teal-500/10 border border-teal-400 text-teal-400 hover:scale-105 transition-all duration-200"
                        onClick={() => handleStartSeries(series)}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Enroll Now
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MeditationSeries;
