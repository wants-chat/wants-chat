import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBlogSearchBar = (
  resolved: ResolvedComponent,
  variant: 'header' | 'inline' | 'modal' = 'header'
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
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    header: `
${commonImports}
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface HeaderSearchBarProps {
  ${dataName}?: any;
  className?: string;
  onSearch?: (query: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
}

const HeaderSearchBar: React.FC<HeaderSearchBarProps> = ({
  ${dataName}: propData,
  className,
  onSearch,
  onSuggestionClick
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

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

  const blogData = ${dataName} || {};

  const searchPlaceholder = ${getField('searchPlaceholder')};
  const suggestions = ${getField('suggestions')};
  const recentSearches = ${getField('recentSearches')};
  const popularSearches = ${getField('popularSearches')};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        console.log('Search:', query);
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else if (onSearch) {
      onSearch(suggestion);
    } else {
      console.log('Suggestion clicked:', suggestion);
    }
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
  };

  const filteredSuggestions = suggestions.filter((s: string) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={searchRef} className={cn("relative max-w-2xl mx-auto", className)}>
      <form onSubmit={handleSearch} className="relative">
        <div className={\`relative flex items-center transition-all duration-200 \${
          isFocused ? 'ring-2 ring-blue-500 rounded-lg' : ''
        }\`}>
          <Search className="absolute left-4 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            className="pl-12 pr-24 h-12 text-base border-2"
          />
          <div className="absolute right-2 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (isFocused || query) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-xl max-h-96 overflow-y-auto">
          <div className="p-4">
            {/* Filtered Suggestions */}
            {query && filteredSuggestions.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Suggestions
                </h3>
                <div className="space-y-1">
                  {filteredSuggestions.slice(0, 5).map((suggestion: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </h3>
                <div className="space-y-1">
                  {recentSearches.map((search: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-sm text-gray-700 dark:text-gray-300"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {!query && popularSearches.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
                  <TrendingUp className="h-3 w-3" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full text-xs text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default HeaderSearchBar;
    `,

    inline: `
${commonImports}
import { Search, X } from 'lucide-react';

interface InlineSearchBarProps {
  ${dataName}?: any;
  className?: string;
  onSearch?: (query: string) => void;
}

const InlineSearchBar: React.FC<InlineSearchBarProps> = ({
  ${dataName}: propData,
  className,
  onSearch
}) => {
  const [query, setQuery] = useState('');

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

  const blogData = ${dataName} || {};
  const searchPlaceholder = ${getField('searchPlaceholder')};

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        console.log('Search:', query);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form onSubmit={handleSearch} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
    </form>
  );
};

export default InlineSearchBar;
    `,

    modal: `
${commonImports}
import { Search, X, ArrowRight, Clock } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ModalSearchBarProps {
  ${dataName}?: any;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
  onResultClick?: (result: any) => void;
}

const ModalSearchBar: React.FC<ModalSearchBarProps> = ({
  ${dataName}: propData,
  className,
  isOpen,
  onClose,
  onSearch,
  onResultClick
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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

  const blogData = ${dataName} || {};

  const title = ${getField('modalTitle')};
  const modalSearchPlaceholder = ${getField('modalSearchPlaceholder')};
  const recentSearches = ${getField('recentSearches')};
  const popularSearches = ${getField('popularSearches')};

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        console.log('Search:', query);
      }
    }
  };

  const handleRecentClick = (search: string) => {
    setQuery(search);
    if (onSearch) {
      onSearch(search);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 gap-0">
        {/* Search Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                placeholder={modalSearchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-14 text-lg border-2"
              />
            </div>
          </form>
        </div>

        {/* Search Body */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {!query ? (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Searches
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleRecentClick(search)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {search}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {popularSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleRecentClick(search)}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Press Enter to search for "<span className="font-semibold">{query}</span>"
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalSearchBar;
    `
  };

  return variants[variant] || variants.header;
};
