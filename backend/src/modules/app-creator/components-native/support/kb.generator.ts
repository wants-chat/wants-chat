/**
 * Knowledge Base Component Generators (React Native)
 *
 * Modular components for KB search, categories, and sidebar.
 */

export interface KBOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateKBSearch(options: KBOptions = {}): string {
  const { componentName = 'KBSearch', endpoint = '/articles' } = options;

  return `import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';

interface SearchResult {
  id: string;
  title: string;
  excerpt?: string;
  slug?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface ${componentName}Props {
  placeholder?: string;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  placeholder = 'Search for help articles...',
  showSuggestions = true,
  autoFocus = false,
}) => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem('kb-recent-searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearches = async (searches: string[]) => {
    try {
      await AsyncStorage.setItem('kb-recent-searches', JSON.stringify(searches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  };

  const { data: results, isLoading } = useQuery({
    queryKey: ['kb-search', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const response = await api.get<any>('${endpoint}?search=' + encodeURIComponent(query) + '&limit=5');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: query.length >= 2,
  });

  const { data: popularArticles } = useQuery({
    queryKey: ['kb-popular'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?popular=true&limit=3');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: showSuggestions && isOpen && query.length < 2,
  });

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    saveRecentSearches(updated);

    Keyboard.dismiss();
    setIsOpen(false);
    navigation.navigate('ArticleSearch' as never, { query: searchQuery } as never);
  };

  const handleArticlePress = (articleId: string) => {
    Keyboard.dismiss();
    setIsOpen(false);
    navigation.navigate('ArticleDetail' as never, { id: articleId } as never);
  };

  const clearRecentSearches = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem('kb-recent-searches');
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleArticlePress(item.id)}
    >
      <Ionicons name="document-text" size={18} color="#8B5CF6" style={styles.resultIcon} />
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
        {item.excerpt && (
          <Text style={styles.resultExcerpt} numberOfLines={1}>{item.excerpt}</Text>
        )}
        {item.category && (
          <Text style={styles.resultCategory}>{item.category.name}</Text>
        )}
      </View>
      <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsOpen(true)}
          onSubmitEditing={() => handleSearch(query)}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          autoFocus={autoFocus}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions Dropdown */}
      {isOpen && showSuggestions && (
        <View style={styles.dropdown}>
          {isLoading && query.length >= 2 && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6B7280" />
            </View>
          )}

          {!isLoading && query.length >= 2 && results && results.length > 0 && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Search Results</Text>
              </View>
              <FlatList
                data={results}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => handleSearch(query)}
              >
                <Text style={styles.seeAllText}>See all results for "{query}"</Text>
                <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && query.length >= 2 && results && results.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No results found for "{query}"</Text>
              <Text style={styles.noResultsSubtext}>Try different keywords</Text>
            </View>
          )}

          {query.length < 2 && (
            <>
              {recentSearches.length > 0 && (
                <View>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Ionicons name="time" size={14} color="#6B7280" />
                      <Text style={styles.sectionTitle}>Recent Searches</Text>
                    </View>
                    <TouchableOpacity onPress={clearRecentSearches}>
                      <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                  </View>
                  {recentSearches.map((search, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recentItem}
                      onPress={() => {
                        setQuery(search);
                        handleSearch(search);
                      }}
                    >
                      <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                      <Text style={styles.recentText}>{search}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {popularArticles && popularArticles.length > 0 && (
                <View>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Ionicons name="trending-up" size={14} color="#6B7280" />
                      <Text style={styles.sectionTitle}>Popular Articles</Text>
                    </View>
                  </View>
                  {popularArticles.map((article: any) => (
                    <TouchableOpacity
                      key={article.id}
                      style={styles.popularItem}
                      onPress={() => handleArticlePress(article.id)}
                    >
                      <Ionicons name="document-text-outline" size={16} color="#8B5CF6" />
                      <Text style={styles.popularText} numberOfLines={1}>{article.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  clearButton: {
    padding: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    maxHeight: 400,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  clearText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  resultIcon: {
    marginTop: 2,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  resultExcerpt: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  resultCategory: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 4,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B5CF6',
  },
  noResults: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 15,
    color: '#6B7280',
  },
  noResultsSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  recentText: {
    fontSize: 14,
    color: '#374151',
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  popularText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
});

export default ${componentName};
`;
}

export function generateKBCategories(options: KBOptions = {}): string {
  const { componentName = 'KBCategories', endpoint = '/articles' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  icon?: string;
  color?: string;
  article_count?: number;
  subcategories?: Category[];
}

interface ${componentName}Props {
  layout?: 'grid' | 'list';
  showArticleCount?: boolean;
  showDescription?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  layout = 'grid',
  showArticleCount = true,
  showDescription = true,
}) => {
  const navigation = useNavigation();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['kb-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/categories');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('ArticleList' as never, { categoryId: category.id, categoryName: category.name } as never);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="book-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No categories available</Text>
      </View>
    );
  }

  const renderListItem = ({ item: category }: { item: Category }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.7}
    >
      <View style={[styles.categoryIcon, { backgroundColor: (category.color || '#8B5CF6') + '20' }]}>
        <Ionicons name="folder" size={24} color={category.color || '#8B5CF6'} />
      </View>
      <View style={styles.categoryContent}>
        <Text style={styles.categoryName}>{category.name}</Text>
        {showDescription && category.description && (
          <Text style={styles.categoryDescription} numberOfLines={1}>{category.description}</Text>
        )}
      </View>
      {showArticleCount && category.article_count !== undefined && (
        <View style={styles.countContainer}>
          <Ionicons name="document-text-outline" size={14} color="#6B7280" />
          <Text style={styles.countText}>{category.article_count}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const renderGridItem = ({ item: category }: { item: Category }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handleCategoryPress(category)}
      activeOpacity={0.7}
    >
      <View style={styles.gridItemHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: (category.color || '#8B5CF6') + '20' }]}>
          <Ionicons name="folder" size={24} color={category.color || '#8B5CF6'} />
        </View>
        <View style={styles.gridItemContent}>
          <Text style={styles.categoryName}>{category.name}</Text>
          {showArticleCount && category.article_count !== undefined && (
            <Text style={styles.articleCountText}>
              {category.article_count} {category.article_count === 1 ? 'article' : 'articles'}
            </Text>
          )}
        </View>
      </View>
      {showDescription && category.description && (
        <Text style={styles.gridDescription} numberOfLines={2}>{category.description}</Text>
      )}
      {category.subcategories && category.subcategories.length > 0 && (
        <View style={styles.subcategoriesContainer}>
          {category.subcategories.slice(0, 3).map((sub: Category) => (
            <View key={sub.id} style={styles.subcategoryItem}>
              <Ionicons name="chevron-forward" size={12} color="#9CA3AF" />
              <Text style={styles.subcategoryText}>{sub.name}</Text>
            </View>
          ))}
          {category.subcategories.length > 3 && (
            <Text style={styles.moreText}>+{category.subcategories.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (layout === 'list') {
    return (
      <View style={styles.listContainer}>
        <FlatList
          data={categories}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
          scrollEnabled={false}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={categories}
      renderItem={renderGridItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.gridRow}
      contentContainerStyle={styles.gridContainer}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
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
  listContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  listSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContent: {
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
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 14,
    color: '#6B7280',
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    gap: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  gridItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  gridItemContent: {
    flex: 1,
  },
  articleCountText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  gridDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    lineHeight: 20,
  },
  subcategoriesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 4,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  subcategoryText: {
    fontSize: 13,
    color: '#6B7280',
  },
  moreText: {
    fontSize: 13,
    color: '#8B5CF6',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export function generateKBSidebar(options: KBOptions = {}): string {
  const { componentName = 'KBSidebar', endpoint = '/articles' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  color?: string;
  article_count?: number;
  articles?: any[];
}

interface ${componentName}Props {
  currentCategoryId?: string;
  currentArticleId?: string;
  showSearch?: boolean;
  showQuickLinks?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  currentCategoryId,
  currentArticleId,
  showSearch = true,
  showQuickLinks = true,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    currentCategoryId ? [currentCategoryId] : []
  );
  const [search, setSearch] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['kb-sidebar-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/categories?include_articles=true');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleArticlePress = (articleId: string) => {
    navigation.navigate('ArticleDetail' as never, { id: articleId } as never);
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('ArticleList' as never, { categoryId: category.id, categoryName: category.name } as never);
  };

  const filteredCategories = categories?.map((cat: Category) => ({
    ...cat,
    articles: cat.articles?.filter((article: any) =>
      article.title.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat: Category) =>
    cat.name.toLowerCase().includes(search.toLowerCase()) ||
    (cat.articles && cat.articles.length > 0)
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {showSearch && (
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Filter articles..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      )}

      {showQuickLinks && (
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={[styles.quickLink, route.name === 'Help' && styles.quickLinkActive]}
            onPress={() => navigation.navigate('Help' as never)}
          >
            <Ionicons
              name="home-outline"
              size={18}
              color={route.name === 'Help' ? '#8B5CF6' : '#6B7280'}
            />
            <Text style={[styles.quickLinkText, route.name === 'Help' && styles.quickLinkTextActive]}>
              Help Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickLink, route.name === 'FAQ' && styles.quickLinkActive]}
            onPress={() => navigation.navigate('FAQ' as never)}
          >
            <Ionicons
              name="help-circle-outline"
              size={18}
              color={route.name === 'FAQ' ? '#8B5CF6' : '#6B7280'}
            />
            <Text style={[styles.quickLinkText, route.name === 'FAQ' && styles.quickLinkTextActive]}>
              FAQ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickLink, route.name === 'Support' && styles.quickLinkActive]}
            onPress={() => navigation.navigate('Support' as never)}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={route.name === 'Support' ? '#8B5CF6' : '#6B7280'}
            />
            <Text style={[styles.quickLinkText, route.name === 'Support' && styles.quickLinkTextActive]}>
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>CATEGORIES</Text>

        {isLoading ? (
          <ActivityIndicator size="small" color="#6B7280" style={styles.loader} />
        ) : (
          <View style={styles.categoriesList}>
            {filteredCategories?.map((category: Category) => (
              <View key={category.id}>
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    currentCategoryId === category.id && styles.categoryItemActive,
                  ]}
                  onPress={() => toggleCategory(category.id)}
                >
                  <View style={styles.categoryItemLeft}>
                    <Ionicons
                      name="folder"
                      size={16}
                      color={category.color || '#8B5CF6'}
                    />
                    <Text
                      style={[
                        styles.categoryName,
                        currentCategoryId === category.id && styles.categoryNameActive,
                      ]}
                      numberOfLines={1}
                    >
                      {category.name}
                    </Text>
                  </View>
                  <View style={styles.categoryItemRight}>
                    {category.article_count !== undefined && (
                      <Text style={styles.articleCount}>{category.article_count}</Text>
                    )}
                    <Ionicons
                      name={expandedCategories.includes(category.id) ? 'chevron-down' : 'chevron-forward'}
                      size={16}
                      color="#9CA3AF"
                    />
                  </View>
                </TouchableOpacity>

                {expandedCategories.includes(category.id) && category.articles && (
                  <View style={styles.articlesList}>
                    {category.articles.map((article: any) => (
                      <TouchableOpacity
                        key={article.id}
                        style={styles.articleItem}
                        onPress={() => handleArticlePress(article.id)}
                      >
                        <Ionicons name="document-text-outline" size={14} color="#9CA3AF" />
                        <Text
                          style={[
                            styles.articleTitle,
                            currentArticleId === article.id && styles.articleTitleActive,
                          ]}
                          numberOfLines={1}
                        >
                          {article.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.viewAllButton}
                      onPress={() => handleCategoryPress(category)}
                    >
                      <Text style={styles.viewAllText}>View all in {category.name}</Text>
                      <Ionicons name="chevron-forward" size={14} color="#8B5CF6" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: '#111827',
  },
  quickLinks: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 4,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 10,
  },
  quickLinkActive: {
    backgroundColor: '#F3E8FF',
  },
  quickLinkText: {
    fontSize: 14,
    color: '#374151',
  },
  quickLinkTextActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  categoriesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  loader: {
    paddingVertical: 16,
  },
  categoriesList: {
    gap: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  categoryItemActive: {
    backgroundColor: '#F3E8FF',
  },
  categoryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  categoryItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  categoryNameActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  articleCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  articlesList: {
    marginLeft: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
    marginTop: 4,
    gap: 2,
  },
  articleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 8,
  },
  articleTitle: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },
  articleTitleActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    color: '#8B5CF6',
  },
});

export default ${componentName};
`;
}
