import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSidebar = (
  resolved: ResolvedComponent,
  variant: 'basic' | 'withBanner' | 'multiLevel' = 'basic'
) => {
  const dataSource = resolved.dataSource;
  
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
    return `/${dataSource || 'sidebar'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'sidebar' : 'sidebar';

  const variants = {
    basic: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Play,
  LayoutDashboard,
  LayoutGrid,
  Inbox,
  Users,
  Package,
  LogIn,
  UserPlus,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface SidebarProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function BasicSidebar({ ${dataName}: propData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME }: SidebarProps) {
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
  const styles = getVariantStyles(variant, colorScheme);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const logoText = ${getField('logoText')};
  const navigationItems = ${getField('navigationItems')};
  const authItems = ${getField('authItems')};
  const proLabel = ${getField('proLabel')};
  const addContentText = ${getField('addContentText')};

  const [isOpen, setIsOpen] = useState(false);

  const iconMap: any = {
    LayoutDashboard,
    LayoutGrid,
    Inbox,
    Users,
    Package,
    LogIn,
    UserPlus,
  };

  // Event handlers
  const handleLogoClick = () => {
    console.log('Logo clicked');
    alert(\`Navigate to \${logoText} home page\`);
  };

  const handleNavigationClick = (item: any) => {
    console.log('Navigation item clicked:', item);
    if (item.isPro) {
      alert(\`\${item.label} (Pro Feature)\\nUpgrade to access this feature\`);
    } else {
      alert(\`Navigating to \${item.label}\${item.badge ? \` (\${item.badge} new items)\` : ''}\`);
    }
  };

  const handleAddContentClick = () => {
    console.log('Add content clicked');
    alert('Open content creation dialog');
  };

  const renderNavigationItem = (item: any) => {
    const Icon = iconMap[item.icon] || LayoutDashboard;

    return (
      <button
        key={item.id}
        onClick={() => handleNavigationClick(item)}
        className={cn('w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors', styles.cardHover, styles.text)}
      >
        <div className="flex items-center gap-3">
          <Icon className={\`h-5 w-5 \${styles.text}\`} />
          <span>{item.label}</span>
          {item.isPro && (
            <span className={\`px-2 py-0.5 text-xs font-medium rounded \${styles.badge}\`}>
              {proLabel}
            </span>
          )}
        </div>
        {item.badge && (
          <span className={\`px-2 py-0.5 text-xs font-medium text-white rounded-full \${styles.accent}\`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={cn('min-h-screen', styles.container)}>
      <div className={cn("relative", className)}>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn('lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg', styles.card, styles.border)}
        >
          {isOpen ? (
            <X className={\`h-5 w-5 \${styles.text}\`} />
          ) : (
            <Menu className={\`h-5 w-5 \${styles.text}\`} />
          )}
        </button>

        {/* Overlay for mobile */}
        {isOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out border-r",
          styles.background,
          styles.border,
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className={cn('p-4 border-b', styles.border)}>
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', styles.accent)}>
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
                <span className={\`text-xl font-semibold \${styles.title}\`}>
                  {logoText}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {navigationItems.map((item: any) => renderNavigationItem(item))}
              </nav>

              {/* Auth Section */}
              <div className={cn('mt-8 pt-4 border-t', styles.border)}>
                <nav className="space-y-2">
                  {authItems.map((item: any) => renderNavigationItem(item))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className={cn('lg:ml-64 min-h-screen p-4 pt-16 lg:pt-4', styles.container)}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  onClick={handleAddContentClick}
                  className={cn('aspect-square rounded-lg border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer', styles.card, styles.border, styles.cardHover)}
                >
                  <div className="text-center">
                    <div className={\`w-8 h-8 mx-auto mb-2 \${styles.text}\`}>
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className={\`text-sm \${styles.text}\`}>{addContentText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    withBanner: `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Play,
  LayoutDashboard,
  LayoutGrid,
  Inbox,
  Users,
  Package,
  LogIn,
  UserPlus,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface SidebarProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function SidebarWithBetaBanner({ ${dataName}: propData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME }: SidebarProps) {
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
  const styles = getVariantStyles(variant, colorScheme);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const logoText = ${getField('logoText')};
  const navigationItems = ${getField('navigationItems')};
  const authItems = ${getField('authItems')};
  const proLabel = ${getField('proLabel')};
  const addContentText = ${getField('addContentText')};
  const betaBannerBadge = ${getField('betaBannerBadge')};
  const betaBannerTitle = ${getField('betaBannerTitle')};
  const betaBannerDescription = ${getField('betaBannerDescription')};
  const betaBannerButtonText = ${getField('betaBannerButtonText')};

  const [isOpen, setIsOpen] = useState(false);
  const [showBetaBanner, setShowBetaBanner] = useState(true);

  const iconMap: any = {
    LayoutDashboard,
    LayoutGrid,
    Inbox,
    Users,
    Package,
    LogIn,
    UserPlus,
  };

  // Event handlers
  const handleLogoClick = () => {
    console.log('Logo clicked');
    alert(\`Navigate to \${logoText} home page\`);
  };

  const handleNavigationClick = (item: any) => {
    console.log('Navigation item clicked:', item);
    if (item.isPro) {
      alert(\`\${item.label} (Pro Feature)\\nUpgrade to access this feature\`);
    } else {
      alert(\`Navigating to \${item.label}\${item.badge ? \` (\${item.badge} new items)\` : ''}\`);
    }
  };

  const handleBetaBannerClose = () => {
    console.log('Beta banner closed');
    setShowBetaBanner(false);
  };

  const handleBetaBannerAction = () => {
    console.log('Beta banner action clicked');
    alert('Switching to old navigation...\\nYou can turn the new navigation back on in your profile settings.');
    setShowBetaBanner(false);
  };

  const handleAddContentClick = () => {
    console.log('Add content clicked');
    alert('Open content creation dialog');
  };

  const renderNavigationItem = (item: any) => {
    const Icon = iconMap[item.icon] || LayoutDashboard;

    return (
      <button
        key={item.id}
        onClick={() => handleNavigationClick(item)}
        className={cn('w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors', styles.cardHover, styles.text)}
      >
        <div className="flex items-center gap-3">
          <Icon className={\`h-5 w-5 \${styles.text}\`} />
          <span>{item.label}</span>
          {item.isPro && (
            <span className={\`px-2 py-0.5 text-xs font-medium rounded \${styles.badge}\`}>
              {proLabel}
            </span>
          )}
        </div>
        {item.badge && (
          <span className={\`px-2 py-0.5 text-xs font-medium text-white rounded-full \${styles.accent}\`}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={cn('min-h-screen', styles.container)}>
      <div className={cn("relative", className)}>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn('lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg', styles.card, styles.border)}
        >
          {isOpen ? (
            <X className={\`h-5 w-5 \${styles.text}\`} />
          ) : (
            <Menu className={\`h-5 w-5 \${styles.text}\`} />
          )}
        </button>

        {/* Overlay for mobile */}
        {isOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out border-r",
          styles.background,
          styles.border,
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className={cn('p-4 border-b', styles.border)}>
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', styles.accent)}>
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
                <span className={\`text-xl font-semibold \${styles.title}\`}>
                  {logoText}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {navigationItems.map((item: any) => renderNavigationItem(item))}
              </nav>

              {/* Auth Section */}
              <div className={cn('mt-8 pt-4 border-t', styles.border)}>
                <nav className="space-y-2">
                  {authItems.map((item: any) => renderNavigationItem(item))}
                </nav>
              </div>
            </div>

            {/* Beta Banner */}
            {showBetaBanner && (
              <div className={cn('p-4 border-t', styles.border)}>
                <div className={cn('relative rounded-lg p-3', styles.card)}>
                  <button
                    onClick={handleBetaBannerClose}
                    className={cn('absolute top-2 right-2 p-1 rounded', styles.cardHover)}
                  >
                    <X className={\`h-3 w-3 \${styles.accent}\`} />
                  </button>
                  <div className="pr-6">
                    <span className={\`inline-block px-2 py-1 text-xs font-medium rounded mb-2 \${styles.badge}\`}>
                      {betaBannerBadge}
                    </span>
                    <p className={\`text-sm mb-2 \${styles.text}\`}>
                      {betaBannerTitle} {betaBannerDescription}
                    </p>
                    <button
                      onClick={handleBetaBannerAction}
                      className={\`text-sm underline hover:no-underline \${styles.accent}\`}
                    >
                      {betaBannerButtonText}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className={cn('lg:ml-64 min-h-screen p-4 pt-16 lg:pt-4', styles.container)}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  onClick={handleAddContentClick}
                  className={cn('aspect-square rounded-lg border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer', styles.card, styles.border, styles.cardHover)}
                >
                  <div className="text-center">
                    <div className={\`w-8 h-8 mx-auto mb-2 \${styles.text}\`}>
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className={\`text-sm \${styles.text}\`}>{addContentText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    multiLevel: `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Play,
  LayoutDashboard,
  LayoutGrid,
  Inbox,
  Users,
  Package,
  LogIn,
  UserPlus,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface SidebarProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

export default function MultiLevelSidebar({ ${dataName}: propData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME }: SidebarProps) {
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
  const styles = getVariantStyles(variant, colorScheme);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const logoText = ${getField('logoText')};
  const navigationItems = ${getField('navigationItemsMultiLevel')};
  const authItems = ${getField('authItems')};
  const proLabel = ${getField('proLabel')};
  const addContentText = ${getField('addContentText')};
  const defaultExpandedItems = ${getField('defaultExpandedItems')};

  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpandedItems);

  const iconMap: any = {
    LayoutDashboard,
    LayoutGrid,
    Inbox,
    Users,
    Package,
    LogIn,
    UserPlus,
    ShoppingCart,
  };

  // Event handlers
  const handleLogoClick = () => {
    console.log('Logo clicked');
    alert(\`Navigate to \${logoText} home page\`);
  };

  const handleNavigationClick = (item: any) => {
    console.log('Navigation item clicked:', item);
    if (item.isPro) {
      alert(\`\${item.label} (Pro Feature)\\nUpgrade to access this feature\`);
    } else {
      alert(\`Navigating to \${item.label}\${item.badge ? \` (\${item.badge} new items)\` : ''}\`);
    }
  };

  const handleAddContentClick = () => {
    console.log('Add content clicked');
    alert('Open content creation dialog');
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderNavigationItem = (item: any, level = 0) => {
    const Icon = iconMap[item.icon] || LayoutDashboard;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);

    return (
      <div key={item.id}>
        <button
          onClick={() => hasChildren ? toggleExpanded(item.id) : handleNavigationClick(item)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            styles.cardHover,
            styles.text,
            level > 0 && "ml-4"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className={\`h-5 w-5 \${styles.text}\`} />
            <span>{item.label}</span>
            {item.isPro && (
              <span className={\`px-2 py-0.5 text-xs font-medium rounded \${styles.badge}\`}>
                {proLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {item.badge && (
              <span className={\`px-2 py-0.5 text-xs font-medium text-white rounded-full \${styles.accent}\`}>
                {item.badge}
              </span>
            )}
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className={\`h-4 w-4 \${styles.text}\`} />
              ) : (
                <ChevronRight className={\`h-4 w-4 \${styles.text}\`} />
              )
            )}
          </div>
        </button>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child: any) => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('min-h-screen', styles.container)}>
      <div className={cn("relative", className)}>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn('lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg', styles.card, styles.border)}
        >
          {isOpen ? (
            <X className={\`h-5 w-5 \${styles.text}\`} />
          ) : (
            <Menu className={\`h-5 w-5 \${styles.text}\`} />
          )}
        </button>

        {/* Overlay for mobile */}
        {isOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out border-r",
          styles.background,
          styles.border,
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className={cn('p-4 border-b', styles.border)}>
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', styles.accent)}>
                  <Play className="h-4 w-4 text-white fill-white" />
                </div>
                <span className={\`text-xl font-semibold \${styles.title}\`}>
                  {logoText}
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {navigationItems.map((item: any) => renderNavigationItem(item))}
              </nav>

              {/* Auth Section */}
              <div className={cn('mt-8 pt-4 border-t', styles.border)}>
                <nav className="space-y-2">
                  {authItems.map((item: any) => renderNavigationItem(item))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className={cn('lg:ml-64 min-h-screen p-4 pt-16 lg:pt-4', styles.container)}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  onClick={handleAddContentClick}
                  className={cn('aspect-square rounded-lg border-2 border-dashed flex items-center justify-center transition-colors cursor-pointer', styles.card, styles.border, styles.cardHover)}
                >
                  <div className="text-center">
                    <div className={\`w-8 h-8 mx-auto mb-2 \${styles.text}\`}>
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className={\`text-sm \${styles.text}\`}>{addContentText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.basic;
};
