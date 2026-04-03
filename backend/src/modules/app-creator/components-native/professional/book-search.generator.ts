/**
 * Book Search Component Generator (React Native)
 *
 * Generates a book search interface with results list.
 * Features: Search input, book results list, availability badges, category display.
 */

export interface BookSearchOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateBookSearch(options: BookSearchOptions = {}): string {
  const {
    componentName = 'BookSearch',
    endpoint = '/books/search',
    title = 'Book Search',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  available: boolean;
  category: string;
  coverImage?: string;
  publishYear?: number;
}

interface ${componentName}Props {
  onBookSelect?: (book: Book) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onBookSelect }) => {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const searchMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await api.get<any>(\`${endpoint}?q=\${encodeURIComponent(searchQuery)}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    onSuccess: (data) => {
      setResults(data);
      setHasSearched(true);
    },
    onError: () => {
      setResults([]);
      setHasSearched(true);
    },
  });

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    Keyboard.dismiss();
    searchMutation.mutate(query.trim());
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };

  const handleBookPress = (book: Book) => {
    if (onBookSelect) {
      onBookSelect(book);
    } else {
      navigation.navigate('BookDetail', { id: book.id });
    }
  };

  const renderItem = useCallback(({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => handleBookPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.bookIcon}>
        <Ionicons name="book" size={32} color="#6B7280" />
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor}>by {item.author}</Text>
        <View style={styles.bookMeta}>
          <Text style={styles.bookIsbn}>ISBN: {item.isbn}</Text>
          {item.publishYear && (
            <Text style={styles.bookYear}>{item.publishYear}</Text>
          )}
        </View>
        <View style={styles.bookFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </View>
      </View>
      <View
        style={[
          styles.availabilityBadge,
          item.available ? styles.availableBadge : styles.unavailableBadge,
        ]}
      >
        <Text
          style={[
            styles.availabilityText,
            item.available ? styles.availableText : styles.unavailableText,
          ]}
        >
          {item.available ? 'Available' : 'Checked Out'}
        </Text>
      </View>
    </TouchableOpacity>
  ), []);

  const keyExtractor = useCallback((item: Book) => item.id, []);

  const renderEmpty = () => {
    if (!hasSearched) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Search for Books</Text>
          <Text style={styles.emptyText}>
            Enter a title, author, or ISBN to find books
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="book-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No Books Found</Text>
        <Text style={styles.emptyText}>
          Try a different search term
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="library-outline" size={24} color="#111827" />
        <Text style={styles.headerTitle}>${title}</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, author, or ISBN..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.searchButton,
            searchMutation.isPending && styles.searchButtonDisabled,
          ]}
          onPress={handleSearch}
          disabled={searchMutation.isPending || !query.trim()}
        >
          {searchMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {searchMutation.isPending && !results.length ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  searchButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  searchButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookIcon: {
    width: 60,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookIsbn: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  bookYear: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 12,
  },
  bookFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4F46E5',
  },
  availabilityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: '#DCFCE7',
  },
  unavailableBadge: {
    backgroundColor: '#FEE2E2',
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  availableText: {
    color: '#16A34A',
  },
  unavailableText: {
    color: '#DC2626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default ${componentName};
`;
}
