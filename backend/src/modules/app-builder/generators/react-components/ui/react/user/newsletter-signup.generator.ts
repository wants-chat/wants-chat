import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateNewsletterSignup = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'modal' | 'sidebar' = 'inline'
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
  const entity = dataSource?.split('.').pop() || 'newsletter';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'newsletter'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    inline: `
${commonImports}
import { Mail, CheckCircle, AlertCircle, Shield, Users, Loader2 } from 'lucide-react';

interface InlineNewsletterProps {
  ${dataName}?: any;
  className?: string;
  onSubscribe?: (email: string, name?: string, gdprConsent?: boolean) => Promise<void>;
  onPrivacyClick?: () => void;
}

const InlineNewsletterSignup: React.FC<InlineNewsletterProps> = ({
  ${dataName}: propData,
  className,
  onSubscribe,
  onPrivacyClick
}) => {
  const { data: fetchedData, isLoading, error: fetchError } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const title = ${getField('inlineTitle')};
  const description = ${getField('inlineDescription')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const namePlaceholder = ${getField('namePlaceholder')};
  const subscribeButton = ${getField('subscribeButton')};
  const subscribingButton = ${getField('subscribingButton')};
  const successMessage = ${getField('successMessage')};
  const errorMessage = ${getField('errorMessage')};
  const gdprText = ${getField('gdprText')};
  const privacyPolicyText = ${getField('privacyPolicyText')};
  const benefits = ${getField('benefits')};
  const subscriberCount = ${getField('subscriberCount')};
  const subscribersLabel = ${getField('subscribersLabel')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const validateEmail = (email: string) => {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!gdprConsent) {
      setError('Please accept the privacy policy to continue');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubscribe) {
        await onSubscribe(email, name, gdprConsent);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Newsletter subscription:', { email, name, gdprConsent });
      }

      setShowSuccess(true);
      setEmail('');
      setName('');
      setGdprConsent(false);

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrivacyClick) {
      onPrivacyClick();
    } else {
      console.log('Privacy policy clicked');
    }
  };

  if (showSuccess) {
    return (
      <div className={cn("bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8", className)}>
        <div className="text-center text-white">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">You're All Set!</h3>
          <p className="text-blue-100">{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12", className)}>
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Content */}
          <div className="text-white">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-8 w-8" />
              <h2 className="text-3xl font-bold">{title}</h2>
            </div>
            <p className="text-blue-100 mb-6 text-lg">{description}</p>

            <div className="space-y-3 mb-6">
              {benefits.map((benefit: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                  <span className="text-blue-50">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-blue-100">
              <Users className="h-5 w-5" />
              <span>Join {subscriberCount} {subscribersLabel}</span>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={namePlaceholder}
                  className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={emailPlaceholder}
                  required
                  className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="gdpr-consent"
                  checked={gdprConsent}
                  onChange={(e) => setGdprConsent(e.target.checked)}
                  className="mt-1 rounded"
                  required
                />
                <label htmlFor="gdpr-consent" className="text-sm text-gray-600 dark:text-gray-400">
                  {gdprText}{' '}
                  <button
                    onClick={handlePrivacyClick}
                    className="text-blue-600 hover:underline"
                  >
                    {privacyPolicyText}
                  </button>
                </label>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-bold"
              >
                {isSubmitting ? subscribingButton : subscribeButton}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="h-3 w-3" />
                <span>Your data is safe with us</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineNewsletterSignup;
    `,

    modal: `
${commonImports}
import { X, Mail, CheckCircle, AlertCircle, Shield, Loader2 } from 'lucide-react';

interface ModalNewsletterProps {
  ${dataName}?: any;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubscribe?: (email: string, name?: string, gdprConsent?: boolean) => Promise<void>;
  onPrivacyClick?: () => void;
}

const ModalNewsletterSignup: React.FC<ModalNewsletterProps> = ({
  ${dataName}: propData,
  className,
  isOpen,
  onClose,
  onSubscribe,
  onPrivacyClick
}) => {
  const { data: fetchedData, isLoading, error: fetchError } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const title = ${getField('modalTitle')};
  const description = ${getField('modalDescription')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const emailLabel = ${getField('emailLabel')};
  const nameLabel = ${getField('nameLabel')};
  const subscribeButton = ${getField('subscribeButton')};
  const subscribingButton = ${getField('subscribingButton')};
  const successMessage = ${getField('successMessage')};
  const errorMessage = ${getField('errorMessage')};
  const gdprText = ${getField('gdprText')};
  const privacyPolicyText = ${getField('privacyPolicyText')};
  const noThanksButton = ${getField('noThanksButton')};
  const benefits = ${getField('benefits')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const validateEmail = (email: string) => {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!gdprConsent) {
      setError('Please accept the privacy policy to continue');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubscribe) {
        await onSubscribe(email, name, gdprConsent);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Newsletter subscription:', { email, name, gdprConsent });
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrivacyClick) {
      onPrivacyClick();
    } else {
      console.log('Privacy policy clicked');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", className)}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
          {showSuccess ? (
            <div className="p-12 text-center">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Success!</h3>
              <p className="text-lg text-gray-600 dark:text-gray-400">{successMessage}</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Mail className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-bold">{title}</h2>
                </div>
                <p className="text-blue-100 text-lg">{description}</p>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">What you'll get:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {benefits.map((benefit: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {nameLabel}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {emailLabel} *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={emailPlaceholder}
                      required
                      className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    />
                  </div>

                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="modal-gdpr"
                      checked={gdprConsent}
                      onChange={(e) => setGdprConsent(e.target.checked)}
                      className="mt-1 rounded"
                      required
                    />
                    <label htmlFor="modal-gdpr" className="text-sm text-gray-600 dark:text-gray-400">
                      {gdprText}{' '}
                      <button onClick={handlePrivacyClick} className="text-blue-600 hover:underline">
                        {privacyPolicyText}
                      </button>
                    </label>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium text-gray-700 dark:text-gray-300"
                    >
                      {noThanksButton}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-bold"
                    >
                      {isSubmitting ? subscribingButton : subscribeButton}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Shield className="h-3 w-3" />
                    <span>Your privacy is important to us</span>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ModalNewsletterSignup;
    `,

    sidebar: `
${commonImports}
import { Mail, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

interface SidebarNewsletterProps {
  ${dataName}?: any;
  className?: string;
  onSubscribe?: (email: string, gdprConsent: boolean) => Promise<void>;
  onPrivacyClick?: () => void;
}

const SidebarNewsletterSignup: React.FC<SidebarNewsletterProps> = ({
  ${dataName}: propData,
  className,
  onSubscribe,
  onPrivacyClick
}) => {
  const { data: fetchedData, isLoading, error: fetchError } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [email, setEmail] = useState('');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const title = ${getField('sidebarTitle')};
  const description = ${getField('sidebarDescription')};
  const emailPlaceholder = ${getField('emailPlaceholder')};
  const subscribeButton = ${getField('subscribeButton')};
  const subscribingButton = ${getField('subscribingButton')};
  const successMessage = ${getField('successMessage')};
  const errorMessage = ${getField('errorMessage')};
  const gdprText = ${getField('gdprText')};
  const privacyPolicyText = ${getField('privacyPolicyText')};
  const unsubscribeText = ${getField('unsubscribeText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const validateEmail = (email: string) => {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !validateEmail(email)) {
      setError('Invalid email');
      return;
    }

    if (!gdprConsent) {
      setError('Please accept privacy policy');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubscribe) {
        await onSubscribe(email, gdprConsent);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Newsletter subscription:', { email, gdprConsent });
      }

      setShowSuccess(true);
      setEmail('');
      setGdprConsent(false);

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) {
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onPrivacyClick) {
      onPrivacyClick();
    } else {
      console.log('Privacy policy clicked');
    }
  };

  return (
    <aside className={cn("w-80", className)}>
      <div className="sticky top-24">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          {showSuccess ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Subscribed!</h3>
              <p className="text-sm text-blue-100">{successMessage}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-6 w-6" />
                <h3 className="text-xl font-bold">{title}</h3>
              </div>
              <p className="text-blue-100 text-sm mb-4">{description}</p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={emailPlaceholder}
                  required
                  className="w-full px-3 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="sidebar-gdpr"
                    checked={gdprConsent}
                    onChange={(e) => setGdprConsent(e.target.checked)}
                    className="mt-0.5 rounded"
                    required
                  />
                  <label htmlFor="sidebar-gdpr" className="text-xs text-blue-100">
                    I agree to the{' '}
                    <button onClick={handlePrivacyClick} className="underline hover:text-white">
                      {privacyPolicyText}
                    </button>
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-1 text-yellow-200 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white text-blue-600 py-2 rounded-lg hover:bg-blue-50 disabled:bg-gray-200 transition-colors font-bold flex items-center justify-center gap-2"
                >
                  {isSubmitting ? subscribingButton : subscribeButton}
                  {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                </button>

                <p className="text-xs text-blue-100 text-center">{unsubscribeText}</p>
              </form>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SidebarNewsletterSignup;
    `
  };

  return variants[variant] || variants.inline;
};
