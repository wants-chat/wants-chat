import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateMobileBottomNav = (
  resolved: ResolvedComponent,
  variant: 'default' | 'withLabels' | 'iconOnly' = 'default'
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
    return `/${dataSource || 'mobile-nav'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'mobileNav' : 'mobileNav';

  const commonImports = `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Home, Compass, Bell, MessageSquare, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    default: `
${commonImports}

interface MobileBottomNavProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function MobileBottomNav({ ${dataName}: propData, className }: MobileBottomNavProps) {
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

  const navData = ${dataName} || {};

  const navItems = ${getField('navItems')};
  const showBadges = ${getField('showBadges')};

  const [activeNav, setActiveNav] = useState('home');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleNavClick = (item: any) => {
    setActiveNav(item.id);
    console.log('Navigation clicked:', item);
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Home,
      Compass,
      Bell,
      MessageSquare,
      User
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-6 h-6" /> : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mobile Bottom Nav - Default</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Bottom navigation bar with icons and labels</p>

        <div className="space-y-6">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Content Card {i + 1}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Scroll down to see more content. The bottom navigation remains fixed.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className={cn(
        'fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl dark:bg-gray-800/80 border-t border-gray-200/50 dark:border-gray-700/50 safe-area-inset-bottom z-50 shadow-lg',
        className
      )}>
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item: any) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 min-w-[64px]',
                activeNav === item.id
                  ? 'text-blue-600 dark:text-blue-400 bg-gradient-to-t from-blue-50 to-transparent dark:from-blue-900/20 shadow-lg scale-110'
                  : 'text-gray-600 dark:text-gray-400 hover:scale-105'
              )}
            >
              <div className="relative">
                {getIcon(item.icon)}
                {showBadges && item.badge && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-xs font-medium',
                activeNav === item.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
    `,

    withLabels: `
${commonImports}

interface MobileBottomNavProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function MobileBottomNav({ ${dataName}: propData, className }: MobileBottomNavProps) {
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

  const navData = ${dataName} || {};

  const navItems = ${getField('navItems')};
  const showBadges = ${getField('showBadges')};

  const [activeNav, setActiveNav] = useState('home');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleNavClick = (item: any) => {
    setActiveNav(item.id);
    console.log('Navigation clicked:', item);
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Home,
      Compass,
      Bell,
      MessageSquare,
      User
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mobile Bottom Nav - With Labels</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Bottom navigation with active pill indicator and labels</p>

        <div className="space-y-6">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Content Card {i + 1}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The active navigation item is highlighted with a colored background.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className={cn(
        'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom z-50',
        className
      )}>
        <div className="flex items-center justify-around h-18 px-2 py-2">
          {navItems.map((item: any) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1.5 px-4 py-2 rounded-full transition-all min-w-[72px]',
                activeNav === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <div className="relative">
                {getIcon(item.icon)}
                {showBadges && item.badge && (
                  <span className={cn(
                    'absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-xs font-medium rounded-full',
                    activeNav === item.id
                      ? 'bg-white text-blue-600'
                      : 'bg-red-500 text-white'
                  )}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium whitespace-nowrap">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
    `,

    iconOnly: `
${commonImports}

interface MobileBottomNavProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function MobileBottomNav({ ${dataName}: propData, className }: MobileBottomNavProps) {
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

  const navData = ${dataName} || {};

  const navItems = ${getField('navItems')};
  const showBadges = ${getField('showBadges')};
  const hideOnScroll = ${getField('hideOnScroll')};

  const [activeNav, setActiveNav] = useState('home');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, hideOnScroll]);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleNavClick = (item: any) => {
    setActiveNav(item.id);
    console.log('Navigation clicked:', item);
  };

  const getIcon = (iconName: string) => {
    const icons: any = {
      Home,
      Compass,
      Bell,
      MessageSquare,
      User
    };
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-6 h-6" /> : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mobile Bottom Nav - Icon Only</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Minimal bottom navigation with icons only {hideOnScroll && '(hides on scroll down)'}
        </p>

        <div className="space-y-6">
          {Array.from({ length: 15 }, (_, i) => (
            <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Content Card {i + 1}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {hideOnScroll
                  ? 'Scroll down to hide the navigation bar, scroll up to show it again.'
                  : 'The navigation bar remains visible at all times.'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className={cn(
        'fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom z-50 transition-transform duration-300',
        !isVisible && hideOnScroll ? 'translate-y-full' : 'translate-y-0',
        className
      )}>
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item: any) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={cn(
                'relative flex items-center justify-center w-14 h-14 rounded-full transition-all',
                activeNav === item.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
              aria-label={item.label}
            >
              <div className="relative">
                {getIcon(item.icon)}
                {showBadges && item.badge && (
                  <span className={cn(
                    'absolute -top-2 -right-2 min-w-[20px] h-[20px] flex items-center justify-center px-1.5 text-xs font-bold rounded-full',
                    activeNav === item.id
                      ? 'bg-white text-blue-600'
                      : 'bg-red-500 text-white'
                  )}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.default;
};
