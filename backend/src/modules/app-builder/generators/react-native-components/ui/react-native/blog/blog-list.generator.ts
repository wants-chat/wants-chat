import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNBlogList = (
  resolved: ResolvedComponent,
  variant: 'compact' | 'detailed' | 'minimal' = 'detailed'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    if (fieldName.match(/items|posts|articles|list|array|data/i)) {
      return `propData?.${fieldName} || []`;
    }
    return `propData?.${fieldName} || ''`;
  };

  const sanitizeVariableName = (name: string): string => {
    return name
      .split(/[._]/)
      .map((part, index) => {
        if (index === 0) return part;
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

  const code = `
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

interface BlogListProps {
  ${dataName}?: any;
  entity?: string;
  onPostPress?: (post: BlogPost) => void;
  onAuthorPress?: (authorName: string, postId: number | string) => void;
  onCategoryPress?: (category: string, postId: number | string) => void;
  [key: string]: any;
}

export default function BlogList({
  ${dataName}: propData,
  entity = '${entityName}',
  onPostPress,
  onAuthorPress,
  onCategoryPress
}: BlogListProps) {
  const [fetchedData, setFetchedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API if no props data provided
  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}\`);
        const result = await response.json();
        const items = Array.isArray(result) ? result : (result?.data || []);
        setFetchedData(items);
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
        setError('Failed to load posts');
        setFetchedData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, propData]);

  const sourceData = propData || fetchedData;
  const blogData = Array.isArray(sourceData) ? { items: sourceData } : sourceData || {};

  // Loading state
  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  // Error state
  if (error && !propData) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Extract posts array (matches frontend behavior)
  // Handle both array responses and single object responses wrapped in { data: {...} }
  const extractedData = blogData?.${entityName} || blogData?.items || blogData?.data;
  const rawPosts: any[] = Array.isArray(sourceData)
    ? sourceData
    : Array.isArray(extractedData)
      ? extractedData
      : extractedData
        ? [extractedData]
        : [];

  // Normalize posts to have consistent field names (matches frontend behavior)
  const postsList = rawPosts.map((rawPost: any) => ({
    ...rawPost,
    id: rawPost.id || rawPost._id,
    image: rawPost.featured_image || rawPost.image || rawPost.thumbnail || rawPost.cover_image || 'https://placehold.co/600x400?text=Post',
    title: rawPost.title || 'Untitled',
    excerpt: rawPost.excerpt || rawPost.description || rawPost.content?.substring(0, 100) || '',
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
      style={styles.postItem}
      onPress={() => onPostPress?.(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.postImage}
        resizeMode="cover"
      />

      <View style={styles.postContent}>
        <TouchableOpacity
          onPress={() => onCategoryPress?.(item.category, item.id)}
        >
          <Text style={styles.category}>{item.category}</Text>
        </TouchableOpacity>

        <Text style={styles.postTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.postExcerpt} numberOfLines={2}>
          {item.excerpt}
        </Text>

        <View style={styles.metaContainer}>
          <TouchableOpacity
            style={styles.authorInfo}
            onPress={() => onAuthorPress?.(item.author.name, item.id)}
          >
            <Image
              source={{ uri: item.author.avatar }}
              style={styles.authorAvatar}
            />
            <Text style={styles.authorName}>{item.author.name}</Text>
          </TouchableOpacity>

          <View style={styles.postMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color="#6b7280" />
              <Text style={styles.metaText}>{item.date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color="#6b7280" />
              <Text style={styles.metaText}>{item.readTime}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
  },
  postItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postImage: {
    width: 120,
    height: 120,
    backgroundColor: '#f3f4f6',
  },
  postContent: {
    flex: 1,
    padding: 12,
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  postExcerpt: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  metaContainer: {
    marginTop: 'auto',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    marginRight: 6,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  postMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});
  `;

  return {
    code,
    imports: [
      "import React from 'react';",
      "import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList } from 'react-native';",
      "import { Ionicons } from '@expo/vector-icons';",
    ],
  };
};
