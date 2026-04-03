import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useWorkoutLogs, useFitnessStats } from '../../hooks/useServices';
import { TrendingUp, Calendar, BarChart3, PieChart, Loader2, RefreshCw } from 'lucide-react';
import type { WorkoutLog, CompletedExercise } from '../../services/fitnessService';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type TimeFrame = 'week' | 'month' | 'year' | 'all';
type ChartType = 'workouts' | 'progress' | 'muscles';

const ProgressChart: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('month');
  const [activeChart, setActiveChart] = useState<ChartType>('workouts');
  
  // API hooks
  const { data: workoutLogs, loading: logsLoading, error: logsError, refetch: refetchLogs } = useWorkoutLogs();
  const { data: fitnessStats, loading: statsLoading, error: statsError, refetch: refetchStats } = useFitnessStats(timeFrame);

  // Chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }), []);

  // Process workout data for charts
  const processWorkoutData = useMemo(() => {
    if (!workoutLogs?.data) return null;

    const logs = workoutLogs.data;
    
    // Get date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    switch (timeFrame) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Filter logs by date range
    const filteredLogs = logs.filter((log: WorkoutLog) => new Date(log.startTime) >= startDate);

    // Group workouts by day/week/month based on timeframe
    const groupedData: { [key: string]: { count: number; duration: number; calories: number } } = {};
    
    filteredLogs.forEach((log: WorkoutLog) => {
      const logDate = new Date(log.startTime);
      let groupKey: string;
      
      if (timeFrame === 'week') {
        groupKey = logDate.toLocaleDateString();
      } else if (timeFrame === 'month') {
        const weekStart = new Date(logDate);
        weekStart.setDate(logDate.getDate() - logDate.getDay());
        groupKey = `Week of ${weekStart.toLocaleDateString()}`;
      } else {
        groupKey = logDate.toLocaleDateString('default', { month: 'short', year: 'numeric' });
      }
      
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = { count: 0, duration: 0, calories: 0 };
      }
      
      groupedData[groupKey].count++;
      
      // Calculate duration
      if (log.endTime) {
        const duration = (new Date(log.endTime).getTime() - new Date(log.startTime).getTime()) / (1000 * 60);
        groupedData[groupKey].duration += duration;
      }
      
      groupedData[groupKey].calories += log.totalCaloriesBurned || 0;
    });

    const labels = Object.keys(groupedData).sort();
    const workoutCounts = labels.map(label => groupedData[label].count);
    const durations = labels.map(label => Math.round(groupedData[label].duration));
    const calories = labels.map(label => groupedData[label].calories);

    return { labels, workoutCounts, durations, calories };
  }, [workoutLogs, timeFrame]);

  // Process muscle group data
  const processMuscleData = useMemo(() => {
    if (!workoutLogs?.data) return null;

    const muscleCount: { [key: string]: number } = {};

    workoutLogs.data.forEach((log: WorkoutLog) => {
      log.exercises.forEach((exercise: CompletedExercise) => {
        // This would need to be enhanced with actual exercise-to-muscle mapping
        // For now, we'll use a simple categorization
        const exerciseName = exercise.exerciseId; // This should be resolved to actual exercise name
        
        // Simple muscle group classification (this should come from exercise data)
        let muscleGroup = 'Other';
        if (exerciseName?.toLowerCase().includes('chest') || exerciseName?.toLowerCase().includes('bench')) {
          muscleGroup = 'Chest';
        } else if (exerciseName?.toLowerCase().includes('back') || exerciseName?.toLowerCase().includes('pull')) {
          muscleGroup = 'Back';
        } else if (exerciseName?.toLowerCase().includes('leg') || exerciseName?.toLowerCase().includes('squat')) {
          muscleGroup = 'Legs';
        } else if (exerciseName?.toLowerCase().includes('shoulder') || exerciseName?.toLowerCase().includes('press')) {
          muscleGroup = 'Shoulders';
        } else if (exerciseName?.toLowerCase().includes('arm') || exerciseName?.toLowerCase().includes('curl')) {
          muscleGroup = 'Arms';
        }
        
        muscleCount[muscleGroup] = (muscleCount[muscleGroup] || 0) + exercise.sets.length;
      });
    });

    const labels = Object.keys(muscleCount);
    const data = Object.values(muscleCount);
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
    ];

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
      }]
    };
  }, [workoutLogs]);

  const refreshData = () => {
    refetchLogs();
    refetchStats();
  };

  const isLoading = logsLoading || statsLoading;
  const hasError = logsError || statsError;

  if (hasError) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <TrendingUp className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-semibold">Error Loading Progress Data</h3>
            <p className="text-sm text-muted-foreground">
              {logsError || statsError || 'Failed to load progress data'}
            </p>
          </div>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-primary" />
              Progress Analytics
            </h2>
            <p className="text-sm text-muted-foreground">
              Track your fitness journey with detailed analytics
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Frame</label>
            <Select value={timeFrame} onValueChange={(value: string) => setTimeFrame(value as TimeFrame)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Chart Type</label>
            <Select value={activeChart} onValueChange={(value: string) => setActiveChart(value as ChartType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workouts">Workout Frequency</SelectItem>
                <SelectItem value="progress">Progress Trends</SelectItem>
                <SelectItem value="muscles">Muscle Group Focus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (fitnessStats?.totalWorkouts || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Workouts</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : `${Math.round((fitnessStats?.totalExerciseTime || 0) / 60)}h`}
            </div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : `${fitnessStats?.currentStreak || 0}d`}
            </div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : `${Math.round((fitnessStats?.averageWorkoutDuration || 0))}min`}
            </div>
            <div className="text-sm text-muted-foreground">Avg Duration</div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeChart === 'workouts' && processWorkoutData && (
          <>
            {/* Workout Frequency Chart */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Workout Frequency</h3>
              </div>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Bar
                    data={{
                      labels: processWorkoutData.labels,
                      datasets: [
                        {
                          label: 'Workouts',
                          data: processWorkoutData.workoutCounts,
                          backgroundColor: 'rgba(59, 130, 246, 0.8)',
                          borderColor: 'rgb(59, 130, 246)',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                )}
              </div>
            </Card>

            {/* Duration Chart */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold">Workout Duration</h3>
              </div>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Line
                    data={{
                      labels: processWorkoutData.labels,
                      datasets: [
                        {
                          label: 'Duration (minutes)',
                          data: processWorkoutData.durations,
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={chartOptions}
                  />
                )}
              </div>
            </Card>
          </>
        )}

        {activeChart === 'muscles' && processMuscleData && (
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <PieChart className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold">Muscle Group Distribution</h3>
            </div>
            <div className="h-[400px] flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <div className="w-[300px] h-[300px]">
                  <Doughnut 
                    data={processMuscleData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {activeChart === 'progress' && (
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold">Progress Trends</h3>
            </div>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Progress tracking coming soon!</p>
                <p className="text-sm">Connect your fitness devices to see detailed progress analytics</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* No Data State */}
      {!isLoading && processWorkoutData?.workoutCounts.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <h3 className="font-medium mb-2">No workout data available</h3>
            <p className="text-sm">
              Start logging workouts to see your progress analytics here
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProgressChart;