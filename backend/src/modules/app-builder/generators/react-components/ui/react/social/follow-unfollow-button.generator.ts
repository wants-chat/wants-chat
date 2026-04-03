import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFollowUnfollowButton = (
  resolved: ResolvedComponent,
  variant: 'button' | 'icon' | 'text' = 'button'
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
    return `/${dataSource || 'follow'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'follow';

  const variants = {
    button: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserCheck, UserMinus, Check, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface FollowUnfollowButtonProps {
  ${dataName}?: any;
  className?: string;
  initialFollowing?: boolean;
  isMutual?: boolean;
  isPrivate?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export default function FollowUnfollowButton({
  ${dataName}: propData,
  className,
  initialFollowing = false,
  isMutual = false,
  isPrivate = false,
  onFollow,
  onUnfollow
}: FollowUnfollowButtonProps) {
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch follow data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Mutation for follow/unfollow
  const followMutation = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      const response = await api.post<any>('${apiRoute}', { action });
      return response?.data || response;
    },
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (action === 'follow' && onFollow) onFollow();
      if (action === 'unfollow' && onUnfollow) onUnfollow();
    },
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const followData = ${dataName} || {};
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isHovered, setIsHovered] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const followButton = ${getField('followButton')};
  const followingButton = ${getField('followingButton')};
  const unfollowButton = ${getField('unfollowButton')};
  const followBackButton = ${getField('followBackButton')};
  const requestedButton = ${getField('requestedButton')};
  const mutualLabel = ${getField('mutualLabel')};
  const confirmTitle = ${getField('confirmTitle')};
  const confirmMessage = ${getField('confirmMessage')};
  const confirmButton = ${getField('confirmButton')};
  const cancelButton = ${getField('cancelButton')};

  const handleClick = () => {
    if (isFollowing) {
      setShowConfirm(true);
    } else {
      handleFollow();
    }
  };

  const handleFollow = () => {
    if (isPrivate) {
      setIsPending(true);
    } else {
      setIsFollowing(true);
    }
    // Submit via API mutation
    followMutation.mutate('follow');
  };

  const handleUnfollow = () => {
    setIsFollowing(false);
    setIsPending(false);
    setShowConfirm(false);
    // Submit via API mutation
    followMutation.mutate('unfollow');
  };

  const getButtonContent = () => {
    if (isPending) {
      return (
        <>
          <Clock className="w-4 h-4 mr-2" />
          {requestedButton}
        </>
      );
    }

    if (isFollowing) {
      if (isHovered) {
        return (
          <>
            <UserMinus className="w-4 h-4 mr-2" />
            {unfollowButton}
          </>
        );
      }
      return (
        <>
          <UserCheck className="w-4 h-4 mr-2" />
          {followingButton}
        </>
      );
    }

    return (
      <>
        <UserPlus className="w-4 h-4 mr-2" />
        {isMutual ? followBackButton : followButton}
      </>
    );
  };

  return (
    <>
      <div className={cn("flex flex-col items-end gap-1", className)}>
        <Button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "transition-all",
            isFollowing
              ? isHovered
                ? "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
            isPending && "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
          )}
          disabled={isPending}
        >
          {getButtonContent()}
        </Button>
        {isMutual && !isFollowing && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{mutualLabel}</span>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{confirmTitle}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{confirmMessage}</p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirm(false)}
                variant="outline"
                className="flex-1 dark:border-gray-600 dark:text-gray-300"
              >
                {cancelButton}
              </Button>
              <Button
                onClick={handleUnfollow}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {confirmButton}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
    `,

    icon: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserCheck, UserMinus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface FollowUnfollowButtonProps {
  ${dataName}?: any;
  className?: string;
  initialFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export default function FollowUnfollowButton({
  ${dataName}: propData,
  className,
  initialFollowing = false,
  onFollow,
  onUnfollow
}: FollowUnfollowButtonProps) {
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch follow data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Mutation for follow/unfollow
  const followMutation = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      const response = await api.post<any>('${apiRoute}', { action });
      return response?.data || response;
    },
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (action === 'follow' && onFollow) onFollow();
      if (action === 'unfollow' && onUnfollow) onUnfollow();
    },
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const followData = ${dataName} || {};
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isHovered, setIsHovered] = useState(false);

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("p-2 rounded-full bg-gray-100 dark:bg-gray-700", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const handleClick = () => {
    if (isFollowing) {
      setIsFollowing(false);
      // Submit via API mutation
      followMutation.mutate('unfollow');
    } else {
      setIsFollowing(true);
      // Submit via API mutation
      followMutation.mutate('follow');
    }
  };

  const getIcon = () => {
    if (isFollowing) {
      return isHovered ? UserMinus : UserCheck;
    }
    return UserPlus;
  };

  const Icon = getIcon();

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "p-2 rounded-full transition-all",
        isFollowing
          ? isHovered
            ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
          : "bg-blue-600 hover:bg-blue-700 text-white",
        className
      )}
      title={isFollowing ? (isHovered ? 'Unfollow' : 'Following') : 'Follow'}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
    `,

    text: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface FollowUnfollowButtonProps {
  ${dataName}?: any;
  className?: string;
  initialFollowing?: boolean;
  followerCount?: number;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export default function FollowUnfollowButton({
  ${dataName}: propData,
  className,
  initialFollowing = false,
  followerCount = 0,
  onFollow,
  onUnfollow
}: FollowUnfollowButtonProps) {
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch follow data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Mutation for follow/unfollow
  const followMutation = useMutation({
    mutationFn: async (action: 'follow' | 'unfollow') => {
      const response = await api.post<any>('${apiRoute}', { action });
      return response?.data || response;
    },
    onSuccess: (data, action) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (action === 'follow' && onFollow) onFollow();
      if (action === 'unfollow' && onUnfollow) onUnfollow();
    },
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const followData = ${dataName} || {};
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isHovered, setIsHovered] = useState(false);

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
      </div>
    );
  }

  const followButton = ${getField('followButton')};
  const followingButton = ${getField('followingButton')};
  const unfollowButton = ${getField('unfollowButton')};
  const actualFollowerCount = followerCount || ${getField('followerCount')} || 0;

  const handleClick = () => {
    if (isFollowing) {
      setIsFollowing(false);
      // Submit via API mutation
      followMutation.mutate('unfollow');
    } else {
      setIsFollowing(true);
      // Submit via API mutation
      followMutation.mutate('follow');
    }
  };

  const displayCount = actualFollowerCount + (isFollowing ? 1 : 0);

  return (
    <div className={cn("inline-flex flex-col items-start gap-1", className)}>
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "inline-flex items-center gap-1 font-medium text-sm transition-colors",
          isFollowing
            ? isHovered
              ? "text-red-600 dark:text-red-400 hover:underline"
              : "text-gray-600 dark:text-gray-400"
            : "text-blue-600 dark:text-blue-400 hover:underline"
        )}
      >
        {isFollowing ? (
          isHovered ? (
            <>
              <span>{unfollowButton}</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{followingButton}</span>
            </>
          )
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>{followButton}</span>
          </>
        )}
      </button>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {displayCount.toLocaleString()} followers
      </span>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.button;
};
