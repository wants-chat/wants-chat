import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateNoResultsFound = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'suggestions' | 'alternatives' = 'simple'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchX, X, LayoutGrid, Laptop, Shirt, Home, Dumbbell, TrendingUp, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    simple: `
${commonImports}

interface NoResultsFoundProps {
  ${dataName}?: any;
  className?: string;
  onClearFilters?: () => void;
  onBrowseAll?: () => void;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({
  ${dataName}: propData,
  className,
  onClearFilters,
  onBrowseAll
}) => {
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

  const noResultsData = ${dataName} || {};

  const heading = ${getField('heading')};
  const message = ${getField('message')};
  const clearFiltersButton = ${getField('clearFiltersButton')};
  const browseAllButton = ${getField('browseAllButton')};

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      console.log('Clear filters clicked');
    }
  };

  const handleBrowseAll = () => {
    if (onBrowseAll) {
      onBrowseAll();
    } else {
      console.log('Browse all clicked');
    }
  };

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
          <SearchX className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {heading}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={handleClearFilters}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <X className="w-5 h-5 mr-2" />
            {clearFiltersButton}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleBrowseAll}
          >
            <LayoutGrid className="w-5 h-5 mr-2" />
            {browseAllButton}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoResultsFound;
    `,

    suggestions: `
${commonImports}

interface NoResultsFoundProps {
  ${dataName}?: any;
  className?: string;
  onClearSearch?: () => void;
  onSuggestionClick?: (query: string) => void;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({
  ${dataName}: propData,
  className,
  onClearSearch,
  onSuggestionClick
}) => {
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

  const noResultsData = ${dataName} || {};

  const heading = ${getField('heading')};
  const message = ${getField('message')};
  const searchQueryLabel = ${getField('searchQueryLabel')};
  const searchQuery = ${getField('searchQuery')};
  const clearSearchButton = ${getField('clearSearchButton')};
  const searchTipsTitle = ${getField('searchTipsTitle')};
  const searchTips = ${getField('searchTips')};
  const suggestionsTitle = ${getField('suggestionsTitle')};
  const suggestions = ${getField('suggestions')};

  const handleClearSearch = () => {
    if (onClearSearch) {
      onClearSearch();
    } else {
      console.log('Clear search clicked');
    }
  };

  const handleSuggestion = (query: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(query);
    } else {
      console.log('Suggestion clicked:', query);
    }
  };

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-6">
            <SearchX className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {heading}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {message}
          </p>

          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-500">{searchQueryLabel}</span>
            <Badge variant="secondary" className="text-base px-3 py-1">
              "{searchQuery}"
            </Badge>
          </div>

          <Button
            onClick={handleClearSearch}
            variant="outline"
          >
            <X className="w-4 h-4 mr-2" />
            {clearSearchButton}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                {searchTipsTitle}
              </h4>
              <ul className="space-y-2">
                {searchTips.map((tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                {suggestionsTitle}
              </h4>
              <div className="space-y-2">
                {suggestions.map((suggestion: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(suggestion.query)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {suggestion.query}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NoResultsFound;
    `,

    alternatives: `
${commonImports}

interface NoResultsFoundProps {
  ${dataName}?: any;
  className?: string;
  onClearFilters?: () => void;
  onCategoryClick?: (category: string) => void;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({
  ${dataName}: propData,
  className,
  onClearFilters,
  onCategoryClick
}) => {
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

  const noResultsData = ${dataName} || {};

  const headingAlternate = ${getField('headingAlternate')};
  const messageDetailed = ${getField('messageDetailed')};
  const tryAgainButton = ${getField('tryAgainButton')};
  const categoriesTitle = ${getField('categoriesTitle')};
  const categories = ${getField('categories')};

  const handleTryAgain = () => {
    if (onClearFilters) {
      onClearFilters();
    } else {
      console.log('Try again clicked');
    }
  };

  const handleCategory = (category: string) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      console.log('Category clicked:', category);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'laptop': return <Laptop className="w-6 h-6" />;
      case 'shirt': return <Shirt className="w-6 h-6" />;
      case 'home': return <Home className="w-6 h-6" />;
      case 'dumbbell': return <Dumbbell className="w-6 h-6" />;
      default: return <LayoutGrid className="w-6 h-6" />;
    }
  };

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
            <SearchX className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>

          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {headingAlternate}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            {messageDetailed}
          </p>

          <Button
            size="lg"
            onClick={handleTryAgain}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {tryAgainButton}
          </Button>
        </div>

        <div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {categoriesTitle}
          </h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category: any, index: number) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => handleCategory(category.name)}
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                    {getCategoryIcon(category.icon)}
                  </div>
                  <h5 className="font-bold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h5>
                  <Badge variant="secondary">
                    {category.count} items
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoResultsFound;
    `
  };

  return variants[variant] || variants.simple;
};
