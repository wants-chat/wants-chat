/**
 * Budget Component Generators
 */

export interface BudgetOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateBudgetTracker(options: BudgetOptions = {}): string {
  const { componentName = 'BudgetTracker', endpoint = '/budgets' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const totalBudget = budgets?.reduce((sum: number, b: any) => sum + (b.limit || 0), 0) || 0;
  const totalSpent = budgets?.reduce((sum: number, b: any) => sum + (b.spent || 0), 0) || 0;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Tracker</h2>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">\${totalSpent.toLocaleString()} of \${totalBudget.toLocaleString()}</span>
            <span className={\`font-medium \${overallProgress > 90 ? 'text-red-600' : overallProgress > 70 ? 'text-yellow-600' : 'text-green-600'}\`}>
              {overallProgress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={\`h-3 rounded-full transition-all \${
                overallProgress > 90 ? 'bg-red-500' : overallProgress > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }\`}
              style={{ width: \`\${Math.min(overallProgress, 100)}%\` }}
            />
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {budgets && budgets.length > 0 ? (
          budgets.map((budget: any) => {
            const progress = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
            const isOverBudget = progress > 100;
            const isNearLimit = progress > 80 && progress <= 100;
            return (
              <div key={budget.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={\`w-3 h-3 rounded-full\`} style={{ backgroundColor: budget.color || '#8B5CF6' }} />
                    <span className="font-medium text-gray-900 dark:text-white">{budget.name}</span>
                    {isOverBudget && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  </div>
                  <span className="text-sm text-gray-500">
                    \${budget.spent?.toLocaleString()} / \${budget.limit?.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={\`h-2 rounded-full transition-all \${
                      isOverBudget ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-purple-500'
                    }\`}
                    style={{ width: \`\${Math.min(progress, 100)}%\` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isOverBudget ? \`\${(budget.spent - budget.limit).toLocaleString()} over budget\` :
                   \`\${(budget.limit - budget.spent).toLocaleString()} remaining\`}
                </p>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-gray-500">No budgets set</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateBudgetCategories(options: BudgetOptions = {}): string {
  const { componentName = 'BudgetCategories', endpoint = '/budget-categories' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, ShoppingBag, Home, Car, Utensils, Zap, Heart, GraduationCap, Plane, Film } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['budget-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const categoryIcons: Record<string, any> = {
    shopping: ShoppingBag,
    housing: Home,
    transport: Car,
    food: Utensils,
    utilities: Zap,
    health: Heart,
    education: GraduationCap,
    travel: Plane,
    entertainment: Film,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {categories && categories.length > 0 ? (
          categories.map((category: any) => {
            const Icon = categoryIcons[category.key?.toLowerCase()] || ShoppingBag;
            return (
              <div key={category.id} className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: (category.color || '#8B5CF6') + '20' }}>
                    <Icon className="w-5 h-5" style={{ color: category.color || '#8B5CF6' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{category.name}</p>
                    <p className="text-sm text-gray-500">\${category.amount?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-4 text-gray-500">No spending data</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

export function generateSpendingChart(options: BudgetOptions = {}): string {
  const { componentName = 'SpendingChart', endpoint = '/spending-trends' } = options;

  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const { data: trends, isLoading } = useQuery({
    queryKey: ['spending-trends', period],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?period=' + period);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const data = trends?.data || [];
  const maxValue = Math.max(...data.map((d: any) => d.value || 0), 1);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Spending Trends</h2>
          {trends?.change !== undefined && (
            <div className={\`flex items-center gap-1 text-sm \${trends.change >= 0 ? 'text-red-600' : 'text-green-600'}\`}>
              {trends.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trends.change)}% vs last {period}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={\`px-3 py-1 rounded-md text-sm font-medium transition-colors \${
                period === p
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }\`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-2 h-48">
        {data.length > 0 ? (
          data.map((item: any, index: number) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-purple-500 rounded-t-sm hover:bg-purple-600 transition-colors cursor-pointer"
                style={{ height: \`\${(item.value / maxValue) * 100}%\`, minHeight: '4px' }}
                title={\`\${item.label}: \$\${item.value.toLocaleString()}\`}
              />
              <span className="text-xs text-gray-500 truncate max-w-full">{item.label}</span>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">No data available</div>
        )}
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
