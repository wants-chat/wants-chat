/**
 * Knowledge Base Component Generators (React Native)
 *
 * Generates knowledge base, article list, and article detail components for React Native.
 */

export interface KnowledgeBaseOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateKnowledgeBase(options: KnowledgeBaseOptions = {}): string {
  const { componentName = 'KnowledgeBase', endpoint = '/articles' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['kb-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/categories');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: popular } = useQuery({
    queryKey: ['kb-popular'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?popular=true&limit=5');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleCategoryPress = (category: any) => {
    navigation.navigate('ArticleList' as never, { categoryId: category.id, categoryName: category.name } as never);
  };

  const handleArticlePress = (articleId: string) => {
    navigation.navigate('ArticleDetail' as never, { id: articleId } as never);
  };

  const handleSearch = () => {
    if (search.trim()) {
      navigation.navigate('ArticleSearch' as never, { query: search } as never);
    }
  };

  if (loadingCategories) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>How can we help?</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <View style={styles.categoriesGrid}>
          {categories?.map((category: any) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, { backgroundColor: (category.color || '#8B5CF6') + '20' }]}>
                <Ionicons name="folder" size={24} color={category.color || '#8B5CF6'} />
              </View>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.article_count || 0} articles</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Popular Articles */}
      {popular && popular.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book" size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Popular Articles</Text>
          </View>
          <View style={styles.articlesList}>
            {popular.map((article: any) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleItem}
                onPress={() => handleArticlePress(article.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="document-text" size={20} color="#6B7280" />
                <Text style={styles.articleTitle} numberOfLines={1}>{article.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  articlesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  articleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  articleTitle: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
});

export default ${componentName};
`;
}

export function generateArticleList(options: KnowledgeBaseOptions = {}): string {
  const { componentName = 'ArticleList', endpoint = '/articles' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { categoryId, categoryName } = route.params as { categoryId: string; categoryName?: string };

  const { data: articles, isLoading } = useQuery({
    queryKey: ['kb-articles', categoryId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?category=' + categoryId);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleArticlePress = (articleId: string) => {
    navigation.navigate('ArticleDetail' as never, { id: articleId } as never);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderArticle = ({ item: article }: { item: any }) => (
    <TouchableOpacity
      style={styles.articleItem}
      onPress={() => handleArticlePress(article.id)}
      activeOpacity={0.7}
    >
      <View style={styles.articleIcon}>
        <Ionicons name="document-text" size={20} color="#8B5CF6" />
      </View>
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle}>{article.title}</Text>
        {article.excerpt && (
          <Text style={styles.articleExcerpt} numberOfLines={2}>{article.excerpt}</Text>
        )}
        <View style={styles.articleMeta}>
          {article.read_time && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{article.read_time} min read</Text>
            </View>
          )}
          {article.views !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{article.views} views</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{categoryName || 'Articles'}</Text>
          <Text style={styles.subtitle}>{articles?.length || 0} articles</Text>
        </View>
      </View>

      {/* Articles List */}
      {articles && articles.length > 0 ? (
        <FlatList
          data={articles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No articles found</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
  },
  articleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  articleIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  articleExcerpt: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  separator: {
    height: 12,
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
});

export default ${componentName};
`;
}

export function generateArticleDetail(options: KnowledgeBaseOptions = {}): string {
  const { componentName = 'ArticleDetail', endpoint = '/articles' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };

  const { data: article, isLoading } = useQuery({
    queryKey: ['kb-article', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: (helpful: boolean) =>
      api.post('${endpoint}/' + id + '/feedback', { helpful }),
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: article?.title || 'Check out this article',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFeedback = (helpful: boolean) => {
    feedbackMutation.mutate(helpful);
  };

  const handleRelatedArticle = (articleId: string) => {
    navigation.navigate('ArticleDetail' as never, { id: articleId } as never);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Article not found</Text>
        <TouchableOpacity style={styles.backLink} onPress={handleBack}>
          <Text style={styles.backLinkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Article</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Article Header */}
        <View style={styles.articleHeader}>
          {article.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{article.category.name}</Text>
            </View>
          )}
          <Text style={styles.title}>{article.title}</Text>
          <View style={styles.metaRow}>
            {article.read_time && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{article.read_time} min read</Text>
              </View>
            )}
            {article.updated_at && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>
                  Updated {new Date(article.updated_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Article Content */}
        <View style={styles.articleContent}>
          <Text style={styles.contentText}>{article.content}</Text>
        </View>

        {/* Related Articles */}
        {article.related_articles && article.related_articles.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Related Articles</Text>
            {article.related_articles.map((related: any) => (
              <TouchableOpacity
                key={related.id}
                style={styles.relatedItem}
                onPress={() => handleRelatedArticle(related.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="document-text-outline" size={18} color="#8B5CF6" />
                <Text style={styles.relatedTitle}>{related.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Was this article helpful?</Text>
          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                feedbackMutation.isSuccess && feedbackMutation.variables === true && styles.feedbackButtonActive,
              ]}
              onPress={() => handleFeedback(true)}
              disabled={feedbackMutation.isPending || feedbackMutation.isSuccess}
            >
              <Ionicons
                name="thumbs-up"
                size={20}
                color={feedbackMutation.isSuccess && feedbackMutation.variables === true ? '#22C55E' : '#6B7280'}
              />
              <Text style={styles.feedbackButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                feedbackMutation.isSuccess && feedbackMutation.variables === false && styles.feedbackButtonNegative,
              ]}
              onPress={() => handleFeedback(false)}
              disabled={feedbackMutation.isPending || feedbackMutation.isSuccess}
            >
              <Ionicons
                name="thumbs-down"
                size={20}
                color={feedbackMutation.isSuccess && feedbackMutation.variables === false ? '#EF4444' : '#6B7280'}
              />
              <Text style={styles.feedbackButtonText}>No</Text>
            </TouchableOpacity>
          </View>
          {feedbackMutation.isSuccess && (
            <Text style={styles.feedbackThanks}>Thanks for your feedback!</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  backLink: {
    marginTop: 16,
  },
  backLinkText: {
    fontSize: 16,
    color: '#8B5CF6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  articleHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 30,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  articleContent: {
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
  },
  relatedSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  relatedTitle: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  feedbackSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 16,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  feedbackButtonActive: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  feedbackButtonNegative: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  feedbackButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  feedbackThanks: {
    marginTop: 16,
    fontSize: 14,
    color: '#22C55E',
  },
});

export default ${componentName};
`;
}
