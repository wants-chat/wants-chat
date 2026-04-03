import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateNotificationList = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'withBadges' | 'withActions' | 'filtered' | 'grouped' = 'simple'
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
    return `/${dataSource || 'notifications'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import { useQuery } from '@tanstack/react-query';
import { Bell, User, Heart, MessageCircle, UserPlus, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';`;

  const variants = {
    simple: `
${commonImports}

interface NotificationListProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  [key: string]: any;
}

export default function NotificationList({ ${dataName}: propData, entity = '${dataSource || 'notifications'}', className }: NotificationListProps) {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response)
          ? { simpleNotifications: response, notificationsTitle: 'Notifications', markAllAsReadText: 'Mark all as read' }
          : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const sourceData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }
  
  const notificationsTitle = ${getField('notificationsTitle')};
  const markAllAsReadText = ${getField('markAllAsReadText')};
  const notificationList = ${getField('simpleNotifications')};

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return Heart;
      case 'comment': return MessageCircle;
      case 'follow': return UserPlus;
      case 'mention': return User;
      default: return Bell;
    }
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read clicked');
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-2xl mx-auto p-4 lg:p-8", className)}>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-gray-900 dark:text-white" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{notificationsTitle}</h1>
            </div>
            <button 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              onClick={handleMarkAllAsRead}
            >
              {markAllAsReadText}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
          {notificationList.map((notification: any) => (
            <div
              key={notification.id}
              className={cn(
                "p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer",
                !notification.read && "bg-blue-50 dark:bg-blue-900/10"
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-4">
                <img
                  src={notification.avatar}
                  alt={notification.user}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-bold">{notification.user}</span>{' '}
                    <span className="text-gray-600 dark:text-gray-400">{notification.message}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{notification.time}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
    `,

    withBadges: `
${commonImports}

interface NotificationListProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function NotificationList({ ${dataName}, className }: NotificationListProps) {
  const sourceData = ${dataName} || {};
  
  const notificationsTitle = ${getField('notificationsTitle')};
  const stayUpdatedText = ${getField('stayUpdatedText')};
  const newBadgeText = ${getField('newBadgeText')};
  const notificationList = ${getField('badgeNotifications')};

  const unreadCount = notificationList.filter((n: any) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return Heart;
      case 'comment': return MessageCircle;
      case 'follow': return UserPlus;
      default: return Bell;
    }
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-2xl mx-auto p-4 lg:p-8", className)}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{notificationsTitle}</h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-600 dark:bg-red-500 text-white">
                {unreadCount} {newBadgeText}
              </Badge>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">{stayUpdatedText}</p>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          {notificationList.map((notification: any) => {
            const Icon = getIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer",
                  !notification.read && "border-l-4 border-blue-600 dark:border-blue-500"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", notification.bgColor)}>
                    <Icon className={cn("w-6 h-6", notification.iconColor)} />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-bold">{notification.user}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
    `,

    withActions: `
${commonImports}

interface NotificationListProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function NotificationList({ ${dataName}, className }: NotificationListProps) {
  const sourceData = ${dataName} || {};
  
  const activityTitle = ${getField('activityTitle')};
  const clearAllText = ${getField('clearAllText')};
  const newBadgeText = ${getField('newBadgeText')};
  const notificationList = ${getField('actionNotifications')};

  const handleClearAll = () => {
    console.log('Clear all clicked');
  };

  const handleDismissNotification = (notificationId: any) => {
    console.log('Dismiss notification:', notificationId);
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-3xl mx-auto p-4 lg:p-8", className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{activityTitle}</h1>
          <Button 
            variant="outline" 
            className="dark:border-gray-600 dark:text-gray-300"
            onClick={handleClearAll}
          >
            {clearAllText}
          </Button>
        </div>

        {/* Notification Cards */}
        <div className="space-y-4">
          {notificationList.map((notification: any) => (
            <div
              key={notification.id}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border cursor-pointer",
                !notification.read
                  ? "border-blue-200 dark:border-blue-800"
                  : "border-gray-200 dark:border-gray-700"
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-4">
                <img
                  src={notification.avatar}
                  alt="User"
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <button 
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismissNotification(notification.id);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {notification.time}
                    </span>
                    {!notification.read && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">
                        {newBadgeText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
    `,

    filtered: `
${commonImports}
import { useState } from 'react';

interface NotificationListProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function NotificationList({ ${dataName}, className }: NotificationListProps) {
  const sourceData = ${dataName} || {};
  
  const [filter, setFilter] = useState(${getField('filterAll')});

  const notificationsTitle = ${getField('notificationsTitle')};
  const notificationList = ${getField('filteredNotifications')};
  const noNotificationsText = ${getField('noNotificationsText')};
  const filterAll = ${getField('filterAll')};
  const filterUnread = ${getField('filterUnread')};
  const filterSocial = ${getField('filterSocial')};
  const filterComment = ${getField('filterComment')};
  const filterSystem = ${getField('filterSystem')};

  const filteredNotifications = filter === filterAll
    ? notifications
    : filter === filterUnread
    ? notificationList.filter((n: any) => !n.read)
    : notificationList.filter((n: any) => n.category === filter);

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    console.log('Filter changed to:', newFilter);
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-4xl mx-auto p-4 lg:p-8", className)}>
        {/* Header with Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{notificationsTitle}</h1>
          <div className="flex flex-wrap gap-2">
            {[filterAll, filterUnread, filterSocial, filterComment, filterSystem].map((tab) => (
              <Button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                variant={filter === tab ? "default" : "outline"}
                className={cn(
                  "capitalize",
                  filter === tab
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    : "dark:border-gray-600 dark:text-gray-300"
                )}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification: any) => (
              <div
                key={notification.id}
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer",
                  !notification.read && "ring-2 ring-blue-500 dark:ring-blue-400"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {notification.avatar ? (
                    <img
                      src={notification.avatar}
                      alt={notification.user}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      S
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-bold">{notification.user}</span>{' '}
                      {notification.action}
                    </p>
                    {notification.content && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.content}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {notification.time}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        notification.category === filterSocial && "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-300",
                        notification.category === filterComment && "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300",
                        notification.category === filterSystem && "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                      )}>
                        {notification.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">{noNotificationsText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    `,

    grouped: `
${commonImports}

interface NotificationListProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function NotificationList({ ${dataName}, className }: NotificationListProps) {
  const sourceData = ${dataName} || {};
  
  const notificationsTitle = ${getField('notificationsTitle')};
  const unreadText = ${getField('unreadText')};
  const todayLabel = ${getField('todayLabel')};
  const yesterdayLabel = ${getField('yesterdayLabel')};
  const olderLabel = ${getField('olderLabel')};
  
  const today = ${getField('todayNotifications')};
  const yesterday = ${getField('yesterdayNotifications')};
  const older = ${getField('olderNotifications')};

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  const renderNotification = (notification: any) => (
    <div
      key={notification.id}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer"
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="relative">
        <img
          src={notification.avatar}
          alt={notification.user}
          className="w-12 h-12 rounded-full object-cover"
        />
        {!notification.read && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 dark:bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">
          <span className="font-bold">{notification.user}</span>{' '}
          <span className="text-gray-600 dark:text-gray-400">{notification.action}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{notification.time}</p>
      </div>
      {notification.read && (
        <Check className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className={cn("max-w-2xl mx-auto p-4 lg:p-8", className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{notificationsTitle}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {today.filter((n: any) => !n.read).length} {unreadText}
              </p>
            </div>
          </div>
        </div>

        {/* Grouped Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm divide-y divide-gray-200 dark:divide-gray-700">
          {/* Today */}
          {today.length > 0 && (
            <div className="p-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {todayLabel}
              </h2>
              <div className="space-y-1">
                {today.map(renderNotification)}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {yesterday.length > 0 && (
            <div className="p-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {yesterdayLabel}
              </h2>
              <div className="space-y-1">
                {yesterday.map(renderNotification)}
              </div>
            </div>
          )}

          {/* Older */}
          {older.length > 0 && (
            <div className="p-4">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                {olderLabel}
              </h2>
              <div className="space-y-1">
                {older.map(renderNotification)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.simple;
};
