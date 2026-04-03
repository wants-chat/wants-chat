import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCaseStudyCards = (
  resolved: ResolvedComponent,
  variant: 'cards' | 'featured' | 'list' = 'cards'
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
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    cards: `
${commonImports}
import { ArrowRight, TrendingUp } from 'lucide-react';

interface Result {
  metric: string;
  label: string;
}

interface CaseStudy {
  id: number;
  title: string;
  client: string;
  clientLogo: string;
  thumbnail: string;
  challenge: string;
  results: Result[];
  category: string;
  tags: string[];
}

interface CardsCaseStudyProps {
  ${dataName}?: any;
  className?: string;
  onCaseStudyClick?: (caseStudy: CaseStudy) => void;
  onReadCaseStudy?: (id: number, caseStudy: CaseStudy) => void;
  onCategoryClick?: (category: string) => void;
}

const CardsCaseStudy: React.FC<CardsCaseStudyProps> = ({
  ${dataName}: propData,
  className,
  onCaseStudyClick,
  onReadCaseStudy,
  onCategoryClick
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

  const caseStudyData = ${dataName} || {};

  const title = ${getField('cardsTitle')};
  const subtitle = ${getField('cardsSubtitle')};
  const caseStudies = ${getField('caseStudies')};
  const readCaseStudyLabel = ${getField('readCaseStudyLabel')};

  const handleCaseStudyClick = (caseStudy: CaseStudy) => {
    if (onCaseStudyClick) {
      onCaseStudyClick(caseStudy);
    } else {
      console.log('Case study clicked:', caseStudy.title);
    }
  };

  const handleReadCaseStudy = (id: number, caseStudy: CaseStudy, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadCaseStudy) {
      onReadCaseStudy(id, caseStudy);
    } else {
      console.log('Read case study:', caseStudy.title);
    }
  };

  const handleCategoryClick = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      console.log('Category clicked:', category);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {caseStudies.map((study: CaseStudy) => (
          <Card
            key={study.id}
            onClick={() => handleCaseStudyClick(study)}
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
          >
            <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={study.thumbnail}
                alt={study.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              <div className="absolute top-4 left-4">
                <Badge
                  onClick={(e) => handleCategoryClick(study.category, e)}
                  className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                >
                  {study.category}
                </Badge>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <img
                  src={study.clientLogo}
                  alt={study.client}
                  className="h-8 object-contain bg-white/90 px-3 py-1 rounded"
                />
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {study.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {study.challenge}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b dark:border-gray-700">
                {study.results.slice(0, 3).map((result, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center justify-center gap-1">
                      {result.metric}
                      {index === 0 && <TrendingUp className="h-4 w-4" />}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{result.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={(e) => handleReadCaseStudy(study.id, study, e)}
                className="w-full flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors group-hover:gap-3"
              >
                {readCaseStudyLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CardsCaseStudy;
    `,

    featured: `
${commonImports}
import { ArrowRight, TrendingUp, Clock, Building } from 'lucide-react';

interface Result {
  metric: string;
  label: string;
}

interface CaseStudy {
  id: number;
  title: string;
  client: string;
  clientLogo: string;
  thumbnail: string;
  challenge: string;
  solution: string;
  results: Result[];
  category: string;
  tags: string[];
  duration: string;
  industry: string;
}

interface FeaturedCaseStudyProps {
  ${dataName}?: any;
  className?: string;
  onCaseStudyClick?: (caseStudy: CaseStudy) => void;
  onReadCaseStudy?: (id: number, caseStudy: CaseStudy) => void;
  onCategoryClick?: (category: string) => void;
}

const FeaturedCaseStudy: React.FC<FeaturedCaseStudyProps> = ({
  ${dataName}: propData,
  className,
  onCaseStudyClick,
  onReadCaseStudy,
  onCategoryClick
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

  const caseStudyData = ${dataName} || {};

  const title = ${getField('featuredTitle')};
  const subtitle = ${getField('featuredSubtitle')};
  const caseStudies = ${getField('caseStudies')};
  const readCaseStudyLabel = ${getField('readCaseStudyLabel')};
  const challengeLabel = ${getField('challengeLabel')};
  const resultsLabel = ${getField('resultsLabel')};

  const handleCaseStudyClick = (caseStudy: CaseStudy) => {
    if (onCaseStudyClick) {
      onCaseStudyClick(caseStudy);
    } else {
      console.log('Case study clicked:', caseStudy.title);
    }
  };

  const handleReadCaseStudy = (id: number, caseStudy: CaseStudy, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadCaseStudy) {
      onReadCaseStudy(id, caseStudy);
    } else {
      console.log('Read case study:', caseStudy.title);
    }
  };

  const handleCategoryClick = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      console.log('Category clicked:', category);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="space-y-8">
        {caseStudies.slice(0, 3).map((study: CaseStudy) => (
          <Card
            key={study.id}
            onClick={() => handleCaseStudyClick(study)}
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-96 overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={study.thumbnail}
                  alt={study.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute top-6 left-6">
                  <Badge
                    onClick={(e) => handleCategoryClick(study.category, e)}
                    className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                  >
                    {study.category}
                  </Badge>
                </div>

                <div className="absolute bottom-6 left-6">
                  <img
                    src={study.clientLogo}
                    alt={study.client}
                    className="h-10 object-contain bg-white/95 px-4 py-2 rounded"
                  />
                </div>
              </div>

              <div className="p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 hover:text-blue-600 transition-colors">
                    {study.title}
                  </h3>

                  <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{study.industry}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{study.duration}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{challengeLabel}</h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {study.challenge}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{resultsLabel}</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {study.results.map((result, index) => (
                        <div key={index} className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1 flex items-center justify-center gap-1">
                            {result.metric}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{result.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {study.tags.map((tag: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <button
                  onClick={(e) => handleReadCaseStudy(study.id, study, e)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {readCaseStudyLabel}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedCaseStudy;
    `,

    list: `
${commonImports}
import { ArrowRight, Filter } from 'lucide-react';

interface Result {
  metric: string;
  label: string;
}

interface CaseStudy {
  id: number;
  title: string;
  client: string;
  clientLogo: string;
  thumbnail: string;
  challenge: string;
  results: Result[];
  category: string;
  tags: string[];
  industry: string;
}

interface ListCaseStudyProps {
  ${dataName}?: any;
  className?: string;
  onCaseStudyClick?: (caseStudy: CaseStudy) => void;
  onReadCaseStudy?: (id: number, caseStudy: CaseStudy) => void;
  onCategoryClick?: (category: string) => void;
}

const ListCaseStudy: React.FC<ListCaseStudyProps> = ({
  ${dataName}: propData,
  className,
  onCaseStudyClick,
  onReadCaseStudy,
  onCategoryClick
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

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const caseStudyData = ${dataName} || {};

  const title = ${getField('listTitle')};
  const subtitle = ${getField('listSubtitle')};
  const caseStudies = ${getField('caseStudies')};
  const viewDetailsLabel = ${getField('viewDetailsLabel')};

  const categories = Array.from(new Set(caseStudies.map((study: CaseStudy) => study.category)));

  const filteredStudies = selectedCategory
    ? caseStudies.filter((study: CaseStudy) => study.category === selectedCategory)
    : caseStudies;

  const handleCaseStudyClick = (caseStudy: CaseStudy) => {
    if (onCaseStudyClick) {
      onCaseStudyClick(caseStudy);
    } else {
      console.log('Case study clicked:', caseStudy.title);
    }
  };

  const handleReadCaseStudy = (id: number, caseStudy: CaseStudy, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadCaseStudy) {
      onReadCaseStudy(id, caseStudy);
    } else {
      console.log('Read case study:', caseStudy.title);
    }
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
    if (category && onCategoryClick) {
      onCategoryClick(category);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{subtitle}</p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>
          <button
            onClick={() => handleCategoryFilter(null)}
            className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${
              selectedCategory === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }\`}
          >
            All
          </button>
          {categories.map((category: string) => (
            <button
              key={category}
              onClick={() => handleCategoryFilter(category)}
              className={\`px-4 py-2 rounded-full text-sm font-medium transition-colors \${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }\`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filteredStudies.map((study: CaseStudy) => (
          <Card
            key={study.id}
            onClick={() => handleCaseStudyClick(study)}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col md:flex-row gap-6 p-6">
              <div className="md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                <img
                  src={study.thumbnail}
                  alt={study.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                        {study.title}
                      </h3>
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={study.clientLogo}
                          alt={study.client}
                          className="h-6 object-contain"
                        />
                        <Badge variant="outline">{study.category}</Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {study.challenge}
                  </p>

                  <div className="flex gap-6 mb-4">
                    {study.results.slice(0, 3).map((result, index) => (
                      <div key={index}>
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {result.metric}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{result.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {study.tags.slice(0, 4).map((tag: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={(e) => handleReadCaseStudy(study.id, study, e)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all"
                  >
                    {viewDetailsLabel}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ListCaseStudy;
    `
  };

  return variants[variant] || variants.cards;
};
