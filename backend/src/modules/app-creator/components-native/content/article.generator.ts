/**
 * Article/Content Component Generators (React Native)
 *
 * Generators for article, blog, and content-related components.
 * Uses React Native patterns with FlatList, ScrollView, and native styling.
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';

export interface ArticleOptions {
  componentName?: string;
  entity?: string;
  title?: string;
  showAuthor?: boolean;
  showComments?: boolean;
  endpoint?: string;
  queryKey?: string;
  detailScreen?: string;
}

/**
 * Generate Article Content component - displays full article with author and tags
 */
export function generateArticleContent(options: ArticleOptions = {}): string {
  const {
    entity = 'article',
    showAuthor = true,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || 'ArticleContent';
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import RenderHtml from 'react-native-render-html';

interface Article {
  id: string;
  title: string;
  content: string;
  author: { name: string; avatar: string };
  publishedAt: string;
  readTime: number;
  tags: string[];
}

interface ${componentName}Props {
  articleId?: string;
  article?: Article;
}

const ${componentName}: React.FC<${componentName}Props> = ({ articleId, article: propArticle }) => {
  const { width } = useWindowDimensions();

  const { data: fetchedArticle, isLoading, error } = useQuery({
    queryKey: ['${queryKey}', articleId],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}/' + articleId);
        return response?.data || response;
      } catch (err) {
        console.error('Failed to fetch article:', err);
        return null;
      }
    },
    enabled: !propArticle && !!articleId,
  });

  const article = propArticle || fetchedArticle;

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonMeta} />
          <View style={styles.skeletonContent} />
          <View style={styles.skeletonContent} />
          <View style={[styles.skeletonContent, { width: '80%' }]} />
        </View>
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text style={styles.errorText}>Article not found</Text>
        </View>
      </View>
    );
  }

  const authorName = article.author?.name || 'Anonymous';
  const authorAvatar = article.author?.avatar;
  const publishedDate = article.publishedAt || article.published_at || article.created_at;
  const readTime = article.readTime || article.read_time || 5;
  const tags = article.tags || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{article.title}</Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          ${showAuthor ? `{/* Author */}
          <View style={styles.authorContainer}>
            {authorAvatar ? (
              <Image source={{ uri: authorAvatar }} style={styles.authorAvatar} />
            ) : (
              <View style={styles.authorAvatarPlaceholder}>
                <Text style={styles.authorInitial}>
                  {authorName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.authorName}>{authorName}</Text>
          </View>` : ''}

          <View style={styles.metaDivider} />

          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{formatDate(publishedDate)}</Text>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.metaText}>{readTime} min read</Text>
          </View>
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags.map((tag: string, i: number) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <RenderHtml
          contentWidth={width - 32}
          source={{ html: article.content || '' }}
          tagsStyles={{
            p: { fontSize: 16, lineHeight: 24, color: '#374151', marginBottom: 16 },
            h2: { fontSize: 22, fontWeight: '700', color: '#111827', marginTop: 24, marginBottom: 12 },
            h3: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 20, marginBottom: 8 },
            ul: { marginLeft: 16 },
            li: { fontSize: 16, lineHeight: 24, color: '#374151', marginBottom: 8 },
            a: { color: '#2563EB' },
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    padding: 16,
  },
  skeletonTitle: {
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    width: '80%',
    marginBottom: 12,
  },
  skeletonMeta: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '50%',
    marginBottom: 24,
  },
  skeletonContent: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '100%',
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginTop: 12,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 36,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  authorAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authorName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  contentContainer: {
    padding: 16,
  },
});

export default ${componentName};
`;
}

/**
 * Generate Article Feedback component - allows users to rate article helpfulness
 */
export function generateArticleFeedback(options: ArticleOptions = {}): string {
  const componentName = options.componentName || 'ArticleFeedback';

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  articleId?: string;
  onSubmit?: (feedback: { helpful: boolean; comment: string }) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ articleId, onSubmit }) => {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleSubmit = () => {
    if (helpful === null) return;

    console.log('Feedback submitted:', { articleId, helpful, feedback });

    if (onSubmit) {
      onSubmit({ helpful, comment: feedback });
    }

    setSubmitted(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  if (submitted) {
    return (
      <Animated.View style={[styles.successContainer, { opacity: fadeAnim }]}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={32} color="#10B981" />
        </View>
        <Text style={styles.successTitle}>Thank you for your feedback!</Text>
        <Text style={styles.successText}>Your input helps us improve our content.</Text>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Was this article helpful?</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.feedbackButton,
            helpful === true && styles.feedbackButtonActive,
            helpful === true && styles.feedbackButtonPositive,
          ]}
          onPress={() => setHelpful(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="thumbs-up"
            size={20}
            color={helpful === true ? '#10B981' : '#6B7280'}
          />
          <Text style={[
            styles.feedbackButtonText,
            helpful === true && styles.feedbackButtonTextActive,
          ]}>
            Yes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.feedbackButton,
            helpful === false && styles.feedbackButtonActive,
            helpful === false && styles.feedbackButtonNegative,
          ]}
          onPress={() => setHelpful(false)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="thumbs-down"
            size={20}
            color={helpful === false ? '#EF4444' : '#6B7280'}
          />
          <Text style={[
            styles.feedbackButtonText,
            helpful === false && styles.feedbackButtonTextNegative,
          ]}>
            No
          </Text>
        </TouchableOpacity>
      </View>

      {helpful !== null && (
        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>
            {helpful ? 'What did you find most useful?' : 'How can we improve this article?'}
          </Text>
          <TextInput
            style={styles.commentInput}
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Your feedback (optional)..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  feedbackButtonActive: {
    borderWidth: 2,
  },
  feedbackButtonPositive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  feedbackButtonNegative: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  feedbackButtonTextActive: {
    color: '#10B981',
  },
  feedbackButtonTextNegative: {
    color: '#EF4444',
  },
  commentSection: {
    marginTop: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successIcon: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  successText: {
    fontSize: 14,
    color: '#047857',
  },
});

export default ${componentName};
`;
}

/**
 * Generate Article Sidebar component - table of contents and related articles
 */
export function generateArticleSidebar(options: ArticleOptions = {}): string {
  const {
    entity = 'article',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || 'ArticleSidebar';
  const detailScreen = options.detailScreen || `${pascalCase(entity)}Detail`;

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface RelatedArticle {
  id: string;
  title: string;
  thumbnail: string;
  readTime: number;
}

interface ${componentName}Props {
  currentArticleId?: string;
  tableOfContents?: string[];
  relatedArticles?: RelatedArticle[];
  onSectionPress?: (section: string) => void;
  showNewsletter?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  currentArticleId,
  tableOfContents: propToc,
  relatedArticles: propRelated,
  onSectionPress,
  showNewsletter = true,
}) => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [tableOfContents, setTableOfContents] = useState<string[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);

  useEffect(() => {
    if (propToc) {
      setTableOfContents(propToc);
    } else {
      // Default TOC
      setTableOfContents([
        'Introduction',
        'Key Technologies',
        'Best Practices',
        'Getting Started',
        'Conclusion',
      ]);
    }

    if (propRelated) {
      setRelatedArticles(propRelated);
    } else {
      // Default related articles
      setRelatedArticles([
        { id: '2', title: 'Advanced React Patterns', thumbnail: 'https://via.placeholder.com/80', readTime: 8 },
        { id: '3', title: 'State Management Best Practices', thumbnail: 'https://via.placeholder.com/80', readTime: 6 },
        { id: '4', title: 'Testing React Applications', thumbnail: 'https://via.placeholder.com/80', readTime: 10 },
      ]);
    }
  }, [currentArticleId, propToc, propRelated]);

  const handleSectionPress = (section: string) => {
    if (onSectionPress) {
      onSectionPress(section);
    }
  };

  const handleArticlePress = (article: RelatedArticle) => {
    navigation.navigate('${detailScreen}', { id: article.id });
  };

  const handleSubscribe = () => {
    console.log('Subscribe:', email);
    setEmail('');
    // Handle subscription logic
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Table of Contents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Table of Contents</Text>
        {tableOfContents.map((section, i) => (
          <TouchableOpacity
            key={i}
            style={styles.tocItem}
            onPress={() => handleSectionPress(section)}
            activeOpacity={0.7}
          >
            <View style={styles.tocBullet} />
            <Text style={styles.tocText}>{section}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Related Articles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Related Articles</Text>
        {relatedArticles.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={styles.relatedCard}
            onPress={() => handleArticlePress(article)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: article.thumbnail }}
              style={styles.relatedImage}
            />
            <View style={styles.relatedContent}>
              <Text style={styles.relatedTitle} numberOfLines={2}>
                {article.title}
              </Text>
              <View style={styles.relatedMeta}>
                <Ionicons name="time-outline" size={12} color="#6B7280" />
                <Text style={styles.relatedTime}>{article.readTime} min read</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Newsletter */}
      {showNewsletter && (
        <View style={styles.newsletterSection}>
          <Text style={styles.newsletterTitle}>Subscribe to Newsletter</Text>
          <Text style={styles.newsletterText}>
            Get the latest articles delivered to your inbox.
          </Text>
          <TextInput
            style={styles.emailInput}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <Text style={styles.subscribeButtonText}>Subscribe</Text>
          </TouchableOpacity>
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  tocItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tocBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginRight: 12,
  },
  tocText: {
    fontSize: 14,
    color: '#4B5563',
  },
  relatedCard: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  relatedImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  relatedContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
  },
  relatedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  relatedTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  newsletterSection: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  newsletterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  newsletterText: {
    fontSize: 14,
    color: '#1E3A8A',
    marginBottom: 12,
  },
  emailInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}

/**
 * Generate Author Card component - compact author info card
 */
export function generateAuthorCard(options: ArticleOptions = {}): string {
  const componentName = options.componentName || 'AuthorCard';

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  articles: number;
  followers: number;
  socialLinks?: { platform: string; url: string }[];
}

interface ${componentName}Props {
  author?: Author;
  onFollowPress?: () => void;
  isFollowing?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  author,
  onFollowPress,
  isFollowing = false,
}) => {
  const defaultAuthor: Author = author || {
    id: '1',
    name: 'John Doe',
    avatar: 'https://via.placeholder.com/80',
    bio: 'Senior developer with 10+ years of experience in web technologies. Passionate about sharing knowledge and helping others learn.',
    articles: 45,
    followers: 1234,
    socialLinks: [
      { platform: 'Twitter', url: '#' },
      { platform: 'LinkedIn', url: '#' },
      { platform: 'GitHub', url: '#' },
    ],
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return 'logo-twitter';
      case 'linkedin':
        return 'logo-linkedin';
      case 'github':
        return 'logo-github';
      case 'facebook':
        return 'logo-facebook';
      case 'instagram':
        return 'logo-instagram';
      default:
        return 'link-outline';
    }
  };

  const handleSocialPress = (url: string) => {
    if (url && url !== '#') {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Avatar */}
        {defaultAuthor.avatar ? (
          <Image source={{ uri: defaultAuthor.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {defaultAuthor.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Author Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{defaultAuthor.name}</Text>
          <Text style={styles.bio} numberOfLines={2}>
            {defaultAuthor.bio}
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="document-text-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>{defaultAuthor.articles} articles</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={14} color="#6B7280" />
              <Text style={styles.statText}>
                {defaultAuthor.followers.toLocaleString()} followers
              </Text>
            </View>
          </View>

          {/* Social Links */}
          {defaultAuthor.socialLinks && defaultAuthor.socialLinks.length > 0 && (
            <View style={styles.socialRow}>
              {defaultAuthor.socialLinks.map((link, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.socialButton}
                  onPress={() => handleSocialPress(link.url)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={getSocialIcon(link.platform) as any}
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Follow Button */}
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing && styles.followingButton,
          ]}
          onPress={onFollowPress}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.followButtonText,
            isFollowing && styles.followingButtonText,
          ]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 8,
  },
  socialButton: {
    padding: 6,
  },
  followButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  followingButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#374151',
  },
});

export default ${componentName};
`;
}

/**
 * Generate Author Profile component - full author profile with articles
 */
export function generateAuthorProfile(options: ArticleOptions = {}): string {
  const {
    entity = 'article',
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || 'AuthorProfile';
  const detailScreen = options.detailScreen || `${pascalCase(entity)}Detail`;

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readTime: number;
}

interface ${componentName}Props {
  authorId?: string;
  author?: any;
  onFollowPress?: () => void;
  isFollowing?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  authorId,
  author: propAuthor,
  onFollowPress,
  isFollowing = false,
}) => {
  const navigation = useNavigation<any>();
  const [author, setAuthor] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState('articles');

  useEffect(() => {
    if (propAuthor) {
      setAuthor(propAuthor);
    } else {
      // Default author data
      setAuthor({
        id: authorId || '1',
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/120',
        bio: 'Senior developer with 10+ years of experience. I write about web development, software architecture, and best practices.',
        location: 'San Francisco, CA',
        website: 'https://example.com',
        joinedAt: '2020-01-15',
        stats: { articles: 45, followers: 1234, following: 89 },
      });
    }

    // Default articles
    setArticles([
      { id: '1', title: 'Getting Started with React', excerpt: 'A comprehensive guide...', publishedAt: '2024-01-15', readTime: 8 },
      { id: '2', title: 'Advanced TypeScript Patterns', excerpt: 'Explore advanced patterns...', publishedAt: '2024-01-10', readTime: 12 },
      { id: '3', title: 'Building Scalable APIs', excerpt: 'Best practices for building...', publishedAt: '2024-01-05', readTime: 10 },
    ]);
  }, [authorId, propAuthor]);

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleArticlePress = (article: Article) => {
    navigation.navigate('${detailScreen}', { id: article.id });
  };

  const handleWebsitePress = () => {
    if (author?.website) {
      Linking.openURL(author.website);
    }
  };

  if (!author) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonText} />
        <View style={[styles.skeletonText, { width: '60%' }]} />
      </View>
    );
  }

  const tabs = ['articles', 'about', 'followers'];

  const renderHeader = () => (
    <View>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileTop}>
          {author.avatar ? (
            <Image source={{ uri: author.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {author.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.name}>{author.name}</Text>
            <Text style={styles.bio} numberOfLines={3}>{author.bio}</Text>

            <View style={styles.metaRow}>
              {author.location && (
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>{author.location}</Text>
                </View>
              )}
              {author.website && (
                <TouchableOpacity style={styles.metaItem} onPress={handleWebsitePress}>
                  <Ionicons name="link-outline" size={14} color="#2563EB" />
                  <Text style={[styles.metaText, styles.linkText]}>{author.website}</Text>
                </TouchableOpacity>
              )}
              {author.joinedAt && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text style={styles.metaText}>
                    Joined {formatDate(author.joinedAt)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{author.stats?.articles || 0}</Text>
            <Text style={styles.statLabel}>Articles</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {(author.stats?.followers || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{author.stats?.following || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Follow Button */}
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.followingButton]}
          onPress={onFollowPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => handleArticlePress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.articleTitle}>{item.title}</Text>
      <Text style={styles.articleExcerpt} numberOfLines={2}>{item.excerpt}</Text>
      <View style={styles.articleMeta}>
        <View style={styles.articleMetaItem}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.articleMetaText}>{formatDate(item.publishedAt)}</Text>
        </View>
        <View style={styles.articleMetaItem}>
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text style={styles.articleMetaText}>{item.readTime} min read</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={activeTab === 'articles' ? articles : []}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          activeTab !== 'articles' ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'about' ? author.bio : 'No followers yet'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  skeletonAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  skeletonText: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '80%',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  linkText: {
    color: '#2563EB',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  followingButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#374151',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 15,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  articleExcerpt: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 10,
  },
  articleMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  articleMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articleMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}

/**
 * Generate Blog Author component - compact author attribution
 */
export function generateBlogAuthor(options: ArticleOptions = {}): string {
  const componentName = options.componentName || 'BlogAuthor';

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

interface ${componentName}Props {
  author?: {
    name: string;
    avatar: string;
    bio: string;
  };
}

const ${componentName}: React.FC<${componentName}Props> = ({ author }) => {
  const defaultAuthor = author || {
    name: 'Jane Smith',
    avatar: 'https://via.placeholder.com/60',
    bio: 'Content writer and editor with expertise in technology and business topics.',
  };

  return (
    <View style={styles.container}>
      {defaultAuthor.avatar ? (
        <Image source={{ uri: defaultAuthor.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitial}>
            {defaultAuthor.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.label}>Written by</Text>
        <Text style={styles.name}>{defaultAuthor.name}</Text>
        <Text style={styles.bio} numberOfLines={2}>{defaultAuthor.bio}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default ${componentName};
`;
}

/**
 * Generate Blog Sidebar component - search, categories, recent posts, tags
 */
export function generateBlogSidebar(options: ArticleOptions = {}): string {
  const {
    entity = 'post',
  } = options;

  const componentName = options.componentName || 'BlogSidebar';
  const detailScreen = options.detailScreen || `${pascalCase(entity)}Detail`;

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface RecentPost {
  id: string;
  title: string;
  date: string;
}

interface ${componentName}Props {
  onSearch?: (query: string) => void;
  onCategoryPress?: (category: Category) => void;
  onTagPress?: (tag: string) => void;
  categories?: Category[];
  recentPosts?: RecentPost[];
  tags?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onSearch,
  onCategoryPress,
  onTagPress,
  categories: propCategories,
  recentPosts: propPosts,
  tags: propTags,
}) => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    setCategories(propCategories || [
      { id: '1', name: 'Technology', count: 24 },
      { id: '2', name: 'Business', count: 18 },
      { id: '3', name: 'Design', count: 12 },
      { id: '4', name: 'Development', count: 32 },
      { id: '5', name: 'Marketing', count: 15 },
    ]);

    setRecentPosts(propPosts || [
      { id: '1', title: 'How to Build a Successful Startup', date: '2024-01-15' },
      { id: '2', title: 'The Future of AI in Web Development', date: '2024-01-12' },
      { id: '3', title: 'Design Trends for 2024', date: '2024-01-10' },
    ]);

    setTags(propTags || [
      'React', 'JavaScript', 'TypeScript', 'CSS', 'Node.js',
      'Design', 'UX', 'AI', 'Cloud',
    ]);
  }, [propCategories, propPosts, propTags]);

  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handlePostPress = (post: RecentPost) => {
    navigation.navigate('${detailScreen}', { id: post.id });
  };

  const handleCategoryPress = (category: Category) => {
    if (onCategoryPress) {
      onCategoryPress(category);
    }
  };

  const handleTagPress = (tag: string) => {
    if (onTagPress) {
      onTagPress(tag);
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Search */}
      <View style={styles.section}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search articles..."
            placeholderTextColor="#9CA3AF"
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryName}>{category.name}</Text>
            <View style={styles.categoryCount}>
              <Text style={styles.categoryCountText}>{category.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Posts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Posts</Text>
        {recentPosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={styles.recentPost}
            onPress={() => handlePostPress(post)}
            activeOpacity={0.7}
          >
            <Text style={styles.recentPostTitle} numberOfLines={2}>
              {post.title}
            </Text>
            <Text style={styles.recentPostDate}>{formatDate(post.date)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tags */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Tags</Text>
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.tag}
              onPress={() => handleTagPress(tag)}
              activeOpacity={0.7}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#111827',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryName: {
    fontSize: 15,
    color: '#374151',
  },
  categoryCount: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryCountText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  recentPost: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recentPostTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 4,
  },
  recentPostDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

/**
 * Generate Featured Article component - hero-style featured article card
 */
export function generateFeaturedArticle(options: ArticleOptions = {}): string {
  const {
    entity = 'article',
  } = options;

  const componentName = options.componentName || 'FeaturedArticle';
  const detailScreen = options.detailScreen || `${pascalCase(entity)}Detail`;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ${componentName}Props {
  article?: {
    id: string;
    title: string;
    excerpt: string;
    image: string;
    author: { name: string; avatar: string };
    publishedAt: string;
    category: string;
  };
  onPress?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ article, onPress }) => {
  const navigation = useNavigation<any>();

  const defaultArticle = article || {
    id: '1',
    title: 'The Complete Guide to Modern Web Development',
    excerpt: 'Discover the latest tools, frameworks, and best practices that are shaping the future of web development in 2024 and beyond.',
    image: 'https://via.placeholder.com/800x400',
    author: { name: 'John Doe', avatar: 'https://via.placeholder.com/40' },
    publishedAt: new Date().toISOString(),
    category: 'Development',
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('${detailScreen}', { id: defaultArticle.id });
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const authorName = defaultArticle.author?.name || 'Anonymous';
  const authorAvatar = defaultArticle.author?.avatar;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Background Image */}
      {defaultArticle.image ? (
        <Image source={{ uri: defaultArticle.image }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={48} color="#6B7280" />
        </View>
      )}

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{defaultArticle.category}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {defaultArticle.title}
        </Text>

        {/* Excerpt */}
        <Text style={styles.excerpt} numberOfLines={2}>
          {defaultArticle.excerpt}
        </Text>

        {/* Author & Date */}
        <View style={styles.metaRow}>
          <View style={styles.authorContainer}>
            {authorAvatar ? (
              <Image source={{ uri: authorAvatar }} style={styles.authorAvatar} />
            ) : (
              <View style={styles.authorAvatarPlaceholder}>
                <Text style={styles.authorInitial}>
                  {authorName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.authorName}>{authorName}</Text>
          </View>

          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />
            <Text style={styles.dateText}>
              {formatDate(defaultArticle.publishedAt)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 32,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  excerpt: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 20,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  authorAvatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorInitial: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  authorName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default ${componentName};
`;
}

/**
 * Generate Related Articles component - grid of related articles
 */
export function generateRelatedArticles(options: ArticleOptions = {}): string {
  const {
    entity = 'article',
  } = options;

  const componentName = options.componentName || 'RelatedArticles';
  const detailScreen = options.detailScreen || `${pascalCase(entity)}Detail`;

  return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

interface Article {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  readTime: number;
}

interface ${componentName}Props {
  currentArticleId?: string;
  articles?: Article[];
  limit?: number;
  title?: string;
  onArticlePress?: (article: Article) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  currentArticleId,
  articles: propArticles,
  limit = 4,
  title = 'Related Articles',
  onArticlePress,
}) => {
  const navigation = useNavigation<any>();
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (propArticles) {
      setArticles(propArticles.slice(0, limit));
    } else {
      // Default related articles
      setArticles([
        { id: '2', title: 'Advanced React Patterns You Should Know', thumbnail: 'https://via.placeholder.com/300x200', category: 'React', readTime: 8 },
        { id: '3', title: 'Building Type-Safe APIs with TypeScript', thumbnail: 'https://via.placeholder.com/300x200', category: 'TypeScript', readTime: 10 },
        { id: '4', title: 'State Management Best Practices', thumbnail: 'https://via.placeholder.com/300x200', category: 'Architecture', readTime: 7 },
        { id: '5', title: 'Modern CSS Techniques', thumbnail: 'https://via.placeholder.com/300x200', category: 'CSS', readTime: 6 },
      ].slice(0, limit));
    }
  }, [currentArticleId, propArticles, limit]);

  const handleArticlePress = (article: Article) => {
    if (onArticlePress) {
      onArticlePress(article);
    } else {
      navigation.navigate('${detailScreen}', { id: article.id });
    }
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleArticlePress(item)}
      activeOpacity={0.8}
    >
      {item.thumbnail ? (
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons name="image-outline" size={32} color="#9CA3AF" />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.readTime}>
          <Ionicons name="time-outline" size={12} color="#6B7280" />
          <Text style={styles.readTimeText}>{item.readTime} min read</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!articles.length) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnail: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 18,
    marginBottom: 8,
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readTimeText: {
    fontSize: 11,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generate About Story component - company/business story with timeline
 */
export function generateAboutStory(options: ArticleOptions = {}): string {
  const componentName = options.componentName || 'AboutStory';

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface Milestone {
  year: string;
  event: string;
}

interface ${componentName}Props {
  companyName?: string;
  story?: string;
  milestones?: Milestone[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  companyName,
  story,
  milestones,
}) => {
  const defaultMilestones: Milestone[] = milestones || [
    { year: '2015', event: 'Company founded' },
    { year: '2017', event: 'Launched first product' },
    { year: '2019', event: 'Expanded to international markets' },
    { year: '2021', event: 'Reached 1 million customers' },
    { year: '2023', event: 'Opened new headquarters' },
  ];

  const defaultStory = story || \`Founded in 2015, \${companyName || 'our company'} started with a simple mission: to make a difference in people's lives through innovative solutions. What began as a small team with big dreams has grown into a global organization serving customers worldwide.

Our journey has been defined by a relentless pursuit of excellence and a commitment to our core values of integrity, innovation, and customer focus.\`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Story Section */}
      <View style={styles.storySection}>
        <Text style={styles.sectionTitle}>Our Story</Text>
        <Text style={styles.storyText}>{defaultStory}</Text>
      </View>

      {/* Journey/Timeline Section */}
      <View style={styles.journeySection}>
        <Text style={styles.sectionTitle}>Our Journey</Text>
        <View style={styles.timeline}>
          {/* Timeline Line */}
          <View style={styles.timelineLine} />

          {/* Milestones */}
          {defaultMilestones.map((milestone, index) => (
            <View key={index} style={styles.milestoneRow}>
              {/* Milestone Number */}
              <View style={styles.milestoneNumber}>
                <Text style={styles.milestoneNumberText}>{index + 1}</Text>
              </View>

              {/* Milestone Content */}
              <View style={styles.milestoneContent}>
                <Text style={styles.milestoneYear}>{milestone.year}</Text>
                <Text style={styles.milestoneEvent}>{milestone.event}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  storySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  storyText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 26,
  },
  journeySection: {
    padding: 20,
    paddingTop: 0,
  },
  timeline: {
    position: 'relative',
    paddingLeft: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 18,
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: '#DBEAFE',
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  milestoneNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  milestoneNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  milestoneContent: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  milestoneYear: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 4,
  },
  milestoneEvent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
});

export default ${componentName};
`;
}

/**
 * Generate CTA Section component - call-to-action section
 */
export function generateCTASection(options: ArticleOptions = {}): string {
  const componentName = options.componentName || 'CTASection';

  return `import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ${componentName}Props {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  backgroundImage?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  title = 'Ready to Get Started?',
  description = 'Join thousands of satisfied customers who have transformed their business with our solutions.',
  primaryButtonText = 'Get Started Free',
  primaryButtonUrl,
  secondaryButtonText,
  secondaryButtonUrl,
  backgroundImage,
  onPrimaryPress,
  onSecondaryPress,
}) => {
  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    } else if (primaryButtonUrl) {
      Linking.openURL(primaryButtonUrl);
    }
  };

  const handleSecondaryPress = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
    } else if (secondaryButtonUrl) {
      Linking.openURL(secondaryButtonUrl);
    }
  };

  const content = (
    <>
      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handlePrimaryPress}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
          </TouchableOpacity>

          {secondaryButtonText && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSecondaryPress}
              activeOpacity={0.9}
            >
              <Text style={styles.secondaryButtonText}>{secondaryButtonText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );

  if (backgroundImage) {
    return (
      <ImageBackground
        source={{ uri: backgroundImage }}
        style={styles.container}
        imageStyle={styles.backgroundImage}
      >
        {content}
      </ImageBackground>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2563EB', '#4F46E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 32,
    marginHorizontal: 16,
    marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 240,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
