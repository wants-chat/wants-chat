/**
 * Forum Thread Component Generators (React Native)
 *
 * Generates thread list, thread detail, and create thread components for React Native.
 */

export interface ThreadOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateThreadList(options: ThreadOptions = {}): string {
  const { componentName = 'ThreadList', endpoint = '/forum/threads' } = options;

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
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Thread {
  id: string;
  title: string;
  author_name: string;
  author_avatar?: string;
  reply_count?: number;
  view_count?: number;
  is_pinned?: boolean;
  is_locked?: boolean;
  last_activity?: string;
  created_at: string;
  last_reply_author?: string;
  tags?: string[];
}

interface ${componentName}Props {
  categoryId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ categoryId: propCategoryId }) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const categoryId = propCategoryId || route.params?.categoryId;

  const [sort, setSort] = useState('latest');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['threads', categoryId, sort],
    queryFn: async () => {
      const url = '${endpoint}?category=' + categoryId + '&sort=' + sort;
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const threads = data?.threads || data || [];
  const category = data?.category;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const sortOptions = ['latest', 'popular', 'unanswered'];

  const renderThread = ({ item: thread }: { item: Thread }) => (
    <TouchableOpacity
      style={styles.threadItem}
      onPress={() => navigation.navigate('ThreadDetail', { threadId: thread.id })}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {thread.author_avatar ? (
          <Image source={{ uri: thread.author_avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color="#8B5CF6" />
          </View>
        )}
      </View>

      <View style={styles.threadContent}>
        <View style={styles.threadTitleRow}>
          {thread.is_pinned && (
            <Ionicons name="pin" size={14} color="#8B5CF6" style={styles.icon} />
          )}
          {thread.is_locked && (
            <Ionicons name="lock-closed" size={14} color="#6B7280" style={styles.icon} />
          )}
          <Text style={styles.threadTitle} numberOfLines={2}>
            {thread.title}
          </Text>
        </View>

        <Text style={styles.threadAuthor}>
          Started by <Text style={styles.authorName}>{thread.author_name}</Text>
        </Text>

        {thread.tags && thread.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {thread.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.threadStats}>
        <View style={styles.statRow}>
          <Text style={styles.statValue}>{thread.reply_count || 0}</Text>
          <Text style={styles.statLabel}>Replies</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statValue}>{thread.view_count || 0}</Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
        <Text style={styles.dateText}>
          {formatDate(thread.last_activity || thread.created_at)}
        </Text>
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
      {/* Header */}
      <View style={styles.header}>
        {category && (
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            {category.description && (
              <Text style={styles.categoryDescription}>{category.description}</Text>
            )}
          </View>
        )}
        <TouchableOpacity
          style={styles.newThreadButton}
          onPress={() => navigation.navigate('CreateThread', { categoryId })}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newThreadButtonText}>New Thread</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {sortOptions.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.sortButton, sort === s && styles.sortButtonActive]}
            onPress={() => setSort(s)}
          >
            <Text
              style={[styles.sortButtonText, sort === s && styles.sortButtonTextActive]}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Thread List */}
      <FlatList
        data={threads}
        renderItem={renderThread}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No threads yet</Text>
            <Text style={styles.emptySubtext}>Be the first to start a discussion!</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  newThreadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newThreadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sortContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    padding: 16,
  },
  threadItem: {
    flexDirection: 'row',
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
  avatarContainer: {
    width: 40,
    height: 40,
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
  threadContent: {
    flex: 1,
  },
  threadTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  icon: {
    marginRight: 4,
    marginTop: 2,
  },
  threadTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  threadAuthor: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  authorName: {
    fontWeight: '500',
    color: '#374151',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#4B5563',
  },
  threadStats: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  statRow: {
    alignItems: 'center',
    marginBottom: 4,
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
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateThreadDetail(options: ThreadOptions = {}): string {
  const { componentName = 'ThreadDetail', endpoint = '/forum/threads' } = options;

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
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Reply {
  id: string;
  content: string;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
  created_at: string;
  like_count?: number;
}

interface Thread {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
  category_id: string;
  category_name?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  reply_count?: number;
  view_count?: number;
  like_count?: number;
  created_at: string;
  replies?: Reply[];
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const threadId = route.params?.threadId;

  const { data: thread, isLoading } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: async () => {
      const response = await api.get<Thread>('${endpoint}/' + threadId);
      return response?.data || response;
    },
    enabled: !!threadId,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!thread) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Thread not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Thread Header */}
      <View style={styles.headerCard}>
        {/* Badges */}
        {(thread.is_pinned || thread.is_locked) && (
          <View style={styles.badges}>
            {thread.is_pinned && (
              <View style={[styles.badge, styles.pinnedBadge]}>
                <Ionicons name="pin" size={12} color="#8B5CF6" />
                <Text style={styles.pinnedBadgeText}>Pinned</Text>
              </View>
            )}
            {thread.is_locked && (
              <View style={[styles.badge, styles.lockedBadge]}>
                <Ionicons name="lock-closed" size={12} color="#6B7280" />
                <Text style={styles.lockedBadgeText}>Locked</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.threadTitle}>{thread.title}</Text>

        <View style={styles.threadMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{thread.view_count || 0} views</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{thread.reply_count || 0} replies</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{formatDate(thread.created_at)}</Text>
          </View>
        </View>
      </View>

      {/* Original Post */}
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          {thread.author_avatar ? (
            <Image source={{ uri: thread.author_avatar }} style={styles.postAvatar} />
          ) : (
            <View style={styles.postAvatarPlaceholder}>
              <Ionicons name="person" size={24} color="#8B5CF6" />
            </View>
          )}
          <View style={styles.postAuthorInfo}>
            <Text style={styles.postAuthorName}>{thread.author_name}</Text>
            {thread.author_role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{thread.author_role}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.postContent}>{thread.content}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>{thread.like_count || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="return-down-forward-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Quote</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="flag-outline" size={20} color="#6B7280" />
            <Text style={styles.actionText}>Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Replies */}
      {thread.replies && thread.replies.length > 0 && (
        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>
            {thread.replies.length} {thread.replies.length === 1 ? 'Reply' : 'Replies'}
          </Text>
          {thread.replies.map((reply, index) => (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.replyHeader}>
                {reply.author_avatar ? (
                  <Image source={{ uri: reply.author_avatar }} style={styles.replyAvatar} />
                ) : (
                  <View style={styles.replyAvatarPlaceholder}>
                    <Ionicons name="person" size={16} color="#6B7280" />
                  </View>
                )}
                <View style={styles.replyAuthorInfo}>
                  <Text style={styles.replyAuthorName}>{reply.author_name}</Text>
                  <Text style={styles.replyDate}>{formatDate(reply.created_at)}</Text>
                </View>
                <Text style={styles.replyNumber}>#{index + 2}</Text>
              </View>
              <Text style={styles.replyContent}>{reply.content}</Text>
              <View style={styles.replyActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="heart-outline" size={16} color="#6B7280" />
                  <Text style={styles.smallActionText}>{reply.like_count || 0}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="return-down-forward-outline" size={16} color="#6B7280" />
                  <Text style={styles.smallActionText}>Quote</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Reply Button */}
      {!thread.is_locked && (
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => navigation.navigate('PostReply', { threadId: thread.id })}
        >
          <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          <Text style={styles.replyButtonText}>Write a Reply</Text>
        </TouchableOpacity>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pinnedBadge: {
    backgroundColor: '#EDE9FE',
  },
  pinnedBadgeText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  lockedBadge: {
    backgroundColor: '#F3F4F6',
  },
  lockedBadgeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  threadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 28,
  },
  threadMeta: {
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
  postCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  postAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  postAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  roleBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  postContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    padding: 16,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 12,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    color: '#6B7280',
  },
  smallActionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  repliesSection: {
    paddingHorizontal: 16,
  },
  repliesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  replyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  replyAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  replyAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyAuthorInfo: {
    flex: 1,
  },
  replyAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  replyDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  replyNumber: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  replyContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    padding: 12,
  },
  replyActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 12,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  replyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 32,
  },
});

export default ${componentName};
`;
}

export function generateCreateThread(options: ThreadOptions = {}): string {
  const { componentName = 'CreateThread', endpoint = '/forum/threads' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const categoryId = route.params?.categoryId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: (response: any) => {
      Alert.alert('Success', 'Thread created!');
      navigation.replace('ThreadDetail', { threadId: response?.data?.id || response?.id });
    },
    onError: () => Alert.alert('Error', 'Failed to create thread'),
  });

  const addTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter content');
      return;
    }

    createMutation.mutate({
      category_id: categoryId,
      title: title.trim(),
      content: content.trim(),
      tags,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.heading}>Create New Thread</Text>

          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What's your question or topic?"
              placeholderTextColor="#9CA3AF"
              maxLength={200}
            />
          </View>

          {/* Content */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Describe your question or start a discussion..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />
          </View>

          {/* Tags */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Tags (up to 5)</Text>
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Ionicons name="close" size={14} color="#8B5CF6" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.tagInputRow}>
              <TextInput
                style={[styles.input, styles.tagInput]}
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add a tag..."
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.addTagButton}
                onPress={addTag}
                disabled={tags.length >= 5 || !tagInput.trim()}
              >
                <Ionicons name="add" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              createMutation.isPending && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Text style={styles.submitButtonText}>Creating...</Text>
            ) : (
              <Text style={styles.submitButtonText}>Create Thread</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
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
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#111827',
  },
  textArea: {
    minHeight: 200,
    paddingTop: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
  },
  addTagButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
