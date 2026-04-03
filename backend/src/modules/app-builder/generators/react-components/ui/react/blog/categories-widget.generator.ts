import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCategoriesWidget = (
  resolved: ResolvedComponent,
  variant: 'list' | 'grid' | 'dropdown' = 'list'
) => {
  const dataSource = resolved.dataSource;
  const colorScheme = resolved.uiStyle?.colorScheme || 'blue';

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `data?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `data?.id || data?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `data?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `data?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `data?.${fieldName} || ''`;
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
    return `/${dataSource || 'categories'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'categories';

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    list: `
${commonImports}
import { Folder, ChevronRight, Tag, FileText } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  icon: string;
  description?: string;
  color?: string;
}

interface ListCategoriesProps {
  data?: any;
  entity?: string;
  className?: string;
  categories?: any[];
  variant?: string;
  colorScheme?: string;
  title?: string;
  showImages?: boolean;
  onCategoryClick?: (slug: string) => void;
  showIcons?: boolean;
  showCounts?: boolean;
  showPostCount?: boolean;
  clickable?: boolean;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onAuthorClick?: (authorName: string) => void;
}

const ListCategories: React.FC<ListCategoriesProps> = ({
  data: propData,
  className,
  onCategoryClick,
  showIcons = true,
  showCounts = false,
  showPostCount = false,
  clickable = false
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

  const data = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = data || {};

  const title = ${getField('listTitle')} || 'Browse Categories';
  const subtitle = ${getField('listSubtitle')} || 'Explore our content by topic';
  // If data is already an array, use it directly; otherwise try to get categories field
  const categories = Array.isArray(data) ? data : (${getField('categories')} || []);

  const handleCategoryClick = (slug: string) => {
    if (onCategoryClick) {
      onCategoryClick(slug);
    } else {
      console.log('Category clicked:', slug);
    }
  };

  // Default colors for categories if not provided
  const defaultColors = [
    'bg-${colorScheme}-100 text-${colorScheme}-700 hover:bg-${colorScheme}-200',
    'bg-purple-100 text-purple-700 hover:bg-purple-200',
    'bg-green-100 text-green-700 hover:bg-green-200',
    'bg-orange-100 text-orange-700 hover:bg-orange-200',
    'bg-pink-100 text-pink-700 hover:bg-pink-200',
    'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
    'bg-teal-100 text-teal-700 hover:bg-teal-200',
    'bg-red-100 text-red-700 hover:bg-red-200',
  ];

  return (
    <div className={cn("", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category: Category, index: number) => {
          const colorClass = category.color || defaultColors[index % defaultColors.length];

          return (
            <Card
              key={category.id}
              onClick={clickable ? () => handleCategoryClick(category.slug) : undefined}
              className={cn(
                "group transition-all duration-300 border-2 overflow-hidden",
                clickable && "cursor-pointer hover:shadow-xl hover:border-${colorScheme}-300"
              )}
            >
              <CardContent className="p-0">
                <div className={cn("p-6 transition-colors", colorClass)}>
                  <div className="flex items-start justify-between mb-4">
                    {showIcons && (
                      <div className="text-4xl mb-2">
                        {category.icon || <Tag className="h-10 w-10" />}
                      </div>
                    )}
                    {(showCounts || showPostCount) && showPostCount !== false && (
                      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-bold">{category.count || 0}</span>
                      </div>
                    )}
                  </div>

                  <h3 className={cn("text-xl font-bold mb-2 transition-transform", clickable && "group-hover:translate-x-1")}>
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="text-sm opacity-80 line-clamp-2 mb-3">
                      {category.description}
                    </p>
                  )}

                  {clickable && (
                    <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                      <span>View posts</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16">
          <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600">Check back later for new categories</p>
        </div>
      )}
    </div>
  );
};

export default ListCategories;
    `,

    grid: `
${commonImports}
import { Folder } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  color: string;
  icon: string;
  description: string;
}

interface GridCategoriesProps {
  data?: any;
  entity?: string;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  onCategoryClick?: (slug: string) => void;
}

const GridCategories: React.FC<GridCategoriesProps> = ({
  data: propData,
  className,
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

  const data = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = data || {};

  const title = ${getField('gridTitle')};
  const subtitle = ${getField('gridSubtitle')};
  // If data is already an array, use it directly; otherwise try to get categories field
  const categories = Array.isArray(data) ? data : (${getField('categories')} || []);

  const handleCategoryClick = (slug: string) => {
    if (onCategoryClick) {
      onCategoryClick(slug);
    } else {
      console.log('Category clicked:', slug);
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category: Category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className="relative overflow-hidden rounded-lg p-4 text-left transition-all hover:scale-105 hover:shadow-lg group"
            >
              <div className={\`absolute inset-0 \${category.color} opacity-90 group-hover:opacity-100 transition-opacity\`} />

              <div className="relative z-10">
                <div className="text-3xl mb-2">{category.icon}</div>
                <h3 className="font-bold text-white mb-1 text-sm">
                  {category.name}
                </h3>
                <p className="text-xs text-white/90 line-clamp-2 mb-2">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-white/20 text-white px-2 py-1 rounded-full font-medium">
                    {category.count} posts
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GridCategories;
    `,

    dropdown: `
${commonImports}
import { Folder, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface DropdownCategoriesProps {
  data?: any;
  entity?: string;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  onCategorySelect?: (slug: string) => void;
}

const DropdownCategories: React.FC<DropdownCategoriesProps> = ({
  data: propData,
  className,
  onCategorySelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const data = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = data || {};

  const title = ${getField('dropdownTitle')};
  const subtitle = ${getField('dropdownSubtitle')};
  // If data is already an array, use it directly; otherwise try to get categories field
  const categories = Array.isArray(data) ? data : (${getField('categories')} || []);
  const selectButton = ${getField('selectButton')};

  const handleSelect = (slug: string, name: string) => {
    setSelectedCategory(slug);
    setIsOpen(false);
  };

  const handleGo = () => {
    if (selectedCategory) {
      if (onCategorySelect) {
        onCategorySelect(selectedCategory);
      } else {
        console.log('Category selected:', selectedCategory);
      }
    }
  };

  const selectedCategoryName = categories.find((c: Category) => c.slug === selectedCategory)?.name || 'Select a category';

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {selectedCategoryName}
            </span>
            <ChevronDown className={\`h-4 w-4 text-gray-500 transition-transform \${isOpen ? 'rotate-180' : ''}\`} />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                {categories.map((category: Category) => (
                  <button
                    key={category.id}
                    onClick={() => handleSelect(category.slug, category.name)}
                    className={\`w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left \${
                      selectedCategory === category.slug ? 'bg-${colorScheme}-50 dark:bg-${colorScheme}-900/20' : ''
                    }\`}
                  >
                    <span className={\`text-sm \${
                      selectedCategory === category.slug
                        ? 'text-${colorScheme}-600 dark:text-${colorScheme}-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }\`}>
                      {category.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <Button
          onClick={handleGo}
          disabled={!selectedCategory}
          className="w-full mt-3"
        >
          {selectButton}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DropdownCategories;
    `
  };

  return variants[variant] || variants.list;
};
