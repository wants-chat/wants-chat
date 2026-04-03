/**
 * Library Component Generators (React Native)
 *
 * Generates library stats, activity, tabs, member profile, and book search components.
 */

export interface LibraryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLibraryStats(options: LibraryOptions = {}): string {
  const { componentName = 'LibraryStats', endpoint = '/library/stats' } = options;

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

interface ${componentName}Props {
  userId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['library-stats', userId],
    queryFn: async () => {
      const url = '${endpoint}' + (userId ? '?user_id=' + userId : '');
      const response = await api.get<any>(url);
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

  const statCards = [
    { icon: 'book', label: 'Total Books', value: stats?.total_books || 0, color: '#3B82F6' },
    { icon: 'time', label: 'Reading Hours', value: stats?.reading_hours || 0, color: '#10B981' },
    { icon: 'star', label: 'Books Read', value: stats?.books_read || 0, color: '#8B5CF6' },
    { icon: 'trending-up', label: 'This Month', value: stats?.this_month || 0, color: '#F59E0B' },
    { icon: 'trophy', label: 'Achievements', value: stats?.achievements || 0, color: '#EC4899' },
    { icon: 'people', label: 'Following', value: stats?.following || 0, color: '#6366F1' },
  ];

  return (
    <View style={styles.container}>
      {statCards.map((stat, index) => (
        <View key={index} style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
            <Ionicons name={stat.icon as any} size={24} color={stat.color} />
          </View>
          <View style={styles.statInfo}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  statCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}

export function generateLibraryActivity(options: LibraryOptions = {}): string {
  const { componentName = 'LibraryActivity', endpoint = '/library/activity' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  userId?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userId, limit = 10 }) => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['library-activity', userId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      params.append('limit', limit.toString());
      const url = '${endpoint}?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'read': return 'book';
      case 'review': return 'star';
      case 'comment': return 'chatbubble';
      case 'share': return 'share-social';
      case 'like': return 'heart';
      case 'bookmark': return 'bookmark';
      default: return 'book';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'read': return { bg: '#DBEAFE', icon: '#3B82F6' };
      case 'review': return { bg: '#FEF3C7', icon: '#F59E0B' };
      case 'comment': return { bg: '#D1FAE5', icon: '#10B981' };
      case 'share': return { bg: '#EDE9FE', icon: '#8B5CF6' };
      case 'like': return { bg: '#FCE7F3', icon: '#EC4899' };
      case 'bookmark': return { bg: '#E0E7FF', icon: '#6366F1' };
      default: return { bg: '#F3F4F6', icon: '#6B7280' };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  const renderActivity = ({ item: activity }: { item: any }) => {
    const colors = getActivityColor(activity.type);
    return (
      <View style={styles.activityItem}>
        <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
          <Ionicons name={getActivityIcon(activity.type) as any} size={20} color={colors.icon} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>
            <Text style={styles.userName}>{activity.user_name || 'You'}</Text>
            {' '}{activity.action}{' '}
            <Text style={styles.bookTitle}>{activity.book_title}</Text>
          </Text>
          {activity.content && (
            <Text style={styles.activityDescription} numberOfLines={2}>
              {activity.content}
            </Text>
          )}
          <Text style={styles.activityTime}>
            {new Date(activity.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        {activity.book_cover_url && (
          <Image source={{ uri: activity.book_cover_url }} style={styles.bookCover} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Activity</Text>
      </View>
      {activities && activities.length > 0 ? (
        <FlatList
          data={activities}
          renderItem={renderActivity}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No recent activity</Text>
        </View>
      )}
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
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  activityItem: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  userName: {
    fontWeight: '600',
    color: '#111827',
  },
  bookTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  activityDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  bookCover: {
    width: 48,
    height: 64,
    borderRadius: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateLibraryTabs(options: LibraryOptions = {}): string {
  const { componentName = 'LibraryTabs', endpoint = '/library' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  userId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userId }) => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Books', icon: 'book' },
    { id: 'reading', label: 'Reading', icon: 'time' },
    { id: 'completed', label: 'Completed', icon: 'checkmark-circle' },
    { id: 'wishlist', label: 'Wishlist', icon: 'heart' },
    { id: 'favorites', label: 'Favorites', icon: 'star' },
  ];

  const { data: books, isLoading } = useQuery({
    queryKey: ['library-books', userId, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      if (activeTab !== 'all') params.append('status', activeTab);
      const url = '${endpoint}?' + params.toString();
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const renderBook = ({ item: book }: { item: any }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => navigation.navigate('BookDetail', { id: book.id })}
      activeOpacity={0.7}
    >
      {book.cover_url ? (
        <Image source={{ uri: book.cover_url }} style={styles.bookCover} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Ionicons name="book" size={24} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author}
        </Text>
        {book.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{book.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: \`\${book.progress}%\` }]} />
            </View>
          </View>
        )}
        {book.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{book.rating}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.id ? '#8B5CF6' : '#6B7280'}
            />
            <Text
              style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B7280" />
          </View>
        ) : books && books.length > 0 ? (
          <FlatList
            data={books}
            renderItem={renderBook}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No books in this collection</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    paddingHorizontal: 12,
    gap: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#8B5CF6',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  listContent: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bookCard: {
    width: '48%',
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  bookCover: {
    width: 64,
    height: 96,
    borderRadius: 6,
  },
  coverPlaceholder: {
    width: 64,
    height: 96,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 18,
  },
  bookAuthor: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 10,
    color: '#6B7280',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#374151',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateMemberProfileLibrary(options: LibraryOptions = {}): string {
  const { componentName = 'MemberProfileLibrary', endpoint = '/library/members' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  memberId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ memberId }) => {
  const navigation = useNavigation<any>();

  const { data: member, isLoading } = useQuery({
    queryKey: ['library-member', memberId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${memberId}\`);
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

  if (!member) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Member not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cover */}
      <View style={styles.coverContainer}>
        <View style={styles.cover} />
      </View>

      {/* Profile */}
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          {member.avatar_url ? (
            <Image source={{ uri: member.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#8B5CF6" />
            </View>
          )}
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.memberName}>{member.name}</Text>
        {member.username && (
          <Text style={styles.memberUsername}>@{member.username}</Text>
        )}

        {member.bio && <Text style={styles.memberBio}>{member.bio}</Text>}

        <View style={styles.metaRow}>
          {member.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{member.location}</Text>
            </View>
          )}
          {member.joined_at && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                Joined{' '}
                {new Date(member.joined_at).toLocaleDateString(undefined, {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{member.books_read || 0}</Text>
            <View style={styles.statLabel}>
              <Ionicons name="book-outline" size={14} color="#6B7280" />
              <Text style={styles.statLabelText}>Books Read</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{member.reviews || 0}</Text>
            <View style={styles.statLabel}>
              <Ionicons name="star-outline" size={14} color="#6B7280" />
              <Text style={styles.statLabelText}>Reviews</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{member.followers || 0}</Text>
            <View style={styles.statLabel}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.statLabelText}>Followers</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{member.badges || 0}</Text>
            <View style={styles.statLabel}>
              <Ionicons name="trophy-outline" size={14} color="#6B7280" />
              <Text style={styles.statLabelText}>Badges</Text>
            </View>
          </View>
        </View>

        {/* Favorite Books */}
        {member.favorite_books && member.favorite_books.length > 0 && (
          <View style={styles.favoritesSection}>
            <Text style={styles.sectionTitle}>Favorite Books</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoritesList}
            >
              {member.favorite_books.map((book: any) => (
                <TouchableOpacity
                  key={book.id}
                  onPress={() => navigation.navigate('BookDetail', { id: book.id })}
                >
                  {book.cover_url ? (
                    <Image source={{ uri: book.cover_url }} style={styles.favoriteBook} />
                  ) : (
                    <View style={styles.favoriteBookPlaceholder}>
                      <Ionicons name="book" size={24} color="#9CA3AF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  coverContainer: {
    height: 120,
  },
  cover: {
    flex: 1,
    backgroundColor: '#8B5CF6',
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    marginTop: -48,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  memberName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  memberUsername: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  memberBio: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 12,
  },
  metaRow: {
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
    fontSize: 13,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statLabelText: {
    fontSize: 12,
    color: '#6B7280',
  },
  favoritesSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  favoritesList: {
    gap: 8,
  },
  favoriteBook: {
    width: 64,
    height: 96,
    borderRadius: 6,
  },
  favoriteBookPlaceholder: {
    width: 64,
    height: 96,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ${componentName};
`;
}

export function generateBookSearch(options: LibraryOptions = {}): string {
  const { componentName = 'BookSearch', endpoint = '/library/search' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onSelect?: (book: any) => void;
  placeholder?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onSelect,
  placeholder = 'Search books...',
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    rating: '',
  });

  const debounceSearch = useCallback((value: string) => {
    const timer = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    debounceSearch(value);
  };

  const { data: results, isLoading } = useQuery({
    queryKey: ['book-search', debouncedQuery, filters],
    queryFn: async () => {
      if (!debouncedQuery && !filters.genre && !filters.year && !filters.rating) return [];
      const params = new URLSearchParams();
      if (debouncedQuery) params.append('q', debouncedQuery);
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.year) params.append('year', filters.year);
      if (filters.rating) params.append('min_rating', filters.rating);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!(debouncedQuery || filters.genre || filters.year || filters.rating),
  });

  const genres = [
    'Fiction', 'Non-Fiction', 'Mystery', 'Sci-Fi', 'Romance',
    'Biography', 'History', 'Self-Help',
  ];

  const renderResult = ({ item: book }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => onSelect?.(book)}
      activeOpacity={0.7}
    >
      {book.cover_url ? (
        <Image source={{ uri: book.cover_url }} style={styles.bookCover} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Ionicons name="book" size={20} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>
        <View style={styles.bookMeta}>
          {book.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{book.rating}</Text>
            </View>
          )}
          {book.year && <Text style={styles.yearText}>{book.year}</Text>}
          {book.genre && (
            <View style={styles.genreBadge}>
              <Text style={styles.genreText}>{book.genre}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={handleSearch}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
        {query && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setQuery('');
              setDebouncedQuery('');
            }}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="options"
            size={18}
            color={showFilters ? '#8B5CF6' : '#6B7280'}
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Genre</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filtersList}
          >
            <TouchableOpacity
              style={[styles.filterChip, !filters.genre && styles.filterChipActive]}
              onPress={() => setFilters({ ...filters, genre: '' })}
            >
              <Text style={[styles.filterChipText, !filters.genre && styles.filterChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[styles.filterChip, filters.genre === genre && styles.filterChipActive]}
                onPress={() => setFilters({ ...filters, genre })}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.genre === genre && styles.filterChipTextActive,
                  ]}
                >
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6B7280" />
        </View>
      )}

      {results && results.length > 0 && (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {debouncedQuery && results && results.length === 0 && !isLoading && (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No books found for "{debouncedQuery}"</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#F3E8FF',
  },
  filtersContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterScroll: {
    marginHorizontal: -16,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  resultsList: {
    padding: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  resultItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  bookCover: {
    width: 48,
    height: 72,
    borderRadius: 4,
  },
  coverPlaceholder: {
    width: 48,
    height: 72,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  bookAuthor: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#374151',
  },
  yearText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  genreBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  genreText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}
