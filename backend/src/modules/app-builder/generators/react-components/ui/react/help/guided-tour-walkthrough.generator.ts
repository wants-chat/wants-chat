import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateGuidedTourWalkthrough = (
  resolved: ResolvedComponent,
  variant: 'spotlight' | 'tooltip' | 'modal' = 'spotlight'
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
    return `/${dataSource || 'tour'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'tour';

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    spotlight: `
${commonImports}
import { ArrowRight, ArrowLeft, X, Lightbulb, Check } from 'lucide-react';

interface TourStep {
  id: number;
  target: string;
  title: string;
  content: string;
  position: string;
}

interface SpotlightTourProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

const SpotlightTour: React.FC<SpotlightTourProps> = ({ ${dataName}: propData, className, onComplete, onSkip }) => {
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
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tourData = ${dataName} || {};

  const title = ${getField('spotlightTitle')};
  const tourSteps = ${getField('tourSteps')};
  const nextButton = ${getField('nextButton')};
  const previousButton = ${getField('previousButton')};
  const skipButton = ${getField('skipButton')};
  const finishButton = ${getField('finishButton')};
  const stepLabel = ${getField('stepLabel')};
  const ofLabel = ${getField('ofLabel')};

  useEffect(() => {
    if (!isActive) return;

    const step = tourSteps[currentStep];
    if (step) {
      const element = document.querySelector(step.target) as HTMLElement;
      setHighlightedElement(element);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, isActive]);

  const handleNext = () => {
    console.log('Tour: Next step clicked');
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    console.log('Tour: Previous step clicked');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    console.log('Tour: Skipped');
    setIsActive(false);
    onSkip?.();
  };

  const handleComplete = () => {
    console.log('Tour: Completed');
    setIsActive(false);
    onComplete?.();
  };

  if (!isActive || tourSteps.length === 0) return null;

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />

      {/* Spotlight effect */}
      {highlightedElement && (
        <div
          className="fixed z-[60] pointer-events-none"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 8,
            left: highlightedElement.getBoundingClientRect().left - 8,
            width: highlightedElement.getBoundingClientRect().width + 16,
            height: highlightedElement.getBoundingClientRect().height + 16,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            borderRadius: '8px',
            transition: 'all 0.3s ease'
          }}
        />
      )}

      {/* Tour tooltip */}
      <Card className={cn("fixed z-[70] max-w-md shadow-2xl", className)}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stepLabel} {currentStep + 1} {ofLabel} {tourSteps.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {step.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {step.content}
          </p>

          <div className="mb-4">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: \`\${progress}%\` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
            >
              {skipButton}
            </button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {previousButton}
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <Check className="h-4 w-4" />
                    {finishButton}
                  </>
                ) : (
                  <>
                    {nextButton}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default SpotlightTour;
    `,

    tooltip: `
${commonImports}
import { ArrowRight, ArrowLeft, X, Target } from 'lucide-react';

interface TourStep {
  id: number;
  target: string;
  title: string;
  content: string;
  position: string;
}

interface TooltipTourProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

const TooltipTour: React.FC<TooltipTourProps> = ({ ${dataName}: propData, className, onComplete, onSkip }) => {
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
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tourData = ${dataName} || {};

  const title = ${getField('tooltipTitle')};
  const tourSteps = ${getField('tourSteps')};
  const nextButton = ${getField('nextButton')};
  const previousButton = ${getField('previousButton')};
  const skipButton = ${getField('skipButton')};
  const finishButton = ${getField('finishButton')};
  const gotItButton = ${getField('gotItButton')};

  useEffect(() => {
    if (!isActive) return;

    const step = tourSteps[currentStep];
    if (step) {
      const element = document.querySelector(step.target) as HTMLElement;

      if (element) {
        const rect = element.getBoundingClientRect();
        const position = calculateTooltipPosition(rect, step.position);
        setTooltipPosition(position);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStep, isActive]);

  const calculateTooltipPosition = (rect: DOMRect, position: string) => {
    const offset = 16;
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = rect.top - offset;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - offset;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        break;
      case 'bottom-left':
        top = rect.bottom + offset;
        left = rect.left;
        break;
      default:
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
    }

    return { top, left };
  };

  const handleNext = () => {
    console.log('Tour tooltip: Next step');
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    console.log('Tour tooltip: Previous step');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    console.log('Tour tooltip: Skipped');
    setIsActive(false);
    onSkip?.();
  };

  const handleComplete = () => {
    console.log('Tour tooltip: Completed');
    setIsActive(false);
    onComplete?.();
  };

  if (!isActive || tourSteps.length === 0) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={handleSkip} />

      {/* Tooltip bubble */}
      <div
        className={cn(
          "fixed z-50 max-w-sm animate-in fade-in slide-in-from-bottom-2",
          className
        )}
        style={{
          top: \`\${tooltipPosition.top}px\`,
          left: \`\${tooltipPosition.left}px\`,
          transform: 'translateX(-50%)'
        }}
      >
        <Card className="shadow-xl border-2 border-blue-500">
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {step.content}
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {tourSteps.map((_: any, idx: number) => (
                  <div
                    key={idx}
                    className={\`w-2 h-2 rounded-full transition-colors \${
                      idx === currentStep
                        ? 'bg-blue-600'
                        : idx < currentStep
                        ? 'bg-blue-300'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }\`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1.5"
                >
                  {currentStep === tourSteps.length - 1 ? gotItButton : nextButton}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tooltip arrow */}
          <div
            className="absolute w-3 h-3 bg-white dark:bg-gray-800 border-l-2 border-t-2 border-blue-500 transform rotate-45"
            style={{
              top: '-8px',
              left: '50%',
              marginLeft: '-6px'
            }}
          />
        </Card>
      </div>
    </>
  );
};

export default TooltipTour;
    `,

    modal: `
${commonImports}
import { ArrowRight, X, Check } from 'lucide-react';

interface TourStep {
  id: number;
  target: string;
  title: string;
  content: string;
  position: string;
}

interface ModalTourProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: () => void;
  onSkip?: () => void;
}

const ModalTour: React.FC<ModalTourProps> = ({ ${dataName}: propData, className, onComplete, onSkip }) => {
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
  const [currentStep, setCurrentStep] = useState(-1); // -1 for welcome screen
  const [isActive, setIsActive] = useState(true);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const tourData = ${dataName} || {};

  const title = ${getField('modalTitle')};
  const welcomeHeading = ${getField('welcomeHeading')};
  const welcomeMessage = ${getField('welcomeMessage')};
  const skipTourPrompt = ${getField('skipTourPrompt')};
  const completionHeading = ${getField('completionHeading')};
  const completionMessage = ${getField('completionMessage')};
  const completionAction = ${getField('completionAction')};
  const tourSteps = ${getField('tourSteps')};
  const nextButton = ${getField('nextButton')};
  const previousButton = ${getField('previousButton')};
  const startButton = ${getField('startButton')};
  const laterButton = ${getField('laterButton')};
  const finishButton = ${getField('finishButton')};

  const handleStart = () => {
    console.log('Tour modal: Started');
    setCurrentStep(0);
  };

  const handleNext = () => {
    console.log('Tour modal: Next step');
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCurrentStep(tourSteps.length); // Show completion screen
    }
  };

  const handlePrevious = () => {
    console.log('Tour modal: Previous step');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    console.log('Tour modal: Skipped');
    setIsActive(false);
    onSkip?.();
  };

  const handleComplete = () => {
    console.log('Tour modal: Completed');
    setIsActive(false);
    onComplete?.();
  };

  if (!isActive) return null;

  const progress = currentStep >= 0 ? ((currentStep + 1) / tourSteps.length) * 100 : 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className={cn("max-w-2xl w-full shadow-2xl", className)}>
          {/* Welcome Screen */}
          {currentStep === -1 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {welcomeHeading}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {welcomeMessage}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                {skipTourPrompt}
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  {laterButton}
                </button>
                <button
                  onClick={handleStart}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  {startButton}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Tour Steps */}
          {currentStep >= 0 && currentStep < tourSteps.length && (
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Step {currentStep + 1} of {tourSteps.length}
                  </span>
                  <button
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                    style={{ width: \`\${progress}%\` }}
                  />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {tourSteps[currentStep].title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {tourSteps[currentStep].content}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium"
                >
                  Skip tour
                </button>

                <div className="flex gap-3">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                    >
                      {previousButton}
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    {currentStep === tourSteps.length - 1 ? finishButton : nextButton}
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Completion Screen */}
          {currentStep === tourSteps.length && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {completionHeading}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                {completionMessage}
              </p>

              <button
                onClick={handleComplete}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors font-medium text-lg"
              >
                {completionAction}
              </button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default ModalTour;
    `
  };

  return variants[variant] || variants.spotlight;
};
