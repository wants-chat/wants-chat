import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBlogListLayout = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'detailed' | 'minimal' = 'standard'
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
import { Loader2 } from 'lucide-react';`;

  const variants = {
    standard: `
${commonImports}
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

interface StandardBlogListProps {
  ${dataName}?: any;
  className?: string;
  onPostClick?: (post: any) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onAuthorClick?: (authorName: string, postId: number) => void;
  onReadMore?: (postId: number, post: any) => void;
}

const StandardBlogList: React.FC<StandardBlogListProps> = ({
  ${dataName}: propData,
  className,
  onPostClick,
  onCategoryClick,
  onAuthorClick,
  onReadMore
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
  const postItems = ${getField('posts')};
  const readMoreButton = ${getField('readMoreButton')};
  const featuredLabel = ${getField('featuredLabel')};

  const handlePostClick = (post: BlogPost) => {
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

  const handleReadMore = (postId: number, post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadMore) {
      onReadMore(postId, post);
    } else {
      console.log('Read more clicked:', post.title);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="space-y-6">
        {postItems.map((post: BlogPost) => (
          <Card
            key={post.id}
            onClick={() => handlePostClick(post)}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col md:flex-row gap-6 p-6">
              {/* Thumbnail */}
              <div className="relative w-full md:w-72 h-48 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />
                {post.featured && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {featuredLabel}
                    </span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span
                    onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                    className={\`\${post.categoryColor} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg cursor-pointer hover:opacity-90 transition-opacity\`}
                  >
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Author Info */}
                  <div
                    onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded transition-colors"
                  >
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white">{post.author.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{post.author.role}</p>
                    </div>
                  </div>

                  {/* Metadata and CTA */}
                  <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleReadMore(post.id, post, e)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      {readMoreButton}
                      <ArrowRight className="h-4 w-4" />
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

export default StandardBlogList;
    `,

    detailed: `
${commonImports}
import { Calendar, Clock, Eye, MessageCircle, Heart, ArrowRight, Tag } from 'lucide-react';

interface DetailedBlogListProps {
  ${dataName}?: any;
  className?: string;
  onPostClick?: (post: any) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onAuthorClick?: (authorName: string, postId: number) => void;
  onTagClick?: (tag: string, postId: number) => void;
  onReadMore?: (postId: number, post: any) => void;
}

const DetailedBlogList: React.FC<DetailedBlogListProps> = ({
  ${dataName}: propData,
  className,
  onPostClick,
  onCategoryClick,
  onAuthorClick,
  onTagClick,
  onReadMore
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

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = ${dataName} || {};

  const title = ${getField('detailedTitle')};
  const subtitle = ${getField('detailedSubtitle')};
  const postItems = ${getField('posts')};
  const continueReadingButton = ${getField('continueReadingButton')};
  const trendingLabel = ${getField('trendingLabel')};

  const handlePostClick = (post: BlogPost) => {
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

  const handleTagClick = (tag: string, postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag, postId);
    } else {
      console.log('Tag clicked:', tag);
    }
  };

  const handleReadMore = (postId: number, post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReadMore) {
      onReadMore(postId, post);
    } else {
      console.log('Continue reading:', post.title);
    }
  };

  return (
    <div className={cn("space-y-8", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="space-y-8">
        {postItems.map((post: BlogPost) => (
          <Card
            key={post.id}
            onClick={() => handlePostClick(post)}
            className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
          >
            <div className="flex flex-col md:flex-row gap-0">
              {/* Large Thumbnail */}
              <div className="relative w-full md:w-96 h-80 flex-shrink-0 overflow-hidden">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                    className={\`\${post.categoryColor} text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg cursor-pointer hover:opacity-90 transition-opacity\`}
                  >
                    {post.category}
                  </span>
                  {post.trending && (
                    <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                      {trendingLabel}
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex gap-4 text-white">
                  <div className="flex items-center gap-1 text-sm">
                    <Eye className="h-4 w-4" />
                    <span>{(post.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </div>
                </div>
              </div>

              {/* Extended Content */}
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
                    {post.fullExcerpt}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag: any, index: number) => (
                      <span
                        key={index}
                        onClick={(e) => handleTagClick(tag, post.id, e)}
                        className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-3 py-1 rounded-full cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Author Info with Bio */}
                  <div
                    onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                    className="flex items-start gap-4 pb-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-3 -m-3 rounded transition-colors"
                  >
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{post.author.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{post.author.role}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{post.author.bio}</p>
                    </div>
                  </div>

                  {/* Metadata and CTA */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleReadMore(post.id, post, e)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                      {continueReadingButton}
                      <ArrowRight className="h-4 w-4" />
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

export default DetailedBlogList;
    `,

    minimal: `
${commonImports}
import { Clock } from 'lucide-react';

interface MinimalBlogListProps {
  ${dataName}?: any;
  className?: string;
  onPostClick?: (post: any) => void;
  onCategoryClick?: (category: string, postId: number) => void;
}

const MinimalBlogList: React.FC<MinimalBlogListProps> = ({
  ${dataName}: propData,
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
  const postItems = ${getField('posts')};

  const handlePostClick = (post: BlogPost) => {
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
        {postItems.map((post: BlogPost, index: number) => (
          <div key={post.id}>
            <div
              onClick={() => handlePostClick(post)}
              className="py-6 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 -mx-4 rounded-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-6 mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors flex-1">
                  {post.title}
                </h3>
                <span
                  onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors"
                >
                  {post.category}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {post.excerpt}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">{post.author.name}</span>
                <span>•</span>
                <span>{post.date}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
            {index < postItems.length - 1 && (
              <div className="border-b dark:border-gray-800" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MinimalBlogList;
    `
  };

  return variants[variant] || variants.standard;
};
