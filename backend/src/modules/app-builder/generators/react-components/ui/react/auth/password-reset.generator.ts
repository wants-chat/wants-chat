import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePasswordReset = (
  resolved: ResolvedComponent,
  variant: 'request' | 'confirmation' = 'request'
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
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, ArrowLeft, Check, X, Mail, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    request: `
${commonImports}

interface PasswordResetProps {
  ${dataName}?: any;
  className?: string;
  onSuccess?: (email: string) => void;
  onBackToLogin?: () => void;
}

const PasswordResetComponent: React.FC<PasswordResetProps> = ({
  ${dataName},
  className,
  onSuccess,
  onBackToLogin
}) => {
  const resetData = ${dataName} || {};

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const requestTitle = ${getField('requestTitle')};
  const requestSubtitle = ${getField('requestSubtitle')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const sendButtonText = ${getField('sendButtonText')};
  const backToLoginText = ${getField('backToLoginText')};
  const successTitle = ${getField('successTitle')};
  const successMessage = ${getField('successMessage')};
  const resendText = ${getField('resendText')};
  const resendButtonText = ${getField('resendButtonText')};
  const resendTimerText = ${getField('resendTimerText')};
  const resendTimerSeconds = ${getField('resendTimerSeconds')};
  const logoText = ${getField('logoText')};

  // Mutation for password reset request
  const submitMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await api.post<any>('${apiRoute}/password-reset', data);
      return response?.data || response;
    },
    onSuccess: () => {
      setIsSuccess(true);
      setResendTimer(resendTimerSeconds);
      onSuccess?.(email);
    },
    onError: (error: any) => {
      setError(error?.message || 'Failed to send reset email. Please try again.');
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setError('');
    submitMutation.mutate({ email });
  };

  const handleResend = () => {
    if (resendTimer === 0) {
      console.log('Resending password reset email to:', email);
      setResendTimer(resendTimerSeconds);
    }
  };

  const handleBackToLogin = () => {
    console.log('Back to login clicked');
    onBackToLogin?.();
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{logoText}</span>
    </div>
  );

  if (isSuccess) {
    return (
      <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
        <div className="w-full max-w-md">
          <FluxezLogo />

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 lg:p-10 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {successTitle}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {successMessage}
            </p>

            <p className="text-blue-600 dark:text-blue-400 font-medium mb-6">
              {email}
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {resendText}
              </p>
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {resendTimerText} {resendTimer}s
                </p>
              ) : (
                <Button
                  variant="link"
                  className="mt-2 text-blue-600 dark:text-blue-400"
                  onClick={handleResend}
                >
                  {resendButtonText}
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full h-11"
              onClick={handleBackToLogin}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backToLoginText}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 lg:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {requestTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {requestSubtitle}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="email">{emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={cn(
                  "mt-1 h-11",
                  error && "border-red-500"
                )}
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
          </div>

          <Button
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 mb-4"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : sendButtonText}
          </Button>

          <Button
            variant="ghost"
            className="w-full h-11"
            onClick={handleBackToLogin}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backToLoginText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetComponent;
    `,

    confirmation: `
${commonImports}

interface Requirement {
  text: string;
  regex: RegExp;
}

interface PasswordResetProps {
  ${dataName}?: any;
  className?: string;
  token?: string;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

const PasswordResetComponent: React.FC<PasswordResetProps> = ({
  ${dataName},
  className,
  token,
  onSuccess,
  onBackToLogin
}) => {
  const resetData = ${dataName} || {};

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const confirmationTitle = ${getField('confirmationTitle')};
  const confirmationSubtitle = ${getField('confirmationSubtitle')};
  const newPasswordLabel = ${getField('newPasswordLabel')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const resetButtonText = ${getField('resetButtonText')};
  const backToLoginText = ${getField('backToLoginText')};
  const requirements = ${getField('requirements')};
  const tokenValidationMessage = ${getField('tokenValidationMessage')};
  const tokenExpiredMessage = ${getField('tokenExpiredMessage')};
  const logoText = ${getField('logoText')};

  // Mutation for password reset confirmation
  const submitMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const response = await api.post<any>('${apiRoute}/password-reset/confirm', data);
      return response?.data || response;
    },
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: any) => {
      setErrors({ newPassword: error?.message || 'Failed to reset password. Please try again.' });
    },
  });

  useEffect(() => {
    // Simulate token validation
    setTimeout(() => {
      console.log('Validating token:', token);
      setIsValidatingToken(false);
      setIsTokenValid(true); // In real app, validate against backend
    }, 1000);
  }, [token]);

  const checkRequirement = (requirement: Requirement): boolean => {
    return requirement.regex.test(newPassword);
  };

  const validatePasswords = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else {
      const allRequirementsMet = requirements.every((req: Requirement) =>
        checkRequirement(req)
      );
      if (!allRequirementsMet) {
        newErrors.newPassword = 'Password does not meet requirements';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validatePasswords()) return;

    submitMutation.mutate({ token: token || '', newPassword });
  };

  const handleBackToLogin = () => {
    console.log('Back to login clicked');
    onBackToLogin?.();
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{logoText}</span>
    </div>
  );

  if (isValidatingToken) {
    return (
      <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">{tokenValidationMessage}</p>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
        <div className="w-full max-w-md">
          <FluxezLogo />

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {tokenExpiredMessage}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please request a new password reset link
            </p>

            <Button
              variant="outline"
              className="w-full h-11"
              onClick={handleBackToLogin}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backToLoginText}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 lg:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {confirmationTitle}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {confirmationSubtitle}
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <Label htmlFor="newPassword">{newPasswordLabel}</Label>
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder={passwordPlaceholder}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: '' });
                  }
                }}
                className={cn(
                  "mt-1 h-11",
                  errors.newPassword && "border-red-500"
                )}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            {newPassword && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Password requirements:
                </p>
                <div className="space-y-2">
                  {requirements.map((req: Requirement, index: number) => {
                    const isMet = checkRequirement(req);
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center",
                          isMet
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        )}>
                          {isMet && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={cn(
                          "text-sm",
                          isMet
                            ? "text-green-600 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-400"
                        )}>
                          {req.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="confirmPassword">{confirmPasswordLabel}</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder={passwordPlaceholder}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: '' });
                  }
                }}
                className={cn(
                  "mt-1 h-11",
                  errors.confirmPassword && "border-red-500"
                )}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="showPassword" className="text-sm cursor-pointer">
                Show password
              </Label>
            </div>
          </div>

          <Button
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 mb-4"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : resetButtonText}
          </Button>

          <Button
            variant="ghost"
            className="w-full h-11"
            onClick={handleBackToLogin}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backToLoginText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetComponent;
    `
  };

  return variants[variant] || variants.request;
};
