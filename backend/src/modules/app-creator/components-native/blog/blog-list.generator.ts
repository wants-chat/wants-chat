/**
 * Blog List Generator for App Creator (React Native)
 *
 * Generates blog/post list components with:
 * - FlatList with pull-to-refresh
 * - Featured posts horizontal scroll
 * - Category badges
 * - Author info and date
 * - Read more navigation
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';

export interface BlogListOptions {
  componentName?: string;
  entity?: string;
  title?: string;
  limit?: number;
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showCategory?: boolean;
  showDate?: boolean;
  showReadTime?: boolean;
  endpoint?: string;
  queryKey?: string;
  detailScreen?: string;
}

export interface FeaturedPostsOptions {
  componentName?: string;
  entity?: string;
  title?: string;
  limit?: number;
  showCategory?: boolean;
  showAuthor?: boolean;
  endpoint?: string;
  queryKey?: string;
  detailScreen?: string;
}

/**
 * Generate a blog list component with FlatList and pull-to-refresh
 */
export function generateBlogList(options: BlogListOptions = {}): string {
  const {
    entity = 'post',
    title = 'Latest Posts',
    limit,
    showExcerpt = true,
    showAuthor = true,
    showCategory = true,
    showDate = true,
    showReadTime = true,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || `${pascalCase(entity)}List`;
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;
  const detailScreen = options.detailScreen || `${pascalCase(entity)}Detail`;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  data?: any[];
  title?: string;
  onPostPress?: (post: any) => void;
  limit?: number;
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showCategory?: boolean;
  showDate?: boolean;
  showReadTime?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  title = '${title}',
  onPostPress,
  limit${limit ? ` = ${limit}` : ''},
  showExcerpt = ${showExcerpt},
  showAuthor = ${showAuthor},
  showCategory = ${showCategory},
  showDate = ${showDate},
  showReadTime = ${showReadTime},
}) => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: fetchedData, isLoading, error, refetch } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch ${tableName}:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  let posts = propData && propData.length > 0 ? propData : (fetchedData || []);
  if (limit && posts.length > limit) {
    posts = posts.slice(0, limit);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handlePostPress = (post: any) => {
    if (onPostPress) {
      onPostPress(post);
    } else {
      const id = post.slug || post.id || post._id;
      navigation.navigate('${detailScreen}', { id });
    }
  };

  const getPostImage = (post: any): string | null => {
    return post.featured_image || post.image_url || post.image || post.cover_image || null;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getReadTime = (content: string): number => {
    if (!content) return 1;
    const words = content.split(/\\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const renderPost = ({ item: post }: { item: any }) => {
    const postId = post.id || post._id;
    const postTitle = post.title || 'Untitled';
    const excerpt = post.excerpt || post.description || (post.content?.substring(0, 150) + '...');
    const image = getPostImage(post);
    const authorName = post.author?.name || post.author_name || 'Anonymous';
    const authorAvatar = post.author?.avatar_url || post.author_avatar;
    const categoryName = post.category?.name || post.category_name;
    const date = post.published_at || post.created_at;
    const readTime = getReadTime(post.content);

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => handlePostPress(post)}
        activeOpacity={0.7}
      >
        {/* Featured Image */}
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.postImage} />
            {showCategory && categoryName && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{categoryName}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
            {showCategory && categoryName && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{categoryName}</Text>
              </View>
            )}
          </View>
        )}

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.postTitle} numberOfLines={2}>
            {postTitle}
          </Text>

          {showExcerpt && excerpt && (
            <Text style={styles.excerpt} numberOfLines={2}>
              {excerpt}
            </Text>
          )}

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            {showAuthor && (
              <View style={styles.authorContainer}>
                {authorAvatar ? (
                  <Image source={{ uri: authorAvatar }} style={styles.authorAvatar} />
                ) : (
                  <View style={styles.authorAvatarPlaceholder}>
                    <Text style={styles.authorInitial}>
                      {authorName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.authorName}>{authorName}</Text>
              </View>
            )}

            <View style={styles.metaRight}>
              {showDate && date && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{formatDate(date)}</Text>
                </View>
              )}

              {showReadTime && (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{readTime} min</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Read More Arrow */}
        <View style={styles.readMoreContainer}>
          <Ionicons name="chevron-forward-outline" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    if (!title) return null;
    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No posts found</Text>
      <Text style={styles.emptyText}>Check back later for new content.</Text>
    </View>
  );

  if (isLoading && !propData) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </View>
    );
  }

  if (error && !propData) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.errorText}>Failed to load posts</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => String(item.id || item._id || item.slug)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  imageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  excerpt: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  authorAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  authorInitial: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authorName: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  readMoreContainer: {
    justifyContent: 'center',
    paddingRight: 8,
  },
  separator: {
    height: 12,
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
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

/**
 * Generate a featured posts horizontal scroll component
 */
export function generateFeaturedPosts(options: FeaturedPostsOptions = {}): string {
  const {
    entity = 'post',
    title = 'Featured Posts',
    limit = 5,
    showCategory = true,
    showAuthor = true,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || `Featured${pascalCase(pluralize.plural(entity))}`;
  const endpoint = options.endpoint || '/' + tableName + '?featured=true';
  const queryKey = options.queryKey || `featured_${tableName}`;
  const detailScreen = options.detailScreen || `${pascalCase(entity)}Detail`;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_MARGIN = 12;

interface ${componentName}Props {
  data?: any[];
  title?: string;
  onPostPress?: (post: any) => void;
  limit?: number;
  showCategory?: boolean;
  showAuthor?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  title = '${title}',
  onPostPress,
  limit = ${limit},
  showCategory = ${showCategory},
  showAuthor = ${showAuthor},
}) => {
  const navigation = useNavigation<any>();

  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch featured ${tableName}:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  let posts = propData && propData.length > 0 ? propData : (fetchedData || []);
  if (limit && posts.length > limit) {
    posts = posts.slice(0, limit);
  }

  const handlePostPress = (post: any) => {
    if (onPostPress) {
      onPostPress(post);
    } else {
      const id = post.slug || post.id || post._id;
      navigation.navigate('${detailScreen}', { id });
    }
  };

  const getPostImage = (post: any): string | null => {
    return post.featured_image || post.image_url || post.image || post.cover_image || null;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getReadTime = (content: string): number => {
    if (!content) return 1;
    const words = content.split(/\\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (isLoading && !propData) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      </View>
    );
  }

  if (error && !propData) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load featured posts</Text>
        </View>
      </View>
    );
  }

  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        snapToAlignment="start"
      >
        {posts.map((post: any, index: number) => {
          const postId = post.id || post._id;
          const postTitle = post.title || 'Untitled';
          const excerpt = post.excerpt || post.description || '';
          const image = getPostImage(post);
          const authorName = post.author?.name || post.author_name || 'Anonymous';
          const authorAvatar = post.author?.avatar_url || post.author_avatar;
          const categoryName = post.category?.name || post.category_name;
          const date = post.published_at || post.created_at;
          const readTime = getReadTime(post.content);

          return (
            <TouchableOpacity
              key={postId || index}
              style={[
                styles.featuredCard,
                { marginRight: index === posts.length - 1 ? 16 : CARD_MARGIN },
              ]}
              onPress={() => handlePostPress(post)}
              activeOpacity={0.9}
            >
              {/* Featured Image */}
              <View style={styles.imageContainer}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.featuredImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                  </View>
                )}
                <View style={styles.imageOverlay} />

                {/* Category Badge */}
                {showCategory && categoryName && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{categoryName}</Text>
                  </View>
                )}

                {/* Content Overlay */}
                <View style={styles.overlayContent}>
                  <Text style={styles.featuredTitle} numberOfLines={2}>
                    {postTitle}
                  </Text>

                  {excerpt && (
                    <Text style={styles.featuredExcerpt} numberOfLines={2}>
                      {excerpt}
                    </Text>
                  )}

                  {/* Author & Meta */}
                  <View style={styles.featuredMeta}>
                    {showAuthor && (
                      <View style={styles.authorContainer}>
                        {authorAvatar ? (
                          <Image source={{ uri: authorAvatar }} style={styles.authorAvatar} />
                        ) : (
                          <View style={styles.authorAvatarPlaceholder}>
                            <Text style={styles.authorInitial}>
                              {authorName.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.authorName}>{authorName}</Text>
                      </View>
                    )}

                    <View style={styles.metaRight}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={12} color="#FFFFFF" />
                        <Text style={styles.metaText}>{readTime} min read</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingLeft: 16,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  featuredCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#000',
  },
  imageContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredExcerpt: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  authorAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorInitial: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authorName: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});

export default ${componentName};
`;
}
