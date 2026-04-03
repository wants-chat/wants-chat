import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNRelatedArticles = (
  resolved: ResolvedComponent,
  variant: 'horizontal' | 'vertical' = 'horizontal'
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
    horizontal: `
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface RelatedArticlesProps {
  ${dataName}?: any;
  postId?: string;
  onArticlePress?: (article: any) => void;
  [key: string]: any;
}

export default function RelatedArticles({ ${dataName}: propData, postId, onArticlePress }: RelatedArticlesProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const endpoint = postId ? \`\${apiUrl}/${entityName}/\${postId}/related\` : \`\${apiUrl}/${entityName}/related\`;
        const response = await fetch(endpoint);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch related articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  const articlesData = propData || fetchedData || {};

  // Map actual API fields dynamically
  const articles = articlesData?.posts || articlesData?.articles || articlesData?.data || (Array.isArray(articlesData) ? articlesData : []);
  const title = articlesData?.title || 'Related Articles';

  const handleArticlePress = (article: any) => {
    if (onArticlePress) {
      onArticlePress(article);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {articles.map((article: any, index: number) => {
          const articleTitle = article?.title || 'Untitled';
          const articleImage = article?.featured_image || article?.image_url || article?.thumbnail || 'https://via.placeholder.com/300x200';
          const articleExcerpt = article?.excerpt || article?.summary || '';

          // Handle category
          const categoryObj = article?.category || {};
          const categoryName = typeof categoryObj === 'object' ? categoryObj?.name : article?.category;

          return (
            <TouchableOpacity
              key={article?.id || article?._id || index}
              style={styles.articleCard}
              onPress={() => handleArticlePress(article)}
            >
              <Image
                source={{ uri: articleImage }}
                style={styles.articleImage}
                resizeMode="cover"
              />
              <View style={styles.articleContent}>
                {categoryName ? (
                  <Text style={styles.category}>{categoryName}</Text>
                ) : null}
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {articleTitle}
                </Text>
                {articleExcerpt ? (
                  <Text style={styles.articleExcerpt} numberOfLines={2}>
                    {articleExcerpt}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  articleCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f3f4f6',
  },
  articleContent: {
    padding: 12,
  },
  category: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3b82f6',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 22,
  },
  articleExcerpt: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
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

    vertical: `
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

interface RelatedArticlesProps {
  ${dataName}?: any;
  postId?: string;
  onArticlePress?: (article: any) => void;
  [key: string]: any;
}

export default function RelatedArticles({ ${dataName}: propData, postId, onArticlePress }: RelatedArticlesProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const endpoint = postId ? \`\${apiUrl}/${entityName}/\${postId}/related\` : \`\${apiUrl}/${entityName}/related\`;
        const response = await fetch(endpoint);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch related articles:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [postId]);

  const articlesData = propData || fetchedData || {};

  // Map actual API fields dynamically
  const articles = articlesData?.posts || articlesData?.articles || articlesData?.data || (Array.isArray(articlesData) ? articlesData : []);
  const title = articlesData?.title || 'Related Articles';

  const handleArticlePress = (article: any) => {
    if (onArticlePress) {
      onArticlePress(article);
    }
  };

  const renderArticle = ({ item }: { item: any }) => {
    const articleTitle = item?.title || 'Untitled';
    const articleImage = item?.featured_image || item?.image_url || item?.thumbnail || 'https://via.placeholder.com/100x100';

    // Handle published date
    const publishedAt = item?.published_at || item?.created_at;
    const formattedDate = publishedAt ? new Date(publishedAt).toLocaleDateString() : '';

    return (
      <TouchableOpacity
        style={styles.articleItem}
        onPress={() => handleArticlePress(item)}
      >
        <Image
          source={{ uri: articleImage }}
          style={styles.articleImage}
          resizeMode="cover"
        />
        <View style={styles.articleContent}>
          <Text style={styles.articleTitle} numberOfLines={2}>
            {articleTitle}
          </Text>
          {formattedDate ? (
            <Text style={styles.articleDate}>{formattedDate}</Text>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={articles}
        renderItem={renderArticle}
        keyExtractor={(item, index) => item?.id || item?._id || index.toString()}
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
  articleItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  articleImage: {
    width: 100,
    height: 100,
    backgroundColor: '#f3f4f6',
  },
  articleContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 20,
  },
  articleDate: {
    fontSize: 12,
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

  const code = variants[variant] || variants.horizontal;
  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, ScrollView, Image, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';",
    ],
  };
};
