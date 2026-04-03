import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHeaderMegaMenu = (
  resolved: ResolvedComponent,
  variant: 'dropdown' | 'flyout' | 'fullScreen' = 'dropdown'
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
    return `/${dataSource || 'header'}`;
  };

  const apiRoute = getApiRoute();

  // Derive entity name for query key
  const entity = dataSource ? dataSource.split('.').pop() || 'header' : 'header';

  const commonImports = `
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Menu, X, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    dropdown: `
${commonImports}

interface HeaderProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function Header({ ${dataName}: propData, className }: HeaderProps) {
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

  const headerData = ${dataName} || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const megaMenuCategories = ${getField('megaMenuCategories')};
  const featuredItems = ${getField('featuredItems')};
  const quickLinks = ${getField('quickLinks')};
  const ctaButtonText = ${getField('ctaButtonText')};
  const menuCloseDelay = ${getField('menuCloseDelay')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleMouseEnter = (label: string) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setActiveMegaMenu(label);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveMegaMenu(null);
    }, menuCloseDelay);
    setCloseTimeout(timeout);
  };

  const handleNavClick = (link: any) => {
    console.log('Navigation clicked:', link);
  };

  const handleMegaItemClick = (item: any) => {
    console.log('Mega menu item clicked:', item);
    setActiveMegaMenu(null);
  };

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl"></div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{brandName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationLinks.map((link: any, index: number) => (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => link.hasMegaMenu && handleMouseEnter(link.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link);
                    }}
                    className={\`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors \${
                      link.active || activeMegaMenu === link.label
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }\`}
                  >
                    {link.label}
                    {link.hasMegaMenu && <ChevronDown className={\`w-4 h-4 transition-transform \${activeMegaMenu === link.label ? 'rotate-180' : ''}\`} />}
                  </a>

                  {/* Mega Menu Dropdown */}
                  {link.hasMegaMenu && activeMegaMenu === link.label && (
                    <div className="absolute left-0 top-full pt-2 w-screen max-w-4xl -ml-64">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl p-8 animate-in fade-in slide-in-from-top-5 duration-300">
                        <div className="grid grid-cols-12 gap-8">
                          {/* Categories */}
                          <div className="col-span-8 grid grid-cols-2 gap-6">
                            {megaMenuCategories.map((category: any, catIndex: number) => (
                              <div key={catIndex}>
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                  {category.title}
                                </h3>
                                <ul className="space-y-3">
                                  {category.items.map((item: any, itemIndex: number) => (
                                    <li key={itemIndex}>
                                      <a
                                        href={item.href}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleMegaItemClick(item);
                                        }}
                                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                                      >
                                        <span className="text-2xl">{item.icon}</span>
                                        <div>
                                          <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {item.label}
                                          </div>
                                          <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.description}
                                          </div>
                                        </div>
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>

                          {/* Featured Section */}
                          <div className="col-span-4">
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                              Featured
                            </h3>
                            <div className="space-y-4">
                              {featuredItems.map((item: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={item.href}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleMegaItemClick(item);
                                  }}
                                  className="block rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 hover:shadow-lg transition-all group"
                                >
                                  <div className="relative h-32 overflow-hidden">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                      {item.badge}
                                    </div>
                                  </div>
                                  <div className="p-3">
                                    <div className="font-medium text-gray-900 dark:text-white mb-1">{item.title}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                                  </div>
                                </a>
                              ))}
                            </div>

                            {/* Quick Links */}
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                Quick Links
                              </h4>
                              <ul className="space-y-2">
                                {quickLinks.map((qlink: any, idx: number) => (
                                  <li key={idx}>
                                    <a href={qlink.href} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                      {qlink.label}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex">
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                onClick={handleCtaClick}
              >
                {ctaButtonText}
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
              <nav className="flex flex-col space-y-2">
                {navigationLinks.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link);
                    }}
                    className={\`\${
                      link.active
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } transition-colors px-4 py-2 rounded-lg\`}
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors mt-4 mx-4"
                  onClick={handleCtaClick}
                >
                  {ctaButtonText}
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Mega Menu Header - Dropdown</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Hover over Products or Solutions to see the mega menu</p>
        <div className="h-screen bg-white dark:bg-gray-800 rounded-xl p-8">
          <p className="text-gray-600 dark:text-gray-400">Multi-column mega menu with featured items and quick links</p>
        </div>
      </div>
    </div>
  );
}
    `,

    flyout: `
${commonImports}

interface HeaderProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function Header({ ${dataName}: propData, className }: HeaderProps) {
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

  const headerData = ${dataName} || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const megaMenuCategories = ${getField('megaMenuCategories')};
  const featuredItems = ${getField('featuredItems')};
  const promotionalBanner = ${getField('promotionalBanner')};
  const ctaButtonText = ${getField('ctaButtonText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleNavClick = (link: any) => {
    console.log('Navigation clicked:', link);
  };

  const handleMegaItemClick = (item: any) => {
    console.log('Mega menu item clicked:', item);
    setActiveMegaMenu(null);
  };

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  const handlePromoBannerClick = () => {
    console.log('Promo banner clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl"></div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{brandName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationLinks.map((link: any, index: number) => (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => link.hasMegaMenu && setActiveMegaMenu(link.label)}
                  onMouseLeave={() => setActiveMegaMenu(null)}
                >
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link);
                    }}
                    className={\`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors \${
                      link.active || activeMegaMenu === link.label
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    }\`}
                  >
                    {link.label}
                    {link.hasMegaMenu && <ChevronDown className={\`w-4 h-4 transition-transform \${activeMegaMenu === link.label ? 'rotate-180' : ''}\`} />}
                  </a>
                </div>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex">
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                onClick={handleCtaClick}
              >
                {ctaButtonText}
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
        </div>

        {/* Flyout Mega Menu */}
        {activeMegaMenu && (
          <div
            className="absolute left-0 right-0 top-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-2xl"
            onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
            onMouseLeave={() => setActiveMegaMenu(null)}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-12 gap-8">
                {/* Main Categories - Left Side */}
                <div className="col-span-7 grid grid-cols-2 gap-8">
                  {megaMenuCategories.map((category: any, catIndex: number) => (
                    <div key={catIndex}>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                        {category.title}
                      </h3>
                      <ul className="space-y-3">
                        {category.items.map((item: any, itemIndex: number) => (
                          <li key={itemIndex}>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleMegaItemClick(item);
                              }}
                              className="flex items-start gap-3 p-2 -ml-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                            >
                              <span className="text-2xl mt-0.5">{item.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {item.label}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                  {item.description}
                                </div>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Promotional Banner - Right Side */}
                <div className="col-span-5">
                  <div className={\`\${promotionalBanner.bgColor} rounded-2xl p-6 text-white h-full flex flex-col justify-between\`}>
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-2">
                        Limited Time Offer
                      </div>
                      <h3 className="text-3xl font-bold mb-3">{promotionalBanner.title}</h3>
                      <p className="text-white/90 mb-6">{promotionalBanner.description}</p>
                    </div>
                    <button
                      onClick={handlePromoBannerClick}
                      className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg inline-flex items-center justify-center"
                    >
                      {promotionalBanner.ctaText}
                    </button>
                  </div>

                  {/* Featured Items Below Banner */}
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {featuredItems.slice(0, 2).map((item: any, idx: number) => (
                      <a
                        key={idx}
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleMegaItemClick(item);
                        }}
                        className="block rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 hover:shadow-lg transition-all group"
                      >
                        <div className="relative h-20 overflow-hidden">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="p-2">
                          <div className="text-xs font-medium text-gray-900 dark:text-white">{item.title}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 px-4">
            <nav className="flex flex-col space-y-2">
              {navigationLinks.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link);
                  }}
                  className={\`\${
                    link.active
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } transition-colors px-4 py-2 rounded-lg\`}
                >
                  {link.label}
                </a>
              ))}
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors mt-4"
                onClick={handleCtaClick}
              >
                {ctaButtonText}
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Mega Menu Header - Flyout</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Hover over Products or Solutions for full-width flyout menu</p>
        <div className="h-screen bg-white dark:bg-gray-800 rounded-xl p-8">
          <p className="text-gray-600 dark:text-gray-400">Full-width mega menu with promotional banner</p>
        </div>
      </div>
    </div>
  );
}
    `,

    fullScreen: `
${commonImports}

interface HeaderProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function Header({ ${dataName}: propData, className }: HeaderProps) {
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

  const headerData = ${dataName} || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fullScreenMenuOpen, setFullScreenMenuOpen] = useState(false);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const megaMenuCategories = ${getField('megaMenuCategories')};
  const featuredItems = ${getField('featuredItems')};
  const quickLinks = ${getField('quickLinks')};
  const ctaButtonText = ${getField('ctaButtonText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleNavClick = (link: any) => {
    if (link.hasMegaMenu) {
      setFullScreenMenuOpen(true);
    } else {
      console.log('Navigation clicked:', link);
    }
  };

  const handleMegaItemClick = (item: any) => {
    console.log('Mega menu item clicked:', item);
    setFullScreenMenuOpen(false);
  };

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl"></div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{brandName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationLinks.map((link: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(link)}
                  className={\`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors \${
                    link.active
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }\`}
                >
                  {link.label}
                  {link.hasMegaMenu && <ChevronDown className="w-4 h-4" />}
                </button>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex">
              <button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
                onClick={handleCtaClick}
              >
                {ctaButtonText}
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
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 px-4">
            <nav className="flex flex-col space-y-2">
              {navigationLinks.map((link: any, index: number) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(link)}
                  className={\`\${
                    link.active
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } transition-colors px-4 py-2 rounded-lg text-left\`}
                >
                  {link.label}
                </button>
              ))}
              <button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all mt-4"
                onClick={handleCtaClick}
              >
                {ctaButtonText}
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Full Screen Mega Menu Overlay */}
      {fullScreenMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 animate-in fade-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Close Button */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl"></div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{brandName}</span>
              </div>
              <button
                onClick={() => setFullScreenMenuOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-8 h-8 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-12 gap-12">
              {/* Categories */}
              <div className="col-span-8">
                <div className="grid grid-cols-2 gap-12">
                  {megaMenuCategories.map((category: any, catIndex: number) => (
                    <div key={catIndex}>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                        {category.title}
                      </h3>
                      <ul className="space-y-4">
                        {category.items.map((item: any, itemIndex: number) => (
                          <li key={itemIndex}>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleMegaItemClick(item);
                              }}
                              className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                            >
                              <span className="text-3xl">{item.icon}</span>
                              <div className="flex-1">
                                <div className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1">
                                  {item.label}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.description}
                                </div>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured & Quick Links */}
              <div className="col-span-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Featured
                </h3>
                <div className="space-y-4 mb-8">
                  {featuredItems.map((item: any, idx: number) => (
                    <a
                      key={idx}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleMegaItemClick(item);
                      }}
                      className="block rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 hover:shadow-2xl transition-all group"
                    >
                      <div className="relative h-40 overflow-hidden">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold">
                          {item.badge}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">{item.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Quick Links */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
                  <ul className="space-y-3">
                    {quickLinks.map((qlink: any, idx: number) => (
                      <li key={idx}>
                        <a href={qlink.href} className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                          {qlink.label} →
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Mega Menu Header - Full Screen</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Click Products or Solutions for full-screen overlay menu</p>
        <div className="h-screen bg-white dark:bg-gray-800 rounded-xl p-8">
          <p className="text-gray-600 dark:text-gray-400">Immersive full-screen mega menu experience</p>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.dropdown;
};
