import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateStatisticsNumbersSection = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'cards' | 'animated' = 'grid'
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
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results/i)) {
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
import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Users, Heart, CheckCircle, Globe, TrendingUp, Award, Zap, LucideIcon, Briefcase, Building2, Bell, Shield, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';`;

  const variants = {
    grid: `
${commonImports}

interface Statistic {
  id?: string;
  value: number;
  label: string;
  icon: string;
  suffix?: string;
  prefix?: string;
  description?: string;
}

interface StatisticsNumbersSectionProps {
  ${dataName}?: any;
  className?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  statistics?: Statistic[];
  [key: string]: any;
}

const statsIconMap: Record<string, LucideIcon> = {
  Users,
  Heart,
  CheckCircle,
  Globe,
  TrendingUp,
  Award,
  Zap,
  Briefcase,
  Building2,
  Bell,
  Shield
};

// Counter animation hook
const useCounter = (end: number, duration: number = 2000, shouldStart: boolean = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);

  return count;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const StatisticsNumbersSection: React.FC<StatisticsNumbersSectionProps> = ({
  ${dataName}: propData,
  className,
  title: propTitle,
  subtitle: propSubtitle,
  badge: propBadge,
  statistics: propStatistics
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  const statsData = ${dataName} || {};

  // Use props first, then fallback to data
  const title = propTitle || ${getField('title')};
  const subtitle = propSubtitle || ${getField('subtitle')};
  const badge = propBadge || ${getField('badge')};
  const statistics = propStatistics || ${getField('statistics')};

  // If no statistics to display, don't render the section
  if (!statistics || statistics.length === 0) {
    return null;
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50", className)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg border-2 border-blue-700 rounded-full">
            {badge}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat: Statistic, index: number) => {
            const Icon = statsIconMap[stat.icon] || TrendingUp;

            return (
              <StatCard
                key={stat.id || index}
                stat={stat}
                Icon={Icon}
                isVisible={isVisible}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  stat: Statistic;
  Icon: LucideIcon;
  isVisible: boolean;
  [key: string]: any;
}

const StatCard: React.FC<StatCardProps> = ({ stat, Icon, isVisible }) => {
  const count = useCounter(stat.value, 2000, isVisible);

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border-2 border-blue-700 hover:scale-110 transition-all">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
        {stat.prefix}
        {formatNumber(count)}
        {stat.suffix}
      </div>
      <div className="text-lg font-bold text-gray-700 mb-1">
        {stat.label}
      </div>
      {stat.description && (
        <p className="text-sm text-gray-500 font-medium">
          {stat.description}
        </p>
      )}
    </div>
  );
};

export default StatisticsNumbersSection;
    `,

    cards: `
${commonImports}

interface Statistic {
  id?: string;
  value: number;
  label: string;
  icon: string;
  suffix?: string;
  prefix?: string;
  description?: string;
}

interface StatisticsNumbersSectionProps {
  ${dataName}?: any;
  className?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  statistics?: Statistic[];
  [key: string]: any;
}

const statsIconMap: Record<string, LucideIcon> = {
  Users,
  Heart,
  CheckCircle,
  Globe,
  TrendingUp,
  Award,
  Zap,
  Briefcase,
  Building2,
  Bell,
  Shield
};

const useCounter = (end: number, duration: number = 2000, shouldStart: boolean = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);

  return count;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const StatisticsNumbersSection: React.FC<StatisticsNumbersSectionProps> = ({
  ${dataName}: propData,
  className,
  title: propTitle,
  subtitle: propSubtitle,
  badge: propBadge,
  statistics: propStatistics
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  const statsData = ${dataName} || {};

  // Use props first, then fallback to data
  const title = propTitle || ${getField('title')};
  const subtitle = propSubtitle || ${getField('subtitle')};
  const badge = propBadge || ${getField('badge')};
  const statistics = propStatistics || ${getField('statistics')};

  // If no statistics to display, don't render the section
  if (!statistics || statistics.length === 0) {
    return null;
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("py-16 sm:py-20 md:py-24 bg-white", className)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg border-2 border-blue-700 rounded-full">
            {badge}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.map((stat: Statistic, index: number) => {
            const Icon = statsIconMap[stat.icon] || TrendingUp;

            return (
              <StatCard
                key={stat.id || index}
                stat={stat}
                Icon={Icon}
                isVisible={isVisible}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  stat: Statistic;
  Icon: LucideIcon;
  isVisible: boolean;
  [key: string]: any;
}

const StatCard: React.FC<StatCardProps> = ({ stat, Icon, isVisible }) => {
  const count = useCounter(stat.value, 2000, isVisible);

  return (
    <Card className="border-2 border-gray-200 hover:border-blue-600 hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <CardContent className="p-8 text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-2 border-blue-700">
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {stat.prefix}
          {formatNumber(count)}
          {stat.suffix}
        </div>
        <div className="text-base font-bold text-gray-700 mb-2">
          {stat.label}
        </div>
        {stat.description && (
          <p className="text-sm text-gray-500 font-medium">
            {stat.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatisticsNumbersSection;
    `,

    animated: `
${commonImports}

interface Statistic {
  id?: string;
  value: number;
  label: string;
  icon: string;
  suffix?: string;
  prefix?: string;
  description?: string;
}

interface StatisticsNumbersSectionProps {
  ${dataName}?: any;
  className?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  statistics?: Statistic[];
  [key: string]: any;
}

const statsIconMap: Record<string, LucideIcon> = {
  Users,
  Heart,
  CheckCircle,
  Globe,
  TrendingUp,
  Award,
  Zap,
  Briefcase,
  Building2,
  Bell,
  Shield
};

const useCounter = (end: number, duration: number = 2000, shouldStart: boolean = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, shouldStart]);

  return count;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const StatisticsNumbersSection: React.FC<StatisticsNumbersSectionProps> = ({
  ${dataName}: propData,
  className,
  title: propTitle,
  subtitle: propSubtitle,
  badge: propBadge,
  statistics: propStatistics
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  const statsData = ${dataName} || {};

  // Use props first, then fallback to data
  const title = propTitle || ${getField('title')};
  const subtitle = propSubtitle || ${getField('subtitle')};
  const badge = propBadge || ${getField('badge')};
  const statistics = propStatistics || ${getField('statistics')};

  // If no statistics to display, don't render the section
  if (!statistics || statistics.length === 0) {
    return null;
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("py-16 sm:py-20 md:py-24 bg-gray-900 relative overflow-hidden", className)}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-xl border-2 border-blue-700 rounded-full">
            {badge}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Statistics Grid - Animated */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statistics.map((stat: Statistic, index: number) => {
            const Icon = statsIconMap[stat.icon] || TrendingUp;

            return (
              <StatCard
                key={stat.id}
                stat={stat}
                Icon={Icon}
                isVisible={isVisible}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  stat: Statistic;
  Icon: LucideIcon;
  isVisible: boolean;
  index: number;
  [key: string]: any;
}

const StatCard: React.FC<StatCardProps> = ({ stat, Icon, isVisible, index }) => {
  const count = useCounter(stat.value, 2500, isVisible);

  return (
    <div
      className={cn(
        "text-center transform transition-all duration-1000",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      )}
      style={{ transitionDelay: \`\${index * 100}ms\` }}
    >
      {/* Animated Icon */}
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
        <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
          <Icon className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Animated Counter */}
      <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
        {stat.prefix}
        {formatNumber(count)}
        {stat.suffix}
      </div>

      <div className="text-lg font-semibold text-white mb-2">
        {stat.label}
      </div>

      {stat.description && (
        <p className="text-sm text-gray-400">
          {stat.description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-2000 ease-out"
          style={{
            width: isVisible ? '100%' : '0%',
            transitionDelay: \`\${index * 100}ms\`
          }}
        ></div>
      </div>
    </div>
  );
};

export default StatisticsNumbersSection;
    `
  };

  return variants[variant] || variants.grid;
};
