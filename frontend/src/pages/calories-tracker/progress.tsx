import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCalories } from '../../contexts/CaloriesContext';
import caloriesApi from '../../services/caloriesApi';
import WeightStats from '../../components/calories-tracker/progress/WeightStats';
import TimeRangeSelector from '../../components/calories-tracker/progress/TimeRangeSelector';
import ProgressTabs from '../../components/calories-tracker/progress/ProgressTabs';
import WeightProgress from '../../components/calories-tracker/progress/WeightProgress';
import CalorieTracking from '../../components/calories-tracker/progress/CalorieTracking';
import PhotoProgress from '../../components/calories-tracker/progress/PhotoProgress';
import HealthSummary from '../../components/calories-tracker/progress/HealthSummary';
import { ProgressPageSkeleton } from '../../components/calories-tracker/skeletons';

interface WeightEntry {
  date: Date;
  weight: number;
}

interface ProgressData {
  weightHistory: WeightEntry[];
  calorieHistory: { date: Date; consumed: number; goal: number }[];
  measurements: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  photos: {
    date: Date;
    url: string;
    type: 'front' | 'side' | 'back';
  }[];
  currentWeight?: number;
  startWeight?: number;
  goalWeight?: number;
}

const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile: apiProfile, dashboardData, isLoading, profileCheckComplete } = useCalories();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'weight' | 'calories' | 'photos'>('weight');
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  useEffect(() => {
    // Don't check profile while auth is loading or if profile check is not complete
    if (authLoading || !profileCheckComplete) return;

    if (isAuthenticated && apiProfile) {
      // Use API data for authenticated users
      const { profile: p, goals: g } = apiProfile;
      setUserProfile({
        currentWeight: p.current_weight_kg,
        targetWeight: p.target_weight_kg,
        height: p.height_cm,
        age: p.age,
        activityLevel: p.activity_level,
        dailyCalories: g.daily_calories
      });
      // Load progress data after profile is set
    } else if (!isAuthenticated) {
      // Load from localStorage for non-authenticated users
      loadUserProfile();
    } else if (isAuthenticated && profileCheckComplete && !apiProfile && !isLoading) {
      // Check if user has completed onboarding before redirecting
      const hasOnboardingData = localStorage.getItem('caloriesTrackerOnboarding');
      const onboardingCompleted = localStorage.getItem('onboardingCompleted');
      
      // Only redirect if user is coming from landing page, not when refreshing other pages
      const currentPath = window.location.pathname;
      const isOnLandingPage = currentPath === '/calories-tracker';
      
      if ((!hasOnboardingData || onboardingCompleted !== 'true') && isOnLandingPage) {
        // If authenticated but no profile and no onboarding data, redirect to onboarding
        navigate('/calories-tracker/onboarding');
      }
      // If they have onboarding data or accessing directly, let them continue with localStorage data
    }
  }, [navigate, isAuthenticated, authLoading, profileCheckComplete, apiProfile]);

  // Load progress data when profile is ready or time range changes
  useEffect(() => {
    if ((userProfile && isAuthenticated) || (!isAuthenticated && userProfile)) {
      loadProgressData();
    }
  }, [userProfile, timeRange, isAuthenticated]);

  const loadUserProfile = () => {
    const saved = localStorage.getItem('caloriesTrackerOnboarding');
    if (saved) {
      setUserProfile(JSON.parse(saved));
    } else {
      // Redirect to onboarding if no data found
      navigate('/calories-tracker/onboarding');
    }
  };

  const loadProgressData = async () => {
    setIsLoadingProgress(true);
    
    try {
      if (isAuthenticated) {
        // Determine period based on timeRange
        const periodMap = {
          'week': 7,
          'month': 30,
          '3months': 90,
          'year': 365
        };
        const days = periodMap[timeRange];

        // Fetch all data from APIs in parallel, handling errors gracefully
        const [
          weightLogsResponse, 
          progressSummaryResponse,
          dailyStatsResponse, 
          photosResponse
        ] = await Promise.all([
          caloriesApi.getWeightLogs(), // Using the new weight-logs endpoint
          caloriesApi.getProgressSummary(days).catch(err => {
            console.error('Failed to fetch progress summary:', err);
            return { measurements: {} };
          }),
          caloriesApi.getDailyStats(days).catch(err => {
            console.error('Failed to fetch daily stats:', err);
            return { stats: [] };
          }),
          caloriesApi.getProgressPhotos().catch(err => {
            console.error('Failed to fetch photos:', err);
            return { photos: [] };
          })
        ]);

        // Transform weight history from API
        // The weight-logs endpoint returns an array of weight logs directly
        const weightHistory = (Array.isArray(weightLogsResponse) ? weightLogsResponse : []).map((entry: any) => ({
          date: new Date(entry.date),
          weight: entry.weight_kg
        })).sort((a: any, b: any) => a.date - b.date); // Sort by date ascending
        
        // Transform calorie history from daily stats
        const calorieHistory = dailyStatsResponse.stats.map((stat: any) => ({
          date: new Date(stat.date),
          consumed: stat.consumed_calories,
          goal: stat.target_calories
        }));

        // Transform photos and strip query parameters from URLs
        const photos = photosResponse.photos.map((photo: any) => {
          // Strip query parameters from the URL
          const cleanUrl = photo.photo_url.split('?')[0];
          
          return {
            date: new Date(photo.created_at),
            url: cleanUrl,
            type: photo.type as 'front' | 'side' | 'back'
          };
        });

        const progressData: ProgressData = {
          weightHistory,
          calorieHistory,
          measurements: progressSummaryResponse.measurements || {},
          photos,
          currentWeight: dashboardData?.weight?.current || weightHistory[weightHistory.length - 1]?.weight || 70,
          startWeight: dashboardData?.weight?.start || weightHistory[0]?.weight || 75,
          goalWeight: apiProfile?.profile?.target_weight_kg || 65
        };
        setProgressData(progressData);
      } else {
        // Initialize with empty data for non-authenticated users
        const emptyData: ProgressData = {
          weightHistory: [],
          calorieHistory: [],
          measurements: {},
          photos: [],
          currentWeight: 0,
          startWeight: 0,
          goalWeight: 0
        };
        setProgressData(emptyData);
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
      // Initialize with empty data on error
      const emptyData: ProgressData = {
        weightHistory: [],
        calorieHistory: [],
        measurements: {},
        photos: [],
        currentWeight: 0,
        startWeight: 0,
        goalWeight: 0
      };
      setProgressData(emptyData);
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Weight and calorie history should come from API
  const generateWeightHistory = (): WeightEntry[] => {
    return [];
  };

  const generateCalorieHistory = () => {
    return [];
  };

  const getWeightStats = () => {
    if (!progressData || !userProfile) return null;

    const weights = progressData.weightHistory;
    const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : (userProfile.currentWeight || 0);
    const startWeight = weights.length > 0 ? weights[0].weight : (userProfile.currentWeight || 0);
    const goalWeight = userProfile.targetWeight || 0;

    // For authenticated users, use dashboard data if available
    const actualStartWeight = dashboardData?.weight?.start || startWeight || 0;

    const totalLost = (actualStartWeight - currentWeight) || 0;
    const toGoal = (currentWeight - goalWeight) || 0;
    const progressPercent = (goalWeight >= actualStartWeight || actualStartWeight === goalWeight) ? 0 :
      ((actualStartWeight - currentWeight) / (actualStartWeight - goalWeight)) * 100;

    return {
      current: currentWeight || 0,
      start: actualStartWeight || 0,
      goal: goalWeight || 0,
      lost: isNaN(totalLost) ? 0 : totalLost,
      toGo: isNaN(toGoal) ? 0 : toGoal,
      progress: isNaN(progressPercent) ? 0 : Math.min(Math.max(progressPercent, 0), 100)
    };
  };

  const getCalorieStats = () => {
    if (!progressData) return null;

    const history = progressData.calorieHistory;
    // Handle empty history to avoid NaN from division by zero
    const avgConsumed = history.length > 0
      ? history.reduce((sum, day) => sum + day.consumed, 0) / history.length
      : 0;
    const daysOnTarget = history.filter(day =>
      day.consumed >= day.goal * 0.9 && day.consumed <= day.goal * 1.1
    ).length;

    return {
      avgConsumed: Math.round(avgConsumed) || 0,
      daysOnTarget,
      totalDays: history.length,
      accuracy: history.length > 0 ? Math.round((daysOnTarget / history.length) * 100) : 0
    };
  };

  const handleTimeRangeChange = (newTimeRange: 'week' | 'month' | '3months' | 'year') => {
    setTimeRange(newTimeRange);
    // Data will automatically reload due to the useEffect dependency on timeRange
  };

  const weightStats = getWeightStats();
  const calorieStats = getCalorieStats();

  // Show loading state while checking auth or profile
  if (authLoading || !profileCheckComplete || (isLoading && !userProfile)) {
    return (
      <div className="min-h-screen p-6">
        <ProgressPageSkeleton />
      </div>
    );
  }

  // Show loading state while fetching progress data
  if (isLoadingProgress || !progressData || !userProfile) {
    return (
      <div className="min-h-screen p-6">
        <ProgressPageSkeleton />
      </div>
    );
  }

  if (!weightStats || !calorieStats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <WeightStats
        totalLost={weightStats.lost}
        toGoal={weightStats.toGo}
        avgCalories={calorieStats.avgConsumed}
        accuracy={calorieStats.accuracy}
      />

      {/* Time Range Selector */}
      <TimeRangeSelector
        selected={timeRange}
        onChange={handleTimeRangeChange}
      />

      {/* Tab Navigation */}
      <ProgressTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content Based on Active Tab */}
      {activeTab === 'weight' && (
        <WeightProgress
          startWeight={weightStats.start}
          currentWeight={weightStats.current}
          goalWeight={weightStats.goal}
          totalLost={weightStats.lost}
          progress={weightStats.progress}
          weightHistory={progressData.weightHistory}
        />
      )}

      {activeTab === 'calories' && (
        <CalorieTracking
          calorieHistory={progressData.calorieHistory}
          daysOnTarget={calorieStats.daysOnTarget}
          avgConsumed={calorieStats.avgConsumed}
        />
      )}


      {activeTab === 'photos' && (
        <PhotoProgress
          photos={progressData.photos}
          onAddPhoto={async (file: File, type: 'front' | 'side' | 'back') => {
            try {
              const formData = new FormData();
              formData.append('image', file); // Changed from 'photo' to 'image'
              formData.append('type', type);
              
              await caloriesApi.uploadProgressPhoto(formData);
              // Reload progress data to show the new photo
              await loadProgressData();
            } catch (error) {
              console.error('Failed to upload photo:', error);
              // You might want to show a toast notification here
            }
          }}
        />
      )}

      {/* Health Summary */}
      <HealthSummary 
        weightData={{
          currentWeight: progressData.currentWeight || 70,
          startWeight: progressData.startWeight || 75,
          goalWeight: progressData.goalWeight || 65,
          weightChange: (progressData.currentWeight || 70) - (progressData.startWeight || 75)
        }}
        calorieStats={{
          avgDaily: progressData.calorieHistory.length > 0 
            ? progressData.calorieHistory.reduce((sum, day) => sum + day.consumed, 0) / progressData.calorieHistory.length 
            : 0,
          onTarget: progressData.calorieHistory.length > 0 
            ? (() => {
                const loggedDays = progressData.calorieHistory.filter(day => day.consumed > 0);
                return Math.round((loggedDays.filter(day => Math.abs(day.consumed - day.goal) <= day.goal * 0.1).length / loggedDays.length) * 100);
              })()
            : 0,
          totalDays: progressData.calorieHistory.filter(day => day.consumed > 0).length
        }}
      />
    </div>
  );
};

export default ProgressPage;