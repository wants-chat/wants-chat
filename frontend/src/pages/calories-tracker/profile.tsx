// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCalories } from '../../contexts/CaloriesContext';
import caloriesApi from '../../services/caloriesApi';
import { toast } from 'sonner';
import ProfileHeader from '../../components/calories-tracker/profile/ProfileHeader';
import GoalProgress from '../../components/calories-tracker/profile/GoalProgress';
import PersonalInfo from '../../components/calories-tracker/profile/PersonalInfo';
import GoalsSettings from '../../components/calories-tracker/profile/GoalsSettings';
import { ProfilePageSkeleton } from '../../components/calories-tracker/skeletons';

interface ProfileData {
  name: string;
  email: string;
  photo?: string;
  age: number;
  height: number;
  gender: string;
  currentWeight: number;
  targetWeight: number;
  activityLevel: string;
  dietPlan: string;
  joinDate: Date;
}



const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { profile: apiProfile, dashboardData, isLoading, profileCheckComplete, refreshProfile } = useCalories();
  // Using Sonner toast directly
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData | null>(null);

  useEffect(() => {
    // Don't check profile while loading or if profile check is not complete
    if (!profileCheckComplete) return;

    if (isAuthenticated && apiProfile) {
      // Use API data for authenticated users
      const { profile: p } = apiProfile;
      const profile: ProfileData = {
        name: dashboardData?.user.name || user?.name || 'Health Warrior',
        email: user?.email || '',
        photo: p.profileImage || undefined,
        age: p.age || 25,
        height: p.heightCm || 170,
        gender: p.gender || 'other',
        currentWeight: p.currentWeightKg || 70,
        targetWeight: p.targetWeightKg || 65,
        activityLevel: p.activityLevel || 'moderately_active',
        dietPlan: apiProfile?.goals?.goalType ?
          apiProfile.goals.goalType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) :
          'Balanced Diet',
        joinDate: user?.createdAt ? new Date(user.createdAt) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      };
      setProfileData(profile);
      setEditForm(profile);
    } else if (!isAuthenticated) {
      // Load from localStorage for non-authenticated users
      loadProfileData();
    } else if (isAuthenticated && profileCheckComplete && !apiProfile) {
      // Only redirect if user is coming from landing page, not when refreshing other pages
      const currentPath = window.location.pathname;
      const isOnLandingPage = currentPath === '/calories-tracker';
      
      // Check if user has completed onboarding before redirecting
      const hasOnboardingData = localStorage.getItem('caloriesTrackerOnboarding');
      const onboardingCompleted = localStorage.getItem('onboardingCompleted');
      
      if ((!hasOnboardingData || onboardingCompleted !== 'true') && isOnLandingPage) {
        // If authenticated but no profile and no onboarding data, redirect to onboarding
        navigate('/calories-tracker/onboarding');
      }
      // If they have onboarding data or accessing directly, let them continue with localStorage data
      else if (hasOnboardingData) {
        loadProfileData();
      }
    }
    
  }, [navigate, isAuthenticated, profileCheckComplete, apiProfile, dashboardData, user]);

  const loadProfileData = () => {
    const onboardingData = localStorage.getItem('caloriesTrackerOnboarding');
    if (onboardingData) {
      const data = JSON.parse(onboardingData);
      const profile: ProfileData = {
        name: data.name || 'Health Warrior',
        email: data.email || '',
        photo: data.profileImage || undefined,
        age: data.age || 25,
        height: data.height || 170,
        gender: data.gender || 'female',
        currentWeight: data.currentWeight || 70,
        targetWeight: data.targetWeight || 65,
        activityLevel: data.activityLevel || 'moderately_active',
        dietPlan: data.selectedPlan?.name || 'Balanced Diet',
        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      };
      setProfileData(profile);
      setEditForm(profile);
    } else {
      // Only redirect if user is coming from landing page, not when accessing profile directly
      const currentPath = window.location.pathname;
      const isOnLandingPage = currentPath === '/calories-tracker';
      
      if (isOnLandingPage) {
        // Redirect to onboarding if no data found and coming from landing
        navigate('/calories-tracker/onboarding');
      } else {
        // Create default profile data for direct access
        const defaultProfile: ProfileData = {
          name: 'Health Warrior',
          email: '',
          age: 25,
          height: 170,
          gender: 'other',
          currentWeight: 70,
          targetWeight: 65,
          activityLevel: 'moderately_active',
          dietPlan: 'Balanced Diet',
          joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        };
        setProfileData(defaultProfile);
        setEditForm(defaultProfile);
      }
    }
  };


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (updatedProfile: ProfileData) => {
    try {
      // Save to backend if authenticated
      if (isAuthenticated) {
        await caloriesApi.updateUserProfile({
          age: updatedProfile.age,
          height_cm: updatedProfile.height,
          current_weight_kg: updatedProfile.currentWeight,
          target_weight_kg: updatedProfile.targetWeight,
          activity_level: updatedProfile.activityLevel
        });
        
        // Refresh the profile data from backend
        await refreshProfile();
        
        toast.success("Your profile has been successfully updated.");
      } else {
        // Update localStorage for non-authenticated users
        const onboardingData = localStorage.getItem('caloriesTrackerOnboarding');
        if (onboardingData) {
          const data = JSON.parse(onboardingData);
          // Note: name is not updated here as it's managed separately
          data.age = updatedProfile.age;
          data.height = updatedProfile.height;
          data.gender = updatedProfile.gender;
          data.currentWeight = updatedProfile.currentWeight;
          data.targetWeight = updatedProfile.targetWeight;
          data.activityLevel = updatedProfile.activityLevel;
          localStorage.setItem('caloriesTrackerOnboarding', JSON.stringify(data));
        }
      }
      
      setProfileData(updatedProfile);
      setEditForm(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditForm(profileData);
    setIsEditing(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoUrl = e.target?.result as string;
        if (profileData) {
          const updatedProfile = { ...profileData, photo: photoUrl };
          setProfileData(updatedProfile);
          setEditForm(updatedProfile);

          // Save to backend if authenticated
          if (isAuthenticated) {
            try {
              console.log('[ProfilePage] Uploading profile image, length:', photoUrl.length);
              const result = await caloriesApi.updateUserProfile({
                profile_image: photoUrl
              });
              console.log('[ProfilePage] Upload result:', result);
              await refreshProfile();
              toast.success('Profile photo updated successfully');
            } catch (error) {
              console.error('[ProfilePage] Failed to upload profile photo:', error);
              toast.error('Failed to upload profile photo');
            }
          } else {
            // Save to localStorage for non-authenticated users
            const onboardingData = localStorage.getItem('caloriesTrackerOnboarding');
            if (onboardingData) {
              const data = JSON.parse(onboardingData);
              data.profileImage = photoUrl;
              localStorage.setItem('caloriesTrackerOnboarding', JSON.stringify(data));
            }
            toast.success('Profile photo updated');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileChange = (field: string, value: string | number) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };



  // Show loading state while checking profile
  if (!profileCheckComplete || (isLoading && !profileData)) {
    return <ProfilePageSkeleton />;
  }

  if (!profileData || !editForm) {
    return null;
  }

  return (
    <div className="space-y-6 scroll-smooth">
      {/* Profile Header */}
      <ProfileHeader
        name={profileData.name}
        email={profileData.email}
        photo={profileData.photo}
        joinDate={profileData.joinDate}
        dietPlan={profileData.dietPlan}
        isEditing={isEditing}
        onEdit={handleEdit}
        onPhotoUpload={handlePhotoUpload}
      />

      {/* Profile Content */}
      <div className="space-y-6">
        {/* Goal Progress */}
        <GoalProgress
          currentWeight={profileData.currentWeight}
          startWeight={dashboardData?.weight?.start || profileData.currentWeight}
          goalWeight={profileData.targetWeight}
        />

        {/* Personal Information */}
        <PersonalInfo
          isEditing={isEditing}
          profile={editForm}
          onSave={handleSave}
          onCancel={handleCancel}
          onChange={handleProfileChange}
        />

        {/* Goals Settings */}
        <GoalsSettings
          currentGoals={{
            dailyCalories: Math.max(1200, apiProfile?.goals?.daily_calories || 2000),
            proteinPercentage: apiProfile?.goals?.protein_percentage || 25,
            carbsPercentage: apiProfile?.goals?.carbs_percentage || 45,
            fatPercentage: apiProfile?.goals?.fat_percentage || 30
          }}
          onGoalsUpdated={refreshProfile}
          isAuthenticated={isAuthenticated}
        />
      </div>

    </div>
  );
};

export default ProfilePage;