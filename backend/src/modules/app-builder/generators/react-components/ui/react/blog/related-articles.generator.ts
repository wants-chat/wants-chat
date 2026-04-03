import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateRelatedArticles = (
  resolved: ResolvedComponent,
  variant: 'cards' | 'list' | 'compact' = 'cards'
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
    return `/${dataSource || 'posts'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'posts';

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    cards: `
${commonImports}
import { Clock, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RelatedArticle {
  id: number;
  title: string;
  excerpt: string;
  thumbnail: string;
  date: string;
  readTime: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
  matchCriteria: string;
}

interface CardsRelatedArticlesProps {
  data?: any;
  className?: string;
  onArticleClick?: (articleId: number, article: RelatedArticle) => void;
  onCategoryClick?: (category: string) => void;
  onTagClick?: (tag: string) => void;
  onViewAll?: () => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onAuthorClick?: (authorName: string) => void;
}

const CardsRelatedArticles: React.FC<CardsRelatedArticlesProps> = ({
  data: propData,
  className,
  onArticleClick,
  onCategoryClick,
  onTagClick,
  onViewAll
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const articlesData = postsData || {};

  const title = postsData?.cardsTitle || '';
  const subtitle = postsData?.cardsSubtitle || '';
  const articles = postsData?.relatedArticles || ([] as any[]);
  const readMoreLabel = postsData?.readMoreLabel || '';
  const viewAllLabel = postsData?.viewAllLabel || '';
  const maxItems = postsData?.maxItems || 0;

  const displayArticles = articles.slice(0, maxItems);

  const handleArticleClick = (articleId: number, article: RelatedArticle) => {
    if (onArticleClick) {
      onArticleClick(articleId, article);
    } else {
      console.log('Article clicked:', article.title);
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

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    } else {
      console.log('Tag clicked:', tag);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      console.log('View all clicked');
    }
  };

  return (
    <div className={cn("mt-12", className)}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-blue-600 dark:text-purple-400" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{title}</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {displayArticles.map((article: RelatedArticle) => (
          <Card
            key={article.id}
            onClick={() => handleArticleClick(article.id, article)}
            className="overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-105"
          >
            <div className="flex flex-col h-full relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-10 pointer-events-none"></div>
              <div className="relative h-48 overflow-hidden">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <button
                    onClick={(e) => handleCategoryClick(article.category, e)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-110"
                  >
                    {article.category}
                  </button>
                </div>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
                  {article.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {article.tags.slice(0, 2).map((tag: string, index: number) => (
                    <button
                      key={index}
                      onClick={(e) => handleTagClick(tag, e)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-purple-400 bg-blue-50 dark:bg-purple-900/20 border-2 border-blue-200 dark:border-purple-700 px-3 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-purple-900/30 hover:border-blue-300 dark:hover:border-purple-600 transition-all duration-300 hover:scale-110 shadow-sm"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {article.author.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {articles.length > maxItems && (
        <div className="text-center">
          <button
            onClick={handleViewAll}
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            {viewAllLabel}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CardsRelatedArticles;
    `,

    list: `
${commonImports}
import { Clock, ArrowRight, Calendar, Sparkles } from 'lucide-react';

interface RelatedArticle {
  id: number;
  title: string;
  excerpt: string;
  thumbnail: string;
  date: string;
  readTime: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
  matchCriteria: string;
}

interface ListRelatedArticlesProps {
  data?: any;
  className?: string;
  onArticleClick?: (articleId: number, article: RelatedArticle) => void;
  onCategoryClick?: (category: string) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onTagClick?: (tag: string) => void;
  onAuthorClick?: (authorName: string) => void;
}

const ListRelatedArticles: React.FC<ListRelatedArticlesProps> = ({
  ${dataName}: propData,
  className,
  onArticleClick,
  onCategoryClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const articlesData = postsData || {};

  const title = postsData?.listTitle || '';
  const subtitle = postsData?.listSubtitle || '';
  const articles = postsData?.relatedArticles || ([] as any[]);
  const readMoreLabel = postsData?.readMoreLabel || '';
  const maxItems = postsData?.maxItems || 0;

  const displayArticles = articles.slice(0, maxItems);

  const handleArticleClick = (articleId: number, article: RelatedArticle) => {
    if (onArticleClick) {
      onArticleClick(articleId, article);
    } else {
      console.log('Article clicked:', article.title);
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
    <div className={cn("mt-12", className)}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-blue-600 dark:text-purple-400" />
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{title}</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="space-y-6">
        {displayArticles.map((article: RelatedArticle) => (
          <div
            key={article.id}
            onClick={() => handleArticleClick(article.id, article)}
            className="flex gap-4 p-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 rounded-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group hover:scale-[1.02] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
            <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl shadow-md hover:shadow-xl z-10">
              <img
                src={article.thumbnail}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <button
                onClick={(e) => handleCategoryClick(article.category, e)}
                className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-110"
              >
                {article.category}
              </button>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {article.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <p className="font-medium text-gray-900 dark:text-white">{article.author.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{article.date}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2 text-sm shadow-md hover:shadow-lg hover:scale-110">
                  {readMoreLabel}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListRelatedArticles;
    `,

    compact: `
${commonImports}
import { Clock, ArrowRight, Sparkles } from 'lucide-react';

interface RelatedArticle {
  id: number;
  title: string;
  excerpt: string;
  thumbnail: string;
  date: string;
  readTime: string;
  category: string;
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
  matchCriteria: string;
}

interface CompactRelatedArticlesProps {
  data?: any;
  className?: string;
  onArticleClick?: (articleId: number, article: RelatedArticle) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onTagClick?: (tag: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onCategoryClick?: (category: string) => void;
}

const CompactRelatedArticles: React.FC<CompactRelatedArticlesProps> = ({
  ${dataName}: propData,
  className,
  onArticleClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const articlesData = postsData || {};

  const title = postsData?.compactTitle || '';
  const subtitle = postsData?.compactSubtitle || '';
  const articles = postsData?.relatedArticles || ([] as any[]);
  const maxItems = postsData?.maxItems || 0;

  const displayArticles = articles.slice(0, maxItems);

  const handleArticleClick = (articleId: number, article: RelatedArticle) => {
    if (onArticleClick) {
      onArticleClick(articleId, article);
    } else {
      console.log('Article clicked:', article.title);
    }
  };

  return (
    <aside className={cn("w-80", className)}>
      <div className="sticky top-24">
        <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-purple-500 p-5 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-purple-400" />
            <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent dark:from-white dark:to-blue-400">{title}</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{subtitle}</p>

          <div className="space-y-4">
            {displayArticles.map((article: RelatedArticle, index: number) => (
              <div key={article.id}>
                <div
                  onClick={() => handleArticleClick(article.id, article)}
                  className="group cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="relative h-40 mb-3 overflow-hidden rounded-xl shadow-md hover:shadow-xl border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-400 dark:group-hover:border-purple-500 transition-all duration-300">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 line-clamp-2">
                    {article.title}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTime}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-purple-400" />
                  </div>
                </div>

                {index < displayArticles.length - 1 && (
                  <div className="border-t dark:border-gray-700 mt-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CompactRelatedArticles;
    `
  };

  return variants[variant] || variants.cards;
};
