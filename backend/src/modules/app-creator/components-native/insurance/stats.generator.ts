/**
 * Insurance Stats Component Generator (React Native)
 *
 * Generates insurance dashboard stats component with key metrics,
 * policy distribution, claims by type, and recent activity.
 * Uses View, Text, ScrollView, and FlatList for layouts.
 */

export interface InsuranceStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateInsuranceStats(options: InsuranceStatsOptions = {}): string {
  const { componentName = 'InsuranceStats', endpoint = '/insurance/stats' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface InsuranceStatsData {
  // Policies
  total_policies: number;
  active_policies: number;
  pending_policies: number;
  expired_policies: number;
  policies_growth: number;

  // Claims
  total_claims: number;
  pending_claims: number;
  approved_claims: number;
  rejected_claims: number;
  claims_this_month: number;

  // Financial
  total_coverage: number;
  total_premiums_collected: number;
  total_claims_paid: number;
  loss_ratio: number;

  // Customers
  total_customers: number;
  new_customers_this_month: number;
  customer_retention_rate: number;

  // By Type
  policies_by_type: Array<{ type: string; count: number; percentage: number }>;
  claims_by_type: Array<{ type: string; count: number; amount: number }>;

  // Recent Activity
  recent_policies: Array<{ id: string; policy_number: string; type: string; created_at: string }>;
  recent_claims: Array<{ id: string; claim_number: string; status: string; amount: number; created_at: string }>;
}

const { width: screenWidth } = Dimensions.get('window');

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['insurance-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getClaimStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { color: '#10B981', bgColor: '#D1FAE5' };
      case 'pending':
        return { color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'rejected':
        return { color: '#EF4444', bgColor: '#FEE2E2' };
      default:
        return { color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const policyTypeColors: Record<string, string> = {
    health: '#EF4444',
    auto: '#3B82F6',
    home: '#8B5CF6',
    life: '#10B981',
    business: '#F97316',
    travel: '#06B6D4',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

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
          colors={['#8B5CF6']}
        />
      }
    >
      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        {/* Policies Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="shield" size={20} color="#3B82F6" />
            </View>
            {stats?.policies_growth !== undefined && (
              <View style={[
                styles.trendBadge,
                { backgroundColor: stats.policies_growth >= 0 ? '#D1FAE5' : '#FEE2E2' },
              ]}>
                <Ionicons
                  name={stats.policies_growth >= 0 ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={stats.policies_growth >= 0 ? '#10B981' : '#EF4444'}
                />
                <Text style={[
                  styles.trendText,
                  { color: stats.policies_growth >= 0 ? '#10B981' : '#EF4444' },
                ]}>
                  {Math.abs(stats.policies_growth)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.metricValue}>{stats?.total_policies?.toLocaleString() || 0}</Text>
          <Text style={styles.metricLabel}>Total Policies</Text>
          <View style={styles.metricDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.detailText}>{stats?.active_policies || 0} active</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={12} color="#F59E0B" />
              <Text style={styles.detailText}>{stats?.pending_policies || 0} pending</Text>
            </View>
          </View>
        </View>

        {/* Claims Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="document-text" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.metricSubtext}>{stats?.claims_this_month || 0} this month</Text>
          </View>
          <Text style={styles.metricValue}>{stats?.total_claims?.toLocaleString() || 0}</Text>
          <Text style={styles.metricLabel}>Total Claims</Text>
          <View style={styles.metricDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="time" size={12} color="#F59E0B" />
              <Text style={styles.detailText}>{stats?.pending_claims || 0} pending</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.detailText}>{stats?.approved_claims || 0} approved</Text>
            </View>
          </View>
        </View>

        {/* Premiums Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="cash" size={20} color="#10B981" />
            </View>
          </View>
          <Text style={styles.metricValue}>\${((stats?.total_premiums_collected || 0) / 1000).toFixed(0)}K</Text>
          <Text style={styles.metricLabel}>Premiums Collected</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Claims Paid</Text>
              <Text style={styles.progressValue}>\${((stats?.total_claims_paid || 0) / 1000).toFixed(0)}K</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: \`\${Math.min(stats?.loss_ratio || 0, 100)}%\` }]}
              />
            </View>
          </View>
        </View>

        {/* Customers Card */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={[styles.metricIconContainer, { backgroundColor: '#FED7AA' }]}>
              <Ionicons name="people" size={20} color="#F97316" />
            </View>
            <Text style={[styles.metricSubtext, { color: '#10B981' }]}>
              +{stats?.new_customers_this_month || 0}
            </Text>
          </View>
          <Text style={styles.metricValue}>{stats?.total_customers?.toLocaleString() || 0}</Text>
          <Text style={styles.metricLabel}>Total Customers</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Retention</Text>
              <Text style={styles.progressValue}>{stats?.customer_retention_rate || 0}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: \`\${stats?.customer_retention_rate || 0}%\`, backgroundColor: '#10B981' },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Policies by Type */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pie-chart" size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Policies by Type</Text>
        </View>
        {stats?.policies_by_type && stats.policies_by_type.length > 0 ? (
          <View style={styles.policyTypeList}>
            {stats.policies_by_type.map((item: any, index: number) => (
              <View key={index} style={styles.policyTypeItem}>
                <View style={styles.policyTypeHeader}>
                  <View style={styles.policyTypeLabelRow}>
                    <View
                      style={[
                        styles.policyTypeDot,
                        { backgroundColor: policyTypeColors[item.type] || '#6B7280' },
                      ]}
                    />
                    <Text style={styles.policyTypeLabel}>{item.type}</Text>
                  </View>
                  <View style={styles.policyTypeValueRow}>
                    <Text style={styles.policyTypeCount}>{item.count}</Text>
                    <Text style={styles.policyTypePercentage}>({item.percentage}%)</Text>
                  </View>
                </View>
                <View style={styles.policyTypeBar}>
                  <View
                    style={[
                      styles.policyTypeBarFill,
                      {
                        width: \`\${item.percentage}%\`,
                        backgroundColor: policyTypeColors[item.type] || '#6B7280',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noDataText}>No data available</Text>
        )}
      </View>

      {/* Claims by Type */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bar-chart" size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Claims by Type</Text>
        </View>
        {stats?.claims_by_type && stats.claims_by_type.length > 0 ? (
          <View style={styles.claimsByTypeList}>
            {stats.claims_by_type.map((item: any, index: number) => (
              <View key={index} style={styles.claimTypeItem}>
                <View
                  style={[
                    styles.claimTypeIcon,
                    { backgroundColor: (policyTypeColors[item.type] || '#6B7280') + '20' },
                  ]}
                >
                  <Ionicons name="document-text" size={20} color={policyTypeColors[item.type] || '#6B7280'} />
                </View>
                <View style={styles.claimTypeInfo}>
                  <Text style={styles.claimTypeName}>{item.type}</Text>
                  <Text style={styles.claimTypeCount}>{item.count} claims</Text>
                </View>
                <Text style={styles.claimTypeAmount}>\${item.amount?.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noDataText}>No data available</Text>
        )}
      </View>

      {/* Loss Ratio Alert */}
      {(stats?.loss_ratio || 0) > 70 && (
        <View style={styles.alertCard}>
          <Ionicons name="alert-triangle" size={20} color="#EF4444" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>High Loss Ratio Alert</Text>
            <Text style={styles.alertText}>
              Your loss ratio is at {stats.loss_ratio}%. Consider reviewing underwriting criteria and claims processes.
            </Text>
          </View>
        </View>
      )}

      {/* Recent Activity */}
      <View style={styles.recentSection}>
        {/* Recent Policies */}
        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <Ionicons name="shield-outline" size={18} color="#8B5CF6" />
            <Text style={styles.recentTitle}>Recent Policies</Text>
          </View>
          {stats?.recent_policies && stats.recent_policies.length > 0 ? (
            stats.recent_policies.slice(0, 5).map((policy: any) => (
              <TouchableOpacity
                key={policy.id}
                style={styles.recentItem}
                onPress={() => navigation.navigate('PolicyDetail' as never, { id: policy.id } as never)}
              >
                <View>
                  <Text style={styles.recentItemTitle}>{policy.policy_number}</Text>
                  <Text style={styles.recentItemSubtitle}>{policy.type} Insurance</Text>
                </View>
                <Text style={styles.recentItemDate}>{formatDate(policy.created_at)}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>No recent policies</Text>
          )}
        </View>

        {/* Recent Claims */}
        <View style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <Ionicons name="document-text-outline" size={18} color="#8B5CF6" />
            <Text style={styles.recentTitle}>Recent Claims</Text>
          </View>
          {stats?.recent_claims && stats.recent_claims.length > 0 ? (
            stats.recent_claims.slice(0, 5).map((claim: any) => {
              const statusColors = getClaimStatusColor(claim.status);
              return (
                <TouchableOpacity
                  key={claim.id}
                  style={styles.recentItem}
                  onPress={() => navigation.navigate('ClaimDetail' as never, { id: claim.id } as never)}
                >
                  <View>
                    <Text style={styles.recentItemTitle}>#{claim.claim_number}</Text>
                    <Text style={styles.recentItemSubtitle}>\${claim.amount?.toLocaleString()}</Text>
                  </View>
                  <View style={styles.recentItemRight}>
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bgColor }]}>
                      <Text style={[styles.statusText, { color: statusColors.color }]}>{claim.status}</Text>
                    </View>
                    <Text style={styles.recentItemDate}>{formatDate(claim.created_at)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noDataText}>No recent claims</Text>
          )}
        </View>
      </View>

      {/* Financial Summary */}
      <View style={styles.financialCard}>
        <View style={styles.financialHeader}>
          <Ionicons name="cash-outline" size={22} color="#FFFFFF" />
          <Text style={styles.financialTitle}>Financial Summary</Text>
        </View>
        <View style={styles.financialGrid}>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Total Coverage</Text>
            <Text style={styles.financialValue}>\${((stats?.total_coverage || 0) / 1000000).toFixed(1)}M</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Premiums</Text>
            <Text style={styles.financialValue}>\${((stats?.total_premiums_collected || 0) / 1000).toFixed(0)}K</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Claims Paid</Text>
            <Text style={styles.financialValue}>\${((stats?.total_claims_paid || 0) / 1000).toFixed(0)}K</Text>
          </View>
          <View style={styles.financialItem}>
            <Text style={styles.financialLabel}>Loss Ratio</Text>
            <Text style={styles.financialValue}>{stats?.loss_ratio || 0}%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  metricCard: {
    width: (screenWidth - 32) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricSubtext: {
    fontSize: 11,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  metricDetails: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  policyTypeList: {
    gap: 12,
  },
  policyTypeItem: {
    gap: 6,
  },
  policyTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  policyTypeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  policyTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  policyTypeLabel: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  policyTypeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  policyTypeCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  policyTypePercentage: {
    fontSize: 12,
    color: '#6B7280',
  },
  policyTypeBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  policyTypeBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  claimsByTypeList: {
    gap: 10,
  },
  claimTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  claimTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  claimTypeInfo: {
    flex: 1,
  },
  claimTypeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textTransform: 'capitalize',
  },
  claimTypeCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  claimTypeAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 16,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 13,
    color: '#B91C1C',
    lineHeight: 18,
  },
  recentSection: {
    paddingHorizontal: 16,
    gap: 16,
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  recentItemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  recentItemSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  recentItemRight: {
    alignItems: 'flex-end',
  },
  recentItemDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  financialCard: {
    backgroundColor: '#8B5CF6',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  financialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  financialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  financialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  financialItem: {
    width: '50%',
    marginBottom: 16,
  },
  financialLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
