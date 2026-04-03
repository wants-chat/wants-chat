/**
 * Library Component Generators
 */

export interface LibraryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLibraryStats(options: LibraryOptions = {}): string {
  const { componentName = 'LibraryStats', endpoint = '/library/stats' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, BookOpen, Users, Clock, TrendingUp, Star, Award } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  userId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['library-stats', userId],
    queryFn: async () => {
      const url = '${endpoint}' + (userId ? '?user_id=' + userId : '');
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const statCards = [
    { icon: BookOpen, label: 'Total Books', value: stats?.total_books || 0, color: 'bg-blue-500' },
    { icon: Clock, label: 'Reading Hours', value: stats?.reading_hours || 0, color: 'bg-green-500' },
    { icon: Star, label: 'Books Read', value: stats?.books_read || 0, color: 'bg-purple-500' },
    { icon: TrendingUp, label: 'This Month', value: stats?.this_month || 0, color: 'bg-orange-500' },
    { icon: Award, label: 'Achievements', value: stats?.achievements || 0, color: 'bg-pink-500' },
    { icon: Users, label: 'Following', value: stats?.following || 0, color: 'bg-indigo-500' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center gap-4">
            <div className={\`p-3 rounded-lg \${stat.color}\`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateLibraryActivity(options: LibraryOptions = {}): string {
  const { componentName = 'LibraryActivity', endpoint = '/library/activity' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, BookOpen, Star, MessageSquare, Share2, Heart, Bookmark } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  userId?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userId, limit = 10 }) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['library-activity', userId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      params.append('limit', limit.toString());
      const url = '${endpoint}?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'read': return BookOpen;
      case 'review': return Star;
      case 'comment': return MessageSquare;
      case 'share': return Share2;
      case 'like': return Heart;
      case 'bookmark': return Bookmark;
      default: return BookOpen;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'read': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'review': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'comment': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'share': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'like': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
      case 'bookmark': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {activities && activities.length > 0 ? (
          activities.map((activity: any) => {
            const Icon = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="p-4 flex gap-4">
                <div className={\`p-2 rounded-lg flex-shrink-0 \${getActivityColor(activity.type)}\`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user_name || 'You'}</span>
                    {' '}{activity.action}{' '}
                    <span className="font-medium">{activity.book_title}</span>
                  </p>
                  {activity.content && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{activity.content}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {activity.book_cover_url && (
                  <img
                    src={activity.book_cover_url}
                    alt=""
                    className="w-12 h-16 object-cover rounded flex-shrink-0"
                  />
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateLibraryTabs(options: LibraryOptions = {}): string {
  const { componentName = 'LibraryTabs', endpoint = '/library' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, BookOpen, Clock, Heart, Bookmark, Star, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  userId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Books', icon: BookOpen },
    { id: 'reading', label: 'Currently Reading', icon: Clock },
    { id: 'completed', label: 'Completed', icon: CheckCircle },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'favorites', label: 'Favorites', icon: Star },
  ];

  const { data: books, isLoading } = useQuery({
    queryKey: ['library-books', userId, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      if (activeTab !== 'all') params.append('status', activeTab);
      const url = '${endpoint}?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={\`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors \${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }\`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : books && books.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book: any) => (
              <Link
                key={book.id}
                to={\`/books/\${book.id}\`}
                className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="w-16 h-24 object-cover rounded flex-shrink-0" />
                ) : (
                  <div className="w-16 h-24 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">{book.title}</h4>
                  <p className="text-sm text-gray-500 mt-0.5">{book.author}</p>
                  {book.progress !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{book.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full"
                          style={{ width: \`\${book.progress}%\` }}
                        />
                      </div>
                    </div>
                  )}
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
            No books in this collection
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMemberProfileLibrary(options: LibraryOptions = {}): string {
  const { componentName = 'MemberProfileLibrary', endpoint = '/library/members' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, BookOpen, Users, Star, Calendar, MapPin, Award, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  memberId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ memberId }) => {
  const { data: member, isLoading } = useQuery({
    queryKey: ['library-member', memberId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${memberId}\`);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        Member not found
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Cover */}
      <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500" />

      {/* Profile */}
      <div className="px-6 pb-6">
        <div className="flex flex-col sm:flex-row gap-4 -mt-12">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.name}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="w-12 h-12 text-purple-600" />
            </div>
          )}
          <div className="flex-1 pt-2 sm:pt-12">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</h2>
                {member.username && (
                  <p className="text-gray-500">@{member.username}</p>
                )}
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Follow
              </button>
            </div>
          </div>
        </div>

        {member.bio && (
          <p className="mt-4 text-gray-700 dark:text-gray-300">{member.bio}</p>
        )}

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          {member.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {member.location}
            </span>
          )}
          {member.joined_at && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Joined {new Date(member.joined_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.books_read || 0}</p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <BookOpen className="w-4 h-4" /> Books Read
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.reviews || 0}</p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <Star className="w-4 h-4" /> Reviews
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.followers || 0}</p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <Users className="w-4 h-4" /> Followers
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.badges || 0}</p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
              <Award className="w-4 h-4" /> Badges
            </p>
          </div>
        </div>

        {/* Favorite Books */}
        {member.favorite_books && member.favorite_books.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Favorite Books</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {member.favorite_books.map((book: any) => (
                <Link key={book.id} to={\`/books/\${book.id}\`} className="flex-shrink-0">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-16 h-24 object-cover rounded hover:opacity-80 transition-opacity"
                      title={book.title}
                    />
                  ) : (
                    <div className="w-16 h-24 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateBookSearch(options: LibraryOptions = {}): string {
  const { componentName = 'BookSearch', endpoint = '/library/search' } = options;

  return `import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Search, BookOpen, Star, X, Filter, SlidersHorizontal } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onSelect?: (book: any) => void;
  placeholder?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSelect, placeholder = 'Search books...' }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating: '',
  });

  // Debounce search
  const debounceSearch = useCallback((value: string) => {
    const timer = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debounceSearch(value);
  };

  const { data: results, isLoading } = useQuery({
    queryKey: ['book-search', debouncedQuery, filters],
    queryFn: async () => {
      if (!debouncedQuery && !filters.genre && !filters.year && !filters.rating) return [];
      const params = new URLSearchParams();
      if (debouncedQuery) params.append('q', debouncedQuery);
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.year) params.append('year', filters.year);
      if (filters.rating) params.append('min_rating', filters.rating);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!(debouncedQuery || filters.genre || filters.year || filters.rating),
  });

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  const genres = ['Fiction', 'Non-Fiction', 'Mystery', 'Sci-Fi', 'Romance', 'Biography', 'History', 'Self-Help'];
  const years = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());
  const ratings = ['4', '3', '2', '1'];

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-400"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={\`p-2 rounded-lg transition-colors \${
              showFilters ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
            }\`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre</label>
              <select
                value={filters.genre}
                onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
              >
                <option value="">Any Rating</option>
                {ratings.map((rating) => (
                  <option key={rating} value={rating}>{rating}+ Stars</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}

      {results && results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
          {results.map((book: any) => (
            <div
              key={book.id}
              onClick={() => onSelect?.(book)}
              className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
            >
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-12 h-18 object-cover rounded flex-shrink-0" />
              ) : (
                <div className="w-12 h-18 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{book.title}</h4>
                <p className="text-sm text-gray-500">{book.author}</p>
                <div className="flex items-center gap-2 mt-1">
                  {book.rating && (
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      {book.rating}
                    </span>
                  )}
                  {book.year && (
                    <span className="text-sm text-gray-400">{book.year}</span>
                  )}
                  {book.genre && (
                    <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                      {book.genre}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {debouncedQuery && results && results.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No books found for "{debouncedQuery}"
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}
