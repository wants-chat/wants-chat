import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHamburgerMenu = (
  resolved: ResolvedComponent,
  variant: 'slide' | 'overlay' | 'push' = 'slide'
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
    return `/${dataSource || 'hamburger-menu'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'hamburgerMenu' : 'hamburgerMenu';

  const commonImports = `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, Menu, X, ChevronDown, ChevronRight, LayoutDashboard, Package, ShoppingCart, Users, BarChart3, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    slide: `
${commonImports}

interface HamburgerMenuProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function HamburgerMenu({ ${dataName}: propData, className }: HamburgerMenuProps) {
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

  const menuData = ${dataName} || {};

  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const brandName = ${getField('brandName')};
  const menuItems = ${getField('menuItems')};
  const userName = ${getField('userName')};
  const userEmail = ${getField('userEmail')};
  const userAvatar = ${getField('userAvatar')};
  const logoutText = ${getField('logoutText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const iconMap: { [key: string]: any } = {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter((item: any) => item !== label)
        : [...prev, label]
    );
  };

  const handleMenuItemClick = (item: any) => {
    console.log('Menu item clicked:', item);
    if (!item.children) {
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-30', className)}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{brandName}</span>
            </div>

            {/* User Avatar */}
            <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        </div>
      </header>

      {/* Slide Menu */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-2xl z-40 transform transition-all duration-300 ease-in-out',
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Menu Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">{brandName}</span>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <img
              src={userAvatar}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{userName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item: any, index: number) => {
              const Icon = iconMap[item.icon] || Package;
              const isExpanded = expandedItems.includes(item.label);
              const hasChildren = item.children && item.children.length > 0;

              return (
                <li key={index}>
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleExpanded(item.label);
                      } else {
                        handleMenuItemClick(item);
                      }
                    }}
                    className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 \${
                      item.active
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                    }\`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-medium">
                          {item.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronDown className={\`w-4 h-4 transition-transform \${isExpanded ? 'rotate-180' : ''}\`} />
                      )}
                    </div>
                  </button>

                  {hasChildren && isExpanded && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.children.map((child: any, childIndex: number) => (
                        <li key={childIndex}>
                          <a
                            href={child.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleMenuItemClick(child);
                            }}
                            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <span>{child.label}</span>
                            {child.badge && (
                              <span className={\`text-xs px-2 py-0.5 rounded-full font-medium \${
                                child.badge === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                              }\`}>
                                {child.badge}
                              </span>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Menu Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            {logoutText}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300"
          onClick={toggleMenu}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Hamburger Menu - Slide</h1>
        <p className="text-gray-600 dark:text-gray-400">Mobile-first slide-in navigation menu with user profile</p>
      </div>
    </div>
  );
}
    `,

    overlay: `
${commonImports}

interface HamburgerMenuProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function HamburgerMenu({ ${dataName}: propData, className }: HamburgerMenuProps) {
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

  const menuData = ${dataName} || {};

  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const brandName = ${getField('brandName')};
  const menuItems = ${getField('menuItems')};
  const userName = ${getField('userName')};
  const userEmail = ${getField('userEmail')};
  const userInitials = ${getField('userInitials')};
  const logoutText = ${getField('logoutText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const iconMap: { [key: string]: any } = {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter((item: any) => item !== label)
        : [...prev, label]
    );
  };

  const handleMenuItemClick = (item: any) => {
    console.log('Menu item clicked:', item);
    if (!item.children) {
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-10', className)}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Hamburger Button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{brandName}</span>
            </div>

            {/* User Avatar */}
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">{userInitials}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
          {/* Overlay Background */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-600/95 to-purple-600/95 backdrop-blur-sm"
            onClick={toggleMenu}
          />

          {/* Menu Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={toggleMenu}
              className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-8 h-8" />
            </button>

            {/* User Profile */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">{userInitials}</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{userName}</h2>
              <p className="text-white/80">{userEmail}</p>
            </div>

            {/* Menu Items */}
            <nav className="w-full max-w-md">
              <ul className="space-y-2">
                {menuItems.map((item: any, index: number) => {
                  const Icon = iconMap[item.icon] || Package;
                  const isExpanded = expandedItems.includes(item.label);
                  const hasChildren = item.children && item.children.length > 0;

                  return (
                    <li key={index}>
                      <button
                        onClick={() => {
                          if (hasChildren) {
                            toggleExpanded(item.label);
                          } else {
                            handleMenuItemClick(item);
                          }
                        }}
                        className={\`w-full flex items-center justify-between px-6 py-4 rounded-xl transition-all \${
                          item.active
                            ? 'bg-white text-blue-600'
                            : 'text-white hover:bg-white/10'
                        }\`}
                      >
                        <div className="flex items-center gap-4">
                          <Icon className="w-6 h-6" />
                          <span className="text-lg font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className={\`text-xs px-2 py-1 rounded-full font-medium \${
                              item.active ? 'bg-blue-100 text-blue-600' : 'bg-white/20 text-white'
                            }\`}>
                              {item.badge}
                            </span>
                          )}
                          {hasChildren && (
                            <ChevronDown className={\`w-5 h-5 transition-transform \${isExpanded ? 'rotate-180' : ''}\`} />
                          )}
                        </div>
                      </button>

                      {hasChildren && isExpanded && (
                        <ul className="mt-2 ml-10 space-y-2">
                          {item.children.map((child: any, childIndex: number) => (
                            <li key={childIndex}>
                              <a
                                href={child.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleMenuItemClick(child);
                                }}
                                className="flex items-center justify-between px-6 py-3 rounded-lg text-white/90 hover:bg-white/10 transition-colors"
                              >
                                <span>{child.label}</span>
                                {child.badge && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white font-medium">
                                    {child.badge}
                                  </span>
                                )}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="mt-12 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
            >
              {logoutText}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Hamburger Menu - Overlay</h1>
        <p className="text-gray-600 dark:text-gray-400">Full-screen overlay menu with gradient background</p>
      </div>
    </div>
  );
}
    `,

    push: `
${commonImports}

interface HamburgerMenuProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function HamburgerMenu({ ${dataName}: propData, className }: HamburgerMenuProps) {
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

  const menuData = ${dataName} || {};

  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const brandName = ${getField('brandName')};
  const menuItems = ${getField('menuItems')};
  const userName = ${getField('userName')};
  const userEmail = ${getField('userEmail')};
  const userAvatar = ${getField('userAvatar')};
  const logoutText = ${getField('logoutText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const iconMap: { [key: string]: any } = {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter((item: any) => item !== label)
        : [...prev, label]
    );
  };

  const handleMenuItemClick = (item: any) => {
    console.log('Menu item clicked:', item);
    if (!item.children) {
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <div className="flex">
        {/* Push Menu */}
        <div
          className={cn(
            'h-screen w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col fixed left-0 top-0 transform transition-transform duration-300 ease-in-out z-40',
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Menu Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{brandName}</span>
              </div>
              <button
                onClick={toggleMenu}
                className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Section */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <img
                src={userAvatar}
                alt={userName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.map((item: any, index: number) => {
                const Icon = iconMap[item.icon] || Package;
                const isExpanded = expandedItems.includes(item.label);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <li key={index}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          toggleExpanded(item.label);
                        } else {
                          handleMenuItemClick(item);
                        }
                      }}
                      className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors \${
                        item.active
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }\`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white font-medium">
                            {item.badge}
                          </span>
                        )}
                        {hasChildren && (
                          <ChevronDown className={\`w-4 h-4 transition-transform \${isExpanded ? 'rotate-180' : ''}\`} />
                        )}
                      </div>
                    </button>

                    {hasChildren && isExpanded && (
                      <ul className="mt-1 ml-8 space-y-1">
                        {item.children.map((child: any, childIndex: number) => (
                          <li key={childIndex}>
                            <a
                              href={child.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleMenuItemClick(child);
                              }}
                              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <span>{child.label}</span>
                              {child.badge && (
                                <span className={\`text-xs px-2 py-0.5 rounded-full font-medium \${
                                  child.badge === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                  'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                }\`}>
                                  {child.badge}
                                </span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Menu Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              {logoutText}
            </button>
          </div>
        </div>

        {/* Main Content - Pushes with menu */}
        <div
          className={cn(
            'flex-1 transition-all duration-300 ease-in-out',
            menuOpen ? 'ml-80' : 'ml-0'
          )}
        >
          {/* Header */}
          <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Hamburger Button */}
                <button
                  onClick={toggleMenu}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="Toggle menu"
                >
                  {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{brandName}</span>
                </div>

                {/* User Avatar */}
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Hamburger Menu - Push</h1>
            <p className="text-gray-600 dark:text-gray-400">Push-style navigation that moves the content aside</p>
          </div>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.slide;
};
