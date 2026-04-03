import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNBlogPostHeader = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'compact' = 'standard'
) => {
  const dataSource = resolved.dataSource;

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

  const getEntityName = () => {
    if (!dataSource || dataSource.trim() === '') return 'posts';
    const parts = dataSource.split('.');
    return parts[0] || 'posts';
  };

  const dataName = getDataPath();
  const entityName = getEntityName();

  const variants = {
    standard: `
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';

interface BlogPostHeaderProps {
  ${dataName}?: any;
  postId?: string;
  [key: string]: any;
}

export default function BlogPostHeader({ ${dataName}: propData, postId }: BlogPostHeaderProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const endpoint = postId ? \`\${apiUrl}/${entityName}/\${postId}\` : \`\${apiUrl}/${entityName}\`;
        const response = await fetch(endpoint);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch post data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  const postData = propData || fetchedData || {};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Map actual API fields dynamically (following blueprint)
  const title = postData?.title || 'Untitled';
  const featuredImage = postData?.featured_image || postData?.image_url || postData?.thumbnail || 'https://via.placeholder.com/800x400';

  // Handle author as object or string
  const authorObj = postData?.author || {};
  const authorName = authorObj?.name || authorObj?.email || postData?.author_name || 'Anonymous';

  // Handle category as object or string
  const categoryObj = postData?.category || {};
  const categoryName = typeof categoryObj === 'object' ? (categoryObj?.name || 'Uncategorized') : (postData?.category || 'Uncategorized');

  // Handle published date
  const publishedAt = postData?.published_at || postData?.created_at;
  const formattedDate = publishedAt ? new Date(publishedAt).toLocaleDateString() : '';

  // Handle view count
  const viewCount = postData?.view_count || postData?.views || 0;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: featuredImage }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoryName}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.meta}>
          <Text style={styles.author}>{authorName}</Text>
          {formattedDate ? (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </>
          ) : null}
          {viewCount > 0 ? (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.views}>{viewCount} views</Text>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 36,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  author: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  separator: {
    marginHorizontal: 8,
    color: '#d1d5db',
    fontSize: 14,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  views: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
});
    `,

    compact: `
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface BlogPostHeaderProps {
  ${dataName}?: any;
  postId?: string;
  [key: string]: any;
}

export default function BlogPostHeader({ ${dataName}: propData, postId }: BlogPostHeaderProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const endpoint = postId ? \`\${apiUrl}/${entityName}/\${postId}\` : \`\${apiUrl}/${entityName}\`;
        const response = await fetch(endpoint);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch post data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  const postData = propData || fetchedData || {};

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Map actual API fields dynamically (following blueprint)
  const title = postData?.title || 'Untitled';

  // Handle author as object or string
  const authorObj = postData?.author || {};
  const authorName = authorObj?.name || authorObj?.email || postData?.author_name || 'Anonymous';

  // Handle published date
  const publishedAt = postData?.published_at || postData?.created_at;
  const formattedDate = publishedAt ? new Date(publishedAt).toLocaleDateString() : '';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.meta}>
          <Text style={styles.author}>{authorName}</Text>
          {formattedDate ? (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 32,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  separator: {
    marginHorizontal: 8,
    color: '#d1d5db',
    fontSize: 14,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
});
    `
  };

  const code = variants[variant] || variants.standard;
  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';",
    ],
  };
};
