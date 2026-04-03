import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDatabaseManagement = (
  resolved: ResolvedComponent,
  variant: 'tables' | 'query' | 'explorer' = 'tables'
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
import { Database, Play, Download, Trash2, RefreshCw, Eye, Upload, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';`;

  const variants = {
    tables: `
${commonImports}

interface DatabaseManagementProps {
  ${dataName}?: any;
  className?: string;
  onViewTable?: (tableName: string) => void;
  onExportTable?: (tableName: string) => void;
  onTruncateTable?: (tableName: string) => void;
}

export default function DatabaseManagement({ ${dataName}, className, onViewTable, onExportTable, onTruncateTable }: DatabaseManagementProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const dbData = ${dataName} || fetchedData || {};

  const tables = ${getField('tables')};
  const databaseTitle = ${getField('databaseTitle')};
  const viewButton = ${getField('viewButton')};
  const exportButton = ${getField('exportButton')};
  const truncateButton = ${getField('truncateButton')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("p-6 flex justify-center items-center min-h-[300px]", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <p className="text-red-500">Failed to load database information</p>
      </div>
    );
  }

  const handleView = (tableName: string) => {
    console.log('Viewing table:', tableName);
    onViewTable ? onViewTable(tableName) : alert(\`Viewing table: \${tableName}\`);
  };

  const handleExport = (tableName: string) => {
    console.log('Exporting table:', tableName);
    onExportTable ? onExportTable(tableName) : alert(\`Exporting table: \${tableName} to CSV...\`);
  };

  const handleTruncate = (tableName: string) => {
    if (confirm(\`Are you sure you want to truncate table "\${tableName}"? This will delete all rows.\`)) {
      console.log('Truncating table:', tableName);
      onTruncateTable ? onTruncateTable(tableName) : alert(\`Table \${tableName} truncated\`);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 p-6', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{databaseTitle}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Manage database tables and data</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tables</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{tables.length}</p>
                </div>
                <Database className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Rows</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(tables.reduce((sum: number, t: any) => sum + t.rowCount, 0))}
                  </p>
                </div>
                <Eye className="w-10 h-10 text-green-600 dark:text-green-400 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Database Size</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">21.6 MB</p>
                </div>
                <Download className="w-10 h-10 text-purple-600 dark:text-purple-400 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables List */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Database Tables</span>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Table Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Rows</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Last Modified</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{table.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {formatNumber(table.rowCount)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="dark:border-gray-600">
                          {table.size}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {table.lastModified}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(table.name)}
                            className="text-blue-600 dark:text-blue-400"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {viewButton}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExport(table.name)}
                            className="text-green-600 dark:text-green-400"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            {exportButton}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTruncate(table.name)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {truncateButton}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    `,

    query: `
${commonImports}
import { Textarea } from '@/components/ui/textarea';

interface DatabaseManagementProps {
  ${dataName}?: any;
  className?: string;
  onExecuteQuery?: (query: string) => void;
}

export default function DatabaseManagement({ ${dataName}, className, onExecuteQuery }: DatabaseManagementProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const dbData = ${dataName} || fetchedData || {};

  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const databaseTitle = ${getField('databaseTitle')};
  const executeButton = ${getField('executeButton')};
  const queryPlaceholder = ${getField('queryPlaceholder')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("p-6 flex justify-center items-center min-h-[300px]", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <p className="text-red-500">Failed to load database information</p>
      </div>
    );
  }

  const handleExecuteQuery = () => {
    if (!query.trim()) {
      alert('Please enter a query');
      return;
    }

    console.log('Executing query:', query);
    setIsExecuting(true);

    // Simulate query execution
    setTimeout(() => {
      const mockResult = {
        columns: ['id', 'name', 'email', 'created_at'],
        rows: [
          { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2025-01-01' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2025-01-02' }
        ],
        rowCount: 2,
        executionTime: '45ms'
      };

      setQueryResult(mockResult);
      setIsExecuting(false);

      if (onExecuteQuery) {
        onExecuteQuery(query);
      }
    }, 1000);
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 p-6', className)}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{databaseTitle}</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Execute SQL queries</p>
        </div>

        {/* Query Editor */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle>SQL Query Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={queryPlaceholder}
              className="font-mono text-sm min-h-[200px] dark:bg-gray-900"
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Be careful with UPDATE and DELETE queries</span>
              </div>
              <Button
                onClick={handleExecuteQuery}
                disabled={isExecuting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4" />
                {isExecuting ? 'Executing...' : executeButton}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Query Results */}
        {queryResult && (
          <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Query Results</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{queryResult.rowCount} rows</span>
                  <span>{queryResult.executionTime}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      {queryResult.columns.map((col: string) => (
                        <th key={col} className="text-left py-2 px-4 font-medium text-gray-900 dark:text-gray-100">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {queryResult.rows.map((row: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                        {queryResult.columns.map((col: string) => (
                          <td key={col} className="py-2 px-4 text-gray-600 dark:text-gray-400">
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
    `,

    explorer: `
${commonImports}

interface DatabaseManagementProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function DatabaseManagement({ ${dataName}, className }: DatabaseManagementProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const dbData = ${dataName} || fetchedData || {};

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const tables = ${getField('tables')};
  const databaseTitle = ${getField('databaseTitle')};
  const backupButton = ${getField('backupButton')};
  const restoreButton = ${getField('restoreButton')};

  if (isLoading && !${dataName}) {
    return (
      <div className={cn("p-6 flex justify-center items-center min-h-[300px]", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !${dataName}) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <p className="text-red-500">Failed to load database information</p>
      </div>
    );
  }

  const handleBackup = () => {
    console.log('Creating backup');
    alert('Creating database backup...\\n\\nBackup will be saved to:\\ndatabase_backup_' + new Date().toISOString().split('T')[0] + '.sql');
  };

  const handleRestore = () => {
    console.log('Restoring backup');
    alert('Select a backup file to restore');
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-auto">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{databaseTitle}</h2>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={handleBackup}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                {backupButton}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRestore}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {restoreButton}
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Tables</p>
            {tables.map((table: any) => (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                  selectedTable === table.name
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {table.name}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {selectedTable ? (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedTable}</h2>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">
                    {tables.find((t: any) => t.name === selectedTable)?.rowCount || 0} rows
                  </Badge>
                  <Badge variant="outline">
                    {tables.find((t: any) => t.name === selectedTable)?.size || '0 KB'}
                  </Badge>
                </div>
              </div>

              <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle>Table Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a table from the sidebar to view its data and schema
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Select a table to explore its data</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.tables;
};
