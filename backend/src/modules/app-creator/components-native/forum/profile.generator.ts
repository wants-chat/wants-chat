/**
 * Forum Profile Component Generators (React Native)
 *
 * Generates profile stats, badge list, and member profile card components for React Native.
 */

export interface ProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateProfileStats(options: ProfileOptions = {}): string {
  const { componentName = 'ProfileStats', endpoint = '/forum/members' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface MemberStats {
  post_count: number;
  thread_count: number;
  reply_count: number;
  like_count: number;
  likes_received: number;
  reputation: number;
  rank: number;
  total_members: number;
  joined_at: string;
  last_active: string;
  streak_days: number;
  best_answer_count: number;
  badges_count: number;
}

interface ${componentName}Props {
  memberId: string;
  layout?: 'grid' | 'list' | 'compact';
}

const ${componentName}: React.FC<${componentName}Props> = ({ memberId, layout = 'grid' }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['member-stats', memberId],
    queryFn: async () => {
      const response = await api.get<MemberStats>('${endpoint}/' + memberId + '/stats');
      return response?.data || response;
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    { label: 'Posts', value: stats.post_count, icon: 'chatbubbles-outline', color: '#8B5CF6' },
    { label: 'Threads', value: stats.thread_count, icon: 'document-text-outline', color: '#3B82F6' },
    { label: 'Likes Given', value: stats.like_count, icon: 'heart-outline', color: '#EC4899' },
    { label: 'Likes Received', value: stats.likes_received, icon: 'heart', color: '#EF4444' },
    { label: 'Best Answers', value: stats.best_answer_count, icon: 'checkmark-circle-outline', color: '#10B981' },
    { label: 'Reputation', value: stats.reputation, icon: 'trending-up-outline', color: '#F59E0B' },
    { label: 'Badges', value: stats.badges_count, icon: 'ribbon-outline', color: '#F97316' },
    { label: 'Day Streak', value: stats.streak_days, icon: 'flash-outline', color: '#6366F1' },
  ];

  if (layout === 'compact') {
    return (
      <View style={styles.compactContainer}>
        {statItems.slice(0, 4).map(({ label, value, icon, color }) => (
          <View key={label} style={styles.compactItem}>
            <Ionicons name={icon as any} size={16} color={color} />
            <Text style={styles.compactValue}>{value.toLocaleString()}</Text>
            <Text style={styles.compactLabel}>{label}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (layout === 'list') {
    return (
      <View style={styles.listContainer}>
        {statItems.map(({ label, value, icon, color }) => (
          <View key={label} style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <Ionicons name={icon as any} size={20} color={color} />
              <Text style={styles.listLabel}>{label}</Text>
            </View>
            <Text style={styles.listValue}>{value.toLocaleString()}</Text>
          </View>
        ))}

        {/* Rank */}
        <View style={[styles.listItem, styles.rankItem]}>
          <View style={styles.listItemLeft}>
            <Ionicons name="trophy-outline" size={20} color="#8B5CF6" />
            <Text style={styles.listLabel}>Community Rank</Text>
          </View>
          <Text style={styles.rankValue}>
            #{stats.rank} of {stats.total_members.toLocaleString()}
          </Text>
        </View>

        {/* Dates */}
        <View style={styles.datesContainer}>
          <View style={styles.dateItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>Joined {formatDate(stats.joined_at)}</Text>
          </View>
          <View style={styles.dateItem}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.dateText}>Last active {formatDate(stats.last_active)}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Grid layout (default)
  return (
    <View style={styles.gridContainer}>
      <View style={styles.gridHeader}>
        <Ionicons name="trending-up-outline" size={20} color="#8B5CF6" />
        <Text style={styles.gridTitle}>Statistics</Text>
      </View>

      <View style={styles.gridContent}>
        {statItems.map(({ label, value, icon, color }) => (
          <View key={label} style={styles.gridItem}>
            <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon as any} size={20} color={color} />
            </View>
            <Text style={styles.gridValue}>{value.toLocaleString()}</Text>
            <Text style={styles.gridLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Rank Progress */}
      <View style={styles.rankProgress}>
        <View style={styles.rankHeader}>
          <Text style={styles.rankLabel}>Community Rank</Text>
          <Text style={styles.rankPositionText}>
            #{stats.rank} of {stats.total_members.toLocaleString()}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: \`\${Math.max(5, 100 - (stats.rank / stats.total_members) * 100)}%\` },
            ]}
          />
        </View>
        <Text style={styles.percentileText}>
          Top {((stats.rank / stats.total_members) * 100).toFixed(1)}% of members
        </Text>
      </View>

      {/* Activity Info */}
      <View style={styles.activityInfo}>
        <View style={styles.activityItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.activityText}>Joined {formatDate(stats.joined_at)}</Text>
        </View>
        <View style={styles.activityItem}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.activityText}>Last seen {formatDate(stats.last_active)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  // Compact layout
  compactContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  compactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  compactLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  // List layout
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  listValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rankItem: {
    backgroundColor: '#EDE9FE',
  },
  rankValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  datesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Grid layout
  gridContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  gridLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  rankProgress: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#EDE9FE',
    borderRadius: 12,
  },
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rankLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  rankPositionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#D1D5DB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  percentileText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  activityInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activityText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateBadgeList(options: ProfileOptions = {}): string {
  const { componentName = 'BadgeList', endpoint = '/forum/badges' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'special';
  category: string;
  earned_at?: string;
  progress?: number;
  requirement?: number;
  is_locked?: boolean;
}

interface ${componentName}Props {
  memberId?: string;
  showLocked?: boolean;
  layout?: 'grid' | 'list';
  maxItems?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  memberId,
  showLocked = false,
  layout = 'grid',
  maxItems,
}) => {
  const { data: badges, isLoading } = useQuery({
    queryKey: ['badges', memberId, showLocked],
    queryFn: async () => {
      const url = memberId
        ? '${endpoint}?member_id=' + memberId + '&show_locked=' + showLocked
        : '${endpoint}?show_locked=' + showLocked;
      const response = await api.get<Badge[]>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getTierColors = (tier: Badge['tier']) => {
    switch (tier) {
      case 'bronze':
        return ['#D97706', '#B45309'];
      case 'silver':
        return ['#9CA3AF', '#6B7280'];
      case 'gold':
        return ['#EAB308', '#CA8A04'];
      case 'platinum':
        return ['#A855F7', '#9333EA'];
      case 'special':
        return ['#EC4899', '#DB2777'];
      default:
        return ['#9CA3AF', '#6B7280'];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  }

  const displayBadges = maxItems ? badges?.slice(0, maxItems) : badges;

  if (!displayBadges?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="ribbon-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No badges earned yet</Text>
      </View>
    );
  }

  // Group badges by category
  const groupedBadges = displayBadges.reduce((acc, badge) => {
    const category = badge.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const renderBadge = ({ item: badge }: { item: Badge }) => {
    const [primaryColor, secondaryColor] = getTierColors(badge.tier);
    const isLocked = badge.is_locked;

    if (layout === 'list') {
      return (
        <View style={[styles.listBadge, isLocked && styles.lockedBadge]}>
          <View style={[styles.listBadgeIcon, { backgroundColor: primaryColor }]}>
            <Ionicons
              name={isLocked ? 'lock-closed' : 'ribbon'}
              size={24}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.listBadgeContent}>
            <Text style={styles.listBadgeName}>{badge.name}</Text>
            <Text style={styles.listBadgeDescription} numberOfLines={1}>
              {badge.description}
            </Text>
            {badge.progress !== undefined && badge.requirement && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarSmall}>
                  <View
                    style={[
                      styles.progressFillSmall,
                      { width: \`\${Math.min(100, (badge.progress / badge.requirement) * 100)}%\` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {badge.progress} / {badge.requirement}
                </Text>
              </View>
            )}
          </View>
          {badge.earned_at && (
            <Text style={styles.earnedDate}>{formatDate(badge.earned_at)}</Text>
          )}
        </View>
      );
    }

    // Grid layout
    return (
      <View style={[styles.gridBadge, isLocked && styles.lockedBadge]}>
        <View style={[styles.gridBadgeIcon, { backgroundColor: primaryColor }]}>
          <Ionicons
            name={isLocked ? 'lock-closed' : 'ribbon'}
            size={28}
            color="#FFFFFF"
          />
        </View>
        <Text style={styles.gridBadgeName} numberOfLines={1}>{badge.name}</Text>
        <Text style={styles.gridBadgeTier}>{badge.tier}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {layout === 'grid' ? (
            <View style={styles.gridContainer}>
              {categoryBadges.map((badge) => (
                <View key={badge.id} style={styles.gridItemWrapper}>
                  {renderBadge({ item: badge })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.listContainer}>
              {categoryBadges.map((badge) => (
                <View key={badge.id}>{renderBadge({ item: badge })}</View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 16,
  },
  categorySection: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  // Grid layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItemWrapper: {
    width: '25%',
    padding: 6,
  },
  gridBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridBadgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridBadgeName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },
  gridBadgeTier: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  // List layout
  listContainer: {
    gap: 8,
  },
  listBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listBadgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listBadgeContent: {
    flex: 1,
  },
  listBadgeName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  listBadgeDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarSmall: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  earnedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  lockedBadge: {
    opacity: 0.6,
  },
});

export default ${componentName};
`;
}

export function generateMemberProfileCard(options: ProfileOptions = {}): string {
  const { componentName = 'MemberProfileCard', endpoint = '/forum/members' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Member {
  id: string;
  name?: string;
  username: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  role?: string;
  post_count: number;
  thread_count: number;
  reputation: number;
  joined_at: string;
  is_online?: boolean;
  is_following?: boolean;
  followers_count: number;
  following_count: number;
  badges?: { id: string; name: string; color?: string }[];
}

interface ${componentName}Props {
  memberId: string;
  variant?: 'full' | 'compact' | 'mini';
  showActions?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  memberId,
  variant = 'full',
  showActions = true,
}) => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', memberId],
    queryFn: async () => {
      const response = await api.get<Member>('${endpoint}/' + memberId);
      return response?.data || response;
    },
  });

  const followMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + memberId + '/follow', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', memberId] });
      Alert.alert('Success', member?.is_following ? 'Unfollowed' : 'Following');
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={40} color="#D1D5DB" />
        <Text style={styles.emptyText}>Member not found</Text>
      </View>
    );
  }

  // Mini variant
  if (variant === 'mini') {
    return (
      <TouchableOpacity
        style={styles.miniCard}
        onPress={() =>
          navigation.navigate('MemberProfile', { memberId: member.username || member.id })
        }
      >
        <View style={styles.miniAvatarContainer}>
          {member.avatar_url ? (
            <Image source={{ uri: member.avatar_url }} style={styles.miniAvatar} />
          ) : (
            <View style={styles.miniAvatarPlaceholder}>
              <Ionicons name="person" size={16} color="#8B5CF6" />
            </View>
          )}
          {member.is_online && <View style={styles.miniOnline} />}
        </View>
        <View style={styles.miniInfo}>
          <Text style={styles.miniName}>{member.name || member.username}</Text>
          <Text style={styles.miniUsername}>@{member.username}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <View style={styles.compactCard}>
        <TouchableOpacity
          style={styles.compactHeader}
          onPress={() =>
            navigation.navigate('MemberProfile', { memberId: member.username || member.id })
          }
        >
          <View style={styles.compactAvatarContainer}>
            {member.avatar_url ? (
              <Image source={{ uri: member.avatar_url }} style={styles.compactAvatar} />
            ) : (
              <View style={styles.compactAvatarPlaceholder}>
                <Ionicons name="person" size={28} color="#8B5CF6" />
              </View>
            )}
            {member.is_online && <View style={styles.compactOnline} />}
          </View>

          <View style={styles.compactInfo}>
            <View style={styles.compactNameRow}>
              <Text style={styles.compactName}>{member.name || member.username}</Text>
              {member.role && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{member.role}</Text>
                </View>
              )}
            </View>
            <Text style={styles.compactUsername}>@{member.username}</Text>
            <Text style={styles.compactStats}>
              {member.post_count} posts - {member.reputation} rep
            </Text>
          </View>

          {showActions && (
            <TouchableOpacity
              style={[
                styles.followButton,
                member.is_following && styles.followingButton,
              ]}
              onPress={() => followMutation.mutate()}
            >
              <Ionicons
                name={member.is_following ? 'person-remove' : 'person-add'}
                size={16}
                color={member.is_following ? '#6B7280' : '#FFFFFF'}
              />
              <Text
                style={[
                  styles.followButtonText,
                  member.is_following && styles.followingButtonText,
                ]}
              >
                {member.is_following ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // Full variant
  return (
    <View style={styles.fullCard}>
      {/* Cover */}
      <View style={styles.cover} />

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrapper}>
          {member.avatar_url ? (
            <Image source={{ uri: member.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#8B5CF6" />
            </View>
          )}
          {member.is_online && <View style={styles.onlineIndicator} />}
        </View>

        {showActions && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.followButton,
                member.is_following && styles.followingButton,
              ]}
              onPress={() => followMutation.mutate()}
            >
              <Ionicons
                name={member.is_following ? 'person-remove' : 'person-add'}
                size={18}
                color={member.is_following ? '#6B7280' : '#FFFFFF'}
              />
              <Text
                style={[
                  styles.followButtonText,
                  member.is_following && styles.followingButtonText,
                ]}
              >
                {member.is_following ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="flag-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.nameSection}>
          <Text style={styles.name}>{member.name || member.username}</Text>
          {member.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{member.role}</Text>
            </View>
          )}
        </View>
        <Text style={styles.username}>@{member.username}</Text>

        {member.bio && <Text style={styles.bio}>{member.bio}</Text>}

        <View style={styles.metaInfo}>
          {member.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{member.location}</Text>
            </View>
          )}
          {member.website && (
            <TouchableOpacity
              style={styles.metaItem}
              onPress={() => Linking.openURL(member.website!)}
            >
              <Ionicons name="globe-outline" size={14} color="#8B5CF6" />
              <Text style={[styles.metaText, styles.linkText]}>Website</Text>
            </TouchableOpacity>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>Joined {formatDate(member.joined_at)}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{member.post_count}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{member.thread_count}</Text>
            <Text style={styles.statLabel}>Threads</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{member.reputation}</Text>
            <Text style={styles.statLabel}>Rep</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{member.followers_count}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{member.following_count}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Badges */}
        {member.badges && member.badges.length > 0 && (
          <View style={styles.badgesSection}>
            {member.badges.slice(0, 5).map((badge) => (
              <View
                key={badge.id}
                style={[
                  styles.badge,
                  { backgroundColor: (badge.color || '#8B5CF6') + '20' },
                ]}
              >
                <Ionicons name="ribbon" size={12} color={badge.color || '#8B5CF6'} />
                <Text style={[styles.badgeText, { color: badge.color || '#8B5CF6' }]}>
                  {badge.name}
                </Text>
              </View>
            ))}
            {member.badges.length > 5 && (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('MemberProfile', {
                    memberId: member.username || member.id,
                  })
                }
              >
                <Text style={styles.moreBadges}>+{member.badges.length - 5} more</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  // Mini styles
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 10,
  },
  miniAvatarContainer: {
    position: 'relative',
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  miniAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniOnline: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  miniInfo: {
    flex: 1,
  },
  miniName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  miniUsername: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Compact styles
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactAvatarContainer: {
    position: 'relative',
  },
  compactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  compactAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactOnline: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  compactInfo: {
    flex: 1,
  },
  compactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  compactUsername: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  compactStats: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  // Full styles
  fullCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  cover: {
    height: 100,
    backgroundColor: '#8B5CF6',
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: -40,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  followingButton: {
    backgroundColor: '#F3F4F6',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: '#6B7280',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 16,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  roleBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  username: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    color: '#4B5563',
    marginTop: 12,
    lineHeight: 22,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  linkText: {
    color: '#8B5CF6',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  badgesSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreBadges: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    paddingVertical: 4,
  },
});

export default ${componentName};
`;
}
