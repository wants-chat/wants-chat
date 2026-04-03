import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNBlogCard = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'featured' | 'grid' | 'standard' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    // For ID fields
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    // For array fields
    if (fieldName.match(/items|posts|articles|list|array|data/i)) {
      return `propData?.${fieldName} || []`;
    }
    // For object fields
    if (fieldName.match(/author|metadata|config|settings/i)) {
      return `propData?.${fieldName} || {}`;
    }
    // For scalar values - return empty string as fallback
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');
  };

  const getDataPath = () => {
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
  };

  const dataName = getDataPath();
  const entityName = dataSource || 'items';

  const variants = {
    compact: `
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CompactPost {
  id: number | string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
}

interface CompactBlogCardProps {
  ${dataName}?: any;
  entity?: string;
  onPostPress?: (post: CompactPost) => void;
  onCategoryPress?: (category: string, postId: number | string) => void;
  onAuthorPress?: (author: string, postId: number | string) => void;
  [key: string]: any;
}

export default function CompactBlogCard({
  ${dataName}: propData,
  entity = '${entityName}',
  onPostPress,
  onCategoryPress,
  onAuthorPress
}: CompactBlogCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData || {};

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const blogData = sourceData || {};

  // Extract posts array (matches frontend behavior)
  // Handle both array responses and single object responses wrapped in { data: {...} }
  const extractedData = blogData?.${entityName} || blogData?.items || blogData?.data || blogData;
  const rawPosts: any[] = Array.isArray(blogData)
    ? blogData
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];
  const title = blogData?.compactTitle || 'Latest Posts';
  const subtitle = blogData?.compactSubtitle || 'Quick reads for you';

  // Normalize posts to have consistent field names (matches frontend behavior)
  const postsList = rawPosts.map((rawPost: any) => ({
    ...rawPost,
    id: rawPost.id || rawPost._id,
    image: rawPost.featured_image || rawPost.image || rawPost.thumbnail || rawPost.cover_image || 'https://placehold.co/400x300?text=Post',
    title: rawPost.title || 'Untitled',
    excerpt: rawPost.excerpt || rawPost.description || rawPost.content?.substring(0, 120) || '',
    author: rawPost.author?.name || rawPost.author_name || rawPost.author || 'Unknown Author',
    category: rawPost.category?.name || rawPost.category_name || rawPost.category || 'Uncategorized',
    date: rawPost.published_at || rawPost.created_at ? new Date(rawPost.published_at || rawPost.created_at).toLocaleDateString() : 'Recent',
    readTime: rawPost.read_time || \`\${Math.ceil((rawPost.content?.length || 2000) / 1000)} min read\`,
  }));

  const handlePostPress = (post: CompactPost) => {
    if (onPostPress) {
      onPostPress(post);
    }
  };

  const handleCategoryPress = (category: string, postId: number | string) => {
    if (onCategoryPress) {
      onCategoryPress(category, postId);
    }
  };

  const handleAuthorPress = (author: string, postId: number | string) => {
    if (onAuthorPress) {
      onAuthorPress(author, postId);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {postsList.map((post: CompactPost) => (
          <TouchableOpacity
            key={post.id}
            style={styles.postCard}
            onPress={() => handlePostPress(post)}
            activeOpacity={0.7}
          >
            <View style={styles.postContent}>
              <Image
                source={{ uri: post.image }}
                style={styles.postImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.categoryBadge}
                onPress={() => handleCategoryPress(post.category, post.id)}
              >
                <Text style={styles.categoryText}>{post.category}</Text>
              </TouchableOpacity>

              <View style={styles.postInfo}>
                <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
                <Text style={styles.postExcerpt} numberOfLines={2}>{post.excerpt}</Text>

                <View style={styles.postMeta}>
                  <TouchableOpacity onPress={() => handleAuthorPress(post.author, post.id)}>
                    <Text style={styles.authorText}>{post.author}</Text>
                  </TouchableOpacity>
                  <Text style={styles.metaSeparator}>•</Text>
                  <Text style={styles.metaText}>{post.date}</Text>
                  <Text style={styles.metaSeparator}>•</Text>
                  <View style={styles.readTimeContainer}>
                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>{post.readTime}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postContent: {
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f3f4f6',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  postInfo: {
    padding: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  postExcerpt: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  metaSeparator: {
    fontSize: 12,
    color: '#d1d5db',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});
    `,

    featured: `
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeaturedPost {
  id: number | string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  readTime: string;
  category: string;
  image: string;
  views: number;
  comments: number;
  trending: boolean;
}

interface FeaturedBlogCardProps {
  ${dataName}?: any;
  entity?: string;
  onPostPress?: (post: FeaturedPost) => void;
  onReadArticle?: (postId: number | string, post: FeaturedPost) => void;
  onCategoryPress?: (category: string, postId: number | string) => void;
  onAuthorPress?: (authorName: string, postId: number | string) => void;
  [key: string]: any;
}

export default function FeaturedBlogCard({
  ${dataName}: propData,
  entity = '${entityName}',
  onPostPress,
  onReadArticle,
  onCategoryPress,
  onAuthorPress
}: FeaturedBlogCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData || {};

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const blogData = sourceData || {};

  // Extract posts array (matches frontend behavior)
  // Handle both array responses and single object responses wrapped in { data: {...} }
  const extractedData = blogData?.${entityName} || blogData?.items || blogData?.data || blogData;
  const rawPosts: any[] = Array.isArray(blogData)
    ? blogData
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];
  const title = blogData?.featuredTitle || 'Highlighted article for you';
  const subtitle = blogData?.featuredSubtitle || 'Featured content';

  // Normalize posts to have consistent field names (matches frontend behavior)
  const postsList = rawPosts.map((rawPost: any) => ({
    ...rawPost,
    id: rawPost.id || rawPost._id,
    image: rawPost.featured_image || rawPost.heroImage || rawPost.image || rawPost.thumbnail || 'https://placehold.co/1200x800?text=Featured',
    title: rawPost.title || 'Untitled',
    excerpt: rawPost.excerpt || rawPost.description || rawPost.content?.substring(0, 150) || '',
    category: rawPost.category?.name || rawPost.category_name || rawPost.category || 'Uncategorized',
    author: {
      name: rawPost.author?.name || rawPost.author_name || rawPost.author || 'Unknown Author',
      avatar: rawPost.author?.avatar || rawPost.author_avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(rawPost.author?.name || rawPost.author_name || 'U')}&background=random\`,
      role: rawPost.author?.role || rawPost.author_role || 'Writer',
    },
    date: rawPost.published_at || rawPost.created_at ? new Date(rawPost.published_at || rawPost.created_at).toLocaleDateString() : 'Recent',
    readTime: rawPost.read_time || \`\${Math.ceil((rawPost.content?.length || 2000) / 1000)} min read\`,
    views: rawPost.view_count || rawPost.views || 0,
    comments: rawPost.comment_count || rawPost.comments || 0,
    trending: rawPost.trending || rawPost.is_trending || false,
  }));

  const handlePostPress = (post: FeaturedPost) => {
    if (onPostPress) {
      onPostPress(post);
    }
  };

  const handleReadArticle = (postId: number | string, post: FeaturedPost) => {
    if (onReadArticle) {
      onReadArticle(postId, post);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {postsList.map((post: FeaturedPost) => (
          <TouchableOpacity
            key={post.id}
            style={styles.featuredCard}
            onPress={() => handlePostPress(post)}
            activeOpacity={0.9}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: post.image }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />

              <View style={styles.badgesContainer}>
                <TouchableOpacity
                  style={styles.categoryBadge}
                  onPress={() => onCategoryPress?.(post.category, post.id)}
                >
                  <Text style={styles.badgeText}>{post.category}</Text>
                </TouchableOpacity>
                {post.trending && (
                  <View style={styles.trendingBadge}>
                    <Ionicons name="trending-up" size={14} color="#fff" />
                    <Text style={styles.badgeText}>Trending</Text>
                  </View>
                )}
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Ionicons name="eye-outline" size={16} color="#fff" />
                  <Text style={styles.statText}>{post.views.toLocaleString()}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="chatbubble-outline" size={16} color="#fff" />
                  <Text style={styles.statText}>{post.comments}</Text>
                </View>
              </View>
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.featuredTitle} numberOfLines={2}>{post.title}</Text>
              <Text style={styles.featuredExcerpt} numberOfLines={3}>{post.excerpt}</Text>

              <TouchableOpacity
                style={styles.authorContainer}
                onPress={() => onAuthorPress?.(post.author.name, post.id)}
              >
                <Image
                  source={{ uri: post.author.avatar }}
                  style={styles.authorAvatar}
                />
                <View>
                  <Text style={styles.authorName}>{post.author.name}</Text>
                  <Text style={styles.authorRole}>{post.author.role}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.footer}>
                <View style={styles.metaContainer}>
                  <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                  <Text style={styles.metaText}>{post.date}</Text>
                  <Ionicons name="time-outline" size={14} color="#6b7280" style={{ marginLeft: 12 }} />
                  <Text style={styles.metaText}>{post.readTime}</Text>
                </View>
                <TouchableOpacity
                  style={styles.readButton}
                  onPress={() => handleReadArticle(post.id, post)}
                >
                  <Text style={styles.readButtonText}>Read Article</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  featuredCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    height: 280,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  badgesContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  trendingBadge: {
    backgroundColor: '#f97316',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 20,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  featuredExcerpt: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  authorRole: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  readButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  readButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});
    `,

    grid: `
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GridPost {
  id: number | string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  readTime: string;
  category: string;
  image: string;
  likes: number;
}

interface GridBlogCardProps {
  ${dataName}?: any;
  entity?: string;
  onPostPress?: (post: GridPost) => void;
  onLike?: (postId: number | string, isLiked: boolean) => void;
  onBookmark?: (postId: number | string, isBookmarked: boolean) => void;
  onCategoryPress?: (category: string, postId: number | string) => void;
  [key: string]: any;
}

export default function GridBlogCard({
  ${dataName}: propData,
  entity = '${entityName}',
  onPostPress,
  onLike,
  onBookmark,
  onCategoryPress
}: GridBlogCardProps) {
  const [likedPosts, setLikedPosts] = useState<Set<number | string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<number | string>>(new Set());
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData || {};

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const blogData = sourceData || {};

  // Extract posts array (matches frontend behavior)
  // Handle both array responses and single object responses wrapped in { data: {...} }
  const extractedData = blogData?.${entityName} || blogData?.items || blogData?.data || blogData;
  const rawPosts: any[] = Array.isArray(blogData)
    ? blogData
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];
  const title = blogData?.gridTitle || 'All Posts';
  const subtitle = blogData?.gridSubtitle || 'Browse our collection of articles';

  // Normalize posts to have consistent field names (matches frontend behavior)
  const postsList = rawPosts.map((rawPost: any) => ({
    ...rawPost,
    id: rawPost.id || rawPost._id,
    image: rawPost.featured_image || rawPost.image || rawPost.thumbnail || rawPost.cover_image || 'https://placehold.co/600x400?text=Post',
    title: rawPost.title || 'Untitled',
    excerpt: rawPost.excerpt || rawPost.description || rawPost.content?.substring(0, 120) || '',
    category: rawPost.category?.name || rawPost.category_name || rawPost.category || 'Uncategorized',
    author: {
      name: rawPost.author?.name || rawPost.author_name || rawPost.author || 'Unknown Author',
      avatar: rawPost.author?.avatar || rawPost.author_avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(rawPost.author?.name || rawPost.author_name || 'U')}&background=random\`,
    },
    date: rawPost.published_at || rawPost.created_at ? new Date(rawPost.published_at || rawPost.created_at).toLocaleDateString() : 'Recent',
    readTime: rawPost.read_time || \`\${Math.ceil((rawPost.content?.length || 2000) / 1000)} min read\`,
    views: rawPost.view_count || rawPost.views || 0,
    likes: rawPost.like_count || rawPost.likes || 0,
  }));

  const toggleLike = (postId: number | string) => {
    const newLikedPosts = new Set(likedPosts);
    const isLiked = newLikedPosts.has(postId);

    if (isLiked) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }

    setLikedPosts(newLikedPosts);
    onLike?.(postId, !isLiked);
  };

  const toggleBookmark = (postId: number | string) => {
    const newBookmarkedPosts = new Set(bookmarkedPosts);
    const isBookmarked = newBookmarkedPosts.has(postId);

    if (isBookmarked) {
      newBookmarkedPosts.delete(postId);
    } else {
      newBookmarkedPosts.add(postId);
    }

    setBookmarkedPosts(newBookmarkedPosts);
    onBookmark?.(postId, !isBookmarked);
  };

  const renderPost = ({ item }: { item: GridPost }) => {
    const isLiked = likedPosts.has(item.id);
    const isBookmarked = bookmarkedPosts.has(item.id);

    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={() => onPostPress?.(item)}
        activeOpacity={0.8}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.image }}
            style={styles.gridImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />

          <TouchableOpacity
            style={styles.categoryBadge}
            onPress={() => onCategoryPress?.(item.category, item.id)}
          >
            <Text style={styles.categoryText}>{item.category}</Text>
          </TouchableOpacity>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, isBookmarked && styles.actionButtonActive]}
              onPress={() => toggleBookmark(item.id)}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isBookmarked ? '#fbbf24' : '#fff'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.gridContent}>
          <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.gridExcerpt} numberOfLines={2}>{item.excerpt}</Text>

          <View style={styles.gridAuthor}>
            <Image
              source={{ uri: item.author.avatar }}
              style={styles.authorAvatarSmall}
            />
            <Text style={styles.authorNameSmall}>{item.author.name}</Text>
            <Text style={styles.metaSeparator}>•</Text>
            <Ionicons name="time-outline" size={12} color="#6b7280" />
            <Text style={styles.metaTextSmall}>{item.readTime}</Text>
          </View>

          <View style={styles.gridFooter}>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={() => toggleLike(item.id)}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={isLiked ? '#ef4444' : '#6b7280'}
              />
              <Text style={[styles.likeCount, isLiked && styles.likeCountActive]}>
                {item.likes + (isLiked ? 1 : 0)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <FlatList
        data={postsList}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContent: {
    paddingHorizontal: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: '48%',
  },
  imageWrapper: {
    position: 'relative',
    height: 180,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  actionsContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#fff',
  },
  gridContent: {
    padding: 12,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  gridExcerpt: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
    lineHeight: 18,
  },
  gridAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  authorAvatarSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  authorNameSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  metaSeparator: {
    fontSize: 10,
    color: '#d1d5db',
    marginHorizontal: 2,
  },
  metaTextSmall: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 2,
  },
  gridFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  likeCountActive: {
    color: '#ef4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});
    `,

    standard: `
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BlogPost {
  id: number | string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  category: string;
  image: string;
}

interface StandardBlogCardProps {
  ${dataName}?: any;
  entity?: string;
  onPostPress?: (post: BlogPost) => void;
  onReadMore?: (postId: number | string, post: BlogPost) => void;
  onCategoryPress?: (category: string, postId: number | string) => void;
  onAuthorPress?: (authorName: string, postId: number | string) => void;
  [key: string]: any;
}

export default function StandardBlogCard({
  ${dataName}: propData,
  entity = '${entityName}',
  onPostPress,
  onReadMore,
  onCategoryPress,
  onAuthorPress
}: StandardBlogCardProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData || {};

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const blogData = sourceData || {};

  // Extract posts array (matches frontend behavior)
  // Handle both array responses and single object responses wrapped in { data: {...} }
  const extractedData = blogData?.${entityName} || blogData?.items || blogData?.data || blogData;
  const rawPosts: any[] = Array.isArray(blogData)
    ? blogData
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];
  const title = blogData?.standardTitle || 'Featured Posts';
  const subtitle = blogData?.standardSubtitle || 'Browse our collection of articles';

  // Normalize posts to have consistent field names (matches frontend behavior)
  const postsList = rawPosts.map((rawPost: any) => ({
    ...rawPost,
    id: rawPost.id || rawPost._id,
    image: rawPost.featured_image || rawPost.image || rawPost.thumbnail || rawPost.cover_image || 'https://placehold.co/800x600?text=Post',
    title: rawPost.title || 'Untitled',
    excerpt: rawPost.excerpt || rawPost.description || rawPost.content?.substring(0, 150) || '',
    category: rawPost.category?.name || rawPost.category_name || rawPost.category || 'Uncategorized',
    author: {
      name: rawPost.author?.name || rawPost.author_name || rawPost.author || 'Unknown Author',
      avatar: rawPost.author?.avatar || rawPost.author_avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(rawPost.author?.name || rawPost.author_name || 'U')}&background=random\`,
    },
    date: rawPost.published_at || rawPost.created_at ? new Date(rawPost.published_at || rawPost.created_at).toLocaleDateString() : 'Recent',
    readTime: rawPost.read_time || \`\${Math.ceil((rawPost.content?.length || 2000) / 1000)} min read\`,
  }));

  const renderPost = ({ item }: { item: BlogPost }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => onPostPress?.(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.postImage}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.categoryBadge}
        onPress={() => onCategoryPress?.(item.category, item.id)}
      >
        <Text style={styles.categoryText}>{item.category}</Text>
      </TouchableOpacity>

      <View style={styles.postContent}>
        <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.postExcerpt} numberOfLines={3}>{item.excerpt}</Text>

        <TouchableOpacity
          style={styles.authorSection}
          onPress={() => onAuthorPress?.(item.author.name, item.id)}
        >
          <Image
            source={{ uri: item.author.avatar }}
            style={styles.authorAvatar}
          />
          <View>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={12} color="#6b7280" />
              <Text style={styles.metaText}>{item.date}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.footer}>
          <View style={styles.readTimeContainer}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.readTimeText}>{item.readTime}</Text>
          </View>
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => onReadMore?.(item.id, item)}
          >
            <Text style={styles.readMoreText}>Read More</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <FlatList
        data={postsList}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    paddingBottom: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#f3f4f6',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    zIndex: 1,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  postContent: {
    padding: 16,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  postExcerpt: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 14,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  readMoreButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  readMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});
    `
  };

  const code = variants[variant] || variants.standard;
  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
};
