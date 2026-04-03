import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAwardsShowcase = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'timeline' | 'featured' = 'grid'
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
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';`;

  const variants = {
    grid: `
${commonImports}
import { Award, ExternalLink, Loader2 } from 'lucide-react';

interface Award {
  id: number;
  name: string;
  year: number;
  organization: string;
  organizationLogo: string;
  awardImage: string;
  description: string;
  category: string;
}

interface GridAwardsProps {
  ${dataName}?: any;
  className?: string;
  onAwardClick?: (award: Award) => void;
  onViewAward?: (awardId: number, award: Award) => void;
}

const GridAwardsShowcase: React.FC<GridAwardsProps> = ({
  ${dataName}: propData,
  className,
  onAwardClick,
  onViewAward
}) => {
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

  const awardsData = ${dataName} || {};

  const title = ${getField('gridTitle')};
  const subtitle = ${getField('gridSubtitle')};
  const awards = ${getField('awards')};
  const viewAwardLabel = ${getField('viewAwardLabel')};

  const handleAwardClick = (award: Award) => {
    if (onAwardClick) {
      onAwardClick(award);
    } else {
      console.log('Award clicked:', award.name);
    }
  };

  const handleViewAward = (awardId: number, award: Award, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewAward) {
      onViewAward(awardId, award);
    } else {
      console.log('View award:', award.name);
    }
  };

  return (
    <div className={cn("py-12", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {awards.map((award: Award) => (
          <Card
            key={award.id}
            onClick={() => handleAwardClick(award)}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="relative h-48 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center overflow-hidden">
              <img
                src={award.awardImage}
                alt={award.name}
                className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-yellow-500 text-white">
                  {award.year}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <img
                  src={award.organizationLogo}
                  alt={award.organization}
                  className="h-8 object-contain grayscale group-hover:grayscale-0 transition-all"
                />
              </div>

              <div className="mb-3">
                <Badge variant="outline" className="mb-2 text-xs">
                  {award.category}
                </Badge>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors">
                  {award.name}
                </h3>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {award.description}
              </p>

              <button
                onClick={(e) => handleViewAward(award.id, award, e)}
                className="w-full text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Award className="h-4 w-4" />
                {viewAwardLabel}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GridAwardsShowcase;
    `,

    timeline: `
${commonImports}
import { Award, Calendar, Loader2 } from 'lucide-react';

interface Award {
  id: number;
  name: string;
  year: number;
  organization: string;
  organizationLogo: string;
  awardImage: string;
  description: string;
  category: string;
}

interface TimelineAwardsProps {
  ${dataName}?: any;
  className?: string;
  onAwardClick?: (award: Award) => void;
}

const TimelineAwardsShowcase: React.FC<TimelineAwardsProps> = ({
  ${dataName}: propData,
  className,
  onAwardClick
}) => {
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

  const awardsData = ${dataName} || {};

  const title = ${getField('timelineTitle')};
  const subtitle = ${getField('timelineSubtitle')};
  const awards = ${getField('awards')};

  // Sort awards by year descending
  const sortedAwards = [...awards].sort((a, b) => b.year - a.year);

  // Group awards by year
  const awardsByYear = sortedAwards.reduce((acc: any, award: Award) => {
    if (!acc[award.year]) {
      acc[award.year] = [];
    }
    acc[award.year].push(award);
    return acc;
  }, {});

  const years = Object.keys(awardsByYear).sort((a, b) => parseInt(b) - parseInt(a));

  const handleAwardClick = (award: Award) => {
    if (onAwardClick) {
      onAwardClick(award);
    } else {
      console.log('Award clicked:', award.name);
    }
  };

  return (
    <div className={cn("py-12", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        {years.map((year, yearIndex) => (
          <div key={year} className="relative">
            {/* Timeline Line */}
            {yearIndex < years.length - 1 && (
              <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 to-transparent dark:from-yellow-600" />
            )}

            {/* Year Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{year}</h3>
            </div>

            {/* Awards for this year */}
            <div className="ml-24 space-y-6 mb-12">
              {awardsByYear[year].map((award: Award) => (
                <Card
                  key={award.id}
                  onClick={() => handleAwardClick(award)}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-48 md:h-auto bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 flex items-center justify-center flex-shrink-0">
                      <img
                        src={award.awardImage}
                        alt={award.name}
                        className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <Badge variant="outline" className="mb-2">
                            {award.category}
                          </Badge>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-600 transition-colors">
                            {award.name}
                          </h4>
                        </div>
                        <Award className="h-6 w-6 text-yellow-500" />
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <img
                          src={award.organizationLogo}
                          alt={award.organization}
                          className="h-6 object-contain grayscale group-hover:grayscale-0 transition-all"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{award.organization}</span>
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {award.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineAwardsShowcase;
    `,

    featured: `
${commonImports}
import { Award, ExternalLink, Trophy, Loader2 } from 'lucide-react';

interface Award {
  id: number;
  name: string;
  year: number;
  organization: string;
  organizationLogo: string;
  awardImage: string;
  description: string;
  category: string;
  featured: boolean;
}

interface FeaturedAwardsProps {
  ${dataName}?: any;
  className?: string;
  onAwardClick?: (award: Award) => void;
  onLearnMore?: (awardId: number, award: Award) => void;
}

const FeaturedAwardsShowcase: React.FC<FeaturedAwardsProps> = ({
  ${dataName}: propData,
  className,
  onAwardClick,
  onLearnMore
}) => {
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

  const awardsData = ${dataName} || {};

  const title = ${getField('featuredTitle')};
  const subtitle = ${getField('featuredSubtitle')};
  const awards = ${getField('awards')};
  const learnMoreLabel = ${getField('learnMoreLabel')};

  const featuredAwards = awards.filter((a: Award) => a.featured);
  const regularAwards = awards.filter((a: Award) => !a.featured);

  const handleAwardClick = (award: Award) => {
    if (onAwardClick) {
      onAwardClick(award);
    } else {
      console.log('Award clicked:', award.name);
    }
  };

  const handleLearnMore = (awardId: number, award: Award, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLearnMore) {
      onLearnMore(awardId, award);
    } else {
      console.log('Learn more:', award.name);
    }
  };

  return (
    <div className={cn("py-12", className)}>
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      {/* Featured Awards */}
      {featuredAwards.length > 0 && (
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredAwards.map((award: Award) => (
              <Card
                key={award.id}
                onClick={() => handleAwardClick(award)}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-yellow-200 dark:border-yellow-800"
              >
                <div className="relative h-64 bg-gradient-to-br from-yellow-100 via-orange-100 to-yellow-100 dark:from-yellow-900/30 dark:via-orange-900/30 dark:to-yellow-900/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={award.awardImage}
                    alt={award.name}
                    className="w-48 h-48 object-contain hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                      <Award className="h-3 w-3 fill-white" />
                      Featured
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white">
                      {award.year}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-8">
                  <div className="flex items-center justify-center mb-6">
                    <img
                      src={award.organizationLogo}
                      alt={award.organization}
                      className="h-12 object-contain"
                    />
                  </div>

                  <div className="mb-4">
                    <Badge variant="outline" className="mb-3">
                      {award.category}
                    </Badge>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:text-yellow-600 transition-colors">
                      {award.name}
                    </h3>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    {award.description}
                  </p>

                  <button
                    onClick={(e) => handleLearnMore(award.id, award, e)}
                    className="w-full bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {learnMoreLabel}
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Awards */}
      {regularAwards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {regularAwards.map((award: Award) => (
            <div
              key={award.id}
              onClick={() => handleAwardClick(award)}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center mb-3 group-hover:shadow-xl transition-all duration-300">
                <img
                  src={award.awardImage}
                  alt={award.name}
                  className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {award.year.toString().slice(-2)}
                </div>
              </div>
              <p className="text-xs text-center font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-yellow-600 transition-colors">
                {award.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedAwardsShowcase;
    `
  };

  return variants[variant] || variants.grid;
};
