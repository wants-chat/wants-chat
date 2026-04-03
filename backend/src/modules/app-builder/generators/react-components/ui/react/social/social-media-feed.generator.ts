import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSocialMediaFeed = (
  resolved: ResolvedComponent,
  variant: 'timeline' | 'grid' | 'masonry' = 'timeline'
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
    return `/${dataSource || 'feed'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'feed';

  const variants = {
    timeline: `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Post {
  id: number;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
}

interface SocialMediaFeedProps {
  ${dataName}?: any;
  className?: string;
  onPostLike?: (postId: number) => void;
  onPostComment?: (postId: number) => void;
  onPostShare?: (postId: number) => void;
  onPostBookmark?: (postId: number) => void;
}

export default function SocialMediaFeed({ ${dataName}: propData, className, onPostLike, onPostComment, onPostShare, onPostBookmark }: SocialMediaFeedProps) {
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
  const sourceData = propData || fetchedData || {};

  const [activeFilter, setActiveFilter] = useState(sourceData?.activeFilter || 'For You');
  const [posts, setPosts] = useState<Post[]>(sourceData?.posts || []);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<number[]>([]);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Update posts when data is fetched
  useEffect(() => {
    if (sourceData?.posts) {
      setPosts(sourceData.posts);
    }
    if (sourceData?.activeFilter) {
      setActiveFilter(sourceData.activeFilter);
    }
  }, [sourceData]);

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("max-w-2xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center", className)}>
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading feed...</span>
        </div>
      </div>
    );
  }

  const filters = ${getField('filters')};
  const newPostsLabel = ${getField('newPostsLabel')};
  const showNewPostsButton = ${getField('showNewPostsButton')};
  const loadMoreButton = ${getField('loadMoreButton')};
  const loadingLabel = ${getField('loadingLabel')};
  const noMorePostsLabel = ${getField('noMorePostsLabel')};

  useEffect(() => {
    const interval = setInterval(() => {
      const randomCount = Math.floor(Math.random() * 5) + 1;
      setNewPostsCount(randomCount);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleLike = (postId: number) => {
    setLikedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
    if (onPostLike) {
      onPostLike(postId);
    }
  };

  const handleBookmark = (postId: number) => {
    setBookmarkedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
    if (onPostBookmark) {
      onPostBookmark(postId);
    }
  };

  const handleComment = (postId: number) => {
    if (onPostComment) {
      onPostComment(postId);
    }
  };

  const handleShare = (postId: number) => {
    if (onPostShare) {
      onPostShare(postId);
    }
  };

  const handleShowNewPosts = () => {
    setNewPostsCount(0);
  };

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setIsLoadingMore(false);
    }, 1500);
  };

  return (
    <div className={cn("max-w-2xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen", className)}>
      {/* Feed Filters */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {filters.map((filter: string) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                activeFilter === filter
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* New Posts Indicator */}
      {newPostsCount > 0 && (
        <div className="sticky top-[49px] z-10 p-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <button
            onClick={handleShowNewPosts}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {showNewPostsButton} • {newPostsCount} {newPostsLabel}
          </button>
        </div>
      )}

      {/* Feed Posts */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {posts.map((post: Post) => (
          <div key={post.id} className="bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {post.author.name}
                    </span>
                    {post.author.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{post.author.username}</span>
                    <span>•</span>
                    <span>{post.timestamp}</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <p className="text-gray-900 dark:text-white mb-3 whitespace-pre-line">{post.content}</p>

            {/* Post Image */}
            {post.image && (
              <img
                src={post.image}
                alt="Post content"
                className="w-full rounded-lg mb-3 object-cover max-h-96"
              />
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handleLike(post.id)}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  likedPosts.includes(post.id)
                    ? "text-red-500"
                    : "text-gray-500 hover:text-red-500"
                )}
              >
                <Heart className={cn("w-5 h-5", likedPosts.includes(post.id) && "fill-red-500")} />
                <span className="text-sm font-medium">
                  {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                </span>
              </button>

              <button
                onClick={() => handleComment(post.id)}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comments}</span>
              </button>

              <button
                onClick={() => handleShare(post.id)}
                className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">{post.shares}</span>
              </button>

              <button
                onClick={() => handleBookmark(post.id)}
                className={cn(
                  "transition-colors",
                  bookmarkedPosts.includes(post.id)
                    ? "text-blue-500"
                    : "text-gray-500 hover:text-blue-500"
                )}
              >
                <Bookmark className={cn("w-5 h-5", bookmarkedPosts.includes(post.id) && "fill-blue-500")} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {isLoadingMore ? loadingLabel : loadMoreButton}
        </Button>
      </div>
    </div>
  );
}
    `,

    grid: `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Post {
  id: number;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
}

interface SocialMediaFeedProps {
  ${dataName}?: any;
  className?: string;
  onPostClick?: (postId: number) => void;
}

export default function SocialMediaFeed({ ${dataName}: propData, className, onPostClick }: SocialMediaFeedProps) {
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
  const sourceData = propData || fetchedData || {};

  const [activeFilter, setActiveFilter] = useState(sourceData?.activeFilter || 'For You');
  const [posts, setPosts] = useState<Post[]>(sourceData?.posts || []);

  // Update posts when data is fetched
  useEffect(() => {
    if (sourceData?.posts) {
      setPosts(sourceData.posts);
    }
    if (sourceData?.activeFilter) {
      setActiveFilter(sourceData.activeFilter);
    }
  }, [sourceData]);

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center", className)}>
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading feed...</span>
        </div>
      </div>
    );
  }

  const filters = sourceData?.filters || ${getField('filters')} || [];

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handlePostClick = (postId: number) => {
    if (onPostClick) {
      onPostClick(postId);
    }
  };

  return (
    <div className={cn("bg-gray-50 dark:bg-gray-900 min-h-screen", className)}>
      {/* Feed Filters */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {filters.map((filter: string) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={cn(
                  "px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                  activeFilter === filter
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Feed */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post: Post) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post.id)}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {post.author.name}
                      </span>
                      {post.author.verified && (
                        <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{post.timestamp}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">
                  {post.content}
                </p>
                <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{post.comments}</span>
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
    `,

    masonry: `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Share2, Bookmark, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Post {
  id: number;
  author: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
}

interface SocialMediaFeedProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SocialMediaFeed({ ${dataName}: propData, className }: SocialMediaFeedProps) {
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
  const sourceData = propData || fetchedData || {};

  const [activeFilter, setActiveFilter] = useState(sourceData?.activeFilter || 'For You');
  const [posts, setPosts] = useState<Post[]>(sourceData?.posts || []);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  // Update posts when data is fetched
  useEffect(() => {
    if (sourceData?.posts) {
      setPosts(sourceData.posts);
    }
    if (sourceData?.activeFilter) {
      setActiveFilter(sourceData.activeFilter);
    }
  }, [sourceData]);

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center", className)}>
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading feed...</span>
        </div>
      </div>
    );
  }

  const filters = sourceData?.filters || ${getField('filters')} || [];

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleLike = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  return (
    <div className={cn("bg-gray-50 dark:bg-gray-900 min-h-screen", className)}>
      {/* Feed Filters */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {filters.map((filter: string) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={cn(
                  "px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                  activeFilter === filter
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Masonry Feed */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {posts.map((post: Post) => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow break-inside-avoid"
            >
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {post.author.name}
                      </span>
                      {post.author.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{post.timestamp}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line">
                  {post.content}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={(e) => handleLike(post.id, e)}
                    className={cn(
                      "flex items-center gap-1 transition-colors",
                      likedPosts.includes(post.id)
                        ? "text-red-500"
                        : "text-gray-500 hover:text-red-500"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", likedPosts.includes(post.id) && "fill-red-500")} />
                    <span className="text-xs">{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-xs">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs">{post.shares}</span>
                  </button>
                  <button className="text-gray-500 hover:text-blue-500 transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
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

  return variants[variant] || variants.timeline;
};
