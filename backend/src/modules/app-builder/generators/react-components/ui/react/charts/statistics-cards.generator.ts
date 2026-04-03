import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateStatisticsCards = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'gradient' | 'icon' = 'simple'
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
    return `/${dataSource || 'statistics'}`;
  };

  const apiRoute = getApiRoute();

  const variants = {
    simple: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, UserPlus, Briefcase, DollarSign, MessageSquare, Eye, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { api } from '@/lib/api';

interface Statistic {
  title: string;
  value: string;
  icon: string;
  backgroundColor: string;
  supportingText: string;
  progress: number;
  actionLink: string;
}

interface StatisticsCardsProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  ${dataName}: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  const styles = getVariantStyles(variant, colorScheme);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'statistics'}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response : (response?.data || response?.statistics || []);
      } catch (err) {
        console.error('Failed to fetch statistics:', err);
        return [];
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const statisticsData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("w-full space-y-6", className)}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading statistics...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !propData) {
    return (
      <div className={cn("w-full space-y-6", className)}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center text-red-500">
            <p>Failed to load statistics. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const statistics: Statistic[] = Array.isArray(statisticsData) ? statisticsData : (${getField('statistics')} || []);
  const sectionTitle = ${getField('sectionTitle')};
  const viewDetailsLabel = ${getField('viewDetailsLabel')};

  const iconMap: any = {
    ShoppingCart,
    UserPlus,
    Briefcase,
    DollarSign,
    MessageSquare,
    Eye
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      <h2 className={\`text-2xl font-bold \${styles.title}\`}>{sectionTitle}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statistics.map((stat, index) => {
          const Icon = iconMap[stat.icon] || ShoppingCart;

          return (
            <div key={index} className={cn(styles.card, styles.cardHover, 'rounded-xl p-6 transition-all')}>
              <div className="pb-3">
                <div className={\`text-sm font-bold \${styles.subtitle}\`}>
                  {stat.title}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={\`text-3xl font-bold \${styles.title}\`}>
                    {stat.value}
                  </div>
                  <div className={\`p-3 rounded-full \${styles.badge}\`}>
                    <Icon className={\`h-6 w-6 \${styles.accent}\`} />
                  </div>
                </div>

                <p className={styles.text}>
                  {stat.supportingText}
                </p>

                <button className={\`flex items-center text-sm font-bold hover:underline transition-all \${styles.accent}\`}>
                  {viewDetailsLabel}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatisticsCards;
    `,

    gradient: `
import React from 'react';
import { ShoppingCart, UserPlus, Briefcase, DollarSign, MessageSquare, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface Statistic {
  title: string;
  value: string;
  icon: string;
  backgroundColor: string;
  supportingText: string;
  progress: number;
  actionLink: string;
}

interface StatisticsCardsProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  ${dataName},
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  const styles = getVariantStyles(variant, colorScheme);
  const statisticsData = ${dataName} || {};

  const statistics: Statistic[] = ${getField('statistics')};
  const sectionTitle = ${getField('sectionTitle')};
  const sectionSubtitle = ${getField('sectionSubtitle')};

  const iconMap: any = {
    ShoppingCart,
    UserPlus,
    Briefcase,
    DollarSign,
    MessageSquare,
    Eye
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      <div className="mb-8">
        <h2 className={\`text-3xl font-bold mb-2 \${styles.title}\`}>{sectionTitle}</h2>
        <p className={styles.subtitle}>{sectionSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statistics.map((stat, index) => {
          const Icon = iconMap[stat.icon] || ShoppingCart;

          return (
            <div
              key={index}
              className={cn(
                "relative overflow-hidden rounded-2xl shadow-xl transition-all hover:scale-105",
                styles.background,
                styles.gradient
              )}
            >
              <div className="absolute top-0 right-0 opacity-20">
                <Icon className="h-32 w-32 transform translate-x-8 -translate-y-8" />
              </div>

              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className={\`text-sm font-bold mb-2 \${styles.subtitle}\`}>{stat.title}</p>
                    <div className={\`text-4xl font-bold \${styles.title}\`}>{stat.value}</div>
                  </div>
                  <div className={cn(styles.badge, 'p-3 backdrop-blur-sm rounded-full')}>
                    <Icon className={\`h-6 w-6 \${styles.accent}\`} />
                  </div>
                </div>

                <p className={\`text-sm mb-4 font-medium \${styles.text}\`}>{stat.supportingText}</p>

                <div className="w-full bg-current/20 rounded-full h-2">
                  <div
                    className={cn(styles.badge, 'rounded-full h-2 transition-all')}
                    style={{ width: \`\${stat.progress}%\` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatisticsCards;
    `,

    icon: `
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, UserPlus, Briefcase, DollarSign, MessageSquare, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface Statistic {
  title: string;
  value: string;
  icon: string;
  backgroundColor: string;
  supportingText: string;
  progress: number;
  actionLink: string;
}

interface StatisticsCardsProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  ${dataName},
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  const styles = getVariantStyles(variant, colorScheme);
  const statisticsData = ${dataName} || {};

  const statistics: Statistic[] = ${getField('statistics')};
  const sectionTitle = ${getField('sectionTitle')};
  const progressLabel = ${getField('progressLabel')};

  const iconMap: any = {
    ShoppingCart,
    UserPlus,
    Briefcase,
    DollarSign,
    MessageSquare,
    Eye
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      <h2 className={\`text-2xl font-bold \${styles.title}\`}>{sectionTitle}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statistics.map((stat, index) => {
          const Icon = iconMap[stat.icon] || ShoppingCart;

          return (
            <div key={index} className={cn(styles.card, styles.cardHover, 'rounded-xl p-6 transition-all border-t-4', styles.border)}>
              <div className="flex items-start justify-between mb-6">
                <div className={cn(styles.badge, 'p-4 rounded-full')}>
                  <Icon className={\`h-8 w-8 \${styles.accent}\`} />
                </div>
              </div>

              <div className="space-y-3">
                <div className={\`text-sm font-bold \${styles.subtitle}\`}>
                  {stat.title}
                </div>
                <div className={\`text-3xl font-bold \${styles.title}\`}>
                  {stat.value}
                </div>
                <div className={styles.text}>
                  {stat.supportingText}
                </div>

                <div className="pt-3">
                  <div className={\`flex items-center justify-between text-xs mb-2 font-bold \${styles.subtitle}\`}>
                    <span>{progressLabel}</span>
                    <span>{stat.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={cn(styles.badge, 'rounded-full h-2 transition-all')}
                      style={{ width: \`\${stat.progress}%\` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatisticsCards;
    `
  };

  return variants[variant] || variants.simple;
};
