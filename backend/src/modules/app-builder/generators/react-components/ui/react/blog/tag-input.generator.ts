import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTagInput = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'withSuggestions' | 'chips' = 'basic'
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

  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'tags'}`;
  };
  const apiRoute = getApiRoute();
  const entity = dataSource || 'tags';

  const commonImports = `
import React, { useState, useRef, KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus, Tag as TagIcon, Hash, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    basic: `
${commonImports}

interface TagInputProps {
  ${dataName}?: any;
  className?: string;
  onChange?: (tags: string[]) => void;
}

const TagInputComponent: React.FC<TagInputProps> = ({
  ${dataName}: propData,
  className,
  onChange
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const { data: fetchedData, isLoading, error: fetchError } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const tagData = ${dataName} || {};

  const initialTags = ${getField('initialTags')};
  const placeholder = ${getField('placeholder')};
  const maxTags = ${getField('maxTags')};
  const duplicateMessage = ${getField('duplicateMessage')};
  const maxTagsMessage = ${getField('maxTagsMessage')};

  // Initialize tags from data if empty
  React.useEffect(() => {
    if (tags.length === 0 && initialTags && initialTags.length > 0) {
      setTags(initialTags);
    }
  }, [initialTags]);

  const addTag = () => {
    const tag = inputValue.trim();

    if (!tag) return;

    if (tags.length >= maxTags) {
      setError(maxTagsMessage);
      return;
    }

    if (tags.includes(tag)) {
      setError(duplicateMessage);
      return;
    }

    const newTags = [...tags, tag];
    setTags(newTags);
    setInputValue('');
    setError('');

    if (onChange) {
      onChange(newTags);
    }

    console.log('Tags updated:', newTags);
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);

    if (onChange) {
      onChange(newTags);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        {/* Tags Display */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag: any, index: number) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded-md text-sm font-medium"
            >
              <Hash className="h-3 w-3" />
              <span>{tag}</span>
              <button
                onClick={() => removeTag(index)}
                className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button onClick={addTag} disabled={!inputValue.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Tag Count */}
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {tags.length} / {maxTags} tags
        </div>
      </div>
    </div>
  );
};

export default TagInputComponent;
    `,

    withSuggestions: `
${commonImports}

interface TagInputProps {
  ${dataName}?: any;
  className?: string;
  onChange?: (tags: string[]) => void;
}

const TagInputComponent: React.FC<TagInputProps> = ({
  ${dataName}: propData,
  className,
  onChange
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: fetchedData, isLoading, error: fetchError } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const tagData = ${dataName} || {};

  const initialTags = ${getField('initialTags')};
  const placeholderWithSuggestions = ${getField('placeholderWithSuggestions')};
  const suggestions = ${getField('suggestions')};
  const popularTags = ${getField('popularTags')};
  const maxTags = ${getField('maxTags')};
  const duplicateMessage = ${getField('duplicateMessage')};
  const maxTagsMessage = ${getField('maxTagsMessage')};
  const popularLabel = ${getField('popularLabel')};

  // Initialize tags from data if empty
  React.useEffect(() => {
    if (tags.length === 0 && initialTags && initialTags.length > 0) {
      setTags(initialTags);
    }
  }, [initialTags]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();

    if (!trimmedTag) return;

    if (tags.length >= maxTags) {
      setError(maxTagsMessage);
      return;
    }

    if (tags.includes(trimmedTag)) {
      setError(duplicateMessage);
      return;
    }

    const newTags = [...tags, trimmedTag];
    setTags(newTags);
    setInputValue('');
    setError('');
    setShowSuggestions(false);

    if (onChange) {
      onChange(newTags);
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);

    if (onChange) {
      onChange(newTags);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setError('');

    if (value.length > 0) {
      const filtered = suggestions.filter((suggestion: string) =>
        suggestion.toLowerCase().includes(value.toLowerCase()) &&
        !tags.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)} ref={containerRef}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md p-4">
        {/* Tags Display */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag: any, index: number) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium"
            >
              <TagIcon className="h-3 w-3" />
              <span>{tag}</span>
              <button
                onClick={() => removeTag(index)}
                className="hover:bg-white/20 rounded-full p-0.5 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-3">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue && setShowSuggestions(true)}
            placeholder={placeholderWithSuggestions}
            className="flex-1"
          />
          <Button onClick={() => addTag(inputValue)} disabled={!inputValue.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Suggestions
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredSuggestions.slice(0, 10).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => addTag(suggestion)}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Tags */}
        {!inputValue && tags.length < maxTags && (
          <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <TrendingUp className="h-4 w-4" />
              {popularLabel}
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.filter((tag: string) => !tags.includes(tag)).map((tag: string, index: number) => (
                <button
                  key={index}
                  onClick={() => addTag(tag)}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag Count */}
        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {tags.length} / {maxTags} tags
        </div>
      </div>
    </div>
  );
};

export default TagInputComponent;
    `,

    chips: `
${commonImports}

interface TagInputProps {
  ${dataName}?: any;
  className?: string;
  onChange?: (tags: string[]) => void;
}

const TagInputComponent: React.FC<TagInputProps> = ({
  ${dataName}: propData,
  className,
  onChange
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  const { data: fetchedData, isLoading, error: fetchError } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const tagData = ${dataName} || {};

  const initialTags = ${getField('initialTags')};
  const placeholder = ${getField('placeholder')};
  const maxTags = ${getField('maxTags')};
  const clearAllLabel = ${getField('clearAllLabel')};
  const duplicateMessage = ${getField('duplicateMessage')};
  const maxTagsMessage = ${getField('maxTagsMessage')};

  // Initialize tags from data if empty
  React.useEffect(() => {
    if (tags.length === 0 && initialTags && initialTags.length > 0) {
      setTags(initialTags);
    }
  }, [initialTags]);

  const addTag = () => {
    const tag = inputValue.trim();

    if (!tag) return;

    if (tags.length >= maxTags) {
      setError(maxTagsMessage);
      return;
    }

    if (tags.includes(tag)) {
      setError(duplicateMessage);
      return;
    }

    const newTags = [...tags, tag];
    setTags(newTags);
    setInputValue('');
    setError('');

    if (onChange) {
      onChange(newTags);
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);

    if (onChange) {
      onChange(newTags);
    }
  };

  const clearAll = () => {
    setTags([]);
    setInputValue('');
    setError('');

    if (onChange) {
      onChange([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    } else if (e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md p-3 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <TagIcon className="h-4 w-4" />
            <span>Tags</span>
          </div>
          {tags.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              {clearAllLabel}
            </button>
          )}
        </div>

        {/* Tags as Chips */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 min-h-[80px] mb-3">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: any, index: number) => (
              <div
                key={index}
                className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Hash className="h-4 w-4" />
                <span>{tag}</span>
                <button
                onClick={() => removeTag(index)}
                  className="hover:bg-white/30 rounded-full p-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {tags.length === 0 && (
              <div className="text-gray-400 dark:text-gray-600 text-sm italic">
                No tags added yet. Type below to add tags.
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pr-24"
          />
          <Button
            onClick={addTag}
            disabled={!inputValue.trim()}
            className="absolute right-1 top-1 h-8"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <X className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div>
            {tags.length} / {maxTags} tags • Press Enter or comma to add
          </div>
          <div>
            Press Backspace to remove last tag
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagInputComponent;
    `
  };

  return variants[variant] || variants.basic;
};
