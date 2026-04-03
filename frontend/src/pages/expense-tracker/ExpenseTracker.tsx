import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ConfirmationModal } from '../../components/ui/confirmation-modal';
import { useConfirmation } from '../../hooks/useConfirmation';
import { 
  LocalCafe,
  ShoppingCart,
  DirectionsCar,
  Movie,
  Phone,
  Home,
  LocalHospital,
  Category,
} from '@mui/icons-material';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { useExpenses, useDeleteExpense } from '../../hooks/useServices';
import { financeService } from '../../services/financeService';
import { ExpenseTrackerLayout } from '../../layouts/expense-tracker/ExpenseTrackerLayout';
import { DashboardTab } from '../../components/expense-tracker/dashboard/DashboardTab';
import { ExpensesTab } from '../../components/expense-tracker/expenses/ExpensesTab';
import { AnalyticsTab } from '../../components/expense-tracker/analytics/AnalyticsTab';
import { BudgetTab } from '../../components/expense-tracker/budget/BudgetTab';
import { Expense, TabType } from '../../types/expense-tracker';

const ExpenseTracker: React.FC = () => {
  const navigate = useNavigate();
  const { loading } = useRequireAuth();
  const confirmation = useConfirmation();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category' | 'title'>('date');
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // Fetch real data from backend with stable params
  const expenseParams = useMemo(() => ({}), []);
  const { data: expensesResponse, loading: expensesLoading, refetch: refetchExpenses } = useExpenses(expenseParams);
  const deleteExpenseMutation = useDeleteExpense();

  // Map backend data to frontend format (memoized to prevent infinite re-renders)
  const expenses: Expense[] = useMemo(() => {
    const expensesArray = expensesResponse?.data || [];
    return expensesArray.map((expense: any) => {
      // Map category to icon and background color
      const getCategoryIcon = (category: string) => {
        const categoryLower = category.toLowerCase();
        if (categoryLower.includes('food') || categoryLower.includes('drink')) {
          return { icon: <LocalCafe className="h-5 w-5 text-primary" />, backgroundColor: 'bg-orange-50' };
        } else if (categoryLower.includes('shop') || categoryLower.includes('grocery')) {
          return { icon: <ShoppingCart className="h-5 w-5 text-primary" />, backgroundColor: 'bg-green-50' };
        } else if (categoryLower.includes('transport') || categoryLower.includes('travel')) {
          return { icon: <DirectionsCar className="h-5 w-5 text-primary" />, backgroundColor: 'bg-blue-50' };
        } else if (categoryLower.includes('entertainment') || categoryLower.includes('movie')) {
          return { icon: <Movie className="h-5 w-5 text-primary" />, backgroundColor: 'bg-purple-50' };
        } else if (categoryLower.includes('util') || categoryLower.includes('bill')) {
          return { icon: <Phone className="h-5 w-5 text-primary" />, backgroundColor: 'bg-yellow-50' };
        } else if (categoryLower.includes('health') || categoryLower.includes('medical')) {
          return { icon: <LocalHospital className="h-5 w-5 text-primary" />, backgroundColor: 'bg-red-50' };
        } else if (categoryLower.includes('home') || categoryLower.includes('rent')) {
          return { icon: <Home className="h-5 w-5 text-primary" />, backgroundColor: 'bg-indigo-50' };
        } else {
          return { icon: <Category className="h-5 w-5 text-primary" />, backgroundColor: 'bg-gray-50' };
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
  }, [expensesResponse?.data]);

  // Filter and search logic (memoized to prevent infinite re-renders)
  const filteredAndSortedExpenses = useMemo(() => {
    return expenses
      .filter(expense => {
        const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            expense.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'amount':
            return b.amount - a.amount; // High to low
          case 'category':
            return a.category.localeCompare(b.category);
          case 'date':
          default:
            return new Date(b.date).getTime() - new Date(a.date).getTime(); // Newest first
        }
      });
  }, [expenses, searchQuery, filterCategory, sortBy]);

  // Get all unique categories (memoized to prevent re-renders)
  const allCategories = useMemo(() => {
    return Array.from(new Set(expenses.map(expense => expense.category)));
  }, [expenses]);

  // Calculate totals
  const monthlyBudget = 2000; // This would come from API in real app

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleAddExpense = () => {
    navigate('/add-expense');
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      setDeletingExpenseId(expenseId);
      await financeService.deleteTransaction(expenseId);

      // Refetch expenses to update the UI
      await refetchExpenses();
      toast.success('Expense deleted successfully');
    } catch (error) {
      toast.error('Failed to delete expense. Please try again.');
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleEditExpense = (expenseId: string) => {
    navigate(`/add-expense?edit=${expenseId}`);
  };

  // Export expenses to CSV
  const exportExpensesToCSV = () => {
    const headers = ['Title', 'Amount', 'Category', 'Date', 'Description', 'Payment Method'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedExpenses.map(expense => [
        `"${expense.title}"`,
        expense.amount.toFixed(2),
        `"${expense.category}"`,
        `"${expense.date}"`,
        `"${expense.description || ''}"`,
        `"${expense.paymentMethod}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Expenses exported to CSV successfully!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab 
            expenses={expenses} 
            monthlyBudget={monthlyBudget} 
            setActiveTab={setActiveTab} 
          />
        );
      case 'expenses':
        return (
          <ExpensesTab
            filteredAndSortedExpenses={filteredAndSortedExpenses}
            expenses={expenses}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            allCategories={allCategories}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            exportExpensesToCSV={exportExpensesToCSV}
            deletingExpenseId={deletingExpenseId}
            loading={expensesLoading}
          />
        );
      case 'analytics':
        return <AnalyticsTab expenses={expenses} />;
      case 'budget':
        return <BudgetTab expenses={expenses} monthlyBudget={monthlyBudget} />;
      default:
        return null;
    }
  };

  return (
    <>
      <ExpenseTrackerLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddExpense={handleAddExpense}
      >
        {renderTabContent()}
      </ExpenseTrackerLayout>

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        variant={confirmation.variant}
        icon={confirmation.icon}
      />
    </>
  );
};

export default ExpenseTracker;