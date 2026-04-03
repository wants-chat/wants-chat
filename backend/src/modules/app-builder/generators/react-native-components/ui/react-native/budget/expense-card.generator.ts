import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNExpenseCard = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'detailed' | 'list' | 'standard' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    if (fieldName.match(/items|expenses|transactions|list|array|data/i)) {
      return `propData?.${fieldName} || []`;
    }
    if (fieldName.match(/category|metadata|config|settings/i)) {
      return `propData?.${fieldName} || {}`;
    }
    return `propData?.${fieldName} || ''`;
  };

  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();
  const entityName = dataSource || 'items';

  const variants = {
    compact: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Expense {
  id: number | string;
  description: string;
  amount: number;
  currency: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  date: string;
  paymentMethod: string;
}

interface CompactExpenseCardProps {
  ${dataName}?: any;
  onExpensePress?: (expense: Expense) => void;
  onCategoryPress?: (categoryName: string, expenseId: number | string) => void;
  [key: string]: any; // Allow additional props from parent
}

export default function CompactExpenseCard({
  ${dataName}: propData,
  onExpensePress,
  onCategoryPress
}: CompactExpenseCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ${dataName} = propData || fetchedData;
  const extractedData = ${dataName}?.${entityName} || ${dataName}?.items || ${dataName}?.data || ${dataName};
  const rawExpenses: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const expensesList = rawExpenses.map((rawExpense: any) => ({
    ...rawExpense,
    id: rawExpense.id || rawExpense._id,
    description: rawExpense.description || rawExpense.title || 'Untitled Expense',
    amount: Number(rawExpense.amount) || 0,
    currency: rawExpense.currency || '$',
    category: {
      name: rawExpense.category?.name || rawExpense.category_name || rawExpense.category || 'Uncategorized',
      icon: rawExpense.category?.icon || rawExpense.category_icon || 'card-outline',
      color: rawExpense.category?.color || rawExpense.category_color || '#6b7280',
    },
    date: rawExpense.date || rawExpense.created_at ? new Date(rawExpense.date || rawExpense.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
    paymentMethod: rawExpense.payment_method || rawExpense.paymentMethod || 'Cash',
  }));

  const renderExpense = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => onExpensePress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.expenseLeft}>
        <TouchableOpacity
          style={[styles.categoryIcon, { backgroundColor: item.category.color + '20' }]}
          onPress={() => onCategoryPress?.(item.category.name, item.id)}
        >
          <Ionicons name={item.category.icon as any} size={20} color={item.category.color} />
        </TouchableOpacity>
        <View style={styles.expenseInfo}>
          <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.category}>{item.category.name}</Text>
        </View>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.amount}>-{item.currency}{item.amount.toFixed(2)}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={expensesList}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptySubtitle}>Your transactions will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  expenseCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
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
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: '#6b7280',
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
    `,

    detailed: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DetailedExpense {
  id: number | string;
  description: string;
  amount: number;
  currency: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  date: string;
  paymentMethod: string;
  notes?: string;
  receipt?: string;
  tags: string[];
}

interface DetailedExpenseCardProps {
  ${dataName}?: any;
  onExpensePress?: (expense: DetailedExpense) => void;
  onEdit?: (expenseId: number | string) => void;
  onDelete?: (expenseId: number | string) => void;
  onViewReceipt?: (receiptUrl: string) => void;
  [key: string]: any; // Allow additional props from parent
}

export default function DetailedExpenseCard({
  ${dataName}: propData,
  onExpensePress,
  onEdit,
  onDelete,
  onViewReceipt
}: DetailedExpenseCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ${dataName} = propData || fetchedData;
  const extractedData = ${dataName}?.${entityName} || ${dataName}?.items || ${dataName}?.data || ${dataName};
  const rawExpenses: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const expensesList = rawExpenses.map((rawExpense: any) => ({
    ...rawExpense,
    id: rawExpense.id || rawExpense._id,
    description: rawExpense.description || rawExpense.title || 'Untitled Expense',
    amount: Number(rawExpense.amount) || 0,
    currency: rawExpense.currency || '$',
    category: {
      name: rawExpense.category?.name || rawExpense.category_name || rawExpense.category || 'Uncategorized',
      icon: rawExpense.category?.icon || rawExpense.category_icon || 'card-outline',
      color: rawExpense.category?.color || rawExpense.category_color || '#6b7280',
    },
    date: rawExpense.date || rawExpense.created_at ? new Date(rawExpense.date || rawExpense.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
    paymentMethod: rawExpense.payment_method || rawExpense.paymentMethod || 'Cash',
    notes: rawExpense.notes || '',
    receipt: rawExpense.receipt || rawExpense.receipt_url || '',
    tags: rawExpense.tags || [],
  }));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {expensesList.map((expense) => (
        <TouchableOpacity
          key={expense.id}
          style={styles.expenseCard}
          onPress={() => onExpensePress?.(expense)}
          activeOpacity={0.95}
        >
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: expense.category.color + '20' }]}>
                <Ionicons name={expense.category.icon as any} size={24} color={expense.category.color} />
              </View>
              <View>
                <Text style={styles.description}>{expense.description}</Text>
                <Text style={styles.category}>{expense.category.name}</Text>
              </View>
            </View>
            <Text style={styles.amount}>{expense.currency}{expense.amount.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{expense.date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="card-outline" size={16} color="#6b7280" />
              <Text style={styles.detailLabel}>Payment:</Text>
              <Text style={styles.detailValue}>{expense.paymentMethod}</Text>
            </View>
          </View>

          {expense.notes && (
            <>
              <View style={styles.divider} />
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{expense.notes}</Text>
              </View>
            </>
          )}

          {expense.tags.length > 0 && (
            <View style={styles.tagsSection}>
              {expense.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actions}>
            {expense.receipt && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onViewReceipt?.(expense.receipt)}
              >
                <Ionicons name="receipt-outline" size={18} color="#3b82f6" />
                <Text style={styles.actionText}>Receipt</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit?.(expense.id)}
            >
              <Ionicons name="create-outline" size={18} color="#3b82f6" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete?.(expense.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
              <Text style={[styles.actionText, { color: '#ef4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  description: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ef4444',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  detailsSection: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
  },
  notesSection: {
    marginTop: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
    `,

    list: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ListExpense {
  id: number | string;
  description: string;
  amount: number;
  currency: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  date: string;
  time: string;
}

interface ListExpenseCardProps {
  ${dataName}?: any;
  onExpensePress?: (expense: ListExpense) => void;
  groupByDate?: boolean;
  [key: string]: any; // Allow additional props from parent
}

export default function ListExpenseCard({
  ${dataName}: propData,
  onExpensePress,
  groupByDate = true
}: ListExpenseCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ${dataName} = propData || fetchedData;
  const extractedData = ${dataName}?.${entityName} || ${dataName}?.items || ${dataName}?.data || ${dataName};
  const rawExpenses: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const expensesList = rawExpenses.map((rawExpense: any) => {
    const expenseDate = rawExpense.date || rawExpense.created_at ? new Date(rawExpense.date || rawExpense.created_at) : new Date();
    return {
      ...rawExpense,
      id: rawExpense.id || rawExpense._id,
      description: rawExpense.description || rawExpense.title || 'Untitled Expense',
      amount: Number(rawExpense.amount) || 0,
      currency: rawExpense.currency || '$',
      category: {
        name: rawExpense.category?.name || rawExpense.category_name || rawExpense.category || 'Uncategorized',
        icon: rawExpense.category?.icon || rawExpense.category_icon || 'card-outline',
        color: rawExpense.category?.color || rawExpense.category_color || '#6b7280',
      },
      date: expenseDate.toLocaleDateString(),
      time: expenseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: expenseDate.getTime(),
    };
  });

  // Group by date if enabled
  const groupedData = groupByDate
    ? expensesList.reduce((groups: any, expense: any) => {
        const date = expense.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(expense);
        return groups;
      }, {})
    : { 'All': expensesList };

  const sections = Object.keys(groupedData).map(date => ({
    title: date,
    data: groupedData[date],
    total: groupedData[date].reduce((sum: number, exp: any) => sum + exp.amount, 0),
  }));

  const renderExpense = ({ item }: { item: ListExpense }) => (
    <TouchableOpacity
      style={styles.expenseItem}
      onPress={() => onExpensePress?.(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.categoryDot, { backgroundColor: item.category.color }]} />
      <View style={styles.expenseContent}>
        <View style={styles.expenseMain}>
          <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
          <Text style={styles.amount}>-{item.currency}{item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.expenseMeta}>
          <Text style={styles.category}>{item.category.name}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSection = ({ item: section }: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionTotal}>-$\{section.total.toFixed(2)}</Text>
      </View>
      {section.data.map((expense: ListExpense) => (
        <View key={expense.id}>
          {renderExpense({ item: expense })}
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sections}
      renderItem={renderSection}
      keyExtractor={(item) => item.title}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    paddingVertical: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  sectionTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  expenseContent: {
    flex: 1,
  },
  expenseMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  expenseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 13,
    color: '#6b7280',
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
    `,

    standard: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Expense {
  id: number | string;
  description: string;
  amount: number;
  currency: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  date: string;
  paymentMethod: string;
}

interface StandardExpenseCardProps {
  ${dataName}?: any;
  onExpensePress?: (expense: Expense) => void;
  onCategoryPress?: (categoryName: string, expenseId: number | string) => void;
  onAddExpense?: () => void;
  [key: string]: any; // Allow additional props from parent
}

export default function StandardExpenseCard({
  ${dataName}: propData,
  onExpensePress,
  onCategoryPress,
  onAddExpense
}: StandardExpenseCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch ${entityName}:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const ${dataName} = propData || fetchedData;
  const extractedData = ${dataName}?.${entityName} || ${dataName}?.items || ${dataName}?.data || ${dataName};
  const rawExpenses: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const expensesList = rawExpenses.map((rawExpense: any) => ({
    ...rawExpense,
    id: rawExpense.id || rawExpense._id,
    description: rawExpense.description || rawExpense.title || 'Untitled Expense',
    amount: Number(rawExpense.amount) || 0,
    currency: rawExpense.currency || '$',
    category: {
      name: rawExpense.category?.name || rawExpense.category_name || rawExpense.category || 'Uncategorized',
      icon: rawExpense.category?.icon || rawExpense.category_icon || 'card-outline',
      color: rawExpense.category?.color || rawExpense.category_color || '#6b7280',
    },
    date: rawExpense.date || rawExpense.created_at ? new Date(rawExpense.date || rawExpense.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
    paymentMethod: rawExpense.payment_method || rawExpense.paymentMethod || 'Cash',
  }));

  const totalExpenses = expensesList.reduce((sum, exp) => sum + exp.amount, 0);
  const currency = expensesList.length > 0 ? expensesList[0].currency : '$';

  const renderExpense = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => onExpensePress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconSection}>
          <TouchableOpacity
            style={[styles.categoryIcon, { backgroundColor: item.category.color + '20' }]}
            onPress={() => onCategoryPress?.(item.category.name, item.id)}
          >
            <Ionicons name={item.category.icon as any} size={22} color={item.category.color} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{item.category.name}</Text>
            <Text style={styles.separator}>•</Text>
            <Ionicons name="calendar-outline" size={12} color="#9ca3af" />
            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amount}>-{item.currency}{item.amount.toFixed(2)}</Text>
          <View style={styles.paymentBadge}>
            <Ionicons name="card-outline" size={10} color="#6b7280" />
            <Text style={styles.paymentText}>{item.paymentMethod}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Recent Expenses</Text>
          <Text style={styles.headerSubtitle}>Track your spending</Text>
        </View>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>-{currency}\{totalExpenses.toFixed(2)}</Text>
        </View>
      </View>

      <FlatList
        data={expensesList}
        renderItem={renderExpense}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {onAddExpense && (
        <TouchableOpacity style={styles.fab} onPress={onAddExpense} activeOpacity={0.9}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  totalSection: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ef4444',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  expenseCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  iconSection: {
    marginRight: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: {
    fontSize: 13,
    color: '#6b7280',
  },
  separator: {
    fontSize: 12,
    color: '#d1d5db',
    marginHorizontal: 2,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 2,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ef4444',
    marginBottom: 6,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
    `
  };

  const code = variants[variant] || variants.standard;
  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
};
