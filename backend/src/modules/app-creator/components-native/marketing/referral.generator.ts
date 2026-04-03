/**
 * Referral Component Generators (React Native)
 *
 * Generates referral program components:
 * - CampaignStatsReferral: Referral campaign statistics
 * - RewardTiers: Tiered reward system display
 * - ReferralFilters: Filter referrals by status, date, etc.
 */

export interface CampaignStatsReferralOptions {
  componentName?: string;
  endpoint?: string;
  showChart?: boolean;
}

export function generateCampaignStatsReferral(options: CampaignStatsReferralOptions = {}): string {
  const {
    componentName = 'CampaignStatsReferral',
    endpoint = '/referrals/stats',
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

interface ${componentName}Props {
  campaignId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ campaignId }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['referral-campaign-stats', campaignId],
    queryFn: async () => {
      const url = campaignId
        ? \`${endpoint}?campaign_id=\${campaignId}\`
        : '${endpoint}';
      const response = await api.get<any>(url);
      return response?.data || response || {
        totalReferrals: 1248,
        successfulReferrals: 892,
        pendingReferrals: 156,
        conversionRate: 71.5,
        totalRewardsEarned: 8920,
        totalRewardsPaid: 7450,
        avgRewardValue: 10,
        activeReferrers: 234,
        topReferrerCount: 45,
        thisMonthReferrals: 128,
        thisMonthGrowth: 18.5,
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
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const statCards = [
    {
      label: 'Total Referrals',
      value: (stats?.totalReferrals || 0).toLocaleString(),
      subtext: \`\${stats?.successfulReferrals || 0} successful\`,
      icon: 'people' as const,
      color: '#3B82F6',
    },
    {
      label: 'Conversion Rate',
      value: \`\${stats?.conversionRate || 0}%\`,
      subtext: 'Referral to signup',
      icon: 'analytics' as const,
      color: '#10B981',
    },
    {
      label: 'Rewards Earned',
      value: \`\$\${(stats?.totalRewardsEarned || 0).toLocaleString()}\`,
      subtext: \`\$\${(stats?.totalRewardsPaid || 0).toLocaleString()} paid\`,
      icon: 'gift' as const,
      color: '#8B5CF6',
    },
    {
      label: 'Active Referrers',
      value: (stats?.activeReferrers || 0).toLocaleString(),
      subtext: \`\${stats?.topReferrerCount || 0} top performers\`,
      icon: 'person-add' as const,
      color: '#F59E0B',
    },
  ];

  const isPositiveGrowth = (stats?.thisMonthGrowth || 0) >= 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
    >
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon} size={16} color={stat.color} />
              </View>
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            {stat.subtext && (
              <Text style={styles.statSubtext}>{stat.subtext}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Growth Card */}
      <View style={styles.growthCard}>
        <View style={styles.growthContent}>
          <Text style={styles.growthLabel}>This Month's Referrals</Text>
          <Text style={styles.growthValue}>{stats?.thisMonthReferrals || 0}</Text>
          <View style={styles.growthChange}>
            <Ionicons
              name={isPositiveGrowth ? 'trending-up' : 'trending-down'}
              size={16}
              color={isPositiveGrowth ? '#A7F3D0' : '#FCA5A5'}
            />
            <Text style={[
              styles.growthChangeText,
              isPositiveGrowth ? styles.growthPositive : styles.growthNegative
            ]}>
              {isPositiveGrowth ? '+' : ''}{stats?.thisMonthGrowth || 0}% from last month
            </Text>
          </View>
        </View>
        <View style={styles.growthIconContainer}>
          <Ionicons name="share-social" size={48} color="rgba(255, 255, 255, 0.2)" />
        </View>
      </View>

      ${showChart ? `{/* Chart Placeholder */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Ionicons name="trending-up" size={18} color="#111827" />
          <Text style={styles.chartTitle}>Referral Trend</Text>
        </View>
        <View style={styles.chartPlaceholder}>
          <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
          <Text style={styles.chartPlaceholderText}>Chart visualization</Text>
          <Text style={styles.chartPlaceholderSubtext}>Integrate with react-native-charts</Text>
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
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  statCard: {
    width: '50%',
    padding: 6,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  growthCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  growthContent: {
    flex: 1,
  },
  growthLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  growthValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  growthChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  growthChangeText: {
    fontSize: 14,
  },
  growthPositive: {
    color: '#A7F3D0',
  },
  growthNegative: {
    color: '#FCA5A5',
  },
  growthIconContainer: {
    marginLeft: 16,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export interface RewardTiersOptions {
  componentName?: string;
  endpoint?: string;
  showProgress?: boolean;
  showBenefits?: boolean;
}

export function generateRewardTiers(options: RewardTiersOptions = {}): string {
  const {
    componentName = 'RewardTiers',
    endpoint = '/referrals/tiers',
    showProgress = true,
    showBenefits = true,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  userId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userId }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reward-tiers', userId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}\${userId ? \`?user_id=\${userId}\` : ''}\`);
      return response?.data || response || {
        currentTier: 'silver',
        currentPoints: 2500,
        nextTierPoints: 5000,
        tiers: [
          {
            id: 'bronze',
            name: 'Bronze',
            icon: 'star',
            minPoints: 0,
            color: '#F97316',
            benefits: ['5% commission on referrals', 'Basic analytics', 'Email support'],
          },
          {
            id: 'silver',
            name: 'Silver',
            icon: 'medal',
            minPoints: 1000,
            color: '#9CA3AF',
            benefits: ['10% commission on referrals', 'Advanced analytics', 'Priority email support', 'Custom referral link'],
          },
          {
            id: 'gold',
            name: 'Gold',
            icon: 'trophy',
            minPoints: 5000,
            color: '#F59E0B',
            benefits: ['15% commission on referrals', 'Full analytics suite', 'Phone support', 'Custom landing pages'],
          },
          {
            id: 'platinum',
            name: 'Platinum',
            icon: 'diamond',
            minPoints: 10000,
            color: '#8B5CF6',
            benefits: ['20% commission on referrals', 'Dedicated account manager', '24/7 support', 'API access'],
          },
        ],
      };
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getIcon = (iconName: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      star: 'star',
      medal: 'medal',
      trophy: 'trophy',
      diamond: 'diamond',
      crown: 'ribbon',
      gift: 'gift',
    };
    return icons[iconName] || 'star';
  };

  const currentTierIndex = data?.tiers?.findIndex((t: any) => t.id === data?.currentTier) || 0;
  const progressPercent = data?.nextTierPoints
    ? Math.min((data.currentPoints / data.nextTierPoints) * 100, 100)
    : 0;

  const renderTier = useCallback(({ item, index }: { item: any; index: number }) => {
    const isActive = item.id === data?.currentTier;
    const isLocked = index > currentTierIndex;
    const iconName = getIcon(item.icon);

    return (
      <View style={[
        styles.tierCard,
        isActive && styles.tierCardActive,
        isLocked && styles.tierCardLocked,
      ]}>
        {isActive && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Current</Text>
          </View>
        )}

        {isLocked && (
          <View style={styles.lockedOverlay}>
            <Ionicons name="lock-closed" size={24} color="#9CA3AF" />
          </View>
        )}

        <View style={[styles.tierIcon, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={iconName} size={24} color={isLocked ? '#9CA3AF' : item.color} />
        </View>

        <Text style={[styles.tierName, isLocked && styles.tierNameLocked]}>
          {item.name}
        </Text>
        <Text style={styles.tierPoints}>
          {item.minPoints.toLocaleString()}+ points
        </Text>

        ${showBenefits ? `{item.benefits && (
          <View style={styles.benefitsList}>
            {item.benefits.slice(0, 3).map((benefit: string, i: number) => (
              <View key={i} style={styles.benefitItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={isLocked ? '#D1D5DB' : '#10B981'}
                />
                <Text style={[
                  styles.benefitText,
                  isLocked && styles.benefitTextLocked
                ]} numberOfLines={1}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        )}` : ''}
      </View>
    );
  }, [data, currentTierIndex]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="gift" size={20} color="#8B5CF6" />
        <Text style={styles.headerTitle}>Reward Tiers</Text>
      </View>

      ${showProgress ? `{data?.currentTier && data?.nextTierPoints && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress to Next Tier</Text>
            <Text style={styles.progressValue}>
              {data.currentPoints?.toLocaleString()} / {data.nextTierPoints?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: \`\${progressPercent}%\` }]} />
          </View>
          <Text style={styles.progressSubtext}>
            {(data.nextTierPoints - data.currentPoints).toLocaleString()} more points to unlock
          </Text>
        </View>
      )}` : ''}

      <FlatList
        data={data?.tiers || []}
        renderItem={renderTier}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tiersContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 48,
    justifyContent: 'center',
    alignItems: 'center',
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
  progressSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  progressValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#DDD6FE',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  tiersContainer: {
    padding: 16,
    gap: 12,
  },
  tierCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  tierCardActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#FAF5FF',
  },
  tierCardLocked: {
    opacity: 0.7,
    borderColor: '#E5E7EB',
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    right: 12,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  tierIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tierName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tierNameLocked: {
    color: '#9CA3AF',
  },
  tierPoints: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  benefitTextLocked: {
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}

export interface ReferralFiltersOptions {
  componentName?: string;
  showStatus?: boolean;
  showDateRange?: boolean;
  showSource?: boolean;
}

export function generateReferralFilters(options: ReferralFiltersOptions = {}): string {
  const {
    componentName = 'ReferralFilters',
    showStatus = true,
    showDateRange = true,
    showSource = true,
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  onFilterChange?: (filters: Record<string, any>) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    source: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'rewarded', label: 'Rewarded' },
    { value: 'expired', label: 'Expired' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const sourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'email', label: 'Email Invite' },
    { value: 'link', label: 'Referral Link' },
    { value: 'social', label: 'Social Share' },
    { value: 'qr', label: 'QR Code' },
    { value: 'direct', label: 'Direct' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const cleared = {
      search: '',
      status: '',
      source: '',
      startDate: '',
      endDate: '',
    };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor="#9CA3AF"
            value={filters.search}
            onChangeText={(text) => handleFilterChange('search', text)}
          />
          {filters.search !== '' && (
            <TouchableOpacity onPress={() => handleFilterChange('search', '')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons
            name="filter"
            size={20}
            color={activeFiltersCount > 0 ? '#3B82F6' : '#6B7280'}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Referrals</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              ${showStatus ? `<View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Ionicons name="people" size={16} color="#6B7280" />
                  <Text style={styles.filterLabel}>Status</Text>
                </View>
                <View style={styles.optionsRow}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        filters.status === option.value && styles.optionChipActive
                      ]}
                      onPress={() => handleFilterChange('status', option.value)}
                    >
                      <Text style={[
                        styles.optionChipText,
                        filters.status === option.value && styles.optionChipTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>` : ''}

              ${showSource ? `<View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Ionicons name="link" size={16} color="#6B7280" />
                  <Text style={styles.filterLabel}>Source</Text>
                </View>
                <View style={styles.optionsRow}>
                  {sourceOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        filters.source === option.value && styles.optionChipActive
                      ]}
                      onPress={() => handleFilterChange('source', option.value)}
                    >
                      <Text style={[
                        styles.optionChipText,
                        filters.source === option.value && styles.optionChipTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>` : ''}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Ionicons name="close" size={16} color="#6B7280" />
                <Text style={styles.clearButtonText}>Clear all</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalBody: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  optionChipActive: {
    backgroundColor: '#3B82F6',
  },
  optionChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
