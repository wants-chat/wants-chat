import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateExportDataInterface = (
  resolved: ResolvedComponent,
  variant: 'modal' | 'panel' | 'wizard' = 'modal'
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
import { Download, Calendar, FileText, X, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';`;

  const variants = {
    modal: `
${commonImports}

interface ExportDataInterfaceProps {
  ${dataName}?: any;
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onExport?: (config: any) => void;
}

export default function ExportDataInterface({
  ${dataName},
  className,
  isOpen = true,
  onClose,
  onExport
}: ExportDataInterfaceProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const exportData = ${dataName} || fetchedData || {};

  const [format, setFormat] = useState('CSV');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [includeColumns, setIncludeColumns] = useState({
    id: true,
    name: true,
    email: true,
    createdAt: true,
    status: true
  });

  const exportTitle = ${getField('exportTitle')};
  const formats = ${getField('formats')};
  const dateRangeOptions = ${getField('dateRangeOptions')};
  const exportButton = ${getField('exportButton')};
  const cancelButton = ${getField('cancelButton')};

  if (isLoading && !${dataName}) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={cn("sm:max-w-md", className)}>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleExport = () => {
    const config = {
      format,
      dateRange,
      columns: Object.keys(includeColumns).filter(key => includeColumns[key as keyof typeof includeColumns])
    };

    console.log('Exporting with config:', config);

    if (onExport) {
      onExport(config);
    } else {
      alert(\`Exporting data as \${format}...\\n\\nDate Range: \${dateRange}\\nColumns: \${config.columns.join(', ')}\`);
    }

    onClose && onClose();
  };

  const toggleColumn = (column: keyof typeof includeColumns) => {
    setIncludeColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-2xl dark:bg-gray-800', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {exportTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Format */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat}>
              <div className="grid grid-cols-2 gap-3">
                {formats.map((fmt: string) => (
                  <div
                    key={fmt}
                    className={cn(
                      'flex items-center space-x-2 border rounded-lg p-3 cursor-pointer transition-colors',
                      format === fmt
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <RadioGroupItem value={fmt} id={fmt} />
                    <Label htmlFor={fmt} className="cursor-pointer flex-1">
                      <FileText className="w-4 h-4 inline mr-2" />
                      {fmt}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Date Range */}
          <div>
            <Label htmlFor="dateRange" className="text-base font-semibold mb-3 block">
              Date Range
            </Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger id="dateRange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    <Calendar className="w-4 h-4 inline mr-2" />
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Column Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Select Columns to Export
            </Label>
            <div className="space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              {Object.keys(includeColumns).map((column) => (
                <div key={column} className="flex items-center space-x-2">
                  <Checkbox
                    id={column}
                    checked={includeColumns[column as keyof typeof includeColumns]}
                    onCheckedChange={() => toggleColumn(column as keyof typeof includeColumns)}
                  />
                  <Label
                    htmlFor={column}
                    className="text-sm font-normal cursor-pointer capitalize"
                  >
                    {column.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            {cancelButton}
          </Button>
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            {exportButton}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
    `,

    panel: `
${commonImports}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExportDataInterfaceProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ExportDataInterface({ ${dataName}, className }: ExportDataInterfaceProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const exportData = ${dataName} || fetchedData || {};

  const [format, setFormat] = useState('CSV');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [selectedColumns, setSelectedColumns] = useState(['id', 'name', 'email']);
  const [scheduleExport, setScheduleExport] = useState(false);

  const exportTitle = ${getField('exportTitle')};
  const formats = ${getField('formats')};
  const dateRangeOptions = ${getField('dateRangeOptions')};
  const exportButton = ${getField('exportButton')};
  const scheduleButton = ${getField('scheduleButton')};

  if (isLoading && !${dataName}) {
    return (
      <Card className={cn("w-full max-w-md", className)}>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  const columns = ['id', 'name', 'email', 'phone', 'created_at', 'status', 'role'];

  const handleExport = () => {
    console.log('Export:', { format, dateRange, columns: selectedColumns });
    alert(\`Exporting \${selectedColumns.length} columns as \${format}\`);
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 p-6', className)}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{exportTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure and export your data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Export Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((fmt: string) => (
                        <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRangeOptions.map((opt: string) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-3 block">Select Columns</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {columns.map(column => (
                      <div key={column} className="flex items-center space-x-2">
                        <Checkbox
                          id={column}
                          checked={selectedColumns.includes(column)}
                          onCheckedChange={() => toggleColumn(column)}
                        />
                        <Label htmlFor={column} className="cursor-pointer capitalize">
                          {column.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 sticky top-6">
              <CardHeader>
                <CardTitle>Export Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Format</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{format}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date Range</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{dateRange}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Columns</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedColumns.length} selected</p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={handleExport} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    {exportButton}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
    `,

    wizard: `
${commonImports}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExportDataInterfaceProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function ExportDataInterface({ ${dataName}, className }: ExportDataInterfaceProps) {
  // Fetch data using React Query
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !${dataName}, // Only fetch if prop not provided
  });

  const exportData = ${dataName} || fetchedData || {};

  const [step, setStep] = useState(1);
  const [format, setFormat] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const formats = ${getField('formats')};
  const dateRangeOptions = ${getField('dateRangeOptions')};
  const exportButton = ${getField('exportButton')};

  if (isLoading && !${dataName}) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  const columns = ['id', 'name', 'email', 'phone', 'created_at', 'status'];

  const steps = [
    { number: 1, name: 'Format', description: 'Choose export format' },
    { number: 2, name: 'Date Range', description: 'Select date range' },
    { number: 3, name: 'Columns', description: 'Pick columns' },
    { number: 4, name: 'Confirm', description: 'Review and export' }
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleExport = () => {
    console.log('Export:', { format, dateRange, selectedColumns });
    alert(\`Exporting as \${format}\`);
  };

  const toggleColumn = (column: string) => {
    setSelectedColumns(prev =>
      prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
    );
  };

  const canProceed = () => {
    if (step === 1) return !!format;
    if (step === 2) return !!dateRange;
    if (step === 3) return selectedColumns.length > 0;
    return true;
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 p-6', className)}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Export Data Wizard</h1>
          <p className="text-gray-600 dark:text-gray-400">Follow the steps to configure your export</p>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, index) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center flex-1">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2',
                  step === s.number
                    ? 'bg-blue-600 text-white'
                    : step > s.number
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                )}>
                  {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{s.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-1 mx-2',
                  step > s.number ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700 mb-6">
          <CardContent className="p-8">
            {step === 1 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Choose Export Format</h3>
                <div className="grid grid-cols-2 gap-4">
                  {formats.map((fmt: string) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={cn(
                        'p-4 border-2 rounded-lg text-left transition-colors',
                        format === fmt
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <FileText className="w-6 h-6 mb-2" />
                      <p className="font-semibold">{fmt}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Date Range</h3>
                <div className="space-y-3">
                  {dateRangeOptions.map((opt: string) => (
                    <button
                      key={opt}
                      onClick={() => setDateRange(opt)}
                      className={cn(
                        'w-full p-4 border-2 rounded-lg text-left transition-colors',
                        dateRange === opt
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <Calendar className="w-5 h-5 inline mr-2" />
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Columns</h3>
                <div className="grid grid-cols-2 gap-3">
                  {columns.map(column => (
                    <div
                      key={column}
                      onClick={() => toggleColumn(column)}
                      className={cn(
                        'p-3 border-2 rounded-lg cursor-pointer transition-colors',
                        selectedColumns.includes(column)
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <Checkbox
                        checked={selectedColumns.includes(column)}
                        className="mr-2"
                      />
                      <span className="capitalize">{column.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Review Export Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Format</span>
                    <Badge>{format}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Date Range</span>
                    <Badge>{dateRange}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-gray-600 dark:text-gray-400">Columns</span>
                    <Badge>{selectedColumns.length} selected</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={step === 1}
          >
            Previous
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {exportButton}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.modal;
};
