/**
 * React Native Button Generator
 * Generates a reusable button component
 */

export function generateRNButton(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';`,
  ];

  const code = `${imports.join('\n')}

interface ButtonProps {
  data?: any;
  title?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  [key: string]: any;
}

export default function Button({
  data: propData,
  title: propTitle,
  onPress,
  variant = 'primary',
  loading: propLoading = false,
  disabled = false
}: ButtonProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData || propTitle) return;
      setFetchLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/buttons\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data || result));
      } catch (err) {
        console.error('Failed to fetch button data:', err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const title = propTitle || data?.title || data?.label || 'Button';
  const loading = propLoading || fetchLoading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#3b82f6' : '#fff'} />
      ) : (
        <Text style={[
          styles.text,
          variant === 'outline' && styles.outlineText
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: '#3b82f6',
  },
  secondary: {
    backgroundColor: '#6b7280',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#3b82f6',
  },
});`;

  return { code, imports };
}
