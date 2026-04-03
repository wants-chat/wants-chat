/**
 * Banking Budget Component Generators for React Native
 *
 * Generates budget management components:
 * - Budget Form for creating/editing budgets
 * - Budget Overview with progress tracking
 */

export interface BudgetOptions {
  componentName?: string;
  endpoint?: string;
  budgetDetailScreen?: string;
}

export function generateBudgetForm(options: BudgetOptions = {}): string {
  const {
    componentName = 'BudgetForm',
    endpoint = '/banking/budgets',
  } = options;

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

type RouteParams = {
  BudgetForm: { id?: string };
};

interface BudgetFormData {
  name: string;
  category: string;
  amount: string;
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
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

const periods: Array<'weekly' | 'monthly' | 'quarterly' | 'yearly'> = [
  'weekly', 'monthly', 'quarterly', 'yearly'
];

function ${componentName}() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'BudgetForm'>>();
  const id = route.params?.id;
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
      showToast('success', isEditing ? 'Budget updated!' : 'Budget created!');
      navigation.goBack();
    },
    onError: () => showToast('error', 'Failed to save budget'),
  });

  const handleSubmit = () => {
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Budget' : 'Create Budget'}
        </Text>
        <View style={styles.headerButton} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Budget Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Budget Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="e.g., Monthly Groceries"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categories.map((cat) => {
              const value = cat.toLowerCase().replace(/ & /g, '-');
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    formData.category === value && styles.categoryChipActive
                  ]}
                  onPress={() => updateField('category', value)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    formData.category === value && styles.categoryChipTextActive
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>Budget Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={formData.amount}
              onChangeText={(value) => updateField('amount', value)}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Period */}
        <View style={styles.section}>
          <Text style={styles.label}>Budget Period</Text>
          <View style={styles.periodGrid}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  formData.period === period && styles.periodButtonActive
                ]}
                onPress={() => updateField('period', period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  formData.period === period && styles.periodButtonTextActive
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color */}
        <View style={styles.section}>
          <Text style={styles.label}>Color</Text>
          <View style={styles.colorGrid}>
            {defaultColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  formData.color === color && styles.colorButtonActive
                ]}
                onPress={() => updateField('color', color)}
              >
                {formData.color === color && (
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Alert Threshold */}
        <View style={styles.section}>
          <Text style={styles.label}>Alert at {formData.alert_threshold}% spent</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>50%</Text>
            <View style={styles.sliderButtons}>
              {['50', '60', '70', '80', '90', '100'].map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.sliderButton,
                    formData.alert_threshold === value && styles.sliderButtonActive
                  ]}
                  onPress={() => updateField('alert_threshold', value)}
                >
                  <Text style={[
                    styles.sliderButtonText,
                    formData.alert_threshold === value && styles.sliderButtonTextActive
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sliderLabel}>100%</Text>
          </View>
        </View>

        {/* Toggle Options */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Auto-renew each period</Text>
              <Text style={styles.toggleDescription}>
                Automatically create new budget
              </Text>
            </View>
            <Switch
              value={formData.is_recurring}
              onValueChange={(value) => updateField('is_recurring', value)}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={formData.is_recurring ? '#3B82F6' : '#F3F4F6'}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Roll over unused</Text>
              <Text style={styles.toggleDescription}>
                Add remaining balance to next period
              </Text>
            </View>
            <Switch
              value={formData.rollover_unused}
              onValueChange={(value) => updateField('rollover_unused', value)}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={formData.rollover_unused ? '#3B82F6' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              saveMutation.isPending && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Update Budget' : 'Create Budget'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  categoryList: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  periodGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonActive: {
    borderWidth: 3,
    borderColor: '#111827',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sliderButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  sliderButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  sliderButtonActive: {
    backgroundColor: '#3B82F6',
  },
  sliderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  sliderButtonTextActive: {
    color: '#FFFFFF',
  },
  toggleSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  toggleDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generateBudgetOverview(options: BudgetOptions = {}): string {
  const {
    componentName = 'BudgetOverview',
    endpoint = '/banking/budgets',
    budgetDetailScreen = 'BudgetDetail',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
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

const periodFilters = ['all', 'weekly', 'monthly', 'quarterly', 'yearly'];

function ${componentName}() {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const { data: budgets, isLoading, isRefetching, refetch } = useQuery({
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
    if (progress >= 100) return '#EF4444';
    if (progress >= threshold) return '#F59E0B';
    return '#10B981';
  };

  const getStatusBadge = (spent: number, amount: number, threshold: number) => {
    const progress = (spent / amount) * 100;
    if (progress >= 100) {
      return { bg: '#FEE2E2', text: '#DC2626', label: 'Over Budget', icon: 'warning' };
    }
    if (progress >= threshold) {
      return { bg: '#FEF3C7', text: '#D97706', label: 'Near Limit', icon: 'warning' };
    }
    return { bg: '#D1FAE5', text: '#059669', label: 'On Track', icon: 'checkmark-circle' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleBudgetPress = useCallback((budgetId: string) => {
    navigation.navigate('${budgetDetailScreen}' as never, { id: budgetId } as never);
  }, [navigation]);

  const renderBudget = useCallback(({ item }: { item: Budget }) => {
    const progress = (item.spent / item.amount) * 100;
    const status = getStatusBadge(item.spent, item.amount, item.alert_threshold);
    const progressColor = getProgressColor(item.spent, item.amount, item.alert_threshold);

    return (
      <TouchableOpacity
        style={styles.budgetCard}
        onPress={() => handleBudgetPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.budgetHeader}>
          <View style={styles.budgetTitleRow}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetName}>{item.name}</Text>
              <Text style={styles.budgetCategory}>
                {item.category.replace('-', ' ')} * {item.period}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons
              name={status.icon as keyof typeof Ionicons.glyphMap}
              size={12}
              color={status.text}
            />
            <Text style={[styles.statusText, { color: status.text }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {formatCurrency(item.spent)} of {formatCurrency(item.amount)}
            </Text>
            <Text style={[
              styles.progressPercent,
              progress > 100 && styles.progressPercentOver
            ]}>
              {progress.toFixed(0)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: \`\${Math.min(progress, 100)}%\`, backgroundColor: progressColor }
              ]}
            />
          </View>
        </View>

        <View style={styles.budgetFooter}>
          <Text style={[
            styles.remainingText,
            item.remaining < 0 && styles.remainingTextNegative
          ]}>
            {item.remaining < 0 ? (
              <>
                <Ionicons name="warning" size={14} color="#DC2626" />
                {' '}{formatCurrency(Math.abs(item.remaining))} over budget
              </>
            ) : (
              \`\${formatCurrency(item.remaining)} remaining\`
            )}
          </Text>
          {item.days_remaining !== undefined && (
            <View style={styles.daysRemaining}>
              <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
              <Text style={styles.daysRemainingText}>
                {item.days_remaining} days left
              </Text>
            </View>
          )}
        </View>

        <View style={styles.viewDetailsRow}>
          <Text style={styles.viewDetailsText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
        </View>
      </TouchableOpacity>
    );
  }, [handleBudgetPress]);

  const keyExtractor = useCallback((item: Budget) => item.id, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Budget Overview</Text>
          <Text style={styles.headerSubtitle}>Track your spending</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('BudgetForm' as never)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="wallet-outline" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.summaryLabel}>Total Budget</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalBudget)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="trending-down" size={20} color="#EF4444" />
          </View>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalSpent)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.summaryIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="trending-up" size={20} color="#10B981" />
          </View>
          <Text style={styles.summaryLabel}>Remaining</Text>
          <Text style={[
            styles.summaryValue,
            totalRemaining < 0 && styles.summaryValueNegative
          ]}>
            {formatCurrency(totalRemaining)}
          </Text>
        </View>
      </View>

      {/* Overall Progress */}
      <View style={styles.overallProgress}>
        <View style={styles.overallHeader}>
          <Text style={styles.overallTitle}>Overall Spending</Text>
          <Text style={[
            styles.overallPercent,
            overallProgress > 90 ? styles.overallPercentDanger :
            overallProgress > 70 ? styles.overallPercentWarning :
            styles.overallPercentSuccess
          ]}>
            {overallProgress.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.overallBar}>
          <View
            style={[
              styles.overallFill,
              {
                width: \`\${Math.min(overallProgress, 100)}%\`,
                backgroundColor: overallProgress > 90 ? '#EF4444' :
                                 overallProgress > 70 ? '#F59E0B' : '#10B981'
              }
            ]}
          />
        </View>
        <View style={styles.overallFooter}>
          <Text style={styles.overallFooterText}>{formatCurrency(totalSpent)} spent</Text>
          <Text style={styles.overallFooterText}>{formatCurrency(totalRemaining)} remaining</Text>
        </View>
      </View>

      {/* Period Filter */}
      <FlatList
        data={periodFilters}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedPeriod === item && styles.filterChipActive
            ]}
            onPress={() => setSelectedPeriod(item)}
          >
            <Text style={[
              styles.filterChipText,
              selectedPeriod === item && styles.filterChipTextActive
            ]}>
              {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item}
      />

      {/* Budget List */}
      <FlatList
        data={budgets}
        renderItem={renderBudget}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pie-chart-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No budgets yet</Text>
            <Text style={styles.emptySubtitle}>Create a budget to track spending</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('BudgetForm' as never)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryValueNegative: {
    color: '#DC2626',
  },
  overallProgress: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  overallTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  overallPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  overallPercentSuccess: {
    color: '#10B981',
  },
  overallPercentWarning: {
    color: '#F59E0B',
  },
  overallPercentDanger: {
    color: '#EF4444',
  },
  overallBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  overallFill: {
    height: '100%',
    borderRadius: 4,
  },
  overallFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  overallFooterText: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterChips: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
  },
  budgetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  budgetInfo: {
    flex: 1,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  budgetCategory: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  progressPercentOver: {
    color: '#DC2626',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 13,
    color: '#6B7280',
  },
  remainingTextNegative: {
    color: '#DC2626',
  },
  daysRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  daysRemainingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}
