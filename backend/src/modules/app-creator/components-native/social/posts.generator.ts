/**
 * Social Posts Component Generators (React Native)
 *
 * Generates post composer, post feed, and comment components for React Native.
 */

export interface PostsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generatePostComposer(options: PostsOptions = {}): string {
  const { componentName = 'PostComposer', endpoint = '/posts' } = options;

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
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '@/lib/api';

interface ${componentName}Props {
  placeholder?: string;
  onSuccess?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  placeholder = "What's on your mind?",
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; image_url?: string }) =>
      api.post('${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setContent('');
      setSelectedImage(null);
      Alert.alert('Success', 'Post created!');
      onSuccess?.();
    },
    onError: () => Alert.alert('Error', 'Failed to create post'),
  });

  const handleSubmit = () => {
    if (content.trim()) {
      createPostMutation.mutate({
        content: content.trim(),
        ...(selectedImage && { image_url: selectedImage }),
      });
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputRow}>
        <View style={styles.avatarPlaceholder} />
        <TextInput
          style={styles.textInput}
          value={content}
          onChangeText={setContent}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {selectedImage && (
        <View style={styles.imagePreviewContainer}>
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close-circle" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actionsRow}>
        <View style={styles.mediaButtons}>
          <TouchableOpacity style={styles.mediaButton} onPress={handlePickImage}>
            <Ionicons name="image-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="videocam-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Ionicons name="happy-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.postButton,
            (!content.trim() || createPostMutation.isPending) && styles.postButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!content.trim() || createPostMutation.isPending}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    minHeight: 80,
    padding: 0,
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: 'relative',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mediaButton: {
    padding: 8,
    borderRadius: 20,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

export function generatePostFeed(options: PostsOptions = {}): string {
  const { componentName = 'PostFeed', endpoint = '/posts' } = options;

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

interface ${componentName}Props {
  userId?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ userId, limit }) => {
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts', userId, limit],
    queryFn: async () => {
      let url = '${endpoint}';
      const params = [];
      if (userId) params.push('user_id=' + userId);
      if (limit) params.push('limit=' + limit);
      if (params.length) url += '?' + params.join('&');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderPost = ({ item: post }: { item: any }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          {post.user?.avatar_url || post.author_avatar ? (
            <Image
              source={{ uri: post.user?.avatar_url || post.author_avatar }}
              style={styles.authorAvatar}
            />
          ) : (
            <View style={styles.authorAvatarPlaceholder}>
              <Text style={styles.authorAvatarInitial}>
                {(post.user?.name || post.author_name || '?').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.authorName}>
              {post.user?.name || post.author_name || 'Anonymous'}
            </Text>
            <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.postContent}>
        <Text style={styles.postText}>{post.content}</Text>
        {post.image_url && (
          <Image source={{ uri: post.image_url }} style={styles.postImage} />
        )}
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={22} color="#6B7280" />
          <Text style={styles.actionText}>{post.likes_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
          <Text style={styles.actionText}>{post.comments_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={22} color="#6B7280" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!posts?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No posts yet</Text>
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
      onRefresh={refetch}
      refreshing={isLoading}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  postDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  postText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  postImage: {
    marginTop: 12,
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  separator: {
    height: 12,
  },
});

export default ${componentName};
`;
}

export function generateCommentSection(options: { componentName?: string; endpoint?: string } = {}): string {
  const { componentName = 'CommentSection', endpoint = '/comments' } = options;

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
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  parentType: string;
  parentId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ parentType, parentId }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', parentType, parentId],
    queryFn: async () => {
      const response = await api.get<any>(
        \`${endpoint}?parent_type=\${parentType}&parent_id=\${parentId}\`
      );
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const createMutation = useMutation({
    mutationFn: (content: string) =>
      api.post('${endpoint}', {
        content,
        parent_type: parentType,
        parent_id: parentId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', parentType, parentId] });
      setNewComment('');
    },
    onError: () => Alert.alert('Error', 'Failed to post comment'),
  });

  const handleSubmit = () => {
    if (newComment.trim()) {
      createMutation.mutate(newComment.trim());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderComment = ({ item: comment }: { item: any }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        {comment.user?.avatar_url ? (
          <Image source={{ uri: comment.user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {(comment.user?.name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <Text style={styles.commentAuthor}>
            {comment.user?.name || 'Anonymous'}
          </Text>
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>
        <Text style={styles.commentTime}>{formatDate(comment.created_at)}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <View style={styles.inputAvatar}>
          <Ionicons name="person" size={16} color="#6B7280" />
        </View>
        <TextInput
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write a comment..."
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newComment.trim() || createMutation.isPending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!newComment.trim() || createMutation.isPending}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6B7280" />
        </View>
      ) : comments?.length > 0 ? (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" />
          <Text style={styles.emptyText}>No comments yet</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    fontSize: 14,
    color: '#111827',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  commentsList: {
    gap: 12,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
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
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 12,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
