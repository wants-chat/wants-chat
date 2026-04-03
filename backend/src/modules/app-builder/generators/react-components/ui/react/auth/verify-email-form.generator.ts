import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateVerifyEmailForm = (
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
    return `/${dataSource || 'auth'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'auth';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';`;

  const variants = {
    centered: `
${commonImports}

interface VerifyEmailCenteredProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const VerifyEmailCentered: React.FC<VerifyEmailCenteredProps> = ({ ${dataName}, className }) => {
  const [code, setCode] = useState('');

  const verifyEmailData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const codeLabel = ${getField('codeLabel')};
  const codePlaceholder = ${getField('codePlaceholder')};
  const verifyButton = ${getField('verifyButton')};
  const didntReceiveText = ${getField('didntReceiveText')};
  const resendCodeButton = ${getField('resendCodeButton')};

  const handleVerify = () => {
    console.log('Verify clicked with code:', code);
  };

  const handleResendCode = () => {
    console.log('Resend code clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-3 mb-12">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Play className="w-6 h-6 text-white fill-white" />
      </div>
      <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{brandName}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8 lg:p-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            {mainTitle}
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
            {mainDescription}
          </p>

          <div className="space-y-6">
            <div>
              <Label htmlFor="code" className="text-base font-bold">
                {codeLabel}
              </Label>
              <Input
                id="code"
                type="text"
                placeholder={codePlaceholder}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-2 h-12 text-base border-2 rounded-xl shadow-md transition-all focus:scale-105"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleVerify}
              className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-bold transition-all hover:scale-105 shadow-lg"
            >
              {verifyButton}
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
              {didntReceiveText}{' '}
              <button
                onClick={handleResendCode}
                className="text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 font-bold transition-colors"
              >
                {resendCodeButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailCentered;
    `,

    withFeatures: `
${commonImports}
import { CheckCircle2 } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
}

interface VerifyEmailWithFeaturesProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const VerifyEmailWithFeatures: React.FC<VerifyEmailWithFeaturesProps> = ({ ${dataName}, className }) => {
  const [code, setCode] = useState('');

  const verifyEmailData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const codeLabel = ${getField('codeLabel')};
  const codePlaceholder = ${getField('codePlaceholder')};
  const verifyButton = ${getField('verifyButton')};
  const didntReceiveText = ${getField('didntReceiveText')};
  const resendCodeButton = ${getField('resendCodeButton')};
  const features = ${getField('features')};

  const handleVerify = () => {
    console.log('Verify clicked with code:', code);
  };

  const handleResendCode = () => {
    console.log('Resend code clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center space-x-3 mb-12">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Play className="w-6 h-6 text-white fill-white" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{brandName}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex", className)}>
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 p-12 items-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="max-w-lg">
          <FluxezLogo />

          <div className="space-y-8">
            {features.map((feature: Feature, index: number) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
        <div className="w-full max-w-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">{mainTitle}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
            {mainDescription}
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="code" className="font-bold">{codeLabel}</Label>
              <Input
                id="code"
                type="text"
                placeholder={codePlaceholder}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 h-12 border-2 rounded-xl shadow-md transition-all focus:scale-105"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleVerify}
              className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all hover:scale-105 shadow-lg"
            >
              {verifyButton}
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
              {didntReceiveText}{' '}
              <button
                onClick={handleResendCode}
                className="text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 font-bold transition-colors"
              >
                {resendCodeButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailWithFeatures;
    `,

    withHero: `
${commonImports}

interface VerifyEmailWithHeroProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const VerifyEmailWithHero: React.FC<VerifyEmailWithHeroProps> = ({ ${dataName}, className }) => {
  const [code, setCode] = useState('');

  const verifyEmailData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const heroTitle = ${getField('heroTitle')};
  const heroDescription = ${getField('heroDescription')};
  const codeLabel = ${getField('codeLabel')};
  const codePlaceholder = ${getField('codePlaceholder')};
  const verifyButton = ${getField('verifyButton')};
  const didntReceiveText = ${getField('didntReceiveText')};
  const resendCodeButton = ${getField('resendCodeButton')};
  const ratingText = ${getField('ratingText')};
  const ratingCount = ${getField('ratingCount')};
  const ratingLabel = ${getField('ratingLabel')};
  const userAvatars = ${getField('userAvatars')};

  const handleVerify = () => {
    console.log('Verify clicked with code:', code);
  };

  const handleResendCode = () => {
    console.log('Resend code clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
        <Play className="w-5 h-5 text-blue-600 fill-blue-600" />
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
            className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-lg hover:scale-110 transition-all"
          />
        ))}
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen flex", className)}>
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="w-full max-w-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">{mainTitle}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
            {mainDescription}
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="code" className="font-bold">{codeLabel}</Label>
              <Input
                id="code"
                type="text"
                placeholder={codePlaceholder}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 h-12 border-2 rounded-xl shadow-md transition-all focus:scale-105"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleVerify}
              className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all hover:scale-105 shadow-lg"
            >
              {verifyButton}
            </button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
              {didntReceiveText}{' '}
              <button
                onClick={handleResendCode}
                className="text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 font-bold transition-colors"
              >
                {resendCodeButton}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 p-12 items-center justify-center">
        <div className="max-w-xl text-white">
          <FluxezLogo />

          <h2 className="text-5xl font-bold mt-12 mb-6 leading-tight">
            {heroTitle}
          </h2>

          <p className="text-blue-50 text-lg mb-8 leading-relaxed font-medium">
            {heroDescription}
          </p>

          <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
            <UserAvatars />
            <div className="text-sm">
              <span className="text-blue-50">{ratingText} </span>
              <span className="font-bold text-lg">{ratingCount}</span>
              <span className="text-blue-50"> {ratingLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailWithHero;
    `,

    withImage: `
${commonImports}

interface VerifyEmailWithImageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const VerifyEmailWithImage: React.FC<VerifyEmailWithImageProps> = ({ ${dataName}, className }) => {
  const [code, setCode] = useState('');

  const verifyEmailData = ${dataName} || {};
  
  const brandName = ${getField('brandName')};
  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const codeLabel = ${getField('codeLabel')};
  const codePlaceholder = ${getField('codePlaceholder')};
  const verifyButton = ${getField('verifyButton')};
  const didntReceiveText = ${getField('didntReceiveText')};
  const resendCodeButton = ${getField('resendCodeButton')};
  const heroImage = ${getField('heroImage')};
  const imageAlt = ${getField('imageAlt')};

  const handleVerify = () => {
    console.log('Verify clicked with code:', code);
  };

  const handleResendCode = () => {
    console.log('Resend code clicked');
  };

  const FluxezLogo = () => (
    <div className="flex items-center space-x-3 mb-8">
      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <Play className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{brandName}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Form */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-8 lg:p-12">
            <FluxezLogo />

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">{mainTitle}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
              {mainDescription}
            </p>

            <div className="space-y-6">
              <div>
                <Label htmlFor="code" className="font-bold">{codeLabel}</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder={codePlaceholder}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 h-12 border-2 rounded-xl shadow-md transition-all focus:scale-105"
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleVerify}
                className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold transition-all hover:scale-105 shadow-lg"
              >
                {verifyButton}
              </button>

              <div className="text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                {didntReceiveText}{' '}
                <button
                  onClick={handleResendCode}
                  className="text-blue-600 dark:text-blue-400 hover:text-purple-600 dark:hover:text-purple-400 font-bold transition-colors"
                >
                  {resendCodeButton}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-2xl opacity-20"></div>
              <img
                src={heroImage}
                alt={imageAlt}
                className="relative w-full h-auto rounded-2xl shadow-2xl object-cover border-4 border-white dark:border-gray-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailWithImage;
    `
  };

  return variants[variant] || variants.centered;
};
