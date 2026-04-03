import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRegisterForm = (
  resolved: ResolvedComponent,
  variant: 'registerWithHero' | 'registerWithFeatures' | 'registerWithImage' | 'registerCentered' = 'registerCentered'
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Play, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';`;

  // Common event handlers that all variants will use
  const commonEventHandlers = `
  // Mutation for form submission
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post<any>('${apiRoute}/register', data);
      return response?.data || response;
    },
    onSuccess: (data) => {
      alert('Account created successfully! Welcome to Fluxez!');
    },
    onError: (error: any) => {
      alert(error?.message || 'Registration failed. Please try again.');
    },
  });

  // Event handlers
  const handleSocialLogin = (provider: string) => {
    console.log(\`\${provider} login clicked\`);
    alert(\`Redirecting to \${provider} authentication...\\nYou'll be redirected to complete sign up.\`);
  };

  const handleSignIn = () => {
    console.log('Sign in link clicked');
    alert('Redirecting to sign in page...');
  };

  const handleTermsClick = () => {
    console.log('Terms and conditions clicked');
    alert('Opening Terms and Conditions...\\nPlease read our terms carefully.');
  };

  const validateForm = () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return false;
    }
    if (!email.trim()) {
      alert('Please enter your email');
      return false;
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return false;
    }
    if (!agreeToTerms) {
      alert('Please accept the Terms and Conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('Register form submitted', { name, email });

    if (validateForm()) {
      submitMutation.mutate({ name, email, password });
    }
  };

`;

  const variants = {
    registerWithHero: `
${commonImports}

interface RegisterFormProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

const RegisterFormComponent: React.FC<RegisterFormProps> = ({
  ${dataName},
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  const styles = getVariantStyles(variant, colorScheme);
  const registerData = ${dataName} || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const title = ${getField('title')};
  const logoText = ${getField('logoText')};
  const googleButtonText = ${getField('googleButtonText')};
  const githubButtonText = ${getField('githubButtonText')};
  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const confirmPasswordPlaceholder = ${getField('confirmPasswordPlaceholder')};
  const termsText = ${getField('termsText')};
  const termsLinkText = ${getField('termsLinkText')};
  const createAccountButtonText = ${getField('createAccountButtonText')};
  const hasAccountText = ${getField('hasAccountText')};
  const signInText = ${getField('signInText')};
  const heroTitle = ${getField('heroTitle')};
  const heroDescription = ${getField('heroDescription')};
  const ratingText = ${getField('ratingText')};
  const reviewCount = ${getField('reviewCount')};
  const reviewsText = ${getField('reviewsText')};

${commonEventHandlers}

  const FluxezLogo = () => (
    <div className="flex items-center space-x-2">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', styles.badge)}>
        <Play className={\`w-4 h-4 \${styles.accent}\`} />
      </div>
      <span className="text-2xl font-bold text-white">{logoText}</span>
    </div>
  );

  const UserAvatars = () => {
    const avatars = [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=2',
      'https://i.pravatar.cc/150?img=3',
      'https://i.pravatar.cc/150?img=4'
    ];

    return (
      <div className="flex -space-x-2">
        {avatars.map((avatar, i) => (
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
      {/* Left Side - Register Form */}
      <div className={cn('w-full lg:w-1/2 flex items-center justify-center p-8', styles.background)}>
        <div className="w-full max-w-md">
          <h1 className={\`text-3xl font-bold mb-8 \${styles.title}\`}>{title}</h1>

          <div className="space-y-4 mb-6">
            <button
              className={cn(styles.card, styles.cardHover, 'w-full h-12 flex items-center justify-center rounded-lg font-semibold transition-all')}
              onClick={() => handleSocialLogin('Google')}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className={styles.text}>{googleButtonText}</span>
            </button>

            <button
              className={cn(styles.card, styles.cardHover, 'w-full h-12 flex items-center justify-center rounded-lg font-semibold transition-all')}
              onClick={() => handleSocialLogin('GitHub')}
            >
              <svg className={\`w-5 h-5 mr-2 \${styles.text}\`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className={styles.text}>{githubButtonText}</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className={\`w-full border-t \${styles.border}\`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={\`px-2 \${styles.background} \${styles.subtitle}\`}>or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className={styles.title}>{nameLabel}</Label>
              <Input
                id="name"
                type="text"
                placeholder={namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn('mt-1 h-12', styles.card)}
              />
            </div>

            <div>
              <Label htmlFor="email" className={styles.title}>{emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn('mt-1 h-12', styles.card)}
              />
            </div>

            <div>
              <Label htmlFor="password" className={styles.title}>{passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                placeholder={passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn('mt-1 h-12', styles.card)}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className={styles.title}>{confirmPasswordLabel}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn('mt-1 h-12', styles.card)}
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                className="mt-1"
              />
              <Label htmlFor="terms" className={\`text-sm cursor-pointer leading-relaxed \${styles.text}\`}>
                {termsText}{' '}
                <button
                  type="button"
                  onClick={handleTermsClick}
                  className={\`hover:underline \${styles.accent}\`}
                >
                  {termsLinkText}
                </button>
              </Label>
            </div>

            <button
              type="submit"
              className={cn(styles.button, styles.buttonHover, 'w-full h-12 rounded-lg font-bold transition-all')}
            >
              {createAccountButtonText}
            </button>

            <div className={\`text-center text-sm \${styles.subtitle}\`}>
              {hasAccountText}{' '}
              <button
                type="button"
                onClick={handleSignIn}
                className={\`hover:underline \${styles.accent}\`}
              >
                {signInText}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className={cn('hidden lg:flex lg:w-1/2 p-12 items-center justify-center', styles.gradient)}>
        <div className="max-w-xl text-white">
          <FluxezLogo />

          <h2 className="text-5xl font-bold mt-12 mb-6 leading-tight">
            {heroTitle}
          </h2>

          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            {heroDescription}
          </p>

          <div className="flex items-center space-x-4">
            <UserAvatars />
            <div className="text-sm">
              <span className="text-white/80">{ratingText} </span>
              <span className="font-bold">{reviewCount}</span>
              <span className="text-white/80"> {reviewsText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFormComponent;
    `,

    registerWithFeatures: `
${commonImports}

interface Feature {
  title: string;
  description: string;
}

interface RegisterFormProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

const RegisterFormComponent: React.FC<RegisterFormProps> = ({
  ${dataName},
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  const styles = getVariantStyles(variant, colorScheme);
  const registerData = ${dataName} || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const title = ${getField('title')};
  const logoText = ${getField('logoText')};
  const googleButtonText = ${getField('googleButtonText')};
  const githubButtonText = ${getField('githubButtonText')};
  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const confirmPasswordPlaceholder = ${getField('confirmPasswordPlaceholder')};
  const termsText = ${getField('termsText')};
  const termsLinkText = ${getField('termsLinkText')};
  const createAccountButtonText = ${getField('createAccountButtonText')};
  const hasAccountText = ${getField('hasAccountText')};
  const signInText = ${getField('signInHere')};
  const features = ${getField('features')};

${commonEventHandlers}

  const FluxezLogo = () => (
    <div className="flex items-center space-x-2 mb-12">
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', styles.badge)}>
        <Play className={\`w-5 h-5 \${styles.accent}\`} />
      </div>
      <span className={\`text-2xl font-bold \${styles.title}\`}>{logoText}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen flex", styles.background, className)}>
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 p-12 items-center">
        <div className="max-w-lg">
          <FluxezLogo />

          <div className="space-y-8">
            {features.map((feature: Feature, index: number) => (
              <div key={index} className="flex space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className={\`w-6 h-6 \${styles.accent}\`} />
                </div>
                <div>
                  <h3 className={\`text-xl font-bold mb-2 \${styles.title}\`}>
                    {feature.title}
                  </h3>
                  <p className={\`leading-relaxed \${styles.subtitle}\`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className={cn(styles.card, 'w-full max-w-md rounded-lg shadow-lg p-8')}>
          <h1 className={\`text-3xl font-bold mb-8 \${styles.title}\`}>{title}</h1>

          <div className="space-y-4 mb-6">
            <button
              className={cn(styles.card, styles.cardHover, 'w-full h-12 flex items-center justify-start px-4 rounded-lg transition-all')}
              onClick={() => handleSocialLogin('Google')}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className={styles.text}>{googleButtonText}</span>
            </button>

            <button
              className={cn(styles.card, styles.cardHover, 'w-full h-12 flex items-center justify-start px-4 rounded-lg transition-all')}
              onClick={() => handleSocialLogin('GitHub')}
            >
              <svg className={\`w-5 h-5 mr-3 \${styles.text}\`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className={styles.text}>{githubButtonText}</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className={\`w-full border-t \${styles.border}\`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={\`px-2 \${styles.subtitle}\`} style={{background: 'inherit'}}>or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className={styles.title}>{nameLabel}</Label>
              <Input
                id="name"
                type="text"
                placeholder={namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-11"
              />
            </div>

            <div>
              <Label htmlFor="email" className={styles.title}>{emailLabel}</Label>
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
              <Label htmlFor="password" className={styles.title}>{passwordLabel}</Label>
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
              <Label htmlFor="confirmPassword" className={styles.title}>{confirmPasswordLabel}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 h-11"
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                className="mt-1"
              />
              <Label htmlFor="terms" className={\`text-sm cursor-pointer leading-relaxed \${styles.text}\`}>
                {termsText}{' '}
                <button
                  type="button"
                  onClick={handleTermsClick}
                  className={\`hover:underline \${styles.accent}\`}
                >
                  {termsLinkText}
                </button>
              </Label>
            </div>

            <button
              type="submit"
              className={cn(styles.button, styles.buttonHover, 'w-full h-11 rounded-lg font-bold transition-all')}
            >
              {createAccountButtonText}
            </button>

            <div className={\`text-center text-sm \${styles.subtitle}\`}>
              {hasAccountText}{' '}
              <button
                type="button"
                onClick={handleSignIn}
                className={\`hover:underline \${styles.accent}\`}
              >
                {signInText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterFormComponent;
    `,

    registerWithImage: `
${commonImports}

interface RegisterFormProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

const RegisterFormComponent: React.FC<RegisterFormProps> = ({
  ${dataName},
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  const styles = getVariantStyles(variant, colorScheme);
  const registerData = ${dataName} || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const title = ${getField('title')};
  const logoText = ${getField('logoText')};
  const subtitle = ${getField('subtitle')};
  const signInLinkText = ${getField('signInLinkText')};
  const googleButtonText = ${getField('googleButtonText')};
  const appleButtonText = ${getField('appleButtonText')};
  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const confirmPasswordPlaceholder = ${getField('confirmPasswordPlaceholder')};
  const termsText = ${getField('termsText')};
  const termsLinkText = ${getField('termsLinkText')};
  const createAccountButtonText = ${getField('createAccountButtonText')};
  const heroImage = ${getField('heroImage')};

${commonEventHandlers}

  const FluxezLogo = () => (
    <div className="flex items-center space-x-2 mb-8">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', styles.badge)}>
        <Play className={\`w-4 h-4 \${styles.accent}\`} />
      </div>
      <span className={\`text-2xl font-bold \${styles.title}\`}>{logoText}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4", styles.background, className)}>
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left Side - Register Form */}
          <div className={cn(styles.card, 'rounded-lg shadow-lg p-8 lg:p-12')}>
            <FluxezLogo />

            <h1 className={\`text-3xl font-bold mb-2 \${styles.title}\`}>{title}</h1>
            <p className={\`mb-8 \${styles.subtitle}\`}>
              {subtitle}{' '}
              <button
                type="button"
                onClick={handleSignIn}
                className={\`hover:underline \${styles.accent}\`}
              >
                {signInLinkText}
              </button>
            </p>

            <div className="space-y-4 mb-6">
              <button
                className={cn(styles.card, styles.cardHover, 'w-full h-12 flex items-center justify-start px-4 rounded-lg transition-all')}
                onClick={() => handleSocialLogin('Google')}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className={styles.text}>{googleButtonText}</span>
              </button>

              <button
                className={cn(styles.card, styles.cardHover, 'w-full h-12 flex items-center justify-start px-4 rounded-lg transition-all')}
                onClick={() => handleSocialLogin('Apple')}
              >
                <svg className={\`w-5 h-5 mr-3 \${styles.text}\`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className={styles.text}>{appleButtonText}</span>
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className={\`w-full border-t \${styles.border}\`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={\`px-2 \${styles.subtitle}\`} style={{background: 'inherit'}}>or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="name" className={styles.title}>{nameLabel}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 h-11"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className={styles.title}>{emailLabel}</Label>
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
                  <Label htmlFor="password" className={styles.title}>{passwordLabel}</Label>
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
                  <Label htmlFor="confirmPassword" className={styles.title}>{confirmPasswordLabel}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 h-11"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2 mb-6">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className={\`text-sm cursor-pointer leading-relaxed \${styles.text}\`}>
                  {termsText}{' '}
                  <button
                    type="button"
                    onClick={handleTermsClick}
                    className={\`hover:underline \${styles.accent}\`}
                  >
                    {termsLinkText}
                  </button>
                </Label>
              </div>

              <button
                type="submit"
                className={cn(styles.button, styles.buttonHover, 'w-full h-12 rounded-lg font-bold transition-all')}
              >
                {createAccountButtonText}
              </button>
            </form>
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <img
                src={heroImage}
                alt="Register illustration"
                className={cn('w-full h-auto rounded-lg shadow-xl object-cover', styles.card)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterFormComponent;
    `,

    registerCentered: `
${commonImports}

interface RegisterFormProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

const RegisterFormComponent: React.FC<RegisterFormProps> = ({
  ${dataName},
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  const styles = getVariantStyles(variant, colorScheme);
  const registerData = ${dataName} || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const title = ${getField('title')};
  const logoText = ${getField('logoText')};
  const nameLabel = ${getField('nameLabel')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const passwordLabel = ${getField('passwordLabel')};
  const passwordPlaceholder = ${getField('passwordPlaceholder')};
  const confirmPasswordLabel = ${getField('confirmPasswordLabel')};
  const confirmPasswordPlaceholder = ${getField('confirmPasswordPlaceholder')};
  const termsText = ${getField('termsText')};
  const termsLinkText = ${getField('termsLinkText')};
  const createAccountButtonText = ${getField('createAccountButtonText')};
  const hasAccountText = ${getField('hasAccountText')};
  const signInText = ${getField('signInText')};

${commonEventHandlers}

  const FluxezLogo = () => (
    <div className="flex items-center justify-center space-x-2 mb-12">
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', styles.badge)}>
        <Play className={\`w-5 h-5 \${styles.accent}\`} />
      </div>
      <span className={\`text-3xl font-bold \${styles.title}\`}>{logoText}</span>
    </div>
  );

  return (
    <div className={cn("min-h-screen flex items-center justify-center p-4", styles.background, className)}>
      <div className="w-full max-w-md">
        <FluxezLogo />

        <div className={cn(styles.card, 'rounded-xl shadow-lg p-8 lg:p-10')}>
          <h1 className={\`text-3xl font-bold mb-8 text-center \${styles.title}\`}>
            {title}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className={\`text-base font-medium \${styles.title}\`}>
                {nameLabel}
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="email" className={\`text-base font-medium \${styles.title}\`}>
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

            <div>
              <Label htmlFor="password" className={\`text-base font-medium \${styles.title}\`}>
                {passwordLabel}
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
              <Label htmlFor="confirmPassword" className={\`text-base font-medium \${styles.title}\`}>
                {confirmPasswordLabel}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={confirmPasswordPlaceholder}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 h-12 text-base"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
              />
              <Label htmlFor="terms" className={\`text-sm cursor-pointer \${styles.text}\`}>
                {termsText}{' '}
                <button
                  type="button"
                  onClick={handleTermsClick}
                  className={\`hover:underline font-medium \${styles.accent}\`}
                >
                  {termsLinkText}
                </button>
              </Label>
            </div>

            <button
              type="submit"
              className={cn(styles.button, styles.buttonHover, 'w-full h-12 rounded-lg text-base font-bold transition-all')}
            >
              {createAccountButtonText}
            </button>

            <div className={\`text-center text-sm \${styles.subtitle}\`}>
              {hasAccountText}{' '}
              <button
                type="button"
                onClick={handleSignIn}
                className={\`hover:underline font-medium \${styles.accent}\`}
              >
                {signInText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterFormComponent;
    `
  };

  return variants[variant] || variants.registerCentered;
};
