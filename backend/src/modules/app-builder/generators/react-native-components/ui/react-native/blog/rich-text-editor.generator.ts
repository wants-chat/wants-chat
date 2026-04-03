import { ResolvedComponent } from '../../../../react-components/types/resolved-component.interface';

export const generateRNRichTextEditor = (resolved: ResolvedComponent) => {
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
    if (!dataSource || dataSource.trim() === '') return 'editor';
    const parts = dataSource.split('.');
    return parts[0] || 'editor';
  };

  const dataName = getDataPath();
  const entityName = getEntityName();

  const code = `
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

interface RichTextEditorProps {
  ${dataName}?: any;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  placeholder?: string;
  [key: string]: any;
}

export default function RichTextEditor({
  ${dataName}: propData,
  initialContent = '',
  onContentChange,
  placeholder
}: RichTextEditorProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/${entityName}\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch editor data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const editorData = propData || fetchedData || {};

  const [content, setContent] = useState(initialContent);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const editorPlaceholder = placeholder || editorData?.placeholder || 'Start writing...';
  const showToolbar = editorData?.showToolbar !== false;

  const handleContentChange = (text: string) => {
    setContent(text);
    if (onContentChange) {
      onContentChange(text);
    }
  };

  const insertMarkdown = (prefix: string, suffix: string) => {
    const newText = \`\${content}\${prefix}\${suffix}\`;
    handleContentChange(newText);
  };

  return (
    <View style={styles.container}>
      {showToolbar && (
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.toolButton, isBold && styles.toolButtonActive]}
            onPress={() => {
              insertMarkdown('**', '**');
              setIsBold(!isBold);
            }}
          >
            <Text style={[styles.toolButtonText, isBold && styles.toolButtonTextActive]}>
              B
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, isItalic && styles.toolButtonActive]}
            onPress={() => {
              insertMarkdown('*', '*');
              setIsItalic(!isItalic);
            }}
          >
            <Text style={[styles.toolButtonText, isItalic && styles.toolButtonTextActive]}>
              I
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => insertMarkdown('# ', '')}
          >
            <Text style={styles.toolButtonText}>H1</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => insertMarkdown('## ', '')}
          >
            <Text style={styles.toolButtonText}>H2</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => insertMarkdown('[](', ')')}
          >
            <Text style={styles.toolButtonText}>🔗</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => insertMarkdown('- ', '\\n')}
          >
            <Text style={styles.toolButtonText}>•</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => insertMarkdown('\`\`\`\\n', '\\n\`\`\`')}
          >
            <Text style={styles.toolButtonText}>&lt;&gt;</Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        style={styles.editor}
        multiline
        placeholder={editorPlaceholder}
        value={content}
        onChangeText={handleContentChange}
        textAlignVertical="top"
      />

      <View style={styles.footer}>
        <Text style={styles.charCount}>{content.length} characters</Text>
        <Text style={styles.helpText}>Markdown supported</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  toolButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toolButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  toolButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  toolButtonTextActive: {
    color: '#fff',
  },
  editor: {
    minHeight: 200,
    padding: 16,
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    fontFamily: 'System',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  helpText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});
  `;

  return {
    code,
    imports: [
      "import React, { useState, useEffect } from 'react';",
      "import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';",
    ],
  };
};
