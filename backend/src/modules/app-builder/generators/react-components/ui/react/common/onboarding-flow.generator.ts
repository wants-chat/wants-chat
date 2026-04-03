import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateOnboardingFlow = (
  resolved: ResolvedComponent,
  variant: 'carousel' | 'steps' | 'video' = 'carousel'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Play, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    carousel: `
${commonImports}

interface Screen {
  title: string;
  description: string;
  emoji?: string;
  image?: string;
}

interface OnboardingProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  onScreenChange?: (index: number) => void;
}

const OnboardingFlow: React.FC<OnboardingProps> = ({
  ${dataName}: propData,
  className,
  onComplete,
  onSkip,
  onScreenChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onboardingData = ${dataName} || {};

  const screens = ${getField('screens')} as Screen[];
  const skipText = ${getField('skipText')};
  const nextText = ${getField('nextText')};
  const backText = ${getField('backText')};
  const getStartedText = ${getField('getStartedText')};

  const [currentScreen, setCurrentScreen] = useState(0);

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      const nextIndex = currentScreen + 1;
      setCurrentScreen(nextIndex);
      onScreenChange?.(nextIndex);
    } else {
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentScreen > 0) {
      const prevIndex = currentScreen - 1;
      setCurrentScreen(prevIndex);
      onScreenChange?.(prevIndex);
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  const handleDotClick = (index: number) => {
    setCurrentScreen(index);
    onScreenChange?.(index);
  };

  const isLastScreen = currentScreen === screens.length - 1;
  const screen = screens[currentScreen];

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-2xl">
        {/* Skip Button */}
        <div className="flex justify-end mb-4">
          {!isLastScreen && (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              {skipText}
            </button>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Image/Emoji Section */}
          <div className="relative h-80 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
            {screen.emoji && (
              <div className="text-9xl animate-bounce-slow">
                {screen.emoji}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {screen.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {screen.description}
            </p>

            {/* Progress Dots */}
            <div className="flex justify-center items-center gap-2 mb-8">
              {screens.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentScreen
                      ? "w-8 bg-blue-600 dark:bg-blue-500"
                      : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  )}
                  aria-label={\`Go to screen \${index + 1}\`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between gap-4">
              {currentScreen > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                  {backText}
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
              >
                {isLastScreen ? getStartedText : nextText}
                {!isLastScreen && <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Screen Counter */}
        <div className="text-center mt-4 text-gray-600 dark:text-gray-400">
          {currentScreen + 1} / {screens.length}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
    `,

    steps: `
${commonImports}

interface Step {
  number: number;
  title: string;
  description: string;
  completed: boolean;
}

interface OnboardingProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (index: number) => void;
}

const OnboardingFlow: React.FC<OnboardingProps> = ({
  ${dataName}: propData,
  className,
  onComplete,
  onSkip,
  onStepChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onboardingData = ${dataName} || {};

  const initialSteps = ${getField('steps')} as Step[];
  const skipText = ${getField('skipText')};
  const nextText = ${getField('nextText')};
  const backText = ${getField('backText')};
  const finishText = ${getField('finishText')};

  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(initialSteps);

  const handleNext = () => {
    // Mark current step as completed
    const updatedSteps = steps.map((step, index) =>
      index === currentStep ? { ...step, completed: true } : step
    );
    setSteps(updatedSteps);

    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      onStepChange?.(nextIndex);
    } else {
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevIndex = currentStep - 1;
      setCurrentStep(prevIndex);
      onStepChange?.(prevIndex);
    }
  };

  const handleSkip = () => {
    onSkip?.();
  };

  const isLastStep = currentStep === steps.length - 1;
  const step = steps[currentStep];

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-4xl">
        {/* Skip Button */}
        <div className="flex justify-end mb-6">
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              {skipText}
            </button>
          )}
        </div>

        {/* Steps Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                style={{ width: \`\${(currentStep / (steps.length - 1)) * 100}%\` }}
              />
            </div>

            {/* Step Indicators */}
            {steps.map((s, index) => (
              <div
                key={index}
                className="flex flex-col items-center"
              >
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300",
                    index < currentStep || s.completed
                      ? "bg-blue-600 dark:bg-blue-500 text-white"
                      : index === currentStep
                        ? "bg-blue-600 dark:bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-800"
                        : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-300 dark:border-gray-600"
                  )}
                >
                  {s.completed ? <Check className="w-8 h-8" /> : s.number}
                </div>
                <div className="mt-3 text-center max-w-[120px]">
                  <div className={cn(
                    "font-bold text-sm",
                    index <= currentStep
                      ? "text-gray-900 dark:text-gray-100"
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {s.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-3xl font-bold mb-4">
              {step.number}
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {step.title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {step.description}
          </p>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                {backText}
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
            >
              {isLastStep ? finishText : nextText}
              {!isLastStep && <ChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Progress Text */}
        <div className="text-center mt-6 text-gray-600 dark:text-gray-400">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
    `,

    video: `
${commonImports}

interface OnboardingProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

const OnboardingFlow: React.FC<OnboardingProps> = ({
  ${dataName}: propData,
  className,
  onComplete,
  onSkip
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onboardingData = ${dataName} || {};

  const videoTitle = ${getField('videoTitle')};
  const videoDescription = ${getField('videoDescription')};
  const videoUrl = ${getField('videoUrl')};
  const videoDuration = ${getField('videoDuration')};
  const videoThumbnail = ${getField('videoThumbnail')};
  const watchVideoText = ${getField('watchVideoText')};
  const skipText = ${getField('skipText')};
  const continueText = ${getField('continueText')};

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);

  const handlePlayVideo = () => {
    setIsPlaying(true);
    setHasWatched(true);
  };

  const handleSkip = () => {
    onSkip?.();
  };

  const handleContinue = () => {
    onComplete?.();
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-5xl">
        {/* Skip Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {skipText}
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Video Section */}
          <div className="relative aspect-video bg-black">
            {!isPlaying ? (
              <div className="relative w-full h-full group cursor-pointer" onClick={handlePlayVideo}>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-900/70" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-12 h-12 text-blue-600 ml-1" fill="currentColor" />
                  </div>
                </div>
                {videoDuration && (
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/70 text-white text-sm rounded">
                    {videoDuration}
                  </div>
                )}
              </div>
            ) : (
              <iframe
                src={videoUrl}
                title={videoTitle}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          {/* Content Section */}
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {videoTitle}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {videoDescription}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {!isPlaying && (
                <button
                  onClick={handlePlayVideo}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  {watchVideoText}
                </button>
              )}

              <button
                onClick={handleContinue}
                className={cn(
                  "px-8 py-3 rounded-lg font-bold transition-colors",
                  hasWatched
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                )}
              >
                {continueText}
              </button>
            </div>

            {/* Features List */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                What you'll learn:
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Setting up your first project',
                  'Understanding the dashboard',
                  'Creating your first API',
                  'Deploying to production'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
    `
  };

  return variants[variant] || variants.carousel;
};
