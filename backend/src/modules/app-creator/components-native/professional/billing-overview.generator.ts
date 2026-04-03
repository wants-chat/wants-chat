/**
 * Billing Overview Component Generator (React Native)
 *
 * Generates a billing summary dashboard with key metrics.
 * Features: Stat cards, revenue metrics, outstanding amounts, collection rates.
 */

export interface BillingOverviewOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateBillingOverview(options: BillingOverviewOptions = {}): string {
  const {
    componentName = 'BillingOverview',
    endpoint = '/billing/summary',
    title = 'Billing Overview',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface BillingSummary {
  totalRevenue: number;
  outstanding: number;
  overdue: number;
  paidThisMonth: number;
  pendingInvoices: number;
  averagePaymentDays: number;
}

interface ${componentName}Props {
  data?: BillingSummary;
}

const ${componentName}: React.FC<${componentName}Props> = ({ data: propData }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['billing-summary'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
    enabled: !propData,
  });

  const summary: BillingSummary = propData || fetchedData || {
    totalRevenue: 0,
    outstanding: 0,
    overdue: 0,
    paidThisMonth: 0,
    pendingInvoices: 0,
    averagePaymentDays: 0,
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatCurrency = (value: number): string => {
    return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue),
      icon: 'wallet' as keyof typeof Ionicons.glyphMap,
      color: '#10B981',
      bgColor: '#D1FAE5',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(summary.outstanding),
      icon: 'bar-chart' as keyof typeof Ionicons.glyphMap,
      color: '#3B82F6',
      bgColor: '#DBEAFE',
    },
    {
      label: 'Overdue',
      value: formatCurrency(summary.overdue),
      icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
      color: '#EF4444',
      bgColor: '#FEE2E2',
    },
    {
      label: 'Paid This Month',
      value: formatCurrency(summary.paidThisMonth),
      icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },
    {
      label: 'Pending Invoices',
      value: summary.pendingInvoices.toString(),
      icon: 'document-text' as keyof typeof Ionicons.glyphMap,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      label: 'Avg Payment Days',
      value: summary.averagePaymentDays.toString(),
      icon: 'calendar' as keyof typeof Ionicons.glyphMap,
      color: '#6B7280',
      bgColor: '#F3F4F6',
    },
  ];

  if (isLoading && !propData) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Ionicons name="cash-outline" size={24} color="#111827" />
        <Text style={styles.headerTitle}>${title}</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
              <Ionicons name={stat.icon} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Collection Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Collection Rate</Text>
          <Text style={styles.summaryValue}>
            {summary.totalRevenue > 0
              ? Math.round(((summary.totalRevenue - summary.outstanding) / summary.totalRevenue) * 100)
              : 0}%
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: summary.totalRevenue > 0
                  ? \`\${Math.round(((summary.totalRevenue - summary.outstanding) / summary.totalRevenue) * 100)}%\`
                  : '0%',
              },
            ]}
          />
        </View>
        <View style={styles.summaryFooter}>
          <View style={styles.summaryFooterItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.summaryFooterText}>Collected</Text>
          </View>
          <View style={styles.summaryFooterItem}>
            <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
            <Text style={styles.summaryFooterText}>Outstanding</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  summaryFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  summaryFooterText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
