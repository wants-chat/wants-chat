import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHelpArticlePage = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'sidebar' | 'minimal' = 'standard'
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
    return `/${dataSource || 'articles'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'articles';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronRight, Clock, Eye, ThumbsUp, ThumbsDown, CheckCircle, MessageCircle, ChevronLeft, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';`;

  const variants = {
    standard: `
${commonImports}

interface HelpArticlePageStandardProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const HelpArticlePageStandard: React.FC<HelpArticlePageStandardProps> = ({ ${dataName}: propData, className }) => {
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
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const articleData = ${dataName} || {};

  const breadcrumbs = ${getField('breadcrumbs')};
  const articleTitle = ${getField('articleTitle')};
  const articleCategory = ${getField('articleCategory')};
  const lastUpdated = ${getField('lastUpdated')};
  const readTime = ${getField('readTime')};
  const author = ${getField('author')};
  const views = ${getField('views')};
  const articleContent = ${getField('articleContent')};
  const wasHelpfulQuestion = ${getField('wasHelpfulQuestion')};
  const yesButton = ${getField('yesButton')};
  const noButton = ${getField('noButton')};
  const feedbackThanks = ${getField('feedbackThanks')};
  const notHelpfulMessage = ${getField('notHelpfulMessage')};
  const relatedArticlesTitle = ${getField('relatedArticlesTitle')};
  const relatedArticles = ${getField('relatedArticles')};
  const contactSupportText = ${getField('contactSupportText')};
  const contactSupportButton = ${getField('contactSupportButton')};

  const handleFeedback = (helpful: 'yes' | 'no') => {
    console.log('Feedback submitted:', helpful);
    setFeedback(helpful);
  };

  const handleRelatedArticle = (article: any) => {
    console.log('Related article clicked:', article);
    alert(\`Opening article: "\${article.title}"\`);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb: any, index: number) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                <button
                  onClick={() => console.log('Breadcrumb clicked:', crumb.label)}
                  className={cn(
                    index === breadcrumbs.length - 1
                      ? "text-gray-900 dark:text-white font-medium"
                      : "text-blue-600 dark:text-blue-400 hover:underline"
                  )}
                >
                  {crumb.label}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* Article */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
              {articleCategory}
            </span>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {articleTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <span>By {author}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{lastUpdated}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg dark:prose-invert max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: articleContent }}
          />

          {/* Feedback */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            {feedback === null ? (
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {wasHelpfulQuestion}
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={() => handleFeedback('yes')}
                    variant="outline"
                    className="gap-2 px-8"
                  >
                    <ThumbsUp className="h-5 w-5" />
                    {yesButton}
                  </Button>
                  <Button
                    onClick={() => handleFeedback('no')}
                    variant="outline"
                    className="gap-2 px-8"
                  >
                    <ThumbsDown className="h-5 w-5" />
                    {noButton}
                  </Button>
                </div>
              </div>
            ) : feedback === 'yes' ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feedbackThanks}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-900 dark:text-white mb-4">{notHelpfulMessage}</p>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="h-5 w-5" />
                  {contactSupportButton}
                </Button>
              </div>
            )}
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {relatedArticlesTitle}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {relatedArticles.map((article: any) => (
              <div
                key={article.id}
                onClick={() => handleRelatedArticle(article)}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    {article.category}
                  </span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 text-center border border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {contactSupportText}
          </h3>
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
            {contactSupportButton}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HelpArticlePageStandard;
    `,

    sidebar: `
${commonImports}

interface HelpArticlePageSidebarProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const HelpArticlePageSidebar: React.FC<HelpArticlePageSidebarProps> = ({ ${dataName}: propData, className }) => {
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
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);
  const [activeSection, setActiveSection] = useState('introduction');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const articleData = ${dataName} || {};

  const breadcrumbs = ${getField('breadcrumbs')};
  const articleTitle = ${getField('articleTitle')};
  const articleCategory = ${getField('articleCategory')};
  const lastUpdated = ${getField('lastUpdated')};
  const readTime = ${getField('readTime')};
  const articleContent = ${getField('articleContent')};
  const wasHelpfulQuestion = ${getField('wasHelpfulQuestion')};
  const yesButton = ${getField('yesButton')};
  const noButton = ${getField('noButton')};
  const feedbackThanks = ${getField('feedbackThanks')};
  const tableOfContentsTitle = ${getField('tableOfContentsTitle')};
  const tableOfContents = ${getField('tableOfContents')};
  const relatedArticlesTitle = ${getField('relatedArticlesTitle')};
  const relatedArticles = ${getField('relatedArticles')};

  const handleFeedback = (helpful: 'yes' | 'no') => {
    console.log('Feedback submitted:', helpful);
    setFeedback(helpful);
  };

  const handleTocClick = (id: string) => {
    console.log('TOC item clicked:', id);
    setActiveSection(id);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb: any, index: number) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                <button
                  onClick={() => console.log('Breadcrumb clicked:', crumb.label)}
                  className={cn(
                    index === breadcrumbs.length - 1
                      ? "text-gray-900 dark:text-white font-medium"
                      : "text-blue-600 dark:text-blue-400 hover:underline"
                  )}
                >
                  {crumb.label}
                </button>
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Article */}
          <div className="lg:col-span-3">
            <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              {/* Header */}
              <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-4">
                  {articleCategory}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {articleTitle}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{readTime}</span>
                  </div>
                  <span>{lastUpdated}</span>
                </div>
              </div>

              {/* Content */}
              <div
                className="prose prose-lg dark:prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: articleContent }}
              />

              {/* Feedback */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                {feedback === null ? (
                  <div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {wasHelpfulQuestion}
                    </p>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => handleFeedback('yes')}
                        variant="outline"
                        className="gap-2"
                      >
                        <ThumbsUp className="h-5 w-5" />
                        {yesButton}
                      </Button>
                      <Button
                        onClick={() => handleFeedback('no')}
                        variant="outline"
                        className="gap-2"
                      >
                        <ThumbsDown className="h-5 w-5" />
                        {noButton}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-6 w-6" />
                    <p className="font-semibold">{feedbackThanks}</p>
                  </div>
                )}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Table of Contents */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  {tableOfContentsTitle}
                </h3>
                <nav className="space-y-2">
                  {tableOfContents.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleTocClick(item.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors text-sm",
                        activeSection === item.id
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Related Articles */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  {relatedArticlesTitle}
                </h3>
                <div className="space-y-3">
                  {relatedArticles.map((article: any) => (
                    <div
                      key={article.id}
                      onClick={() => alert(\`Opening: \${article.title}\`)}
                      className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
                    >
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {article.readTime}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpArticlePageSidebar;
    `,

    minimal: `
${commonImports}

interface HelpArticlePageMinimalProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const HelpArticlePageMinimal: React.FC<HelpArticlePageMinimalProps> = ({ ${dataName}: propData, className }) => {
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
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const articleData = ${dataName} || {};

  const articleTitle = ${getField('articleTitle')};
  const articleCategory = ${getField('articleCategory')};
  const lastUpdated = ${getField('lastUpdated')};
  const articleContent = ${getField('articleContent')};
  const wasHelpfulQuestion = ${getField('wasHelpfulQuestion')};
  const yesButton = ${getField('yesButton')};
  const noButton = ${getField('noButton')};
  const feedbackThanks = ${getField('feedbackThanks')};
  const contactSupportButton = ${getField('contactSupportButton')};

  const handleFeedback = (helpful: 'yes' | 'no') => {
    console.log('Feedback submitted:', helpful);
    setFeedback(helpful);
  };

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-900", className)}>
      {/* Back Button */}
      <div className="border-b border-gray-200 dark:border-gray-700 py-4 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => console.log('Back clicked')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Help Center
          </button>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <span className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
            {articleCategory}
          </span>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {articleTitle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div
          className="prose prose-xl dark:prose-invert max-w-none mb-16"
          dangerouslySetInnerHTML={{ __html: articleContent }}
        />

        {/* Feedback */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-12">
          {feedback === null ? (
            <div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {wasHelpfulQuestion}
              </p>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => handleFeedback('yes')}
                  size="lg"
                  className="gap-2 bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="h-5 w-5" />
                  {yesButton}
                </Button>
                <Button
                  onClick={() => handleFeedback('no')}
                  size="lg"
                  variant="outline"
                  className="gap-2"
                >
                  <ThumbsDown className="h-5 w-5" />
                  {noButton}
                </Button>
              </div>
            </div>
          ) : feedback === 'yes' ? (
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <CheckCircle className="h-8 w-8" />
              <p className="text-xl font-semibold">{feedbackThanks}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                We're sorry this wasn't helpful.
              </p>
              <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="h-5 w-5" />
                {contactSupportButton}
              </Button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default HelpArticlePageMinimal;
    `
  };

  return variants[variant] || variants.standard;
};
