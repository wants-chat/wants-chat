/**
 * Social Profile Component Generators (React Native)
 *
 * Generates profile header, tabs, and user grid components for React Native.
 */

export interface ProfileOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateProfileHeader(options: ProfileOptions = {}): string {
  const { componentName = 'ProfileHeader', endpoint = '/users' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
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

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>User not found</Text>
      </View>
    );
  }

  const handleWebsitePress = () => {
    if (user.website) {
      Linking.openURL(user.website);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {user.cover_url ? (
          <Image source={{ uri: user.cover_url }} style={styles.coverImage} />
        ) : (
          <View style={styles.coverGradient} />
        )}
      </View>

      {/* Profile Info */}
      <View style={styles.profileInfo}>
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            {user.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(user.name || user.username || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.nameContainer}>
          <Text style={styles.name}>{user.name || user.username}</Text>
          {user.username && <Text style={styles.username}>@{user.username}</Text>}
        </View>

        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

        <View style={styles.metaContainer}>
          {user.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{user.location}</Text>
            </View>
          )}
          {user.website && (
            <TouchableOpacity style={styles.metaItem} onPress={handleWebsitePress}>
              <Ionicons name="link-outline" size={16} color="#2563EB" />
              <Text style={[styles.metaText, styles.linkText]}>
                {user.website.replace(/^https?:\\/\\//, '')}
              </Text>
            </TouchableOpacity>
          )}
          {user.created_at && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>Joined {formatDate(user.created_at)}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.following_count || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.followers_count || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
  },
  coverContainer: {
    height: 192,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  profileInfo: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: -48,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  followButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: '#2563EB',
    borderRadius: 20,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
  },
  nameContainer: {
    marginTop: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  username: {
    fontSize: 16,
    color: '#6B7280',
  },
  bio: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkText: {
    color: '#2563EB',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateProfileTabs(options: { componentName?: string } = {}): string {
  const componentName = options.componentName || 'ProfileTabs';

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface ${componentName}Props {
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children?: React.ReactNode;
}

const defaultTabs: Tab[] = [
  { id: 'posts', label: 'Posts' },
  { id: 'likes', label: 'Likes' },
  { id: 'media', label: 'Media' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  tabs = defaultTabs,
  activeTab: controlledActiveTab,
  onTabChange,
  children,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || 'posts');
  const activeTab = controlledActiveTab ?? internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => handleTabChange(tab.id)}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
            {tab.count !== undefined && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{tab.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.content}>
        {children}
      </View>
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
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabsScrollView: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 8,
  },
  activeTab: {
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#2563EB',
  },
  countBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    color: '#6B7280',
  },
  content: {
    padding: 16,
  },
});

export default ${componentName};
`;
}

export function generateUserGrid(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'UserGrid', endpoint = '/users' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
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
  title?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ title = 'Users', limit }) => {
  const navigation = useNavigation();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', limit],
    queryFn: async () => {
      let url = '${endpoint}';
      if (limit) url += '?limit=' + limit;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile' as never, { id: userId } as never);
  };

  const renderUser = ({ item: user }: { item: any }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(user.id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {(user.name || user.username || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.userName} numberOfLines={1}>
        {user.name || user.username}
      </Text>
      {user.username && (
        <Text style={styles.userHandle} numberOfLines={1}>
          @{user.username}
        </Text>
      )}
      {user.followers_count !== undefined && (
        <Text style={styles.followersCount}>
          {user.followers_count} followers
        </Text>
      )}
    </TouchableOpacity>
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
      {title && <Text style={styles.title}>{title}</Text>}
      {users && users.length > 0 ? (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  userHandle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  followersCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  emptyContainer: {
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
