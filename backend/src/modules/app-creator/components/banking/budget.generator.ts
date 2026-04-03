/**
 * Banking Budget Component Generators
 */

export interface BudgetOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateBudgetForm(options: BudgetOptions = {}): string {
  const { componentName = 'BudgetForm', endpoint = '/banking/budgets' } = options;

  return `import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, DollarSign, Calendar, Tag, Palette, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface BudgetFormData {
  name: string;
  category: string;
  amount: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  color: string;
  alert_threshold: string;
  is_recurring: boolean;
  rollover_unused: boolean;
}

const defaultColors = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#6366F1', '#14B8A6'
];

const categories = [
  'Food & Dining', 'Shopping', 'Transportation', 'Entertainment', 'Utilities',
  'Healthcare', 'Education', 'Travel', 'Personal Care', 'Home', 'Other'
];

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    category: '',
    amount: '',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    color: defaultColors[0],
    alert_threshold: '80',
    is_recurring: true,
    rollover_unused: false,
  });

  const { data: existingBudget, isLoading: loadingBudget } = useQuery({
    queryKey: ['budget', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingBudget) {
      setFormData({
        name: existingBudget.name || '',
        category: existingBudget.category || '',
        amount: existingBudget.amount?.toString() || '',
        period: existingBudget.period || 'monthly',
        start_date: existingBudget.start_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        end_date: existingBudget.end_date?.split('T')[0] || '',
        color: existingBudget.color || defaultColors[0],
        alert_threshold: existingBudget.alert_threshold?.toString() || '80',
        is_recurring: existingBudget.is_recurring ?? true,
        rollover_unused: existingBudget.rollover_unused ?? false,
      });
    }
  }, [existingBudget]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (isEditing) {
        return api.put('${endpoint}/' + id, data);
      }
      return api.post('${endpoint}', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success(isEditing ? 'Budget updated successfully!' : 'Budget created successfully!');
      navigate('/budgets');
    },
    onError: () => toast.error('Failed to save budget'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
      alert_threshold: parseInt(formData.alert_threshold),
    });
  };

  const updateField = (field: keyof BudgetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loadingBudget) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Budget' : 'Create Budget'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isEditing ? 'Update your budget settings' : 'Set up a new spending budget'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Budget Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Monthly Groceries"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="w-4 h-4" />
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase().replace(/ & /g, '-')}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4" />
              Budget Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4" />
              Budget Period
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['weekly', 'monthly', 'quarterly', 'yearly'] as const).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => updateField('period', period)}
                  className={\`py-2 rounded-lg text-sm font-medium transition-colors \${
                    formData.period === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }\`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Time Frame</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => updateField('start_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => updateField('end_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_recurring"
              checked={formData.is_recurring}
              onChange={(e) => updateField('is_recurring', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="is_recurring" className="text-sm text-gray-700 dark:text-gray-300">
              Automatically renew this budget each period
            </label>
          </div>
        </div>

        {/* Appearance & Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance & Alerts</h2>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Palette className="w-4 h-4" />
              Color
            </label>
            <div className="flex gap-2">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateField('color', color)}
                  className={\`w-8 h-8 rounded-full transition-transform \${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }\`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input
                type="color"
                value={formData.color}
                onChange={(e) => updateField('color', e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <AlertCircle className="w-4 h-4" />
              Alert Threshold
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={formData.alert_threshold}
                onChange={(e) => updateField('alert_threshold', e.target.value)}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                {formData.alert_threshold}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              You'll be notified when spending reaches this percentage of your budget
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="rollover_unused"
              checked={formData.rollover_unused}
              onChange={(e) => updateField('rollover_unused', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="rollover_unused" className="text-sm text-gray-700 dark:text-gray-300">
              Roll over unused budget to the next period
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/budgets')}
            className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? 'Update Budget' : 'Create Budget'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateBudgetOverview(options: BudgetOptions = {}): string {
  const { componentName = 'BudgetOverview', endpoint = '/banking/budgets' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, Plus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Calendar, ChevronRight, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  remaining: number;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  color: string;
  start_date: string;
  end_date?: string;
  alert_threshold: number;
  is_active: boolean;
  days_remaining?: number;
}

const ${componentName}: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets', selectedPeriod],
    queryFn: async () => {
      const params = selectedPeriod !== 'all' ? '?period=' + selectedPeriod : '';
      const response = await api.get<any>('${endpoint}' + params);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const totalBudget = budgets?.reduce((sum: number, b: Budget) => sum + b.amount, 0) || 0;
  const totalSpent = budgets?.reduce((sum: number, b: Budget) => sum + b.spent, 0) || 0;
  const totalRemaining = totalBudget - totalSpent;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getProgressColor = (spent: number, amount: number, threshold: number) => {
    const progress = (spent / amount) * 100;
    if (progress >= 100) return 'bg-red-500';
    if (progress >= threshold) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = (spent: number, amount: number, threshold: number) => {
    const progress = (spent / amount) * 100;
    if (progress >= 100) {
      return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Over Budget', icon: AlertTriangle };
    }
    if (progress >= threshold) {
      return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Near Limit', icon: AlertTriangle };
    }
    return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'On Track', icon: CheckCircle };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Track your spending across all budgets</p>
        </div>
        <Link
          to="/budgets/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Budget</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Budget</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalBudget)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-gray-500 mt-1">{overallProgress.toFixed(0)}% of budget</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Remaining</span>
          </div>
          <p className={\`text-2xl font-bold \${totalRemaining < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>
            {formatCurrency(totalRemaining)}
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Spending</h2>
          <span className={\`text-sm font-medium \${
            overallProgress > 90 ? 'text-red-600' : overallProgress > 70 ? 'text-yellow-600' : 'text-green-600'
          }\`}>
            {overallProgress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={\`h-3 rounded-full transition-all duration-500 \${
              overallProgress > 90 ? 'bg-red-500' : overallProgress > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }\`}
            style={{ width: \`\${Math.min(overallProgress, 100)}%\` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{formatCurrency(totalSpent)} spent</span>
          <span>{formatCurrency(totalRemaining)} remaining</span>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-fit">
        {['all', 'weekly', 'monthly', 'quarterly', 'yearly'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={\`px-4 py-2 rounded-md text-sm font-medium transition-colors \${
              selectedPeriod === period
                ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }\`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgets && budgets.length > 0 ? (
          budgets.map((budget: Budget) => {
            const progress = (budget.spent / budget.amount) * 100;
            const status = getStatusBadge(budget.spent, budget.amount, budget.alert_threshold);
            const StatusIcon = status.icon;

            return (
              <div
                key={budget.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: budget.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{budget.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{budget.category.replace('-', ' ')} • {budget.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={\`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium \${status.color}\`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === budget.id ? null : budget.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      {showMenu === budget.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <Link
                            to={\`/budgets/\${budget.id}/edit\`}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Link>
                          <button className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}
                    </span>
                    <span className={\`font-medium \${progress > 100 ? 'text-red-600' : 'text-gray-900 dark:text-white'}\`}>
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={\`h-2 rounded-full transition-all \${getProgressColor(budget.spent, budget.amount, budget.alert_threshold)}\`}
                      style={{ width: \`\${Math.min(progress, 100)}%\` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className={\`\${budget.remaining < 0 ? 'text-red-600' : 'text-gray-500'}\`}>
                    {budget.remaining < 0 ? (
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {formatCurrency(Math.abs(budget.remaining))} over budget
                      </span>
                    ) : (
                      <span>{formatCurrency(budget.remaining)} remaining</span>
                    )}
                  </span>
                  {budget.days_remaining !== undefined && (
                    <span className="text-gray-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {budget.days_remaining} days left
                    </span>
                  )}
                </div>

                <Link
                  to={\`/budgets/\${budget.id}\`}
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No budgets yet</p>
            <p className="text-sm text-gray-500 mb-4">Create a budget to start tracking your spending</p>
            <Link
              to="/budgets/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Budget
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
