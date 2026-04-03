import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBlogCard = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'featured' | 'grid' | 'standard' = 'standard'
) => {
  const dataSource = resolved.dataSource;
  const uiVariant = resolved.uiStyle?.variant || 'minimal';
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
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getVariantStyles } from '@/lib/design-variants';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    compact: `
${commonImports}
import { Clock, ArrowRight } from 'lucide-react';

interface CompactPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  categoryColor: string;
  image: string;
}

interface CompactBlogCardProps {
  ${dataName}?: any;
  className?: string;
  variant?: 'glassmorphism' | 'neumorphism' | 'brutalist' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'teal' | 'red' | 'neutral' | 'warm';
  onPostClick?: (post: CompactPost) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onAuthorClick?: (author: string, postId: number) => void;
}

const CompactBlogCard: React.FC<CompactBlogCardProps> = ({
  ${dataName}: propData,
  className,
  variant = '${uiVariant}',
  colorScheme = '${colorScheme}',
  onPostClick,
  onCategoryClick,
  onAuthorClick
}) => {
  const styles = getVariantStyles(variant as any, colorScheme as any);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
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

  const title = ${getField('compactTitle')};
  const subtitle = ${getField('compactSubtitle')};
  const postItems = ${getField('compactPosts')};

  const handlePostClick = (post: CompactPost) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      console.log('Post clicked:', post.title);
    }
  };

  const handleCategoryClick = (category: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(category, postId);
    } else {
      console.log('Category clicked:', category);
    }
  };

  const handleAuthorClick = (author: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(author, postId);
    } else {
      console.log('Author clicked:', author);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="space-y-4">
        {postItems.map((post: CompactPost) => (
          <Card 
            key={post.id} 
            onClick={() => handlePostClick(post)}
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-gray-50/30 to-white dark:from-gray-800 dark:via-gray-800/30 dark:to-gray-800"
          >
            <div className="flex gap-5 p-6">
              <div className="relative w-36 h-36 flex-shrink-0 overflow-hidden rounded-xl group">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div
                  onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                  className={\`absolute top-2 left-2 \${post.categoryColor} text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition-all shadow-lg backdrop-blur-sm\`}
                >
                  {post.category}
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-3 group-hover:from-blue-600 group-hover:via-blue-500 group-hover:to-blue-600 transition-all line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span
                      onClick={(e) => handleAuthorClick(post.author, post.id, e)}
                      className="font-semibold hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text hover:text-transparent cursor-pointer transition-all"
                    >
                      {post.author}
                    </span>
                    <span>•</span>
                    <span>{post.date}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 text-white p-2 rounded-xl shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CompactBlogCard;
    `,

    featured: `
${commonImports}
import { Calendar, Clock, TrendingUp, Eye, MessageCircle } from 'lucide-react';

interface FeaturedPost {
  id: number;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  readTime: string;
  category: string;
  image: string;
  views: number;
  comments: number;
  trending: boolean;
}

interface FeaturedBlogCardProps {
  ${dataName}?: any;
  className?: string;
  variant?: 'glassmorphism' | 'neumorphism' | 'brutalist' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'teal' | 'red' | 'neutral' | 'warm';
  onPostClick?: (post: FeaturedPost) => void;
  onReadArticle?: (postId: number, post: FeaturedPost) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onAuthorClick?: (authorName: string, postId: number) => void;
  onViewsClick?: (postId: number) => void;
  onCommentsClick?: (postId: number) => void;
}

const FeaturedBlogCard: React.FC<FeaturedBlogCardProps> = ({
  ${dataName}: propData,
  className,
  variant = '${uiVariant}',
  colorScheme = '${colorScheme}',
  onPostClick,
  onReadArticle,
  onCategoryClick,
  onAuthorClick,
  onViewsClick,
  onCommentsClick
}) => {
  const styles = getVariantStyles(variant as any, colorScheme as any);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
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

  const title = ${getField('featuredTitle')};
  const subtitle = ${getField('featuredSubtitle')};
  const postItems = ${getField('featuredPosts')};
  const trendingLabel = ${getField('trendingLabel')};
  const readArticleButton = ${getField('readArticleButton')};

  const handlePostClick = (post: FeaturedPost) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      console.log('Post clicked:', post.title);
    }
  };

  const handleReadArticle = (postId: number, post: FeaturedPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadArticle) {
      onReadArticle(postId, post);
    } else {
      console.log('Read article:', post.title);
    }
  };

  const handleCategoryClick = (category: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(category, postId);
    } else {
      console.log('Category clicked:', category);
    }
  };

  const handleAuthorClick = (authorName: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(authorName, postId);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  const handleViewsClick = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewsClick) {
      onViewsClick(postId);
    } else {
      console.log('Views clicked for post:', postId);
    }
  };

  const handleCommentsClick = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCommentsClick) {
      onCommentsClick(postId);
    } else {
      console.log('Comments clicked for post:', postId);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="space-y-6">
        {postItems.map((post: FeaturedPost) => (
          <Card 
            key={post.id} 
            onClick={() => handlePostClick(post)}
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group rounded-3xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-gray-800 dark:via-purple-900/10 dark:to-gray-800"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto overflow-hidden group">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-300" />

                <div className="absolute top-5 left-5 flex gap-3">
                  <span
                    onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                    className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xl cursor-pointer transition-all backdrop-blur-sm"
                  >
                    {post.category}
                  </span>
                  {post.trending && (
                    <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xl flex items-center gap-1.5 transition-all backdrop-blur-sm">
                      <TrendingUp className="h-4 w-4" />
                      {trendingLabel}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-5 left-5 right-5 flex gap-4 text-white">
                  <div 
                    onClick={(e) => handleViewsClick(post.id, e)}
                    className="flex items-center gap-1 text-sm cursor-pointer hover:opacity-80 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>{post.views.toLocaleString()}</span>
                  </div>
                  <div 
                    onClick={(e) => handleCommentsClick(post.id, e)}
                    className="flex items-center gap-1 text-sm cursor-pointer hover:opacity-80 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>

              <div className="p-10 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-5 group-hover:from-purple-600 group-hover:via-purple-500 group-hover:to-purple-600 transition-all">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 line-clamp-4 leading-relaxed text-base">
                    {post.excerpt}
                  </p>
                </div>

                <div>
                  <div
                    onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                    className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent dark:hover:from-purple-900/20 p-3 -m-3 rounded-xl transition-all"
                  >
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-purple-200 dark:ring-purple-800"
                    />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-base">{post.author.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{post.author.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleReadArticle(post.id, post, e)}
                      className="bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                    >
                      {readArticleButton}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedBlogCard;
    `,

    grid: `
${commonImports}
import { Clock, Heart, Bookmark, Share2 } from 'lucide-react';

interface GridPost {
  id: number;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  readTime: string;
  category: string;
  image: string;
  likes: number;
}

interface GridBlogCardProps {
  ${dataName}?: any;
  className?: string;
  variant?: 'glassmorphism' | 'neumorphism' | 'brutalist' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'teal' | 'red' | 'neutral' | 'warm';
  onPostClick?: (post: GridPost) => void;
  onLike?: (postId: number, isLiked: boolean) => void;
  onBookmark?: (postId: number, isBookmarked: boolean) => void;
  onShare?: (postId: number, post: GridPost) => void;
  onReadMore?: (postId: number, post: GridPost) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onAuthorClick?: (authorName: string, postId: number) => void;
}

const GridBlogCard: React.FC<GridBlogCardProps> = ({
  ${dataName}: propData,
  className,
  variant = '${uiVariant}',
  colorScheme = '${colorScheme}',
  onPostClick,
  onLike,
  onBookmark,
  onShare,
  onReadMore,
  onCategoryClick,
  onAuthorClick
}) => {
  const styles = getVariantStyles(variant as any, colorScheme as any);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<number[]>([]);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
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

  const title = ${getField('gridTitle')};
  const subtitle = ${getField('gridSubtitle')};
  const postItems = ${getField('gridPosts')};
  const readMoreButton = ${getField('readMoreButton')};

  const toggleLike = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyLiked = likedPosts.includes(postId);
    setLikedPosts(prev =>
      isCurrentlyLiked ? prev.filter(id => id !== postId) : [...prev, postId]
    );
    if (onLike) {
      onLike(postId, !isCurrentlyLiked);
    } else {
      console.log('Like toggled for post:', postId, 'Liked:', !isCurrentlyLiked);
    }
  };

  const toggleBookmark = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlyBookmarked = bookmarkedPosts.includes(postId);
    setBookmarkedPosts(prev =>
      isCurrentlyBookmarked ? prev.filter(id => id !== postId) : [...prev, postId]
    );
    if (onBookmark) {
      onBookmark(postId, !isCurrentlyBookmarked);
    } else {
      console.log('Bookmark toggled for post:', postId, 'Bookmarked:', !isCurrentlyBookmarked);
    }
  };

  const handleShare = (postId: number, post: GridPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(postId, post);
    } else {
      console.log('Share clicked for post:', post.title);
      if (navigator.share) {
        navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        }).catch(err => console.log('Share cancelled'));
      }
    }
  };

  const handlePostClick = (post: GridPost) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      console.log('Post clicked:', post.title);
    }
  };

  const handleReadMore = (postId: number, post: GridPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadMore) {
      onReadMore(postId, post);
    } else {
      console.log('Read more clicked:', post.title);
    }
  };

  const handleCategoryClick = (category: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(category, postId);
    } else {
      console.log('Category clicked:', category);
    }
  };

  const handleAuthorClick = (authorName: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(authorName, postId);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postItems.map((post: GridPost) => (
          <Card
            key={post.id}
            onClick={() => handlePostClick(post)}
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-800 dark:via-blue-900/10 dark:to-gray-800"
          >
            <div className="relative h-64 overflow-hidden group">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300" />

              <div className="absolute top-3 left-3">
                <span 
                  onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                  className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1 rounded-full cursor-pointer hover:bg-white transition-colors"
                >
                  {post.category}
                </span>
              </div>

              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={(e) => toggleBookmark(post.id, e)}
                  className={\`p-2.5 rounded-xl backdrop-blur-sm transition-all shadow-lg \${
                    bookmarkedPosts.includes(post.id)
                      ? 'bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 text-white'
                      : 'bg-white/90 text-gray-700 hover:bg-gradient-to-r hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-500 hover:text-white'
                  }\`}
                >
                  <Bookmark className={\`h-4 w-4 \${bookmarkedPosts.includes(post.id) ? 'fill-white' : ''}\`} />
                </button>
                <button
                  onClick={(e) => handleShare(post.id, post, e)}
                  className="p-2.5 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-gradient-to-r hover:from-blue-500 hover:via-blue-600 hover:to-blue-500 hover:text-white transition-all shadow-lg text-gray-700"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 className="font-bold text-xl mb-3 line-clamp-2 transition-all">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                    className="w-6 h-6 rounded-full object-cover border-2 border-white cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                  />
                  <span 
                    onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                    className="text-sm font-medium cursor-pointer hover:opacity-80 transition-colors"
                  >
                    {post.author.name}
                  </span>
                  <span className="text-sm text-white/70">•</span>
                  <div className="flex items-center gap-1 text-sm text-white/90">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={(e) => toggleLike(post.id, e)}
                  className={\`flex items-center gap-2 transition-all \${
                    likedPosts.includes(post.id) ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }\`}
                >
                  <Heart className={\`h-5 w-5 \${likedPosts.includes(post.id) ? 'fill-red-500' : ''}\`} />
                  <span className="text-sm font-semibold">
                    {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                  </span>
                </button>

                <button
                  onClick={(e) => handleReadMore(post.id, post, e)}
                  className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 text-white font-semibold text-sm px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {readMoreButton}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GridBlogCard;
    `,

    standard: `
${commonImports}
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface StandardBlogCardProps {
  ${dataName}?: any;
  className?: string;
  variant?: 'glassmorphism' | 'neumorphism' | 'brutalist' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'teal' | 'red' | 'neutral' | 'warm';
  onPostClick?: (post: any) => void;
  onReadMore?: (postId: number, post: any) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onAuthorClick?: (authorName: string, postId: number) => void;
}

const StandardBlogCard: React.FC<StandardBlogCardProps> = ({
  ${dataName}: propData,
  className,
  variant = '${uiVariant}',
  colorScheme = '${colorScheme}',
  onPostClick,
  onReadMore,
  onCategoryClick,
  onAuthorClick
}) => {
  const styles = getVariantStyles(variant as any, colorScheme as any);

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || []);
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

  const title = ${getField('standardTitle')};
  const subtitle = ${getField('standardSubtitle')};
  const postItems = ${getField('standardPosts')};
  const readMoreButton = ${getField('readMoreButton')};

  const handlePostClick = (post: BlogPost) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      console.log('Post clicked:', post.title);
    }
  };

  const handleReadMore = (postId: number, post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadMore) {
      onReadMore(postId, post);
    } else {
      console.log('Read more clicked:', post.title);
    }
  };

  const handleCategoryClick = (category: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(category, postId);
    } else {
      console.log('Category clicked:', category);
    }
  };

  const handleAuthorClick = (authorName: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(authorName, postId);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {postItems.map((post: BlogPost) => (
          <Card
            key={post.id}
            onClick={() => handlePostClick(post)}
            className={\`overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group rounded-2xl \${styles.card}\`}
          >
            <div className="relative h-56 overflow-hidden group">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute top-5 left-5">
                <span
                  onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                  className={\`\${styles.gradient} text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer transition-all shadow-lg backdrop-blur-sm hover:opacity-90\`}
                >
                  {post.category}
                </span>
              </div>
            </div>

            <CardContent className="p-7">
              <h3 className={\`text-2xl font-bold \${styles.title} mb-4 transition-all line-clamp-2\`}>
                {post.title}
              </h3>
              <p className={\`\${styles.text} text-sm mb-5 line-clamp-3 leading-relaxed\`}>
                {post.excerpt}
              </p>

              <div
                onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                className={\`flex items-center gap-3 mb-5 pb-5 border-b \${styles.border} cursor-pointer hover:opacity-80 p-2 -mx-2 rounded-xl transition-all\`}
              >
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-200"
                />
                <div>
                  <p className={\`text-sm font-semibold \${styles.title}\`}>{post.author.name}</p>
                  <div className={\`flex items-center gap-2 text-xs \${styles.text}\`}>
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className={\`flex items-center gap-1.5 text-sm \${styles.text}\`}>
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
                <button
                  onClick={(e) => handleReadMore(post.id, post, e)}
                  className={\`\${styles.button} \${styles.buttonHover} font-semibold text-sm flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all\`}
                >
                  {readMoreButton}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StandardBlogCard;
    `
  };

  return variants[variant] || variants.standard;
};
