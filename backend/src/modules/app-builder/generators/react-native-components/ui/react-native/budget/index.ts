/**
 * Budget & Expense Tracker Component Generators for React Native
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Re-export existing generators
export { generateRNExpenseCard } from './expense-card.generator';
export { generateRNBudgetProgressCard } from './budget-progress-card.generator';
export { generateRNFinancialGoalCard } from './financial-goal-card.generator';

// Expense List
export function generateRNExpenseList(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  categoryIcon?: string;
  date: string;
  note?: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  currency?: string;
  onExpensePress?: (expense: Expense) => void;
  onAddExpense?: () => void;
}

export default function ExpenseList({ expenses, currency = '$', onExpensePress, onAddExpense }: ExpenseListProps) {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      food: 'restaurant',
      transport: 'car',
      shopping: 'bag',
      entertainment: 'game-controller',
      utilities: 'flash',
      health: 'medical',
      education: 'school',
      other: 'ellipsis-horizontal',
    };
    return icons[category.toLowerCase()] || 'cash';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      food: '#f59e0b',
      transport: '#3b82f6',
      shopping: '#ec4899',
      entertainment: '#8b5cf6',
      utilities: '#06b6d4',
      health: '#ef4444',
      education: '#22c55e',
      other: '#6b7280',
    };
    return colors[category.toLowerCase()] || '#6b7280';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        {onAddExpense && (
          <TouchableOpacity style={styles.addButton} onPress={onAddExpense}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const iconColor = getCategoryColor(item.category);
          return (
            <TouchableOpacity style={styles.expenseItem} onPress={() => onExpensePress?.(item)}>
              <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={getCategoryIcon(item.category) as any} size={20} color={iconColor} />
              </View>
              <View style={styles.expenseInfo}>
                <Text style={styles.expenseTitle}>{item.title}</Text>
                <Text style={styles.expenseCategory}>{item.category} • {item.date}</Text>
              </View>
              <Text style={styles.expenseAmount}>-{currency}{item.amount.toFixed(2)}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No expenses yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  expenseCategory: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';"],
  };
}

// Transaction History
export function generateRNTransactionHistory(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SectionList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  time: string;
}

interface TransactionSection {
  title: string;
  data: Transaction[];
}

interface TransactionHistoryProps {
  sections: TransactionSection[];
  currency?: string;
  onTransactionPress?: (transaction: Transaction) => void;
}

export default function TransactionHistory({ sections, currency = '$', onTransactionPress }: TransactionHistoryProps) {
  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.transactionItem} onPress={() => onTransactionPress?.(item)}>
            <View style={[styles.typeIndicator, item.type === 'income' ? styles.income : styles.expense]}>
              <Ionicons
                name={item.type === 'income' ? 'arrow-down' : 'arrow-up'}
                size={16}
                color={item.type === 'income' ? '#16a34a' : '#dc2626'}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{item.title}</Text>
              <Text style={styles.transactionMeta}>{item.category} • {item.time}</Text>
            </View>
            <Text style={[styles.amount, item.type === 'income' ? styles.incomeText : styles.expenseText]}>
              {item.type === 'income' ? '+' : '-'}{currency}{Math.abs(item.amount).toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="swap-vertical" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No transactions</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  sectionHeader: {
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  typeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  income: {
    backgroundColor: '#dcfce7',
  },
  expense: {
    backgroundColor: '#fef2f2',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  transactionMeta: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeText: {
    color: '#16a34a',
  },
  expenseText: {
    color: '#dc2626',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, SectionList } from 'react-native';"],
  };
}

// Category Spending
export function generateRNCategorySpending(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
  budget: number;
}

interface CategorySpendingProps {
  categories: CategoryData[];
  currency?: string;
  onCategoryPress?: (category: CategoryData) => void;
}

export default function CategorySpending({ categories, currency = '$', onCategoryPress }: CategorySpendingProps) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Spending by Category</Text>

      {categories.map((category) => {
        const percentage = Math.min((category.spent / category.budget) * 100, 100);
        const isOverBudget = category.spent > category.budget;

        return (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => onCategoryPress?.(category)}
          >
            <View style={styles.categoryHeader}>
              <View style={[styles.iconContainer, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon as any} size={20} color={category.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryBudget}>
                  {currency}{category.spent.toFixed(0)} / {currency}{category.budget.toFixed(0)}
                </Text>
              </View>
              <View style={styles.percentageContainer}>
                <Text style={[styles.percentage, isOverBudget && styles.overBudget]}>
                  {percentage.toFixed(0)}%
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: category.color + '30' }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: \`\${percentage}%\`, backgroundColor: isOverBudget ? '#ef4444' : category.color },
                  ]}
                />
              </View>
            </View>

            {isOverBudget && (
              <View style={styles.warningContainer}>
                <Ionicons name="warning" size={14} color="#ef4444" />
                <Text style={styles.warningText}>
                  Over budget by {currency}{(category.spent - category.budget).toFixed(0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryBudget: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  percentageContainer: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  overBudget: {
    color: '#ef4444',
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  warningText: {
    fontSize: 12,
    color: '#ef4444',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Budget Overview
export function generateRNBudgetOverview(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  currency?: string;
  period?: string;
  categories?: { name: string; spent: number; color: string }[];
  onViewDetails?: () => void;
  onAddBudget?: () => void;
}

export default function BudgetOverview({
  totalBudget,
  totalSpent,
  remaining,
  currency = '$',
  period = 'This Month',
  categories = [],
  onViewDetails,
  onAddBudget,
}: BudgetOverviewProps) {
  const percentage = Math.min((totalSpent / totalBudget) * 100, 100);
  const isOverBudget = remaining < 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.period}>{period}</Text>
        {onAddBudget && (
          <TouchableOpacity style={styles.addButton} onPress={onAddBudget}>
            <Ionicons name="add" size={18} color="#3b82f6" />
            <Text style={styles.addButtonText}>Set Budget</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.mainStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Budget</Text>
            <Text style={styles.statValue}>{currency}{totalBudget.toLocaleString()}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={[styles.statValue, styles.spentValue]}>{currency}{totalSpent.toLocaleString()}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[styles.statValue, isOverBudget ? styles.overBudget : styles.remainingValue]}>
              {currency}{Math.abs(remaining).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: \`\${percentage}%\` }, isOverBudget && styles.progressOverBudget]} />
          </View>
          <Text style={styles.progressText}>{percentage.toFixed(0)}% used</Text>
        </View>

        {isOverBudget && (
          <View style={styles.warningBanner}>
            <Ionicons name="warning" size={18} color="#dc2626" />
            <Text style={styles.warningText}>You've exceeded your budget by {currency}{Math.abs(remaining)}</Text>
          </View>
        )}
      </View>

      {categories.length > 0 && (
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spending Breakdown</Text>
            <TouchableOpacity onPress={onViewDetails}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {categories.slice(0, 4).map((category, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categorySpent}>{currency}{category.spent.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  period: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mainStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  spentValue: {
    color: '#f59e0b',
  },
  remainingValue: {
    color: '#16a34a',
  },
  overBudget: {
    color: '#dc2626',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressOverBudget: {
    backgroundColor: '#ef4444',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#dc2626',
    flex: 1,
  },
  categoriesSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  categorySpent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}
