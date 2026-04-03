import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateLoginModal = (
  resolved: ResolvedComponent,
  variant: 'small' | 'medium' | 'withSocial' = 'medium'
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    small: `
${commonImports}

interface LoginModalProps {
  ${dataName}?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
}

const LoginModalComponent: React.FC<LoginModalProps> = ({
  ${dataName},
  isOpen,
  onClose,
  onSuccess,
  className
}) => {
  const sourceData = ${dataName} || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const title = ${getField('modalTitle')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const rememberMeText = ${getField('rememberMeText')};
  const forgotPasswordText = ${getField('forgotPasswordText')};
  const signInButtonText = ${getField('signInButtonText')};
  const noAccountText = ${getField('noAccountText')};
  const signUpText = ${getField('signUpText')};

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    console.log('Sign in clicked', { email, password, rememberMe });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.();
      onClose();
    }, 1000);
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{title}</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <Label htmlFor="email">{emailLabel}</Label>
            <Input
              id="email"
              type="email"
              placeholder={emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-10"
            />
          </div>

          <div>
            <Label htmlFor="password">{passwordLabel}</Label>
            <Input
              id="password"
              type="password"
              placeholder={passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-10"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                {rememberMeText}
              </Label>
            </div>
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={handleForgotPassword}
            >
              {forgotPasswordText}
            </button>
          </div>

          <Button
            className="w-full h-10 bg-blue-600 hover:bg-blue-700"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : signInButtonText}
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {noAccountText}{' '}
            <button
              className="text-blue-600 dark:text-blue-400 hover:underline"
              onClick={handleSignUp}
            >{signUpText}</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModalComponent;
    `,

    medium: `
${commonImports}

interface LoginModalProps {
  ${dataName}?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
}

const LoginModalComponent: React.FC<LoginModalProps> = ({
  ${dataName},
  isOpen,
  onClose,
  onSuccess,
  className
}) => {
  const sourceData = ${dataName} || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const title = ${getField('title')};
  const logoText = ${getField('logoText')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const rememberMeText = ${getField('rememberMeText')};
  const forgotPasswordText = ${getField('forgotPasswordText')};
  const signInButtonText = ${getField('signInButtonText')};
  const noAccountText = ${getField('noAccountText')};
  const signUpText = ${getField('signUpText')};

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    console.log('Sign in clicked', { email, password, rememberMe });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.();
      onClose();
    }, 1000);
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-4 h-4 text-white fill-white" />
      </div>
      <span className="text-2xl font-bold text-gray-900 dark:text-white">{logoText}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-lg", className)}>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="pt-6">
          <FluxezLogo />

          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            {title}
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-11"
              />
            </div>

            <div>
              <Label htmlFor="password">{passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                placeholder={passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-11"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  {rememberMeText}
                </Label>
              </div>
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={handleForgotPassword}
              >
                {forgotPasswordText}
              </button>
            </div>

            <Button
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : signInButtonText}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {noAccountText}{' '}
              <button
                className="text-blue-600 dark:text-blue-400 hover:underline"
                onClick={handleSignUp}
              >{signUpText}</button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModalComponent;
    `,

    withSocial: `
${commonImports}

interface SocialButton {
  provider: string;
  name: string;
  icon: string;
  color: string;
}

interface LoginModalProps {
  ${dataName}?: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
}

const LoginModalComponent: React.FC<LoginModalProps> = ({
  ${dataName},
  isOpen,
  onClose,
  onSuccess,
  className
}) => {
  const sourceData = ${dataName} || {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const title = ${getField('title')};
  const logoText = ${getField('logoText')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const rememberMeText = ${getField('rememberMeText')};
  const forgotPasswordText = ${getField('forgotPasswordText')};
  const signInButtonText = ${getField('signInButtonText')};
  const noAccountText = ${getField('noAccountText')};
  const signUpText = ${getField('signUpText')};
  const socialButtons = ${getField('socialButtons')};

  const handleSocialLogin = (provider: string) => {
    console.log(\`\${provider} login clicked\`);
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    console.log('Sign in clicked', { email, password, rememberMe });

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.();
      onClose();
    }, 1000);
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-4 h-4 text-white fill-white" />
      </div>
      <span className="text-2xl font-bold text-gray-900 dark:text-white">{logoText}</span>
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
        <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      github: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    };
    return icons[icon] || null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-lg", className)}>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="pt-6">
          <FluxezLogo />

          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            {title}
          </h2>

          <div className="space-y-3 mb-6">
            {socialButtons.map((button: SocialButton) => (
              <Button
                key={button.provider}
                variant="outline"
                className="w-full h-11 justify-start"
                onClick={() => handleSocialLogin(button.provider)}
              >
                <SocialIcon icon={button.icon} />
                <span className="ml-3">Continue with {button.name}</span>
              </Button>
            ))}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-11"
              />
            </div>

            <div>
              <Label htmlFor="password">{passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                placeholder={passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-11"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  {rememberMeText}
                </Label>
              </div>
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={handleForgotPassword}
              >
                {forgotPasswordText}
              </button>
            </div>

            <Button
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              onClick={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : signInButtonText}
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {noAccountText}{' '}
              <button
                className="text-blue-600 dark:text-blue-400 hover:underline"
                onClick={handleSignUp}
              >{signUpText}</button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModalComponent;
    `
  };

  return variants[variant] || variants.medium;
};
