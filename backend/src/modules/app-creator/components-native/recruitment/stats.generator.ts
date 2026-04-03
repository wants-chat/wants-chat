/**
 * Recruitment Stats Component Generators (React Native)
 *
 * Generates comprehensive stats dashboard components for recruitment metrics,
 * KPIs, and analytics visualization.
 */

export interface RecruitmentStatsOptions {
  componentName?: string;
  endpoint?: string;
}

/**
 * Generate RecruitmentStats component (React Native)
 * Comprehensive recruitment statistics dashboard with KPIs and charts
 */
export function generateRecruitmentStats(options: RecruitmentStatsOptions = {}): string {
  const { componentName = 'RecruitmentStats', endpoint = '/recruitment/stats' } = options;

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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ${componentName}Props {
  dateRange?: { from: string; to: string };
}

const ${componentName}: React.FC<${componentName}Props> = ({ dateRange }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['recruitment-stats', selectedPeriod, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('period', selectedPeriod);
      if (dateRange?.from) params.append('from', dateRange.from);
      if (dateRange?.to) params.append('to', dateRange.to);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return response?.data || response || {};
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const periods = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
  ];

  const kpis = [
    {
      label: 'Applications',
      value: stats?.total_applications || 0,
      change: stats?.applications_change,
      icon: 'people',
      color: '#3B82F6',
    },
    {
      label: 'Active Jobs',
      value: stats?.active_jobs || 0,
      change: stats?.jobs_change,
      icon: 'briefcase',
      color: '#A855F7',
    },
    {
      label: 'Placements',
      value: stats?.placements || 0,
      change: stats?.placements_change,
      icon: 'checkmark-circle',
      color: '#10B981',
    },
    {
      label: 'Time to Hire',
      value: (stats?.avg_time_to_hire || 0) + 'd',
      change: stats?.time_to_hire_change,
      icon: 'time',
      color: '#F97316',
      invertChange: true,
    },
    {
      label: 'Revenue',
      value: '$' + ((stats?.revenue || 0) / 1000).toFixed(0) + 'k',
      change: stats?.revenue_change,
      icon: 'cash',
      color: '#10B981',
    },
    {
      label: 'Fill Rate',
      value: (stats?.fill_rate || 0) + '%',
      change: stats?.fill_rate_change,
      icon: 'stats-chart',
      color: '#6366F1',
    },
  ];

  const pipelineStats = stats?.pipeline || [
    { stage: 'New', count: 145, percentage: 35 },
    { stage: 'Screening', count: 89, percentage: 21 },
    { stage: 'Interview', count: 67, percentage: 16 },
    { stage: 'Assessment', count: 45, percentage: 11 },
    { stage: 'Offer', count: 32, percentage: 8 },
    { stage: 'Hired', count: 38, percentage: 9 },
  ];

  const sourceStats = stats?.sources || [
    { source: 'LinkedIn', count: 156, percentage: 38, color: '#0A66C2' },
    { source: 'Indeed', count: 98, percentage: 24, color: '#2164F3' },
    { source: 'Referrals', count: 67, percentage: 16, color: '#10B981' },
    { source: 'Company Site', count: 52, percentage: 13, color: '#F97316' },
    { source: 'Other', count: 37, percentage: 9, color: '#6B7280' },
  ];

  const topRecruiters = stats?.top_recruiters || [
    { name: 'Sarah Johnson', placements: 12, revenue: 156000 },
    { name: 'Mike Chen', placements: 10, revenue: 132000 },
    { name: 'Emily Davis', placements: 8, revenue: 98000 },
    { name: 'James Wilson', placements: 7, revenue: 87000 },
  ];

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
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
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Recruitment Analytics</Text>
          <Text style={styles.subtitle}>Performance overview</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={() => refetch()}>
          <Ionicons name="refresh" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.value}
            style={[
              styles.periodButton,
              selectedPeriod === period.value && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.value as any)}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period.value && styles.periodTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        {kpis.map((kpi, index) => {
          const change = kpi.invertChange ? -(kpi.change || 0) : (kpi.change || 0);
          const isPositive = change >= 0;

          return (
            <View key={index} style={styles.kpiCard}>
              <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: kpi.color + '20' }]}>
                  <Ionicons name={kpi.icon as any} size={18} color={kpi.color} />
                </View>
                {kpi.change !== undefined && (
                  <View style={[
                    styles.changeBadge,
                    { backgroundColor: isPositive ? '#D1FAE5' : '#FEE2E2' },
                  ]}>
                    <Ionicons
                      name={isPositive ? 'arrow-up' : 'arrow-down'}
                      size={12}
                      color={isPositive ? '#10B981' : '#EF4444'}
                    />
                    <Text style={[
                      styles.changeText,
                      { color: isPositive ? '#10B981' : '#EF4444' },
                    ]}>
                      {Math.abs(kpi.change)}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
            </View>
          );
        })}
      </View>

      {/* Pipeline Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="git-branch-outline" size={20} color="#6B7280" />
          <Text style={styles.sectionTitle}>Candidate Pipeline</Text>
        </View>
        <View style={styles.pipelineCard}>
          {pipelineStats.map((stage: any, index: number) => (
            <View key={index} style={styles.pipelineRow}>
              <View style={styles.pipelineInfo}>
                <Text style={styles.pipelineStageName}>{stage.stage}</Text>
                <Text style={styles.pipelineCount}>
                  {stage.count} ({stage.percentage}%)
                </Text>
              </View>
              <View style={styles.pipelineBarContainer}>
                <View
                  style={[
                    styles.pipelineBar,
                    { width: \`\${stage.percentage}%\` },
                  ]}
                />
              </View>
            </View>
          ))}
          <View style={styles.pipelineTotal}>
            <Text style={styles.pipelineTotalLabel}>Total in Pipeline</Text>
            <Text style={styles.pipelineTotalValue}>
              {pipelineStats.reduce((sum: number, s: any) => sum + s.count, 0)} candidates
            </Text>
          </View>
        </View>
      </View>

      {/* Sources Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pie-chart-outline" size={20} color="#6B7280" />
          <Text style={styles.sectionTitle}>Application Sources</Text>
        </View>
        <View style={styles.sourcesCard}>
          {sourceStats.map((source: any, index: number) => (
            <View key={index} style={styles.sourceRow}>
              <View style={[styles.sourceDot, { backgroundColor: source.color }]} />
              <Text style={styles.sourceName}>{source.source}</Text>
              <Text style={styles.sourceCount}>{source.count}</Text>
              <Text style={styles.sourcePercentage}>{source.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top Recruiters Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy-outline" size={20} color="#6B7280" />
          <Text style={styles.sectionTitle}>Top Recruiters</Text>
        </View>
        <View style={styles.recruitersCard}>
          {topRecruiters.map((recruiter: any, index: number) => (
            <View key={index} style={styles.recruiterRow}>
              <View style={styles.recruiterRank}>
                <Text style={styles.recruiterRankText}>{index + 1}</Text>
              </View>
              <View style={styles.recruiterAvatar}>
                <Text style={styles.recruiterAvatarText}>
                  {recruiter.name.split(' ').map((n: string) => n[0]).join('')}
                </Text>
              </View>
              <View style={styles.recruiterInfo}>
                <Text style={styles.recruiterName}>{recruiter.name}</Text>
                <Text style={styles.recruiterPlacements}>
                  {recruiter.placements} placements
                </Text>
              </View>
              <View style={styles.recruiterRevenue}>
                <Text style={styles.recruiterRevenueValue}>
                  {'$'}{(recruiter.revenue / 1000).toFixed(0)}k
                </Text>
                <Text style={styles.recruiterRevenueLabel}>revenue</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Insights Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bulb-outline" size={20} color="#6B7280" />
          <Text style={styles.sectionTitle}>Quick Insights</Text>
        </View>
        <View style={styles.insightsGrid}>
          <View style={[styles.insightCard, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="trending-up" size={20} color="#3B82F6" />
            <Text style={[styles.insightTitle, { color: '#1D4ED8' }]}>Best Source</Text>
            <Text style={[styles.insightText, { color: '#3B82F6' }]}>
              LinkedIn brings {sourceStats[0]?.percentage || 0}% of candidates
            </Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={[styles.insightTitle, { color: '#047857' }]}>Conversion</Text>
            <Text style={[styles.insightText, { color: '#10B981' }]}>
              {stats?.conversion_rate || 12}% result in placements
            </Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="time" size={20} color="#A855F7" />
            <Text style={[styles.insightTitle, { color: '#6B21A8' }]}>Fastest Dept</Text>
            <Text style={[styles.insightText, { color: '#A855F7' }]}>
              Engineering hires 15% faster
            </Text>
          </View>
          <View style={[styles.insightCard, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="flag" size={20} color="#F97316" />
            <Text style={[styles.insightTitle, { color: '#C2410C' }]}>Goal Progress</Text>
            <Text style={[styles.insightText, { color: '#F97316' }]}>
              {stats?.goal_progress || 78}% of quarterly target
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 24 }} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  refreshButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  kpiCard: {
    width: (SCREEN_WIDTH - 40) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  pipelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pipelineRow: {
    marginBottom: 12,
  },
  pipelineInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pipelineStageName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  pipelineCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  pipelineBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
  },
  pipelineBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  pipelineTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  pipelineTotalLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  pipelineTotalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  sourcesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sourceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  sourceName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  sourceCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
  },
  sourcePercentage: {
    fontSize: 13,
    color: '#6B7280',
    width: 40,
    textAlign: 'right',
  },
  recruitersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recruiterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  recruiterRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recruiterRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  recruiterAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  recruiterAvatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  recruiterInfo: {
    flex: 1,
  },
  recruiterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  recruiterPlacements: {
    fontSize: 12,
    color: '#6B7280',
  },
  recruiterRevenue: {
    alignItems: 'flex-end',
  },
  recruiterRevenueValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
  },
  recruiterRevenueLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  insightCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    borderRadius: 10,
    padding: 12,
    margin: 4,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default ${componentName};
`;
}

/**
 * Generate RecruitmentKPICards component (React Native)
 * Focused KPI cards for quick metrics overview
 */
export function generateRecruitmentKPICards(options: RecruitmentStatsOptions = {}): string {
  const { componentName = 'RecruitmentKPICards', endpoint = '/recruitment/kpis' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ${componentName}Props {
  compact?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ compact = false }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: kpis, isLoading, refetch } = useQuery({
    queryKey: ['recruitment-kpis'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {};
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const cards = [
    {
      label: 'Open Positions',
      value: kpis?.open_positions || 0,
      change: kpis?.open_positions_change,
      icon: 'briefcase',
      color: '#3B82F6',
      format: 'number',
    },
    {
      label: 'Active Candidates',
      value: kpis?.active_candidates || 0,
      change: kpis?.active_candidates_change,
      icon: 'people',
      color: '#A855F7',
      format: 'number',
    },
    {
      label: 'Monthly Placements',
      value: kpis?.monthly_placements || 0,
      change: kpis?.placements_change,
      icon: 'checkmark-circle',
      color: '#10B981',
      format: 'number',
    },
    {
      label: 'Avg. Days to Hire',
      value: kpis?.avg_days_to_hire || 0,
      change: kpis?.days_to_hire_change,
      icon: 'time',
      color: '#F97316',
      format: 'days',
      invertChange: true,
    },
  ];

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') return '$' + value.toLocaleString();
    if (format === 'percentage') return value + '%';
    if (format === 'days') return value + ' days';
    return value.toLocaleString();
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      {cards.map((card, index) => {
        const change = card.invertChange ? -(card.change || 0) : (card.change || 0);
        const isPositive = change >= 0;

        return (
          <View
            key={index}
            style={[
              styles.card,
              compact && styles.cardCompact,
              { width: compact ? (SCREEN_WIDTH - 48) / 2 : (SCREEN_WIDTH - 48) / 2 },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: card.color + '20' }]}>
                <Ionicons
                  name={card.icon as any}
                  size={compact ? 16 : 18}
                  color={card.color}
                />
              </View>
              {card.change !== undefined && (
                <View style={[
                  styles.changeBadge,
                  { backgroundColor: isPositive ? '#D1FAE5' : '#FEE2E2' },
                ]}>
                  <Ionicons
                    name={isPositive ? 'arrow-up' : 'arrow-down'}
                    size={10}
                    color={isPositive ? '#10B981' : '#EF4444'}
                  />
                  <Text style={[
                    styles.changeText,
                    { color: isPositive ? '#10B981' : '#EF4444' },
                  ]}>
                    {Math.abs(card.change)}%
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.cardValue, compact && styles.cardValueCompact]}>
              {formatValue(card.value, card.format)}
            </Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardCompact: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  cardValueCompact: {
    fontSize: 18,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generate RecruitmentMetricsChart component (React Native)
 * Bar chart for recruitment metrics visualization
 */
export function generateRecruitmentMetricsChart(options: RecruitmentStatsOptions = {}): string {
  const { componentName = 'RecruitmentMetricsChart', endpoint = '/recruitment/metrics' } = options;

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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'applications' | 'placements' | 'revenue'>('applications');

  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['recruitment-metrics', selectedMetric],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?metric=\${selectedMetric}\`);
      return response?.data || response || [];
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const metricOptions = [
    { id: 'applications', label: 'Applications', icon: 'people', color: '#3B82F6' },
    { id: 'placements', label: 'Placements', icon: 'checkmark-circle', color: '#10B981' },
    { id: 'revenue', label: 'Revenue', icon: 'cash', color: '#10B981' },
  ];

  const sampleData = [
    { month: 'Jan', value: 120 },
    { month: 'Feb', value: 145 },
    { month: 'Mar', value: 132 },
    { month: 'Apr', value: 178 },
    { month: 'May', value: 156 },
    { month: 'Jun', value: 189 },
    { month: 'Jul', value: 201 },
    { month: 'Aug', value: 167 },
    { month: 'Sep', value: 223 },
    { month: 'Oct', value: 198 },
    { month: 'Nov', value: 234 },
    { month: 'Dec', value: 256 },
  ];

  const chartData = metrics?.length > 0 ? metrics : sampleData;
  const maxValue = Math.max(...chartData.map((d: any) => d.value));

  const selectedOption = metricOptions.find((m) => m.id === selectedMetric);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  const total = chartData.reduce((sum: number, d: any) => sum + d.value, 0);
  const average = Math.round(total / chartData.length);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Ionicons name="bar-chart-outline" size={20} color="#6B7280" />
          <Text style={styles.title}>Recruitment Trends</Text>
        </View>
      </View>

      <View style={styles.metricSelector}>
        {metricOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.metricButton,
              selectedMetric === option.id && styles.metricButtonActive,
            ]}
            onPress={() => setSelectedMetric(option.id as any)}
          >
            <Ionicons
              name={option.icon as any}
              size={14}
              color={selectedMetric === option.id ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[
              styles.metricText,
              selectedMetric === option.id && styles.metricTextActive,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chartContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {chartData.map((item: any, index: number) => {
          const height = (item.value / maxValue) * 150;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: height,
                      backgroundColor: selectedOption?.color || '#3B82F6',
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.month}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{total.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{average.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.growthBadge}>
            <Ionicons name="trending-up" size={14} color="#10B981" />
            <Text style={styles.growthText}>12%</Text>
          </View>
          <Text style={styles.statLabel}>Growth</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    margin: 16,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  metricSelector: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  metricButtonActive: {
    backgroundColor: '#3B82F6',
  },
  metricText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  metricTextActive: {
    color: '#FFFFFF',
  },
  chartContainer: {
    paddingHorizontal: 12,
    paddingVertical: 20,
    alignItems: 'flex-end',
  },
  barContainer: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 30,
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  growthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 4,
  },
});

export default ${componentName};
`;
}
