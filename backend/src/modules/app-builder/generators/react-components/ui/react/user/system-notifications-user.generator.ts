import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSystemNotificationsUser = (
  resolved: ResolvedComponent,
  variant: 'banner' | 'toast' | 'inline' = 'banner'
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
  const entity = dataSource?.split('.').pop() || 'notifications';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'notifications'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';`;

  const variants = {
    banner: `
${commonImports}
import { Info, AlertTriangle, CheckCircle, XCircle, X, ExternalLink, Loader2 } from 'lucide-react';

interface BannerNotification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  action?: string;
  actionLink?: string;
}

interface BannerNotificationsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const BannerNotifications: React.FC<BannerNotificationsProps> = ({ ${dataName}: propData, className }) => {
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
  const [notifications, setNotifications] = useState<BannerNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  const bannerNotifications = ${getField('bannerNotifications')};
  const dismissButton = ${getField('dismissButton')};

  useEffect(() => {
    setNotifications(bannerNotifications);
  }, []);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100';
      case 'error':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100';
      case 'success':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100';
    }
  };

  const handleDismiss = (id: number) => {
    console.log('Notification dismissed:', id);
    setDismissedIds(prev => [...prev, id]);
  };

  const handleAction = (notification: BannerNotification) => {
    console.log('Notification action clicked:', notification);
    if (notification.actionLink) {
      window.location.href = notification.actionLink;
    }
  };

  const visibleNotifications = notifications.filter(n => !dismissedIds.includes(n.id));

  if (visibleNotifications.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={\`flex items-start gap-5 p-6 border-l-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102 \${getStyles(notification.type)}\`}
        >
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center shadow-md">
            {getIcon(notification.type)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-extrabold mb-2">{notification.title}</h3>
            <p className="text-base font-medium opacity-90">{notification.message}</p>

            {notification.action && (
              <button
                onClick={() => handleAction(notification)}
                className="mt-2 text-sm font-medium underline hover:no-underline flex items-center gap-1"
              >
                {notification.action}
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => handleDismiss(notification.id)}
            className="flex-shrink-0 p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110 group"
            aria-label={dismissButton}
          >
            <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default BannerNotifications;
    `,

    toast: `
${commonImports}
import { Info, AlertTriangle, CheckCircle, XCircle, X, Bell, Loader2 } from 'lucide-react';

interface ToastNotification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  autoDismiss: boolean;
}

interface ToastNotificationsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ToastNotifications: React.FC<ToastNotificationsProps> = ({ ${dataName}: propData, className }) => {
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
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  const toastNotifications = ${getField('toastNotifications')};
  const autoDismissTime = ${getField('autoDismissTime')};
  const closeButton = ${getField('closeButton')};

  useEffect(() => {
    setNotifications(toastNotifications);
  }, []);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  useEffect(() => {
    const autoDismissTimers: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (notification.autoDismiss && !dismissedIds.includes(notification.id)) {
        const timer = setTimeout(() => {
          handleDismiss(notification.id);
        }, autoDismissTime);
        autoDismissTimers.push(timer);
      }
    });

    return () => {
      autoDismissTimers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications, dismissedIds]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDismiss = (id: number) => {
    console.log('Toast dismissed:', id);
    setDismissedIds(prev => [...prev, id]);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return \`\${diffMins} min ago\`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return \`\${diffHours}h ago\`;
    return date.toLocaleDateString();
  };

  const visibleNotifications = notifications.filter(n => !dismissedIds.includes(n.id));

  return (
    <div className={cn("fixed top-4 right-4 z-50 space-y-4 max-w-md w-full", className)}>
      {visibleNotifications.map((notification) => (
        <Card
          key={notification.id}
          className="p-6 shadow-2xl border-l-8 border-l-current animate-in slide-in-from-right rounded-2xl bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 hover:shadow-3xl transition-all duration-300 hover:scale-105"
          style={{
            borderLeftColor:
              notification.type === 'info' ? '#3b82f6' :
              notification.type === 'warning' ? '#eab308' :
              notification.type === 'error' ? '#ef4444' :
              '#10b981'
          }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl flex items-center justify-center shadow-lg">
              {getIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {notification.title}
                </h4>
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={closeButton}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-base text-gray-700 dark:text-gray-300 mb-3 font-medium leading-relaxed">
                {notification.message}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimestamp(notification.timestamp)}
                </span>
                {notification.autoDismiss && (
                  <div className="relative w-16 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-0 bg-blue-500 animate-[shrink_5s_linear]"
                      style={{
                        animation: \`shrink \${autoDismissTime}ms linear\`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
</div>
  );
};

export default ToastNotifications;
    `,

    inline: `
${commonImports}
import { Info, AlertTriangle, CheckCircle, XCircle, X, Loader2 } from 'lucide-react';

interface InlineNotification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  action?: string | null;
  dismissible: boolean;
}

interface InlineNotificationsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const InlineNotifications: React.FC<InlineNotificationsProps> = ({ ${dataName}: propData, className }) => {
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
  const [notifications, setNotifications] = useState<InlineNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  const inlineNotifications = ${getField('inlineNotifications')};
  const dismissButton = ${getField('dismissButton')};

  useEffect(() => {
    setNotifications(inlineNotifications);
  }, []);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'info':
        return {
          container: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
          text: 'text-blue-900 dark:text-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-900 dark:text-yellow-100',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'error':
        return {
          container: 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800',
          text: 'text-red-900 dark:text-red-100',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'success':
        return {
          container: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
          text: 'text-green-900 dark:text-green-100',
          button: 'bg-green-600 hover:bg-green-700 text-white'
        };
      default:
        return {
          container: 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700',
          text: 'text-gray-900 dark:text-gray-100',
          button: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
    }
  };

  const handleDismiss = (id: number) => {
    console.log('Inline notification dismissed:', id);
    setDismissedIds(prev => [...prev, id]);
  };

  const handleAction = (notification: InlineNotification) => {
    console.log('Inline notification action clicked:', notification);
  };

  const visibleNotifications = notifications.filter(n => !dismissedIds.includes(n.id));

  return (
    <div className={cn("space-y-3", className)}>
      {visibleNotifications.map((notification) => {
        const styles = getStyles(notification.type);

        return (
          <div
            key={notification.id}
            className={\`flex items-center gap-3 p-4 border rounded-lg \${styles.container}\`}
          >
            <div className={\`flex-shrink-0 \${styles.text}\`}>
              {getIcon(notification.type)}
            </div>

            <div className={\`flex-1 min-w-0 \${styles.text}\`}>
              <p className="text-sm">{notification.message}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {notification.action && (
                <button
                  onClick={() => handleAction(notification)}
                  className={\`px-3 py-1.5 rounded-md text-sm font-medium transition-colors \${styles.button}\`}
                >
                  {notification.action}
                </button>
              )}

              {notification.dismissible && (
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className={\`p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors \${styles.text}\`}
                  aria-label={dismissButton}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InlineNotifications;
    `
  };

  return variants[variant] || variants.banner;
};
