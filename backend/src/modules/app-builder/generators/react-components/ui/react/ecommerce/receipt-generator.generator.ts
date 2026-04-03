import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateReceiptGenerator = (
  resolved: ResolvedComponent,
  variant: 'thermal' | 'modern' | 'email' = 'thermal'
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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Printer, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';`;

  const variants = {
    thermal: `
${commonImports}

interface ReceiptGeneratorProps {
  ${dataName}?: any;
  className?: string;
  onPrint?: () => void;
  onDownload?: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({
  ${dataName}: initialData,
  className,
  onPrint,
  onDownload
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

  const receiptData = ${dataName} || {};

  const receiptNumber = ${getField('receiptNumber')};
  const transactionDate = ${getField('transactionDate')};
  const transactionId = ${getField('transactionId')};
  const merchantName = ${getField('merchantName')};
  const merchantAddress = ${getField('merchantAddress')};
  const merchantCity = ${getField('merchantCity')};
  const merchantPhone = ${getField('merchantPhone')};
  const items = ${getField('items')};
  const paymentMethod = ${getField('paymentMethod')};
  const cardType = ${getField('cardType')};
  const cardLast4 = ${getField('cardLast4')};
  const subtotal = ${getField('subtotal')};
  const tax = ${getField('tax')};
  const discount = ${getField('discount')};
  const total = ${getField('total')};
  const thankYouMessage = ${getField('thankYouMessage')};
  const returnPolicy = ${getField('returnPolicy')};
  const printButton = ${getField('printButton')};
  const downloadButton = ${getField('downloadButton')};

  const handlePrint = () => {
    console.log('Print receipt:', receiptNumber);
    onPrint ? onPrint() : window.print();
  };

  const handleDownload = () => {
    console.log('Download receipt:', receiptNumber);
    onDownload ? onDownload() : alert('Downloading receipt...');
  };

  return (
    <div className={cn('w-full max-w-sm mx-auto', className)}>
      {/* Thermal receipt style */}
      <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 font-mono text-sm rounded-2xl shadow-xl">
        <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{merchantName}</h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">{merchantAddress}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{merchantCity}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{merchantPhone}</p>
        </div>

        <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Receipt #</span>
            <span className="text-gray-900 dark:text-white font-semibold">{receiptNumber}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Date</span>
            <span className="text-gray-900 dark:text-white">{transactionDate}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
            <span className="text-gray-900 dark:text-white">{transactionId}</span>
          </div>
        </div>

        <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
          {items.map((item: any) => (
            <div key={item.id} className="mb-2">
              <div className="flex justify-between">
                <span className="text-gray-900 dark:text-white">{item.name}</span>
                <span className="text-gray-900 dark:text-white font-semibold">\${item.total.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 ml-2">
                {item.quantity} × \${Number(item.price).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-300 dark:border-gray-600 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="text-gray-900 dark:text-white">\${subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Discount</span>
              <span className="text-green-600 dark:text-green-400">-\${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tax</span>
            <span className="text-gray-900 dark:text-white">\${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300 dark:border-gray-600">
            <span className="text-gray-900 dark:text-white">TOTAL</span>
            <span className="text-gray-900 dark:text-white">\${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-4 pb-4 border-b-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
            <span className="text-gray-900 dark:text-white">{paymentMethod}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">Card</span>
            <span className="text-gray-900 dark:text-white">{cardType} ****{cardLast4}</span>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{thankYouMessage}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{returnPolicy}</p>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-500">
          ================================
        </div>
      </div>

      <div className="flex gap-2 mt-4 print:hidden">
        <Button onClick={handlePrint} variant="outline" size="sm" className="flex-1">
          <Printer className="w-4 h-4 mr-2" />
          {printButton}
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          {downloadButton}
        </Button>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
    `,

    modern: `
${commonImports}

interface ReceiptGeneratorProps {
  ${dataName}?: any;
  className?: string;
  onPrint?: () => void;
  onDownload?: () => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({
  ${dataName}: initialData,
  className,
  onPrint,
  onDownload
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

  const receiptData = ${dataName} || {};

  const receiptNumber = ${getField('receiptNumber')};
  const transactionDate = ${getField('transactionDate')};
  const merchantName = ${getField('merchantName')};
  const merchantAddress = ${getField('merchantAddress')};
  const merchantCity = ${getField('merchantCity')};
  const customerName = ${getField('customerName')};
  const items = ${getField('items')};
  const paymentMethod = ${getField('paymentMethod')};
  const cardType = ${getField('cardType')};
  const cardLast4 = ${getField('cardLast4')};
  const subtotal = ${getField('subtotal')};
  const tax = ${getField('tax')};
  const discount = ${getField('discount')};
  const total = ${getField('total')};
  const status = ${getField('status')};
  const thankYouMessage = ${getField('thankYouMessage')};

  return (
    <div className={cn('w-full max-w-2xl mx-auto p-4', className)}>
      <Card className="dark:bg-gray-900 border-gray-200/50 dark:border-gray-700 rounded-2xl shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">Receipt</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">#{receiptNumber}</p>
            </div>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              {status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">From</h3>
              <p className="font-semibold text-gray-900 dark:text-white">{merchantName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{merchantAddress}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{merchantCity}</p>
            </div>
            <div>
              <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">Customer</h3>
              <p className="font-semibold text-gray-900 dark:text-white">{customerName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{transactionDate}</p>
            </div>
          </div>

          <div className="mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Item</th>
                  <th className="text-center py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
                  <th className="text-right py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 text-gray-900 dark:text-gray-100">{item.name}</td>
                    <td className="py-3 text-center text-gray-900 dark:text-gray-100">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-900 dark:text-gray-100">\${Number(item.price).toFixed(2)}</td>
                    <td className="py-3 text-right font-medium text-gray-900 dark:text-gray-100">\${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-gray-100">\${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <span className="text-green-600 dark:text-green-400">-\${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="text-gray-900 dark:text-gray-100">\${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600 font-bold">
                <span className="text-gray-900 dark:text-white">Total Paid</span>
                <span className="text-blue-600 dark:text-blue-400">\${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="text-sm">
              <p className="text-gray-700 dark:text-gray-300 mb-1">
                <span className="font-semibold">Payment Method:</span> {paymentMethod}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Card:</span> {cardType} ****{cardLast4}
              </p>
            </div>
          </div>

          <div className="text-center py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-900 dark:text-white font-medium">{thankYouMessage}</p>
          </div>

          <div className="flex gap-3 mt-6 print:hidden">
            <Button onClick={() => onPrint ? onPrint() : window.print()} variant="outline" className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={() => onDownload ? onDownload() : alert('Downloading...')} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptGenerator;
    `,

    email: `
${commonImports}

interface ReceiptGeneratorProps {
  ${dataName}?: any;
  className?: string;
  onSendEmail?: (email: string) => void;
}

const ReceiptGenerator: React.FC<ReceiptGeneratorProps> = ({
  ${dataName}: initialData,
  className,
  onSendEmail
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

  const receiptData = ${dataName} || {};
  const [email, setEmail] = useState(${getField('customerEmail')} || '');
  const [emailSent, setEmailSent] = useState(${getField('emailSent')});

  const receiptNumber = ${getField('receiptNumber')};
  const transactionDate = ${getField('transactionDate')};
  const merchantName = ${getField('merchantName')};
  const items = ${getField('items')};
  const total = ${getField('total')};
  const emailReceiptButton = ${getField('emailReceiptButton')};

  const handleSendEmail = () => {
    console.log('Sending receipt to:', email);
    if (!email) {
      alert('Please enter an email address');
      return;
    }
    if (onSendEmail) {
      onSendEmail(email);
    } else {
      alert(\`Receipt will be sent to \${email}\`);
    }
    setEmailSent(true);
  };

  return (
    <div className={cn('w-full max-w-xl mx-auto p-4', className)}>
      <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-600 dark:text-gray-400">Your transaction has been completed</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Receipt Number</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{receiptNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Date & Time</span>
              <span className="text-sm text-gray-900 dark:text-white">{transactionDate}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Merchant</span>
              <span className="text-sm text-gray-900 dark:text-white">{merchantName}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="text-base font-semibold text-gray-900 dark:text-white">Amount Paid</span>
              <span className="text-base font-bold text-green-600 dark:text-green-400">\${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Items Purchased</h3>
            <div className="space-y-2">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.name} (×{item.quantity})
                  </span>
                  <span className="text-gray-900 dark:text-white">\${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {!emailSent ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Receipt
              </label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="flex-1"
                />
                <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4 mr-2" />
                  {emailReceiptButton}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                We'll send a copy of this receipt to your email
              </p>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-300">Receipt sent!</p>
                <p className="text-xs text-green-700 dark:text-green-400">Check your inbox at {email}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptGenerator;
    `
  };

  return variants[variant] || variants.thermal;
};
