import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCheckoutSteps = (
  resolved: ResolvedComponent,
  variant: 'horizontal' | 'vertical' | 'numbered' = 'horizontal'
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

  const variants = {
    horizontal: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Check, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { toast } from 'sonner';

interface Step {
  id: number;
  name: string;
  label: string;
  description: string;
}

interface CheckoutStepsProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onStepClick?: (stepId: number) => void;
  onNext?: (currentStep: number) => void;
  onPrevious?: (currentStep: number) => void;
  onComplete?: () => void;
}

export default function CheckoutSteps({ ${dataName}: initialData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME, onStepClick, onNext, onPrevious, onComplete }: CheckoutStepsProps) {
  const queryClient = useQueryClient();

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  // Mutation for completing order
  const completeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post<any>('/orders', orderData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order completed successfully!');
      if (onComplete) onComplete();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to complete order');
    },
  });

  const styles = getVariantStyles(variant, colorScheme);
  const stepsData = ${dataName} || {};

  const steps = ${getField('steps')} as Step[];
  const initialCurrentStep = ${getField('currentStep')};
  const initialCompletedSteps = ${getField('completedSteps')};

  const [currentStep, setCurrentStep] = useState(initialCurrentStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>(initialCompletedSteps);

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const nextButton = ${getField('nextButton')};
  const previousButton = ${getField('previousButton')};
  const completeButton = ${getField('completeButton')};

  // Event handlers
  const handleStepClick = (stepId: number) => {
    console.log(\`Step clicked: \${stepId}\`);
    const step = steps.find(s => s.id === stepId);
    if (step) {
      if (completedSteps.includes(stepId) || stepId <= currentStep) {
        setCurrentStep(stepId);
        if (onStepClick) {
          onStepClick(stepId);
        } else {
          alert(\`Navigating to step: \${step.label}\`);
        }
      } else {
        alert(\`Please complete previous steps first\`);
      }
    }
  };

  const handleNext = () => {
    console.log(\`Next from step: \${currentStep}\`);
    if (currentStep < steps.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
      if (onNext) {
        onNext(currentStep);
      } else {
        alert(\`Proceeding to step \${currentStep + 1}\`);
      }
    }
  };

  const handlePrevious = () => {
    console.log(\`Previous from step: \${currentStep}\`);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (onPrevious) {
        onPrevious(currentStep);
      } else {
        alert(\`Going back to step \${currentStep - 1}\`);
      }
    }
  };

  const handleComplete = () => {
    console.log('Complete order clicked');
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    // Use mutation to complete order via API
    completeOrderMutation.mutate({
      completed_steps: [...completedSteps, currentStep],
      current_step: currentStep,
      status: 'completed'
    });
  };

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  const getProgressPercentage = () => {
    return ((completedSteps.length) / steps.length) * 100;
  };

  return (
    <div className={cn("w-full", styles.background, className)}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className={cn(styles.badge, 'h-2 rounded-full overflow-hidden')}>
          <div
            className={cn(styles.button, 'h-full transition-all duration-500')}
            style={{ width: \`\${getProgressPercentage()}%\` }}
          />
        </div>
        <p className={\`text-sm mt-2 \${styles.subtitle}\`}>
          Step {currentStep} of {steps.length}
        </p>
      </div>

      {/* Steps */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isClickable = status === 'completed' || step.id <= currentStep;

            return (
              <li key={step.id} className="relative flex-1">
                <div className="flex items-center">
                  <button
                    onClick={() => isClickable && handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      "relative flex flex-col items-center group",
                      isClickable && "cursor-pointer hover:opacity-80 transition-opacity",
                      !isClickable && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {/* Step Circle */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all",
                        status === 'completed' && cn(styles.button, 'border-transparent'),
                        status === 'current' && cn(styles.card, styles.border, styles.accent),
                        status === 'upcoming' && cn(styles.card, 'border-gray-300 dark:border-gray-600 text-gray-500')
                      )}
                    >
                      {status === 'completed' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="mt-2 text-center">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          status === 'current' && styles.accent,
                          status === 'completed' && styles.title,
                          status === 'upcoming' && styles.subtitle
                        )}
                      >
                        {step.label}
                      </p>
                      <p className={\`text-xs mt-1 hidden sm:block \${styles.subtitle}\`}>
                        {step.description}
                      </p>
                    </div>
                  </button>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden sm:block flex-1 h-0.5 mx-4 -mt-12">
                      <div
                        className={cn(
                          "h-full transition-all",
                          completedSteps.includes(step.id) ? styles.button : styles.badge
                        )}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={cn(styles.card, styles.cardHover, 'px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed', styles.border)}
        >
          {previousButton}
        </button>

        {currentStep === steps.length ? (
          <button
            onClick={handleComplete}
            disabled={completeOrderMutation.isPending}
            className="px-6 py-3 rounded-lg font-medium transition-all bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completeOrderMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              completeButton
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={cn(styles.button, styles.buttonHover, 'px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2')}
          >
            {nextButton}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
    `,

    vertical: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Check, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { toast } from 'sonner';

interface Step {
  id: number;
  name: string;
  label: string;
  description: string;
}

interface CheckoutStepsProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onStepClick?: (stepId: number) => void;
  onNext?: (currentStep: number) => void;
  onPrevious?: (currentStep: number) => void;
  onComplete?: () => void;
}

export default function CheckoutSteps({ ${dataName}: initialData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME, onStepClick, onNext, onPrevious, onComplete }: CheckoutStepsProps) {
  const queryClient = useQueryClient();

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  // Mutation for completing order
  const completeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post<any>('/orders', orderData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order completed successfully!');
      if (onComplete) onComplete();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to complete order');
    },
  });

  const styles = getVariantStyles(variant, colorScheme);
  const stepsData = ${dataName} || {};

  const steps = ${getField('steps')} as Step[];
  const initialCurrentStep = ${getField('currentStep')};
  const initialCompletedSteps = ${getField('completedSteps')};

  const [currentStep, setCurrentStep] = useState(initialCurrentStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>(initialCompletedSteps);

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const nextButton = ${getField('nextButton')};
  const previousButton = ${getField('previousButton')};
  const completeButton = ${getField('completeButton')};
  const completedLabel = ${getField('completedLabel')};
  const currentLabel = ${getField('currentLabel')};

  // Event handlers
  const handleStepClick = (stepId: number) => {
    console.log(\`Step clicked: \${stepId}\`);
    const step = steps.find(s => s.id === stepId);
    if (step) {
      if (completedSteps.includes(stepId) || stepId <= currentStep) {
        setCurrentStep(stepId);
        if (onStepClick) {
          onStepClick(stepId);
        } else {
          alert(\`Navigating to step: \${step.label}\`);
        }
      } else {
        alert(\`Please complete previous steps first\`);
      }
    }
  };

  const handleNext = () => {
    console.log(\`Next from step: \${currentStep}\`);
    if (currentStep < steps.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
      if (onNext) {
        onNext(currentStep);
      } else {
        alert(\`Proceeding to step \${currentStep + 1}\`);
      }
    }
  };

  const handlePrevious = () => {
    console.log(\`Previous from step: \${currentStep}\`);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (onPrevious) {
        onPrevious(currentStep);
      } else {
        alert(\`Going back to step \${currentStep - 1}\`);
      }
    }
  };

  const handleComplete = () => {
    console.log('Complete order clicked');
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    // Use mutation to complete order via API
    completeOrderMutation.mutate({
      completed_steps: [...completedSteps, currentStep],
      current_step: currentStep,
      status: 'completed'
    });
  };

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className={cn("w-full max-w-md", styles.background, className)}>
      {/* Vertical Steps */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const isClickable = status === 'completed' || step.id <= currentStep;

            return (
              <li key={step.id} className="relative">
                <button
                  onClick={() => isClickable && handleStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-start w-full text-left p-4 rounded-lg border-2 transition-all",
                    status === 'current' && cn(styles.card, styles.border),
                    status === 'completed' && "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-900/20",
                    status === 'upcoming' && cn(styles.card, 'border-gray-300 dark:border-gray-600'),
                    isClickable && "cursor-pointer hover:shadow-md",
                    !isClickable && "cursor-not-allowed opacity-50"
                  )}
                >
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                      status === 'completed' && "bg-green-600 text-white dark:bg-green-500",
                      status === 'current' && cn(styles.button),
                      status === 'upcoming' && cn(styles.badge, styles.subtitle)
                    )}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3
                        className={cn(
                          "text-base font-semibold",
                          status === 'current' && styles.accent,
                          status === 'completed' && "text-green-600 dark:text-green-400",
                          status === 'upcoming' && styles.title
                        )}
                      >
                        {step.label}
                      </h3>
                      {status === 'completed' && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          {completedLabel}
                        </span>
                      )}
                      {status === 'current' && (
                        <span className={\`text-xs font-medium \${styles.accent}\`}>
                          {currentLabel}
                        </span>
                      )}
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-sm",
                        status === 'current' && styles.text,
                        status === 'completed' && "text-green-700 dark:text-green-300",
                        status === 'upcoming' && styles.subtitle
                      )}
                    >
                      {step.description}
                    </p>
                  </div>
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-8 -ml-0.5">
                    <div
                      className={cn(
                        "h-full transition-all",
                        completedSteps.includes(step.id) ? "bg-green-600 dark:bg-green-500" : styles.badge
                      )}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={cn(styles.card, styles.cardHover, 'px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed', styles.border)}
        >
          {previousButton}
        </button>

        {currentStep === steps.length ? (
          <button
            onClick={handleComplete}
            disabled={completeOrderMutation.isPending}
            className="px-6 py-3 rounded-lg font-medium transition-all bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completeOrderMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              completeButton
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={cn(styles.button, styles.buttonHover, 'px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2')}
          >
            {nextButton}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
    `,

    numbered: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { toast } from 'sonner';

interface Step {
  id: number;
  name: string;
  label: string;
  description: string;
}

interface CheckoutStepsProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onStepClick?: (stepId: number) => void;
  onNext?: (currentStep: number) => void;
  onPrevious?: (currentStep: number) => void;
  onComplete?: () => void;
}

export default function CheckoutSteps({ ${dataName}: initialData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME, onStepClick, onNext, onPrevious, onComplete }: CheckoutStepsProps) {
  const queryClient = useQueryClient();

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  // Mutation for completing order
  const completeOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post<any>('/orders', orderData);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order completed successfully!');
      if (onComplete) onComplete();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to complete order');
    },
  });

  const styles = getVariantStyles(variant, colorScheme);
  const stepsData = ${dataName} || {};

  const steps = ${getField('steps')} as Step[];
  const initialCurrentStep = ${getField('currentStep')};
  const initialCompletedSteps = ${getField('completedSteps')};

  const [currentStep, setCurrentStep] = useState(initialCurrentStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>(initialCompletedSteps);

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const nextButton = ${getField('nextButton')};
  const previousButton = ${getField('previousButton')};
  const completeButton = ${getField('completeButton')};

  // Event handlers
  const handleStepClick = (stepId: number) => {
    console.log(\`Step clicked: \${stepId}\`);
    const step = steps.find(s => s.id === stepId);
    if (step) {
      if (completedSteps.includes(stepId) || stepId <= currentStep) {
        setCurrentStep(stepId);
        if (onStepClick) {
          onStepClick(stepId);
        } else {
          alert(\`Navigating to step: \${step.label}\`);
        }
      } else {
        alert(\`Please complete previous steps first\`);
      }
    }
  };

  const handleNext = () => {
    console.log(\`Next from step: \${currentStep}\`);
    if (currentStep < steps.length) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
      if (onNext) {
        onNext(currentStep);
      } else {
        alert(\`Proceeding to step \${currentStep + 1}\`);
      }
    }
  };

  const handlePrevious = () => {
    console.log(\`Previous from step: \${currentStep}\`);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (onPrevious) {
        onPrevious(currentStep);
      } else {
        alert(\`Going back to step \${currentStep - 1}\`);
      }
    }
  };

  const handleComplete = () => {
    console.log('Complete order clicked');
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    // Use mutation to complete order via API
    completeOrderMutation.mutate({
      completed_steps: [...completedSteps, currentStep],
      current_step: currentStep,
      status: 'completed'
    });
  };

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className={cn("w-full", styles.background, className)}>
      {/* Numbered Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isClickable = status === 'completed' || step.id <= currentStep;

          return (
            <button
              key={step.id}
              onClick={() => isClickable && handleStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                "relative p-6 rounded-lg border-2 transition-all text-left",
                status === 'current' && cn(styles.card, styles.border, 'shadow-lg'),
                status === 'completed' && "border-green-600 bg-green-50 dark:border-green-500 dark:bg-green-900/20",
                status === 'upcoming' && cn(styles.card, 'border-gray-300 dark:border-gray-600'),
                isClickable && "cursor-pointer hover:shadow-lg hover:scale-105",
                !isClickable && "cursor-not-allowed opacity-50"
              )}
            >
              {/* Step Number Circle */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all",
                    status === 'completed' && "bg-green-600 text-white dark:bg-green-500",
                    status === 'current' && cn(styles.button),
                    status === 'upcoming' && cn(styles.badge, styles.subtitle)
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Progress Indicator */}
                {status === 'current' && (
                  <div className="flex gap-1">
                    <div className={cn(styles.button, 'w-2 h-2 rounded-full animate-pulse')} />
                    <div className={cn(styles.badge, 'w-2 h-2 rounded-full animate-pulse delay-75')} />
                    <div className={cn(styles.badge, 'w-2 h-2 rounded-full animate-pulse delay-150 opacity-60')} />
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div>
                <h3
                  className={cn(
                    "text-base font-bold mb-2",
                    status === 'current' && styles.accent,
                    status === 'completed' && "text-green-600 dark:text-green-400",
                    status === 'upcoming' && styles.title
                  )}
                >
                  {step.label}
                </h3>
                <p
                  className={cn(
                    "text-sm",
                    status === 'current' && styles.text,
                    status === 'completed' && "text-green-700 dark:text-green-300",
                    status === 'upcoming' && styles.subtitle
                  )}
                >
                  {step.description}
                </p>
              </div>

              {/* Status Badge */}
              {status === 'current' && (
                <div className="absolute top-2 right-2">
                  <div className={cn(styles.button, 'px-2 py-1 text-xs font-semibold rounded')}>
                    Active
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className={cn(styles.card, styles.cardHover, 'px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed', styles.border)}
        >
          {previousButton}
        </button>

        <div className={\`text-sm \${styles.subtitle}\`}>
          Step {currentStep} of {steps.length}
        </div>

        {currentStep === steps.length ? (
          <button
            onClick={handleComplete}
            disabled={completeOrderMutation.isPending}
            className="px-6 py-3 rounded-lg font-medium transition-all bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completeOrderMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            ) : (
              completeButton
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className={cn(styles.button, styles.buttonHover, 'px-6 py-3 rounded-lg font-medium transition-all')}
          >
            {nextButton}
          </button>
        )}
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.horizontal;
};
