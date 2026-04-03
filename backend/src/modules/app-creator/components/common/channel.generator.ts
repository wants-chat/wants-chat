/**
 * Channel Generator
 *
 * Generates channel-related components:
 * - ChannelHeader: Display channel info with actions
 * - ChannelTabs: Navigate between channel sections
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';

export interface ChannelHeaderOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  showSubscribe?: boolean;
  showNotification?: boolean;
  showShare?: boolean;
  showSettings?: boolean;
}

export interface ChannelTabsOptions {
  componentName?: string;
  tabs?: Array<{ key: string; label: string; icon?: string }>;
  defaultTab?: string;
  variant?: 'underline' | 'pills' | 'boxed';
}

/**
 * Generate a ChannelHeader component
 */
export function generateChannelHeader(options: ChannelHeaderOptions = {}): string {
  const {
    componentName = 'ChannelHeader',
    entity = 'channel',
    showSubscribe = true,
    showNotification = true,
    showShare = true,
    showSettings = false,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const endpoint = options.endpoint || `/${tableName}`;
  const queryKey = options.queryKey || tableName;

  return `import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  Bell,
  BellOff,
  Share2,
  Settings,
  Users,
  CheckCircle,
  Loader2,
  MoreVertical,
  ExternalLink,
  Copy,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Channel {
  id: string;
  name: string;
  handle?: string;
  avatar?: string;
  banner?: string;
  description?: string;
  subscriberCount?: number;
  videoCount?: number;
  isVerified?: boolean;
  isSubscribed?: boolean;
  notificationsEnabled?: boolean;
}

interface ${componentName}Props {
  channel?: Channel;
  channelId?: string;
  className?: string;
  onSubscribe?: (subscribed: boolean) => void;
  onNotificationToggle?: (enabled: boolean) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  channel: propChannel,
  channelId: propChannelId,
  className,
  onSubscribe,
  onNotificationToggle,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const channelId = propChannelId || paramId;
  const queryClient = useQueryClient();

  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: fetchedChannel, isLoading } = useQuery({
    queryKey: ['${queryKey}', channelId],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/\${channelId}\`);
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch channel:', err);
        return null;
      }
    },
    enabled: !propChannel && !!channelId,
  });

  const channel = propChannel || fetchedChannel;

  const subscribeMutation = useMutation({
    mutationFn: async (subscribe: boolean) => {
      if (subscribe) {
        await api.post(\`${endpoint}/\${channelId}/subscribe\`, {});
      } else {
        await api.delete(\`${endpoint}/\${channelId}/subscribe\`);
      }
      return subscribe;
    },
    onSuccess: (subscribed) => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}', channelId] });
      onSubscribe?.(subscribed);
    },
  });

  const notificationMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      await api.put(\`${endpoint}/\${channelId}/notifications\`, { enabled });
      return enabled;
    },
    onSuccess: (enabled) => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}', channelId] });
      onNotificationToggle?.(enabled);
    },
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
    setShowShareMenu(false);
  };

  const formatCount = (count?: number) => {
    if (!count) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-gray-500 dark:text-gray-400">Channel not found</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Banner */}
      {channel.banner ? (
        <div className="relative h-48 rounded-xl overflow-hidden">
          <img
            src={channel.banner}
            alt={channel.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl" />
      )}

      {/* Channel Info */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {channel.avatar ? (
            <img
              src={channel.avatar}
              alt={channel.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
              {channel.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {channel.name}
            </h1>
            {channel.isVerified && (
              <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
            )}
          </div>

          {channel.handle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              @{channel.handle}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {formatCount(channel.subscriberCount)} subscribers
            </span>
            {channel.videoCount !== undefined && (
              <span>{formatCount(channel.videoCount)} videos</span>
            )}
          </div>

          {channel.description && (
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {channel.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          ${showSubscribe ? `<button
            onClick={() => subscribeMutation.mutate(!channel.isSubscribed)}
            disabled={subscribeMutation.isPending}
            className={cn(
              'px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2',
              channel.isSubscribed
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                : 'bg-red-600 text-white hover:bg-red-700'
            )}
          >
            {subscribeMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : channel.isSubscribed ? (
              'Subscribed'
            ) : (
              'Subscribe'
            )}
          </button>` : ''}

          ${showNotification ? `{channel.isSubscribed && (
            <button
              onClick={() => notificationMutation.mutate(!channel.notificationsEnabled)}
              disabled={notificationMutation.isPending}
              className={cn(
                'p-2 rounded-full transition-colors',
                channel.notificationsEnabled
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
              )}
              title={channel.notificationsEnabled ? 'Notifications on' : 'Notifications off'}
            >
              {notificationMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : channel.notificationsEnabled ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </button>
          )}` : ''}

          ${showShare ? `<div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            {showShareMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
                <div className="absolute right-0 top-12 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                  <button
                    onClick={() => window.open(\`https://twitter.com/intent/tweet?url=\${encodeURIComponent(window.location.href)}\`, '_blank')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Share on Twitter
                  </button>
                </div>
              </>
            )}
          </div>` : ''}

          ${showSettings ? `<button
            onClick={() => {}}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>` : ''}

          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            {showMoreMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} />
                <div className="absolute right-0 top-12 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                  <button
                    onClick={() => setShowMoreMenu(false)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    Report channel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a ChannelTabs component
 */
export function generateChannelTabs(options: ChannelTabsOptions = {}): string {
  const {
    componentName = 'ChannelTabs',
    tabs = [
      { key: 'home', label: 'Home', icon: 'Home' },
      { key: 'videos', label: 'Videos', icon: 'Video' },
      { key: 'playlists', label: 'Playlists', icon: 'List' },
      { key: 'community', label: 'Community', icon: 'MessageSquare' },
      { key: 'about', label: 'About', icon: 'Info' },
    ],
    defaultTab = 'home',
    variant = 'underline',
  } = options;

  const icons = [...new Set(tabs.filter(t => t.icon).map(t => t.icon!))];

  const variantStyles = {
    underline: {
      container: 'border-b border-gray-200 dark:border-gray-700',
      tab: 'px-4 py-3 border-b-2 -mb-px',
      active: 'border-blue-600 text-blue-600 dark:text-blue-400',
      inactive: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300',
    },
    pills: {
      container: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-lg',
      tab: 'px-4 py-2 rounded-md',
      active: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm',
      inactive: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
    },
    boxed: {
      container: 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1',
      tab: 'px-4 py-2 rounded-md',
      active: 'bg-blue-600 text-white',
      inactive: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
    },
  };

  const styles = variantStyles[variant];

  return `import React, { useState } from 'react';
import { ${icons.join(', ')} } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Tab {
  key: string;
  label: string;
  icon?: string;
  count?: number;
}

interface ${componentName}Props {
  tabs?: Tab[];
  activeTab?: string;
  onChange?: (tab: string) => void;
  className?: string;
  children?: React.ReactNode;
}

const iconMap: Record<string, React.FC<any>> = {
  ${icons.map(icon => `${icon}: ${icon}`).join(',\n  ')},
};

const ${componentName}: React.FC<${componentName}Props> = ({
  tabs: propTabs,
  activeTab: controlledActiveTab,
  onChange,
  className,
  children,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState('${defaultTab}');

  const activeTab = controlledActiveTab ?? internalActiveTab;
  const tabs = propTabs || ${JSON.stringify(tabs)};

  const handleTabChange = (key: string) => {
    if (onChange) {
      onChange(key);
    } else {
      setInternalActiveTab(key);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="${styles.container}">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon ? iconMap[tab.icon] : null;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  '${styles.tab} font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2',
                  isActive ? '${styles.active}' : '${styles.inactive}'
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {children && (
        <div className="py-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate channel components for a specific domain
 */
export function generateChannelComponents(domain: string): { header: string; tabs: string } {
  const pascalDomain = pascalCase(domain);

  return {
    header: generateChannelHeader({
      componentName: `${pascalDomain}ChannelHeader`,
      entity: domain,
    }),
    tabs: generateChannelTabs({
      componentName: `${pascalDomain}ChannelTabs`,
    }),
  };
}
