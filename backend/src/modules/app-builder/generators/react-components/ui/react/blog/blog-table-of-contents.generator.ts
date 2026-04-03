import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBlogTableOfContents = (
  resolved: ResolvedComponent,
  variant: 'sticky' | 'floating' | 'sidebar' = 'sticky'
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
    return `/${dataSource || 'posts'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource || 'posts';

  const commonImports = `
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';`;

  const variants = {
    sticky: `
${commonImports}
import { ChevronDown, ChevronUp, ArrowUp } from 'lucide-react';

interface Heading {
  id: string;
  title: string;
  level: number;
  children?: Heading[];
}

interface StickyTocProps {
  ${dataName}?: any;
  className?: string;
  onHeadingClick?: (headingId: string, title: string) => void;
  onBackToTop?: () => void;
}

const StickyTableOfContents: React.FC<StickyTocProps> = ({
  ${dataName}: propData,
  className,
  onHeadingClick,
  onBackToTop
}) => {
  const [activeId, setActiveId] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [readingProgress, setReadingProgress] = useState(0);

  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const tocData = ${dataName} || {};

  const title = ${getField('stickyTitle')};
  const headings = ${getField('headings')};
  const collapseLabel = ${getField('collapseLabel')};
  const expandLabel = ${getField('expandLabel')};
  const backToTopLabel = ${getField('backToTopLabel')};

  useEffect(() => {
    // Initialize all sections as expanded
    const allSectionIds = headings.map((h: Heading) => h.id);
    setExpandedSections(allSectionIds);

    // Track scroll position and active heading
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));

      // Find active heading
      const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id]');
      let currentActiveId = '';

      headingElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100) {
          currentActiveId = element.id;
        }
      });

      if (currentActiveId) {
        setActiveId(currentActiveId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleHeadingClick = (headingId: string, title: string) => {
    if (onHeadingClick) {
      onHeadingClick(headingId, title);
    } else {
      const element = document.getElementById(headingId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleBackToTop = () => {
    if (onBackToTop) {
      onBackToTop();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderHeading = (heading: Heading, isChild: boolean = false) => {
    const isActive = activeId === heading.id;
    const isExpanded = expandedSections.includes(heading.id);
    const hasChildren = heading.children && heading.children.length > 0;

    return (
      <div key={heading.id} className={isChild ? 'ml-4' : ''}>
        <div className="flex items-start gap-2 group">
          {hasChildren && !isChild && (
            <button
              onClick={() => toggleSection(heading.id)}
              className="mt-1 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronUp className="h-3 w-3 text-gray-500" />
              )}
            </button>
          )}
          <button
            onClick={() => handleHeadingClick(heading.id, heading.title)}
            className={\`flex-1 text-left py-1.5 px-2 rounded transition-all \${
              isActive
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            } \${isChild ? 'text-sm' : 'text-base'}\`}
          >
            {heading.title}
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {heading.children!.map(child => renderHeading(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("sticky top-24", className)}>
      {/* Progress Bar */}
      <div className="mb-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: \`\${readingProgress}%\` }}
        />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>

        <div className="space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {headings.map((heading: Heading) => renderHeading(heading))}
        </div>

        <button
          onClick={handleBackToTop}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
        >
          <ArrowUp className="h-4 w-4" />
          {backToTopLabel}
        </button>
      </div>
</div>
  );
};

export default StickyTableOfContents;
    `,

    floating: `
${commonImports}
import { X, List } from 'lucide-react';

interface Heading {
  id: string;
  title: string;
  level: number;
  children?: Heading[];
}

interface FloatingTocProps {
  ${dataName}?: any;
  className?: string;
  onHeadingClick?: (headingId: string, title: string) => void;
}

const FloatingTableOfContents: React.FC<FloatingTocProps> = ({
  ${dataName}: propData,
  className,
  onHeadingClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState(0);

  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const tocData = ${dataName} || {};

  const title = ${getField('floatingTitle')};
  const headings = ${getField('headings')};

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));

      // Find active heading
      const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id]');
      let currentActiveId = '';

      headingElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100) {
          currentActiveId = element.id;
        }
      });

      if (currentActiveId) {
        setActiveId(currentActiveId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleHeadingClick = (headingId: string, title: string) => {
    if (onHeadingClick) {
      onHeadingClick(headingId, title);
    } else {
      const element = document.getElementById(headingId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setIsOpen(false);
  };

  const renderHeading = (heading: Heading, isChild: boolean = false) => {
    const isActive = activeId === heading.id;

    return (
      <div key={heading.id} className={isChild ? 'ml-4' : ''}>
        <button
          onClick={() => handleHeadingClick(heading.id, heading.title)}
          className={\`w-full text-left py-2 px-3 rounded transition-all \${
            isActive
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-semibold'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
          } \${isChild ? 'text-sm' : 'text-base'}\`}
        >
          {heading.title}
        </button>

        {heading.children && heading.children.length > 0 && (
          <div className="space-y-1">
            {heading.children.map(child => renderHeading(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-40 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all",
          isOpen && "bg-gray-600 hover:bg-gray-700",
          className
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <List className="h-6 w-6" />}
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="fixed bottom-24 right-6 z-50 w-80 max-h-[70vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border dark:border-gray-700 overflow-hidden">
            {/* Progress Bar */}
            <div className="h-1 bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: \`\${readingProgress}%\` }}
              />
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-1 max-h-[calc(70vh-100px)] overflow-y-auto custom-scrollbar">
                {headings.map((heading: Heading) => renderHeading(heading))}
              </div>
            </div>
          </div>
        </>
      )}
</>
  );
};

export default FloatingTableOfContents;
    `,

    sidebar: `
${commonImports}
import { ChevronRight } from 'lucide-react';

interface Heading {
  id: string;
  title: string;
  level: number;
  children?: Heading[];
}

interface SidebarTocProps {
  ${dataName}?: any;
  className?: string;
  onHeadingClick?: (headingId: string, title: string) => void;
}

const SidebarTableOfContents: React.FC<SidebarTocProps> = ({
  ${dataName}: propData,
  className,
  onHeadingClick
}) => {
  const [activeId, setActiveId] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Dynamic data fetching
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response[0] : (response?.data?.[0] || response?.data || response);
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

  const tocData = ${dataName} || {};

  const title = ${getField('sidebarTitle')};
  const headings = ${getField('headings')};

  useEffect(() => {
    // Initialize all sections as expanded
    const allSectionIds = headings.map((h: Heading) => h.id);
    setExpandedSections(allSectionIds);

    const handleScroll = () => {
      const headingElements = document.querySelectorAll('h1[id], h2[id], h3[id]');
      let currentActiveId = '';

      headingElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100) {
          currentActiveId = element.id;
        }
      });

      if (currentActiveId) {
        setActiveId(currentActiveId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleHeadingClick = (headingId: string, title: string) => {
    if (onHeadingClick) {
      onHeadingClick(headingId, title);
    } else {
      const element = document.getElementById(headingId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const renderHeading = (heading: Heading, isChild: boolean = false) => {
    const isActive = activeId === heading.id;
    const isExpanded = expandedSections.includes(heading.id);
    const hasChildren = heading.children && heading.children.length > 0;

    return (
      <div key={heading.id}>
        <div className="flex items-center gap-1">
          {hasChildren && !isChild && (
            <button
              onClick={() => toggleSection(heading.id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <ChevronRight
                className={\`h-3 w-3 text-gray-500 transition-transform \${
                  isExpanded ? 'rotate-90' : ''
                }\`}
              />
            </button>
          )}
          <button
            onClick={() => handleHeadingClick(heading.id, heading.title)}
            className={\`flex-1 text-left py-1.5 px-2 rounded border-l-2 transition-all \${
              isActive
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
            } \${isChild ? 'text-sm ml-4' : 'text-sm'}\`}
          >
            {heading.title}
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-2 mt-1 space-y-1">
            {heading.children!.map(child => renderHeading(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn("w-64", className)}>
      <div className="sticky top-24">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            {title}
          </h3>
        </div>

        <nav className="space-y-1">
          {headings.map((heading: Heading) => renderHeading(heading))}
        </nav>
      </div>
    </aside>
  );
};

export default SidebarTableOfContents;
    `
  };

  return variants[variant] || variants.sticky;
};
