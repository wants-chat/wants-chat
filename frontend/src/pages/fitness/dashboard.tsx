// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ChevronRight, Dumbbell, ArrowRight, Activity, Target, TrendingUp, Clock, Flame, Calendar, Award } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import HealthOverview from '../../components/fitness/dashboard/HealthOverview';
import WorkoutProgress from '../../components/fitness/dashboard/WorkoutProgress';
import RecentReminders from '../../components/fitness/dashboard/RecentReminders';
import { UserFitnessProfile, Workout, Reminder } from '../../types/fitness';
import { useTodayWorkouts } from '../../hooks/fitness/useTodayWorkouts';
import { useWorkoutHistory } from '../../hooks/fitness/useWorkoutHistory';
import { useReminders } from '../../hooks/fitness/useReminders';
import { fitnessService } from '../../services/fitnessService';
import { toast } from '../../components/ui/sonner';

const FitnessDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentMode = searchParams.get('mode') || localStorage.getItem('workoutMode');

  const [profile, setProfile] = useState<UserFitnessProfile | null>(() => {
    // Initialize profile from localStorage immediately
    const savedProfile = localStorage.getItem('fitnessProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  // Fetch reminders from API
  const { data: remindersResponse, loading: remindersLoading, error: remindersError } = useReminders(!!profile, currentMode as 'gym' | 'home', 4);


  // Fetch today's workouts using the hook - now profile is available immediately
  const { data: todayWorkouts, loading: todayWorkoutsLoading, error: todayWorkoutsError } = useTodayWorkouts(!!profile, currentMode as 'gym' | 'home');
  
  // Fetch workout history for workout progress card - includes stats from API
  const { workouts: workoutHistory, stats: workoutStats } = useWorkoutHistory();
  

  // Generate real stats from workout history
  const generateWorkoutStats = () => {
    if (!workoutHistory || workoutHistory.length === 0) {
      return [
        { label: 'This Week', value: '0h 0m', change: 0, icon: Clock },
        { label: 'Calories', value: '0', change: 0, icon: Flame },
        { label: 'Streak', value: '0 days', change: 0, icon: Calendar },
        { label: 'Total PRs', value: 0, change: 0, icon: Award }
      ];
    }

    // Calculate this week's workouts (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekWorkouts = workoutHistory.filter(w => new Date(w.date) >= oneWeekAgo);
    
    // Calculate total duration this week (duration is already in minutes from API)
    const thisWeekDuration = thisWeekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const hours = Math.floor(thisWeekDuration / 60);
    const minutes = thisWeekDuration % 60;
    
    // Calculate total calories this week
    const thisWeekCalories = thisWeekWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    
    // Calculate total personal records this week
    const thisWeekPRs = thisWeekWorkouts.reduce((sum, w) => sum + (w.personalRecords || 0), 0);
    
    // Calculate current streak - count consecutive days with workouts
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get unique workout dates
    const uniqueDates = Array.from(new Set(
      workoutHistory.map(w => new Date(w.date).toDateString())
    )).map(dateStr => new Date(dateStr)).sort((a, b) => b.getTime() - a.getTime());
    
    for (let i = 0; i < uniqueDates.length; i++) {
      const workoutDate = new Date(uniqueDates[i]);
      workoutDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);
      
      const daysDiff = Math.floor((expectedDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        streak++;
      } else if (daysDiff === 1 && streak === 0) {
        // Include yesterday if we haven't worked out today
        streak++;
      } else {
        break;
      }
    }

    return [
      { label: 'This Week', value: `${hours}h ${minutes}m`, change: 15, icon: Clock },
      { label: 'Calories', value: thisWeekCalories.toLocaleString(), change: 8, icon: Flame },
      { label: 'Streak', value: `${streak} days`, change: streak > 0 ? 25 : 0, icon: Calendar },
      { label: 'Total PRs', value: thisWeekPRs, change: thisWeekPRs > 0 ? 100 : 0, icon: Award }
    ];
  };

  // Generate real goals from workout history
  const generateWorkoutGoals = () => {
    if (!workoutHistory) {
      return [
        { id: '1', type: 'weekly' as const, name: 'Weekly Workouts', current: 0, target: 5, unit: 'sessions', reward: '50 bonus points' }
      ];
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekWorkouts = workoutHistory.filter(w => new Date(w.date) >= oneWeekAgo);

    return [
      {
        id: '1',
        type: 'weekly' as const,
        name: 'Weekly Workouts',
        current: thisWeekWorkouts.length,
        target: 5,
        unit: 'sessions',
        reward: '50 bonus points'
      }
    ];
  };

  useEffect(() => {
    if (!profile) {
      // Redirect to onboarding if no profile
      navigate('/fitness/onboarding');
    }
  }, [profile, navigate]);

  if (!profile) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleReminderAction = (id: string, action: string) => {
    // Handle actions like start_workout, reschedule, maintain_streak
    switch (action) {
      case 'start_workout':
        navigate('/fitness/workout-session');
        break;
      case 'reschedule':
        // Open reschedule dialog
        break;
      case 'maintain_streak':
        navigate('/fitness/workout-plans');
        break;
    }
  };

  const handleDismissReminder = async (id: string) => {
    try {
      await fitnessService.dismissReminder(id);
      toast.success('Reminder dismissed');
      // Refresh reminders - the useReminders hook will refetch
      window.location.reload();
    } catch (error) {
      console.error('Failed to dismiss reminder:', error);
      toast.error('Failed to dismiss reminder');
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact Welcome Section */}
      <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              {getGreeting()}, {profile.name || 'Fitness Warrior'}! 💪
            </h1>
            <p className="text-sm text-white/60">
              {todayWorkouts && todayWorkouts.workouts.length > 0
                ? `Ready for today's workouts? Let's make today count!`
                : "Track your health, reach your goals, transform your life."}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">{workoutStats?.currentStreak || 0}</div>
              <div className="text-xs text-white/60">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{workoutStats?.totalWorkouts || 0}</div>
              <div className="text-xs text-white/60">Workouts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section - Today's Focus & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Workout - Most Important */}
        <Card className="p-5 bg-white/10 backdrop-blur-xl border border-white/20 lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
            Today's Focus
          </h3>
{todayWorkoutsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
              <span className="ml-3 text-sm text-white/60">Loading workouts...</span>
            </div>
          ) : todayWorkoutsError ? (
            <div className="text-center py-6">
              <div className="text-red-400 mb-2">⚠️ Error loading workouts</div>
              <p className="text-sm text-white/60 mb-4">{todayWorkoutsError}</p>
              <Button className="w-full bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200" onClick={() => navigate('/fitness/workout-plans')}>
                Browse Workout Plans
              </Button>
            </div>
          ) : todayWorkouts && todayWorkouts.workouts.length > 0 ? (
            <div className="space-y-4">
              {/* Overall Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-teal-500/10 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{todayWorkouts.total_plans}</p>
                  <p className="text-xs text-white/60">Workout Plans</p>
                </div>
                <div className="text-center border-x border-white/20">
                  <p className="text-lg font-bold text-white">{todayWorkouts.total_exercises}</p>
                  <p className="text-xs text-white/60">Exercises</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">{todayWorkouts.total_duration}</p>
                  <p className="text-xs text-white/60">Total Min</p>
                </div>
              </div>

              {/* Workouts List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {todayWorkouts.workouts.map((workout, workoutIndex) => (
                  <div key={workout.plan_id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                    {/* Workout Header */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-lg font-bold text-white">{workout.workout_name}</h4>
                        <Badge className="text-xs bg-white/10 border border-white/20 text-white/80">
                          Day {workout.current_day}/{workout.total_days}
                        </Badge>
                      </div>
                      <p className="text-xs text-white/60 mb-2">{workout.plan_name}</p>
                      <p className="text-sm text-white/60 mb-2">{workout.workout_description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-teal-400" />
                          <span className="text-white/60">{workout.estimated_duration} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-teal-400" />
                          <span className="text-white/60">{workout.exercises.length} exercises</span>
                        </div>
                      </div>
                    </div>

                    {/* Exercise List */}
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium text-white/60 mb-2">Exercises</h5>
                      <div className="space-y-1">
                        {workout.exercises.slice(0, 5).map((exercise, index) => (
                          <div key={exercise.exercise_id} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-xs font-medium text-teal-400 w-4 flex-shrink-0">{index + 1}.</span>
                              <span className="text-sm font-medium text-white">{exercise.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge className="text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30">
                                {exercise.sets}×{exercise.reps}
                              </Badge>
                              {exercise.weight > 0 && (
                                <span className="text-xs text-white/60">{exercise.weight}kg</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {workout.exercises.length > 5 && (
                          <div className="text-xs text-white/60 text-center py-1">
                            +{workout.exercises.length - 5} more exercises
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-10"
                onClick={() => navigate('/fitness/workout-session')}
              >
                <Dumbbell className="h-4 w-4 mr-2" />
                Start Today's Workouts
              </Button>
            </div>
          ) : (
            <div className="text-center py-6">
              <Dumbbell className="h-10 w-10 mx-auto mb-3 text-white/30" />
              <p className="text-sm text-white/60 mb-4">
                No workout scheduled
              </p>
              <Button
                className="w-full bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
                onClick={() => navigate('/fitness/workout-plans')}
              >
                Browse Workout Plans
              </Button>
            </div>
          )}

        </Card>

        {/* Workout Progress - Important */}
        <div className="lg:col-span-2">
          <WorkoutProgress 
            goals={generateWorkoutGoals()}
            stats={generateWorkoutStats()}
            onUpdateGoal={(goalId) => {}}
          />
        </div>
      </div>

      {/* Secondary Section - Health Overview */}
      <div className="grid grid-cols-1 gap-6">
        <HealthOverview
          initialWeight={profile.weight}
          initialHeight={profile.height}
          onUpdateMeasurements={(weight, height, bmi) => {
            const updatedProfile = { ...profile, weight, height };
            setProfile(updatedProfile);
            localStorage.setItem('fitnessProfile', JSON.stringify(updatedProfile));
          }}
        />
      </div>

      {/* Tertiary Section - Reminders */}
      <div className="grid grid-cols-1">
        <RecentReminders 
          reminders={remindersResponse?.data || []}
          loading={remindersLoading}
          onAction={handleReminderAction}
          onDismiss={handleDismissReminder}
        />
      </div>

      {/* Motivational Footer */}
      <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <Target className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Keep Going!</h3>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-8 text-xs" onClick={() => navigate('/fitness/progress')}>
              View Progress
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FitnessDashboard;