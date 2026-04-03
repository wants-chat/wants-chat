/**
 * Forum Header Component Generators
 */

export interface HeaderOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateForumHeader(options: HeaderOptions = {}): string {
  const { componentName = 'ForumHeader', endpoint = '/forum/stats' } = options;

  return `import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Users, TrendingUp, Bell, Search, Menu, X, Home, Bookmark, Settings } from 'lucide-react';
import { api } from '@/lib/api';

interface ForumStats {
  total_threads: number;
  total_posts: number;
  total_members: number;
  online_members: number;
}

const ${componentName}: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: stats } = useQuery({
    queryKey: ['forum-stats'],
    queryFn: async () => {
      const response = await api.get<ForumStats>('${endpoint}');
      return response?.data || response;
    },
  });

  const navLinks = [
    { path: '/forum', label: 'Home', icon: Home },
    { path: '/forum/categories', label: 'Categories', icon: MessageSquare },
    { path: '/forum/members', label: 'Members', icon: Users },
    { path: '/forum/leaderboard', label: 'Leaderboard', icon: TrendingUp },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = \`/forum/search?q=\${encodeURIComponent(searchQuery)}\`;
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/forum" className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Forum</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                  isActive(path)
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }\`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-48 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            )}

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-500" />
              ) : (
                <Menu className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="hidden lg:flex items-center gap-6 py-2 text-sm text-gray-500 border-t border-gray-100 dark:border-gray-700">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {stats.total_threads?.toLocaleString() || 0} Threads
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {stats.total_posts?.toLocaleString() || 0} Posts
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {stats.total_members?.toLocaleString() || 0} Members
            </span>
            <span className="flex items-center gap-1 text-green-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {stats.online_members || 0} Online
            </span>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-2 px-4">
          <nav className="space-y-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={\`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors \${
                  isActive(path)
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }\`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default ${componentName};
`;
}

export function generateForumSidebar(options: HeaderOptions = {}): string {
  const { componentName = 'ForumSidebar', endpoint = '/forum' } = options;

  return `import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Home, MessageSquare, Users, TrendingUp, Bookmark,
  Bell, Settings, HelpCircle, Tag, Clock, Star,
  ChevronDown, ChevronRight, Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug?: string;
  color?: string;
  thread_count?: number;
}

interface ${componentName}Props {
  collapsed?: boolean;
  onToggle?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  const [categoriesExpanded, setCategoriesExpanded] = React.useState(true);

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['forum-categories-sidebar'],
    queryFn: async () => {
      const response = await api.get<Category[]>('${endpoint}/categories?limit=10');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const mainLinks = [
    { path: '/forum', label: 'Home', icon: Home },
    { path: '/forum/recent', label: 'Recent', icon: Clock },
    { path: '/forum/popular', label: 'Popular', icon: TrendingUp },
    { path: '/forum/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { path: '/forum/notifications', label: 'Notifications', icon: Bell },
  ];

  const bottomLinks = [
    { path: '/forum/settings', label: 'Settings', icon: Settings },
    { path: '/forum/help', label: 'Help', icon: HelpCircle },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (collapsed) {
    return (
      <aside className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col py-4">
        <nav className="flex-1 flex flex-col items-center gap-2">
          {mainLinks.map(({ path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={\`p-3 rounded-lg transition-colors \${
                isActive(path)
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }\`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {/* Main Links */}
        {mainLinks.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={\`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${
              isActive(path)
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }\`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}

        {/* Categories Section */}
        <div className="pt-4">
          <button
            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <span className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Categories
            </span>
            {categoriesExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {categoriesExpanded && (
            <div className="mt-1 space-y-0.5">
              {categoriesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : categories && categories.length > 0 ? (
                <>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={\`/forum/\${category.slug || category.id}\`}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: category.color || '#8B5CF6' }}
                      />
                      <span className="flex-1 truncate">{category.name}</span>
                      {category.thread_count !== undefined && (
                        <span className="text-xs text-gray-400">{category.thread_count}</span>
                      )}
                    </Link>
                  ))}
                  <Link
                    to="/forum/categories"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
                  >
                    View all categories
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </>
              ) : (
                <p className="px-3 py-2 text-sm text-gray-500">No categories</p>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Links */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4 px-3 space-y-1">
        {bottomLinks.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={\`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors \${
              isActive(path)
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }\`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default ${componentName};
`;
}

export function generateSubforumList(options: HeaderOptions = {}): string {
  const { componentName = 'SubforumList', endpoint = '/forum/subforums' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Loader2, MessageSquare, Users, ChevronRight, Lock, Pin } from 'lucide-react';
import { api } from '@/lib/api';

interface Subforum {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  thread_count: number;
  post_count: number;
  is_private?: boolean;
  is_pinned?: boolean;
  last_activity?: {
    thread_title: string;
    author_name: string;
    created_at: string;
  };
  moderators?: {
    id: string;
    name: string;
    avatar_url?: string;
  }[];
}

interface ${componentName}Props {
  categoryId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ categoryId }) => {
  const params = useParams<{ categoryId: string }>();
  const activeCategoryId = categoryId || params.categoryId;

  const { data: subforums, isLoading } = useQuery({
    queryKey: ['subforums', activeCategoryId],
    queryFn: async () => {
      const url = activeCategoryId
        ? '${endpoint}?category_id=' + activeCategoryId
        : '${endpoint}';
      const response = await api.get<Subforum[]>(url);
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

  if (!subforums || subforums.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        No subforums found
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {subforums.map((subforum) => (
          <Link
            key={subforum.id}
            to={\`/forum/\${subforum.slug || subforum.id}\`}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {/* Icon */}
            <div
              className="flex-shrink-0 p-3 rounded-xl"
              style={{ backgroundColor: (subforum.color || '#8B5CF6') + '20' }}
            >
              <MessageSquare
                className="w-6 h-6"
                style={{ color: subforum.color || '#8B5CF6' }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {subforum.is_pinned && (
                  <Pin className="w-4 h-4 text-purple-500" />
                )}
                {subforum.is_private && (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {subforum.name}
                </h3>
              </div>
              {subforum.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                  {subforum.description}
                </p>
              )}
              {subforum.moderators && subforum.moderators.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-gray-400">Mods:</span>
                  <div className="flex -space-x-2">
                    {subforum.moderators.slice(0, 3).map((mod) => (
                      mod.avatar_url ? (
                        <img
                          key={mod.id}
                          src={mod.avatar_url}
                          alt={mod.name}
                          title={mod.name}
                          className="w-5 h-5 rounded-full border border-white dark:border-gray-800"
                        />
                      ) : (
                        <div
                          key={mod.id}
                          title={mod.name}
                          className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full border border-white dark:border-gray-800 flex items-center justify-center"
                        >
                          <span className="text-[10px] text-purple-600 font-medium">
                            {mod.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
              <div className="text-center">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {subforum.thread_count.toLocaleString()}
                </p>
                <p className="text-xs">Threads</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {subforum.post_count.toLocaleString()}
                </p>
                <p className="text-xs">Posts</p>
              </div>
            </div>

            {/* Last Activity */}
            {subforum.last_activity && (
              <div className="hidden lg:block text-sm text-right max-w-[180px]">
                <p className="text-gray-900 dark:text-white truncate">
                  {subforum.last_activity.thread_title}
                </p>
                <p className="text-gray-500 text-xs">
                  by {subforum.last_activity.author_name}
                </p>
                <p className="text-gray-400 text-xs">
                  {new Date(subforum.last_activity.created_at).toLocaleDateString()}
                </p>
              </div>
            )}

            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateAnnouncementList(options: HeaderOptions = {}): string {
  const { componentName = 'AnnouncementList', endpoint = '/forum/announcements' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Megaphone, Pin, Clock, ChevronRight, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  is_pinned: boolean;
  is_dismissible: boolean;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  expires_at?: string;
  link_url?: string;
  link_text?: string;
}

interface ${componentName}Props {
  limit?: number;
  showDismissed?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 5, showDismissed = false }) => {
  const [dismissedIds, setDismissedIds] = React.useState<string[]>(() => {
    const stored = localStorage.getItem('dismissed-announcements');
    return stored ? JSON.parse(stored) : [];
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['forum-announcements', limit],
    queryFn: async () => {
      const response = await api.get<Announcement[]>('${endpoint}?limit=' + limit);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const dismissAnnouncement = (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed-announcements', JSON.stringify(newDismissed));
  };

  const getTypeStyles = (type: Announcement['type']) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-500',
        };
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: AlertTriangle,
          iconColor: 'text-red-500',
        };
      default:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: Info,
          iconColor: 'text-blue-500',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const visibleAnnouncements = announcements?.filter(
    (a) => showDismissed || !dismissedIds.includes(a.id)
  );

  if (!visibleAnnouncements || visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visibleAnnouncements.map((announcement) => {
        const styles = getTypeStyles(announcement.type);
        const Icon = styles.icon;

        return (
          <div
            key={announcement.id}
            className={\`relative rounded-xl border \${styles.bg} \${styles.border} overflow-hidden\`}
          >
            {announcement.is_pinned && (
              <div className="absolute top-0 right-0 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-bl-lg flex items-center gap-1">
                <Pin className="w-3 h-3" />
                Pinned
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={\`p-2 rounded-lg \${styles.bg}\`}>
                  <Icon className={\`w-5 h-5 \${styles.iconColor}\`} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {announcement.content}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {announcement.author_avatar ? (
                        <img
                          src={announcement.author_avatar}
                          alt=""
                          className="w-4 h-4 rounded-full"
                        />
                      ) : null}
                      <span>By {announcement.author_name}</span>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <Clock className="w-3 h-3" />
                      <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                    </div>

                    {announcement.link_url && (
                      <Link
                        to={announcement.link_url}
                        className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
                      >
                        {announcement.link_text || 'Learn more'}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {announcement.is_dismissible && (
                  <button
                    onClick={() => dismissAnnouncement(announcement.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ${componentName};
`;
}
