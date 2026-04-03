import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHelpSidebarContextual = (
  resolved: ResolvedComponent,
  variant: 'slide' | 'fixed' | 'floating' = 'slide'
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
    return `/${dataSource || 'help'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'help';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    slide: `
${commonImports}
import { X, Search, Book, ExternalLink, Clock, HelpCircle, MessageCircle } from 'lucide-react';

interface HelpArticle {
  id: number;
  title: string;
  category: string;
  preview: string;
  readTime: string;
  relevance: number;
}

interface QuickLink {
  id: number;
  label: string;
  icon: string;
  url: string;
}

interface SlideSidebarProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const SlideSidebar: React.FC<SlideSidebarProps> = ({ ${dataName}: propData, className, isOpen = true, onClose }) => {
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
  const [sidebarOpen, setSidebarOpen] = useState(isOpen);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const helpData = ${dataName} || {};

  const title = ${getField('slideTitle')};
  const subtitle = ${getField('slideSubtitle')};
  const helpArticles = ${getField('helpArticles')};
  const quickLinks = ${getField('quickLinks')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const viewArticleButton = ${getField('viewArticleButton')};
  const contactSupportButton = ${getField('contactSupportButton')};
  const closeButton = ${getField('closeButton')};
  const contextualHint = ${getField('contextualHint')};
  const noResultsMessage = ${getField('noResultsMessage')};

  const filteredArticles = helpArticles.filter((article: HelpArticle) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => {
    setSidebarOpen(false);
    onClose?.();
    console.log('Help sidebar closed');
  };

  const handleArticleClick = (articleId: number) => {
    console.log('Help article clicked:', articleId);
  };

  const handleQuickLink = (url: string) => {
    console.log('Quick link clicked:', url);
  };

  const handleContactSupport = () => {
    console.log('Contact support clicked');
  };

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
        className
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Contextual hint */}
            <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">{contextualHint}</p>
              </div>
            </div>

            {/* Help articles */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                Relevant Articles
              </h3>

              {filteredArticles.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  {noResultsMessage}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredArticles.map((article: HelpArticle) => (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article.id)}
                      className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <Book className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {article.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {article.preview}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                              {article.category}
                            </span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {article.readTime}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick links */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
                Quick Links
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link: QuickLink) => (
                  <button
                    key={link.id}
                    onClick={() => handleQuickLink(link.url)}
                    className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {link.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleContactSupport}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              {contactSupportButton}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SlideSidebar;
    `,

    fixed: `
${commonImports}
import { Book, ExternalLink, Clock, Phone, Mail, MessageSquare } from 'lucide-react';

interface HelpArticle {
  id: number;
  title: string;
  category: string;
  preview: string;
  readTime: string;
  relevance: number;
}

interface SupportOption {
  id: number;
  type: string;
  title: string;
  description: string;
  availability: string;
  icon: string;
}

interface FixedSidebarProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FixedSidebar: React.FC<FixedSidebarProps> = ({ ${dataName}: propData, className }) => {
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
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const helpData = ${dataName} || {};

  const title = ${getField('fixedTitle')};
  const subtitle = ${getField('fixedSubtitle')};
  const helpArticles = ${getField('helpArticles')};
  const supportOptions = ${getField('supportOptions')};
  const viewArticleButton = ${getField('viewArticleButton')};

  const handleArticleToggle = (articleId: number) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
    console.log('Article toggled:', articleId);
  };

  const handleSupportOption = (type: string) => {
    console.log('Support option clicked:', type);
  };

  const topArticles = helpArticles.slice(0, 3);

  return (
    <div className={cn("w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 h-screen overflow-y-auto", className)}>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        {/* Top articles */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
            Popular Articles
          </h3>
          <div className="space-y-2">
            {topArticles.map((article: HelpArticle) => (
              <div key={article.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => handleArticleToggle(article.id)}
                  className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <Book className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </div>
                    </div>
                  </div>
                </button>

                {expandedArticle === article.id && (
                  <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 mt-2">
                      {article.preview}
                    </p>
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                      {viewArticleButton}
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support options */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 uppercase tracking-wide">
            Get Support
          </h3>
          <div className="space-y-2">
            {supportOptions.map((option: SupportOption) => (
              <button
                key={option.id}
                onClick={() => handleSupportOption(option.type)}
                className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{option.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-0.5">
                      {option.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {option.description}
                    </p>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      {option.availability}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedSidebar;
    `,

    floating: `
${commonImports}
import { HelpCircle, X, Search, Book, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';

interface HelpArticle {
  id: number;
  title: string;
  category: string;
  preview: string;
  readTime: string;
  relevance: number;
}

interface FloatingSidebarProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FloatingSidebar: React.FC<FloatingSidebarProps> = ({ ${dataName}: propData, className }) => {
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
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const helpData = ${dataName} || {};

  const title = ${getField('floatingTitle')};
  const subtitle = ${getField('floatingSubtitle')};
  const helpArticles = ${getField('helpArticles')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const viewArticleButton = ${getField('viewArticleButton')};
  const contactSupportButton = ${getField('contactSupportButton')};
  const showHelpButton = ${getField('showHelpButton')};

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    console.log('Floating help toggled:', !isOpen);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    console.log('Floating help minimized:', !isMinimized);
  };

  const handleArticleClick = (articleId: number) => {
    console.log('Help article clicked:', articleId);
  };

  const handleContactSupport = () => {
    console.log('Contact support clicked');
  };

  const filteredArticles = helpArticles
    .filter((article: HelpArticle) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 4);

  if (!isOpen) {
    return (
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleMinimize}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-6 right-6 w-96 z-50", className)}>
      <Card className="shadow-2xl">
        <div className="flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                <h3 className="font-bold">{title}</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleMinimize}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleToggle}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-blue-100">{subtitle}</p>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Articles */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredArticles.map((article: HelpArticle) => (
                <button
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <Book className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {article.preview}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleContactSupport}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {contactSupportButton}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FloatingSidebar;
    `
  };

  return variants[variant] || variants.slide;
};
