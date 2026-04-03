/**
 * Law Firm Stats Component Generators (React Native)
 *
 * Generates dashboard statistics components for law firm applications.
 */

export interface LawfirmOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLawfirmStats(options: LawfirmOptions = {}): string {
  const { componentName = 'LawfirmStats', endpoint = '/lawfirm/stats' } = options;

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
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface TopPerformingAttorney {
  id: string;
  name: string;
  cases_won: number;
  revenue_generated: number;
}

interface PracticeAreaBreakdown {
  area: string;
  case_count: number;
  revenue: number;
}

interface LawfirmStatistics {
  // Case statistics
  total_cases: number;
  active_cases: number;
  pending_cases: number;
  closed_cases: number;
  cases_this_month: number;
  cases_trend: number;

  // Client statistics
  total_clients: number;
  active_clients: number;
  new_clients_this_month: number;
  clients_trend: number;

  // Financial statistics
  total_revenue: number;
  revenue_this_month: number;
  revenue_trend: number;
  outstanding_invoices: number;
  overdue_invoices: number;
  total_trust_balance: number;
  billable_hours_this_month: number;
  average_hourly_rate: number;

  // Attorney statistics
  total_attorneys: number;
  attorneys_billable_hours: number;
  top_performing_attorney?: TopPerformingAttorney;

  // Task & deadline statistics
  upcoming_deadlines: number;
  overdue_tasks: number;
  hearings_this_week: number;
  filings_due_this_week: number;

  // Performance metrics
  win_rate: number;
  average_case_duration: number;
  client_satisfaction_rate?: number;

  // Practice area breakdown
  practice_area_breakdown?: PracticeAreaBreakdown[];
}

interface ${componentName}Props {
  showFinancials?: boolean;
  showPerformance?: boolean;
  compact?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  showFinancials = true,
  showPerformance = true,
  compact = false,
}) => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['lawfirm-stats'],
    queryFn: async () => {
      const response = await api.get<LawfirmStatistics>('${endpoint}');
      return response?.data || response;
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
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return '$' + (amount / 1000).toFixed(1) + 'K';
    }
    return '$' + amount.toLocaleString();
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return { name: 'trending-up', color: '#10B981' };
    } else if (trend < 0) {
      return { name: 'trending-down', color: '#EF4444' };
    }
    return null;
  };

  if (compact) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.compactContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        <TouchableOpacity
          style={styles.compactCard}
          onPress={() => navigation.navigate('Cases', { status: 'active' })}
        >
          <View style={[styles.compactIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="briefcase" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.compactValue}>{stats.active_cases}</Text>
          <Text style={styles.compactLabel}>Active Cases</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.compactCard}
          onPress={() => navigation.navigate('Clients', { status: 'active' })}
        >
          <View style={[styles.compactIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="people" size={20} color="#10B981" />
          </View>
          <Text style={styles.compactValue}>{stats.active_clients}</Text>
          <Text style={styles.compactLabel}>Active Clients</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.compactCard}
          onPress={() => navigation.navigate('Deadlines', { status: 'upcoming' })}
        >
          <View style={[styles.compactIcon, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="alarm" size={20} color="#F97316" />
          </View>
          <Text style={styles.compactValue}>{stats.upcoming_deadlines}</Text>
          <Text style={styles.compactLabel}>Deadlines</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.compactCard}
          onPress={() => navigation.navigate('Billing')}
        >
          <View style={[styles.compactIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="cash" size={20} color="#10B981" />
          </View>
          <Text style={styles.compactValue}>{formatCurrency(stats.revenue_this_month)}</Text>
          <Text style={styles.compactLabel}>This Month</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      {/* Primary Stats Grid */}
      <View style={styles.primaryGrid}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Cases')}
        >
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="briefcase" size={24} color="#3B82F6" />
            </View>
            {stats.cases_trend !== undefined && (
              <View style={styles.trendContainer}>
                {getTrendIcon(stats.cases_trend) && (
                  <Ionicons
                    name={getTrendIcon(stats.cases_trend)!.name as any}
                    size={16}
                    color={getTrendIcon(stats.cases_trend)!.color}
                  />
                )}
                <Text
                  style={[
                    styles.trendText,
                    { color: stats.cases_trend >= 0 ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {Math.abs(stats.cases_trend)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.statValue}>{stats.active_cases}</Text>
          <Text style={styles.statLabel}>Active Cases</Text>
          <Text style={styles.statSubtext}>{stats.total_cases} total</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Clients')}
        >
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="people" size={24} color="#10B981" />
            </View>
            {stats.clients_trend !== undefined && (
              <View style={styles.trendContainer}>
                {getTrendIcon(stats.clients_trend) && (
                  <Ionicons
                    name={getTrendIcon(stats.clients_trend)!.name as any}
                    size={16}
                    color={getTrendIcon(stats.clients_trend)!.color}
                  />
                )}
                <Text
                  style={[
                    styles.trendText,
                    { color: stats.clients_trend >= 0 ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {Math.abs(stats.clients_trend)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.statValue}>{stats.active_clients}</Text>
          <Text style={styles.statLabel}>Active Clients</Text>
          <Text style={styles.statSubtext}>+{stats.new_clients_this_month} this month</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Attorneys')}
        >
          <View style={styles.statHeader}>
            <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="person" size={24} color="#7C3AED" />
            </View>
          </View>
          <Text style={styles.statValue}>{stats.total_attorneys}</Text>
          <Text style={styles.statLabel}>Attorneys</Text>
          <Text style={styles.statSubtext}>{stats.attorneys_billable_hours.toFixed(1)}h billed</Text>
        </TouchableOpacity>

        {showFinancials && (
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Billing')}
          >
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="cash" size={24} color="#10B981" />
              </View>
              {stats.revenue_trend !== undefined && (
                <View style={styles.trendContainer}>
                  {getTrendIcon(stats.revenue_trend) && (
                    <Ionicons
                      name={getTrendIcon(stats.revenue_trend)!.name as any}
                      size={16}
                      color={getTrendIcon(stats.revenue_trend)!.color}
                    />
                  )}
                  <Text
                    style={[
                      styles.trendText,
                      { color: stats.revenue_trend >= 0 ? '#10B981' : '#EF4444' },
                    ]}
                  >
                    {Math.abs(stats.revenue_trend)}%
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats.revenue_this_month)}</Text>
            <Text style={styles.statLabel}>Revenue This Month</Text>
            <Text style={styles.statSubtext}>{formatCurrency(stats.total_revenue)} total</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Alert Stats Row */}
      <View style={styles.alertGrid}>
        <TouchableOpacity
          style={[
            styles.alertCard,
            stats.upcoming_deadlines > 5 && styles.alertCardWarning,
          ]}
          onPress={() => navigation.navigate('Deadlines', { status: 'upcoming' })}
        >
          <View style={[styles.alertIcon, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="time" size={20} color="#F97316" />
          </View>
          <View style={styles.alertContent}>
            <Text
              style={[
                styles.alertValue,
                stats.upcoming_deadlines > 5 && { color: '#F97316' },
              ]}
            >
              {stats.upcoming_deadlines}
            </Text>
            <Text style={styles.alertLabel}>Upcoming Deadlines</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.alertCard,
            stats.overdue_tasks > 0 && styles.alertCardDanger,
          ]}
          onPress={() => navigation.navigate('Tasks', { status: 'overdue' })}
        >
          <View style={[styles.alertIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
          </View>
          <View style={styles.alertContent}>
            <Text
              style={[
                styles.alertValue,
                stats.overdue_tasks > 0 && { color: '#EF4444' },
              ]}
            >
              {stats.overdue_tasks}
            </Text>
            <Text style={styles.alertLabel}>Overdue Tasks</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.alertGrid}>
        <TouchableOpacity
          style={styles.alertCard}
          onPress={() => navigation.navigate('Calendar', { view: 'week' })}
        >
          <View style={[styles.alertIcon, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="hammer" size={20} color="#7C3AED" />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertValue}>{stats.hearings_this_week}</Text>
            <Text style={styles.alertLabel}>Hearings This Week</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.alertCard}
          onPress={() => navigation.navigate('Filings')}
        >
          <View style={[styles.alertIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="document-text" size={20} color="#3B82F6" />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertValue}>{stats.filings_due_this_week}</Text>
            <Text style={styles.alertLabel}>Filings Due</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Financial Overview */}
      {showFinancials && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash-outline" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Financial Overview</Text>
          </View>

          <View style={styles.financialGrid}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Outstanding Invoices</Text>
              <Text style={styles.financialValue}>
                {formatCurrency(stats.outstanding_invoices)}
              </Text>
            </View>

            <View
              style={[
                styles.financialItem,
                stats.overdue_invoices > 0 && styles.financialItemDanger,
              ]}
            >
              <Text style={styles.financialLabel}>Overdue Invoices</Text>
              <Text
                style={[
                  styles.financialValue,
                  stats.overdue_invoices > 0 && { color: '#EF4444' },
                ]}
              >
                {formatCurrency(stats.overdue_invoices)}
              </Text>
            </View>

            <View style={[styles.financialItem, styles.financialItemSuccess]}>
              <Text style={styles.financialLabel}>Trust Balance</Text>
              <Text style={[styles.financialValue, { color: '#10B981' }]}>
                {formatCurrency(stats.total_trust_balance)}
              </Text>
            </View>

            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Billable Hours (Month)</Text>
              <Text style={styles.financialValue}>
                {stats.billable_hours_this_month.toFixed(1)}h
              </Text>
            </View>
          </View>

          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>Average Hourly Rate</Text>
            <Text style={styles.rateValue}>\${stats.average_hourly_rate}/hr</Text>
          </View>
        </View>
      )}

      {/* Performance Metrics */}
      {showPerformance && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
          </View>

          <View style={styles.performanceGrid}>
            <View style={[styles.performanceItem, styles.performanceItemSuccess]}>
              <Text style={styles.performanceLabel}>Win Rate</Text>
              <Text style={styles.performanceValue}>{stats.win_rate.toFixed(1)}%</Text>
            </View>

            <View style={styles.performanceItem}>
              <Text style={styles.performanceLabel}>Avg. Case Duration</Text>
              <Text style={styles.performanceValue}>{stats.average_case_duration}</Text>
              <Text style={styles.performanceUnit}>days</Text>
            </View>

            {stats.client_satisfaction_rate !== undefined && (
              <View style={[styles.performanceItem, styles.performanceItemBlue]}>
                <Text style={styles.performanceLabel}>Client Satisfaction</Text>
                <Text style={styles.performanceValue}>
                  {stats.client_satisfaction_rate.toFixed(1)}%
                </Text>
              </View>
            )}
          </View>

          {stats.top_performing_attorney && (
            <TouchableOpacity
              style={styles.topAttorneyCard}
              onPress={() =>
                navigation.navigate('AttorneyDetail', { id: stats.top_performing_attorney?.id })
              }
            >
              <Text style={styles.topAttorneyLabel}>Top Performing Attorney</Text>
              <View style={styles.topAttorneyRow}>
                <Text style={styles.topAttorneyName}>{stats.top_performing_attorney.name}</Text>
                <View style={styles.topAttorneyStats}>
                  <Text style={styles.topAttorneyWins}>
                    {stats.top_performing_attorney.cases_won} wins
                  </Text>
                  <Text style={styles.topAttorneyRevenue}>
                    {formatCurrency(stats.top_performing_attorney.revenue_generated)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Practice Area Breakdown */}
      {stats.practice_area_breakdown && stats.practice_area_breakdown.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase-outline" size={20} color="#7C3AED" />
            <Text style={styles.sectionTitle}>Practice Area Breakdown</Text>
          </View>

          {stats.practice_area_breakdown.map((area, index) => {
            const maxCases = Math.max(
              ...stats.practice_area_breakdown!.map((a) => a.case_count)
            );
            const percentage = (area.case_count / maxCases) * 100;

            return (
              <View key={index} style={styles.practiceAreaItem}>
                <View style={styles.practiceAreaHeader}>
                  <Text style={styles.practiceAreaName}>{area.area}</Text>
                  <View style={styles.practiceAreaStats}>
                    <Text style={styles.practiceAreaCount}>{area.case_count} cases</Text>
                    <Text style={styles.practiceAreaRevenue}>{formatCurrency(area.revenue)}</Text>
                  </View>
                </View>
                <View style={styles.practiceAreaBar}>
                  <View
                    style={[styles.practiceAreaProgress, { width: percentage + '%' }]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View style={styles.bottomSpacing} />
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
  compactContainer: {
    padding: 16,
    gap: 12,
  },
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  compactLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  primaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  alertGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  alertCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  alertCardWarning: {
    borderColor: '#FDBA74',
  },
  alertCardDanger: {
    borderColor: '#FCA5A5',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  alertLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  financialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  financialItem: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
  },
  financialItemDanger: {
    backgroundColor: '#FEF2F2',
  },
  financialItemSuccess: {
    backgroundColor: '#F0FDF4',
  },
  financialLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  rateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  performanceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  performanceItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  performanceItemSuccess: {
    backgroundColor: '#F0FDF4',
  },
  performanceItemBlue: {
    backgroundColor: '#EFF6FF',
  },
  performanceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  performanceValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  performanceUnit: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  topAttorneyCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
  },
  topAttorneyLabel: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 8,
  },
  topAttorneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topAttorneyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  topAttorneyStats: {
    alignItems: 'flex-end',
  },
  topAttorneyWins: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  topAttorneyRevenue: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 2,
  },
  practiceAreaItem: {
    marginBottom: 16,
  },
  practiceAreaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceAreaName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  practiceAreaStats: {
    flexDirection: 'row',
    gap: 8,
  },
  practiceAreaCount: {
    fontSize: 14,
    color: '#111827',
  },
  practiceAreaRevenue: {
    fontSize: 12,
    color: '#6B7280',
  },
  practiceAreaBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  practiceAreaProgress: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 4,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default ${componentName};
`;
}
