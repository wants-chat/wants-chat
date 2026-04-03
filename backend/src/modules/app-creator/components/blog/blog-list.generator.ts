/**
 * Blog List Generator for App Creator
 *
 * Generates blog/post list components with:
 * - API data fetching
 * - Grid and list layouts
 * - Featured images
 * - Author info
 * - Category/tag badges
 */

import { snakeCase, pascalCase, camelCase } from 'change-case';
import pluralize from 'pluralize';

interface BlogListOptions {
  entity?: string;
  title?: string;
  layout?: 'grid' | 'list';
  columns?: 2 | 3;
  limit?: number;
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showCategory?: boolean;
  showDate?: boolean;
  detailRoute?: string;
}

/**
 * Generate a blog list component
 */
export function generateBlogList(options: BlogListOptions = {}): string {
  const {
    entity = 'post',
    title = 'Latest Posts',
    layout = 'grid',
    columns = 3,
    limit,
    showExcerpt = true,
    showAuthor = true,
    showCategory = true,
    showDate = true,
    detailRoute = '/posts/:slug',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = `${pascalCase(entity)}List`;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, User, Folder, Loader2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  data?: any[];
  title?: string;
  className?: string;
  onPostClick?: (post: any) => void;
  limit?: number;
  layout?: 'grid' | 'list';
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showCategory?: boolean;
  showDate?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  title = '${title}',
  className,
  onPostClick,
  limit${limit ? ` = ${limit}` : ''},
  layout = '${layout}',
  showExcerpt = ${showExcerpt},
  showAuthor = ${showAuthor},
  showCategory = ${showCategory},
  showDate = ${showDate},
}) => {
  const navigate = useNavigate();

  // Fetch data from API if no props provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${tableName}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/${tableName}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch ${tableName}:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
    retry: 1,
  });

  // Use prop data or fetched data
  let posts = propData && propData.length > 0 ? propData : (fetchedData || []);
  if (limit && posts.length > limit) {
    posts = posts.slice(0, limit);
  }

  const handlePostClick = (post: any) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      const slug = post.slug || post.id || post._id;
      navigate(\`${detailRoute.replace(':slug', '${slug}')}\`);
    }
  };

  const getPostImage = (post: any): string => {
    return post.featured_image || post.image_url || post.image || post.cover_image || '';
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getReadTime = (content: string): number => {
    if (!content) return 1;
    const words = content.split(/\\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (isLoading) {
    return (
      <div className={cn('py-12', className)}>
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('py-12', className)}>
        <div className="text-center text-red-500">Failed to load posts.</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={cn('py-12', className)}>
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No posts found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check back later for new content.</p>
        </div>
      </div>
    );
  }

  return (
    <section className={cn('py-12', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            {title}
          </h2>
        )}

        {layout === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 ${columns === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-8">
            {posts.map((post: any) => {
              const postId = post.id || post._id;
              const title = post.title || 'Untitled';
              const excerpt = post.excerpt || post.description || (post.content?.substring(0, 150) + '...');
              const image = getPostImage(post);
              const authorName = post.author?.name || post.author_name || 'Anonymous';
              const categoryName = post.category?.name || post.category_name;
              const date = post.published_at || post.created_at;
              const readTime = getReadTime(post.content);

              return (
                <article
                  key={postId}
                  onClick={() => handlePostClick(post)}
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  {/* Featured Image */}
                  {image && (
                    <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {showCategory && categoryName && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                            {categoryName}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {title}
                    </h3>

                    {showExcerpt && excerpt && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {showAuthor && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{authorName}</span>
                        </div>
                      )}
                      {showDate && date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(date)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{readTime} min read</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* List Layout */
          <div className="space-y-6">
            {posts.map((post: any) => {
              const postId = post.id || post._id;
              const title = post.title || 'Untitled';
              const excerpt = post.excerpt || post.description || (post.content?.substring(0, 200) + '...');
              const image = getPostImage(post);
              const authorName = post.author?.name || post.author_name || 'Anonymous';
              const categoryName = post.category?.name || post.category_name;
              const date = post.published_at || post.created_at;
              const readTime = getReadTime(post.content);

              return (
                <article
                  key={postId}
                  onClick={() => handlePostClick(post)}
                  className="group flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  {/* Image */}
                  {image && (
                    <div className="md:w-64 md:flex-shrink-0">
                      <div className="h-48 md:h-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {showCategory && categoryName && (
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium px-2 py-1 rounded">
                          {categoryName}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {title}
                    </h3>

                    {showExcerpt && excerpt && (
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {showAuthor && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{authorName}</span>
                        </div>
                      )}
                      {showDate && date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(date)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{readTime} min read</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a featured posts section
 */
export function generateFeaturedPosts(options: BlogListOptions = {}): string {
  return generateBlogList({
    ...options,
    title: options.title || 'Featured Posts',
    limit: options.limit || 3,
    layout: 'grid',
    columns: 3,
  });
}
