import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNBlogPostContent = (
  resolved: ResolvedComponent,
  variant: 'standard' | 'scrollable' = 'standard'
) => {
  const dataSource = resolved.dataSource;

  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Fallback to common field names
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    return `propData?.${fieldName} || ''`;
  };

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
  const entityName = dataSource || 'posts';

  const variants = {
    standard: `
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BlogPostContentProps {
  ${dataName}?: any;
  postId?: string | number;
  entity?: string;
  [key: string]: any;
}

export default function BlogPostContent({ ${dataName}: propData, postId, entity = '${entityName}' }: BlogPostContentProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API if no props data provided and postId is given
  useEffect(() => {
    const fetchData = async () => {
      if (propData || !postId) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}/\${postId}\`);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post content');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, postId, propData]);

  const postData = propData || fetchedData || {};

  // Loading state
  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  // Error state
  if (error && !propData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Map actual API fields dynamically
  const content = postData?.content || postData?.body || '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        <Text style={styles.text}>{content}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  text: {
    fontSize: 16,
    lineHeight: 28,
    color: '#374151',
    fontFamily: 'System',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});
    `,

    scrollable: `
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BlogPostContentProps {
  ${dataName}?: any;
  postId?: string | number;
  entity?: string;
  [key: string]: any;
}

export default function BlogPostContent({ ${dataName}: propData, postId, entity = '${entityName}' }: BlogPostContentProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API if no props data provided and postId is given
  useEffect(() => {
    const fetchData = async () => {
      if (propData || !postId) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/\${entity}/\${postId}\`);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post content');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [entity, postId, propData]);

  const postData = propData || fetchedData || {};

  // Loading state
  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  // Error state
  if (error && !propData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Map actual API fields dynamically
  const content = postData?.content || postData?.body || '';
  const contentParagraphs = content.split('\\n').filter((p: string) => p.trim());

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.content}>
        {contentParagraphs.map((paragraph: string, index: number) => (
          <Text key={index} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 28,
    color: '#374151',
    marginBottom: 16,
    fontFamily: 'System',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
  },
});
    `
  };

  const code = variants[variant] || variants.standard;
  return {
    code,
    imports: [
      "import React from 'react';",
      "import { View, Text, ScrollView, StyleSheet } from 'react-native';",
    ],
  };
};
