/**
 * Forum Search Component Generators
 */

export interface SearchOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateSearchFilters(options: SearchOptions = {}): string {
  const { componentName = 'SearchFilters' } = options;

  return `import React from 'react';
import { Filter, Calendar, User, Tag, MessageSquare, X } from 'lucide-react';

interface FilterState {
  type: 'all' | 'threads' | 'posts' | 'members';
  category?: string;
  author?: string;
  tags: string[];
  dateRange: 'any' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'relevance' | 'date' | 'replies' | 'views';
}

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface ${componentName}Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories?: Category[];
  onClear?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  filters,
  onChange,
  categories = [],
  onClear,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const typeOptions = [
    { value: 'all', label: 'All', icon: Filter },
    { value: 'threads', label: 'Threads', icon: MessageSquare },
    { value: 'posts', label: 'Posts', icon: MessageSquare },
    { value: 'members', label: 'Members', icon: User },
  ] as const;

  const dateOptions = [
    { value: 'any', label: 'Any time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' },
  ] as const;

  const sortOptions = [
    { value: 'relevance', label: 'Most relevant' },
    { value: 'date', label: 'Most recent' },
    { value: 'replies', label: 'Most replies' },
    { value: 'views', label: 'Most views' },
  ] as const;

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.category ||
    filters.author ||
    filters.tags.length > 0 ||
    filters.dateRange !== 'any';

  const removeTag = (tag: string) => {
    onChange({ ...filters, tags: filters.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Type Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          {typeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onChange({ ...filters, type: value })}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                filters.type === value
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }\`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Filters */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        <span className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Advanced Filters
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs">
              Active
            </span>
          )}
        </span>
        <svg
          className={\`w-5 h-5 transition-transform \${expanded ? 'rotate-180' : ''}\`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => onChange({ ...filters, category: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <div className="flex flex-wrap gap-2">
              {dateOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onChange({ ...filters, dateRange: value })}
                  className={\`px-3 py-1.5 rounded-lg text-sm transition-colors \${
                    filters.dateRange === value
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }\`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
            >
              {sortOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Author
            </label>
            <input
              type="text"
              value={filters.author || ''}
              onChange={(e) => onChange({ ...filters, author: e.target.value || undefined })}
              placeholder="Filter by author username"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm"
            />
          </div>

          {/* Active Tags */}
          {filters.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {filters.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && onClear && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <X className="w-4 h-4" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateSearchResults(options: SearchOptions = {}): string {
  const { componentName = 'SearchResults', endpoint = '/forum/search' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Loader2, Search, MessageSquare, User, Clock,
  Eye, ThumbsUp, ChevronRight, FileText, Hash
} from 'lucide-react';
import { api } from '@/lib/api';

interface SearchResult {
  id: string;
  type: 'thread' | 'post' | 'member';
  title?: string;
  content?: string;
  name?: string;
  username?: string;
  avatar_url?: string;
  thread_id?: string;
  thread_title?: string;
  category_name?: string;
  category_slug?: string;
  author_name?: string;
  author_avatar?: string;
  created_at: string;
  reply_count?: number;
  view_count?: number;
  like_count?: number;
  post_count?: number;
  highlights?: string[];
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  per_page: number;
}

interface ${componentName}Props {
  query: string;
  filters?: {
    type?: string;
    category?: string;
    author?: string;
    dateRange?: string;
    sortBy?: string;
  };
}

const ${componentName}: React.FC<${componentName}Props> = ({ query, filters = {} }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['search', query, filters],
    queryFn: async () => {
      const params = new URLSearchParams({ q: query, ...filters });
      const response = await api.get<SearchResponse>('${endpoint}?' + params.toString());
      return response?.data || response;
    },
    enabled: query.length > 0,
  });

  if (!query) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Start searching
        </h3>
        <p className="text-gray-500">
          Enter a search term to find threads, posts, and members
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const results = data?.results || [];
  const total = data?.total || 0;

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No results found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Found <span className="font-semibold text-gray-900 dark:text-white">{total}</span> results for "{query}"
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {results.map((result) => (
          <div key={\`\${result.type}-\${result.id}\`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            {result.type === 'thread' && (
              <Link to={\`/forum/thread/\${result.id}\`} className="block">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase">
                        Thread
                      </span>
                      {result.category_name && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">in</span>
                          <span className="text-xs text-gray-500">{result.category_name}</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mt-1">
                      {result.title}
                    </h3>
                    {result.highlights && result.highlights.length > 0 && (
                      <p
                        className="text-sm text-gray-500 mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: result.highlights[0] }}
                      />
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {result.author_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(result.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {result.reply_count || 0} replies
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {result.view_count || 0} views
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            )}

            {result.type === 'post' && (
              <Link to={\`/forum/thread/\${result.thread_id}#post-\${result.id}\`} className="block">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">
                        Post
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">in</span>
                      <span className="text-xs text-gray-500 truncate">
                        {result.thread_title}
                      </span>
                    </div>
                    {result.highlights && result.highlights.length > 0 ? (
                      <p
                        className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: result.highlights[0] }}
                      />
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                        {result.content}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {result.author_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(result.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {result.like_count || 0}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            )}

            {result.type === 'member' && (
              <Link to={\`/forum/member/\${result.username || result.id}\`} className="block">
                <div className="flex items-center gap-3">
                  {result.avatar_url ? (
                    <img
                      src={result.avatar_url}
                      alt=""
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase">
                        Member
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {result.name || result.username}
                    </h3>
                    <p className="text-sm text-gray-500">@{result.username}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {result.post_count || 0}
                    </p>
                    <p className="text-xs text-gray-500">posts</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateMemberSearch(options: SearchOptions = {}): string {
  const { componentName = 'MemberSearch', endpoint = '/forum/members/search' } = options;

  return `import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Loader2, Search, User, X, MessageSquare, Award, Calendar,
  CheckCircle, Filter
} from 'lucide-react';
import { api } from '@/lib/api';

interface Member {
  id: string;
  name?: string;
  username: string;
  avatar_url?: string;
  role?: string;
  post_count: number;
  reputation: number;
  joined_at: string;
  is_online?: boolean;
  badges?: { id: string; name: string; color?: string }[];
}

interface ${componentName}Props {
  onSelect?: (member: Member) => void;
  selectedIds?: string[];
  placeholder?: string;
  multiple?: boolean;
  maxSelections?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onSelect,
  selectedIds = [],
  placeholder = 'Search members...',
  multiple = false,
  maxSelections = 10,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: members, isLoading } = useQuery({
    queryKey: ['member-search', debouncedQuery, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('q', debouncedQuery);
      if (roleFilter) params.set('role', roleFilter);
      params.set('limit', '20');

      const response = await api.get<Member[]>('${endpoint}?' + params.toString());
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleSelect = useCallback((member: Member) => {
    if (multiple && selectedIds.length >= maxSelections) {
      return;
    }
    onSelect?.(member);
    if (!multiple) {
      setQuery('');
      setIsOpen(false);
    }
  }, [onSelect, multiple, selectedIds, maxSelections]);

  const isSelected = (memberId: string) => selectedIds.includes(memberId);

  const roles = ['admin', 'moderator', 'member', 'vip'];

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Role Filter */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <div className="flex gap-1">
                <button
                  onClick={() => setRoleFilter('')}
                  className={\`px-2 py-1 rounded text-xs font-medium transition-colors \${
                    !roleFilter
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }\`}
                >
                  All
                </button>
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={\`px-2 py-1 rounded text-xs font-medium capitalize transition-colors \${
                      roleFilter === role
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }\`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : members && members.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {members.map((member) => {
                  const selected = isSelected(member.id);
                  const disabled = multiple && selectedIds.length >= maxSelections && !selected;

                  return (
                    <button
                      key={member.id}
                      onClick={() => !disabled && handleSelect(member)}
                      disabled={disabled}
                      className={\`w-full flex items-center gap-3 p-3 text-left transition-colors \${
                        disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : selected
                          ? 'bg-purple-50 dark:bg-purple-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }\`}
                    >
                      <div className="relative">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                        )}
                        {member.is_online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white truncate">
                            {member.name || member.username}
                          </span>
                          {member.role && (
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded text-xs">
                              {member.role}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">@{member.username}</p>
                        {member.badges && member.badges.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {member.badges.slice(0, 3).map((badge) => (
                              <span
                                key={badge.id}
                                className="flex items-center gap-0.5 text-xs text-gray-500"
                                style={{ color: badge.color }}
                              >
                                <Award className="w-3 h-3" />
                                {badge.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right text-sm">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {member.post_count}
                        </p>
                        <p className="text-xs text-gray-500">posts</p>
                      </div>

                      {selected && (
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <User className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p>No members found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {multiple && selectedIds.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-center text-sm text-gray-500">
              {selectedIds.length} of {maxSelections} selected
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ${componentName};
`;
}
