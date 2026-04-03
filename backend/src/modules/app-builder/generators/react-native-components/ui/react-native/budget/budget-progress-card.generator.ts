import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNBudgetProgressCard = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'detailed' | 'grid' | 'standard' = 'standard'
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
    if (fieldName.match(/items|budgets|list|array|data/i)) {
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

interface Budget {
  id: number | string;
  name: string;
  amount: number;
  spent: number;
  currency: string;
  period: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

interface CompactBudgetProgressCardProps {
  ${dataName}?: any;
  onBudgetPress?: (budget: Budget) => void;
  [key: string]: any; // Allow additional props from parent
}

export default function CompactBudgetProgressCard({
  ${dataName}: propData,
  onBudgetPress
}: CompactBudgetProgressCardProps) {
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
  const rawBudgets: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const budgetsList = rawBudgets.map((rawBudget: any) => {
    const spent = rawBudget.spent || rawBudget.current_amount || 0;
    const amount = rawBudget.amount || rawBudget.limit || rawBudget.budget_amount || 1;
    const percentage = (spent / amount) * 100;

    return {
      ...rawBudget,
      id: rawBudget.id || rawBudget._id,
      name: rawBudget.name || rawBudget.title || 'Untitled Budget',
      amount,
      spent,
      percentage: Math.min(percentage, 100),
      currency: rawBudget.currency || '$',
      period: rawBudget.period || 'Monthly',
      category: {
        name: rawBudget.category?.name || rawBudget.category_name || rawBudget.category || 'General',
        icon: rawBudget.category?.icon || rawBudget.category_icon || 'wallet-outline',
        color: rawBudget.category?.color || rawBudget.category_color || '#3b82f6',
      },
    };
  });

  const getProgressColor = (percentage: number) => {
    if (percentage < 60) return '#10b981';
    if (percentage < 85) return '#f59e0b';
    return '#ef4444';
  };

  const renderBudget = ({ item }: { item: Budget }) => {
    const progressColor = getProgressColor(item.percentage);
    const remaining = item.amount - item.spent;

    return (
      <TouchableOpacity
        style={styles.budgetCard}
        onPress={() => onBudgetPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.budgetHeader}>
          <View style={styles.budgetLeft}>
            <View style={[styles.categoryIcon, { backgroundColor: item.category.color + '20' }]}>
              <Ionicons name={item.category.icon as any} size={18} color={item.category.color} />
            </View>
            <View>
              <Text style={styles.budgetName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.period}>{item.period}</Text>
            </View>
          </View>
          <Text style={styles.percentage}>{item.percentage.toFixed(0)}%</Text>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBar, { width: \`\${item.percentage}%\`, backgroundColor: progressColor }]} />
          </View>
        </View>

        <View style={styles.budgetFooter}>
          <Text style={styles.spent}>
            {item.currency}{item.spent.toFixed(2)} spent
          </Text>
          <Text style={[styles.remaining, { color: remaining >= 0 ? '#10b981' : '#ef4444' }]}>
            {remaining >= 0 ? item.currency + remaining.toFixed(2) : '-' + item.currency + Math.abs(remaining).toFixed(2)} left
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading budgets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={budgetsList}
        renderItem={renderBudget}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
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
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  period: {
    fontSize: 12,
    color: '#6b7280',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  progressBarContainer: {
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spent: {
    fontSize: 13,
    color: '#6b7280',
  },
  remaining: {
    fontSize: 13,
    fontWeight: '600',
  },
});
    `,

    detailed: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DetailedBudget {
  id: number | string;
  name: string;
  amount: number;
  spent: number;
  currency: string;
  period: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  startDate: string;
  endDate: string;
  alertThreshold: number;
}

interface DetailedBudgetProgressCardProps {
  ${dataName}?: any;
  onBudgetPress?: (budget: DetailedBudget) => void;
  onEdit?: (budgetId: number | string) => void;
  onViewDetails?: (budgetId: number | string) => void;
  [key: string]: any;
}

export default function DetailedBudgetProgressCard({
  ${dataName}: propData,
  onBudgetPress,
  onEdit,
  onViewDetails
}: DetailedBudgetProgressCardProps) {
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
  const rawBudgets: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const budgetsList = rawBudgets.map((rawBudget: any) => {
    const spent = rawBudget.spent || rawBudget.current_amount || 0;
    const amount = rawBudget.amount || rawBudget.limit || rawBudget.budget_amount || 1;
    const percentage = (spent / amount) * 100;

    return {
      ...rawBudget,
      id: rawBudget.id || rawBudget._id,
      name: rawBudget.name || rawBudget.title || 'Untitled Budget',
      amount,
      spent,
      percentage: Math.min(percentage, 100),
      currency: rawBudget.currency || '$',
      period: rawBudget.period || 'Monthly',
      category: {
        name: rawBudget.category?.name || rawBudget.category_name || rawBudget.category || 'General',
        icon: rawBudget.category?.icon || rawBudget.category_icon || 'wallet-outline',
        color: rawBudget.category?.color || rawBudget.category_color || '#3b82f6',
      },
      startDate: rawBudget.start_date ? new Date(rawBudget.start_date).toLocaleDateString() : '',
      endDate: rawBudget.end_date ? new Date(rawBudget.end_date).toLocaleDateString() : '',
      alertThreshold: rawBudget.alert_threshold || 80,
    };
  });

  const getProgressColor = (percentage: number) => {
    if (percentage < 60) return '#10b981';
    if (percentage < 85) return '#f59e0b';
    return '#ef4444';
  };

  const getStatus = (percentage: number, threshold: number) => {
    if (percentage >= 100) return { label: 'Exceeded', color: '#ef4444', icon: 'alert-circle' };
    if (percentage >= threshold) return { label: 'Warning', color: '#f59e0b', icon: 'warning' };
    if (percentage >= 60) return { label: 'On Track', color: '#3b82f6', icon: 'checkmark-circle' };
    return { label: 'Good', color: '#10b981', icon: 'checkmark-circle' };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading budgets...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {budgetsList.map((budget) => {
        const progressColor = getProgressColor(budget.percentage);
        const remaining = budget.amount - budget.spent;
        const status = getStatus(budget.percentage, budget.alertThreshold);

        return (
          <TouchableOpacity
            key={budget.id}
            style={styles.budgetCard}
            onPress={() => onBudgetPress?.(budget)}
            activeOpacity={0.95}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={[styles.categoryIcon, { backgroundColor: budget.category.color + '20' }]}>
                  <Ionicons name={budget.category.icon as any} size={24} color={budget.category.color} />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.budgetName}>{budget.name}</Text>
                  <Text style={styles.category}>{budget.category.name}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                <Ionicons name={status.icon as any} size={14} color={status.color} />
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>

            <View style={styles.amountSection}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Spent</Text>
                <Text style={[styles.amountValue, { color: progressColor }]}>
                  {budget.currency}{budget.spent.toFixed(2)}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Budget</Text>
                <Text style={styles.amountValue}>
                  {budget.currency}{budget.amount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Remaining</Text>
                <Text style={[styles.amountValue, { color: remaining >= 0 ? '#10b981' : '#ef4444' }]}>
                  {remaining >= 0 ? budget.currency : '-' + budget.currency}
                  {Math.abs(remaining).toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={[styles.progressPercentage, { color: progressColor }]}>
                  {budget.percentage.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBar, { width: \`\${budget.percentage}%\`, backgroundColor: progressColor }]} />
                </View>
                {budget.alertThreshold && (
                  <View
                    style={[styles.thresholdMarker, { left: \`\${budget.alertThreshold}%\` }]}
                  />
                )}
              </View>
            </View>

            {(budget.startDate || budget.endDate) && (
              <View style={styles.dateSection}>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                  <Text style={styles.dateLabel}>Period:</Text>
                  <Text style={styles.dateValue}>
                    {budget.startDate} - {budget.endDate}
                  </Text>
                </View>
                <Text style={styles.periodBadge}>{budget.period}</Text>
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onViewDetails?.(budget.id)}
              >
                <Ionicons name="eye-outline" size={18} color="#3b82f6" />
                <Text style={styles.actionText}>Details</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit?.(budget.id)}
              >
                <Ionicons name="create-outline" size={18} color="#3b82f6" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      })}
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
  budgetCard: {
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    position: 'relative',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 12,
    backgroundColor: '#f59e0b',
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  dateValue: {
    fontSize: 13,
    color: '#111827',
  },
  periodBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
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

    grid: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GridBudget {
  id: number | string;
  name: string;
  amount: number;
  spent: number;
  currency: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

interface GridBudgetProgressCardProps {
  ${dataName}?: any;
  onBudgetPress?: (budget: GridBudget) => void;
  [key: string]: any;
}

export default function GridBudgetProgressCard({
  ${dataName}: propData,
  onBudgetPress
}: GridBudgetProgressCardProps) {
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
  const rawBudgets: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const budgetsList = rawBudgets.map((rawBudget: any) => {
    const spent = rawBudget.spent || rawBudget.current_amount || 0;
    const amount = rawBudget.amount || rawBudget.limit || rawBudget.budget_amount || 1;
    const percentage = (spent / amount) * 100;

    return {
      ...rawBudget,
      id: rawBudget.id || rawBudget._id,
      name: rawBudget.name || rawBudget.title || 'Untitled Budget',
      amount,
      spent,
      percentage: Math.min(percentage, 100),
      currency: rawBudget.currency || '$',
      category: {
        name: rawBudget.category?.name || rawBudget.category_name || rawBudget.category || 'General',
        icon: rawBudget.category?.icon || rawBudget.category_icon || 'wallet-outline',
        color: rawBudget.category?.color || rawBudget.category_color || '#3b82f6',
      },
    };
  });

  const getProgressColor = (percentage: number) => {
    if (percentage < 60) return '#10b981';
    if (percentage < 85) return '#f59e0b';
    return '#ef4444';
  };

  const renderBudget = ({ item }: { item: GridBudget }) => {
    const progressColor = getProgressColor(item.percentage);
    const remaining = item.amount - item.spent;

    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => onBudgetPress?.(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: item.category.color + '20' }]}>
          <Ionicons name={item.category.icon as any} size={28} color={item.category.color} />
        </View>

        <Text style={styles.budgetName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.category} numberOfLines={1}>{item.category.name}</Text>

        <View style={styles.amountContainer}>
          <Text style={styles.spent}>{item.currency}{item.spent.toFixed(0)}</Text>
          <Text style={styles.total}>of {item.currency}{item.amount.toFixed(0)}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: \`\${item.percentage}%\`, backgroundColor: progressColor }]} />
          </View>
          <Text style={[styles.percentage, { color: progressColor }]}>
            {item.percentage.toFixed(0)}%
          </Text>
        </View>

        <Text style={[styles.remaining, { color: remaining >= 0 ? '#10b981' : '#ef4444' }]}>
          {remaining >= 0 ? item.currency + remaining.toFixed(0) + ' left' : 'Over budget'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading budgets...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={budgetsList}
      renderItem={renderBudget}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      columnWrapperStyle={styles.row}
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
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    maxWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 12,
  },
  amountContainer: {
    marginBottom: 12,
  },
  spent: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  total: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progress: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  remaining: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
    `,

    standard: `
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Budget {
  id: number | string;
  name: string;
  amount: number;
  spent: number;
  currency: string;
  period: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
}

interface StandardBudgetProgressCardProps {
  ${dataName}?: any;
  onBudgetPress?: (budget: Budget) => void;
  onAddBudget?: () => void;
  [key: string]: any;
}

export default function StandardBudgetProgressCard({
  ${dataName}: propData,
  onBudgetPress,
  onAddBudget
}: StandardBudgetProgressCardProps) {
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
  const rawBudgets: any[] = Array.isArray(${dataName})
    ? ${dataName}
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  const budgetsList = rawBudgets.map((rawBudget: any) => {
    const spent = rawBudget.spent || rawBudget.current_amount || 0;
    const amount = rawBudget.amount || rawBudget.limit || rawBudget.budget_amount || 1;
    const percentage = (spent / amount) * 100;

    return {
      ...rawBudget,
      id: rawBudget.id || rawBudget._id,
      name: rawBudget.name || rawBudget.title || 'Untitled Budget',
      amount,
      spent,
      percentage: Math.min(percentage, 100),
      currency: rawBudget.currency || '$',
      period: rawBudget.period || 'Monthly',
      category: {
        name: rawBudget.category?.name || rawBudget.category_name || rawBudget.category || 'General',
        icon: rawBudget.category?.icon || rawBudget.category_icon || 'wallet-outline',
        color: rawBudget.category?.color || rawBudget.category_color || '#3b82f6',
      },
    };
  });

  const totalBudget = budgetsList.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetsList.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage < 60) return '#10b981';
    if (percentage < 85) return '#f59e0b';
    return '#ef4444';
  };

  const renderBudget = ({ item }: { item: Budget }) => {
    const progressColor = getProgressColor(item.percentage);
    const remaining = item.amount - item.spent;

    return (
      <TouchableOpacity
        style={styles.budgetCard}
        onPress={() => onBudgetPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.budgetHeader}>
          <View style={styles.budgetLeft}>
            <View style={[styles.categoryIcon, { backgroundColor: item.category.color + '20' }]}>
              <Ionicons name={item.category.icon as any} size={20} color={item.category.color} />
            </View>
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.category}>{item.category.name} • {item.period}</Text>
            </View>
          </View>
          <View style={styles.budgetRight}>
            <Text style={[styles.percentage, { color: progressColor }]}>
              {item.percentage.toFixed(0)}%
            </Text>
            <Text style={[styles.remaining, { color: remaining >= 0 ? '#10b981' : '#ef4444' }]}>
              {remaining >= 0 ? item.currency + remaining.toFixed(0) : 'Over'}
            </Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBar, { width: \`\${item.percentage}%\`, backgroundColor: progressColor }]} />
          </View>
        </View>

        <View style={styles.budgetFooter}>
          <Text style={styles.spent}>
            {item.currency}{item.spent.toFixed(2)} spent
          </Text>
          <Text style={styles.limit}>
            of {item.currency}{item.amount.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading budgets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Budget Progress</Text>
          <Text style={styles.headerSubtitle}>Track your spending limits</Text>
        </View>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Overall</Text>
          <Text style={[styles.totalPercentage, { color: getProgressColor(overallPercentage) }]}>
            {overallPercentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      <FlatList
        data={budgetsList}
        renderItem={renderBudget}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {onAddBudget && (
        <TouchableOpacity style={styles.fab} onPress={onAddBudget} activeOpacity={0.9}>
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
  totalPercentage: {
    fontSize: 24,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetLeft: {
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
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#6b7280',
  },
  budgetRight: {
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  remaining: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 10,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  limit: {
    fontSize: 13,
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
