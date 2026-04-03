import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Bell
} from 'lucide-react';
import type { Budget, BudgetCategory } from '../../services/financeService';

interface BudgetManagerProps {
  budgets: Budget[];
  isLoading?: boolean;
  onCreateBudget?: (budgetData: any) => void;
  onUpdateBudget?: (id: string, budgetData: any) => void;
  onDeleteBudget?: (id: string) => void;
  totalSpent?: number;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets = [],
  isLoading = false,
  onCreateBudget,
  onUpdateBudget,
  onDeleteBudget,
  totalSpent = 0
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    totalBudget: '',
    categories: [] as Array<{ category: string; budgetAmount: string; color: string }>,
    notifications: {
      enabled: true,
      thresholds: [75, 90, 100]
    }
  });

  const expenseCategories = [
    'Food & Drink',
    'Shopping',
    'Transportation',
    'Entertainment',
    'Utilities',
    'Housing',
    'Healthcare',
    'Education',
    'Personal Care',
    'Travel',
    'Insurance',
    'Investments',
    'Debt Payment',
    'Gifts & Donations',
    'Business',
    'Other'
  ];

  const categoryColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4'
  ];

  const getBudgetStatus = (budget: Budget) => {
    const percentage = budget.totalBudget > 0 ? (budget.totalSpent / budget.totalBudget) * 100 : 0;
    
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-400', bgColor: 'bg-red-500/20' };
    if (percentage >= 90) return { status: 'warning', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (percentage >= 75) return { status: 'caution', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    return { status: 'on_track', color: 'text-green-400', bgColor: 'bg-green-500/20' };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.totalBudget || formData.categories.length === 0) {
      return;
    }

    const budgetData = {
      name: formData.name,
      period: formData.period,
      startDate: new Date(formData.startDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      totalBudget: parseFloat(formData.totalBudget),
      categories: formData.categories.map((cat, index) => ({
        id: `${Date.now()}-${index}`,
        category: cat.category,
        budgetAmount: parseFloat(cat.budgetAmount),
        spentAmount: 0,
        percentage: (parseFloat(cat.budgetAmount) / parseFloat(formData.totalBudget)) * 100,
        color: cat.color
      })),
      isActive: true,
      notifications: formData.notifications,
      currency: 'USD'
    };

    if (editingBudget && onUpdateBudget) {
      onUpdateBudget(editingBudget.id, budgetData);
    } else if (onCreateBudget) {
      onCreateBudget(budgetData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      totalBudget: '',
      categories: [],
      notifications: {
        enabled: true,
        thresholds: [75, 90, 100]
      }
    });
    setEditingBudget(null);
    setIsCreateOpen(false);
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, {
        category: '',
        budgetAmount: '',
        color: categoryColors[prev.categories.length % categoryColors.length]
      }]
    }));
  };

  const updateCategory = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.map((cat, i) => 
        i === index ? { ...cat, [field]: value } : cat
      )
    }));
  };

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const editBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      period: budget.period,
      startDate: budget.startDate.toString().split('T')[0],
      endDate: budget.endDate ? budget.endDate.toString().split('T')[0] : '',
      totalBudget: budget.totalBudget.toString(),
      categories: budget.categories.map(cat => ({
        category: cat.category,
        budgetAmount: cat.budgetAmount.toString(),
        color: cat.color || '#3b82f6'
      })),
      notifications: budget.notifications
    });
    setIsCreateOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPeriod = (period: string) => {
    return period.charAt(0).toUpperCase() + period.slice(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="rounded-xl animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="w-32 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Budget Management</h2>
          <p className="text-white/60">
            Track your spending against your budgets
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger>
            <Button className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Budget Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Monthly Budget"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-10 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Period</Label>
                  <Select 
                    value={formData.period} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, period: value as any }))}
                  >
                    <SelectTrigger className="h-10 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="h-10 rounded-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalBudget" className="text-sm font-medium">
                    Total Budget ($)
                  </Label>
                  <Input
                    id="totalBudget"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.totalBudget}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalBudget: e.target.value }))}
                    className="h-10 rounded-lg"
                    required
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Budget Categories</Label>
                  <Button type="button" onClick={addCategory} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Category
                  </Button>
                </div>

                {formData.categories.map((category, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    
                    <Select
                      value={category.category}
                      onValueChange={(value) => updateCategory(index, 'category', value)}
                    >
                      <SelectTrigger className="h-9 rounded-lg flex-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Amount"
                      value={category.budgetAmount}
                      onChange={(e) => updateCategory(index, 'budgetAmount', e.target.value)}
                      className="h-9 rounded-lg w-32"
                    />

                    <Button
                      type="button"
                      onClick={() => removeCategory(index)}
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 p-0 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {formData.categories.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No categories added yet.</p>
                    <p className="text-sm">Click "Add Category" to start building your budget.</p>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Notifications</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notifications"
                    checked={formData.notifications.enabled}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        notifications: { ...prev.notifications, enabled: checked }
                      }))
                    }
                  />
                  <Label htmlFor="notifications" className="text-sm">
                    Enable budget alerts
                  </Label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1 h-10 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  disabled={!formData.name || !formData.totalBudget || formData.categories.length === 0}
                >
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <Card className="rounded-xl p-12 text-center">
          <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No Budgets Created</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first budget to start tracking your spending goals
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Budget
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {budgets.map((budget) => {
            const status = getBudgetStatus(budget);
            const percentage = budget.totalBudget > 0 ? (budget.totalSpent / budget.totalBudget) * 100 : 0;
            const remaining = budget.totalBudget - budget.totalSpent;

            return (
              <Card key={budget.id} className="rounded-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {budget.name}
                        <Badge 
                          variant={budget.isActive ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {budget.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {formatPeriod(budget.period)} • {formatCurrency(budget.totalSpent)} of {formatCurrency(budget.totalBudget)}
                      </CardDescription>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {budget.notifications.enabled && (
                        <Bell className="h-4 w-4 text-gray-400" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editBudget(budget)}
                        className="h-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {onDeleteBudget && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteBudget(budget.id)}
                          className="h-8 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Overall Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 ${status.color}`}>
                        {status.status === 'exceeded' ? <AlertTriangle className="h-4 w-4" /> :
                         status.status === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                         <CheckCircle className="h-4 w-4" />}
                        <span className="text-sm font-medium">
                          {percentage.toFixed(1)}% used
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {remaining >= 0 ? formatCurrency(remaining) : `-${formatCurrency(Math.abs(remaining))}`}
                        </div>
                        <div className="text-sm text-white/60">
                          {remaining >= 0 ? 'remaining' : 'over budget'}
                        </div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-3"
                    />
                  </div>

                  {/* Category Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-white">Category Breakdown</h4>
                    <div className="space-y-3">
                      {budget.categories.map((category) => {
                        const catPercentage = category.budgetAmount > 0 ? (category.spentAmount / category.budgetAmount) * 100 : 0;
                        const catRemaining = category.budgetAmount - category.spentAmount;

                        return (
                          <div key={category.id} className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color || '#3b82f6' }}
                                />
                                <span className="font-medium text-sm text-white">{category.category}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-white">
                                  {formatCurrency(category.spentAmount)} / {formatCurrency(category.budgetAmount)}
                                </div>
                                <div className={`text-xs ${catRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {catRemaining >= 0 ? `${formatCurrency(catRemaining)} left` : `${formatCurrency(Math.abs(catRemaining))} over`}
                                </div>
                              </div>
                            </div>
                            <Progress
                              value={Math.min(catPercentage, 100)}
                              className="h-2"
                            />
                            <div className="text-xs text-white/60 mt-1">
                              {catPercentage.toFixed(1)}% used
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetManager;