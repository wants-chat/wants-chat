import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateArchiveWidget = (
  resolved: ResolvedComponent,
  variant: 'dropdown' | 'list' | 'accordion' = 'dropdown'
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';`;

  const variants = {
    dropdown: `
${commonImports}
import { Archive, ChevronDown, Loader2 } from 'lucide-react';

interface ArchiveEntry {
  year: number;
  month: number;
  monthName: string;
  count: number;
  slug: string;
}

interface DropdownArchiveProps {
  ${dataName}?: any;
  className?: string;
  onArchiveSelect?: (slug: string) => void;
}

const DropdownArchive: React.FC<DropdownArchiveProps> = ({
  ${dataName}: propData,
  className,
  onArchiveSelect
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = ${dataName} || {};

  const title = ${getField('dropdownTitle')};
  const subtitle = ${getField('dropdownSubtitle')};
  const archives = ${getField('archives')};

  const handleSelect = (slug: string) => {
    setSelected(slug);
    setIsOpen(false);
    if (onArchiveSelect) {
      onArchiveSelect(slug);
    } else {
      console.log('Archive selected:', slug);
    }
  };

  const selectedEntry = archives.find((a: ArchiveEntry) => a.slug === selected);
  const displayText = selectedEntry
    ? \`\${selectedEntry.monthName} \${selectedEntry.year}\`
    : 'Select a month';

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {displayText}
            </span>
            <ChevronDown className={\`h-4 w-4 text-gray-500 transition-transform \${isOpen ? 'rotate-180' : ''}\`} />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                {archives.map((archive: ArchiveEntry) => (
                  <button
                    key={archive.slug}
                    onClick={() => handleSelect(archive.slug)}
                    className={\`w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left \${
                      selected === archive.slug ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }\`}
                  >
                    <span className={\`text-sm \${
                      selected === archive.slug
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }\`}>
                      {archive.monthName} {archive.year}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {archive.count}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DropdownArchive;
    `,

    list: `
${commonImports}
import { Archive, Calendar, ChevronRight, Loader2 } from 'lucide-react';

interface ArchiveEntry {
  year: number;
  month: number;
  monthName: string;
  count: number;
  slug: string;
}

interface ListArchiveProps {
  ${dataName}?: any;
  className?: string;
  onArchiveClick?: (slug: string) => void;
  maxEntries?: number;
}

const ListArchive: React.FC<ListArchiveProps> = ({
  ${dataName}: propData,
  className,
  onArchiveClick,
  maxEntries = 12
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
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

  const blogData = ${dataName} || {};

  const title = ${getField('listTitle')};
  const subtitle = ${getField('listSubtitle')};
  const archives = ${getField('archives')};

  const handleClick = (slug: string) => {
    if (onArchiveClick) {
      onArchiveClick(slug);
    } else {
      console.log('Archive clicked:', slug);
    }
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {archives.slice(0, maxEntries).map((archive: ArchiveEntry) => (
            <button
              key={archive.slug}
              onClick={() => handleClick(archive.slug)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group text-left"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {archive.monthName} {archive.year}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                  {archive.count}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListArchive;
    `,

    accordion: `
${commonImports}
import { Archive, ChevronDown, Calendar, Loader2 } from 'lucide-react';

interface ArchiveEntry {
  year: number;
  month: number;
  monthName: string;
  count: number;
  slug: string;
}

interface AccordionArchiveProps {
  ${dataName}?: any;
  className?: string;
  onArchiveClick?: (slug: string) => void;
}

const AccordionArchive: React.FC<AccordionArchiveProps> = ({
  ${dataName}: propData,
  className,
  onArchiveClick
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || {});
    },
    enabled: !propData,
    retry: 1,
  });

  const ${dataName} = propData || fetchedData || {};

  const [expandedYears, setExpandedYears] = useState<number[]>([]);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const blogData = ${dataName} || {};

  const title = ${getField('accordionTitle')};
  const subtitle = ${getField('accordionSubtitle')};
  const archives = ${getField('archives')};

  // Group archives by year
  const archivesByYear = archives.reduce((acc: Record<number, ArchiveEntry[]>, archive: ArchiveEntry) => {
    if (!acc[archive.year]) {
      acc[archive.year] = [];
    }
    acc[archive.year].push(archive);
    return acc;
  }, {});

  const years = Object.keys(archivesByYear)
    .map(Number)
    .sort((a, b) => b - a);

  const toggleYear = (year: number) => {
    setExpandedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const handleClick = (slug: string) => {
    if (onArchiveClick) {
      onArchiveClick(slug);
    } else {
      console.log('Archive clicked:', slug);
    }
  };

  const getYearCount = (year: number) => {
    return archivesByYear[year].reduce((sum: number, archive: ArchiveEntry) => sum + archive.count, 0);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {years.map(year => {
            const isExpanded = expandedYears.includes(year);
            const yearCount = getYearCount(year);

            return (
              <div key={year} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Year Header */}
                <button
                  onClick={() => toggleYear(year)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={\`h-4 w-4 text-gray-500 transition-transform \${
                        isExpanded ? 'rotate-180' : ''
                      }\`}
                    />
                    <span className="font-bold text-gray-900 dark:text-white">
                      {year}
                    </span>
                  </div>
                  <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full font-medium">
                    {yearCount} posts
                  </span>
                </button>

                {/* Months */}
                {isExpanded && (
                  <div className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    {archivesByYear[year].map((archive: ArchiveEntry) => (
                      <button
                        key={archive.slug}
                        onClick={() => handleClick(archive.slug)}
                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {archive.monthName}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {archive.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccordionArchive;
    `
  };

  return variants[variant] || variants.dropdown;
};
