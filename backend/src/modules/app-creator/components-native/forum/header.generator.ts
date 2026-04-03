/**
 * Forum Header Component Generators (React Native)
 *
 * Generates forum header, sidebar, subforum list, and announcement components for React Native.
 */

export interface HeaderOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateForumHeader(options: HeaderOptions = {}): string {
  const { componentName = 'ForumHeader', endpoint = '/forum/stats' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ForumStats {
  total_threads: number;
  total_posts: number;
  total_members: number;
  online_members: number;
}

interface ${componentName}Props {
  title?: string;
  showStats?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  title = 'Forum',
  showStats = true,
}) => {
  const navigation = useNavigation<any>();
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['forum-stats'],
    queryFn: async () => {
      const response = await api.get<ForumStats>('${endpoint}');
      return response?.data || response;
    },
    enabled: showStats,
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearchVisible(false);
      navigation.navigate('ForumSearch', { query: searchQuery });
      setSearchQuery('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="chatbubbles" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setSearchVisible(true)}
          >
            <Ionicons name="search" size={22} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ForumNotifications')}
          >
            <Ionicons name="notifications-outline" size={22} color="#6B7280" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      {showStats && stats && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Ionicons name="chatbubbles-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{stats.total_threads?.toLocaleString() || 0} Threads</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="document-text-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{stats.total_posts?.toLocaleString() || 0} Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={14} color="#6B7280" />
            <Text style={styles.statText}>{stats.total_members?.toLocaleString() || 0} Members</Text>
          </View>
          <View style={styles.statItemOnline}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>{stats.online_members || 0} Online</Text>
          </View>
        </View>
      )}

      {/* Search Modal */}
      <Modal
        visible={searchVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSearchVisible(false)}
      >
        <View style={styles.searchModal}>
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={() => setSearchVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.searchTitle}>Search Forum</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search threads, posts, members..."
              placeholderTextColor="#9CA3AF"
              autoFocus
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    gap: 16,
    flexWrap: 'wrap',
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
  statItemOnline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  onlineText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  searchModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
});

export default ${componentName};
`;
}

export function generateForumSidebar(options: HeaderOptions = {}): string {
  const { componentName = 'ForumSidebar', endpoint = '/forum' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug?: string;
  color?: string;
  thread_count?: number;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface ${componentName}Props {
  activeRoute?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ activeRoute }) => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const currentRoute = activeRoute || route.name;

  const { data: categories, isLoading } = useQuery({
    queryKey: ['forum-categories-sidebar'],
    queryFn: async () => {
      const response = await api.get<Category[]>('${endpoint}/categories?limit=10');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const mainNavItems: NavItem[] = [
    { path: 'ForumHome', label: 'Home', icon: 'home-outline' },
    { path: 'ForumRecent', label: 'Recent', icon: 'time-outline' },
    { path: 'ForumPopular', label: 'Popular', icon: 'trending-up-outline' },
    { path: 'ForumBookmarks', label: 'Bookmarks', icon: 'bookmark-outline' },
    { path: 'ForumNotifications', label: 'Notifications', icon: 'notifications-outline' },
  ];

  const isActive = (path: string) => currentRoute === path;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Main Navigation */}
      <View style={styles.section}>
        {mainNavItems.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={[styles.navItem, isActive(item.path) && styles.navItemActive]}
            onPress={() => navigation.navigate(item.path)}
          >
            <Ionicons
              name={item.icon as any}
              size={20}
              color={isActive(item.path) ? '#8B5CF6' : '#6B7280'}
            />
            <Text
              style={[styles.navItemText, isActive(item.path) && styles.navItemTextActive]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#8B5CF6" style={styles.loader} />
        ) : categories && categories.length > 0 ? (
          <>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() =>
                  navigation.navigate('ForumCategory', { categoryId: category.slug || category.id })
                }
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: category.color || '#8B5CF6' },
                  ]}
                />
                <Text style={styles.categoryName} numberOfLines={1}>
                  {category.name}
                </Text>
                {category.thread_count !== undefined && (
                  <Text style={styles.categoryCount}>{category.thread_count}</Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('ForumCategories')}
            >
              <Text style={styles.viewAllText}>View all categories</Text>
              <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.emptyText}>No categories</Text>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ForumSettings')}
        >
          <Ionicons name="settings-outline" size={20} color="#6B7280" />
          <Text style={styles.navItemText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ForumHelp')}
        >
          <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
          <Text style={styles.navItemText}>Help</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: '#EDE9FE',
  },
  navItemText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  navItemTextActive: {
    color: '#8B5CF6',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  categoryCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  loader: {
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 12,
  },
});

export default ${componentName};
`;
}

export function generateSubforumList(options: HeaderOptions = {}): string {
  const { componentName = 'SubforumList', endpoint = '/forum/subforums' } = options;

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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Subforum {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  thread_count: number;
  post_count: number;
  is_private?: boolean;
  is_pinned?: boolean;
}

interface ${componentName}Props {
  categoryId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ categoryId: propCategoryId }) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const categoryId = propCategoryId || route.params?.categoryId;

  const { data: subforums, isLoading } = useQuery({
    queryKey: ['subforums', categoryId],
    queryFn: async () => {
      const url = categoryId
        ? '${endpoint}?category_id=' + categoryId
        : '${endpoint}';
      const response = await api.get<Subforum[]>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const renderSubforum = ({ item: subforum }: { item: Subforum }) => (
    <TouchableOpacity
      style={styles.subforumItem}
      onPress={() =>
        navigation.navigate('ForumCategory', { categoryId: subforum.slug || subforum.id })
      }
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: (subforum.color || '#8B5CF6') + '20' },
        ]}
      >
        <Ionicons
          name="chatbubbles-outline"
          size={24}
          color={subforum.color || '#8B5CF6'}
        />
      </View>

      <View style={styles.subforumContent}>
        <View style={styles.titleRow}>
          {subforum.is_pinned && (
            <Ionicons name="pin" size={14} color="#8B5CF6" />
          )}
          {subforum.is_private && (
            <Ionicons name="lock-closed" size={14} color="#6B7280" />
          )}
          <Text style={styles.subforumName}>{subforum.name}</Text>
        </View>
        {subforum.description && (
          <Text style={styles.subforumDescription} numberOfLines={1}>
            {subforum.description}
          </Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{subforum.thread_count.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Threads</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{subforum.post_count.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!subforums?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No subforums found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={subforums}
      renderItem={renderSubforum}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
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
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 16,
  },
  subforumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subforumContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subforumName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  subforumDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
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
  },
});

export default ${componentName};
`;
}

export function generateAnnouncementList(options: HeaderOptions = {}): string {
  const { componentName = 'AnnouncementList', endpoint = '/forum/announcements' } = options;

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  is_pinned: boolean;
  is_dismissible: boolean;
  author_name: string;
  created_at: string;
  link_url?: string;
  link_text?: string;
}

interface ${componentName}Props {
  limit?: number;
  showDismissed?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  limit = 5,
  showDismissed = false,
}) => {
  const navigation = useNavigation<any>();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('dismissed-announcements').then((stored) => {
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    });
  }, []);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['forum-announcements', limit],
    queryFn: async () => {
      const response = await api.get<Announcement[]>('${endpoint}?limit=' + limit);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const dismissAnnouncement = async (id: string) => {
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    await AsyncStorage.setItem('dismissed-announcements', JSON.stringify(newDismissed));
  };

  const getTypeConfig = (type: Announcement['type']) => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: '#FFFBEB',
          borderColor: '#FDE68A',
          iconColor: '#F59E0B',
          icon: 'alert-circle',
        };
      case 'success':
        return {
          backgroundColor: '#ECFDF5',
          borderColor: '#A7F3D0',
          iconColor: '#10B981',
          icon: 'checkmark-circle',
        };
      case 'critical':
        return {
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
          iconColor: '#EF4444',
          icon: 'alert-circle',
        };
      default:
        return {
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
          iconColor: '#3B82F6',
          icon: 'information-circle',
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const visibleAnnouncements = announcements?.filter(
    (a) => showDismissed || !dismissedIds.includes(a.id)
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#8B5CF6" />
      </View>
    );
  }

  if (!visibleAnnouncements?.length) {
    return null;
  }

  const renderAnnouncement = ({ item: announcement }: { item: Announcement }) => {
    const config = getTypeConfig(announcement.type);

    return (
      <View
        style={[
          styles.announcementCard,
          {
            backgroundColor: config.backgroundColor,
            borderColor: config.borderColor,
          },
        ]}
      >
        {announcement.is_pinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={12} color="#FFFFFF" />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}

        <View style={styles.announcementContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={config.icon as any} size={24} color={config.iconColor} />
          </View>

          <View style={styles.textContent}>
            <Text style={styles.announcementTitle}>{announcement.title}</Text>
            <Text style={styles.announcementBody} numberOfLines={2}>
              {announcement.content}
            </Text>

            <View style={styles.metaRow}>
              <Text style={styles.authorText}>By {announcement.author_name}</Text>
              <Text style={styles.dateText}>{formatDate(announcement.created_at)}</Text>
            </View>

            {announcement.link_url && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('WebView', { url: announcement.link_url })}
              >
                <Text style={styles.linkText}>{announcement.link_text || 'Learn more'}</Text>
                <Ionicons name="chevron-forward" size={14} color="#8B5CF6" />
              </TouchableOpacity>
            )}
          </View>

          {announcement.is_dismissible && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => dismissAnnouncement(announcement.id)}
            >
              <Ionicons name="close" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={visibleAnnouncements}
      renderItem={renderAnnouncement}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    gap: 12,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  announcementCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pinnedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  pinnedText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  announcementContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  announcementBody: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  authorText: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  linkText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
  },
});

export default ${componentName};
`;
}
