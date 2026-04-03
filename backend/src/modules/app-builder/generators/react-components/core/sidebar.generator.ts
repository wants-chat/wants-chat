import { AppBlueprint } from '../../../interfaces/app-builder.types';

export function generateSidebar(blueprint: AppBlueprint, requiresAuth: boolean): string {
  // Get sections from blueprint
  const sections = blueprint.sections || [];

  // Generate navigation items from all sections and their pages
  const catalogNavItems = sections
    .map((section) => {
      const sectionName = section.name;
      const sectionId = section.id;
      const icon = getIconForSection(sectionId);

      // Get pages for this section
      const pages = section.pages || [];

      // Special handling for reports - only show main pages as submenu
      if (sectionId === 'reports') {
        const children = pages
          .filter(p => {
            // Only include pages for navigation (Budget Report, Spending Report, etc.)
            // Exclude detail pages, edit pages, create pages
            return !p.route.includes(':') &&
                   !p.route.includes('/edit') &&
                   !p.route.includes('/create');
          })
          .map(page => {
            const pageName = page.name;
            const pageRoute = page.route;
            const pageIcon = getIconForPage(page.id);

            return `      {
        name: '${pageName}',
        icon: '${pageIcon}',
        route: '${pageRoute}',
      }`;
          })
          .join(',\n');

        if (children) {
          return `  {
    name: '${sectionName}',
    icon: '${icon}',
    children: [
${children}
    ],
  },`;
        }
        return '';
      }

      // Special handling for settings - single page, no submenu
      if (sectionId === 'settings') {
        const settingsPage = pages.find(p => !p.route.includes(':'));
        if (settingsPage) {
          return `  {
    name: '${sectionName}',
    icon: '${icon}',
    route: '${settingsPage.route}',
  },`;
        }
        return '';
      }

      // For all other sections, show all navigable pages
      // Filter pages: include all pages except detail pages (with :id), edit pages, and generic entity pages
      const navPages = pages.filter(p => {
        const route = p.route;
        const name = p.name;

        // Exclude detail pages with route parameters (e.g., /tracks/:id)
        if (route.includes(':')) return false;

        // Exclude edit pages
        if (route.includes('/edit')) return false;

        // Exclude generic entity pages (these are placeholders, not real navigation items)
        if (name === 'Entity List Page' || name === 'Create Entity Page') return false;

        // Include all other pages (including list pages, create pages, and custom pages)
        return true;
      });

      // Skip section if no navigable pages
      if (navPages.length === 0) return '';

      // Build children array
      const children = navPages.map(page => {
        const pageIcon = getIconForPage(page.id);
        return `      {
        name: '${page.name}',
        icon: '${pageIcon}',
        route: '${page.route}',
      }`;
      }).join(',\n');

      return `  {
    name: '${sectionName}',
    icon: '${icon}',
    children: [
${children}
    ],
  },`;
    })
    .filter((item: any) => item !== '') // Remove empty items
    .join('\n');

  const authImports = requiresAuth
    ? `import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';`
    : '';

  const logoutButton = requiresAuth
    ? `
    <div className={cn('p-4 border-t', styles.border)}>
      <Button
        variant="ghost"
        className={cn('w-full justify-start', styles.text, styles.cardHover)}
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5 mr-2" />
        Logout
      </Button>
      <p className={\`text-xs mt-2 \${styles.subtitle}\`}>
        Built with Fluxez
      </p>
    </div>`
    : `
    <div className={cn('p-4 border-t', styles.border)}>
      <p className={\`text-xs \${styles.subtitle}\`}>
        Built with Fluxez
      </p>
    </div>`;

  const logoutHandler = requiresAuth
    ? `
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };`
    : '';

  return `import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  CalendarCheck,
  Target,
  Wallet,
  BarChart2,
  Settings,
  Plus,
  List,
  Import,
  Tags,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Eye,
  Circle,
  User,
  Users,
  Headphones,
  Mic,
  Shield,
  Music,
  Play,
  ShoppingCart,
  Package,
  Home,
  FileText,
  Calendar,
  Bell,
  Heart,
  Star,
  Search,
  Menu,
  Grid,
  Book,
  BookOpen,
  Utensils,
  Coffee,
  Camera,
  Video,
  Image,
  Mail,
  Phone,
  MapPin,
  Flag,
  Award,
  Briefcase,
  Folder,
  File,
} from 'lucide-react';
${authImports}

const iconMap: Record<string, any> = {
  // Dashboard & Layout
  'layout-dashboard': LayoutDashboard,
  dashboard: LayoutDashboard,
  home: Home,
  menu: Menu,
  grid: Grid,

  // Financial
  receipt: Receipt,
  'piggy-bank': PiggyBank,
  wallet: Wallet,
  'shopping-cart': ShoppingCart,

  // Calendar & Time
  'calendar-check': CalendarCheck,
  calendar: Calendar,

  // Goals & Stats
  target: Target,
  'bar-chart-2': BarChart2,
  'trending-up': TrendingUp,
  award: Award,

  // System
  settings: Settings,
  eye: Eye,
  bell: Bell,

  // Actions
  plus: Plus,
  search: Search,

  // Lists & Organization
  list: List,
  import: Import,
  tags: Tags,
  folder: Folder,
  file: File,

  // User & People
  user: User,
  users: Users,

  // Media & Entertainment
  headphones: Headphones,
  microphone: Mic,
  music: Music,
  play: Play,
  camera: Camera,
  video: Video,
  image: Image,

  // Security
  shield: Shield,

  // E-commerce
  package: Package,

  // Content
  'file-text': FileText,
  book: Book,
  'book-open': BookOpen,

  // Food & Dining
  utensils: Utensils,
  coffee: Coffee,

  // Communication
  mail: Mail,
  phone: Phone,

  // Location
  'map-pin': MapPin,
  flag: Flag,

  // Social
  heart: Heart,
  star: Star,

  // Business
  briefcase: Briefcase,

  // Default fallback
  circle: Circle,
};

interface NavItem {
  name: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
${catalogNavItems}
];

interface SidebarProps {
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
}

export default function Sidebar({ variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME }: SidebarProps = {}) {
  const location = useLocation();${logoutHandler}
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const styles = getVariantStyles(variant, colorScheme);

  const toggleExpand = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (item: NavItem): boolean => {
    if (item.route && location.pathname === item.route) return true;
    if (item.children) {
      return item.children.some((child) => isItemActive(child));
    }
    return false;
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const Icon = iconMap[item.icon] || Circle;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const isActive = isItemActive(item);

    // Use route as key if available, otherwise use name
    const itemKey = item.route || item.name;

    if (hasChildren) {
      return (
        <div key={itemKey} className={cn(level > 0 && 'ml-4')}>
          <button
            onClick={() => toggleExpand(item.name)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? cn(styles.button, styles.buttonHover)
                : cn(styles.text, styles.cardHover)
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              {item.name}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1 ml-4">
              {item.children?.map((child) => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    if (!item.route) return null;

    return (
      <Link
        key={itemKey}
        to={item.route}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          level > 0 && 'ml-4',
          location.pathname === item.route
            ? cn(styles.button, styles.buttonHover)
            : cn(styles.text, styles.cardHover)
        )}
      >
        <Icon className="h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className={cn('w-64 flex flex-col border-r', styles.background, styles.border)}>
      <div className={cn('p-6 border-b', styles.border)}>
        <h1 className={\`text-xl font-bold \${styles.title}\`}>${blueprint.metadata.name}</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => renderNavItem(item))}
      </nav>
${logoutButton}
    </div>
  );
}`;
}

// Helper function to get appropriate icon for section
function getIconForSection(sectionId: string | any): string {
  // Handle case where sectionId might be an object
  const rawId = typeof sectionId === 'string' ? sectionId : (sectionId?.id || sectionId?.name || 'default');
  const id = String(rawId).toLowerCase();

  // Map section IDs to icons
  const iconMap: Record<string, string> = {
    'transactions': 'receipt',
    'expenses': 'receipt',
    'budgets': 'piggy-bank',
    'bills': 'calendar-check',
    'goals': 'target',
    'accounts': 'wallet',
    'reports': 'bar-chart-2',
    'settings': 'settings',
    'dashboard': 'layout-dashboard',
    'users': 'circle',
    'profile': 'circle',
  };

  // Check exact match first
  if (iconMap[id]) return iconMap[id];

  // Fallback to partial match
  if (id.includes('transaction') || id.includes('expense')) return 'receipt';
  if (id.includes('budget')) return 'piggy-bank';
  if (id.includes('bill') || id.includes('subscription')) return 'calendar-check';
  if (id.includes('goal')) return 'target';
  if (id.includes('account')) return 'wallet';
  if (id.includes('report')) return 'bar-chart-2';
  if (id.includes('setting')) return 'settings';
  if (id.includes('user') || id.includes('profile')) return 'circle';

  // Default icon
  return 'circle';
}

// Helper function to get appropriate icon for page
function getIconForPage(pageId: string | any): string {
  // Handle case where pageId might be an object
  const rawId = typeof pageId === 'string' ? pageId : (pageId?.id || pageId?.name || 'default');
  const id = String(rawId).toLowerCase();

  // Map page IDs to icons - comprehensive mapping for all app types
  const iconMap: Record<string, string> = {
    // Dashboard & Overview
    'overview': 'eye',
    'dashboard': 'layout-dashboard',
    'home': 'home',

    // Financial
    'insights': 'trending-up',
    'spending': 'trending-up',
    'budget': 'bar-chart-2',
    'transactions': 'receipt',
    'expenses': 'receipt',
    'income': 'trending-up',
    'accounts': 'wallet',
    'bills': 'calendar-check',
    'goals': 'target',

    // Music & Media
    'my-music': 'music',
    'my-tracks': 'music',
    'my-albums': 'package',
    'my-playlists': 'list',
    'library': 'book',
    'artist-dashboard': 'microphone',
    'create-track': 'plus',
    'create-playlist': 'plus',
    'create-album': 'plus',

    // E-commerce
    'products': 'package',
    'orders': 'shopping-cart',
    'inventory': 'package',
    'customers': 'users',

    // Content
    'posts': 'file-text',
    'articles': 'file-text',
    'pages': 'file',
    'blog': 'book-open',

    // Social
    'feed': 'list',
    'messages': 'mail',
    'notifications': 'bell',
    'friends': 'users',
    'followers': 'users',

    // User
    'profile': 'user',
    'settings': 'settings',
    'account': 'user',

    // Actions
    'list': 'list',
    'add': 'plus',
    'create': 'plus',
    'search': 'search',
    'import': 'import',
  };

  // Check exact match first
  if (iconMap[id]) return iconMap[id];

  // Fallback to partial match - Music & Media
  if (id.includes('music') || id.includes('track')) return 'music';
  if (id.includes('album')) return 'package';
  if (id.includes('playlist')) return 'list';
  if (id.includes('artist')) return 'microphone';
  if (id.includes('library')) return 'book';
  if (id.includes('listen')) return 'headphones';

  // Fallback to partial match - Dashboard & Analytics
  if (id.includes('overview') || id.includes('home')) return 'eye';
  if (id.includes('dashboard')) return 'layout-dashboard';
  if (id.includes('insight') || id.includes('analytics')) return 'trending-up';

  // Fallback to partial match - Financial
  if (id.includes('spending') || id.includes('expense')) return 'trending-up';
  if (id.includes('budget')) return 'bar-chart-2';
  if (id.includes('transaction')) return 'receipt';
  if (id.includes('report')) return 'bar-chart-2';
  if (id.includes('account')) return 'wallet';
  if (id.includes('bill')) return 'calendar-check';
  if (id.includes('goal')) return 'target';

  // Fallback to partial match - E-commerce
  if (id.includes('product')) return 'package';
  if (id.includes('order')) return 'shopping-cart';
  if (id.includes('cart')) return 'shopping-cart';
  if (id.includes('inventory')) return 'package';
  if (id.includes('customer')) return 'users';

  // Fallback to partial match - Content
  if (id.includes('post') || id.includes('article')) return 'file-text';
  if (id.includes('page')) return 'file';
  if (id.includes('blog')) return 'book-open';

  // Fallback to partial match - Social
  if (id.includes('feed')) return 'list';
  if (id.includes('message') || id.includes('chat')) return 'mail';
  if (id.includes('notification')) return 'bell';
  if (id.includes('friend') || id.includes('follower') || id.includes('user')) return 'users';

  // Fallback to partial match - User & Settings
  if (id.includes('setting')) return 'settings';
  if (id.includes('profile')) return 'user';

  // Fallback to partial match - Actions
  if (id.includes('list')) return 'list';
  if (id.includes('add') || id.includes('create')) return 'plus';
  if (id.includes('search')) return 'search';
  if (id.includes('import')) return 'import';

  // Default icon
  return 'circle';
}
