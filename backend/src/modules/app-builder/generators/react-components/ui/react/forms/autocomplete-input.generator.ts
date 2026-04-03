import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateAutocompleteInput = (
  resolved: ResolvedComponent,
  variant: 'dropdown' | 'inline' | 'chips' = 'dropdown'
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
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronDown, Loader2, Clock, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';`;

  const variants = {
    dropdown: `
${commonImports}

interface Suggestion {
  id: number;
  text: string;
  category?: string;
}

interface AutocompleteInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSelect?: (item: Suggestion) => void;
}

const AutocompleteInputComponent: React.FC<AutocompleteInputProps> = ({
  ${dataName},
  className,
  onSelect
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

  const autocompleteData = propData || fetchedData || {};

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const placeholder = ${getField('placeholder')};
  const suggestions: Suggestion[] = ${getField('suggestions')};
  const recentItems = ${getField('recentItems')};
  const noResultsMessage = ${getField('noResultsMessage')};
  const loadingMessage = ${getField('loadingMessage')};
  const recentSearchesLabel = ${getField('recentSearchesLabel')};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const filtered = suggestions.filter((item: any) =>
          item.text.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setIsLoading(false);
        setIsOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSelect = (item: Suggestion) => {
    setQuery(item.text);
    setIsOpen(false);
    if (onSelect) {
      onSelect(item);
    }
    console.log('Selected:', item);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredSuggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto relative", className)} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 h-12"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              {loadingMessage}
            </div>
          ) : filteredSuggestions.length > 0 ? (
            <ul className="py-2">
              {filteredSuggestions.map((item: any, index: number) => (
                <li
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={cn(
                    "px-4 py-3 cursor-pointer flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700",
                    index === selectedIndex && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.text}
                      </div>
                      {item.category && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.category}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              {noResultsMessage}
            </div>
          ) : null}

          {/* Recent Searches */}
          {!query && recentItems.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {recentSearchesLabel}
              </div>
              <ul>
                {recentItems.map((item: string, index: number) => (
                  <li
                    key={index}
                    onClick={() => setQuery(item)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInputComponent;
    `,

    inline: `
${commonImports}

interface Suggestion {
  id: number;
  text: string;
  category?: string;
}

interface AutocompleteInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSelect?: (item: Suggestion) => void;
}

const AutocompleteInputComponent: React.FC<AutocompleteInputProps> = ({
  ${dataName},
  className,
  onSelect
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

  const autocompleteData = propData || fetchedData || {};

  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const placeholderInline = ${getField('placeholderInline')};
  const suggestions: Suggestion[] = ${getField('suggestions')};

  useEffect(() => {
    if (query.length >= 2) {
      const match = suggestions.find(item =>
        item.text.toLowerCase().startsWith(query.toLowerCase())
      );
      if (match) {
        setSuggestion(match.text);
      } else {
        setSuggestion('');
      }
    } else {
      setSuggestion('');
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault();
      setQuery(suggestion);
      setSuggestion('');
    } else if (e.key === 'ArrowRight' && suggestion) {
      setQuery(suggestion);
      setSuggestion('');
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestion('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        {/* Suggestion overlay */}
        {suggestion && (
          <div className="absolute inset-0 flex items-center pl-10 pr-10 pointer-events-none">
            <span className="text-gray-400 dark:text-gray-600">
              {query}
              <span className="text-gray-300 dark:text-gray-700">
                {suggestion.substring(query.length)}
              </span>
            </span>
          </div>
        )}

        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderInline}
          className="pl-10 pr-10 h-12 bg-transparent relative z-10"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center z-20"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {suggestion && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">Tab</kbd> or <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">→</kbd> to autocomplete
        </div>
      )}
    </div>
  );
};

export default AutocompleteInputComponent;
    `,

    chips: `
${commonImports}

interface Suggestion {
  id: number;
  text: string;
  category?: string;
}

interface AutocompleteInputProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSelect?: (items: Suggestion[]) => void;
}

const AutocompleteInputComponent: React.FC<AutocompleteInputProps> = ({
  ${dataName},
  className,
  onSelect
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

  const autocompleteData = propData || fetchedData || {};

  const [query, setQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const placeholderChips = ${getField('placeholderChips')};
  const suggestions: Suggestion[] = ${getField('suggestions')};
  const noResultsMessage = ${getField('noResultsMessage')};
  const clearAllLabel = ${getField('clearAllLabel')};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 1) {
      const filtered = suggestions.filter((item: any) =>
        item.text.toLowerCase().includes(query.toLowerCase()) &&
        !selectedItems.find(selected => selected.id === item.id)
      );
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
  }, [query, selectedItems]);

  const handleSelect = (item: Suggestion) => {
    const newItems = [...selectedItems, item];
    setSelectedItems(newItems);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();

    if (onSelect) {
      onSelect(newItems);
    }
    console.log('Selected items:', newItems);
  };

  const handleRemove = (id: number) => {
    const newItems = selectedItems.filter((item: any) => item.id !== id);
    setSelectedItems(newItems);

    if (onSelect) {
      onSelect(newItems);
    }
  };

  const handleClearAll = () => {
    setSelectedItems([]);
    setQuery('');

    if (onSelect) {
      onSelect([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !query && selectedItems.length > 0) {
      handleRemove(selectedItems[selectedItems.length - 1].id);
    }
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)} ref={containerRef}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 min-h-[48px]">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Selected Items as Chips */}
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-full text-sm"
            >
              <span>{item.text}</span>
              <button
                onClick={() => handleRemove(item.id)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setIsOpen(true)}
            placeholder={selectedItems.length === 0 ? placeholderChips : ''}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400"
          />

          {/* Clear All Button */}
          {selectedItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {clearAllLabel}
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="relative z-50 mt-2">
          <div className="absolute w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
            <ul className="py-2">
              {filteredSuggestions.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.text}
                      </div>
                      {item.category && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.category}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Selected Count */}
      {selectedItems.length > 0 && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default AutocompleteInputComponent;
    `
  };

  return variants[variant] || variants.dropdown;
};
