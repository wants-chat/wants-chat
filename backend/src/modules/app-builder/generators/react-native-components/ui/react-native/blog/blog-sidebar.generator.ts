import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNBlogSidebar = (resolved: ResolvedComponent) => {
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
    if (!dataSource || dataSource.trim() === '') return 'sidebar';
    const parts = dataSource.split('.');
    return parts[0] || 'sidebar';
  };

  const dataName = getDataPath();
  const entityName = getEntityName();

  const code = `
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

interface BlogSidebarProps {
  ${dataName}?: any;
  onSearchPress?: (query: string) => void;
  onCategoryPress?: (category: any) => void;
  onTagPress?: (tag: string) => void;
  onPopularPostPress?: (post: any) => void;
  [key: string]: any;
}

export default function BlogSidebar({
  ${dataName}: propData,
  onSearchPress,
  onCategoryPress,
  onTagPress,
  onPopularPostPress
}: BlogSidebarProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}\`);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch sidebar data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sidebarData = propData || fetchedData || {};

  // Map actual API fields dynamically
  const showSearch = sidebarData?.showSearch !== false;
  const showCategories = sidebarData?.showCategories !== false;
  const showPopularPosts = sidebarData?.showPopularPosts !== false;
  const showTags = sidebarData?.showTags !== false;

  const categories = sidebarData?.categories || [];
  const popularPosts = sidebarData?.popularPosts || sidebarData?.popular || [];
  const tags = sidebarData?.tags || [];

  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = () => {
    if (onSearchPress && searchQuery.trim()) {
      onSearchPress(searchQuery);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      {showSearch && (
        <View style={styles.widget}>
          <Text style={styles.widgetTitle}>Search</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search posts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Categories */}
      {showCategories && categories.length > 0 && (
        <View style={styles.widget}>
          <Text style={styles.widgetTitle}>Categories</Text>
          {categories.map((category: any, index: number) => {
            const categoryName = category?.name || 'Uncategorized';
            const postCount = category?.post_count || category?.count || 0;

            return (
              <TouchableOpacity
                key={category?.id || index}
                style={styles.categoryItem}
                onPress={() => onCategoryPress && onCategoryPress(category)}
              >
                <Text style={styles.categoryName}>{categoryName}</Text>
                <Text style={styles.categoryCount}>({postCount})</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Popular Posts */}
      {showPopularPosts && popularPosts.length > 0 && (
        <View style={styles.widget}>
          <Text style={styles.widgetTitle}>Popular Posts</Text>
          {popularPosts.map((post: any, index: number) => {
            const postTitle = post?.title || 'Untitled';
            const publishedAt = post?.published_at || post?.created_at;
            const formattedDate = publishedAt ? new Date(publishedAt).toLocaleDateString() : '';

            return (
              <TouchableOpacity
                key={post?.id || index}
                style={styles.popularPostItem}
                onPress={() => onPopularPostPress && onPopularPostPress(post)}
              >
                <Text style={styles.popularPostTitle} numberOfLines={2}>
                  {postTitle}
                </Text>
                {formattedDate ? (
                  <Text style={styles.popularPostDate}>{formattedDate}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Tags */}
      {showTags && tags.length > 0 && (
        <View style={styles.widget}>
          <Text style={styles.widgetTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag: any, index: number) => {
              const tagName = typeof tag === 'object' ? tag?.name : tag;

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.tag}
                  onPress={() => onTagPress && onTagPress(tagName)}
                >
                  <Text style={styles.tagText}>{tagName}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  widget: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryName: {
    fontSize: 14,
    color: '#374151',
  },
  categoryCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  popularPostItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  popularPostTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 20,
  },
  popularPostDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
  },
});
  `;

  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';",
    ],
  };
};
