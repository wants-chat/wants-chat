import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateSkipNavigation = (
  resolved: ResolvedComponent,
  variant: 'default' | 'withList' | 'accessible' = 'default'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import { Play, Menu, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';`;

  const variants = {
    default: `
${commonImports}

interface SkipNavigationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SkipNavigation({ ${dataName}: propData, className }: SkipNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const navData = ${dataName} || {};

  const brandName = ${getField('brandName')};
  const skipLinks = ${getField('skipLinks')};
  const navigationLinks = ${getField('navigationLinks')};
  const mainHeading = ${getField('mainHeading')};
  const mainDescription = ${getField('mainDescription')};
  const footerText = ${getField('footerText')};

  const handleSkipLinkClick = (link: any) => {
    console.log('Skip link clicked:', link);
  };

  const handleNavClick = (link: any) => {
    console.log('Navigation clicked:', link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip Navigation Links */}
      <div className="sr-only focus-within:not-sr-only">
        {skipLinks.map((link: any, index: number) => (
          <a
            key={index}
            href={link.href}
            onClick={(e) => {
              e.preventDefault();
              handleSkipLinkClick(link);
              const target = document.querySelector(link.href);
              if (target) {
                (target as HTMLElement).focus();
                target.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-2 rounded-br-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 z-50"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Header */}
      <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{brandName}</span>
            </div>

            {/* Navigation */}
            <nav id="navigation" tabIndex={-1} className="focus:outline-none">
              <ul className="flex items-center space-x-8">
                {navigationLinks.map((link: any, index: number) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link);
                      }}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded px-2 py-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="focus:outline-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{mainHeading}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{mainDescription}</p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How to Use Skip Links</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Press the Tab key when the page loads</li>
            <li>Skip links will appear at the top of the page</li>
            <li>Use Tab to navigate between skip links</li>
            <li>Press Enter to jump to the selected section</li>
          </ol>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Benefits</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
            <li>Improves keyboard navigation experience</li>
            <li>Helps screen reader users navigate efficiently</li>
            <li>Meets WCAG 2.1 accessibility guidelines</li>
            <li>Enhances overall user experience</li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer id="footer" tabIndex={-1} className="focus:outline-none bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">{footerText}</p>
        </div>
      </footer>
    </div>
  );
}
    `,

    withList: `
${commonImports}

interface SkipNavigationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SkipNavigation({ ${dataName}: propData, className }: SkipNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const navData = ${dataName} || {};

  const brandName = ${getField('brandName')};
  const extendedSkipLinks = ${getField('extendedSkipLinks')};
  const navigationLinks = ${getField('navigationLinks')};
  const mainHeading = ${getField('mainHeading')};
  const mainDescription = ${getField('mainDescription')};
  const sidebarTitle = ${getField('sidebarTitle')};
  const footerText = ${getField('footerText')};

  const handleSkipLinkClick = (link: any) => {
    console.log('Skip link clicked:', link);
  };

  const handleNavClick = (link: any) => {
    console.log('Navigation clicked:', link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip Navigation Links - With List */}
      <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-4 focus-within:left-4 focus-within:z-50">
        <nav aria-label="Skip navigation links" className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Navigation</h2>
          <ul className="space-y-2">
            {extendedSkipLinks.map((link: any) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSkipLinkClick(link);
                    const target = document.querySelector(link.href);
                    if (target) {
                      (target as HTMLElement).focus();
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="flex items-center justify-center w-5 h-5 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded">
                    {link.key}
                  </span>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Header */}
      <header className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{brandName}</span>
            </div>

            {/* Search */}
            <div id="search" tabIndex={-1} className="flex-1 max-w-md mx-8 focus:outline-none">
              <input
                type="search"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Navigation */}
            <nav id="navigation" tabIndex={-1} className="focus:outline-none">
              <ul className="flex items-center space-x-8">
                {navigationLinks.map((link: any, index: number) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link);
                      }}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded px-2 py-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex gap-8">
        {/* Sidebar */}
        <aside id="sidebar" tabIndex={-1} className="w-64 focus:outline-none">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{sidebarTitle}</h2>
            <ul className="space-y-2">
              {navigationLinks.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link);
                    }}
                    className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{mainHeading}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{mainDescription}</p>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Enhanced Skip Links</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This variant includes additional skip links for search and sidebar, displayed in a visually enhanced list format.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
              <li>Numbered keyboard shortcuts (1-5)</li>
              <li>Grouped in a card layout</li>
              <li>Includes all major page sections</li>
              <li>Enhanced visual feedback on focus</li>
            </ul>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer id="footer" tabIndex={-1} className="focus:outline-none bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">{footerText}</p>
        </div>
      </footer>
    </div>
  );
}
    `,

    accessible: `
${commonImports}

interface SkipNavigationProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function SkipNavigation({ ${dataName}: propData, className }: SkipNavigationProps) {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const navData = ${dataName} || {};

  const brandName = ${getField('brandName')};
  const skipLinks = ${getField('skipLinks')};
  const navigationLinks = ${getField('navigationLinks')};
  const mainHeading = ${getField('mainHeading')};
  const mainDescription = ${getField('mainDescription')};
  const footerText = ${getField('footerText')};

  const handleSkipLinkClick = (link: any) => {
    console.log('Skip link clicked:', link);
  };

  const handleNavClick = (link: any) => {
    console.log('Navigation clicked:', link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip Navigation Links - Highly Accessible */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-6 focus:py-3 focus:rounded-lg focus:font-semibold focus:shadow-2xl focus:ring-4 focus:ring-blue-500 focus:ring-offset-4 focus:outline-none">
        Skip to main content
      </a>

      {/* Header with ARIA landmarks */}
      <header role="banner" className={cn('bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center" role="img" aria-label="Logo">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{brandName}</span>
            </div>

            {/* Navigation with ARIA */}
            <nav id="navigation" role="navigation" aria-label="Main navigation">
              <ul className="flex items-center space-x-8">
                {navigationLinks.map((link: any, index: number) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link);
                      }}
                      className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 rounded-lg px-3 py-2"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content with ARIA landmarks */}
      <main id="main-content" role="main" tabIndex={-1} className="focus:outline-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{mainHeading}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{mainDescription}</p>

        {/* Accessibility Features Section */}
        <section aria-labelledby="features-heading" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 id="features-heading" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Accessibility Features
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="font-medium text-gray-900 dark:text-white">ARIA Landmarks</dt>
              <dd className="text-gray-600 dark:text-gray-400 ml-4">Proper use of role attributes for screen readers</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900 dark:text-white">Focus Management</dt>
              <dd className="text-gray-600 dark:text-gray-400 ml-4">Clear visual focus indicators with high contrast</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900 dark:text-white">Keyboard Navigation</dt>
              <dd className="text-gray-600 dark:text-gray-400 ml-4">Full keyboard accessibility throughout the page</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900 dark:text-white">Screen Reader Support</dt>
              <dd className="text-gray-600 dark:text-gray-400 ml-4">Descriptive labels and ARIA attributes</dd>
            </div>
          </dl>
        </section>

        {/* WCAG Compliance Section */}
        <section aria-labelledby="wcag-heading" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 id="wcag-heading" className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            WCAG 2.1 Level AA Compliance
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400" role="list">
            <li>2.4.1 Bypass Blocks - Skip navigation links provided</li>
            <li>2.4.3 Focus Order - Logical tab order maintained</li>
            <li>2.4.7 Focus Visible - Clear focus indicators</li>
            <li>4.1.3 Status Messages - Proper ARIA labels</li>
          </ul>
        </section>
      </main>

      {/* Footer with ARIA landmarks */}
      <footer id="footer" role="contentinfo" tabIndex={-1} className="focus:outline-none bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">{footerText}</p>
        </div>
      </footer>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.default;
};
