import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTutorialWalkthrough = (
  resolved: ResolvedComponent,
  variant: 'spotlight' | 'tooltip' | 'guided' = 'spotlight'
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
    return `/${dataSource || 'tutorial'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'tutorial';

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X, ChevronLeft, ChevronRight, Check, Play, Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    spotlight: `
${commonImports}

interface TutorialStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface TutorialProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (stepIndex: number) => void;
  isActive?: boolean;
}

const TutorialWalkthrough: React.FC<TutorialProps> = ({
  ${dataName}: propData,
  className,
  onComplete,
  onSkip,
  onStepChange,
  isActive: isActiveProp = true
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tutorialData = ${dataName} || {};

  const steps = ${getField('tutorialSteps')} as TutorialStep[];
  const nextText = ${getField('nextText')} || 'Next';
  const backText = ${getField('backText')} || 'Back';
  const skipText = ${getField('skipText')} || 'Skip';
  const finishText = ${getField('finishText')} || 'Finish';

  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isActive, setIsActive] = useState(isActiveProp);

  useEffect(() => {
    if (!isActive) return;

    const updateTargetPosition = () => {
      const step = steps[currentStep];
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);

        // Scroll element into view if needed
        const viewportHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementBottom = rect.bottom;

        if (elementTop < 100 || elementBottom > viewportHeight - 100) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Update position after scroll
          setTimeout(() => {
            setTargetRect(element.getBoundingClientRect());
          }, 300);
        }
      }
    };

    // Small delay to ensure DOM is rendered
    const timeout = setTimeout(() => {
      updateTargetPosition();
    }, 100);

    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [currentStep, isActive, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      onStepChange?.(nextIndex);
    } else {
      setIsActive(false);
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
    setIsActive(false);
    onSkip?.();
  };

  if (!isActive || !steps || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[52] pointer-events-none">
        {/* Dark overlay with cutout */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Highlight border */}
        {targetRect && (
          <div
            className="absolute border-4 border-blue-500 rounded-lg pointer-events-none z-[55] transition-all duration-300"
            style={{
              left: targetRect.left - 8,
              top: targetRect.top - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.5)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      {targetRect && (
        <div
          className={cn("fixed z-[60] pointer-events-auto transition-all duration-300 ease-out", className)}
          style={{
            left: step.placement === 'right' ? Math.min(targetRect.right + 20, window.innerWidth - 340) :
                  step.placement === 'left' ? Math.max(targetRect.left - 320 - 20, 20) :
                  Math.max(20, Math.min(targetRect.left, window.innerWidth - 340)),
            top: step.placement === 'bottom' ? Math.min(targetRect.bottom + 20, window.innerHeight - 250) :
                 step.placement === 'top' ? Math.max(targetRect.top - 200 - 20, 20) :
                 Math.max(20, targetRect.top)
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-80 overflow-hidden border-2 border-blue-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Step {currentStep + 1} of {steps.length}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                </div>
                <button
                  onClick={handleSkip}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {step.content}
              </p>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      index === currentStep
                        ? "w-8 bg-blue-600"
                        : index < currentStep
                          ? "w-2 bg-green-500"
                          : "w-2 bg-gray-300 dark:bg-gray-600"
                    )}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {backText}
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {isLastStep ? finishText : nextText}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                  {isLastStep && <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TutorialWalkthrough;
    `,

    tooltip: `
${commonImports}

interface TutorialStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  isActive?: boolean;
}

const TutorialWalkthrough: React.FC<TutorialProps> = ({
  ${dataName}: propData,
  className,
  onComplete,
  onSkip,
  isActive: isActiveProp = true
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const tutorialData = ${dataName} || {};

  const steps = ${getField('tutorialSteps')} as TutorialStep[];
  const gotItText = ${getField('gotItText')} || 'Got it';
  const skipText = ${getField('skipText')} || 'Skip';

  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isActive, setIsActive] = useState(isActiveProp);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  useEffect(() => {
    if (!isActive) return;

    const updateTargetPosition = () => {
      const step = steps[currentStep];
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);

        // Scroll element into view if needed
        const viewportHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementBottom = rect.bottom;

        if (elementTop < 100 || elementBottom > viewportHeight - 100) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Update position after scroll
          setTimeout(() => {
            setTargetRect(element.getBoundingClientRect());
          }, 300);
        }
      }
    };

    // Small delay to ensure DOM is rendered
    const timeout = setTimeout(() => {
      updateTargetPosition();
    }, 100);

    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [currentStep, isActive, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsActive(false);
      onComplete?.();
    }
  };

  const handleSkip = () => {
    setIsActive(false);
    onSkip?.();
  };

  if (!isActive || !steps || steps.length === 0) return null;

  const step = steps[currentStep];

  const getTooltipPosition = () => {
    if (!targetRect) return {};

    const placement = step.placement || 'bottom';
    const offset = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    let left = 0;
    let top = 0;
    let transform = '';

    switch (placement) {
      case 'top':
        left = targetRect.left + targetRect.width / 2;
        top = targetRect.top - offset;
        transform = 'translate(-50%, -100%)';
        if (top - tooltipHeight < 10) {
          top = targetRect.bottom + offset;
          transform = 'translateX(-50%)';
        }
        break;
      case 'bottom':
        left = targetRect.left + targetRect.width / 2;
        top = targetRect.bottom + offset;
        transform = 'translateX(-50%)';
        if (top + tooltipHeight > window.innerHeight - 10) {
          top = targetRect.top - offset;
          transform = 'translate(-50%, -100%)';
        }
        break;
      case 'left':
        left = targetRect.left - offset;
        top = targetRect.top + targetRect.height / 2;
        transform = 'translate(-100%, -50%)';
        if (left - tooltipWidth < 10) {
          left = targetRect.right + offset;
          transform = 'translateY(-50%)';
        }
        break;
      case 'right':
        left = targetRect.right + offset;
        top = targetRect.top + targetRect.height / 2;
        transform = 'translateY(-50%)';
        if (left + tooltipWidth > window.innerWidth - 10) {
          left = targetRect.left - offset;
          transform = 'translate(-100%, -50%)';
        }
        break;
    }

    left = Math.max(10, Math.min(left, window.innerWidth - 10));
    top = Math.max(10, Math.min(top, window.innerHeight - 10));

    return { left, top, transform };
  };

  const getArrowClasses = () => {
    const placement = step.placement || 'bottom';
    const baseClasses = 'absolute w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45 border';

    switch (placement) {
      case 'top':
        return \`\${baseClasses} -bottom-1.5 left-1/2 -translate-x-1/2 border-t-0 border-l-0 border-gray-200 dark:border-gray-700\`;
      case 'bottom':
        return \`\${baseClasses} -top-1.5 left-1/2 -translate-x-1/2 border-b-0 border-r-0 border-gray-200 dark:border-gray-700\`;
      case 'left':
        return \`\${baseClasses} -right-1.5 top-1/2 -translate-y-1/2 border-t-0 border-r-0 border-gray-200 dark:border-gray-700\`;
      case 'right':
        return \`\${baseClasses} -left-1.5 top-1/2 -translate-y-1/2 border-b-0 border-l-0 border-gray-200 dark:border-gray-700\`;
      default:
        return baseClasses;
    }
  };

  return (
    <>
      {/* Tooltip */}
      {targetRect && (
        <div
          className={cn("fixed z-[60] pointer-events-auto transition-all duration-300 ease-out", className)}
          style={getTooltipPosition()}
        >
          <div className="relative animate-in fade-in zoom-in-95 duration-200">
            {/* Arrow */}
            <div className={getArrowClasses()} />

            {/* Tooltip Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {step.title}
                </h4>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {step.content}
              </p>

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentStep + 1} of {steps.length}
                </span>

                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors"
                >
                  {gotItText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Highlight ring on target */}
      {targetRect && (
        <div
          className="fixed z-[55] pointer-events-none border-2 border-blue-500 rounded-lg transition-all duration-300"
          style={{
            left: targetRect.left - 4,
            top: targetRect.top - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2), 0 0 15px rgba(59, 130, 246, 0.4)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}
    </>
  );
};

export default TutorialWalkthrough;
    `,

    guided: `
${commonImports}

interface TutorialStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface TutorialProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (stepIndex: number) => void;
}

const TutorialWalkthrough: React.FC<TutorialProps> = ({
  ${dataName}: propData,
  className,
  onComplete,
  onSkip,
  onStepChange
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const tutorialData = ${dataName} || {};

  const steps = ${getField('tutorialSteps')} as TutorialStep[];
  const startTutorialText = ${getField('startTutorialText')} || 'Start Tutorial';
  const nextText = ${getField('nextText')} || 'Next';
  const backText = ${getField('backText')} || 'Back';
  const skipText = ${getField('skipText')} || 'Skip Tutorial';
  const finishText = ${getField('finishText')} || 'Finish';

  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleStart = () => {
    setIsActive(true);
    setCurrentStep(0);
    onStepChange?.(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      onStepChange?.(nextIndex);
    } else {
      setIsActive(false);
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
    setIsActive(false);
    onSkip?.();
  };

  if (!steps || steps.length === 0) return null;

  if (!isActive) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <button
          onClick={handleStart}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Play className="w-5 h-5" />
          {startTutorialText}
        </button>
      </div>
    );
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />

      {/* Guide Panel */}
      <div className={cn("fixed bottom-0 left-0 right-0 z-50 pointer-events-auto", className)}>
        <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl border-t-4 border-blue-500 max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: \`\${progress}%\` }}
            />
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {currentStep + 1}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Step {currentStep + 1} of {steps.length}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {step.title}
                </h3>
              </div>

              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {step.content}
            </p>

            {/* Step Indicators */}
            <div className="flex items-center gap-2 mb-6">
              {steps.map((s, index) => (
                <div
                  key={s.id}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all",
                    index < currentStep
                      ? "bg-green-500"
                      : index === currentStep
                        ? "bg-blue-600"
                        : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleSkip}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {skipText}
              </button>

              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {backText}
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {isLastStep ? finishText : nextText}
                  {!isLastStep && <ChevronRight className="w-4 h-4" />}
                  {isLastStep && <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TutorialWalkthrough;
    `
  };

  return variants[variant] || variants.spotlight;
};