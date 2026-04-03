/**
 * Help & Support Component Generators for React Native
 */

import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

// Support Ticket Form
export function generateRNSupportTicketForm(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SupportTicketFormProps {
  categories?: string[];
  onSubmit?: (data: { subject: string; category: string; description: string; priority: string }) => void;
}

export default function SupportTicketForm({
  categories = ['General', 'Technical', 'Billing', 'Account', 'Other'],
  onSubmit
}: SupportTicketFormProps) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = () => {
    if (!subject || !description) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }
    onSubmit?.({ subject, category, description, priority });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Submit a Support Ticket</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Subject *</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="Brief summary of your issue"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {['low', 'medium', 'high'].map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.priorityButton, priority === p && styles.priorityButtonActive]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your issue in detail..."
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Ionicons name="send" size={20} color="#fff" />
        <Text style={styles.submitButtonText}>Submit Ticket</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    minHeight: 120,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  categoryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#3b82f6',
    fontWeight: '500',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  priorityButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  priorityText: {
    fontSize: 14,
    color: '#6b7280',
  },
  priorityTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';"],
  };
}

// Help Center Home
export function generateRNHelpCenterHome(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
  articleCount: number;
}

interface HelpCenterHomeProps {
  categories?: Category[];
  onSearch?: (query: string) => void;
  onCategoryPress?: (category: Category) => void;
  onContactSupport?: () => void;
}

const defaultCategories: Category[] = [
  { id: '1', title: 'Getting Started', icon: 'rocket', description: 'Learn the basics', articleCount: 12 },
  { id: '2', title: 'Account & Billing', icon: 'card', description: 'Manage your account', articleCount: 8 },
  { id: '3', title: 'Features', icon: 'apps', description: 'Explore features', articleCount: 15 },
  { id: '4', title: 'Troubleshooting', icon: 'build', description: 'Fix common issues', articleCount: 20 },
];

export default function HelpCenterHome({
  categories = defaultCategories,
  onSearch,
  onCategoryPress,
  onContactSupport
}: HelpCenterHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How can we help?</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for help..."
            onSubmitEditing={() => onSearch?.(searchQuery)}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Browse by Category</Text>
      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryCard}
            onPress={() => onCategoryPress?.(category)}
          >
            <View style={styles.categoryIcon}>
              <Ionicons name={category.icon as any} size={28} color="#3b82f6" />
            </View>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
            <Text style={styles.articleCount}>{category.articleCount} articles</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.supportCard}>
        <Ionicons name="headset" size={40} color="#3b82f6" />
        <View style={styles.supportContent}>
          <Text style={styles.supportTitle}>Still need help?</Text>
          <Text style={styles.supportText}>Our support team is ready to assist you</Text>
        </View>
        <TouchableOpacity style={styles.contactButton} onPress={onContactSupport}>
          <Text style={styles.contactButtonText}>Contact Us</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    padding: 20,
    paddingBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  articleCount: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  supportContent: {
    flex: 1,
    marginLeft: 16,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  supportText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Help Article Page
export function generateRNHelpArticlePage(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HelpArticlePageProps {
  title: string;
  content: string;
  category?: string;
  lastUpdated?: string;
  relatedArticles?: { id: string; title: string }[];
  onBack?: () => void;
  onFeedback?: (helpful: boolean) => void;
  onRelatedPress?: (id: string) => void;
}

export default function HelpArticlePage({
  title,
  content,
  category,
  lastUpdated,
  relatedArticles,
  onBack,
  onFeedback,
  onRelatedPress
}: HelpArticlePageProps) {
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);

  const handleFeedback = (helpful: boolean) => {
    setFeedbackGiven(helpful);
    onFeedback?.(helpful);
  };

  return (
    <ScrollView style={styles.container}>
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          <Text style={styles.backText}>Back to Help Center</Text>
        </TouchableOpacity>
      )}

      {category && (
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>{category}</Text>
        </View>
      )}

      <Text style={styles.title}>{title}</Text>

      {lastUpdated && (
        <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
      )}

      <View style={styles.content}>
        <Text style={styles.contentText}>{content}</Text>
      </View>

      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackTitle}>Was this article helpful?</Text>
        {feedbackGiven === null ? (
          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => handleFeedback(true)}
            >
              <Ionicons name="thumbs-up" size={24} color="#10b981" />
              <Text style={styles.feedbackButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={() => handleFeedback(false)}
            >
              <Ionicons name="thumbs-down" size={24} color="#ef4444" />
              <Text style={styles.feedbackButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.thankYou}>Thank you for your feedback!</Text>
        )}
      </View>

      {relatedArticles && relatedArticles.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related Articles</Text>
          {relatedArticles.map((article) => (
            <TouchableOpacity
              key={article.id}
              style={styles.relatedItem}
              onPress={() => onRelatedPress?.(article.id)}
            >
              <Ionicons name="document-text" size={20} color="#6b7280" />
              <Text style={styles.relatedItemText}>{article.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  backText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  breadcrumb: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  breadcrumbText: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#9ca3af',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  content: {
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
  },
  feedbackSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 8,
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  thankYou: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  relatedSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  relatedItemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Article Search Help
export function generateRNArticleSearchHelp(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
}

interface ArticleSearchHelpProps {
  articles: Article[];
  onArticlePress?: (article: Article) => void;
}

export default function ArticleSearchHelp({ articles, onArticlePress }: ArticleSearchHelpProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      const filtered = articles.filter(
        a => a.title.toLowerCase().includes(text.toLowerCase()) ||
             a.excerpt.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={handleSearch}
          placeholder="Search articles..."
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.resultItem} onPress={() => onArticlePress?.(item)}>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={styles.resultExcerpt} numberOfLines={2}>{item.excerpt}</Text>
              <Text style={styles.resultCategory}>{item.category}</Text>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>{results.length} results found</Text>
          }
        />
      ) : query.length > 2 ? (
        <View style={styles.noResults}>
          <Ionicons name="search" size={48} color="#d1d5db" />
          <Text style={styles.noResultsText}>No results found</Text>
          <Text style={styles.noResultsHint}>Try different keywords</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  resultsCount: {
    fontSize: 13,
    color: '#6b7280',
    padding: 16,
    paddingBottom: 8,
  },
  resultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  resultExcerpt: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  resultCategory: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  noResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  noResultsHint: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';"],
  };
}

// FAQ Accordion Simple
export function generateRNFaqAccordionSimple(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionSimpleProps {
  items: FaqItem[];
}

export default function FaqAccordionSimple({ items }: FaqAccordionSimpleProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isExpanded = expandedId === item.id;
        return (
          <View key={item.id} style={styles.item}>
            <TouchableOpacity
              style={styles.questionRow}
              onPress={() => toggleItem(item.id)}
            >
              <Text style={styles.question}>{item.question}</Text>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#6b7280"
              />
            </TouchableOpacity>
            {isExpanded && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    paddingRight: 12,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';"],
  };
}

// FAQ Accordion Categorized
export function generateRNFaqAccordionCategorized(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

interface FaqAccordionCategorizedProps {
  categories: FaqCategory[];
}

export default function FaqAccordionCategorized({ categories }: FaqAccordionCategorizedProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(categories[0]?.id);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategory(expandedCategory === id ? null : id);
    setExpandedItem(null);
  };

  const toggleItem = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItem(expandedItem === id ? null : id);
  };

  return (
    <ScrollView style={styles.container}>
      {categories.map((category) => {
        const isCategoryExpanded = expandedCategory === category.id;
        return (
          <View key={category.id} style={styles.category}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.id)}
            >
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryCount}>{category.items.length}</Text>
              </View>
              <Ionicons
                name={isCategoryExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#6b7280"
              />
            </TouchableOpacity>

            {isCategoryExpanded && (
              <View style={styles.itemsContainer}>
                {category.items.map((item) => {
                  const isItemExpanded = expandedItem === item.id;
                  return (
                    <View key={item.id} style={styles.item}>
                      <TouchableOpacity
                        style={styles.questionRow}
                        onPress={() => toggleItem(item.id)}
                      >
                        <Text style={styles.question}>{item.question}</Text>
                        <Ionicons
                          name={isItemExpanded ? 'remove' : 'add'}
                          size={20}
                          color="#3b82f6"
                        />
                      </TouchableOpacity>
                      {isItemExpanded && (
                        <Text style={styles.answer}>{item.answer}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  category: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  categoryTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  categoryBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  item: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingVertical: 12,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  question: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    paddingRight: 12,
  },
  answer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
    marginTop: 12,
    paddingLeft: 4,
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';"],
  };
}

// FAQ Search
export function generateRNFaqSearch(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNArticleSearchHelp(resolved, variant);
}

// Knowledge Base Categories
export function generateRNKnowledgeBaseCategories(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNHelpCenterHome(resolved, variant);
}

// Documentation Viewer
export function generateRNDocumentationViewer(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNHelpArticlePage(resolved, variant);
}

// Video Tutorials Gallery
export function generateRNVideoTutorialsGallery(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Tutorial {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views?: number;
}

interface VideoTutorialsGalleryProps {
  tutorials: Tutorial[];
  onPress?: (tutorial: Tutorial) => void;
}

export default function VideoTutorialsGallery({ tutorials, onPress }: VideoTutorialsGalleryProps) {
  const renderItem = ({ item }: { item: Tutorial }) => (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(item)}>
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.playButton}>
          <Ionicons name="play" size={24} color="#fff" />
        </View>
        <View style={styles.duration}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.views !== undefined && (
          <Text style={styles.views}>{item.views.toLocaleString()} views</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={tutorials}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  row: {
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  thumbnailContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  views: {
    fontSize: 12,
    color: '#6b7280',
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';"],
  };
}

// Tutorial Walkthrough
export function generateRNTutorialWalkthrough(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Step {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface TutorialWalkthroughProps {
  steps: Step[];
  onComplete?: () => void;
  onSkip?: () => void;
}

export default function TutorialWalkthrough({ steps, onComplete, onSkip }: TutorialWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { width } = Dimensions.get('window');

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {step.image && (
          <Image source={{ uri: step.image }} style={[styles.image, { width: width - 80 }]} resizeMode="contain" />
        )}

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {steps.map((_, index) => (
            <View key={index} style={[styles.dot, currentStep === index && styles.dotActive]} />
          ))}
        </View>

        <View style={styles.buttons}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    height: 240,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingVertical: 20,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  dotActive: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  prevButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';"],
  };
}

// Guided Tour Walkthrough
export function generateRNGuidedTourWalkthrough(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNTutorialWalkthrough(resolved, variant);
}

// Troubleshooting Wizard
export function generateRNTroubleshootingWizard(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WizardStep {
  id: string;
  question: string;
  options: { id: string; text: string; nextStep?: string; solution?: string }[];
}

interface TroubleshootingWizardProps {
  steps: WizardStep[];
  onComplete?: (path: string[]) => void;
  onContactSupport?: () => void;
}

export default function TroubleshootingWizard({ steps, onComplete, onContactSupport }: TroubleshootingWizardProps) {
  const [currentStepId, setCurrentStepId] = useState(steps[0]?.id);
  const [path, setPath] = useState<string[]>([]);
  const [solution, setSolution] = useState<string | null>(null);

  const currentStep = steps.find(s => s.id === currentStepId);

  const handleSelect = (option: { id: string; text: string; nextStep?: string; solution?: string }) => {
    const newPath = [...path, option.id];
    setPath(newPath);

    if (option.solution) {
      setSolution(option.solution);
      onComplete?.(newPath);
    } else if (option.nextStep) {
      setCurrentStepId(option.nextStep);
    }
  };

  const handleRestart = () => {
    setCurrentStepId(steps[0]?.id);
    setPath([]);
    setSolution(null);
  };

  if (solution) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.solutionContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
          </View>
          <Text style={styles.solutionTitle}>Here's the solution</Text>
          <Text style={styles.solutionText}>{solution}</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handleRestart}>
            <Text style={styles.primaryButtonText}>Start Over</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onContactSupport}>
            <Text style={styles.secondaryButtonText}>Still need help?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  if (!currentStep) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.progress}>
        <Text style={styles.progressText}>Step {path.length + 1}</Text>
      </View>

      <Text style={styles.question}>{currentStep.question}</Text>

      <View style={styles.options}>
        {currentStep.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionButton}
            onPress={() => handleSelect(option)}
          >
            <Text style={styles.optionText}>{option.text}</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        ))}
      </View>

      {path.length > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={() => {
          setPath(path.slice(0, -1));
          const prevStepId = path.length > 1
            ? steps.find(s => s.options.some(o => o.nextStep === currentStepId))?.id
            : steps[0]?.id;
          if (prevStepId) setCurrentStepId(prevStepId);
        }}>
          <Ionicons name="arrow-back" size={20} color="#3b82f6" />
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  progress: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    lineHeight: 32,
  },
  options: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  solutionContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  solutionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  solutionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    padding: 12,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';"],
  };
}

// Support Ticket List Help
export function generateRNSupportTicketListHelp(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Ticket {
  id: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastUpdate: string;
}

interface SupportTicketListHelpProps {
  tickets: Ticket[];
  onPress?: (ticket: Ticket) => void;
  onCreateNew?: () => void;
}

export default function SupportTicketListHelp({ tickets, onPress, onCreateNew }: SupportTicketListHelpProps) {
  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return '#3b82f6';
      case 'pending': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'high': return { name: 'alert-circle', color: '#ef4444' };
      case 'medium': return { name: 'remove-circle', color: '#f59e0b' };
      default: return { name: 'ellipse', color: '#10b981' };
    }
  };

  const renderItem = ({ item }: { item: Ticket }) => {
    const priorityIcon = getPriorityIcon(item.priority);
    return (
      <TouchableOpacity style={styles.ticket} onPress={() => onPress?.(item)}>
        <View style={styles.ticketHeader}>
          <Text style={styles.ticketId}>#{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={styles.subject}>{item.subject}</Text>
        <View style={styles.ticketFooter}>
          <Ionicons name={priorityIcon.name as any} size={16} color={priorityIcon.color} />
          <Text style={styles.footerText}>Updated {item.lastUpdate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>My Tickets</Text>
            <TouchableOpacity style={styles.newButton} onPress={onCreateNew}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.newButtonText}>New</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="ticket" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No tickets yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  newButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  ticket: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';"],
  };
}

// Support Ticket Detail Help
export function generateRNSupportTicketDetailHelp(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNHelpArticlePage(resolved, variant);
}

// Live Chat Widget Help
export function generateRNLiveChatWidgetHelp(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: string;
}

interface LiveChatWidgetHelpProps {
  messages?: Message[];
  agentName?: string;
  agentAvatar?: string;
  isOnline?: boolean;
  onSend?: (text: string) => void;
  onClose?: () => void;
}

export default function LiveChatWidgetHelp({
  messages = [],
  agentName = 'Support Agent',
  isOnline = true,
  onSend,
  onClose
}: LiveChatWidgetHelpProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend?.(text);
      setText('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.agentInfo}>
          <View style={styles.agentAvatar}>
            <Ionicons name="headset" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.agentName}>{agentName}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
              <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
            </View>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sender === 'user' ? styles.userMessage : styles.agentMessage]}>
            <View style={[styles.bubble, item.sender === 'user' ? styles.userBubble : styles.agentBubble]}>
              <Text style={[styles.messageText, item.sender === 'user' && styles.userMessageText]}>
                {item.text}
              </Text>
            </View>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        )}
        contentContainerStyle={styles.messages}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  statusDotOnline: {
    backgroundColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
  },
  messages: {
    padding: 16,
  },
  message: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  agentMessage: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';"],
  };
}

// Review Helpful Voting
export function generateRNReviewHelpfulVoting(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReviewHelpfulVotingProps {
  helpfulCount?: number;
  notHelpfulCount?: number;
  userVote?: 'helpful' | 'not-helpful' | null;
  onVote?: (vote: 'helpful' | 'not-helpful') => void;
}

export default function ReviewHelpfulVoting({
  helpfulCount = 0,
  notHelpfulCount = 0,
  userVote = null,
  onVote
}: ReviewHelpfulVotingProps) {
  const [vote, setVote] = useState(userVote);
  const [helpful, setHelpful] = useState(helpfulCount);
  const [notHelpful, setNotHelpful] = useState(notHelpfulCount);

  const handleVote = (newVote: 'helpful' | 'not-helpful') => {
    if (vote === newVote) {
      setVote(null);
      if (newVote === 'helpful') setHelpful(helpful - 1);
      else setNotHelpful(notHelpful - 1);
    } else {
      if (vote === 'helpful') setHelpful(helpful - 1);
      if (vote === 'not-helpful') setNotHelpful(notHelpful - 1);
      setVote(newVote);
      if (newVote === 'helpful') setHelpful(helpful + 1);
      else setNotHelpful(notHelpful + 1);
    }
    onVote?.(newVote);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Was this helpful?</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, vote === 'helpful' && styles.buttonActive]}
          onPress={() => handleVote('helpful')}
        >
          <Ionicons
            name={vote === 'helpful' ? 'thumbs-up' : 'thumbs-up-outline'}
            size={18}
            color={vote === 'helpful' ? '#10b981' : '#6b7280'}
          />
          <Text style={[styles.buttonText, vote === 'helpful' && styles.buttonTextActive]}>
            Yes ({helpful})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, vote === 'not-helpful' && styles.buttonActiveNo]}
          onPress={() => handleVote('not-helpful')}
        >
          <Ionicons
            name={vote === 'not-helpful' ? 'thumbs-down' : 'thumbs-down-outline'}
            size={18}
            color={vote === 'not-helpful' ? '#ef4444' : '#6b7280'}
          />
          <Text style={[styles.buttonText, vote === 'not-helpful' && styles.buttonTextActiveNo]}>
            No ({notHelpful})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  buttonActive: {
    backgroundColor: '#d1fae5',
  },
  buttonActiveNo: {
    backgroundColor: '#fee2e2',
  },
  buttonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  buttonTextActive: {
    color: '#10b981',
    fontWeight: '500',
  },
  buttonTextActiveNo: {
    color: '#ef4444',
    fontWeight: '500',
  },
});`,
    imports: ["import React, { useState } from 'react';", "import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';"],
  };
}

// Help Sidebar Contextual
export function generateRNHelpSidebarContextual(resolved: ResolvedComponent, variant: string = 'minimal') {
  return generateRNHelpCenterHome(resolved, variant);
}

// Changelog Display
export function generateRNChangelogDisplay(resolved: ResolvedComponent, variant: string = 'minimal') {
  return {
    code: `import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: { type: 'feature' | 'fix' | 'improvement'; description: string }[];
}

interface ChangelogDisplayProps {
  entries: ChangelogEntry[];
}

export default function ChangelogDisplay({ entries }: ChangelogDisplayProps) {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'feature': return { icon: 'add-circle', color: '#10b981', bg: '#d1fae5', label: 'New' };
      case 'fix': return { icon: 'bug', color: '#ef4444', bg: '#fee2e2', label: 'Fix' };
      default: return { icon: 'arrow-up-circle', color: '#3b82f6', bg: '#dbeafe', label: 'Improved' };
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>What's New</Text>

      {entries.map((entry, index) => (
        <View key={index} style={styles.entry}>
          <View style={styles.entryHeader}>
            <Text style={styles.version}>v{entry.version}</Text>
            <Text style={styles.date}>{entry.date}</Text>
          </View>

          <View style={styles.changesList}>
            {entry.changes.map((change, changeIndex) => {
              const config = getTypeConfig(change.type);
              return (
                <View key={changeIndex} style={styles.change}>
                  <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
                    <Ionicons name={config.icon as any} size={14} color={config.color} />
                    <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
                  </View>
                  <Text style={styles.changeText}>{change.description}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
  },
  entry: {
    marginBottom: 32,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  version: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
  },
  changesList: {
    gap: 12,
  },
  change: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  changeText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});`,
    imports: ["import React from 'react';", "import { View, Text, StyleSheet, ScrollView } from 'react-native';"],
  };
}
