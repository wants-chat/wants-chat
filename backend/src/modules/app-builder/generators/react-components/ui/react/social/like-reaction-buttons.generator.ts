import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateLikeReactionButtons = (
  resolved: ResolvedComponent,
  variant: 'simple' | 'reactions' | 'animated' = 'simple'
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
    return `/${dataSource || 'reactions'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'reactions';

  const variants = {
    simple: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface LikeReactionButtonsProps {
  ${dataName}?: any;
  className?: string;
  onLike?: (isLiked: boolean) => void;
}

export default function LikeReactionButtons({ ${dataName}: propData, className, onLike }: LikeReactionButtonsProps) {
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch reaction data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Mutation for toggling like
  const likeMutation = useMutation({
    mutationFn: async (liked: boolean) => {
      const response = await api.post<any>('${apiRoute}', { liked });
      return response?.data || response;
    },
    onSuccess: (data, liked) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onLike) onLike(liked);
    },
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const reactionData = ${dataName} || {};
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("flex items-center gap-2 px-4 py-2", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const initialCount = ${getField('likeCount')};
  const likeLabel = ${getField('likeLabel')};
  const likedLabel = ${getField('likedLabel')};

  const displayCount = initialCount + (isLiked ? 1 : 0);

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setIsAnimating(true);

    // Submit via API mutation
    likeMutation.mutate(newLikedState);

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleLike}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
        isLiked
          ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600",
        className
      )}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-all",
          isLiked && "fill-red-600 dark:fill-red-400",
          isAnimating && "scale-125"
        )}
      />
      <span className="font-medium text-sm">
        {isLiked ? likedLabel : likeLabel}
      </span>
      <span className="font-bold text-sm">{displayCount.toLocaleString()}</span>
    </button>
  );
}
    `,

    reactions: `
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Reaction {
  id: string;
  emoji: string;
  label: string;
  count: number;
}

interface LikeReactionButtonsProps {
  ${dataName}?: any;
  className?: string;
  onReact?: (reactionId: string) => void;
  onViewReactions?: () => void;
}

export default function LikeReactionButtons({ ${dataName}: propData, className, onReact, onViewReactions }: LikeReactionButtonsProps) {
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch reaction data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Mutation for reactions
  const reactMutation = useMutation({
    mutationFn: async (reactionId: string) => {
      const response = await api.post<any>('${apiRoute}', { reactionId });
      return response?.data || response;
    },
    onSuccess: (data, reactionId) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onReact) onReact(reactionId);
    },
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const reactionData = ${dataName} || {};
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("inline-block", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const reactions: Reaction[] = ${getField('reactions')};
  const viewAllLabel = ${getField('viewAllLabel')};

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        buttonRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReact = (reactionId: string) => {
    if (userReaction === reactionId) {
      setUserReaction(null);
    } else {
      setUserReaction(reactionId);
    }
    setShowPicker(false);

    // Submit via API mutation
    reactMutation.mutate(reactionId);
  };

  const handleLongPress = () => {
    setShowPicker(true);
  };

  const handleViewAll = () => {
    if (onViewReactions) {
      onViewReactions();
    }
  };

  const totalCount = reactions.reduce((sum, r) => sum + r.count, 0);
  const userReactionData = reactions.find(r => r.id === userReaction);

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        ref={buttonRef}
        onClick={() => handleReact('like')}
        onMouseDown={(e) => {
          const timer = setTimeout(handleLongPress, 500);
          e.currentTarget.dataset.timer = timer.toString();
        }}
        onMouseUp={(e) => {
          const timer = e.currentTarget.dataset.timer;
          if (timer) clearTimeout(Number(timer));
        }}
        onMouseLeave={(e) => {
          const timer = e.currentTarget.dataset.timer;
          if (timer) clearTimeout(Number(timer));
        }}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
          userReaction
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
        )}
      >
        {userReactionData ? (
          <span className="text-lg">{userReactionData.emoji}</span>
        ) : (
          <ThumbsUp className="w-5 h-5" />
        )}
        <span className="font-medium text-sm">
          {userReactionData?.label || 'React'}
        </span>
        <span className="font-bold text-sm">{totalCount.toLocaleString()}</span>
      </button>

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 p-2 flex gap-1"
        >
          {reactions.map((reaction) => (
            <button
              key={reaction.id}
              onClick={() => handleReact(reaction.id)}
              onMouseEnter={() => setHoveredReaction(reaction.id)}
              onMouseLeave={() => setHoveredReaction(null)}
              className={cn(
                "relative w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-125 hover:-translate-y-1",
                userReaction === reaction.id && "bg-blue-50 dark:bg-blue-900/20"
              )}
            >
              <span className="text-2xl">{reaction.emoji}</span>
              {hoveredReaction === reaction.id && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {reaction.label}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Top Reactions Display */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex -space-x-1">
          {reactions.slice(0, 3).map((reaction) => (
            <div
              key={reaction.id}
              className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center"
            >
              <span className="text-sm">{reaction.emoji}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleViewAll}
          className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
        >
          {viewAllLabel}
        </button>
      </div>
    </div>
  );
}
    `,

    animated: `
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface AnimatedReaction {
  id: string;
  emoji: string;
  label: string;
  count: number;
  color: string;
}

interface LikeReactionButtonsProps {
  ${dataName}?: any;
  className?: string;
  onReact?: (reactionId: string) => void;
}

export default function LikeReactionButtons({ ${dataName}: propData, className, onReact }: LikeReactionButtonsProps) {
  const queryClient = useQueryClient();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch reaction data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Mutation for reactions
  const reactMutation = useMutation({
    mutationFn: async (reactionId: string) => {
      const response = await api.post<any>('${apiRoute}', { reactionId });
      return response?.data || response;
    },
    onSuccess: (data, reactionId) => {
      queryClient.invalidateQueries({ queryKey: ['${entity}'] });
      if (onReact) onReact(reactionId);
    },
  });

  // Use prop data if available, otherwise use fetched data
  const ${dataName} = propData || fetchedData || {};

  const reactionData = ${dataName} || {};
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [animatingReactions, setAnimatingReactions] = useState<{id: string; x: number; y: number}[]>([]);

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("relative", className)}>
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const reactions: AnimatedReaction[] = ${getField('animatedReactions')};

  const handleReact = (reactionId: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Toggle reaction
    if (userReaction === reactionId) {
      setUserReaction(null);
    } else {
      setUserReaction(reactionId);

      // Add floating animation
      const animationId = \`\${reactionId}-\${Date.now()}\`;
      setAnimatingReactions(prev => [...prev, { id: animationId, x, y }]);

      setTimeout(() => {
        setAnimatingReactions(prev => prev.filter(anim => anim.id !== animationId));
      }, 1000);
    }

  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-wrap gap-2">
        {reactions.map((reaction) => {
          const isActive = userReaction === reaction.id;
          const displayCount = reaction.count + (isActive ? 1 : 0);

          return (
            <button
              key={reaction.id}
              onClick={(e) => handleReact(reaction.id, e)}
              className={cn(
                "relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-full transition-all transform hover:scale-105",
                isActive
                  ? \`bg-\${reaction.color}-50 dark:bg-\${reaction.color}-900/20 text-\${reaction.color}-600 dark:text-\${reaction.color}-400 shadow-lg\`
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              <span className={cn(
                "text-xl transition-transform",
                isActive && "animate-bounce"
              )}>
                {reaction.emoji}
              </span>
              <span className="font-medium text-sm">{reaction.label}</span>
              <span className="font-bold text-sm">{displayCount.toLocaleString()}</span>

              {/* Ripple effect */}
              {isActive && (
                <span className={cn(
                  "absolute inset-0 bg-\${reaction.color}-400 opacity-0 animate-ping"
                )} />
              )}
            </button>
          );
        })}
      </div>

      {/* Floating emoji animations */}
      {animatingReactions.map((anim) => {
        const reaction = reactions.find(r => anim.id.startsWith(r.id));
        return reaction ? (
          <div
            key={anim.id}
            className="absolute pointer-events-none text-3xl animate-float-up opacity-0"
            style={{
              left: anim.x,
              top: anim.y,
              animation: 'floatUp 1s ease-out'
            }}
          >
            {reaction.emoji}
          </div>
        ) : null;
      })}
</div>
  );
}
    `
  };

  return variants[variant] || variants.simple;
};
