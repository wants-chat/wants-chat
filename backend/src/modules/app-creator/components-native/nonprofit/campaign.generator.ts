/**
 * Campaign Component Generators (React Native)
 *
 * Generates nonprofit campaign management and fundraising components for React Native.
 */

export interface CampaignOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCampaignListNonprofit(options: CampaignOptions = {}): string {
  const { componentName = 'CampaignListNonprofit', endpoint = '/campaigns' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  showFilters?: boolean;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ showFilters = true, limit }) => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns', status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      if (limit) params.append('limit', limit.toString());
      const url = '${endpoint}' + (params.toString() ? '?' + params.toString() : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredCampaigns = campaigns?.filter((campaign: any) =>
    campaign.name?.toLowerCase().includes(search.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCampaignPress = (campaignId: string) => {
    navigation.navigate('CampaignDetail' as never, { id: campaignId } as never);
  };

  const getStatusConfig = (campaignStatus: string) => {
    switch (campaignStatus) {
      case 'active':
        return { icon: 'checkmark-circle', color: '#10B981', bg: '#D1FAE5', label: 'Active' };
      case 'upcoming':
        return { icon: 'time', color: '#3B82F6', bg: '#DBEAFE', label: 'Upcoming' };
      case 'completed':
        return { icon: 'checkmark-circle', color: '#6B7280', bg: '#F3F4F6', label: 'Completed' };
      case 'urgent':
        return { icon: 'alert-circle', color: '#EF4444', bg: '#FEE2E2', label: 'Urgent' };
      default:
        return { icon: 'ellipse', color: '#6B7280', bg: '#F3F4F6', label: campaignStatus };
    }
  };

  const renderCampaign = ({ item: campaign }: { item: any }) => {
    const progress = campaign.goal ? (campaign.raised / campaign.goal) * 100 : 0;
    const daysLeft = campaign.end_date
      ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;
    const statusConfig = getStatusConfig(campaign.status);

    return (
      <TouchableOpacity
        style={styles.campaignCard}
        onPress={() => handleCampaignPress(campaign.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {campaign.image_url ? (
            <Image source={{ uri: campaign.image_url }} style={styles.campaignImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="flag" size={32} color="#10B981" />
            </View>
          )}

          <View style={styles.campaignInfo}>
            <View style={styles.headerRow}>
              <View style={styles.titleContainer}>
                <Text style={styles.campaignName} numberOfLines={1}>
                  {campaign.name}
                </Text>
                {campaign.category && (
                  <Text style={styles.category}>{campaign.category}</Text>
                )}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
                <Text style={[styles.statusText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
            </View>

            {campaign.description && (
              <Text style={styles.description} numberOfLines={2}>
                {campaign.description}
              </Text>
            )}

            <View style={styles.progressSection}>
              <View style={styles.amountRow}>
                <Text style={styles.raised}>
                  \${(campaign.raised || 0).toLocaleString()} raised
                </Text>
                {campaign.goal && (
                  <Text style={styles.goal}>
                    of \${campaign.goal.toLocaleString()}
                  </Text>
                )}
              </View>
              {campaign.goal && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: \`\${Math.min(progress, 100)}%\` },
                    ]}
                  />
                </View>
              )}
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="people" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{campaign.donor_count || 0} donors</Text>
              </View>
              {daysLeft !== null && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>
                    {daysLeft > 0 ? \`\${daysLeft} days left\` : 'Ended'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showFilters && (
        <View style={styles.filterSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search campaigns..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <View style={styles.statusFilters}>
            {['all', 'active', 'urgent', 'upcoming', 'completed'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusChip, status === s && styles.activeStatusChip]}
                onPress={() => setStatus(s)}
              >
                <Text style={[styles.chipText, status === s && styles.activeChipText]}>
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {filteredCampaigns && filteredCampaigns.length > 0 ? (
        <FlatList
          data={filteredCampaigns}
          renderItem={renderCampaign}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="flag-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No campaigns found</Text>
        </View>
      )}
    </View>
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
  filterSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  activeStatusChip: {
    backgroundColor: '#10B981',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  campaignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  campaignImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  category: {
    fontSize: 13,
    color: '#10B981',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressSection: {
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  raised: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  goal: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateCampaignProgressNonprofit(options: CampaignOptions = {}): string {
  const { componentName = 'CampaignProgressNonprofit', endpoint = '/campaigns' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const { data: recentDonations } = useQuery({
    queryKey: ['campaign-donations', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${id}/donations?limit=5\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
  });

  const { data: milestones } = useQuery({
    queryKey: ['campaign-milestones', id],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${id}/milestones\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!id,
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: \`Support this campaign: \${campaign?.name}\\n\\n\${campaign?.description || ''}\`,
        title: campaign?.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

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

  if (!campaign) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Campaign not found</Text>
      </View>
    );
  }

  const progress = campaign.goal ? (campaign.raised / campaign.goal) * 100 : 0;
  const daysLeft = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Campaign Header */}
      {campaign.image_url && (
        <Image source={{ uri: campaign.image_url }} style={styles.headerImage} />
      )}

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <View style={styles.titleInfo}>
              <Text style={styles.campaignName}>{campaign.name}</Text>
              {campaign.category && (
                <Text style={styles.category}>{campaign.category}</Text>
              )}
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="heart-outline" size={22} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.raisedAmount}>
                \${(campaign.raised || 0).toLocaleString()}
              </Text>
              {campaign.goal && (
                <Text style={styles.goalText}>
                  raised of \${campaign.goal.toLocaleString()} goal
                </Text>
              )}
            </View>
            <View style={styles.progressPercent}>
              <Text style={styles.percentValue}>{Math.round(progress)}%</Text>
              <Text style={styles.percentLabel}>funded</Text>
            </View>
          </View>

          <View style={styles.largeProgressBar}>
            <View
              style={[styles.largeProgressFill, { width: \`\${Math.min(progress, 100)}%\` }]}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{campaign.donor_count || 0}</Text>
              <Text style={styles.statLabel}>Donors</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                \${(campaign.average_donation || 0).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Avg. Gift</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {daysLeft !== null ? daysLeft : '--'}
              </Text>
              <Text style={styles.statLabel}>Days Left</Text>
            </View>
          </View>
        </View>

        {/* Donate Button */}
        <TouchableOpacity style={styles.donateButton}>
          <Ionicons name="gift" size={20} color="#FFFFFF" />
          <Text style={styles.donateText}>Donate to This Campaign</Text>
        </TouchableOpacity>

        {/* Description */}
        {campaign.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Campaign</Text>
            <Text style={styles.description}>{campaign.description}</Text>
          </View>
        )}

        {/* Milestones */}
        {milestones && milestones.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Campaign Milestones</Text>
            {milestones.map((milestone: any, index: number) => {
              const isReached = campaign.raised >= milestone.amount;
              return (
                <View key={index} style={styles.milestoneItem}>
                  <View style={[
                    styles.milestoneIcon,
                    isReached ? styles.reachedIcon : styles.pendingIcon,
                  ]}>
                    <Ionicons
                      name={isReached ? 'checkmark-circle' : 'flag'}
                      size={20}
                      color={isReached ? '#10B981' : '#9CA3AF'}
                    />
                  </View>
                  <View style={styles.milestoneInfo}>
                    <Text style={[
                      styles.milestoneTitle,
                      !isReached && styles.pendingText,
                    ]}>
                      {milestone.title}
                    </Text>
                    <Text style={styles.milestoneAmount}>
                      \${milestone.amount.toLocaleString()}
                    </Text>
                  </View>
                  {isReached && (
                    <Text style={styles.reachedBadge}>Reached!</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Donations */}
        <View style={styles.donationsSection}>
          <Text style={styles.sectionTitle}>Recent Donations</Text>
          {recentDonations && recentDonations.length > 0 ? (
            recentDonations.map((donation: any) => (
              <View key={donation.id} style={styles.donationItem}>
                {donation.anonymous ? (
                  <View style={styles.anonymousAvatar}>
                    <Ionicons name="heart" size={18} color="#9CA3AF" />
                  </View>
                ) : donation.donor_avatar ? (
                  <Image
                    source={{ uri: donation.donor_avatar }}
                    style={styles.donorAvatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitial}>
                      {donation.donor_name?.charAt(0) || 'A'}
                    </Text>
                  </View>
                )}
                <View style={styles.donationInfo}>
                  <Text style={styles.donorName}>
                    {donation.anonymous ? 'Anonymous' : donation.donor_name}
                  </Text>
                  <Text style={styles.donationDate}>
                    {formatDate(donation.created_at)}
                  </Text>
                </View>
                <Text style={styles.donationAmount}>
                  \${donation.amount?.toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyDonations}>
              <Text style={styles.emptyDonationsText}>Be the first to donate!</Text>
            </View>
          )}
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
  headerImage: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  category: {
    fontSize: 15,
    color: '#10B981',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCard: {
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  raisedAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#047857',
  },
  goalText: {
    fontSize: 14,
    color: '#059669',
    marginTop: 4,
  },
  progressPercent: {
    alignItems: 'flex-end',
  },
  percentValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  percentLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  largeProgressBar: {
    height: 12,
    backgroundColor: 'rgba(4, 120, 87, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  largeProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(4, 120, 87, 0.2)',
  },
  donateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  donateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reachedIcon: {
    backgroundColor: '#D1FAE5',
  },
  pendingIcon: {
    backgroundColor: '#F3F4F6',
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  pendingText: {
    color: '#6B7280',
  },
  milestoneAmount: {
    fontSize: 13,
    color: '#6B7280',
  },
  reachedBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  donationsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 32,
  },
  donationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  anonymousAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  donationInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  donationDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  donationAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyDonations: {
    padding: 32,
    alignItems: 'center',
  },
  emptyDonationsText: {
    fontSize: 15,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateFundingProgress(options: CampaignOptions = {}): string {
  const { componentName = 'FundingProgress', endpoint = '/campaigns' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  campaignId?: string;
  showDetails?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  campaignId,
  showDetails = true,
}) => {
  const navigation = useNavigation();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['active-campaigns', campaignId],
    queryFn: async () => {
      if (campaignId) {
        const response = await api.get<any>(\`${endpoint}/\${campaignId}\`);
        return [response?.data || response];
      }
      const response = await api.get<any>('${endpoint}?status=active&limit=3');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleCampaignPress = (id: string) => {
    navigation.navigate('CampaignDetail' as never, { id } as never);
  };

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
        <View style={styles.titleRow}>
          <Ionicons name="flag" size={20} color="#10B981" />
          <Text style={styles.title}>Active Campaigns</Text>
        </View>
        {!campaignId && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Campaigns' as never)}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="arrow-forward" size={16} color="#10B981" />
          </TouchableOpacity>
        )}
      </View>

      {campaigns && campaigns.length > 0 ? (
        <View style={styles.campaignsList}>
          {campaigns.map((campaign: any) => {
            const progress = campaign.goal
              ? (campaign.raised / campaign.goal) * 100
              : 0;
            const daysLeft = campaign.end_date
              ? Math.max(
                  0,
                  Math.ceil(
                    (new Date(campaign.end_date).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                )
              : null;

            return (
              <View key={campaign.id} style={styles.campaignItem}>
                <View style={styles.campaignHeader}>
                  <TouchableOpacity
                    style={styles.campaignNameContainer}
                    onPress={() => handleCampaignPress(campaign.id)}
                  >
                    <Text style={styles.campaignName}>{campaign.name}</Text>
                    {campaign.category && (
                      <Text style={styles.campaignCategory}>
                        {campaign.category}
                      </Text>
                    )}
                  </TouchableOpacity>
                  {daysLeft !== null && (
                    <View style={styles.daysLeft}>
                      <Ionicons name="calendar" size={14} color="#6B7280" />
                      <Text style={styles.daysText}>
                        {daysLeft > 0 ? \`\${daysLeft} days\` : 'Ended'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressNumbers}>
                    <Text style={styles.raised}>
                      \${(campaign.raised || 0).toLocaleString()}
                    </Text>
                    {campaign.goal && (
                      <Text style={styles.goal}>
                        \${campaign.goal.toLocaleString()} goal
                      </Text>
                    )}
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: \`\${Math.min(progress, 100)}%\`,
                          backgroundColor:
                            progress >= 100 ? '#10B981' : '#34D399',
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.progressMeta}>
                    <Text style={styles.progressPercent}>
                      {Math.round(progress)}% funded
                    </Text>
                    <Text style={styles.donorCount}>
                      {campaign.donor_count || 0} donors
                    </Text>
                  </View>
                </View>

                {showDetails && campaign.recent_trend !== undefined && (
                  <View style={styles.trendRow}>
                    <Ionicons
                      name={
                        campaign.recent_trend >= 0
                          ? 'trending-up'
                          : 'trending-down'
                      }
                      size={16}
                      color={campaign.recent_trend >= 0 ? '#10B981' : '#EF4444'}
                    />
                    <Text
                      style={[
                        styles.trendText,
                        {
                          color:
                            campaign.recent_trend >= 0 ? '#10B981' : '#EF4444',
                        },
                      ]}
                    >
                      {campaign.recent_trend >= 0 ? '+' : ''}
                      {campaign.recent_trend}% this week
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="flag-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No active campaigns</Text>
        </View>
      )}

      {!campaignId && campaigns && campaigns.length > 0 && (
        <TouchableOpacity
          style={styles.donateButton}
          onPress={() => navigation.navigate('Donate' as never)}
        >
          <Ionicons name="cash" size={20} color="#FFFFFF" />
          <Text style={styles.donateText}>Give Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  campaignsList: {
    gap: 20,
  },
  campaignItem: {
    gap: 12,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  campaignNameContainer: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  campaignCategory: {
    fontSize: 13,
    color: '#6B7280',
  },
  daysLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  daysText: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressSection: {
    gap: 4,
  },
  progressNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  raised: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },
  goal: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPercent: {
    fontSize: 12,
    color: '#6B7280',
  },
  donorCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },
  donateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  donateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
