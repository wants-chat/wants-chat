import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSidebarNavigation = (
  resolved: ResolvedComponent,
  variant: 'fixed' | 'collapsible' | 'overlay' | 'mini' = 'fixed'
) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
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

  // Parse data source for clean prop naming
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
    return `/${dataSource || 'sidebar-navigation'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'sidebarNav' : 'sidebarNav';

  const commonImports = `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { LayoutDashboard, FolderKanban, CheckSquare, BarChart3, Users, Settings, ChevronDown, ChevronRight, Menu, X, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    fixed: `
${commonImports}

interface SidebarNavigationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SidebarNavigation({ ${dataName}: propData, className }: SidebarNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const sidebarData = ${dataName} || {};

  const [expandedMenus, setExpandedMenus] = useState<string[]>(['projects']);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const brandName = ${getField('brandName')};
  const menuItems = ${getField('menuItems')};
  const userName = ${getField('userName')};
  const userEmail = ${getField('userEmail')};
  const userAvatar = ${getField('userAvatar')};

  const handleMenuClick = (item: any) => {
    console.log('Menu item clicked:', item);
  };

  const toggleSubmenu = (itemId: string) => {
    setExpandedMenus(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      LayoutDashboard,
      FolderKanban,
      CheckSquare,
      BarChart3,
      Users,
      Settings
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={cn('w-64 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col shadow-xl', className)}>
        {/* Brand */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-current ml-0.5" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">{brandName}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item: any) => (
              <li key={item.id}>
                <div>
                  <button
                    onClick={() => {
                      if (item.submenu) {
                        toggleSubmenu(item.id);
                      } else {
                        handleMenuClick(item);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      item.active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {getIcon(item.icon)}
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {item.badge}
                      </span>
                    )}
                    {item.submenu && (
                      expandedMenus.includes(item.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )
                    )}
                  </button>

                  {/* Submenu */}
                  {item.submenu && expandedMenus.includes(item.id) && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.submenu.map((subItem: any) => (
                        <li key={subItem.id}>
                          <a
                            href={subItem.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleMenuClick(subItem);
                            }}
                            className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <span>{subItem.label}</span>
                            {subItem.badge && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                {subItem.badge}
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sidebar Navigation - Fixed</h1>
          <p className="text-gray-600 dark:text-gray-400">Fixed sidebar with nested submenus and user profile</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Card {i + 1}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sample content for the main area.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
    `,

    collapsible: `
${commonImports}

interface SidebarNavigationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SidebarNavigation({ ${dataName}: propData, className }: SidebarNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const sidebarData = ${dataName} || {};

  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['projects']);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const brandName = ${getField('brandName')};
  const menuItems = ${getField('menuItems')};
  const userName = ${getField('userName')};
  const userAvatar = ${getField('userAvatar')};

  const handleMenuClick = (item: any) => {
    console.log('Menu item clicked:', item);
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
    console.log('Sidebar collapsed:', !collapsed);
  };

  const toggleSubmenu = (itemId: string) => {
    if (!collapsed) {
      setExpandedMenus(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    }
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      LayoutDashboard,
      FolderKanban,
      CheckSquare,
      BarChart3,
      Users,
      Settings
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={cn(
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}>
        {/* Brand & Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{brandName}</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {menuItems.map((item: any) => (
              <li key={item.id}>
                <div>
                  <button
                    onClick={() => {
                      if (item.submenu) {
                        toggleSubmenu(item.id);
                      } else {
                        handleMenuClick(item);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative',
                      item.active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                    title={collapsed ? item.label : ''}
                  >
                    {getIcon(item.icon)}
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {item.badge}
                          </span>
                        )}
                        {item.submenu && (
                          expandedMenus.includes(item.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )
                        )}
                      </>
                    )}
                  </button>

                  {/* Submenu */}
                  {!collapsed && item.submenu && expandedMenus.includes(item.id) && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.submenu.map((subItem: any) => (
                        <li key={subItem.id}>
                          <a
                            href={subItem.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleMenuClick(subItem);
                            }}
                            className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <span>{subItem.label}</span>
                            {subItem.badge && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                {subItem.badge}
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            {!collapsed && (
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userName}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sidebar Navigation - Collapsible</h1>
          <p className="text-gray-600 dark:text-gray-400">Collapsible sidebar with icon-only mode</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Card {i + 1}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sample content for the main area.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
    `,

    overlay: `
${commonImports}

interface SidebarNavigationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SidebarNavigation({ ${dataName}: propData, className }: SidebarNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const sidebarData = ${dataName} || {};

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['projects']);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const brandName = ${getField('brandName')};
  const menuItems = ${getField('menuItems')};
  const userName = ${getField('userName')};
  const userEmail = ${getField('userEmail')};
  const userAvatar = ${getField('userAvatar')};

  const handleMenuClick = (item: any) => {
    console.log('Menu item clicked:', item);
    setSidebarOpen(false);
  };

  const toggleSubmenu = (itemId: string) => {
    setExpandedMenus(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      LayoutDashboard,
      FolderKanban,
      CheckSquare,
      BarChart3,
      Users,
      Settings
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        className
      )}>
        {/* Brand & Close */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{brandName}</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item: any) => (
              <li key={item.id}>
                <div>
                  <button
                    onClick={() => {
                      if (item.submenu) {
                        toggleSubmenu(item.id);
                      } else {
                        handleMenuClick(item);
                      }
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      item.active
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {getIcon(item.icon)}
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {item.badge}
                      </span>
                    )}
                    {item.submenu && (
                      expandedMenus.includes(item.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )
                    )}
                  </button>

                  {/* Submenu */}
                  {item.submenu && expandedMenus.includes(item.id) && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.submenu.map((subItem: any) => (
                        <li key={subItem.id}>
                          <a
                            href={subItem.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleMenuClick(subItem);
                            }}
                            className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <span>{subItem.label}</span>
                            {subItem.badge && (
                              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                {subItem.badge}
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img
              src={userAvatar}
              alt={userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userEmail}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        </div>

        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sidebar Navigation - Overlay</h1>
          <p className="text-gray-600 dark:text-gray-400">Overlay sidebar for mobile with backdrop</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Card {i + 1}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sample content for the main area.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
    `,

    mini: `
${commonImports}

interface SidebarNavigationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SidebarNavigation({ ${dataName}: propData, className }: SidebarNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response);
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const sidebarData = ${dataName} || {};

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const brandName = ${getField('brandName')};
  const menuItems = ${getField('menuItems')};
  const userAvatar = ${getField('userAvatar')};

  const handleMenuClick = (item: any) => {
    console.log('Menu item clicked:', item);
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      LayoutDashboard,
      FolderKanban,
      CheckSquare,
      BarChart3,
      Users,
      Settings
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mini Sidebar */}
      <aside className={cn('w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col', className)}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-current ml-0.5" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-2">
            {menuItems.map((item: any) => (
              <li key={item.id} className="relative">
                <button
                  onClick={() => handleMenuClick(item)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    'relative w-full flex items-center justify-center p-3 rounded-lg transition-colors',
                    item.active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  title={item.label}
                >
                  {getIcon(item.icon)}
                  {item.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </button>

                {/* Tooltip */}
                {hoveredItem === item.id && (
                  <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs font-medium rounded-full bg-blue-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User Avatar */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <img
            src={userAvatar}
            alt="User"
            className="w-12 h-12 rounded-full object-cover mx-auto"
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sidebar Navigation - Mini</h1>
          <p className="text-gray-600 dark:text-gray-400">Minimal icon-only sidebar with tooltips on hover</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Card {i + 1}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sample content for the main area.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.fixed;
};
