import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ConfirmationModal } from '../../ui/confirmation-modal';
import { useConfirmation } from '../../../hooks/useConfirmation';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  LocalCafe,
  ShoppingCart,
  DirectionsCar,
  Movie,
  Phone,
  Home,
  LocalGasStation,
  Restaurant,
  School,
  LocalHospital,
  Category,
  Add,
  FileDownload,
  Delete,
  MoreVert
} from '@mui/icons-material';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { Expense, CategoryBudget, FinanceCategory, CreateCategoryBudgetRequest, BudgetApiResponse } from '../../../types/expense-tracker';
import { financeService } from '../../../services/financeService';

interface BudgetTabProps {
  expenses: Expense[];
  monthlyBudget: number;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({ expenses, monthlyBudget }) => {
  const confirmation = useConfirmation();
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [rawBudgetData, setRawBudgetData] = useState<BudgetApiResponse[]>([]);
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({ categoryId: '', categoryName: '', amount: '' });
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [isCreatingBudget, setIsCreatingBudget] = useState(false);
  const [deletingBudgetId, setDeletingBudgetId] = useState<string | null>(null);

  // Calculate totals from budget API data
  const totalBudgetAmount = rawBudgetData.reduce((sum, budget) => sum + (budget.amount || 0), 0);
  const totalSpentFromBudgets = rawBudgetData.reduce((sum, budget) => sum + (budget.spent_amount || 0), 0);
  const totalRemaining = totalBudgetAmount - totalSpentFromBudgets;
  const budgetUsagePercentage = totalBudgetAmount > 0 ? (totalSpentFromBudgets / totalBudgetAmount) * 100 : 0;

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      'Food & Dining': <Restaurant className="h-5 w-5" />,
      'Food & Drink': <LocalCafe className="h-5 w-5" />,
      'Shopping': <ShoppingCart className="h-5 w-5" />,
      'Transportation': <DirectionsCar className="h-5 w-5" />,
      'Entertainment': <Movie className="h-5 w-5" />,
      'Utilities': <Phone className="h-5 w-5" />,
      'Housing': <Home className="h-5 w-5" />,
      'Fuel': <LocalGasStation className="h-5 w-5" />,
      'Education': <School className="h-5 w-5" />,
      'Healthcare': <LocalHospital className="h-5 w-5" />,
      'Other': <Category className="h-5 w-5" />
    };
    return iconMap[categoryName] || <Category className="h-5 w-5" />;
  };

  // Calculate spent amounts for each category
  const updatedCategoryBudgets = categoryBudgets.map(budget => ({
    ...budget,
    spent: expenses
      .filter(expense => expense.category === budget.category)
      .reduce((sum, expense) => sum + expense.amount, 0)
  }));

  useEffect(() => {
    const fetchData = async () => {
      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;

      // Fetch categories
      try {
        setCategoriesLoading(true);
        const fetchedCategories = await financeService.getSpendingCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('🔥 BudgetTab: Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }

      // Fetch current month budgets and transactions in parallel
      try {
        setBudgetsLoading(true);
        const [fetchedBudgets, transactionsResponse] = await Promise.all([
          financeService.getCategoryBudgets({ month: currentMonth, year: currentYear }),
          financeService.getTransactions({ start_date: startDate, limit: 1000 })
        ]);

        // Calculate spent per category from transactions
        const transactionsArray = transactionsResponse?.data || [];
        const spentByCategory: Record<string, number> = {};
        transactionsArray.forEach((tx: any) => {
          const categoryName = tx.category?.name || 'Other';
          spentByCategory[categoryName] = (spentByCategory[categoryName] || 0) + parseFloat(tx.amount || 0);
        });

        // Store raw budget data with calculated spent amounts
        const budgetsWithSpent = fetchedBudgets.map((budget: BudgetApiResponse) => ({
          ...budget,
          spent_amount: spentByCategory[budget.category.name] || budget.spent_amount || 0
        }));
        setRawBudgetData(budgetsWithSpent);

        // Convert API response to CategoryBudget format for UI
        const convertedBudgets: CategoryBudget[] = fetchedBudgets.map((budget: BudgetApiResponse) => ({
          id: budget.id,
          category: budget.category.name,
          budgetAmount: budget.amount,
          spent: spentByCategory[budget.category.name] || budget.spent_amount || 0,
          icon: getCategoryIcon(budget.category.name)
        }));

        setCategoryBudgets(convertedBudgets);
      } catch (error) {
        console.error('🔥 BudgetTab: Failed to fetch budgets:', error);
        setCategoryBudgets([]);
      } finally {
        setBudgetsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddBudget = async () => {
    if (!newBudget.categoryId || !newBudget.categoryName || !newBudget.amount) return;

    try {
      setIsCreatingBudget(true);
      
      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = now.getFullYear();
      
      const budgetData: CreateCategoryBudgetRequest = {
        category_id: newBudget.categoryId,
        amount: parseFloat(newBudget.amount),
        month: currentMonth,
        year: currentYear
      };

      console.log('🔥 Creating budget with data:', budgetData);
      const response = await financeService.createCategoryBudget(budgetData);
      console.log('🔥 Budget created successfully:', response);

      // Refresh budgets list from API
      const refreshedBudgets = await financeService.getCategoryBudgets({ 
        month: currentMonth, 
        year: currentYear 
      });
      
      // Store raw budget data for calculations
      setRawBudgetData(refreshedBudgets);
      
      const convertedBudgets: CategoryBudget[] = refreshedBudgets.map((budget: BudgetApiResponse) => ({
        id: budget.id,
        category: budget.category.name,
        budgetAmount: budget.amount,
        spent: budget.spent_amount,
        icon: getCategoryIcon(budget.category.name)
      }));
      
      setCategoryBudgets(convertedBudgets);
      setNewBudget({ categoryId: '', categoryName: '', amount: '' });
      setIsAddBudgetOpen(false);
      toast.success(`Budget created for ${newBudget.categoryName} successfully!`);
    } catch (error) {
      console.error('🔥 Failed to create budget:', error);
      toast.error('Failed to create budget. Please try again.');
    } finally {
      setIsCreatingBudget(false);
    }
  };

  // Delete budget with confirmation
  const handleDeleteBudget = async (budgetId: string, categoryName: string) => {
    const confirmed = await confirmation.showConfirmation({
      title: 'Delete Budget',
      message: `Are you sure you want to delete the budget for "${categoryName}"? This action cannot be undone.`,
      confirmText: 'Delete Budget',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) return;

    try {
      setDeletingBudgetId(budgetId);
      await financeService.deleteBudget(budgetId);

      // Refresh budgets data
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const fetchedBudgets = await financeService.getCategoryBudgets({
        month: currentMonth,
        year: currentYear
      });

      // Store raw budget data for calculations
      setRawBudgetData(fetchedBudgets);

      // Convert API response to CategoryBudget format for UI
      const convertedBudgets: CategoryBudget[] = fetchedBudgets.map((budget: BudgetApiResponse) => ({
        id: budget.id,
        category: budget.category.name,
        budgetAmount: budget.amount,
        spent: budget.spent_amount,
        icon: getCategoryIcon(budget.category.name)
      }));

      setCategoryBudgets(convertedBudgets);

      toast.success(`Budget for ${categoryName} deleted successfully!`);
    } catch (error) {
      console.error('Failed to delete budget:', error);
      toast.error('Failed to delete budget. Please try again.');
    } finally {
      setDeletingBudgetId(null);
    }
  };

  // Export budgets to CSV
  const exportBudgetsToCSV = () => {
    const headers = ['Category', 'Budget Amount', 'Spent', 'Remaining', 'Percentage Used', 'Status'];
    const csvContent = [
      headers.join(','),
      ...updatedCategoryBudgets.map(budget => {
        const budgetAmount = budget.budgetAmount || 0;
        const spent = budget.spent || 0;
        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
        const remaining = budgetAmount - spent;
        const status = percentage > 100 ? 'Over Budget' : percentage > 80 ? 'Warning' : 'On Track';

        return [
          `"${budget.category}"`,
          budgetAmount.toFixed(2),
          spent.toFixed(2),
          remaining.toFixed(2),
          `${percentage.toFixed(1)}%`,
          `"${status}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `budgets_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Budget data exported to CSV successfully!');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Budget Management
          </h1>
          <p className="text-white/60">
            Track your spending against your monthly and category budgets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={exportBudgetsToCSV}
            disabled={updatedCategoryBudgets.length === 0}
            className="border border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
          >
            <FileDownload className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
            <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 h-10 px-4 py-2">
              <Add className="h-4 w-4 mr-2" />
              Add Budget
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white/10 backdrop-blur-xl border border-white/20">
              <DialogHeader>
                <DialogTitle className="text-white">Add Category Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-white">
                    Category
                  </Label>
                  <Select 
                    value={newBudget.categoryName} 
                    onValueChange={(value) => {
                      const selectedCategory = categories.find(cat => cat.name === value);
                      setNewBudget({ 
                        ...newBudget, 
                        categoryId: selectedCategory?.id || '',
                        categoryName: value
                      });
                    }}
                  >
                    <SelectTrigger id="category" className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading">
                          Loading categories...
                        </SelectItem>
                      ) : (
                        categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(category.name)}
                              {category.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount" className="text-sm font-semibold text-white">
                    Budget Amount ($)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                    placeholder="0.00"
                    className="mt-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    onClick={() => setIsAddBudgetOpen(false)}
                    className="flex-1 h-12 border border-white/20 text-white hover:bg-white/10"
                    disabled={isCreatingBudget}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddBudget}
                    className="flex-1 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600"
                    disabled={isCreatingBudget || !newBudget.categoryId || !newBudget.amount}
                  >
                    {isCreatingBudget ? 'Creating...' : 'Add Budget'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overall Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AttachMoney className="h-5 w-5 text-primary" />
              Monthly Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetsLoading ? (
              <div className="space-y-4">
                <div className="h-9 bg-white/20 animate-pulse rounded"></div>
                <div className="w-full bg-white/20 rounded-full h-3 animate-pulse"></div>
                <div className="h-4 bg-white/20 animate-pulse rounded w-20"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-3xl font-bold text-primary">
                  ${totalBudgetAmount.toFixed(2)}
                </div>
                <div className="w-full bg-white/20 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${budgetUsagePercentage > 100 ? 'bg-red-500' : 'bg-primary'}`}
                    style={{ width: `${Math.min(budgetUsagePercentage, 100)}%` }}
                  />
                </div>
                <div className="text-sm text-white/60">
                  {budgetUsagePercentage.toFixed(1)}% used
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetsLoading ? (
              <div className="space-y-2">
                <div className="h-9 bg-white/20 animate-pulse rounded"></div>
                <div className="h-4 bg-white/20 animate-pulse rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-red-500">
                  ${totalSpentFromBudgets.toFixed(2)}
                </div>
                <div className="text-sm text-white/60 mt-2">
                  Across {rawBudgetData.length} categories
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {totalRemaining >= 0 ? (
                <TrendingDown className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-500" />
              )}
              {totalRemaining >= 0 ? 'Remaining' : 'Over Budget'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetsLoading ? (
              <div className="space-y-2">
                <div className="h-9 bg-white/20 animate-pulse rounded"></div>
                <div className="h-4 bg-white/20 animate-pulse rounded w-28"></div>
              </div>
            ) : (
              <>
                <div className={`text-3xl font-bold ${totalRemaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${Math.abs(totalRemaining).toFixed(2)}
                </div>
                <div className="text-sm text-white/60 mt-2">
                  {totalRemaining >= 0 ? 'Keep it up!' : 'Consider reducing expenses'}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Budgets */}
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>
            Track your spending by category against individual budgets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetsLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading current month budgets...</p>
              </div>
            ) : (
              <>
                {updatedCategoryBudgets.map((budget) => {
                  const budgetAmount = budget.budgetAmount || 0;
                  const spent = budget.spent || 0;
                  const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                  const remaining = budgetAmount - spent;

                  return (
                    <div key={budget.id} className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            {budget.icon || <Category className="h-5 w-5" style={{ color: '#47bdff' }} />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{budget.category}</h3>
                            <p className="text-sm text-white/60">
                              ${spent.toFixed(2)} of ${budgetAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`text-lg font-bold ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {remaining >= 0 ? `$${remaining.toFixed(2)}` : `-$${Math.abs(remaining).toFixed(2)}`}
                            </div>
                            <div className="text-sm text-white/60">
                              {remaining >= 0 ? 'remaining' : 'over budget'}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBudget(budget.id, budget.category)}
                            disabled={deletingBudgetId === budget.id}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-red-500/30"
                          >
                            {deletingBudgetId === budget.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <Delete className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-primary'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 text-sm text-white/60">
                        {percentage.toFixed(1)}% used
                      </div>
                    </div>
                  );
                })}
                
                {updatedCategoryBudgets.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Category className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No category budgets for this month yet.</p>
                    <p className="text-sm">Click "Add Budget" to create your first category budget for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
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
    </div>
  );
};