import React, { useState, useMemo } from 'react';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinancialSummary, useExpenses, useIncome, useBudgets, useTransactionAnalytics, useSpendingCategories } from '../../hooks/useServices';

const MoneyManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real data from API
  const { data: financialSummary, loading: summaryLoading } = useFinancialSummary();
  const { data: expensesData, loading: expensesLoading } = useExpenses({ limit: 10 });
  const { data: incomeData, loading: incomeLoading } = useIncome({ limit: 10 });
  const { data: budgetsData, loading: budgetsLoading } = useBudgets();
  const { data: analyticsData, loading: analyticsLoading } = useTransactionAnalytics('month');
  const { data: categoriesData, loading: categoriesLoading } = useSpendingCategories();

  const isLoading = summaryLoading || expensesLoading || incomeLoading || budgetsLoading || analyticsLoading || categoriesLoading;

  // Process expenses for display
  const expenses = useMemo(() => {
    if (!expensesData?.data) return [];
    return expensesData.data;
  }, [expensesData]);

  // Process income for display
  const income = useMemo(() => {
    if (!incomeData?.data) return [];
    return incomeData.data;
  }, [incomeData]);

  // Combine and sort recent transactions
  const recentTransactions = useMemo(() => {
    const expenseTransactions = expenses.map((e: any) => ({
      id: e.id,
      description: e.description || e.name || 'Expense',
      amount: -(e.amount || 0),
      date: e.date || e.createdAt,
      category: e.category || 'Other',
    }));

    const incomeTransactions = income.map((i: any) => ({
      id: i.id,
      description: i.description || i.source || 'Income',
      amount: i.amount || 0,
      date: i.date || i.createdAt,
      category: 'Income',
    }));

    return [...expenseTransactions, ...incomeTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [expenses, income]);

  // Process expense categories for pie chart
  const expenseCategories = useMemo(() => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280', '#EC4899', '#14B8A6'];

    if (categoriesData?.data && Array.isArray(categoriesData.data)) {
      return categoriesData.data.map((cat: any, index: number) => ({
        name: cat.name || cat.category || 'Unknown',
        value: cat.total || cat.amount || 0,
        color: colors[index % colors.length],
      }));
    }

    // Fallback: aggregate from expenses
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e: any) => {
      const cat = e.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + (e.amount || 0);
    });

    return Object.entries(categoryTotals).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }));
  }, [categoriesData, expenses]);

  // Process monthly data for charts
  const monthlyData = useMemo(() => {
    if (analyticsData?.data?.monthly && Array.isArray(analyticsData.data.monthly)) {
      return analyticsData.data.monthly.map((m: any) => ({
        month: m.month || m.period || '',
        income: m.income || 0,
        expenses: m.expenses || 0,
        savings: (m.income || 0) - (m.expenses || 0),
      }));
    }
    return [];
  }, [analyticsData]);

  // Process savings goals from budgets
  const savingsGoals = useMemo(() => {
    if (!budgetsData?.data) return [];
    return budgetsData.data
      .filter((b: any) => b.type === 'savings' || b.category === 'savings')
      .map((b: any) => ({
        name: b.name || b.category || 'Savings Goal',
        target: b.targetAmount || b.limit || 0,
        current: b.currentAmount || b.spent || 0,
        percentage: b.targetAmount ? Math.round((b.currentAmount || 0) / b.targetAmount * 100) : 0,
      }));
  }, [budgetsData]);

  // Get summary values
  const summary = useMemo(() => {
    const data = financialSummary?.data || {};
    return {
      totalBalance: data.totalBalance || data.balance || 0,
      monthlyIncome: data.monthlyIncome || data.income || 0,
      monthlyExpenses: data.monthlyExpenses || data.expenses || 0,
      totalSavings: data.totalSavings || data.savings || 0,
      incomeChange: data.incomeChange || 0,
      expenseChange: data.expenseChange || 0,
      savingsChange: data.savingsChange || 0,
      balanceChange: data.balanceChange || 0,
    };
  }, [financialSummary]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Money Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your finances and reach your financial goals</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <WalletIcon className="h-8 w-8 text-emerald-500" />
              {summary.balanceChange !== 0 && (
                <span className={`text-sm ${summary.balanceChange > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {summary.balanceChange > 0 ? '+' : ''}{summary.balanceChange.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Balance</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalBalance)}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <ArrowUpIcon className="h-8 w-8 text-green-500" />
              {summary.incomeChange !== 0 && (
                <span className={`text-sm ${summary.incomeChange > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {summary.incomeChange > 0 ? '+' : ''}{summary.incomeChange.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.monthlyIncome)}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <ArrowDownIcon className="h-8 w-8 text-red-500" />
              {summary.expenseChange !== 0 && (
                <span className={`text-sm ${summary.expenseChange < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {summary.expenseChange > 0 ? '+' : ''}{summary.expenseChange.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Expenses</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.monthlyExpenses)}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <BanknotesIcon className="h-8 w-8 text-purple-500" />
              {summary.savingsChange !== 0 && (
                <span className={`text-sm ${summary.savingsChange > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-red-600 dark:text-red-400'}`}>
                  {summary.savingsChange > 0 ? '+' : ''}{summary.savingsChange.toFixed(1)}%
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Savings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalSavings)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {['overview', 'transactions', 'budgets', 'goals'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income vs Expenses Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expenses</h3>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />
                      <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                      <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2} name="Savings" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No monthly data available
                  </div>
                )}
              </div>

              {/* Expense Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
                {expenseCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    No expense data available
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
              {recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Description</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b dark:border-gray-700">
                          <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{transaction.description}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{transaction.category}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(transaction.date)}</td>
                          <td className={`py-3 px-4 text-sm font-medium text-right ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No transactions found
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Savings Goals</h3>
              {savingsGoals.length > 0 ? (
                <div className="space-y-6">
                  {savingsGoals.map((goal, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{goal.name}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{goal.percentage}% Complete</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No savings goals found. Create your first goal to start tracking!
                </div>
              )}
              <button className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Add New Goal
              </button>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Transactions</h3>
            {recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Description</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{transaction.description}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{transaction.category}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(transaction.date)}</td>
                        <td className={`py-3 px-4 text-sm font-medium text-right ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No transactions found
              </div>
            )}
          </div>
        )}

        {activeTab === 'budgets' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Overview</h3>
            {budgetsData?.data && budgetsData.data.length > 0 ? (
              <div className="space-y-4">
                {budgetsData.data.map((budget: any, index: number) => (
                  <div key={budget.id || index} className="p-4 border dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{budget.name || budget.category}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(budget.spent || 0)} / {formatCurrency(budget.limit || budget.amount || 0)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          ((budget.spent || 0) / (budget.limit || budget.amount || 1)) > 0.9
                            ? 'bg-red-500'
                            : ((budget.spent || 0) / (budget.limit || budget.amount || 1)) > 0.7
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(((budget.spent || 0) / (budget.limit || budget.amount || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No budgets found. Create your first budget to start tracking spending!
              </div>
            )}
            <button className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Create New Budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoneyManagement;
