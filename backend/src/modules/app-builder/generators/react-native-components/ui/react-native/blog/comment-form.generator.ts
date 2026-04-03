import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNCommentForm = (
  resolved: ResolvedComponent,
  variant: 'inline' | 'modal' = 'inline'
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
    if (!dataSource || dataSource.trim() === '') return 'comments';
    const parts = dataSource.split('.');
    return parts[0] || 'comments';
  };

  const dataName = getDataPath();
  const entityName = getEntityName();

  const variants = {
    inline: `
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface CommentFormProps {
  ${dataName}?: any;
  postId?: string;
  onSubmitSuccess?: () => void;
  [key: string]: any;
}

export default function CommentForm({ ${dataName}: propData, postId, onSubmitSuccess }: CommentFormProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}/config\`);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch form config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formData = propData || fetchedData || {};
  const title = formData?.title || 'Leave a Comment';
  const placeholder = formData?.placeholder || 'Write your comment here...';
  const submitButtonText = formData?.submitButton || 'Post Comment';

  const createCommentMutation = useMutation({
    mutationFn: (commentData: any) => apiClient.post('/api/v1/comments', commentData),
    onSuccess: () => {
      Alert.alert('Success', 'Comment submitted for approval');
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to submit comment');
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    if (!postId) {
      Alert.alert('Error', 'Post ID is required');
      return;
    }

    createCommentMutation.mutate({
      content: content.trim(),
      post_id: postId,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <View style={styles.footer}>
        <Text style={styles.charCount}>{content.length} characters</Text>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!content.trim() || createCommentMutation.isPending) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!content.trim() || createCommentMutation.isPending}
        >
          <Text style={styles.submitButtonText}>
            {createCommentMutation.isPending ? 'Posting...' : submitButtonText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
  },
});
    `,

    modal: `
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface CommentFormProps {
  ${dataName}?: any;
  postId?: string;
  isVisible: boolean;
  onClose: () => void;
  [key: string]: any;
}

export default function CommentForm({ ${dataName}: propData, postId, isVisible, onClose }: CommentFormProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}/config\`);
        const result = await response.json();
        setFetchedData(result?.data || result);
      } catch (err) {
        console.error('Failed to fetch form config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formData = propData || fetchedData || {};
  const title = formData?.title || 'Leave a Comment';
  const placeholder = formData?.placeholder || 'Write your comment here...';
  const submitButtonText = formData?.submitButton || 'Post Comment';
  const cancelButtonText = formData?.cancelButton || 'Cancel';

  const createCommentMutation = useMutation({
    mutationFn: (commentData: any) => apiClient.post('/api/v1/comments', commentData),
    onSuccess: () => {
      Alert.alert('Success', 'Comment submitted for approval');
      setContent('');
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      onClose();
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.message || 'Failed to submit comment');
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    if (!postId) {
      Alert.alert('Error', 'Post ID is required');
      return;
    }

    createCommentMutation.mutate({
      content: content.trim(),
      post_id: postId,
    });
  };

  const handleClose = () => {
    setContent('');
    onClose();
  };

  if (loading) {
    return (
      <Modal visible={isVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!content.trim() || createCommentMutation.isPending) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!content.trim() || createCommentMutation.isPending}
            >
              <Text style={styles.submitButtonText}>
                {createCommentMutation.isPending ? 'Posting...' : submitButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    color: '#374151',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
    `
  };

  const code = variants[variant] || variants.inline;
  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';",
      "import { useMutation, useQueryClient } from '@tanstack/react-query';",
      "import { apiClient } from '@/lib/api';",
    ],
  };
};
