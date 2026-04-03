import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateKnowledgeBaseCategories = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'list' | 'cards' = 'grid'
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
    return `/${dataSource || 'categories'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'categories';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Rocket, User, CreditCard, Settings, Package, Shield, Link as LinkIcon, Code, Smartphone, ChevronRight, Search, FileText, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';`;

  const variants = {
    grid: `
${commonImports}

interface KnowledgeBaseCategoriesGridProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const KnowledgeBaseCategoriesGrid: React.FC<KnowledgeBaseCategoriesGridProps> = ({ ${dataName}: propData, className }) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const kbData = ${dataName} || {};

  const pageTitle = ${getField('pageTitle')};
  const pageDescription = ${getField('pageDescription')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const categories = ${getField('categories')};
  const viewArticlesText = ${getField('viewArticlesText')};

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Rocket, User, CreditCard, Settings, Package, Shield, Link, Code, Smartphone
    };
    return icons[iconName] || FileText;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
      gray: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
      pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
    };
    return colors[color] || colors.blue;
  };

  const filteredCategories = searchQuery
    ? categories.filter((cat: any) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const handleCategoryClick = (category: any) => {
    console.log('Category clicked:', category);
    alert(\`Opening category: "\${category.name}" with \${category.articleCount} articles\`);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {pageTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {pageDescription}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category: any) => {
            const Icon = getIcon(category.icon);
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
              >
                <div className={\`w-16 h-16 rounded-xl flex items-center justify-center mb-4 \${getColorClasses(category.color)}\`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {category.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category.articleCount} articles
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {viewArticlesText}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No categories found matching your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseCategoriesGrid;
    `,

    list: `
${commonImports}

interface KnowledgeBaseCategoriesListProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const KnowledgeBaseCategoriesList: React.FC<KnowledgeBaseCategoriesListProps> = ({ ${dataName}: propData, className }) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const kbData = ${dataName} || {};

  const pageTitle = ${getField('pageTitle')};
  const pageDescription = ${getField('pageDescription')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const categories = ${getField('categories')};
  const viewArticlesText = ${getField('viewArticlesText')};

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Rocket, User, CreditCard, Settings, Package, Shield, Link, Code, Smartphone
    };
    return icons[iconName] || FileText;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
      gray: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
      pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'
    };
    return colors[color] || colors.blue;
  };

  const filteredCategories = searchQuery
    ? categories.filter((cat: any) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const handleCategoryClick = (category: any) => {
    console.log('Category clicked:', category);
    alert(\`Opening category: "\${category.name}" with \${category.articleCount} articles\`);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4", className)}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {pageTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {pageDescription}
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-gray-50 dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {filteredCategories.map((category: any) => {
            const Icon = getIcon(category.icon);
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group overflow-hidden"
              >
                <div className="flex items-center p-6 gap-6">
                  <div className={\`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 \${getColorClasses(category.color)}\`}>
                    <Icon className="h-10 w-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{category.articleCount} articles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Updated {category.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all flex-shrink-0">
                    <span className="font-medium hidden sm:inline">{viewArticlesText}</span>
                    <ChevronRight className="h-6 w-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-16 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No categories found matching your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseCategoriesList;
    `,

    cards: `
${commonImports}

interface KnowledgeBaseCategoriesCardsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const KnowledgeBaseCategoriesCards: React.FC<KnowledgeBaseCategoriesCardsProps> = ({ ${dataName}: propData, className }) => {
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const kbData = ${dataName} || {};

  const pageTitle = ${getField('pageTitle')};
  const pageDescription = ${getField('pageDescription')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const categories = ${getField('categories')};
  const totalArticlesText = ${getField('totalArticlesText')};

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Rocket, User, CreditCard, Settings, Package, Shield, Link, Code, Smartphone
    };
    return icons[iconName] || FileText;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      indigo: 'from-indigo-500 to-indigo-600',
      red: 'from-red-500 to-red-600',
      teal: 'from-teal-500 to-teal-600',
      gray: 'from-gray-500 to-gray-600',
      pink: 'from-pink-500 to-pink-600'
    };
    return colors[color] || colors.blue;
  };

  const filteredCategories = searchQuery
    ? categories.filter((cat: any) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;

  const totalArticles = categories.reduce((sum: number, cat: any) => sum + cat.articleCount, 0);

  const handleCategoryClick = (category: any) => {
    console.log('Category clicked:', category);
    setSelectedCategory(category.id);
    setTimeout(() => {
      alert(\`Opening category: "\${category.name}" with \${category.articleCount} articles\`);
      setSelectedCategory(null);
    }, 300);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900", className)}>
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {pageTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            {pageDescription}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {totalArticlesText}: {totalArticles}
          </p>
        </div>

        {/* Search */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-14 text-lg bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2"
            />
          </div>
        </div>

        {/* Categories Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category: any) => {
            const Icon = getIcon(category.icon);
            const isSelected = selectedCategory === category.id;
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={\`relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 \${isSelected ? 'scale-105' : ''}\`}
              >
                {/* Gradient Background */}
                <div className={\`bg-gradient-to-br \${getColorClasses(category.color)} p-8 text-white\`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                      {category.articleCount}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {category.name}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* White Section */}
                <div className="bg-white dark:bg-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>Updated {category.lastUpdated}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No categories found matching your search
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseCategoriesCards;
    `
  };

  return variants[variant] || variants.grid;
};
