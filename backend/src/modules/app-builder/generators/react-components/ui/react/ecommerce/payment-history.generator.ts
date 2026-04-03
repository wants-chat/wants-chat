import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generatePaymentHistory = (
  resolved: ResolvedComponent,
  variant: 'list' | 'table' | 'calendar' = 'list'
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
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, CheckCircle2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    list: `
${commonImports}

interface PaymentHistoryProps {
  ${dataName}?: any;
  className?: string;
  onDownloadReceipt?: (payment: any) => void;
  onViewDetails?: (payment: any) => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  ${dataName}: initialData,
  className,
  onDownloadReceipt,
  onViewDetails
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const data = ${dataName} || {};
  const payments = ${getField('payments')};
  const tableTitle = ${getField('tableTitle')};
  const downloadReceiptButton = ${getField('downloadReceiptButton')};
  const viewDetailsButton = ${getField('viewDetailsButton')};
  const totalPaidLabel = ${getField('totalPaidLabel')};

  const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

  const handleDownload = (payment: any) => {
    console.log('Download receipt:', payment);
    onDownloadReceipt ? onDownloadReceipt(payment) : alert(\`Downloading receipt for \${payment.invoiceNumber}\`);
  };

  const handleViewDetails = (payment: any) => {
    console.log('View payment details:', payment);
    onViewDetails ? onViewDetails(payment) : alert(\`Payment Details:\\n\\nInvoice: \${payment.invoiceNumber}\\nAmount: $\${payment.amount}\\nDate: \${payment.date}\`);
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-4', className)}>
      <Card className="dark:bg-gray-900 border-gray-200/50 dark:border-gray-700 rounded-2xl shadow-xl">
        <CardHeader className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl text-gray-900 dark:text-white">{tableTitle}</CardTitle>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">{totalPaidLabel}</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">\${totalPaid.toFixed(2)}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {payments.map((payment: any) => (
              <Card key={payment.id} className="dark:bg-gray-800 border-gray-200/50 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">\${payment.amount.toFixed(2)}</h3>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {payment.date} • {payment.paymentMethod}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Invoice: {payment.invoiceNumber} • Order: {payment.orderNumber}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handleDownload(payment)} variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          {downloadReceiptButton}
                        </Button>
                        <Button onClick={() => handleViewDetails(payment)} variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          {viewDetailsButton}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
    `,

    table: `
${commonImports}

interface PaymentHistoryProps {
  ${dataName}?: any;
  className?: string;
  onDownloadReceipt?: (payment: any) => void;
  onViewDetails?: (payment: any) => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  ${dataName}: initialData,
  className,
  onDownloadReceipt,
  onViewDetails
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const data = ${dataName} || {};
  const payments = ${getField('payments')};
  const tableTitle = ${getField('tableTitle')};

  return (
    <div className={cn('w-full max-w-6xl mx-auto p-4', className)}>
      <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white">{tableTitle}</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Invoice</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any) => (
                  <tr key={payment.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{payment.date}</td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{payment.invoiceNumber}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{payment.orderNumber}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">{payment.paymentMethod}</td>
                    <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">\${payment.amount.toFixed(2)}</td>
                    <td className="py-4 px-4 text-center">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-center">
                        <Button onClick={() => onDownloadReceipt ? onDownloadReceipt(payment) : alert('Download receipt')} variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => onViewDetails ? onViewDetails(payment) : alert('View details')} variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
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
  );
};

export default PaymentHistory;
    `,

    calendar: `
${commonImports}

interface PaymentHistoryProps {
  ${dataName}?: any;
  className?: string;
  onViewDetails?: (payment: any) => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  ${dataName},
  className,
  onViewDetails
}) => {
  const data = ${dataName} || {};
  const payments = ${getField('payments')};

  const groupByMonth = (payments: any[]) => {
    const grouped: any = {};
    payments.forEach(payment => {
      const month = payment.date.substring(0, 7);
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(payment);
    });
    return grouped;
  };

  const groupedPayments = groupByMonth(payments);

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-4', className)}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Payment Calendar</h2>

      <div className="space-y-6">
        {Object.entries(groupedPayments).reverse().map(([month, monthPayments]: [string, any]) => {
          const monthTotal = monthPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
          return (
            <Card key={month} className="dark:bg-gray-900 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <CardTitle className="text-lg text-gray-900 dark:text-white">
                      {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{monthPayments.length} payments</div>
                    <div className="font-bold text-gray-900 dark:text-white">\${monthTotal.toFixed(2)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {monthPayments.map((payment: any) => (
                    <div
                      key={payment.id}
                      onClick={() => onViewDetails ? onViewDetails(payment) : alert('View details')}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{payment.invoiceNumber}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{payment.paymentMethod}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">\${payment.amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{payment.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentHistory;
    `
  };

  return variants[variant] || variants.list;
};
