import { ReactNode } from 'react';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  description: string;
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer';
  icon: ReactNode;
  backgroundColor: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  budgetAmount: number;
  spent: number;
  icon?: ReactNode;
}

export interface Notification {
  id: string;
  type: 'budget' | 'expense' | 'reminder' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export type TabType = 'dashboard' | 'expenses' | 'analytics' | 'budget';

export interface FinanceCategory {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  // Legacy snake_case for backward compatibility
  sort_order?: number;
}

export interface CreateCategoryBudgetRequest {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  // Legacy
  category_id?: string;
}

export interface CategoryBudgetResponse {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  // Legacy
  category_id?: string;
}

export interface BudgetApiResponse {
  id: string;
  userId: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    description: string;
    icon: string | null;
    color: string | null;
  };
  amount: number;
  remainingAmount: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
  spentAmount: number;
  usagePercentage: number;
  // Legacy snake_case for backward compatibility
  user_id?: string;
  category_id?: string;
  remaining_amount?: number;
  created_at?: string;
  updated_at?: string;
  spent_amount?: number;
  usage_percentage?: number;
}