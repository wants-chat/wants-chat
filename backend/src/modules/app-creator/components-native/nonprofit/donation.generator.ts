/**
 * Donation Component Generators (React Native)
 *
 * Generates donation management and tracking components for React Native.
 */

export interface DonationOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDonationStats(options: DonationOptions = {}): string {
  const { componentName = 'DonationStats', endpoint = '/donations' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['donation-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/stats');
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const progress = stats?.goal
    ? Math.min((stats.total_this_month / stats.goal) * 100, 100)
    : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Stats Banner */}
      <View style={styles.mainBanner}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerHeader}>
            <View>
              <Text style={styles.bannerLabel}>Total Donations This Month</Text>
              <Text style={styles.bannerValue}>
                \${(stats?.total_this_month || 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.bannerIcon}>
              <Ionicons name="cash" size={32} color="#FFFFFF" />
            </View>
          </View>
          {stats?.goal && (
            <View style={styles.goalSection}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalLabel}>Monthly Goal</Text>
                <Text style={styles.goalValue}>\${stats.goal.toLocaleString()}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
              </View>
              <Text style={styles.goalProgress}>
                {progress.toFixed(1)}% of goal reached
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="people" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statLabel}>Total Donors</Text>
          <Text style={styles.statValue}>{stats?.total_donors || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="trending-up" size={20} color="#10B981" />
          </View>
          <Text style={styles.statLabel}>Avg. Donation</Text>
          <Text style={styles.statValue}>
            \${(stats?.average_donation || 0).toFixed(2)}
          </Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="calendar" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.statLabel}>Recurring</Text>
          <Text style={styles.statValue}>{stats?.recurring_donors || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FCE7F3' }]}>
            <Ionicons name="heart" size={20} color="#EC4899" />
          </View>
          <Text style={styles.statLabel}>New Donors</Text>
          <Text style={styles.statValue}>
            {stats?.new_donors_this_month || 0}
          </Text>
        </View>
      </View>

      {/* Year Summaries */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Year to Date</Text>
          <Text style={styles.summaryValue}>
            \${(stats?.year_to_date || 0).toLocaleString()}
          </Text>
          <Text style={[
            styles.summaryChange,
            (stats?.ytd_change || 0) >= 0 ? styles.positive : styles.negative,
          ]}>
            {stats?.ytd_change >= 0 ? '+' : ''}{stats?.ytd_change || 0}% vs last year
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>All Time</Text>
          <Text style={styles.summaryValueDark}>
            \${(stats?.all_time || 0).toLocaleString()}
          </Text>
          <Text style={styles.summarySubtext}>
            From {stats?.total_donations || 0} donations
          </Text>
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
    paddingVertical: 48,
  },
  mainBanner: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#10B981',
    overflow: 'hidden',
  },
  bannerContent: {
    padding: 20,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bannerLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  bannerValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  bannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalSection: {
    marginTop: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  goalValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  goalProgress: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  summaryValueDark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryChange: {
    fontSize: 13,
    marginTop: 4,
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },
  summarySubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateDonationChart(options: DonationOptions = {}): string {
  const { componentName = 'DonationChart', endpoint = '/donations' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

const ${componentName}: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['donation-chart', timeRange],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/chart?range=\${timeRange}\`);
      return response?.data || response;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const maxValue = Math.max(...(chartData?.data?.map((d: any) => d.value) || [1]));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Donation Trends</Text>
          {chartData?.trend !== undefined && (
            <View style={styles.trendRow}>
              <Ionicons
                name={chartData.trend >= 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={chartData.trend >= 0 ? '#10B981' : '#EF4444'}
              />
              <Text style={[
                styles.trendText,
                chartData.trend >= 0 ? styles.positive : styles.negative,
              ]}>
                {chartData.trend >= 0 ? '+' : ''}{chartData.trend}% from previous period
              </Text>
            </View>
          )}
        </View>
        <View style={styles.rangeSelector}>
          {(['week', 'month', 'quarter', 'year'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.rangeButton,
                timeRange === range && styles.activeRangeButton,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text style={[
                styles.rangeText,
                timeRange === range && styles.activeRangeText,
              ]}>
                {range.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {chartData?.data?.map((item: any, index: number) => (
          <View key={index} style={styles.barContainer}>
            <Text style={styles.barValue}>
              \${(item.value / 1000).toFixed(0)}k
            </Text>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  { height: \`\${(item.value / maxValue) * 100}%\` },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      {chartData?.summary && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>
              \${chartData.summary.total?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average</Text>
            <Text style={styles.summaryValue}>
              \${chartData.summary.average?.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Count</Text>
            <Text style={styles.summaryValue}>
              {chartData.summary.count}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    margin: 16,
  },
  loadingContainer: {
    padding: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendText: {
    fontSize: 13,
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  rangeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activeRangeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeRangeText: {
    color: '#111827',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  barWrapper: {
    width: 24,
    height: 160,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: '#10B981',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateDonationFiltersNonprofit(options: DonationOptions = {}): string {
  const { componentName = 'DonationFiltersNonprofit' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FiltersState {
  search: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
  type: string;
  campaign: string;
  status: string;
}

interface ${componentName}Props {
  onFilterChange: (filters: FiltersState) => void;
  campaigns?: { id: string; name: string }[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onFilterChange,
  campaigns = [],
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    type: 'all',
    campaign: 'all',
    status: 'all',
  });

  const handleChange = (key: keyof FiltersState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: FiltersState = {
      search: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      type: 'all',
      campaign: 'all',
      status: 'all',
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && value !== 'all' && value !== ''
  );

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'one-time', label: 'One-Time' },
    { value: 'recurring', label: 'Recurring' },
    { value: 'pledge', label: 'Pledge' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search donors..."
            placeholderTextColor="#9CA3AF"
            value={filters.search}
            onChangeText={(text) => handleChange('search', text)}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            (showAdvanced || hasActiveFilters) && styles.filterButtonActive,
          ]}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Ionicons
            name="options"
            size={20}
            color={(showAdvanced || hasActiveFilters) ? '#10B981' : '#6B7280'}
          />
        </TouchableOpacity>
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Ionicons name="close" size={20} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeScroll}
        contentContainerStyle={styles.typeContainer}
      >
        {typeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.typeChip,
              filters.type === option.value && styles.typeChipActive,
            ]}
            onPress={() => handleChange('type', option.value)}
          >
            <Text style={[
              styles.typeText,
              filters.type === option.value && styles.typeTextActive,
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Advanced Filters Modal */}
      <Modal
        visible={showAdvanced}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAdvanced(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Advanced Filters</Text>
            <TouchableOpacity onPress={() => setShowAdvanced(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount Range</Text>
              <View style={styles.amountRow}>
                <View style={styles.amountInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountField}
                    placeholder="Min"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={filters.minAmount}
                    onChangeText={(text) => handleChange('minAmount', text)}
                  />
                </View>
                <Text style={styles.amountSeparator}>to</Text>
                <View style={styles.amountInput}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.amountField}
                    placeholder="Max"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={filters.maxAmount}
                    onChangeText={(text) => handleChange('maxAmount', text)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Status</Text>
              <View style={styles.optionsGrid}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionChip,
                      filters.status === option.value && styles.optionChipActive,
                    ]}
                    onPress={() => handleChange('status', option.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      filters.status === option.value && styles.optionTextActive,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {campaigns.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Campaign</Text>
                <View style={styles.optionsGrid}>
                  <TouchableOpacity
                    style={[
                      styles.optionChip,
                      filters.campaign === 'all' && styles.optionChipActive,
                    ]}
                    onPress={() => handleChange('campaign', 'all')}
                  >
                    <Text style={[
                      styles.optionText,
                      filters.campaign === 'all' && styles.optionTextActive,
                    ]}>
                      All Campaigns
                    </Text>
                  </TouchableOpacity>
                  {campaigns.map((campaign) => (
                    <TouchableOpacity
                      key={campaign.id}
                      style={[
                        styles.optionChip,
                        filters.campaign === campaign.id && styles.optionChipActive,
                      ]}
                      onPress={() => handleChange('campaign', campaign.id)}
                    >
                      <Text style={[
                        styles.optionText,
                        filters.campaign === campaign.id && styles.optionTextActive,
                      ]}>
                        {campaign.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowAdvanced(false)}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeScroll: {
    marginTop: 12,
  },
  typeContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: '#10B981',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6B7280',
  },
  amountField: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  amountSeparator: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  optionChipActive: {
    backgroundColor: '#10B981',
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generateDonationSummary(options: DonationOptions = {}): string {
  const { componentName = 'DonationSummary', endpoint = '/donations' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 5 }) => {
  const navigation = useNavigation();

  const { data: donations, isLoading } = useQuery({
    queryKey: ['recent-donations', limit],
    queryFn: async () => {
      const response = await api.get<any>(
        \`${endpoint}?limit=\${limit}&sort=created_at:desc\`
      );
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderDonation = ({ item: donation }: { item: any }) => (
    <View style={styles.donationItem}>
      <View style={[
        styles.donationIcon,
        donation.type === 'recurring' ? styles.recurringIcon : styles.oneTimeIcon,
      ]}>
        <Ionicons
          name={donation.type === 'recurring' ? 'refresh' : 'cash'}
          size={20}
          color={donation.type === 'recurring' ? '#8B5CF6' : '#10B981'}
        />
      </View>
      <View style={styles.donationInfo}>
        <Text style={styles.donorName}>
          {donation.donor_name || 'Anonymous'}
        </Text>
        <View style={styles.donationMeta}>
          {donation.campaign_name && (
            <Text style={styles.campaignName}>{donation.campaign_name}</Text>
          )}
          <Text style={styles.donationDate}>
            {formatDate(donation.created_at)}
          </Text>
        </View>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>\${donation.amount?.toLocaleString()}</Text>
        {donation.type === 'recurring' && (
          <Text style={styles.frequency}>{donation.frequency || 'Monthly'}</Text>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Donations</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Donations' as never)}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={16} color="#10B981" />
        </TouchableOpacity>
      </View>

      {donations && donations.length > 0 ? (
        <FlatList
          data={donations}
          renderItem={renderDonation}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recent donations</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    margin: 16,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 48,
    justifyContent: 'center',
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  donationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oneTimeIcon: {
    backgroundColor: '#D1FAE5',
  },
  recurringIcon: {
    backgroundColor: '#EDE9FE',
  },
  donationInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  donationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  campaignName: {
    fontSize: 13,
    color: '#6B7280',
  },
  donationDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  frequency: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateDonorProfile(options: DonationOptions = {}): string {
  const { componentName = 'DonorProfile', endpoint = '/donors' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: donor, isLoading } = useQuery({
    queryKey: ['donor', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: donations } = useQuery({
    queryKey: ['donor-donations', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${id}/donations\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!donor) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Donor not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          {donor.avatar_url ? (
            <Image source={{ uri: donor.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#10B981" />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.donorName}>{donor.name}</Text>
            {donor.donor_level && (
              <View style={styles.levelBadge}>
                <Ionicons name="ribbon" size={14} color="#D97706" />
                <Text style={styles.levelText}>{donor.donor_level}</Text>
              </View>
            )}
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Given</Text>
            <Text style={styles.totalValue}>
              \${(donor.total_donations || 0).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.contactInfo}>
          {donor.email && (
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{donor.email}</Text>
            </View>
          )}
          {donor.phone && (
            <View style={styles.contactItem}>
              <Ionicons name="call" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{donor.phone}</Text>
            </View>
          )}
          {donor.address && (
            <View style={styles.contactItem}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{donor.address}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="gift" size={20} color="#10B981" />
          </View>
          <Text style={styles.statLabel}>Donations</Text>
          <Text style={styles.statValue}>{donor.donation_count || 0}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="trending-up" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>
            \${(donor.average_donation || 0).toFixed(0)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="heart" size={20} color="#8B5CF6" />
          </View>
          <Text style={styles.statLabel}>Type</Text>
          <Text style={styles.statValue}>
            {donor.is_recurring ? 'Recurring' : 'One-time'}
          </Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="time" size={20} color="#F97316" />
          </View>
          <Text style={styles.statLabel}>First Gift</Text>
          <Text style={styles.statValue}>
            {donor.first_donation_date
              ? formatDate(donor.first_donation_date)
              : '-'}
          </Text>
        </View>
      </View>

      {/* Donation History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Donation History</Text>
        {donations && donations.length > 0 ? (
          donations.map((donation: any) => (
            <View key={donation.id} style={styles.historyItem}>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>
                  {donation.campaign_name || 'General Fund'}
                </Text>
                <View style={styles.historyMeta}>
                  <Ionicons name="calendar" size={12} color="#9CA3AF" />
                  <Text style={styles.historyDate}>
                    {formatDate(donation.created_at)}
                  </Text>
                </View>
              </View>
              <View style={styles.historyAmount}>
                <Text style={styles.amountText}>
                  \${donation.amount?.toLocaleString()}
                </Text>
                <Text style={styles.paymentMethod}>
                  {donation.payment_method}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryText}>No donation history</Text>
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  levelText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  contactInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#4B5563',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  historySection: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  historyDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  historyAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyHistory: {
    padding: 32,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 15,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateMemberDonations(options: DonationOptions = {}): string {
  const { componentName = 'MemberDonations', endpoint = '/donations' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear.toString());

  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push(i.toString());
  }

  const { data: myDonations, isLoading } = useQuery({
    queryKey: ['my-donations', year],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/me?year=\${year}\`);
      return response?.data || response;
    },
  });

  const { data: summary } = useQuery({
    queryKey: ['my-donation-summary', year],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/me/summary?year=\${year}\`);
      return response?.data || response;
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Giving</Text>
        <View style={styles.headerActions}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearSelector}
          >
            {years.map((y) => (
              <TouchableOpacity
                key={y}
                style={[styles.yearChip, year === y && styles.activeYearChip]}
                onPress={() => setYear(y)}
              >
                <Text style={[styles.yearText, year === y && styles.activeYearText]}>
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.mainStatCard}>
          <View style={styles.mainStatHeader}>
            <Ionicons name="cash" size={24} color="rgba(255,255,255,0.8)" />
            <Text style={styles.mainStatYear}>{year}</Text>
          </View>
          <Text style={styles.mainStatValue}>
            \${(summary?.total || 0).toLocaleString()}
          </Text>
          <Text style={styles.mainStatLabel}>Total Giving</Text>
        </View>
      </View>

      <View style={styles.secondaryStats}>
        <View style={styles.secondaryStatCard}>
          <View style={[styles.statIconSmall, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="gift" size={18} color="#3B82F6" />
          </View>
          <Text style={styles.secondaryStatLabel}>Contributions</Text>
          <Text style={styles.secondaryStatValue}>{summary?.count || 0}</Text>
        </View>

        <View style={styles.secondaryStatCard}>
          <View style={[styles.statIconSmall, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="refresh" size={18} color="#8B5CF6" />
          </View>
          <Text style={styles.secondaryStatLabel}>Recurring</Text>
          <Text style={styles.secondaryStatValue}>
            \${(summary?.recurring_total || 0).toLocaleString()}/mo
          </Text>
        </View>

        <View style={styles.secondaryStatCard}>
          <View style={[styles.statIconSmall, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="trending-up" size={18} color="#F97316" />
          </View>
          <Text style={styles.secondaryStatLabel}>vs Last Year</Text>
          <Text style={[
            styles.secondaryStatValue,
            (summary?.yoy_change || 0) >= 0 ? styles.positive : styles.negative,
          ]}>
            {summary?.yoy_change >= 0 ? '+' : ''}{summary?.yoy_change || 0}%
          </Text>
        </View>
      </View>

      {/* Transaction History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {myDonations?.donations && myDonations.donations.length > 0 ? (
          myDonations.donations.map((donation: any) => (
            <View key={donation.id} style={styles.transactionItem}>
              <View style={[
                styles.transactionIcon,
                donation.type === 'recurring'
                  ? styles.recurringIcon
                  : styles.oneTimeIcon,
              ]}>
                <Ionicons
                  name={donation.type === 'recurring' ? 'refresh' : 'cash'}
                  size={18}
                  color={donation.type === 'recurring' ? '#8B5CF6' : '#10B981'}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>
                  {donation.campaign_name || 'General Fund'}
                </Text>
                <View style={styles.transactionMeta}>
                  <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
                  <Text style={styles.metaText}>
                    {formatDate(donation.created_at)}
                  </Text>
                  <Ionicons name="card-outline" size={12} color="#9CA3AF" />
                  <Text style={styles.metaText}>
                    {donation.payment_method}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={styles.amountText}>
                  \${donation.amount?.toLocaleString()}
                </Text>
                <View style={[
                  styles.statusBadge,
                  donation.status === 'completed'
                    ? styles.completedBadge
                    : styles.pendingBadge,
                ]}>
                  <Text style={[
                    styles.statusText,
                    donation.status === 'completed'
                      ? styles.completedText
                      : styles.pendingText,
                  ]}>
                    {donation.status}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No donations found for {year}</Text>
          </View>
        )}
      </View>

      {/* Giving by Fund */}
      {summary?.by_fund && summary.by_fund.length > 0 && (
        <View style={styles.fundSection}>
          <Text style={styles.sectionTitle}>Giving by Fund</Text>
          {summary.by_fund.map((fund: any, i: number) => (
            <View key={i} style={styles.fundItem}>
              <View style={styles.fundInfo}>
                <Text style={styles.fundName}>{fund.name}</Text>
                <Text style={styles.fundAmount}>
                  \${fund.total.toLocaleString()}
                </Text>
              </View>
              <View style={styles.fundProgress}>
                <View
                  style={[
                    styles.fundProgressFill,
                    { width: \`\${(fund.total / (summary?.total || 1)) * 100}%\` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}
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
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yearSelector: {
    gap: 8,
    flex: 1,
  },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  activeYearChip: {
    backgroundColor: '#10B981',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeYearText: {
    color: '#FFFFFF',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    padding: 16,
  },
  mainStatCard: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 20,
  },
  mainStatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainStatYear: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  mainStatValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mainStatLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  secondaryStats: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 16,
  },
  secondaryStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  secondaryStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  positive: {
    color: '#10B981',
  },
  negative: {
    color: '#EF4444',
  },
  historySection: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oneTimeIcon: {
    backgroundColor: '#D1FAE5',
  },
  recurringIcon: {
    backgroundColor: '#EDE9FE',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  completedText: {
    color: '#059669',
  },
  pendingText: {
    color: '#D97706',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
  },
  fundSection: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 32,
  },
  fundItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fundInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fundName: {
    fontSize: 14,
    color: '#4B5563',
  },
  fundAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  fundProgress: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fundProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
});

export default ${componentName};
`;
}
