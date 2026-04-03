/**
 * Social Component Generators for React Native
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Post Composer
export function generateRNPostComposer(resolved: ResolvedComponent, variant: string = 'minimal') {
  const dataSource = resolved?.dataSource;
  const entity = dataSource?.split('.').pop() || 'posts';

  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface PostComposerProps {
  userAvatar?: string;
  userName?: string;
  placeholder?: string;
  entity?: string;
  onPost?: (content: string) => void;
  onAddImage?: () => void;
  onAddVideo?: () => void;
  onSubmit?: (data: any) => void;
}

export default function PostComposer({ userAvatar, userName = 'User', placeholder = "What's on your mind?", entity = '${entity}', onPost, onAddImage, onAddVideo, onSubmit }: PostComposerProps) {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();

  const postMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/\${entity}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      setContent('');
      if (onSubmit) onSubmit(data);
      if (onPost) onPost(content);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to create post');
    },
  });

  const handlePost = () => {
    if (content.trim()) {
      postMutation.mutate({ content: content.trim() });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {userAvatar ? (
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
        )}
        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder={placeholder}
          multiline
          placeholderTextColor="#9ca3af"
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onAddImage}>
            <Ionicons name="image" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onAddVideo}>
            <Ionicons name="videocam" size={24} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="happy" size={24} color="#f59e0b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="location" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.postButton, (!content.trim() || postMutation.isPending) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={!content.trim() || postMutation.isPending}
        >
          {postMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
  postButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Social Post Card
export function generateRNSocialPostCard(resolved: ResolvedComponent, variant: string = 'minimal') {
  const dataSource = resolved?.dataSource;
  const entity = dataSource?.split('.').pop() || 'posts';

  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SocialPostCardProps {
  postId?: string;
  author: { name: string; avatar?: string; username?: string };
  content: string;
  timestamp?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  images?: string[];
  isLiked?: boolean;
  entity?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onProfile?: () => void;
}

export default function SocialPostCard({
  postId,
  author,
  content,
  timestamp,
  likes = 0,
  comments = 0,
  shares = 0,
  images,
  isLiked = false,
  entity = '${entity}',
  onLike,
  onComment,
  onShare,
  onProfile
}: SocialPostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async (data: { postId: string; action: 'like' | 'unlike' }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/\${entity}/\${data.postId}/\${data.action}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(\`Failed to \${data.action} post\`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
    onError: (error: any) => {
      // Revert optimistic update on error
      setLiked(!liked);
      setLikeCount(liked ? likeCount + 1 : likeCount - 1);
      Alert.alert('Error', error?.message || 'Failed to update like');
    },
  });

  const handleLike = () => {
    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(newLiked ? likeCount + 1 : likeCount - 1);

    if (postId) {
      likeMutation.mutate({ postId, action: newLiked ? 'like' : 'unlike' });
    }
    onLike?.();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onProfile}>
        {author.avatar ? (
          <Image source={{ uri: author.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{author.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{author.name}</Text>
          {author.username && <Text style={styles.username}>@{author.username}</Text>}
          {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#6b7280" />
        </TouchableOpacity>
      </TouchableOpacity>

      <Text style={styles.content}>{content}</Text>

      {images && images.length > 0 && (
        <View style={styles.imagesContainer}>
          {images.slice(0, 4).map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.postImage} />
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? '#ef4444' : '#6b7280'} />
          <Text style={[styles.actionText, liked && styles.likedText]}>{likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={22} color="#6b7280" />
          <Text style={styles.actionText}>{comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={22} color="#6b7280" />
          <Text style={styles.actionText}>{shares}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={22} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  username: {
    fontSize: 14,
    color: '#6b7280',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  content: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  postImage: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  likedText: {
    color: '#ef4444',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Social Media Feed
export function generateRNSocialMediaFeed(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';

interface Post {
  id: string;
  author: { name: string; avatar?: string };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
}

interface SocialMediaFeedProps {
  posts: Post[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  renderPost?: (post: Post) => React.ReactNode;
}

export default function SocialMediaFeed({ posts, isLoading, onRefresh, onLoadMore, renderPost }: SocialMediaFeedProps) {
  const defaultRenderPost = (post: Post) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.author.name.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.authorName}>{post.author.name}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
      </View>
      <Text style={styles.content}>{post.content}</Text>
      <View style={styles.stats}>
        <Text style={styles.statText}>{post.likes} likes</Text>
        <Text style={styles.statText}>{post.comments} comments</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => renderPost ? renderPost(item) : defaultRenderPost(item)}
      refreshControl={
        <RefreshControl refreshing={isLoading || false} onRefresh={onRefresh} />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={styles.container}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No posts yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  content: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 13,
    color: '#6b7280',
  },
  separator: {
    height: 8,
    backgroundColor: '#f3f4f6',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';"],
  };
}

// Activity Feed
export function generateRNActivityFeed(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'share' | 'mention';
  user: { name: string; avatar?: string };
  content?: string;
  timestamp: string;
  isRead?: boolean;
}

interface ActivityFeedProps {
  activities: Activity[];
  onItemPress?: (activity: Activity) => void;
}

export default function ActivityFeed({ activities, onItemPress }: ActivityFeedProps) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'like': return { name: 'heart', color: '#ef4444' };
      case 'comment': return { name: 'chatbubble', color: '#3b82f6' };
      case 'follow': return { name: 'person-add', color: '#10b981' };
      case 'share': return { name: 'share', color: '#8b5cf6' };
      case 'mention': return { name: 'at', color: '#f59e0b' };
      default: return { name: 'notifications', color: '#6b7280' };
    }
  };

  const getMessage = (activity: Activity) => {
    switch (activity.type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'follow': return 'started following you';
      case 'share': return 'shared your post';
      case 'mention': return 'mentioned you';
      default: return 'interacted with you';
    }
  };

  const renderItem = ({ item }: { item: Activity }) => {
    const icon = getIcon(item.type);
    return (
      <View style={[styles.item, !item.isRead && styles.unread]}>
        <View style={[styles.iconCircle, { backgroundColor: icon.color + '20' }]}>
          <Ionicons name={icon.name as any} size={18} color={icon.color} />
        </View>
        <View style={styles.content}>
          <Text style={styles.message}>
            <Text style={styles.userName}>{item.user.name}</Text> {getMessage(item)}
          </Text>
          {item.content && <Text style={styles.excerpt} numberOfLines={1}>{item.content}</Text>}
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        {item.user.avatar && (
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No activity yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  unread: {
    backgroundColor: '#eff6ff',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  message: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  userName: {
    fontWeight: '600',
    color: '#111827',
  },
  excerpt: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 12,
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, StyleSheet, Image } from 'react-native';"],
  };
}

// Activity Timeline Social
export function generateRNActivityTimelineSocial(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNActivityFeed(resolved, variant);
}

// Like Reaction Buttons
export function generateRNLikeReactionButtons(resolved: ResolvedComponent, variant: string = 'minimal') {
  const dataSource = resolved?.dataSource;
  const entity = dataSource?.split('.').pop() || 'reactions';

  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Reaction {
  id: string;
  emoji: string;
  label: string;
  count: number;
}

interface LikeReactionButtonsProps {
  postId?: string;
  reactions?: Reaction[];
  selectedReaction?: string;
  entity?: string;
  onReact?: (reactionId: string) => void;
  onSuccess?: (data: any) => void;
}

const defaultReactions: Reaction[] = [
  { id: 'like', emoji: '👍', label: 'Like', count: 0 },
  { id: 'love', emoji: '❤️', label: 'Love', count: 0 },
  { id: 'haha', emoji: '😂', label: 'Haha', count: 0 },
  { id: 'wow', emoji: '😮', label: 'Wow', count: 0 },
  { id: 'sad', emoji: '😢', label: 'Sad', count: 0 },
  { id: 'angry', emoji: '😠', label: 'Angry', count: 0 },
];

export default function LikeReactionButtons({
  postId,
  reactions = defaultReactions,
  selectedReaction,
  entity = '${entity}',
  onReact,
  onSuccess
}: LikeReactionButtonsProps) {
  const [selected, setSelected] = useState(selectedReaction);
  const [showPicker, setShowPicker] = useState(false);
  const queryClient = useQueryClient();

  const reactionMutation = useMutation({
    mutationFn: async (data: { postId: string; reactionId: string | null }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/\${entity}/\${data.postId}/react\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction: data.reactionId }),
      });
      if (!response.ok) throw new Error('Failed to add reaction');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any, variables) => {
      // Revert optimistic update
      setSelected(selectedReaction);
      Alert.alert('Error', error?.message || 'Failed to add reaction');
    },
  });

  const handleReact = (id: string) => {
    const newSelected = selected === id ? undefined : id;
    // Optimistic update
    setSelected(newSelected);
    setShowPicker(false);

    if (postId) {
      reactionMutation.mutate({ postId, reactionId: newSelected || null });
    }
    onReact?.(id);
  };

  const selectedEmoji = reactions.find(r => r.id === selected)?.emoji || '👍';

  return (
    <View style={styles.container}>
      {showPicker && (
        <View style={styles.picker}>
          {reactions.map((reaction) => (
            <TouchableOpacity
              key={reaction.id}
              style={[styles.reactionOption, selected === reaction.id && styles.reactionSelected]}
              onPress={() => handleReact(reaction.id)}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.mainButton, selected && styles.mainButtonActive]}
        onPress={() => selected ? handleReact(selected) : setShowPicker(!showPicker)}
        onLongPress={() => setShowPicker(true)}
      >
        <Text style={styles.mainButtonEmoji}>{selectedEmoji}</Text>
        <Text style={[styles.mainButtonText, selected && styles.mainButtonTextActive]}>
          {selected ? reactions.find(r => r.id === selected)?.label : 'Like'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  picker: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  reactionOption: {
    padding: 8,
    borderRadius: 20,
  },
  reactionSelected: {
    backgroundColor: '#eff6ff',
  },
  reactionEmoji: {
    fontSize: 24,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 6,
  },
  mainButtonActive: {
    opacity: 1,
  },
  mainButtonEmoji: {
    fontSize: 20,
  },
  mainButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  mainButtonTextActive: {
    color: '#3b82f6',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Share Buttons
export function generateRNShareButtons(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share as RNShare } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareButtonsProps {
  url?: string;
  title?: string;
  message?: string;
  onShare?: (platform: string) => void;
}

export default function ShareButtons({ url, title, message, onShare }: ShareButtonsProps) {
  const handleNativeShare = async () => {
    try {
      await RNShare.share({
        title: title,
        message: message || url,
        url: url,
      });
      onShare?.('native');
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const platforms = [
    { id: 'twitter', icon: 'logo-twitter', color: '#1da1f2', label: 'Twitter' },
    { id: 'facebook', icon: 'logo-facebook', color: '#1877f2', label: 'Facebook' },
    { id: 'linkedin', icon: 'logo-linkedin', color: '#0077b5', label: 'LinkedIn' },
    { id: 'whatsapp', icon: 'logo-whatsapp', color: '#25d366', label: 'WhatsApp' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share</Text>

      <View style={styles.platforms}>
        {platforms.map((platform) => (
          <TouchableOpacity
            key={platform.id}
            style={styles.platformButton}
            onPress={() => onShare?.(platform.id)}
          >
            <View style={[styles.iconCircle, { backgroundColor: platform.color }]}>
              <Ionicons name={platform.icon as any} size={24} color="#fff" />
            </View>
            <Text style={styles.platformLabel}>{platform.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.nativeShareButton} onPress={handleNativeShare}>
        <Ionicons name="share-outline" size={20} color="#fff" />
        <Text style={styles.nativeShareText}>More Options</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  platforms: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  platformButton: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  platformLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  nativeShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  nativeShareText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Share as RNShare } from 'react-native';"],
  };
}

// Share Modal Social
export function generateRNShareModalSocial(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Share as RNShare } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareModalSocialProps {
  visible: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
  onShare?: (platform: string) => void;
}

export default function ShareModalSocial({ visible, onClose, url, title, onShare }: ShareModalSocialProps) {
  const platforms = [
    { id: 'copy', icon: 'copy', color: '#6b7280', label: 'Copy Link' },
    { id: 'message', icon: 'chatbubble', color: '#10b981', label: 'Message' },
    { id: 'email', icon: 'mail', color: '#3b82f6', label: 'Email' },
    { id: 'twitter', icon: 'logo-twitter', color: '#1da1f2', label: 'Twitter' },
    { id: 'facebook', icon: 'logo-facebook', color: '#1877f2', label: 'Facebook' },
    { id: 'whatsapp', icon: 'logo-whatsapp', color: '#25d366', label: 'WhatsApp' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.modal}>
          <View style={styles.handle} />
          <Text style={styles.title}>Share</Text>

          <View style={styles.grid}>
            {platforms.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                style={styles.option}
                onPress={() => {
                  onShare?.(platform.id);
                  onClose();
                }}
              >
                <View style={[styles.iconCircle, { backgroundColor: platform.color }]}>
                  <Ionicons name={platform.icon as any} size={24} color="#fff" />
                </View>
                <Text style={styles.optionLabel}>{platform.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  option: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';"],
  };
}

// Follow Unfollow Button
export function generateRNFollowUnfollowButton(resolved: ResolvedComponent, variant: string = 'minimal') {
  const dataSource = resolved?.dataSource;
  const entity = dataSource?.split('.').pop() || 'users';

  return {
    code: `import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FollowUnfollowButtonProps {
  userId?: string;
  isFollowing?: boolean;
  entity?: string;
  onFollow?: () => Promise<void>;
  onUnfollow?: () => Promise<void>;
  onSuccess?: (data: any) => void;
  size?: 'small' | 'medium' | 'large';
}

export default function FollowUnfollowButton({
  userId,
  isFollowing = false,
  entity = '${entity}',
  onFollow,
  onUnfollow,
  onSuccess,
  size = 'medium'
}: FollowUnfollowButtonProps) {
  const [following, setFollowing] = useState(isFollowing);
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async (data: { userId: string; action: 'follow' | 'unfollow' }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const response = await fetch(\`\${apiUrl}/\${entity}/\${data.userId}/\${data.action}\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(\`Failed to \${data.action}\`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      // Revert optimistic update on error
      setFollowing(!following);
      Alert.alert('Error', error?.message || 'Follow action failed');
    },
  });

  const handlePress = async () => {
    // Optimistic update
    const newFollowing = !following;
    setFollowing(newFollowing);

    if (userId) {
      followMutation.mutate({ userId, action: newFollowing ? 'follow' : 'unfollow' });
    } else {
      // Fallback to callback props if no userId
      try {
        if (newFollowing) {
          await onFollow?.();
        } else {
          await onUnfollow?.();
        }
      } catch (error) {
        setFollowing(!newFollowing);
        console.error('Follow action failed:', error);
      }
    }
  };

  const loading = followMutation.isPending;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 6, paddingHorizontal: 12, fontSize: 12 };
      case 'large':
        return { paddingVertical: 14, paddingHorizontal: 28, fontSize: 16 };
      default:
        return { paddingVertical: 10, paddingHorizontal: 20, fontSize: 14 };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        following ? styles.followingButton : styles.followButton,
        { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal }
      ]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={following ? '#3b82f6' : '#fff'} />
      ) : (
        <>
          {following && <Ionicons name="checkmark" size={16} color="#3b82f6" />}
          <Text style={[
            styles.buttonText,
            following ? styles.followingText : styles.followText,
            { fontSize: sizeStyles.fontSize }
          ]}>
            {following ? 'Following' : 'Follow'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    gap: 4,
    minWidth: 100,
  },
  followButton: {
    backgroundColor: '#3b82f6',
  },
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonText: {
    fontWeight: '600',
  },
  followText: {
    color: '#fff',
  },
  followingText: {
    color: '#3b82f6',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';"],
  };
}

// Friend Connection List
export function generateRNFriendConnectionList(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  mutualFriends?: number;
  isOnline?: boolean;
}

interface FriendConnectionListProps {
  friends: Friend[];
  onPress?: (friend: Friend) => void;
  onMessage?: (friend: Friend) => void;
}

export default function FriendConnectionList({ friends, onPress, onMessage }: FriendConnectionListProps) {
  const renderItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity style={styles.item} onPress={() => onPress?.(item)}>
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
        )}
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        {item.mutualFriends !== undefined && (
          <Text style={styles.mutualText}>{item.mutualFriends} mutual friends</Text>
        )}
      </View>

      <TouchableOpacity style={styles.messageButton} onPress={() => onMessage?.(item)}>
        <Ionicons name="chatbubble" size={20} color="#3b82f6" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="people" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No connections yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  mutualText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Direct Messaging List
export function generateRNDirectMessagingList(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';

interface Conversation {
  id: string;
  user: { name: string; avatar?: string; isOnline?: boolean };
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
}

interface DirectMessagingListProps {
  conversations: Conversation[];
  onPress?: (conversation: Conversation) => void;
}

export default function DirectMessagingList({ conversations, onPress }: DirectMessagingListProps) {
  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.item} onPress={() => onPress?.(item)}>
      <View style={styles.avatarContainer}>
        {item.user.avatar ? (
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.user.name.charAt(0)}</Text>
          </View>
        )}
        {item.user.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{item.user.name}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={[styles.message, item.unreadCount && styles.unreadMessage]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount !== undefined && item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatarContainer: {
    position: 'relative',
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
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
  },
  unreadMessage: {
    color: '#111827',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';"],
  };
}

// Direct Messaging Thread
export function generateRNDirectMessagingThread(resolved: ResolvedComponent, variant: string = 'minimal') {
  const dataSource = resolved?.dataSource;
  const entity = dataSource?.split('.').pop() || 'messages';

  return {
    code: `import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
}

interface DirectMessagingThreadProps {
  conversationId?: string;
  messages: Message[];
  entity?: string;
  onSend?: (text: string) => void;
  onSubmit?: (data: any) => void;
}

export default function DirectMessagingThread({ conversationId, messages, entity = '${entity}', onSend, onSubmit }: DirectMessagingThreadProps) {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: async (data: { conversationId?: string; text: string }) => {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
      const endpoint = data.conversationId
        ? \`\${apiUrl}/\${entity}/\${data.conversationId}\`
        : \`\${apiUrl}/\${entity}\`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: data.text }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [entity] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setText('');
      if (onSubmit) onSubmit(data);
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to send message');
    },
  });

  const handleSend = () => {
    if (text.trim()) {
      sendMutation.mutate({ conversationId, text: text.trim() });
      onSend?.(text);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === 'me' ? styles.myMessage : styles.otherMessage]}>
      <View style={[styles.bubble, item.sender === 'me' ? styles.myBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, item.sender === 'me' && styles.myMessageText]}>{item.text}</Text>
      </View>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        inverted
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons name="add-circle" size={28} color="#3b82f6" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || sendMutation.isPending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color={text.trim() ? '#fff' : '#9ca3af'} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  attachButton: {
    marginRight: 8,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';", "import { useMutation, useQueryClient } from '@tanstack/react-query';"],
  };
}

// Group Chat Interface
export function generateRNGroupChatInterface(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNDirectMessagingThread(resolved, variant);
}

// Mentions Tags System
export function generateRNMentionsTagsSystem(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

interface User {
  id: string;
  name: string;
  username: string;
}

interface MentionsTagsSystemProps {
  users: User[];
  onMention?: (user: User) => void;
  value?: string;
  onChangeText?: (text: string) => void;
}

export default function MentionsTagsSystem({ users, onMention, value, onChangeText }: MentionsTagsSystemProps) {
  const [text, setText] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onChangeText?.(newText);

    const lastWord = newText.split(' ').pop() || '';
    if (lastWord.startsWith('@')) {
      const query = lastWord.slice(1).toLowerCase();
      const filtered = users.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query)
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectUser = (user: User) => {
    const words = text.split(' ');
    words.pop();
    const newText = [...words, \`@\${user.username} \`].join(' ');
    setText(newText);
    onChangeText?.(newText);
    setShowSuggestions(false);
    onMention?.(user);
  };

  return (
    <View style={styles.container}>
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectUser(item)}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.username}>@{item.username}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleTextChange}
        placeholder="Type @ to mention someone..."
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  username: {
    fontSize: 12,
    color: '#6b7280',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';"],
  };
}

// Hashtag Display
export function generateRNHashtagDisplay(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface HashtagDisplayProps {
  hashtags: string[];
  onPress?: (hashtag: string) => void;
  size?: 'small' | 'medium' | 'large';
}

export default function HashtagDisplay({ hashtags, onPress, size = 'medium' }: HashtagDisplayProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { fontSize: 12, padding: 6, paddingHorizontal: 10 };
      case 'large':
        return { fontSize: 16, padding: 10, paddingHorizontal: 16 };
      default:
        return { fontSize: 14, padding: 8, paddingHorizontal: 14 };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {hashtags.map((hashtag, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.tag, { padding: sizeStyles.padding, paddingHorizontal: sizeStyles.paddingHorizontal }]}
          onPress={() => onPress?.(hashtag)}
        >
          <Text style={[styles.tagText, { fontSize: sizeStyles.fontSize }]}>
            #{hashtag}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
    gap: 8,
  },
  tag: {
    backgroundColor: '#eff6ff',
    borderRadius: 20,
  },
  tagText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Notification Dropdown Social
export function generateRNNotificationDropdownSocial(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNActivityFeed(resolved, variant);
}
