import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateBillingDashboard = (
  resolved: ResolvedComponent,
  variant: 'overview' | 'detailed' | 'invoices' = 'overview'
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
    return `/${dataSource || 'billing'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'billing';

  const commonImports = `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Download, TrendingUp, Calendar, DollarSign, ArrowUpRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';`;

  const variants = {
    overview: `
${commonImports}

interface BillingDashboardProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function BillingDashboard({ ${dataName}: propData, className }: BillingDashboardProps) {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
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

  const billingData = ${dataName} || {};

  const currentPlan = ${getField('currentPlan')};
  const billingCycle = ${getField('billingCycle')};
  const nextPaymentDate = ${getField('nextPaymentDate')};
  const paymentAmount = ${getField('paymentAmount')};
  const paymentMethod = ${getField('paymentMethod')};
  const usageMetrics = ${getField('usageMetrics')};
  const invoices = ${getField('invoices')};

  const billingTitle = ${getField('billingTitle')};
  const upgradePlanButton = ${getField('upgradePlanButton')};
  const updatePaymentButton = ${getField('updatePaymentButton')};

  const handleUpgrade = () => {
    console.log('Upgrade clicked');
    alert('Opening upgrade options...');
  };

  const handleUpdatePayment = () => {
    console.log('Update payment clicked');
    alert('Opening payment method editor...');
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6', className)}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">{billingTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your subscription and billing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-800 dark:via-blue-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Plan</span>
                <Badge className="bg-blue-600 text-white">{currentPlan}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Billing Cycle</span>
                  <span className="font-medium text-gray-900 dark:text-white">{billingCycle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Next Payment</span>
                  <span className="font-medium text-gray-900 dark:text-white">{nextPaymentDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{paymentAmount}</span>
                </div>
                <Button onClick={handleUpgrade} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {upgradePlanButton}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-gray-800 dark:via-purple-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{paymentMethod}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/2026</p>
                  </div>
                </div>
                <Button onClick={handleUpdatePayment} variant="outline" className="w-full">
                  {updatePaymentButton}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-800 dark:via-blue-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300 mb-6">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">Usage This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {usageMetrics.storage.used} / {usageMetrics.storage.limit} {usageMetrics.storage.unit}
                </span>
              </div>
              <Progress value={(usageMetrics.storage.used / usageMetrics.storage.limit) * 100} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bandwidth</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {usageMetrics.bandwidth.used} / {usageMetrics.bandwidth.limit} {usageMetrics.bandwidth.unit}
                </span>
              </div>
              <Progress value={(usageMetrics.bandwidth.used / usageMetrics.bandwidth.limit) * 100} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Calls</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {usageMetrics.apiCalls.used.toLocaleString()} / {usageMetrics.apiCalls.limit.toLocaleString()} {usageMetrics.apiCalls.unit}
                </span>
              </div>
              <Progress value={(usageMetrics.apiCalls.used / usageMetrics.apiCalls.limit) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-gray-800 dark:via-purple-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.map((invoice: any) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-r from-white to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/10 hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{invoice.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900 dark:text-white">{invoice.amount}</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    `,

    detailed: `
${commonImports}

interface BillingDashboardProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function BillingDashboard({ ${dataName}: propData, className }: BillingDashboardProps) {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
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

  const billingData = ${dataName} || {};

  const currentPlan = ${getField('currentPlan')};
  const availablePlans = ${getField('availablePlans')};
  const paymentAmount = ${getField('paymentAmount')};
  const nextPaymentDate = ${getField('nextPaymentDate')};

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6', className)}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-8">Choose Your Plan</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {availablePlans.map((plan: any) => (
            <Card
              key={plan.name}
              className={cn(
                'rounded-2xl shadow-xl bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-800 dark:via-blue-900/10 dark:to-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border-2',
                plan.name === currentPlan
                  ? 'border-blue-600 dark:border-blue-500'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {plan.name === currentPlan && (
                    <Badge className="bg-blue-600 text-white">Current</Badge>
                  )}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">\${plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    'w-full',
                    plan.name === currentPlan
                      ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  )}
                  disabled={plan.name === currentPlan}
                >
                  {plan.name === currentPlan ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-gray-800 dark:via-purple-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Your next payment is scheduled for</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{nextPaymentDate}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 dark:text-gray-400">Amount</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{paymentAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    `,

    invoices: `
${commonImports}

interface BillingDashboardProps {
  ${dataName}?: any;
  className?: string;
  [key: string]: any;
}

export default function BillingDashboard({ ${dataName}: propData, className }: BillingDashboardProps) {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
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

  const billingData = ${dataName} || {};

  const invoices = ${getField('invoices')};
  const downloadInvoiceButton = ${getField('downloadInvoiceButton')};

  const handleDownload = (invoice: any) => {
    console.log('Downloading invoice:', invoice.id);
    alert(\`Downloading invoice \${invoice.id}...\`);
  };

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6', className)}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">Billing History</h1>
          <p className="text-gray-600 dark:text-gray-400">View and download your invoices</p>
        </div>

        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-800 dark:via-blue-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Invoice</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Date</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Amount</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Status</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice: any) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-300"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{invoice.id}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{invoice.date}</td>
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">{invoice.amount}</td>
                    <td className="py-4 px-6">
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(invoice)}
                        className="text-blue-600 dark:text-blue-400"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {downloadInvoiceButton}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    `
  };

  return variants[variant] || variants.overview;
};
