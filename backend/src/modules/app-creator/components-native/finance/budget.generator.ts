/**
 * Budget Component Generators (React Native)
 *
 * Generates budget tracking, category spending, and spending chart components.
 * Uses View, Text, FlatList, and animated progress bars.
 */

export interface BudgetOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateBudgetTracker(options: BudgetOptions = {}): string {
  const { componentName = 'BudgetTracker', endpoint = '/budgets' } = options;

  return `import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Budget {
  id: string;
  name: string;
  limit: number;
  spent: number;
  color?: string;
}

interface ProgressBarProps {
  progress: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  color?: string;
}

const AnimatedProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  isOverBudget,
  isNearLimit,
  color,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: Math.min(progress, 100),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const barColor = isOverBudget ? '#EF4444' : isNearLimit ? '#F59E0B' : (color || '#8B5CF6');

  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[
          styles.progressFill,
          {
            backgroundColor: barColor,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
};

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: budgets, isLoading, refetch } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const totalBudget = budgets?.reduce((sum: number, b: Budget) => sum + (b.limit || 0), 0) || 0;
  const totalSpent = budgets?.reduce((sum: number, b: Budget) => sum + (b.spent || 0), 0) || 0;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const renderBudgetItem = useCallback(({ item }: { item: Budget }) => {
    const progress = item.limit > 0 ? (item.spent / item.limit) * 100 : 0;
    const isOverBudget = progress > 100;
    const isNearLimit = progress > 80 && progress <= 100;
    const remaining = item.limit - item.spent;

    return (
      <View style={styles.budgetItem}>
        <View style={styles.budgetHeader}>
          <View style={styles.budgetNameContainer}>
            <View style={[styles.colorDot, { backgroundColor: item.color || '#8B5CF6' }]} />
            <Text style={styles.budgetName}>{item.name}</Text>
            {isOverBudget && (
              <Ionicons name="warning" size={16} color="#EF4444" />
            )}
          </View>
          <Text style={styles.budgetAmount}>
            \${(item.spent || 0).toLocaleString()} / \${(item.limit || 0).toLocaleString()}
          </Text>
        </View>
        <AnimatedProgressBar
          progress={progress}
          isOverBudget={isOverBudget}
          isNearLimit={isNearLimit}
          color={item.color}
        />
        <Text style={[
          styles.budgetRemaining,
          isOverBudget && styles.overBudgetText
        ]}>
          {isOverBudget
            ? \`\${Math.abs(remaining).toLocaleString()} over budget\`
            : \`\${remaining.toLocaleString()} remaining\`}
        </Text>
      </View>
    );
  }, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Overall Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Budget Tracker</Text>
        <View style={styles.summaryAmounts}>
          <Text style={styles.summarySpent}>
            \${totalSpent.toLocaleString()} of \${totalBudget.toLocaleString()}
          </Text>
          <Text style={[
            styles.summaryPercentage,
            overallProgress > 90 ? styles.dangerText :
            overallProgress > 70 ? styles.warningText : styles.successText
          ]}>
            {overallProgress.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.overallProgressTrack}>
          <View
            style={[
              styles.overallProgressFill,
              {
                width: \`\${Math.min(overallProgress, 100)}%\`,
                backgroundColor: overallProgress > 90 ? '#EF4444' :
                                 overallProgress > 70 ? '#F59E0B' : '#10B981',
              },
            ]}
          />
        </View>
      </View>

      {/* Budget List */}
      <FlatList
        data={budgets || []}
        renderItem={renderBudgetItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calculator-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No budgets set</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  // Summary Card
  summaryCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summarySpent: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  overallProgressTrack: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  overallProgressFill: {
    height: '100%',
    borderRadius: 6,
  },

  // Budget Item
  listContent: {
    padding: 16,
  },
  budgetItem: {
    marginBottom: 20,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  budgetName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  budgetAmount: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetRemaining: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  overBudgetText: {
    color: '#EF4444',
  },

  // Status Colors
  successText: {
    color: '#10B981',
  },
  warningText: {
    color: '#F59E0B',
  },
  dangerText: {
    color: '#EF4444',
  },

  // Empty State
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateBudgetCategories(options: BudgetOptions = {}): string {
  const { componentName = 'BudgetCategories', endpoint = '/budget-categories' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  key?: string;
  amount: number;
  color?: string;
}

const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = (screenWidth - 48) / 3;

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  shopping: 'bag-outline',
  housing: 'home-outline',
  transport: 'car-outline',
  food: 'restaurant-outline',
  utilities: 'flash-outline',
  health: 'heart-outline',
  education: 'school-outline',
  travel: 'airplane-outline',
  entertainment: 'film-outline',
};

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: categories, isLoading, refetch } = useQuery({
    queryKey: ['budget-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderCategoryItem = useCallback(({ item }: { item: Category }) => {
    const iconName = categoryIcons[item.key?.toLowerCase() || ''] || 'bag-outline';
    const color = item.color || '#8B5CF6';

    return (
      <TouchableOpacity style={styles.categoryItem} activeOpacity={0.7}>
        <View style={[styles.categoryIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={iconName} size={24} color={color} />
        </View>
        <Text style={styles.categoryName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.categoryAmount}>
          \${(item.amount || 0).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
  }, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending by Category</Text>
      <FlatList
        data={categories || []}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="pie-chart-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No spending data</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
  },
  categoryItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateSpendingChart(options: BudgetOptions = {}): string {
  const { componentName = 'SpendingChart', endpoint = '/spending-trends' } = options;

  return `import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface SpendingData {
  label: string;
  value: number;
}

interface SpendingTrends {
  data: SpendingData[];
  change?: number;
}

type Period = 'week' | 'month' | 'year';

const { width: screenWidth } = Dimensions.get('window');

const ${componentName}: React.FC = () => {
  const [period, setPeriod] = useState<Period>('month');

  const { data: trends, isLoading } = useQuery({
    queryKey: ['spending-trends', period],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?period=' + period);
      return response?.data || response || { data: [] };
    },
  });

  const chartData = trends?.data || [];
  const maxValue = Math.max(...chartData.map((d: SpendingData) => d.value || 0), 1);
  const chartHeight = 160;

  const periodOptions: { key: Period; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  // Animated bar component
  const AnimatedBar: React.FC<{ value: number; index: number; label: string }> = ({
    value,
    index,
    label,
  }) => {
    const animatedHeight = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(animatedHeight, {
        toValue: (value / maxValue) * chartHeight,
        duration: 800,
        delay: index * 50,
        useNativeDriver: false,
      }).start();
    }, [value, index]);

    return (
      <View style={styles.barColumn}>
        <View style={[styles.barContainer, { height: chartHeight }]}>
          <Animated.View
            style={[
              styles.bar,
              { height: animatedHeight },
            ]}
          />
        </View>
        <Text style={styles.barLabel} numberOfLines={1}>{label}</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Spending Trends</Text>
          {trends?.change !== undefined && (
            <View style={styles.changeContainer}>
              <Ionicons
                name={trends.change >= 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={trends.change >= 0 ? '#EF4444' : '#10B981'}
              />
              <Text style={[
                styles.changeText,
                { color: trends.change >= 0 ? '#EF4444' : '#10B981' }
              ]}>
                {Math.abs(trends.change)}% vs last {period}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.periodToggle}>
          {periodOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.periodButton,
                period === option.key && styles.periodButtonActive,
              ]}
              onPress={() => setPeriod(option.key)}
            >
              <Text style={[
                styles.periodButtonText,
                period === option.key && styles.periodButtonTextActive,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartContent}
      >
        {chartData.length > 0 ? (
          <View style={styles.chartBars}>
            {chartData.map((item: SpendingData, index: number) => (
              <AnimatedBar
                key={index}
                value={item.value}
                index={index}
                label={item.label}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  changeText: {
    fontSize: 13,
  },
  periodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#111827',
  },
  chartContent: {
    paddingBottom: 8,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    minWidth: screenWidth - 64,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    minWidth: 32,
  },
  barContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    backgroundColor: '#8B5CF6',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 160,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
