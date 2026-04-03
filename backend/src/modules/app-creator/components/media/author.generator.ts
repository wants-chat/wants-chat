/**
 * Author Component Generators
 */

export interface AuthorOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAuthorCard(options: AuthorOptions = {}): string {
  const { componentName = 'AuthorCard' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Star, CheckCircle, ExternalLink } from 'lucide-react';

interface ${componentName}Props {
  author: {
    id: string;
    name: string;
    avatar_url?: string;
    bio?: string;
    book_count?: number;
    follower_count?: number;
    rating?: number;
    verified?: boolean;
    genres?: string[];
    website_url?: string;
  };
  variant?: 'card' | 'compact' | 'inline';
  onFollow?: () => void;
  isFollowing?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  author,
  variant = 'card',
  onFollow,
  isFollowing = false
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return \`\${(num / 1000000).toFixed(1)}M\`;
    if (num >= 1000) return \`\${(num / 1000).toFixed(1)}K\`;
    return num.toString();
  };

  if (variant === 'inline') {
    return (
      <Link
        to={\`/authors/\${author.id}\`}
        className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
      >
        {author.avatar_url ? (
          <img src={author.avatar_url} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <span className="text-purple-600 font-medium">{author.name.charAt(0)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
            {author.name}
            {author.verified && <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />}
          </p>
          {author.book_count !== undefined && (
            <p className="text-sm text-gray-500">{author.book_count} books</p>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={\`/authors/\${author.id}\`}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
      >
        <div className="flex items-center gap-4">
          {author.avatar_url ? (
            <img src={author.avatar_url} alt={author.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="text-2xl text-purple-600 font-medium">{author.name.charAt(0)}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
              {author.name}
              {author.verified && <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-500" />}
            </h3>
            {author.bio && (
              <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{author.bio}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
              {author.book_count !== undefined && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {author.book_count}
                </span>
              )}
              {author.follower_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {formatNumber(author.follower_count)}
                </span>
              )}
              {author.rating && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {author.rating}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Card variant (default)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Banner */}
      <div className="h-24 bg-gradient-to-r from-purple-500 to-pink-500" />

      <div className="p-6 -mt-12">
        {/* Avatar */}
        <div className="flex justify-between items-start">
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt={author.name}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="text-3xl text-purple-600 font-medium">{author.name.charAt(0)}</span>
            </div>
          )}
          {onFollow && (
            <button
              onClick={onFollow}
              className={\`mt-14 px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                isFollowing
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }\`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-4">
          <Link to={\`/authors/\${author.id}\`} className="group">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-purple-600 transition-colors">
              {author.name}
              {author.verified && <CheckCircle className="w-5 h-5 text-blue-500 fill-blue-500" />}
            </h3>
          </Link>
          {author.bio && (
            <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">{author.bio}</p>
          )}
        </div>

        {/* Genres */}
        {author.genres && author.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {author.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs"
              >
                {genre}
              </span>
            ))}
            {author.genres.length > 3 && (
              <span className="px-2 py-1 text-gray-500 text-xs">+{author.genres.length - 3} more</span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            {author.book_count !== undefined && (
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">{author.book_count}</p>
                <p className="text-xs text-gray-500">Books</p>
              </div>
            )}
            {author.follower_count !== undefined && (
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">{formatNumber(author.follower_count)}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
            )}
            {author.rating && (
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  {author.rating}
                </p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            )}
          </div>
          {author.website_url && (
            <a
              href={author.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateAuthorProfile(options: AuthorOptions = {}): string {
  const { componentName = 'AuthorProfile', endpoint = '/authors' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Loader2, BookOpen, Users, Star, CheckCircle, Calendar, MapPin, ExternalLink,
  Twitter, Globe, Mail, Share2, Award, TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  authorId: string;
  onFollow?: () => void;
  isFollowing?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ authorId, onFollow, isFollowing = false }) => {
  const [activeTab, setActiveTab] = useState<'books' | 'about' | 'reviews'>('books');

  const { data: author, isLoading } = useQuery({
    queryKey: ['author', authorId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${authorId}\`);
      return response?.data || response;
    },
  });

  const { data: books, isLoading: booksLoading } = useQuery({
    queryKey: ['author-books', authorId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${authorId}/books\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: activeTab === 'books',
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return \`\${(num / 1000000).toFixed(1)}M\`;
    if (num >= 1000) return \`\${(num / 1000).toFixed(1)}K\`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        Author not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 relative">
          {author.banner_url && (
            <img src={author.banner_url} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 -mt-16">
            {/* Avatar */}
            {author.avatar_url ? (
              <img
                src={author.avatar_url}
                alt={author.name}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shadow-lg">
                <span className="text-4xl text-purple-600 font-bold">{author.name.charAt(0)}</span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 md:pt-20">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {author.name}
                    {author.verified && <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500" />}
                  </h1>
                  {author.tagline && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{author.tagline}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                    {author.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {author.location}
                      </span>
                    )}
                    {author.joined_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {new Date(author.joined_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {onFollow && (
                    <button
                      onClick={onFollow}
                      className={\`px-6 py-2.5 rounded-lg font-medium transition-colors \${
                        isFollowing
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }\`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                  <button className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Share2 className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{author.book_count || 0}</p>
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <BookOpen className="w-4 h-4" /> Books
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(author.follower_count || 0)}</p>
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" /> Followers
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    {author.rating || '4.5'}
                  </p>
                  <p className="text-sm text-gray-500">Avg Rating</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{author.awards_count || 0}</p>
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    <Award className="w-4 h-4" /> Awards
                  </p>
                </div>
              </div>

              {/* Social Links */}
              {(author.website_url || author.twitter_url || author.email) && (
                <div className="flex items-center gap-3 mt-4">
                  {author.website_url && (
                    <a
                      href={author.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {author.twitter_url && (
                    <a
                      href={author.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {author.email && (
                    <a
                      href={\`mailto:\${author.email}\`}
                      className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            {(['books', 'about', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={\`px-6 py-4 text-sm font-medium border-b-2 transition-colors \${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }\`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'books' && (
            booksLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : books && books.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {books.map((book: any) => (
                  <Link
                    key={book.id}
                    to={\`/books/\${book.id}\`}
                    className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-20 h-28 object-cover rounded flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-28 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">{book.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{book.year}</p>
                      {book.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{book.rating}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                No books found
              </div>
            )
          )}

          {activeTab === 'about' && (
            <div className="prose dark:prose-invert max-w-none">
              {author.bio ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{author.bio}</p>
              ) : (
                <p className="text-gray-500">No biography available.</p>
              )}

              {author.genres && author.genres.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {author.genres.map((genre: string) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {author.awards && author.awards.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Awards & Recognition</h4>
                  <ul className="space-y-2">
                    {author.awards.map((award: any, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Award className="w-5 h-5 text-yellow-500" />
                        {award.name} {award.year && \`(\${award.year})\`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              Reviews coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateFeaturedArticle(options: AuthorOptions = {}): string {
  const { componentName = 'FeaturedArticle' } = options;

  return `import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye, MessageSquare, Bookmark, Share2, Heart, ChevronRight } from 'lucide-react';

interface ${componentName}Props {
  article: {
    id: string;
    title: string;
    excerpt?: string;
    content?: string;
    cover_url?: string;
    author: {
      id: string;
      name: string;
      avatar_url?: string;
    };
    published_at?: string;
    reading_time?: number;
    view_count?: number;
    comment_count?: number;
    like_count?: number;
    category?: string;
    tags?: string[];
  };
  variant?: 'hero' | 'card' | 'horizontal';
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  article,
  variant = 'hero',
  onBookmark,
  isBookmarked = false
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return \`\${(num / 1000).toFixed(1)}K\`;
    return num.toString();
  };

  if (variant === 'horizontal') {
    return (
      <Link
        to={\`/articles/\${article.id}\`}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex group hover:shadow-lg transition-shadow"
      >
        <div className="relative w-64 flex-shrink-0">
          {article.cover_url ? (
            <img
              src={article.cover_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
          )}
          {article.category && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded">
              {article.category}
            </span>
          )}
        </div>
        <div className="flex-1 p-5">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{article.excerpt}</p>
          )}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              {article.author.avatar_url ? (
                <img src={article.author.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-sm text-purple-600 font-medium">{article.author.name.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{article.author.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {article.published_at && <span>{formatDate(article.published_at)}</span>}
                  {article.reading_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.reading_time} min
                    </span>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-lg transition-shadow">
        <Link to={\`/articles/\${article.id}\`} className="block">
          <div className="relative aspect-[16/9] overflow-hidden">
            {article.cover_url ? (
              <img
                src={article.cover_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500" />
            )}
            {article.category && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                {article.category}
              </span>
            )}
          </div>
        </Link>

        <div className="p-5">
          <Link to={\`/articles/\${article.id}\`}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors line-clamp-2">
              {article.title}
            </h3>
          </Link>
          {article.excerpt && (
            <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{article.excerpt}</p>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link to={\`/authors/\${article.author.id}\`} className="flex items-center gap-2">
              {article.author.avatar_url ? (
                <img src={article.author.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-sm text-purple-600 font-medium">{article.author.name.charAt(0)}</span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600">
                {article.author.name}
              </span>
            </Link>
            <div className="flex items-center gap-3 text-gray-400">
              {article.reading_time && (
                <span className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4" />
                  {article.reading_time}m
                </span>
              )}
              {onBookmark && (
                <button
                  onClick={(e) => { e.preventDefault(); onBookmark(); }}
                  className={\`p-1 hover:text-purple-600 \${isBookmarked ? 'text-purple-600' : ''}\`}
                >
                  <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hero variant (default)
  return (
    <div className="relative rounded-2xl overflow-hidden group">
      {/* Background Image */}
      <div className="aspect-[21/9] lg:aspect-[3/1]">
        {article.cover_url ? (
          <img
            src={article.cover_url}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-10">
        <div className="max-w-3xl">
          {article.category && (
            <span className="inline-block px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full mb-4">
              {article.category}
            </span>
          )}

          <Link to={\`/articles/\${article.id}\`}>
            <h2 className="text-2xl lg:text-4xl font-bold text-white group-hover:text-purple-300 transition-colors">
              {article.title}
            </h2>
          </Link>

          {article.excerpt && (
            <p className="text-gray-300 mt-3 text-lg line-clamp-2 hidden sm:block">{article.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-6">
            <Link to={\`/authors/\${article.author.id}\`} className="flex items-center gap-3">
              {article.author.avatar_url ? (
                <img src={article.author.avatar_url} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-white bg-purple-500 flex items-center justify-center">
                  <span className="text-white font-medium">{article.author.name.charAt(0)}</span>
                </div>
              )}
              <div>
                <p className="font-medium text-white hover:text-purple-300 transition-colors">{article.author.name}</p>
                <p className="text-sm text-gray-400">
                  {article.published_at && formatDate(article.published_at)}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4 text-gray-400 text-sm ml-auto">
              {article.reading_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.reading_time} min read
                </span>
              )}
              {article.view_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatNumber(article.view_count)}
                </span>
              )}
              {article.like_count !== undefined && (
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {formatNumber(article.like_count)}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.slice(0, 4).map((tag) => (
                <Link
                  key={tag}
                  to={\`/tags/\${tag}\`}
                  className="px-2 py-1 bg-white/10 text-white/80 rounded text-sm hover:bg-white/20 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button className="p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
          <Share2 className="w-5 h-5 text-white" />
        </button>
        {onBookmark && (
          <button
            onClick={onBookmark}
            className={\`p-2 backdrop-blur-sm rounded-full transition-colors \${
              isBookmarked ? 'bg-purple-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }\`}
          >
            <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
