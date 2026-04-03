/**
 * Knowledge Base Component Generators
 * Modular components for KB search, categories, and sidebar
 */

export interface KBOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateKBSearch(options: KBOptions = {}): string {
  const { componentName = 'KBSearch', endpoint = '/articles' } = options;

  return `import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Loader2, FileText, X, ArrowRight, History, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';

interface SearchResult {
  id: string;
  title: string;
  excerpt?: string;
  slug?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface ${componentName}Props {
  placeholder?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  placeholder = 'Search for help articles...',
  showSuggestions = true,
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kb-recent-searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: results, isLoading } = useQuery({
    queryKey: ['kb-search', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const response = await api.get<any>('${endpoint}?search=' + encodeURIComponent(query) + '&limit=5');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: query.length >= 2,
  });

  const { data: popularArticles } = useQuery({
    queryKey: ['kb-popular'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?popular=true&limit=3');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: showSuggestions && isOpen && query.length < 2,
  });

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('kb-recent-searches', JSON.stringify(updated));

    navigate('/help/search?q=' + encodeURIComponent(searchQuery));
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('kb-recent-searches');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pl-12 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </form>

      {isOpen && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {isLoading && query.length >= 2 && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}

          {!isLoading && query.length >= 2 && results && results.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Search Results
                </p>
              </div>
              <ul>
                {results.map((result: SearchResult) => (
                  <li key={result.id}>
                    <Link
                      to={\`/help/article/\${result.slug || result.id}\`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                          {result.title}
                        </p>
                        {result.excerpt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {result.excerpt}
                          </p>
                        )}
                        {result.category && (
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            {result.category.name}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 mt-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleSearch(query)}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                >
                  See all results for "{query}"
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {!isLoading && query.length >= 2 && results && results.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try different keywords or browse categories
              </p>
            </div>
          )}

          {query.length < 2 && (
            <>
              {recentSearches.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                      <History className="w-3 h-3" />
                      Recent Searches
                    </p>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                  <ul>
                    {recentSearches.map((search, index) => (
                      <li key={index}>
                        <button
                          onClick={() => {
                            setQuery(search);
                            handleSearch(search);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                        >
                          <History className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{search}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {popularArticles && popularArticles.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Popular Articles
                    </p>
                  </div>
                  <ul>
                    {popularArticles.map((article: any) => (
                      <li key={article.id}>
                        <Link
                          to={\`/help/article/\${article.slug || article.id}\`}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                            {article.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateKBCategories(options: KBOptions = {}): string {
  const { componentName = 'KBCategories', endpoint = '/articles' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Folder, ChevronRight, FileText, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  icon?: string;
  color?: string;
  article_count?: number;
  subcategories?: Category[];
}

interface ${componentName}Props {
  layout?: 'grid' | 'list';
  showArticleCount?: boolean;
  showDescription?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  layout = 'grid',
  showArticleCount = true,
  showDescription = true,
}) => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['kb-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/categories');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">No categories available</p>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {categories.map((category: Category) => (
            <Link
              key={category.id}
              to={\`/help/\${category.slug || category.id}\`}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
            >
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: (category.color || '#8B5CF6') + '20' }}
              >
                <Folder className="w-6 h-6" style={{ color: category.color || '#8B5CF6' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {category.name}
                </h3>
                {showDescription && category.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                    {category.description}
                  </p>
                )}
              </div>
              {showArticleCount && category.article_count !== undefined && (
                <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <FileText className="w-4 h-4" />
                  {category.article_count}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category: Category) => (
        <Link
          key={category.id}
          to={\`/help/\${category.slug || category.id}\`}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: (category.color || '#8B5CF6') + '20' }}
            >
              <Folder className="w-6 h-6" style={{ color: category.color || '#8B5CF6' }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                {category.name}
              </h3>
              {showArticleCount && category.article_count !== undefined && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {category.article_count} {category.article_count === 1 ? 'article' : 'articles'}
                </p>
              )}
            </div>
          </div>
          {showDescription && category.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 line-clamp-2">
              {category.description}
            </p>
          )}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <ul className="space-y-1">
                {category.subcategories.slice(0, 3).map((sub: Category) => (
                  <li key={sub.id} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ChevronRight className="w-3 h-3" />
                    {sub.name}
                  </li>
                ))}
                {category.subcategories.length > 3 && (
                  <li className="text-sm text-purple-600 dark:text-purple-400">
                    +{category.subcategories.length - 3} more
                  </li>
                )}
              </ul>
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateKBSidebar(options: KBOptions = {}): string {
  const { componentName = 'KBSidebar', endpoint = '/articles' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import {
  Loader2,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  Search,
  HelpCircle,
  MessageSquare,
  Home,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  color?: string;
  article_count?: number;
  articles?: any[];
}

interface ${componentName}Props {
  currentCategoryId?: string;
  currentArticleId?: string;
  showSearch?: boolean;
  showQuickLinks?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  currentCategoryId,
  currentArticleId,
  showSearch = true,
  showQuickLinks = true,
}) => {
  const location = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    currentCategoryId ? [currentCategoryId] : []
  );
  const [search, setSearch] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['kb-sidebar-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/categories?include_articles=true');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = categories?.map((cat: Category) => ({
    ...cat,
    articles: cat.articles?.filter((article: any) =>
      article.title.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat: Category) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    (cat.articles && cat.articles.length > 0)
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {showSearch && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter articles..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {showQuickLinks && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="space-y-1">
            <Link
              to="/help"
              className={\`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors \${
                location.pathname === '/help'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }\`}
            >
              <Home className="w-4 h-4" />
              Help Home
            </Link>
            <Link
              to="/help/faq"
              className={\`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors \${
                location.pathname === '/help/faq'
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }\`}
            >
              <HelpCircle className="w-4 h-4" />
              FAQ
            </Link>
            <Link
              to="/support"
              className={\`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors \${
                location.pathname.startsWith('/support')
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }\`}
            >
              <MessageSquare className="w-4 h-4" />
              Contact Support
            </Link>
          </nav>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Categories
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          <nav className="space-y-1">
            {filteredCategories?.map((category: Category) => (
              <div key={category.id}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={\`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors \${
                    currentCategoryId === category.id
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }\`}
                >
                  <span className="flex items-center gap-2">
                    <Folder className="w-4 h-4" style={{ color: category.color || '#8B5CF6' }} />
                    <span className="truncate">{category.name}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {category.article_count !== undefined && (
                      <span className="text-xs text-gray-400">{category.article_count}</span>
                    )}
                    {expandedCategories.includes(category.id) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </span>
                </button>

                {expandedCategories.includes(category.id) && category.articles && (
                  <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                    {category.articles.map((article: any) => (
                      <li key={article.id}>
                        <Link
                          to={\`/help/article/\${article.slug || article.id}\`}
                          className={\`flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors \${
                            currentArticleId === article.id
                              ? 'text-purple-700 dark:text-purple-400 font-medium'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                          }\`}
                        >
                          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{article.title}</span>
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        to={\`/help/\${category.slug || category.id}\`}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        View all in {category.name}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
