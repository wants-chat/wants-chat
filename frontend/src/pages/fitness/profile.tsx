// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@mdi/react';
import { 
  mdiDownload,
  mdiShare
} from '@mdi/js';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  ProfileHeader,
  UserBasicInfo,
  FitnessMetrics,
  WorkoutPlansGrid,
  WorkoutHistory,
  AchievementsBadges
} from '../../components/fitness/profile';
import { UserFitnessProfile, WorkoutPlan, Workout } from '../../types/fitness';
import { Achievement } from '../../services/fitnessService';
import { useWorkoutHistory } from '../../hooks/fitness/useWorkoutHistory';
import { useWorkoutPlans } from '../../hooks/fitness/useWorkoutPlansNew';
import { useFitnessProfile } from '../../hooks/fitness/useFitnessProfile';
import { useAchievements } from '../../hooks/fitness/useAchievements';
import { useMilestones } from '../../hooks/fitness/useMilestones';
import { fitnessProfileApiService } from '../../services/fitnessProfileApi';
import { fitnessService } from '../../services/fitnessService';
import { toast } from '../../components/ui/sonner';

interface ExtendedWorkoutPlan extends WorkoutPlan {
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  daysCompleted: number;
  totalDays: number;
  lastWorkoutDate?: Date;
  nextWorkoutDate?: Date;
  isFavorite: boolean;
  isActive: boolean;
  isCompleted: boolean;
  category: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  rating?: number;
  completionCertificate?: boolean;
}

interface WorkoutHistoryEntry extends Workout {
  intensity: 'low' | 'medium' | 'high';
  caloriesBurned?: number;
  personalRecords?: number;
  weightRecorded?: number;
  bodyFatPercentage?: number;
  restingHeartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  mood?: 'excellent' | 'good' | 'average' | 'poor';
  energyLevel?: 'high' | 'medium' | 'low';
  sleepHours?: number;
  waterIntake?: number;
}

interface ExtendedAchievement extends Achievement {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  shareUrl?: string;
  certificateUrl?: string;
  unlockedAt?: Date;
  progress: number;
  target: number;
}

const FitnessProfile: React.FC = () => {
  const navigate = useNavigate();
  const [weightHistory, setWeightHistory] = useState<{ date: Date; weight: number }[]>([]);
  
  // Use the fitness profile hook to fetch real data from API
  const {
    data: userProfile,
    bmiData: currentBMI,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useFitnessProfile();
  
  // Use the workout history hook to fetch real data from API
  const {
    workouts: workoutHistory,
    stats: workoutStats,
    loading: workoutHistoryLoading,
    error: workoutHistoryError,
    refetch: refetchWorkoutHistory
  } = useWorkoutHistory();
  
  // Use the workout plans hook to fetch real data from API
  const {
    workoutPlans,
    loading: workoutPlansLoading,
    error: workoutPlansError,
    refetch: refetchWorkoutPlans,
    deleteWorkoutPlan
  } = useWorkoutPlans();

  // Use the achievements hook to fetch real data from API
  const {
    achievements: apiAchievements,
    loading: achievementsLoading,
    error: achievementsError,
    refetch: refetchAchievements
  } = useAchievements();

  // Use the milestones hook to fetch real data from API
  const {
    milestones,
    loading: milestonesLoading,
    error: milestonesError,
    refetch: refetchMilestones
  } = useMilestones();

  // Helper function to get achievement icon based on category
  const getAchievementIcon = (category: string): string => {
    switch (category) {
      case 'workout': return 'dumbbell';
      case 'streak': return 'fire';
      case 'weight': return 'target';
      case 'milestone': return 'trophy';
      default: return 'star';
    }
  };

  // Transform API achievements to ExtendedAchievement format
  const achievements: ExtendedAchievement[] = apiAchievements.map(achievement => ({
    ...achievement,
    // Check if this achievement is unlocked based on user profile
    unlockedAt: userProfile?.achievements?.includes(achievement.id) ? new Date(achievement.updatedAt) : undefined,
    progress: userProfile?.achievements?.includes(achievement.id) ? achievement.criteria.workoutCount || 1 : 0,
    target: achievement.criteria.workoutCount || 1,
    rarity: 'common' as const, // Default rarity, can be enhanced based on points
    icon: getAchievementIcon(achievement.category)
  }));

  // Load weight history from API workout data
  useEffect(() => {
    if (workoutHistory.length > 0) {
      const weightData: { date: Date; weight: number }[] = [];
      
      workoutHistory.forEach(workout => {
        if (workout.weightRecorded) {
          weightData.push({
            date: new Date(workout.date),
            weight: workout.weightRecorded
          });
        }
      });
      
      setWeightHistory(weightData.sort((a, b) => a.date.getTime() - b.date.getTime()));
    }
  }, [workoutHistory]);

  // Profile update handlers using API
  const handleUpdateProfile = async (updates: Partial<UserFitnessProfile>) => {
    try {
      // Transform to API format - only include updateable fields
      const apiUpdates: any = {};
      if (updates.gender) apiUpdates.gender = updates.gender;
      if (updates.age) apiUpdates.age = updates.age;
      if (updates.height) apiUpdates.height = updates.height;
      if (updates.weight) apiUpdates.weight = updates.weight;
      if (updates.activityLevel) apiUpdates.activityLevel = updates.activityLevel;
      if (updates.fitnessGoal) apiUpdates.fitnessGoal = updates.fitnessGoal;
      if (updates.targetWeight) apiUpdates.targetWeight = updates.targetWeight;
      if (updates.workoutLocation) apiUpdates.workoutLocation = updates.workoutLocation;
      
      await fitnessProfileApiService.updateProfile(apiUpdates);
      refetchProfile(); // Refresh profile data from API
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleUpdateMetrics = async (updates: { height?: number; weight?: number; targetWeight?: number }) => {
    await handleUpdateProfile(updates);
    
    // Add to weight history if weight changed
    if (updates.weight) {
      setWeightHistory(prev => [...prev, { date: new Date(), weight: updates.weight! }]);
    }
  };

  const handleQuickWeightUpdate = (weight: number) => {
    handleUpdateMetrics({ weight });
  };

  const handlePhotoUpload = (file: File) => {
    // In a real app, upload to server and get URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      handleUpdateProfile({ profileImage: imageUrl });
    };
    reader.readAsDataURL(file);
  };

  // Plan handlers
  const handleViewPlan = (planId?: string) => {
    if (planId) {
      console.log('View plan:', planId);
      const params = new URLSearchParams({
        id: planId,
        mode: 'view'
      });
      navigate(`/fitness/custom-plan?${params.toString()}`);
    }
  };

  const handleStartWorkout = (planId?: string) => {
    if (planId) {
      console.log('Start workout for plan:', planId);
      // Store the plan ID for the workout session
      localStorage.setItem('currentWorkoutPlanId', planId);
      navigate('/fitness/workout-session');
    }
  };

  const handleEditPlan = (planId: string) => {
    console.log('Edit plan:', planId);
    const params = new URLSearchParams({
      id: planId,
      mode: 'edit'
    });
    navigate(`/fitness/custom-plan?${params.toString()}`);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteWorkoutPlan(planId);
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const handleToggleFavorite = async (planId: string) => {
    try {
      const result = await fitnessService.toggleFavorite(planId);
      toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
      refetchWorkoutPlans();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  const handleCreatePlan = () => {
    console.log('Create new plan');
    navigate('/fitness/custom-plan');
  };

  // Workout handlers
  const handleAddWorkout = (date: Date) => {
    console.log('Add workout for date:', date);
    // Store the selected date and navigate to workout session
    localStorage.setItem('selectedWorkoutDate', date.toISOString());
    navigate('/fitness/workout-session');
  };

  // Achievement handlers
  const handleShareAchievement = (achievementId: string) => {
    console.log('Share achievement:', achievementId);
    // Share achievement on social media
  };

  const handleDownloadCertificate = (achievementId: string) => {
    console.log('Download certificate:', achievementId);
    // Download achievement certificate
  };

  // Calculate total achievement points from user profile or from achievements
  const totalAchievementPoints = userProfile?.points || achievements
    .filter(a => a.unlockedAt)
    .reduce((sum, a) => sum + a.points, 0);

  // Calculate next milestone based on current points
  const getNextMilestone = () => {
    if (!milestones || milestones.length === 0) {
      // Fallback if milestones API fails
      return {
        points: 1000,
        title: 'Fitness Champion'
      };
    }

    // Sort milestones by target points
    const sortedMilestones = [...milestones].sort((a, b) => a.targetPoints - b.targetPoints);
    
    // Find the next milestone that hasn't been reached
    const nextMilestone = sortedMilestones.find(milestone => milestone.targetPoints > totalAchievementPoints);
    
    if (nextMilestone) {
      return {
        points: nextMilestone.targetPoints,
        title: nextMilestone.name
      };
    } else {
      // User has completed all milestones
      const highestMilestone = sortedMilestones[sortedMilestones.length - 1];
      return {
        points: highestMilestone.targetPoints,
        title: `${highestMilestone.name} - Completed!`
      };
    }
  };

  const nextMilestone = getNextMilestone();

  // Get current active plan
  const currentActivePlan = workoutPlans.find(plan => plan.isActive && !plan.isCompleted);
  const currentPlanData = currentActivePlan ? {
    name: currentActivePlan.name,
    duration: currentActivePlan.duration,
    daysCompleted: currentActivePlan.daysCompleted,
    totalDays: currentActivePlan.totalDays,
    difficulty: currentActivePlan.difficulty,
    nextWorkoutDate: currentActivePlan.nextWorkoutDate
  } : undefined;

  const profileHeaderUser = userProfile ? {
    name: userProfile.name || '',
    profileImage: userProfile.profileImage,
    fitnessLevel: 'Intermediate' as const,
    joinDate: userProfile.createdAt,
    totalDaysActive: Math.floor((Date.now() - userProfile.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    currentGoal: 'Lose 2kg and build muscle',
    goalProgress: 65
  } : null;

  if (profileLoading || achievementsLoading || milestonesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
          <p className="text-white/60">
            {profileLoading ? 'Loading fitness profile...' :
             achievementsLoading ? 'Loading achievements...' :
             milestonesLoading ? 'Loading milestones...' :
             'Loading profile...'}
          </p>
        </div>
      </div>
    );
  }

  // Handle missing profile by showing onboarding prompt
  if (!userProfile && !profileLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-12 text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Create Your Fitness Profile</h2>
          <p className="text-white/60 mb-6">
            To access your achievements and track your progress, please complete your fitness profile setup.
          </p>
          <button
            onClick={() => navigate('/fitness/onboarding')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-2 rounded-md"
          >
            Complete Profile Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex items-center justify-between py-2">
          <h1 className="text-2xl font-bold text-white">Fitness Profile</h1>
        </div>

        {/* Compact Profile Header */}
        <ProfileHeader />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white/10 backdrop-blur-xl border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60 text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60 text-xs sm:text-sm">
              Plans
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60 text-xs sm:text-sm">
              History
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white text-white/60 text-xs sm:text-sm">
              Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {userProfile && (
              <FitnessMetrics
                profile={userProfile}
                currentBMI={currentBMI || undefined}
                weightHistory={weightHistory}
                currentPlan={currentPlanData}
                onUpdateMetrics={handleUpdateMetrics}
                onQuickWeightUpdate={handleQuickWeightUpdate}
                onViewPlan={() => handleViewPlan(currentActivePlan?.id)}
                onStartWorkout={() => handleStartWorkout(currentActivePlan?.id)}
                loading={profileLoading}
                error={profileError}
              />
              )}
              
              <WorkoutHistory
                workouts={workoutHistory}
                currentStreak={workoutStats?.currentStreak || 0}
                longestStreak={workoutStats?.longestStreak || 0}
                totalWorkouts={workoutStats?.totalWorkouts || workoutHistory.length}
                onViewWorkout={(id) => {
                  console.log('View workout:', id);
                  navigate('/fitness/progress');
                }}
                onAddWorkout={handleAddWorkout}
                weightHistory={weightHistory}
                loading={workoutHistoryLoading}
                error={workoutHistoryError}
              />
            </div>
          </TabsContent>

          {/* Workout Plans Tab */}
          <TabsContent value="plans">
            <WorkoutPlansGrid
              plans={workoutPlans as any}
              onViewPlan={handleViewPlan}
              onStartWorkout={handleStartWorkout}
              onEditPlan={handleEditPlan}
              onDeletePlan={handleDeletePlan}
              onToggleFavorite={handleToggleFavorite}
              onCreatePlan={handleCreatePlan}
              loading={workoutPlansLoading}
              error={workoutPlansError}
            />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <WorkoutHistory
              workouts={workoutHistory}
              currentStreak={workoutStats?.currentStreak || 0}
              longestStreak={workoutStats?.longestStreak || 0}
              totalWorkouts={workoutStats?.totalWorkouts || workoutHistory.length}
              onViewWorkout={(id) => {
                console.log('View workout:', id);
                navigate('/fitness/progress');
              }}
              onAddWorkout={handleAddWorkout}
              weightHistory={weightHistory}
              loading={workoutHistoryLoading}
              error={workoutHistoryError}
            />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementsBadges
              achievements={achievements}
              totalPoints={totalAchievementPoints}
              nextMilestone={nextMilestone}
              onShareAchievement={handleShareAchievement}
              onDownloadCertificate={handleDownloadCertificate}
            />
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default FitnessProfile;