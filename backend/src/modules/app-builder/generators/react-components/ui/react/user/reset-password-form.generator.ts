import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateResetPasswordForm = (
  resolved: ResolvedComponent,
  variant: 'centered' | 'withFeatures' | 'withHero' | 'withImage' = 'centered'
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
    return `/${dataSource || 'reset-password-config'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'resetPasswordConfig';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';`;

  const variants = {
    centered: `
${commonImports}

interface ResetPasswordCenteredProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ResetPasswordCentered: React.FC<ResetPasswordCenteredProps> = ({ ${dataName}: propData, className }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const resetPasswordData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const oldPasswordLabel = ${getField('oldPasswordLabel')};
  const newPasswordLabel = ${getField('newPasswordLabel')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const resetPasswordButton = ${getField('resetPasswordButton')};
  const backToLoginButton = ${getField('backToLoginButton')};

  const handleResetPassword = () => {
    console.log('Reset password clicked', { oldPassword, password, confirmPassword });
  };

  const handleBackToLogin = () => {
    console.log('Back to login clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-12">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{brandName}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8 lg:p-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-7 w-7 text-blue-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400 text-center">
              {mainTitle}
            </h1>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-8 text-center">
            {mainDescription}
          </p>

          <div className="space-y-6">
            <div>
              <Label htmlFor="oldPassword" className="text-base font-medium">
                {oldPasswordLabel}
              </Label>
              <Input
                id="oldPassword"
                type="password"
                placeholder={passwordPlaceholder}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-2 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-base font-medium">
                {newPasswordLabel}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-base font-medium">
                {confirmPasswordLabel}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={passwordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 h-12 text-base"
              />
            </div>

            <button
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={handleResetPassword}
            >
              {resetPasswordButton}
            </button>

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

export default ResetPasswordCentered;
    `,

    withFeatures: `
${commonImports}
import { CheckCircle2 } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
}

interface ResetPasswordWithFeaturesProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ResetPasswordWithFeatures: React.FC<ResetPasswordWithFeaturesProps> = ({ ${dataName}: propData, className }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const resetPasswordData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const oldPasswordLabel = ${getField('oldPasswordLabel')};
  const newPasswordLabel = ${getField('newPasswordLabel')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const resetPasswordButton = ${getField('resetPasswordButton')};
  const backToLoginButton = ${getField('backToLoginButton')};
  const features = ${getField('features')};

  const handleResetPassword = () => {
    console.log('Reset password clicked', { oldPassword, password, confirmPassword });
  };

  const handleBackToLogin = () => {
    console.log('Back to login clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center space-x-2 mb-12">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{brandName}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex", className)}>
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 p-12 items-center dark:bg-gray-900">
        <div className="max-w-lg">
          <FluxezLogo />

          <div className="space-y-8">
            {features.map((feature: Feature, index: number) => (
              <div key={index} className="flex space-x-4 p-4 bg-white/5 dark:bg-white/5 rounded-xl border-2 border-transparent hover:border-blue-400 dark:hover:border-purple-500 transition-all duration-300">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 dark:text-gray-400 leading-relaxed">
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
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-7 w-7 text-blue-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{mainTitle}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {mainDescription}
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="oldPassword">{oldPasswordLabel}</Label>
              <Input
                id="oldPassword"
                type="password"
                placeholder={passwordPlaceholder}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1 h-11"
              />
            </div>

            <div>
              <Label htmlFor="password">{newPasswordLabel}</Label>
              <Input
                id="password"
                type="password"
                placeholder={passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-11"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">{confirmPasswordLabel}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={passwordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 h-11"
              />
            </div>

            <button
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={handleResetPassword}
            >
              {resetPasswordButton}
            </button>

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

export default ResetPasswordWithFeatures;
    `,

    withHero: `
${commonImports}

interface ResetPasswordWithHeroProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ResetPasswordWithHero: React.FC<ResetPasswordWithHeroProps> = ({ ${dataName}, className }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetPasswordData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const heroTitle = ${getField('heroTitle')};
  const heroDescription = ${getField('heroDescription')};
  const oldPasswordLabel = ${getField('oldPasswordLabel')};
  const newPasswordLabel = ${getField('newPasswordLabel')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const resetPasswordButton = ${getField('resetPasswordButton')};
  const backToLoginButton = ${getField('backToLoginButton')};
  const ratingText = ${getField('ratingText')};
  const ratingCount = ${getField('ratingCount')};
  const ratingLabel = ${getField('ratingLabel')};
  const userAvatars = ${getField('userAvatars')};

  const handleResetPassword = () => {
    console.log('Reset password clicked', { oldPassword, password, confirmPassword });
  };

  const handleBackToLogin = () => {
    console.log('Back to login clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
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
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-7 w-7 text-blue-600 dark:text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{mainTitle}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {mainDescription}
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="oldPassword">{oldPasswordLabel}</Label>
              <Input
                id="oldPassword"
                type="password"
                placeholder={passwordPlaceholder}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="mt-1 h-12"
              />
            </div>

            <div>
              <Label htmlFor="password">{newPasswordLabel}</Label>
              <Input
                id="password"
                type="password"
                placeholder={passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-12"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">{confirmPasswordLabel}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={passwordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 h-12"
              />
            </div>

            <button
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={handleResetPassword}
            >
              {resetPasswordButton}
            </button>

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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-20 blur-3xl"></div>
        <div className="max-w-xl text-white relative z-10">
          <FluxezLogo />

          <h2 className="text-5xl font-bold mt-12 mb-6 leading-tight drop-shadow-lg">
            {heroTitle}
          </h2>

          <p className="text-white/90 text-lg mb-8 leading-relaxed drop-shadow-md">
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

export default ResetPasswordWithHero;
    `,

    withImage: `
${commonImports}

interface ResetPasswordWithImageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ResetPasswordWithImage: React.FC<ResetPasswordWithImageProps> = ({ ${dataName}, className }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetPasswordData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const oldPasswordLabel = ${getField('oldPasswordLabel')};
  const newPasswordLabel = ${getField('newPasswordLabel')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const resetPasswordButton = ${getField('resetPasswordButton')};
  const backToLoginButton = ${getField('backToLoginButton')};
  const heroImage = ${getField('heroImage')};
  const imageAlt = ${getField('imageAlt')};

  const handleResetPassword = () => {
    console.log('Reset password clicked', { oldPassword, password, confirmPassword });
  };

  const handleBackToLogin = () => {
    console.log('Back to login clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center space-x-2 mb-8">
      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Play className="w-4 h-4 text-white fill-white" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{brandName}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8 lg:p-12">
            <FluxezLogo />

            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-7 w-7 text-blue-600 dark:text-purple-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{mainTitle}</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {mainDescription}
            </p>

            <div className="space-y-6">
              <div>
                <Label htmlFor="oldPassword">{oldPasswordLabel}</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder={passwordPlaceholder}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-1 h-11"
                />
              </div>

              <div>
                <Label htmlFor="password">{newPasswordLabel}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 h-11"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">{confirmPasswordLabel}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={passwordPlaceholder}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 h-11"
                />
              </div>

              <button
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={handleResetPassword}
              >
                {resetPasswordButton}
              </button>

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
            <div className="relative w-full max-w-md group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              <img
                src={heroImage}
                alt={imageAlt}
                className="w-full h-auto rounded-xl shadow-2xl border-4 border-white dark:border-gray-700 object-cover relative z-10 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordWithImage;
    `
  };

  return variants[variant] || variants.centered;
};
