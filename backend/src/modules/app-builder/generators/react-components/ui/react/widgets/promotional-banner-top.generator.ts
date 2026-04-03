// @ts-nocheck
import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePromotionalBannerTop = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'withCountdown' | 'announcement' = 'simple'
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
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    simple: `
${commonImports}
import { X, ArrowRight, Loader2 } from 'lucide-react';

interface SimpleBannerProps {
  ${dataName}?: any;
  className?: string;
  sticky?: boolean;
  dismissible?: boolean;
  onCtaClick?: () => void;
  onDismiss?: () => void;
}

const SimplePromotionalBanner: React.FC<SimpleBannerProps> = ({
  ${dataName}: propData,
  className,
  sticky = ${getField('sticky')},
  dismissible = ${getField('dismissible')},
  onCtaClick,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bannerData = ${dataName} || {};

  const text = ${getField('simpleText')};
  const ctaText = ${getField('simpleCtaText')};
  const ctaUrl = ${getField('simpleCtaUrl')};
  const backgroundColor = ${getField('backgroundColor')};
  const textColor = ${getField('textColor')};

  useEffect(() => {
    const dismissed = localStorage.getItem('promotional-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('promotional-banner-dismissed', 'true');
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      console.log('CTA clicked:', ctaUrl);
      window.location.href = ctaUrl;
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div
      className={cn(
        "w-full py-3 px-4 transition-all duration-300",
        sticky && "sticky top-0 z-50 shadow-md",
        className
      )}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <p className="text-sm md:text-base font-bold text-center">
              {text}
            </p>
          </div>
          <button
            onClick={handleCtaClick}
            className="flex items-center gap-2 px-5 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            {ctaText}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SimplePromotionalBanner;
    `,

    withCountdown: `
${commonImports}
import { X, Clock, Loader2 } from 'lucide-react';

interface CountdownBannerProps {
  ${dataName}?: any;
  className?: string;
  sticky?: boolean;
  dismissible?: boolean;
  onCtaClick?: () => void;
  onDismiss?: () => void;
  onCountdownEnd?: () => void;
}

const CountdownPromotionalBanner: React.FC<CountdownBannerProps> = ({
  ${dataName}: propData,
  className,
  sticky = ${getField('sticky')},
  dismissible = ${getField('dismissible')},
  onCtaClick,
  onDismiss,
  onCountdownEnd
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bannerData = ${dataName} || {};

  const text = ${getField('countdownText')};
  const ctaText = ${getField('countdownCtaText')};
  const endTime = ${getField('countdownEndTime')};
  const backgroundColor = ${getField('backgroundColor')};
  const textColor = ${getField('textColor')};

  useEffect(() => {
    const dismissed = localStorage.getItem('promotional-banner-countdown-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime - Date.now();

      if (difference <= 0) {
        setIsVisible(false);
        if (onCountdownEnd) {
          onCountdownEnd();
        }
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [endTime, onCountdownEnd]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('promotional-banner-countdown-dismissed', 'true');
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      console.log('CTA clicked');
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "w-full py-3 px-4 transition-all duration-300",
        sticky && "sticky top-0 z-50 shadow-md",
        className
      )}
      style={{ backgroundColor, color: textColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-pulse" />
            <p className="text-sm md:text-base font-bold">
              {text}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg min-w-[3rem] text-center shadow-md border border-white/30">
                <span className="text-xl font-bold text-gray-900">{String(timeLeft.hours).padStart(2, '0')}</span>
                <p className="text-[10px] text-gray-600 font-medium mt-0.5">HRS</p>
              </div>
              <span className="font-bold text-lg">:</span>
              <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg min-w-[3rem] text-center shadow-md border border-white/30">
                <span className="text-xl font-bold text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <p className="text-[10px] text-gray-600 font-medium mt-0.5">MIN</p>
              </div>
              <span className="font-bold text-lg">:</span>
              <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg min-w-[3rem] text-center shadow-md border border-white/30">
                <span className="text-xl font-bold text-gray-900">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <p className="text-[10px] text-gray-600 font-medium mt-0.5">SEC</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCtaClick}
            className="flex items-center gap-2 px-6 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4" />
            {ctaText}
          </button>
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CountdownPromotionalBanner;
    `,

    announcement: `
${commonImports}
import { X, Info, CheckCircle, AlertTriangle, XCircle, ArrowRight, Loader2 } from 'lucide-react';

interface AnnouncementBannerProps {
  ${dataName}?: any;
  className?: string;
  sticky?: boolean;
  dismissible?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  onCtaClick?: () => void;
  onDismiss?: () => void;
}

const AnnouncementPromotionalBanner: React.FC<AnnouncementBannerProps> = ({
  ${dataName}: propData,
  className,
  sticky = ${getField('sticky')},
  dismissible = ${getField('dismissible')},
  type = ${getField('announcementType')},
  onCtaClick,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const bannerData = ${dataName} || {};

  const text = ${getField('announcementText')};
  const ctaText = ${getField('announcementCtaText')};

  useEffect(() => {
    const dismissed = localStorage.getItem('promotional-banner-announcement-dismissed');
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('promotional-banner-announcement-dismissed', 'true');
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      console.log('CTA clicked');
    }
  };

  if (!isVisible) return null;

  const typeConfig = {
    info: {
      bgGradient: 'bg-gradient-to-r from-blue-600 to-purple-600',
      icon: Info
    },
    success: {
      bgGradient: 'bg-gradient-to-r from-green-600 to-emerald-600',
      icon: CheckCircle
    },
    warning: {
      bgGradient: 'bg-gradient-to-r from-yellow-600 to-orange-600',
      icon: AlertTriangle
    },
    error: {
      bgGradient: 'bg-gradient-to-r from-red-600 to-pink-600',
      icon: XCircle
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "w-full py-4 px-4 transition-all duration-300 text-white shadow-lg",
        sticky && "sticky top-0 z-50 shadow-xl",
        config.bgGradient,
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-4">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <Icon className="h-5 w-5 flex-shrink-0" />
          </div>
          <p className="text-sm md:text-base font-bold text-center">
            {text}
          </p>
          {ctaText && (
            <button
              onClick={handleCtaClick}
              className="flex items-center gap-2 px-5 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 whitespace-nowrap"
            >
              {ctaText}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/30 rounded-full transition-all duration-300 hover:scale-110 flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AnnouncementPromotionalBanner;
    `
  };

  return variants[variant] || variants.simple;
};
