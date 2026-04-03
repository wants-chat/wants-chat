import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBlogMasonryLayout = (
  resolved: ResolvedComponent,
  variant: 'masonry' | 'waterfall' | 'pinterest' = 'masonry'
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
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    masonry: `
${commonImports}
import { Clock, Bookmark, Eye, User } from 'lucide-react';

;
  date: string;
  readTime: string;
  category: string;
  categoryColor: string;
  image: string;
  imageHeight: 'medium' | 'tall';
  saves: number;
  views: number;
}

interface MasonryBlogLayoutProps {
  ${dataName}?: any;
  className?: string;
  onPostClick?: (post: any) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onAuthorClick?: (authorName: string, postId: number) => void;
  onSave?: (postId: number, isSaved: boolean) => void;
}

const MasonryBlogLayout: React.FC<MasonryBlogLayoutProps> = ({
  ${dataName}: propData,
  className,
  onPostClick,
  onCategoryClick,
  onAuthorClick,
  onSave
}) => {
  const [savedPosts, setSavedPosts] = useState<number[]>([]);

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

  const title = ${getField('masonryTitle')};
  const subtitle = ${getField('masonrySubtitle')};
  const postItems = ${getField('posts')};
  const readMoreButton = ${getField('readMoreButton')};
  const saveButton = ${getField('saveButton')};

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

  const toggleSave = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlySaved = savedPosts.includes(postId);
    setSavedPosts(prev =>
      isCurrentlySaved ? prev.filter(id => id !== postId) : [...prev, postId]
    );
    if (onSave) {
      onSave(postId, !isCurrentlySaved);
    } else {
      console.log('Save toggled for post:', postId, 'Saved:', !isCurrentlySaved);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {postItems.map((post: any) => (
          <Card
            key={post.id}
            onClick={() => handlePostClick(post)}
            className="break-inside-avoid overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group mb-6"
          >
            <div className="relative overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className={\`w-full object-cover group-hover:scale-105 transition-transform duration-500 \${
                  post.imageHeight === 'tall' ? 'h-96' : 'h-64'
                }\`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              <div className="absolute top-3 left-3">
                <span
                  onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                  className={\`\${post.categoryColor} text-white text-xs font-semibold px-3 py-1 rounded-full cursor-pointer hover:opacity-90 transition-opacity backdrop-blur-sm\`}
                >
                  {post.category}
                </span>
              </div>

              <button
                onClick={(e) => toggleSave(post.id, e)}
                className={\`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all \${
                  savedPosts.includes(post.id)
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-yellow-500 hover:text-white'
                }\`}
              >
                <Bookmark className={\`h-4 w-4 \${savedPosts.includes(post.id) ? 'fill-white' : ''}\`} />
              </button>

              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white text-xs">
                <div className="flex gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{(post.views / 1000).toFixed(1)}k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark className="h-3 w-3" />
                    <span>{post.saves}</span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              <div
                onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                className="flex items-center gap-2 mb-3 pb-3 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 -m-2 rounded transition-colors"
              >
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{post.author.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{post.date}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{post.readTime}</span>
                </div>
                <span className="text-blue-600 hover:text-blue-700 font-medium text-xs">
                  {readMoreButton}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MasonryBlogLayout;
    `,

    waterfall: `
${commonImports}
import { Clock, Eye, Heart, Share2 } from 'lucide-react';

;
  readTime: string;
  category: string;
  categoryColor: string;
  image: string;
  imageHeight: 'medium' | 'tall';
  saves: number;
  views: number;
}

interface WaterfallBlogLayoutProps {
  ${dataName}?: any;
  className?: string;
  onPostClick?: (post: any) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onAuthorClick?: (authorName: string, postId: number) => void;
  onLike?: (postId: number, isLiked: boolean) => void;
  onShare?: (postId: number, post: BlogPost) => void;
}

const WaterfallBlogLayout: React.FC<WaterfallBlogLayoutProps> = ({
  ${dataName}: propData,
  className,
  onPostClick,
  onCategoryClick,
  onAuthorClick,
  onLike,
  onShare
}) => {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

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

  const title = ${getField('waterfallTitle')};
  const subtitle = ${getField('waterfallSubtitle')};
  const postItems = ${getField('posts')};
  const viewButton = ${getField('viewButton')};

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

  const handleShare = (postId: number, post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(postId, post);
    } else {
      console.log('Share clicked for post:', post.title);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {postItems.map((post: any) => (
          <Card
            key={post.id}
            onClick={() => handlePostClick(post)}
            className="break-inside-avoid overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group mb-4"
          >
            <div className="relative overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className={\`w-full object-cover group-hover:scale-105 transition-transform duration-500 \${
                  post.imageHeight === 'tall' ? 'h-80' : 'h-56'
                }\`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="absolute top-2 left-2">
                <span
                  onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                  className={\`\${post.categoryColor} text-white text-xs font-semibold px-2 py-1 rounded cursor-pointer hover:opacity-90 transition-opacity\`}
                >
                  {post.category}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition-colors">
                  {viewButton}
                </button>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => toggleLike(post.id, e)}
                  className={\`flex-1 p-2 rounded backdrop-blur-sm transition-all \${
                    likedPosts.includes(post.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                  }\`}
                >
                  <Heart className={\`h-4 w-4 mx-auto \${likedPosts.includes(post.id) ? 'fill-white' : ''}\`} />
                </button>
                <button
                  onClick={(e) => handleShare(post.id, post, e)}
                  className="flex-1 p-2 bg-white/90 backdrop-blur-sm rounded hover:bg-blue-500 hover:text-white transition-all text-gray-700"
                >
                  <Share2 className="h-4 w-4 mx-auto" />
                </button>
              </div>
            </div>

            <CardContent className="p-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {post.title}
              </h3>

              <div
                onClick={(e) => handleAuthorClick(post.author.name, post.id, e)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 -m-1 rounded transition-colors"
              >
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
                  {post.author.name}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
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

export default WaterfallBlogLayout;
    `,

    pinterest: `
${commonImports}
import { Bookmark, Share2, Eye } from 'lucide-react';

;
  category: string;
  categoryColor: string;
  image: string;
  imageHeight: 'medium' | 'tall';
  saves: number;
  views: number;
}

interface PinterestBlogLayoutProps {
  ${dataName}?: any;
  className?: string;
  onPostClick?: (post: any) => void;
  onCategoryClick?: (category: string, postId: number) => void;
  onSave?: (postId: number, isSaved: boolean) => void;
  onShare?: (postId: number, post: BlogPost) => void;
}

const PinterestBlogLayout: React.FC<PinterestBlogLayoutProps> = ({
  ${dataName}: propData,
  className,
  onPostClick,
  onCategoryClick,
  onSave,
  onShare
}) => {
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [hoveredPost, setHoveredPost] = useState<number | null>(null);

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

  const title = ${getField('pinterestTitle')};
  const subtitle = ${getField('pinterestSubtitle')};
  const postItems = ${getField('posts')};
  const saveButton = ${getField('saveButton')};

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

  const toggleSave = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isCurrentlySaved = savedPosts.includes(postId);
    setSavedPosts(prev =>
      isCurrentlySaved ? prev.filter(id => id !== postId) : [...prev, postId]
    );
    if (onSave) {
      onSave(postId, !isCurrentlySaved);
    } else {
      console.log('Save toggled for post:', postId, 'Saved:', !isCurrentlySaved);
    }
  };

  const handleShare = (postId: number, post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(postId, post);
    } else {
      console.log('Share clicked for post:', post.title);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {postItems.map((post: any) => (
          <div
            key={post.id}
            onClick={() => handlePostClick(post)}
            onMouseEnter={() => setHoveredPost(post.id)}
            onMouseLeave={() => setHoveredPost(null)}
            className="break-inside-avoid mb-4 cursor-pointer group"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300">
              <img
                src={post.image}
                alt={post.title}
                className={\`w-full object-cover \${
                  post.imageHeight === 'tall' ? 'h-96' : 'h-64'
                }\`}
              />
              <div className={\`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 \${
                hoveredPost === post.id ? 'opacity-100' : 'opacity-0'
              }\`} />

              {/* Hover Controls */}
              <div className={\`absolute top-3 right-3 flex gap-2 transition-all duration-300 \${
                hoveredPost === post.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
              }\`}>
                <button
                  onClick={(e) => toggleSave(post.id, e)}
                  className={\`px-4 py-2 rounded-full font-semibold shadow-lg transition-all \${
                    savedPosts.includes(post.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }\`}
                >
                  {saveButton}
                </button>
                <button
                  onClick={(e) => handleShare(post.id, post, e)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <Share2 className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              {/* Category Badge */}
              <div className="absolute top-3 left-3">
                <span
                  onClick={(e) => handleCategoryClick(post.category, post.id, e)}
                  className={\`\${post.categoryColor} text-white text-xs font-semibold px-3 py-1 rounded-full cursor-pointer hover:opacity-90 transition-opacity\`}
                >
                  {post.category}
                </span>
              </div>

              {/* Bottom Info */}
              <div className={\`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 \${
                hoveredPost === post.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }\`}>
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <div className="flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full object-cover border-2 border-white"
                    />
                    <span className="font-medium">{post.author.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{(post.views / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      <span>{post.saves}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PinterestBlogLayout;
    `
  };

  return variants[variant] || variants.masonry;
};
