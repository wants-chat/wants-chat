import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSystemNotifications = (
  resolved: ResolvedComponent,
  variant: 'toast' | 'banner' | 'modal' = 'toast'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle, Bell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    toast: `
${commonImports}

interface SystemNotificationsProps {
  ${dataName}?: any;
  className?: string;
  onDismiss?: (id: string) => void;
  onAction?: (id: string, actionUrl: string) => void;
}

export default function SystemNotifications({ ${dataName}: propData, className, onDismiss, onAction }: SystemNotificationsProps) {
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

  const notificationsData = ${dataName} || {};

  const [notifications, setNotifications] = useState(${getField('notifications')});

  const getSeverityConfig = (severity: string) => {
    const configs = {
      info: {
        icon: Info,
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400',
        textColor: 'text-blue-900 dark:text-blue-200'
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        iconColor: 'text-amber-600 dark:text-amber-400',
        textColor: 'text-amber-900 dark:text-amber-200'
      },
      error: {
        icon: AlertCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: 'text-red-900 dark:text-red-200'
      }
    };
    return configs[severity as keyof typeof configs] || configs.info;
  };

  const handleDismiss = (id: string) => {
    console.log('Dismissing notification:', id);
    setNotifications(notifications.filter((n: any) => n.id !== id));
    onDismiss && onDismiss(id);
  };

  const handleAction = (id: string, actionUrl: string) => {
    console.log('Action clicked:', id, actionUrl);
    onAction ? onAction(id, actionUrl) : alert(\`Action: \${actionUrl}\`);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return \`\${diffMins} minutes ago\`;
    if (diffMins < 1440) return \`\${Math.floor(diffMins / 60)} hours ago\`;
    return \`\${Math.floor(diffMins / 1440)} days ago\`;
  };

  return (
    <div className={cn('fixed top-4 right-4 z-50 space-y-3 max-w-md', className)}>
      {notifications.slice(0, 3).map((notification: any) => {
        const config = getSeverityConfig(notification.severity);
        const Icon = config.icon;

        return (
          <div
            key={notification.id}
            className={cn(
              'rounded-lg border p-4 shadow-lg animate-in slide-in-from-right',
              config.bgColor,
              config.borderColor
            )}
          >
            <div className="flex items-start gap-3">
              <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />

              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', config.textColor)}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {formatTimestamp(notification.timestamp)}
                </p>

                {notification.action && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn('mt-2 h-8 text-xs', config.iconColor)}
                    onClick={() => handleAction(notification.id, notification.action.url)}
                  >
                    {notification.action.label}
                  </Button>
                )}
              </div>

              <button
                onClick={() => handleDismiss(notification.id)}
                className={cn('flex-shrink-0 hover:opacity-70 transition-opacity', config.iconColor)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
    `,

    banner: `
${commonImports}

interface SystemNotificationsProps {
  ${dataName}?: any;
  className?: string;
  onDismiss?: (id: string) => void;
  onMarkAllRead?: () => void;
}

export default function SystemNotifications({ ${dataName}: propData, className, onDismiss, onMarkAllRead }: SystemNotificationsProps) {
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

  const notificationsData = ${dataName} || {};

  const [notifications, setNotifications] = useState(${getField('notifications')});
  const markAllReadButton = ${getField('markAllReadButton')};

  const unreadNotifications = notifications.filter((n: any) => !n.read);
  const currentNotification = unreadNotifications[0];

  const getSeverityConfig = (severity: string) => {
    const configs = {
      info: {
        icon: Info,
        bgColor: 'bg-blue-600 dark:bg-blue-700',
        iconColor: 'text-white'
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-amber-600 dark:bg-amber-700',
        iconColor: 'text-white'
      },
      error: {
        icon: AlertCircle,
        bgColor: 'bg-red-600 dark:bg-red-700',
        iconColor: 'text-white'
      }
    };
    return configs[severity as keyof typeof configs] || configs.info;
  };

  const handleDismiss = (id: string) => {
    console.log('Dismissing notification:', id);
    setNotifications(notifications.filter((n: any) => n.id !== id));
    onDismiss && onDismiss(id);
  };

  const handleMarkAllRead = () => {
    console.log('Marking all as read');
    setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
    onMarkAllRead && onMarkAllRead();
  };

  if (!currentNotification) {
    return null;
  }

  const config = getSeverityConfig(currentNotification.severity);
  const Icon = config.icon;

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full py-3 px-4', config.bgColor)}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Icon className={cn('w-5 h-5 flex-shrink-0', config.iconColor)} />
            <p className="text-white text-sm font-medium truncate">
              {currentNotification.message}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {currentNotification.action && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8"
                onClick={() => alert(currentNotification.action.url)}
              >
                {currentNotification.action.label}
              </Button>
            )}

            {unreadNotifications.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-8"
                onClick={handleMarkAllRead}
              >
                {markAllReadButton}
              </Button>
            )}

            <button
              onClick={() => handleDismiss(currentNotification.id)}
              className="text-white hover:opacity-70 transition-opacity p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {unreadNotifications.length > 1 && (
        <div className="bg-gray-100 dark:bg-gray-800 py-2 px-4 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {unreadNotifications.length - 1} more notification{unreadNotifications.length > 2 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
    `,

    modal: `
${commonImports}
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SystemNotificationsProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onMarkAllRead?: () => void;
}

export default function SystemNotifications({
  ${dataName}: propData,
  className,
  isOpen = true,
  onClose,
  onMarkAllRead
}: SystemNotificationsProps) {
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

  const notificationsData = ${dataName} || {};

  const [notifications, setNotifications] = useState(${getField('notifications')});
  const notificationsTitle = ${getField('notificationsTitle')};
  const markAllReadButton = ${getField('markAllReadButton')};
  const noNotificationsText = ${getField('noNotificationsText')};

  const getSeverityConfig = (severity: string) => {
    const configs = {
      info: {
        icon: Info,
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400'
      },
      warning: {
        icon: AlertTriangle,
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-600 dark:text-amber-400'
      },
      error: {
        icon: AlertCircle,
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400'
      }
    };
    return configs[severity as keyof typeof configs] || configs.info;
  };

  const handleDismiss = (id: string) => {
    console.log('Dismissing notification:', id);
    setNotifications(notifications.filter((n: any) => n.id !== id));
  };

  const handleMarkAllRead = () => {
    console.log('Marking all as read');
    setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
    onMarkAllRead && onMarkAllRead();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-2xl max-h-[80vh] dark:bg-gray-800', className)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {notificationsTitle}
              {notifications.filter((n: any) => !n.read).length > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {notifications.filter((n: any) => !n.read).length}
                </span>
              )}
            </DialogTitle>
            {notifications.filter((n: any) => !n.read).length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-blue-600 dark:text-blue-400"
              >
                {markAllReadButton}
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">{noNotificationsText}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification: any) => {
                const config = getSeverityConfig(notification.severity);
                const Icon = config.icon;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 rounded-lg border transition-colors',
                      notification.read
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                        : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', config.bgColor)}>
                        <Icon className={cn('w-5 h-5', config.iconColor)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </p>

                        {notification.action && (
                          <Button
                            variant="link"
                            size="sm"
                            className={cn('mt-2 h-auto p-0 text-xs', config.iconColor)}
                            onClick={() => alert(notification.action.url)}
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>

                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
    `
  };

  return variants[variant] || variants.toast;
};
