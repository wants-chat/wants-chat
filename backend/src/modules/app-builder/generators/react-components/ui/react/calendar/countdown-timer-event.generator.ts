import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCountdownTimerEvent = (
  resolved: ResolvedComponent,
  variant: 'card' | 'banner' | 'minimal' = 'card'
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
    return `/${dataSource || 'events'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'events';

  const variants = {
    card: `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerEventProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CountdownTimerEvent({ ${dataName}: propData, className }: CountdownTimerEventProps) {
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
  const timerData = ${dataName} || {};

  const eventName = ${getField('eventName')};
  const eventDescription = ${getField('eventDescription')};
  const targetDate = new Date(${getField('targetDate')});
  const expiredMessage = ${getField('expiredMessage')};
  const ctaButton = ${getField('ctaButton')};
  const ctaButtonExpired = ${getField('ctaButtonExpired')};
  const daysLabel = ${getField('daysLabel')};
  const hoursLabel = ${getField('hoursLabel')};
  const minutesLabel = ${getField('minutesLabel')};
  const secondsLabel = ${getField('secondsLabel')};

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

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  if (isLoading && !propData) {
    return (
      <section className={cn('bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </section>
    );
  }

  return (
    <section className={cn('bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 rounded-3xl p-8 lg:p-12 shadow-2xl border border-blue-400/30">
            {/* Event Info */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/30">
                <Calendar className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Upcoming Event</span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {eventName}
              </h2>
              <p className="text-lg text-white/90">
                {eventDescription}
              </p>
            </div>

            {/* Countdown */}
            {!timeLeft.expired ? (
              <div className="grid grid-cols-4 gap-4 mb-10">
                {[
                  { value: timeLeft.days, label: daysLabel },
                  { value: timeLeft.hours, label: hoursLabel },
                  { value: timeLeft.minutes, label: minutesLabel },
                  { value: timeLeft.seconds, label: secondsLabel }
                ].map((unit, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                      {String(unit.value).padStart(2, '0')}
                    </div>
                    <div className="text-sm text-white/80">{unit.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 mb-10">
                <div className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {expiredMessage}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={handleCtaClick}
                className="group bg-gradient-to-r from-white via-gray-50 to-white hover:from-gray-100 hover:via-white hover:to-gray-100 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-2 border border-white/50"
              >
                {timeLeft.expired ? ctaButtonExpired : ctaButton}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
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
import { X, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerEventProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CountdownTimerEvent({ ${dataName}: propData, className }: CountdownTimerEventProps) {
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
  const timerData = ${dataName} || {};

  const eventNameShort = ${getField('eventNameShort')};
  const targetDateShort = new Date(${getField('targetDateShort')});
  const expiredMessageAlt = ${getField('expiredMessageAlt')};
  const ctaButtonAlt = ${getField('ctaButtonAlt')};

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
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
  }, [targetDateShort]);

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (isLoading && !propData) {
    return (
      <div className={cn('bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div className={cn('bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-800 dark:via-purple-800 dark:to-pink-800 relative shadow-xl border-b border-white/20', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Event Info */}
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-white" />
            <div className="text-white">
              <span className="font-bold">{eventNameShort}</span>
              {!timeLeft.expired ? (
                <span className="ml-2">
                  starts in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </span>
              ) : (
                <span className="ml-2">{expiredMessageAlt}</span>
              )}
            </div>
          </div>

          {/* Countdown + CTA */}
          <div className="flex items-center gap-4">
            {!timeLeft.expired && (
              <div className="flex gap-2">
                {[
                  { value: timeLeft.days, label: 'd' },
                  { value: timeLeft.hours, label: 'h' },
                  { value: timeLeft.minutes, label: 'm' },
                  { value: timeLeft.seconds, label: 's' }
                ].map((unit, index) => (
                  <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 min-w-[3rem] text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/30">
                    <div className="text-lg font-bold text-white">
                      {String(unit.value).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-white/80">{unit.label}</div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleCtaClick}
              className="bg-gradient-to-r from-white via-gray-50 to-white hover:from-gray-100 hover:via-white hover:to-gray-100 text-gray-900 px-6 py-2 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap border border-white/50"
            >
              {ctaButtonAlt}
            </button>

            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-all duration-300 hover:scale-110 ml-2 rounded-lg p-1 hover:bg-white/10"
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

    minimal: `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerEventProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CountdownTimerEvent({ ${dataName}: propData, className }: CountdownTimerEventProps) {
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
  const timerData = ${dataName} || {};

  const eventName = ${getField('eventName')};
  const targetDateSoon = new Date(${getField('targetDateSoon')});
  const expiredMessage = ${getField('expiredMessage')};

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
      const target = targetDateSoon.getTime();
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
  }, [targetDateSoon]);

  if (isLoading && !propData) {
    return (
      <section className={cn('bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </section>
    );
  }

  return (
    <section className={cn('bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/20 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-purple-200 dark:via-purple-300 dark:to-purple-200 bg-clip-text text-transparent mb-8">
            {eventName}
          </h2>

          {!timeLeft.expired ? (
            <div className="inline-flex items-center gap-2 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-50 dark:from-purple-900/30 dark:via-purple-800/40 dark:to-purple-900/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200/50 dark:border-purple-700/50">
                <span className="bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-purple-200 dark:via-purple-300 dark:to-purple-200 bg-clip-text text-transparent">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400">days</span>
              </div>
              <span className="text-purple-400">:</span>
              <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-50 dark:from-purple-900/30 dark:via-purple-800/40 dark:to-purple-900/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200/50 dark:border-purple-700/50">
                <span className="bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-purple-200 dark:via-purple-300 dark:to-purple-200 bg-clip-text text-transparent">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400">hours</span>
              </div>
              <span className="text-purple-400">:</span>
              <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-50 dark:from-purple-900/30 dark:via-purple-800/40 dark:to-purple-900/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200/50 dark:border-purple-700/50">
                <span className="bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-purple-200 dark:via-purple-300 dark:to-purple-200 bg-clip-text text-transparent">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400">mins</span>
              </div>
              <span className="text-purple-400">:</span>
              <div className="flex flex-col items-center bg-gradient-to-br from-purple-50 via-purple-100/50 to-purple-50 dark:from-purple-900/30 dark:via-purple-800/40 dark:to-purple-900/30 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-200/50 dark:border-purple-700/50">
                <span className="bg-gradient-to-r from-purple-900 via-purple-700 to-purple-900 dark:from-purple-200 dark:via-purple-300 dark:to-purple-200 bg-clip-text text-transparent">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400">secs</span>
              </div>
            </div>
          ) : (
            <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">
              {expiredMessage}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
    `
  };

  return variants[variant] || variants.card;
};
