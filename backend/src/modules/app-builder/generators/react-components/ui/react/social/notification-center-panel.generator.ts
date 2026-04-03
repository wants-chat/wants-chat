import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateNotificationCenterPanel = (
  resolved: ResolvedComponent,
  variant: 'sidebar' | 'modal' | 'dropdown' = 'sidebar'
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
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, X, Settings, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';`;

  const variants = {
    sidebar: `
${commonImports}

interface NotificationCenterPanelProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  [key: string]: any;
}

export default function NotificationCenterPanel({ ${dataName}: propData, entity = '${dataSource || 'notifications'}', className }: NotificationCenterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response)
          ? { sidebarNotifications: { title: 'Notifications', unreadCount: response.filter((n: any) => !n.read).length, notifications: response } }
          : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const centerData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="fixed inset-0 z-50 lg:relative lg:inset-auto flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const panel = ${getField('sidebarNotifications')};

  const handleMarkAllRead = () => {
    console.log('Mark all as read');
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Backdrop for mobile */}
      <div
        className="absolute inset-0 bg-black/50 lg:hidden"
        onClick={handleClose}
      />

      {/* Sidebar Panel */}
      <div className={cn(
        "absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl flex flex-col lg:relative lg:shadow-lg",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {panel.title}
            </h2>
            {panel.unreadCount > 0 && (
              <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {panel.unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mark all read
            </button>
            <button onClick={handleClose} className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {panel.notifications.map((notification: any) => (
            <div
              key={notification.id}
              className={cn(
                "flex gap-3 p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
                !notification.read && "bg-blue-50 dark:bg-blue-900/10"
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <img
                src={notification.avatar}
                alt={notification.user}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-bold">{notification.user}</span>{' '}
                  <span className="text-gray-600 dark:text-gray-400">{notification.message}</span>
                </p>
                {notification.content && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    "{notification.content}"
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {notification.time}
                </p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            className="w-full dark:border-gray-600 dark:text-gray-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            Notification Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
    `,

    modal: `
${commonImports}

interface NotificationCenterPanelProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  [key: string]: any;
}

export default function NotificationCenterPanel({ ${dataName}: propData, entity = '${dataSource || 'notifications'}', className }: NotificationCenterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response)
          ? { modalNotifications: { title: 'Notifications', filters: ['All', 'Unread', 'Read'], today: response.slice(0, 3), yesterday: response.slice(3, 6) } }
          : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const centerData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const panel = ${getField('modalNotifications')};

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={cn(
        "relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {panel.title}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-6 py-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {panel.filters.map((filter: string) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap",
                activeFilter === filter
                  ? "bg-blue-600 dark:bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Notifications */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Today */}
          {panel.today.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Today
              </h3>
              <div className="space-y-3">
                {panel.today.map((notification: any) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      !notification.read
                        ? "bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <img
                      src={notification.avatar}
                      alt={notification.user}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-bold">{notification.user}</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">{notification.action}</span>
                      </p>
                      {notification.content && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          "{notification.content}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {panel.yesterday.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Yesterday
              </h3>
              <div className="space-y-3">
                {panel.yesterday.map((notification: any) => (
                  <div
                    key={notification.id}
                    className="flex gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <img
                      src={notification.avatar}
                      alt={notification.user}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-bold">{notification.user}</span>{' '}
                        <span className="text-gray-600 dark:text-gray-400">{notification.action}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    `,

    dropdown: `
${commonImports}

interface NotificationCenterPanelProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  [key: string]: any;
}

export default function NotificationCenterPanel({ ${dataName}: propData, entity = '${dataSource || 'notifications'}', className }: NotificationCenterPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response)
          ? { dropdownNotifications: { title: 'Notifications', unreadCount: response.filter((n: any) => !n.read).length, notifications: response, maxDisplay: 5 } }
          : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const centerData = propData || fetchedData || {};
  const panel = ${getField('dropdownNotifications')};

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = (notification: any) => {
    console.log('Notification clicked:', notification);
  };

  const handleViewAll = () => {
    console.log('View all notifications');
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Bell className="w-6 h-6" />
        {panel.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 dark:bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {panel.unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={handleToggle}
          />

          <div className={cn(
            "absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50",
            className
          )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {panel.title}
              </h3>
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Mark all read
              </button>
            </div>

            {/* Notifications */}
            <div className="max-h-96 overflow-y-auto">
              {panel.notifications.slice(0, panel.maxDisplay).map((notification: any) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors",
                    !notification.read
                      ? "bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <img
                    src={notification.avatar}
                    alt={notification.user}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-bold">{notification.user}</span>{' '}
                      <span className="text-gray-600 dark:text-gray-400">{notification.message}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleViewAll}
                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:underline font-bold"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
    `
  };

  return variants[variant] || variants.sidebar;
};
