import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateArticlePagination = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'withPreviews' | 'cards' = 'simple'
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
    return `/${dataSource || 'articles'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'articles';

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    simple: `
${commonImports}
import { ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Article {
  id: number;
  title: string;
}

interface SimpleArticlePaginationProps {
  ${dataName}?: any;
  className?: string;
  onPreviousClick?: (article: Article) => void;
  onNextClick?: (article: Article) => void;
  onBackToBlog?: () => void;
}

const SimpleArticlePagination: React.FC<SimpleArticlePaginationProps> = ({
  ${dataName}: propData,
  className,
  onPreviousClick,
  onNextClick,
  onBackToBlog
}) => {
  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = ${dataName} || {};

  const previousArticle = ${getField('previousArticle')};
  const nextArticle = ${getField('nextArticle')};
  const previousButton = ${getField('previousButton')};
  const nextButton = ${getField('nextButton')};
  const backToBlogButton = ${getField('backToBlogButton')};

  const handlePrevious = () => {
    if (onPreviousClick) {
      onPreviousClick(previousArticle);
    } else {
      console.log('Previous article:', previousArticle.title);
    }
  };

  const handleNext = () => {
    if (onNextClick) {
      onNextClick(nextArticle);
    } else {
      console.log('Next article:', nextArticle.title);
    }
  };

  const handleBackToBlog = () => {
    if (onBackToBlog) {
      onBackToBlog();
    } else {
      console.log('Back to blog');
    }
  };

  return (
    <div className={cn("border-t dark:border-gray-700 pt-8 mt-12", className)}>
      <div className="flex items-center justify-between gap-4">
        {/* Previous Article */}
        {previousArticle ? (
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex items-center gap-2 group"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <div className="text-left">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                {previousButton}
              </div>
              <div className="font-medium line-clamp-1">{previousArticle.title}</div>
            </div>
          </Button>
        ) : (
          <div />
        )}

        {/* Back to Blog */}
        <Button
          variant="ghost"
          onClick={handleBackToBlog}
          className="flex items-center gap-2"
        >
          <Grid className="h-4 w-4" />
          {backToBlogButton}
        </Button>

        {/* Next Article */}
        {nextArticle ? (
          <Button
            variant="outline"
            onClick={handleNext}
            className="flex items-center gap-2 group"
          >
            <div className="text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                {nextButton}
              </div>
              <div className="font-medium line-clamp-1">{nextArticle.title}</div>
            </div>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default SimpleArticlePagination;
    `,

    withPreviews: `
${commonImports}
import { ChevronLeft, ChevronRight, Grid, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
}

interface PreviewArticlePaginationProps {
  ${dataName}?: any;
  className?: string;
  onPreviousClick?: (article: Article) => void;
  onNextClick?: (article: Article) => void;
  onBackToBlog?: () => void;
}

const PreviewArticlePagination: React.FC<PreviewArticlePaginationProps> = ({
  ${dataName}: propData,
  className,
  onPreviousClick,
  onNextClick,
  onBackToBlog
}) => {
  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = ${dataName} || {};

  const title = ${getField('withPreviewsTitle')};
  const subtitle = ${getField('withPreviewsSubtitle')};
  const previousArticle = ${getField('previousArticle')};
  const nextArticle = ${getField('nextArticle')};
  const previousButton = ${getField('previousButton')};
  const nextButton = ${getField('nextButton')};
  const backToBlogButton = ${getField('backToBlogButton')};

  const handlePrevious = () => {
    if (onPreviousClick) {
      onPreviousClick(previousArticle);
    } else {
      console.log('Previous article:', previousArticle.title);
    }
  };

  const handleNext = () => {
    if (onNextClick) {
      onNextClick(nextArticle);
    } else {
      console.log('Next article:', nextArticle.title);
    }
  };

  const handleBackToBlog = () => {
    if (onBackToBlog) {
      onBackToBlog();
    } else {
      console.log('Back to blog');
    }
  };

  return (
    <div className={cn("border-t dark:border-gray-700 pt-12 mt-12", className)}>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Previous Article */}
        {previousArticle && (
          <Card
            onClick={handlePrevious}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col h-full">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={previousArticle.image}
                  alt={previousArticle.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {previousArticle.category}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-xs">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="font-medium uppercase">{previousButton}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {previousArticle.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                  {previousArticle.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{previousArticle.readTime}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Next Article */}
        {nextArticle && (
          <Card
            onClick={handleNext}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col h-full">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={nextArticle.image}
                  alt={nextArticle.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {nextArticle.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-2 text-white text-xs">
                  <span className="font-medium uppercase">{nextButton}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {nextArticle.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                  {nextArticle.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{nextArticle.readTime}</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Back to Blog */}
      <div className="text-center">
        <button
          onClick={handleBackToBlog}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
        >
          <Grid className="h-4 w-4" />
          {backToBlogButton}
        </button>
      </div>
    </div>
  );
};

export default PreviewArticlePagination;
    `,

    cards: `
${commonImports}
import { ChevronLeft, ChevronRight, Clock, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
  date: string;
}

interface CardsArticlePaginationProps {
  ${dataName}?: any;
  className?: string;
  onPreviousClick?: (article: Article) => void;
  onNextClick?: (article: Article) => void;
}

const CardsArticlePagination: React.FC<CardsArticlePaginationProps> = ({
  ${dataName}: propData,
  className,
  onPreviousClick,
  onNextClick
}) => {
  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = ${dataName} || {};

  const title = ${getField('cardsTitle')};
  const subtitle = ${getField('cardsSubtitle')};
  const previousArticle = ${getField('previousArticle')};
  const nextArticle = ${getField('nextArticle')};
  const previousButton = ${getField('previousButton')};
  const nextButton = ${getField('nextButton')};

  const handlePrevious = () => {
    if (onPreviousClick) {
      onPreviousClick(previousArticle);
    } else {
      console.log('Previous article:', previousArticle.title);
    }
  };

  const handleNext = () => {
    if (onNextClick) {
      onNextClick(nextArticle);
    } else {
      console.log('Next article:', nextArticle.title);
    }
  };

  return (
    <div className={cn("mt-16", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Previous Article Card */}
        {previousArticle && (
          <Card
            onClick={handlePrevious}
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-blue-100 dark:border-blue-900"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={previousArticle.image}
                alt={previousArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              <div className="absolute top-4 left-4">
                <span className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  {previousArticle.category}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                  <ChevronLeft className="h-5 w-5" />
                  <span className="uppercase tracking-wide">{previousButton}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                {previousArticle.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {previousArticle.excerpt}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{previousArticle.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{previousArticle.readTime}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <div className="text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read Previous Article
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Article Card */}
        {nextArticle && (
          <Card
            onClick={handleNext}
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group border-2 border-purple-100 dark:border-purple-900"
          >
            <div className="relative h-64 overflow-hidden">
              <img
                src={nextArticle.image}
                alt={nextArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              <div className="absolute top-4 right-4">
                <span className="bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  {nextArticle.category}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-end gap-2 text-white text-sm font-medium mb-2">
                  <span className="uppercase tracking-wide">{nextButton}</span>
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                {nextArticle.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {nextArticle.excerpt}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{nextArticle.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{nextArticle.readTime}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <div className="text-purple-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read Next Article
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CardsArticlePagination;
    `
  };

  return variants[variant] || variants.simple;
};
