/**
 * Report Generator
 *
 * Generates ReportList components with:
 * - Report cards/list display
 * - Filtering by date range and type
 * - Download/export functionality
 * - Status indicators
 * - Preview modal
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface ReportType {
  value: string;
  label: string;
  icon?: string;
}

export interface ReportListOptions {
  componentName?: string;
  entity?: string;
  endpoint?: string;
  queryKey?: string;
  reportTypes?: ReportType[];
  showDateFilter?: boolean;
  showTypeFilter?: boolean;
  showDownload?: boolean;
  showPreview?: boolean;
  layout?: 'grid' | 'list';
}

/**
 * Generate a ReportList component
 */
export function generateReportList(options: ReportListOptions = {}): string {
  const {
    entity = 'report',
    reportTypes = [
      { value: 'sales', label: 'Sales Report', icon: 'DollarSign' },
      { value: 'inventory', label: 'Inventory Report', icon: 'Package' },
      { value: 'financial', label: 'Financial Report', icon: 'TrendingUp' },
      { value: 'analytics', label: 'Analytics Report', icon: 'BarChart3' },
      { value: 'performance', label: 'Performance Report', icon: 'Activity' },
    ],
    showDateFilter = true,
    showTypeFilter = true,
    showDownload = true,
    showPreview = true,
    layout = 'grid',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || 'ReportList';
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;

  const allIcons = new Set([
    'FileText', 'Download', 'Eye', 'Calendar', 'Filter', 'Search',
    'X', 'Loader2', 'Clock', 'CheckCircle', 'AlertCircle', 'RefreshCw',
    'ChevronDown', 'FileSpreadsheet', 'FileBarChart',
    ...reportTypes.map(t => t.icon).filter(Boolean)
  ]);

  return `import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ${Array.from(allIcons).join(',\n  ')},
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Report {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: 'ready' | 'processing' | 'failed' | 'scheduled';
  createdAt: string;
  generatedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
  previewUrl?: string;
  format?: string;
}

interface ${componentName}Props {
  className?: string;
  data?: Report[];
  onDownload?: (report: Report) => void;
  onPreview?: (report: Report) => void;
  onGenerate?: (type: string) => void;
}

const reportTypes = ${JSON.stringify(reportTypes, null, 2)};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  data: propData,
  onDownload,
  onPreview,
  onGenerate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [previewModal, setPreviewModal] = useState<{ open: boolean; report: Report | null }>({ open: false, report: null });

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['${queryKey}', selectedType, dateRange],
    queryFn: async () => {
      try {
        let url = '${endpoint}';
        const params = new URLSearchParams();
        if (selectedType) params.append('type', selectedType);
        if (dateRange.start) params.append('startDate', dateRange.start);
        if (dateRange.end) params.append('endDate', dateRange.end);
        if (params.toString()) url += '?' + params.toString();

        const response = await api.get<any>(url);
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const reports = propData && propData.length > 0 ? propData : (fetchedData || []);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const query = searchQuery.toLowerCase();
    return reports.filter((report: Report) =>
      report.name.toLowerCase().includes(query) ||
      report.type.toLowerCase().includes(query) ||
      report.description?.toLowerCase().includes(query)
    );
  }, [reports, searchQuery]);

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      ready: {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Ready',
      },
      processing: {
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <Loader2 className="w-4 h-4 animate-spin" />,
        label: 'Processing',
      },
      failed: {
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <AlertCircle className="w-4 h-4" />,
        label: 'Failed',
      },
      scheduled: {
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <Clock className="w-4 h-4" />,
        label: 'Scheduled',
      },
    };
    return configs[status] || configs.ready;
  };

  const getTypeIcon = (type: string) => {
    const reportType = reportTypes.find(t => t.value === type);
    if (!reportType?.icon) return <FileText className="w-5 h-5" />;

    const iconMap: Record<string, React.ReactNode> = {
      DollarSign: <FileSpreadsheet className="w-5 h-5" />,
      Package: <FileText className="w-5 h-5" />,
      TrendingUp: <FileBarChart className="w-5 h-5" />,
      BarChart3: <FileBarChart className="w-5 h-5" />,
      Activity: <FileText className="w-5 h-5" />,
    };
    return iconMap[reportType.icon] || <FileText className="w-5 h-5" />;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleDownload = (report: Report) => {
    if (onDownload) {
      onDownload(report);
    } else if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
    }
  };

  const handlePreview = (report: Report) => {
    if (onPreview) {
      onPreview(report);
    } else {
      setPreviewModal({ open: true, report });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = searchQuery || selectedType || dateRange.start || dateRange.end;

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View and download your generated reports
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>

            ${showTypeFilter ? `{/* Type Filter */}
            <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 appearance-none"
              >
                <option value="">All Types</option>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>` : ''}

            ${showDateFilter ? `{/* Date Range */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>` : ''}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Reports ${layout === 'grid' ? 'Grid' : 'List'} */}
        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No reports found</p>
          </div>
        ) : (
          <div className="${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}">
            {filteredReports.map((report: Report) => {
              const statusConfig = getStatusConfig(report.status);
              return (
                <div
                  key={report.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                      {getTypeIcon(report.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {report.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {reportTypes.find(t => t.value === report.type)?.label || report.type}
                          </p>
                        </div>
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                          statusConfig.color
                        )}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>
                      {report.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {report.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(report.generatedAt || report.createdAt)}
                        </span>
                        {report.fileSize && (
                          <span>{report.fileSize}</span>
                        )}
                        {report.format && (
                          <span className="uppercase">{report.format}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    ${showPreview ? `<button
                      onClick={() => handlePreview(report)}
                      disabled={report.status !== 'ready'}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>` : ''}
                    ${showDownload ? `<button
                      onClick={() => handleDownload(report)}
                      disabled={report.status !== 'ready'}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewModal.open && previewModal.report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setPreviewModal({ open: false, report: null })}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {previewModal.report.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generated {formatDateTime(previewModal.report.generatedAt || previewModal.report.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setPreviewModal({ open: false, report: null })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {previewModal.report.previewUrl ? (
                <iframe
                  src={previewModal.report.previewUrl}
                  className="w-full h-full min-h-[500px] border rounded-lg"
                  title="Report Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Preview not available
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setPreviewModal({ open: false, report: null })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(previewModal.report!);
                  setPreviewModal({ open: false, report: null });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ${componentName};
`;
}

/**
 * Generate report list with custom types
 */
export function generateCustomReportList(
  types: ReportType[],
  options?: Partial<ReportListOptions>
): string {
  return generateReportList({
    reportTypes: types,
    ...options,
  });
}
