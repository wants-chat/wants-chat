/**
 * Forum Member Component Generators (React Native)
 *
 * Generates member list, member profile, and leaderboard components for React Native.
 */

export interface MemberOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateMemberList(options: MemberOptions = {}): string {
  const { componentName = 'MemberList', endpoint = '/forum/members' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Member {
  id: string;
  name?: string;
  username: string;
  avatar_url?: string;
  role?: string;
  post_count?: number;
  like_count?: number;
  reputation?: number;
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('active');

  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['members', sort],
    queryFn: async () => {
      const response = await api.get<Member[]>('${endpoint}?sort=' + sort);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredMembers = members?.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.username?.toLowerCase().includes(search.toLowerCase())
  );

  const sortOptions = ['active', 'posts', 'joined'];

  const renderMember = ({ item: member }: { item: Member }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() =>
        navigation.navigate('MemberProfile', { memberId: member.username || member.id })
      }
      activeOpacity={0.7}
    >
      <View style={styles.memberHeader}>
        {member.avatar_url ? (
          <Image source={{ uri: member.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={28} color="#8B5CF6" />
          </View>
        )}
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name || member.username}</Text>
          <Text style={styles.memberUsername}>@{member.username}</Text>
          {member.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{member.role}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.memberStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{member.post_count || 0}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{member.like_count || 0}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{member.reputation || 0}</Text>
          <Text style={styles.statLabel}>Rep</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search members..."
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {sortOptions.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.sortButton, sort === s && styles.sortButtonActive]}
            onPress={() => setSort(s)}
          >
            <Text style={[styles.sortButtonText, sort === s && styles.sortButtonTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Member Grid */}
      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No members found</Text>
          </View>
        }
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  sortContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  sortButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  sortButtonTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  memberCard: {
    flex: 0.48,
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
  memberHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  memberUsername: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 16,
  },
});

export default ${componentName};
`;
}

export function generateMemberProfile(options: MemberOptions = {}): string {
  const { componentName = 'MemberProfile', endpoint = '/forum/members' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Member {
  id: string;
  name?: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  role?: string;
  post_count?: number;
  thread_count?: number;
  like_count?: number;
  reputation?: number;
  created_at: string;
  badges?: { id: string; name: string }[];
}

interface RecentPost {
  id: string;
  thread_id: string;
  thread_title: string;
  content: string;
  created_at: string;
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const memberId = route.params?.memberId;

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', memberId],
    queryFn: async () => {
      const response = await api.get<Member>('${endpoint}/' + memberId);
      return response?.data || response;
    },
    enabled: !!memberId,
  });

  const { data: recentPosts } = useQuery({
    queryKey: ['member-posts', memberId],
    queryFn: async () => {
      const response = await api.get<RecentPost[]>('${endpoint}/' + memberId + '/posts?limit=5');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!member,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={48} color="#D1D5DB" />
        <Text style={styles.errorText}>Member not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.coverBackground} />
        <View style={styles.profileSection}>
          {member.avatar_url ? (
            <Image source={{ uri: member.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#8B5CF6" />
            </View>
          )}
          <Text style={styles.memberName}>{member.name || member.username}</Text>
          <Text style={styles.memberUsername}>@{member.username}</Text>
          {member.role && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{member.role}</Text>
            </View>
          )}
        </View>

        {member.bio && <Text style={styles.bio}>{member.bio}</Text>}

        <View style={styles.metaInfo}>
          {member.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{member.location}</Text>
            </View>
          )}
          {member.website && (
            <TouchableOpacity
              style={styles.metaItem}
              onPress={() => Linking.openURL(member.website!)}
            >
              <Ionicons name="globe-outline" size={16} color="#8B5CF6" />
              <Text style={[styles.metaText, styles.linkText]}>Website</Text>
            </TouchableOpacity>
          )}
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>Joined {formatDate(member.created_at)}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{member.post_count || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{member.thread_count || 0}</Text>
            <Text style={styles.statLabel}>Threads</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{member.like_count || 0}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{member.reputation || 0}</Text>
            <Text style={styles.statLabel}>Reputation</Text>
          </View>
        </View>
      </View>

      {/* Badges */}
      {member.badges && member.badges.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="ribbon-outline" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Badges</Text>
          </View>
          <View style={styles.badgesContainer}>
            {member.badges.map((badge) => (
              <View key={badge.id} style={styles.badge}>
                <Text style={styles.badgeText}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Activity */}
      {recentPosts && recentPosts.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles-outline" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          {recentPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.activityItem}
              onPress={() => navigation.navigate('ThreadDetail', { threadId: post.thread_id })}
            >
              <Text style={styles.activityTitle} numberOfLines={1}>
                {post.thread_title}
              </Text>
              <Text style={styles.activityContent} numberOfLines={1}>
                {post.content}
              </Text>
              <Text style={styles.activityDate}>{formatDate(post.created_at)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.bottomSpacer} />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
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
  coverBackground: {
    height: 100,
    backgroundColor: '#8B5CF6',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: -50,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  memberName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  memberUsername: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  roleBadgeText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  bio: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    lineHeight: 22,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  statBox: {
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
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 13,
    color: '#B45309',
    fontWeight: '500',
  },
  activityItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  activityContent: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ${componentName};
`;
}

export function generateLeaderboard(options: MemberOptions = {}): string {
  const { componentName = 'Leaderboard', endpoint = '/forum/leaderboard' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface LeaderboardMember {
  id: string;
  name?: string;
  username: string;
  avatar_url?: string;
  points?: number;
  reputation?: number;
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation<any>();
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: async () => {
      const response = await api.get<LeaderboardMember[]>('${endpoint}?period=' + period);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Ionicons name="trophy" size={24} color="#EAB308" />;
      case 2:
        return <Ionicons name="medal" size={24} color="#9CA3AF" />;
      case 3:
        return <Ionicons name="medal" size={24} color="#D97706" />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const periodOptions = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'all', label: 'All Time' },
  ] as const;

  const renderMember = ({ item: member, index }: { item: LeaderboardMember; index: number }) => {
    const rank = index + 1;
    const isTopThree = rank <= 3;

    return (
      <TouchableOpacity
        style={[styles.memberItem, isTopThree && styles.topThreeItem]}
        onPress={() =>
          navigation.navigate('MemberProfile', { memberId: member.username || member.id })
        }
        activeOpacity={0.7}
      >
        <View style={styles.rankContainer}>{getRankIcon(rank)}</View>

        {member.avatar_url ? (
          <Image source={{ uri: member.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color="#8B5CF6" />
          </View>
        )}

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.name || member.username}</Text>
          <Text style={styles.memberUsername}>@{member.username}</Text>
        </View>

        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>{member.points || member.reputation || 0}</Text>
          <Text style={styles.pointsLabel}>points</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Period Selector */}
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Ionicons name="trending-up" size={24} color="#8B5CF6" />
          <Text style={styles.title}>Leaderboard</Text>
        </View>
        <View style={styles.periodSelector}>
          {periodOptions.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.periodButton, period === key && styles.periodButtonActive]}
              onPress={() => setPeriod(key)}
            >
              <Text
                style={[styles.periodButtonText, period === key && styles.periodButtonTextActive]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Leaderboard List */}
      <FlatList
        data={leaderboard}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        }
      />
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
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  topThreeItem: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  memberUsername: {
    fontSize: 13,
    color: '#6B7280',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  pointsLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 16,
  },
});

export default ${componentName};
`;
}
