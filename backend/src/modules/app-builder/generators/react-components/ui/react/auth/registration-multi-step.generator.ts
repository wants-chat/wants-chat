import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRegistrationMultiStep = (
  resolved: ResolvedComponent,
  variant: 'threeStep' | 'fourStep' | 'withProgress' = 'threeStep'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
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

  // Parse data source for clean prop naming
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
    return `/${dataSource || 'auth'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'auth';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Play, ChevronRight, ChevronLeft, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    threeStep: `
${commonImports}

interface Step {
  id: number;
  title: string;
  description: string;
  fields: string[];
}

interface Field {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
}

interface RegistrationMultiStepProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: (data: any) => void;
}

const RegistrationMultiStepComponent: React.FC<RegistrationMultiStepProps> = ({
  ${dataName},
  className,
  onComplete
}) => {
  const registrationData = ${dataName} || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const logoText = ${getField('logoText')};
  const steps = ${getField('steps')};
  const accountFields = ${getField('accountFields')};
  const profileFields = ${getField('profileFields')};
  const preferencesFields = ${getField('preferencesFields')};
  const nextButtonText = ${getField('nextButtonText')};
  const previousButtonText = ${getField('previousButtonText')};
  const submitButtonText = ${getField('submitButtonText')};
  const haveAccountText = ${getField('haveAccountText')};
  const signInText = ${getField('signInText')};
  const termsText = ${getField('termsText')};
  const termsLinkText = ${getField('termsLinkText')};

  const getFieldsForStep = (step: number): Field[] => {
    switch (step) {
      case 1:
        return accountFields;
      case 2:
        return profileFields;
      case 3:
        return preferencesFields;
      default:
        return [];
    }
  };

  const validateStep = (step: number): boolean => {
    const fields = getFieldsForStep(step);
    const newErrors: { [key: string]: string } = {};

    fields.forEach((field: Field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = \`\${field.label} is required\`;
      }

      // Email validation
      if (field.name === 'email' && formData[field.name]) {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Please enter a valid email';
        }
      }

      // Password validation
      if (field.name === 'password' && formData[field.name]) {
        if (formData[field.name].length < 8) {
          newErrors[field.name] = 'Password must be at least 8 characters';
        }
      }

      // Confirm password validation
      if (field.name === 'confirmPassword' && formData[field.name]) {
        if (formData[field.name] !== formData['password']) {
          newErrors[field.name] = 'Passwords do not match';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mutation for registration submission
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${apiRoute}/register', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      onComplete?.(data);
    },
    onError: (error: any) => {
      setErrors({ terms: error?.message || 'Registration failed. Please try again.' });
    },
  });

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (validateStep(currentStep) && agreeToTerms) {
      submitMutation.mutate(formData);
    } else if (!agreeToTerms) {
      setErrors({ terms: 'You must agree to the terms and conditions' });
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData({ ...formData, [fieldName]: value });
    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
  };

  const handleSignIn = () => {
    console.log('Sign in clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{logoText}</span>
    </div>
  );

  const currentFields = getFieldsForStep(currentStep);

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-2xl">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 lg:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step: Step) => (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      currentStep > step.id
                        ? "bg-blue-600 border-blue-600"
                        : currentStep === step.id
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    )}>
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <span className={cn(
                          "text-sm font-semibold",
                          currentStep === step.id
                            ? "text-blue-600"
                            : "text-gray-400"
                        )}>
                          {step.id}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={cn(
                        "text-sm font-medium",
                        currentStep >= step.id
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-400"
                      )}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {step.id < steps.length && (
                    <div className={cn(
                      "flex-1 h-0.5 mx-2",
                      currentStep > step.id
                        ? "bg-blue-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            {currentFields.map((field: Field) => (
              <div key={field.name}>
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className={cn(
                    "mt-1 h-11",
                    errors[field.name] && "border-red-500"
                  )}
                />
                {errors[field.name] && (
                  <p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Terms and Conditions (Last Step) */}
          {currentStep === 3 && (
            <div className="mb-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                  {termsText}{' '}
                  <a href="#" className="text-blue-600 hover:underline">{termsLinkText}</a>
                </Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-500 mt-1">{errors.terms}</p>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {previousButtonText}
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                className={cn(
                  "h-11 bg-blue-600 hover:bg-blue-700",
                  currentStep === 1 ? "flex-1" : "flex-1"
                )}
                onClick={handleNext}
              >
                {nextButtonText}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
              >
                {submitButtonText}
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {haveAccountText}{' '}
            <button
              className="text-blue-600 dark:text-blue-400 hover:underline"
              onClick={handleSignIn}
            >
              {signInText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationMultiStepComponent;
    `,

    fourStep: `
${commonImports}

interface Step {
  id: number;
  title: string;
  description: string;
  fields: string[];
}

interface Field {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
}

interface RegistrationMultiStepProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: (data: any) => void;
}

const RegistrationMultiStepComponent: React.FC<RegistrationMultiStepProps> = ({
  ${dataName},
  className,
  onComplete
}) => {
  const registrationData = ${dataName} || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const logoText = ${getField('logoText')};
  const accountFields = ${getField('accountFields')};
  const profileFields = ${getField('profileFields')};
  const preferencesFields = ${getField('preferencesFields')};
  const nextButtonText = ${getField('nextButtonText')};
  const previousButtonText = ${getField('previousButtonText')};
  const submitButtonText = ${getField('submitButtonText')};
  const haveAccountText = ${getField('haveAccountText')};
  const signInText = ${getField('signInText')};
  const termsText = ${getField('termsText')};
  const termsLinkText = ${getField('termsLinkText')};

  // Four-step configuration
  const steps = [
    { id: 1, title: 'Email', description: 'Your email address', fields: ['email'] },
    { id: 2, title: 'Password', description: 'Create password', fields: ['password', 'confirmPassword'] },
    { id: 3, title: 'Profile', description: 'Your details', fields: ['firstName', 'lastName', 'phone'] },
    { id: 4, title: 'Finish', description: 'Almost done', fields: ['company', 'role'] }
  ];

  const getFieldsForStep = (step: number): Field[] => {
    switch (step) {
      case 1:
        return [accountFields[0]]; // email only
      case 2:
        return [accountFields[1], accountFields[2]]; // password fields
      case 3:
        return profileFields;
      case 4:
        return [preferencesFields[0], preferencesFields[1]]; // company and role
      default:
        return [];
    }
  };

  const validateStep = (step: number): boolean => {
    const fields = getFieldsForStep(step);
    const newErrors: { [key: string]: string } = {};

    fields.forEach((field: Field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = \`\${field.label} is required\`;
      }

      if (field.name === 'email' && formData[field.name]) {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Please enter a valid email';
        }
      }

      if (field.name === 'password' && formData[field.name]) {
        if (formData[field.name].length < 8) {
          newErrors[field.name] = 'Password must be at least 8 characters';
        }
      }

      if (field.name === 'confirmPassword' && formData[field.name]) {
        if (formData[field.name] !== formData['password']) {
          newErrors[field.name] = 'Passwords do not match';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mutation for registration submission
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${apiRoute}/register', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      onComplete?.(data);
    },
    onError: (error: any) => {
      setErrors({ terms: error?.message || 'Registration failed. Please try again.' });
    },
  });

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (validateStep(currentStep) && agreeToTerms) {
      submitMutation.mutate(formData);
    } else if (!agreeToTerms) {
      setErrors({ terms: 'You must agree to the terms and conditions' });
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData({ ...formData, [fieldName]: value });
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
  };

  const handleSignIn = () => {
    console.log('Sign in clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{logoText}</span>
    </div>
  );

  const currentFields = getFieldsForStep(currentStep);
  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              Step {currentStep} of 4
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-6">
            {currentFields.map((field: Field) => (
              <div key={field.name}>
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className={cn(
                    "mt-1 h-11",
                    errors[field.name] && "border-red-500"
                  )}
                  autoFocus
                />
                {errors[field.name] && (
                  <p className="text-sm text-red-500 mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Terms and Conditions (Last Step) */}
          {currentStep === 4 && (
            <div className="mb-6">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                  {termsText}{' '}
                  <a href="#" className="text-blue-600 hover:underline">{termsLinkText}</a>
                </Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-500 mt-1">{errors.terms}</p>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {previousButtonText}
              </Button>
            )}

            {currentStep < 4 ? (
              <Button
                className={cn(
                  "h-11 bg-blue-600 hover:bg-blue-700",
                  currentStep === 1 ? "w-full" : "flex-1"
                )}
                onClick={handleNext}
              >
                {nextButtonText}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmit}
              >
                {submitButtonText}
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {haveAccountText}{' '}
            <button
              className="text-blue-600 dark:text-blue-400 hover:underline"
              onClick={handleSignIn}
            >
              {signInText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationMultiStepComponent;
    `,

    withProgress: `
${commonImports}

interface Step {
  id: number;
  title: string;
  description: string;
  fields: string[];
}

interface Field {
  name: string;
  label: string;
  placeholder: string;
  type: string;
  required: boolean;
}

interface RegistrationMultiStepProps {
  ${dataName}?: any;
  className?: string;
  onComplete?: (data: any) => void;
}

const RegistrationMultiStepComponent: React.FC<RegistrationMultiStepProps> = ({
  ${dataName},
  className,
  onComplete
}) => {
  const registrationData = ${dataName} || {};

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const logoText = ${getField('logoText')};
  const steps = ${getField('steps')};
  const accountFields = ${getField('accountFields')};
  const profileFields = ${getField('profileFields')};
  const preferencesFields = ${getField('preferencesFields')};
  const nextButtonText = ${getField('nextButtonText')};
  const previousButtonText = ${getField('previousButtonText')};
  const submitButtonText = ${getField('submitButtonText')};
  const haveAccountText = ${getField('haveAccountText')};
  const signInText = ${getField('signInText')};
  const termsText = ${getField('termsText')};
  const termsLinkText = ${getField('termsLinkText')};

  const getFieldsForStep = (step: number): Field[] => {
    switch (step) {
      case 1:
        return accountFields;
      case 2:
        return profileFields;
      case 3:
        return preferencesFields;
      default:
        return [];
    }
  };

  const validateStep = (step: number): boolean => {
    const fields = getFieldsForStep(step);
    const newErrors: { [key: string]: string } = {};

    fields.forEach((field: Field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = \`\${field.label} is required\`;
      }

      if (field.name === 'email' && formData[field.name]) {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Please enter a valid email';
        }
      }

      if (field.name === 'password' && formData[field.name]) {
        if (formData[field.name].length < 8) {
          newErrors[field.name] = 'Password must be at least 8 characters';
        }
      }

      if (field.name === 'confirmPassword' && formData[field.name]) {
        if (formData[field.name] !== formData['password']) {
          newErrors[field.name] = 'Passwords do not match';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mutation for registration submission
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${apiRoute}/register', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      onComplete?.(data);
    },
    onError: (error: any) => {
      setErrors({ terms: error?.message || 'Registration failed. Please try again.' });
    },
  });

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (validateStep(currentStep) && agreeToTerms) {
      submitMutation.mutate(formData);
    } else if (!agreeToTerms) {
      setErrors({ terms: 'You must agree to the terms and conditions' });
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData({ ...formData, [fieldName]: value });
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
  };

  const handleSignIn = () => {
    console.log('Sign in clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{logoText}</span>
    </div>
  );

  const currentFields = getFieldsForStep(currentStep);
  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-4xl">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Sidebar - Progress */}
            <div className="lg:w-1/3 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">{title}</h2>
              <p className="text-blue-100 mb-8">{subtitle}</p>

              <div className="space-y-6">
                {steps.map((step: Step) => (
                  <div key={step.id} className="flex items-start space-x-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all",
                      currentStep > step.id
                        ? "bg-white border-white"
                        : currentStep === step.id
                        ? "border-white bg-blue-500"
                        : "border-blue-400 bg-transparent"
                    )}>
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5 text-blue-600" />
                      ) : (
                        <span className={cn(
                          "text-sm font-bold",
                          currentStep === step.id ? "text-white" : "text-blue-200"
                        )}>
                          {step.id}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={cn(
                        "font-semibold mb-1",
                        currentStep >= step.id ? "text-white" : "text-blue-200"
                      )}>
                        {step.title}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        currentStep >= step.id ? "text-blue-100" : "text-blue-300"
                      )}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="flex justify-between text-sm text-blue-100 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 bg-blue-500 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300 ease-in-out"
                    style={{ width: \`\${progressPercentage}%\` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="lg:w-2/3 p-8 lg:p-12">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {steps[currentStep - 1]?.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {steps[currentStep - 1]?.description}
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-5 mb-8">
                {currentFields.map((field: Field) => (
                  <div key={field.name}>
                    <Label htmlFor={field.name} className="text-base">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      className={cn(
                        "mt-1.5 h-12",
                        errors[field.name] && "border-red-500"
                      )}
                    />
                    {errors[field.name] && (
                      <p className="text-sm text-red-500 mt-1.5">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Terms and Conditions (Last Step) */}
              {currentStep === 3 && (
                <div className="mb-8">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                      {termsText}{' '}
                      <a href="#" className="text-blue-600 hover:underline">{termsLinkText}</a>
                    </Label>
                  </div>
                  {errors.terms && (
                    <p className="text-sm text-red-500 mt-1.5">{errors.terms}</p>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    {previousButtonText}
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    className={cn(
                      "h-12 bg-blue-600 hover:bg-blue-700",
                      currentStep === 1 ? "w-full" : "flex-1"
                    )}
                    onClick={handleNext}
                  >
                    {nextButtonText}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                    onClick={handleSubmit}
                  >
                    {submitButtonText}
                  </Button>
                )}
              </div>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                {haveAccountText}{' '}
                <button
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  onClick={handleSignIn}
                >
                  {signInText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationMultiStepComponent;
    `
  };

  return variants[variant] || variants.threeStep;
};
