/**
 * FAQ Component Generators (React Native)
 *
 * Generates FAQ section and FAQ categories components for React Native.
 */

export interface FaqOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateFaqSection(options: FaqOptions = {}): string {
  const { componentName = 'FaqSection', endpoint = '/faqs' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FaqSectionProps {
  category?: string;
}

const ${componentName}: React.FC<FaqSectionProps> = ({ category }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs', category],
    queryFn: async () => {
      const url = '${endpoint}' + (category ? '?category=' + category : '');
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleToggle = (faqId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(openId === faqId ? null : faqId);
  };

  const filteredFaqs = faqs?.filter((faq: any) =>
    faq.question?.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer?.toLowerCase().includes(search.toLowerCase())
  );

  const renderFaqItem = ({ item: faq }: { item: any }) => {
    const isOpen = openId === faq.id;

    return (
      <View style={styles.faqItem}>
        <TouchableOpacity
          style={styles.faqQuestion}
          onPress={() => handleToggle(faq.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.questionText}>{faq.question}</Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.faqAnswer}>
            <Text style={styles.answerText}>{faq.answer}</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search FAQs..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* FAQs List */}
      {filteredFaqs && filteredFaqs.length > 0 ? (
        <FlatList
          data={filteredFaqs}
          renderItem={renderFaqItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="help-circle-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No FAQs found</Text>
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
    paddingVertical: 48,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginRight: 12,
    lineHeight: 22,
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
  },
  answerText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
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

export function generateFaqCategories(options: FaqOptions = {}): string {
  const { componentName = 'FaqCategories', endpoint = '/faq-categories' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ${componentName}: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['faq-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleCategoryPress = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    setOpenId(null);
  };

  const handleToggleFaq = (faqId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId(openId === faqId ? null : faqId);
  };

  const filteredCategories = activeCategory
    ? categories?.filter((cat: any) => cat.id === activeCategory)
    : categories;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B7280" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        <TouchableOpacity
          style={[styles.tab, !activeCategory && styles.tabActive]}
          onPress={() => handleCategoryPress(null)}
        >
          <Text style={[styles.tabText, !activeCategory && styles.tabTextActive]}>All</Text>
        </TouchableOpacity>
        {categories?.map((cat: any) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.tab, activeCategory === cat.id && styles.tabActive]}
            onPress={() => handleCategoryPress(cat.id)}
          >
            <Text style={[styles.tabText, activeCategory === cat.id && styles.tabTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAQ Categories */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredCategories?.map((category: any) => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: (category.color || '#8B5CF6') + '20' },
                ]}
              >
                <Ionicons
                  name="help-circle"
                  size={24}
                  color={category.color || '#8B5CF6'}
                />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>

            {category.faqs?.map((faq: any, index: number) => {
              const isOpen = openId === faq.id;
              return (
                <View
                  key={faq.id}
                  style={[
                    styles.faqItem,
                    index === 0 && styles.faqItemFirst,
                    index === category.faqs.length - 1 && styles.faqItemLast,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => handleToggleFaq(faq.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.questionText}>{faq.question}</Text>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                  {isOpen && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.answerText}>{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
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
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    padding: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
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
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  faqItemFirst: {},
  faqItemLast: {
    borderBottomWidth: 0,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    marginRight: 12,
    lineHeight: 22,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
});

export default ${componentName};
`;
}
