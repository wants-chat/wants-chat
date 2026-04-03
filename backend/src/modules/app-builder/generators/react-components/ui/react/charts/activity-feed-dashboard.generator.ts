import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateActivityFeedDashboard = (
  resolved: ResolvedComponent,
  variant: 'timeline' | 'cards' | 'compact' = 'timeline'
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
    return `/${dataSource || 'activities'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'activities';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, FolderPlus, CheckCircle, MessageSquare, Upload, Target, Edit, Calendar, Filter, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    timeline: `
${commonImports}

interface ActivityItem {
  id: string;
  userAvatar: string;
  userName: string;
  activityType: string;
  activityIcon: string;
  description: string;
  timestamp: string;
  relatedLink: string;
  iconColor: string;
}

interface ActivityType {
  label: string;
  value: string;
}

interface ActivityFeedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  ${dataName}: propData,
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
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

  const sourceData = ${dataName} || {};

  const sectionTitle = ${getField('sectionTitle')};
  const activityItems: ActivityItem[] = ${getField('activityItems')};
  const activityTypes: ActivityType[] = ${getField('activityTypes')};
  const loadMoreLabel = ${getField('loadMoreLabel')};
  const filterLabel = ${getField('filterLabel')};

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [visibleItems, setVisibleItems] = useState(5);

  const iconMap: any = {
    UserPlus,
    FolderPlus,
    CheckCircle,
    MessageSquare,
    Upload,
    Target,
    Edit,
    Calendar
  };

  const filteredItems = selectedFilter === 'all'
    ? activityItems
    : activityItems.filter((item: any) => item.activityType.startsWith(selectedFilter));

  const displayedItems = filteredItems.slice(0, visibleItems);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{sectionTitle}</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {/* Activity items */}
          <div className="space-y-6">
            {displayedItems.map((item: any, index: number) => {
              const Icon = iconMap[item.activityIcon] || UserPlus;

              return (
                <div key={item.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div
                    className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: item.iconColor }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-blue-900/20 dark:to-gray-800 rounded-xl p-4 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {item.userAvatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.userName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {item.description}
                      </p>
                      <a
                        href={item.relatedLink}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                      >
                        View details →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          {visibleItems < filteredItems.length && (
            <div className="text-center mt-6">
              <button
                onClick={() => setVisibleItems(prev => prev + 5)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.05] transition-all duration-300"
              >
                {loadMoreLabel}
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
    `,

    cards: `
${commonImports}

interface ActivityItem {
  id: string;
  userAvatar: string;
  userName: string;
  activityType: string;
  activityIcon: string;
  description: string;
  timestamp: string;
  relatedLink: string;
  iconColor: string;
}

interface ActivityType {
  label: string;
  value: string;
}

interface ActivityFeedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  ${dataName}: propData,
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
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

  const sourceData = ${dataName} || {};

  const sectionTitle = ${getField('sectionTitle')};
  const sectionSubtitle = ${getField('sectionSubtitle')};
  const activityItems: ActivityItem[] = ${getField('activityItems')};
  const activityTypes: ActivityType[] = ${getField('activityTypes')};
  const viewAllLabel = ${getField('viewAllLabel')};

  const [selectedFilter, setSelectedFilter] = useState('all');

  const iconMap: any = {
    UserPlus,
    FolderPlus,
    CheckCircle,
    MessageSquare,
    Upload,
    Target,
    Edit,
    Calendar
  };

  const filteredItems = selectedFilter === 'all'
    ? activityItems
    : activityItems.filter((item: any) => item.activityType.startsWith(selectedFilter));

  return (
    <div className={cn("w-full space-y-6 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6 rounded-3xl", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{sectionTitle}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{sectionSubtitle}</p>
        </div>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {activityTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const Icon = iconMap[item.activityIcon] || UserPlus;

          return (
            <Card key={item.id} className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-blue-900/20 dark:to-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: item.iconColor }}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                        {item.userAvatar}
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.userName}
                      </p>
                    </div>

                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.timestamp}
                      </p>
                      <a
                        href={item.relatedLink}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View →
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.05] transition-all duration-300">
          {viewAllLabel}
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
    `,

    compact: `
${commonImports}

interface ActivityItem {
  id: string;
  userAvatar: string;
  userName: string;
  activityType: string;
  activityIcon: string;
  description: string;
  timestamp: string;
  relatedLink: string;
  iconColor: string;
}

interface ActivityFeedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  ${dataName}: propData,
  className
}) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
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

  const sourceData = ${dataName} || {};

  const sectionTitle = ${getField('sectionTitle')};
  const activityItems: ActivityItem[] = ${getField('activityItems')};
  const viewAllLabel = ${getField('viewAllLabel')};

  const iconMap: any = {
    UserPlus,
    FolderPlus,
    CheckCircle,
    MessageSquare,
    Upload,
    Target,
    Edit,
    Calendar
  };

  return (
    <Card className={cn("w-full rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-800 dark:via-blue-900/10 dark:to-gray-800", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{sectionTitle}</CardTitle>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            {viewAllLabel}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activityItems.map((item) => {
            const Icon = iconMap[item.activityIcon] || UserPlus;

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer border border-gray-200/50 dark:border-gray-700/50"
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: item.iconColor }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.userName}
                    </p>
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.description}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.timestamp}
                  </p>
                </div>

                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                  {item.userAvatar}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
    `
  };

  return variants[variant] || variants.timeline;
};
