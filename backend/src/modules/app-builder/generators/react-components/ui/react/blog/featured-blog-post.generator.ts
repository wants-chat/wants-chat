import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFeaturedBlogPost = (
  resolved: ResolvedComponent,
  variant: 'hero' | 'banner' | 'card' = 'hero'
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
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    hero: `
${commonImports}
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Eye, MessageCircle, Share2, ArrowRight, TrendingUp, Tag } from 'lucide-react';

interface HeroFeaturedPostProps {
  data?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  title?: string;
  showAuthor?: boolean;
  showDate?: boolean;
  showCategory?: boolean;
  onReadArticle?: (postId: string | number, post?: any) => void;
  onCategoryClick?: (category: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onTagClick?: (tag: string) => void;
  onPostClick?: (post: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
}

const HeroFeaturedPost: React.FC<HeroFeaturedPostProps> = ({
  data: propData,
  className,
  variant = '${uiVariant}',
  colorScheme = '${colorScheme}',
  onReadArticle,
  onCategoryClick,
  onAuthorClick,
  onTagClick,
  onPostClick
}) => {
  const navigate = useNavigate();
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

  const data = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Extract data from props
  const posts: any[] = Array.isArray(data) ? data : (data?.posts || data?.items || (data ? [data] : []));
  const rawPost: any = posts[0] || {};

  // Normalize the post to have UI-friendly properties
  const post = {
    ...rawPost,
    heroImage: rawPost.featured_image || rawPost.heroImage || rawPost.image || 'https://placehold.co/1920x1080?text=Featured+Post',
    subtitle: rawPost.subtitle || rawPost.excerpt?.substring(0, 100) || '',
    fullExcerpt: rawPost.fullExcerpt || rawPost.excerpt || rawPost.content?.substring(0, 300) + '...' || '',
    author: rawPost.author || {
      name: rawPost.author_name || 'Author',
      avatar: rawPost.author_avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(rawPost.author_name || 'A')}&background=random\`,
      role: rawPost.author_role || 'Writer',
      bio: rawPost.author_bio || ''
    },
    category: rawPost.category?.name || rawPost.category_name || rawPost.category || 'Uncategorized',
    date: rawPost.published_at || rawPost.created_at ? new Date(rawPost.published_at || rawPost.created_at).toLocaleDateString() : 'Recent',
    readTime: rawPost.read_time || \`\${Math.ceil((rawPost.content?.length || 2000) / 1000)} min read\`,
    views: rawPost.view_count || rawPost.views || 0,
    comments: rawPost.comment_count || rawPost.comments || 0,
    likes: rawPost.like_count || rawPost.likes || 0,
    trending: rawPost.trending || (rawPost.view_count && rawPost.view_count > 1000) || false,
    tags: rawPost.tags || []
  };

  const title = data?.title || 'Featured Post';
  const subtitle = data?.sectionSubtitle || 'Highlighted article for you';
  const readFullArticleButton = 'Read Full Article';

  const handleReadArticle = () => {
    const postId = post.id || post._id;
    if (postId) {
      // Always navigate to detail page
      navigate(\`/posts/\${postId}\`);
    }
    // Also call the callback if provided
    if (onPostClick) {
      onPostClick(post);
    } else if (onReadArticle) {
      onReadArticle(post.id, post);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(post.category);
    } else {
      console.log('Category clicked:', post.category);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(post.author.name);
    } else {
      console.log('Author clicked:', post.author.name);
    }
  };

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    } else {
      console.log('Tag clicked:', tag);
    }
  };

  if (!post || !post.id) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="mb-6">
          <h2 className={\`text-2xl font-bold \${styles.title} mb-2\`}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        <div className={\`h-[400px] rounded-2xl \${styles.card} flex items-center justify-center\`}>
          <p className={styles.text}>No featured post available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-6">
        <h2 className={\`text-2xl font-bold \${styles.title} mb-2\`}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className="relative h-[600px] md:h-[700px] rounded-2xl overflow-hidden group cursor-pointer" onClick={handleReadArticle}>
        {/* Background Image */}
        <img
          src={post.heroImage}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 lg:p-16">
          {/* Category and Trending */}
          <div className="flex gap-3 mb-6">
            <span
              onClick={handleCategoryClick}
              className={\`\${styles.accent} text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg cursor-pointer hover:opacity-90 transition-opacity\`}
            >
              {post.category}
            </span>
            {post.trending && (
              <span className={\`\${styles.accent} text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2\`}>
                <TrendingUp className="h-4 w-4" />
                Trending
              </span>
            )}
          </div>

          {/* Title and Subtitle */}
          <div className="max-w-4xl mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            {post.subtitle && (
              <p className="text-xl md:text-2xl text-gray-200 mb-6">
                {post.subtitle}
              </p>
            )}
            <p className="text-lg text-gray-300 line-clamp-3">
              {post.fullExcerpt}
            </p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.slice(0, 5).map((tag: string, index: number) => (
                <span
                  key={index}
                  onClick={(e) => handleTagClick(tag, e)}
                  className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full cursor-pointer hover:bg-white/30 transition-colors"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author and Metadata */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div
              onClick={handleAuthorClick}
              className="flex items-center gap-4 cursor-pointer hover:bg-white/10 p-3 -m-3 rounded-lg transition-colors"
            >
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div>
                <p className="text-white font-bold text-lg">{post.author.name}</p>
                <p className="text-gray-300 text-sm">{post.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">{post.readTime}</span>
              </div>
            </div>
          </div>

          {/* Stats and CTA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span className="font-semibold">{(post.views || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">{post.comments || 0}</span>
              </div>
            </div>

            <button
              onClick={handleReadArticle}
              className={\`\${styles.button} \${styles.buttonHover} px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-xl flex items-center gap-3 group\`}
            >
              {readFullArticleButton}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroFeaturedPost;
    `,

    banner: `
${commonImports}
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Eye, MessageCircle, ArrowRight, User } from 'lucide-react';

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
  categoryColor: string;
  bannerImage: string;
  views: number;
  comments: number;
}

interface BannerFeaturedPostProps {
  ${dataName}?: any;
  data?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  title?: string;
  showAuthor?: boolean;
  showDate?: boolean;
  showCategory?: boolean;
  onLearnMore?: (postId: number) => void;
  onCategoryClick?: (category: string) => void;
  onAuthorClick?: (authorName: string) => void;
}

const BannerFeaturedPost: React.FC<BannerFeaturedPostProps> = ({
  ${dataName}: propData,
  className,
  variant = '${uiVariant}',
  colorScheme = '${colorScheme}',
  onLearnMore,
  onCategoryClick,
  onAuthorClick
}) => {
  const navigate = useNavigate();
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

  const title = ${getField('bannerTitle')};
  const subtitle = ${getField('bannerSubtitle')};
  const post = ${getField('featuredPost')};
  const learnMoreButton = ${getField('learnMoreButton')};

  const handleLearnMore = () => {
    const postId = post?.id || post?._id;
    if (postId) {
      navigate(\`/posts/\${postId}\`);
    }
    if (onLearnMore) {
      onLearnMore(post.id);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(post.category);
    } else {
      console.log('Category clicked:', post.category);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(post.author.name);
    } else {
      console.log('Author clicked:', post.author.name);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-6">
        <h2 className={\`text-2xl font-bold \${styles.title} mb-2\`}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <Card className={\`overflow-hidden hover:shadow-2xl transition-shadow duration-300 \${styles.card}\`}>
        <div className="grid md:grid-cols-5 gap-0">
          {/* Image Section */}
          <div className="md:col-span-2 relative h-80 md:h-auto overflow-hidden">
            <img
              src={post.bannerImage}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />

            <div className="absolute top-6 left-6">
              <span
                onClick={handleCategoryClick}
                className={\`\${styles.accent} text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg cursor-pointer hover:opacity-90 transition-opacity\`}
              >
                {post.category}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="md:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
            <h3 className={\`text-3xl lg:text-4xl font-bold \${styles.title} mb-4\`}>
              {post.title}
            </h3>
            <p className={\`text-lg \${styles.text} mb-8 line-clamp-4\`}>
              {post.excerpt}
            </p>

            {/* Author Section */}
            <div
              onClick={handleAuthorClick}
              className={\`flex items-center gap-4 mb-6 pb-6 \${styles.border} border-b cursor-pointer hover:opacity-80 p-3 -m-3 rounded-lg transition-colors\`}
            >
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <p className={\`font-bold \${styles.title} text-lg\`}>{post.author.name}</p>
                <p className={\`text-sm \${styles.text}\`}>{post.author.role}</p>
              </div>
            </div>

            {/* Metadata and CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className={\`flex items-center gap-6 text-sm \${styles.text}\`}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <div className={\`flex items-center gap-6 text-sm \${styles.text}\`}>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{(post.views || 0).toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments || 0} comments</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLearnMore}
                className={\`\${styles.button} \${styles.buttonHover} px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 group\`}
              >
                {learnMoreButton}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BannerFeaturedPost;
    `,

    card: `
${commonImports}
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Eye, MessageCircle, Bookmark, Share2, ArrowRight } from 'lucide-react';

interface FeaturedPost {
  id: number;
  title: string;
  subtitle: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  readTime: string;
  category: string;
  categoryColor: string;
  cardImage: string;
  views: number;
  comments: number;
  likes: number;
  shares: number;
}

interface CardFeaturedPostProps {
  ${dataName}?: any;
  data?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  title?: string;
  showAuthor?: boolean;
  showDate?: boolean;
  showCategory?: boolean;
  onReadNow?: (postId: number) => void;
  onCategoryClick?: (category: string) => void;
  onAuthorClick?: (authorName: string) => void;
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
}

const CardFeaturedPost: React.FC<CardFeaturedPostProps> = ({
  ${dataName}: propData,
  className,
  variant = '${uiVariant}',
  colorScheme = '${colorScheme}',
  onReadNow,
  onCategoryClick,
  onAuthorClick,
  onLike,
  onBookmark,
  onShare
}) => {
  const navigate = useNavigate();
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

  const title = ${getField('cardTitle')};
  const subtitle = ${getField('cardSubtitle')};
  const post = ${getField('featuredPost')};
  const readNowButton = ${getField('readNowButton')};

  const handleReadNow = () => {
    const postId = post?.id || post?._id;
    if (postId) {
      navigate(\`/posts/\${postId}\`);
    }
    if (onReadNow) {
      onReadNow(post.id);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(post.category);
    } else {
      console.log('Category clicked:', post.category);
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(post.author.name);
    } else {
      console.log('Author clicked:', post.author.name);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike();
    } else {
      console.log('Like clicked');
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBookmark) {
      onBookmark();
    } else {
      console.log('Bookmark clicked');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare();
    } else {
      console.log('Share clicked');
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="mb-6">
        <h2 className={\`text-2xl font-bold \${styles.title} mb-2\`}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <Card className={\`overflow-hidden hover:shadow-2xl transition-all duration-300 \${styles.card} \${styles.border} border-2\`}>
        {/* Header Image */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={post.cardImage}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-6 left-6 flex gap-3">
            <span
              onClick={handleCategoryClick}
              className={\`\${styles.accent} text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg cursor-pointer hover:opacity-90 transition-opacity backdrop-blur-sm\`}
            >
              {post.category}
            </span>
            <span className={\`\${styles.accent} text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg\`}>
              Featured
            </span>
          </div>

          {/* Quick Actions */}
          <div className="absolute top-6 right-6 flex gap-2">
            <button
              onClick={handleBookmark}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
            >
              <Bookmark className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={handleShare}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
            >
              <Share2 className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Stats Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              <span className="font-semibold">{(post.views || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">{post.comments || 0}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h3 className={\`text-3xl font-bold \${styles.title} mb-3\`}>
            {post.title}
          </h3>
          <p className={\`text-xl \${styles.accent} font-semibold mb-4\`}>
            {post.subtitle}
          </p>
          <p className={\`\${styles.text} text-lg mb-8 line-clamp-3\`}>
            {post.excerpt}
          </p>

          {/* Author Info */}
          <div
            onClick={handleAuthorClick}
            className={\`flex items-center gap-4 mb-6 pb-6 border-b \${styles.border} cursor-pointer hover:opacity-80 p-3 -m-3 rounded-lg transition-colors\`}
          >
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className={\`w-16 h-16 rounded-full object-cover border-4 \${styles.border}\`}
            />
            <div>
              <p className={\`font-bold \${styles.title} text-lg\`}>{post.author.name}</p>
              <p className={\`text-sm \${styles.text}\`}>{post.author.role}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className={\`flex items-center gap-6 text-sm \${styles.text}\`}>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>

            <button
              onClick={handleReadNow}
              className={\`\${styles.button} \${styles.buttonHover} px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 group\`}
            >
              {readNowButton}
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CardFeaturedPost;
    `
  };

  return variants[variant] || variants.hero;
};
