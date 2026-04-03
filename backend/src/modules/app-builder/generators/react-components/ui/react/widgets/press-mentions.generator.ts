import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePressMentions = (
  resolved: ResolvedComponent,
  variant: 'carousel' | 'grid' | 'featured' = 'carousel'
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
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';`;

  const variants = {
    carousel: `
${commonImports}
import { ChevronLeft, ChevronRight, ExternalLink, Calendar, Loader2 } from 'lucide-react';

interface PressMention {
  id: number;
  publication: string;
  publicationLogo: string;
  quote: string;
  headline: string;
  url: string;
  date: string;
  category: string;
}

interface CarouselPressMentionsProps {
  ${dataName}?: any;
  className?: string;
  autoPlay?: boolean;
  autoPlaySpeed?: number;
  onMentionClick?: (mention: PressMention) => void;
  onReadArticle?: (url: string, mentionId: number) => void;
}

const CarouselPressMentions: React.FC<CarouselPressMentionsProps> = ({
  ${dataName}: propData,
  className,
  autoPlay = true,
  autoPlaySpeed = 5000,
  onMentionClick,
  onReadArticle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  const pressData = ${dataName} || {};

  const title = ${getField('carouselTitle')};
  const subtitle = ${getField('carouselSubtitle')};
  const mentions = ${getField('mentions')};
  const readArticleLabel = ${getField('readArticleLabel')};

  useEffect(() => {
    if (!autoPlay || isPaused || mentions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mentions.length);
    }, autoPlaySpeed);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, mentions.length, autoPlaySpeed]);

  const handleMentionClick = (mention: PressMention) => {
    if (onMentionClick) {
      onMentionClick(mention);
    } else {
      console.log('Mention clicked:', mention.headline);
    }
  };

  const handleReadArticle = (url: string, mentionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadArticle) {
      onReadArticle(url, mentionId);
    } else {
      console.log('Read article:', url);
      window.open(url, '_blank');
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mentions.length) % mentions.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mentions.length);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const currentMention = mentions[currentIndex];

  return (
    <div className={cn("py-12", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <Card
          onClick={() => handleMentionClick(currentMention)}
          className="max-w-4xl mx-auto overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer"
        >
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <img
                src={currentMention.publicationLogo}
                alt={currentMention.publication}
                className="h-12 object-contain mx-auto mb-6 grayscale hover:grayscale-0 transition-all"
              />
            </div>

            <div className="relative mb-8">
              <div className="absolute -left-4 -top-4 text-6xl text-blue-200 dark:text-blue-900 font-serif">"</div>
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 italic leading-relaxed text-center px-8">
                {currentMention.quote}
              </p>
              <div className="absolute -right-4 -bottom-4 text-6xl text-blue-200 dark:text-blue-900 font-serif">"</div>
            </div>

            <div className="text-center mb-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {currentMention.headline}
              </h4>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span className="font-bold">{currentMention.publication}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(currentMention.date)}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={(e) => handleReadArticle(currentMention.url, currentMention.id, e)}
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors"
              >
                {readArticleLabel}
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        {mentions.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            </button>
          </>
        )}

        <div className="flex justify-center gap-2 mt-6">
          {mentions.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-blue-600 w-8"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarouselPressMentions;
    `,

    grid: `
${commonImports}
import { ExternalLink, Calendar, Loader2 } from 'lucide-react';

interface PressMention {
  id: number;
  publication: string;
  publicationLogo: string;
  quote: string;
  headline: string;
  url: string;
  date: string;
  category: string;
}

interface GridPressMentionsProps {
  ${dataName}?: any;
  className?: string;
  onMentionClick?: (mention: PressMention) => void;
  onReadArticle?: (url: string, mentionId: number) => void;
}

const GridPressMentions: React.FC<GridPressMentionsProps> = ({
  ${dataName}: propData,
  className,
  onMentionClick,
  onReadArticle
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

  const pressData = ${dataName} || {};

  const title = ${getField('gridTitle')};
  const subtitle = ${getField('gridSubtitle')};
  const mentions = ${getField('mentions')};
  const readArticleLabel = ${getField('readArticleLabel')};

  const handleMentionClick = (mention: PressMention) => {
    if (onMentionClick) {
      onMentionClick(mention);
    } else {
      console.log('Mention clicked:', mention.headline);
    }
  };

  const handleReadArticle = (url: string, mentionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadArticle) {
      onReadArticle(url, mentionId);
    } else {
      console.log('Read article:', url);
      window.open(url, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={cn("py-12", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentions.map((mention: PressMention) => (
          <Card
            key={mention.id}
            onClick={() => handleMentionClick(mention)}
            className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-6 h-16">
                <img
                  src={mention.publicationLogo}
                  alt={mention.publication}
                  className="max-h-10 object-contain grayscale group-hover:grayscale-0 transition-all"
                />
              </div>

              <div className="mb-4">
                <Badge variant="outline" className="mb-3">
                  {mention.category}
                </Badge>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {mention.headline}
                </h4>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm italic mb-4 line-clamp-3">
                "{mention.quote}"
              </p>

              <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(mention.date)}</span>
                </div>
                <button
                  onClick={(e) => handleReadArticle(mention.url, mention.id, e)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-bold flex items-center gap-1"
                >
                  {readArticleLabel}
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GridPressMentions;
    `,

    featured: `
${commonImports}
import { ExternalLink, Calendar, Star, Loader2 } from 'lucide-react';

interface PressMention {
  id: number;
  publication: string;
  publicationLogo: string;
  quote: string;
  headline: string;
  url: string;
  date: string;
  category: string;
  featured: boolean;
}

interface FeaturedPressMentionsProps {
  ${dataName}?: any;
  className?: string;
  onMentionClick?: (mention: PressMention) => void;
  onReadArticle?: (url: string, mentionId: number) => void;
}

const FeaturedPressMentions: React.FC<FeaturedPressMentionsProps> = ({
  ${dataName}: propData,
  className,
  onMentionClick,
  onReadArticle
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

  const pressData = ${dataName} || {};

  const title = ${getField('featuredTitle')};
  const subtitle = ${getField('featuredSubtitle')};
  const mentions = ${getField('mentions')};
  const readArticleLabel = ${getField('readArticleLabel')};

  const featuredMentions = mentions.filter((m: PressMention) => m.featured);
  const regularMentions = mentions.filter((m: PressMention) => !m.featured);

  const handleMentionClick = (mention: PressMention) => {
    if (onMentionClick) {
      onMentionClick(mention);
    } else {
      console.log('Mention clicked:', mention.headline);
    }
  };

  const handleReadArticle = (url: string, mentionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadArticle) {
      onReadArticle(url, mentionId);
    } else {
      console.log('Read article:', url);
      window.open(url, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={cn("py-12", className)}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      {/* Featured Mentions */}
      {featuredMentions.length > 0 && (
        <div className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredMentions.slice(0, 2).map((mention: PressMention) => (
              <Card
                key={mention.id}
                onClick={() => handleMentionClick(mention)}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-blue-200 dark:border-blue-800"
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <img
                      src={mention.publicationLogo}
                      alt={mention.publication}
                      className="h-10 object-contain grayscale hover:grayscale-0 transition-all"
                    />
                    <Badge className="bg-blue-600 text-white flex items-center gap-1">
                      <Star className="h-3 w-3 fill-white" />
                      Featured
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 hover:text-blue-600 transition-colors">
                    {mention.headline}
                  </h3>

                  <div className="relative mb-6">
                    <div className="absolute -left-2 -top-2 text-4xl text-blue-200 dark:text-blue-900 font-serif">"</div>
                    <p className="text-gray-700 dark:text-gray-300 italic pl-6 leading-relaxed">
                      {mention.quote}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(mention.date)}</span>
                    </div>
                    <button
                      onClick={(e) => handleReadArticle(mention.url, mention.id, e)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-2"
                    >
                      {readArticleLabel}
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Mentions */}
      {regularMentions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {regularMentions.map((mention: PressMention) => (
            <Card
              key={mention.id}
              onClick={() => handleMentionClick(mention)}
              className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4 h-12">
                  <img
                    src={mention.publicationLogo}
                    alt={mention.publication}
                    className="max-h-8 object-contain grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>

                <h5 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                  {mention.headline}
                </h5>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {formatDate(mention.date)}
                </p>

                <button
                  onClick={(e) => handleReadArticle(mention.url, mention.id, e)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-bold flex items-center gap-1"
                >
                  Read
                  <ExternalLink className="h-3 w-3" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedPressMentions;
    `
  };

  return variants[variant] || variants.carousel;
};
