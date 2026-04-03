/**
 * Finance Service
 * Handles all financial management API calls including expenses, budgets, accounts, and analytics
 */

import { api, ApiErrorResponse, getErrorMessage } from '../lib/api';
import { 
  FinanceCategory, 
  CreateCategoryBudgetRequest, 
  CategoryBudgetResponse, 
  BudgetApiResponse 
} from '../types/expense-tracker';

export interface FinancialAccount {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'cash' | 'other';
  provider?: string;
  accountNumber?: string; // masked
  balance: number;
  currency: string;
  isActive: boolean;
  lastSynced?: Date;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  accountId?: string;
  account?: FinancialAccount;
  amount: number;
  currency: string;
  description: string;
  category: string;
  subcategory?: string;
  date: Date;
  location?: string;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'other';
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  tags?: string[];
  attachments?: Array<{
    filename: string;
    url: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Income {
  id: string;
  userId: string;
  accountId?: string;
  account?: FinancialAccount;
  amount: number;
  currency: string;
  source: string;
  category: 'salary' | 'freelance' | 'investment' | 'business' | 'rental' | 'other';
  date: Date;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  taxable: boolean;
  description?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  name: string;
  categories: BudgetCategory[];
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  totalBudget: number;
  totalSpent: number;
  currency: string;
  isActive: boolean;
  notifications: {
    enabled: boolean;
    thresholds: number[]; // percentage thresholds for alerts
  };
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  category: string;
  subcategories?: string[];
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
  color?: string;
}

export interface FinancialGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund' | 'other';
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate?: Date;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  linkedAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  currency: string;
  accounts: FinancialAccount[];
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
  budgetStatus: Array<{ budgetId: string; name: string; usage: number; status: 'on_track' | 'warning' | 'exceeded' }>;
}

export interface TransactionAnalytics {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  expensesByCategory: Array<{ category: string; amount: number; count: number }>;
  incomeBySource: Array<{ source: string; amount: number; count: number }>;
  trends: {
    incomeGrowth: number; // percentage
    expenseGrowth: number; // percentage
    savingsRate: number; // percentage
  };
  topMerchants: Array<{ name: string; amount: number; count: number }>;
}


export interface QueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
  accountId?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

class FinanceService {
  /**
   * Get all financial accounts
   */
  async getFinancialAccounts(): Promise<FinancialAccount[]> {
    try {
      const response = await api.getFinancialAccounts();
      return response.accounts || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FINANCIAL_ACCOUNTS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get financial account by ID
   */
  async getFinancialAccount(id: string): Promise<FinancialAccount> {
    try {
      return await api.request(`/finance/accounts/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FINANCIAL_ACCOUNT_FETCH_FAILED'
      );
    }
  }

  /**
   * Create financial account
   */
  async createFinancialAccount(accountData: Omit<FinancialAccount, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<FinancialAccount> {
    try {
      return await api.createFinancialAccount(accountData);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FINANCIAL_ACCOUNT_CREATE_FAILED'
      );
    }
  }

  /**
   * Update financial account
   */
  async updateFinancialAccount(id: string, accountData: Partial<FinancialAccount>): Promise<FinancialAccount> {
    try {
      return await api.request(`/finance/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(accountData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FINANCIAL_ACCOUNT_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete financial account
   */
  async deleteFinancialAccount(id: string): Promise<void> {
    try {
      await api.request(`/finance/accounts/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FINANCIAL_ACCOUNT_DELETE_FAILED'
      );
    }
  }

  /**
   * Get expenses with optional filtering
   */
  async getExpenses(params?: QueryParams): Promise<{ data: Expense[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.getExpenses(params);
      // Backend returns { data: [], total, page, limit, total_pages }
      return response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXPENSES_FETCH_FAILED'
      );
    }
  }

  /**
   * Get transactions with date filtering
   */
  async getTransactions(params?: { start_date?: string; end_date?: string; page?: number; limit?: number }): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.start_date) queryParams.append('start_date', params.start_date);
      if (params?.end_date) queryParams.append('end_date', params.end_date);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `/finance/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await api.request(url);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRANSACTIONS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get expense by ID
   */
  async getExpense(id: string): Promise<Expense> {
    try {
      return await api.request(`/finance/expenses/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXPENSE_FETCH_FAILED'
      );
    }
  }

  /**
   * Create expense
   */
  async createExpense(expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    try {
      return await api.createExpense(expenseData);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXPENSE_CREATE_FAILED'
      );
    }
  }

  /**
   * Update expense
   */
  async updateExpense(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    try {
      return await api.request(`/finance/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXPENSE_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete expense
   */
  async deleteExpense(id: string): Promise<void> {
    try {
      await api.deleteExpense(id);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'EXPENSE_DELETE_FAILED'
      );
    }
  }

  /**
   * Get income records
   */
  async getIncome(params?: QueryParams): Promise<{ data: Income[]; total: number; page: number; limit: number }> {
    try {
      const response = await api.request(`/finance/income${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
      
      // Transform the response to match the expected format for usePaginatedApi
      if (response.income) {
        return {
          data: response.income,
          total: response.total || response.income.length,
          page: response.page || params?.page || 1,
          limit: response.limit || params?.limit || 20
        };
      }
      
      // If response has data field (already in correct format)
      if (response.data) {
        return response;
      }
      
      // Fallback: wrap response in data field
      return {
        data: Array.isArray(response) ? response : [],
        total: Array.isArray(response) ? response.length : 0,
        page: params?.page || 1,
        limit: params?.limit || 20
      };
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'INCOME_FETCH_FAILED'
      );
    }
  }

  /**
   * Create income record
   */
  async createIncome(incomeData: Omit<Income, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Income> {
    try {
      return await api.request('/finance/income', {
        method: 'POST',
        body: JSON.stringify(incomeData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'INCOME_CREATE_FAILED'
      );
    }
  }

  /**
   * Update income record
   */
  async updateIncome(id: string, incomeData: Partial<Income>): Promise<Income> {
    try {
      return await api.request(`/finance/income/${id}`, {
        method: 'PUT',
        body: JSON.stringify(incomeData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'INCOME_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete income record
   */
  async deleteIncome(id: string): Promise<void> {
    try {
      await api.request(`/finance/income/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'INCOME_DELETE_FAILED'
      );
    }
  }

  /**
   * Get budgets
   */
  async getBudgets(): Promise<Budget[]> {
    try {
      const response = await api.getBudgets();
      return response.budgets || response;
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BUDGETS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get budget by ID
   */
  async getBudget(id: string): Promise<Budget> {
    try {
      return await api.request(`/finance/budgets/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BUDGET_FETCH_FAILED'
      );
    }
  }

  /**
   * Create budget
   */
  async createBudget(budgetData: Omit<Budget, 'id' | 'userId' | 'totalSpent' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    try {
      return await api.createBudget(budgetData);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BUDGET_CREATE_FAILED'
      );
    }
  }

  /**
   * Update budget
   */
  async updateBudget(id: string, budgetData: Partial<Budget>): Promise<Budget> {
    try {
      return await api.request(`/finance/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(budgetData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BUDGET_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete budget
   */
  async deleteBudget(id: string): Promise<void> {
    try {
      await api.request(`/finance/budgets/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'BUDGET_DELETE_FAILED'
      );
    }
  }

  /**
   * Get financial goals
   */
  async getFinancialGoals(params?: QueryParams): Promise<{ goals: FinancialGoal[]; total: number }> {
    try {
      return await api.request(`/finance/goals${params ? `?${new URLSearchParams(params as any).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FINANCIAL_GOALS_FETCH_FAILED'
      );
    }
  }

  /**
   * Create financial goal
   */
  async createFinancialGoal(goalData: Omit<FinancialGoal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<FinancialGoal> {
    try {
      return await api.request('/finance/goals', {
        method: 'POST',
        body: JSON.stringify(goalData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FINANCIAL_GOAL_CREATE_FAILED'
      );
    }
  }

  /**
   * Update financial goal
   */
  async updateFinancialGoal(id: string, goalData: Partial<FinancialGoal>): Promise<FinancialGoal> {
    try {
      return await api.request(`/finance/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(goalData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FINANCIAL_GOAL_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete financial goal
   */
  async deleteFinancialGoal(id: string): Promise<void> {
    try {
      await api.request(`/finance/goals/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FINANCIAL_GOAL_DELETE_FAILED'
      );
    }
  }

  /**
   * Get financial summary/dashboard data
   */
  async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      return await api.getFinancialSummary();
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'FINANCIAL_SUMMARY_FETCH_FAILED'
      );
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<any> {
    try {
      return await api.request(`/finance/transactions/${id}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRANSACTION_FETCH_FAILED'
      );
    }
  }

  /**
   * Update transaction by ID
   */
  async updateTransaction(id: string, transactionData: any): Promise<any> {
    try {
      return await api.request(`/finance/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transactionData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRANSACTION_UPDATE_FAILED'
      );
    }
  }

  /**
   * Delete transaction by ID
   */
  async deleteTransaction(id: string): Promise<void> {
    try {
      await api.request(`/finance/transactions/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRANSACTION_DELETE_FAILED'
      );
    }
  }

  /**
   * Get transaction analytics
   */
  async getTransactionAnalytics(period: 'week' | 'month' | 'quarter' | 'year' | 'custom', startDate?: string, endDate?: string): Promise<TransactionAnalytics> {
    try {
      const params: any = { period };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      return await api.request(`/finance/analytics${params ? `?${new URLSearchParams(params).toString()}` : ''}`);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'TRANSACTION_ANALYTICS_FETCH_FAILED'
      );
    }
  }

  /**
   * Get spending categories
   */
  async getSpendingCategories(): Promise<FinanceCategory[]> {
    try {
      return await api.request('/finance/categories');
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'SPENDING_CATEGORIES_FETCH_FAILED'
      );
    }
  }

  /**
   * Create category budget
   */
  async createCategoryBudget(budgetData: CreateCategoryBudgetRequest): Promise<CategoryBudgetResponse> {
    try {
      return await api.request('/finance/budget', {
        method: 'POST',
        body: JSON.stringify(budgetData),
      });
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CATEGORY_BUDGET_CREATE_FAILED'
      );
    }
  }

  /**
   * Get category budgets with optional month/year filtering
   */
  async getCategoryBudgets(params?: { month?: number; year?: number }): Promise<BudgetApiResponse[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.month) queryParams.append('month', params.month.toString());
      if (params?.year) queryParams.append('year', params.year.toString());
      
      const url = `/finance/budget${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await api.request(url);
    } catch (error) {
      throw new ApiErrorResponse(
        getErrorMessage(error),
        error instanceof ApiErrorResponse ? error.statusCode : 500,
        'CATEGORY_BUDGETS_FETCH_FAILED'
      );
    }
  }
}

export const financeService = new FinanceService();