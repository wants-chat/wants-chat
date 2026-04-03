import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateOfflineModeInterface = (
  resolved: ResolvedComponent,
  variant: 'banner' | 'modal' | 'page' = 'banner'
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
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, RefreshCw, X, AlertCircle, Clock, FileText, Settings, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    banner: `
${commonImports}

interface OfflineModeInterfaceProps {
  ${dataName}?: any;
  className?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const OfflineModeInterface: React.FC<OfflineModeInterfaceProps> = ({
  ${dataName}: propData,
  className,
  onRetry,
  onDismiss
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const offlineData = ${dataName} || {};
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const offlineMessage = ${getField('offlineMessage')};
  const retryButton = ${getField('retryButton')};
  const dismissButton = ${getField('dismissButton')};

  const handleRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
    } else {
      console.log('Retrying connection...');
    }
    setTimeout(() => setIsRetrying(false), 2000);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (isDismissed) return null;

  return (
    <Alert className={cn("bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800", className)}>
      <WifiOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="text-yellow-800 dark:text-yellow-300 font-bold">
            {offlineMessage}
          </span>
          <Badge variant="outline" className="text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-600">
            Offline
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className="border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRetrying && "animate-spin")} />
            {retryButton}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-yellow-700 dark:text-yellow-400"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default OfflineModeInterface;
    `,

    modal: `
${commonImports}

interface OfflineModeInterfaceProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onRetry?: () => void;
  onContinueOffline?: () => void;
}

const OfflineModeInterface: React.FC<OfflineModeInterfaceProps> = ({
  ${dataName}: propData,
  className,
  isOpen = true,
  onRetry,
  onContinueOffline
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const offlineData = ${dataName} || {};
  const [isRetrying, setIsRetrying] = useState(false);

  const offlineMessageDetailed = ${getField('offlineMessageDetailed')};
  const retryButton = ${getField('retryButton')};
  const offlineModeButton = ${getField('offlineModeButton')};
  const unavailableTitle = ${getField('unavailableTitle')};
  const unavailableActions = ${getField('unavailableActions')};

  const handleRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
    } else {
      console.log('Retrying connection...');
    }
    setTimeout(() => setIsRetrying(false), 2000);
  };

  const handleContinueOffline = () => {
    if (onContinueOffline) {
      onContinueOffline();
    } else {
      console.log('Continue offline clicked');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", className)}>
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-4">
              <WifiOff className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Connection Lost
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {offlineMessageDetailed}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              {unavailableTitle}
            </h4>
            <ul className="space-y-2">
              {unavailableActions.map((action: string, index: number) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-blue-600 hover:bg-blue-700 w-full"
            >
              <RefreshCw className={cn("w-5 h-5 mr-2", isRetrying && "animate-spin")} />
              {retryButton}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleContinueOffline}
              className="w-full"
            >
              {offlineModeButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineModeInterface;
    `,

    page: `
${commonImports}

interface OfflineModeInterfaceProps {
  ${dataName}?: any;
  className?: string;
  onRetry?: () => void;
  onViewCached?: (item: any) => void;
}

const OfflineModeInterface: React.FC<OfflineModeInterfaceProps> = ({
  ${dataName}: propData,
  className,
  onRetry,
  onViewCached
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
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
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const offlineData = ${dataName} || {};
  const [isRetrying, setIsRetrying] = useState(false);

  const offlineMessageLong = ${getField('offlineMessageLong')};
  const retryButton = ${getField('retryButton')};
  const cachedContentTitle = ${getField('cachedContentTitle')};
  const cachedContentMessage = ${getField('cachedContentMessage')};
  const cachedItems = ${getField('cachedItems')};
  const queueTitle = ${getField('queueTitle')};
  const queueMessage = ${getField('queueMessage')};
  const queuedActions = ${getField('queuedActions')};

  const handleRetry = () => {
    setIsRetrying(true);
    if (onRetry) {
      onRetry();
    } else {
      console.log('Retrying connection...');
    }
    setTimeout(() => setIsRetrying(false), 2000);
  };

  const handleViewCached = (item: any) => {
    if (onViewCached) {
      onViewCached(item);
    } else {
      console.log('View cached item:', item);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'page': return <FileText className="w-5 h-5" />;
      case 'data': return <Settings className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 p-4", className)}>
      <div className="max-w-4xl mx-auto pt-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-6">
            <WifiOff className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
          </div>

          <Badge className="mb-4 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Offline Mode
          </Badge>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            You're Offline
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            {offlineMessageLong}
          </p>

          <Button
            size="lg"
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={cn("w-5 h-5 mr-2", isRetrying && "animate-spin")} />
            {retryButton}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {cachedContentTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {cachedContentMessage}
              </p>

              <div className="space-y-2">
                {cachedItems.map((item: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleViewCached(item)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600 dark:text-blue-400">
                        {getItemIcon(item.type)}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Updated {item.lastUpdated}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {queueTitle}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {queueMessage}
              </p>

              <div className="space-y-2">
                {queuedActions.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {item.action}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OfflineModeInterface;
    `
  };

  return variants[variant] || variants.banner;
};
