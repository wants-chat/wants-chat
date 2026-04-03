import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import OnboardingForm, { OnboardingData } from '../../components/fitness/forms/OnboardingForm';
import { UserFitnessProfile } from '../../types/fitness';
import { useCreateFitnessProfileFromOnboarding } from '../../hooks/fitness/useFitnessProfile';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';

const FitnessOnboarding: React.FC = () => {
  const navigate = useNavigate();

  // Store the onboarding data for error handling
  let currentOnboardingData: OnboardingData | null = null;

  // API Integration
  const createFitnessProfileMutation = useCreateFitnessProfileFromOnboarding({
    onSuccess: (profile) => {
      // Save profile to localStorage for offline access
      localStorage.setItem('fitnessProfile', JSON.stringify(profile));
      navigate('/fitness/dashboard');
    },
    onError: (error) => {
      console.error('Failed to create fitness profile:', error);
      // Fallback to local storage save on API failure
      if (currentOnboardingData) {
        handleOnboardingFallback(currentOnboardingData);
      }
    }
  });

  const handleOnboardingFallback = (data: OnboardingData) => {
    // Fallback: Create profile locally if API fails
    const profile: UserFitnessProfile = {
      id: Date.now().toString(),
      userId: 'user-1', // This would come from auth context
      ...data,
      workoutLocation: (localStorage.getItem('workoutLocation') as 'gym' | 'home') || 'gym',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to localStorage as fallback
    localStorage.setItem('fitnessProfile', JSON.stringify(profile));

    // Navigate to dashboard
    navigate('/fitness/dashboard');
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    // Store data for potential error handling
    currentOnboardingData = data;

    const workoutLocation = (localStorage.getItem('workoutLocation') as 'gym' | 'home' | 'both') || 'gym';

    // Try API first, fallback to localStorage on failure
    createFitnessProfileMutation.mutate(data, workoutLocation);
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Fitness Tracker', href: '/fitness' },
    { label: 'Setup Profile', icon: Dumbbell }
  ];

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects variant="subtle" />
      <Header />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="relative z-10 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Let's personalize your fitness journey
          </h1>
          <p className="text-white/60">
            This information helps us create the perfect workout plan for you
          </p>
        </div>

        <OnboardingForm
          onComplete={handleOnboardingComplete}
          isLoading={createFitnessProfileMutation.isPending}
        />
      </div>
    </div>
    </div>
  );
};

export default FitnessOnboarding;