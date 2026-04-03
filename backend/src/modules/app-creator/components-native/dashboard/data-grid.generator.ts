/**
 * Data Grid Component Generator (React Native)
 *
 * Generates a responsive card-based FlatList for displaying entity data.
 * Features: search/filter, pull-to-refresh, card-based layout.
 */

export interface DataGridOptions {
  componentName?: string;
  entity?: string;
  columns?: 1 | 2;
  showTitle?: boolean;
  showSearch?: boolean;
}

export function generateDataGrid(options: DataGridOptions = {}): string {
  const {
    componentName = 'DataGrid',
    entity = 'category',
    columns = 2,
    showTitle = true,
    showSearch = true,
  } = options;

  return `import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

// Simple pluralization for common cases
const pluralize = (word: string): string => {
  if (word.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(suffix => word.endsWith(suffix))) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
};

interface ${componentName}Props {
  entity?: string;
  title?: string;
  columns?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const ${componentName}: React.FC<${componentName}Props> = ({
  entity = '${entity}',
  title,
  columns = ${columns},
}) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const endpoint = pluralize(entity);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await api.get<any>('/' + endpoint);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const filteredData = useMemo(() => {
    if (!data || !searchQuery.trim()) return data || [];
    const query = searchQuery.toLowerCase();
    return data.filter((item: any) => {
      const name = (item.name || item.title || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [data, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const cardWidth = columns === 1
    ? screenWidth - 32
    : (screenWidth - 48) / 2;

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => navigation.navigate(endpoint + 'Detail' as never, { id: item.id } as never)}
      activeOpacity={0.7}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImagePlaceholderText}>
            {(item.name || item.title || '?').charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name || item.title}
        </Text>
        {item.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  ), [cardWidth, endpoint, navigation]);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load data.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      ${showTitle ? `{title && (
        <Text style={styles.title}>{title}</Text>
      )}` : ''}

      ${showSearch ? `<View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>` : ''}

      {filteredData.length > 0 ? (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={columns}
          columnWrapperStyle={columns > 1 ? styles.row : undefined}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="grid-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No {entity}s found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery ? 'Try a different search term' : 'Check back later'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  cardImagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6366F1',
  },
  cardImagePlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ${componentName};
`;
}
