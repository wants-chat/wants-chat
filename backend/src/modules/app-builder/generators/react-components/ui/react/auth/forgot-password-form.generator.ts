import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateForgotPasswordForm = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'withFeatures' | 'withHero' | 'withImage' = 'simple'
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
    return `/${dataSource || 'auth'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'auth';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';`;

  const variants = {
    simple: `
${commonImports}

interface ForgotPasswordProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ ${dataName}, className }) => {
  const [email, setEmail] = useState('');

  const forgotPasswordData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const emailLabel = ${getField('emailLabelAlt')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const resetPasswordButton = ${getField('resetPasswordButton')};
  const backToLoginButton = ${getField('backToLoginButton')};

  // Mutation for password reset
  const resetMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await api.post<any>('${apiRoute}/forgot-password', data);
      return response?.data || response;
    },
    onSuccess: () => {
      alert('Password reset link sent! Check your email.');
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to send reset link. Please try again.');
    },
  });

  const handleResetPassword = () => {
    if (email) {
      resetMutation.mutate({ email });
    }
  };

  const handleBackToLogin = () => {
    console.log('Back to login clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-12">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold text-gray-900 dark:text-white">{brandName}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 lg:p-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            {mainTitle}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
            {mainDescription}
          </p>

          <div className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-base font-medium">
                {emailLabel}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-12 text-base"
              />
            </div>

            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-medium"
              onClick={handleResetPassword}
            >
              {resetPasswordButton}
            </Button>

            <div className="text-center">
              <button
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium inline-flex items-center"
                onClick={handleBackToLogin}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {backToLoginButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
    `,

    withFeatures: `
${commonImports}
import { CheckCircle2 } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
}

interface ForgotPasswordWithFeaturesProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ForgotPasswordWithFeatures: React.FC<ForgotPasswordWithFeaturesProps> = ({ ${dataName}, className }) => {
  const [email, setEmail] = useState('');

  const forgotPasswordData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholderAlt')};
  const resetPasswordButton = ${getField('resetPasswordButton')};
  const backToLoginButton = ${getField('backToLoginButton')};
  const features = ${getField('features')};

  // Mutation for password reset
  const resetMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await api.post<any>('${apiRoute}/forgot-password', data);
      return response?.data || response;
    },
    onSuccess: () => {
      alert('Password reset link sent! Check your email.');
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to send reset link. Please try again.');
    },
  });

  const handleResetPassword = () => {
    if (email) {
      resetMutation.mutate({ email });
    }
  };

  const handleBackToLogin = () => {
    console.log('Back to login clicked');
  };

  const FlowbiteLogo = () => (
    <div className="flex items-center space-x-2 mb-12">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-2xl font-bold text-gray-900 dark:text-white">{brandName}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex", className)}>
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 p-12 items-center dark:bg-gray-900">
        <div className="max-w-lg">
          <FlowbiteLogo />

          <div className="space-y-8">
            {features.map((feature: Feature, index: number) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{mainTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {mainDescription}
          </p>

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

            <Button
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              onClick={handleResetPassword}
            >
              {resetPasswordButton}
            </Button>

            <div className="text-center">
              <button
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white inline-flex items-center"
                onClick={handleBackToLogin}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {backToLoginButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordWithFeatures;
    `,

    withHero: `
${commonImports}

interface ForgotPasswordWithHeroProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ForgotPasswordWithHero: React.FC<ForgotPasswordWithHeroProps> = ({ ${dataName}, className }) => {
  const [email, setEmail] = useState('');

  const forgotPasswordData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const heroTitle = ${getField('heroTitle')};
  const heroDescription = ${getField('heroDescription')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholderAlt')};
  const resetPasswordButton = ${getField('resetPasswordButton')};
  const backToLoginButton = ${getField('backToLoginButton')};
  const ratingText = ${getField('ratingText')};
  const ratingCount = ${getField('ratingCount')};
  const ratingLabel = ${getField('ratingLabel')};
  const userAvatars = ${getField('userAvatars')};

  // Mutation for password reset
  const resetMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await api.post<any>('${apiRoute}/forgot-password', data);
      return response?.data || response;
    },
    onSuccess: () => {
      alert('Password reset link sent! Check your email.');
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to send reset link. Please try again.');
    },
  });

  const handleResetPassword = () => {
    if (email) {
      resetMutation.mutate({ email });
    }
  };

  const handleBackToLogin = () => {
    console.log('Back to login clicked');
  };

  const FlowbiteLogo = () => (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-4 h-4 text-white fill-white" />
      </div>
      <span className="text-2xl font-bold text-white">{brandName}</span>
    </div>
  );

  const UserAvatars = () => {
    return (
      <div className="flex -space-x-2">
        {userAvatars.map((avatar: string, i: number) => (
          <img
            key={i}
            src={avatar}
            alt={\`User \${i + 1}\`}
            className="w-10 h-10 rounded-full border-2 border-white object-cover"
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen flex", className)}>
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{mainTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {mainDescription}
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-12"
              />
            </div>

            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              onClick={handleResetPassword}
            >
              {resetPasswordButton}
            </Button>

            <div className="text-center">
              <button
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white inline-flex items-center"
                onClick={handleBackToLogin}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {backToLoginButton}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-12 items-center justify-center">
        <div className="max-w-xl text-white">
          <FlowbiteLogo />

          <h2 className="text-5xl font-bold mt-12 mb-6 leading-tight">
            {heroTitle}
          </h2>

          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            {heroDescription}
          </p>

          <div className="flex items-center space-x-4">
            <UserAvatars />
            <div className="text-sm">
              <span className="text-blue-100">{ratingText} </span>
              <span className="font-bold">{ratingCount}</span>
              <span className="text-blue-100"> {ratingLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordWithHero;
    `,

    withImage: `
${commonImports}

interface ForgotPasswordWithImageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ForgotPasswordWithImage: React.FC<ForgotPasswordWithImageProps> = ({ ${dataName}, className }) => {
  const [email, setEmail] = useState('');

  const forgotPasswordData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const resetPasswordButton = ${getField('resetPasswordButton')};
  const backToLoginButton = ${getField('backToLoginButton')};
  const heroImage = ${getField('heroImage')};
  const imageAlt = ${getField('imageAlt')};

  // Mutation for password reset
  const resetMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await api.post<any>('${apiRoute}/forgot-password', data);
      return response?.data || response;
    },
    onSuccess: () => {
      alert('Password reset link sent! Check your email.');
    },
    onError: (error: any) => {
      alert(error?.message || 'Failed to send reset link. Please try again.');
    },
  });

  const handleResetPassword = () => {
    if (email) {
      resetMutation.mutate({ email });
    }
  };

  const handleBackToLogin = () => {
    console.log('Back to login clicked');
  };

  const FlowbiteLogo = () => (
    <div className="flex items-center space-x-2 mb-8">
      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <Play className="w-4 h-4 text-white fill-white" />
      </div>
      <span className="text-2xl font-bold text-gray-900 dark:text-white">{brandName}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 lg:p-12">
            <FlowbiteLogo />

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{mainTitle}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {mainDescription}
            </p>

            <div className="space-y-6">
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

              <Button
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                onClick={handleResetPassword}
              >
                {resetPasswordButton}
              </Button>

              <div className="text-center">
                <button
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white inline-flex items-center"
                  onClick={handleBackToLogin}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {backToLoginButton}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <img
                src={heroImage}
                alt={imageAlt}
                className="w-full h-auto rounded-lg shadow-xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordWithImage;
    `
  };

  return variants[variant] || variants.simple;
};
