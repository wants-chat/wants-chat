// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateLessonFromOnboarding } from '../../hooks/language-learner/useLessons';
import { useLanguages } from '../../hooks/useLanguage';
import Header from '../../components/landing/Header';
import { Breadcrumb } from '../../components/ui/breadcrumb';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { GlassCard } from '../../components/ui/GlassCard';
import { BackgroundEffects } from '../../components/ui/BackgroundEffects';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle,
  Clock,
  Target,
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  Brain,
  Plane,
  Star,
  Volume2,
  Eye,
  MousePointer,
  BookText,
  PenTool,
  Languages,
  Loader2
} from 'lucide-react';

interface OnboardingData {
  targetLanguage: string;
  nativeLanguage: string;
  purpose: string;
  dailyGoal: number;
  proficiencyLevel: string;
  learningStyles: string[];
  notifications: boolean;
  reminderTime: string;
}

// Language type from API
interface LanguageFromApi {
  code: string;
  name: string;
  native_name: string;
  flag: string;
  difficulty: string;
  popular: boolean;
}

const LanguageLearnerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    targetLanguage: '',
    nativeLanguage: 'en',
    purpose: '',
    dailyGoal: 15,
    proficiencyLevel: '',
    learningStyles: [],
    notifications: true,
    reminderTime: '19:00'
  });

  // Fetch available languages from API
  const { data: languagesFromApi, loading: languagesLoading, error: languagesError } = useLanguages();

  // Transform API data to component format
  const languages = (languagesFromApi || []).map((lang: LanguageFromApi) => ({
    code: lang.code,
    name: lang.name,
    nativeName: lang.native_name,
    flag: lang.flag,
    difficulty: lang.difficulty,
    popular: lang.popular
  }));

  // Native languages are the same as available languages (for simplicity)
  const nativeLanguages = languages.map((lang: { code: string; name: string; flag: string }) => ({
    code: lang.code,
    name: lang.name,
    flag: lang.flag
  }));

  // API integration for lesson creation
  const createLessonMutation = useCreateLessonFromOnboarding({
    onSuccess: (lesson) => {
      console.log('Initial lesson created successfully:', lesson);
      // Continue with navigation
      navigate('/language-learner/dashboard');
    },
    onError: (error) => {
      console.error('Failed to create initial lesson:', error);
      // Continue to dashboard anyway - lesson creation is not critical for onboarding
      navigate('/language-learner/dashboard');
    }
  });

  const totalSteps = 7;

  const purposes = [
    {
      id: 'travel',
      title: 'Travel & Tourism',
      description: 'Explore the world with confidence',
      icon: Plane,
      color: 'bg-teal-500/20 text-teal-400'
    },
    {
      id: 'business',
      title: 'Business & Career',
      description: 'Advance your professional goals',
      icon: Briefcase,
      color: 'bg-emerald-500/20 text-emerald-400'
    },
    {
      id: 'education',
      title: 'Education & School',
      description: 'Academic success and studies',
      icon: GraduationCap,
      color: 'bg-cyan-500/20 text-cyan-400'
    },
    {
      id: 'family',
      title: 'Family & Heritage',
      description: 'Connect with your roots',
      icon: Heart,
      color: 'bg-pink-500/20 text-pink-400'
    },
    {
      id: 'hobby',
      title: 'Personal Interest',
      description: 'Learn for the joy of it',
      icon: Star,
      color: 'bg-amber-500/20 text-amber-400'
    },
    {
      id: 'brain-training',
      title: 'Brain Training',
      description: 'Keep your mind sharp',
      icon: Brain,
      color: 'bg-purple-500/20 text-purple-400'
    }
  ];

  const dailyGoals = [
    { minutes: 5, label: 'Casual', description: 'Just getting started' },
    { minutes: 10, label: 'Regular', description: 'Build a habit' },
    { minutes: 15, label: 'Serious', description: 'Make real progress', recommended: true },
    { minutes: 20, label: 'Intense', description: 'Accelerated learning' }
  ];

  const proficiencyLevels = [
    {
      id: 'beginner',
      title: 'Complete Beginner',
      description: "I'm new to this language",
      details: 'Start from the basics',
      color: 'bg-emerald-500/20 text-emerald-400'
    },
    {
      id: 'some-phrases',
      title: 'Know Some Phrases',
      description: 'I know a few words and phrases',
      details: 'Skip the very basics',
      color: 'bg-teal-500/20 text-teal-400'
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'I can have simple conversations',
      details: 'Focus on expanding vocabulary',
      color: 'bg-cyan-500/20 text-cyan-400'
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'I can discuss complex topics',
      details: 'Refine and perfect skills',
      color: 'bg-blue-500/20 text-blue-400'
    }
  ];

  const learningStyles = [
    {
      id: 'visual',
      title: 'Visual',
      description: 'Learn with images and colors',
      icon: Eye,
      color: 'bg-teal-500/20 text-teal-400'
    },
    {
      id: 'audio',
      title: 'Audio',
      description: 'Learn by listening and speaking',
      icon: Volume2,
      color: 'bg-cyan-500/20 text-cyan-400'
    },
    {
      id: 'interactive',
      title: 'Interactive',
      description: 'Learn through games and activities',
      icon: MousePointer,
      color: 'bg-emerald-500/20 text-emerald-400'
    },
    {
      id: 'reading',
      title: 'Reading',
      description: 'Learn through stories and text',
      icon: BookText,
      color: 'bg-purple-500/20 text-purple-400'
    },
    {
      id: 'writing',
      title: 'Writing',
      description: 'Learn by writing and exercises',
      icon: PenTool,
      color: 'bg-amber-500/20 text-amber-400'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'Medium': return 'text-teal-400 bg-teal-500/20 border-teal-500/30';
      case 'Hard': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'Very Hard': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-white/60 bg-white/10 border-white/20';
    }
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  };

  const toggleLearningStyle = (styleId: string) => {
    const styles = onboardingData.learningStyles.includes(styleId)
      ? onboardingData.learningStyles.filter(s => s !== styleId)
      : [...onboardingData.learningStyles, styleId];
    updateData({ learningStyles: styles });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return onboardingData.targetLanguage !== '';
      case 1: return onboardingData.nativeLanguage !== '';
      case 2: return onboardingData.purpose !== '';
      case 3: return onboardingData.dailyGoal > 0;
      case 4: return onboardingData.proficiencyLevel !== '';
      case 5: return onboardingData.learningStyles.length > 0;
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Save onboarding data to localStorage
      localStorage.setItem('languageLearnerOnboarding', JSON.stringify(onboardingData));
      localStorage.setItem('languageLearnerUser', JSON.stringify({
        ...onboardingData,
        streak: 0,
        xp: 0,
        hearts: 5,
        maxHearts: 5,
        level: 1,
        completedAt: new Date().toISOString()
      }));

      // Create initial lesson based on onboarding preferences
      await createLessonMutation.mutate(onboardingData);
      
    } catch (error) {
      console.error('Error during onboarding completion:', error);
      // Navigate to dashboard anyway - don't block user
      navigate('/language-learner/dashboard');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        // Show loading skeleton while fetching languages
        if (languagesLoading) {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Which language do you want to learn?
                </h2>
                <p className="text-white/60">
                  Loading available languages...
                </p>
              </div>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-16 w-full bg-white/10" />
                ))}
              </div>
            </div>
          );
        }

        // Show error state if languages failed to load
        if (languagesError) {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Which language do you want to learn?
                </h2>
                <p className="text-red-400">
                  Failed to load languages. Please try again.
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Which language do you want to learn?
              </h2>
              <p className="text-white/60">
                Choose the language you'd like to master
              </p>
            </div>

            {/* Popular Languages */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Most Popular
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {languages.filter((lang: { popular: boolean }) => lang.popular).map((language: { code: string; name: string; nativeName: string; flag: string; difficulty: string }) => (
                  <button
                    key={language.code}
                    className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                      onboardingData.targetLanguage === language.code
                        ? 'bg-gradient-to-br from-teal-500/30 to-cyan-500/30 border-teal-400 shadow-lg shadow-teal-500/20'
                        : 'bg-white/10 backdrop-blur-xl border-white/20 hover:border-teal-400/50 hover:bg-white/15'
                    }`}
                    onClick={() => updateData({ targetLanguage: language.code })}
                  >
                    {onboardingData.targetLanguage === language.code && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="h-5 w-5 text-teal-400" />
                      </div>
                    )}
                    <div className="flex flex-col items-center text-center space-y-3">
                      <span className="text-4xl">{language.flag}</span>
                      <div>
                        <div className="font-bold text-lg text-white">{language.name}</div>
                        <div className="text-sm text-white/60">{language.nativeName}</div>
                      </div>
                      <Badge className={`text-xs border ${getDifficultyColor(language.difficulty)}`}>
                        {language.difficulty}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* All Languages */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                All Languages
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {languages.filter((lang: { popular: boolean }) => !lang.popular).map((language: { code: string; name: string; nativeName: string; flag: string; difficulty: string }) => (
                  <button
                    key={language.code}
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                      onboardingData.targetLanguage === language.code
                        ? 'bg-gradient-to-br from-teal-500/30 to-cyan-500/30 border-teal-400 shadow-lg shadow-teal-500/20'
                        : 'bg-white/10 backdrop-blur-xl border-white/20 hover:border-teal-400/50 hover:bg-white/15'
                    }`}
                    onClick={() => updateData({ targetLanguage: language.code })}
                  >
                    {onboardingData.targetLanguage === language.code && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="h-5 w-5 text-teal-400" />
                      </div>
                    )}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <span className="text-3xl">{language.flag}</span>
                      <div>
                        <div className="font-semibold text-white">{language.name}</div>
                        <div className="text-xs text-white/60">{language.nativeName}</div>
                      </div>
                      <Badge className={`text-xs border ${getDifficultyColor(language.difficulty)}`}>
                        {language.difficulty}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        // Show loading skeleton while fetching languages
        if (languagesLoading) {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  What's your native language?
                </h2>
                <p className="text-white/60">
                  Loading languages...
                </p>
              </div>
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                What's your native language?
              </h2>
              <p className="text-white/60">
                We'll use this to create better translations and explanations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nativeLanguages.map((language: { code: string; name: string; flag: string }) => (
                <button
                  key={language.code}
                  className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                    onboardingData.nativeLanguage === language.code
                      ? 'bg-gradient-to-br from-teal-500/30 to-cyan-500/30 border-teal-400 shadow-lg shadow-teal-500/20'
                      : 'bg-white/10 backdrop-blur-xl border-white/20 hover:border-teal-400/50 hover:bg-white/15'
                  }`}
                  onClick={() => updateData({ nativeLanguage: language.code })}
                >
                  {onboardingData.nativeLanguage === language.code && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle className="h-5 w-5 text-teal-400" />
                    </div>
                  )}
                  <div className="flex flex-col items-center text-center space-y-3">
                    <span className="text-4xl">{language.flag}</span>
                    <div className="font-bold text-lg text-white">{language.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                What's your main goal?
              </h2>
              <p className="text-white/60">
                Help us personalize your learning experience
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purposes.map((purpose) => {
                const Icon = purpose.icon;
                return (
                  <button
                    key={purpose.id}
                    className={`h-auto p-6 flex items-center justify-start rounded-xl border transition-all duration-200 ${
                      onboardingData.purpose === purpose.id
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-teal-400 text-white'
                        : 'bg-white/10 backdrop-blur-xl border-white/20 text-white hover:border-teal-400/50 hover:bg-white/15'
                    }`}
                    onClick={() => updateData({ purpose: purpose.id })}
                  >
                    <div className={`w-12 h-12 rounded-lg ${purpose.color} flex items-center justify-center mr-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold mb-1">{purpose.title}</div>
                      <div className="text-sm text-white/70">{purpose.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                How much time can you dedicate daily?
              </h2>
              <p className="text-white/60">
                Consistency is key! Even 5 minutes a day makes a difference
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyGoals.map((goal) => (
                <button
                  key={goal.minutes}
                  className={`h-auto p-6 flex items-center justify-start rounded-xl border transition-all duration-200 relative ${
                    onboardingData.dailyGoal === goal.minutes
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-teal-400 text-white'
                      : 'bg-white/10 backdrop-blur-xl border-white/20 text-white hover:border-teal-400/50 hover:bg-white/15'
                  } ${goal.recommended ? 'ring-2 ring-teal-500 ring-opacity-50' : ''}`}
                  onClick={() => updateData({ dailyGoal: goal.minutes })}
                >
                  {goal.recommended && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
                      Recommended
                    </Badge>
                  )}
                  <div className="w-12 h-12 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mr-4">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold mb-1">{goal.minutes} minutes - {goal.label}</div>
                    <div className="text-sm text-white/70">{goal.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                What's your current level?
              </h2>
              <p className="text-white/60">
                Don't worry, we'll adjust as you progress
              </p>
            </div>
            
            <div className="space-y-4">
              {proficiencyLevels.map((level) => (
                <button
                  key={level.id}
                  className={`h-auto p-6 flex items-center justify-start rounded-xl border transition-all duration-200 w-full ${
                    onboardingData.proficiencyLevel === level.id
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-teal-400 text-white'
                      : 'bg-white/10 backdrop-blur-xl border-white/20 text-white hover:border-teal-400/50 hover:bg-white/15'
                  }`}
                  onClick={() => updateData({ proficiencyLevel: level.id })}
                >
                  <div className="text-left flex-1">
                    <div className="font-semibold mb-1">{level.title}</div>
                    <div className="text-sm text-white/70 mb-2">{level.description}</div>
                    <Badge className={`text-xs ${level.color}`}>
                      {level.details}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 w-fit mx-auto mb-6">
                <Brain className="h-8 w-8 text-teal-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                How do you learn best?
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Select all learning styles that work for you. We'll create a personalized experience that matches your preferences.
              </p>
              {onboardingData.learningStyles.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 inline-block">
                  <p className="text-emerald-400 text-sm font-medium">
                    ✓ {onboardingData.learningStyles.length} style{onboardingData.learningStyles.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningStyles.map((style) => {
                const Icon = style.icon;
                const isSelected = onboardingData.learningStyles.includes(style.id);

                return (
                  <div
                    key={style.id}
                    className={`cursor-pointer transition-all duration-300 hover:-translate-y-1 rounded-2xl border-2 p-6 ${
                      isSelected
                        ? 'border-teal-500 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 shadow-lg shadow-teal-500/10'
                        : 'border-white/20 hover:border-teal-500/50 bg-white/5 backdrop-blur-xl'
                    }`}
                    onClick={() => toggleLearningStyle(style.id)}
                  >
                    <div className="text-center space-y-4">
                      <div className={`w-16 h-16 rounded-2xl ${style.color} flex items-center justify-center mx-auto`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white mb-2">
                          {style.title}
                        </h3>
                        <p className="text-sm text-white/60 leading-relaxed">
                          {style.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="pt-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mx-auto">
                            <CheckCircle className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 w-fit mx-auto mb-6">
                <Target className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Set up notifications
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Stay motivated and build consistency with personalized reminders
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 rounded-xl bg-teal-500/20 border border-teal-500/30">
                        <Clock className="h-5 w-5 text-teal-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        Daily Reminders
                      </h3>
                    </div>
                    <p className="text-white/60 leading-relaxed">
                      Get gentle reminders to practice and maintain your learning streak
                    </p>
                  </div>
                  <Button
                    variant={onboardingData.notifications ? "default" : "outline"}
                    size="lg"
                    onClick={() => updateData({ notifications: !onboardingData.notifications })}
                    className={`ml-6 px-6 transition-all duration-300 ${
                      onboardingData.notifications
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg'
                        : 'bg-white/10 border-2 border-white/20 hover:border-teal-500 text-white'
                    }`}
                  >
                    {onboardingData.notifications ? '✓ Enabled' : 'Enable'}
                  </Button>
                </div>

                {onboardingData.notifications && (
                  <div className="mt-8 p-6 bg-teal-500/10 rounded-2xl border border-teal-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-lg font-semibold text-white mb-2">
                          Preferred Reminder Time
                        </label>
                        <p className="text-sm text-white/60">
                          Choose when you'd like to receive your daily practice reminder
                        </p>
                      </div>
                      <input
                        type="time"
                        value={onboardingData.reminderTime}
                        onChange={(e) => updateData({ reminderTime: e.target.value })}
                        className="w-40 h-12 px-4 py-3 text-lg font-medium border-2 border-white/20 rounded-xl bg-white/10 text-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-8">
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-4">🎉</div>
                  <h4 className="text-2xl font-bold text-white">
                    You're all set!
                  </h4>
                  <p className="text-white/70 leading-relaxed max-w-md mx-auto">
                    We've created a personalized learning experience based on your preferences.
                    Your journey to mastering {languages.find((l: { code: string; name: string }) => l.code === onboardingData.targetLanguage)?.name || 'your target language'} starts now!
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-white/10 rounded-xl">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-400">{onboardingData.dailyGoal}min</div>
                      <div className="text-xs text-white/60">Daily Goal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-400">{onboardingData.learningStyles.length}</div>
                      <div className="text-xs text-white/60">Learning Styles</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Language Learner', href: '/language-learner' },
    { label: 'Setup', icon: Languages }
  ];

  return (
    <>
      <Header />

      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <div className="min-h-screen relative">
        <BackgroundEffects variant="default" />

        {/* Custom Progress Header */}
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 relative z-10">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
                  <BookOpen className="h-6 w-6 text-teal-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Language Learning Setup
                  </h1>
                  <p className="text-white/60">
                    Step {currentStep + 1} of {totalSteps}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-400">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</div>
                <div className="text-xs text-white/60 font-medium">Complete</div>
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-6 py-8 relative z-10">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white/60">Progress</span>
              <span className="text-sm font-medium text-teal-400">{currentStep + 1} / {totalSteps}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <GlassCard className="mb-8" hover={false}>
            <div className="p-2 lg:p-6">
              {renderStep()}
            </div>
          </GlassCard>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="h-12 px-6 bg-white/10 border-2 border-white/20 hover:border-white/40 text-white font-medium transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-teal-400 w-8'
                      : index < currentStep
                      ? 'bg-emerald-400'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>

            {currentStep === totalSteps - 1 ? (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || createLessonMutation.loading}
                size="lg"
                className="h-12 px-8 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:transform-none"
              >
                {createLessonMutation.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Your First Lesson...
                  </>
                ) : (
                  <>
                    🚀 Start Learning
                    <CheckCircle className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                size="lg"
                className={`h-12 px-8 font-semibold transition-all duration-300 ${
                  canProceed()
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                Continue
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default LanguageLearnerOnboarding;