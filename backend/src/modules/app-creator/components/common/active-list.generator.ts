/**
 * Active List Generator
 *
 * Generates active/live list components for displaying ongoing items:
 * - ActiveJobs: Currently running jobs/tasks
 * - SessionListActive: Active user sessions
 * - EventListUpcoming: Upcoming events
 * - WorkshopListUpcoming: Upcoming workshops
 *
 * Features:
 * - Real-time status indicators
 * - Progress tracking
 * - Time-based sorting
 * - Quick actions
 * - Dark mode support
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface ActiveListItemConfig {
  title: string;
  subtitle?: string;
  status: string;
  progress?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  icon?: string;
  avatar?: string;
  badge?: string;
}

export interface ActiveListOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  endpoint?: string;
  queryKey?: string;
  itemConfig: ActiveListItemConfig;
  variant?: 'jobs' | 'sessions' | 'events' | 'workshops' | 'default';
  showProgress?: boolean;
  showTimer?: boolean;
  showActions?: boolean;
  refreshInterval?: number;
  emptyMessage?: string;
  viewRoute?: string;
  actionLabel?: string;
  onActionEndpoint?: string;
}

/**
 * Generate an active list component
 */
export function generateActiveList(options: ActiveListOptions): string {
  const {
    entity,
    itemConfig,
    variant = 'default',
    showProgress = true,
    showTimer = true,
    showActions = true,
    refreshInterval = 30000,
    emptyMessage,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'ActiveList';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName + '/active';
  const queryKey = options.queryKey || tableName + '_active';
  const viewRoute = options.viewRoute || `/${tableName}/\${id}`;
  const actionLabel = options.actionLabel || 'View';

  // Determine icons based on variant
  const variantIcons: Record<string, string[]> = {
    jobs: ['Play', 'Pause', 'Square', 'RefreshCw', 'CheckCircle', 'AlertCircle'],
    sessions: ['User', 'Monitor', 'Globe', 'Clock', 'LogOut'],
    events: ['Calendar', 'MapPin', 'Users', 'Clock', 'Bell'],
    workshops: ['GraduationCap', 'Users', 'Video', 'Clock', 'BookOpen'],
    default: ['Activity', 'Clock', 'CheckCircle', 'AlertCircle'],
  };

  const baseIcons = ['Loader2', 'MoreVertical', 'Eye', 'RefreshCw', 'X'];
  const icons = [...new Set([...baseIcons, ...variantIcons[variant]])];

  return `import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ${icons.join(', ')} } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  data?: any[];
  className?: string;
  onItemClick?: (item: any) => void;
  onAction?: (item: any, action: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  className,
  onItemClick,
  onAction,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  // Update timer every second for live duration display
  useEffect(() => {
    ${showTimer ? `const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);` : '// Timer disabled'}
  }, []);

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
    refetchInterval: ${refreshInterval},
  });

  ${options.onActionEndpoint ? `const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      await api.post(\`${options.onActionEndpoint}/\${id}/\${action}\`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });` : ''}

  const items = propData && propData.length > 0 ? propData : (fetchedData || []);

  const handleItemClick = (item: any) => {
    if (onItemClick) onItemClick(item);
    else navigate(\`${viewRoute.replace('${id}', '${item.id || item._id}')}\`);
  };

  const handleAction = (item: any, action: string) => {
    if (onAction) onAction(item, action);
    ${options.onActionEndpoint ? `else actionMutation.mutate({ id: item.id || item._id, action });` : ''}
    setOpenMenu(null);
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; pulse?: boolean }> = {
      running: {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <Play className="w-3 h-3" />,
        pulse: true,
      },
      active: {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <Activity className="w-3 h-3" />,
        pulse: true,
      },
      paused: {
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <Pause className="w-3 h-3" />,
      },
      pending: {
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <Clock className="w-3 h-3" />,
      },
      upcoming: {
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <Calendar className="w-3 h-3" />,
      },
      live: {
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <Activity className="w-3 h-3" />,
        pulse: true,
      },
      completed: {
        color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
        icon: <CheckCircle className="w-3 h-3" />,
      },
      failed: {
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <AlertCircle className="w-3 h-3" />,
      },
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : now;
    const diff = Math.max(0, end.getTime() - start.getTime());

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) return \`\${hours}h \${minutes}m\`;
    if (minutes > 0) return \`\${minutes}m \${seconds}s\`;
    return \`\${seconds}s\`;
  };

  const formatTimeUntil = (dateTime: string) => {
    const target = new Date(dateTime);
    const diff = target.getTime() - now.getTime();

    if (diff < 0) return 'Started';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return \`in \${days}d \${hours}h\`;
    if (hours > 0) return \`in \${hours}h \${minutes}m\`;
    return \`in \${minutes}m\`;
  };

  const getVariantIcon = () => {
    ${variant === 'jobs' ? `return <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />;` :
      variant === 'sessions' ? `return <Monitor className="w-5 h-5 text-green-600 dark:text-green-400" />;` :
      variant === 'events' ? `return <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />;` :
      variant === 'workshops' ? `return <GraduationCap className="w-5 h-5 text-orange-600 dark:text-orange-400" />;` :
      `return <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />;`}
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {getVariantIcon()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Active ${displayName}s
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {items.length} active {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {getVariantIcon()}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              ${emptyMessage || `No active ${displayName.toLowerCase()}s`}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item: any) => {
              const itemId = item.id || item._id;
              const statusConfig = getStatusConfig(item.${itemConfig.status});

              return (
                <li
                  key={itemId}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon/Avatar */}
                    ${itemConfig.avatar ? `<div className="flex-shrink-0">
                      {item.${itemConfig.avatar} ? (
                        <img
                          src={item.${itemConfig.avatar}}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                    </div>` : `<div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      {getVariantIcon()}
                    </div>`}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleItemClick(item)}
                          className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate text-left"
                        >
                          {item.${itemConfig.title} || 'Untitled'}
                        </button>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                            statusConfig.color,
                            statusConfig.pulse && 'animate-pulse'
                          )}>
                            {statusConfig.icon}
                            {item.${itemConfig.status}}
                          </span>
                        </div>
                      </div>

                      ${itemConfig.subtitle ? `{item.${itemConfig.subtitle} && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                          {item.${itemConfig.subtitle}}
                        </p>
                      )}` : ''}

                      {/* Progress & Time Info */}
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        ${showProgress && itemConfig.progress ? `{typeof item.${itemConfig.progress} === 'number' && (
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: \`\${Math.min(100, item.${itemConfig.progress})}%\` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.${itemConfig.progress}}%
                            </span>
                          </div>
                        )}` : ''}

                        ${showTimer && itemConfig.startTime ? `<div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            ${variant === 'events' || variant === 'workshops'
                              ? `{formatTimeUntil(item.${itemConfig.startTime})}`
                              : `{formatDuration(item.${itemConfig.startTime}${itemConfig.endTime ? `, item.${itemConfig.endTime}` : ''})}`
                            }
                          </span>
                        </div>` : ''}

                        ${itemConfig.duration ? `{item.${itemConfig.duration} && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Duration: {item.${itemConfig.duration}}
                          </span>
                        )}` : ''}
                      </div>
                    </div>

                    {/* Actions */}
                    ${showActions ? `<div className="flex-shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenu(openMenu === itemId ? null : itemId)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                      {openMenu === itemId && (
                        <div className="absolute right-0 top-10 z-10 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                          <button
                            onClick={() => { handleItemClick(item); setOpenMenu(null); }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" /> ${actionLabel}
                          </button>
                          ${variant === 'jobs' ? `<button
                            onClick={() => handleAction(item, item.${itemConfig.status} === 'running' ? 'pause' : 'resume')}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                          >
                            {item.${itemConfig.status} === 'running' ? (
                              <><Pause className="w-4 h-4" /> Pause</>
                            ) : (
                              <><Play className="w-4 h-4" /> Resume</>
                            )}
                          </button>
                          <button
                            onClick={() => handleAction(item, 'stop')}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <Square className="w-4 h-4" /> Stop
                          </button>` : ''}
                          ${variant === 'sessions' ? `<button
                            onClick={() => handleAction(item, 'terminate')}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" /> End Session
                          </button>` : ''}
                        </div>
                      )}
                    </div>` : ''}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate ActiveJobs component
 */
export function generateActiveJobs(options?: Partial<ActiveListOptions>): string {
  return generateActiveList({
    entity: 'job',
    displayName: 'Job',
    componentName: 'ActiveJobs',
    variant: 'jobs',
    itemConfig: {
      title: 'name',
      subtitle: 'description',
      status: 'status',
      progress: 'progress',
      startTime: 'started_at',
    },
    showProgress: true,
    showTimer: true,
    showActions: true,
    actionLabel: 'View Details',
    onActionEndpoint: '/jobs',
    ...options,
  });
}

/**
 * Generate SessionListActive component
 */
export function generateSessionListActive(options?: Partial<ActiveListOptions>): string {
  return generateActiveList({
    entity: 'session',
    displayName: 'Session',
    componentName: 'SessionListActive',
    variant: 'sessions',
    itemConfig: {
      title: 'user_name',
      subtitle: 'device',
      status: 'status',
      startTime: 'started_at',
      avatar: 'user_avatar',
    },
    showProgress: false,
    showTimer: true,
    showActions: true,
    actionLabel: 'View Session',
    onActionEndpoint: '/sessions',
    ...options,
  });
}

/**
 * Generate EventListUpcoming component
 */
export function generateEventListUpcoming(options?: Partial<ActiveListOptions>): string {
  return generateActiveList({
    entity: 'event',
    displayName: 'Event',
    componentName: 'EventListUpcoming',
    variant: 'events',
    endpoint: '/events/upcoming',
    queryKey: 'events_upcoming',
    itemConfig: {
      title: 'title',
      subtitle: 'location',
      status: 'status',
      startTime: 'start_date',
      endTime: 'end_date',
    },
    showProgress: false,
    showTimer: true,
    showActions: true,
    actionLabel: 'View Event',
    emptyMessage: 'No upcoming events',
    ...options,
  });
}

/**
 * Generate WorkshopListUpcoming component
 */
export function generateWorkshopListUpcoming(options?: Partial<ActiveListOptions>): string {
  return generateActiveList({
    entity: 'workshop',
    displayName: 'Workshop',
    componentName: 'WorkshopListUpcoming',
    variant: 'workshops',
    endpoint: '/workshops/upcoming',
    queryKey: 'workshops_upcoming',
    itemConfig: {
      title: 'title',
      subtitle: 'instructor',
      status: 'status',
      startTime: 'scheduled_at',
      duration: 'duration',
    },
    showProgress: false,
    showTimer: true,
    showActions: true,
    actionLabel: 'View Workshop',
    emptyMessage: 'No upcoming workshops',
    ...options,
  });
}
