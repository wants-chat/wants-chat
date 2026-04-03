import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateChangelogDisplay = (
  resolved: ResolvedComponent,
  variant: 'timeline' | 'cards' | 'accordion' = 'timeline'
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
    return `/${dataSource || 'changelog'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'changelog';

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ChevronDown, ChevronUp, Download, Package, Wrench, Bug, AlertTriangle, Calendar, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    timeline: `
${commonImports}

interface Version {
  version: string;
  date: string;
  status: string;
  features: string[];
  improvements: string[];
  bugFixes: string[];
  breaking: string[];
}

interface ChangelogProps {
  ${dataName}?: any;
  className?: string;
  onVersionClick?: (version: Version) => void;
  onDownload?: (version: string) => void;
}

const ChangelogDisplay: React.FC<ChangelogProps> = ({
  ${dataName}: propData,
  className,
  onVersionClick,
  onDownload
}) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const changelogData = ${dataName} || {};

  const versions = ${getField('versions')} as Version[];
  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const latestText = ${getField('latestText')};
  const newFeaturesText = ${getField('newFeaturesText')};
  const improvementsText = ${getField('improvementsText')};
  const bugFixesText = ${getField('bugFixesText')};
  const breakingChangesText = ${getField('breakingChangesText')};
  const downloadText = ${getField('downloadText')};

  const handleVersionClick = (version: Version) => {
    onVersionClick?.(version);
  };

  const handleDownload = (versionNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(versionNumber);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'latest':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'stable':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'archived':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          {/* Version entries */}
          <div className="space-y-8">
            {versions.map((version, index) => (
              <div
                key={version.version}
                className="relative pl-20 cursor-pointer"
                onClick={() => handleVersionClick(version)}
              >
                {/* Timeline dot */}
                <div className="absolute left-5 top-6 w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 border-4 border-white dark:border-gray-900 shadow-lg" />

                {/* Content card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                  {/* Version header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          v{version.version}
                        </h3>
                        {version.status === 'latest' && (
                          <span className={\`px-3 py-1 rounded-full text-xs font-medium \${getStatusBadge(version.status)}\`}>
                            {latestText}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(version.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDownload(version.version, e)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {downloadText}
                    </button>
                  </div>

                  {/* Features */}
                  {version.features.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {newFeaturesText}
                        </h4>
                      </div>
                      <ul className="space-y-1.5 ml-6">
                        {version.features.map((feature, idx) => (
                          <li key={idx} className="text-gray-700 dark:text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-purple-600 dark:text-purple-400 mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {version.improvements.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {improvementsText}
                        </h4>
                      </div>
                      <ul className="space-y-1.5 ml-6">
                        {version.improvements.map((improvement, idx) => (
                          <li key={idx} className="text-gray-700 dark:text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bug Fixes */}
                  {version.bugFixes.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bug className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          {bugFixesText}
                        </h4>
                      </div>
                      <ul className="space-y-1.5 ml-6">
                        {version.bugFixes.map((fix, idx) => (
                          <li key={idx} className="text-gray-700 dark:text-gray-300 text-sm flex items-start gap-2">
                            <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                            <span>{fix}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Breaking Changes */}
                  {version.breaking.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <h4 className="font-semibold text-red-900 dark:text-red-400">
                          {breakingChangesText}
                        </h4>
                      </div>
                      <ul className="space-y-1.5 ml-6">
                        {version.breaking.map((change, idx) => (
                          <li key={idx} className="text-red-800 dark:text-red-300 text-sm flex items-start gap-2">
                            <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangelogDisplay;
    `,

    cards: `
${commonImports}

interface Version {
  version: string;
  date: string;
  status: string;
  features: string[];
  improvements: string[];
  bugFixes: string[];
  breaking: string[];
}

interface ChangelogProps {
  ${dataName}?: any;
  className?: string;
  onVersionClick?: (version: Version) => void;
  onDownload?: (version: string) => void;
}

const ChangelogDisplay: React.FC<ChangelogProps> = ({
  ${dataName}: propData,
  className,
  onVersionClick,
  onDownload
}) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const changelogData = ${dataName} || {};

  const versions = ${getField('versions')} as Version[];
  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const latestText = ${getField('latestText')};
  const newFeaturesText = ${getField('newFeaturesText')};
  const improvementsText = ${getField('improvementsText')};
  const bugFixesText = ${getField('bugFixesText')};
  const breakingChangesText = ${getField('breakingChangesText')};
  const viewDetailsText = ${getField('viewDetailsText')};

  const handleVersionClick = (version: Version) => {
    onVersionClick?.(version);
  };

  const handleDownload = (versionNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDownload?.(versionNumber);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'latest':
        return 'bg-green-500 text-white';
      case 'stable':
        return 'bg-blue-500 text-white';
      case 'archived':
        return 'bg-gray-400 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {versions.map((version) => {
            const totalChanges = version.features.length + version.improvements.length + version.bugFixes.length;

            return (
              <div
                key={version.version}
                onClick={() => handleVersionClick(version)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm opacity-80 mb-1">Version</div>
                      <h3 className="text-3xl font-bold">
                        {version.version}
                      </h3>
                    </div>
                    {version.status === 'latest' && (
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                        {latestText}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm opacity-90">
                    <Calendar className="w-4 h-4" />
                    {new Date(version.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {version.features.length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Features</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {version.improvements.length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Improvements</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {version.bugFixes.length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Fixes</div>
                    </div>
                  </div>

                  {/* Breaking Changes Alert */}
                  {version.breaking.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-400 text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        {version.breaking.length} Breaking Change{version.breaking.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleVersionClick(version); }}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group-hover:bg-blue-600 group-hover:text-white"
                  >
                    {viewDetailsText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChangelogDisplay;
    `,

    accordion: `
${commonImports}

interface Version {
  version: string;
  date: string;
  status: string;
  features: string[];
  improvements: string[];
  bugFixes: string[];
  breaking: string[];
}

interface ChangelogProps {
  ${dataName}?: any;
  className?: string;
  onVersionClick?: (version: Version) => void;
}

const ChangelogDisplay: React.FC<ChangelogProps> = ({
  ${dataName}: propData,
  className,
  onVersionClick
}) => {
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

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const changelogData = ${dataName} || {};

  const versions = ${getField('versions')} as Version[];
  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const latestText = ${getField('latestText')};
  const newFeaturesText = ${getField('newFeaturesText')};
  const improvementsText = ${getField('improvementsText')};
  const bugFixesText = ${getField('bugFixesText')};
  const breakingChangesText = ${getField('breakingChangesText')};

  const [expandedVersion, setExpandedVersion] = useState<string | null>(versions[0]?.version || null);

  const handleToggle = (versionNumber: string) => {
    setExpandedVersion(expandedVersion === versionNumber ? null : versionNumber);
    if (expandedVersion !== versionNumber) {
      const version = versions.find(v => v.version === versionNumber);
      if (version) onVersionClick?.(version);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'latest':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'stable':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'archived':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            {title}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-4">
          {versions.map((version) => {
            const isExpanded = expandedVersion === version.version;

            return (
              <div
                key={version.version}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => handleToggle(version.version)}
                  className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="text-left">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Version {version.version}
                        </h3>
                        {version.status === 'latest' && (
                          <span className={\`px-2 py-1 rounded-full text-xs font-medium \${getStatusBadge(version.status)}\`}>
                            {latestText}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(version.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {version.breaking.length > 0 && (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium">
                        Breaking Changes
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-700">
                    {/* Features */}
                    {version.features.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {newFeaturesText}
                          </h4>
                        </div>
                        <ul className="space-y-2 ml-7">
                          {version.features.map((feature, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-purple-600 dark:text-purple-400 mt-1.5">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {version.improvements.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {improvementsText}
                          </h4>
                        </div>
                        <ul className="space-y-2 ml-7">
                          {version.improvements.map((improvement, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-blue-600 dark:text-blue-400 mt-1.5">•</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bug Fixes */}
                    {version.bugFixes.length > 0 && (
                      <div className="mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Bug className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {bugFixesText}
                          </h4>
                        </div>
                        <ul className="space-y-2 ml-7">
                          {version.bugFixes.map((fix, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="text-green-600 dark:text-green-400 mt-1.5">•</span>
                              <span>{fix}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Breaking Changes */}
                    {version.breaking.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <h4 className="font-semibold text-red-900 dark:text-red-400">
                            {breakingChangesText}
                          </h4>
                        </div>
                        <ul className="space-y-2 ml-7">
                          {version.breaking.map((change, idx) => (
                            <li key={idx} className="text-red-800 dark:text-red-300 flex items-start gap-2">
                              <span className="text-red-600 dark:text-red-400 mt-1.5">•</span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChangelogDisplay;
    `
  };

  return variants[variant] || variants.timeline;
};
