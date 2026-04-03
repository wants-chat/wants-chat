import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBlogSidebar = (
  resolved: ResolvedComponent,
  variant: 'sticky' | 'floating' | 'compact' = 'sticky'
) => {
  const dataSource = resolved.dataSource;
  const colorScheme = resolved.uiStyle?.colorScheme || 'blue';

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
    return `/${dataSource || 'posts'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'posts';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    sticky: `
${commonImports}
import { Clock, TrendingUp, Tag } from 'lucide-react';

interface Category {
  id: string | number;
  name: string;
  slug?: string;
  post_count?: number;
}

interface StickySidebarProps {
  data?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  showPopularPosts?: boolean;
  showTags?: boolean;
  onPostClick?: (post: any) => void;
  onCategoryClick?: (slug: string) => void;
  onTagClick?: (tag: string) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onAuthorClick?: (authorName: string) => void;
}

const StickySidebar: React.FC<StickySidebarProps> = ({
  data: propData,
  className,
  onPostClick,
  onCategoryClick,
  onTagClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const data = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Extract data from props
  const postsArray: any[] = Array.isArray(data) ? data : (data?.posts || data?.items || []);

  // Extract recent posts (use available posts data)
  const recentPosts = postsArray.slice(0, 4).map((post: any) => ({
    ...post,
    image: post.featured_image || post.image || 'https://placehold.co/80x60?text=Post',
    date: post.published_at || post.created_at ? new Date(post.published_at || post.created_at).toLocaleDateString() : 'Recent',
    readTime: post.read_time || \`\${Math.ceil((post.content?.length || 500) / 500)} min\`
  }));

  // Extract categories from posts or use default
  const categories: Category[] = data?.categories || [];

  // Extract tags from posts
  const allTags: string[] = postsArray.reduce((acc: string[], post: any) => {
    if (post.tags && Array.isArray(post.tags)) {
      return [...acc, ...post.tags];
    }
    return acc;
  }, []);
  const uniqueTags = [...new Set(allTags)].slice(0, 10);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="sticky top-6 space-y-6">
        {/* Recent Posts */}
        {recentPosts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPosts.map((post: any) => (
                  <div
                    key={post.id}
                    onClick={() => onPostClick?.(post)}
                    className="flex gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded-lg transition-colors"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-20 h-16 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.slice(0, 6).map((category: Category) => (
                  <button
                    key={category.id}
                    onClick={() => onCategoryClick?.(category.slug || category.name)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors text-left"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {category.name}
                    </span>
                    {category.post_count !== undefined && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
                        {category.post_count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {uniqueTags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Popular Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {uniqueTags.map((tag: string) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick?.(tag)}
                    className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-${colorScheme}-100 dark:hover:bg-${colorScheme}-900 hover:text-${colorScheme}-700 dark:hover:text-${colorScheme}-300 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StickySidebar;
    `,

    floating: `
${commonImports}
import { Clock, TrendingUp, Tag } from 'lucide-react';

interface RecentPost {
  id: number;
  title: string;
  date: string;
  image: string;
  readTime: string;
}

interface FloatingSidebarProps {
  data?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  showPopularPosts?: boolean;
  showTags?: boolean;
  onPostClick?: (postId: number) => void;
  onTagClick?: (tag: string) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onAuthorClick?: (authorName: string) => void;
  onCategoryClick?: (category: string) => void;
}

const FloatingSidebar: React.FC<FloatingSidebarProps> = ({
  data: propData,
  className,
  onPostClick,
  onTagClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const data = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = ${dataName} || {};

  const recentPosts = ${getField('recentPosts')};
  const tags = ${getField('tags')};
  const popularPostsTitle = ${getField('popularPostsTitle')};
  const tagsTitle = ${getField('tagsTitle')};

  return (
    <div className={cn("space-y-6", className)}>
      <div className="sticky top-6 space-y-6">
        {/* Popular Posts - Floating Design */}
        <div className="bg-gradient-to-br from-${colorScheme}-50 to-${colorScheme}-50 dark:from-${colorScheme}-900/20 dark:to-${colorScheme}-900/20 rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-${colorScheme}-600" />
            {popularPostsTitle}
          </h3>
          <div className="space-y-4">
            {recentPosts.slice(0, 3).map((post: RecentPost, index: number) => (
              <div
                key={post.id}
                onClick={() => onPostClick?.(post.id)}
                className="flex gap-4 cursor-pointer hover:bg-white/50 dark:hover:bg-gray-800/50 p-3 rounded-xl transition-all"
              >
                <div className="flex-shrink-0 text-4xl font-bold text-${colorScheme}-600/20">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags - Floating Design */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Tag className="h-6 w-6 text-purple-600" />
            {tagsTitle}
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag: string, index: number) => (
              <button
                key={index}
                onClick={() => onTagClick?.(tag)}
                className="bg-gradient-to-r from-${colorScheme}-500 to-${colorScheme}-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:scale-105 transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingSidebar;
    `,

    compact: `
${commonImports}
import { Clock } from 'lucide-react';

interface RecentPost {
  id: number;
  title: string;
  date: string;
}

interface Category {
  name: string;
  count: number;
  slug: string;
}

interface CompactSidebarProps {
  data?: any;
  className?: string;
  variant?: string;
  colorScheme?: string;
  title?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  showPopularPosts?: boolean;
  showTags?: boolean;
  onPostClick?: (postId: number) => void;
  onCategoryClick?: (slug: string) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  onAuthorClick?: (authorName: string) => void;
  onTagClick?: (tag: string) => void;
}

const CompactSidebar: React.FC<CompactSidebarProps> = ({
  data: propData,
  className,
  onPostClick,
  onCategoryClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const data = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = ${dataName} || {};

  const recentPosts = ${getField('recentPosts')};
  const categories = ${getField('categories')};
  const recentPostsTitle = ${getField('recentPostsTitle')};
  const categoriesTitle = ${getField('categoriesTitle')};

  return (
    <div className={cn("space-y-6", className)}>
      <div className="sticky top-6 space-y-6">
        {/* Recent Posts - Compact */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 pb-2 border-b dark:border-gray-700">
            {recentPostsTitle}
          </h3>
          <div className="space-y-3">
            {recentPosts.slice(0, 5).map((post: RecentPost) => (
              <div
                key={post.id}
                onClick={() => onPostClick?.(post.id)}
                className="cursor-pointer hover:text-${colorScheme}-600 dark:hover:text-${colorScheme}-400 transition-colors"
              >
                <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {post.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{post.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories - Compact */}
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 pb-2 border-b dark:border-gray-700">
            {categoriesTitle}
          </h3>
          <div className="space-y-2">
            {categories.slice(0, 8).map((category: Category) => (
              <button
                key={category.slug}
                onClick={() => onCategoryClick?.(category.slug)}
                className="w-full flex items-center justify-between text-left hover:text-${colorScheme}-600 dark:hover:text-${colorScheme}-400 transition-colors"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({category.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactSidebar;
    `
  };

  return variants[variant] || variants.sticky;
};
