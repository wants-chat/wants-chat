/**
 * Subscriber Component Generators (React Native)
 *
 * Generates subscription/SaaS metrics components:
 * - SubscriberChart: Subscriber growth visualization
 * - SubscriberProfile: Individual subscriber details
 * - ChurnMetrics: Churn rate and analysis
 * - MrrStats: Monthly Recurring Revenue statistics
 * - PlanDistribution: Subscription plan breakdown
 */

export interface SubscriberChartOptions {
  componentName?: string;
  endpoint?: string;
  showGrowthRate?: boolean;
  showProjection?: boolean;
}

export function generateSubscriberChart(options: SubscriberChartOptions = {}): string {
  const {
    componentName = 'SubscriberChart',
    endpoint = '/subscribers/chart',
    showGrowthRate = true,
    showProjection = false,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  period?: '7d' | '30d' | '90d' | '12m';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  period: initialPeriod = '30d',
}) => {
  const [period, setPeriod] = useState(initialPeriod);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['subscriber-chart', period],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?period=\${period}\`);
      return response?.data || response || {
        totalSubscribers: 12450,
        newSubscribers: 845,
        churnedSubscribers: 123,
        netGrowth: 722,
        growthRate: 6.2,
      };
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const periods = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '12m', label: '12M' },
  ];

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const isPositiveGrowth = (data?.growthRate || 0) >= 0;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
        />
      }
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="people" size={20} color="#3B82F6" />
            <Text style={styles.headerTitle}>Subscriber Growth</Text>
          </View>
          <View style={styles.periodSelector}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[styles.periodTab, period === p.value && styles.periodTabActive]}
                onPress={() => setPeriod(p.value as any)}
              >
                <Text style={[
                  styles.periodTabText,
                  period === p.value && styles.periodTabTextActive
                ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          {/* Summary Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Subscribers</Text>
              <Text style={styles.statValue}>
                {(data?.totalSubscribers || 0).toLocaleString()}
              </Text>
            </View>

            <View style={[styles.statCard, styles.statCardGreen]}>
              <Text style={styles.statLabel}>New</Text>
              <Text style={[styles.statValue, styles.statValueGreen]}>
                +{(data?.newSubscribers || 0).toLocaleString()}
              </Text>
            </View>

            <View style={[styles.statCard, styles.statCardRed]}>
              <Text style={styles.statLabel}>Churned</Text>
              <Text style={[styles.statValue, styles.statValueRed]}>
                -{(data?.churnedSubscribers || 0).toLocaleString()}
              </Text>
            </View>

            <View style={[styles.statCard, isPositiveGrowth ? styles.statCardBlue : styles.statCardOrange]}>
              <Text style={styles.statLabel}>Net Growth</Text>
              <View style={styles.growthRow}>
                <Text style={[
                  styles.statValue,
                  isPositiveGrowth ? styles.statValueBlue : styles.statValueOrange
                ]}>
                  {isPositiveGrowth ? '+' : ''}{(data?.netGrowth || 0).toLocaleString()}
                </Text>
                ${showGrowthRate ? `<View style={styles.growthBadge}>
                  <Ionicons
                    name={isPositiveGrowth ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={isPositiveGrowth ? '#10B981' : '#EF4444'}
                  />
                  <Text style={[
                    styles.growthText,
                    isPositiveGrowth ? styles.growthTextPositive : styles.growthTextNegative
                  ]}>
                    {Math.abs(data?.growthRate || 0).toFixed(1)}%
                  </Text>
                </View>` : ''}
              </View>
            </View>
          </View>

          {/* Chart Placeholder */}
          <View style={styles.chartPlaceholder}>
            <Ionicons name="trending-up" size={48} color="#D1D5DB" />
            <Text style={styles.chartPlaceholderText}>Subscriber chart</Text>
            <Text style={styles.chartPlaceholderSubtext}>Integrate with react-native-charts</Text>
          </View>

          ${showProjection ? `<View style={styles.projectionCard}>
            <View style={styles.projectionRow}>
              <Ionicons name="trending-up" size={18} color="#3B82F6" />
              <Text style={styles.projectionLabel}>Growth Projection</Text>
            </View>
            <Text style={styles.projectionText}>
              At current growth rate, you'll reach <Text style={styles.projectionHighlight}>15,000 subscribers</Text> in approximately <Text style={styles.projectionHighlight}>3 months</Text>.
            </Text>
          </View>` : ''}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  periodTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodTabActive: {
    backgroundColor: '#FFFFFF',
  },
  periodTabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  periodTabTextActive: {
    color: '#111827',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  statCard: {
    width: '50%',
    padding: 4,
  },
  statCardGreen: {},
  statCardRed: {},
  statCardBlue: {},
  statCardOrange: {},
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statValueGreen: {
    color: '#10B981',
  },
  statValueRed: {
    color: '#EF4444',
  },
  statValueBlue: {
    color: '#3B82F6',
  },
  statValueOrange: {
    color: '#F59E0B',
  },
  growthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  growthTextPositive: {
    color: '#10B981',
  },
  growthTextNegative: {
    color: '#EF4444',
  },
  chartPlaceholder: {
    height: 180,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
  },
  projectionCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
  },
  projectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  projectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  projectionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  projectionHighlight: {
    fontWeight: '600',
    color: '#111827',
  },
});

export default ${componentName};
`;
}

export interface SubscriberProfileOptions {
  componentName?: string;
  endpoint?: string;
  showActivity?: boolean;
  showSubscription?: boolean;
}

export function generateSubscriberProfile(options: SubscriberProfileOptions = {}): string {
  const {
    componentName = 'SubscriberProfile',
    endpoint = '/subscribers',
    showActivity = true,
    showSubscription = true,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  subscriberId?: string;
  subscriber?: any;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  subscriberId: propId,
  subscriber: propSubscriber,
}) => {
  const route = useRoute();
  const subscriberId = propId || (route.params as any)?.id;
  const [refreshing, setRefreshing] = useState(false);

  const { data: fetchedSubscriber, isLoading, refetch } = useQuery({
    queryKey: ['subscriber', subscriberId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${subscriberId}\`);
      return response?.data || response;
    },
    enabled: !propSubscriber && !!subscriberId,
  });

  const subscriber = propSubscriber || fetchedSubscriber;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!subscriber) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>Subscriber not found</Text>
      </View>
    );
  }

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: '#D1FAE5', color: '#065F46' };
      case 'trialing':
        return { bg: '#DBEAFE', color: '#1E40AF' };
      case 'past_due':
        return { bg: '#FEF3C7', color: '#92400E' };
      case 'canceled':
        return { bg: '#FEE2E2', color: '#991B1B' };
      default:
        return { bg: '#F3F4F6', color: '#374151' };
    }
  };

  const statusStyle = getStatusStyle(subscriber.status);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
        />
      }
    >
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.profileHeader}>
          {subscriber.avatar ? (
            <Image source={{ uri: subscriber.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {subscriber.name?.charAt(0) || subscriber.email?.charAt(0) || 'S'}
              </Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{subscriber.name || 'Unknown'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                  {subscriber.status?.charAt(0).toUpperCase() + subscriber.status?.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={14} color="#6B7280" />
              <Text style={styles.email}>{subscriber.email}</Text>
            </View>
            {subscriber.phone && (
              <View style={styles.contactRow}>
                <Ionicons name="call" size={14} color="#6B7280" />
                <Text style={styles.phone}>{subscriber.phone}</Text>
              </View>
            )}
          </View>
        </View>

        ${showSubscription ? `<View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={18} color="#111827" />
            <Text style={styles.sectionTitle}>Subscription Details</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Plan</Text>
              <Text style={styles.detailValue}>{subscriber.plan_name || 'Free'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>MRR</Text>
              <Text style={styles.detailValue}>
                \${(subscriber.mrr || 0).toFixed(2)}/mo
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Subscribed Since</Text>
              <Text style={styles.detailValue}>{formatDate(subscriber.subscribed_at)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Next Billing</Text>
              <Text style={styles.detailValue}>{formatDate(subscriber.next_billing_date)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Lifetime Value</Text>
              <Text style={[styles.detailValue, styles.ltvValue]}>
                \${(subscriber.ltv || 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>` : ''}

        ${showActivity ? `<View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pulse" size={18} color="#111827" />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Last Login</Text>
              <Text style={styles.detailValue}>
                {subscriber.last_login ? formatDate(subscriber.last_login) : 'Never'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Sessions (30d)</Text>
              <Text style={styles.detailValue}>{subscriber.sessions_count || 0}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Feature Usage</Text>
              <Text style={styles.detailValue}>{subscriber.feature_usage_percent || 0}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Email Verified</Text>
              <View style={styles.verifiedRow}>
                <Ionicons
                  name={subscriber.email_verified ? 'checkmark-circle' : 'close-circle'}
                  size={18}
                  color={subscriber.email_verified ? '#10B981' : '#EF4444'}
                />
                <Text style={styles.detailValue}>
                  {subscriber.email_verified ? 'Yes' : 'No'}
                </Text>
              </View>
            </View>
          </View>
        </View>` : ''}

        {/* Tags */}
        {subscriber.tags && subscriber.tags.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag" size={18} color="#111827" />
              <Text style={styles.sectionTitle}>Tags & Segments</Text>
            </View>
            <View style={styles.tagsContainer}>
              {subscriber.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
  },
  phone: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  ltvValue: {
    color: '#10B981',
    fontWeight: '600',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export interface ChurnMetricsOptions {
  componentName?: string;
  endpoint?: string;
  showReasons?: boolean;
  showCohorts?: boolean;
}

export function generateChurnMetrics(options: ChurnMetricsOptions = {}): string {
  const {
    componentName = 'ChurnMetrics',
    endpoint = '/subscribers/churn',
    showReasons = true,
    showCohorts = false,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  period?: '30d' | '90d' | '12m';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  period: initialPeriod = '30d',
}) => {
  const [period, setPeriod] = useState(initialPeriod);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['churn-metrics', period],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?period=\${period}\`);
      return response?.data || response || {
        churnRate: 4.2,
        churnRateChange: -0.5,
        churnedCustomers: 52,
        churnedMrr: 4680,
        avgCustomerLifespan: 18.5,
        atRiskCustomers: 34,
        netRevenueRetention: 108,
        ${showReasons ? `reasons: [
          { reason: 'Too expensive', count: 18, percent: 34.6 },
          { reason: 'Found alternative', count: 12, percent: 23.1 },
          { reason: 'No longer needed', count: 10, percent: 19.2 },
          { reason: 'Missing features', count: 8, percent: 15.4 },
          { reason: 'Poor support', count: 4, percent: 7.7 },
        ],` : ''}
      };
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const periods = [
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: '12m', label: '12M' },
  ];

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  const isChurnImproving = (data?.churnRateChange || 0) < 0;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#EF4444"
        />
      }
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="person-remove" size={20} color="#EF4444" />
            <Text style={styles.headerTitle}>Churn Analysis</Text>
          </View>
          <View style={styles.periodSelector}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[styles.periodTab, period === p.value && styles.periodTabActive]}
                onPress={() => setPeriod(p.value as any)}
              >
                <Text style={[
                  styles.periodTabText,
                  period === p.value && styles.periodTabTextActive
                ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, isChurnImproving ? styles.metricCardGreen : styles.metricCardRed]}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Churn Rate</Text>
                <Ionicons
                  name="trending-down"
                  size={16}
                  color={isChurnImproving ? '#10B981' : '#EF4444'}
                />
              </View>
              <Text style={styles.metricValue}>{(data?.churnRate || 0).toFixed(1)}%</Text>
              <Text style={[
                styles.metricChange,
                isChurnImproving ? styles.metricChangeGreen : styles.metricChangeRed
              ]}>
                {isChurnImproving ? '' : '+'}{(data?.churnRateChange || 0).toFixed(1)}% vs prev
              </Text>
            </View>

            <View style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Churned</Text>
                <Ionicons name="people" size={16} color="#6B7280" />
              </View>
              <Text style={styles.metricValue}>{data?.churnedCustomers || 0}</Text>
              <Text style={styles.metricSubtext}>customers</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardRed]}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>Lost MRR</Text>
                <Ionicons name="cash" size={16} color="#EF4444" />
              </View>
              <Text style={[styles.metricValue, styles.metricValueRed]}>
                \${(data?.churnedMrr || 0).toLocaleString()}
              </Text>
              <Text style={styles.metricSubtext}>this period</Text>
            </View>

            <View style={[styles.metricCard, styles.metricCardYellow]}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricLabel}>At Risk</Text>
                <Ionicons name="alert" size={16} color="#F59E0B" />
              </View>
              <Text style={[styles.metricValue, styles.metricValueYellow]}>
                {data?.atRiskCustomers || 0}
              </Text>
              <Text style={styles.metricSubtext}>customers</Text>
            </View>
          </View>

          {/* Additional Stats */}
          <View style={styles.additionalStats}>
            <View style={styles.additionalStatItem}>
              <View style={styles.additionalStatIcon}>
                <Ionicons name="calendar" size={18} color="#3B82F6" />
              </View>
              <View style={styles.additionalStatInfo}>
                <Text style={styles.additionalStatLabel}>Avg Customer Lifespan</Text>
                <Text style={styles.additionalStatValue}>
                  {(data?.avgCustomerLifespan || 0).toFixed(1)} months
                </Text>
              </View>
            </View>

            <View style={styles.additionalStatItem}>
              <View style={styles.additionalStatIcon}>
                <Ionicons name="bar-chart" size={18} color="#10B981" />
              </View>
              <View style={styles.additionalStatInfo}>
                <Text style={styles.additionalStatLabel}>Net Revenue Retention</Text>
                <Text style={[
                  styles.additionalStatValue,
                  (data?.netRevenueRetention || 0) >= 100 ? styles.valueGreen : styles.valueRed
                ]}>
                  {data?.netRevenueRetention || 0}%
                </Text>
              </View>
            </View>
          </View>

          ${showReasons ? `{/* Churn Reasons */}
          {data?.reasons && data.reasons.length > 0 && (
            <View style={styles.reasonsSection}>
              <Text style={styles.reasonsTitle}>Top Churn Reasons</Text>
              {data.reasons.map((item: any, index: number) => (
                <View key={index} style={styles.reasonItem}>
                  <View style={styles.reasonHeader}>
                    <Text style={styles.reasonText}>{item.reason}</Text>
                    <Text style={styles.reasonCount}>
                      {item.count} ({item.percent}%)
                    </Text>
                  </View>
                  <View style={styles.reasonBar}>
                    <View
                      style={[styles.reasonBarFill, { width: \`\${item.percent}%\` }]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}` : ''}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  periodTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodTabActive: {
    backgroundColor: '#FFFFFF',
  },
  periodTabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  periodTabTextActive: {
    color: '#111827',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 16,
  },
  metricCard: {
    width: '50%',
    padding: 4,
  },
  metricCardGreen: {},
  metricCardRed: {},
  metricCardYellow: {},
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  metricValueRed: {
    color: '#EF4444',
  },
  metricValueYellow: {
    color: '#F59E0B',
  },
  metricChange: {
    fontSize: 11,
    marginTop: 4,
  },
  metricChangeGreen: {
    color: '#10B981',
  },
  metricChangeRed: {
    color: '#EF4444',
  },
  metricSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  additionalStats: {
    marginBottom: 16,
    gap: 10,
  },
  additionalStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  additionalStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  additionalStatInfo: {
    flex: 1,
  },
  additionalStatLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  additionalStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  valueGreen: {
    color: '#10B981',
  },
  valueRed: {
    color: '#EF4444',
  },
  reasonsSection: {
    marginTop: 8,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  reasonItem: {
    marginBottom: 12,
  },
  reasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 14,
    color: '#374151',
  },
  reasonCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  reasonBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  reasonBarFill: {
    height: 6,
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
});

export default ${componentName};
`;
}

export interface MrrStatsOptions {
  componentName?: string;
  endpoint?: string;
  showBreakdown?: boolean;
  showChart?: boolean;
}

export function generateMrrStats(options: MrrStatsOptions = {}): string {
  const {
    componentName = 'MrrStats',
    endpoint = '/subscribers/mrr',
    showBreakdown = true,
    showChart = true,
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

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mrr-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {
        currentMrr: 125000,
        mrrGrowth: 8.5,
        arr: 1500000,
        avgRevenuePerUser: 42.50,
        totalCustomers: 2941,
        ${showBreakdown ? `breakdown: {
          newMrr: 12500,
          expansionMrr: 8200,
          contractionMrr: -2100,
          churnedMrr: -4800,
          netNewMrr: 13800,
        },` : ''}
      };
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const isPositiveGrowth = (data?.mrrGrowth || 0) >= 0;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#10B981"
        />
      }
    >
      {/* Main MRR Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroLabel}>Monthly Recurring Revenue</Text>
          <View style={[
            styles.growthBadge,
            isPositiveGrowth ? styles.growthBadgePositive : styles.growthBadgeNegative
          ]}>
            <Ionicons
              name={isPositiveGrowth ? 'arrow-up' : 'arrow-down'}
              size={14}
              color="#FFFFFF"
            />
            <Text style={styles.growthBadgeText}>
              {Math.abs(data?.mrrGrowth || 0).toFixed(1)}%
            </Text>
          </View>
        </View>
        <Text style={styles.heroValue}>\${(data?.currentMrr || 0).toLocaleString()}</Text>

        <View style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatLabel}>ARR</Text>
            <Text style={styles.heroStatValue}>
              \${((data?.arr || 0) / 1000000).toFixed(2)}M
            </Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatLabel}>ARPU</Text>
            <Text style={styles.heroStatValue}>
              \${(data?.avgRevenuePerUser || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatLabel}>Customers</Text>
            <Text style={styles.heroStatValue}>
              {(data?.totalCustomers || 0).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      ${showBreakdown ? `{/* MRR Breakdown */}
      {data?.breakdown && (
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>MRR Movement</Text>

          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownIcon, styles.breakdownIconGreen]}>
              <Ionicons name="person-add" size={16} color="#10B981" />
            </View>
            <Text style={styles.breakdownLabel}>New MRR</Text>
            <Text style={[styles.breakdownValue, styles.breakdownValueGreen]}>
              +\${(data.breakdown.newMrr || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownIcon, styles.breakdownIconBlue]}>
              <Ionicons name="trending-up" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.breakdownLabel}>Expansion MRR</Text>
            <Text style={[styles.breakdownValue, styles.breakdownValueBlue]}>
              +\${(data.breakdown.expansionMrr || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownIcon, styles.breakdownIconYellow]}>
              <Ionicons name="trending-down" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.breakdownLabel}>Contraction MRR</Text>
            <Text style={[styles.breakdownValue, styles.breakdownValueYellow]}>
              \${(data.breakdown.contractionMrr || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={[styles.breakdownIcon, styles.breakdownIconRed]}>
              <Ionicons name="person-remove" size={16} color="#EF4444" />
            </View>
            <Text style={styles.breakdownLabel}>Churned MRR</Text>
            <Text style={[styles.breakdownValue, styles.breakdownValueRed]}>
              \${(data.breakdown.churnedMrr || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.netMrrRow}>
            <Text style={styles.netMrrLabel}>Net New MRR</Text>
            <Text style={[
              styles.netMrrValue,
              (data.breakdown.netNewMrr || 0) >= 0 ? styles.netMrrPositive : styles.netMrrNegative
            ]}>
              {(data.breakdown.netNewMrr || 0) >= 0 ? '+' : ''}\${(data.breakdown.netNewMrr || 0).toLocaleString()}
            </Text>
          </View>
        </View>
      )}` : ''}

      ${showChart ? `<View style={styles.chartCard}>
        <Text style={styles.chartTitle}>MRR Trend</Text>
        <View style={styles.chartPlaceholder}>
          <Ionicons name="trending-up" size={48} color="#D1D5DB" />
          <Text style={styles.chartPlaceholderText}>MRR chart</Text>
        </View>
      </View>` : ''}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  heroCard: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  growthBadgePositive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  growthBadgeNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  growthBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  breakdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  breakdownIconGreen: {
    backgroundColor: '#D1FAE5',
  },
  breakdownIconBlue: {
    backgroundColor: '#DBEAFE',
  },
  breakdownIconYellow: {
    backgroundColor: '#FEF3C7',
  },
  breakdownIconRed: {
    backgroundColor: '#FEE2E2',
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  breakdownValueGreen: {
    color: '#10B981',
  },
  breakdownValueBlue: {
    color: '#3B82F6',
  },
  breakdownValueYellow: {
    color: '#F59E0B',
  },
  breakdownValueRed: {
    color: '#EF4444',
  },
  netMrrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  netMrrLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  netMrrValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  netMrrPositive: {
    color: '#10B981',
  },
  netMrrNegative: {
    color: '#EF4444',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  chartPlaceholder: {
    height: 180,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export interface PlanDistributionOptions {
  componentName?: string;
  endpoint?: string;
  showChart?: boolean;
  showTable?: boolean;
}

export function generatePlanDistribution(options: PlanDistributionOptions = {}): string {
  const {
    componentName = 'PlanDistribution',
    endpoint = '/subscribers/plans',
    showChart = true,
    showTable = true,
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

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['plan-distribution'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {
        plans: [
          { name: 'Free', customers: 1250, mrr: 0, percent: 42.5, color: '#9CA3AF' },
          { name: 'Starter', customers: 890, mrr: 8900, percent: 30.3, color: '#3B82F6' },
          { name: 'Pro', customers: 620, mrr: 30990, percent: 21.1, color: '#8B5CF6' },
          { name: 'Enterprise', customers: 181, mrr: 85070, percent: 6.2, color: '#10B981' },
        ],
        totalCustomers: 2941,
        totalMrr: 124960,
        conversionRate: 57.5,
      };
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#8B5CF6"
        />
      }
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="pie-chart" size={20} color="#8B5CF6" />
          <Text style={styles.headerTitle}>Plan Distribution</Text>
        </View>

        <View style={styles.content}>
          {/* Summary Stats */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="people" size={18} color="#3B82F6" />
              <Text style={styles.summaryValue}>
                {(data?.totalCustomers || 0).toLocaleString()}
              </Text>
              <Text style={styles.summaryLabel}>Customers</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="cash" size={18} color="#10B981" />
              <Text style={styles.summaryValue}>
                \${(data?.totalMrr || 0).toLocaleString()}
              </Text>
              <Text style={styles.summaryLabel}>Total MRR</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="trending-up" size={18} color="#8B5CF6" />
              <Text style={styles.summaryValue}>{data?.conversionRate || 0}%</Text>
              <Text style={styles.summaryLabel}>Paid Conv.</Text>
            </View>
          </View>

          ${showChart ? `{/* Visual Distribution */}
          <View style={styles.distributionBar}>
            {data?.plans?.map((plan: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.distributionSegment,
                  { width: \`\${plan.percent}%\`, backgroundColor: plan.color }
                ]}
              />
            ))}
          </View>
          <View style={styles.legendRow}>
            {data?.plans?.map((plan: any, index: number) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: plan.color }]} />
                <Text style={styles.legendText}>{plan.name} ({plan.percent}%)</Text>
              </View>
            ))}
          </View>` : ''}

          ${showTable ? `{/* Plan Table */}
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableCellPlan]}>Plan</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Customers</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>MRR</Text>
              <Text style={[styles.tableCell, styles.tableHeaderText]}>Share</Text>
            </View>
            {data?.plans?.map((plan: any, index: number) => (
              <View key={index} style={styles.tableRow}>
                <View style={[styles.tableCell, styles.tableCellPlan, styles.planNameCell]}>
                  <View style={[styles.planDot, { backgroundColor: plan.color }]} />
                  <Text style={styles.planName}>{plan.name}</Text>
                </View>
                <Text style={styles.tableCell}>{(plan.customers || 0).toLocaleString()}</Text>
                <Text style={styles.tableCell}>\${(plan.mrr || 0).toLocaleString()}</Text>
                <View style={[styles.tableCell, styles.shareBadge, { backgroundColor: plan.color + '20' }]}>
                  <Text style={[styles.shareBadgeText, { color: plan.color }]}>
                    {plan.percent}%
                  </Text>
                </View>
              </View>
            ))}
          </View>` : ''}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    marginHorizontal: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  distributionBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  distributionSegment: {
    height: 12,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontWeight: '500',
    color: '#6B7280',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'right',
  },
  tableCellPlan: {
    flex: 1.5,
    textAlign: 'left',
  },
  planNameCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  planName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  shareBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}
