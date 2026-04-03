import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFormProgressIndicator = (
  resolved: ResolvedComponent,
  variant: 'bar' | 'circle' | 'steps' = 'bar'
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
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Circle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    bar: `
${commonImports}

interface FormProgressBarProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const FormProgressBar: React.FC<FormProgressBarProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [completedFields, setCompletedFields] = useState(0);
  const [totalFields, setTotalFields] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const progressData = propData || fetchedData || {};

  const progressLabel = ${getField('progressLabel')};
  const completedText = ${getField('completedText')};
  const ofText = ${getField('ofText')};
  const fieldsText = ${getField('fieldsText')};
  const steps = ${getField('steps')};
  const formFields = ${getField('formFields')};
  const nextButton = ${getField('nextButton')};
  const previousButton = ${getField('previousButton')};
  const submitButton = ${getField('submitButton')};
  const successMessage = ${getField('successMessage')};
  const progressMessages = ${getField('progressMessages')};

  useEffect(() => {
    const allFields = [...formFields.step1, ...formFields.step2, ...formFields.step3];
    setTotalFields(allFields.length);

    const completed = allFields.filter(field =>
      formData[field.name] && formData[field.name] !== ''
    ).length;
    setCompletedFields(completed);
  }, [formData]);

  const progressPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  const getProgressMessage = () => {
    if (progressPercentage >= 100) return progressMessages[100];
    if (progressPercentage >= 75) return progressMessages[75];
    if (progressPercentage >= 50) return progressMessages[50];
    if (progressPercentage >= 25) return progressMessages[25];
    return progressMessages[0];
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const renderFields = () => {
    const stepKey = \`step\${currentStep + 1}\` as keyof typeof formFields;
    const fields = formFields[stepKey] || [];

    return fields.map((field: any) => (
      <div key={field.name} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        {field.type === 'checkbox' ? (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData[field.name] || false}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
          </label>
        ) : field.type === 'select' ? (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt.toLowerCase()}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={field.type || 'text'}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>
    ));
  };

  return (
    <div className={cn("max-w-3xl mx-auto p-6", className)}>
      {submitted ? (
        <div className="text-center py-12">
          <CheckCircle className="h-20 w-20 mx-auto mb-4 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {successMessage}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for completing the form!
          </p>
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {progressLabel}
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {completedFields} {ofText} {totalFields} {fieldsText} {completedText.toLowerCase()}
              </span>
            </div>

            <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                style={{ width: \`\${progressPercentage}%\` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900 dark:text-white drop-shadow">
                  {progressPercentage}%
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              {getProgressMessage()}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step: any, idx: number) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={\`w-10 h-10 rounded-full flex items-center justify-center transition-all \${
                    idx < currentStep
                      ? 'bg-green-500 text-white'
                      : idx === currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }\`}>
                    {idx < currentStep ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span className="font-semibold">{step.id}</span>
                    )}
                  </div>
                  <span className={\`text-xs mt-2 font-medium \${
                    idx === currentStep
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }\`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={\`h-1 flex-1 mx-2 \${
                    idx < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }\`} />
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {steps[currentStep].title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {steps[currentStep].description}
              </p>

              {renderFields()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                  {previousButton}
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="ml-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {nextButton}
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="ml-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {submitButton}
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default FormProgressBar;
    `,

    circle: `
${commonImports}

interface FormProgressCircleProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const FormProgressCircle: React.FC<FormProgressCircleProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [completedFields, setCompletedFields] = useState(0);
  const [totalFields, setTotalFields] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const progressData = propData || fetchedData || {};

  const progressLabel = ${getField('progressLabel')};
  const completedText = ${getField('completedText')};
  const remainingText = ${getField('remainingText')};
  const fieldsText = ${getField('fieldsText')};
  const formFields = ${getField('formFields')};
  const submitButton = ${getField('submitButton')};
  const successMessage = ${getField('successMessage')};

  const allFields = [...formFields.step1, ...formFields.step2, ...formFields.step3];

  useEffect(() => {
    setTotalFields(allFields.length);

    const completed = allFields.filter(field =>
      formData[field.name] && formData[field.name] !== ''
    ).length;
    setCompletedFields(completed);
  }, [formData]);

  const progressPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const renderField = (field: any) => (
    <div key={field.name} className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      {field.type === 'checkbox' ? (
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData[field.name] || false}
            onChange={(e) => handleChange(field.name, e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
        </label>
      ) : field.type === 'select' ? (
        <select
          value={formData[field.name] || ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          {field.options?.map((opt: string) => (
            <option key={opt} value={opt.toLowerCase()}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={field.type || 'text'}
          value={formData[field.name] || ''}
          onChange={(e) => handleChange(field.name, e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );

  return (
    <div className={cn("max-w-4xl mx-auto p-6", className)}>
      {submitted ? (
        <div className="text-center py-12">
          <CheckCircle className="h-20 w-20 mx-auto mb-4 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {successMessage}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Circular Progress */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="flex flex-col items-center">
                <svg className="w-64 h-64 transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="128"
                    cy="128"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="128"
                    cy="128"
                    r="90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-blue-600 transition-all duration-500 ease-out"
                  />
                </svg>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-5xl font-bold text-gray-900 dark:text-white mb-1">
                    {Math.round(progressPercentage)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {completedText}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {completedFields} {completedText.toLowerCase()}
                  </span>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {totalFields - completedFields} {remainingText.toLowerCase()}
                  </span>
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300 text-center">
                  {totalFields} total {fieldsText}
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {progressLabel}
              </h3>

              <div className="space-y-6 mb-6">
                {allFields.map(renderField)}
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                {submitButton}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormProgressCircle;
    `,

    steps: `
${commonImports}

interface FormProgressStepsProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  [key: string]: any;
}

const FormProgressSteps: React.FC<FormProgressStepsProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [stepCompletion, setStepCompletion] = useState<Record<number, number>>({});

  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const progressData = propData || fetchedData || {};

  const steps = ${getField('steps')};
  const formFields = ${getField('formFields')};
  const nextButton = ${getField('nextButton')};
  const previousButton = ${getField('previousButton')};
  const submitButton = ${getField('submitButton')};
  const successMessage = ${getField('successMessage')};

  useEffect(() => {
    // Calculate completion for each step
    const completion: Record<number, number> = {};

    Object.keys(formFields).forEach((key, idx) => {
      const fields = formFields[key as keyof typeof formFields];
      const completed = fields.filter((field: any) =>
        formData[field.name] && formData[field.name] !== ''
      ).length;
      completion[idx] = fields.length > 0 ? (completed / fields.length) * 100 : 0;
    });

    setStepCompletion(completion);
  }, [formData]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const renderFields = () => {
    const stepKey = \`step\${currentStep + 1}\` as keyof typeof formFields;
    const fields = formFields[stepKey] || [];

    return fields.map((field: any) => (
      <div key={field.name} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        {field.type === 'checkbox' ? (
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData[field.name] || false}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
          </label>
        ) : field.type === 'select' ? (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt.toLowerCase()}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            type={field.type || 'text'}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
      </div>
    ));
  };

  return (
    <div className={cn("max-w-6xl mx-auto p-6", className)}>
      {submitted ? (
        <div className="text-center py-12">
          <CheckCircle className="h-20 w-20 mx-auto mb-4 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {successMessage}
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Vertical Steps Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {steps.map((step: any, idx: number) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => handleStepClick(idx)}
                  className={\`w-full text-left p-4 rounded-lg transition-all \${
                    idx === currentStep
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500'
                      : idx < currentStep
                      ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-500'
                      : 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
                  }\`}
                >
                  <div className="flex items-start gap-3">
                    <div className={\`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 \${
                      idx < currentStep
                        ? 'bg-green-500 text-white'
                        : idx === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }\`}>
                      {idx < currentStep ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="font-semibold text-sm">{step.id}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className={\`font-semibold mb-1 \${
                        idx === currentStep
                          ? 'text-blue-900 dark:text-blue-100'
                          : idx < currentStep
                          ? 'text-green-900 dark:text-green-100'
                          : 'text-gray-700 dark:text-gray-300'
                      }\`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>

                      {/* Step Progress Bar */}
                      <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={\`h-full transition-all duration-300 \${
                            idx < currentStep ? 'bg-green-500' : 'bg-blue-500'
                          }\`}
                          style={{ width: \`\${stepCompletion[idx] || 0}%\` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {Math.round(stepCompletion[idx] || 0)}% complete
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {steps[currentStep].description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(stepCompletion[currentStep] || 0)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Step {currentStep + 1} of {steps.length}
                    </div>
                  </div>
                </div>

                {renderFields()}
              </div>

              {/* Navigation */}
              <div className="flex gap-4">
                {currentStep > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    {previousButton}
                  </button>
                )}

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    {nextButton}
                    <ChevronRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="ml-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    {submitButton}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormProgressSteps;
    `
  };

  return variants[variant] || variants.bar;
};
