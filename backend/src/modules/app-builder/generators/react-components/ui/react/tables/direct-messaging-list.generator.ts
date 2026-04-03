import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDirectMessagingList = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'detailed' | 'sidebar' = 'compact'
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

  const variants = {
    compact: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Pin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: number;
  contact: {
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  isPinned: boolean;
}

interface DirectMessagingListProps {
  ${dataName}?: any;
  className?: string;
  onConversationClick?: (conversationId: number) => void;
}

export default function DirectMessagingList({
  ${dataName},
  className,
  onConversationClick
}: DirectMessagingListProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const messagingData = ${dataName} || fetchedData || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const conversations: Conversation[] = ${getField('conversations')};
  const searchPlaceholder = ${getField('searchPlaceholder')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 h-full flex justify-center items-center", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 h-full flex justify-center items-center", className)}>
        <p className="text-red-500 text-sm">Failed to load conversations</p>
      </div>
    );
  }

  const filteredConversations = conversations
    .filter((conv: Conversation) =>
      conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: Conversation, b: Conversation) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const handleConversationClick = (id: number) => {
    setSelectedId(id);
    if (onConversationClick) {
      onConversationClick(id);
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 h-full flex flex-col", className)}>
      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv: Conversation) => (
          <div
            key={conv.id}
            onClick={() => handleConversationClick(conv.id)}
            className={cn(
              "flex items-center gap-3 p-3 cursor-pointer transition-all hover:scale-[1.02]",
              selectedId === conv.id
                ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-blue-600 shadow-lg"
                : "hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            <div className="relative">
              <img
                src={conv.contact.avatar}
                alt={conv.contact.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 shadow-md"
              />
              {conv.contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white dark:border-gray-800 shadow-lg" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {conv.contact.name}
                  </h3>
                  {conv.isPinned && (
                    <Pin className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 font-medium">
                  {conv.lastMessage.timestamp}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className={cn(
                  "text-sm truncate",
                  conv.lastMessage.isRead
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-gray-900 dark:text-white font-bold"
                )}>
                  {conv.lastMessage.text}
                </p>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 flex-shrink-0 w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
    `,

    detailed: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Pin, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: number;
  contact: {
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  isPinned: boolean;
}

interface DirectMessagingListProps {
  ${dataName}?: any;
  className?: string;
  onConversationClick?: (conversationId: number) => void;
}

export default function DirectMessagingList({
  ${dataName},
  className,
  onConversationClick
}: DirectMessagingListProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const messagingData = ${dataName} || fetchedData || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const title = ${getField('title')};
  const conversations: Conversation[] = ${getField('conversations')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const pinnedLabel = ${getField('pinnedLabel')};
  const onlineLabel = ${getField('onlineLabel')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full flex justify-center items-center", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full flex justify-center items-center", className)}>
        <p className="text-red-500 text-sm">Failed to load conversations</p>
      </div>
    );
  }

  const filteredConversations = conversations
    .filter((conv: Conversation) =>
      conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: Conversation, b: Conversation) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const pinnedConversations = filteredConversations.filter((conv: Conversation) => conv.isPinned);
  const otherConversations = filteredConversations.filter((conv: Conversation) => !conv.isPinned);

  const handleConversationClick = (id: number) => {
    setSelectedId(id);
    if (onConversationClick) {
      onConversationClick(id);
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned */}
        {pinnedConversations.length > 0 && (
          <div className="mb-2">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Pin className="w-3 h-3" />
              {pinnedLabel}
            </div>
            {pinnedConversations.map((conv: Conversation) => (
              <div
                key={conv.id}
                onClick={() => handleConversationClick(conv.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                  selectedId === conv.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <div className="relative">
                  <img
                    src={conv.contact.avatar}
                    alt={conv.contact.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {conv.contact.isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {conv.contact.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {conv.lastMessage.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      "text-sm truncate",
                      conv.lastMessage.isRead
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-gray-900 dark:text-white font-medium"
                    )}>
                      {conv.lastMessage.text}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.contact.isOnline && (
                    <div className="flex items-center gap-1 mt-1">
                      <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">{onlineLabel}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Other Conversations */}
        {otherConversations.map((conv: Conversation) => (
          <div
            key={conv.id}
            onClick={() => handleConversationClick(conv.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
              selectedId === conv.id
                ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600"
                : "hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            <div className="relative">
              <img
                src={conv.contact.avatar}
                alt={conv.contact.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              {conv.contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {conv.contact.name}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {conv.lastMessage.timestamp}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className={cn(
                  "text-sm truncate",
                  conv.lastMessage.isRead
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-gray-900 dark:text-white font-medium"
                )}>
                  {conv.lastMessage.text}
                </p>
                {conv.unreadCount > 0 && (
                  <span className="ml-2 flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
    `,

    sidebar: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, MoreVertical, Pin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: number;
  contact: {
    name: string;
    avatar: string;
    isOnline: boolean;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  isPinned: boolean;
}

interface DirectMessagingListProps {
  ${dataName}?: any;
  className?: string;
  onConversationClick?: (conversationId: number) => void;
}

export default function DirectMessagingList({
  ${dataName},
  className,
  onConversationClick
}: DirectMessagingListProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const messagingData = ${dataName} || fetchedData || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const title = ${getField('title')};
  const conversations: Conversation[] = ${getField('conversations')};
  const searchPlaceholder = ${getField('searchPlaceholder')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex justify-center items-center w-80", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex justify-center items-center w-80", className)}>
        <p className="text-red-500 text-sm">Failed to load conversations</p>
      </div>
    );
  }

  const filteredConversations = conversations
    .filter((conv: Conversation) =>
      conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: Conversation, b: Conversation) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  const handleConversationClick = (id: number) => {
    setSelectedId(id);
    if (onConversationClick) {
      onConversationClick(id);
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col w-80", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv: Conversation) => (
          <div
            key={conv.id}
            onClick={() => handleConversationClick(conv.id)}
            className={cn(
              "relative flex items-center gap-3 p-3 cursor-pointer transition-all",
              selectedId === conv.id
                ? "bg-blue-50 dark:bg-blue-900/20"
                : "hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            {selectedId === conv.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
            )}

            <div className="relative flex-shrink-0">
              <img
                src={conv.contact.avatar}
                alt={conv.contact.name}
                className="w-11 h-11 rounded-full object-cover"
              />
              {conv.contact.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {conv.contact.name}
                  </h3>
                  {conv.isPinned && (
                    <Pin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                  {conv.lastMessage.timestamp}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className={cn(
                  "text-xs truncate",
                  conv.lastMessage.isRead
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-gray-900 dark:text-white font-medium"
                )}>
                  {conv.lastMessage.text}
                </p>
                {conv.unreadCount > 0 && (
                  <span className="flex-shrink-0 min-w-[18px] h-4.5 px-1.5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.compact;
};
