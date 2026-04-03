import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSearchResultsPage = (
  resolved: ResolvedComponent,
  variant: 'list' | 'grid' | 'detailed' = 'list'
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
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Loader2 } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';`;

  const variants = {
    list: `
${commonImports}
import {
  Search, SlidersHorizontal, X, ChevronDown, ChevronLeft, ChevronRight,
  Star, MapPin, Check, Grid, List as ListIcon, Filter
} from 'lucide-react';
import { api } from '@/lib/api';

interface SearchResult {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  image: string;
  url: string;
  inStock: boolean;
  featured: boolean;
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterCategory {
  id: string;
  name: string;
  options: FilterOption[];
}

interface SearchResultsPageProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  ${dataName},
  className,
  onResultClick
}) => {
  
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const searchData = propData || fetchedData || {};

  const initialResults: SearchResult[] = ${getField('searchResults')};
  const filterCategories: FilterCategory[] = ${getField('filterCategories')};
  const sortOptions = ${getField('sortOptions')};
  const didYouMeanSuggestions: string[] = ${getField('didYouMeanSuggestions')};
  const relatedSearches: string[] = ${getField('relatedSearches')};
  const defaultQuery = ${getField('defaultQuery')};

  const [results, setResults] = useState<SearchResult[]>(initialResults);
  const [query, setQuery] = useState(defaultQuery);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  const searchResultsTitle = ${getField('searchResultsTitle')};
  const showingResultsLabel = ${getField('showingResultsLabel')};
  const noResultsTitle = ${getField('noResultsTitle')};
  const noResultsMessage = ${getField('noResultsMessage')};
  const didYouMeanLabel = ${getField('didYouMeanLabel')};
  const relatedSearchesLabel = ${getField('relatedSearchesLabel')};
  const sortByLabel = ${getField('sortByLabel')};
  const filterByLabel = ${getField('filterByLabel')};
  const clearFiltersButton = ${getField('clearFiltersButton')};
  const showFiltersButton = ${getField('showFiltersButton')};
  const hideFiltersButton = ${getField('hideFiltersButton')};
  const previousButton = ${getField('previousButton')};
  const nextButton = ${getField('nextButton')};
  const pageLabel = ${getField('pageLabel')};
  const ofLabel = ${getField('ofLabel')};

  const filteredResults = useMemo(() => {
    let filtered = [...initialResults];

    // Apply filters
    Object.entries(selectedFilters).forEach(([category, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(result => {
          if (category === 'category') {
            return values.includes(result.category.toLowerCase());
          }
          if (category === 'brand') {
            return values.includes(result.brand.toLowerCase().replace(' ', '-'));
          }
          if (category === 'rating') {
            return values.some(val => result.rating >= parseInt(val));
          }
          if (category === 'price') {
            return values.some(range => {
              const [min, max] = range.split('-').map(v => v.replace('+', ''));
              const minPrice = parseInt(min);
              const maxPrice = max ? parseInt(max) : Infinity;
              return result.price >= minPrice && result.price <= maxPrice;
            });
          }
          return true;
        });
      }
    });

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.id - b.id);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filtered;
  }, [initialResults, selectedFilters, sortBy]);

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const toggleFilter = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];

      console.log(\`Filter toggled: \${category} - \${value}\`, updated);
      return { ...prev, [category]: updated };
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    console.log('All filters cleared');
    setSelectedFilters({});
    setCurrentPage(1);
  };

  const handleSort = (value: string) => {
    console.log('Sort changed:', value);
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('Result clicked:', result);
    if (onResultClick) onResultClick(result);
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log('Suggestion clicked:', suggestion);
    setQuery(suggestion);
    setCurrentPage(1);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={\`h-4 w-4 \${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}\`}
          />
        ))}
      </div>
    );
  };

  const activeFilterCount = Object.values(selectedFilters).reduce((acc, filters) => acc + filters.length, 0);

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {searchResultsTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {showingResultsLabel
              .replace('{count}', filteredResults.length.toString())
              .replace('{query}', query)}
          </p>
        </div>

        {/* Did you mean & Related searches */}
        {didYouMeanSuggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{didYouMeanLabel}</p>
            <div className="flex flex-wrap gap-2">
              {didYouMeanSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <Card className="p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    {filterByLabel}
                  </h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {clearFiltersButton}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {filterCategories.map((category) => (
                    <div key={category.id}>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                        {category.name}
                      </h4>
                      <div className="space-y-2">
                        {category.options.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters[category.id]?.includes(option.value) || false}
                              onChange={() => toggleFilter(category.id, option.value)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white flex-1">
                              {option.label}
                            </span>
                            <span className="text-xs text-gray-500">({option.count})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? hideFiltersButton : showFiltersButton}
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{sortByLabel}</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results List */}
            {paginatedResults.length > 0 ? (
              <div className="space-y-4">
                {paginatedResults.map((result) => (
                  <Card
                    key={result.id}
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex gap-4">
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 hover:text-blue-600 dark:hover:text-blue-400">
                              {result.title}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              {renderStars(result.rating)}
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                ({result.reviews.toLocaleString()} reviews)
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                              \${Number(result.price).toFixed(2)}
                            </div>
                            {result.inStock ? (
                              <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 justify-end mt-1">
                                <Check className="w-4 h-4" />
                                In Stock
                              </div>
                            ) : (
                              <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                                Out of Stock
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                          {result.description}
                        </p>

                        <div className="flex items-center gap-4">
                          <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                            {result.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {result.brand}
                          </span>
                          {result.featured && (
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {noResultsTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{noResultsMessage}</p>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {previousButton}
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {pageLabel} {currentPage} {ofLabel} {totalPages}
                  </span>
                </div>

                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  {nextButton}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Related Searches */}
        {relatedSearches.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {relatedSearchesLabel}
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(search)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
    `,

    grid: `
${commonImports}
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  Star, Check, Filter, Grid as GridIcon
} from 'lucide-react';

interface SearchResult {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  image: string;
  url: string;
  inStock: boolean;
  featured: boolean;
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterCategory {
  id: string;
  name: string;
  options: FilterOption[];
}

interface SearchResultsPageProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  ${dataName},
  className,
  onResultClick
}) => {
  
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const searchData = propData || fetchedData || {};

  const initialResults: SearchResult[] = ${getField('searchResults')};
  const filterCategories: FilterCategory[] = ${getField('filterCategories')};
  const sortOptions = ${getField('sortOptions')};
  const didYouMeanSuggestions: string[] = ${getField('didYouMeanSuggestions')};
  const relatedSearches: string[] = ${getField('relatedSearches')};
  const defaultQuery = ${getField('defaultQuery')};

  const [results, setResults] = useState<SearchResult[]>(initialResults);
  const [query, setQuery] = useState(defaultQuery);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 12;

  const searchResultsTitle = ${getField('searchResultsTitle')};
  const showingResultsLabel = ${getField('showingResultsLabel')};
  const noResultsTitle = ${getField('noResultsTitle')};
  const noResultsMessage = ${getField('noResultsMessage')};
  const didYouMeanLabel = ${getField('didYouMeanLabel')};
  const relatedSearchesLabel = ${getField('relatedSearchesLabel')};
  const sortByLabel = ${getField('sortByLabel')};
  const filterByLabel = ${getField('filterByLabel')};
  const clearFiltersButton = ${getField('clearFiltersButton')};
  const showFiltersButton = ${getField('showFiltersButton')};
  const hideFiltersButton = ${getField('hideFiltersButton')};
  const previousButton = ${getField('previousButton')};
  const nextButton = ${getField('nextButton')};
  const pageLabel = ${getField('pageLabel')};
  const ofLabel = ${getField('ofLabel')};

  const filteredResults = useMemo(() => {
    let filtered = [...initialResults];

    // Apply filters
    Object.entries(selectedFilters).forEach(([category, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(result => {
          if (category === 'category') {
            return values.includes(result.category.toLowerCase());
          }
          if (category === 'brand') {
            return values.includes(result.brand.toLowerCase().replace(' ', '-'));
          }
          if (category === 'rating') {
            return values.some(val => result.rating >= parseInt(val));
          }
          if (category === 'price') {
            return values.some(range => {
              const [min, max] = range.split('-').map(v => v.replace('+', ''));
              const minPrice = parseInt(min);
              const maxPrice = max ? parseInt(max) : Infinity;
              return result.price >= minPrice && result.price <= maxPrice;
            });
          }
          return true;
        });
      }
    });

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.id - b.id);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filtered;
  }, [initialResults, selectedFilters, sortBy]);

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const toggleFilter = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];

      console.log(\`Filter toggled: \${category} - \${value}\`, updated);
      return { ...prev, [category]: updated };
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    console.log('All filters cleared');
    setSelectedFilters({});
    setCurrentPage(1);
  };

  const handleSort = (value: string) => {
    console.log('Sort changed:', value);
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('Result clicked:', result);
    if (onResultClick) onResultClick(result);
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log('Suggestion clicked:', suggestion);
    setQuery(suggestion);
    setCurrentPage(1);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={\`h-4 w-4 \${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}\`}
          />
        ))}
      </div>
    );
  };

  const activeFilterCount = Object.values(selectedFilters).reduce((acc, filters) => acc + filters.length, 0);

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {searchResultsTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {showingResultsLabel
              .replace('{count}', filteredResults.length.toString())
              .replace('{query}', query)}
          </p>
        </div>

        {/* Did you mean */}
        {didYouMeanSuggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{didYouMeanLabel}</p>
            <div className="flex flex-wrap gap-2">
              {didYouMeanSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <Card className="p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    {filterByLabel}
                  </h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {clearFiltersButton}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {filterCategories.map((category) => (
                    <div key={category.id}>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                        {category.name}
                      </h4>
                      <div className="space-y-2">
                        {category.options.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters[category.id]?.includes(option.value) || false}
                              onChange={() => toggleFilter(category.id, option.value)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white flex-1">
                              {option.label}
                            </span>
                            <span className="text-xs text-gray-500">({option.count})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? hideFiltersButton : showFiltersButton}
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{sortByLabel}</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Grid */}
            {paginatedResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedResults.map((result) => (
                  <Card
                    key={result.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="relative">
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {result.featured && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {result.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(result.rating)}
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          ({result.reviews.toLocaleString()})
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          \${Number(result.price).toFixed(2)}
                        </div>
                        {result.inStock ? (
                          <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            In Stock
                          </div>
                        ) : (
                          <div className="text-sm text-red-600 dark:text-red-400">
                            Out of Stock
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {noResultsTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{noResultsMessage}</p>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {previousButton}
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {pageLabel} {currentPage} {ofLabel} {totalPages}
                  </span>
                </div>

                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  {nextButton}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Related Searches */}
        {relatedSearches.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {relatedSearchesLabel}
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(search)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
    `,

    detailed: `
${commonImports}
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  Star, Check, Filter, ExternalLink, Heart, ShoppingCart, Eye
} from 'lucide-react';

interface SearchResult {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  image: string;
  url: string;
  inStock: boolean;
  featured: boolean;
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterCategory {
  id: string;
  name: string;
  options: FilterOption[];
}

interface SearchResultsPageProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  ${dataName},
  className,
  onResultClick
}) => {
  
  // Fetch data using useQuery
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: () => api.get<any>(\`${apiRoute}\`),
    enabled: !propData,
  });

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const searchData = propData || fetchedData || {};

  const initialResults: SearchResult[] = ${getField('searchResults')};
  const filterCategories: FilterCategory[] = ${getField('filterCategories')};
  const sortOptions = ${getField('sortOptions')};
  const didYouMeanSuggestions: string[] = ${getField('didYouMeanSuggestions')};
  const relatedSearches: string[] = ${getField('relatedSearches')};
  const defaultQuery = ${getField('defaultQuery')};

  const [results, setResults] = useState<SearchResult[]>(initialResults);
  const [query, setQuery] = useState(defaultQuery);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<number[]>([]);
  const resultsPerPage = 6;

  const searchResultsTitle = ${getField('searchResultsTitle')};
  const showingResultsLabel = ${getField('showingResultsLabel')};
  const noResultsTitle = ${getField('noResultsTitle')};
  const noResultsMessage = ${getField('noResultsMessage')};
  const didYouMeanLabel = ${getField('didYouMeanLabel')};
  const relatedSearchesLabel = ${getField('relatedSearchesLabel')};
  const sortByLabel = ${getField('sortByLabel')};
  const filterByLabel = ${getField('filterByLabel')};
  const clearFiltersButton = ${getField('clearFiltersButton')};
  const showFiltersButton = ${getField('showFiltersButton')};
  const hideFiltersButton = ${getField('hideFiltersButton')};
  const previousButton = ${getField('previousButton')};
  const nextButton = ${getField('nextButton')};
  const pageLabel = ${getField('pageLabel')};
  const ofLabel = ${getField('ofLabel')};

  const filteredResults = useMemo(() => {
    let filtered = [...initialResults];

    // Apply filters
    Object.entries(selectedFilters).forEach(([category, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter(result => {
          if (category === 'category') {
            return values.includes(result.category.toLowerCase());
          }
          if (category === 'brand') {
            return values.includes(result.brand.toLowerCase().replace(' ', '-'));
          }
          if (category === 'rating') {
            return values.some(val => result.rating >= parseInt(val));
          }
          if (category === 'price') {
            return values.some(range => {
              const [min, max] = range.split('-').map(v => v.replace('+', ''));
              const minPrice = parseInt(min);
              const maxPrice = max ? parseInt(max) : Infinity;
              return result.price >= minPrice && result.price <= maxPrice;
            });
          }
          return true;
        });
      }
    });

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.id - b.id);
        break;
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filtered;
  }, [initialResults, selectedFilters, sortBy]);

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const toggleFilter = (category: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];

      console.log(\`Filter toggled: \${category} - \${value}\`, updated);
      return { ...prev, [category]: updated };
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    console.log('All filters cleared');
    setSelectedFilters({});
    setCurrentPage(1);
  };

  const handleSort = (value: string) => {
    console.log('Sort changed:', value);
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('Result clicked:', result);
    if (onResultClick) onResultClick(result);
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log('Suggestion clicked:', suggestion);
    setQuery(suggestion);
    setCurrentPage(1);
  };

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
    console.log('Favorite toggled:', id);
  };

  const handleAddToCart = (result: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Added to cart:', result);
    alert(\`Added "\${result.title}" to cart!\`);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={\`h-4 w-4 \${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}\`}
          />
        ))}
      </div>
    );
  };

  const activeFilterCount = Object.values(selectedFilters).reduce((acc, filters) => acc + filters.length, 0);

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {searchResultsTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {showingResultsLabel
              .replace('{count}', filteredResults.length.toString())
              .replace('{query}', query)}
          </p>
        </div>

        {/* Did you mean */}
        {didYouMeanSuggestions.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{didYouMeanLabel}</p>
            <div className="flex flex-wrap gap-2">
              {didYouMeanSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <Card className="p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    {filterByLabel}
                  </h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      {clearFiltersButton}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {filterCategories.map((category) => (
                    <div key={category.id}>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
                        {category.name}
                      </h4>
                      <div className="space-y-2">
                        {category.options.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters[category.id]?.includes(option.value) || false}
                              onChange={() => toggleFilter(category.id, option.value)}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white flex-1">
                              {option.label}
                            </span>
                            <span className="text-xs text-gray-500">({option.count})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                {showFilters ? hideFiltersButton : showFiltersButton}
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">{sortByLabel}</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Detailed Results */}
            {paginatedResults.length > 0 ? (
              <div className="space-y-6">
                {paginatedResults.map((result) => (
                  <Card
                    key={result.id}
                    className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex gap-6 p-6">
                      <div className="relative">
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-48 h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        />
                        {result.featured && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">
                            Featured
                          </div>
                        )}
                        <button
                          onClick={(e) => toggleFavorite(result.id, e)}
                          className="absolute top-2 left-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
                          <Heart className={\`w-5 h-5 \${favorites.includes(result.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-400'}\`} />
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {result.title}
                            </h3>
                            <div className="flex items-center gap-3 mb-2">
                              {renderStars(result.rating)}
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {result.rating} ({result.reviews.toLocaleString()} reviews)
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                                {result.category}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                by <span className="font-medium">{result.brand}</span>
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                              \${Number(result.price).toFixed(2)}
                            </div>
                            {result.inStock ? (
                              <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 justify-end">
                                <Check className="w-4 h-4" />
                                In Stock
                              </div>
                            ) : (
                              <div className="text-sm text-red-600 dark:text-red-400">
                                Out of Stock
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {result.description}
                        </p>

                        <div className="flex items-center gap-3">
                          {result.inStock && (
                            <Button
                              onClick={(e) => handleAddToCart(result, e)}
                              className="flex items-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Quick View
                          </Button>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {noResultsTitle}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{noResultsMessage}</p>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {previousButton}
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {pageLabel} {currentPage} {ofLabel} {totalPages}
                  </span>
                </div>

                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  {nextButton}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Related Searches */}
        {relatedSearches.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {relatedSearchesLabel}
            </h3>
            <div className="flex flex-wrap gap-2">
              {relatedSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(search)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
    `
  };

  return variants[variant] || variants.list;
};
