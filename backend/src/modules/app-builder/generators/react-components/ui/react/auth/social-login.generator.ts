import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSocialLogin = (
  resolved: ResolvedComponent,
  variant: 'buttons' | 'icons' | 'compact' = 'buttons'
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
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Play, Mail, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    buttons: `
${commonImports}

interface Provider {
  id: string;
  name: string;
  color: string;
  textColor: string;
  icon: string;
}

interface SocialLoginProps {
  ${dataName}?: any;
  className?: string;
  onSuccess?: (provider: string) => void;
  onEmailLogin?: () => void;
  onSignUp?: () => void;
}

const SocialLoginComponent: React.FC<SocialLoginProps> = ({
  ${dataName},
  className,
  onSuccess,
  onEmailLogin,
  onSignUp
}) => {
  const socialData = ${dataName} || {};

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const logoText = ${getField('logoText')};
  const providers = ${getField('providers')};
  const orText = ${getField('orText')};
  const emailLoginText = ${getField('emailLoginText')};
  const noAccountText = ${getField('noAccountText')};
  const signUpText = ${getField('signUpText')};
  const privacyText = ${getField('privacyText')};
  const termsText = ${getField('termsText')};
  const andText = ${getField('andText')};
  const privacyPolicyText = ${getField('privacyPolicyText')};
  const linkAccountTitle = ${getField('linkAccountTitle')};
  const linkAccountMessage = ${getField('linkAccountMessage')};
  const linkButtonText = ${getField('linkButtonText')};
  const cancelButtonText = ${getField('cancelButtonText')};

  const handleSocialLogin = (providerId: string) => {
    setIsLoading(providerId);
    console.log(\`Initiating \${providerId} OAuth flow\`);

    // Simulate OAuth flow
    setTimeout(() => {
      setIsLoading(null);

      // Simulate account linking scenario (10% chance)
      if (Math.random() < 0.1) {
        setPendingProvider(providerId);
        setShowLinkDialog(true);
      } else {
        onSuccess?.(providerId);
      }
    }, 1500);
  };

  const handleLinkAccount = () => {
    console.log(\`Linking account with \${pendingProvider}\`);
    setShowLinkDialog(false);
    onSuccess?.(pendingProvider!);
    setPendingProvider(null);
  };

  const handleEmailLogin = () => {
    console.log('Email login clicked');
    onEmailLogin?.();
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
    onSignUp?.();
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{logoText}</span>
    </div>
  );

  const SocialIcon = ({ icon }: { icon: string }) => {
    const icons: { [key: string]: React.ReactNode } = {
      google: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      facebook: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      github: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      apple: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      ),
      microsoft: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#f25022" d="M0 0h11.377v11.372H0z"/>
          <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z"/>
          <path fill="#7fba00" d="M0 12.623h11.377V24H0z"/>
          <path fill="#ffb900" d="M12.623 12.623H24V24H12.623z"/>
        </svg>
      ),
      twitter: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    };
    return icons[icon] || null;
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            {providers.map((provider: Provider) => (
              <Button
                key={provider.id}
                variant="outline"
                className="w-full h-12 justify-start"
                onClick={() => handleSocialLogin(provider.id)}
                disabled={isLoading === provider.id}
              >
                <SocialIcon icon={provider.icon} />
                <span className="ml-3">
                  {isLoading === provider.id ? 'Connecting...' : \`Continue with \${provider.name}\`}
                </span>
              </Button>
            ))}
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {orText}
              </span>
            </div>
          </div>

          {/* Email Login */}
          <Button
            variant="outline"
            className="w-full h-12 mb-6"
            onClick={handleEmailLogin}
          >
            <Mail className="w-5 h-5 mr-3" />
            {emailLoginText}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
            {noAccountText}{' '}
            <button
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              onClick={handleSignUp}
            >
              {signUpText}
            </button>
          </div>

          {/* Privacy Notice */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-500">
            {privacyText}{' '}
            <a href="#" className="text-blue-600 hover:underline">{termsText}</a>
            {' '}{andText}{' '}
            <a href="#" className="text-blue-600 hover:underline">{privacyPolicyText}</a>
          </p>
        </div>

        {/* Account Linking Dialog */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{linkAccountTitle}</DialogTitle>
              <DialogDescription>{linkAccountMessage}</DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowLinkDialog(false)}
              >
                {cancelButtonText}
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleLinkAccount}
              >
                {linkButtonText}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SocialLoginComponent;
    `,

    icons: `
${commonImports}

interface Provider {
  id: string;
  name: string;
  color: string;
  textColor: string;
  icon: string;
}

interface SocialLoginProps {
  ${dataName}?: any;
  className?: string;
  onSuccess?: (provider: string) => void;
}

const SocialLoginComponent: React.FC<SocialLoginProps> = ({
  ${dataName},
  className,
  onSuccess
}) => {
  const socialData = ${dataName} || {};

  const [isLoading, setIsLoading] = useState<string | null>(null);

  const title = ${getField('title')};
  const providers = ${getField('providers')};
  const logoText = ${getField('logoText')};

  const handleSocialLogin = (providerId: string) => {
    setIsLoading(providerId);
    console.log(\`Initiating \${providerId} OAuth flow\`);

    setTimeout(() => {
      setIsLoading(null);
      onSuccess?.(providerId);
    }, 1500);
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{logoText}</span>
    </div>
  );

  const SocialIcon = ({ icon, color }: { icon: string; color: string }) => {
    const icons: { [key: string]: React.ReactNode } = {
      google: (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      facebook: (
        <svg className="w-6 h-6" fill={color} viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      github: (
        <svg className="w-6 h-6" fill={color} viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      apple: (
        <svg className="w-6 h-6" fill={color} viewBox="0 0 24 24">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      ),
      microsoft: (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path fill="#f25022" d="M0 0h11.377v11.372H0z"/>
          <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z"/>
          <path fill="#7fba00" d="M0 12.623h11.377V24H0z"/>
          <path fill="#ffb900" d="M12.623 12.623H24V24H12.623z"/>
        </svg>
      ),
      twitter: (
        <svg className="w-6 h-6" fill={color} viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      )
    };
    return icons[icon] || null;
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            {title}
          </h1>

          {/* Icon Grid */}
          <div className="grid grid-cols-3 gap-4">
            {providers.map((provider: Provider) => (
              <button
                key={provider.id}
                onClick={() => handleSocialLogin(provider.id)}
                disabled={isLoading === provider.id}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors",
                  isLoading === provider.id && "opacity-50 cursor-not-allowed"
                )}
                style={{
                  backgroundColor: isLoading === provider.id ? provider.color + '20' : 'transparent'
                }}
              >
                <SocialIcon icon={provider.icon} color={provider.color} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2">
                  {provider.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLoginComponent;
    `,

    compact: `
${commonImports}

interface Provider {
  id: string;
  name: string;
  color: string;
  textColor: string;
  icon: string;
}

interface SocialLoginProps {
  ${dataName}?: any;
  className?: string;
  onSuccess?: (provider: string) => void;
}

const SocialLoginComponent: React.FC<SocialLoginProps> = ({
  ${dataName},
  className,
  onSuccess
}) => {
  const socialData = ${dataName} || {};

  const [isLoading, setIsLoading] = useState<string | null>(null);

  const orContinueWith = ${getField('orContinueWith')};
  const providers = ${getField('providers')}.slice(0, 4); // Only show first 4 providers

  const handleSocialLogin = (providerId: string) => {
    setIsLoading(providerId);
    console.log(\`Initiating \${providerId} OAuth flow\`);

    setTimeout(() => {
      setIsLoading(null);
      onSuccess?.(providerId);
    }, 1500);
  };

  const SocialIcon = ({ icon, color }: { icon: string; color: string }) => {
    const icons: { [key: string]: React.ReactNode } = {
      google: (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      facebook: (
        <svg className="w-5 h-5" fill={color} viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      github: (
        <svg className="w-5 h-5" fill={color} viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      apple: (
        <svg className="w-5 h-5" fill={color} viewBox="0 0 24 24">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      )
    };
    return icons[icon] || null;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {orContinueWith}
          </span>
        </div>
      </div>

      {/* Compact Social Buttons */}
      <div className="flex gap-3 justify-center">
        {providers.map((provider: Provider) => (
          <button
            key={provider.id}
            onClick={() => handleSocialLogin(provider.id)}
            disabled={isLoading === provider.id}
            className={cn(
              "w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors flex items-center justify-center",
              isLoading === provider.id && "opacity-50 cursor-not-allowed"
            )}
            title={\`Sign in with \${provider.name}\`}
          >
            <SocialIcon icon={provider.icon} color={provider.color} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialLoginComponent;
    `
  };

  return variants[variant] || variants.buttons;
};
