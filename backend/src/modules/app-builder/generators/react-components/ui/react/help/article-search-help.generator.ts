import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateArticleSearchHelp = (
  resolved: ResolvedComponent,
  variant: 'instant' | 'modal' | 'page' = 'instant'
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
  const entity = dataSource?.split('.').pop() || 'articles';

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, X, Clock, FileText, ChevronRight, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';`;

  const variants = {
    instant: `
${commonImports}

interface ArticleSearchInstantProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ArticleSearchInstant: React.FC<ArticleSearchInstantProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const searchData = ${dataName} || {};

  const searchPlaceholder = ${getField('searchPlaceholder')};
  const suggestedTitle = ${getField('suggestedTitle')};
  const suggestedArticles = ${getField('suggestedArticles')};
  const recentSearchesTitle = ${getField('recentSearchesTitle')};
  const recentSearches = ${getField('recentSearches')};
  const noResultsTitle = ${getField('noResultsTitle')};
  const noResultsMessage = ${getField('noResultsMessage')};

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
        setShowResults(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleArticleClick = (article: any) => {
    console.log('Article clicked:', article);
    alert(\`Opening article: "\${article.title}"\`);
  };

  const handleRecentSearch = (search: string) => {
    console.log('Recent search clicked:', search);
    setSearchQuery(search);
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto p-4", className)}>
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-14 text-lg bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Instant Results Dropdown */}
        {(showResults || !searchQuery) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
            {searchQuery ? (
              isSearching ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-3">Searching...</p>
                </div>
              ) : suggestedArticles.length > 0 ? (
                <div className="p-2">
                  {suggestedArticles.map((article: any) => (
                    <div
                      key={article.id}
                      onClick={() => handleArticleClick(article)}
                      className="p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {article.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-600 rounded">
                              {article.category}
                            </span>
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-900 dark:text-white font-semibold mb-2">{noResultsTitle}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{noResultsMessage}</p>
                </div>
              )
            ) : (
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-2">
                  {recentSearchesTitle}
                </h4>
                <div className="space-y-1">
                  {recentSearches.map((search: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearch(search)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleSearchInstant;
    `,

    modal: `
${commonImports}

interface ArticleSearchModalProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const ArticleSearchModal: React.FC<ArticleSearchModalProps> = ({ ${dataName}: propData, className, isOpen = true, onClose }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const searchData = ${dataName} || {};

  const searchPlaceholder = ${getField('searchPlaceholder')};
  const closeButton = ${getField('closeButton')};
  const filterLabel = ${getField('filterLabel')};
  const categories = ${getField('categories')};
  const suggestedTitle = ${getField('suggestedTitle')};
  const suggestedArticles = ${getField('suggestedArticles')};
  const recentSearchesTitle = ${getField('recentSearchesTitle')};
  const recentSearches = ${getField('recentSearches')};

  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleClose = () => {
    console.log('Modal closed');
    if (onClose) onClose();
  };

  const handleArticleClick = (article: any) => {
    console.log('Article clicked:', article);
    alert(\`Opening article: "\${article.title}"\`);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-start justify-center pt-20", className)}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="pl-12 h-12 text-lg bg-gray-50 dark:bg-gray-700"
              />
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
            >
              {closeButton}
            </Button>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{filterLabel}:</span>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat: any) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                    selectedCategory === cat.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isSearching ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Searching...</p>
            </div>
          ) : searchQuery ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {suggestedTitle}
              </h3>
              <div className="space-y-3">
                {suggestedArticles.map((article: any) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {article.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {article.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded">
                            {article.category}
                          </span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {recentSearchesTitle}
              </h3>
              <div className="space-y-2">
                {recentSearches.map((search: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSearchQuery(search)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                  >
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleSearchModal;
    `,

    page: `
${commonImports}

interface ArticleSearchPageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ArticleSearchPage: React.FC<ArticleSearchPageProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [isSearching, setIsSearching] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const searchData = ${dataName} || {};

  const searchPlaceholder = ${getField('searchPlaceholder')};
  const searchButton = ${getField('searchButton')};
  const filterLabel = ${getField('filterLabel')};
  const sortLabel = ${getField('sortLabel')};
  const categories = ${getField('categories')};
  const sortOptions = ${getField('sortOptions')};
  const resultsTitle = ${getField('resultsTitle')};
  const showingResultsText = ${getField('showingResultsText')};
  const suggestedArticles = ${getField('suggestedArticles')};
  const noResultsTitle = ${getField('noResultsTitle')};
  const noResultsMessage = ${getField('noResultsMessage')};

  const handleSearch = () => {
    console.log('Search:', { searchQuery, selectedCategory, sortBy });
    if (searchQuery.trim()) {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 600);
    }
  };

  const handleArticleClick = (article: any) => {
    console.log('Article clicked:', article);
    alert(\`Opening article: "\${article.title}"\`);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Search Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Search Help Articles
          </h1>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 h-14 text-lg"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="px-8 h-14 bg-blue-600 hover:bg-blue-700"
            >
              {searchButton}
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center gap-6">
            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {filterLabel}:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {categories.map((cat: any) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {sortLabel}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {sortOptions.map((option: any) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isSearching ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Searching articles...</p>
          </div>
        ) : searchQuery ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {resultsTitle}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {showingResultsText} "{searchQuery}"
              </p>
            </div>

            {suggestedArticles.length > 0 ? (
              <div className="grid gap-4">
                {suggestedArticles.map((article: any) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {article.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full font-medium">
                            {article.category}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {article.readTime}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {noResultsTitle}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {noResultsMessage}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <TrendingUp className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Start searching for help articles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Enter keywords to find relevant articles and guides
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleSearchPage;
    `
  };

  return variants[variant] || variants.instant;
};
