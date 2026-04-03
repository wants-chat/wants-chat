import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateLogsViewer = (
  resolved: ResolvedComponent,
  variant: 'table' | 'console' | 'stream' = 'table'
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
  const entity = dataSource?.split('.').pop() || 'logs';

  // Get API route for data fetching
  const getApiRoute = () => {
    if (resolved.actions && resolved.actions.length > 0) {
      const fetchAction = resolved.actions.find((a: any) => a.type === 'fetch');
      if (fetchAction?.serverFunction?.route) {
        return fetchAction.serverFunction.route.replace(/^\/api\/v1\//, '/');
      }
    }
    return `/${dataSource || 'logs'}`;
  };

  const apiRoute = getApiRoute();

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Search, Download, Filter, RefreshCw, Calendar, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';`;

  const variants = {
    table: `
${commonImports}

interface LogsViewerProps {
  ${dataName}?: any;
  className?: string;
  onExport?: (logs: any[]) => void;
}

export default function LogsViewer({ ${dataName}: propData, className, onExport }: LogsViewerProps) {
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

  const [logs] = useState(${getField('logs')});
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const logsTitle = ${getField('logsTitle')};
  const searchPlaceholder = ${getField('searchPlaceholder')};
  const exportButton = ${getField('exportButton')};
  const refreshButton = ${getField('refreshButton')};
  const noLogsText = ${getField('noLogsText')};

  const getLevelConfig = (level: string) => {
    const configs = {
      error: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: '❌' },
      warn: { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: '⚠️' },
      info: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: 'ℹ️' },
      debug: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: '🔍' }
    };
    return configs[level as keyof typeof configs] || configs.info;
  };

  const filteredLogs = logs.filter((log: any) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleExport = () => {
    console.log('Exporting logs:', filteredLogs);
    onExport ? onExport(filteredLogs) : alert(\`Exporting \${filteredLogs.length} logs...\`);
  };

  const handleRefresh = () => {
    console.log('Refreshing logs');
    alert('Logs refreshed');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 p-6', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{logsTitle}</h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              {refreshButton}
            </Button>

            <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {exportButton}
            </Button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Level</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Module</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Message</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-600 dark:text-gray-400">
                      {noLogsText}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log: any) => {
                    const config = getLevelConfig(log.level);
                    return (
                      <tr
                        key={log.id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Badge className={cn('text-xs', config.color)}>
                            {config.icon} {log.level.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                          {log.module}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 max-w-md truncate">
                          {log.message}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="text-blue-600 dark:text-blue-400"
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredLogs.length} of {logs.length} logs
            </p>
          </div>
        </div>

        {/* Details Modal */}
        {selectedLog && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedLog(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Log Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Level:</span>
                  <Badge className={cn('ml-2', getLevelConfig(selectedLog.level).color)}>
                    {selectedLog.level.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Timestamp:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{formatTimestamp(selectedLog.timestamp)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Module:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedLog.module}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Source:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">{selectedLog.source}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Message:</span>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">{selectedLog.message}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Details:</span>
                  <pre className="mt-1 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
              <Button
                onClick={() => setSelectedLog(null)}
                className="mt-4 w-full"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
    `,

    console: `
${commonImports}

interface LogsViewerProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function LogsViewer({ ${dataName}: propData, className }: LogsViewerProps) {
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

  const [logs] = useState(${getField('logs')});
  const [levelFilter, setLevelFilter] = useState('all');

  const logsTitle = ${getField('logsTitle')};

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    const colors = {
      error: 'text-red-500 dark:text-red-400',
      warn: 'text-amber-500 dark:text-amber-400',
      info: 'text-blue-500 dark:text-blue-400',
      debug: 'text-gray-500 dark:text-gray-400'
    };
    return colors[level as keyof typeof colors] || colors.info;
  };

  const filteredLogs = logs.filter((log: any) => {
    return levelFilter === 'all' || log.level === levelFilter;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className={cn('min-h-screen bg-gray-900 text-gray-100 p-6 font-mono', className)}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">{logsTitle}</h1>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-black rounded-lg p-4 overflow-auto max-h-[800px] border border-gray-800">
          {filteredLogs.map((log: any) => (
            <div key={log.id} className="mb-2 text-sm hover:bg-gray-900 p-1 rounded">
              <span className="text-gray-500">[{formatTimestamp(log.timestamp)}]</span>
              {' '}
              <span className={cn('font-bold', getLevelColor(log.level))}>
                [{log.level.toUpperCase()}]
              </span>
              {' '}
              <span className="text-cyan-400">[{log.module}]</span>
              {' '}
              <span className="text-gray-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
    `,

    stream: `
${commonImports}
import { useEffect, useRef } from 'react';

interface LogsViewerProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function LogsViewer({ ${dataName}: propData, className }: LogsViewerProps) {
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

  const [logs, setLogs] = useState(${getField('logs')});
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const logsTitle = ${getField('logsTitle')};

  useEffect(() => {
    if (isAutoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isAutoScroll]);

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    const colors = {
      error: 'text-red-400 bg-red-900/20',
      warn: 'text-amber-400 bg-amber-900/20',
      info: 'text-blue-400 bg-blue-900/20',
      debug: 'text-gray-400 bg-gray-800/20'
    };
    return colors[level as keyof typeof colors] || colors.info;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toISOString();
  };

  return (
    <div className={cn('min-h-screen bg-gray-950 text-gray-100 p-6 font-mono', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between bg-gray-900 p-3 rounded-lg border border-gray-800">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">{logsTitle}</h1>
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', isPaused ? 'bg-yellow-500' : 'bg-green-500')}></div>
              <span className="text-xs text-gray-400">{isPaused ? 'Paused' : 'Live'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
              className="bg-gray-800 border-gray-700 text-xs"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className={cn(
                'bg-gray-800 border-gray-700 text-xs',
                isAutoScroll && 'text-green-400'
              )}
            >
              Auto-scroll: {isAutoScroll ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>

        {/* Logs Stream */}
        <div className="bg-black rounded-lg p-4 overflow-auto h-[700px] border border-gray-800">
          {logs.map((log: any) => (
            <div key={log.id} className={cn('mb-1 p-2 rounded text-xs', getLevelColor(log.level))}>
              <div className="flex items-start gap-2">
                <span className="text-gray-600 text-[10px] mt-0.5">{formatTimestamp(log.timestamp)}</span>
                <span className="font-bold">[{log.level.toUpperCase()}]</span>
                <span className="text-cyan-400">{log.module}</span>
                <span className="flex-1">{log.message}</span>
              </div>
              {log.details && (
                <div className="ml-24 mt-1 text-gray-500 text-[10px]">
                  {JSON.stringify(log.details)}
                </div>
              )}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.table;
};
