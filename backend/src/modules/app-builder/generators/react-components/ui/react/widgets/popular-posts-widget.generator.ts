import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePopularPostsWidget = (
  resolved: ResolvedComponent,
  variant: 'numbered' | 'thumbnails' | 'minimal' = 'numbered'
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

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';`;

  const variants = {
    numbered: `
${commonImports}
import { TrendingUp, Eye, MessageCircle, Clock, ChevronRight, Loader2 } from 'lucide-react';

interface PopularPost {
  id: number;
  title: string;
  views: number;
  comments: number;
  readTime: string;
  rank: number;
}

interface NumberedPopularPostsProps {
  ${dataName}?: any;
  className?: string;
  onPostClick?: (postId: number) => void;
  onViewAll?: () => void;
  limit?: number;
}

const NumberedPopularPosts: React.FC<NumberedPopularPostsProps> = ({
  ${dataName}: propData,
  className,
  onPostClick,
  onViewAll,
  limit = 5
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
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

  const blogData = ${dataName} || {};

  const title = ${getField('numberedTitle')};
  const subtitle = ${getField('numberedSubtitle')};
  const posts = ${getField('posts')};
  const viewAllButton = ${getField('viewAllButton')};

  const handlePostClick = (postId: number) => {
    if (onPostClick) {
      onPostClick(postId);
    } else {
      console.log('Post clicked:', postId);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      console.log('View all clicked');
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.slice(0, limit).map((post: PopularPost) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post.id)}
              className="flex gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-3 -m-3 rounded-lg transition-colors group"
            >
              {/* Rank Number */}
              <div className={\`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-colors \${
                post.rank === 1
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                  : post.rank === 2
                  ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800'
                  : post.rank === 3
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }\`}>
                {post.rank}
              </div>

              {/* Post Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h4>

                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{(post.views / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 self-center" />
            </div>
          ))}
        </div>

        {posts.length > limit && (
          <button
            onClick={handleViewAll}
            className="w-full mt-4 py-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            {viewAllButton}
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default NumberedPopularPosts;
    `,

    thumbnails: `
${commonImports}
import { TrendingUp, Eye, MessageCircle, Loader2 } from 'lucide-react';

interface PopularPost {
  id: number;
  title: string;
  views: number;
  comments: number;
  image: string;
  date: string;
}

interface ThumbnailPopularPostsProps {
  ${dataName}?: any;
  className?: string;
  onPostClick?: (postId: number) => void;
  limit?: number;
}

const ThumbnailPopularPosts: React.FC<ThumbnailPopularPostsProps> = ({
  ${dataName}: propData,
  className,
  onPostClick,
  limit = 5
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
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

  const blogData = ${dataName} || {};

  const title = ${getField('thumbnailsTitle')};
  const subtitle = ${getField('thumbnailsSubtitle')};
  const posts = ${getField('posts')};

  const handlePostClick = (postId: number) => {
    if (onPostClick) {
      onPostClick(postId);
    } else {
      console.log('Post clicked:', postId);
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {posts.slice(0, limit).map((post: PopularPost) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post.id)}
              className="flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded-lg transition-colors group"
            >
              {/* Thumbnail */}
              <img
                src={post.image}
                alt={post.title}
                className="w-20 h-16 object-cover rounded flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-500 transition-all"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h4>

                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{(post.views / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThumbnailPopularPosts;
    `,

    minimal: `
${commonImports}
import { TrendingUp, ArrowUpRight, Loader2 } from 'lucide-react';

interface PopularPost {
  id: number;
  title: string;
  views: number;
  date: string;
}

interface MinimalPopularPostsProps {
  ${dataName}?: any;
  className?: string;
  onPostClick?: (postId: number) => void;
  limit?: number;
}

const MinimalPopularPosts: React.FC<MinimalPopularPostsProps> = ({
  ${dataName}: propData,
  className,
  onPostClick,
  limit = 5
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
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

  const blogData = ${dataName} || {};

  const title = ${getField('minimalTitle')};
  const subtitle = ${getField('minimalSubtitle')};
  const posts = ${getField('posts')};

  const handlePostClick = (postId: number) => {
    if (onPostClick) {
      onPostClick(postId);
    } else {
      console.log('Post clicked:', postId);
    }
  };

  return (
    <div className={cn("", className)}>
      <div className="mb-4 pb-3 border-b dark:border-gray-700">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          {title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {posts.slice(0, limit).map((post: PopularPost, index: number) => (
          <div
            key={post.id}
            onClick={() => handlePostClick(post.id)}
            className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold text-gray-300 dark:text-gray-700 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {post.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{(post.views / 1000).toFixed(1)}k views</span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MinimalPopularPosts;
    `
  };

  return variants[variant] || variants.numbered;
};
