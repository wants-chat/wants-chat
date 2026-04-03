import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSessionTimeoutWarning = (
  resolved: ResolvedComponent,
  variant: 'modal' | 'banner' | 'countdown' = 'modal'
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
    return `/${dataSource || 'session'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'session';

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, LogOut, Save, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    modal: `
${commonImports}

interface SessionTimeoutWarningProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onExtendSession?: () => void;
  onLogOut?: () => void;
  onSaveWork?: () => void;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  ${dataName}: propData,
  className,
  isOpen = true,
  onExtendSession,
  onLogOut,
  onSaveWork
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sessionData = ${dataName} || {};
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  const heading = ${getField('heading')};
  const messageDetailed = ${getField('messageDetailed')};
  const timeRemainingLabel = ${getField('timeRemainingLabel')};
  const extendSessionButton = ${getField('extendSessionButton')};
  const logOutButton = ${getField('logOutButton')};
  const saveWorkButton = ${getField('saveWorkButton')};
  const autoSaveEnabled = ${getField('autoSaveEnabled')};
  const autoSaveMessage = ${getField('autoSaveMessage')};

  useEffect(() => {
    if (isOpen && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (onLogOut) onLogOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, timeRemaining, onLogOut]);

  const handleExtendSession = () => {
    if (onExtendSession) {
      onExtendSession();
    } else {
      console.log('Session extended');
      setTimeRemaining(60);
    }
  };

  const handleLogOut = () => {
    if (onLogOut) {
      onLogOut();
    } else {
      console.log('Logging out');
    }
  };

  const handleSaveWork = () => {
    setIsSaving(true);
    if (onSaveWork) {
      onSaveWork();
    } else {
      console.log('Saving work');
    }
    setTimeout(() => setIsSaving(false), 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", className)}>
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-4">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {heading}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {messageDetailed}
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {timeRemainingLabel}
              </span>
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatTime(timeRemaining)}
              </span>
            </div>

            {autoSaveEnabled && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 mb-4">
                <CheckCircle2 className="w-4 h-4" />
                {autoSaveMessage}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button
              size="lg"
              onClick={handleExtendSession}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {extendSessionButton}
            </Button>

            {!autoSaveEnabled && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleSaveWork}
                disabled={isSaving}
                className="w-full"
              >
                <Save className={cn("w-5 h-5 mr-2", isSaving && "animate-pulse")} />
                {saveWorkButton}
              </Button>
            )}

            <Button
              size="lg"
              variant="ghost"
              onClick={handleLogOut}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-5 h-5 mr-2" />
              {logOutButton}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionTimeoutWarning;
    `,

    banner: `
${commonImports}

interface SessionTimeoutWarningProps {
  ${dataName}?: any;
  className?: string;
  onExtendSession?: () => void;
  onDismiss?: () => void;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  ${dataName}: propData,
  className,
  onExtendSession,
  onDismiss
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sessionData = ${dataName} || {};
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-yellow-600" />
      </div>
    );
  }

  const headingShort = ${getField('headingShort')};
  const message = ${getField('message')};
  const extendButtonAlternate = ${getField('extendButtonAlternate')};
  const lastSavedLabel = ${getField('lastSavedLabel')};
  const lastSavedTime = ${getField('lastSavedTime')};

  useEffect(() => {
    if (timeRemaining > 0 && !isDismissed) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isDismissed]);

  const handleExtendSession = () => {
    if (onExtendSession) {
      onExtendSession();
    } else {
      console.log('Session extended');
    }
    setTimeRemaining(60);
    setIsDismissed(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return \`\${mins}:\${secs.toString().padStart(2, '0')}\`;
  };

  if (isDismissed) return null;

  return (
    <Alert className={cn("bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800", className)}>
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4 flex-1">
          <div>
            <div className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
              {headingShort}
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-400">
              {message}
            </div>
          </div>
          <Badge className="bg-yellow-600 text-white text-lg px-3 py-1">
            {formatTime(timeRemaining)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-yellow-600 dark:text-yellow-400 mr-2">
            {lastSavedLabel} {lastSavedTime}
          </div>
          <Button
            size="sm"
            onClick={handleExtendSession}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            {extendButtonAlternate}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default SessionTimeoutWarning;
    `,

    countdown: `
${commonImports}

interface SessionTimeoutWarningProps {
  ${dataName}?: any;
  className?: string;
  onExtendSession?: () => void;
  onLogOut?: () => void;
}

const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  ${dataName}: propData,
  className,
  onExtendSession,
  onLogOut
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData;
  const sessionData = ${dataName} || {};
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [showWarning, setShowWarning] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-96 max-w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-yellow-600" />
      </div>
    );
  }

  const headingAlternate = ${getField('headingAlternate')};
  const messageCountdown = ${getField('messageCountdown')};
  const extendSessionButton = ${getField('extendSessionButton')};
  const logOutButton = ${getField('logOutButton')};
  const minutesLabel = ${getField('minutesLabel')};
  const secondsLabel = ${getField('secondsLabel')};
  const warningThreshold = ${getField('warningThreshold')};

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (onLogOut) onLogOut();
          return 0;
        }
        if (prev <= warningThreshold && !showWarning) {
          setShowWarning(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning, warningThreshold, onLogOut]);

  const handleExtendSession = () => {
    if (onExtendSession) {
      onExtendSession();
    } else {
      console.log('Session extended');
    }
    setTimeRemaining(300);
    setShowWarning(false);
  };

  const handleLogOut = () => {
    if (onLogOut) {
      onLogOut();
    } else {
      console.log('Logging out');
    }
  };

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = (timeRemaining / warningThreshold) * 100;

  if (!showWarning) return null;

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 w-96 max-w-full", className)}>
      <Card className="shadow-2xl border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {headingAlternate}
              </h3>
              <div className="inline-flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {messageCountdown}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {String(minutes).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mt-1">
                  {minutesLabel}
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {String(seconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 uppercase mt-1">
                  {secondsLabel}
                </div>
              </div>
            </div>

            <Progress
              value={progress}
              className="h-2 mb-4"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExtendSession}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {extendSessionButton}
            </Button>
            <Button
              variant="outline"
              onClick={handleLogOut}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionTimeoutWarning;
    `
  };

  return variants[variant] || variants.modal;
};
