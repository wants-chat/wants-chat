import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateStatCard = (
  resolved: ResolvedComponent,
  variant: 'singleStat' | 'statCardBasic' | 'statsCardSimple' | 'statsCardWithIcons' | 'statsCardNumbered' | 'statsCardElevated' = 'singleStat'
) => {
  const dataSource = resolved.dataSource;
  
  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || propData?._id`;
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

  // Parse data source for clean prop naming
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
    return `/${dataSource || 'stats'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Award, Users, Smile, Briefcase, DollarSign, ShoppingBag, Package, Truck, Star, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';`;

  const variants = {
    singleStat: `
${commonImports}

interface StatCardProps {
  ${dataName}?: any;
  title?: string;
  icon?: string;
  color?: string;
  format?: 'number' | 'currency' | 'percentage' | 'rating';
  className?: string;
  entity?: string;
  [key: string]: any;
}

const StatCard: React.FC<StatCardProps> = ({
  ${dataName}: propData,
  title,
  icon,
  color = 'blue',
  format = 'number',
  entity = '${dataSource || 'stats'}',
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity, title],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response[0] : (response?.data?.[0] || response);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return null;
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const sourceData = propData || fetchedData || {};
  const value = sourceData?.count || sourceData?.total || sourceData?.value || 0;

  if (isLoading && !propData) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-6 flex items-center justify-center min-h-[100px]">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const formatValue = (val: number) => {
    if (!val && val !== 0) return '0';

    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(val);
    }

    if (format === 'percentage') {
      return \`\${val}%\`;
    }

    if (format === 'rating') {
      return \`\${val.toFixed(1)} ⭐\`;
    }

    // Format large numbers with commas
    return new Intl.NumberFormat('en-US').format(val);
  };

  const iconMap: any = {
    'shopping-bag': ShoppingBag,
    'dollar-sign': DollarSign,
    'package': Package,
    'truck': Truck,
    'users': Users,
    'trending-up': TrendingUp,
    'award': Award,
    'briefcase': Briefcase,
    'star': Star,
    'check-circle': CheckCircle,
  };

  const colorMap: any = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  const Icon = iconMap[icon || 'trending-up'] || TrendingUp;
  const gradient = colorMap[color] || colorMap.blue;

  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title || 'Stat'}
            </p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatValue(value)}
            </h3>
          </div>
          <div className={\`p-3 rounded-full bg-gradient-to-br \${gradient}\`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
    `,

    statCardBasic: `
${commonImports}

interface Stat {
  value: string;
  label: string;
  description: string;
  icon: string;
}

interface StatsCardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  [key: string]: any;
}

const StatsCardComponent: React.FC<StatsCardProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'stats'}',
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const statsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className={cn("w-full flex items-center justify-center min-h-[200px]", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const title = ${getField('titleAchievements')};
  const subtitle = ${getField('subtitle')};
  const stats: Stat[] = ${getField('statsBasic')};

  const iconMap: any = {
    Users: Users,
    TrendingUp: TrendingUp,
    Award: Award,
    Smile: Smile,
    Briefcase: Briefcase,
    DollarSign: DollarSign,
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-700 dark:via-blue-800 dark:to-indigo-900 py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {title}
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => {
              const Icon = iconMap[stat.icon] || Users;
              return (
                <div
                  key={index}
                  className="bg-white/10 dark:bg-black/20 backdrop-blur-lg rounded-2xl p-8 border-2 border-white/20 hover:bg-white/15 dark:hover:bg-black/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="flex flex-col items-center text-center text-white">
                    <div className="mb-4 p-3 bg-gradient-to-br from-white/20 to-white/10 rounded-full shadow-lg border-2 border-white/30">
                      <Icon className="w-12 h-12" />
                    </div>
                    <div className="text-4xl md:text-5xl font-bold mb-2">
                      {stat.value}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">
                      {stat.label}
                    </h3>
                    <p className="text-sm text-blue-100 leading-relaxed">
                      {stat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCardComponent;
    `,

    statsCardSimple: `
${commonImports}

interface Stat {
  value: string;
  label: string;
}

interface StatsCardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  [key: string]: any;
}

const StatsCardComponent: React.FC<StatsCardProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'stats'}',
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const statsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className={cn("w-full flex items-center justify-center min-h-[200px]", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const badgeText = ${getField('badgeText')};
  const title = ${getField('title')};
  const description = ${getField('description')};
  const stats: Stat[] = ${getField('statsSimple')};

  return (
    <div className={cn("w-full bg-gray-50 dark:bg-gray-900 py-16 px-8", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-6 shadow-lg border-2 border-blue-700">
            {badgeText}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-8 text-center hover:shadow-2xl transition-all hover:scale-105"
            >
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-bold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCardComponent;
    `,

    statsCardWithIcons: `
${commonImports}

interface Stat {
  icon: string;
  value: string;
  label: string;
}

interface StatsCardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  [key: string]: any;
}

const StatsCardComponent: React.FC<StatsCardProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'stats'}',
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const statsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className={cn("w-full flex items-center justify-center min-h-[200px]", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const badgeText = ${getField('badgeText')};
  const title = ${getField('title')};
  const description = ${getField('description')};
  const stats: Stat[] = ${getField('statsWithIcons')};

  const iconMap: any = {
    Smile: Smile,
    Briefcase: Briefcase,
    DollarSign: DollarSign,
    Award: Award,
    Users: Users,
    TrendingUp: TrendingUp,
  };

  return (
    <div className={cn("w-full bg-white dark:bg-gray-900 py-16 px-8", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-3 shadow-lg border-2 border-blue-700">
            {badgeText}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = iconMap[stat.icon] || Smile;
            return (
              <div
                key={index}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full text-white mb-6 shadow-xl border-2 border-blue-700 hover:scale-110 transition-all">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-lg">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsCardComponent;
    `,

    statsCardNumbered: `
${commonImports}

interface Feature {
  number: string;
  title: string;
  description: string;
}

interface StatsCardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  [key: string]: any;
}

const StatsCardComponent: React.FC<StatsCardProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'stats'}',
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const statsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className={cn("w-full flex items-center justify-center min-h-[200px]", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const title = ${getField('titleWhyChoose')};
  const description = ${getField('description')};
  const features: Feature[] = ${getField('featuresNumbered')};

  return (
    <div className={cn("w-full bg-white dark:bg-gray-900 py-16 px-8", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg">
                  {feature.number}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCardComponent;
    `,

    statsCardElevated: `
${commonImports}

interface Stat {
  value: string;
  label: string;
}

interface StatsCardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  [key: string]: any;
}

const StatsCardComponent: React.FC<StatsCardProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'stats'}',
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const statsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className={cn("w-full flex items-center justify-center min-h-[200px]", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const badgeText = ${getField('badgeText')};
  const title = ${getField('title')};
  const description = ${getField('description')};
  const stats: Stat[] = ${getField('statsElevated')};

  return (
    <div className={cn("w-full", className)}>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12 text-white">
            <div className="inline-block bg-white/20 border-2 border-white/30 text-white px-6 py-2 rounded-full text-sm font-bold mb-3 shadow-lg backdrop-blur-sm">
              {badgeText}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {title}
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center"
                >
                  <div className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-2">
                    {stat.label}
                  </div>
                  <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCardComponent;
    `
  };

  return variants[variant] || variants.singleStat;
};
