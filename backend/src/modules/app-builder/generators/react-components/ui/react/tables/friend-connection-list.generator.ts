import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFriendConnectionList = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'list' | 'cards' = 'grid'
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
    grid: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, MessageCircle, UserMinus, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Connection {
  id: number;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
  isOnline: boolean;
  profession: string;
}

interface FriendConnectionListProps {
  ${dataName}?: any;
  className?: string;
  onMessage?: (connectionId: number) => void;
  onRemove?: (connectionId: number) => void;
  onViewProfile?: (connectionId: number) => void;
}

export default function FriendConnectionList({
  ${dataName},
  className,
  onMessage,
  onRemove,
  onViewProfile
}: FriendConnectionListProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const connectionData = ${dataName} || fetchedData || {};
  const [searchQuery, setSearchQuery] = useState('');

  const title = ${getField('title')};
  const connections: Connection[] = ${getField('connections')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const messageButton = ${getField('messageButton')};
  const removeButton = ${getField('removeButton')};
  const mutualFriendsLabel = ${getField('mutualFriendsLabel')};
  const mutualFriendLabel = ${getField('mutualFriendLabel')};
  const noResultsLabel = ${getField('noResultsLabel')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 p-6 flex justify-center items-center min-h-[200px]", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 p-6 text-center", className)}>
        <p className="text-red-500">Failed to load connections</p>
      </div>
    );
  }

  const filteredConnections = connections.filter((conn: Connection) =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessage = (id: number) => {
    if (onMessage) {
      onMessage(id);
    }
  };

  const handleRemove = (id: number) => {
    if (onRemove) {
      onRemove(id);
    }
  };

  const handleViewProfile = (id: number) => {
    if (onViewProfile) {
      onViewProfile(id);
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
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

      {/* Grid */}
      <div className="p-6">
        {filteredConnections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnections.map((connection: Connection) => (
              <div
                key={connection.id}
                className="relative group bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleViewProfile(connection.id)}
              >
                {/* Online Status */}
                {connection.isOnline && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-700" />
                )}

                <div className="flex flex-col items-center text-center">
                  <img
                    src={connection.avatar}
                    alt={connection.name}
                    className="w-20 h-20 rounded-full object-cover mb-3"
                  />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{connection.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{connection.profession}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <Users className="w-3 h-3" />
                    <span>
                      {connection.mutualFriends} {connection.mutualFriends === 1 ? mutualFriendLabel : mutualFriendsLabel}
                    </span>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessage(connection.id);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(connection.id);
                      }}
                      className="dark:border-gray-600 dark:text-gray-300"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">{noResultsLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
    `,

    list: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, MessageCircle, UserMinus, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Connection {
  id: number;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
  isOnline: boolean;
  profession: string;
}

interface FriendConnectionListProps {
  ${dataName}?: any;
  className?: string;
  onMessage?: (connectionId: number) => void;
  onRemove?: (connectionId: number) => void;
}

export default function FriendConnectionList({
  ${dataName},
  className,
  onMessage,
  onRemove
}: FriendConnectionListProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const connectionData = ${dataName} || fetchedData || {};
  const [searchQuery, setSearchQuery] = useState('');

  const title = ${getField('title')};
  const connections: Connection[] = ${getField('connections')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const messageButton = ${getField('messageButton')};
  const removeButton = ${getField('removeButton')};
  const mutualFriendsLabel = ${getField('mutualFriendsLabel')};
  const mutualFriendLabel = ${getField('mutualFriendLabel')};
  const onlineLabel = ${getField('onlineLabel')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 p-6 flex justify-center items-center min-h-[200px]", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 p-6 text-center", className)}>
        <p className="text-red-500">Failed to load connections</p>
      </div>
    );
  }

  const filteredConnections = connections.filter((conn: Connection) =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessage = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMessage) {
      onMessage(id);
    }
  };

  const handleRemove = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(id);
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
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

      {/* List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredConnections.map((connection: Connection) => (
          <div
            key={connection.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={connection.avatar}
                  alt={connection.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                {connection.isOnline && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">{connection.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{connection.username}</p>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Users className="w-3 h-3" />
                    <span>
                      {connection.mutualFriends} {connection.mutualFriends === 1 ? mutualFriendLabel : mutualFriendsLabel}
                    </span>
                  </div>
                  {connection.isOnline && (
                    <span className="text-xs text-green-600 dark:text-green-400">{onlineLabel}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={(e) => handleMessage(connection.id, e)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {messageButton}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => handleRemove(connection.id, e)}
                  className="dark:border-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-600"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
    `,

    cards: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, MessageCircle, UserMinus, Users, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Connection {
  id: number;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
  isOnline: boolean;
  profession: string;
}

interface FriendConnectionListProps {
  ${dataName}?: any;
  className?: string;
  onMessage?: (connectionId: number) => void;
  onRemove?: (connectionId: number) => void;
  onViewProfile?: (connectionId: number) => void;
}

export default function FriendConnectionList({
  ${dataName},
  className,
  onMessage,
  onRemove,
  onViewProfile
}: FriendConnectionListProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const connectionData = ${dataName} || fetchedData || {};
  const [searchQuery, setSearchQuery] = useState('');

  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const connections: Connection[] = ${getField('connections')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const messageButton = ${getField('messageButton')};
  const viewProfileButton = ${getField('viewProfileButton')};
  const mutualFriendsLabel = ${getField('mutualFriendsLabel')};
  const mutualFriendLabel = ${getField('mutualFriendLabel')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 p-6 flex justify-center items-center min-h-[200px]", className)}>
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("bg-white dark:bg-gray-800 p-6 text-center", className)}>
        <p className="text-red-500">Failed to load connections</p>
      </div>
    );
  }

  const filteredConnections = connections.filter((conn: Connection) =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMessage = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMessage) {
      onMessage(id);
    }
  };

  const handleViewProfile = (id: number) => {
    if (onViewProfile) {
      onViewProfile(id);
    }
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow-sm", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
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

      {/* Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConnections.map((connection: Connection) => (
            <div
              key={connection.id}
              onClick={() => handleViewProfile(connection.id)}
              className="relative group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-600"
            >
              {/* Online Status */}
              {connection.isOnline && (
                <div className="absolute top-3 right-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={connection.avatar}
                    alt={connection.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {connection.name}
                    </h3>
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{connection.profession}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">{connection.username}</p>

                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-4">
                    <Users className="w-3 h-3" />
                    <span>
                      {connection.mutualFriends} {connection.mutualFriends === 1 ? mutualFriendLabel : mutualFriendsLabel}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => handleMessage(connection.id, e)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {messageButton}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProfile(connection.id);
                      }}
                      className="flex-1 dark:border-gray-600 dark:text-gray-300"
                    >
                      {viewProfileButton}
                    </Button>
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
    `
  };

  return variants[variant] || variants.grid;
};
