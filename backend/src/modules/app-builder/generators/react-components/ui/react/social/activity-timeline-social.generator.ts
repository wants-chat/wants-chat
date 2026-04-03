import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateActivityTimelineSocial = (
  resolved: ResolvedComponent,
  variant: 'timeline' | 'feed' | 'compact' = 'timeline'
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
    return `/${dataSource || 'timeline'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'timeline';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    timeline: `
${commonImports}
import { Clock, FileText, Award, MessageCircle, Share2, UserPlus, Heart, ChevronDown, Filter } from 'lucide-react';

interface TimelineEvent {
  id: number;
  type: string;
  icon: string;
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  action: string;
  title: string;
  description: string | null;
  timestamp: string;
  date: string;
  image?: string;
  badge?: string;
  likes?: number;
  comments?: number;
  parentPost?: {
    author: string;
    title: string;
  };
  originalAuthor?: string;
  followedUser?: {
    name: string;
    avatar: string;
  };
}

interface ActivityTimelineProps {
  ${dataName}?: any;
  className?: string;
  onEventClick?: (event: TimelineEvent) => void;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ ${dataName}: propData, className, onEventClick }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch timeline data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const sourceData = ${dataName} || {};

  const title = ${getField('timelineTitle')};
  const subtitle = ${getField('timelineSubtitle')};
  const initialEvents = ${getField('timelineEvents')};
  const loadMoreButton = ${getField('loadMoreButton')};
  const filterByLabel = ${getField('filterByLabel')};
  const allTypesLabel = ${getField('allTypesLabel')};

  React.useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setEvents(initialEvents);
    }
  }, [initialEvents]);

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("flex items-center justify-center py-16", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500">Loading timeline...</span>
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      FileText,
      Award,
      MessageCircle,
      Share2,
      UserPlus,
      Heart
    };
    return icons[iconName] || Clock;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      post: 'blue',
      achievement: 'yellow',
      comment: 'green',
      share: 'purple',
      follow: 'pink',
      like: 'red'
    };
    return colors[type] || 'gray';
  };

  const groupedEvents = events.reduce((acc: any, event: TimelineEvent) => {
    if (!acc[event.date]) {
      acc[event.date] = [];
    }
    acc[event.date].push(event);
    return acc;
  }, {});

  const filteredGroupedEvents = Object.entries(groupedEvents).reduce((acc: any, [date, dateEvents]: [string, any]) => {
    const filtered = dateEvents.filter((event: TimelineEvent) =>
      filter === 'all' || event.type === filter
    );
    if (filtered.length > 0) {
      acc[date] = filtered;
    }
    return acc;
  }, {});

  const eventTypes = ['all', 'post', 'achievement', 'comment', 'share', 'follow', 'like'];

  const handleEventClick = (event: TimelineEvent) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      console.log('Event clicked:', event);
    }
  };

  const handleLoadMore = () => {
    console.log('Load more clicked');
  };

  return (
    <div className={cn("", className)}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <Filter className="h-4 w-4" />
            {filterByLabel}
          </button>
        </div>
        {showFilters && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {eventTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize",
                  filter === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                {type === 'all' ? allTypesLabel : type}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Timeline */}
      <div className="space-y-8">
        {Object.entries(filteredGroupedEvents).map(([date, dateEvents]: [string, any]) => (
          <div key={date}>
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{date}</h3>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

              <div className="space-y-6">
                {dateEvents.map((event: TimelineEvent, index: number) => {
                  const Icon = getIcon(event.icon);
                  const color = getTypeColor(event.type);

                  return (
                    <div key={event.id} className="relative pl-12">
                      {/* Timeline Dot */}
                      <div className={\`absolute left-0 top-2 w-10 h-10 rounded-full bg-\${color}-100 dark:bg-\${color}-900 flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-md\`}>
                        <Icon className={\`h-5 w-5 text-\${color}-600 dark:text-\${color}-400\`} />
                      </div>

                      <Card
                        onClick={() => handleEventClick(event)}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <div className="p-4">
                          {/* Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <img
                              src={event.user.avatar}
                              alt={event.user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 dark:text-white">
                                <span className="font-semibold">{event.user.name}</span>
                                {' '}
                                <span className="text-gray-600 dark:text-gray-400">{event.action}</span>
                                {event.followedUser && (
                                  <>
                                    {' '}
                                    <span className="font-semibold">{event.followedUser.name}</span>
                                  </>
                                )}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {event.timestamp}
                                </span>
                                <Badge variant="secondary" className={\`bg-\${color}-100 text-\${color}-700 dark:bg-\${color}-900 dark:text-\${color}-300 text-xs capitalize\`}>
                                  {event.type}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          {event.title && (
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              {event.title}
                            </h4>
                          )}
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {event.description}
                            </p>
                          )}

                          {/* Image */}
                          {event.image && (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-48 object-cover rounded-lg mb-3"
                            />
                          )}

                          {/* Badge */}
                          {event.badge && (
                            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-3">
                              <img
                                src={event.badge}
                                alt="Achievement badge"
                                className="w-12 h-12 rounded-full"
                              />
                              <div>
                                <p className="font-semibold text-yellow-900 dark:text-yellow-300">
                                  Achievement Unlocked!
                                </p>
                                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                  {event.title}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Parent Post */}
                          {event.parentPost && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3 border-l-4 border-gray-300 dark:border-gray-600">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Replying to {event.parentPost.author}
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {event.parentPost.title}
                              </p>
                            </div>
                          )}

                          {/* Followed User */}
                          {event.followedUser && (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <img
                                src={event.followedUser.avatar}
                                alt={event.followedUser.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {event.followedUser.name}
                              </span>
                            </div>
                          )}

                          {/* Stats */}
                          {(event.likes !== undefined || event.comments !== undefined) && (
                            <div className="flex items-center gap-4 pt-3 border-t dark:border-gray-700">
                              {event.likes !== undefined && (
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                  <Heart className="h-4 w-4" />
                                  <span className="text-sm">{event.likes}</span>
                                </div>
                              )}
                              {event.comments !== undefined && (
                                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                  <MessageCircle className="h-4 w-4" />
                                  <span className="text-sm">{event.comments}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 text-center">
        <button
          onClick={handleLoadMore}
          className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors flex items-center gap-2 mx-auto"
        >
          <ChevronDown className="h-5 w-5" />
          {loadMoreButton}
        </button>
      </div>
    </div>
  );
};

export default ActivityTimeline;
    `,

    feed: `
${commonImports}
import { Clock, FileText, Award, MessageCircle, Share2, UserPlus, Heart, MoreHorizontal } from 'lucide-react';

interface FeedEvent {
  id: number;
  type: string;
  icon: string;
  user: {
    name: string;
    avatar: string;
    username: string;
  };
  action: string;
  title: string;
  description: string | null;
  timestamp: string;
  date: string;
  image?: string;
  likes?: number;
  comments?: number;
}

interface ActivityFeedProps {
  ${dataName}?: any;
  className?: string;
  onEventClick?: (event: FeedEvent) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ ${dataName}: propData, className, onEventClick }) => {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [likedEvents, setLikedEvents] = useState<number[]>([]);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch feed data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const sourceData = ${dataName} || {};

  const title = ${getField('feedTitle')};
  const subtitle = ${getField('feedSubtitle')};
  const initialEvents = ${getField('timelineEvents')};

  React.useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setEvents(initialEvents);
    }
  }, [initialEvents]);

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("max-w-2xl mx-auto flex items-center justify-center py-16", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500">Loading feed...</span>
      </div>
    );
  }

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      FileText,
      Award,
      MessageCircle,
      Share2,
      UserPlus,
      Heart
    };
    return icons[iconName] || Clock;
  };

  const toggleLike = (id: number) => {
    setLikedEvents(prev =>
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
    console.log(\`Event \${id} like toggled\`);
  };

  const handleEventClick = (event: FeedEvent) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      console.log('Event clicked:', event);
    }
  };

  return (
    <div className={cn("max-w-2xl mx-auto", className)}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {events.map((event) => {
          const Icon = getIcon(event.icon);
          const isLiked = likedEvents.includes(event.id);

          return (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={event.user.avatar}
                      alt={event.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {event.user.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Icon className="h-4 w-4" />
                        <span>{event.action}</span>
                        <span>•</span>
                        <span>{event.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreHorizontal className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                {/* Content */}
                <div onClick={() => handleEventClick(event)} className="cursor-pointer">
                  {event.title && (
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {event.title}
                    </h3>
                  )}
                  {event.description && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {event.description}
                    </p>
                  )}
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                    />
                  )}
                </div>

                {/* Actions */}
                {(event.likes !== undefined || event.comments !== undefined) && (
                  <div className="flex items-center gap-6 pt-4 border-t dark:border-gray-700">
                    {event.likes !== undefined && (
                      <button
                        onClick={() => toggleLike(event.id)}
                        className={\`flex items-center gap-2 transition-colors \${
                          isLiked ? 'text-red-600' : 'text-gray-600 dark:text-gray-400 hover:text-red-600'
                        }\`}
                      >
                        <Heart className={\`h-5 w-5 \${isLiked ? 'fill-red-600' : ''}\`} />
                        <span className="text-sm font-medium">
                          {event.likes + (isLiked ? 1 : 0)}
                        </span>
                      </button>
                    )}
                    {event.comments !== undefined && (
                      <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">{event.comments}</span>
                      </button>
                    )}
                    <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors ml-auto">
                      <Share2 className="h-5 w-5" />
                      <span className="text-sm font-medium">Share</span>
                    </button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
    `,

    compact: `
${commonImports}
import { Clock, ChevronRight } from 'lucide-react';

interface CompactEvent {
  id: number;
  type: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  title: string;
  timestamp: string;
}

interface CompactActivityProps {
  ${dataName}?: any;
  className?: string;
  onEventClick?: (event: CompactEvent) => void;
}

const CompactActivity: React.FC<CompactActivityProps> = ({ ${dataName}: propData, className, onEventClick }) => {
  const [events, setEvents] = useState<CompactEvent[]>([]);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch activity data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const sourceData = ${dataName} || {};

  const title = ${getField('compactTitle')};
  const subtitle = ${getField('compactSubtitle')};
  const initialEvents = ${getField('timelineEvents')};
  const viewMoreButton = ${getField('viewMoreButton')};

  React.useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setEvents(initialEvents.slice(0, 5));
    }
  }, [initialEvents]);

  // Loading state
  if (isLoading && !propData) {
    return (
      <Card className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500">Loading...</span>
      </Card>
    );
  }

  const handleEventClick = (event: CompactEvent) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      console.log('Event clicked:', event);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      post: 'blue',
      achievement: 'yellow',
      comment: 'green',
      share: 'purple',
      follow: 'pink',
      like: 'red'
    };
    return colors[type] || 'gray';
  };

  return (
    <Card className={cn("", className)}>
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            {viewMoreButton}
          </button>
        </div>
      </div>

      <div className="divide-y dark:divide-gray-700">
        {events.map((event) => {
          const color = getTypeColor(event.type);

          return (
            <div
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors flex items-center gap-3 group"
            >
              <img
                src={event.user.avatar}
                alt={event.user.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white mb-1">
                  <span className="font-semibold">{event.user.name}</span>
                  {' '}
                  <span className="text-gray-600 dark:text-gray-400">{event.action}</span>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate">
                  {event.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={\`h-1.5 w-1.5 rounded-full bg-\${color}-500\`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {event.timestamp}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CompactActivity;
    `
  };

  return variants[variant] || variants.timeline;
};
