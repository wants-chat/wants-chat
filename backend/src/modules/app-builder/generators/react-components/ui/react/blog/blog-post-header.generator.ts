import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBlogPostHeader = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'withCover' | 'minimal' = 'standard'
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
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    standard: `
${commonImports}
import { Calendar, Clock, Eye, Heart, MessageCircle, Share2, Twitter, Facebook, Linkedin, Mail, Link as LinkIcon, Check } from 'lucide-react';

interface StandardHeaderProps {
  data?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onAuthorClick?: (authorName: string) => void;
  onCategoryClick?: (category: string) => void;
  onTagClick?: (tag: string) => void;
  onShare?: (platform: string) => void;
  onLike?: (isLiked: boolean) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
  [key: string]: any; // Accept any additional props from catalog
}

const StandardBlogPostHeader: React.FC<StandardHeaderProps> = ({
  data: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  onAuthorClick,
  onCategoryClick,
  onTagClick,
  onShare,
  onLike
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const styles = getVariantStyles(variant, colorScheme);
  const headerData = postsData || {};

  // Map actual API fields to component fields - support multiple field name conventions
  const title = postsData?.title || postsData?.name || '';
  const subtitle = postsData?.excerpt || postsData?.description || postsData?.summary || '';
  const image = postsData?.featured_image || postsData?.image_url || postsData?.image || postsData?.thumbnail || 'https://placehold.co/1200x600?text=Content';

  // Handle author data (could be object or fields on post)
  const authorObj = postsData?.author || {};
  const authorName = authorObj?.name || authorObj?.email || postsData?.author_name || 'Anonymous';
  const authorAvatar = authorObj?.avatar || authorObj?.profile_picture || postsData?.author_avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(authorName)}&background=random\`;
  const authorRole = authorObj?.role || authorObj?.bio || postsData?.author_role || 'Contributor';

  // Handle date and time - support multiple date field conventions
  const dateField = postsData?.published_at || postsData?.created_at || postsData?.date;
  const publishDate = dateField ? new Date(dateField).toLocaleDateString() : new Date().toLocaleDateString();

  // Calculate reading/cooking time dynamically based on available data
  let readingTime = postsData?.read_time || postsData?.reading_time;
  if (!readingTime) {
    // For recipes: show prep + cook time
    const prepTime = postsData?.prep_time_minutes || postsData?.prep_time || 0;
    const cookTime = postsData?.cook_time_minutes || postsData?.cook_time || 0;
    const totalTime = postsData?.total_time_minutes || postsData?.total_time || (prepTime + cookTime);
    if (totalTime > 0) {
      readingTime = \`\${totalTime} min total\`;
    } else {
      // Fallback: estimate from content length
      readingTime = \`\${Math.ceil((postsData?.content?.length || 1000) / 1000)} min read\`;
    }
  }

  // Handle category data
  const categoryRaw = postsData?.category || '';
  const category = typeof categoryRaw === 'object' ? categoryRaw?.name || '' : categoryRaw;
  const categoryColor = postsData?.category_color || (typeof categoryRaw === 'object' ? categoryRaw?.color : '') || 'bg-${colorScheme}-600';

  // Handle tags
  const tagsRaw = postsData?.tags || ([] as any[]);
  const tags = tagsRaw.map((tag: any) => typeof tag === 'object' ? tag?.name || '' : tag);

  // Handle counts
  const views = postsData?.view_count || postsData?.views || 0;
  const likesCount = postsData?.like_count || postsData?.likes || 0;
  const commentsCount = postsData?.comment_count || postsData?.comments || 0;

  const shareLabel = postsData?.shareLabel || 'Share';
  const copyLinkLabel = postsData?.copyLinkLabel || 'Copy Link';

  const handleAuthorClick = () => {
    if (onAuthorClick) {
      onAuthorClick(authorName);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  const handleCategoryClick = () => {
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      console.log('Category clicked:', category);
    }
  };

  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    } else {
      console.log('Tag clicked:', tag);
    }
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    if (onLike) {
      onLike(newLikedState);
    } else {
      console.log('Like toggled:', newLikedState);
    }
  };

  const handleShare = (platform: string) => {
    if (onShare) {
      onShare(platform);
    } else {
      console.log('Share on:', platform);
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <header className={cn("mb-8", className)}>
      {/* Featured Image */}
      <div className={cn("relative w-full h-96 mb-10 rounded-3xl overflow-hidden shadow-2xl group", styles.card, styles.cardHover)}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-300" />

        {/* Category Badge */}
        <div className="absolute top-6 left-6">
          <button
            onClick={handleCategoryClick}
            className={\`\${styles.badge} px-4 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity\`}
          >
            {category}
          </button>
        </div>
      </div>

      {/* Title and Subtitle */}
      <div className="max-w-4xl mx-auto px-4">
        <h1 className={\`text-5xl md:text-6xl font-bold mb-6 leading-tight \${styles.title}\`}>
          {title}
        </h1>
        <p className={\`text-xl mb-10 leading-relaxed \${styles.subtitle}\`}>
          {subtitle}
        </p>

        {/* Author and Metadata */}
        <div className={cn("flex flex-wrap items-center gap-6 mb-6 pb-6", styles.border, "border-b")}>
          <div
            onClick={handleAuthorClick}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src={authorAvatar}
              alt={authorName}
              className={cn("w-14 h-14 rounded-full object-cover ring-2", styles.border)}
            />
            <div>
              <p className={\`font-semibold \${styles.title}\`}>{authorName}</p>
              <p className={\`text-sm \${styles.text}\`}>{authorRole}</p>
            </div>
          </div>

          <div className={\`flex flex-wrap items-center gap-4 text-sm \${styles.text}\`}>
            <div className="flex items-center gap-1">
              <Calendar className={cn("h-4 w-4", styles.accent)} />
              <span>{publishDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className={cn("h-4 w-4", styles.accent)} />
              <span>{readingTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className={cn("h-4 w-4", styles.accent)} />
              <span>{(views || 0).toLocaleString()} views</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {tags.map((tag: string, index: number) => (
            <button
              key={index}
              onClick={() => handleTagClick(tag)}
              className={\`px-3 py-1 rounded-full text-sm transition-colors \${styles.badge}\`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Engagement and Share */}
        <div className={cn("flex flex-wrap items-center justify-between gap-4 pt-6 border-t", styles.border)}>
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={\`flex items-center gap-2 transition-colors \${
                isLiked ? 'text-red-500' : styles.text + ' hover:text-red-500'
              }\`}
            >
              <Heart className={\`h-5 w-5 \${isLiked ? 'fill-red-500' : ''}\`} />
              <span className="font-medium">{likesCount + (isLiked ? 1 : 0)}</span>
            </button>

            <div className={\`flex items-center gap-2 \${styles.text}\`}>
              <MessageCircle className={cn("h-5 w-5", styles.accent)} />
              <span className="font-medium">{commentsCount}</span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors \${styles.button} \${styles.buttonHover}\`}
            >
              <Share2 className="h-4 w-4" />
              <span>{shareLabel}</span>
            </button>

            {showShareMenu && (
              <div className={cn("absolute right-0 mt-2 w-56 rounded-lg shadow-xl py-2 z-10", styles.card, styles.border, "border")}>
                <button
                  onClick={() => handleShare('twitter')}
                  className={cn("w-full flex items-center gap-3 px-4 py-2 transition-colors", styles.cardHover)}
                >
                  <Twitter className={cn("h-4 w-4", styles.accent)} />
                  <span className={styles.text}>Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className={cn("w-full flex items-center gap-3 px-4 py-2 transition-colors", styles.cardHover)}
                >
                  <Facebook className={cn("h-4 w-4", styles.accent)} />
                  <span className={styles.text}>Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className={cn("w-full flex items-center gap-3 px-4 py-2 transition-colors", styles.cardHover)}
                >
                  <Linkedin className={cn("h-4 w-4", styles.accent)} />
                  <span className={styles.text}>LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare('email')}
                  className={cn("w-full flex items-center gap-3 px-4 py-2 transition-colors", styles.cardHover)}
                >
                  <Mail className={cn("h-4 w-4", styles.text)} />
                  <span className={styles.text}>Email</span>
                </button>
                <div className={cn("border-t my-2", styles.border)} />
                <button
                  onClick={handleCopyLink}
                  className={cn("w-full flex items-center gap-3 px-4 py-2 transition-colors", styles.cardHover)}
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className={cn("h-4 w-4", styles.text)} />
                      <span className={styles.text}>{copyLinkLabel}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default StandardBlogPostHeader;
    `,

    withCover: `
${commonImports}
import { Calendar, Clock, Eye, Heart, Share2, Twitter, Facebook, Linkedin, Mail, Link as LinkIcon, Check } from 'lucide-react';

interface WithCoverHeaderProps {
  data?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onAuthorClick?: (authorName: string) => void;
  onCategoryClick?: (category: string) => void;
  onTagClick?: (tag: string) => void;
  onShare?: (platform: string) => void;
  onLike?: (isLiked: boolean) => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
}

const WithCoverBlogPostHeader: React.FC<WithCoverHeaderProps> = ({
  data: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  onAuthorClick,
  onCategoryClick,
  onTagClick,
  onShare,
  onLike
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const styles = getVariantStyles(variant, colorScheme);
  const headerData = postsData || {};

  // Map actual API fields to component fields - support multiple field name conventions
  const title = postsData?.title || postsData?.name || '';
  const subtitle = postsData?.excerpt || postsData?.description || postsData?.summary || '';
  const image = postsData?.featured_image || postsData?.image_url || postsData?.image || postsData?.thumbnail || 'https://placehold.co/1200x600?text=Content';

  // Handle author data
  const authorObj = postsData?.author || {};
  const authorName = authorObj?.name || authorObj?.email || postsData?.author_name || 'Anonymous';
  const authorAvatar = authorObj?.avatar || authorObj?.profile_picture || postsData?.author_avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(authorName)}&background=random\`;
  const authorRole = authorObj?.role || authorObj?.bio || postsData?.author_role || 'Contributor';

  // Handle date and time - support multiple date field conventions
  const dateField = postsData?.published_at || postsData?.created_at || postsData?.date;
  const publishDate = dateField ? new Date(dateField).toLocaleDateString() : new Date().toLocaleDateString();

  // Calculate reading/cooking time dynamically based on available data
  let readingTime = postsData?.read_time || postsData?.reading_time;
  if (!readingTime) {
    // For recipes: show prep + cook time
    const prepTime = postsData?.prep_time_minutes || postsData?.prep_time || 0;
    const cookTime = postsData?.cook_time_minutes || postsData?.cook_time || 0;
    const totalTime = postsData?.total_time_minutes || postsData?.total_time || (prepTime + cookTime);
    if (totalTime > 0) {
      readingTime = \`\${totalTime} min total\`;
    } else {
      // Fallback: estimate from content length
      readingTime = \`\${Math.ceil((postsData?.content?.length || 1000) / 1000)} min read\`;
    }
  }

  // Handle category and tags
  const categoryRaw = postsData?.category || '';
  const category = typeof categoryRaw === 'object' ? categoryRaw?.name || '' : categoryRaw;
  const tagsRaw = postsData?.tags || ([] as any[]);
  const tags = tagsRaw.map((tag: any) => typeof tag === 'object' ? tag?.name || '' : tag);

  // Handle counts
  const views = postsData?.view_count || postsData?.views || 0;
  const likesCount = postsData?.like_count || postsData?.likes || 0;

  const shareLabel = postsData?.shareLabel || 'Share';
  const copyLinkLabel = postsData?.copyLinkLabel || 'Copy Link';

  const handleAuthorClick = () => {
    if (onAuthorClick) {
      onAuthorClick(authorName);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  const handleCategoryClick = () => {
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      console.log('Category clicked:', category);
    }
  };

  const handleTagClick = (tag: string) => {
    if (onTagClick) {
      onTagClick(tag);
    } else {
      console.log('Tag clicked:', tag);
    }
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    if (onLike) {
      onLike(newLikedState);
    } else {
      console.log('Like toggled:', newLikedState);
    }
  };

  const handleShare = (platform: string) => {
    if (onShare) {
      onShare(platform);
    } else {
      console.log('Share on:', platform);
    }
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <header className={cn("mb-12", className)}>
      {/* Full-width Cover Image */}
      <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-4xl mx-auto w-full px-4 pb-12">
            {/* Category Badge */}
            <button
              onClick={handleCategoryClick}
              className="inline-block bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-semibold text-sm mb-6 hover:bg-white/30 transition-colors"
            >
              {category}
            </button>

            {/* Title and Subtitle */}
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl">
              {subtitle}
            </p>

            {/* Author and Metadata */}
            <div className="flex flex-wrap items-center gap-6">
              <div
                onClick={handleAuthorClick}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/50"
                />
                <div>
                  <p className="font-semibold text-white">{authorName}</p>
                  <p className="text-sm text-white/80">{authorRole}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{publishDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{(views || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tags and Actions Bar */}
      <div className="max-w-4xl mx-auto px-4 py-6 border-b dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag: string, index: number) => (
              <button
                key={index}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={\`flex items-center gap-2 transition-colors \${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }\`}
            >
              <Heart className={\`h-5 w-5 \${isLiked ? 'fill-red-500' : ''}\`} />
              <span className="font-medium">{likesCount + (isLiked ? 1 : 0)}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-${colorScheme}-600 text-white rounded-lg hover:bg-${colorScheme}-700 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>{shareLabel}</span>
              </button>

              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 py-2 z-10">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Twitter className="h-4 w-4 text-${colorScheme}-400" />
                    <span className="text-gray-900 dark:text-white">Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Facebook className="h-4 w-4 text-${colorScheme}-600" />
                    <span className="text-gray-900 dark:text-white">Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Linkedin className="h-4 w-4 text-${colorScheme}-700" />
                    <span className="text-gray-900 dark:text-white">LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-gray-600" />
                    <span className="text-gray-900 dark:text-white">Email</span>
                  </button>
                  <div className="border-t dark:border-gray-700 my-2" />
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {linkCopied ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-green-500">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-900 dark:text-white">{copyLinkLabel}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WithCoverBlogPostHeader;
    `,

    minimal: `
${commonImports}
import { Calendar, Clock, Share2 } from 'lucide-react';

interface MinimalHeaderProps {
  data?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onAuthorClick?: (authorName: string) => void;
  onCategoryClick?: (category: string) => void;
  onShare?: () => void;
  onPostClick?: (item: any) => void;
  onReadMore?: (itemId: string | number, item?: any) => void;
  onReadArticle?: (itemId: string | number, item?: any) => void;
}

const MinimalBlogPostHeader: React.FC<MinimalHeaderProps> = ({
  data: propData,
  className,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME,
  onAuthorClick,
  onCategoryClick,
  onShare
}) => {
  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const postsData = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const styles = getVariantStyles(variant, colorScheme);
  const headerData = postsData || {};

  // Map actual API fields to component fields - support multiple field name conventions
  const title = postsData?.title || postsData?.name || '';
  const subtitle = postsData?.excerpt || postsData?.description || postsData?.summary || '';

  // Handle author data
  const authorObj = postsData?.author || {};
  const authorName = authorObj?.name || authorObj?.email || postsData?.author_name || 'Anonymous';
  const authorAvatar = authorObj?.avatar || authorObj?.profile_picture || postsData?.author_avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(authorName)}&background=random\`;

  // Handle date and time - support multiple date field conventions
  const dateField = postsData?.published_at || postsData?.created_at || postsData?.date;
  const publishDate = dateField ? new Date(dateField).toLocaleDateString() : new Date().toLocaleDateString();

  // Calculate reading/cooking time dynamically based on available data
  let readingTime = postsData?.read_time || postsData?.reading_time;
  if (!readingTime) {
    // For recipes: show prep + cook time
    const prepTime = postsData?.prep_time_minutes || postsData?.prep_time || 0;
    const cookTime = postsData?.cook_time_minutes || postsData?.cook_time || 0;
    const totalTime = postsData?.total_time_minutes || postsData?.total_time || (prepTime + cookTime);
    if (totalTime > 0) {
      readingTime = \`\${totalTime} min total\`;
    } else {
      // Fallback: estimate from content length
      readingTime = \`\${Math.ceil((postsData?.content?.length || 1000) / 1000)} min read\`;
    }
  }

  // Handle category
  const categoryRaw = postsData?.category || '';
  const category = typeof categoryRaw === 'object' ? categoryRaw?.name || '' : categoryRaw;
  const categoryColor = postsData?.category_color || (typeof categoryRaw === 'object' ? categoryRaw?.color : '') || 'bg-${colorScheme}-600';

  const handleAuthorClick = () => {
    if (onAuthorClick) {
      onAuthorClick(authorName);
    } else {
      console.log('Author clicked:', authorName);
    }
  };

  const handleCategoryClick = () => {
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      console.log('Category clicked:', category);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      console.log('Share clicked');
      if (navigator.share) {
        navigator.share({
          title: title,
          text: subtitle,
          url: window.location.href
        }).catch(err => console.log('Share cancelled'));
      }
    }
  };

  return (
    <header className={cn("max-w-3xl mx-auto mb-12 px-4", className)}>
      {/* Category Badge */}
      <button
        onClick={handleCategoryClick}
        className={\`\${categoryColor} text-white px-3 py-1 rounded-full font-semibold text-xs mb-6 inline-block hover:opacity-90 transition-opacity\`}
      >
        {category}
      </button>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        {subtitle}
      </p>

      {/* Author and Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div
            onClick={handleAuthorClick}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{authorName}</p>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{publishDate}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{readingTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleShare}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default MinimalBlogPostHeader;
    `
  };

  return variants[variant] || variants.standard;
};
