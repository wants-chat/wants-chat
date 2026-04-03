import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateHeaderTransparent = (
  resolved: ResolvedComponent,
  variant: 'transparent' | 'onScroll' | 'withGradient' = 'transparent'
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
import { Menu, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    transparent: `
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

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
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

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <header className={cn('absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-md', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg"></div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">{brandName}</span>
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
                  className={\`\${link.active ? 'text-white font-semibold bg-white/20 rounded-xl px-3 py-2' : 'text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-3 py-2'} transition-all duration-300\`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex">
              <button
                className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                onClick={handleCtaClick}
              >
                {ctaButtonText}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/10 backdrop-blur-lg rounded-2xl mt-2 border border-white/20 overflow-hidden shadow-2xl animate-in slide-in-from-top duration-300">
              <nav className="flex flex-col p-4 space-y-3">
                {navigationLinks.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link);
                    }}
                    className={\`\${link.active ? 'text-white font-semibold' : 'text-white/80 hover:text-white'} transition-colors px-2 py-1\`}
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  className="bg-white text-blue-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-white/90 transition-all mt-3"
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
      <div className="pt-32 px-8 text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Transparent Header</h1>
        <p className="text-xl text-white/90 mb-8">Fully transparent header that blends with the background</p>
        <div className="h-screen"></div>
      </div>
    </div>
  );
}
    `,

    onScroll: `
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
  const [isScrolled, setIsScrolled] = useState(false);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const ctaButtonText = ${getField('ctaButtonText')};
  const scrollThreshold = ${getField('scrollThreshold')};

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

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

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg'
          : 'bg-transparent',
        className
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={\`flex items-center justify-between transition-all duration-300 \${isScrolled ? 'h-16' : 'h-20'}\`}>
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className={\`transition-all duration-300 rounded-lg \${
                isScrolled
                  ? 'w-8 h-8 bg-blue-600'
                  : 'w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30'
              }\`}></div>
              <span className={\`text-2xl font-bold transition-colors duration-300 \${
                isScrolled
                  ? 'text-gray-900 dark:text-white'
                  : 'text-white'
              }\`}>{brandName}</span>
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
                  className={cn(
                    'transition-colors duration-300',
                    link.active
                      ? isScrolled
                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-white font-semibold'
                      : isScrolled
                        ? 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        : 'text-white/80 hover:text-white'
                  )}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex">
              <button
                className={cn(
                  'px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg',
                  isScrolled
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-blue-600 hover:bg-white/90 hover:shadow-xl'
                )}
                onClick={handleCtaClick}
              >
                {ctaButtonText}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  'p-2 transition-colors duration-300',
                  isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
                )}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-gray-800 rounded-lg mt-2 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl">
              <nav className="flex flex-col p-4 space-y-3">
                {navigationLinks.map((link: any, index: number) => (
                  <a
                    key={index}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link);
                    }}
                    className={\`\${link.active ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'} transition-colors px-2 py-1\`}
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all mt-3"
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
      <div className="pt-32 px-8 text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Scroll-Aware Header</h1>
        <p className="text-xl text-white/90 mb-8">Header changes background and size on scroll</p>
        <div className="h-[200vh] flex items-center justify-center">
          <p className="text-white/70">Scroll down to see the header transform</p>
        </div>
      </div>
    </div>
  );
}
    `,

    withGradient: `
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
  const [isScrolled, setIsScrolled] = useState(false);

  const brandName = ${getField('brandName')};
  const navigationLinks = ${getField('navigationLinks')};
  const ctaButtonText = ${getField('ctaButtonText')};
  const scrollThreshold = ${getField('scrollThreshold')};

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

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

  const handleCtaClick = () => {
    console.log('CTA clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-600 via-purple-600 to-blue-600">
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        className
      )}>
        {/* Gradient Overlay */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-600/80 backdrop-blur-md transition-opacity duration-500',
          isScrolled ? 'opacity-100' : 'opacity-0'
        )}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40 flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded"></div>
              </div>
              <span className="text-2xl font-bold text-white drop-shadow-lg">{brandName}</span>
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
                  className={\`\${
                    link.active
                      ? 'text-white font-semibold drop-shadow-md'
                      : 'text-white/90 hover:text-white'
                  } transition-all duration-300 hover:drop-shadow-md\`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex">
              <button
                className="bg-white text-purple-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                onClick={handleCtaClick}
              >
                {ctaButtonText}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 bg-white/10 rounded-lg backdrop-blur-sm"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/20 backdrop-blur-xl rounded-2xl mt-2 border border-white/30 overflow-hidden shadow-2xl">
              <nav className="flex flex-col p-4 space-y-3">
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
                        ? 'text-white font-semibold bg-white/20'
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                    } transition-all px-4 py-2 rounded-lg\`}
                  >
                    {link.label}
                  </a>
                ))}
                <button
                  className="bg-white text-purple-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-white/90 transition-all mt-3 shadow-lg"
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
      <div className="pt-32 px-8 text-center text-white">
        <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Gradient Overlay Header</h1>
        <p className="text-xl text-white/90 mb-8 drop-shadow-md">Gradient overlay appears on scroll for better readability</p>
        <div className="h-[200vh] flex items-center justify-center">
          <p className="text-white/80 drop-shadow">Scroll to see the gradient overlay effect</p>
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.transparent;
};
