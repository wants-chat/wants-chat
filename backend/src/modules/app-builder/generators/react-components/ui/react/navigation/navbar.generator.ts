import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateNavbar = (
  resolved: ResolvedComponent,
  variant: 'withAuth' | 'authenticated' | 'withSearch' | 'ecommerce' | 'dashboard' | 'marketing' | 'marketplace' = 'withAuth'
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
    return `/${dataSource || 'navbar'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'navbar' : 'navbar';

  const commonImports = `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, ChevronDown, Menu, X, Moon, BarChart3, Globe, Search, ShoppingCart, Heart, User, Bell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';`;

  const variants = {
    withAuth: `
${commonImports}

interface NavbarProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLogin?: (data?: any) => void;
  onSignUp?: (data?: any) => void;
  onLogout?: (data?: any) => void;
  onNavClick?: (link: any) => void;
  onDropdownItemClick?: (item: any) => void;
  onThemeToggle?: () => void;
  onAnalytics?: () => void;
  onSearchSubmit?: (query: string) => void;
  onLanguageChange?: (language: any) => void;
  onWishlist?: () => void;
  onCart?: () => void;
  onUserProfile?: () => void;
  onNotifications?: () => void;
  onAnnouncementClick?: () => void;
  onCTA?: () => void;
  onSignIn?: () => void;
  onAllCategories?: () => void;
  onCategoryClick?: (category: string) => void;
  onHotDeals?: () => void;
  onRegister?: () => void;
}

export default function Navbar({ ${dataName}: propData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME }: NavbarProps) {
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
  const styles = getVariantStyles(variant, colorScheme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Default navigation links for ecommerce
  const defaultNavigationLinks = [
    { label: 'Home', href: '/', active: true, hasDropdown: false },
    { label: 'Shop', href: '/marketplace', active: false, hasDropdown: false },
    { label: 'Categories', href: '#', active: false, hasDropdown: true },
    { label: 'About', href: '/about', active: false, hasDropdown: false },
    { label: 'Contact', href: '/contact', active: false, hasDropdown: false }
  ];

  const defaultCompanyDropdownItems = [
    { label: 'Vegetables', href: '/categories/vegetables' },
    { label: 'Fruits', href: '/categories/fruits' },
    { label: 'Grains', href: '/categories/grains' },
    { label: 'Dairy', href: '/categories/dairy' }
  ];

  const brandName = ${getField('brandName')} || 'AgriMarket';
  const navigationLinks = ${getField('navigationLinks')} && Array.isArray(${getField('navigationLinks')}) && ${getField('navigationLinks')}.length > 0 ? ${getField('navigationLinks')} : defaultNavigationLinks;
  const companyDropdownItems = ${getField('companyDropdownItems')} && Array.isArray(${getField('companyDropdownItems')}) && ${getField('companyDropdownItems')}.length > 0 ? ${getField('companyDropdownItems')} : defaultCompanyDropdownItems;
  const loginText = ${getField('loginText')} || 'Login';
  const signUpText = ${getField('signUpText')} || 'Sign Up';

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleLogin = () => {
    if (onLogin) {
      onLogin(navData);
    }
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp(navData);
    }
  };

  const handleNavClick = (link: any) => {
    if (onNavClick) {
      onNavClick(link);
    }
  };

  const handleDropdownItemClick = (item: any) => {
    if (onDropdownItemClick) {
      onDropdownItemClick(item);
    }
    setDropdownOpen(false);
  };

  return (
    <header className={cn('border-b', styles.card, styles.border, className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
            <span className={cn('text-xl font-bold', styles.title)}>{brandName}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link: any, index: number) => (
              <div key={index} className="relative">
                {link.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={cn('flex items-center gap-1 cursor-pointer group transition-colors', styles.text, 'hover:opacity-80')}
                    >
                      {link.label}
                      <ChevronDown className={\`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all \${dropdownOpen ? 'rotate-180' : ''}\`} />
                    </button>

                    {dropdownOpen && (
                      <div className={cn('absolute top-full left-0 mt-2 w-48 rounded-2xl shadow-2xl backdrop-blur-xl py-1 z-50', styles.card, styles.border)}>
                        {companyDropdownItems.map((item: any, idx: number) => (
                          <a
                            key={idx}
                            href={item.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleDropdownItemClick(item);
                            }}
                            className={cn('block px-4 py-2 text-sm transition-colors', styles.text, styles.cardHover)}
                          >
                            {item.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link);
                    }}
                    className={cn('transition-colors', link.active ? cn('font-bold', styles.accent) : cn(styles.text, 'hover:opacity-80'))}
                  >
                    {link.label}
                  </a>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              className={cn('font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg px-3 py-2', styles.text, 'hover:opacity-80')}
              onClick={handleLogin}
            >
              {loginText}
            </button>
            <button
              className={cn('px-5 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2', styles.button, styles.buttonHover)}
              onClick={handleSignUp}
            >
              {signUpText}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn('p-2 transition-colors', styles.text, 'hover:opacity-80')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className={cn('md:hidden border-t py-4', styles.border)}>
            <nav className="flex flex-col space-y-4">
              {navigationLinks.map((link: any, index: number) => (
                <div key={index}>
                  {link.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-1 cursor-pointer group px-4 w-full text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link.label}
                        <ChevronDown className={\`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all \${dropdownOpen ? 'rotate-180' : ''}\`} />
                      </button>
                      {dropdownOpen && (
                        <div className="mt-2 ml-8 space-y-2">
                          {companyDropdownItems.map((item: any, idx: number) => (
                            <a
                              key={idx}
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleDropdownItemClick(item);
                              }}
                              className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                              {item.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link);
                      }}
                      className={\`\${link.active ? 'text-blue-600 font-bold hover:text-blue-700' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'} transition-colors px-4\`}
                    >
                      {link.label}
                    </a>
                  )}
                </div>
              ))}

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  className={cn('font-bold transition-colors text-left', styles.text, 'hover:opacity-80')}
                  onClick={handleLogin}
                >
                  {loginText}
                </button>
                <button
                  className={cn('px-5 py-2 rounded-lg font-bold transition-colors shadow-sm hover:shadow-md text-left', styles.button, styles.buttonHover)}
                  onClick={handleSignUp}
                >
                  {signUpText}
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
    `,

    authenticated: `
${commonImports}

interface NavbarProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLogin?: (data?: any) => void;
  onSignUp?: (data?: any) => void;
  onLogout?: (data?: any) => void;
  onNavClick?: (link: any) => void;
  onDropdownItemClick?: (item: any) => void;
  onThemeToggle?: () => void;
  onAnalytics?: () => void;
  onSearchSubmit?: (query: string) => void;
  onLanguageChange?: (language: any) => void;
  onWishlist?: () => void;
  onCart?: () => void;
  onUserProfile?: () => void;
  onNotifications?: () => void;
  onAnnouncementClick?: () => void;
  onCTA?: () => void;
  onSignIn?: () => void;
  onAllCategories?: () => void;
  onCategoryClick?: (category: string) => void;
  onHotDeals?: () => void;
  onRegister?: () => void;
}

export default function Navbar({ ${dataName}: propData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME }: NavbarProps) {
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
  const styles = getVariantStyles(variant, colorScheme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const userInitials = ${getField('userInitials')};
  const logoutText = ${getField('logoutText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout(navData);
    }
  };

  const handleThemeToggle = () => {
    if (onThemeToggle) {
      onThemeToggle();
    }
  };

  const handleAnalytics = () => {
    if (onAnalytics) {
      onAnalytics();
    }
  };

  const handleNavClick = (link: any) => {
    if (onNavClick) {
      onNavClick(link);
    }
  };

  return (
    <header className={cn('border-b', styles.card, styles.border, className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
            <span className={cn('text-xl font-bold', styles.title)}>{brandName}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link: any, index: number) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link);
                }}
                className={cn('transition-colors', link.active ? cn('font-bold', styles.accent) : cn(styles.text, 'hover:opacity-80'))}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-4">
            <button
              className={cn('p-2 transition-colors rounded-lg', styles.text, styles.cardHover)}
              onClick={handleThemeToggle}
            >
              <Moon className="w-5 h-5" />
            </button>
            <button
              className={cn('p-2 transition-colors rounded-lg', styles.text, styles.cardHover)}
              onClick={handleAnalytics}
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{userInitials}</span>
            </div>
            <button
              className={cn('font-bold transition-colors', styles.accent, 'hover:opacity-80')}
              onClick={handleLogout}
            >
              {logoutText}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn('p-2 transition-colors', styles.text, 'hover:opacity-80')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className={cn('md:hidden border-t py-4', styles.border)}>
            <nav className="flex flex-col space-y-4">
              {navigationLinks.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link);
                  }}
                  className={\`\${link.active ? 'text-blue-600 font-bold hover:text-blue-700' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'} transition-colors px-4\`}
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile User Section */}
              <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <button
                    className={cn('p-2 transition-colors rounded-lg', styles.text, styles.cardHover)}
                    onClick={handleThemeToggle}
                  >
                    <Moon className="w-5 h-5" />
                  </button>
                  <button
                    className={cn('p-2 transition-colors rounded-lg', styles.text, styles.cardHover)}
                    onClick={handleAnalytics}
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{userInitials}</span>
                  </div>
                </div>
                <button
                  className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-left"
                  onClick={handleLogout}
                >
                  {logoutText}
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
    `,

    withSearch: `
${commonImports}

interface NavbarProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLogin?: (data?: any) => void;
  onSignUp?: (data?: any) => void;
  onLogout?: (data?: any) => void;
  onNavClick?: (link: any) => void;
  onDropdownItemClick?: (item: any) => void;
  onThemeToggle?: () => void;
  onAnalytics?: () => void;
  onSearchSubmit?: (query: string) => void;
  onLanguageChange?: (language: any) => void;
  onWishlist?: () => void;
  onCart?: () => void;
  onUserProfile?: () => void;
  onNotifications?: () => void;
  onAnnouncementClick?: () => void;
  onCTA?: () => void;
  onSignIn?: () => void;
  onAllCategories?: () => void;
  onCategoryClick?: (category: string) => void;
  onHotDeals?: () => void;
  onRegister?: () => void;
}

export default function Navbar({ ${dataName}: propData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME }: NavbarProps) {
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
  const styles = getVariantStyles(variant, colorScheme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(${getField('selectedLanguage')});
  const [searchQuery, setSearchQuery] = useState('');

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const languages = ${getField('languages')};
  const searchPlaceholder = ${getField('searchPlaceholder')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  const handleLanguageChange = (lang: any) => {
    setSelectedLanguage(lang.name);
    setLanguageDropdownOpen(false);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const handleNavClick = (link: any) => {
    if (onNavClick) {
      onNavClick(link);
    }
  };

  return (
    <header className={cn('border-b', styles.card, styles.border, className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
            <span className={cn('text-xl font-bold', styles.title)}>{brandName}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationLinks.map((link: any, index: number) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link);
                }}
                className={cn('transition-colors', link.active ? cn('font-bold', styles.accent) : cn(styles.text, 'hover:opacity-80'))}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-48 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </form>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                className={cn('flex items-center gap-2 cursor-pointer group px-3 py-2 rounded-lg transition-colors', styles.cardHover)}
              >
                <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white text-sm transition-colors">
                  {selectedLanguage}
                </span>
                <ChevronDown className={\`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all \${languageDropdownOpen ? 'rotate-180' : ''}\`} />
              </button>

              {languageDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {languages.map((lang: any) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang)}
                      className={\`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors \${
                        selectedLanguage === lang.name
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'text-gray-700 dark:text-gray-300'
                      }\`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn('p-2 transition-colors', styles.text, 'hover:opacity-80')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <nav className="flex flex-col space-y-4">
              {navigationLinks.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link);
                  }}
                  className={\`\${link.active ? 'text-blue-600 font-bold hover:text-blue-700' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'} transition-colors px-4\`}
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile Search and Language */}
              <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </form>

                <div className="relative">
                  <button
                    onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                    className="flex items-center gap-2 cursor-pointer group w-full px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white text-sm transition-colors">
                      {selectedLanguage}
                    </span>
                    <ChevronDown className={\`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all ml-auto \${languageDropdownOpen ? 'rotate-180' : ''}\`} />
                  </button>

                  {languageDropdownOpen && (
                    <div className="mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                      {languages.map((lang: any) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang)}
                          className={\`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors \${
                            selectedLanguage === lang.name
                              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                              : 'text-gray-700 dark:text-gray-300'
                          }\`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
    `,

    ecommerce: `
${commonImports}

interface NavbarProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLogin?: (data?: any) => void;
  onSignUp?: (data?: any) => void;
  onLogout?: (data?: any) => void;
  onNavClick?: (link: any) => void;
  onDropdownItemClick?: (item: any) => void;
  onThemeToggle?: () => void;
  onAnalytics?: () => void;
  onSearchSubmit?: (query: string) => void;
  onLanguageChange?: (language: any) => void;
  onWishlist?: () => void;
  onCart?: () => void;
  onUserProfile?: () => void;
  onNotifications?: () => void;
  onAnnouncementClick?: () => void;
  onCTA?: () => void;
  onSignIn?: () => void;
  onAllCategories?: () => void;
  onCategoryClick?: (category: string) => void;
  onHotDeals?: () => void;
  onRegister?: () => void;
}

export default function Navbar({ ${dataName}: propData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME }: NavbarProps) {
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
  const styles = getVariantStyles(variant, colorScheme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Default ecommerce navigation links
  const defaultShopLinks = [
    { label: 'Home', href: '/', active: false },
    { label: 'Products', href: '/marketplace', active: true },
    { label: 'Categories', href: '/categories', active: false },
    { label: 'Deals', href: '/deals', active: false }
  ];

  const brandName = ${getField('brandName')} || 'AgriMarket';
  const navigationLinks = ${getField('shopLinks')} && Array.isArray(${getField('shopLinks')}) && ${getField('shopLinks')}.length > 0 ? ${getField('shopLinks')} : defaultShopLinks;
  const wishlistCount = ${getField('wishlistCount')} || 0;
  const cartCount = ${getField('cartCount')} || 0;

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleWishlist = () => {
    if (onWishlist) {
      onWishlist();
    }
  };

  const handleCart = () => {
    if (onCart) {
      onCart();
    }
  };

  const handleUserProfile = () => {
    if (onUserProfile) {
      onUserProfile();
    }
  };

  const handleNavClick = (link: any) => {
    if (onNavClick) {
      onNavClick(link);
    }
  };

  return (
    <header className={cn('border-b', styles.card, styles.border, className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
            <span className={cn('text-xl font-bold', styles.title)}>{brandName}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link: any, index: number) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link);
                }}
                className={cn('transition-colors', link.active ? cn('font-bold', styles.accent) : cn(styles.text, 'hover:opacity-80'))}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleWishlist}
            >
              <Heart className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {wishlistCount}
              </span>
            </button>
            <button
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleCart}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">
                {cartCount}
              </span>
            </button>
            <button
              className={cn('p-2 transition-colors rounded-lg', styles.text, styles.cardHover)}
              onClick={handleUserProfile}
            >
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn('p-2 transition-colors', styles.text, 'hover:opacity-80')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className={cn('md:hidden border-t py-4', styles.border)}>
            <nav className="flex flex-col space-y-4">
              {navigationLinks.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link);
                  }}
                  className={\`\${link.active ? 'text-blue-600 font-bold hover:text-blue-700' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'} transition-colors px-4\`}
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile Icons */}
              <div className="flex items-center gap-4 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleWishlist}
                >
                  <Heart className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {wishlistCount}
                  </span>
                </button>
                <button
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleCart}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                </button>
                <button
                  className={cn('p-2 transition-colors rounded-lg', styles.text, styles.cardHover)}
                  onClick={handleUserProfile}
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
    `,

    dashboard: `
${commonImports}

interface NavbarProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLogin?: (data?: any) => void;
  onSignUp?: (data?: any) => void;
  onLogout?: (data?: any) => void;
  onNavClick?: (link: any) => void;
  onDropdownItemClick?: (item: any) => void;
  onThemeToggle?: () => void;
  onAnalytics?: () => void;
  onSearchSubmit?: (query: string) => void;
  onLanguageChange?: (language: any) => void;
  onWishlist?: () => void;
  onCart?: () => void;
  onUserProfile?: () => void;
  onNotifications?: () => void;
  onAnnouncementClick?: () => void;
  onCTA?: () => void;
  onSignIn?: () => void;
  onAllCategories?: () => void;
  onCategoryClick?: (category: string) => void;
  onHotDeals?: () => void;
  onRegister?: () => void;
}

export default function Navbar({ ${dataName}: propData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME }: NavbarProps) {
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
  const styles = getVariantStyles(variant, colorScheme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('dashboardLinks')};
  const userName = ${getField('userName')};
  const userRole = ${getField('userRole')};
  const userAvatar = ${getField('userAvatar')};
  const hasNotification = ${getField('hasNotification')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleNotifications = () => {
    if (onNotifications) {
      onNotifications();
    }
  };

  const handleNavClick = (link: any) => {
    if (onNavClick) {
      onNavClick(link);
    }
  };

  return (
    <header className={cn('shadow-sm', styles.card, className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </div>
            <span className={cn('text-xl font-bold', styles.title)}>{brandName}</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((link: any, index: number) => (
              <a
                key={index}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link);
                }}
                className={cn('px-4 py-2 rounded-lg transition-colors', link.active ? cn('font-bold', styles.button) : cn(styles.text, styles.cardHover))}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-3">
            <button
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleNotifications}
            >
              <Bell className="w-5 h-5" />
              {hasNotification && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
            <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <img
                src={userAvatar}
                alt="User"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="text-sm">
                <div className="font-bold text-gray-900 dark:text-white">{userName}</div>
                <div className="text-gray-500 dark:text-gray-400">{userRole}</div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn('p-2 transition-colors', styles.text, 'hover:opacity-80')}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className={cn('md:hidden border-t py-4', styles.border)}>
            <nav className="flex flex-col space-y-2">
              {navigationLinks.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link);
                  }}
                  className={\`px-4 py-2 rounded-lg transition-colors \${
                    link.active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }\`}
                >
                  {link.label}
                </a>
              ))}

              {/* Mobile User Section */}
              <div className="flex items-center gap-3 px-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <img
                  src={userAvatar}
                  alt="User"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-sm flex-1">
                  <div className="font-bold text-gray-900 dark:text-white">{userName}</div>
                  <div className="text-gray-500 dark:text-gray-400">{userRole}</div>
                </div>
                <button
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleNotifications}
                >
                  <Bell className="w-5 h-5" />
                  {hasNotification && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
    `,

    marketing: `
${commonImports}

interface NavbarProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLogin?: (data?: any) => void;
  onSignUp?: (data?: any) => void;
  onLogout?: (data?: any) => void;
  onNavClick?: (link: any) => void;
  onDropdownItemClick?: (item: any) => void;
  onThemeToggle?: () => void;
  onAnalytics?: () => void;
  onSearchSubmit?: (query: string) => void;
  onLanguageChange?: (language: any) => void;
  onWishlist?: () => void;
  onCart?: () => void;
  onUserProfile?: () => void;
  onNotifications?: () => void;
  onAnnouncementClick?: () => void;
  onCTA?: () => void;
  onSignIn?: () => void;
  onAllCategories?: () => void;
  onCategoryClick?: (category: string) => void;
  onHotDeals?: () => void;
  onRegister?: () => void;
}

export default function Navbar({ ${dataName}: propData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME }: NavbarProps) {
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
  const styles = getVariantStyles(variant, colorScheme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('marketingLinks')};
  const announcementText = ${getField('announcementText')};
  const announcementLink = ${getField('announcementLink')};
  const signInText = ${getField('signInText')};
  const ctaText = ${getField('ctaText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleAnnouncementClick = () => {
    if (onAnnouncementClick) {
      onAnnouncementClick();
    }
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    }
  };

  const handleCTA = () => {
    if (onCTA) {
      onCTA();
    }
  };

  const handleNavClick = (link: any) => {
    if (onNavClick) {
      onNavClick(link);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm">
        {announcementText} • <a
          href="#"
          className="underline font-bold"
          onClick={(e) => {
            e.preventDefault();
            handleAnnouncementClick();
          }}
        >{announcementLink}</a>
      </div>

      <header className={cn('border-b', styles.card, styles.border, className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 text-white fill-current ml-0.5" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {brandName}
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationLinks.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link);
                  }}
                  className={cn('font-bold transition-colors', styles.text, 'hover:opacity-80')}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <Button
                variant="outline"
                className="dark:border-gray-600 dark:text-gray-300"
                onClick={handleSignIn}
              >
                {signInText}
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                onClick={handleCTA}
              >
                {ctaText}
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn('p-2 transition-colors', styles.text, 'hover:opacity-80')}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <nav className="flex flex-col space-y-4">
                {navigationLinks.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link);
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors px-4"
                  >
                    {link.label}
                  </a>
                ))}

                {/* Mobile CTA */}
                <div className="flex flex-col gap-3 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    className="w-full dark:border-gray-600 dark:text-gray-300"
                    onClick={handleSignIn}
                  >
                    {signInText}
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    onClick={handleCTA}
                  >
                    {ctaText}
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
    `,

    marketplace: `
${commonImports}

interface NavbarProps {
  ${dataName}?: any;
  className?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  onLogin?: (data?: any) => void;
  onSignUp?: (data?: any) => void;
  onLogout?: (data?: any) => void;
  onNavClick?: (link: any) => void;
  onDropdownItemClick?: (item: any) => void;
  onThemeToggle?: () => void;
  onAnalytics?: () => void;
  onSearchSubmit?: (query: string) => void;
  onLanguageChange?: (language: any) => void;
  onWishlist?: () => void;
  onCart?: () => void;
  onUserProfile?: () => void;
  onNotifications?: () => void;
  onAnnouncementClick?: () => void;
  onCTA?: () => void;
  onSignIn?: () => void;
  onAllCategories?: () => void;
  onCategoryClick?: (category: string) => void;
  onHotDeals?: () => void;
  onRegister?: () => void;
}

export default function Navbar({ ${dataName}: propData, className, variant = UI_VARIANT, colorScheme = UI_COLOR_SCHEME }: NavbarProps) {
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
  const styles = getVariantStyles(variant, colorScheme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Default marketplace categories
  const defaultCategories = [
    { name: 'Vegetables', slug: 'vegetables', count: 120 },
    { name: 'Fruits', slug: 'fruits', count: 85 },
    { name: 'Grains', slug: 'grains', count: 45 },
    { name: 'Dairy', slug: 'dairy', count: 30 }
  ];

  const brandName = ${getField('brandName')} || 'AgriMarket';
  const categories = ${getField('categories')} && Array.isArray(${getField('categories')}) && ${getField('categories')}.length > 0 ? ${getField('categories')} : defaultCategories;
  const searchPlaceholder = ${getField('searchPlaceholderProducts')} || 'Search products...';
  const loginText = ${getField('loginText')} || 'Login';
  const registerText = ${getField('registerText')} || 'Register';
  const allCategoriesText = ${getField('allCategoriesText')} || 'All Categories';
  const hotDealsText = ${getField('hotDealsText')} || 'Hot Deals';

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin(navData);
    }
  };

  const handleRegister = () => {
    if (onRegister) {
      onRegister();
    }
  };

  const handleCategoryClick = (category: string) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  const handleAllCategories = () => {
    if (onAllCategories) {
      onAllCategories();
    }
  };

  const handleHotDeals = () => {
    if (onHotDeals) {
      onHotDeals();
    }
  };

  return (
    <header className={cn('shadow-sm', styles.card, className)}>
      {/* Top Section */}
      <div className={cn('border-b', styles.border)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
              <span className={cn('text-xl font-bold', styles.title)}>{brandName}</span>
            </div>

            {/* Desktop Search */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                className={cn('font-bold transition-colors', styles.text, 'hover:opacity-80')}
                onClick={handleLogin}
              >
                {loginText}
              </button>
              <button
                className={cn('px-4 py-2 rounded-lg font-bold transition-colors', styles.button, styles.buttonHover)}
                onClick={handleRegister}
              >
                {registerText}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn('p-2 transition-colors', styles.text, 'hover:opacity-80')}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className={cn('border-b', styles.border, styles.background)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden md:flex items-center space-x-6 h-12">
            <button
              className={cn('flex items-center gap-2 font-bold transition-colors', styles.text, 'hover:opacity-80')}
              onClick={handleAllCategories}
            >
              {allCategoriesText}
              <ChevronDown className="w-4 h-4" />
            </button>
            {categories.map((category: string, index: number) => (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick(category);
                }}
                className={cn('transition-colors', styles.text, 'hover:opacity-80')}
              >
                {category}
              </a>
            ))}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleHotDeals();
              }}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 font-bold transition-colors ml-auto"
            >
              {hotDealsText}
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="px-4 mb-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {/* Mobile Categories */}
          <nav className="flex flex-col space-y-3 px-4 mb-4">
            <button
              className={cn('flex items-center gap-2 font-bold transition-colors text-left', styles.text, 'hover:opacity-80')}
              onClick={handleAllCategories}
            >
              {allCategoriesText}
              <ChevronDown className="w-4 h-4" />
            </button>
            {categories.map((category: string, index: number) => (
              <a
                key={index}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryClick(category);
                }}
                className={cn('transition-colors', styles.text, 'hover:opacity-80')}
              >
                {category}
              </a>
            ))}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleHotDeals();
              }}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 font-bold transition-colors"
            >
              {hotDealsText}
            </a>
          </nav>

          {/* Mobile Actions */}
          <div className="flex flex-col gap-3 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-bold transition-colors text-left"
              onClick={handleLogin}
            >
              {loginText}
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors text-left"
              onClick={handleRegister}
            >
              {registerText}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
    `
  };

  return variants[variant] || variants.withAuth;
};
