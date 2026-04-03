import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateTransactionHistoryTable = (
  resolved: ResolvedComponent,
  variant: 'table' | 'cards' | 'timeline' = 'table'
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

  const commonImports = `
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Filter, X, Eye, ArrowUpRight, ArrowDownRight, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';`;

  const variants = {
    table: `
${commonImports}

interface TransactionHistoryTableProps {
  className?: string;
  onViewDetails?: (transaction: any) => void;
  onExport?: () => void;
}

const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  className,
  onViewDetails,
  onExport
}) => {
  // Fetch transactions from API
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'transactions'}'],
    queryFn: async () => {
      const response = await api.get<any>('/${dataSource || 'transactions'}');
      return Array.isArray(response) ? response : (response?.data || []);
    }
  });

  const allTransactions = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.transactions || []);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Update transactions when data is fetched
  React.useEffect(() => {
    if (allTransactions) {
      setTransactions(allTransactions);
    }
  }, [allTransactions]);

  const tableTitle = 'Transaction History';
  const exportButton = 'Export';
  const viewDetailsButton = 'View Details';
  const clearFiltersButton = 'Clear Filters';

  const handleFilter = () => {
    console.log('Applying filters:', { searchTerm, statusFilter, typeFilter, dateFrom, dateTo });
    let filtered = allTransactions;

    if (searchTerm) {
      filtered = filtered.filter((t: any) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter((t: any) => t.status === statusFilter);
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter((t: any) => t.type.toLowerCase() === typeFilter.toLowerCase());
    }

    if (dateFrom) {
      filtered = filtered.filter((t: any) => t.date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter((t: any) => t.date <= dateTo);
    }

    setTransactions(filtered);
  };

  const handleClearFilters = () => {
    console.log('Clearing all filters');
    setSearchTerm('');
    setStatusFilter('All');
    setTypeFilter('All');
    setDateFrom('');
    setDateTo('');
    setTransactions(allTransactions);
  };

  const handleExport = () => {
    console.log('Exporting transactions:', transactions);
    onExport ? onExport() : alert(\`Exporting \${transactions.length} transactions...\`);
  };

  const handleViewDetails = (transaction: any) => {
    console.log('View transaction details:', transaction);
    onViewDetails ? onViewDetails(transaction) : alert(\`Transaction: \${transaction.description}\\nAmount: $\${transaction.amount}\\nStatus: \${transaction.status}\`);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('w-full max-w-6xl mx-auto p-4', className)}>
        <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700">
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading transactions...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('w-full max-w-6xl mx-auto p-4', className)}>
        <Card className="dark:bg-gray-900 border-red-200 dark:border-red-700">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
              <span className="text-red-600 dark:text-red-400 font-medium">Failed to load transactions</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error?.message || 'An error occurred'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-6xl mx-auto p-4', className)}>
      <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-gray-900 dark:text-white">{tableTitle}</CardTitle>
            <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              {exportButton}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Credit">Credit</SelectItem>
                <SelectItem value="Debit">Debit</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={handleFilter} variant="outline" className="flex-1">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button onClick={handleClearFilters} variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction: any) => (
                  <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">{transaction.date}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.time}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.reference}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        {transaction.type === 'credit' ? (
                          <ArrowDownRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-600" />
                        )}
                        <span className="text-sm text-gray-900 dark:text-white capitalize">{transaction.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={cn(
                        'font-semibold',
                        transaction.type === 'credit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      )}>
                        {transaction.type === 'credit' ? '+' : '-'}\${transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Button
                        onClick={() => handleViewDetails(transaction)}
                        variant="ghost"
                        size="sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistoryTable;
    `,

    cards: `
${commonImports}

interface TransactionHistoryTableProps {
  className?: string;
  onViewDetails?: (transaction: any) => void;
}

const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  className,
  onViewDetails
}) => {
  // Fetch transactions from API
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'transactions'}'],
    queryFn: async () => {
      const response = await api.get<any>('/${dataSource || 'transactions'}');
      return Array.isArray(response) ? response : (response?.data || []);
    }
  });

  const transactions = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.transactions || []);
  const [searchTerm, setSearchTerm] = useState('');

  // Loading and error states
  if (isLoading) {
    return (
      <div className={cn('w-full max-w-4xl mx-auto p-4', className)}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('w-full max-w-4xl mx-auto p-4', className)}>
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
          <span className="text-red-600 dark:text-red-400 font-medium">Failed to load transactions</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error?.message || 'An error occurred'}</span>
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter((t: any) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'Failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-4', className)}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Transaction History</h2>
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((transaction: any) => (
          <Card key={transaction.id} className="dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    transaction.type === 'credit' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                  )}>
                    {transaction.type === 'credit' ? (
                      <ArrowDownRight className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowUpRight className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{transaction.description}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{transaction.date} {transaction.time}</span>
                      <Badge className={getStatusColor(transaction.status)} variant="secondary">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={cn(
                      'text-lg font-bold',
                      transaction.type === 'credit'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}>
                      {transaction.type === 'credit' ? '+' : '-'}\${transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{transaction.category}</div>
                  </div>
                </div>

                <Button
                  onClick={() => onViewDetails ? onViewDetails(transaction) : alert(\`Viewing details for \${transaction.description}\`)}
                  variant="ghost"
                  size="icon"
                  className="ml-4"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistoryTable;
    `,

    timeline: `
${commonImports}

interface TransactionHistoryTableProps {
  className?: string;
  onViewDetails?: (transaction: any) => void;
}

const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  className,
  onViewDetails
}) => {
  // Fetch transactions from API
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataSource || 'transactions'}'],
    queryFn: async () => {
      const response = await api.get<any>('/${dataSource || 'transactions'}');
      return Array.isArray(response) ? response : (response?.data || []);
    }
  });

  const transactions = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.transactions || []);

  // Loading and error states
  if (isLoading) {
    return (
      <div className={cn('w-full max-w-4xl mx-auto p-4', className)}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('w-full max-w-4xl mx-auto p-4', className)}>
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
          <span className="text-red-600 dark:text-red-400 font-medium">Failed to load transactions</span>
          <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">{error?.message || 'An error occurred'}</span>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Completed': 'bg-green-500',
      'Pending': 'bg-yellow-500',
      'Failed': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-4', className)}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Transaction Timeline</h2>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        <div className="space-y-6">
          {transactions.map((transaction: any, index: number) => (
            <div key={transaction.id} className="relative flex gap-6">
              {/* Timeline dot */}
              <div className="relative z-10">
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900',
                  transaction.type === 'credit' ? 'bg-green-500' : 'bg-red-500'
                )}>
                  {transaction.type === 'credit' ? (
                    <ArrowDownRight className="w-5 h-5 text-white" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={cn(
                  'absolute -right-1 -top-1 w-3 h-3 rounded-full',
                  getStatusColor(transaction.status)
                )}></div>
              </div>

              {/* Content card */}
              <Card className="flex-1 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{transaction.description}</h3>
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {transaction.date} at {transaction.time}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Ref: {transaction.reference}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={cn(
                        'text-xl font-bold mb-1',
                        transaction.type === 'credit'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      )}>
                        {transaction.type === 'credit' ? '+' : '-'}\${transaction.amount.toFixed(2)}
                      </div>
                      <Badge className={cn(
                        'text-xs',
                        transaction.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      )}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={() => onViewDetails ? onViewDetails(transaction) : alert(\`View details: \${transaction.description}\`)}
                    variant="link"
                    size="sm"
                    className="mt-2 p-0 h-auto"
                  >
                    View Details →
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryTable;
    `
  };

  return variants[variant] || variants.table;
};
