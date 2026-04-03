import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateError404Page = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'illustrated' | 'interactive' = 'simple'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
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
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();

  const commonImports = `
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Search, HelpCircle, LayoutDashboard, ShoppingBag, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    simple: `
${commonImports}

interface Error404PageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const Error404Page: React.FC<Error404PageProps> = ({
  ${dataName},
  className
}) => {
  const errorData = ${dataName} || {};

  const errorCode = ${getField('errorCode')};
  const heading = ${getField('heading')};
  const message = ${getField('message')};
  const backToHomeButton = ${getField('backToHomeButton')};
  const contactSupportLink = ${getField('contactSupportLink')};

  const handleGoHome = () => {
    console.log('Navigating to home');
    window.location.href = '/';
  };

  const handleContactSupport = () => {
    console.log('Contact support clicked');
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4", className)}>
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            {errorCode}
          </h1>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {heading}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={handleGoHome}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Home className="w-5 h-5 mr-2" />
            {backToHomeButton}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleContactSupport}
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            {contactSupportLink}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error404Page;
    `,

    illustrated: `
${commonImports}

interface Error404PageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const Error404Page: React.FC<Error404PageProps> = ({
  ${dataName},
  className
}) => {
  const errorData = ${dataName} || {};
  const [searchQuery, setSearchQuery] = useState('');

  const errorCode = ${getField('errorCode')};
  const headingAlternate = ${getField('headingAlternate')};
  const messageShort = ${getField('messageShort')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const searchButtonText = ${getField('searchButtonText')};
  const popularPagesTitle = ${getField('popularPagesTitle')};
  const popularPages = ${getField('popularPages')};
  const illustration404 = ${getField('illustration404')};

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const handlePageClick = (url: string) => {
    console.log('Navigating to:', url);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home': return <Home className="w-5 h-5" />;
      case 'layout-dashboard': return <LayoutDashboard className="w-5 h-5" />;
      case 'shopping-bag': return <ShoppingBag className="w-5 h-5" />;
      case 'help-circle': return <HelpCircle className="w-5 h-5" />;
      default: return <Home className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4", className)}>
      <div className="max-w-4xl w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <div className="mb-6">
              <span className="inline-block text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {errorCode}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {headingAlternate}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {messageShort}
              </p>
            </div>

            <div className="mb-8">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-12"
                />
                <Button
                  onClick={handleSearch}
                  className="h-12 bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {searchButtonText}
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {popularPagesTitle}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {popularPages.map((page: any, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start"
                    onClick={() => handlePageClick(page.url)}
                  >
                    {getIcon(page.icon)}
                    <span className="ml-2">{page.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <img
              src={illustration404}
              alt="404 Error"
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404Page;
    `,

    interactive: `
${commonImports}

interface Error404PageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const Error404Page: React.FC<Error404PageProps> = ({
  ${dataName},
  className
}) => {
  const errorData = ${dataName} || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const errorCode = ${getField('errorCode')};
  const heading = ${getField('heading')};
  const message = ${getField('message')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const goHomeButton = ${getField('goHomeButton')};
  const suggestionsTitle = ${getField('suggestionsTitle')};
  const suggestions = ${getField('suggestions')};

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const handleGoHome = () => {
    console.log('Navigating to home');
    window.location.href = '/';
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    console.log('Suggestion clicked:', suggestion);
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4", className)}>
      <Card className="max-w-3xl w-full shadow-2xl">
        <CardContent className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="relative">
                <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {errorCode}
                </h1>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-600 rounded-full animate-ping"></div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {heading}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
              {message}
            </p>
          </div>

          <div className="mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-12 pl-10"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="h-12 bg-blue-600 hover:bg-blue-700"
              >
                Search
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {suggestionsTitle}
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedSuggestion === suggestion
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGoHome}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {goHomeButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Error404Page;
    `
  };

  return variants[variant] || variants.simple;
};
