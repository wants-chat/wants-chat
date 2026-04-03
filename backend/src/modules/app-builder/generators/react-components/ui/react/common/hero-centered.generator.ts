import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHeroCentered = (
  resolved: ResolvedComponent,
  variant: 'minimal' | 'detailed' | 'withBadges' = 'minimal'
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
    minimal: `
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroCenteredProps_0 {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function HeroCentered({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: HeroCenteredProps_0) {
  const styles = getVariantStyles(variant, colorScheme);

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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const heroData = ${dataName} || {};

  const headingMinimal = ${getField('headingMinimal')};
  const supportingTextShort = ${getField('supportingTextShort')};
  const primaryCta = ${getField('primaryCta')};
  const secondaryCta = ${getField('secondaryCta')};
  const featureItems = ${getField('features')};

  const handlePrimaryClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryClick = () => {
    console.log('Secondary CTA clicked');
  };

  return (
    <section className={cn('relative overflow-hidden py-20 lg:py-32', styles.background, styles.gradient, className)}>
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[size:40px_40px] opacity-5"></div>
      <div className="absolute top-40 left-20 w-80 h-80 bg-current opacity-10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-40 right-20 w-80 h-80 bg-current opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className={\`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] \${styles.title}\`}>
          {headingMinimal}
        </h1>

        <p className={\`text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed \${styles.subtitle}\`}>
          {supportingTextShort}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <button
            className={\`group px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 \${styles.button} \${styles.buttonHover}\`}
            onClick={handlePrimaryClick}
          >
            {primaryCta}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            className={\`px-8 py-4 rounded-xl font-bold text-lg transition-all border-2 \${styles.border} \${styles.text}\`}
            onClick={handleSecondaryClick}
          >
            {secondaryCta}
          </button>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
          {featureItems.map((feature: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className={\`w-5 h-5 \${styles.accent}\`} />
              <span className={styles.text}>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
    `,

    detailed: `
import { ArrowRight, Star, TrendingUp, Users, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroCenteredProps_1 {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function HeroCentered({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: HeroCenteredProps_1) {
  const styles = getVariantStyles(variant, colorScheme);

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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const heroData = ${dataName} || {};

  const heading = ${getField('heading')};
  const supportingText = ${getField('supportingText')};
  const primaryCtaAlt = ${getField('primaryCtaAlt')};
  const secondaryCtaAlt = ${getField('secondaryCtaAlt')};
  const rating = ${getField('rating')};
  const ratingCount = ${getField('ratingCount')};
  const stats = ${getField('stats')};
  const trustText = ${getField('trustText')};
  const customerLogos = ${getField('customerLogos')};

  const handlePrimaryClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryClick = () => {
    console.log('Secondary CTA clicked');
  };

  return (
    <section className={cn('relative overflow-hidden py-20 lg:py-32', styles.background, className)}>
      {/* Gradient Background */}
      <div className="absolute inset-0">
        <div className={\`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-20 \${styles.gradient}\`}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Rating Badge */}
        <div className={\`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 \${styles.badge}\`}>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-sm font-medium">
            {rating} · {ratingCount}
          </span>
        </div>

        <h1 className={\`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] \${styles.title}\`}>
          {heading}
        </h1>

        <p className={\`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed \${styles.subtitle}\`}>
          {supportingText}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            className={\`group px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 \${styles.button} \${styles.buttonHover}\`}
            onClick={handlePrimaryClick}
          >
            {primaryCtaAlt}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            className={\`border-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all \${styles.border} \${styles.text}\`}
            onClick={handleSecondaryClick}
          >
            {secondaryCtaAlt}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
          {stats.map((stat: any, index: number) => {
            const icons = [TrendingUp, Users, Zap];
            const Icon = icons[index % icons.length];
            return (
              <div
                key={index}
                className={cn(styles.card, styles.cardHover, 'rounded-2xl p-6')}
              >
                <div className={\`inline-flex p-3 rounded-xl mb-4 \${styles.badge}\`}>
                  <Icon className={\`w-6 h-6 \${styles.accent}\`} />
                </div>
                <div className={\`text-3xl font-bold mb-2 \${styles.title}\`}>
                  {stat.value}
                </div>
                <div className={styles.subtitle}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Customer Logos */}
        <div className={\`border-t pt-12 \${styles.border}\`}>
          <p className={\`text-sm mb-6 \${styles.subtitle}\`}>{trustText}</p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {customerLogos.map((logo: any, index: number) => (
              <div key={index} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <div className={\`w-8 h-8 rounded-lg flex items-center justify-center \${styles.badge}\`}>
                  <span className="font-bold text-sm">{logo.initial}</span>
                </div>
                <span className={\`font-semibold \${styles.text}\`}>{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    withBadges: `
import { ArrowRight, Shield, Award, Users, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroCenteredProps_2 {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function HeroCentered({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: HeroCenteredProps_2) {
  const styles = getVariantStyles(variant, colorScheme);

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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const heroData = ${dataName} || {};

  const headingDetailed = ${getField('headingDetailed')};
  const supportingTextDetailed = ${getField('supportingTextDetailed')};
  const primaryCta = ${getField('primaryCta')};
  const secondaryCta = ${getField('secondaryCta')};
  const badges = ${getField('badges')};
  const featureItems = ${getField('features')};

  const iconMap: any = {
    Shield: Shield,
    Award: Award,
    Users: Users,
    Zap: Zap
  };

  const handlePrimaryClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryClick = () => {
    console.log('Secondary CTA clicked');
  };

  return (
    <section className={cn('relative overflow-hidden py-20 lg:py-32', styles.background, className)}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse opacity-20" style={{ background: 'currentColor' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse opacity-20" style={{ animationDelay: '1s', background: 'currentColor' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className={\`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 \${styles.badge}\`}>
          <span className="relative flex h-2 w-2">
            <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 \${styles.accent}\`} style={{ background: 'currentColor' }}></span>
            <span className={\`relative inline-flex rounded-full h-2 w-2 \${styles.accent}\`} style={{ background: 'currentColor' }}></span>
          </span>
          <span className="text-sm font-medium">
            Launching New Features
          </span>
        </div>

        <h1 className={\`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1] \${styles.title}\`}>
          {headingDetailed}
        </h1>

        <p className={\`text-xl md:text-2xl mb-12 max-w-4xl mx-auto leading-relaxed \${styles.subtitle}\`}>
          {supportingTextDetailed}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            className={\`group px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 \${styles.button} \${styles.buttonHover}\`}
            onClick={handlePrimaryClick}
          >
            {primaryCta}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            className={\`border-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all \${styles.border} \${styles.text}\`}
            onClick={handleSecondaryClick}
          >
            {secondaryCta}
          </button>
        </div>

        {/* Features */}
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm mb-16">
          {featureItems.map((feature: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className={\`w-4 h-4 \${styles.accent}\`} />
              <span className={styles.text}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {badges.map((badge: any, index: number) => {
            const Icon = iconMap[badge.icon] || Shield;
            return (
              <div
                key={index}
                className={cn(styles.card, styles.cardHover, 'rounded-xl p-6')}
              >
                <div className={\`inline-flex p-3 rounded-xl mb-3 \${styles.badge}\`}>
                  <Icon className={\`w-6 h-6 \${styles.accent}\`} />
                </div>
                <div className={\`text-sm font-medium \${styles.title}\`}>
                  {badge.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
    `
  };

  return variants[variant] || variants.minimal;
};
