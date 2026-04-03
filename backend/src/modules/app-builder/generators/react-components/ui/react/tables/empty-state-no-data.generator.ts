import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateEmptyStateNoData = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'illustrated' | 'helpful' = 'simple'
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
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, BookOpen, Video, Headphones, FileText, HelpCircle, ExternalLink, Inbox, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    simple: `
${commonImports}

interface EmptyStateNoDataProps {
  ${dataName}?: any;
  className?: string;
  onAction?: () => void;
}

const EmptyStateNoData: React.FC<EmptyStateNoDataProps> = ({
  ${dataName},
  className,
  onAction
}) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const emptyData = ${dataName} || fetchedData || {};

  const heading = ${getField('heading')};
  const message = ${getField('message')};
  const ctaButton = ${getField('ctaButton')};
  const helpLink = ${getField('helpLink')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      console.log('Add first item clicked');
    }
  };

  const handleHelp = () => {
    console.log('Help clicked');
  };

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
          <Inbox className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>

        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
          {heading}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {message}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            onClick={handleAction}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            {ctaButton}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleHelp}
          >
            <HelpCircle className="w-5 h-5 mr-2" />
            {helpLink}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyStateNoData;
    `,

    illustrated: `
${commonImports}

interface EmptyStateNoDataProps {
  ${dataName}?: any;
  className?: string;
  onAction?: () => void;
}

const EmptyStateNoData: React.FC<EmptyStateNoDataProps> = ({
  ${dataName},
  className,
  onAction
}) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const emptyData = ${dataName} || fetchedData || {};

  const headingAlternate = ${getField('headingAlternate')};
  const messageDetailed = ${getField('messageDetailed')};
  const ctaButtonAlternate = ${getField('ctaButtonAlternate')};
  const secondaryButton = ${getField('secondaryButton')};
  const illustration = ${getField('illustration')};
  const exampleItems = ${getField('exampleItems')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      console.log('Create new clicked');
    }
  };

  const handleLearnMore = () => {
    console.log('Learn more clicked');
  };

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {headingAlternate}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {messageDetailed}
              </p>

              <div className="space-y-2 mb-6">
                {exampleItems.map((item: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={handleAction}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {ctaButtonAlternate}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleLearnMore}
                >
                  {secondaryButton}
                </Button>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <img
                src={illustration}
                alt="Empty state"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmptyStateNoData;
    `,

    helpful: `
${commonImports}

interface EmptyStateNoDataProps {
  ${dataName}?: any;
  className?: string;
  onAction?: () => void;
}

const EmptyStateNoData: React.FC<EmptyStateNoDataProps> = ({
  ${dataName},
  className,
  onAction
}) => {
  // Fetch data using React Query
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const emptyData = ${dataName} || fetchedData || {};

  const headingHelpful = ${getField('headingHelpful')};
  const messageHelpful = ${getField('messageHelpful')};
  const ctaButtonDetailed = ${getField('ctaButtonDetailed')};
  const helpItems = ${getField('helpItems')};
  const videoTutorialLink = ${getField('videoTutorialLink')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      console.log('Get started clicked');
    }
  };

  const handleHelpItem = (item: any) => {
    console.log('Help item clicked:', item.title);
  };

  const handleVideoTutorial = () => {
    console.log('Video tutorial clicked');
  };

  const getHelpIcon = (iconName: string) => {
    switch (iconName) {
      case 'book': return <BookOpen className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'headphones': return <Headphones className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-6">
            <Inbox className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>

          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {headingHelpful}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            {messageHelpful}
          </p>

          <Button
            size="lg"
            onClick={handleAction}
            className="bg-blue-600 hover:bg-blue-700 mb-8"
          >
            <Plus className="w-5 h-5 mr-2" />
            {ctaButtonDetailed}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {helpItems.map((item: any, index: number) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleHelpItem(item)}
            >
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full mb-4">
                  {getHelpIcon(item.icon)}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleVideoTutorial}
            className="text-blue-600 hover:text-blue-700"
          >
            <Video className="w-4 h-4 mr-2" />
            {videoTutorialLink}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyStateNoData;
    `
  };

  return variants[variant] || variants.simple;
};
