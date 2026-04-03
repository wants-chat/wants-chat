import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNCommentSection = (
  resolved: ResolvedComponent,
  variant: 'flat' | 'threaded' = 'flat'
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
    flat: `
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';

interface CommentSectionProps {
  ${dataName}?: any;
  entity?: string;
  postId?: string | number;
  [key: string]: any;
}

export default function CommentSection({ ${dataName}: propData, entity = 'comments', postId }: CommentSectionProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const endpoint = postId ? \`\${entity}?postId=\${postId}\` : entity;
        const response = await fetch(\`\${apiUrl}/\${endpoint}\`);
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
  }, [entity, propData, postId]);

  const sourceData = propData || fetchedData || {};

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const commentsData = sourceData || {};

  // Map actual API fields dynamically (avoid variable name conflict)
  const commentsList = commentsData?.comments || commentsData?.data || [];
  const title = commentsData?.title || 'Comments';
  const totalCount = commentsData?.total || commentsData?.count || commentsList.length;

  const renderComment = ({ item }: { item: any }) => {
    // Handle user as object or direct fields
    const userObj = item?.user || {};
    const userName = userObj?.name || userObj?.email || item?.user_name || item?.author_name || 'Anonymous';
    const userAvatar = userObj?.avatar || userObj?.profile_picture || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(userName)}&background=random\`;

    // Handle comment content
    const content = item?.content || item?.text || item?.body || '';

    // Handle created date
    const createdAt = item?.created_at || item?.timestamp;
    const formattedDate = createdAt ? new Date(createdAt).toLocaleString() : '';

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <Image
            source={{ uri: userAvatar }}
            style={styles.avatar}
          />
          <View style={styles.commentMeta}>
            <Text style={styles.userName}>{userName}</Text>
            {formattedDate ? (
              <Text style={styles.commentDate}>{formattedDate}</Text>
            ) : null}
          </View>
        </View>
        <Text style={styles.commentContent}>{content}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>({totalCount})</Text>
      </View>
      <FlatList
        data={commentsList}
        renderItem={renderComment}
        keyExtractor={(item, index) => item?.id || item?._id || index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
          </View>
        }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  count: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  listContent: {
    gap: 16,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  commentMeta: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  commentDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
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

    threaded: `
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';

interface CommentSectionProps {
  ${dataName}?: any;
  entity?: string;
  postId?: string | number;
  [key: string]: any;
}

export default function CommentSection({ ${dataName}: propData, entity = 'comments', postId }: CommentSectionProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const endpoint = postId ? \`\${entity}?postId=\${postId}\` : entity;
        const response = await fetch(\`\${apiUrl}/\${endpoint}\`);
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
  }, [entity, propData, postId]);

  const sourceData = propData || fetchedData || {};

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const commentsData = sourceData || {};

  // Map actual API fields dynamically (avoid variable name conflict)
  const commentsList = commentsData?.comments || commentsData?.data || [];
  const title = commentsData?.title || 'Comments';
  const totalCount = commentsData?.total || commentsData?.count || commentsList.length;

  const renderComment = ({ item, depth = 0 }: { item: any; depth?: number }) => {
    // Handle user as object or direct fields
    const userObj = item?.user || {};
    const userName = userObj?.name || userObj?.email || item?.user_name || item?.author_name || 'Anonymous';
    const userAvatar = userObj?.avatar || userObj?.profile_picture || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(userName)}&background=random\`;

    // Handle comment content
    const content = item?.content || item?.text || item?.body || '';

    // Handle created date
    const createdAt = item?.created_at || item?.timestamp;
    const formattedDate = createdAt ? new Date(createdAt).toLocaleString() : '';

    // Handle replies
    const replies = item?.replies || item?.children || [];

    return (
      <View style={[styles.commentItem, { marginLeft: depth * 20 }]}>
        <View style={styles.commentHeader}>
          <Image
            source={{ uri: userAvatar }}
            style={styles.avatar}
          />
          <View style={styles.commentMeta}>
            <Text style={styles.userName}>{userName}</Text>
            {formattedDate ? (
              <Text style={styles.commentDate}>{formattedDate}</Text>
            ) : null}
          </View>
        </View>
        <Text style={styles.commentContent}>{content}</Text>

        {/* Render replies recursively */}
        {replies.length > 0 && (
          <View style={styles.repliesContainer}>
            {replies.map((reply: any, index: number) => (
              <View key={reply?.id || reply?._id || index}>
                {renderComment({ item: reply, depth: depth + 1 })}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>({totalCount})</Text>
      </View>
      <FlatList
        data={commentsList}
        renderItem={({ item }) => renderComment({ item, depth: 0 })}
        keyExtractor={(item, index) => item?.id || item?._id || index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
          </View>
        }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  count: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  listContent: {
    gap: 16,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  commentMeta: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  commentDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
  repliesContainer: {
    marginTop: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
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

  const code = variants[variant] || variants.flat;
  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';",
    ],
  };
};
