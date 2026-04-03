/**
 * React Native Search Bar Generator
 * Generates a mobile search input component
 */

export function generateRNSearchBar(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  options?: any;
  [key: string]: any;
}

export default function SearchBar({
  placeholder = 'Search...',
  onSearch,
  onClear,
  options: propOptions
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<any>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (propOptions) return;
      setOptionsLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/search/options\`);
        const result = await response.json();
        setOptions(result?.data || result || {});
      } catch (err) {
        console.error('Failed to fetch options:', err);
      } finally {
        setOptionsLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const formOptions = propOptions || options || {};

  const handleChangeText = (text: string) => {
    setQuery(text);
    onSearch?.(text);
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
    onSearch?.('');
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#6b7280" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={handleChangeText}
        returnKeyType="search"
        onSubmitEditing={() => onSearch?.(query)}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
});`;

  return { code, imports };
}
