import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateInvoiceDisplay = (
  resolved: ResolvedComponent,
  variant: 'modern' | 'classic' | 'minimal' = 'modern'
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Send, DollarSign, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    modern: `
${commonImports}

interface InvoiceDisplayProps {
  ${dataName}?: any;
  className?: string;
  onDownload?: () => void;
  onPrint?: () => void;
  onSend?: () => void;
  onPayNow?: () => void;
}

const InvoiceDisplay: React.FC<InvoiceDisplayProps> = ({
  ${dataName}: initialData,
  className,
  onDownload,
  onPrint,
  onSend,
  onPayNow
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const invoiceData = ${dataName} || {};

  const invoiceNumber = ${getField('invoiceNumber')};
  const invoiceDate = ${getField('invoiceDate')};
  const dueDate = ${getField('dueDate')};
  const status = ${getField('status')};
  const companyName = ${getField('companyName')};
  const companyAddress = ${getField('companyAddress')};
  const companyCity = ${getField('companyCity')};
  const companyEmail = ${getField('companyEmail')};
  const companyPhone = ${getField('companyPhone')};
  const clientName = ${getField('clientName')};
  const clientAddress = ${getField('clientAddress')};
  const clientCity = ${getField('clientCity')};
  const clientEmail = ${getField('clientEmail')};
  const items = ${getField('items')};
  const subtotal = ${getField('subtotal')};
  const tax = ${getField('tax')};
  const discount = ${getField('discount')};
  const total = ${getField('total')};
  const paymentTerms = ${getField('paymentTerms')};
  const notes = ${getField('notes')};
  const downloadButton = ${getField('downloadButton')};
  const printButton = ${getField('printButton')};
  const sendButton = ${getField('sendButton')};
  const payNowButton = ${getField('payNowButton')};

  const handleDownload = () => {
    console.log('Download invoice:', invoiceNumber);
    onDownload ? onDownload() : alert('Downloading invoice...');
  };

  const handlePrint = () => {
    console.log('Print invoice:', invoiceNumber);
    onPrint ? onPrint() : window.print();
  };

  const handleSend = () => {
    console.log('Send invoice:', invoiceNumber);
    onSend ? onSend() : alert(\`Sending invoice to \${clientEmail}\`);
  };

  const handlePayNow = () => {
    console.log('Pay now:', invoiceNumber);
    onPayNow ? onPayNow() : alert(\`Redirecting to payment for \${total.toFixed(2)}\`);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Unpaid': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'Overdue': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      'Draft': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[status] || colors['Draft'];
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-4', className)}>
      <Card className="dark:bg-gray-900 border-gray-200/50 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
              <p className="text-blue-100">#{invoiceNumber}</p>
            </div>
            <Badge className={getStatusColor(status)}>
              {status}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <h3 className="text-sm font-semibold text-blue-100 mb-2">From</h3>
              <div className="text-white">
                <p className="font-semibold">{companyName}</p>
                <p className="text-sm text-blue-100">{companyAddress}</p>
                <p className="text-sm text-blue-100">{companyCity}</p>
                <p className="text-sm text-blue-100">{companyEmail}</p>
                <p className="text-sm text-blue-100">{companyPhone}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-blue-100 mb-2">Bill To</h3>
              <div className="text-white">
                <p className="font-semibold">{clientName}</p>
                <p className="text-sm text-blue-100">{clientAddress}</p>
                <p className="text-sm text-blue-100">{clientCity}</p>
                <p className="text-sm text-blue-100">{clientEmail}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">{invoiceDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">{dueDate}</p>
            </div>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Rate</th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-4 px-2 text-gray-900 dark:text-gray-100">{item.description}</td>
                    <td className="py-4 px-2 text-right text-gray-900 dark:text-gray-100">{item.quantity}</td>
                    <td className="py-4 px-2 text-right text-gray-900 dark:text-gray-100">\${item.rate.toFixed(2)}</td>
                    <td className="py-4 px-2 text-right font-medium text-gray-900 dark:text-gray-100">\${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-6">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">\${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <span className="font-medium text-green-600 dark:text-green-400">-\${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Tax (10%)</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">\${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-gray-200 dark:border-gray-700">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">\${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Payment Terms</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{paymentTerms}</p>
          </div>

          {notes && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{notes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              {downloadButton}
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              {printButton}
            </Button>
            <Button onClick={handleSend} variant="outline" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              {sendButton}
            </Button>
            {status === 'Unpaid' && (
              <Button onClick={handlePayNow} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 ml-auto">
                <DollarSign className="w-4 h-4" />
                {payNowButton}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceDisplay;
    `,

    classic: `
${commonImports}

interface InvoiceDisplayProps {
  ${dataName}?: any;
  className?: string;
  onDownload?: () => void;
  onPrint?: () => void;
}

const InvoiceDisplay: React.FC<InvoiceDisplayProps> = ({
  ${dataName}: initialData,
  className,
  onDownload,
  onPrint
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const invoiceData = ${dataName} || {};

  const invoiceNumber = ${getField('invoiceNumber')};
  const invoiceDate = ${getField('invoiceDate')};
  const dueDate = ${getField('dueDate')};
  const companyName = ${getField('companyName')};
  const companyAddress = ${getField('companyAddress')};
  const companyCity = ${getField('companyCity')};
  const clientName = ${getField('clientName')};
  const clientAddress = ${getField('clientAddress')};
  const clientCity = ${getField('clientCity')};
  const items = ${getField('items')};
  const subtotal = ${getField('subtotal')};
  const tax = ${getField('tax')};
  const total = ${getField('total')};
  const paymentTerms = ${getField('paymentTerms')};
  const downloadButton = ${getField('downloadButton')};
  const printButton = ${getField('printButton')};

  return (
    <div className={cn('w-full max-w-4xl mx-auto p-8 bg-white dark:bg-gray-900', className)}>
      <div className="border-4 border-gray-800 dark:border-gray-200 p-8">
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-800 dark:border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">INVOICE</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">#{invoiceNumber}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-sm">From:</h3>
            <p className="font-semibold text-gray-900 dark:text-white">{companyName}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{companyAddress}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{companyCity}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 uppercase text-sm">To:</h3>
            <p className="font-semibold text-gray-900 dark:text-white">{clientName}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{clientAddress}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{clientCity}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-100 dark:bg-gray-800">
          <div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Invoice Date:</p>
            <p className="text-gray-900 dark:text-white">{invoiceDate}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Due Date:</p>
            <p className="text-gray-900 dark:text-white">{dueDate}</p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900">
            <tr>
              <th className="text-left py-3 px-4 font-bold">DESCRIPTION</th>
              <th className="text-center py-3 px-4 font-bold">QTY</th>
              <th className="text-right py-3 px-4 font-bold">RATE</th>
              <th className="text-right py-3 px-4 font-bold">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, index: number) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.description}</td>
                <td className="py-3 px-4 text-center text-gray-900 dark:text-gray-100">{item.quantity}</td>
                <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">\${item.rate.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-gray-100">\${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-gray-300 dark:border-gray-600">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Subtotal:</span>
              <span className="text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-300 dark:border-gray-600">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Tax:</span>
              <span className="text-gray-900 dark:text-white">\${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 px-4 mt-2">
              <span className="font-bold text-lg">TOTAL:</span>
              <span className="font-bold text-lg">\${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-800 dark:border-gray-200 pt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">{paymentTerms}</p>
        </div>

        <div className="flex gap-3 mt-8 print:hidden">
          <Button onClick={() => onDownload ? onDownload() : alert('Downloading...')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {downloadButton}
          </Button>
          <Button onClick={() => onPrint ? onPrint() : window.print()} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            {printButton}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDisplay;
    `,

    minimal: `
${commonImports}

interface InvoiceDisplayProps {
  ${dataName}?: any;
  className?: string;
  onDownload?: () => void;
  onPrint?: () => void;
}

const InvoiceDisplay: React.FC<InvoiceDisplayProps> = ({
  ${dataName}: initialData,
  className,
  onDownload,
  onPrint
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData,
  });

  const ${dataName} = fetchedData || initialData;

  if (isLoading && !${dataName}) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const invoiceData = ${dataName} || {};

  const invoiceNumber = ${getField('invoiceNumber')};
  const invoiceDate = ${getField('invoiceDate')};
  const dueDate = ${getField('dueDate')};
  const companyName = ${getField('companyName')};
  const clientName = ${getField('clientName')};
  const items = ${getField('items')};
  const subtotal = ${getField('subtotal')};
  const tax = ${getField('tax')};
  const total = ${getField('total')};
  const downloadButton = ${getField('downloadButton')};
  const printButton = ${getField('printButton')};

  return (
    <div className={cn('w-full max-w-3xl mx-auto p-8', className)}>
      <div className="mb-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white mb-1">Invoice</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">#{invoiceNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Date: {invoiceDate}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Due: {dueDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">From</p>
            <p className="font-medium text-gray-900 dark:text-white">{companyName}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">To</p>
            <p className="font-medium text-gray-900 dark:text-white">{clientName}</p>
          </div>
        </div>

        <div className="mb-8">
          {items.map((item: any) => (
            <div key={item.id} className="flex justify-between py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white">{item.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.quantity} × \${item.rate}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">\${item.amount.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="text-gray-900 dark:text-white">\${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
              <span className="font-medium text-gray-900 dark:text-white">Total</span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">\${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 print:hidden">
        <Button onClick={() => onDownload ? onDownload() : alert('Downloading...')} variant="ghost" size="sm">
          <Download className="w-4 h-4 mr-2" />
          {downloadButton}
        </Button>
        <Button onClick={() => onPrint ? onPrint() : window.print()} variant="ghost" size="sm">
          <Printer className="w-4 h-4 mr-2" />
          {printButton}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceDisplay;
    `
  };

  return variants[variant] || variants.modern;
};
