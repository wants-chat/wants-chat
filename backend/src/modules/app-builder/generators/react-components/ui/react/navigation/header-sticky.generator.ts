import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHeaderSticky = (
  resolved: ResolvedComponent,
  variant: 'sticky' | 'compressed' | 'animated' = 'sticky'
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
import { Menu, X, Search, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    sticky: `
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
  const [isSticky, setIsSticky] = useState(false);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const ctaButtonText = ${getField('ctaButtonText')};
  const stickyThreshold = ${getField('stickyThreshold')};

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > stickyThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stickyThreshold]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted');
  };

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isSticky ? 'bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50' : 'bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700',
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
                <div className="w-4 h-4 bg-white rounded"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{brandName}</span>
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
                  className={\`\${
                    link.active
                      ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700/50 px-3 py-2 rounded-xl'
                  } transition-all duration-300\`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Search & CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="pl-10 pr-4 py-2 w-48 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>
              <button
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
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
              <nav className="flex flex-col space-y-4">
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
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    } transition-colors px-4\`}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </form>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                    onClick={handleCtaClick}
                  >
                    {ctaButtonText}
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Sticky Header</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Header stays at top with shadow on scroll</p>
        <div className="h-[200vh] bg-white dark:bg-gray-800 rounded-xl p-8">
          <p className="text-gray-600 dark:text-gray-400">Scroll down to see the sticky behavior with shadow effect</p>
        </div>
      </div>
    </div>
  );
}
    `,

    compressed: `
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
  const [isCompressed, setIsCompressed] = useState(false);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const ctaButtonText = ${getField('ctaButtonText')};
  const stickyThreshold = ${getField('stickyThreshold')};

  useEffect(() => {
    const handleScroll = () => {
      setIsCompressed(window.scrollY > stickyThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stickyThreshold]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted');
  };

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className={cn(
        'sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-all duration-300',
        isCompressed ? 'shadow-md' : '',
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={\`flex items-center justify-between transition-all duration-300 \${isCompressed ? 'h-14' : 'h-20'}\`}>
            {/* Logo - Changes size when compressed */}
            <div className="flex items-center gap-2">
              <div className={\`bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 \${
                isCompressed ? 'w-8 h-8' : 'w-10 h-10'
              }\`}>
                <div className={\`bg-white rounded transition-all duration-300 \${
                  isCompressed ? 'w-3 h-3' : 'w-4 h-4'
                }\`}></div>
              </div>
              <span className={\`font-bold text-gray-900 dark:text-white transition-all duration-300 \${
                isCompressed ? 'text-lg' : 'text-2xl'
              }\`}>{brandName}</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
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
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  } transition-all duration-300 \${isCompressed ? 'text-sm' : 'text-base'}\`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Search & CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {!isCompressed && (
                <form onSubmit={handleSearchSubmit} className="relative animate-in fade-in duration-300">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="pl-10 pr-4 py-2 w-48 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </form>
              )}
              <button
                className={\`bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 \${
                  isCompressed ? 'px-4 py-1.5 text-sm' : 'px-5 py-2'
                }\`}
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
              <nav className="flex flex-col space-y-4">
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
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    } transition-colors px-4\`}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </form>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                    onClick={handleCtaClick}
                  >
                    {ctaButtonText}
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Compressed Sticky Header</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Header reduces height and hides search on scroll</p>
        <div className="h-[200vh] bg-white dark:bg-gray-800 rounded-xl p-8">
          <p className="text-gray-600 dark:text-gray-400">Scroll down to see the header compress with smooth animations</p>
        </div>
      </div>
    </div>
  );
}
    `,

    animated: `
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
  const [isAnimated, setIsAnimated] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const ctaButtonText = ${getField('ctaButtonText')};
  const userAvatar = ${getField('userAvatar')};

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setIsAnimated(currentScrollPos > 80);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted');
  };

  const handleUserClick = () => {
    console.log('User clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-all duration-500',
        visible ? 'translate-y-0' : '-translate-y-full',
        isAnimated ? 'shadow-xl backdrop-blur-lg bg-white/95 dark:bg-gray-800/95' : '',
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={\`flex items-center justify-between transition-all duration-500 \${isAnimated ? 'h-16' : 'h-20'}\`}>
            {/* Logo with animation */}
            <div className="flex items-center gap-2 overflow-hidden">
              <div className={\`bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transition-all duration-500 \${
                isAnimated ? 'w-8 h-8 rotate-180' : 'w-10 h-10 rotate-0'
              }\`}>
                <div className="w-4 h-4 bg-white rounded"></div>
              </div>
              <span className={\`font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-500 \${
                isAnimated ? 'text-lg' : 'text-2xl'
              }\`}>{brandName}</span>
            </div>

            {/* Desktop Navigation with stagger animation */}
            <nav className="hidden lg:flex items-center space-x-6">
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
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  } transition-all duration-300 hover:scale-110\`}
                  style={{ transitionDelay: \`\${index * 50}ms\` }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Search & User */}
            <div className="hidden lg:flex items-center gap-4">
              <form onSubmit={handleSearchSubmit} className={\`relative transition-all duration-500 \${
                isAnimated ? 'w-32' : 'w-56'
              }\`}>
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </form>
              <button
                onClick={handleUserClick}
                className="relative group"
              >
                <img
                  src={userAvatar}
                  alt="User"
                  className={\`rounded-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:ring-2 group-hover:ring-blue-500 \${
                    isAnimated ? 'w-8 h-8' : 'w-10 h-10'
                  }\`}
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 transition-transform duration-300 hover:scale-110"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 animate-in slide-in-from-top duration-300">
              <nav className="flex flex-col space-y-4">
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
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    } transition-colors px-4\`}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col space-y-3 px-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </form>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-8 pt-32 pb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Animated Sticky Header</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Header hides on scroll down, shows on scroll up with smooth animations</p>
        <div className="h-[300vh] bg-white dark:bg-gray-800 rounded-xl p-8">
          <p className="text-gray-600 dark:text-gray-400">Scroll to see the header hide and show with animations. Logo rotates, elements resize smoothly.</p>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.sticky;
};
