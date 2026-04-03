import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  // RechartsTooltipProps,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
  Activity
} from 'lucide-react';
import type { TransactionAnalytics } from '../../services/financeService';

interface FinancialAnalyticsProps {
  analytics: TransactionAnalytics | null;
  isLoading?: boolean;
  onPeriodChange?: (period: 'week' | 'month' | 'quarter' | 'year') => void;
  selectedPeriod?: string;
}

const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({
  analytics,
  isLoading = false,
  onPeriodChange,
  selectedPeriod = 'month'
}) => {
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');

  const chartColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4'
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Use actual trend data from analytics API when available
  // TODO: Replace with real daily/weekly trend data from API endpoint
  const trendData = analytics?.trendData || [];

  // Prepare expense category data for charts
  const expenseCategoryData = analytics?.expensesByCategory.map((category, index) => ({
    ...category,
    color: chartColors[index % chartColors.length],
    percentage: analytics.totalExpenses > 0 ? (category.amount / analytics.totalExpenses) * 100 : 0
  })) || [];

  // Prepare income source data
  const incomeSourceData = analytics?.incomeBySource.map((source, index) => ({
    ...source,
    color: chartColors[index % chartColors.length],
    percentage: analytics.totalIncome > 0 ? (source.amount / analytics.totalIncome) * 100 : 0
  })) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-xl animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="w-20 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="w-32 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="rounded-xl animate-pulse">
              <CardContent className="p-6">
                <div className="w-full h-80 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="rounded-xl p-12 text-center">
        <Activity className="h-16 w-16 mx-auto mb-4 text-white/40" />
        <h3 className="text-xl font-semibold mb-2 text-white">No Analytics Data</h3>
        <p className="text-white/60">
          Add some transactions to see your financial analytics
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Financial Analytics</h2>
          <p className="text-white/60">
            Insights into your spending patterns and trends
          </p>
        </div>
        
        {onPeriodChange && (
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={(value) => onPeriodChange(value as 'week' | 'month' | 'quarter' | 'year')}>
              <SelectTrigger className="w-32 h-10 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Total Income</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(analytics.totalIncome)}
                </p>
                <p className="text-xs text-white/60 mt-1 flex items-center">
                  {analytics.trends.incomeGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1 text-red-400" />
                  )}
                  {formatPercent(analytics.trends.incomeGrowth)} from last period
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Total Expenses</p>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(analytics.totalExpenses)}
                </p>
                <p className="text-xs text-white/60 mt-1 flex items-center">
                  {analytics.trends.expenseGrowth >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1 text-red-400" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1 text-green-400" />
                  )}
                  {formatPercent(analytics.trends.expenseGrowth)} from last period
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Net Flow</p>
                <p className={`text-2xl font-bold ${analytics.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(analytics.netFlow)}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Income - Expenses
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                analytics.netFlow >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <DollarSign className={`h-6 w-6 ${analytics.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Savings Rate</p>
                <p className={`text-2xl font-bold ${analytics.trends.savingsRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {analytics.trends.savingsRate.toFixed(1)}%
                </p>
                <p className="text-xs text-white/60 mt-1">
                  Of total income
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Chart */}
        <Card className="rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expenses by Category</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={chartType === 'pie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                  className="h-8 w-8 p-0"
                >
                  <PieChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className="h-8 w-8 p-0"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {expenseCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                    />
                    <Legend 
                      formatter={(value, entry: any) => 
                        `${value} (${entry.payload?.percentage.toFixed(1)}%)`
                      }
                    />
                  </PieChart>
                ) : (
                  <BarChart data={expenseCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Category List */}
            <div className="mt-4 space-y-2">
              {expenseCategoryData.slice(0, 5).map((category) => (
                <div key={category.category} className="flex items-center justify-between p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-white">{category.category}</span>
                    <span className="text-xs text-white/60">({category.count} transactions)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{formatCurrency(category.amount)}</div>
                    <div className="text-xs text-white/60">{category.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Income Sources */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Income by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {incomeSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  />
                  <Legend 
                    formatter={(value, entry: any) => 
                      `${value} (${entry.payload?.percentage.toFixed(1)}%)`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Income Sources List */}
            <div className="mt-4 space-y-2">
              {incomeSourceData.map((source) => (
                <div key={source.source} className="flex items-center justify-between p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="text-sm font-medium text-white">{source.source}</span>
                    <span className="text-xs text-white/60">({source.count} transactions)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{formatCurrency(source.amount)}</div>
                    <div className="text-xs text-white/60">{source.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Income vs Expenses Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net Flow'
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  fillOpacity={1}
                  fill="url(#incomeGradient)"
                  name="Income"
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  fillOpacity={1}
                  fill="url(#expensesGradient)"
                  name="Expenses"
                />
                <Line 
                  type="monotone" 
                  dataKey="netFlow" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Net Flow"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Merchants */}
      {analytics.topMerchants.length > 0 && (
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Top Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topMerchants.map((merchant, index) => (
                <div key={merchant.name} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{merchant.name}</div>
                      <div className="text-sm text-white/60">{merchant.count} transactions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">{formatCurrency(merchant.amount)}</div>
                    <div className="text-sm text-white/60">
                      {analytics.totalExpenses > 0 ? ((merchant.amount / analytics.totalExpenses) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialAnalytics;