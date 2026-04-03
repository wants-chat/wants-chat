import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDocumentationViewer = (
  resolved: ResolvedComponent,
  variant: 'sidebar' | 'fullWidth' | 'mobile' = 'sidebar'
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
    return `/${dataSource || 'docs'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'docs';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    sidebar: `
${commonImports}
import { Search, ChevronRight, ChevronDown, Copy, Check, Github, Clock, User, ExternalLink } from 'lucide-react';

interface NavigationSection {
  id: number;
  title: string;
  icon: string;
  items: { id: number; label: string; slug: string }[];
}

interface TocItem {
  id: number;
  title: string;
  level: number;
  slug: string;
}

interface SidebarDocsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const SidebarDocs: React.FC<SidebarDocsProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [expandedSections, setExpandedSections] = useState<number[]>([1]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSection, setActiveSection] = useState('quick-start');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const docData = ${dataName} || {};

  const title = ${getField('sidebarTitle')};
  const navigationSections = ${getField('navigationSections')};
  const currentDocument = ${getField('currentDocument')};
  const tableOfContents = ${getField('tableOfContents')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const editOnGithubButton = ${getField('editOnGithubButton')};
  const copyCodeButton = ${getField('copyCodeButton')};
  const copiedButton = ${getField('copiedButton')};
  const onThisPageLabel = ${getField('onThisPageLabel')};
  const lastUpdatedLabel = ${getField('lastUpdatedLabel')};
  const readTimeLabel = ${getField('readTimeLabel')};
  const previousButton = ${getField('previousButton')};
  const nextButton = ${getField('nextButton')};

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
    console.log('Section toggled:', sectionId);
  };

  const handleNavClick = (slug: string) => {
    setActiveSection(slug);
    console.log('Navigation clicked:', slug);
  };

  const handleCopyCode = () => {
    setCopiedCode(true);
    console.log('Code copied');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleTocClick = (slug: string) => {
    console.log('TOC item clicked:', slug);
  };

  return (
    <div className={cn("flex h-screen", className)}>
      {/* Left Sidebar - Navigation */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900">
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h2>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <nav className="space-y-1">
            {navigationSections.map((section: NavigationSection) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{section.icon}</span>
                    <span>{section.title}</span>
                  </div>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {expandedSections.includes(section.id) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {section.items.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.slug)}
                        className={\`w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors \${
                          activeSection === item.slug
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }\`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentDocument.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{currentDocument.readTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{currentDocument.author}</span>
              </div>
              <div>
                {lastUpdatedLabel}: {currentDocument.lastUpdated}
              </div>
            </div>

            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <Github className="h-4 w-4" />
              {editOnGithubButton}
            </button>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: currentDocument.content.replace(/\\\`\\\`\\\`(\w+)\\n([\\s\\S]*?)\\\`\\\`\\\`/g, (match, lang, code) => \`
              <div class="relative group">
                <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto"><code class="language-\${lang}">\${code.trim()}</code></pre>
                <button onclick="navigator.clipboard.writeText('\${code.trim()}')" class="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  \${copyCodeButton}
                </button>
              </div>
            \`) }} />
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                <ChevronRight className="h-4 w-4 rotate-180" />
                {previousButton}
              </button>
              <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                {nextButton}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - TOC */}
      <div className="w-64 border-l border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900">
        <div className="p-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            {onThisPageLabel}
          </h3>
          <nav className="space-y-2">
            {tableOfContents.map((item: TocItem) => (
              <button
                key={item.id}
                onClick={() => handleTocClick(item.slug)}
                className={\`block text-sm text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors \${
                  item.level === 2 ? 'pl-0' : 'pl-4'
                } text-gray-600 dark:text-gray-400\`}
              >
                {item.title}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SidebarDocs;
    `,

    fullWidth: `
${commonImports}
import { Search, Menu, X, Copy, Github, BookOpen, ArrowRight } from 'lucide-react';

interface NavigationSection {
  id: number;
  title: string;
  icon: string;
  items: { id: number; label: string; slug: string }[];
}

interface FullWidthDocsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const FullWidthDocs: React.FC<FullWidthDocsProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const docData = ${dataName} || {};

  const title = ${getField('fullWidthTitle')};
  const navigationSections = ${getField('navigationSections')};
  const currentDocument = ${getField('currentDocument')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const editOnGithubButton = ${getField('editOnGithubButton')};
  const viewOnGithubButton = ${getField('viewOnGithubButton')};

  const handleNavClick = (slug: string) => {
    console.log('Navigation clicked:', slug);
    setMenuOpen(false);
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">{viewOnGithubButton}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <nav className="max-w-7xl mx-auto px-4 py-4">
            {navigationSections.map((section: NavigationSection) => (
              <div key={section.id} className="mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <span>{section.icon}</span>
                  {section.title}
                </h3>
                <div className="space-y-1 ml-8">
                  {section.items.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.slug)}
                      className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Desktop Navigation */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <nav className="space-y-1">
                {navigationSections.map((section: NavigationSection) => (
                  <div key={section.id} className="mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <span>{section.icon}</span>
                      {section.title}
                    </h3>
                    <div className="space-y-1 ml-8">
                      {section.items.map((item: any) => (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.slug)}
                          className="block text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9">
            <Card className="p-8 lg:p-12">
              <div className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentDocument.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentDocument.readTime} • Last updated {currentDocument.lastUpdated}
                </p>
              </div>

              <div className="prose dark:prose-invert max-w-none prose-lg">
                <div dangerouslySetInnerHTML={{ __html: currentDocument.content }} />
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
                  <Github className="h-4 w-4" />
                  {editOnGithubButton}
                </button>
              </div>
            </Card>

            {/* Next Article */}
            <Card className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Next Article
                  </p>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Installation Guide
                  </h3>
                </div>
                <ArrowRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FullWidthDocs;
    `,

    mobile: `
${commonImports}
import { Menu, X, Search, ChevronRight, ChevronLeft, Home, BookOpen } from 'lucide-react';

interface NavigationSection {
  id: number;
  title: string;
  icon: string;
  items: { id: number; label: string; slug: string }[];
}

interface MobileDocsProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

const MobileDocs: React.FC<MobileDocsProps> = ({ ${dataName}: propData, className }) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [breadcrumb, setBreadcrumb] = useState<string[]>(['Home']);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const docData = ${dataName} || {};

  const title = ${getField('mobileTitle')};
  const navigationSections = ${getField('navigationSections')};
  const currentDocument = ${getField('currentDocument')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const previousButton = ${getField('previousButton')};
  const nextButton = ${getField('nextButton')};

  const handleNavClick = (label: string, slug: string) => {
    setBreadcrumb(['Home', label]);
    setMenuOpen(false);
    console.log('Navigation clicked:', slug);
  };

  const handleBack = () => {
    if (breadcrumb.length > 1) {
      setBreadcrumb(breadcrumb.slice(0, -1));
    }
  };

  return (
    <div className={cn("min-h-screen bg-white dark:bg-gray-900", className)}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h1>
          </div>

          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Search className="h-6 w-6" />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumb.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                <button
                  onClick={() => idx === 0 ? setBreadcrumb(['Home']) : null}
                  className={\`\${
                    idx === breadcrumb.length - 1
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-600 dark:text-gray-400'
                  }\`}
                >
                  {item}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 top-[73px] bg-white dark:bg-gray-900 z-30 overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <nav className="space-y-6">
              {navigationSections.map((section: NavigationSection) => (
                <div key={section.id}>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-lg">
                    <span className="text-2xl">{section.icon}</span>
                    {section.title}
                  </h3>
                  <div className="space-y-2 ml-10">
                    {section.items.map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.label, item.slug)}
                        className="flex items-center justify-between w-full text-left py-3 text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-800 rounded-lg px-2 transition-colors"
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="p-4 pb-24">
        <article>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {currentDocument.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>{currentDocument.readTime}</span>
            <span>•</span>
            <span>Updated {currentDocument.lastUpdated}</span>
          </div>

          <div className="prose dark:prose-invert prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ __html: currentDocument.content }} />
          </div>
        </article>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium active:bg-gray-50 dark:active:bg-gray-700 transition-colors">
            <ChevronLeft className="h-5 w-5" />
            {previousButton}
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium active:bg-blue-700 transition-colors">
            {nextButton}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileDocs;
    `
  };

  return variants[variant] || variants.sidebar;
};
