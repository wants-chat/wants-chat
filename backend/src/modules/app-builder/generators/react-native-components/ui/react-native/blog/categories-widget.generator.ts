import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNCategoriesWidget = (
  resolved: ResolvedComponent,
  variant: 'grid' | 'list' = 'grid'
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

  const dataName = getDataPath();

  const variants = {
    grid: `
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';

interface CategoriesWidgetProps {
  ${dataName}?: any;
  entity?: string;
  onCategoryPress?: (category: any) => void;
  [key: string]: any;
}

export default function CategoriesWidget({ ${dataName}: propData, entity = 'categories', onCategoryPress }: CategoriesWidgetProps) {
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

  const categoriesData = sourceData || {};

  // Map actual API fields dynamically (avoid variable name conflict)
  const categoriesList = categoriesData?.categories || categoriesData?.data || [];
  const title = categoriesData?.title || 'Categories';

  const handleCategoryPress = (category: any) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    }
  };

  const renderCategory = ({ item }: { item: any }) => {
    const categoryName = item?.name || 'Uncategorized';
    const categoryImage = item?.image_url || item?.thumbnail || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(categoryName)}&background=random\`;
    const postCount = item?.post_count || item?.count || 0;

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => handleCategoryPress(item)}
      >
        <Image
          source={{ uri: categoryImage }}
          style={styles.categoryImage}
          resizeMode="cover"
        />
        <View style={styles.categoryOverlay}>
          <Text style={styles.categoryName}>{categoryName}</Text>
          <Text style={styles.postCount}>{postCount} posts</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={categoriesList}
        renderItem={renderCategory}
        keyExtractor={(item, index) => item?.id || item?._id || index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryCard: {
    flex: 1,
    maxWidth: '48%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  categoryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  postCount: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
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

    list: `
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface CategoriesWidgetProps {
  ${dataName}?: any;
  entity?: string;
  onCategoryPress?: (category: any) => void;
  [key: string]: any;
}

export default function CategoriesWidget({ ${dataName}: propData, entity = 'categories', onCategoryPress }: CategoriesWidgetProps) {
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

  const categoriesData = sourceData || {};

  // Map actual API fields dynamically (avoid variable name conflict)
  const categoriesList = categoriesData?.categories || categoriesData?.data || [];
  const title = categoriesData?.title || 'Categories';

  const handleCategoryPress = (category: any) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    }
  };

  const renderCategory = ({ item }: { item: any }) => {
    const categoryName = item?.name || 'Uncategorized';
    const postCount = item?.post_count || item?.count || 0;
    const description = item?.description || '';

    return (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => handleCategoryPress(item)}
      >
        <View style={styles.categoryContent}>
          <Text style={styles.categoryName}>{categoryName}</Text>
          {description ? (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          ) : null}
        </View>
        <View style={styles.badge}>
          <Text style={styles.postCount}>{postCount}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={categoriesList}
        renderItem={renderCategory}
        keyExtractor={(item, index) => item?.id || item?._id || index.toString()}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  listContent: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryContent: {
    flex: 1,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  badge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  postCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
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

  const code = variants[variant] || variants.grid;
  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';",
    ],
  };
};
