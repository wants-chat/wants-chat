/**
 * Forum Post Component Generators (React Native)
 *
 * Generates post list, post editor, and post reply components for React Native.
 */

export interface PostOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePostList(options: PostOptions = {}): string {
  const { componentName = 'PostList', endpoint = '/forum/posts' } = options;

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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Post {
  id: string;
  content: string;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
  created_at: string;
  like_count?: number;
}

interface ${componentName}Props {
  threadId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ threadId }) => {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', threadId],
    queryFn: async () => {
      const response = await api.get<Post[]>('${endpoint}?thread_id=' + threadId);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderPost = ({ item: post, index }: { item: Post; index: number }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        {post.author_avatar ? (
          <Image source={{ uri: post.author_avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={20} color="#8B5CF6" />
          </View>
        )}
        <View style={styles.authorInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{post.author_name}</Text>
            {post.author_role && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{post.author_role}</Text>
              </View>
            )}
          </View>
          <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
        </View>
        <Text style={styles.postNumber}>#{index + 1}</Text>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={18} color="#6B7280" />
          <Text style={styles.actionText}>{post.like_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!posts?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-outline" size={40} color="#D1D5DB" />
        <Text style={styles.emptyText}>No replies yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
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
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
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
  authorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  roleBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 11,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  postDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  postNumber: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    padding: 12,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  separator: {
    height: 12,
  },
});

export default ${componentName};
`;
}

export function generatePostEditor(options: PostOptions = {}): string {
  const { componentName = 'PostEditor' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  value,
  onChange,
  placeholder = 'Write your reply...',
}) => {
  const tools = [
    { icon: 'text', name: 'Bold' },
    { icon: 'italic', name: 'Italic' },
    { icon: 'link', name: 'Link' },
    { icon: 'image', name: 'Image' },
    { icon: 'list', name: 'List' },
    { icon: 'code-slash', name: 'Code' },
    { icon: 'chatbox-ellipses', name: 'Quote' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.toolbar}
        contentContainerStyle={styles.toolbarContent}
      >
        {tools.map(({ icon, name }) => (
          <TouchableOpacity
            key={name}
            style={styles.toolButton}
            onPress={() => {}}
          >
            <Ionicons name={icon as any} size={18} color="#6B7280" />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  toolbar: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  toolbarContent: {
    flexDirection: 'row',
    padding: 8,
    gap: 4,
  },
  toolButton: {
    padding: 8,
    borderRadius: 6,
  },
  textInput: {
    fontSize: 15,
    color: '#111827',
    padding: 12,
    minHeight: 120,
  },
});

export default ${componentName};
`;
}

export function generatePostReply(options: PostOptions = {}): string {
  const { componentName = 'PostReply', endpoint = '/forum/posts' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  threadId?: string;
  replyTo?: string;
  onSuccess?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  threadId: propThreadId,
  replyTo,
  onSuccess,
}) => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();

  const threadId = propThreadId || route.params?.threadId;
  const [content, setContent] = useState('');

  const replyMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thread', threadId] });
      queryClient.invalidateQueries({ queryKey: ['posts', threadId] });
      setContent('');
      Alert.alert('Success', 'Reply posted!');
      onSuccess?.();
      if (route.params?.threadId) {
        navigation.goBack();
      }
    },
    onError: () => Alert.alert('Error', 'Failed to post reply'),
  });

  const handleSubmit = () => {
    if (content.trim()) {
      replyMutation.mutate({
        thread_id: threadId,
        content: content.trim(),
        reply_to: replyTo,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.heading}>Write a Reply</Text>

        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={setContent}
          placeholder="Write your reply..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <View style={styles.actions}>
          <View style={styles.mediaButtons}>
            <TouchableOpacity style={styles.mediaButton}>
              <Ionicons name="attach" size={22} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaButton}>
              <Ionicons name="image-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!content.trim() || replyMutation.isPending) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!content.trim() || replyMutation.isPending}
          >
            {replyMutation.isPending ? (
              <Text style={styles.submitButtonText}>Posting...</Text>
            ) : (
              <>
                <Ionicons name="send" size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Post Reply</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  card: {
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
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 120,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
