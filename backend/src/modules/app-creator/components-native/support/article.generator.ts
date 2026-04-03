/**
 * Article Component Generators (React Native)
 *
 * Modular components for article content display, feedback, sidebar, and related articles.
 */

export interface ArticleOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateArticleContent(options: ArticleOptions = {}): string {
  const { componentName = 'ArticleContent', endpoint = '/articles' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: {
    id: string;
    name: string;
    slug?: string;
  };
  tags?: string[];
  read_time?: number;
  views?: number;
  created_at?: string;
  updated_at?: string;
  author?: {
    name: string;
    avatar_url?: string;
  };
}

interface ${componentName}Props {
  article: Article;
  showMeta?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ article, showMeta = true }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {article.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{article.category.name}</Text>
          </View>
        )}
        <Text style={styles.title}>{article.title}</Text>

        {showMeta && (
          <View style={styles.metaRow}>
            {article.read_time && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{article.read_time} min read</Text>
              </View>
            )}
            {article.views !== undefined && (
              <View style={styles.metaItem}>
                <Ionicons name="eye-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{article.views.toLocaleString()} views</Text>
              </View>
            )}
            {article.updated_at && (
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  Updated {new Date(article.updated_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}

        {article.tags && article.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {article.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Ionicons name="pricetag-outline" size={12} color="#6B7280" />
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.contentText}>{article.content}</Text>
      </View>

      {/* Author */}
      {article.author && (
        <View style={styles.authorSection}>
          <View style={styles.authorInfo}>
            {article.author.avatar_url ? (
              <Image source={{ uri: article.author.avatar_url }} style={styles.authorAvatar} />
            ) : (
              <View style={styles.authorAvatarPlaceholder}>
                <Text style={styles.authorInitial}>
                  {article.author.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.authorLabel}>Written by</Text>
              <Text style={styles.authorName}>{article.author.name}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  header: {
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
    marginTop: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  content: {
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
  },
  authorSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  authorAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  authorLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
});

export default ${componentName};
`;
}

export function generateArticleFeedback(options: ArticleOptions = {}): string {
  const { componentName = 'ArticleFeedback', endpoint = '/articles' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  articleId: string;
  showCommentForm?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ articleId, showCommentForm = false }) => {
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const feedbackMutation = useMutation({
    mutationFn: (helpful: boolean) =>
      api.post('${endpoint}/' + articleId + '/feedback', { helpful }),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      api.post('${endpoint}/' + articleId + '/comments', { content }),
    onSuccess: () => {
      setComment('');
      setShowComment(false);
    },
  });

  const handleFeedback = (helpful: boolean) => {
    setFeedback(helpful ? 'helpful' : 'not_helpful');
    feedbackMutation.mutate(helpful);
    if (!helpful && showCommentForm) {
      setShowComment(true);
    }
  };

  const handleSubmitComment = () => {
    if (comment.trim()) {
      commentMutation.mutate(comment.trim());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.question}>Was this article helpful?</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.feedbackButton,
            feedback === 'helpful' && styles.feedbackButtonHelpful,
          ]}
          onPress={() => handleFeedback(true)}
          disabled={feedback !== null || feedbackMutation.isPending}
        >
          {feedbackMutation.isPending && feedback === null ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <Ionicons
              name="thumbs-up"
              size={18}
              color={feedback === 'helpful' ? '#22C55E' : '#6B7280'}
            />
          )}
          <Text
            style={[
              styles.feedbackButtonText,
              feedback === 'helpful' && styles.feedbackButtonTextHelpful,
            ]}
          >
            Yes, helpful
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.feedbackButton,
            feedback === 'not_helpful' && styles.feedbackButtonNotHelpful,
          ]}
          onPress={() => handleFeedback(false)}
          disabled={feedback !== null || feedbackMutation.isPending}
        >
          {feedbackMutation.isPending && feedback === null ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <Ionicons
              name="thumbs-down"
              size={18}
              color={feedback === 'not_helpful' ? '#EF4444' : '#6B7280'}
            />
          )}
          <Text
            style={[
              styles.feedbackButtonText,
              feedback === 'not_helpful' && styles.feedbackButtonTextNotHelpful,
            ]}
          >
            No
          </Text>
        </TouchableOpacity>
      </View>

      {feedback !== null && (
        <Text style={styles.thankYouText}>
          {feedback === 'helpful'
            ? "Great! We're glad this helped."
            : "Sorry this wasn't helpful. We'll work to improve it."}
        </Text>
      )}

      {showComment && showCommentForm && (
        <View style={styles.commentForm}>
          <View style={styles.commentLabelRow}>
            <Ionicons name="chatbubble-outline" size={16} color="#374151" />
            <Text style={styles.commentLabel}>Tell us how we can improve</Text>
          </View>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="What information were you looking for?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!comment.trim() || commentMutation.isPending) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={!comment.trim() || commentMutation.isPending}
          >
            {commentMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={16} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
  },
  question: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    gap: 8,
  },
  feedbackButtonHelpful: {
    borderColor: '#22C55E',
    backgroundColor: '#F0FDF4',
  },
  feedbackButtonNotHelpful: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  feedbackButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  feedbackButtonTextHelpful: {
    color: '#22C55E',
  },
  feedbackButtonTextNotHelpful: {
    color: '#EF4444',
  },
  thankYouText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  commentForm: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  commentLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 80,
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generateArticleSidebar(options: ArticleOptions = {}): string {
  const { componentName = 'ArticleSidebar', endpoint = '/articles' } = options;

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

interface ${componentName}Props {
  currentArticleId?: string;
  categoryId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ currentArticleId, categoryId }) => {
  const navigation = useNavigation();

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['article-categories'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/categories');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const { data: popularArticles, isLoading: loadingPopular } = useQuery({
    queryKey: ['popular-articles'],
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

  return (
    <View style={styles.container}>
      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="folder" size={16} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        {loadingCategories ? (
          <ActivityIndicator size="small" color="#6B7280" style={styles.loader} />
        ) : (
          <View style={styles.list}>
            {categories?.map((category: any) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.listItem,
                  categoryId === category.id && styles.listItemActive,
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <Text
                  style={[
                    styles.listItemText,
                    categoryId === category.id && styles.listItemTextActive,
                  ]}
                >
                  {category.name}
                </Text>
                {category.article_count !== undefined && (
                  <Text style={styles.countBadge}>{category.article_count}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Popular Articles */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trending-up" size={16} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Popular Articles</Text>
        </View>
        {loadingPopular ? (
          <ActivityIndicator size="small" color="#6B7280" style={styles.loader} />
        ) : (
          <View style={styles.list}>
            {popularArticles
              ?.filter((a: any) => a.id !== currentArticleId)
              .slice(0, 5)
              .map((article: any) => (
                <TouchableOpacity
                  key={article.id}
                  style={styles.articleItem}
                  onPress={() => handleArticlePress(article.id)}
                >
                  <Ionicons name="document-text-outline" size={16} color="#6B7280" />
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  loader: {
    paddingVertical: 16,
  },
  list: {
    gap: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  listItemActive: {
    backgroundColor: '#F3E8FF',
  },
  listItemText: {
    fontSize: 14,
    color: '#374151',
  },
  listItemTextActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  countBadge: {
    fontSize: 12,
    color: '#6B7280',
  },
  articleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 10,
  },
  articleTitle: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default ${componentName};
`;
}

export function generateRelatedArticles(options: ArticleOptions = {}): string {
  const { componentName = 'RelatedArticles', endpoint = '/articles' } = options;

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

interface ${componentName}Props {
  articleId: string;
  categoryId?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ articleId, categoryId, limit = 5 }) => {
  const navigation = useNavigation();

  const { data: relatedArticles, isLoading } = useQuery({
    queryKey: ['related-articles', articleId, categoryId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryId) params.append('category', categoryId);
      params.append('exclude', articleId);
      params.append('limit', limit.toString());

      const response = await api.get<any>('${endpoint}/related?' + params.toString());
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleArticlePress = (id: string) => {
    navigation.navigate('ArticleDetail' as never, { id } as never);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6B7280" />
      </View>
    );
  }

  if (!relatedArticles || relatedArticles.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text" size={16} color="#8B5CF6" />
        <Text style={styles.title}>Related Articles</Text>
      </View>

      <View style={styles.list}>
        {relatedArticles.map((article: any) => (
          <TouchableOpacity
            key={article.id}
            style={styles.articleItem}
            onPress={() => handleArticlePress(article.id)}
            activeOpacity={0.7}
          >
            <View style={styles.articleIcon}>
              <Ionicons name="document-text-outline" size={16} color="#6B7280" />
            </View>
            <View style={styles.articleContent}>
              <Text style={styles.articleTitle} numberOfLines={1}>
                {article.title}
              </Text>
              <View style={styles.articleMeta}>
                {article.read_time && (
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                    <Text style={styles.metaText}>{article.read_time} min</Text>
                  </View>
                )}
                {article.category && (
                  <Text style={styles.categoryText}>{article.category.name}</Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  list: {
    // No gap needed, using border separator
  },
  articleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  articleIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
