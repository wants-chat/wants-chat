import React, { useState, useEffect } from 'react';
import { AttachMoney, AccountBalance, TrendingDown, TrendingUp, Receipt } from '@mui/icons-material';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Expense, TabType, BudgetApiResponse } from '../../../types/expense-tracker';
import { financeService } from '../../../services/financeService';
import { GlassCard, StatCard, ChartCard } from '../../ui/GlassCard';

interface DashboardTabProps {
  expenses: Expense[];
  monthlyBudget: number;
  setActiveTab: (tab: TabType) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ 
  expenses, 
  monthlyBudget, 
  setActiveTab 
}) => {
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<Expense[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetApiResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentMonthData = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;


        // Fetch current month transactions and budgets in parallel
        const [transactionsResponse, budgetsResponse] = await Promise.all([
          financeService.getTransactions({ start_date: startDate }),
          financeService.getCategoryBudgets({ month: currentMonth, year: currentYear })
        ]);


        // Process transactions similar to ExpenseTracker
        const expensesArray = transactionsResponse?.data || [];
        const processedExpenses: Expense[] = expensesArray.map((expense: any) => {
          // Map category to icon and background color (same logic as ExpenseTracker)
          const getCategoryIcon = (category: string) => {
            const categoryLower = category.toLowerCase();
            if (categoryLower.includes('food') || categoryLower.includes('drink')) {
              return { icon: <AttachMoney className="h-5 w-5 text-primary" />, backgroundColor: 'bg-orange-50' };
            } else if (categoryLower.includes('shop') || categoryLower.includes('grocery')) {
              return { icon: <AttachMoney className="h-5 w-5 text-primary" />, backgroundColor: 'bg-green-50' };
            } else {
              return { icon: <AttachMoney className="h-5 w-5 text-primary" />, backgroundColor: 'bg-gray-50' };
            }
          };

          const categoryStyle = getCategoryIcon(expense.category?.name || 'other');
          const formattedDate = new Date(expense.transaction_date || expense.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });
          
          return {
            id: expense.id,
            title: expense.title || 'Expense',
            amount: parseFloat(expense.amount),
            date: formattedDate,
            category: expense.category?.name || 'Other',
            description: expense.description || '',
            paymentMethod: (expense.payment_method || 'cash').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) as Expense['paymentMethod'],
            ...categoryStyle
          };
        });

        setCurrentMonthExpenses(processedExpenses);
        setBudgetData(budgetsResponse);
      } catch (error) {
        // Fallback to props data
        setCurrentMonthExpenses(expenses);
        setBudgetData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentMonthData();
  }, []);

  // Calculate totals from budget and expense data
  const totalBudgetAmount = budgetData.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpentFromBudgets = budgetData.reduce((sum, budget) => sum + budget.spent_amount, 0);
  const totalSpentFromTransactions = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  // Use transactions total as primary, budget spent as fallback
  const totalSpent = totalSpentFromTransactions > 0 ? totalSpentFromTransactions : totalSpentFromBudgets;
  // Only calculate remaining if there's a budget set
  const remaining = totalBudgetAmount > 0 ? totalBudgetAmount - totalSpent : 0;
  const hasBudget = totalBudgetAmount > 0;
  const recentExpenses = currentMonthExpenses.slice(0, 5); // Last 5 expenses
  
  // Category breakdown for dashboard - with category icons
  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = { amount: 0, icon: expense.icon, backgroundColor: expense.backgroundColor };
    }
    acc[expense.category].amount += expense.amount;
    return acc;
  }, {} as Record<string, { amount: number; icon: React.ReactNode; backgroundColor: string }>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard
          </h1>
          <p className="text-white/60">
            Overview of your expense tracking
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <GlassCard key={i} hover={false}>
                <div className="h-24 bg-white/5 animate-pulse rounded"></div>
              </GlassCard>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Spent (This Month)"
              value={`$${totalSpent.toFixed(2)}`}
              icon={<AttachMoney className="h-6 w-6" />}
              color="from-red-500 to-pink-500"
            />
            <StatCard
              title="Monthly Budget"
              value={hasBudget ? `$${totalBudgetAmount.toFixed(2)}` : 'No budget set'}
              icon={<AccountBalance className="h-6 w-6" />}
              color="from-teal-500 to-cyan-500"
            />
            <StatCard
              title={remaining >= 0 ? 'Remaining' : 'Over Budget'}
              value={`$${Math.abs(remaining).toFixed(2)}`}
              icon={remaining >= 0 ? <TrendingDown className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
              color={remaining >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-rose-500"}
              subtitle={hasBudget ? (remaining >= 0 ? 'Keep it up!' : 'Reduce expenses') : 'Set budget first'}
            />
            <StatCard
              title="Transactions (This Month)"
              value={currentMonthExpenses.length}
              icon={<Receipt className="h-6 w-6" />}
              color="from-teal-500 to-cyan-500"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <ChartCard
          title="Recent Expenses"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('expenses')}
              className="text-white hover:bg-white/10"
            >
              View All →
            </Button>
          }
        >
          <div className="space-y-4">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                    {expense.icon}
                  </div>
                  <div>
                    <p className="font-medium text-white">{expense.title}</p>
                    <p className="text-sm text-white/60">{expense.date}</p>
                  </div>
                </div>
                <p className="font-semibold text-white">${expense.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Top Categories */}
        <ChartCard
          title="Top Spending Categories"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('analytics')}
              className="text-white hover:bg-white/10"
            >
              View All →
            </Button>
          }
        >
          <div className="space-y-4">
            {topCategories.map(([category, data]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                    {data.icon}
                  </div>
                  <div>
                    <p className="font-medium text-white">{category}</p>
                    <p className="text-sm text-white/60">
                      {((data.amount / totalSpent) * 100).toFixed(1)}% of total spent
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-white">${data.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};