import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCookieConsentSimple = (
  resolved: ResolvedComponent,
  variant: 'banner' | 'modal' | 'corner' = 'banner'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    banner: `
${commonImports}
import { Cookie, X, Settings } from 'lucide-react';

interface BannerCookieConsentProps {
  ${dataName}?: any;
  className?: string;
  position?: 'top' | 'bottom';
  showDecline?: boolean;
  showSettings?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
  onSettings?: () => void;
}

const BannerCookieConsent: React.FC<BannerCookieConsentProps> = ({
  ${dataName}: propData,
  className,
  position = ${getField('position')},
  showDecline = true,
  showSettings = true,
  onAccept,
  onDecline,
  onSettings
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [isVisible, setIsVisible] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cookieData = ${dataName} || {};

  const text = ${getField('bannerText')};
  const acceptText = ${getField('bannerAcceptText')};
  const declineText = ${getField('bannerDeclineText')};
  const settingsText = ${getField('bannerSettingsText')};
  const privacyPolicyUrl = ${getField('privacyPolicyUrl')};
  const privacyPolicyText = ${getField('privacyPolicyText')};

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    if (onAccept) {
      onAccept();
    } else {
      console.log('Cookies accepted');
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
    if (onDecline) {
      onDecline();
    } else {
      console.log('Cookies declined');
    }
  };

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    } else {
      console.log('Open cookie settings');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-2xl border-t dark:border-gray-700",
        position === 'bottom' ? 'bottom-0' : 'top-0',
        "animate-in slide-in-from-bottom duration-500",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {text}{' '}
                <a
                  href={privacyPolicyUrl}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {privacyPolicyText}
                </a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
            {showSettings && (
              <button
                onClick={handleSettings}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                {settingsText}
              </button>
            )}
            {showDecline && (
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {declineText}
              </button>
            )}
            <button
              onClick={handleAccept}
              className="px-6 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              {acceptText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerCookieConsent;
    `,

    modal: `
${commonImports}
import { Cookie, X } from 'lucide-react';

interface ModalCookieConsentProps {
  ${dataName}?: any;
  className?: string;
  showDecline?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

const ModalCookieConsent: React.FC<ModalCookieConsentProps> = ({
  ${dataName}: propData,
  className,
  showDecline = true,
  onAccept,
  onDecline
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [isVisible, setIsVisible] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cookieData = ${dataName} || {};

  const title = ${getField('modalTitle')};
  const text = ${getField('modalText')};
  const acceptText = ${getField('modalAcceptText')};
  const declineText = ${getField('modalDeclineText')};
  const privacyPolicyUrl = ${getField('privacyPolicyUrl')};
  const privacyPolicyText = ${getField('privacyPolicyText')};
  const cookiePolicyUrl = ${getField('cookiePolicyUrl')};
  const cookiePolicyText = ${getField('cookiePolicyText')};

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    if (onAccept) {
      onAccept();
    } else {
      console.log('Cookies accepted');
    }
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
    if (onDecline) {
      onDecline();
    } else {
      console.log('Cookies declined');
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm", className)}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Cookie className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {text}
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <a
              href={privacyPolicyUrl}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {privacyPolicyText}
            </a>
            <span className="text-gray-400">•</span>
            <a
              href={cookiePolicyUrl}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {cookiePolicyText}
            </a>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleAccept}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {acceptText}
          </button>
          {showDecline && (
            <button
              onClick={handleDecline}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {declineText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCookieConsent;
    `,

    corner: `
${commonImports}
import { Cookie, ExternalLink, X } from 'lucide-react';

interface CornerCookieConsentProps {
  ${dataName}?: any;
  className?: string;
  position?: 'bottom-right' | 'bottom-left';
  onAccept?: () => void;
  onLearnMore?: () => void;
}

const CornerCookieConsent: React.FC<CornerCookieConsentProps> = ({
  ${dataName}: propData,
  className,
  position = 'bottom-right',
  onAccept,
  onLearnMore
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const cookieData = ${dataName} || {};

  const text = ${getField('cornerText')};
  const acceptText = ${getField('cornerAcceptText')};
  const learnMoreText = ${getField('cornerLearnMoreText')};
  const privacyPolicyUrl = ${getField('privacyPolicyUrl')};
  const bannerText = ${getField('bannerText')};

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
      // Auto-expand after 2 seconds
      setTimeout(() => setIsExpanded(true), 2000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    if (onAccept) {
      onAccept();
    } else {
      console.log('Cookies accepted');
    }
  };

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore();
    } else {
      window.open(privacyPolicyUrl, '_blank');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed z-50 m-4",
        position === 'bottom-right' ? 'bottom-0 right-0' : 'bottom-0 left-0',
        "animate-in slide-in-from-bottom duration-500",
        className
      )}
    >
      <div
        className={cn(
          "bg-white dark:bg-gray-900 rounded-lg shadow-2xl border dark:border-gray-700 transition-all duration-300",
          isExpanded ? "max-w-sm p-4" : "p-3"
        )}
      >
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Cookie className="h-5 w-5" />
            <span className="font-medium text-sm">{text}</span>
          </button>
        ) : (
          <div>
            <div className="flex items-start gap-3 mb-4">
              <Cookie className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {bannerText}
              </p>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleAccept}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                {acceptText}
              </button>
              <button
                onClick={handleLearnMore}
                className="w-full flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 transition-colors text-sm"
              >
                {learnMoreText}
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CornerCookieConsent;
    `
  };

  return variants[variant] || variants.banner;
};
