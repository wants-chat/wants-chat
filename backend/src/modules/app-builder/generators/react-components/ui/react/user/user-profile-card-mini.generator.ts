import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateUserProfileCardMini = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'hover' | 'detailed' = 'compact'
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
  const entity = dataSource?.split('.').pop() || 'users';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'users'}`;
  };

  const apiRoute = getApiRoute();

  const variants = {
    compact: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfileCardMiniProps {
  ${dataName}?: any;
  className?: string;
  onFollow?: (isFollowing: boolean) => void;
  onUserClick?: () => void;
  onProfileClick?: (data?: any) => void;
}

export default function UserProfileCardMini({ ${dataName}: propData, className, onFollow, onUserClick }: UserProfileCardMiniProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [isFollowing, setIsFollowing] = useState(false);

  const avatar = ${getField('avatar')};
  const name = ${getField('name')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  const username = ${getField('username')};
  const followers = ${getField('followers')};
  const verified = ${getField('verified')};
  const followButton = ${getField('followButton')};
  const followingButton = ${getField('followingButton')};
  const followersLabel = ${getField('followersLabel')};

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFollowing;
    setIsFollowing(newState);
    if (onFollow) {
      onFollow(newState);
    }
  };

  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick();
    }
  };

  return (
    <div className={cn("bg-gradient-to-br from-white to-gray-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm p-4 hover:shadow-2xl transition-all duration-300", className)}>
      <div className="flex items-center gap-3">
        <div className="relative group">
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80 transition-all duration-300 ring-4 ring-blue-200 dark:ring-blue-800 shadow-xl"
            onClick={handleUserClick}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3
              className="font-semibold text-gray-900 dark:text-white text-sm truncate cursor-pointer hover:underline"
              onClick={handleUserClick}
            >
              {name}
            </h3>
            {verified && (
              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{username}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {followers} {followersLabel}
          </p>
        </div>
        <Button
          size="sm"
          variant={isFollowing ? "outline" : "default"}
          className={cn(
            "flex-shrink-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
            isFollowing
              ? "border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500 dark:text-gray-300"
              : "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700"
          )}
          onClick={handleFollow}
        >
          {isFollowing ? followingButton : followButton}
        </Button>
      </div>
    </div>
  );
}
    `,

    hover: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { CheckCircle, MapPin, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfileCardMiniProps {
  ${dataName}?: any;
  className?: string;
  onFollow?: (isFollowing: boolean) => void;
  onMessage?: () => void;
  onUserClick?: () => void;
}

export default function UserProfileCardMini({ ${dataName}: propData, className, onFollow, onMessage, onUserClick }: UserProfileCardMiniProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [isFollowing, setIsFollowing] = useState(false);
  const [showHoverCard, setShowHoverCard] = useState(false);

  const avatar = ${getField('avatar')};
  const name = ${getField('name')};
  const username = ${getField('username')};
  const bio = ${getField('bio')};
  const followers = ${getField('followers')};
  const following = ${getField('following')};
  const location = ${getField('location')};
  const joinedDate = ${getField('joinedDate')};
  const verified = ${getField('verified')};
  const followButton = ${getField('followButton')};
  const followingButton = ${getField('followingButton')};
  const messageButton = ${getField('messageButton')};
  const followersLabel = ${getField('followersLabel')};
  const followingLabel = ${getField('followingLabel')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFollowing;
    setIsFollowing(newState);
    if (onFollow) {
      onFollow(newState);
    }
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMessage) {
      onMessage();
    }
  };

  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick();
    }
  };

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setShowHoverCard(true)}
      onMouseLeave={() => setShowHoverCard(false)}
    >
      {/* Compact card - always visible */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg hover:shadow-xl border-2 border-gray-200 dark:border-gray-700 p-3 transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500 dark:ring-purple-500 shadow-lg"
            onClick={handleUserClick}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3
                className="font-bold text-gray-900 dark:text-white text-sm truncate"
                onClick={handleUserClick}
              >
                {name}
              </h3>
              {verified && (
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">{username}</p>
          </div>
        </div>
      </div>

      {/* Hover card - shows on hover */}
      {showHoverCard && (
        <div className="absolute top-0 left-0 z-50 w-80 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-5 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3 mb-3">
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleUserClick}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <h3
                  className="font-bold text-gray-900 dark:text-white cursor-pointer hover:underline"
                  onClick={handleUserClick}
                >
                  {name}
                </h3>
                {verified && (
                  <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{username}</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{bio}</p>

          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900 dark:text-white">{followers}</span>
              <span className="text-gray-500 dark:text-gray-400">{followersLabel}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900 dark:text-white">{following}</span>
              <span className="text-gray-500 dark:text-gray-400">{followingLabel}</span>
            </div>
          </div>

          <div className="space-y-2 mb-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{joinedDate}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className={cn(
                "flex-1 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-lg hover:scale-105",
                isFollowing
                  ? "border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500 bg-white dark:bg-gray-800"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              )}
              onClick={handleFollow}
            >
              {isFollowing ? followingButton : followButton}
            </button>
            <button
              className="flex-1 px-4 py-2 rounded-full font-bold text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md hover:scale-105"
              onClick={handleMessage}
            >
              {messageButton}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
    `,

    detailed: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserProfileCardMiniProps {
  ${dataName}?: any;
  className?: string;
  onFollow?: (isFollowing: boolean) => void;
  onMessage?: () => void;
  onUserClick?: () => void;
}

export default function UserProfileCardMini({ ${dataName}: propData, className, onFollow, onMessage, onUserClick }: UserProfileCardMiniProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [isFollowing, setIsFollowing] = useState(false);

  const avatar = ${getField('avatar')};
  const name = ${getField('name')};
  const username = ${getField('username')};
  const bioSnippet = ${getField('bioSnippet')};
  const followers = ${getField('followers')};
  const following = ${getField('following')};
  const posts = ${getField('posts')};
  const verified = ${getField('verified')};
  const mutual = ${getField('mutual')};
  const followButton = ${getField('followButton')};
  const followingButton = ${getField('followingButton')};
  const messageButton = ${getField('messageButton')};
  const followersLabel = ${getField('followersLabel')};
  const followingLabel = ${getField('followingLabel')};
  const postsLabel = ${getField('postsLabel')};
  const mutualLabel = ${getField('mutualLabel')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFollowing;
    setIsFollowing(newState);
    if (onFollow) {
      onFollow(newState);
    }
  };

  const handleMessage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMessage) {
      onMessage();
    }
  };

  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick();
    }
  };

  return (
    <div className={cn("bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all", className)}>
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={avatar}
            alt={name}
            className="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity ring-4 ring-blue-500 dark:ring-purple-500 ring-offset-2 dark:ring-offset-gray-800 shadow-xl"
            onClick={handleUserClick}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className="font-bold text-lg text-gray-900 dark:text-white cursor-pointer hover:underline"
                onClick={handleUserClick}
              >
                {name}
              </h3>
              {verified && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">{username}</p>
            {mutual && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold shadow-lg">
                <Users className="w-3 h-3" />
                {mutualLabel}
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 font-medium">
          {bioSnippet}
        </p>

        <div className="flex items-center gap-6 mb-4 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="font-bold text-xl text-gray-900 dark:text-white">{posts}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{postsLabel}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-xl text-gray-900 dark:text-white">{followers}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{followersLabel}</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-xl text-gray-900 dark:text-white">{following}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">{followingLabel}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className={cn(
              "flex-1 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-lg hover:scale-105",
              isFollowing
                ? "border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 hover:text-red-500 bg-white dark:bg-gray-800"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            )}
            onClick={handleFollow}
          >
            {isFollowing ? followingButton : followButton}
          </button>
          <button
            className="flex-1 px-4 py-2 rounded-full font-bold text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md hover:scale-105"
            onClick={handleMessage}
          >
            {messageButton}
          </button>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.compact;
};
