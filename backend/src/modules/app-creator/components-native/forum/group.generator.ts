/**
 * Forum Group Component Generators (React Native)
 *
 * Generates group list, group card, and group detail components for React Native.
 */

export interface GroupOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateGroupList(options: GroupOptions = {}): string {
  const { componentName = 'GroupList', endpoint = '/forum/groups' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Group {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  cover_url?: string;
  icon_url?: string;
  color?: string;
  member_count: number;
  thread_count: number;
  is_private: boolean;
  is_member?: boolean;
  created_at: string;
}

interface ${componentName}Props {
  showSearch?: boolean;
  filter?: 'all' | 'joined' | 'discover';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  showSearch = true,
  filter: initialFilter = 'all',
}) => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter);

  const { data: groups, isLoading, refetch } = useQuery({
    queryKey: ['groups', filter],
    queryFn: async () => {
      const response = await api.get<Group[]>('${endpoint}?filter=' + filter);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredGroups = groups?.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase())
  );

  const filterOptions = [
    { value: 'all', label: 'All Groups' },
    { value: 'joined', label: 'Joined' },
    { value: 'discover', label: 'Discover' },
  ] as const;

  const renderGroup = ({ item: group }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigation.navigate('GroupDetail', { groupId: group.slug || group.id })}
      activeOpacity={0.7}
    >
      {/* Cover/Banner */}
      <View
        style={[
          styles.groupBanner,
          { backgroundColor: group.color || '#8B5CF6' },
        ]}
      >
        {group.cover_url && (
          <Image source={{ uri: group.cover_url }} style={styles.coverImage} />
        )}
        {group.is_private && (
          <View style={styles.privateBadge}>
            <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.groupContent}>
        <View style={styles.groupHeader}>
          {group.icon_url ? (
            <Image source={{ uri: group.icon_url }} style={styles.groupIcon} />
          ) : (
            <View
              style={[
                styles.groupIconPlaceholder,
                { backgroundColor: (group.color || '#8B5CF6') + '20' },
              ]}
            >
              <Ionicons name="people" size={20} color={group.color || '#8B5CF6'} />
            </View>
          )}
          <View style={styles.groupInfo}>
            <Text style={styles.groupName} numberOfLines={1}>
              {group.name}
            </Text>
            {group.description && (
              <Text style={styles.groupDescription} numberOfLines={2}>
                {group.description}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{group.member_count} members</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubbles-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{group.thread_count} threads</Text>
          </View>
        </View>

        {group.is_member !== undefined && (
          <TouchableOpacity
            style={[styles.joinButton, group.is_member && styles.joinedButton]}
          >
            <Text style={[styles.joinButtonText, group.is_member && styles.joinedButtonText]}>
              {group.is_member ? 'Joined' : 'Join Group'}
            </Text>
          </TouchableOpacity>
        )}
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
      {showSearch && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search groups..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterOptions.map(({ value, label }) => (
          <TouchableOpacity
            key={value}
            style={[styles.filterButton, filter === value && styles.filterButtonActive]}
            onPress={() => setFilter(value)}
          >
            <Text
              style={[styles.filterButtonText, filter === value && styles.filterButtonTextActive]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Groups List */}
      <FlatList
        data={filteredGroups}
        renderItem={renderGroup}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No groups found</Text>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
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
  groupCard: {
    flex: 0.48,
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
  groupBanner: {
    height: 60,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  privateBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  groupContent: {
    padding: 12,
  },
  groupHeader: {
    flexDirection: 'row',
    gap: 10,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  groupIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  groupDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  groupStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  joinButton: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  joinedButton: {
    backgroundColor: '#F3F4F6',
  },
  joinButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  joinedButtonText: {
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

export function generateGroupCard(options: GroupOptions = {}): string {
  const { componentName = 'GroupCard' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Group {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  cover_url?: string;
  icon_url?: string;
  color?: string;
  member_count: number;
  thread_count: number;
  is_private: boolean;
  is_member?: boolean;
}

interface ${componentName}Props {
  group: Group;
  variant?: 'default' | 'compact' | 'horizontal';
}

const ${componentName}: React.FC<${componentName}Props> = ({ group, variant = 'default' }) => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    navigation.navigate('GroupDetail', { groupId: group.slug || group.id });
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handlePress} activeOpacity={0.7}>
        {group.icon_url ? (
          <Image source={{ uri: group.icon_url }} style={styles.compactIcon} />
        ) : (
          <View
            style={[
              styles.compactIconPlaceholder,
              { backgroundColor: (group.color || '#8B5CF6') + '20' },
            ]}
          >
            <Ionicons name="people" size={16} color={group.color || '#8B5CF6'} />
          </View>
        )}
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={styles.compactMembers}>{group.member_count} members</Text>
        </View>
        {group.is_private && <Ionicons name="lock-closed" size={14} color="#6B7280" />}
      </TouchableOpacity>
    );
  }

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity style={styles.horizontalCard} onPress={handlePress} activeOpacity={0.7}>
        {group.icon_url ? (
          <Image source={{ uri: group.icon_url }} style={styles.horizontalIcon} />
        ) : (
          <View
            style={[
              styles.horizontalIconPlaceholder,
              { backgroundColor: (group.color || '#8B5CF6') + '20' },
            ]}
          >
            <Ionicons name="people" size={24} color={group.color || '#8B5CF6'} />
          </View>
        )}
        <View style={styles.horizontalInfo}>
          <View style={styles.horizontalHeader}>
            <Text style={styles.horizontalName} numberOfLines={1}>
              {group.name}
            </Text>
            {group.is_private && <Ionicons name="lock-closed" size={14} color="#6B7280" />}
          </View>
          {group.description && (
            <Text style={styles.horizontalDescription} numberOfLines={2}>
              {group.description}
            </Text>
          )}
          <View style={styles.horizontalStats}>
            <Text style={styles.statText}>{group.member_count} members</Text>
            <Text style={styles.statSeparator}>-</Text>
            <Text style={styles.statText}>{group.thread_count} threads</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity style={styles.defaultCard} onPress={handlePress} activeOpacity={0.7}>
      <View style={[styles.defaultBanner, { backgroundColor: group.color || '#8B5CF6' }]}>
        {group.cover_url && (
          <Image source={{ uri: group.cover_url }} style={styles.coverImage} />
        )}
      </View>
      <View style={styles.defaultContent}>
        {group.icon_url ? (
          <Image source={{ uri: group.icon_url }} style={styles.defaultIcon} />
        ) : (
          <View
            style={[
              styles.defaultIconPlaceholder,
              { backgroundColor: (group.color || '#8B5CF6') + '20' },
            ]}
          >
            <Ionicons name="people" size={24} color={group.color || '#8B5CF6'} />
          </View>
        )}
        <View style={styles.defaultNameRow}>
          <Text style={styles.defaultName} numberOfLines={1}>
            {group.name}
          </Text>
          {group.is_private && <Ionicons name="lock-closed" size={14} color="#6B7280" />}
        </View>
        <View style={styles.defaultStats}>
          <Text style={styles.statText}>{group.member_count} members</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Compact variant
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  compactIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  compactMembers: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Horizontal variant
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  horizontalIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  horizontalIconPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalInfo: {
    flex: 1,
  },
  horizontalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  horizontalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  horizontalDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  horizontalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statSeparator: {
    fontSize: 12,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  // Default variant
  defaultCard: {
    width: 160,
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
  defaultBanner: {
    height: 50,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  defaultContent: {
    padding: 12,
    alignItems: 'center',
    marginTop: -20,
  },
  defaultIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  defaultIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  defaultNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  defaultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  defaultStats: {
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateGroupDetail(options: GroupOptions = {}): string {
  const { componentName = 'GroupDetail', endpoint = '/forum/groups' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Group {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  icon_url?: string;
  color?: string;
  member_count: number;
  thread_count: number;
  post_count: number;
  is_private: boolean;
  is_member?: boolean;
  created_at: string;
  rules?: string[];
  admins?: { id: string; name: string; avatar_url?: string }[];
  recent_members?: { id: string; name: string; avatar_url?: string }[];
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const groupId = route.params?.groupId;

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const response = await api.get<Group>('${endpoint}/' + groupId);
      return response?.data || response;
    },
    enabled: !!groupId,
  });

  const joinMutation = useMutation({
    mutationFn: () => api.post('${endpoint}/' + groupId + '/join', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      Alert.alert('Success', group?.is_member ? 'Left group' : 'Joined group');
    },
    onError: () => Alert.alert('Error', 'Failed to update membership'),
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

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="people-outline" size={48} color="#D1D5DB" />
        <Text style={styles.errorText}>Group not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cover */}
      <View style={[styles.cover, { backgroundColor: group.color || '#8B5CF6' }]}>
        {group.cover_url && (
          <Image source={{ uri: group.cover_url }} style={styles.coverImage} />
        )}
        {group.is_private && (
          <View style={styles.privateBadge}>
            <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
            <Text style={styles.privateBadgeText}>Private Group</Text>
          </View>
        )}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          {group.icon_url ? (
            <Image source={{ uri: group.icon_url }} style={styles.icon} />
          ) : (
            <View
              style={[
                styles.iconPlaceholder,
                { backgroundColor: (group.color || '#8B5CF6') + '20' },
              ]}
            >
              <Ionicons name="people" size={32} color={group.color || '#8B5CF6'} />
            </View>
          )}
        </View>

        <Text style={styles.groupName}>{group.name}</Text>
        {group.description && <Text style={styles.groupDescription}>{group.description}</Text>}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color="#6B7280" />
            <Text style={styles.statText}>{group.member_count.toLocaleString()} members</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubbles" size={16} color="#6B7280" />
            <Text style={styles.statText}>{group.thread_count.toLocaleString()} threads</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={16} color="#6B7280" />
            <Text style={styles.statText}>Created {formatDate(group.created_at)}</Text>
          </View>
        </View>

        {/* Join Button */}
        <TouchableOpacity
          style={[styles.joinButton, group.is_member && styles.leaveButton]}
          onPress={() => joinMutation.mutate()}
          disabled={joinMutation.isPending}
        >
          {joinMutation.isPending ? (
            <ActivityIndicator size="small" color={group.is_member ? '#6B7280' : '#FFFFFF'} />
          ) : (
            <>
              <Ionicons
                name={group.is_member ? 'exit-outline' : 'enter-outline'}
                size={18}
                color={group.is_member ? '#6B7280' : '#FFFFFF'}
              />
              <Text style={[styles.joinButtonText, group.is_member && styles.leaveButtonText]}>
                {group.is_member ? 'Leave Group' : 'Join Group'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Rules */}
      {group.rules && group.rules.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group Rules</Text>
          <View style={styles.rulesContainer}>
            {group.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <Text style={styles.ruleNumber}>{index + 1}</Text>
                <Text style={styles.ruleText}>{rule}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Admins */}
      {group.admins && group.admins.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admins</Text>
          <View style={styles.membersGrid}>
            {group.admins.map((admin) => (
              <TouchableOpacity
                key={admin.id}
                style={styles.memberItem}
                onPress={() => navigation.navigate('MemberProfile', { memberId: admin.id })}
              >
                {admin.avatar_url ? (
                  <Image source={{ uri: admin.avatar_url }} style={styles.memberAvatar} />
                ) : (
                  <View style={styles.memberAvatarPlaceholder}>
                    <Ionicons name="person" size={16} color="#8B5CF6" />
                  </View>
                )}
                <Text style={styles.memberName} numberOfLines={1}>
                  {admin.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Recent Members */}
      {group.recent_members && group.recent_members.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Members</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('GroupMembers', { groupId })}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.membersGrid}>
            {group.recent_members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.memberItem}
                onPress={() => navigation.navigate('MemberProfile', { memberId: member.id })}
              >
                {member.avatar_url ? (
                  <Image source={{ uri: member.avatar_url }} style={styles.memberAvatar} />
                ) : (
                  <View style={styles.memberAvatarPlaceholder}>
                    <Ionicons name="person" size={16} color="#8B5CF6" />
                  </View>
                )}
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      {group.is_member && (
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateThread', { groupId })}
          >
            <Ionicons name="add-circle-outline" size={20} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>New Discussion</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('GroupThreads', { groupId })}
          >
            <Ionicons name="chatbubbles-outline" size={20} color="#8B5CF6" />
            <Text style={styles.actionButtonText}>View Discussions</Text>
          </TouchableOpacity>
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
  cover: {
    height: 150,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  privateBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  privateBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
    marginTop: -40,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconWrapper: {
    marginTop: -40,
    marginBottom: 12,
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  groupName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  groupDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
    width: '100%',
  },
  leaveButton: {
    backgroundColor: '#F3F4F6',
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  leaveButtonText: {
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  rulesContainer: {
    marginTop: 12,
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 12,
  },
  ruleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 24,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  memberItem: {
    alignItems: 'center',
    width: 60,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  memberAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    margin: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ${componentName};
`;
}
