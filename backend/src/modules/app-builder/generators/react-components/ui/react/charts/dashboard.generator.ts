import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateDashboard = (
  resolved: ResolvedComponent,
  variant: 'bank' | 'crypto' | 'customerService' | 'ecommerce' | 'marketing' | 'projectManagement' | 'saas' = 'bank'
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
    if (!dataSource || dataSource.trim() === '') {
      return 'data'; // Default prop name when no data source
    }
    const parts = dataSource.split('.');
    return sanitizeVariableName(parts[parts.length - 1]);
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
    return `/${dataSource || 'dashboard'}`;
  };

  const apiRoute = getApiRoute();

  const variants = {
    bank: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  onCardClick?: (cardId: string) => void;
  onViewDetails?: (itemId: string) => void;
  onExportData?: () => void;
  onRefresh?: (data?: any) => void;
  onDateChange?: (range: any) => void;
  onFilterChange?: (filters: any) => void;
  onWidgetClick?: (data?: any) => void;
}

const BankDashboard: React.FC<DashboardProps> = ({ ${dataName}: propData, entity = '${dataSource || 'dashboard'}', className }) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response[0] : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const sourceData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }
  
  const bankStats = ${getField('bankStats')};
  const bankTransactions = ${getField('bankTransactions')};
  const spendingCategories = ${getField('spendingCategories')};
  const monthlyBudget = ${getField('monthlyBudget')};
  const savingsGoals = ${getField('savingsGoals')};
  const upcomingBills = ${getField('upcomingBills')};
  
  const recentTransactionsTitle = ${getField('recentTransactionsTitle')};
  const spendingByCategoryTitle = ${getField('spendingByCategoryTitle')};
  const monthlyBudgetTitle = ${getField('monthlyBudgetTitle')};
  const savingsGoalsTitle = ${getField('savingsGoalsTitle')};
  const quickActionsTitle = ${getField('quickActionsTitle')};
  const upcomingBillsTitle = ${getField('upcomingBillsTitle')};
  
  const transferMoneyButton = ${getField('transferMoneyButton')};
  const payBillsButton = ${getField('payBillsButton')};
  const viewStatementsButton = ${getField('viewStatementsButton')};
  const dueLabel = ${getField('dueLabel')};
  const ofBudgetLabel = ${getField('ofBudgetLabel')};
  const budgetUsedLabel = ${getField('budgetUsedLabel')};

  return (
    <div className="space-y-6 bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10 p-6 rounded-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-800 dark:via-blue-900/20 dark:to-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{bankStats.totalBalanceLabel}</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">{bankStats.totalBalance}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bankStats.totalBalanceDescription}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-green-50/30 to-white dark:from-gray-800 dark:via-green-900/20 dark:to-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{bankStats.checkingAccountLabel}</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 flex items-center justify-center shadow-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{bankStats.checkingAccount}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{bankStats.checkingAccountChange}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-gray-800 dark:via-purple-900/20 dark:to-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{bankStats.savingsAccountLabel}</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 flex items-center justify-center shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{bankStats.savingsAccount}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{bankStats.savingsAccountChange}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-red-50/30 to-white dark:from-gray-800 dark:via-red-900/20 dark:to-gray-800 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{bankStats.creditCardLabel}</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 flex items-center justify-center shadow-lg">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{bankStats.creditCard}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bankStats.creditCardOutstanding}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-800 dark:via-blue-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{recentTransactionsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bankTransactions.map((transaction: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className={\`h-10 w-10 rounded-full flex items-center justify-center \${
                      transaction.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }\`}>
                      {transaction.type === 'credit' ? (
                        <ArrowDownRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium dark:text-white">{transaction.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={\`text-sm font-semibold \${
                      transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                    }\`}>
                      {transaction.type === 'credit' ? '+' : ''}\${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-gray-800 dark:via-purple-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{spendingByCategoryTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spendingCategories.map((item: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-white">{item.category}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold dark:text-white">\${item.amount.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={\`bg-\${item.color}-600 h-2 rounded-full\`}
                      style={{ width: \`\${item.percentage}%\` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-800 dark:via-blue-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{monthlyBudgetTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{monthlyBudget.used}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ofBudgetLabel} {monthlyBudget.total} {budgetUsedLabel}</p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full" style={{ width: \`\${monthlyBudget.percentage}%\` }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{monthlyBudget.remaining}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-green-50/20 to-white dark:from-gray-800 dark:via-green-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{savingsGoalsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savingsGoals.map((item: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium dark:text-white">{item.goal}</span>
                    <span className="text-gray-600 dark:text-gray-400">\${item.saved.toLocaleString()} / \${item.target.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                      style={{ width: \`\${item.percentage}%\` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-gray-800 dark:via-purple-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{quickActionsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-medium text-sm">
                {transferMoneyButton}
              </button>
              <button className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-medium text-sm">
                {payBillsButton}
              </button>
              <button className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 font-medium text-sm">
                {viewStatementsButton}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white via-blue-50/20 to-white dark:from-gray-800 dark:via-blue-900/10 dark:to-gray-800 hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{upcomingBillsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingBills.map((bill: any, index: number) => (
              <div key={index} className="p-4 border dark:border-gray-700 rounded-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                <p className="text-sm font-medium mb-1 dark:text-white">{bill.name}</p>
                <p className="text-lg font-bold mb-2 dark:text-white">\${bill.amount}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{dueLabel}: {bill.due}</p>
                  <span className={\`text-xs px-2 py-1 rounded-full \${
                    bill.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                    bill.status === 'pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }\`}>
                    {bill.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BankDashboard;
    `,

    crypto: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bitcoin, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  onCardClick?: (cardId: string) => void;
  onViewDetails?: (itemId: string) => void;
  onExportData?: () => void;
  onRefresh?: (data?: any) => void;
  onDateChange?: (range: any) => void;
  onFilterChange?: (filters: any) => void;
  onWidgetClick?: (data?: any) => void;
}

const CryptoDashboard: React.FC<DashboardProps> = ({ ${dataName}: propData, entity = '${dataSource || 'dashboard'}', className }) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response[0] : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const sourceData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }
  
  const cryptoStats = ${getField('cryptoStats')};
  const cryptoAssets = ${getField('cryptoAssets')};
  const marketTrends = ${getField('marketTrends')};
  const cryptoTransactions = ${getField('cryptoTransactions')};
  const portfolioDistribution = ${getField('portfolioDistribution')};
  
  const yourAssetsTitle = ${getField('yourAssetsTitle')};
  const marketTrendsTitle = ${getField('marketTrendsTitle')};
  const recentTransactionsCryptoTitle = ${getField('recentTransactionsCryptoTitle')};
  const portfolioDistributionTitle = ${getField('portfolioDistributionTitle')};
  const quickActionsTitle = ${getField('quickActionsTitle')};
  
  const buyCryptoButton = ${getField('buyCryptoButton')};
  const sellCryptoButton = ${getField('sellCryptoButton')};
  const transferButton = ${getField('transferButton')};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{cryptoStats.portfolioLabel}</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{cryptoStats.portfolioValue}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {cryptoStats.portfolioChange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{cryptoStats.bitcoinLabel}</CardTitle>
            <Bitcoin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{cryptoStats.bitcoinPrice}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {cryptoStats.bitcoinChange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{cryptoStats.volumeLabel}</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{cryptoStats.volume24h}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{cryptoStats.volumeChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{cryptoStats.profitLabel}</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{cryptoStats.totalProfit}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{cryptoStats.profitPercentage}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{yourAssetsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cryptoAssets.map((asset: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{asset.symbol}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium dark:text-white">{asset.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{asset.amount} {asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold dark:text-white">{asset.value}</p>
                    <p className={\`text-xs flex items-center gap-1 justify-end \${
                      asset.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }\`}>
                      {asset.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {asset.change}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{marketTrendsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketTrends.map((coin: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-700">
                  <span className="text-sm font-medium dark:text-white">{coin.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold dark:text-white">{coin.price}</span>
                    <span className={\`text-xs font-medium flex items-center gap-1 min-w-[70px] \${
                      coin.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }\`}>
                      {coin.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {coin.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{recentTransactionsCryptoTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cryptoTransactions.map((tx: any, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={\`h-2 w-2 rounded-full bg-\${tx.color}-600\`} />
                    <span className="font-medium dark:text-white">{tx.type}</span>
                    <span className="text-gray-500 dark:text-gray-400">{tx.amount} {tx.coin}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{tx.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{portfolioDistributionTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolioDistribution.map((item: any, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="dark:text-white">{item.asset}</span>
                    <span className="font-semibold dark:text-white">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={\`bg-\${item.color}-600 h-2 rounded-full\`}
                      style={{ width: \`\${item.percentage}%\` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{quickActionsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                {buyCryptoButton}
              </button>
              <button className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                {sellCryptoButton}
              </button>
              <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                {transferButton}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CryptoDashboard;
    `,

    customerService: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Headset, MessageSquare, CheckCircle, Clock, Star, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  onCardClick?: (cardId: string) => void;
  onViewDetails?: (itemId: string) => void;
  onExportData?: () => void;
  onRefresh?: (data?: any) => void;
  onDateChange?: (range: any) => void;
  onFilterChange?: (filters: any) => void;
  onWidgetClick?: (data?: any) => void;
}

const CustomerServiceDashboard: React.FC<DashboardProps> = ({ ${dataName}: propData, entity = '${dataSource || 'dashboard'}', className }) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response[0] : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const sourceData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }
  
  const customerServiceStats = ${getField('customerServiceStats')};
  const recentTickets = ${getField('recentTickets')};
  const ticketCategories = ${getField('ticketCategories')};
  const agentPerformance = ${getField('agentPerformance')};
  const responseMetrics = ${getField('responseMetrics')};
  const customerFeedback = ${getField('customerFeedback')};
  
  const recentTicketsTitle = ${getField('recentTicketsTitle')};
  const ticketCategoriesTitle = ${getField('ticketCategoriesTitle')};
  const agentPerformanceTitle = ${getField('agentPerformanceTitle')};
  const responseMetricsTitle = ${getField('responseMetricsTitle')};
  const customerFeedbackTitle = ${getField('customerFeedbackTitle')};
  
  const ticketsLabel = ${getField('ticketsLabel')};
  const avgResponseTimeLabel = ${getField('avgResponseTimeLabel')};
  const firstResponseLabel = ${getField('firstResponseLabel')};
  const resolutionTimeLabel = ${getField('resolutionTimeLabel')};
  const slaComplianceLabel = ${getField('slaComplianceLabel')};
  const overallSatisfactionLabel = ${getField('overallSatisfactionLabel')};
  const averageRatingLabel = ${getField('averageRatingLabel')};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{customerServiceStats.openTicketsLabel}</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{customerServiceStats.openTickets}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{customerServiceStats.openTicketsDescription}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{customerServiceStats.resolvedLabel}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{customerServiceStats.resolvedToday}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{customerServiceStats.resolvedChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{customerServiceStats.responseTimeLabel}</CardTitle>
            <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{customerServiceStats.avgResponseTime}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{customerServiceStats.responseTimeImprovement}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{customerServiceStats.satisfactionLabel}</CardTitle>
            <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{customerServiceStats.satisfactionScore}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{customerServiceStats.satisfactionChange}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{recentTicketsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket: any, index: number) => (
                <div key={index} className="p-3 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{ticket.id}</span>
                      <span className={\`text-xs px-2 py-1 rounded-full \${
                        ticket.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }\`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <span className={\`text-xs px-2 py-1 rounded-full \${
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      ticket.status === 'in-progress' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }\`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-1 dark:text-white">{ticket.customer}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{ticket.issue}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{ticket.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{ticketCategoriesTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticketCategories.map((item: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-white">{item.category}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold dark:text-white">{item.count}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={\`bg-\${item.color}-600 h-2 rounded-full\`}
                      style={{ width: \`\${item.percentage}%\` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{agentPerformanceTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentPerformance.map((agent: any, index: number) => (
                <div key={index} className="flex items-center justify-between pb-3 border-b last:border-0 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                        {agent.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className={\`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 \${
                        agent.status === 'online' ? 'bg-green-500' :
                        agent.status === 'busy' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }\`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium dark:text-white">{agent.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">{agent.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold dark:text-white">{agent.tickets}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ticketsLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{responseMetricsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center pb-4 border-b dark:border-gray-700">
                <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{responseMetrics.avgResponseTime}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{avgResponseTimeLabel}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold dark:text-white">{responseMetrics.firstResponse}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{firstResponseLabel}</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold dark:text-white">{responseMetrics.resolutionTime}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{resolutionTimeLabel}</p>
                </div>
              </div>
              <div className="pt-4 border-t dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm dark:text-white">{slaComplianceLabel}</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">{responseMetrics.slaCompliance}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 dark:bg-green-500 h-2 rounded-full" style={{ width: \`\${responseMetrics.slaCompliance}%\` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{customerFeedbackTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm dark:text-white">{overallSatisfactionLabel}</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <div className="text-center py-3 border-y dark:border-gray-700">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{customerFeedback.overallRating}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{averageRatingLabel}</p>
              </div>
              <div className="space-y-2">
                {customerFeedback.ratings.map((rating: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs w-8 dark:text-gray-400">{rating.stars}★</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-yellow-500 h-1.5 rounded-full"
                        style={{ width: \`\${rating.percentage}%\` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">{rating.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerServiceDashboard;
    `,

    ecommerce: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Package, TrendingUp, Users, Star, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  onCardClick?: (cardId: string) => void;
  onViewDetails?: (itemId: string) => void;
  onExportData?: () => void;
  onRefresh?: (data?: any) => void;
  onDateChange?: (range: any) => void;
  onFilterChange?: (filters: any) => void;
  onWidgetClick?: (data?: any) => void;
}

const EcommerceDashboard: React.FC<DashboardProps> = ({ ${dataName}: propData, entity = '${dataSource || 'dashboard'}', className }) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response[0] : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const sourceData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }
  
  const ecommerceStats = ${getField('ecommerceStats')};
  const topProducts = ${getField('topProducts')};
  const recentOrders = ${getField('recentOrders')};
  const lowStockItems = ${getField('lowStockItems')};
  const customerReviews = ${getField('customerReviews')};
  const shippingStatus = ${getField('shippingStatus')};
  
  const topSellingProductsTitle = ${getField('topSellingProductsTitle')};
  const recentOrdersTitle = ${getField('recentOrdersTitle')};
  const lowStockAlertTitle = ${getField('lowStockAlertTitle')};
  const customerReviewsTitle = ${getField('customerReviewsTitle')};
  const shippingStatusTitle = ${getField('shippingStatusTitle')};
  
  const unitsLabel = ${getField('unitsLabel')};
  const leftLabel = ${getField('leftLabel')};
  const averageRatingLabel = ${getField('averageRatingLabel')};
  const totalReviewsLabel = ${getField('totalReviewsLabel')};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{ecommerceStats.totalSalesLabel}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{ecommerceStats.totalSales}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{ecommerceStats.totalSalesChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{ecommerceStats.ordersLabel}</CardTitle>
            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{ecommerceStats.orders}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{ecommerceStats.ordersChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{ecommerceStats.customersLabel}</CardTitle>
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{ecommerceStats.customers}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{ecommerceStats.customersChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{ecommerceStats.conversionLabel}</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{ecommerceStats.conversionRate}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{ecommerceStats.conversionChange}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{topSellingProductsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium dark:text-white">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.sales} {unitsLabel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold dark:text-white">{product.revenue}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{product.trend}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{recentOrdersTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-medium dark:text-white">{order.id}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold dark:text-white">{order.amount}</p>
                    <span className={\`text-xs px-2 py-1 rounded-full \${
                      order.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }\`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{lowStockAlertTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockItems.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm dark:text-white">{item.product}</span>
                  </div>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">{item.stock} {leftLabel}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{customerReviewsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm dark:text-white">{averageRatingLabel}</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm font-semibold ml-1 dark:text-white">{customerReviews.averageRating}</span>
                </div>
              </div>
              <div className="text-2xl font-bold dark:text-white">{customerReviews.totalReviews}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{totalReviewsLabel}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{shippingStatusTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shippingStatus.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={\`h-2 w-2 rounded-full bg-\${item.color}-600\`} />
                    <span className="text-sm dark:text-white">{item.status}</span>
                  </div>
                  <span className="text-sm font-semibold dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EcommerceDashboard;
    `,

    marketing: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, MousePointer, Mail, BarChart3, Target, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  onCardClick?: (cardId: string) => void;
  onViewDetails?: (itemId: string) => void;
  onExportData?: () => void;
  onRefresh?: (data?: any) => void;
  onDateChange?: (range: any) => void;
  onFilterChange?: (filters: any) => void;
  onWidgetClick?: (data?: any) => void;
}

const MarketingDashboard: React.FC<DashboardProps> = ({ ${dataName}: propData, entity = '${dataSource || 'dashboard'}', className }) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response[0] : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const sourceData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }
  
  const marketingStats = ${getField('marketingStats')};
  const activeCampaigns = ${getField('activeCampaigns')};
  const trafficSources = ${getField('trafficSources')};
  const topContent = ${getField('topContent')};
  const socialMedia = ${getField('socialMedia')};
  const leadGeneration = ${getField('leadGeneration')};
  
  const activeCampaignsTitle = ${getField('activeCampaignsTitle')};
  const trafficSourcesTitle = ${getField('trafficSourcesTitle')};
  const topPerformingContentTitle = ${getField('topPerformingContentTitle')};
  const socialMediaMetricsTitle = ${getField('socialMediaMetricsTitle')};
  const leadGenerationTitle = ${getField('leadGenerationTitle')};
  
  const clicksLabel = ${getField('clicksLabel')};
  const conversionsLabel = ${getField('conversionsLabel')};
  const budgetLabel = ${getField('budgetLabel')};
  const viewsLabel = ${getField('viewsLabel')};
  const engagementLabel = ${getField('engagementLabel')};
  const newLeadsLabel = ${getField('newLeadsLabel')};
  const qualifiedLabel = ${getField('qualifiedLabel')};
  const convertedLabel = ${getField('convertedLabel')};
  const viewAllLeadsButton = ${getField('viewAllLeadsButton')};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{marketingStats.visitorsLabel}</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{marketingStats.websiteVisitors}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{marketingStats.visitorsChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{marketingStats.conversionLabel}</CardTitle>
            <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{marketingStats.conversionRate}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{marketingStats.conversionChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{marketingStats.ctrLabel}</CardTitle>
            <MousePointer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{marketingStats.clickThroughRate}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{marketingStats.ctrChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{marketingStats.emailLabel}</CardTitle>
            <Mail className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{marketingStats.emailOpenRate}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{marketingStats.emailChange}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{activeCampaignsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.map((campaign: any, index: number) => (
                <div key={index} className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm dark:text-white">{campaign.name}</h4>
                    <span className={\`text-xs px-2 py-1 rounded-full \${
                      campaign.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }\`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div>
                      <p className="text-gray-500 dark:text-gray-500">{clicksLabel}</p>
                      <p className="font-semibold dark:text-white">{campaign.clicks.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-500">{conversionsLabel}</p>
                      <p className="font-semibold dark:text-white">{campaign.conversions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-500">{budgetLabel}</p>
                      <p className="font-semibold dark:text-white">{campaign.budget}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{trafficSourcesTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trafficSources.map((source: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium dark:text-white">{source.source}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold dark:text-white">{source.visitors.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({source.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={\`bg-\${source.color}-600 h-2 rounded-full\`}
                      style={{ width: \`\${source.percentage}%\` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{topPerformingContentTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topContent.map((content: any, index: number) => (
                <div key={index} className="pb-3 border-b last:border-0 dark:border-gray-700">
                  <p className="text-sm font-medium mb-1 dark:text-white">{content.title}</p>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{content.views.toLocaleString()} {viewsLabel}</span>
                    <span className="text-green-600 dark:text-green-400">{content.engagement} {engagementLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{socialMediaMetricsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {socialMedia.map((social: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium dark:text-white">{social.platform}</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold dark:text-white">{social.followers}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{social.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{leadGenerationTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{leadGeneration.newLeads}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{newLeadsLabel}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                <div className="text-center">
                  <div className="text-xl font-bold dark:text-white">{leadGeneration.qualified}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{qualifiedLabel}</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold dark:text-white">{leadGeneration.converted}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{convertedLabel}</p>
                </div>
              </div>
              <button className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                {viewAllLeadsButton}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketingDashboard;
    `,

    projectManagement: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, CheckCircle2, Clock, Users, AlertCircle, Calendar, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  onCardClick?: (cardId: string) => void;
  onViewDetails?: (itemId: string) => void;
  onExportData?: () => void;
  onRefresh?: (data?: any) => void;
  onDateChange?: (range: any) => void;
  onFilterChange?: (filters: any) => void;
  onWidgetClick?: (data?: any) => void;
}

const ProjectManagementDashboard: React.FC<DashboardProps> = ({ ${dataName}: propData, entity = '${dataSource || 'dashboard'}', className }) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response[0] : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const sourceData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }
  
  const projectStats = ${getField('projectStats')};
  const activeProjects = ${getField('activeProjects')};
  const upcomingDeadlines = ${getField('upcomingDeadlines')};
  const teamActivity = ${getField('teamActivity')};
  const taskPriority = ${getField('taskPriority')};
  const timeTracking = ${getField('timeTracking')};
  
  const activeProjectsTitle = ${getField('activeProjectsTitle')};
  const upcomingDeadlinesTitle = ${getField('upcomingDeadlinesTitle')};
  const teamActivityTitle = ${getField('teamActivityTitle')};
  const taskPriorityTitle = ${getField('taskPriorityTitle')};
  const timeTrackingTitle = ${getField('timeTrackingTitle')};
  
  const tasksCompletedLabel = ${getField('tasksCompletedLabel')};
  const dueLabel = ${getField('dueLabel')};
  const onTrackLabel = ${getField('onTrackLabel')};
  const atRiskLabel = ${getField('atRiskLabel')};
  const priorityLabel = ${getField('priorityLabel')};
  const thisWeekLabel = ${getField('thisWeekLabel')};
  const todayLabel = ${getField('todayLabel')};
  const thisMonthLabel = ${getField('thisMonthLabel')};
  const viewAllTasksButton = ${getField('viewAllTasksButton')};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{projectStats.projectsLabel}</CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{projectStats.totalProjects}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{projectStats.projectsDescription}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{projectStats.tasksLabel}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{projectStats.tasksCompleted}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{projectStats.tasksChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{projectStats.teamLabel}</CardTitle>
            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{projectStats.teamMembers}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{projectStats.teamDescription}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{projectStats.overdueLabel}</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{projectStats.overdueTasks}</div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{projectStats.overdueWarning}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{activeProjectsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.map((project: any, index: number) => (
                <div key={index} className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm dark:text-white">{project.name}</h4>
                    <span className={\`text-xs px-2 py-1 rounded-full \${
                      project.status === 'on-track' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }\`}>
                      {project.status === 'on-track' ? onTrackLabel : atRiskLabel}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>{project.completed}/{project.tasks} {tasksCompletedLabel}</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={\`\${project.status === 'on-track' ? 'bg-green-600 dark:bg-green-500' : 'bg-orange-600 dark:bg-orange-500'} h-2 rounded-full\`}
                        style={{ width: \`\${project.progress}%\` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>{dueLabel}: {project.due}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{upcomingDeadlinesTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0 dark:border-gray-700">
                  <div className={\`h-2 w-2 rounded-full mt-2 \${
                    item.priority === 'high' ? 'bg-red-600' :
                    item.priority === 'medium' ? 'bg-orange-600' :
                    'bg-blue-600'
                  }\`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium dark:text-white">{item.task}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.project}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 dark:text-gray-400">{item.due}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{teamActivityTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-teal-500 to-green-500 flex items-center justify-center text-white font-semibold text-sm">
                    {activity.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium dark:text-white">{activity.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{taskPriorityTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {taskPriority.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={\`h-3 w-3 rounded-full bg-\${item.color}-600\`} />
                    <span className="text-sm font-medium dark:text-white">{item.priority} {priorityLabel}</span>
                  </div>
                  <span className="text-sm font-semibold dark:text-white">{item.count}</span>
                </div>
              ))}
              <div className="pt-4 border-t dark:border-gray-700">
                <button className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  {viewAllTasksButton}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{timeTrackingTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">{timeTracking.thisWeek}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{thisWeekLabel}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-700">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-lg font-bold dark:text-white">{timeTracking.today}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{todayLabel}</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold dark:text-white">{timeTracking.thisMonth}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{thisMonthLabel}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectManagementDashboard;
    `,

    saas: `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Activity, TrendingUp, UserPlus, CreditCard, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DashboardProps {
  ${dataName}?: any;
  className?: string;
  entity?: string;
  onCardClick?: (cardId: string) => void;
  onViewDetails?: (itemId: string) => void;
  onExportData?: () => void;
  onRefresh?: (data?: any) => void;
  onDateChange?: (range: any) => void;
  onFilterChange?: (filters: any) => void;
  onWidgetClick?: (data?: any) => void;
}

const SaasDashboard: React.FC<DashboardProps> = ({ ${dataName}: propData, entity = '${dataSource || 'dashboard'}', className }) => {
  // Fetch data from API if no props data provided
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: [entity],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${apiRoute}');
        return Array.isArray(response) ? response[0] : (response?.data || response);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        return {};
      }
    },
    enabled: !propData,
    retry: 1,
  });

  const sourceData = propData || fetchedData || {};

  // Loading state
  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }
  
  const saasStats = ${getField('saasStats')};
  const userActivity = ${getField('userActivity')};
  const subscriptionPlans = ${getField('subscriptionPlans')};
  
  const recentUserActivityTitle = ${getField('recentUserActivityTitle')};
  const subscriptionPlansTitle = ${getField('subscriptionPlansTitle')};
  const quickActionsTitle = ${getField('quickActionsTitle')};
  
  const addUserButton = ${getField('addUserButton')};
  const viewAnalyticsButton = ${getField('viewAnalyticsButton')};
  const billingButton = ${getField('billingButton')};
  const reportsButton = ${getField('reportsButton')};
  const usersLabel = ${getField('usersLabel')};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{saasStats.usersLabel}</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{saasStats.totalUsers}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{saasStats.usersChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{saasStats.revenueLabel}</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{saasStats.monthlyRevenue}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{saasStats.revenueChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{saasStats.subscriptionsLabel}</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{saasStats.activeSubscriptions}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">{saasStats.subscriptionsChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{saasStats.churnLabel}</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{saasStats.churnRate}</div>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{saasStats.churnChange}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{recentUserActivityTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className={\`h-2 w-2 rounded-full bg-\${activity.color}-600\`} />
                    <div>
                      <p className="text-sm font-medium dark:text-white">{activity.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activity.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{subscriptionPlansTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptionPlans.map((plan: any, index: number) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium dark:text-white">{plan.plan}</span>
                    <span className="text-gray-600 dark:text-gray-400">{plan.users} {usersLabel} ({plan.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={\`bg-\${plan.color}-600 h-2 rounded-full\`}
                      style={{ width: \`\${plan.percentage}%\` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{quickActionsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
              <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium dark:text-white">{addUserButton}</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all">
              <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium dark:text-white">{viewAnalyticsButton}</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
              <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium dark:text-white">{billingButton}</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium dark:text-white">{reportsButton}</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SaasDashboard;
    `,
  };

  return variants[variant] || variants.bank;
};
