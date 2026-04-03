import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateActivityFeed = (
  resolved: ResolvedComponent,
  variant: 'compactFeed' | 'detailedFeed' | 'groupedFeed' | 'notificationFeed' | 'socialFeed' | 'timelineFeed' = 'compactFeed'
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
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards/i)) {
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
    return `/${dataSource || 'activities'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    compactFeed: `
${commonImports}
import { List, ArrowRight } from 'lucide-react';

interface Activity {
  id: number;
  user: string;
  action: string;
  target: string;
  time: string;
  color: string;
}

interface CompactFeedProps {
  ${dataName}?: any;
  className?: string;
  onActivityClick?: (activity: Activity) => void;
  [key: string]: any;
}

const CompactFeed: React.FC<CompactFeedProps> = ({ ${dataName}: propData, className, onActivityClick }) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'activities'}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response : (response?.data || response?.activities || []);
      } catch (err) {
        console.error('Failed to fetch activities:', err);
        return [];
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const sourceData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading activities...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !propData) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-red-500">
              <p>Failed to load activities. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const title = ${getField('compactTitle')};
  const subtitle = ${getField('compactSubtitle')};
  const badgeText = ${getField('badgeText')};
  const activities = Array.isArray(sourceData) ? sourceData : (${getField('compactActivities')} || []);
  const activitiesLabel = ${getField('activitiesLabel')};
  const usersLabel = ${getField('usersLabel')};
  const actionsLabel = ${getField('actionsLabel')};
  const timeSpanLabel = ${getField('timeSpanLabel')};
  const statsActivities = ${getField('compactStatsActivities')};
  const statsUsers = ${getField('compactStatsUsers')};
  const statsActions = ${getField('compactStatsActions')};
  const statsTimeSpan = ${getField('compactStatsTimeSpan')};

  const handleActivityClick = (activity: Activity) => {
    if (onActivityClick) {
      onActivityClick(activity);
    } else {
      console.log('Activity clicked:', activity);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5 text-orange-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {subtitle}
              </p>
            </div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-600">
              {badgeText}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {activities.map((activity: Activity) => (
              <div
                key={activity.id}
                onClick={() => handleActivityClick(activity)}
                className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={\`h-2 w-2 rounded-full bg-\${activity.color}-500 flex-shrink-0\`} />
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {activity.user}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {activity.action}
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-sm truncate">
                      {activity.target}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {activity.time}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{statsActivities}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activitiesLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{statsUsers}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{usersLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statsActions}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{actionsLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{statsTimeSpan}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{timeSpanLabel}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompactFeed;
    `,

    detailedFeed: `
${commonImports}
import { FileText, Download, Eye, Share2, File, Image, Video, Check } from 'lucide-react';

interface DetailedActivity {
  id: number;
  type: string;
  icon?: string;
  title: string;
  description: string;
  user: {
    name: string;
    role: string;
    avatar: string;
  };
  time: string;
  meta: {
    size?: string;
    duration?: string;
    format: string;
    downloads?: number;
    views?: number;
  };
  previewImage: string;
}

interface DetailedFeedProps {
  ${dataName}?: any;
  className?: string;
  onDownload?: (activityId: number, activity: DetailedActivity) => void;
  onView?: (activityId: number, activity: DetailedActivity) => void;
  onShare?: (activityId: number, activity: DetailedActivity) => void;
}

const DetailedFeed: React.FC<DetailedFeedProps> = ({ ${dataName}, className, onDownload, onView, onShare }) => {
  const [downloadedItems, setDownloadedItems] = useState<number[]>([]);
  const [viewedItems, setViewedItems] = useState<number[]>([]);

  const sourceData = ${dataName} || {};
  
  const title = ${getField('detailedTitle')};
  const subtitle = ${getField('detailedSubtitle')};
  const badgeText = ${getField('badgeText')};
  const activities = ${getField('detailedActivities')};
  const downloadButton = ${getField('downloadButton')};
  const downloadedButton = ${getField('downloadedButton')};
  const viewButton = ${getField('viewButton')};
  const viewedButton = ${getField('viewedButton')};
  const shareButton = ${getField('shareButton')};

  const handleDownload = (id: number, activity: DetailedActivity) => {
    if (!downloadedItems.includes(id)) {
      setDownloadedItems(prev => [...prev, id]);
      if (onDownload) {
        onDownload(id, activity);
      } else {
        console.log('Download started:', activity.title);
      }
    }
  };

  const handleView = (id: number, activity: DetailedActivity) => {
    if (!viewedItems.includes(id)) {
      setViewedItems(prev => [...prev, id]);
    }
    if (onView) {
      onView(id, activity);
    } else {
      console.log('Viewing:', activity.title);
    }
  };

  const handleShare = (id: number, activity: DetailedActivity) => {
    if (onShare) {
      onShare(id, activity);
    } else {
      console.log('Sharing:', activity.title);
      if (navigator.share) {
        navigator.share({
          title: activity.title,
          text: activity.description,
          url: window.location.href
        }).catch(err => console.log('Share cancelled'));
      }
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'image': return Image;
      case 'video': return Video;
      default: return File;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {subtitle}
              </p>
            </div>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-600">
              {badgeText}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activities.map((activity: DetailedActivity) => {
              const Icon = getIcon(activity.type);
              const isDownloaded = downloadedItems.includes(activity.id);
              const isViewed = viewedItems.includes(activity.id);

              return (
                <div key={activity.id} className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-64 overflow-hidden">
                    <img src={activity.previewImage} alt={activity.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg bg-indigo-500/90 backdrop-blur-sm flex items-center justify-center">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-white">{activity.title}</h3>
                          <p className="text-xs text-white/80">
                            {activity.meta.format} • {activity.meta.size || activity.meta.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{activity.description}</p>

                    <div className="flex items-center gap-3 mb-4 pb-4 border-b dark:border-gray-700">
                      <img src={activity.user.avatar} alt={activity.user.name} className="h-10 w-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{activity.user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.user.role} • {activity.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDownload(activity.id, activity)}
                        disabled={isDownloaded}
                        className={\`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium \${
                          isDownloaded ? 'bg-green-100 text-green-700 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }\`}
                      >
                        {isDownloaded ? <><Check className="h-4 w-4" />{downloadedButton}</> : <><Download className="h-4 w-4" />{downloadButton}</>}
                      </button>
                      <button
                        onClick={() => handleView(activity.id, activity)}
                        className={\`py-2 px-4 border rounded-lg transition-colors flex items-center gap-2 text-sm font-medium \${
                          isViewed ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }\`}
                      >
                        <Eye className="h-4 w-4" />
                        {isViewed ? viewedButton : viewButton}
                      </button>
                      <button 
                        onClick={() => handleShare(activity.id, activity)}
                        className="py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
                      >
                        <Share2 className="h-4 w-4" />
                        {shareButton}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailedFeed;
    `,

    groupedFeed: `
${commonImports}
import { Folder, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface GroupItem {
  id: number;
  title: string;
  time: string;
  user: string;
  thumbnail?: string;
}

interface ActivityGroup {
  id: number;
  category: string;
  icon: string;
  color: string;
  count: number;
  items: GroupItem[];
}

interface GroupedFeedProps {
  ${dataName}?: any;
  className?: string;
  onGroupToggle?: (groupId: number, isExpanded: boolean) => void;
  onItemClick?: (groupId: number, item: GroupItem) => void;
}

const GroupedFeed: React.FC<GroupedFeedProps> = ({ ${dataName}, className, onGroupToggle, onItemClick }) => {
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

  const sourceData = ${dataName} || {};
  
  const title = ${getField('groupedTitle')};
  const subtitle = ${getField('groupedSubtitle')};
  const badgeText = ${getField('badgeText')};
  const groups = ${getField('groupedGroups')};
  const totalItemsLabel = ${getField('totalItemsLabel')};
  const categoriesLabel = ${getField('categoriesLabel')};
  const contributorsLabel = ${getField('contributorsLabel')};
  const timeRangeLabel = ${getField('timeRangeLabel')};
  const statsTotalItems = ${getField('groupedStatsTotalItems')};
  const statsCategories = ${getField('groupedStatsCategories')};
  const statsContributors = ${getField('groupedStatsContributors')};
  const statsTimeRange = ${getField('groupedStatsTimeRange')};

  const toggleGroup = (groupId: number) => {
    const isCurrentlyExpanded = expandedGroups.includes(groupId);
    setExpandedGroups(prev =>
      isCurrentlyExpanded ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
    if (onGroupToggle) {
      onGroupToggle(groupId, !isCurrentlyExpanded);
    }
  };

  const handleItemClick = (groupId: number, item: GroupItem) => {
    if (onItemClick) {
      onItemClick(groupId, item);
    } else {
      console.log('Item clicked:', item.title);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-teal-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-teal-100 text-teal-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groups.map((group: ActivityGroup) => (
              <div key={group.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={\`h-10 w-10 rounded-lg bg-\${group.color}-100 flex items-center justify-center\`}>
                      <FileText className={\`h-5 w-5 text-\${group.color}-600\`} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">{group.category}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{group.count} items</p>
                    </div>
                  </div>
                  {expandedGroups.includes(group.id) ? 
                    <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  }
                </button>

                {expandedGroups.includes(group.id) && (
                  <div className="divide-y dark:divide-gray-700">
                    {group.items.map((item: GroupItem) => (
                      <div 
                        key={item.id} 
                        onClick={() => handleItemClick(group.id, item)}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {item.thumbnail && <img src={item.thumbnail} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm mb-1 truncate">{item.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>{item.user}</span>
                              <span>•</span>
                              <span>{item.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600">{statsTotalItems}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{totalItemsLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{statsCategories}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{categoriesLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{statsContributors}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{contributorsLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statsTimeRange}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{timeRangeLabel}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupedFeed;
    `,

    notificationFeed: `
${commonImports}
import { Bell, CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  icon?: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface NotificationFeedProps {
  ${dataName}?: any;
  className?: string;
  onMarkAsRead?: (notificationId: number) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (notificationId: number) => void;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationFeed: React.FC<NotificationFeedProps> = ({ 
  ${dataName}, 
  className, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDismiss,
  onNotificationClick 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const sourceData = ${dataName} || {};
  
  const title = ${getField('notificationTitle')};
  const subtitle = ${getField('notificationSubtitle')};
  const badgeText = ${getField('badgeText')};
  const initialNotifications = ${getField('notifications')};
  const markAllRead = ${getField('markAllRead')};
  const totalLabel = ${getField('totalLabel')};
  const unreadLabel = ${getField('unreadLabel')};
  const todayLabel = ${getField('todayLabel')};
  const importantLabel = ${getField('importantLabel')};
  const statsTotal = ${getField('notificationStatsTotal')};
  const statsUnread = ${getField('notificationStatsUnread')};
  const statsToday = ${getField('notificationStatsToday')};
  const statsImportant = ${getField('notificationStatsImportant')};

  React.useEffect(() => {
    setNotifications(initialNotifications);
  }, []);

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    if (onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const dismissNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (onDismiss) {
      onDismiss(id);
    }
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

  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'warning': return AlertCircle;
      default: return Info;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success': return { bg: 'bg-green-100', text: 'text-green-600', icon: 'text-green-600' };
      case 'error': return { bg: 'bg-red-100', text: 'text-red-600', icon: 'text-red-600' };
      case 'warning': return { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'text-orange-600' };
      default: return { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'text-blue-600' };
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              {title}
              {unreadCount > 0 && (
                <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </CardTitle>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                {markAllRead}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const colors = getColorClasses(notification.type);

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={\`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer relative group \${
                    notification.unread ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                  }\`}
                >
                  <button
                    onClick={(e) => dismissNotification(notification.id, e)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex gap-4">
                    <div className={\`flex-shrink-0 h-10 w-10 rounded-full \${colors.bg} flex items-center justify-center\`}>
                      <Icon className={\`h-5 w-5 \${colors.icon}\`} />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{notification.title}</p>
                        {notification.unread && <span className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-600 ml-2" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{statsTotal}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{totalLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{statsUnread}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{unreadLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{statsToday}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{todayLabel}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{statsImportant}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{importantLabel}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationFeed;
    `,

    socialFeed: `
${commonImports}
import { Users, Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

interface SocialActivity {
  id: number;
  user: {
    name: string;
    avatar: string;
    time: string;
  };
  action: string;
  content: string;
  image?: string;
  link?: {
    title: string;
    description: string;
    url: string;
    image: string;
  };
  likes: number;
  comments: number;
  shares: number;
}

interface SocialFeedProps {
  ${dataName}?: any;
  className?: string;
  onLike?: (postId: number, isLiked: boolean) => void;
  onComment?: (postId: number) => void;
  onShare?: (postId: number) => void;
  onPostMenuClick?: (postId: number) => void;
  onUserClick?: (userName: string) => void;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ 
  ${dataName}, 
  className, 
  onLike, 
  onComment, 
  onShare,
  onPostMenuClick,
  onUserClick 
}) => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const sourceData = ${dataName} || {};
  
  const title = ${getField('socialTitle')};
  const subtitle = ${getField('socialSubtitle')};
  const badgeText = ${getField('badgeText')};
  const activities = ${getField('socialActivities')};

  const toggleLike = (postId: number) => {
    const isCurrentlyLiked = likedPosts.includes(postId);
    setLikedPosts(prev =>
      isCurrentlyLiked ? prev.filter(id => id !== postId) : [...prev, postId]
    );
    if (onLike) {
      onLike(postId, !isCurrentlyLiked);
    }
  };

  const handleComment = (postId: number) => {
    if (onComment) {
      onComment(postId);
    } else {
      console.log('Comment on post:', postId);
    }
  };

  const handleShare = (postId: number) => {
    if (onShare) {
      onShare(postId);
    } else {
      console.log('Share post:', postId);
    }
  };

  const handleMenuClick = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPostMenuClick) {
      onPostMenuClick(postId);
    } else {
      console.log('Post menu clicked:', postId);
    }
  };

  const handleUserClick = (userName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUserClick) {
      onUserClick(userName);
    } else {
      console.log('User clicked:', userName);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {activities.map((activity: SocialActivity) => (
              <div key={activity.id} className="border-b dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={activity.user.avatar} 
                      alt={activity.user.name} 
                      className="h-12 w-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      onClick={(e) => handleUserClick(activity.user.name, e)}
                    />
                    <div>
                      <p 
                        className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline"
                        onClick={(e) => handleUserClick(activity.user.name, e)}
                      >
                        {activity.user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{activity.action} • {activity.user.time}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleMenuClick(activity.id, e)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{activity.content}</p>
                  {activity.image && !activity.link && (
                    <img src={activity.image} alt="Post content" className="w-full h-96 object-cover rounded-lg" />
                  )}
                </div>

                <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
                  <button
                    onClick={() => toggleLike(activity.id)}
                    className={\`flex items-center gap-2 transition-colors \${likedPosts.includes(activity.id) ? 'text-red-500' : 'hover:text-red-500'}\`}
                  >
                    <Heart className={\`h-5 w-5 \${likedPosts.includes(activity.id) ? 'fill-red-500' : ''}\`} />
                    <span className="text-sm">{activity.likes + (likedPosts.includes(activity.id) ? 1 : 0)}</span>
                  </button>
                  <button 
                    onClick={() => handleComment(activity.id)}
                    className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{activity.comments}</span>
                  </button>
                  <button 
                    onClick={() => handleShare(activity.id)}
                    className="flex items-center gap-2 hover:text-green-500 transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm">{activity.shares}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialFeed;
    `,

    timelineFeed: `
${commonImports}
import { Clock, Circle } from 'lucide-react';

interface TimelineEvent {
  id: number;
  time: string;
  date: string;
  title: string;
  description: string;
  status: string;
  color: string;
}

interface TimelineFeedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const TimelineFeed: React.FC<TimelineFeedProps> = ({ ${dataName}, className }) => {
  const sourceData = ${dataName} || {};
  
  const title = ${getField('timelineTitle')};
  const subtitle = ${getField('timelineSubtitle')};
  const badgeText = ${getField('badgeText')};
  const events = ${getField('timelineEvents')};
  const statusCompleted = ${getField('statusCompleted')};
  const statusInProgress = ${getField('statusInProgress')};

  const groupedEvents = events.reduce((acc: any, event: TimelineEvent) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                {title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-600">{badgeText}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([date, dateEvents]: [string, any]) => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{date}</h3>
                <div className="relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />

                  <div className="space-y-6">
                    {dateEvents.map((event: TimelineEvent) => (
                      <div key={event.id} className="relative pl-10">
                        <div className={\`absolute left-0 top-1 h-8 w-8 rounded-full bg-\${event.color}-500 flex items-center justify-center shadow-lg\`}>
                          <Circle className="h-3 w-3 text-white fill-white" />
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{event.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
                            </div>
                            <span className={\`px-3 py-1 rounded-full text-xs font-medium \${
                              event.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }\`}>
                              {event.status === 'completed' ? statusCompleted : statusInProgress}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-3">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimelineFeed;
    `
  };

  return variants[variant] || variants.compactFeed;
};
