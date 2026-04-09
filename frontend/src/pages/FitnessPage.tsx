// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useWorkoutLogs, useFitnessStats, useExercises } from '../hooks/useServices';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Activity, Dumbbell, TrendingUp, Target, Clock, Plus, Loader2 } from 'lucide-react';
import WorkoutForm from '../components/fitness/WorkoutForm';
import ExerciseLibrary from '../components/fitness/ExerciseLibrary';
import ProgressChart from '../components/fitness/ProgressChart';
import { ToastContainer } from '../components/ui/toast';
import BackgroundEffects from '../components/ui/BackgroundEffects';

const FitnessPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // API hooks for real data
  const { data: workoutLogs, loading: logsLoading, error: logsError } = useWorkoutLogs();
  const { data: fitnessStats, loading: statsLoading, error: statsError } = useFitnessStats();
  const { data: exercises, loading: exercisesLoading, error: exercisesError } = useExercises();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const recentWorkouts = Array.isArray(workoutLogs) ? workoutLogs.slice(0, 3) : [];

  return (
    <div className="fitness-page min-h-screen relative">
      <BackgroundEffects variant="subtle" />

      <div className="relative z-10">
        <header className="header border-b border-white/20">
          <nav className="navbar">
            <div className="nav-container max-w-7xl mx-auto px-4 py-4">
              <div className="nav-brand flex items-center space-x-3">
                <span className="logo text-2xl">💪</span>
                <span className="brand-name text-xl font-bold text-white">Fitness Tracker</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  className="theme-toggle p-2 rounded-md border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </nav>
        </header>

        <main className="container max-w-7xl mx-auto px-4 py-6">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">
              {getGreeting()}! Ready to crush your fitness goals? 🔥
            </h1>
            <p className="text-white/60">
              Track your workouts, monitor progress, and achieve your fitness milestones
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-xl border border-white/20 p-1">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">
                <Activity className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="log-workout" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">
                <Plus className="h-4 w-4" />
                <span>Log Workout</span>
              </TabsTrigger>
              <TabsTrigger value="exercises" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">
                <Dumbbell className="h-4 w-4" />
                <span>Exercise Library</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">
                <TrendingUp className="h-4 w-4" />
                <span>Progress</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Total Workouts</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (fitnessStats?.totalWorkouts || 0)}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-teal-400 opacity-75" />
                  </div>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Total Time</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${Math.round((fitnessStats?.totalExerciseTime || 0) / 60)}h`}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-cyan-400 opacity-75" />
                  </div>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Current Streak</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${fitnessStats?.currentStreak || 0}d`}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-teal-400 opacity-75" />
                  </div>
                </div>

                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/60">Calories Burned</p>
                      <p className="text-2xl font-bold text-white">
                        {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (fitnessStats?.totalCaloriesBurned || 0)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-cyan-400 opacity-75" />
                  </div>
                </div>
              </div>

              {/* Recent Workouts */}
              <div className="p-6 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Recent Workouts</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('log-workout')}
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Log Workout
                  </Button>
                </div>

                {logsLoading ? (
                  <div className="flex items-center justify-center py-8 text-white">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading workouts...</span>
                  </div>
                ) : logsError ? (
                  <div className="text-center py-8 text-red-400">
                    <p>Error loading workouts: {logsError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 border-white/20 bg-white/10 text-white hover:bg-white/20"
                      onClick={() => window.location.reload()}
                    >
                      Retry
                    </Button>
                  </div>
                ) : recentWorkouts.length > 0 ? (
                  <div className="space-y-3">
                    {recentWorkouts.map((workout: any) => (
                      <div key={workout.id} className="flex items-center justify-between p-3 border border-white/20 rounded-lg bg-white/5">
                        <div>
                          <h3 className="font-medium text-white">{workout.name}</h3>
                          <p className="text-sm text-white/60">
                            {new Date(workout.startTime).toLocaleDateString()} •
                            {workout.exercises.length} exercises •
                            {workout.endTime ? `${Math.round((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / (1000 * 60))}min` : 'In progress'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {workout.rating && (
                            <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                              {'★'.repeat(workout.rating)} {workout.rating}/5
                            </Badge>
                          )}
                          <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
                            {workout.totalCaloriesBurned || 0} cal
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/60">
                    <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No workouts logged yet</p>
                    <p className="text-sm">Start your fitness journey by logging your first workout!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Log Workout Tab */}
            <TabsContent value="log-workout">
              <WorkoutForm />
            </TabsContent>

            {/* Exercise Library Tab */}
            <TabsContent value="exercises">
              <ExerciseLibrary
                exercises={exercises?.exercises || []}
                isLoading={exercisesLoading}
                error={exercisesError ? (typeof exercisesError === 'string' ? new Error(exercisesError) : exercisesError) : null}
              />
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress">
              <ProgressChart />
            </TabsContent>
          </Tabs>
        </main>

        {/* Toast Container */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default FitnessPage;