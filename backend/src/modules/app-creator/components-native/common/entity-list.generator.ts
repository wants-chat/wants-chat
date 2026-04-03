/**
 * Entity List Generator (React Native)
 *
 * Generates a fully functional FlatList-based list view with:
 * - API data fetching with TanStack Query
 * - Pull to refresh
 * - CRUD operations
 * - Delete confirmation alert
 * - Swipeable row actions
 * - Search functionality
 *
 * Also includes a grid variant using FlatList with numColumns
 */

import { snakeCase, pascalCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../../components/utils/generator-helpers';

export interface ListFieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'datetime' | 'currency' | 'status' | 'boolean' | 'image' | 'phone' | 'email';
  primary?: boolean;
  secondary?: boolean;
}

export interface EntityListOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  fields: ListFieldConfig[];
  endpoint?: string;
  queryKey?: string;
  showCreate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
  showSearch?: boolean;
  createScreen?: string;
  editScreen?: string;
  viewScreen?: string;
}

export interface GridDisplayConfig {
  title: string;
  subtitle?: string;
  badge?: string;
  image?: string;
  meta?: string[];
}

export interface EntityGridOptions {
  componentName?: string;
  entity: string;
  displayName?: string;
  displayConfig: GridDisplayConfig;
  endpoint?: string;
  queryKey?: string;
  showCreate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  numColumns?: 2 | 3;
  createScreen?: string;
  viewScreen?: string;
}

/**
 * Generate field value renderer based on type
 */
function generateFieldValue(field: ListFieldConfig): string {
  const accessor = `item.${field.key}`;

  switch (field.type) {
    case 'date':
    case 'datetime':
      return `${accessor} ? new Date(${accessor}).toLocaleDateString() : '-'`;
    case 'currency':
      return `${accessor} != null ? '$' + Number(${accessor}).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'`;
    case 'boolean':
      return `${accessor} ? 'Yes' : 'No'`;
    case 'status':
      return `${accessor} ? ${accessor}.replace(/_/g, ' ').replace(/\\b\\w/g, (l: string) => l.toUpperCase()) : '-'`;
    default:
      return `${accessor} ?? '-'`;
  }
}

/**
 * Get status color for React Native
 */
function getStatusColorFunction(): string {
  return `const getStatusColor = (status: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      active: { bg: '#dcfce7', text: '#15803d' },
      published: { bg: '#dcfce7', text: '#15803d' },
      completed: { bg: '#dcfce7', text: '#15803d' },
      approved: { bg: '#dcfce7', text: '#15803d' },
      pending: { bg: '#fef9c3', text: '#a16207' },
      draft: { bg: '#fef9c3', text: '#a16207' },
      processing: { bg: '#dbeafe', text: '#1d4ed8' },
      in_progress: { bg: '#dbeafe', text: '#1d4ed8' },
      cancelled: { bg: '#fee2e2', text: '#dc2626' },
      rejected: { bg: '#fee2e2', text: '#dc2626' },
      inactive: { bg: '#f3f4f6', text: '#4b5563' },
    };
    return colors[status?.toLowerCase()] || { bg: '#f3f4f6', text: '#4b5563' };
  };`;
}

/**
 * Generate an entity list component (React Native FlatList)
 */
export function generateEntityList(options: EntityListOptions): string {
  const {
    entity,
    fields,
    showCreate = true,
    showEdit = true,
    showDelete = true,
    showView = true,
    showSearch = true,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'List';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;
  const createScreen = options.createScreen || `${pascalCase(entity)}Create`;
  const editScreen = options.editScreen || `${pascalCase(entity)}Edit`;
  const viewScreen = options.viewScreen || `${pascalCase(entity)}Detail`;

  const primaryField = fields.find(f => f.primary) || fields[0];
  const secondaryField = fields.find(f => f.secondary);
  const statusField = fields.find(f => f.type === 'status');
  const imageField = fields.find(f => f.type === 'image');

  // Generate icons needed
  const icons: string[] = ['search-outline', 'add-outline', 'chevron-forward-outline'];
  if (showView) icons.push('eye-outline');
  if (showEdit) icons.push('create-outline');
  if (showDelete) icons.push('trash-outline');
  if (imageField) icons.push('image-outline');

  return `import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  data?: any[];
  onItemPress?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}

${getStatusColorFunction()}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  onItemPress,
  onEdit,
  onDelete,
}) => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const { data: fetchedData, isLoading, error, refetch } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(\`${endpoint}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const sourceData = propData && propData.length > 0 ? propData : (fetchedData || []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return sourceData;
    const query = searchQuery.toLowerCase();
    return sourceData.filter((item: any) =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(query)
      )
    );
  }, [sourceData, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleItemPress = (item: any) => {
    if (onItemPress) {
      onItemPress(item);
    } else {
      navigation.navigate('${viewScreen}', { id: item.id || item._id });
    }
  };

  const handleEdit = (item: any) => {
    if (onEdit) {
      onEdit(item);
    } else {
      navigation.navigate('${editScreen}', { id: item.id || item._id });
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete ${displayName}',
      'Are you sure you want to delete this ${displayName.toLowerCase()}? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(item.id || item._id);
              if (onDelete) onDelete(item);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete ${displayName.toLowerCase()}');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const itemId = item.id || item._id;
    ${statusField ? `const statusColors = getStatusColor(item.${statusField.key});` : ''}

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        ${imageField ? `<View style={styles.imageContainer}>
          {item.${imageField.key} ? (
            <Image source={{ uri: item.${imageField.key} }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={24} color="#9ca3af" />
            </View>
          )}
        </View>` : ''}

        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.primaryText} numberOfLines={1}>
              {${generateFieldValue(primaryField)}}
            </Text>
            ${statusField ? `{item.${statusField.key} && (
              <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.badgeText, { color: statusColors.text }]}>
                  {${generateFieldValue(statusField)}}
                </Text>
              </View>
            )}` : ''}
          </View>

          ${secondaryField ? `<Text style={styles.secondaryText} numberOfLines={2}>
            {${generateFieldValue(secondaryField)}}
          </Text>` : ''}

          ${fields.filter(f => !f.primary && !f.secondary && f.type !== 'status' && f.type !== 'image').slice(0, 2).map(f => `
          <Text style={styles.metaText}>
            ${f.label}: {${generateFieldValue(f)}}
          </Text>`).join('')}
        </View>

        <View style={styles.actionsContainer}>
          ${showView ? `<TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleItemPress(item)}
          >
            <Ionicons name="chevron-forward-outline" size={20} color="#6b7280" />
          </TouchableOpacity>` : ''}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>${displayName}s</Text>
      ${showCreate ? `<TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('${createScreen}')}
      >
        <Ionicons name="add-outline" size={24} color="#fff" />
      </TouchableOpacity>` : ''}
    </View>
  );

  const renderSearchBar = () => (
    ${showSearch ? `<View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        placeholderTextColor="#9ca3af"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>` : '<View />'}
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No ${displayName.toLowerCase()}s found</Text>
    </View>
  );

  if (isLoading && !propData) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  if (error && !propData) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id || item._id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  secondaryText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default ${componentName};
`;
}

/**
 * Generate an entity grid component (React Native FlatList with numColumns)
 */
export function generateEntityGrid(options: EntityGridOptions): string {
  const {
    entity,
    displayConfig,
    showCreate = true,
    showEdit = true,
    showDelete = true,
    numColumns = 2,
  } = options;

  const tableName = snakeCase(pluralize.plural(entity));
  const componentName = options.componentName || pascalCase(entity) + 'Grid';
  const displayName = options.displayName || formatFieldLabel(entity);
  const endpoint = options.endpoint || '/' + tableName;
  const queryKey = options.queryKey || tableName;
  const createScreen = options.createScreen || `${pascalCase(entity)}Create`;
  const viewScreen = options.viewScreen || `${pascalCase(entity)}Detail`;

  return `import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = ${numColumns};
const ITEM_MARGIN = 8;
const CONTAINER_PADDING = 16;
const ITEM_WIDTH = (SCREEN_WIDTH - (CONTAINER_PADDING * 2) - (ITEM_MARGIN * (NUM_COLUMNS - 1))) / NUM_COLUMNS;

interface ${componentName}Props {
  data?: any[];
  onItemPress?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}

${getStatusColorFunction()}

const ${componentName}: React.FC<${componentName}Props> = ({
  data: propData,
  onItemPress,
  onEdit,
  onDelete,
}) => {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const { data: fetchedData, isLoading, error, refetch } = useQuery({
    queryKey: ['${queryKey}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        console.error('Failed to fetch:', err);
        return [];
      }
    },
    enabled: !propData || propData.length === 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(\`${endpoint}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const sourceData = propData && propData.length > 0 ? propData : (fetchedData || []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return sourceData;
    const query = searchQuery.toLowerCase();
    return sourceData.filter((item: any) =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(query)
      )
    );
  }, [sourceData, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleItemPress = (item: any) => {
    if (onItemPress) {
      onItemPress(item);
    } else {
      navigation.navigate('${viewScreen}', { id: item.id || item._id });
    }
  };

  const handleEdit = (item: any) => {
    if (onEdit) {
      onEdit(item);
    } else {
      navigation.navigate('${pascalCase(entity)}Edit', { id: item.id || item._id });
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete ${displayName}',
      'Are you sure you want to delete this ${displayName.toLowerCase()}?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(item.id || item._id);
              if (onDelete) onDelete(item);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete ${displayName.toLowerCase()}');
            }
          },
        },
      ]
    );
  };

  const handleLongPress = (item: any) => {
    const actions: any[] = [];
    ${showEdit ? `actions.push({ text: 'Edit', onPress: () => handleEdit(item) });` : ''}
    ${showDelete ? `actions.push({ text: 'Delete', style: 'destructive', onPress: () => handleDelete(item) });` : ''}
    actions.push({ text: 'Cancel', style: 'cancel' });

    Alert.alert('Options', undefined, actions);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const itemId = item.id || item._id;
    ${displayConfig.badge ? `const statusColors = getStatusColor(item.${displayConfig.badge});` : ''}
    const isLastInRow = (index + 1) % NUM_COLUMNS === 0;

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          { width: ITEM_WIDTH, marginRight: isLastInRow ? 0 : ITEM_MARGIN },
        ]}
        onPress={() => handleItemPress(item)}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        ${displayConfig.image ? `<View style={styles.imageContainer}>
          {item.${displayConfig.image} ? (
            <Image source={{ uri: item.${displayConfig.image} }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={32} color="#9ca3af" />
            </View>
          )}
          ${displayConfig.badge ? `{item.${displayConfig.badge} && (
            <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.badgeText, { color: statusColors.text }]}>
                {item.${displayConfig.badge}}
              </Text>
            </View>
          )}` : ''}
        </View>` : ''}

        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {item.${displayConfig.title} || 'Untitled'}
          </Text>
          ${displayConfig.subtitle ? `<Text style={styles.subtitle} numberOfLines={1}>
            {item.${displayConfig.subtitle} || ''}
          </Text>` : ''}
          ${displayConfig.meta && displayConfig.meta.length > 0 ? `<View style={styles.metaContainer}>
            ${displayConfig.meta.map(m => `{item.${m} && <Text style={styles.metaText} numberOfLines={1}>{item.${m}}</Text>}`).join('\n            ')}
          </View>` : ''}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>${displayName}s</Text>
      ${showCreate ? `<TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('${createScreen}')}
      >
        <Ionicons name="add-outline" size={24} color="#fff" />
      </TouchableOpacity>` : ''}
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        placeholderTextColor="#9ca3af"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={48} color="#9ca3af" />
      <Text style={styles.emptyText}>No ${displayName.toLowerCase()}s found</Text>
    </View>
  );

  if (isLoading && !propData) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </View>
    );
  }

  if (error && !propData) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
          <Text style={styles.errorText}>Failed to load data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id || item._id)}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.gridContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  gridContent: {
    paddingHorizontal: CONTAINER_PADDING,
    paddingBottom: 16,
  },
  gridItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: ITEM_MARGIN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#f3f4f6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  metaContainer: {
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}
