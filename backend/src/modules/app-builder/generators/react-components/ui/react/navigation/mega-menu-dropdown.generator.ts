import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateMegaMenuDropdown = (
  resolved: ResolvedComponent,
  variant: 'fullWidth' | 'contained' | 'withImages' = 'fullWidth'
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
    return `/${dataSource || 'mega-menu'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'megaMenu' : 'megaMenu';

  const commonImports = `
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Play, ChevronDown, Menu, X, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    fullWidth: `
${commonImports}

interface MegaMenuDropdownProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function MegaMenuDropdown({ ${dataName}: propData, className }: MegaMenuDropdownProps) {
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const megaMenuColumns = ${getField('megaMenuColumns')};
  const quickLinks = ${getField('quickLinks')};
  const loginText = ${getField('loginText')};
  const signUpText = ${getField('signUpText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  let megaMenuTimeout: NodeJS.Timeout;

  const handleMegaMenuEnter = () => {
    clearTimeout(megaMenuTimeout);
    setMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeout = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  const handleNavClick = (link: any) => {
    console.log('Navigation clicked:', link);
  };

  const handleMenuItemClick = (item: any) => {
    console.log('Menu item clicked:', item);
    setMegaMenuOpen(false);
  };

  const handleLogin = () => {
    console.log('Login clicked');
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{brandName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationLinks.map((link: any, index: number) => (
                <div key={index} className="relative">
                  {link.hasMegaMenu ? (
                    <div
                      onMouseEnter={handleMegaMenuEnter}
                      onMouseLeave={handleMegaMenuLeave}
                    >
                      <button
                        className="flex items-center gap-1 cursor-pointer group text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link.label}
                        <ChevronDown className={\`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all \${megaMenuOpen ? 'rotate-180' : ''}\`} />
                      </button>
                    </div>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link);
                      }}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                onClick={handleLogin}
              >
                {loginText}
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                onClick={handleSignUp}
              >
                {signUpText}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mega Menu Dropdown - Full Width */}
          {megaMenuOpen && (
            <div
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
              className="absolute left-0 right-0 top-full mt-0 bg-white/95 backdrop-blur-xl dark:bg-gray-800/95 border-b border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50 animate-in fade-in slide-in-from-top-5 duration-300"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-4 gap-8">
                  {/* Menu Columns */}
                  {megaMenuColumns.map((column: any, colIndex: number) => (
                    <div key={colIndex}>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                        {column.title}
                      </h3>
                      <ul className="space-y-3">
                        {column.items.map((item: any, itemIndex: number) => (
                          <li key={itemIndex}>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleMenuItemClick(item);
                              }}
                              className="group block"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className={\`text-xs px-2 py-0.5 rounded-full font-medium \${
                                    item.badge === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                    item.badge === 'Hot' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                    'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                  }\`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {item.description}
                                </p>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Quick Links Column */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                      Quick Links
                    </h3>
                    <ul className="space-y-3">
                      {quickLinks.map((link: any, index: number) => (
                        <li key={index}>
                          <a
                            href={link.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleMenuItemClick(link);
                            }}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                          >
                            {link.label}
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-4"
                  >
                    {link.label}
                  </a>
                ))}

                {/* Mobile Auth Buttons */}
                <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors text-left"
                    onClick={handleLogin}
                  >
                    {loginText}
                  </button>
                  <button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-left"
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

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mega Menu Dropdown - Full Width</h1>
        <p className="text-gray-600 dark:text-gray-400">Full-width mega menu with multi-column layout and quick links</p>
      </div>
    </div>
  );
}
    `,

    contained: `
${commonImports}

interface MegaMenuDropdownProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function MegaMenuDropdown({ ${dataName}: propData, className }: MegaMenuDropdownProps) {
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const megaMenuColumns = ${getField('megaMenuColumns')};
  const loginText = ${getField('loginText')};
  const signUpText = ${getField('signUpText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  let megaMenuTimeout: NodeJS.Timeout;

  const handleMegaMenuEnter = () => {
    clearTimeout(megaMenuTimeout);
    setMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeout = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  const handleNavClick = (link: any) => {
    console.log('Navigation clicked:', link);
  };

  const handleMenuItemClick = (item: any) => {
    console.log('Menu item clicked:', item);
    setMegaMenuOpen(false);
  };

  const handleLogin = () => {
    console.log('Login clicked');
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{brandName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationLinks.map((link: any, index: number) => (
                <div key={index} className="relative">
                  {link.hasMegaMenu ? (
                    <div
                      onMouseEnter={handleMegaMenuEnter}
                      onMouseLeave={handleMegaMenuLeave}
                    >
                      <button
                        className="flex items-center gap-1 cursor-pointer group text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link.label}
                        <ChevronDown className={\`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all \${megaMenuOpen ? 'rotate-180' : ''}\`} />
                      </button>

                      {/* Mega Menu Dropdown - Contained */}
                      {megaMenuOpen && (
                        <div
                          className="absolute left-0 top-full mt-2 w-[800px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                        >
                          <div className="p-6">
                            <div className="grid grid-cols-3 gap-6">
                              {megaMenuColumns.map((column: any, colIndex: number) => (
                                <div key={colIndex}>
                                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                                    {column.title}
                                  </h3>
                                  <ul className="space-y-2">
                                    {column.items.map((item: any, itemIndex: number) => (
                                      <li key={itemIndex}>
                                        <a
                                          href={item.href}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleMenuItemClick(item);
                                          }}
                                          className="group block p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                              {item.label}
                                            </span>
                                            {item.badge && (
                                              <span className={\`text-xs px-2 py-0.5 rounded-full font-medium \${
                                                item.badge === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                                item.badge === 'Hot' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                                'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                              }\`}>
                                                {item.badge}
                                              </span>
                                            )}
                                          </div>
                                          {item.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                              {item.description}
                                            </p>
                                          )}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
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
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                onClick={handleLogin}
              >
                {loginText}
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                onClick={handleSignUp}
              >
                {signUpText}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2"
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
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-4"
                  >
                    {link.label}
                  </a>
                ))}

                {/* Mobile Auth Buttons */}
                <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors text-left"
                    onClick={handleLogin}
                  >
                    {loginText}
                  </button>
                  <button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-left"
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

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mega Menu Dropdown - Contained</h1>
        <p className="text-gray-600 dark:text-gray-400">Contained mega menu dropdown with rounded card design</p>
      </div>
    </div>
  );
}
    `,

    withImages: `
${commonImports}

interface MegaMenuDropdownProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function MegaMenuDropdown({ ${dataName}: propData, className }: MegaMenuDropdownProps) {
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const megaMenuColumns = ${getField('megaMenuColumns')};
  const featuredProducts = ${getField('featuredProducts')};
  const promotionalBanner = ${getField('promotionalBanner')};
  const loginText = ${getField('loginText')};
  const signUpText = ${getField('signUpText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  let megaMenuTimeout: NodeJS.Timeout;

  const handleMegaMenuEnter = () => {
    clearTimeout(megaMenuTimeout);
    setMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    megaMenuTimeout = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 200);
  };

  const handleNavClick = (link: any) => {
    console.log('Navigation clicked:', link);
  };

  const handleMenuItemClick = (item: any) => {
    console.log('Menu item clicked:', item);
    setMegaMenuOpen(false);
  };

  const handleProductClick = (product: any) => {
    console.log('Product clicked:', product);
    setMegaMenuOpen(false);
  };

  const handlePromoClick = () => {
    console.log('Promotional banner clicked');
    setMegaMenuOpen(false);
  };

  const handleLogin = () => {
    console.log('Login clicked');
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{brandName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationLinks.map((link: any, index: number) => (
                <div key={index} className="relative">
                  {link.hasMegaMenu ? (
                    <div
                      onMouseEnter={handleMegaMenuEnter}
                      onMouseLeave={handleMegaMenuLeave}
                    >
                      <button
                        className="flex items-center gap-1 cursor-pointer group text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {link.label}
                        <ChevronDown className={\`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all \${megaMenuOpen ? 'rotate-180' : ''}\`} />
                      </button>
                    </div>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link);
                      }}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                onClick={handleLogin}
              >
                {loginText}
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                onClick={handleSignUp}
              >
                {signUpText}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mega Menu Dropdown - With Images */}
          {megaMenuOpen && (
            <div
              onMouseEnter={handleMegaMenuEnter}
              onMouseLeave={handleMegaMenuLeave}
              className="absolute left-0 right-0 top-full mt-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-5 gap-8">
                  {/* Menu Columns */}
                  {megaMenuColumns.slice(0, 2).map((column: any, colIndex: number) => (
                    <div key={colIndex}>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                        {column.title}
                      </h3>
                      <ul className="space-y-3">
                        {column.items.map((item: any, itemIndex: number) => (
                          <li key={itemIndex}>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleMenuItemClick(item);
                              }}
                              className="group block"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className={\`text-xs px-2 py-0.5 rounded-full font-medium \${
                                    item.badge === 'New' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                    item.badge === 'Hot' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                    'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                  }\`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {item.description}
                                </p>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Featured Products with Images */}
                  <div className="col-span-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                      Featured Products
                    </h3>
                    <div className="space-y-4">
                      {featuredProducts.map((product: any, index: number) => (
                        <a
                          key={index}
                          href={product.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleProductClick(product);
                          }}
                          className="group flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {product.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {product.description}
                            </p>
                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">
                              {product.price}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Promotional Banner */}
                  <div>
                    <a
                      href={promotionalBanner.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePromoClick();
                      }}
                      className={\`block p-6 rounded-lg bg-gradient-to-br \${promotionalBanner.bgColor} text-white hover:shadow-lg transition-shadow\`}
                    >
                      <h3 className="text-lg font-bold mb-2">{promotionalBanner.title}</h3>
                      <p className="text-sm opacity-90 mb-4">{promotionalBanner.description}</p>
                      <span className="inline-flex items-center gap-2 text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                        {promotionalBanner.buttonText}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-4"
                  >
                    {link.label}
                  </a>
                ))}

                {/* Mobile Auth Buttons */}
                <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors text-left"
                    onClick={handleLogin}
                  >
                    {loginText}
                  </button>
                  <button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl text-left"
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

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Mega Menu Dropdown - With Images</h1>
        <p className="text-gray-600 dark:text-gray-400">Enhanced mega menu with product images and promotional banner</p>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.fullWidth;
};
