import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateNotificationDropdownSocial = (
  resolved: ResolvedComponent,
  variant: 'dropdown' | 'panel' | 'list' = 'dropdown'
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
    return `/${dataSource || 'notifications'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'notifications' : 'notifications';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    dropdown: `
${commonImports}
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Settings, X, Check } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  icon: string;
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  action: string;
  content: string | null;
  time: string;
  unread: boolean;
  link: string;
}

interface NotificationDropdownProps {
  ${dataName}?: any;
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
  onSettingsClick?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  ${dataName}: propData,
  className,
  onNotificationClick,
  onSettingsClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const title = ${getField('dropdownTitle')};
  const initialNotifications = ${getField('notifications')};
  const markAllReadButton = ${getField('markAllReadButton')};
  const viewAllButton = ${getField('viewAllButton')};
  const settingsButton = ${getField('settingsButton')};
  const markAsReadButton = ${getField('markAsReadButton')};
  const dismissButton = ${getField('dismissButton')};
  const noNotificationsLabel = ${getField('noNotificationsLabel')};
  const noNotificationsDescription = ${getField('noNotificationsDescription')};

  React.useEffect(() => {
    setNotifications(initialNotifications);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Heart,
      MessageCircle,
      UserPlus,
      AtSign
    };
    return icons[iconName] || Bell;
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    console.log(\`Notification \${id} marked as read\`);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    console.log('All notifications marked as read');
  };

  const dismissNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    console.log(\`Notification \${id} dismissed\`);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.unread) {
      markAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else {
      console.log('Notification clicked:', notification);
    }
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      console.log('Settings clicked');
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 mt-2 w-96 max-h-[600px] z-50 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {title}
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({unreadCount})
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600"
                    title={markAllReadButton}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={handleSettingsClick}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  title={settingsButton}
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-900 dark:text-white font-bold mb-1">
                    {noNotificationsLabel}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {noNotificationsDescription}
                  </p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getIcon(notification.icon);
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        "p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative group",
                        notification.unread && "bg-blue-50 dark:bg-blue-900/10"
                      )}
                    >
                      <button
                        onClick={(e) => dismissNotification(notification.id, e)}
                        className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </button>

                      <div className="flex gap-3">
                        <img
                          src={notification.user.avatar}
                          alt={notification.user.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <p className="text-sm text-gray-900 dark:text-white flex-1">
                              <span className="font-bold">{notification.user.name}</span>
                              {' '}
                              <span className="text-gray-600 dark:text-gray-400">
                                {notification.action}
                              </span>
                            </p>
                            {notification.unread && (
                              <span className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          {notification.content && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                              {notification.content}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700">
                              <Icon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <button className="w-full py-2 text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  {viewAllButton}
                </button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
    `,

    panel: `
${commonImports}
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Settings, Filter, Check, X } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  icon: string;
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  action: string;
  content: string | null;
  time: string;
  unread: boolean;
  link: string;
}

interface NotificationPanelProps {
  ${dataName}?: any;
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  ${dataName}: propData,
  className,
  onNotificationClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const title = ${getField('panelTitle')};
  const subtitle = ${getField('panelSubtitle')};
  const initialNotifications = ${getField('notifications')};
  const markAllReadButton = ${getField('markAllReadButton')};
  const clearAllButton = ${getField('clearAllButton')};
  const allLabel = ${getField('allLabel')};
  const likesLabel = ${getField('likesLabel')};
  const commentsLabel = ${getField('commentsLabel')};
  const followsLabel = ${getField('followsLabel')};
  const mentionsLabel = ${getField('mentionsLabel')};
  const unreadLabel = ${getField('unreadLabel')};

  React.useEffect(() => {
    setNotifications(initialNotifications);
  }, []);

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Heart,
      MessageCircle,
      UserPlus,
      AtSign
    };
    return icons[iconName] || Bell;
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return n.unread;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    console.log(\`Notification \${id} marked as read\`);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    console.log('All notifications marked as read');
  };

  const clearAll = () => {
    setNotifications([]);
    console.log('All notifications cleared');
  };

  const dismissNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    console.log(\`Notification \${id} dismissed\`);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.unread) {
      markAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else {
      console.log('Notification clicked:', notification);
    }
  };

  const filterOptions = [
    { value: 'all', label: allLabel },
    { value: 'unread', label: unreadLabel },
    { value: 'like', label: likesLabel },
    { value: 'comment', label: commentsLabel },
    { value: 'follow', label: followsLabel },
    { value: 'mention', label: mentionsLabel }
  ];

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card className="overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="font-bold text-gray-900 dark:text-white">
                {notifications.length} notifications
              </span>
              {unreadCount > 0 && (
                <Badge className="bg-blue-600">{unreadCount} new</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold"
                >
                  {markAllReadButton}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 font-bold"
                >
                  {clearAllButton}
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-bold transition-colors",
                  filter === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="divide-y dark:divide-gray-700 max-h-[600px] overflow-y-auto">
          {filteredNotifications.map((notification) => {
            const Icon = getIcon(notification.icon);
            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative group",
                  notification.unread && "bg-blue-50 dark:bg-blue-900/10"
                )}
              >
                <button
                  onClick={(e) => dismissNotification(notification.id, e)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>

                <div className="flex gap-4">
                  <img
                    src={notification.user.avatar}
                    alt={notification.user.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <p className="text-sm text-gray-900 dark:text-white flex-1">
                        <span className="font-bold">{notification.user.name}</span>
                        {' '}
                        <span className="text-gray-600 dark:text-gray-400">
                          {notification.action}
                        </span>
                      </p>
                      {notification.unread && (
                        <span className="h-2.5 w-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    {notification.content && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                        {notification.content}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {notification.type}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        •
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default NotificationPanel;
    `,

    list: `
${commonImports}
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Check, X, ChevronRight } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  icon: string;
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  action: string;
  content: string | null;
  time: string;
  unread: boolean;
  link: string;
}

interface NotificationListProps {
  ${dataName}?: any;
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  ${dataName}: propData,
  className,
  onNotificationClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const sourceData = ${dataName} || {};

  const title = ${getField('listTitle')};
  const subtitle = ${getField('listSubtitle')};
  const initialNotifications = ${getField('notifications')};
  const markAllReadButton = ${getField('markAllReadButton')};
  const markAsReadButton = ${getField('markAsReadButton')};
  const dismissButton = ${getField('dismissButton')};

  React.useEffect(() => {
    setNotifications(initialNotifications);
  }, []);

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Heart,
      MessageCircle,
      UserPlus,
      AtSign
    };
    return icons[iconName] || Bell;
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    console.log(\`Notification \${id} marked as read\`);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    console.log('All notifications marked as read');
  };

  const dismissNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    console.log(\`Notification \${id} dismissed\`);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const markSelectedAsRead = () => {
    setNotifications(prev =>
      prev.map(n => selectedIds.includes(n.id) ? { ...n, unread: false } : n)
    );
    setSelectedIds([]);
    console.log('Selected notifications marked as read');
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
    console.log('Selected notifications deleted');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.unread) {
      markAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else {
      console.log('Notification clicked:', notification);
    }
  };

  return (
    <div className={cn("", className)}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <Card>
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {notifications.length} total
              {unreadCount > 0 && (
                <span className="ml-2 font-bold text-blue-600">
                  ({unreadCount} unread)
                </span>
              )}
            </span>
            {selectedIds.length > 0 && (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedIds.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 ? (
              <>
                <button
                  onClick={markSelectedAsRead}
                  className="px-3 py-1.5 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {markAsReadButton}
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  {dismissButton}
                </button>
              </>
            ) : (
              unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-1.5 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  {markAllReadButton}
                </button>
              )
            )}
          </div>
        </div>

        {/* List */}
        <div className="divide-y dark:divide-gray-700">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.icon);
            const isSelected = selectedIds.includes(notification.id);

            return (
              <div
                key={notification.id}
                className={cn(
                  "flex items-center gap-4 p-4 transition-colors",
                  notification.unread && "bg-blue-50 dark:bg-blue-900/10",
                  isSelected && "bg-gray-100 dark:bg-gray-800"
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(notification.id)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <img
                  src={notification.user.avatar}
                  alt={notification.user.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />

                <div
                  onClick={() => handleNotificationClick(notification)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-900 dark:text-white flex-1">
                      <span className="font-bold">{notification.user.name}</span>
                      {' '}
                      <span className="text-gray-600 dark:text-gray-400">
                        {notification.action}
                      </span>
                    </p>
                    {notification.unread && (
                      <span className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  {notification.content && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">
                      {notification.content}
                    </p>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {notification.time}
                  </span>
                </div>

                <button
                  onClick={() => handleNotificationClick(notification)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default NotificationList;
    `
  };

  return variants[variant] || variants.dropdown;
};
