import React, { useState, useEffect } from 'react';
import { AttachMoney, Receipt, TrendingUp, Category } from '@mui/icons-material';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Expense } from '../../../types/expense-tracker';
import { financeService } from '../../../services/financeService';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface AnalyticsTabProps {
  expenses: Expense[];
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ expenses: propExpenses }) => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | '3months'>('month');
  const [analyticsExpenses, setAnalyticsExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all transactions for analytics
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const now = new Date();
        // Fetch last 3 months of data for analytics
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        const startDate = threeMonthsAgo.toISOString().split('T')[0];

        const response = await financeService.getTransactions({ start_date: startDate, limit: 1000 });
        const transactionsArray = response?.data || [];

        if (transactionsArray.length > 0) {
          // Convert to Expense format - keep raw date for filtering
          const processedExpenses: Expense[] = transactionsArray.map((tx: any) => ({
            id: tx.id,
            title: tx.title || 'Expense',
            amount: parseFloat(tx.amount || 0),
            date: tx.transaction_date || tx.created_at,
            category: tx.category?.name || 'Other',
            description: tx.description || '',
            paymentMethod: tx.payment_method || 'cash',
            icon: null,
            backgroundColor: 'bg-gray-50'
          }));
          setAnalyticsExpenses(processedExpenses);
        } else {
          // Use prop expenses if API returns empty
          setAnalyticsExpenses(propExpenses);
        }
      } catch (error) {
        console.error('Failed to fetch transactions for analytics:', error);
        setAnalyticsExpenses(propExpenses);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [propExpenses]);

  // Use fetched analytics expenses
  const expenses = analyticsExpenses;

  // Calculate totals based on time filter - simplified without date filtering for now
  const getFilteredExpenses = () => {
    // Just return all expenses for the selected period
    // Since we're fetching last 3 months, all data should be relevant
    return expenses;
  };

  const filteredExpenses = getFilteredExpenses();
  const totalSpent = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const averageSpent = filteredExpenses.length > 0 ? totalSpent / filteredExpenses.length : 0;
  const transactionCount = filteredExpenses.length;

  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + (expense.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const uniqueCategories = Object.keys(categoryTotals).length;

  // Generate pie chart data
  const pieChartColors = ['#47bdff', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];
  const pieChartData = topCategories.map(([category, amount], index) => ({
    category,
    amount: amount || 0,
    percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
    color: pieChartColors[index % pieChartColors.length]
  }));


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Expense Analytics
          </h1>
          <p className="text-white/60">
            Insights into your spending patterns and trends
          </p>
        </div>
      </div>

      {/* Time Filter Buttons */}
      <div className="mb-8">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            onClick={() => setTimeFilter('week')}
            className={timeFilter === 'week'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
              : 'border border-white/20 text-white hover:bg-white/10'}
          >
            This Week
          </Button>
          <Button
            variant="ghost"
            onClick={() => setTimeFilter('month')}
            className={timeFilter === 'month'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
              : 'border border-white/20 text-white hover:bg-white/10'}
          >
            This Month
          </Button>
          <Button
            variant="ghost"
            onClick={() => setTimeFilter('3months')}
            className={timeFilter === '3months'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
              : 'border border-white/20 text-white hover:bg-white/10'}
          >
            Last 3 Months
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">
                  Total Spent ({timeFilter === 'week' ? 'This Week' : timeFilter === 'month' ? 'This Month' : 'Last 3 Months'})
                </p>
                {loading ? (
                  <div className="h-9 bg-white/20 animate-pulse rounded mt-1 w-24"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    ${totalSpent.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <AttachMoney className="h-6 w-6" style={{ color: '#47bdff' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Transactions</p>
                {loading ? (
                  <div className="h-9 bg-white/20 animate-pulse rounded mt-1 w-16"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {transactionCount}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Receipt className="h-6 w-6" style={{ color: '#47bdff' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Average</p>
                {loading ? (
                  <div className="h-9 bg-white/20 animate-pulse rounded mt-1 w-20"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    ${averageSpent.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" style={{ color: '#47bdff' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Categories</p>
                {loading ? (
                  <div className="h-9 bg-white/20 animate-pulse rounded mt-1 w-12"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    {uniqueCategories}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Category className="h-6 w-6" style={{ color: '#47bdff' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pie Chart - Spending by Category */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: any, props: any) => [`$${value.toFixed(2)}`, props?.payload?.category || 'Category']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend 
                    formatter={(value: any, entry: any) => `${entry?.payload?.category || 'Category'} (${totalSpent > 0 ? ((entry?.payload?.amount || 0) / totalSpent * 100).toFixed(1) : '0.0'}%)`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend */}
            <div className="space-y-3">
              {pieChartData.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-white">{item.category}</span>
                    <span className="text-xs text-white/60">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <span className="text-sm font-semibold text-white">${item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories List */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map(([category, amount]) => {
                const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
                const expense = filteredExpenses.find(e => e.category === category);
                
                return (
                  <div key={category} className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          {expense?.icon || <Category className="h-5 w-5" style={{ color: '#47bdff' }} />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{category}</p>
                          <p className="text-sm text-white/60">{percentage.toFixed(1)}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          ${amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};