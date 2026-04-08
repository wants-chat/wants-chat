// @ts-nocheck
/**
 * Finance Module Transformers
 * Converts between snake_case (backend) and camelCase (frontend) for finance/expense data
 */

import {
  transformKeysToCamel,
  transformKeysToSnake,
  transformPaginatedResponse,
  transformSingleResponse,
  prepareForBackend,
} from './caseTransformers';

import type {
  FinanceCategory,
  BudgetApiResponse,
} from '../types/expense-tracker';

import type {
  FinancialAccount,
  Expense,
  Income,
  Budget,
  BudgetCategory,
  FinancialGoal,
  FinancialSummary,
  TransactionAnalytics,
} from '../services/financeService';

// ============================================================================
// Financial Account Transformers
// ============================================================================

/**
 * Transform financial account from backend (snake_case) to frontend (camelCase)
 */
export function transformFinancialAccountFromBackend(account: any): FinancialAccount {
  if (!account) return account;

  return {
    id: account.id,
    userId: account.user_id || account.userId,
    name: account.name,
    type: account.type,
    provider: account.provider,
    accountNumber: account.account_number || account.accountNumber,
    balance: account.balance || 0,
    currency: account.currency || 'USD',
    isActive: account.is_active ?? account.isActive ?? true,
    lastSynced: account.last_synced || account.lastSynced,
    createdAt: account.created_at || account.createdAt,
    updatedAt: account.updated_at || account.updatedAt,
  };
}

/**
 * Transform financial account to backend (snake_case)
 */
export function transformFinancialAccountToBackend(account: Partial<FinancialAccount>): any {
  if (!account) return account;

  return prepareForBackend({
    name: account.name,
    type: account.type,
    provider: account.provider,
    accountNumber: account.accountNumber,
    balance: account.balance,
    currency: account.currency,
    isActive: account.isActive,
  });
}

// ============================================================================
// Expense Transformers
// ============================================================================

/**
 * Transform expense from backend (snake_case) to frontend (camelCase)
 */
export function transformExpenseFromBackend(expense: any): Expense {
  if (!expense) return expense;

  return {
    id: expense.id,
    userId: expense.user_id || expense.userId,
    accountId: expense.account_id || expense.accountId,
    account: expense.account ? transformFinancialAccountFromBackend(expense.account) : undefined,
    amount: expense.amount || 0,
    currency: expense.currency || 'USD',
    description: expense.description || '',
    category: expense.category || '',
    subcategory: expense.subcategory || expense.sub_category,
    date: expense.date,
    location: expense.location,
    paymentMethod: expense.payment_method || expense.paymentMethod || 'cash',
    isRecurring: expense.is_recurring ?? expense.isRecurring ?? false,
    recurringPattern: expense.recurring_pattern || expense.recurringPattern ? {
      frequency: (expense.recurring_pattern || expense.recurringPattern)?.frequency,
      interval: (expense.recurring_pattern || expense.recurringPattern)?.interval,
      endDate: (expense.recurring_pattern || expense.recurringPattern)?.end_date ||
               (expense.recurring_pattern || expense.recurringPattern)?.endDate,
    } : undefined,
    tags: expense.tags || [],
    attachments: expense.attachments || [],
    createdAt: expense.created_at || expense.createdAt,
    updatedAt: expense.updated_at || expense.updatedAt,
  };
}

/**
 * Transform expense to backend (snake_case)
 */
export function transformExpenseToBackend(expense: Partial<Expense>): any {
  if (!expense) return expense;

  const transformed: any = {
    amount: expense.amount,
    currency: expense.currency,
    description: expense.description,
    category: expense.category,
    date: expense.date,
    location: expense.location,
    tags: expense.tags,
    attachments: expense.attachments,
  };

  if (expense.accountId !== undefined) transformed.account_id = expense.accountId;
  if (expense.subcategory !== undefined) transformed.subcategory = expense.subcategory;
  if (expense.paymentMethod !== undefined) transformed.payment_method = expense.paymentMethod;
  if (expense.isRecurring !== undefined) transformed.is_recurring = expense.isRecurring;
  if (expense.recurringPattern !== undefined) {
    transformed.recurring_pattern = {
      frequency: expense.recurringPattern.frequency,
      interval: expense.recurringPattern.interval,
      end_date: expense.recurringPattern.endDate,
    };
  }

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(transformed).filter(([_, v]) => v !== undefined)
  );
}

// ============================================================================
// Income Transformers
// ============================================================================

/**
 * Transform income from backend (snake_case) to frontend (camelCase)
 */
export function transformIncomeFromBackend(income: any): Income {
  if (!income) return income;

  return {
    id: income.id,
    userId: income.user_id || income.userId,
    accountId: income.account_id || income.accountId,
    account: income.account ? transformFinancialAccountFromBackend(income.account) : undefined,
    amount: income.amount || 0,
    currency: income.currency || 'USD',
    source: income.source || '',
    category: income.category || 'other',
    date: income.date,
    isRecurring: income.is_recurring ?? income.isRecurring ?? false,
    recurringPattern: income.recurring_pattern || income.recurringPattern ? {
      frequency: (income.recurring_pattern || income.recurringPattern)?.frequency,
      interval: (income.recurring_pattern || income.recurringPattern)?.interval,
      endDate: (income.recurring_pattern || income.recurringPattern)?.end_date ||
               (income.recurring_pattern || income.recurringPattern)?.endDate,
    } : undefined,
    taxable: income.taxable ?? true,
    description: income.description,
    tags: income.tags || [],
    createdAt: income.created_at || income.createdAt,
    updatedAt: income.updated_at || income.updatedAt,
  };
}

/**
 * Transform income to backend (snake_case)
 */
export function transformIncomeToBackend(income: Partial<Income>): any {
  if (!income) return income;

  const transformed: any = {
    amount: income.amount,
    currency: income.currency,
    source: income.source,
    category: income.category,
    date: income.date,
    taxable: income.taxable,
    description: income.description,
    tags: income.tags,
  };

  if (income.accountId !== undefined) transformed.account_id = income.accountId;
  if (income.isRecurring !== undefined) transformed.is_recurring = income.isRecurring;
  if (income.recurringPattern !== undefined) {
    transformed.recurring_pattern = {
      frequency: income.recurringPattern.frequency,
      interval: income.recurringPattern.interval,
      end_date: income.recurringPattern.endDate,
    };
  }

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(transformed).filter(([_, v]) => v !== undefined)
  );
}

// ============================================================================
// Budget Transformers
// ============================================================================

/**
 * Transform budget from backend (snake_case) to frontend (camelCase)
 */
export function transformBudgetFromBackend(budget: any): Budget {
  if (!budget) return budget;

  return {
    id: budget.id,
    userId: budget.user_id || budget.userId,
    name: budget.name,
    categories: (budget.categories || []).map(transformBudgetCategoryFromBackend),
    period: budget.period || 'monthly',
    startDate: budget.start_date || budget.startDate,
    endDate: budget.end_date || budget.endDate,
    totalBudget: budget.total_budget || budget.totalBudget || 0,
    totalSpent: budget.total_spent || budget.totalSpent || 0,
    currency: budget.currency || 'USD',
    isActive: budget.is_active ?? budget.isActive ?? true,
    notifications: budget.notifications || { enabled: false, thresholds: [] },
    createdAt: budget.created_at || budget.createdAt,
    updatedAt: budget.updated_at || budget.updatedAt,
  };
}

/**
 * Transform budget category from backend
 */
export function transformBudgetCategoryFromBackend(category: any): BudgetCategory {
  if (!category) return category;

  return {
    id: category.id,
    category: category.category || category.name,
    subcategories: category.subcategories || category.sub_categories,
    budgetAmount: category.budget_amount || category.budgetAmount || category.amount || 0,
    spentAmount: category.spent_amount || category.spentAmount || 0,
    percentage: category.percentage || category.usage_percentage || 0,
    color: category.color,
  };
}

/**
 * Transform budget to backend (snake_case)
 */
export function transformBudgetToBackend(budget: Partial<Budget>): any {
  if (!budget) return budget;

  return prepareForBackend({
    name: budget.name,
    categories: budget.categories?.map(c => ({
      id: c.id,
      category: c.category,
      subcategories: c.subcategories,
      budgetAmount: c.budgetAmount,
      color: c.color,
    })),
    period: budget.period,
    startDate: budget.startDate,
    endDate: budget.endDate,
    totalBudget: budget.totalBudget,
    currency: budget.currency,
    isActive: budget.isActive,
    notifications: budget.notifications,
  });
}

// ============================================================================
// Budget API Response Transformers (for category budgets)
// ============================================================================

/**
 * Transform budget API response from backend
 */
export function transformBudgetApiResponseFromBackend(response: any): BudgetApiResponse {
  if (!response) return response;

  return {
    id: response.id,
    user_id: response.user_id,
    category_id: response.category_id,
    category: response.category ? {
      id: response.category.id,
      name: response.category.name,
      description: response.category.description,
      icon: response.category.icon,
      color: response.category.color,
    } : response.category,
    amount: response.amount || 0,
    remaining_amount: response.remaining_amount || 0,
    month: response.month,
    year: response.year,
    created_at: response.created_at,
    updated_at: response.updated_at,
    spent_amount: response.spent_amount || 0,
    usage_percentage: response.usage_percentage || 0,
  };
}

// ============================================================================
// Financial Goal Transformers
// ============================================================================

/**
 * Transform financial goal from backend (snake_case) to frontend (camelCase)
 */
export function transformFinancialGoalFromBackend(goal: any): FinancialGoal {
  if (!goal) return goal;

  return {
    id: goal.id,
    userId: goal.user_id || goal.userId,
    name: goal.name,
    description: goal.description,
    type: goal.type,
    targetAmount: goal.target_amount || goal.targetAmount || 0,
    currentAmount: goal.current_amount || goal.currentAmount || 0,
    currency: goal.currency || 'USD',
    targetDate: goal.target_date || goal.targetDate,
    priority: goal.priority || 'medium',
    isActive: goal.is_active ?? goal.isActive ?? true,
    linkedAccountId: goal.linked_account_id || goal.linkedAccountId,
    createdAt: goal.created_at || goal.createdAt,
    updatedAt: goal.updated_at || goal.updatedAt,
  };
}

/**
 * Transform financial goal to backend (snake_case)
 */
export function transformFinancialGoalToBackend(goal: Partial<FinancialGoal>): any {
  if (!goal) return goal;

  return prepareForBackend({
    name: goal.name,
    description: goal.description,
    type: goal.type,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    currency: goal.currency,
    targetDate: goal.targetDate,
    priority: goal.priority,
    isActive: goal.isActive,
    linkedAccountId: goal.linkedAccountId,
  });
}

// ============================================================================
// Financial Summary Transformers
// ============================================================================

/**
 * Transform financial summary from backend
 */
export function transformFinancialSummaryFromBackend(summary: any): FinancialSummary {
  if (!summary) return summary;

  return {
    totalAssets: summary.total_assets || summary.totalAssets || 0,
    totalLiabilities: summary.total_liabilities || summary.totalLiabilities || 0,
    netWorth: summary.net_worth || summary.netWorth || 0,
    monthlyIncome: summary.monthly_income || summary.monthlyIncome || 0,
    monthlyExpenses: summary.monthly_expenses || summary.monthlyExpenses || 0,
    monthlySavings: summary.monthly_savings || summary.monthlySavings || 0,
    currency: summary.currency || 'USD',
    accounts: (summary.accounts || []).map(transformFinancialAccountFromBackend),
    topCategories: (summary.top_categories || summary.topCategories || []).map((c: any) => ({
      category: c.category,
      amount: c.amount || 0,
      percentage: c.percentage || 0,
    })),
    budgetStatus: (summary.budget_status || summary.budgetStatus || []).map((b: any) => ({
      budgetId: b.budget_id || b.budgetId,
      name: b.name,
      usage: b.usage || 0,
      status: b.status || 'on_track',
    })),
  };
}

// ============================================================================
// Transaction Analytics Transformers
// ============================================================================

/**
 * Transform transaction analytics from backend
 */
export function transformTransactionAnalyticsFromBackend(analytics: any): TransactionAnalytics {
  if (!analytics) return analytics;

  return {
    period: analytics.period,
    totalIncome: analytics.total_income || analytics.totalIncome || 0,
    totalExpenses: analytics.total_expenses || analytics.totalExpenses || 0,
    netFlow: analytics.net_flow || analytics.netFlow || 0,
    expensesByCategory: (analytics.expenses_by_category || analytics.expensesByCategory || []).map((e: any) => ({
      category: e.category,
      amount: e.amount || 0,
      count: e.count || 0,
    })),
    incomeBySource: (analytics.income_by_source || analytics.incomeBySource || []).map((i: any) => ({
      source: i.source,
      amount: i.amount || 0,
      count: i.count || 0,
    })),
    trends: analytics.trends ? {
      incomeGrowth: analytics.trends.income_growth || analytics.trends.incomeGrowth || 0,
      expenseGrowth: analytics.trends.expense_growth || analytics.trends.expenseGrowth || 0,
      savingsRate: analytics.trends.savings_rate || analytics.trends.savingsRate || 0,
    } : { incomeGrowth: 0, expenseGrowth: 0, savingsRate: 0 },
    topMerchants: (analytics.top_merchants || analytics.topMerchants || []).map((m: any) => ({
      name: m.name,
      amount: m.amount || 0,
      count: m.count || 0,
    })),
  };
}

// ============================================================================
// Finance Category Transformers
// ============================================================================

/**
 * Transform finance category from backend
 */
export function transformFinanceCategoryFromBackend(category: any): FinanceCategory {
  if (!category) return category;

  return {
    id: category.id,
    name: category.name,
    description: category.description || '',
    icon: category.icon,
    color: category.color,
    sort_order: category.sort_order || category.sortOrder || 0,
  };
}

// ============================================================================
// Transaction Transformers (Generic)
// ============================================================================

/**
 * Transform transaction from backend (generic for any transaction type)
 */
export function transformTransactionFromBackend(transaction: any): any {
  if (!transaction) return transaction;

  return {
    id: transaction.id,
    userId: transaction.user_id || transaction.userId,
    type: transaction.type,
    amount: transaction.amount || 0,
    currency: transaction.currency || 'USD',
    description: transaction.description,
    category: transaction.category,
    categoryId: transaction.category_id || transaction.categoryId,
    date: transaction.date,
    paymentMethod: transaction.payment_method || transaction.paymentMethod,
    isRecurring: transaction.is_recurring ?? transaction.isRecurring ?? false,
    notes: transaction.notes,
    createdAt: transaction.created_at || transaction.createdAt,
    updatedAt: transaction.updated_at || transaction.updatedAt,
  };
}

/**
 * Transform transaction to backend
 */
export function transformTransactionToBackend(transaction: any): any {
  if (!transaction) return transaction;

  return prepareForBackend({
    type: transaction.type,
    amount: transaction.amount,
    currency: transaction.currency,
    description: transaction.description,
    category: transaction.category,
    categoryId: transaction.categoryId,
    date: transaction.date,
    paymentMethod: transaction.paymentMethod,
    isRecurring: transaction.isRecurring,
    notes: transaction.notes,
  });
}

// ============================================================================
// List Response Transformers
// ============================================================================

/**
 * Transform paginated expenses response
 */
export function transformExpensesListResponse(response: any): {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformExpenseFromBackend),
  };
}

/**
 * Transform paginated income response
 */
export function transformIncomeListResponse(response: any): {
  data: Income[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformIncomeFromBackend),
  };
}

/**
 * Transform paginated transactions response
 */
export function transformTransactionsListResponse(response: any): {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const paginated = transformPaginatedResponse<any>(response);
  return {
    ...paginated,
    data: paginated.data.map(transformTransactionFromBackend),
  };
}

/**
 * Transform financial accounts list response
 */
export function transformFinancialAccountsListResponse(response: any): FinancialAccount[] {
  if (!response) return [];

  const data = response.accounts || (Array.isArray(response) ? response : response.data || []);
  return data.map(transformFinancialAccountFromBackend);
}

/**
 * Transform budgets list response
 */
export function transformBudgetsListResponse(response: any): Budget[] {
  if (!response) return [];

  const data = response.budgets || (Array.isArray(response) ? response : response.data || []);
  return data.map(transformBudgetFromBackend);
}

/**
 * Transform category budgets list response
 */
export function transformCategoryBudgetsListResponse(response: any): BudgetApiResponse[] {
  if (!response) return [];

  const data = Array.isArray(response) ? response : response.data || [];
  return data.map(transformBudgetApiResponseFromBackend);
}

/**
 * Transform financial goals list response
 */
export function transformFinancialGoalsListResponse(response: any): {
  goals: FinancialGoal[];
  total: number;
} {
  if (!response) return { goals: [], total: 0 };

  const goals = response.goals || (Array.isArray(response) ? response : response.data || []);
  return {
    goals: goals.map(transformFinancialGoalFromBackend),
    total: response.total || goals.length,
  };
}

/**
 * Transform finance categories list response
 */
export function transformFinanceCategoriesListResponse(response: any): FinanceCategory[] {
  if (!response) return [];

  const data = Array.isArray(response) ? response : response.data || [];
  return data.map(transformFinanceCategoryFromBackend);
}

// ============================================================================
// Single Response Transformers
// ============================================================================

/**
 * Transform single expense response
 */
export function transformExpenseResponse(response: any): Expense | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformExpenseFromBackend(data) : null;
}

/**
 * Transform single income response
 */
export function transformIncomeResponse(response: any): Income | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformIncomeFromBackend(data) : null;
}

/**
 * Transform single budget response
 */
export function transformBudgetResponse(response: any): Budget | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformBudgetFromBackend(data) : null;
}

/**
 * Transform single financial goal response
 */
export function transformFinancialGoalResponse(response: any): FinancialGoal | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformFinancialGoalFromBackend(data) : null;
}

/**
 * Transform single financial account response
 */
export function transformFinancialAccountResponse(response: any): FinancialAccount | null {
  const data = transformSingleResponse<any>(response);
  return data ? transformFinancialAccountFromBackend(data) : null;
}
