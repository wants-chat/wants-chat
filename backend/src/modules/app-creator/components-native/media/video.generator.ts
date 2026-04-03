/**
 * Video Component Generators (React Native)
 *
 * Generates video card and video comments components for React Native.
 */

export interface VideoOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateVideoCard(options: VideoOptions = {}): string {
  const { componentName = 'VideoCard' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Video {
  id: string;
  title: string;
  thumbnail_url?: string;
  channel_name?: string;
  channel_avatar_url?: string;
  channel_verified?: boolean;
  duration?: string;
  views?: number;
  likes?: number;
  published_at?: string;
}

interface ${componentName}Props {
  video: Video;
  layout?: 'grid' | 'list' | 'compact';
  onPlay?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ video, layout = 'grid', onPlay }) => {
  const navigation = useNavigation<any>();

  const formatViews = (views: number) => {
    if (views >= 1000000) return \`\${(views / 1000000).toFixed(1)}M\`;
    if (views >= 1000) return \`\${(views / 1000).toFixed(1)}K\`;
    return views.toString();
  };

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 1) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return \`\${days} days ago\`;
    if (days < 30) return \`\${Math.floor(days / 7)} weeks ago\`;
    if (days < 365) return \`\${Math.floor(days / 30)} months ago\`;
    return \`\${Math.floor(days / 365)} years ago\`;
  };

  const handlePress = () => {
    if (onPlay) {
      onPlay();
    } else {
      navigation.navigate('VideoDetail', { id: video.id });
    }
  };

  if (layout === 'compact') {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.compactThumbnail}>
          {video.thumbnail_url ? (
            <Image source={{ uri: video.thumbnail_url }} style={styles.compactImage} />
          ) : (
            <View style={styles.compactImagePlaceholder}>
              <Ionicons name="play" size={24} color="#9CA3AF" />
            </View>
          )}
          {video.duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
          )}
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles.compactMeta}>{video.channel_name}</Text>
          <View style={styles.compactStats}>
            {video.views !== undefined && (
              <Text style={styles.compactStatText}>{formatViews(video.views)} views</Text>
            )}
            {video.published_at && (
              <Text style={styles.compactStatText}>{formatDate(video.published_at)}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (layout === 'list') {
    return (
      <TouchableOpacity style={styles.listContainer} onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.listThumbnail}>
          {video.thumbnail_url ? (
            <Image source={{ uri: video.thumbnail_url }} style={styles.listImage} />
          ) : (
            <View style={styles.listImagePlaceholder}>
              <Ionicons name="play" size={32} color="#9CA3AF" />
            </View>
          )}
          {video.duration && (
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{video.duration}</Text>
            </View>
          )}
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 2 }} />
            </View>
          </View>
        </View>
        <View style={styles.listInfo}>
          <Text style={styles.listTitle} numberOfLines={2}>
            {video.title}
          </Text>
          <View style={styles.channelRow}>
            {video.channel_avatar_url ? (
              <Image source={{ uri: video.channel_avatar_url }} style={styles.channelAvatar} />
            ) : (
              <View style={styles.channelAvatarPlaceholder} />
            )}
            <Text style={styles.channelName}>{video.channel_name}</Text>
            {video.channel_verified && (
              <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
            )}
          </View>
          <View style={styles.listStats}>
            {video.views !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={14} color="#6B7280" />
                <Text style={styles.statText}>{formatViews(video.views)} views</Text>
              </View>
            )}
            {video.likes !== undefined && (
              <View style={styles.statItem}>
                <Ionicons name="thumbs-up-outline" size={14} color="#6B7280" />
                <Text style={styles.statText}>{formatViews(video.likes)}</Text>
              </View>
            )}
            {video.published_at && (
              <Text style={styles.statText}>{formatDate(video.published_at)}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // Grid layout (default)
  return (
    <TouchableOpacity style={styles.gridContainer} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.gridThumbnail}>
        {video.thumbnail_url ? (
          <Image source={{ uri: video.thumbnail_url }} style={styles.gridImage} />
        ) : (
          <View style={styles.gridImagePlaceholder}>
            <Ionicons name="play" size={40} color="#9CA3AF" />
          </View>
        )}
        {video.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        )}
        <View style={styles.playOverlay}>
          <View style={styles.playButtonLarge}>
            <Ionicons name="play" size={28} color="#FFFFFF" style={{ marginLeft: 2 }} />
          </View>
        </View>
      </View>
      <View style={styles.gridInfo}>
        <View style={styles.gridInfoContent}>
          {video.channel_avatar_url ? (
            <Image source={{ uri: video.channel_avatar_url }} style={styles.gridChannelAvatar} />
          ) : (
            <View style={styles.gridChannelAvatarPlaceholder} />
          )}
          <View style={styles.gridTextContainer}>
            <Text style={styles.gridTitle} numberOfLines={2}>
              {video.title}
            </Text>
            <View style={styles.gridChannelRow}>
              <Text style={styles.gridChannelName}>{video.channel_name}</Text>
              {video.channel_verified && (
                <Ionicons name="checkmark-circle" size={12} color="#3B82F6" />
              )}
            </View>
            <View style={styles.gridStats}>
              {video.views !== undefined && (
                <Text style={styles.gridStatText}>{formatViews(video.views)} views</Text>
              )}
              {video.published_at && (
                <>
                  <Text style={styles.gridStatDot}>-</Text>
                  <Text style={styles.gridStatText}>{formatDate(video.published_at)}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Compact layout
  compactContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  compactThumbnail: {
    width: 160,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactInfo: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 18,
  },
  compactMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  compactStats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  compactStatText: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  // List layout
  listContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listThumbnail: {
    width: SCREEN_WIDTH * 0.4,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
    paddingVertical: 4,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  channelAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  channelAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  channelName: {
    fontSize: 13,
    color: '#6B7280',
  },
  listStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
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
  moreButton: {
    padding: 4,
  },

  // Grid layout
  gridContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridThumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridInfo: {
    padding: 12,
  },
  gridInfoContent: {
    flexDirection: 'row',
    gap: 12,
  },
  gridChannelAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  gridChannelAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  gridTextContainer: {
    flex: 1,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  gridChannelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  gridChannelName: {
    fontSize: 13,
    color: '#6B7280',
  },
  gridStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  gridStatText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  gridStatDot: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 4,
  },

  // Shared
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ${componentName};
`;
}

export function generateVideoComments(options: VideoOptions = {}): string {
  const { componentName = 'VideoComments', endpoint = '/videos' } = options;

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
  videoId: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ videoId }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['video-comments', videoId, sortBy],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${videoId}/comments?sort=\${sortBy}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(\`${endpoint}/\${videoId}/comments\`, { content });
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-comments', videoId] });
      setNewComment('');
      Alert.alert('Success', 'Comment added!');
    },
    onError: () => Alert.alert('Error', 'Failed to add comment'),
  });

  const addReplyMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const response = await api.post(\`${endpoint}/\${videoId}/comments/\${commentId}/replies\`, { content });
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-comments', videoId] });
      setReplyTo(null);
      setReplyText('');
    },
    onError: () => Alert.alert('Error', 'Failed to add reply'),
  });

  const likeMutation = useMutation({
    mutationFn: async ({ commentId, type }: { commentId: string; type: 'like' | 'dislike' }) => {
      const response = await api.post(\`${endpoint}/\${videoId}/comments/\${commentId}/\${type}\`, {});
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-comments', videoId] });
    },
  });

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return \`\${mins}m ago\`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return \`\${hours}h ago\`;
    const days = Math.floor(hours / 24);
    if (days < 30) return \`\${days}d ago\`;
    return new Date(date).toLocaleDateString();
  };

  const renderComment = ({ item: comment }: { item: any }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        {comment.user_avatar_url ? (
          <Image source={{ uri: comment.user_avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {(comment.user_name || '?').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.commentContent}>
          <View style={styles.commentMeta}>
            <Text style={styles.userName}>{comment.user_name}</Text>
            <Text style={styles.commentTime}>{formatTimeAgo(comment.created_at)}</Text>
            {comment.edited && <Text style={styles.editedLabel}>(edited)</Text>}
          </View>
          <Text style={styles.commentText}>{comment.content}</Text>

          <View style={styles.commentActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => likeMutation.mutate({ commentId: comment.id, type: 'like' })}
            >
              <Ionicons
                name={comment.user_liked ? 'thumbs-up' : 'thumbs-up-outline'}
                size={16}
                color={comment.user_liked ? '#9333EA' : '#6B7280'}
              />
              <Text style={[styles.actionText, comment.user_liked && styles.actionTextActive]}>
                {comment.likes || 0}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => likeMutation.mutate({ commentId: comment.id, type: 'dislike' })}
            >
              <Ionicons
                name={comment.user_disliked ? 'thumbs-down' : 'thumbs-down-outline'}
                size={16}
                color={comment.user_disliked ? '#9333EA' : '#6B7280'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            >
              <Text style={styles.replyText}>Reply</Text>
            </TouchableOpacity>
          </View>

          {/* Reply Form */}
          {replyTo === comment.id && (
            <View style={styles.replyForm}>
              <TextInput
                style={styles.replyInput}
                value={replyText}
                onChangeText={setReplyText}
                placeholder="Add a reply..."
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
              <View style={styles.replyActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setReplyTo(null);
                    setReplyText('');
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.replyButton, !replyText.trim() && styles.replyButtonDisabled]}
                  disabled={!replyText.trim() || addReplyMutation.isPending}
                  onPress={() => addReplyMutation.mutate({ commentId: comment.id, content: replyText.trim() })}
                >
                  {addReplyMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.replyButtonText}>Reply</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Replies */}
          {comment.reply_count > 0 && (
            <TouchableOpacity
              style={styles.viewRepliesButton}
              onPress={() => toggleReplies(comment.id)}
            >
              <Ionicons
                name={expandedReplies.has(comment.id) ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#9333EA"
              />
              <Text style={styles.viewRepliesText}>
                {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
              </Text>
            </TouchableOpacity>
          )}

          {expandedReplies.has(comment.id) && comment.replies && (
            <View style={styles.repliesList}>
              {comment.replies.map((reply: any) => (
                <View key={reply.id} style={styles.replyItem}>
                  {reply.user_avatar_url ? (
                    <Image source={{ uri: reply.user_avatar_url }} style={styles.replyAvatar} />
                  ) : (
                    <View style={styles.replyAvatarPlaceholder}>
                      <Text style={styles.replyAvatarInitial}>
                        {(reply.user_name || '?').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.replyContent}>
                    <View style={styles.replyMeta}>
                      <Text style={styles.replyUserName}>{reply.user_name}</Text>
                      <Text style={styles.replyTime}>{formatTimeAgo(reply.created_at)}</Text>
                    </View>
                    <Text style={styles.replyTextContent}>{reply.content}</Text>
                    <View style={styles.replyItemActions}>
                      <TouchableOpacity style={styles.replyActionButton}>
                        <Ionicons name="thumbs-up-outline" size={14} color="#6B7280" />
                        <Text style={styles.replyActionText}>{reply.likes || 0}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.replyActionButton}>
                        <Ionicons name="thumbs-down-outline" size={14} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{comments?.length || 0} Comments</Text>
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setSortBy(sortBy === 'top' ? 'newest' : 'top')}
          >
            <Ionicons name="swap-vertical" size={16} color="#6B7280" />
            <Text style={styles.sortText}>{sortBy === 'top' ? 'Top' : 'Newest'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Comment Form */}
      <View style={styles.addCommentForm}>
        <View style={styles.inputAvatar}>
          <Ionicons name="chatbubble" size={20} color="#9333EA" />
        </View>
        <TextInput
          style={styles.addCommentInput}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          placeholderTextColor="#9CA3AF"
        />
        {newComment.trim() && (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => addCommentMutation.mutate(newComment.trim())}
            disabled={addCommentMutation.isPending}
          >
            {addCommentMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Comments List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B7280" />
        </View>
      ) : comments && comments.length > 0 ? (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  sortText: {
    fontSize: 14,
    color: '#6B7280',
  },
  addCommentForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  inputAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCommentInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    fontSize: 14,
    color: '#111827',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  commentItem: {
    marginBottom: 20,
  },
  commentHeader: {
    flexDirection: 'row',
    gap: 12,
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
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  commentContent: {
    flex: 1,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  commentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  editedLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginTop: 4,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
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
  actionTextActive: {
    color: '#9333EA',
  },
  replyText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  replyForm: {
    marginTop: 12,
  },
  replyInput: {
    height: 36,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    fontSize: 13,
    color: '#111827',
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 13,
    color: '#6B7280',
  },
  replyButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#9333EA',
    borderRadius: 16,
  },
  replyButtonDisabled: {
    opacity: 0.5,
  },
  replyButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  viewRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  viewRepliesText: {
    fontSize: 13,
    color: '#9333EA',
    fontWeight: '500',
  },
  repliesList: {
    marginTop: 12,
  },
  replyItem: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
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
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyAvatarInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  replyContent: {
    flex: 1,
  },
  replyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  replyUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  replyTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  replyTextContent: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginTop: 2,
  },
  replyItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  replyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyActionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}
