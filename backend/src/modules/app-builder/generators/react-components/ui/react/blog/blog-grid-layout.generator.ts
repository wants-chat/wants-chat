import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBlogGridLayout = (
  resolved: ResolvedComponent,
  variant: 'twoColumn' | 'threeColumn' | 'fourColumn' = 'threeColumn'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `data?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `data?.id || data?._id`;
    }
    // For array fields
    if (fieldName.match(/items|steps|updates|timeline|list|array|images|products|users|orders|features|links|stats|statistics|metrics|categories|tags|members|avatars|methods|examples|reviews|comments|notifications|messages|events|courses|lessons|modules|posts|articles|videos|photos|data|results|activities|cards|testimonials|faqs|questions|answers|options|choices|variants|attributes|filters|transactions|invoices|payments|receipts|shipments|deliveries/i)) {
      return `data?.${fieldName} || ([] as any[])`;
    }
    // For object fields
    if (fieldName.match(/address|metadata|config|settings|tracking|gallery/i)) {
      return `data?.${fieldName} || ({} as any)`;
    }
    // For scalar values - return empty string as fallback
    return `data?.${fieldName} || ''`;
  };

  // Helper functions to find fields dynamically
  const findFieldMapping = (targetFields: string[]): string | null => {
    for (const targetField of targetFields) {
      const mapping = resolved.fieldMappings.find(m => m.targetField === targetField);
      if (mapping?.sourceField) {
        return mapping.sourceField;
      }
    }
    return null;
  };

  // Get dynamic field names from field mappings or use common fallbacks
  const titleField = findFieldMapping(['title', 'name']) || 'title';
  const excerptField = findFieldMapping(['excerpt', 'description', 'notes', 'summary']) || 'excerpt';
  const contentField = findFieldMapping(['content', 'body', 'text']) || 'content';
  const imageField = findFieldMapping(['image', 'featured_image', 'cover_image', 'image_url', 'thumbnail', 'photo', 'logo_url']) || 'featured_image';
  const dateField = findFieldMapping(['date', 'published_at', 'created_at', 'start_date', 'updated_at']) || 'published_at';
  const categoryField = findFieldMapping(['category', 'category_name', 'type', 'tag']) || 'category';
  const authorNameField = findFieldMapping(['author_name', 'author', 'created_by', 'user']) || 'author_name';
  const viewsField = findFieldMapping(['views', 'view_count', 'visits']) || 'views';
  const commentsField = findFieldMapping(['comments', 'comment_count', 'replies']) || 'comments';

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
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    twoColumn: `
${commonImports}
import { Calendar, Clock, Eye, MessageCircle, ArrowRight, Star } from 'lucide-react';

interface TwoColumnBlogGridProps {
  data?: any;
  title?: string;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  detailRoute?: string;
  columns?: number;
  showImage?: boolean;
  showExcerpt?: boolean;
  showMeta?: boolean;
  cardStyle?: string;
  onPostClick?: (post: any) => void;
  onCategoryClick?: (category: string, postId: string | number) => void;
  onAuthorClick?: (authorName: string, postId: string | number) => void;
  onViewAll?: () => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
}

const TwoColumnBlogGrid: React.FC<TwoColumnBlogGridProps> = ({
  data: propData,
  title: titleProp,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  detailRoute,
  onPostClick,
  onCategoryClick,
  onAuthorClick,
  onViewAll
}) => {
  const navigate = useNavigate();
  const styles = getVariantStyles(variant, colorScheme);

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
  const posts: any[] = Array.isArray(data) ? data : (data?.posts || data?.items || []);
  const title = titleProp || data?.twoColumnTitle || data?.title || 'Latest Posts';
  const subtitle = data?.twoColumnSubtitle || data?.subtitle || 'Discover our recent articles';
  const readMoreButton = data?.readMoreButton || 'Read More';
  const viewAllButton = data?.viewAllButton || 'View All';
  const featuredLabel = data?.featuredLabel || 'Featured';
  const newLabel = data?.newLabel || 'New';

  // Normalize posts data structure with dynamic field mapping
  const normalizedPosts = posts.map((post: any) => {
    const title = post.${titleField} || post.title || post.name || '';
    const excerpt = post.${excerptField} || post.excerpt || post.description || post.notes || (post.${contentField}?.substring(0, 150) + '...') || (post.content?.substring(0, 150) + '...') || '';
    const image = post.${imageField} || post.featured_image || post.image || post.image_url || \`https://placehold.co/800x600?text=\${encodeURIComponent(title || 'Item')}\`;
    const authorName = post.author?.name || post.${authorNameField} || post.author_name || post.author || '';
    const authorAvatar = post.author?.avatar || post.author_avatar || (authorName ? \`https://ui-avatars.com/api/?name=\${encodeURIComponent(authorName)}&background=random\` : '');
    const authorRole = post.author?.role || post.author_role || '';
    const category = post.category?.name || post.${categoryField} || post.category_name || post.category || '';
    const categoryColor = post.category_color || 'bg-blue-600';
    const dateValue = post.${dateField} || post.published_at || post.created_at || post.start_date || post.date;
    const date = dateValue ? new Date(dateValue).toLocaleDateString() : '';
    const readTime = post.read_time || \`\${Math.ceil(((post.${contentField} || post.content || '')?.length || 2000) / 1000)} min read\`;
    const views = post.${viewsField} || post.view_count || post.views || 0;
    const comments = post.${commentsField} || post.comment_count || post.comments || 0;
    const featured = post.featured || post.is_featured || false;

    return {
      id: post.id || post._id,
      title,
      excerpt,
      image,
      author: authorName ? {
        name: authorName,
        avatar: authorAvatar,
        role: authorRole
      } : null,
      category,
      categoryColor,
      date,
      readTime,
      views,
      comments,
      featured
    };
  });

  const handlePostClick = (post: any) => {
    const postId = post.id || post._id;
    if (postId) {
      // Always navigate to detail page
      const route = detailRoute ? detailRoute.replace(':id', postId) : \`/posts/\${postId}\`;
      navigate(route);
    }
    // Also call the callback if provided
    if (onPostClick) {
      onPostClick(post);
    }
  };

  const handleCategoryClick = (category: string, postId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(category, postId);
    } else {
      console.log('Category clicked:', category);
    }
  };

  const handleAuthorClick = (authorName: string, postId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(authorName, postId);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      console.log('View all clicked');
    }
  };

  const featuredPost = normalizedPosts.find((p: any) => p.featured);
  const regularPosts = normalizedPosts.filter((p: any) => !p.featured);

  return (
    <div className={cn("space-y-8", className)}>
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className={\`text-4xl font-bold mb-3 \${styles.title}\`}>{title}</h2>
          <p className={\`text-lg \${styles.subtitle}\`}>{subtitle}</p>
        </div>
        <button
          onClick={handleViewAll}
          className={\`px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold \${styles.button} \${styles.buttonHover}\`}
        >
          {viewAllButton}
        </button>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <Card
          onClick={() => handlePostClick(featuredPost)}
          className={cn("overflow-hidden transition-all duration-300 cursor-pointer group mb-10 rounded-3xl", styles.card, styles.cardHover, styles.border)}
        >
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-80 overflow-hidden group">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300" />

              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white" />
                  {featuredLabel}
                </span>
                {featuredPost.category && (
                  <span
                    onClick={(e) => handleCategoryClick(featuredPost.category, featuredPost.id, e)}
                    className={\`\${featuredPost.categoryColor} text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xl cursor-pointer hover:opacity-90 transition-all backdrop-blur-sm\`}
                  >
                    {featuredPost.category}
                  </span>
                )}
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex gap-4 text-white">
                <div className="flex items-center gap-1 text-sm">
                  <Eye className="h-4 w-4" />
                  <span>{featuredPost.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <MessageCircle className="h-4 w-4" />
                  <span>{featuredPost.comments}</span>
                </div>
              </div>
            </div>

            <div className="p-8 flex flex-col justify-between">
              <div>
                <h3 className={cn("text-3xl font-bold mb-4 transition-colors", styles.title)}>
                  {featuredPost.title}
                </h3>
                <p className={cn("mb-6 text-lg", styles.text)}>
                  {featuredPost.excerpt}
                </p>
              </div>

              <div>
                {featuredPost.author && (
                  <div
                    onClick={(e) => handleAuthorClick(featuredPost.author.name, featuredPost.id, e)}
                    className="flex items-center gap-4 mb-4 pb-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded transition-colors"
                  >
                    <img
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{featuredPost.author.name}</p>
                      {featuredPost.author.role && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{featuredPost.author.role}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {featuredPost.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{featuredPost.date}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regularPosts.map((post: any) => (
          <Card
            key={post.id}
            onClick={() => handlePostClick(post)}
            className={cn("overflow-hidden transition-all duration-300 cursor-pointer group rounded-2xl", styles.card, styles.cardHover, styles.border)}
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute top-4 left-4 flex gap-2">
                {post.category && (
                  <span
                    onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                    className={\`\${post.categoryColor} text-white text-xs font-semibold px-3 py-1 rounded-full cursor-pointer hover:opacity-90 transition-opacity\`}
                  >
                    {post.category}
                  </span>
                )}
                {post.isNew && (
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {newLabel}
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                <div className="flex gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{post.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className={cn("text-xl font-bold mb-3 transition-colors line-clamp-2", styles.title)}>
                {post.title}
              </h3>
              <p className={cn("text-sm mb-4 line-clamp-2", styles.text)}>
                {post.excerpt}
              </p>

              {post.author && (
                <div
                  onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                  className="flex items-center gap-3 mb-4 pb-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -mx-2 rounded transition-colors"
                >
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{post.author.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {post.date && <span>{post.date}</span>}
                      {post.date && <span>•</span>}
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              )}

              <button className="font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                {readMoreButton}
                <ArrowRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TwoColumnBlogGrid;
    `,

    threeColumn: `
${commonImports}
import { Calendar, Clock, Eye, MessageCircle, ArrowRight } from 'lucide-react';

interface ThreeColumnBlogGridProps {
  data?: any;
  title?: string;
  columns?: number;
  showImage?: boolean;
  showExcerpt?: boolean;
  showMeta?: boolean;
  cardStyle?: string;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  detailRoute?: string;
  onPostClick?: (post: any) => void;
  onCategoryClick?: (category: string, postId: string | number) => void;
  onAuthorClick?: (authorName: string, postId: string | number) => void;
  onViewAll?: () => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  [key: string]: any; // Accept any additional props from catalog
}

const ThreeColumnBlogGrid: React.FC<ThreeColumnBlogGridProps> = ({
  data: propData,
  title: titleProp,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  detailRoute,
  onPostClick,
  onCategoryClick,
  onAuthorClick,
  onViewAll
}) => {
  const navigate = useNavigate();
  const styles = getVariantStyles(variant, colorScheme);

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
  const posts: any[] = Array.isArray(data) ? data : (data?.posts || data?.items || []);
  const title = titleProp || data?.threeColumnTitle || data?.title || 'All Posts';
  const subtitle = data?.threeColumnSubtitle || data?.subtitle;
  const readMoreButton = data?.readMoreButton || 'Read More';
  const viewAllButton = data?.viewAllButton || 'View All';
  const newLabel = data?.newLabel || 'New';

  // Normalize posts data structure with dynamic field mapping
  const normalizedPosts = posts.map((post: any) => {
    const title = post.${titleField} || post.title || post.name || '';
    const excerpt = post.${excerptField} || post.excerpt || post.description || post.notes || (post.${contentField}?.substring(0, 120) + '...') || (post.content?.substring(0, 120) + '...') || '';
    const image = post.${imageField} || post.featured_image || post.image || post.image_url || \`https://placehold.co/600x400?text=\${encodeURIComponent(title || 'Item')}\`;
    const authorName = post.author?.name || post.${authorNameField} || post.author_name || post.author || '';
    const authorAvatar = post.author?.avatar || post.author_avatar || (authorName ? \`https://ui-avatars.com/api/?name=\${encodeURIComponent(authorName)}&background=random\` : '');
    const authorRole = post.author?.role || post.author_role || '';
    const category = post.category?.name || post.${categoryField} || post.category_name || post.category || '';
    const categoryColor = post.category_color || 'bg-blue-600';
    const dateValue = post.${dateField} || post.published_at || post.created_at || post.start_date || post.date;
    const date = dateValue ? new Date(dateValue).toLocaleDateString() : '';
    const readTime = post.read_time || \`\${Math.ceil(((post.${contentField} || post.content || '')?.length || 2000) / 1000)} min read\`;
    const views = post.${viewsField} || post.view_count || post.views || 0;
    const comments = post.${commentsField} || post.comment_count || post.comments || 0;
    const createdAtDate = post.created_at ? new Date(post.created_at) : null;
    const isNew = post.is_new || (createdAtDate && createdAtDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) || false;

    return {
      id: post.id || post._id,
      title,
      excerpt,
      image,
      author: authorName ? {
        name: authorName,
        avatar: authorAvatar,
        role: authorRole
      } : null,
      category,
      categoryColor,
      date,
      readTime,
      views,
      comments,
      isNew
    };
  });

  const handlePostClick = (post: any) => {
    const postId = post.id || post._id;
    if (postId) {
      // Always navigate to detail page
      const route = detailRoute ? detailRoute.replace(':id', postId) : \`/posts/\${postId}\`;
      navigate(route);
    }
    // Also call the callback if provided
    if (onPostClick) {
      onPostClick(post);
    }
  };

  const handleCategoryClick = (category: string, postId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(category, postId);
    } else {
      console.log('Category clicked:', category);
    }
  };

  const handleAuthorClick = (authorName: string, postId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(authorName, postId);
    } else {
      console.log('Author clicked:', authorName);
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
    <div className={cn("space-y-8", className)}>
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className={\`text-4xl font-bold mb-3 \${styles.title}\`}>{title}</h2>
          <p className={\`text-lg \${styles.subtitle}\`}>{subtitle}</p>
        </div>
        <button
          onClick={handleViewAll}
          className={\`px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold \${styles.button} \${styles.buttonHover}\`}
        >
          {viewAllButton}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {normalizedPosts.map((post: any) => (
          <Card
            key={post.id}
            onClick={() => handlePostClick(post)}
            className={cn("overflow-hidden transition-all duration-300 cursor-pointer group rounded-2xl", styles.card, styles.cardHover, styles.border)}
          >
            <div className="relative h-52 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute top-3 left-3 flex gap-2">
                {post.category && (
                  <span
                    onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                    className={\`\${post.categoryColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:opacity-90 transition-opacity\`}
                  >
                    {post.category}
                  </span>
                )}
                {post.isNew && (
                  <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {newLabel}
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white text-xs">
                <div className="flex gap-3">
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

            <CardContent className="p-5">
              <h3 className={cn("text-lg font-bold mb-2 transition-colors line-clamp-2", styles.title)}>
                {post.title}
              </h3>
              <p className={cn("text-sm mb-4 line-clamp-2", styles.text)}>
                {post.excerpt}
              </p>

              {post.author && (
                <div
                  onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                  className="flex items-center gap-2 mb-3 pb-3 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 -mx-1.5 rounded transition-colors"
                >
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{post.author.name}</p>
                    {post.date && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{post.date}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime}</span>
                </div>
                <button className="font-medium text-xs flex items-center gap-1 group-hover:gap-2 transition-all text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  {readMoreButton}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ThreeColumnBlogGrid;
    `,

    fourColumn: `
${commonImports}
import { Clock, Eye, MessageCircle } from 'lucide-react';

interface FourColumnBlogGridProps {
  data?: any;
  title?: string;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  detailRoute?: string;
  onPostClick?: (post: any) => void;
  onCategoryClick?: (category: string, postId: string | number) => void;
  onAuthorClick?: (authorName: string, postId: string | number) => void;
  onViewAll?: () => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
}

const FourColumnBlogGrid: React.FC<FourColumnBlogGridProps> = ({
  data: propData,
  title: titleProp,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  detailRoute,
  onPostClick,
  onCategoryClick,
  onAuthorClick,
  onViewAll
}) => {
  const navigate = useNavigate();
  const styles = getVariantStyles(variant, colorScheme);

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
  const posts: any[] = Array.isArray(data) ? data : (data?.posts || data?.items || []);
  const title = titleProp || data?.fourColumnTitle || data?.title || 'Recent Posts';
  const subtitle = data?.fourColumnSubtitle || data?.subtitle || 'Explore more articles';
  const viewAllButton = data?.viewAllButton || 'View All';
  const newLabel = data?.newLabel || 'New';

  // Normalize posts data structure with dynamic field mapping
  const normalizedPosts = posts.map((post: any) => {
    const title = post.${titleField} || post.title || post.name || '';
    const excerpt = post.${excerptField} || post.excerpt || post.description || post.notes || (post.${contentField}?.substring(0, 80) + '...') || (post.content?.substring(0, 80) + '...') || '';
    const image = post.${imageField} || post.featured_image || post.image || post.image_url || \`https://placehold.co/400x300?text=\${encodeURIComponent(title || 'Item')}\`;
    const authorName = post.author?.name || post.${authorNameField} || post.author_name || post.author || '';
    const authorAvatar = post.author?.avatar || post.author_avatar || (authorName ? \`https://ui-avatars.com/api/?name=\${encodeURIComponent(authorName)}&background=random\` : '');
    const category = post.category?.name || post.${categoryField} || post.category_name || post.category || '';
    const categoryColor = post.category_color || 'bg-blue-600';
    const dateValue = post.${dateField} || post.published_at || post.created_at || post.start_date || post.date;
    const date = dateValue ? new Date(dateValue).toLocaleDateString() : '';
    const readTime = post.read_time || \`\${Math.ceil(((post.${contentField} || post.content || '')?.length || 2000) / 1000)} min read\`;
    const createdAtDate = post.created_at ? new Date(post.created_at) : null;
    const isNew = post.is_new || (createdAtDate && createdAtDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) || false;

    return {
      id: post.id || post._id,
      title,
      excerpt,
      image,
      author: authorName ? {
        name: authorName,
        avatar: authorAvatar
      } : null,
      category,
      categoryColor,
      date,
      readTime,
      isNew
    };
  });

  const handlePostClick = (post: any) => {
    const postId = post.id || post._id;
    if (postId) {
      // Always navigate to detail page
      const route = detailRoute ? detailRoute.replace(':id', postId) : \`/posts/\${postId}\`;
      navigate(route);
    }
    // Also call the callback if provided
    if (onPostClick) {
      onPostClick(post);
    }
  };

  const handleCategoryClick = (category: string, postId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCategoryClick) {
      onCategoryClick(category, postId);
    } else {
      console.log('Category clicked:', category);
    }
  };

  const handleAuthorClick = (authorName: string, postId: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(authorName, postId);
    } else {
      console.log('Author clicked:', authorName);
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
    <div className={cn("space-y-6", className)}>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className={\`text-2xl font-bold mb-1 \${styles.title}\`}>{title}</h2>
          <p className={\`text-sm \${styles.subtitle}\`}>{subtitle}</p>
        </div>
        <button
          onClick={handleViewAll}
          className={\`px-5 py-2 text-sm rounded-lg transition-colors font-medium \${styles.button} \${styles.buttonHover}\`}
        >
          {viewAllButton}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {normalizedPosts.map((post: any) => (
          <Card
            key={post.id}
            onClick={() => handlePostClick(post)}
            className={cn("overflow-hidden transition-all duration-300 cursor-pointer group", styles.card, styles.cardHover, styles.border)}
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {post.category && (
                <div className="absolute top-2 left-2">
                  <span
                    onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                    className={\`\${post.categoryColor} text-white text-xs font-semibold px-2 py-0.5 rounded cursor-pointer hover:opacity-90 transition-opacity\`}
                  >
                    {post.category}
                  </span>
                </div>
              )}

              {post.isNew && (
                <div className="absolute top-2 right-2">
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                    {newLabel}
                  </span>
                </div>
              )}

              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-white text-xs">
                <div className="flex gap-2">
                  <div className="flex items-center gap-0.5">
                    <Eye className="h-3 w-3" />
                    <span>{(post.views / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <MessageCircle className="h-3 w-3" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-4">
              <h3 className={cn("text-sm font-bold mb-2 transition-colors line-clamp-2", styles.title)}>
                {post.title}
              </h3>

              {post.author && (
                <div
                  onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                  className="flex items-center gap-2 mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 -mx-1 rounded transition-colors"
                >
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{post.author.name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {post.date && (
                  <>
                    <span>{post.date}</span>
                    <span>•</span>
                  </>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FourColumnBlogGrid;
    `
  };

  return variants[variant] || variants.threeColumn;
};
