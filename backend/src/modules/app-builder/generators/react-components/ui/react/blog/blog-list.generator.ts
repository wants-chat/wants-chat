import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBlogList = (
  resolved: ResolvedComponent,
  variant: 'classic' | 'magazine' | 'minimal' | 'timeline' = 'classic'
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
  const getDataFetchApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'posts'}`;
  };

  const dataFetchApiRoute = getDataFetchApiRoute();

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getVariantStyles } from '@/lib/design-variants';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    classic: `
${commonImports}
import { Calendar, User, Tag, ArrowRight } from 'lucide-react';

interface ClassicBlogListProps {
  ${dataName}?: any;
  className?: string;
  variant?: 'glassmorphism' | 'neumorphism' | 'brutalist' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'teal' | 'red' | 'neutral' | 'warm';
  onPostClick?: (post: any) => void;
  onReadMore?: (postId: number, post: BlogPost) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onAuthorClick?: (author: string, postId: number) => void;
  onImageClick?: (postId: number, post: BlogPost) => void;
}

const ClassicBlogList: React.FC<ClassicBlogListProps> = ({
  ${dataName}: propData,
  className,
  variant = '${uiVariant}',
  colorScheme = '${colorScheme}',
  onPostClick,
  onReadMore,
  onCategoryClick,
  onAuthorClick,
  onImageClick
}) => {
  const styles = getVariantStyles(variant as any, colorScheme as any);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'posts'}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${dataFetchApiRoute}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        return [];
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const blogData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("space-y-6 py-8", className)}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading posts...</span>
          </div>
        </div>
      </div>
    );
  }

  const title = ${getField('classicTitle')};
  const subtitle = ${getField('classicSubtitle')};
  // Support both array data and structured data with posts field
  const postItems = Array.isArray(blogData) ? blogData : (blogData?.posts || ${getField('classicPosts')} || []);
  const readMoreButton = ${getField('readMoreButton')};

  const handlePostClick = (post: any) => {
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

  const handleAuthorClick = (author: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(author, postId);
    } else {
      console.log('Author clicked:', author);
    }
  };

  const handleImageClick = (postId: number, post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(postId, post);
    } else {
      console.log('Image clicked for post:', post.title);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className={\`\${styles.textMuted}\`}>{subtitle}</p>
      </div>

      <div className="space-y-8">
        {postItems.map((post: any) => (
          <Card
            key={post.id}
            onClick={() => handlePostClick(post)}
            className={\`overflow-hidden \${styles.cardHoverShadow} transition-all cursor-pointer group \${styles.card} \${styles.cardBorder} \${styles.cardShadow}\`}
          >
            <div className="md:flex">
              <div
                onClick={(e) => handleImageClick(post.id, post, e)}
                className="md:w-1/3 h-64 md:h-auto overflow-hidden cursor-pointer"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
              </div>

              <div className="md:w-2/3 p-6 md:p-8">
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div
                    onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                    className={\`flex items-center gap-1 \${styles.textPrimary} cursor-pointer hover:opacity-80 transition-colors\`}
                  >
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">{post.category}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className={\`\${styles.textMuted}\`}>{post.readTime}</span>
                </div>

                <h3 className={\`text-2xl font-bold \${styles.textSecondary} mb-3 hover:\${styles.textPrimary} transition-colors\`}>
                  {post.title}
                </h3>

                <p className={\`\${styles.textMuted} mb-6 line-clamp-2\`}>
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className={\`flex items-center gap-4 text-sm \${styles.textMuted}\`}>
                    <div
                      onClick={(e) => handleAuthorClick(post.author, post.id, e)}
                      className={\`flex items-center gap-1 cursor-pointer hover:\${styles.textPrimary} transition-colors\`}
                    >
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleReadMore(post.id, post, e)}
                    className={\`\${styles.textPrimary} hover:opacity-80 font-medium flex items-center gap-2 group-hover:gap-3 transition-all\`}
                  >
                    {readMoreButton}
                    <ArrowRight className="h-4 w-4" />
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

export default ClassicBlogList;
    `,

    magazine: `
${commonImports}
import { Clock, TrendingUp, Flame } from 'lucide-react';

;
  date: string;
  readTime: string;
  category: string;
  image: string;
  trending?: boolean;
  featured?: boolean;
}

interface MagazineBlogListProps {
  ${dataName}?: any;
  className?: string;
  variant?: 'glassmorphism' | 'neumorphism' | 'brutalist' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'teal' | 'red' | 'neutral' | 'warm';
  onPostClick?: (post: any) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onAuthorClick?: (authorName: string, postId: number) => void;
  onFeaturedBadgeClick?: (postId: number) => void;
  onTrendingBadgeClick?: (postId: number) => void;
}

const MagazineBlogList: React.FC<MagazineBlogListProps> = ({
  ${dataName}: propData,
  className,
  variant = '${uiVariant}',
  colorScheme = '${colorScheme}',
  onPostClick,
  onCategoryClick,
  onAuthorClick,
  onFeaturedBadgeClick,
  onTrendingBadgeClick
}) => {
  const styles = getVariantStyles(variant as any, colorScheme as any);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'posts'}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${dataFetchApiRoute}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        return [];
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const blogData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("space-y-8 py-8", className)}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading posts...</span>
          </div>
        </div>
      </div>
    );
  }

  const title = ${getField('magazineTitle')};
  const subtitle = ${getField('magazineSubtitle')};
  // Support both array data and structured data with posts field
  const postItems = Array.isArray(blogData) ? blogData : (blogData?.posts || ${getField('magazinePosts')} || []);
  const featuredLabel = ${getField('featuredLabel')};
  const trendingLabel = ${getField('trendingLabel')};

  const featuredPost = postItems.find((p: BlogPost) => p.featured);
  const regularPosts = postItems.filter((p: BlogPost) => !p.featured);

  const handlePostClick = (post: any) => {
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

  const handleAuthorClick = (authorName: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(authorName, postId);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  const handleFeaturedBadgeClick = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFeaturedBadgeClick) {
      onFeaturedBadgeClick(postId);
    } else {
      console.log('Featured badge clicked for post:', postId);
    }
  };

  const handleTrendingBadgeClick = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTrendingBadgeClick) {
      onTrendingBadgeClick(postId);
    } else {
      console.log('Trending badge clicked for post:', postId);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      {featuredPost && (
        <Card 
          onClick={() => handlePostClick(featuredPost)}
          className="overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer group mb-8"
        >
          <div className="relative h-96 overflow-hidden">
            <img
              src={featuredPost.image}
              alt={featuredPost.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            <div className="absolute top-6 left-6 flex gap-2">
              <span 
                onClick={(e) => handleFeaturedBadgeClick(featuredPost.id, e)}
                className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-red-700 transition-colors"
              >
                <Flame className="h-3 w-3" />
                {featuredLabel}
              </span>
              {featuredPost.trending && (
                <span 
                  onClick={(e) => handleTrendingBadgeClick(featuredPost.id, e)}
                  className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-orange-600 transition-colors"
                >
                  <TrendingUp className="h-3 w-3" />
                  {trendingLabel}
                </span>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <span 
                onClick={(e) => handleCategoryClick(featuredPost.category, featuredPost.id, e)}
                className="text-sm font-semibold uppercase tracking-wide opacity-90 mb-2 block cursor-pointer hover:opacity-100 transition-colors"
              >
                {featuredPost.category}
              </span>
              <h2 className="text-4xl font-bold mb-4 group-hover:opacity-80 transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-lg text-white/90 mb-6 line-clamp-2">
                {featuredPost.excerpt}
              </p>
              <div 
                onClick={(e) => handleAuthorClick(featuredPost.author.name, featuredPost.id, e)}
                className="flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity w-fit"
              >
                <img
                  src={featuredPost.author.avatar}
                  alt={featuredPost.author.name}
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div>
                  <p className="font-semibold">{featuredPost.author.name}</p>
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <span>{featuredPost.date}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {regularPosts.map((post: any) => (
          <Card 
            key={post.id} 
            onClick={() => handlePostClick(post)}
            className="overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
              />
              {post.trending && (
                <div className="absolute top-4 right-4">
                  <span 
                    onClick={(e) => handleTrendingBadgeClick(post.id, e)}
                    className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 cursor-pointer hover:bg-orange-600 transition-colors"
                  >
                    <TrendingUp className="h-3 w-3" />
                    {trendingLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="p-6">
              <span 
                onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                className={\`text-xs font-semibold uppercase tracking-wide text-\${colorScheme}-600 mb-2 block cursor-pointer hover:text-\${colorScheme}-700 transition-colors\`}
              >
                {post.category}
              </span>
              <h3 className={\`text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-\${colorScheme}-600 transition-colors line-clamp-2\`}>
                {post.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {post.excerpt}
              </p>

              <div 
                onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                className="flex items-center gap-3 pt-4 border-t dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded transition-colors"
              >
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {post.author.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{post.date}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
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

export default MagazineBlogList;
    `,

    minimal: `
${commonImports}
import { ArrowUpRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MinimalBlogListProps {
  ${dataName}?: any;
  className?: string;
  variant?: 'glassmorphism' | 'neumorphism' | 'brutalist' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'teal' | 'red' | 'neutral' | 'warm';
  onPostClick?: (post: any) => void;
  onCategoryClick?: (category: string, postId: number) => void;
}

const MinimalBlogList: React.FC<MinimalBlogListProps> = ({
  ${dataName}: propData,
  className,
  variant = '${uiVariant}',
  colorScheme = '${colorScheme}',
  onPostClick,
  onCategoryClick
}) => {
  const styles = getVariantStyles(variant as any, colorScheme as any);
  const navigate = useNavigate();

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'posts'}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${dataFetchApiRoute}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        return [];
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const blogData = propData || fetchedData || {};

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-6 py-8", className)}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading posts...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("space-y-6 py-8", className)}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center text-red-500">
            <p>Failed to load posts. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const title = ${getField('minimalTitle')};
  const subtitle = ${getField('minimalSubtitle')};
  // Support both array data and structured data with posts field
  const postItems = Array.isArray(blogData) ? blogData : (blogData?.posts || ${getField('minimalPosts')} || []);

  const handlePostClick = (post: any) => {
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

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="space-y-1">
        {postItems.map((post: any) => (
          <div
            key={post.id}
            onClick={() => handlePostClick(post)}
            className="group py-6 px-6 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span 
                    onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                    className={\`text-xs font-semibold text-\${colorScheme}-600 uppercase tracking-wide cursor-pointer hover:text-\${colorScheme}-700 transition-colors\`}
                  >
                    {post.category}
                  </span>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h3 className={\`text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-\${colorScheme}-600 transition-colors\`}>
                  {post.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-1">
                  {post.excerpt}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {post.date}
                </p>
              </div>

              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className={\`h-5 w-5 text-\${colorScheme}-600\`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MinimalBlogList;
    `,

    timeline: `
${commonImports}
import { Clock, Tag } from 'lucide-react';

interface TimelineBlogListProps {
  ${dataName}?: any;
  className?: string;
  variant?: 'glassmorphism' | 'neumorphism' | 'brutalist' | 'minimal' | 'corporate' | 'creative';
  colorScheme?: 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' | 'teal' | 'red' | 'neutral' | 'warm';
  onPostClick?: (post: any) => void;
  onReadArticle?: (postId: number, post: BlogPost) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onImageClick?: (postId: number, post: BlogPost) => void;
  onDateClick?: (date: string, month: string, year: string, postId: number) => void;
}

const TimelineBlogList: React.FC<TimelineBlogListProps> = ({
  ${dataName}: propData,
  className,
  variant = '${uiVariant}',
  colorScheme = '${colorScheme}',
  onPostClick,
  onReadArticle,
  onCategoryClick,
  onImageClick,
  onDateClick
}) => {
  const styles = getVariantStyles(variant as any, colorScheme as any);

  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'posts'}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${dataFetchApiRoute}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        return [];
      }
    },
    enabled: !propData,
    retry: 1,
  });

  // Use prop data if available, otherwise use fetched data
  const blogData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className={cn("space-y-6 py-8", className)}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading posts...</span>
          </div>
        </div>
      </div>
    );
  }

  const title = ${getField('timelineTitle')};
  const subtitle = ${getField('timelineSubtitle')};
  // Support both array data and structured data with posts field
  const postItems = Array.isArray(blogData) ? blogData : (blogData?.posts || ${getField('timelinePosts')} || []);
  const readArticleButton = ${getField('readArticleButton')};

  const handlePostClick = (post: any) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      console.log('Post clicked:', post.title);
    }
  };

  const handleReadArticle = (postId: number, post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadArticle) {
      onReadArticle(postId, post);
    } else {
      console.log('Read article clicked:', post.title);
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

  const handleImageClick = (postId: number, post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(postId, post);
    } else {
      console.log('Image clicked for post:', post.title);
    }
  };

  const handleDateClick = (date: string, month: string, year: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDateClick) {
      onDateClick(date, month, year, postId);
    } else {
      console.log('Date clicked:', date + ' ' + month + ' ' + year);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="relative">
        <div className={\`absolute left-[60px] top-0 bottom-0 w-0.5 bg-\${colorScheme}-200 dark:bg-\${colorScheme}-900\`} />

        <div className="space-y-8">
          {postItems.map((post: any) => (
            <div key={post.id} className="relative">
              <div
                onClick={(e) => handleDateClick(post.date, post.month, post.year, post.id, e)}
                className="absolute left-0 top-0 flex flex-col items-center w-[120px] cursor-pointer hover:scale-105 transition-transform"
              >
                <div className={\`flex flex-col items-center justify-center w-16 h-16 rounded-full bg-\${colorScheme}-600 text-white shadow-lg z-10\`}>
                  <span className="text-2xl font-bold leading-none">{post.date}</span>
                  <span className="text-[10px] font-semibold uppercase">{post.month}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{post.year}</span>
              </div>

              <div className="ml-[140px]">
                <Card 
                  onClick={() => handlePostClick(post)}
                  className="overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <div className="md:flex">
                    <div 
                      onClick={(e) => handleImageClick(post.id, post, e)}
                      className="md:w-1/3 h-48 md:h-auto overflow-hidden cursor-pointer"
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    </div>

                    <div className="md:w-2/3 p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                          className={\`flex items-center gap-1 text-sm text-\${colorScheme}-600 cursor-pointer hover:text-\${colorScheme}-700 transition-colors\`}
                        >
                          <Tag className="h-4 w-4" />
                          <span className="font-semibold">{post.category}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>

                      <h3 className={\`text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-\${colorScheme}-600 transition-colors\`}>
                        {post.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {post.excerpt}
                      </p>

                      <button 
                        onClick={(e) => handleReadArticle(post.id, post, e)}
                        className={\`mt-4 text-\${colorScheme}-600 hover:text-\${colorScheme}-700 font-medium text-sm flex items-center gap-2\`}
                      >
                        {readArticleButton} →
                      </button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineBlogList;
    `
  };

  return variants[variant] || variants.classic;
};
