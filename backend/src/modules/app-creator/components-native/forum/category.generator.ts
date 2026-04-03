/**
 * Forum Category Component Generators (React Native)
 *
 * Generates forum category list and category card components for React Native.
 */

export interface ForumCategoryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateForumCategories(options: ForumCategoryOptions = {}): string {
  const { componentName = 'ForumCategories', endpoint = '/forum/categories' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  thread_count?: number;
  post_count?: number;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  thread_count?: number;
  post_count?: number;
  last_post?: {
    title: string;
    author: string;
    created_at: string;
  };
}

const ${componentName}: React.FC = () => {
  const navigation = useNavigation<any>();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async () => {
      const response = await api.get<Category[]>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderSubcategory = (sub: Subcategory) => (
    <TouchableOpacity
      key={sub.id}
      style={styles.subcategoryItem}
      onPress={() => navigation.navigate('ForumCategory', { categoryId: sub.slug || sub.id })}
    >
      <View style={styles.subcategoryContent}>
        <Text style={styles.subcategoryName}>{sub.name}</Text>
        {sub.description && (
          <Text style={styles.subcategoryDescription} numberOfLines={1}>
            {sub.description}
          </Text>
        )}
      </View>
      <View style={styles.subcategoryStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{sub.thread_count || 0}</Text>
          <Text style={styles.statLabel}>Threads</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{sub.post_count || 0}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderCategory = ({ item: category }: { item: Category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View
          style={[
            styles.categoryIcon,
            { backgroundColor: (category.color || '#8B5CF6') + '20' },
          ]}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={20}
            color={category.color || '#8B5CF6'}
          />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category.name}</Text>
          {category.description && (
            <Text style={styles.categoryDescription}>{category.description}</Text>
          )}
        </View>
      </View>

      {category.subcategories && category.subcategories.length > 0 && (
        <View style={styles.subcategoriesList}>
          {category.subcategories.map(renderSubcategory)}
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (!categories?.length) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No categories found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={categories}
      renderItem={renderCategory}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  subcategoriesList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  subcategoryContent: {
    flex: 1,
  },
  subcategoryName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  subcategoryDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  subcategoryStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  separator: {
    height: 16,
  },
});

export default ${componentName};
`;
}

export function generateCategoryCard(options: ForumCategoryOptions = {}): string {
  const { componentName = 'CategoryCard' } = options;

  return `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  thread_count?: number;
  post_count?: number;
}

interface ${componentName}Props {
  category: Category;
}

const ${componentName}: React.FC<${componentName}Props> = ({ category }) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ForumCategory', { categoryId: category.slug || category.id })}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: (category.color || '#8B5CF6') + '20' },
          ]}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={24}
            color={category.color || '#8B5CF6'}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{category.name}</Text>
          {category.description && (
            <Text style={styles.description} numberOfLines={2}>
              {category.description}
            </Text>
          )}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="chatbubbles-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>{category.thread_count || 0} threads</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>{category.post_count || 0} posts</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
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
});

export default ${componentName};
`;
}
