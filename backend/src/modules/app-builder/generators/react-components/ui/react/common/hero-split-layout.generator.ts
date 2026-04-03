import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHeroSplitLayout = (
  resolved: ResolvedComponent,
  variant: 'left' | 'right' | 'centered' = 'left'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `propData?.${fieldName} || ({} as any)`;
    }
    return `propData?.${fieldName} || ''`;
  };

  const sanitizeVariableName = (name: string): string => {
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
    left: `
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroSplitLayoutProps_0 {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function HeroSplitLayout({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: HeroSplitLayoutProps_0) {
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
  const text = ${getField('text')};
  const ctaButton = ${getField('ctaButton')};
  const ctaButtonSecondary = ${getField('ctaButtonSecondary')};
  const image = ${getField('image')};
  const features = ${getField('features')};

  const handlePrimaryClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryClick = () => {
    console.log('Secondary CTA clicked');
  };

  return (
    <section className={cn('relative overflow-hidden py-20 lg:py-32', styles.background, className)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[size:50px_50px] opacity-5"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            <div className={\`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-8 \${styles.badge}\`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'currentColor' }}></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: 'currentColor' }}></span>
              </span>
              New Platform Available
            </div>

            <h1 className={\`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] \${styles.title}\`}>
              {heading}
            </h1>

            <p className={\`text-xl md:text-2xl mb-10 leading-relaxed \${styles.subtitle}\`}>
              {text}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                className={\`group px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 \${styles.button} \${styles.buttonHover}\`}
                onClick={handlePrimaryClick}
              >
                {ctaButton}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className={\`border-2 px-8 py-4 rounded-xl font-bold text-lg transition-all \${styles.border} \${styles.text}\`}
                onClick={handleSecondaryClick}
              >
                {ctaButtonSecondary}
              </button>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-3 group">
                  <div className={\`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform \${styles.badge}\`}>
                    <CheckCircle className={\`w-4 h-4 \${styles.accent}\`} />
                  </div>
                  <span className={\`text-lg \${styles.text}\`}>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative z-10">
              <div className={cn(styles.card, 'relative rounded-2xl overflow-hidden shadow-2xl hover:scale-105 transition-transform duration-500')}>
                <img
                  src={image}
                  alt="Product showcase"
                  className="w-full h-auto object-cover"
                />
                <div className={cn('absolute inset-0 opacity-10', styles.gradient)}></div>
              </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-10 right-10 w-80 h-80 bg-current opacity-10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-current opacity-10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
}
    `,

    right: `
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroSplitLayoutProps_1 {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function HeroSplitLayout({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: HeroSplitLayoutProps_1) {
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

  const headingShort = ${getField('headingShort')};
  const textShort = ${getField('textShort')};
  const ctaButtonAlt = ${getField('ctaButtonAlt')};
  const illustrationAlt = ${getField('illustrationAlt')};
  const stats = ${getField('stats')};
  const trustedBy = ${getField('trustedBy')};
  const companies = ${getField('companies')};

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  return (
    <section className={cn('py-20 lg:py-32', styles.background, className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={illustrationAlt}
                alt="Product illustration"
                className={cn(styles.card, 'w-full h-auto rounded-2xl shadow-2xl')}
              />

              {/* Floating Stats Card */}
              <div className={cn(styles.card, 'absolute -bottom-6 -right-6 rounded-2xl shadow-2xl p-6')}>
                <div className="grid grid-cols-3 gap-6">
                  {stats.map((stat: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className={\`text-2xl font-bold mb-1 \${styles.title}\`}>
                        {stat.value}
                      </div>
                      <div className={\`text-xs \${styles.subtitle}\`}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -top-8 -left-8 w-72 h-72 bg-current opacity-10 rounded-full blur-3xl -z-10"></div>
          </div>

          {/* Right Content */}
          <div>
            <h1 className={\`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] \${styles.title}\`}>
              {headingShort}
            </h1>

            <p className={\`text-lg md:text-xl mb-8 leading-relaxed \${styles.subtitle}\`}>
              {textShort}
            </p>

            {/* CTA Button */}
            <button
              className={\`group px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center gap-2 mb-12 \${styles.button} \${styles.buttonHover}\`}
              onClick={handleCtaClick}
            >
              {ctaButtonAlt}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Trust Indicators */}
            <div className={\`border-t pt-8 \${styles.border}\`}>
              <p className={\`text-sm mb-4 \${styles.subtitle}\`}>{trustedBy}</p>
              <div className="flex flex-wrap gap-6">
                {companies.map((company: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={cn(styles.badge, 'w-8 h-8 rounded-lg flex items-center justify-center')}>
                      <span className="font-bold text-sm">{company.initial}</span>
                    </div>
                    <span className={\`font-medium text-sm \${styles.text}\`}>
                      {company.name}
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

    centered: `
import { ArrowRight, CheckCircle, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HeroSplitLayoutProps_2 {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function HeroSplitLayout({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}: HeroSplitLayoutProps_2) {
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
  const textDetailed = ${getField('textDetailed')};
  const ctaButton = ${getField('ctaButton')};
  const ctaButtonSecondary = ${getField('ctaButtonSecondary')};
  const image = ${getField('image')};
  const features = ${getField('features')};

  const handlePrimaryClick = () => {
    console.log('Primary CTA clicked');
  };

  const handleSecondaryClick = () => {
    console.log('Secondary CTA clicked');
  };

  return (
    <section className={cn('relative overflow-hidden py-20 lg:py-32', styles.background, className)}>
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-current opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-current opacity-5 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className={\`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8 \${styles.badge}\`}>
            <Star className={\`w-4 h-4 fill-current \${styles.accent}\`} />
            <span className="text-sm font-medium">
              Rated 4.9/5 by 10,000+ users
            </span>
          </div>

          <h1 className={\`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] \${styles.title}\`}>
            {headingDetailed}
          </h1>

          <p className={\`text-lg md:text-xl mb-10 leading-relaxed \${styles.subtitle}\`}>
            {textDetailed}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <button
              className={\`group px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 \${styles.button} \${styles.buttonHover}\`}
              onClick={handlePrimaryClick}
            >
              {ctaButton}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              className={\`border-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all \${styles.border} \${styles.text}\`}
              onClick={handleSecondaryClick}
            >
              {ctaButtonSecondary}
            </button>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6">
            {features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className={\`w-4 h-4 \${styles.accent}\`} />
                <span className={styles.text}>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Centered Image */}
        <div className="relative max-w-5xl mx-auto">
          <div className={cn(styles.card, 'relative z-10 rounded-2xl overflow-hidden shadow-2xl')}>
            <img
              src={image}
              alt="Product showcase"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-8 -left-8 w-32 h-32 bg-current opacity-10 rounded-2xl blur-2xl -z-10"></div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-current opacity-10 rounded-2xl blur-2xl -z-10"></div>
        </div>
      </div>
    </section>
  );
}
    `
  };

  return variants[variant] || variants.left;
};
