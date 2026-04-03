import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSocialPostCard = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'standard' | 'detailed' = 'standard'
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

  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'posts'}`;
  };
  const apiRoute = getApiRoute();
  const entity = dataSource || 'posts';

  const variants = {
    compact: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Heart, MessageCircle, Share2, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialPostCardProps {
  ${dataName}?: any;
  className?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function SocialPostCard({ ${dataName}: propData, className, onLike, onComment, onShare }: SocialPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const postData = ${dataName} || {};

  const author = ${getField('author')};
  const content = ${getField('content')};
  const timestamp = ${getField('timestamp')};
  const likes = ${getField('likes')};
  const comments = ${getField('comments')};
  const shares = ${getField('shares')};

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike();
  };

  const handleComment = () => {
    if (onComment) onComment();
  };

  const handleShare = () => {
    if (onShare) onShare();
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors", className)}>
      <div className="flex gap-3">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {author.name}
            </span>
            {author.verified && (
              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
            <span className="text-gray-500 dark:text-gray-400 text-sm">• {timestamp}</span>
          </div>
          <p className="text-gray-900 dark:text-white text-sm mb-2 line-clamp-3">{content}</p>

          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-110",
                isLiked
                  ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-pink-50 dark:hover:bg-pink-900/20"
              )}
            >
              <Heart className={cn("w-4 h-4 transition-all duration-300", isLiked && "fill-current")} />
              <span className="text-xs font-semibold">{likes + (isLiked ? 1 : 0)}</span>
            </button>
            <button
              onClick={handleComment}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-110"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">{comments}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 hover:scale-110"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-semibold">{shares}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    standard: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialPostCardProps {
  ${dataName}?: any;
  className?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onMenuClick?: () => void;
}

export default function SocialPostCard({ ${dataName}: propData, className, onLike, onComment, onShare, onBookmark, onMenuClick }: SocialPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const postData = ${dataName} || {};

  const author = ${getField('author')};
  const content = ${getField('content')};
  const timestamp = ${getField('timestamp')};
  const image = ${getField('image')};
  const likes = ${getField('likes')};
  const comments = ${getField('comments')};
  const shares = ${getField('shares')};
  const showMoreLabel = ${getField('showMoreLabel')};
  const showLessLabel = ${getField('showLessLabel')};

  const shouldTruncate = content.length > 200;

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmark) onBookmark();
  };

  const handleComment = () => {
    if (onComment) onComment();
  };

  const handleShare = () => {
    if (onShare) onShare();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMenuClick) onMenuClick();
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4", className)}>
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900 dark:text-white">
                {author.name}
              </span>
              {author.verified && (
                <CheckCircle className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{author.username}</span>
              <span>•</span>
              <span>{timestamp}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleMenuClick}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-3">
        <p className="text-gray-900 dark:text-white whitespace-pre-line">
          {shouldTruncate && !showFullContent ? \`\${content.slice(0, 200)}...\` : content}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-1"
          >
            {showFullContent ? showLessLabel : showMoreLabel}
          </button>
        )}
      </div>

      {/* Post Media */}
      {image && (
        <img
          src={image}
          alt="Post content"
          className="w-full rounded-lg mb-3 object-cover max-h-96"
        />
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 gap-2">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-110",
            isLiked
              ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20"
          )}
        >
          <Heart className={cn("w-5 h-5 transition-all duration-300", isLiked && "fill-current")} />
          <span className="text-sm font-semibold">{likes + (isLiked ? 1 : 0)}</span>
        </button>

        <button
          onClick={handleComment}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">{comments}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 hover:scale-110"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-semibold">{shares}</span>
        </button>

        <button
          onClick={handleBookmark}
          className={cn(
            "p-2 rounded-full transition-all duration-300 hover:scale-110",
            isBookmarked
              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          )}
        >
          <Bookmark className={cn("w-5 h-5 transition-all duration-300", isBookmarked && "fill-current")} />
        </button>
      </div>
    </div>
  );
}
    `,

    detailed: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialPostCardProps {
  ${dataName}?: any;
  className?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onMenuClick?: () => void;
  onViewThread?: () => void;
}

export default function SocialPostCard({ ${dataName}: propData, className, onLike, onComment, onShare, onBookmark, onMenuClick, onViewThread }: SocialPostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const postData = ${dataName} || {};

  const author = ${getField('author')};
  const content = ${getField('content')};
  const timestamp = ${getField('timestamp')};
  const image = ${getField('image')};
  const likes = ${getField('likes')};
  const comments = ${getField('comments')};
  const shares = ${getField('shares')};
  const bookmarks = ${getField('bookmarks')};
  const replyCount = ${getField('replyCount')};
  const replyPreview = ${getField('replyPreview')};
  const menuOptions = ${getField('menuOptions')};
  const viewThreadLabel = ${getField('viewThreadLabel')};

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike();
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmark) onBookmark();
  };

  const handleComment = () => {
    if (onComment) onComment();
  };

  const handleShare = () => {
    if (onShare) onShare();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleMenuOptionClick = (action: string) => {
    console.log(\`Menu action: \${action}\`);
    setShowMenu(false);
    if (onMenuClick) onMenuClick();
  };

  const handleViewThread = () => {
    if (onViewThread) onViewThread();
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow", className)}>
      {/* Post Header */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <img
            src={author.avatar}
            alt={author.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-gray-900 dark:text-white">
                {author.name}
              </span>
              {author.verified && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{author.username}</span>
              <span>•</span>
              <span>{timestamp}</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              {menuOptions.map((option: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleMenuOptionClick(option.action)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
                    option.danger ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 dark:text-white whitespace-pre-line text-lg leading-relaxed">
          {content}
        </p>
      </div>

      {/* Post Media */}
      {image && (
        <img
          src={image}
          alt="Post content"
          className="w-full object-cover max-h-[500px]"
        />
      )}

      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
        <span>{likes + (isLiked ? 1 : 0)} likes</span>
        <div className="flex items-center gap-4">
          <span>{comments} comments</span>
          <span>{shares} shares</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-around px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            isLiked ? "text-red-500 bg-red-50 dark:bg-red-900/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <Heart className={cn("w-5 h-5", isLiked && "fill-red-500")} />
          <span className="font-medium">Like</span>
        </button>

        <button
          onClick={handleComment}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </button>

        <button
          onClick={handleBookmark}
          className={cn(
            "p-2 rounded-lg transition-colors",
            isBookmarked ? "text-blue-500 bg-blue-50 dark:bg-blue-900/20" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-blue-500")} />
        </button>
      </div>

      {/* Reply Thread Preview */}
      {replyCount > 0 && replyPreview && replyPreview[0] && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-start gap-3">
            <img
              src={replyPreview[0].avatar}
              alt={replyPreview[0].author}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                <span className="font-semibold text-gray-900 dark:text-white">{replyPreview[0].author}</span>
                {' '}{replyPreview[0].content}
              </p>
            </div>
          </div>
          <button
            onClick={handleViewThread}
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            {viewThreadLabel} ({replyCount} replies)
          </button>
        </div>
      )}
    </div>
  );
}
    `
  };

  return variants[variant] || variants.standard;
};
