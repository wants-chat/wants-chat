// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
  Filler
} from 'chart.js';
import { UserFitnessProfile, ProgressEntry } from '../../types/fitness';
import { bodyMeasurementsApiService, BodyMeasurementAnalytics } from '../../services/bodyMeasurementsApi';
import { useWorkoutHistory } from '../../hooks/fitness/useWorkoutHistory';
import { useFitnessProfile } from '../../hooks/fitness/useFitnessProfile';
import {
  StatsCards,
  ProgressCharts,
  GoalsProgress,
  WeightBodyTracking,
  MotivationalQuote
} from '../../components/fitness/progress';

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
  ArcElement,
  Filler
);

const FitnessProgress: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [analyticsData, setAnalyticsData] = useState<BodyMeasurementAnalytics | null>(null);

  // Get real fitness profile data from API
  const { data: userProfile, isLoading: profileLoading } = useFitnessProfile();
  
  // Get workout history data for weekly activity chart
  const { workouts: workoutHistory, loading: workoutHistoryLoading } = useWorkoutHistory();

  useEffect(() => {
    // Load progress data from API
    loadProgressData();
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const analytics = await bodyMeasurementsApiService.getBodyMeasurementAnalytics(100);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // API failed - analytics data will be empty
    }
  };

  const loadProgressData = () => {
    // Initialize with empty data - progress data should come from API
    setProgressData([]);
  };



  // Calculate stats using real API profile data
  const calculateStats = () => {
    const calculateBMI = (weight: number, height: number) => {
      if (!weight || !height || height === 0) return 0;
      const heightInM = height / 100;
      return (weight / (heightInM * heightInM));
    };

    const calculateCurrentStreak = () => {
      if (!workoutHistory || workoutHistory.length === 0) return 0;
      
      // Sort workouts by date (most recent first)
      const sortedWorkouts = [...workoutHistory].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Get unique workout dates (ignore multiple workouts on same day)
      const uniqueDates = Array.from(new Set(
        sortedWorkouts.map(workout => new Date(workout.date).toDateString())
      )).map(dateStr => new Date(dateStr));
      
      // Sort dates (most recent first)
      uniqueDates.sort((a, b) => b.getTime() - a.getTime());
      
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const workoutDate = new Date(uniqueDates[i]);
        workoutDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - streak);
        
        const diffInDays = Math.floor((expectedDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) {
          // Workout on expected date
          streak++;
        } else if (diffInDays === 1 && streak === 0) {
          // Workout yesterday (if we haven't worked out today)
          streak++;
        } else {
          // Gap in streak found
          break;
        }
      }
      
      return streak;
    };

    // Use real profile data for current weight and height
    const currentWeight = userProfile?.weight || 0;
    const height = userProfile?.height || 0;
    const currentBMI = calculateBMI(currentWeight, height);
    
    // For body fat and changes, use analytics data from API
    const currentBodyFat = analyticsData?.bodyFat?.current || 0;
    const latestData = progressData.length > 0 ? progressData[progressData.length - 1] : null;
    const startData = progressData.length > 0 ? progressData[0] : null;
    
    return {
      currentWeight: currentWeight,
      weightChange: startData ? currentWeight - (startData.weight || 0) : 0,
      currentBodyFat: currentBodyFat,
      bodyFatChange: startData ? currentBodyFat - (startData.bodyFat || 0) : 0,
      totalWorkouts: workoutHistory?.length || 0,
      currentStreak: calculateCurrentStreak(),
      bmi: currentBMI > 0 ? currentBMI.toFixed(1) : '0',
      achievements: userProfile?.achievements?.length || 0 // Use achievement count from API
    };
  };

  const stats = calculateStats();

  // Transform analytics data for overview charts
  const getWeightChartData = () => {
    if (!analyticsData?.weight) {
      return {
        labels: progressData.map(d => d.date.toLocaleDateString('en', { month: 'short', day: 'numeric' })),
        datasets: [{
          label: 'Weight (kg)',
          data: progressData.map(d => d.weight),
          borderColor: '#47bdff',
          backgroundColor: 'rgba(71, 189, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      };
    }
    
    return {
      labels: analyticsData.weight.data.map((point: any) => 
        new Date(point.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        label: 'Weight (kg)',
        data: analyticsData.weight.data.map((point: any) => point.value),
        borderColor: '#47bdff',
        backgroundColor: 'rgba(71, 189, 255, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  const getBodyMeasurementsComparisonData = () => {
    if (!analyticsData) {
      return {
        labels: ['Chest', 'Waist', 'Hips', 'Biceps', 'Thighs', 'Calves'],
        datasets: [{
          label: 'Current',
          data: progressData.length > 0 ? [
            progressData[progressData.length - 1].measurements?.chest || 0,
            progressData[progressData.length - 1].measurements?.waist || 0,
            progressData[progressData.length - 1].measurements?.hips || 0,
            progressData[progressData.length - 1].measurements?.biceps || 0,
            progressData[progressData.length - 1].measurements?.thighs || 0,
            progressData[progressData.length - 1].measurements?.calves || 0
          ] : [],
          backgroundColor: '#47bdff',
          borderColor: '#47bdff',
          borderWidth: 2
        }, {
          label: '10 Days Ago',
          data: progressData.length > 0 ? [
            progressData[0].measurements?.chest || 0,
            progressData[0].measurements?.waist || 0,
            progressData[0].measurements?.hips || 0,
            progressData[0].measurements?.biceps || 0,
            progressData[0].measurements?.thighs || 0,
            progressData[0].measurements?.calves || 0
          ] : [],
          backgroundColor: 'rgba(156, 163, 175, 0.3)',
          borderColor: '#9ca3af',
          borderWidth: 2
        }]
      };
    }

    const measurementTypes = ['chest', 'waist', 'hips', 'biceps', 'thighs', 'calves'];
    const currentValues: number[] = [];
    const tenDaysAgoValues: number[] = [];

    measurementTypes.forEach(type => {
      const data = analyticsData[type];
      if (data && data.data && data.data.length > 0) {
        // Current value
        currentValues.push(data.current || 0);
        
        // Find value from ~10 days ago (or earliest available)
        const tenDaysAgo = data.data.length >= 10 ? data.data[data.data.length - 10] : data.data[0];
        tenDaysAgoValues.push(tenDaysAgo?.value || 0);
      } else {
        currentValues.push(0);
        tenDaysAgoValues.push(0);
      }
    });

    return {
      labels: ['Chest', 'Waist', 'Hips', 'Biceps', 'Thighs', 'Calves'],
      datasets: [{
        label: 'Current',
        data: currentValues,
        backgroundColor: '#47bdff',
        borderColor: '#47bdff',
        borderWidth: 2
      }, {
        label: '10 Days Ago',
        data: tenDaysAgoValues,
        backgroundColor: 'rgba(156, 163, 175, 0.3)',
        borderColor: '#9ca3af',
        borderWidth: 2
      }]
    };
  };

  const weightChartData = getWeightChartData();
  const bodyMeasurementsData = getBodyMeasurementsComparisonData();

  // Generate weekly activity chart from workout history
  const getWorkoutFrequencyData = () => {
    if (!workoutHistory || workoutHistory.length === 0) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Workouts',
          data: [0, 0, 0, 0, 0, 0, 0], // Empty data when no workout history
          backgroundColor: '#10b981'
        }]
      };
    }

    // Count workouts by day of week
    const workoutsByDay = [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
    
    workoutHistory.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const dayOfWeek = workoutDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon=0, Tue=1, ..., Sun=6
      workoutsByDay[adjustedDay]++;
    });

    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Workouts',
        data: workoutsByDay,
        backgroundColor: '#10b981'
      }]
    };
  };

  const workoutFrequencyData = getWorkoutFrequencyData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Progress Analytics</h1>
            <p className="text-white/60 mt-1">
              Track your fitness journey with comprehensive insights
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <StatsCards stats={stats} loading={profileLoading || workoutHistoryLoading} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-xl border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">
              Overview
            </TabsTrigger>
            <TabsTrigger value="weight" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">
              Weight & Body
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60">
              Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ProgressCharts 
              weightData={weightChartData}
              bodyMeasurementsData={bodyMeasurementsData}
              workoutFrequencyData={workoutFrequencyData}
              chartOptions={chartOptions}
            />

            <GoalsProgress goals={[
              // Weight Goal from API data
              ...(userProfile?.targetWeight ? [{
                id: '1',
                title: 'Weight Goal',
                description: `Target: ${userProfile.targetWeight}kg`,
                current: userProfile.weight || 0,
                target: userProfile.targetWeight,
                unit: 'kg',
                progress: (() => {
                  if (!userProfile.weight || !userProfile.targetWeight) return 0;
                  const currentWeight = userProfile.weight;
                  const targetWeight = userProfile.targetWeight;
                  const difference = Math.abs(currentWeight - targetWeight);
                  
                  // If already at target (within 0.5kg), show 100%
                  if (difference <= 0.5) return 100;
                  
                  // For weight goals, show progress based on how much closer we are to target
                  // Assume we started 10kg away from target for progress calculation
                  const assumedStartDistance = 10;
                  const progressMade = Math.max(0, assumedStartDistance - difference);
                  return Math.min(100, Math.max(0, (progressMade / assumedStartDistance) * 100));
                })(),
                status: userProfile.weight && userProfile.targetWeight ?
                  (Math.abs(userProfile.weight - userProfile.targetWeight) <= 1 ? 'Almost there' : 'On track') : 'Not set',
                timeRemaining: userProfile.weight && userProfile.targetWeight ?
                  `${Math.abs(userProfile.weight - userProfile.targetWeight).toFixed(1)}kg ${userProfile.weight > userProfile.targetWeight ? 'to lose' : 'to gain'}` : '',
                icon: 'weight',
                color: 'primary'
              }] : []),
              // Consistency Goal calculated from workout history
              {
                id: '2',
                title: 'Consistency',
                description: 'Workout 5x per Week',
                current: (() => {
                  if (!workoutHistory || workoutHistory.length === 0) return 0;
                  
                  // Calculate workouts in the last 7 days
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  
                  const recentWorkouts = workoutHistory.filter(workout => 
                    new Date(workout.date) >= sevenDaysAgo
                  );
                  
                  return recentWorkouts.length;
                })(),
                target: 5,
                unit: 'workouts/week',
                progress: (() => {
                  if (!workoutHistory || workoutHistory.length === 0) return 0;
                  
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  
                  const recentWorkouts = workoutHistory.filter(workout => 
                    new Date(workout.date) >= sevenDaysAgo
                  );
                  
                  return Math.min(100, (recentWorkouts.length / 5) * 100);
                })(),
                status: (() => {
                  if (!workoutHistory || workoutHistory.length === 0) return 'Getting started';
                  
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  
                  const recentWorkouts = workoutHistory.filter(workout => 
                    new Date(workout.date) >= sevenDaysAgo
                  );
                  
                  if (recentWorkouts.length >= 5) return 'Excellent';
                  if (recentWorkouts.length >= 4) return 'Almost there';
                  if (recentWorkouts.length >= 2) return 'On track';
                  return 'Needs improvement';
                })(),
                timeRemaining: 'This week',
                icon: 'consistency',
                color: 'purple'
              }
            ].filter(Boolean)} />
          </TabsContent>

          {/* Weight & Body Tab */}
          <TabsContent value="weight" className="space-y-6">
            <WeightBodyTracking 
              analyticsData={analyticsData}
              chartOptions={chartOptions}
            />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <GoalsProgress goals={[
              // Weight Goal from API data
              ...(userProfile?.targetWeight ? [{
                id: '1',
                title: 'Weight Goal',
                description: `Target: ${userProfile.targetWeight}kg`,
                current: userProfile.weight || 0,
                target: userProfile.targetWeight,
                unit: 'kg',
                progress: (() => {
                  if (!userProfile.weight || !userProfile.targetWeight) return 0;
                  const currentWeight = userProfile.weight;
                  const targetWeight = userProfile.targetWeight;
                  const difference = Math.abs(currentWeight - targetWeight);
                  
                  // If already at target (within 0.5kg), show 100%
                  if (difference <= 0.5) return 100;
                  
                  // For weight goals, show progress based on how much closer we are to target
                  // Assume we started 10kg away from target for progress calculation
                  const assumedStartDistance = 10;
                  const progressMade = Math.max(0, assumedStartDistance - difference);
                  return Math.min(100, Math.max(0, (progressMade / assumedStartDistance) * 100));
                })(),
                status: userProfile.weight && userProfile.targetWeight ?
                  (Math.abs(userProfile.weight - userProfile.targetWeight) <= 1 ? 'Almost there' : 'On track') : 'Not set',
                timeRemaining: userProfile.weight && userProfile.targetWeight ?
                  `${Math.abs(userProfile.weight - userProfile.targetWeight).toFixed(1)}kg ${userProfile.weight > userProfile.targetWeight ? 'to lose' : 'to gain'}` : '',
                icon: 'weight',
                color: 'primary'
              }] : []),
              // Consistency Goal calculated from workout history
              {
                id: '2',
                title: 'Consistency',
                description: 'Workout 5x per Week',
                current: (() => {
                  if (!workoutHistory || workoutHistory.length === 0) return 0;
                  
                  // Calculate workouts in the last 7 days
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  
                  const recentWorkouts = workoutHistory.filter(workout => 
                    new Date(workout.date) >= sevenDaysAgo
                  );
                  
                  return recentWorkouts.length;
                })(),
                target: 5,
                unit: 'workouts/week',
                progress: (() => {
                  if (!workoutHistory || workoutHistory.length === 0) return 0;
                  
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  
                  const recentWorkouts = workoutHistory.filter(workout => 
                    new Date(workout.date) >= sevenDaysAgo
                  );
                  
                  return Math.min(100, (recentWorkouts.length / 5) * 100);
                })(),
                status: (() => {
                  if (!workoutHistory || workoutHistory.length === 0) return 'Getting started';
                  
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  
                  const recentWorkouts = workoutHistory.filter(workout => 
                    new Date(workout.date) >= sevenDaysAgo
                  );
                  
                  if (recentWorkouts.length >= 5) return 'Excellent';
                  if (recentWorkouts.length >= 4) return 'Almost there';
                  if (recentWorkouts.length >= 2) return 'On track';
                  return 'Needs improvement';
                })(),
                timeRemaining: 'This week',
                icon: 'consistency',
                color: 'purple'
              }
            ].filter(Boolean)} />
          </TabsContent>
        </Tabs>

        <MotivationalQuote streak={stats?.currentStreak || 0} />
    </div>
  );
};

export default FitnessProgress;