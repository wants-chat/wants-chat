import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHelpCenterHome = (
  resolved: ResolvedComponent,
  variant: 'search' | 'categories' | 'popular' = 'search'
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
    return `/${dataSource || 'help-center'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'helpCenter';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Rocket, User, Settings, Package, Shield, Link as LinkIcon, Eye, ThumbsUp, ChevronRight, BookOpen, Video, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';`;

  const variants = {
    search: `
${commonImports}

interface HelpCenterHomeSearchProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const HelpCenterHomeSearch: React.FC<HelpCenterHomeSearchProps> = ({ ${dataName}: propData, className }) => {
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

  const helpData = ${dataName} || {};

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const searchButton = ${getField('searchButton')};
  const popularTitle = ${getField('popularTitle')};
  const popularArticles = ${getField('popularArticles')};
  const contactSupportText = ${getField('contactSupportText')};
  const contactSupportLink = ${getField('contactSupportLink')};

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    if (searchQuery.trim()) {
      alert(\`Searching for: "\${searchQuery}"\`);
    }
  };

  const handleArticleClick = (article: any) => {
    console.log('Article clicked:', article);
    alert(\`Opening article: "\${article.title}"\`);
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900", className)}>
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {mainTitle}
          </h1>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8">
            {mainDescription}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center pl-6 pr-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg h-16 px-0 dark:bg-gray-800"
              />
              <div className="pr-4 pl-2">
                <Button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl"
                >
                  {searchButton}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Articles Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {popularTitle}
          </h2>
          <Button variant="outline" className="gap-2">
            View All <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {popularArticles.map((article: any) => (
            <div
              key={article.id}
              onClick={() => handleArticleClick(article)}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {article.category}
                </span>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {article.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{article.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>{article.helpful.toLocaleString()} helpful</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {contactSupportText}
          </h3>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8">
            {contactSupportLink}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterHomeSearch;
    `,

    categories: `
${commonImports}

interface HelpCenterHomeCategoriesProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const HelpCenterHomeCategories: React.FC<HelpCenterHomeCategoriesProps> = ({ ${dataName}: propData, className }) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const helpData = ${dataName} || {};

  const mainTitle = ${getField('mainTitle')};
  const mainDescription = ${getField('mainDescription')};
  const categoriesTitle = ${getField('categoriesTitle')};
  const categories = ${getField('categories')};
  const contactSupportText = ${getField('contactSupportText')};
  const contactSupportLink = ${getField('contactSupportLink')};
  const communityForumText = ${getField('communityForumText')};
  const communityForumLink = ${getField('communityForumLink')};

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      Rocket, User, Settings, Package, Shield, Link
    };
    const Icon = icons[iconName] || BookOpen;
    return Icon;
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    };
    return colors[color] || colors.blue;
  };

  const handleCategoryClick = (category: any) => {
    console.log('Category clicked:', category);
    alert(\`Opening category: "\${category.name}"\`);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {mainTitle}
          </h1>
          <p className="text-xl text-blue-100 dark:text-blue-200">
            {mainDescription}
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {categoriesTitle}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: any) => {
            const Icon = getIcon(category.icon);
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
              >
                <div className={\`w-14 h-14 rounded-xl flex items-center justify-center mb-4 border-2 \${getColorClasses(category.color)}\`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {category.articleCount} articles
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gray-100 dark:bg-gray-800 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 text-center">
              <MessageCircle className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {contactSupportText}
              </h3>
              <Button className="bg-blue-600 hover:bg-blue-700 mt-4">
                {contactSupportLink}
              </Button>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-xl p-8 text-center">
              <BookOpen className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {communityForumText}
              </h3>
              <Button className="bg-purple-600 hover:bg-purple-700 mt-4">
                {communityForumLink}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterHomeCategories;
    `,

    popular: `
${commonImports}

interface HelpCenterHomePopularProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const HelpCenterHomePopular: React.FC<HelpCenterHomePopularProps> = ({ ${dataName}: propData, className }) => {
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

  const helpData = ${dataName} || {};

  const mainTitle = ${getField('mainTitle')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const popularTitle = ${getField('popularTitle')};
  const popularArticles = ${getField('popularArticles')};
  const categoriesTitle = ${getField('categoriesTitle')};
  const categories = ${getField('categories')};
  const videoTutorialsText = ${getField('videoTutorialsText')};
  const videoTutorialsLink = ${getField('videoTutorialsLink')};

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
    if (searchQuery.trim()) {
      alert(\`Searching for: "\${searchQuery}"\`);
    }
  };

  const handleArticleClick = (article: any) => {
    console.log('Article clicked:', article);
    alert(\`Opening article: "\${article.title}"\`);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Compact Header with Search */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {mainTitle}
          </h1>
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center pl-4 pr-3">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
              />
              <Button
                onClick={handleSearch}
                size="sm"
                className="m-2 bg-blue-600 hover:bg-blue-700"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Popular Articles */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <ThumbsUp className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {popularTitle}
            </h2>
          </div>

          <div className="space-y-4">
            {popularArticles.map((article: any, index: number) => (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {article.title}
                      </h3>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-medium ml-4">
                        {article.category}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{article.helpful.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Categories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {categoriesTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category: any) => (
              <div
                key={category.id}
                onClick={() => alert(\`Opening category: "\${category.name}"\`)}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-colors">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {category.articleCount} articles
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <Video className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">{videoTutorialsText}</h3>
          <p className="mb-6 text-purple-100">Learn with step-by-step video guides</p>
          <Button className="bg-white text-purple-600 hover:bg-gray-100">
            {videoTutorialsLink}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterHomePopular;
    `
  };

  return variants[variant] || variants.search;
};
