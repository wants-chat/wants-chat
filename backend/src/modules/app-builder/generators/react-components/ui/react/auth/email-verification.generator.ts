import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateEmailVerification = (
  resolved: ResolvedComponent,
  variant: 'pending' | 'success' | 'error' = 'pending'
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
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Play, Mail, CheckCircle, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    pending: `
${commonImports}

interface EmailVerificationProps {
  ${dataName}?: any;
  email?: string;
  className?: string;
  onResend?: () => void;
  onChangeEmail?: () => void;
}

const EmailVerificationComponent: React.FC<EmailVerificationProps> = ({
  ${dataName},
  email = 'user@example.com',
  className,
  onResend,
  onChangeEmail
}) => {
  const verificationData = ${dataName} || {};

  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const pendingTitle = ${getField('pendingTitle')};
  const pendingSubtitle = ${getField('pendingSubtitle')};
  const checkInboxMessage = ${getField('checkInboxMessage')};
  const resendText = ${getField('resendText')};
  const resendButtonText = ${getField('resendButtonText')};
  const resendingText = ${getField('resendingText')};
  const changeEmailText = ${getField('changeEmailText')};
  const resendTimerText = ${getField('resendTimerText')};
  const resendTimerSeconds = ${getField('resendTimerSeconds')};
  const emailSentMessage = ${getField('emailSentMessage')};
  const logoText = ${getField('logoText')};

  useEffect(() => {
    // Start initial countdown
    setResendTimer(resendTimerSeconds);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResend = async () => {
    setIsResending(true);
    console.log('Resending verification email to:', email);

    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      setResendTimer(resendTimerSeconds);
      setShowSuccessMessage(true);
      onResend?.();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }, 1000);
  };

  const handleChangeEmail = () => {
    console.log('Change email clicked');
    onChangeEmail?.();
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{logoText}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {pendingTitle}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {pendingSubtitle}
          </p>

          <p className="text-blue-600 dark:text-blue-400 font-medium text-lg mb-6">
            {email}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {checkInboxMessage}
            </p>
          </div>

          {showSuccessMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-sm text-green-600 dark:text-green-400">
                {emailSentMessage}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {resendText}
              </p>

              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {resendTimerText} {resendTimer}s
                </p>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleResend}
                  disabled={isResending}
                >
                  <RefreshCw className={cn("w-4 h-4 mr-2", isResending && "animate-spin")} />
                  {isResending ? resendingText : resendButtonText}
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full h-11"
              onClick={handleChangeEmail}
            >
              {changeEmailText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationComponent;
    `,

    success: `
${commonImports}

interface EmailVerificationProps {
  ${dataName}?: any;
  className?: string;
  onContinue?: () => void;
  onBackToLogin?: () => void;
}

const EmailVerificationComponent: React.FC<EmailVerificationProps> = ({
  ${dataName},
  className,
  onContinue,
  onBackToLogin
}) => {
  const verificationData = ${dataName} || {};

  const successTitle = ${getField('successTitle')};
  const successSubtitle = ${getField('successSubtitle')};
  const successMessage = ${getField('successMessage')};
  const continueButtonText = ${getField('continueButtonText')};
  const backToLoginText = ${getField('backToLoginText')};
  const logoText = ${getField('logoText')};

  const handleContinue = () => {
    console.log('Continue to dashboard clicked');
    onContinue?.();
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

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {successTitle}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {successSubtitle}
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            {successMessage}
          </p>

          <div className="space-y-3">
            <Button
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              onClick={handleContinue}
            >
              {continueButtonText}
            </Button>

            <Button
              variant="ghost"
              className="w-full h-11"
              onClick={handleBackToLogin}
            >
              {backToLoginText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationComponent;
    `,

    error: `
${commonImports}

interface EmailVerificationProps {
  ${dataName}?: any;
  errorType?: 'expired' | 'invalid';
  className?: string;
  onRequestNewLink?: () => void;
  onBackToLogin?: () => void;
}

const EmailVerificationComponent: React.FC<EmailVerificationProps> = ({
  ${dataName},
  errorType = 'expired',
  className,
  onRequestNewLink,
  onBackToLogin
}) => {
  const verificationData = ${dataName} || {};

  const errorTitle = ${getField('errorTitle')};
  const errorSubtitle = ${getField('errorSubtitle')};
  const linkExpiredMessage = ${getField('linkExpiredMessage')};
  const linkInvalidMessage = ${getField('linkInvalidMessage')};
  const tryAgainMessage = ${getField('tryAgainMessage')};
  const requestNewLinkText = ${getField('requestNewLinkText')};
  const backToLoginText = ${getField('backToLoginText')};
  const logoText = ${getField('logoText')};

  const [isRequesting, setIsRequesting] = useState(false);

  const errorMessage = errorType === 'expired' ? linkExpiredMessage : linkInvalidMessage;

  const handleRequestNewLink = async () => {
    setIsRequesting(true);
    console.log('Requesting new verification link');

    // Simulate API call
    setTimeout(() => {
      setIsRequesting(false);
      onRequestNewLink?.();
    }, 1000);
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

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {errorTitle}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {errorSubtitle}
          </p>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
              {errorMessage}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tryAgainMessage}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              onClick={handleRequestNewLink}
              disabled={isRequesting}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRequesting && "animate-spin")} />
              {isRequesting ? 'Sending...' : requestNewLinkText}
            </Button>

            <Button
              variant="ghost"
              className="w-full h-11"
              onClick={handleBackToLogin}
            >
              {backToLoginText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationComponent;
    `
  };

  return variants[variant] || variants.pending;
};
