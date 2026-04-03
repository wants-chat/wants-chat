import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateVersionHistory = (
  resolved: ResolvedComponent,
  variant: 'list' | 'timeline' | 'detailed' = 'list'
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
  const entity = dataSource?.split('.').pop() || 'versions';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'versions'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Download, RotateCcw, GitCompare, ChevronRight, Clock, User, FileText, CheckCircle, Plus, Edit, Trash2, GitBranch, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    list: `
${commonImports}

interface Version {
  id: string;
  version: string;
  date: string;
  author: string;
  changes: string;
  size: string;
  downloads: number;
  isCurrent: boolean;
  commitHash: string;
}

interface VersionHistoryProps {
  ${dataName}?: any;
  className?: string;
  onRestore?: (version: Version) => void;
  onDownload?: (version: Version) => void;
  onCompare?: (version1: Version, version2: Version) => void;
  onViewChanges?: (version: Version) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  ${dataName}: propData,
  className,
  onRestore,
  onDownload,
  onCompare,
  onViewChanges
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

  const versions = ${getField('versions')} as Version[];
  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const currentVersionText = ${getField('currentVersionText')};
  const restoreText = ${getField('restoreText')};
  const downloadText = ${getField('downloadText')};
  const compareText = ${getField('compareText')};
  const viewChangesText = ${getField('viewChangesText')};
  const confirmRestoreText = ${getField('confirmRestoreText')};
  const downloadsText = ${getField('downloadsText')};

  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleRestore = (version: Version) => {
    if (confirm(confirmRestoreText)) {
      onRestore?.(version);
    }
  };

  const handleDownload = (version: Version) => {
    onDownload?.(version);
  };

  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else {
      if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, versionId]);
      }
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      const v1 = versions.find(v => v.id === selectedVersions[0]);
      const v2 = versions.find(v => v.id === selectedVersions[1]);
      if (v1 && v2) {
        onCompare?.(v1, v2);
      }
    }
  };

  const handleViewChanges = (version: Version) => {
    onViewChanges?.(version);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4", className)}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Compare Button */}
        {selectedVersions.length === 2 && (
          <div className="mb-6">
            <button
              onClick={handleCompare}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <GitCompare className="w-5 h-5" />
              {compareText} Selected Versions
            </button>
          </div>
        )}

        {/* Version List */}
        <div className="space-y-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className={cn(
                "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border-2 transition-all hover:shadow-2xl",
                selectedVersions.includes(version.id)
                  ? "border-blue-500 dark:border-purple-500 ring-2 ring-blue-200 dark:ring-purple-800"
                  : "border-gray-200 dark:border-gray-700"
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left: Version Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Checkbox for comparison */}
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.id)}
                      onChange={() => handleVersionSelect(version.id)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          v{version.version}
                        </h3>
                        {version.isCurrent && (
                          <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold shadow-lg">
                            {currentVersionText}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {formatDate(version.date)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4" />
                          {version.author}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FileText className="w-4 h-4" />
                          {version.size} • {version.downloads.toLocaleString()} {downloadsText}
                        </div>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {version.changes}
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewChanges(version)}
                          className="flex items-center gap-1 px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:scale-105 transition-all shadow-md hover:shadow-lg font-medium"
                        >
                          {viewChangesText}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDownload(version)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full transition-all hover:scale-105 shadow-lg hover:shadow-xl font-bold"
                    >
                      <Download className="w-4 h-4" />
                      {downloadText}
                    </button>
                    {!version.isCurrent && (
                      <button
                        onClick={() => handleRestore(version)}
                        className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-purple-500 text-gray-700 dark:text-gray-300 rounded-full hover:scale-105 transition-all shadow-lg hover:shadow-xl font-bold bg-white dark:bg-gray-800"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {restoreText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
    `,

    timeline: `
${commonImports}

interface Version {
  id: string;
  version: string;
  date: string;
  author: string;
  changes: string;
  size: string;
  downloads: number;
  isCurrent: boolean;
  commitHash: string;
}

interface VersionHistoryProps {
  ${dataName}?: any;
  className?: string;
  onRestore?: (version: Version) => void;
  onDownload?: (version: Version) => void;
  onViewChanges?: (version: Version) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  ${dataName}: propData,
  className,
  onRestore,
  onDownload,
  onViewChanges
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

  const versions = ${getField('versions')} as Version[];
  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const currentVersionText = ${getField('currentVersionText')};
  const restoreText = ${getField('restoreText')};
  const downloadText = ${getField('downloadText')};
  const confirmRestoreText = ${getField('confirmRestoreText')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleRestore = (version: Version) => {
    if (confirm(confirmRestoreText)) {
      onRestore?.(version);
    }
  };

  const handleDownload = (version: Version) => {
    onDownload?.(version);
  };

  const handleViewChanges = (version: Version) => {
    onViewChanges?.(version);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4", className)}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <GitBranch className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 opacity-30" />

          {/* Version entries */}
          <div className="space-y-12">
            {versions.map((version, index) => (
              <div key={version.id} className="relative pl-24">
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-8 top-2 w-10 h-10 rounded-full border-4 border-white dark:border-gray-900 shadow-2xl flex items-center justify-center",
                  version.isCurrent
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-blue-600 to-purple-600"
                )}>
                  {version.isCurrent && <CheckCircle className="w-5 h-5 text-white" />}
                </div>

                {/* Date badge */}
                <div className="absolute left-0 top-0 text-right mr-4" style={{ width: '80px' }}>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(version.date)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTime(version.date)}
                  </div>
                </div>

                {/* Content card */}
                <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Version {version.version}
                        </h3>
                        {version.isCurrent && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold shadow-lg">
                            {currentVersionText}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span className="font-medium">{version.author}</span>
                        </span>
                        <span>•</span>
                        <span className="font-medium">{version.size}</span>
                        <span>•</span>
                        <span className="font-mono text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-2 py-0.5 rounded font-bold">
                          #{version.commitHash}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {version.changes}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDownload(version)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full transition-all hover:scale-105 shadow-lg hover:shadow-xl font-bold"
                    >
                      <Download className="w-4 h-4" />
                      {downloadText}
                    </button>
                    {!version.isCurrent && (
                      <button
                        onClick={() => handleRestore(version)}
                        className="flex items-center gap-2 px-4 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-purple-500 text-gray-700 dark:text-gray-300 rounded-full hover:scale-105 transition-all shadow-lg hover:shadow-xl font-bold bg-white dark:bg-gray-800"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {restoreText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
    `,

    detailed: `
${commonImports}

interface Version {
  id: string;
  version: string;
  date: string;
  author: string;
  changes: string;
  size: string;
  downloads: number;
  isCurrent: boolean;
  commitHash: string;
  changesSummary: {
    added: number;
    modified: number;
    deleted: number;
  };
}

interface VersionHistoryProps {
  ${dataName}?: any;
  className?: string;
  onRestore?: (version: Version) => void;
  onDownload?: (version: Version) => void;
  onViewChanges?: (version: Version) => void;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  ${dataName}: propData,
  className,
  onRestore,
  onDownload,
  onViewChanges
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

  const versions = ${getField('versions')} as Version[];
  const title = ${getField('title')};
  const subtitle = ${getField('subtitle')};
  const currentVersionText = ${getField('currentVersionText')};
  const restoreText = ${getField('restoreText')};
  const downloadText = ${getField('downloadText')};
  const viewChangesText = ${getField('viewChangesText')};
  const confirmRestoreText = ${getField('confirmRestoreText')};
  const changesText = ${getField('changesText')};

  const [expandedVersion, setExpandedVersion] = useState<string | null>(versions[0]?.id || null);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleRestore = (version: Version) => {
    if (confirm(confirmRestoreText)) {
      onRestore?.(version);
    }
  };

  const handleDownload = (version: Version) => {
    onDownload?.(version);
  };

  const handleViewChanges = (version: Version) => {
    onViewChanges?.(version);
  };

  const toggleExpanded = (versionId: string) => {
    setExpandedVersion(expandedVersion === versionId ? null : versionId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4", className)}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {subtitle}
          </p>
        </div>

        {/* Version Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {versions.map((version) => {
            const isExpanded = expandedVersion === version.id;
            const totalChanges = version.changesSummary.added + version.changesSummary.modified + version.changesSummary.deleted;

            return (
              <div
                key={version.id}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all"
              >
                {/* Card Header */}
                <div className={cn(
                  "p-6 border-b-2 border-gray-200 dark:border-gray-700",
                  version.isCurrent ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20" : ""
                )}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          v{version.version}
                        </h3>
                        {version.isCurrent && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-bold shadow-lg">
                            {currentVersionText}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(version.date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4" />
                    <span>{version.author}</span>
                    <span>•</span>
                    <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {version.commitHash}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-750 dark:to-gray-800">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-100 dark:border-green-900">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                        {version.changesSummary.added}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Added</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-100 dark:border-blue-900">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                          <Edit className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {version.changesSummary.modified}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Modified</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border-2 border-red-100 dark:border-red-900">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                          <Trash2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
                        {version.changesSummary.deleted}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Deleted</div>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {totalChanges} total {changesText} • {version.size}
                  </div>
                </div>

                {/* Description */}
                <div className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {version.changes}
                  </p>

                  <button
                    onClick={() => handleViewChanges(version)}
                    className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline mb-4"
                  >
                    {viewChangesText}
                  </button>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownload(version)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full transition-all hover:scale-105 shadow-lg hover:shadow-xl font-bold"
                    >
                      <Download className="w-4 h-4" />
                      {downloadText}
                    </button>
                    {!version.isCurrent && (
                      <button
                        onClick={() => handleRestore(version)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-purple-500 text-gray-700 dark:text-gray-300 rounded-full hover:scale-105 transition-all shadow-lg hover:shadow-xl font-bold bg-white dark:bg-gray-800"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {restoreText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
    `
  };

  return variants[variant] || variants.list;
};
