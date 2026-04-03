import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCountdownTimerOffer = (
  resolved: ResolvedComponent,
  variant: 'urgent' | 'banner' | 'inline' = 'urgent'
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
    return `/${dataSource || 'offers'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'offers';

  const variants = {
    urgent: `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AlertCircle, Clock, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerOfferProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CountdownTimerOffer({ ${dataName}: propData, className }: CountdownTimerOfferProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const offerData = ${dataName} || {};

  const offerTitleUrgent = ${getField('offerTitleUrgent')};
  const offerDescription = ${getField('offerDescription')};
  const targetDate = new Date(${getField('targetDate')});
  const discount = ${getField('discount')};
  const originalPrice = ${getField('originalPrice')};
  const salePrice = ${getField('salePrice')};
  const claimButton = ${getField('claimButton')};
  const expiredMessage = ${getField('expiredMessage')};
  const evergreenMode = ${getField('evergreenMode')};
  const evergreenDuration = ${getField('evergreenDuration')};

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  useEffect(() => {
    // Evergreen mode: set timer per user (using localStorage)
    let finalTargetDate = targetDate;

    if (evergreenMode) {
      const storedTime = localStorage.getItem('offerEndTime');
      if (storedTime) {
        finalTargetDate = new Date(storedTime);
      } else {
        finalTargetDate = new Date(Date.now() + evergreenDuration * 60 * 60 * 1000);
        localStorage.setItem('offerEndTime', finalTargetDate.toISOString());
      }
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = finalTargetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      setTimeLeft({
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, evergreenMode, evergreenDuration]);

  const handleClaimClick = () => {
    console.log('Claim offer clicked');
  };

  if (isLoading && !propData) {
    return (
      <section className={cn('bg-gradient-to-br from-red-600 via-red-700 to-red-800 dark:from-red-900 dark:via-red-950 dark:to-black relative overflow-hidden', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      </section>
    );
  }

  return (
    <section className={cn('bg-gradient-to-br from-red-600 via-red-700 to-red-800 dark:from-red-900 dark:via-red-950 dark:to-black relative overflow-hidden', className)}>
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-900 px-5 py-2 rounded-full font-bold text-sm mb-8 animate-bounce">
            <Zap className="w-4 h-4" />
            <span>LIMITED TIME ONLY</span>
          </div>

          {/* Offer Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
            {offerTitleUrgent}
          </h2>

          {/* Discount Badge */}
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl px-8 py-4 mb-8">
            <div className="text-5xl font-black text-yellow-400">{discount}</div>
            <div className="text-left">
              <div className="text-2xl font-bold text-white line-through opacity-60">
                {originalPrice}
              </div>
              <div className="text-3xl font-black text-white">{salePrice}</div>
            </div>
          </div>

          <p className="text-xl text-white/90 mb-10">
            {offerDescription}
          </p>

          {/* Countdown Timer */}
          {!timeLeft.expired ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-8">
                <Clock className="w-6 h-6 text-yellow-400" />
                <span className="text-lg font-semibold text-white">Offer ends in:</span>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
                {[
                  { value: timeLeft.hours, label: 'Hours' },
                  { value: timeLeft.minutes, label: 'Minutes' },
                  { value: timeLeft.seconds, label: 'Seconds' }
                ].map((unit, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-6">
                    <div className="text-5xl font-black text-white mb-2">
                      {String(unit.value).padStart(2, '0')}
                    </div>
                    <div className="text-sm font-semibold text-white/80">{unit.label}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 mb-10">
              <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <div className="text-3xl font-bold text-white">{expiredMessage}</div>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleClaimClick}
            className="group bg-yellow-400 hover:bg-yellow-300 text-red-900 px-10 py-5 rounded-xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-3"
          >
            <span>{claimButton}</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Trust Indicator */}
          <div className="mt-8 text-sm text-white/80">
            ✓ No credit card required · ✓ Cancel anytime
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    banner: `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { X, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerOfferProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CountdownTimerOffer({ ${dataName}: propData, className }: CountdownTimerOfferProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const offerData = ${dataName} || {};

  const offerTitleUrgent = ${getField('offerTitleUrgent')};
  const targetDateShort = new Date(${getField('targetDateShort')});
  const discount = ${getField('discount')};
  const claimButtonAlt = ${getField('claimButtonAlt')};
  const expiredMessageAlt = ${getField('expiredMessageAlt')};

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDateShort.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      setTimeLeft({
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDateShort]);

  const handleClaimClick = () => {
    console.log('Claim offer clicked');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (isLoading && !propData) {
    return (
      <div className={cn('bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-800 dark:to-pink-800', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      </div>
    );
  }

  if (!isVisible || timeLeft.expired) return null;

  return (
    <div className={cn('bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-800 dark:to-pink-800', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Offer Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-red-900" />
            </div>
            <div className="text-white">
              <span className="font-bold text-lg">{offerTitleUrgent}</span>
              <span className="hidden md:inline ml-2 opacity-90">- Limited time only!</span>
            </div>
          </div>

          {/* Timer + CTA */}
          <div className="flex items-center gap-4">
            {/* Discount Badge */}
            <div className="bg-yellow-400 text-red-900 px-4 py-2 rounded-lg font-black text-lg">
              {discount} OFF
            </div>

            {/* Countdown */}
            <div className="flex gap-1">
              {[
                { value: timeLeft.hours, label: 'h' },
                { value: timeLeft.minutes, label: 'm' },
                { value: timeLeft.seconds, label: 's' }
              ].map((unit, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 min-w-[2.5rem] text-center">
                  <div className="text-lg font-bold text-white">
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-white/80">{unit.label}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleClaimClick}
              className="bg-yellow-400 hover:bg-yellow-300 text-red-900 px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap"
            >
              {claimButtonAlt}
            </button>

            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    inline: `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Clock, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerOfferProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CountdownTimerOffer({ ${dataName}: propData, className }: CountdownTimerOfferProps) {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const offerData = ${dataName} || {};

  const offerTitle = ${getField('offerTitle')};
  const offerDescriptionShort = ${getField('offerDescriptionShort')};
  const targetDate = new Date(${getField('targetDate')});
  const savings = ${getField('savings')};
  const claimButton = ${getField('claimButton')};
  const claimButtonExpired = ${getField('claimButtonExpired')};

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        expired: false
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const handleClaimClick = () => {
    console.log('Claim offer clicked');
  };

  if (isLoading && !propData) {
    return (
      <div className={cn('bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex items-center justify-center', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6', className)}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Offer Info */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Clock className="w-3 h-3" />
            <span>Limited Offer</span>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {offerTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {offerDescriptionShort}
          </p>

          {!timeLeft.expired ? (
            <div className="inline-flex items-center gap-4 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Offer ends in:
              </span>
              <div className="flex gap-2 text-lg font-bold text-gray-900 dark:text-white">
                <span>{String(timeLeft.days).padStart(2, '0')}d</span>
                <span className="text-gray-400">:</span>
                <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span className="text-gray-400">:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span className="text-gray-400">:</span>
                <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          ) : (
            <div className="text-red-600 dark:text-red-400 font-semibold">
              Offer expired
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="flex flex-col items-end gap-3">
          <div className="text-3xl font-black text-red-600 dark:text-red-400">
            {savings}
          </div>
          <button
            onClick={handleClaimClick}
            className="group bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
          >
            {timeLeft.expired ? claimButtonExpired : claimButton}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.urgent;
};
