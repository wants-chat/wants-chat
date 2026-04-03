import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateProductFilter = (
  resolved: ResolvedComponent,
  variant: 'sidebar' | 'horizontal' | 'dropdown' | 'modal' = 'sidebar'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `data.${mapping.sourceField}`;
    }
    // Return fallback value
    const fallback = mapping?.fallback;
    if (fallback === null || fallback === undefined) {
      // For ID fields
      if (fieldName === 'id' || fieldName.endsWith('Id')) {
        return `data.id || data._id`;
      }
      // For array fields
      if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders/i)) {
        return `data.${fieldName} || ([] as any[])`;
      }
      // For object fields
      if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
        return `data.${fieldName} || ({} as any)`;
      }
      // For scalar values
      return `data.${fieldName} || ''`;
    }
    if (typeof fallback === 'string') {
      return `'${fallback.replace(/'/g, "\\'")}'`;
    }
    if (typeof fallback === 'object') {
      return JSON.stringify(fallback);
    }
    return String(fallback);
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
    if (!dataSource) return 'dataSource';
    const parts = dataSource.split('.');
    return sanitizeVariableName(parts[parts.length - 1]);
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
    return `/${dataSource || 'product-filter'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'productFilter' : 'productFilter';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Filter, X, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';`;

  const variants = {
    sidebar: `
${commonImports}

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'range' | 'search';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

interface ProductFilterProps {
  ${dataName}?: any;
  filters?: FilterGroup[];
  selectedFilters?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
  onClearFilters?: () => void;
  className?: string;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  ${dataName}: propData,
  filters: propFilters,
  selectedFilters: propSelectedFilters,
  onFilterChange,
  onClearFilters,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const data = ${dataName} ?? {};

  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>(
    propSelectedFilters ?? {}
  );
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const defaultFilters: FilterGroup[] = propFilters ?? data?.filters ?? [
    {
      id: 'category',
      label: 'Category',
      type: 'checkbox',
      options: [
        { id: 'electronics', label: 'Electronics', count: 245 },
        { id: 'clothing', label: 'Clothing', count: 189 },
        { id: 'home', label: 'Home & Garden', count: 156 },
        { id: 'sports', label: 'Sports', count: 98 },
        { id: 'books', label: 'Books', count: 312 }
      ]
    },
    {
      id: 'brand',
      label: 'Brand',
      type: 'search',
      options: [
        { id: 'apple', label: 'Apple', count: 45 },
        { id: 'samsung', label: 'Samsung', count: 38 },
        { id: 'nike', label: 'Nike', count: 67 },
        { id: 'adidas', label: 'Adidas', count: 54 },
        { id: 'sony', label: 'Sony', count: 29 }
      ]
    },
    {
      id: 'price',
      label: 'Price Range',
      type: 'range',
      min: 0,
      max: 1000
    },
    {
      id: 'rating',
      label: 'Customer Rating',
      type: 'checkbox',
      options: [
        { id: '5', label: '5 Stars', count: 89 },
        { id: '4', label: '4 Stars & Up', count: 234 },
        { id: '3', label: '3 Stars & Up', count: 456 },
        { id: '2', label: '2 Stars & Up', count: 678 }
      ]
    }
  ];

  const handleCheckboxChange = (groupId: string, optionId: string) => {
    const currentSelections = selectedFilters[groupId] || [];
    const newSelections = currentSelections.includes(optionId)
      ? currentSelections.filter((id: string) => id !== optionId)
      : [...currentSelections, optionId];

    const newFilters = {
      ...selectedFilters,
      [groupId]: newSelections
    };

    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    const newFilters = {
      ...selectedFilters,
      price: { min: values[0], max: values[1] }
    };
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleClearAll = () => {
    setSelectedFilters({});
    setPriceRange([0, 1000]);
    setSearchTerms({});
    onClearFilters?.();
  };

  const getActiveFilterCount = () => {
    return Object.values(selectedFilters).reduce((count, value) => {
      if (Array.isArray(value)) return count + value.length;
      if (typeof value === 'object') return count + 1;
      return count;
    }, 0);
  };

  const filterOptions = (options: FilterOption[], groupId: string) => {
    const searchTerm = searchTerms[groupId]?.toLowerCase() || '';
    if (!searchTerm) return options;
    return options.filter(opt => opt.label.toLowerCase().includes(searchTerm));
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle>Filters</CardTitle>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()}
              </Badge>
            )}
          </div>
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Accordion type="multiple" defaultValue={defaultFilters.map(f => f.id)} className="w-full">
          {defaultFilters.map((group) => (
            <AccordionItem key={group.id} value={group.id}>
              <AccordionTrigger className="text-sm font-bold hover:no-underline">
                {group.label}
              </AccordionTrigger>
              <AccordionContent>
                {group.type === 'checkbox' && group.options && (
                  <div className="space-y-3 pt-2">
                    {group.options.map((option) => (
                      <div key={option.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={\`\${group.id}-\${option.id}\`}
                            checked={selectedFilters[group.id]?.includes(option.id)}
                            onCheckedChange={() => handleCheckboxChange(group.id, option.id)}
                          />
                          <Label
                            htmlFor={\`\${group.id}-\${option.id}\`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                        {option.count !== undefined && (
                          <span className="text-xs text-gray-500">({option.count})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {group.type === 'search' && group.options && (
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder={\`Search \${group.label.toLowerCase()}...\`}
                        value={searchTerms[group.id] || ''}
                        onChange={(e) => setSearchTerms({ ...searchTerms, [group.id]: e.target.value })}
                        className="pl-8 h-9"
                      />
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filterOptions(group.options, group.id).map((option) => (
                        <div key={option.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={\`\${group.id}-\${option.id}\`}
                              checked={selectedFilters[group.id]?.includes(option.id)}
                              onCheckedChange={() => handleCheckboxChange(group.id, option.id)}
                            />
                            <Label
                              htmlFor={\`\${group.id}-\${option.id}\`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {option.label}
                            </Label>
                          </div>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500">({option.count})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {group.type === 'range' && (
                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        \${priceRange[0]}
                      </span>
                      <span className="text-gray-600">
                        \${priceRange[1]}
                      </span>
                    </div>
                    <Slider
                      min={group.min || 0}
                      max={group.max || 1000}
                      step={10}
                      value={priceRange}
                      onValueChange={handlePriceChange}
                      className="w-full"
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ProductFilter;
    `,

    horizontal: `
${commonImports}

interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

interface ProductFilterProps {
  ${dataName}?: any;
  filters?: FilterGroup[];
  selectedFilters?: Record<string, string[]>;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  onClearFilters?: () => void;
  className?: string;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  ${dataName}: propData,
  filters: propFilters,
  selectedFilters: propSelectedFilters,
  onFilterChange,
  onClearFilters,
  className
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const data = ${dataName} ?? {};

  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(
    propSelectedFilters ?? {}
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const defaultFilters: FilterGroup[] = propFilters ?? data?.filters ?? [
    {
      id: 'category',
      label: 'Category',
      options: [
        { id: 'electronics', label: 'Electronics' },
        { id: 'clothing', label: 'Clothing' },
        { id: 'home', label: 'Home & Garden' }
      ]
    },
    {
      id: 'brand',
      label: 'Brand',
      options: [
        { id: 'apple', label: 'Apple' },
        { id: 'samsung', label: 'Samsung' },
        { id: 'nike', label: 'Nike' }
      ]
    },
    {
      id: 'price',
      label: 'Price',
      options: [
        { id: 'under-50', label: 'Under $50' },
        { id: '50-100', label: '$50 - $100' },
        { id: 'over-100', label: 'Over $100' }
      ]
    }
  ];

  const handleFilterClick = (groupId: string, optionId: string) => {
    const currentSelections = selectedFilters[groupId] || [];
    const newSelections = currentSelections.includes(optionId)
      ? currentSelections.filter(id => id !== optionId)
      : [...currentSelections, optionId];

    const newFilters = {
      ...selectedFilters,
      [groupId]: newSelections
    };

    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className={cn("w-full bg-white border-b", className)}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="font-bold text-sm">Filters:</span>
          </div>

          {defaultFilters.map((group) => (
            <div key={group.id} className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleGroup(group.id)}
                className="gap-2"
              >
                {group.label}
                {selectedFilters[group.id]?.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {selectedFilters[group.id].length}
                  </Badge>
                )}
                {expandedGroups.has(group.id) ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>

              {expandedGroups.has(group.id) && (
                <Card className="absolute top-full mt-2 z-10 w-48 shadow-lg">
                  <CardContent className="p-3 space-y-2">
                    {group.options.map((option) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Checkbox
                          id={\`\${group.id}-\${option.id}\`}
                          checked={selectedFilters[group.id]?.includes(option.id)}
                          onCheckedChange={() => handleFilterClick(group.id, option.id)}
                        />
                        <Label
                          htmlFor={\`\${group.id}-\${option.id}\`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          ))}

          {Object.values(selectedFilters).some(arr => arr.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFilters({});
                onClearFilters?.();
              }}
              className="text-gray-500"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilter;
    `
  };

  return variants[variant] || variants.sidebar;
};
