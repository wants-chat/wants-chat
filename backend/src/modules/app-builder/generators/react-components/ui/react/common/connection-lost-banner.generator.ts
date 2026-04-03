import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateConnectionLostBanner = (
  resolved: ResolvedComponent,
  variant: 'banner' | 'toast' | 'persistent' = 'banner'
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WifiOff, RefreshCw, X, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    banner: `
${commonImports}

interface ConnectionLostBannerProps {
  ${dataName}?: any;
  className?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ConnectionLostBanner: React.FC<ConnectionLostBannerProps> = ({
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

  const connectionData = ${dataName} || {};
  const [isRetrying, setIsRetrying] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const connectionLostMessage = ${getField('connectionLostMessage')};
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
    } else {
      console.log('Banner dismissed');
    }
  };

  if (isDismissed) return null;

  return (
    <Alert className={cn("bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-l-4 border-red-500 dark:border-red-400 shadow-lg animate-in slide-in-from-top-2", className)}>
      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
        <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="text-red-800 dark:text-red-300 font-medium">
            {connectionLostMessage}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRetrying && "animate-spin")} />
            {retryButton}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionLostBanner;
    `,

    toast: `
${commonImports}

interface ConnectionLostBannerProps {
  ${dataName}?: any;
  className?: string;
  isConnected?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ConnectionLostBanner: React.FC<ConnectionLostBannerProps> = ({
  ${dataName}: propData,
  className,
  isConnected = false,
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

  const connectionData = ${dataName} || {};
  const [isRetrying, setIsRetrying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  const connectionLostDetailed = ${getField('connectionLostDetailed')};
  const reconnectedMessage = ${getField('reconnectedMessage')};
  const retryButton = ${getField('retryButton')};

  useEffect(() => {
    if (isConnected) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

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
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn("fixed top-4 right-4 z-50 w-96 max-w-full animate-in slide-in-from-top-2", className)}>
      {showReconnected ? (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-green-800 dark:text-green-300 font-medium">
              {reconnectedMessage}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-green-700 dark:text-green-400"
            >
              <X className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-lg">
          <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription>
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-800 dark:text-red-300 font-medium">
                {connectionLostDetailed}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-red-700 dark:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <Button
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRetrying && "animate-spin")} />
              {retryButton}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ConnectionLostBanner;
    `,

    persistent: `
${commonImports}

interface ConnectionLostBannerProps {
  ${dataName}?: any;
  className?: string;
  onRetry?: () => void;
  onOfflineMode?: () => void;
}

const ConnectionLostBanner: React.FC<ConnectionLostBannerProps> = ({
  ${dataName}: propData,
  className,
  onRetry,
  onOfflineMode
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

  const connectionData = ${dataName} || {};
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const connectionLostDetailed = ${getField('connectionLostDetailed')};
  const reconnectingMessage = ${getField('reconnectingMessage')};
  const retryButton = ${getField('retryButton')};
  const offlineModeButton = ${getField('offlineModeButton')};
  const attemptLabel = ${getField('attemptLabel')};
  const ofLabel = ${getField('ofLabel')};
  const maxAttempts = ${getField('maxAttempts')};
  const autoRetryMessage = ${getField('autoRetryMessage')};
  const secondsLabel = ${getField('secondsLabel')};

  useEffect(() => {
    if (isReconnecting && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && retryCount < maxAttempts) {
      handleRetry();
    }
  }, [countdown, isReconnecting]);

  const handleRetry = () => {
    setIsRetrying(true);
    setIsReconnecting(true);
    setRetryCount(retryCount + 1);

    if (onRetry) {
      onRetry();
    } else {
      console.log('Retrying connection... Attempt', retryCount + 1);
    }

    setTimeout(() => {
      setIsRetrying(false);
      setCountdown(10);
    }, 2000);
  };

  const handleOfflineMode = () => {
    if (onOfflineMode) {
      onOfflineMode();
    } else {
      console.log('Offline mode activated');
    }
  };

  return (
    <div className={cn("sticky top-0 z-50", className)}>
      <Alert className="rounded-none bg-red-600 dark:bg-red-700 border-red-700 dark:border-red-800 text-white">
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2">
                {isReconnecting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <WifiOff className="h-5 w-5" />
                )}
                <div>
                  <div className="font-medium">
                    {isReconnecting ? reconnectingMessage : connectionLostDetailed}
                  </div>
                  {isReconnecting && retryCount < maxAttempts && (
                    <div className="text-sm text-red-100">
                      {autoRetryMessage} {countdown} {secondsLabel} ({attemptLabel} {retryCount + 1} {ofLabel} {maxAttempts})
                    </div>
                  )}
                </div>
              </div>
              {isReconnecting && (
                <div className="flex-1 max-w-xs">
                  <Progress
                    value={(countdown / 10) * 100}
                    className="h-1 bg-red-800"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {retryCount >= maxAttempts && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOfflineMode}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {offlineModeButton}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                disabled={isRetrying}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", isRetrying && "animate-spin")} />
                {retryButton}
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConnectionLostBanner;
    `
  };

  return variants[variant] || variants.banner;
};
