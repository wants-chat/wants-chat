import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCtaBlock = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'boxed' | 'banner' = 'simple'
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

  const variants = {
    simple: `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CtaBlockProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CtaBlock({ ${dataName}: propData, className }: CtaBlockProps) {
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

  const ctaData = ${dataName} || {};

  const headingSimple = ${getField('headingSimple')};
  const textShort = ${getField('textShort')};
  const primaryButton = ${getField('primaryButton')};
  const secondaryLink = ${getField('secondaryLink')};

  const handlePrimaryClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryClick = () => {
    console.log('Secondary CTA clicked');
  };

  return (
    <section className={cn('bg-white dark:bg-gray-900', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            {headingSimple}
          </h2>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {textShort}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              className="group bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all flex items-center gap-2"
              onClick={handlePrimaryClick}
            >
              {primaryButton}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-lg transition-colors"
              onClick={handleSecondaryClick}
            >
              {secondaryLink} →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    boxed: `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CtaBlockProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CtaBlock({ ${dataName}: propData, className }: CtaBlockProps) {
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

  const ctaData = ${dataName} || {};

  const heading = ${getField('heading')};
  const text = ${getField('text')};
  const primaryButton = ${getField('primaryButton')};
  const secondaryLink = ${getField('secondaryLink')};
  const features = ${getField('features')};
  const guarantee = ${getField('guarantee')};

  const handlePrimaryClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryClick = () => {
    console.log('Secondary CTA clicked');
  };

  return (
    <section className={cn('bg-gray-50 dark:bg-gray-800', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 items-center p-8 lg:p-12">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                {heading}
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                {text}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                  onClick={handlePrimaryClick}
                >
                  {primaryButton}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 dark:hover:border-gray-600 transition-all"
                  onClick={handleSecondaryClick}
                >
                  {secondaryLink}
                </button>
              </div>

              <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-full border border-green-200 dark:border-green-800">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>{guarantee}</span>
              </div>
            </div>

            {/* Right Features */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
              <div className="space-y-4">
                {features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    banner: `
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ArrowRight, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CtaBlockProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function CtaBlock({ ${dataName}: propData, className }: CtaBlockProps) {
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

  const ctaData = ${dataName} || {};

  const headingUrgent = ${getField('headingUrgent')};
  const textDetailed = ${getField('textDetailed')};
  const primaryButtonAlt = ${getField('primaryButtonAlt')};
  const urgencyText = ${getField('urgencyText')};
  const backgroundImage = ${getField('backgroundImage')};
  const stats = ${getField('stats')};

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <section className={cn('relative overflow-hidden', className)}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: \`url(\${backgroundImage})\` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-purple-900/90 to-pink-900/95 dark:from-blue-950/98 dark:via-purple-950/95 dark:to-pink-950/98"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center max-w-4xl mx-auto">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 backdrop-blur-sm border border-yellow-400/30 px-5 py-2 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
            </span>
            <span className="text-sm font-medium text-yellow-300">
              {urgencyText}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {headingUrgent}
          </h2>

          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {textDetailed}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-8">
            {stats.map((stat: any, index: number) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <button
            className="group bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all inline-flex items-center gap-2"
            onClick={handleCtaClick}
          >
            {primaryButtonAlt}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
    `
  };

  return variants[variant] || variants.simple;
};
