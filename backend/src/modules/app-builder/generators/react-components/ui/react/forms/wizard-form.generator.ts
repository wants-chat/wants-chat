import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateWizardForm = (
  resolved: ResolvedComponent,
  variant: 'threeStep' | 'fourStep' | 'fiveStep' = 'threeStep'
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronRight, ChevronLeft, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    threeStep: `
${commonImports}

interface WizardFormThreeStepProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onComplete?: (formData: any) => void;
  onSaveExit?: (formData: any) => void;
}

const WizardFormThreeStep: React.FC<WizardFormThreeStepProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onComplete, onSaveExit }) => {
  const queryClient = useQueryClient();

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`${apiRoute}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onComplete) onComplete(data);
      setCompleted(true);
    },
    onError: (err: any) => {
      console.error('Form submission error:', err);
    },
  });

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

  const wizardData = propData || fetchedData || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [completed, setCompleted] = useState(false);

  const title = ${getField('title')};
  const description = ${getField('description')};
  const step1Title = ${getField('step1Title')};
  const step2Title = ${getField('step2Title')};
  const step3Title = ${getField('step3Title')};
  const firstNameLabel = ${getField('firstNameLabel')};
  const firstNamePlaceholder = ${getField('firstNamePlaceholder')};
  const lastNameLabel = ${getField('lastNameLabel')};
  const lastNamePlaceholder = ${getField('lastNamePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const phoneLabel = ${getField('phoneLabel')};
  const phonePlaceholder = ${getField('phonePlaceholder')};
  const addressLabel = ${getField('addressLabel')};
  const addressPlaceholder = ${getField('addressPlaceholder')};
  const cityLabel = ${getField('cityLabel')};
  const cityPlaceholder = ${getField('cityPlaceholder')};
  const stateLabel = ${getField('stateLabel')};
  const zipCodeLabel = ${getField('zipCodeLabel')};
  const zipCodePlaceholder = ${getField('zipCodePlaceholder')};
  const stateOptions = ${getField('stateOptions')};
  const nextButtonText = ${getField('nextButtonText')};
  const previousButtonText = ${getField('previousButtonText')};
  const submitButtonText = ${getField('submitButtonText')};
  const saveExitButtonText = ${getField('saveExitButtonText')};
  const reviewTitle = ${getField('reviewTitle')};
  const reviewDescription = ${getField('reviewDescription')};
  const editButtonText = ${getField('editButtonText')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const totalSteps = 3;
  const steps = [
    { number: 1, title: step1Title },
    { number: 2, title: step2Title },
    { number: 3, title: step3Title }
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    } else if (step === 2) {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    submitMutation.mutate(formData);
  };

  const handleSaveExit = () => {
    if (onSaveExit) {
      onSaveExit(formData);
    } else {
      console.log('Form saved:', formData);
    }
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
  };

  if (completed) {
    return (
      <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{successTitle}</h2>
          <p className="text-gray-600 dark:text-gray-400">{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all \${
                      currentStep > step.number
                        ? 'bg-green-600 text-white'
                        : currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }\`}>
                      {currentStep > step.number ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className={\`text-xs mt-2 font-medium \${
                      currentStep >= step.number
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }\`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={\`flex-1 h-1 mx-2 rounded transition-all \${
                      currentStep > step.number
                        ? 'bg-green-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }\`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="mb-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{step1Title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {firstNameLabel} *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder={firstNamePlaceholder}
                      className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all \${
                        errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }\`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {lastNameLabel} *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      placeholder={lastNamePlaceholder}
                      className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all \${
                        errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }\`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{step2Title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {emailLabel} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder={emailPlaceholder}
                      className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all \${
                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }\`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {phoneLabel} *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder={phonePlaceholder}
                      className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all \${
                        errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }\`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {addressLabel} *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder={addressPlaceholder}
                    className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all \${
                      errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }\`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {cityLabel} *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder={cityPlaceholder}
                      className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all \${
                        errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }\`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {stateLabel} *
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all \${
                        errors.state ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }\`}
                    >
                      {stateOptions.map((option: any) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {zipCodeLabel} *
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleChange('zipCode', e.target.value)}
                      placeholder={zipCodePlaceholder}
                      className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all \${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }\`}
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.zipCode}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{reviewTitle}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{reviewDescription}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{step1Title}</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(1)}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                      {editButtonText}
                    </button>
                  </div>

                  <div className="flex justify-between items-start pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{step2Title}</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Email:</span> {formData.email}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Phone:</span> {formData.phone}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Address:</span> {formData.address}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">City:</span> {formData.city}, {formData.state} {formData.zipCode}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEdit(2)}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                    >
                      {editButtonText}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSaveExit}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {saveExitButtonText}
            </button>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {previousButtonText}
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                >
                  {nextButtonText}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                >
                  <Check className="h-4 w-4" />
                  {submitButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardFormThreeStep;
    `,

    fourStep: `
${commonImports}

interface WizardFormFourStepProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onComplete?: (formData: any) => void;
  onSaveExit?: (formData: any) => void;
}

const WizardFormFourStep: React.FC<WizardFormFourStepProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onComplete, onSaveExit }) => {
  const queryClient = useQueryClient();

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`${apiRoute}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onComplete) onComplete(data);
      setCompleted(true);
    },
    onError: (err: any) => {
      console.error('Form submission error:', err);
    },
  });

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

  const wizardData = propData || fetchedData || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [completed, setCompleted] = useState(false);

  const title = ${getField('title')};
  const step1Title = ${getField('step1Title')};
  const step2Title = ${getField('step2Title')};
  const step3Title = ${getField('step3Title')};
  const step4Title = ${getField('step4Title')};
  const usernameLabel = ${getField('usernameLabel')};
  const usernamePlaceholder = ${getField('usernamePlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const nextButtonText = ${getField('nextButtonText')};
  const previousButtonText = ${getField('previousButtonText')};
  const submitButtonText = ${getField('submitButtonText')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};

  const totalSteps = 4;
  const steps = [
    { number: 1, title: step1Title },
    { number: 2, title: step2Title },
    { number: 3, title: step3Title },
    { number: 4, title: step4Title }
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    } else if (step === 2) {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    } else if (step === 3) {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    submitMutation.mutate(formData);
  };

  const handleSaveExit = () => {
    if (onSaveExit) {
      onSaveExit(formData);
    }
  };

  if (completed) {
    return (
      <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{successTitle}</h2>
          <p className="text-gray-600 dark:text-gray-400">{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">{title}</h1>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: \`\${((currentStep - 1) / (totalSteps - 1)) * 100}%\` }}
                />
              </div>
              <div className="relative flex justify-between">
                {steps.map((step) => (
                  <div key={step.number} className="flex flex-col items-center">
                    <div className={\`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all \${
                      currentStep > step.number
                        ? 'bg-green-600 text-white'
                        : currentStep === step.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }\`}>
                      {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                    </div>
                    <span className="text-xs mt-2 font-medium text-gray-600 dark:text-gray-400 text-center max-w-[80px]">
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3 Content - Account Settings */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{step3Title}</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {usernameLabel} *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder={usernamePlaceholder}
                  className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 \${
                    errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }\`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {passwordLabel} *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder={passwordPlaceholder}
                  className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 \${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }\`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {confirmPasswordLabel} *
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder={passwordPlaceholder}
                  className={\`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 \${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }\`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                {previousButtonText}
              </button>
            )}
            <div className="ml-auto">
              {currentStep < totalSteps ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                >
                  {nextButtonText}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                >
                  <Check className="h-4 w-4" />
                  {submitButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardFormFourStep;
    `,

    fiveStep: `
${commonImports}

interface WizardFormFiveStepProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onComplete?: (formData: any) => void;
}

const WizardFormFiveStep: React.FC<WizardFormFiveStepProps> = ({ ${dataName}: propData, entity = '${dataSource || 'data'}', className, onComplete }) => {
  const queryClient = useQueryClient();

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>(\`${apiRoute}\`, data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      if (onComplete) onComplete(data);
      setCompleted(true);
    },
    onError: (err: any) => {
      console.error('Form submission error:', err);
    },
  });

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

  const wizardData = propData || fetchedData || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    username: '',
    password: '',
    notifications: false,
    newsletter: false
  });
  const [completed, setCompleted] = useState(false);

  const title = ${getField('title')};
  const step1Title = ${getField('step1Title')};
  const step2Title = ${getField('step2Title')};
  const step3Title = ${getField('step3Title')};
  const step4Title = ${getField('step4Title')};
  const step5Title = ${getField('step5Title')};
  const notificationsLabel = ${getField('notificationsLabel')};
  const newsletterLabel = ${getField('newsletterLabel')};
  const nextButtonText = ${getField('nextButtonText')};
  const previousButtonText = ${getField('previousButtonText')};
  const submitButtonText = ${getField('submitButtonText')};
  const successTitle = ${getField('successTitle')};

  const totalSteps = 5;
  const steps = [
    { number: 1, title: step1Title },
    { number: 2, title: step2Title },
    { number: 3, title: step3Title },
    { number: 4, title: step4Title },
    { number: 5, title: step5Title }
  ];

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  const handlePrevious = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    submitMutation.mutate(formData);
  };

  if (completed) {
    return (
      <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{successTitle}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h1>

          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: \`\${(currentStep / totalSteps) * 100}%\` }}
              />
            </div>
          </div>

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{step5Title}</h3>
              <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.notifications}
                  onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 dark:text-gray-300">{notificationsLabel}</span>
              </label>
              <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700 dark:text-gray-300">{newsletterLabel}</span>
              </label>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button onClick={handlePrevious} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                {previousButtonText}
              </button>
            )}
            <div className="ml-auto">
              {currentStep < totalSteps ? (
                <button onClick={handleNext} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
                  {nextButtonText}
                </button>
              ) : (
                <button onClick={handleSubmit} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all">
                  {submitButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardFormFiveStep;
    `
  };

  return variants[variant] || variants.threeStep;
};
