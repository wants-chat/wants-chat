/**
 * Blog Extras Generator
 *
 * Generates blog-related components:
 * - BlogSidebar: Sidebar with categories, recent posts, tags
 * - BlogAuthor: Author profile card
 */

import { pascalCase } from 'change-case';

export interface BlogSidebarOptions {
  componentName?: string;
  showCategories?: boolean;
  showRecentPosts?: boolean;
  showTags?: boolean;
  showSearch?: boolean;
  showNewsletter?: boolean;
  categoriesEndpoint?: string;
  recentPostsEndpoint?: string;
  tagsEndpoint?: string;
}

export interface BlogAuthorOptions {
  componentName?: string;
  showBio?: boolean;
  showSocialLinks?: boolean;
  showPostCount?: boolean;
  endpoint?: string;
}

/**
 * Generate a BlogSidebar component
 */
export function generateBlogSidebar(options: BlogSidebarOptions = {}): string {
  const {
    componentName = 'BlogSidebar',
    showCategories = true,
    showRecentPosts = true,
    showTags = true,
    showSearch = true,
    showNewsletter = false,
    categoriesEndpoint = '/categories',
    recentPostsEndpoint = '/posts?limit=5',
    tagsEndpoint = '/tags',
  } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Folder,
  FileText,
  Tag,
  ChevronRight,
  Mail,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  className?: string;
  onCategoryClick?: (category: any) => void;
  onTagClick?: (tag: any) => void;
  onPostClick?: (post: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  onCategoryClick,
  onTagClick,
  onPostClick,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  ${showNewsletter ? "const [email, setEmail] = useState('');\n  const [subscribed, setSubscribed] = useState(false);" : ''}

  ${showCategories ? `// Fetch categories
  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${categoriesEndpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        return [];
      }
    },
  });` : ''}

  ${showRecentPosts ? `// Fetch recent posts
  const { data: recentPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['blog-recent-posts'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${recentPostsEndpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch recent posts:', err);
        return [];
      }
    },
  });` : ''}

  ${showTags ? `// Fetch tags
  const { data: tags = [], isLoading: loadingTags } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${tagsEndpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
        return [];
      }
    },
  });` : ''}

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(\`/blog/search?q=\${encodeURIComponent(searchQuery)}\`);
    }
  };

  const handleCategoryClick = (category: any) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      navigate(\`/blog/category/\${category.slug || category.id}\`);
    }
  };

  const handleTagClick = (tag: any) => {
    if (onTagClick) {
      onTagClick(tag);
    } else {
      navigate(\`/blog/tag/\${tag.slug || tag.id}\`);
    }
  };

  const handlePostClick = (post: any) => {
    if (onPostClick) {
      onPostClick(post);
    } else {
      navigate(\`/blog/\${post.slug || post.id}\`);
    }
  };

  ${showNewsletter ? `const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Add newsletter subscription logic here
    setSubscribed(true);
    setEmail('');
  };` : ''}

  return (
    <aside className={cn('space-y-6', className)}>
      ${showSearch ? `{/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search</h3>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </div>` : ''}

      ${showCategories ? `{/* Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Categories
        </h3>
        {loadingCategories ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No categories found</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((category: any) => (
              <li key={category.id || category._id}>
                <button
                  onClick={() => handleCategoryClick(category)}
                  className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                  <div className="flex items-center gap-2">
                    {category.postCount !== undefined && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        {category.postCount}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>` : ''}

      ${showRecentPosts ? `{/* Recent Posts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
          Recent Posts
        </h3>
        {loadingPosts ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : recentPosts.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No posts found</p>
        ) : (
          <ul className="space-y-4">
            {recentPosts.slice(0, 5).map((post: any) => (
              <li key={post.id || post._id}>
                <button
                  onClick={() => handlePostClick(post)}
                  className="w-full text-left group"
                >
                  <div className="flex gap-3">
                    {post.thumbnail || post.image ? (
                      <img
                        src={post.thumbnail || post.image}
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 transition-colors">
                        {post.title}
                      </h4>
                      {post.createdAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>` : ''}

      ${showTags ? `{/* Tags */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Tags
        </h3>
        {loadingTags ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : tags.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No tags found</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: any) => (
              <button
                key={tag.id || tag._id}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}
      </div>` : ''}

      ${showNewsletter ? `{/* Newsletter */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 shadow-sm text-white">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Newsletter
        </h3>
        <p className="text-sm text-blue-100 mb-4">
          Subscribe to get the latest posts delivered to your inbox.
        </p>
        {subscribed ? (
          <p className="text-sm text-green-200">Thanks for subscribing!</p>
        ) : (
          <form onSubmit={handleSubscribe}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:ring-2 focus:ring-white/50 mb-3"
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>` : ''}
    </aside>
  );
};

export default ${componentName};
`;
}

/**
 * Generate a BlogAuthor component
 */
export function generateBlogAuthor(options: BlogAuthorOptions = {}): string {
  const {
    componentName = 'BlogAuthor',
    showBio = true,
    showSocialLinks = true,
    showPostCount = true,
    endpoint = '/authors',
  } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Globe,
  Twitter,
  Linkedin,
  Github,
  FileText,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ${componentName}Props {
  author?: any;
  authorId?: string;
  className?: string;
  variant?: 'compact' | 'full' | 'card';
  onAuthorClick?: (author: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  author: propAuthor,
  authorId,
  className,
  variant = 'card',
  onAuthorClick,
}) => {
  const navigate = useNavigate();

  const { data: fetchedAuthor, isLoading } = useQuery({
    queryKey: ['author', authorId],
    queryFn: async () => {
      try {
        const response = await api.get<any>(\`${endpoint}/\${authorId}\`);
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch author:', err);
        return null;
      }
    },
    enabled: !propAuthor && !!authorId,
  });

  const author = propAuthor || fetchedAuthor;

  const handleAuthorClick = () => {
    if (onAuthorClick && author) {
      onAuthorClick(author);
    } else if (author) {
      navigate(\`/blog/author/\${author.slug || author.id || author._id}\`);
    }
  };

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, React.FC<any>> = {
      twitter: Twitter,
      linkedin: Linkedin,
      github: Github,
      website: Globe,
      email: Mail,
    };
    return icons[platform.toLowerCase()] || Globe;
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!author) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleAuthorClick}
        className={cn('flex items-center gap-3 group', className)}
      >
        {author.avatar || author.image ? (
          <img
            src={author.avatar || author.image}
            alt={author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-500" />
          </div>
        )}
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {author.name}
          </p>
          {author.role && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{author.role}</p>
          )}
        </div>
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-start gap-4">
          {author.avatar || author.image ? (
            <img
              src={author.avatar || author.image}
              alt={author.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gray-500" />
            </div>
          )}
          <div className="flex-1">
            <button
              onClick={handleAuthorClick}
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {author.name}
            </button>
            {author.role && (
              <p className="text-gray-600 dark:text-gray-400">{author.role}</p>
            )}
            ${showPostCount ? `{author.postCount !== undefined && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <FileText className="w-4 h-4" />
                {author.postCount} posts
              </div>
            )}` : ''}
          </div>
        </div>
        ${showBio ? `{author.bio && (
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {author.bio}
          </p>
        )}` : ''}
        ${showSocialLinks ? `{author.socialLinks && Object.keys(author.socialLinks).length > 0 && (
          <div className="flex items-center gap-3">
            {Object.entries(author.socialLinks).map(([platform, url]) => {
              if (!url) return null;
              const Icon = getSocialIcon(platform);
              return (
                <a
                  key={platform}
                  href={url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        )}` : ''}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700',
      className
    )}>
      <div className="flex items-start gap-4">
        {author.avatar || author.image ? (
          <img
            src={author.avatar || author.image}
            alt={author.name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-gray-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <button
            onClick={handleAuthorClick}
            className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {author.name}
          </button>
          {author.role && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{author.role}</p>
          )}
          ${showPostCount ? `{author.postCount !== undefined && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <FileText className="w-4 h-4" />
              {author.postCount} posts published
            </div>
          )}` : ''}
        </div>
      </div>

      ${showBio ? `{author.bio && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {author.bio}
        </p>
      )}` : ''}

      ${showSocialLinks ? `{author.socialLinks && Object.keys(author.socialLinks).length > 0 && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {Object.entries(author.socialLinks).map(([platform, url]) => {
            if (!url) return null;
            const Icon = getSocialIcon(platform);
            return (
              <a
                key={platform}
                href={url as string}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}
        </div>
      )}` : ''}

      <button
        onClick={handleAuthorClick}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
      >
        View all posts
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate blog sidebar for specific configuration
 */
export function generateDomainBlogSidebar(domain: string, options?: Partial<BlogSidebarOptions>): string {
  return generateBlogSidebar({
    componentName: pascalCase(domain) + 'BlogSidebar',
    ...options,
  });
}

/**
 * Generate blog author for specific configuration
 */
export function generateDomainBlogAuthor(domain: string, options?: Partial<BlogAuthorOptions>): string {
  return generateBlogAuthor({
    componentName: pascalCase(domain) + 'BlogAuthor',
    ...options,
  });
}
