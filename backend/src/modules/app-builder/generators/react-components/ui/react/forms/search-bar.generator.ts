import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSearchBar = (
  resolved: ResolvedComponent,
  variant: 'searchBarBasic' | 'searchBarWithVoice' | 'searchBarWithCountry' | 'searchBarWithIcon' | 'searchBarWithCategory' = 'searchBarBasic'
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Globe, Mic, ChevronDown, GitBranch, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    searchBarBasic: `
${commonImports}

interface SearchBarProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onClear?: (data?: any) => void;
  onSuggestionClick?: (suggestion: any) => void;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  className,
  onSearch
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
  
  const [query, setQuery] = useState('');

  const placeholder = ${getField('placeholderBasic')};
  const buttonText = ${getField('buttonText')};

  // Event handlers
  const handleSearch = () => {
    console.log('Search triggered:', query);
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      }
      alert(\`Searching for: "\${query}"\`);
    } else {
      alert('Please enter a search query');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    console.log('Search query updated:', e.target.value);
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-4", className)}>
      <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-2xl border-2 border-blue-200 dark:border-purple-700 hover:border-blue-400 dark:hover:border-purple-500 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="flex items-center pl-6 pr-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <Search className="w-5 h-5 text-white" />
          </div>
        </div>

        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg h-16 px-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />

        <div className="pr-4 pl-2">
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 h-12 text-base font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBarComponent;
    `,

    searchBarWithVoice: `
${commonImports}

interface SearchBarProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onClear?: (data?: any) => void;
  onSuggestionClick?: (suggestion: any) => void;
  onVoiceSearch?: () => void;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({ 
  ${dataName}, 
  className,
  onSearch,
  onVoiceSearch
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
  
  const [query, setQuery] = useState('');

  const placeholder = ${getField('placeholderWithVoice')};
  const buttonText = ${getField('buttonText')};
  const voiceSearchLabel = ${getField('voiceSearchLabel')};

  // Event handlers
  const handleSearch = () => {
    console.log('Search triggered:', query);
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      }
      alert(\`Searching for: "\${query}"\`);
    } else {
      alert('Please enter a search query');
    }
  };

  const handleVoiceSearch = () => {
    console.log('Voice search triggered');
    if (onVoiceSearch) {
      onVoiceSearch();
    }
    alert('Voice search activated\\nSpeak your search query...');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    console.log('Search query updated:', e.target.value);
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto p-4", className)}>
      <div className="flex items-center gap-3">
        <div className="flex-1 relative flex items-center bg-white dark:bg-gray-800 rounded-full shadow-2xl border-2 border-blue-200 dark:border-purple-700 hover:border-blue-400 dark:hover:border-purple-500 overflow-hidden transition-all duration-300">
          <div className="flex items-center pl-5 pr-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <Globe className="w-4 h-4 text-white" />
            </div>
          </div>

          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-14 px-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />

          <button
            onClick={handleVoiceSearch}
            className="flex items-center pr-5 pl-3 hover:scale-110 transition-all duration-300"
            aria-label={voiceSearchLabel}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg">
              <Mic className="w-4 h-4 text-white" />
            </div>
          </button>
        </div>

        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 h-14 text-base font-bold rounded-full flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <Search className="w-5 h-5" />
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SearchBarComponent;
    `,

    searchBarWithCountry: `
${commonImports}

interface Country {
  code: string;
  name: string;
  flag: string;
}

interface SearchBarProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSearch?: (query: string, country: string) => void;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  className,
  onSearch
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
  
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const defaultCountry = ${getField('defaultCountry')};
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);

  const placeholder = ${getField('placeholderWithCountry')};
  const countries: Country[] = ${getField('countries')};

  // Event handlers
  const handleSearch = () => {
    console.log('Search triggered:', { query, country: selectedCountry.code });
    if (query.trim()) {
      if (onSearch) {
        onSearch(query, selectedCountry.code);
      }
      alert(\`Searching for: "\${query}"\\nCountry: \${selectedCountry.name}\`);
    } else {
      alert('Please enter a search query');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    console.log('Search query updated:', e.target.value);
  };

  const selectCountry = (country: Country) => {
    console.log('Country selected:', country);
    setSelectedCountry(country);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    console.log('Country dropdown toggled');
    setShowDropdown(!showDropdown);
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto p-4", className)}>
      <div className="flex items-stretch gap-3">
        {/* Country Selector */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="h-14 px-5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-full shadow-lg border-2 border-blue-200 dark:border-purple-700 hover:border-blue-400 dark:hover:border-purple-500 flex items-center gap-2 transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <span className="text-2xl">{selectedCountry.flag}</span>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{selectedCountry.name}</span>
            <ChevronDown className="w-4 h-4 text-blue-600 dark:text-purple-400" />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 max-h-80 overflow-y-auto">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => selectCountry(country)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{country.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Search Input */}
        <div className="flex-1 relative flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-14 px-6 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-14 h-14 p-0 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SearchBarComponent;
    `,

    searchBarWithIcon: `
${commonImports}

interface SearchBarProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onClear?: (data?: any) => void;
  onSuggestionClick?: (suggestion: any) => void;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  className,
  onSearch
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
  
  const [query, setQuery] = useState('');

  const placeholder = ${getField('placeholderWithIcon')};
  const iconType = ${getField('iconType')};

  // Event handlers
  const handleSearch = () => {
    console.log('Search triggered:', query);
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      }
      alert(\`Searching for: "\${query}"\`);
    } else {
      alert('Please enter a search query');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    console.log('Search query updated:', e.target.value);
  };

  const renderIcon = () => {
    switch (iconType) {
      case 'GitBranch':
        return <GitBranch className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
      case 'Search':
        return <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
      default:
        return <GitBranch className="w-5 h-5 text-gray-400 dark:text-gray-500" />;
    }
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-4", className)}>
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 relative flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center pl-6 pr-3">
            {renderIcon()}
          </div>

          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-16 px-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white w-16 h-16 p-0 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <Search className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default SearchBarComponent;
    `,

    searchBarWithCategory: `
${commonImports}

interface SearchBarProps {
  ${dataName}?: any;
  entity?: string;
  className?: string;
  onSearch?: (query: string, category: string) => void;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  ${dataName}: propData,
  entity = '${dataSource || 'data'}',
  className,
  onSearch
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
  
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const defaultCategory = ${getField('defaultCategory')};
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  const placeholder = ${getField('placeholderWithCategory')};
  const buttonText = ${getField('buttonText')};
  const categories = ${getField('categories')};

  // Event handlers
  const handleSearch = () => {
    console.log('Search triggered:', { query, category: selectedCategory });
    if (query.trim()) {
      if (onSearch) {
        onSearch(query, selectedCategory);
      }
      alert(\`Searching for: "\${query}"\\nCategory: \${selectedCategory}\`);
    } else {
      alert('Please enter a search query');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    console.log('Search query updated:', e.target.value);
  };

  const selectCategory = (category: string) => {
    console.log('Category selected:', category);
    setSelectedCategory(category);
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    console.log('Category dropdown toggled');
    setShowDropdown(!showDropdown);
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto p-4", className)}>
      <div className="flex items-stretch">
        {/* Category Selector */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="h-16 px-6 bg-white dark:bg-gray-800 rounded-l-2xl border border-r-0 border-gray-200 dark:border-gray-700 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">{selectedCategory}</span>
            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 max-h-80 overflow-y-auto">
                {categories.map((category: string) => (
                  <button
                    key={category}
                    onClick={() => selectCategory(category)}
                    className={cn(
                      "w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                      selectedCategory === category ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Search Input */}
        <div className="flex-1 relative flex items-center bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700 overflow-hidden">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-16 px-6 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 h-16 rounded-l-none rounded-r-full flex items-center justify-center gap-2 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Search className="w-5 h-5" />
          <span className="hidden sm:inline">{buttonText}</span>
        </button>
      </div>
    </div>
  );
};

export default SearchBarComponent;
    `
  };

  return variants[variant] || variants.searchBarBasic;
};
