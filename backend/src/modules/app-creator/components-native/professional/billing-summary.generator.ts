/**
 * Billing Summary Component Generator (React Native)
 *
 * Generates a compact billing summary card with period breakdown.
 * Features: Period display, invoiced/collected/outstanding metrics, category breakdown.
 */

export interface BillingSummaryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateBillingSummary(options: BillingSummaryOptions = {}): string {
  const {
    componentName = 'BillingSummary',
    endpoint = '/billing/period-summary',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface CategoryAmount {
  category: string;
  amount: number;
}

interface BillingData {
  period: string;
  invoiced: number;
  collected: number;
  outstanding: number;
  byCategory: CategoryAmount[];
}

interface ${componentName}Props {
  data?: BillingData;
  onViewDetails?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ data: propData, onViewDetails }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['billing-period-summary'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
    enabled: !propData,
  });

  const billingData: BillingData = propData || fetchedData || {
    period: 'This Month',
    invoiced: 0,
    collected: 0,
    outstanding: 0,
    byCategory: [],
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatCurrency = (value: number): string => {
    if (value >= 1000) {
      return '$' + (value / 1000).toFixed(0) + 'K';
    }
    return '$' + value.toLocaleString();
  };

  const collectionRate = billingData.invoiced > 0
    ? Math.round((billingData.collected / billingData.invoiced) * 100)
    : 0;

  const getCategoryColor = (index: number): string => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    return colors[index % colors.length];
  };

  if (isLoading && !propData) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Billing Summary</Text>
          <Text style={styles.period}>{billingData.period}</Text>
        </View>

        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.metricCardBlue]}>
            <Text style={styles.metricValue}>{formatCurrency(billingData.invoiced)}</Text>
            <Text style={styles.metricLabel}>Invoiced</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardGreen]}>
            <Text style={styles.metricValue}>{formatCurrency(billingData.collected)}</Text>
            <Text style={styles.metricLabel}>Collected</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardYellow]}>
            <Text style={styles.metricValue}>{formatCurrency(billingData.outstanding)}</Text>
            <Text style={styles.metricLabel}>Outstanding</Text>
          </View>
        </View>

        <View style={styles.rateContainer}>
          <View style={styles.rateHeader}>
            <Text style={styles.rateLabel}>Collection Rate</Text>
            <Text style={styles.rateValue}>{collectionRate}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: \`\${collectionRate}%\` }]} />
          </View>
        </View>

        {billingData.byCategory.length > 0 && (
          <View style={styles.categoriesContainer}>
            <Text style={styles.categoriesTitle}>By Category</Text>
            {billingData.byCategory.map((cat, index) => (
              <View key={cat.category} style={styles.categoryRow}>
                <View style={styles.categoryLeft}>
                  <View
                    style={[styles.categoryDot, { backgroundColor: getCategoryColor(index) }]}
                  />
                  <Text style={styles.categoryName}>{cat.category}</Text>
                </View>
                <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text>
              </View>
            ))}
          </View>
        )}

        {onViewDetails && (
          <TouchableOpacity style={styles.detailsButton} onPress={onViewDetails}>
            <Text style={styles.detailsButtonText}>View Full Report</Text>
            <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  period: {
    fontSize: 14,
    color: '#6B7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  metricCardBlue: {
    backgroundColor: '#EFF6FF',
  },
  metricCardGreen: {
    backgroundColor: '#ECFDF5',
  },
  metricCardYellow: {
    backgroundColor: '#FFFBEB',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  rateContainer: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  categoriesContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  categoriesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 14,
    color: '#374151',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  detailsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});

export default ${componentName};
`;
}
