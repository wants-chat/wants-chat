import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import Header from '../../components/landing/Header';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import Icon from '@mdi/react';
import {
  mdiArrowLeft,
  mdiArrowRight,
  mdiCheckCircle
} from '@mdi/js';
import GoalSelector from '../../components/calories-tracker/onboarding/GoalSelector';
import MetricsInput from '../../components/calories-tracker/onboarding/MetricsInput';
import DietPlanSelector from '../../components/calories-tracker/onboarding/DietPlanSelector';
import ActivityLevelPicker from '../../components/calories-tracker/onboarding/ActivityLevelPicker';
import TimelineSelector from '../../components/calories-tracker/onboarding/TimelineSelector';
import caloriesApi from '../../services/caloriesApi';
import { useAuth } from '../../contexts/AuthContext';

export interface OnboardingData {
  goal: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'gain_muscle' | '';
  gender: 'male' | 'female' | 'other' | '';
  age: number | null;
  height: number | null; // in cm
  currentWeight: number | null; // in kg
  targetWeight: number | null; // in kg
  dietPlan: 'balanced' | 'low_carb' | 'high_protein' | 'mediterranean' | 'vegetarian' | 'vegan' | 'keto' | '';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active' | '';
  timeline: 0.5 | 1 | 1.5 | 2 | null; // kg per week
  bmr: number | null;
  tdee: number | null;
  dailyCalories: number | null;
}

const CaloriesTrackerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  // Using Sonner toast directly
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    goal: '',
    gender: '',
    age: null,
    height: null,
    currentWeight: null,
    targetWeight: null,
    dietPlan: '',
    activityLevel: '',
    timeline: null,
    bmr: null,
    tdee: null,
    dailyCalories: null
  });

  const steps = [
    {
      title: 'Welcome',
      subtitle: 'Let\'s get you started on your nutrition journey',
      component: 'welcome'
    },
    {
      title: 'Your Goal',
      subtitle: 'What would you like to achieve?',
      component: 'goal'
    },
    {
      title: 'Personal Info',
      subtitle: 'Tell us about yourself',
      component: 'metrics'
    },
    {
      title: 'Diet Plan',
      subtitle: 'Choose your nutritional approach',
      component: 'diet-plan'
    },
    {
      title: 'Activity Level',
      subtitle: 'How active are you?',
      component: 'activity'
    },
    {
      title: 'Timeline',
      subtitle: 'How fast do you want to reach your goal?',
      component: 'timeline'
    },
    {
      title: 'Complete',
      subtitle: 'Your personalized plan is ready!',
      component: 'complete'
    }
  ];

  // BMR calculation using Mifflin-St Jeor Equation
  const calculateBMR = (data: OnboardingData): number => {
    if (!data.gender || !data.age || !data.height || !data.currentWeight) return 0;
    
    const baseMetabolism = data.gender === 'male'
      ? (10 * data.currentWeight) + (6.25 * data.height) - (5 * data.age) + 5
      : (10 * data.currentWeight) + (6.25 * data.height) - (5 * data.age) - 161;
    
    // Ensure minimum BMR of 1000 calories
    return Math.max(Math.round(baseMetabolism), 1000);
  };

  // TDEE calculation
  const calculateTDEE = (bmr: number, activityLevel: string): number => {
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };
    
    const multiplier = activityMultipliers[activityLevel as keyof typeof activityMultipliers] || 1.2;
    return Math.round(bmr * multiplier);
  };

  // Daily calorie calculation based on goal and timeline
  const calculateDailyCalories = (tdee: number, goal: string, timeline: number): number => {
    let calorieAdjustment = 0;
    
    if (goal === 'lose_weight' && timeline) {
      // 1 kg = 7700 calories, so per week deficit = timeline * 7700
      // Daily deficit = (timeline * 7700) / 7
      calorieAdjustment = -Math.round((timeline * 7700) / 7);
    } else if (goal === 'gain_weight' && timeline) {
      calorieAdjustment = Math.round((timeline * 7700) / 7);
    } else if (goal === 'gain_muscle') {
      calorieAdjustment = 300; // Moderate surplus for muscle building
    }
    
    const calculatedCalories = Math.round(tdee + calorieAdjustment);
    
    // Ensure minimum safe calorie intake
    // Women: minimum 1200 calories, Men: minimum 1500 calories
    const minCalories = 1200; // Conservative minimum for safety
    
    return Math.max(calculatedCalories, minCalories);
  };

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 0:
        return true; // Welcome step
      case 1:
        return onboardingData.goal !== '';
      case 2:
        return !!(onboardingData.gender && onboardingData.age && 
                 onboardingData.height && onboardingData.currentWeight && 
                 onboardingData.targetWeight);
      case 3:
        return onboardingData.dietPlan !== '';
      case 4:
        return onboardingData.activityLevel !== '';
      case 5:
        return onboardingData.timeline !== null;
      case 6:
        return true; // Complete step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Calculate BMR, TDEE, and daily calories when moving from timeline step
      if (currentStep === 5) {
        const bmr = calculateBMR(onboardingData);
        const tdee = calculateTDEE(bmr, onboardingData.activityLevel);
        const dailyCalories = calculateDailyCalories(tdee, onboardingData.goal, onboardingData.timeline!);
        
        updateOnboardingData({ bmr, tdee, dailyCalories });
      }
      
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // If user is authenticated, save to API, otherwise save to localStorage
    if (isAuthenticated) {
      setIsSubmitting(true);
      try {
        // Define macro percentages based on diet plan
        const dietPlanMacros = {
          balanced: { protein: 25, carbs: 45, fat: 30 },
          high_protein: { protein: 40, carbs: 30, fat: 30 },
          low_carb: { protein: 35, carbs: 20, fat: 45 },
          keto: { protein: 25, carbs: 5, fat: 70 },
          mediterranean: { protein: 25, carbs: 45, fat: 30 },
          vegetarian: { protein: 20, carbs: 50, fat: 30 },
          vegan: { protein: 20, carbs: 50, fat: 30 }
        };

        // Get macros based on selected diet plan, default to balanced if not found
        const selectedMacros = dietPlanMacros[onboardingData.dietPlan as keyof typeof dietPlanMacros] || dietPlanMacros.balanced;

        // Transform data to match API format
        const apiData = {
          goal: onboardingData.goal as 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'gain_muscle',
          gender: onboardingData.gender as 'male' | 'female' | 'other',
          age: onboardingData.age!,
          height_cm: onboardingData.height!,
          current_weight_kg: onboardingData.currentWeight!,
          target_weight_kg: onboardingData.targetWeight!,
          activity_level: onboardingData.activityLevel as 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active',
          weight_change_rate: onboardingData.timeline!,
          daily_calories: onboardingData.dailyCalories!,
          // Use macros based on selected diet plan
          protein_percentage: selectedMacros.protein,
          carbs_percentage: selectedMacros.carbs,
          fat_percentage: selectedMacros.fat
        };

        await caloriesApi.completeOnboarding(apiData);

        toast.success('Welcome! Your profile has been set up successfully.');
        navigate('/calories-tracker/dashboard');
      } catch (error) {
        console.error('Error saving onboarding data:', error);
        toast.error('Failed to save your profile. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem('caloriesTrackerOnboarding', JSON.stringify(onboardingData));
      navigate('/calories-tracker/dashboard');
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].component) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl">🎯</div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome to Calories Tracker!
              </h2>
              <p className="text-white/60 max-w-md mx-auto">
                We'll help you create a personalized nutrition plan to reach your health goals.
                This will only take a few minutes.
              </p>
            </div>
          </div>
        );
      
      case 'goal':
        return (
          <GoalSelector
            selectedGoal={onboardingData.goal}
            onGoalSelect={(goal) => updateOnboardingData({ goal })}
          />
        );
      
      case 'metrics':
        return (
          <MetricsInput
            data={onboardingData}
            onUpdate={updateOnboardingData}
          />
        );
      
      case 'diet-plan':
        return (
          <DietPlanSelector
            selectedPlan={onboardingData.dietPlan}
            onPlanSelect={(dietPlan) => updateOnboardingData({ dietPlan })}
            userGoal={onboardingData.goal}
            userBMI={onboardingData.currentWeight && onboardingData.height 
              ? onboardingData.currentWeight / Math.pow(onboardingData.height / 100, 2)
              : undefined
            }
            recommendedCalories={onboardingData.tdee || 2000}
            onCustomNutrition={(nutrition) => {
              // Store custom nutrition data (you can add this to OnboardingData interface later)
              console.log('Custom nutrition:', nutrition);
            }}
          />
        );
      
      case 'activity':
        return (
          <ActivityLevelPicker
            selectedLevel={onboardingData.activityLevel}
            onLevelSelect={(activityLevel) => updateOnboardingData({ activityLevel })}
          />
        );
      
      case 'timeline':
        return (
          <TimelineSelector
            selectedTimeline={onboardingData.timeline}
            onTimelineSelect={(timeline) => updateOnboardingData({ timeline })}
            goal={onboardingData.goal}
          />
        );
      
      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Icon path={mdiCheckCircle} size={4} className="text-emerald-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Your Plan is Ready!
              </h2>
              <p className="text-white/60 mb-6">
                Based on your information, here's your personalized nutrition plan:
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teal-400">{onboardingData.bmr}</p>
                  <p className="text-sm text-white/60">BMR (Calories)</p>
                  <p className="text-xs text-white/50 mt-1">Base Metabolic Rate</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400">{onboardingData.tdee}</p>
                  <p className="text-sm text-white/60">TDEE (Calories)</p>
                  <p className="text-xs text-white/50 mt-1">Maintenance Calories</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-400">{onboardingData.dailyCalories}</p>
                  <p className="text-sm text-white/60">Daily Target</p>
                  <p className="text-xs text-white/50 mt-1">Goal Calories</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 p-4 rounded-lg border border-white/20">
              <p className="text-sm text-white/80">
                <strong className="text-white">Next:</strong> Start tracking your meals and monitoring your progress
                with your personalized calorie target.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => currentStep > 0 ? handlePrevious() : navigate('/calories-tracker')}
              className="text-white hover:bg-white/10"
            >
              <Icon path={mdiArrowLeft} size={1} />
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-white/60">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>

            <div className="w-10 h-10" /> {/* Spacer */}
          </div>

          <div className="space-y-4">
            <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />

            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                {steps[currentStep].title}
              </h1>
              <p className="text-white/60">
                {steps[currentStep].subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <Icon path={mdiArrowLeft} size={0.8} className="mr-2" />
            Previous
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
            >
              {isSubmitting ? 'Saving...' : 'Get Started'}
              <Icon path={mdiCheckCircle} size={0.8} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNext()}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30"
            >
              Next
              <Icon path={mdiArrowRight} size={0.8} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaloriesTrackerOnboarding;