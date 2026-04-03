import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateError500Page = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'detailed' | 'status' = 'simple'
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
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Home, ExternalLink, AlertTriangle, CheckCircle2, XCircle, Copy, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    simple: `
${commonImports}

interface Error500PageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const Error500Page: React.FC<Error500PageProps> = ({
  ${dataName},
  className
}) => {
  const errorData = ${dataName} || {};
  const [isRetrying, setIsRetrying] = useState(false);

  const errorCode = ${getField('errorCode')};
  const heading = ${getField('heading')};
  const message = ${getField('message')};
  const retryButton = ${getField('retryButton')};
  const backToHomeButton = ${getField('backToHomeButton')};
  const supportContact = ${getField('supportContact')};

  const handleRetry = () => {
    setIsRetrying(true);
    console.log('Retrying...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

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
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            {errorCode}
          </h1>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {heading}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={cn("w-5 h-5 mr-2", isRetrying && "animate-spin")} />
            {retryButton}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleGoHome}
          >
            <Home className="w-5 h-5 mr-2" />
            {backToHomeButton}
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={handleContactSupport}
          >
            {supportContact}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error500Page;
    `,

    detailed: `
${commonImports}

interface Error500PageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const Error500Page: React.FC<Error500PageProps> = ({
  ${dataName},
  className
}) => {
  const errorData = ${dataName} || {};
  const [isRetrying, setIsRetrying] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorCode = ${getField('errorCode')};
  const headingAlternate = ${getField('headingAlternate')};
  const apologyText = ${getField('apologyText')};
  const detailedMessage = ${getField('detailedMessage')};
  const retryButton = ${getField('retryButton')};
  const backToHomeButton = ${getField('backToHomeButton')};
  const statusPageLink = ${getField('statusPageLink')};
  const errorIdLabel = ${getField('errorIdLabel')};
  const errorId = ${getField('errorId')};
  const timestampLabel = ${getField('timestampLabel')};
  const timestamp = ${getField('timestamp')};

  const handleRetry = () => {
    setIsRetrying(true);
    console.log('Retrying...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleGoHome = () => {
    console.log('Navigating to home');
    window.location.href = '/';
  };

  const handleStatusPage = () => {
    console.log('Opening status page');
  };

  const handleCopyErrorId = () => {
    navigator.clipboard.writeText(errorId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4", className)}>
      <Card className="max-w-2xl w-full shadow-xl">
        <CardContent className="p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
              {headingAlternate}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              {apologyText}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {detailedMessage}
            </p>
          </div>

          <Alert className="mb-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{errorIdLabel}</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                      {errorId}
                    </code>
                    <button
                      onClick={handleCopyErrorId}
                      className="p-1 hover:bg-red-200 dark:hover:bg-red-900/50 rounded"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timestampLabel}
                  </span>
                  <span>{timestamp}</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              size="lg"
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={cn("w-5 h-5 mr-2", isRetrying && "animate-spin")} />
              {retryButton}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleGoHome}
              className="flex-1"
            >
              <Home className="w-5 h-5 mr-2" />
              {backToHomeButton}
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={handleStatusPage}
            className="w-full"
          >
            {statusPageLink}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Error500Page;
    `,

    status: `
${commonImports}

interface StatusItem {
  service: string;
  status: 'operational' | 'degraded' | 'down';
  message: string;
}

interface Error500PageProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const Error500Page: React.FC<Error500PageProps> = ({
  ${dataName},
  className
}) => {
  const errorData = ${dataName} || {};
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const errorCode = ${getField('errorCode')};
  const heading = ${getField('heading')};
  const message = ${getField('message')};
  const refreshButton = ${getField('refreshButton')};
  const backToHomeButton = ${getField('backToHomeButton')};
  const statusTitle = ${getField('statusTitle')};
  const statusItems = ${getField('statusItems')};
  const errorId = ${getField('errorId')};

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRetry();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    console.log('Retrying...');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleGoHome = () => {
    console.log('Navigating to home');
    window.location.href = '/';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Operational
          </Badge>
        );
      case 'degraded':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Degraded
          </Badge>
        );
      case 'down':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Down
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4", className)}>
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
            {errorCode}
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {heading}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {message}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Reference ID: <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">{errorId}</code>
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {statusTitle}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Auto-refresh in {countdown}s
              </span>
            </div>

            <div className="space-y-3">
              {statusItems.map((item: StatusItem, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.service}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.message}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={cn("w-5 h-5 mr-2", isRetrying && "animate-spin")} />
            {refreshButton}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={handleGoHome}
            className="flex-1"
          >
            <Home className="w-5 h-5 mr-2" />
            {backToHomeButton}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Error500Page;
    `
  };

  return variants[variant] || variants.simple;
};
