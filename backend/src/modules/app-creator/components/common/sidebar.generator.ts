/**
 * Sidebar Generator
 *
 * Generates navigation sidebar components with:
 * - Menu items with icons
 * - Collapsible sections
 * - Active state highlighting
 * - User profile section
 * - Responsive design
 */

import { pascalCase, kebabCase } from 'change-case';

export interface MenuItemConfig {
  label: string;
  icon: string;
  path?: string;
  badge?: string;
  children?: MenuItemConfig[];
}

export interface SidebarSectionConfig {
  title?: string;
  items: MenuItemConfig[];
}

export interface SidebarOptions {
  componentName?: string;
  appName?: string;
  logo?: string;
  sections: SidebarSectionConfig[];
  showUserProfile?: boolean;
  showLogout?: boolean;
  collapsible?: boolean;
}

/**
 * Generate a sidebar component
 */
export function generateSidebar(options: SidebarOptions): string {
  const {
    appName = 'App',
    logo,
    sections,
    showUserProfile = true,
    showLogout = true,
    collapsible = true,
  } = options;

  const componentName = options.componentName || 'Sidebar';

  // Collect all unique icons
  const icons = new Set(['Menu', 'X', 'ChevronDown', 'ChevronRight', 'LogOut', 'User']);
  const collectIcons = (items: MenuItemConfig[]) => {
    items.forEach(item => {
      if (item.icon) icons.add(item.icon);
      if (item.children) collectIcons(item.children);
    });
  };
  sections.forEach(section => collectIcons(section.items));

  const iconList = Array.from(icons).join(', ');

  return `import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ${iconList} } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
  user?: { name?: string; email?: string; avatar?: string };
  onLogout?: () => void;
}

interface MenuItem {
  label: string;
  icon: string;
  path?: string;
  badge?: string;
  children?: MenuItem[];
}

interface MenuSection {
  title?: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = ${JSON.stringify(sections, null, 2)};

const iconMap: Record<string, React.FC<any>> = {
  ${Array.from(icons).map(icon => `${icon}: ${icon}`).join(',\n  ')},
};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  user,
  onLogout,
}) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const Icon = iconMap[item.icon] || iconMap.Menu;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.label);
    const active = isActive(item.path);

    const content = (
      <>
        <Icon className={cn('w-5 h-5 flex-shrink-0', collapsed && depth === 0 && 'mx-auto')} />
        {(!collapsed || depth > 0) && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              isExpanded
                ? <ChevronDown className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4" />
            )}
          </>
        )}
      </>
    );

    const baseClasses = cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
      depth > 0 ? 'text-sm' : '',
      active
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    );

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(baseClasses, 'w-full text-left')}
          >
            {content}
          </button>
          {isExpanded && !collapsed && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path || '#'}
        className={baseClasses}
        onClick={() => setMobileOpen(false)}
      >
        {content}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/" className="flex items-center gap-3">
          ${logo ? `<img src="${logo}" alt="${appName}" className="w-8 h-8" />` : `<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">${appName.charAt(0)}</div>`}
          {!collapsed && <span className="text-lg font-semibold text-gray-900 dark:text-white">${appName}</span>}
        </Link>
        ${collapsible ? `<button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg lg:block hidden"
        >
          <Menu className="w-5 h-5" />
        </button>` : ''}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            {section.title && !collapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map(item => renderMenuItem(item))}
            </div>
          </div>
        ))}
      </nav>

      ${showUserProfile || showLogout ? `{/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        ${showUserProfile ? `{user && (
          <div className={cn('flex items-center gap-3 mb-3', collapsed && 'justify-center')}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
            )}
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{user.name || 'User'}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
        )}` : ''}
        ${showLogout ? `<button
          onClick={onLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>` : ''}
      </div>` : ''}
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-30 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* Mobile Close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {sidebarContent}
      </aside>
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate sidebar for a specific domain
 */
export function generateDomainSidebar(
  domain: string,
  sections: SidebarSectionConfig[],
  appName?: string
): string {
  return generateSidebar({
    componentName: pascalCase(domain) + 'Sidebar',
    appName: appName || pascalCase(domain),
    sections,
  });
}
