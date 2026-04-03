/**
 * React Native Data Component Generators
 *
 * Generates data display components for React Native including:
 * - DataGrid
 * - DataTable
 * - DataList
 * - SearchBar
 * - Badge
 */

// ============================================
// DataGrid Component
// ============================================

/**
 * Generate DataGrid component for React Native
 */
export function generateDataGrid(): string {
  return `import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  ListRenderItem,
  FlatListProps,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export type GridColumns = 2 | 3 | 4;

export interface DataGridProps<T> extends Omit<FlatListProps<T>, 'renderItem' | 'numColumns'> {
  data: T[];
  columns?: GridColumns;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onItemPress?: (item: T, index: number) => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyComponent?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
  gap?: number;
  padding?: number;
}

export function DataGrid<T>({
  data,
  columns = 2,
  renderItem,
  keyExtractor,
  onItemPress,
  loading = false,
  refreshing = false,
  onRefresh,
  emptyComponent,
  emptyTitle = 'No items',
  emptyMessage = 'There are no items to display.',
  style,
  contentContainerStyle,
  itemStyle,
  gap = 12,
  padding = 16,
  ...flatListProps
}: DataGridProps<T>) {
  const renderGridItem: ListRenderItem<T> = useCallback(
    ({ item, index }) => {
      const isLastInRow = (index + 1) % columns === 0;
      const content = renderItem(item, index);

      if (onItemPress) {
        return (
          <TouchableOpacity
            style={[
              styles.gridItem,
              { flex: 1 / columns, marginRight: isLastInRow ? 0 : gap },
              itemStyle,
            ]}
            onPress={() => onItemPress(item, index)}
            activeOpacity={0.7}
          >
            {content}
          </TouchableOpacity>
        );
      }

      return (
        <View
          style={[
            styles.gridItem,
            { flex: 1 / columns, marginRight: isLastInRow ? 0 : gap },
            itemStyle,
          ]}
        >
          {content}
        </View>
      );
    },
    [columns, gap, itemStyle, onItemPress, renderItem],
  );

  const renderEmptyState = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="grid-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      </View>
    );
  }, [loading, emptyComponent, emptyTitle, emptyMessage]);

  return (
    <FlatList
      data={data}
      renderItem={renderGridItem}
      keyExtractor={keyExtractor}
      numColumns={columns}
      key={\`grid-\${columns}\`}
      style={[styles.container, style]}
      contentContainerStyle={[
        styles.contentContainer,
        { padding },
        data.length === 0 && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      columnWrapperStyle={{ marginBottom: gap }}
      ListEmptyComponent={renderEmptyState}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  gridItem: {
    minHeight: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptyMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default DataGrid;
`;
}

// ============================================
// DataTable Component
// ============================================

/**
 * Generate DataTable component for React Native
 */
export function generateDataTable(): string {
  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T> {
  key: string;
  title: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  render?: (item: T, rowIndex: number) => React.ReactNode;
  accessor?: (item: T) => string | number | boolean | null | undefined;
  align?: 'left' | 'center' | 'right';
  headerStyle?: StyleProp<TextStyle>;
  cellStyle?: StyleProp<TextStyle>;
}

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  onRowPress?: (item: T, index: number) => void;
  onSort?: (columnKey: string, direction: SortDirection) => void;
  sortColumn?: string;
  sortDirection?: SortDirection;
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  style?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  emptyMessage?: string;
  tableWidth?: number;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowPress,
  onSort,
  sortColumn,
  sortDirection,
  loading = false,
  striped = true,
  hoverable = true,
  style,
  headerStyle,
  rowStyle,
  emptyMessage = 'No data available',
  tableWidth,
}: DataTableProps<T>) {
  const [localSortColumn, setLocalSortColumn] = useState<string | undefined>(sortColumn);
  const [localSortDirection, setLocalSortDirection] = useState<SortDirection>(sortDirection || null);

  const handleSort = useCallback(
    (columnKey: string) => {
      let newDirection: SortDirection;

      if (localSortColumn === columnKey) {
        if (localSortDirection === 'asc') {
          newDirection = 'desc';
        } else if (localSortDirection === 'desc') {
          newDirection = null;
        } else {
          newDirection = 'asc';
        }
      } else {
        newDirection = 'asc';
      }

      setLocalSortColumn(newDirection ? columnKey : undefined);
      setLocalSortDirection(newDirection);
      onSort?.(columnKey, newDirection);
    },
    [localSortColumn, localSortDirection, onSort],
  );

  const getSortIcon = (columnKey: string) => {
    if (localSortColumn !== columnKey || !localSortDirection) {
      return 'swap-vertical-outline';
    }
    return localSortDirection === 'asc' ? 'arrow-up' : 'arrow-down';
  };

  const renderCell = (column: TableColumn<T>, item: T, rowIndex: number) => {
    if (column.render) {
      return column.render(item, rowIndex);
    }

    if (column.accessor) {
      const value = column.accessor(item);
      return value?.toString() ?? '-';
    }

    const key = column.key as keyof T;
    const value = item[key];
    return value?.toString() ?? '-';
  };

  const renderHeader = () => (
    <View style={[styles.headerRow, headerStyle]}>
      {columns.map((column) => (
        <TouchableOpacity
          key={column.key}
          style={[
            styles.headerCell,
            column.width ? { width: column.width } : { flex: 1, minWidth: column.minWidth || 100 },
          ]}
          onPress={() => column.sortable && handleSort(column.key)}
          disabled={!column.sortable}
          activeOpacity={column.sortable ? 0.7 : 1}
        >
          <Text
            style={[
              styles.headerText,
              column.align === 'center' && styles.textCenter,
              column.align === 'right' && styles.textRight,
              column.headerStyle,
            ]}
            numberOfLines={1}
          >
            {column.title}
          </Text>
          {column.sortable && (
            <Ionicons
              name={getSortIcon(column.key)}
              size={14}
              color={localSortColumn === column.key ? '#3B82F6' : '#9CA3AF'}
              style={styles.sortIcon}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderRow = (item: T, index: number) => {
    const key = keyExtractor(item, index);
    const isEven = index % 2 === 0;

    const rowContent = (
      <View
        style={[
          styles.row,
          striped && isEven && styles.stripedRow,
          rowStyle,
        ]}
      >
        {columns.map((column) => (
          <View
            key={column.key}
            style={[
              styles.cell,
              column.width ? { width: column.width } : { flex: 1, minWidth: column.minWidth || 100 },
            ]}
          >
            <Text
              style={[
                styles.cellText,
                column.align === 'center' && styles.textCenter,
                column.align === 'right' && styles.textRight,
                column.cellStyle,
              ]}
              numberOfLines={2}
            >
              {renderCell(column, item, index)}
            </Text>
          </View>
        ))}
      </View>
    );

    if (onRowPress && hoverable) {
      return (
        <TouchableOpacity
          key={key}
          onPress={() => onRowPress(item, index)}
          activeOpacity={0.7}
        >
          {rowContent}
        </TouchableOpacity>
      );
    }

    return <View key={key}>{rowContent}</View>;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
      <Text style={styles.emptyText}>{emptyMessage}</Text>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );

  const tableContent = (
    <View style={[styles.table, tableWidth ? { width: tableWidth } : undefined]}>
      {renderHeader()}
      {loading ? (
        renderLoading()
      ) : data.length === 0 ? (
        renderEmptyState()
      ) : (
        data.map((item, index) => renderRow(item, index))
      )}
    </View>
  );

  if (tableWidth) {
    return (
      <View style={[styles.container, style]}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          {tableContent}
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {tableContent}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  table: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortIcon: {
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stripedRow: {
    backgroundColor: '#F9FAFB',
  },
  cell: {
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14,
    color: '#374151',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default DataTable;
`;
}

// ============================================
// DataList Component
// ============================================

/**
 * Generate DataList component for React Native
 */
export function generateDataList(): string {
  return `import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  FlatListProps,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface DataListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  onItemPress?: (item: T, index: number) => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  emptyComponent?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  showSeparator?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
}

export function DataList<T>({
  data,
  renderItem,
  keyExtractor,
  onItemPress,
  loading = false,
  refreshing = false,
  onRefresh,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  emptyComponent,
  emptyTitle = 'No items',
  emptyMessage = 'There are no items to display.',
  showSeparator = true,
  style,
  contentContainerStyle,
  itemStyle,
  ...flatListProps
}: DataListProps<T>) {
  const renderListItem = useCallback(
    ({ item, index }: { item: T; index: number }) => {
      const content = renderItem(item, index);

      if (onItemPress) {
        return (
          <TouchableOpacity
            style={[styles.listItem, itemStyle]}
            onPress={() => onItemPress(item, index)}
            activeOpacity={0.7}
          >
            {content}
          </TouchableOpacity>
        );
      }

      return <View style={[styles.listItem, itemStyle]}>{content}</View>;
    },
    [itemStyle, onItemPress, renderItem],
  );

  const renderSeparator = useCallback(() => {
    if (!showSeparator) return null;
    return <View style={styles.separator} />;
  }, [showSeparator]);

  const renderEmptyState = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="list-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      </View>
    );
  }, [loading, emptyComponent, emptyTitle, emptyMessage]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  }, [loadingMore]);

  const handleEndReached = useCallback(() => {
    if (hasMore && !loadingMore && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loadingMore, onLoadMore]);

  return (
    <FlatList
      data={data}
      renderItem={renderListItem}
      keyExtractor={keyExtractor}
      style={[styles.container, style]}
      contentContainerStyle={[
        styles.contentContainer,
        data.length === 0 && styles.emptyContentContainer,
        contentContainerStyle,
      ]}
      ItemSeparatorComponent={renderSeparator}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
      {...flatListProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptyMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default DataList;
`;
}

// ============================================
// SearchBar Component
// ============================================

/**
 * Generate SearchBar component for React Native
 */
export function generateSearchBar(): string {
  return `import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextInputProps,
  Animated,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
  cancelText?: string;
  autoFocus?: boolean;
  debounceMs?: number;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<ViewStyle>;
}

export function SearchBar({
  value,
  onChangeText,
  onSearch,
  onClear,
  placeholder = 'Search...',
  showCancelButton = false,
  onCancel,
  cancelText = 'Cancel',
  autoFocus = false,
  debounceMs,
  style,
  inputStyle,
  ...props
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChangeText = (text: string) => {
    onChangeText(text);

    if (debounceMs && onSearch) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        onSearch(text);
      }, debounceMs);
    }
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleCancel = () => {
    onChangeText('');
    setIsFocused(false);
    inputRef.current?.blur();
    onCancel?.();
  };

  const handleSubmit = () => {
    onSearch?.(value);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused, inputStyle]}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {showCancelButton && isFocused && (
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Animated.Text style={styles.cancelText}>{cancelText}</Animated.Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: '#3B82F6',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  cancelButton: {
    marginLeft: 12,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default SearchBar;
`;
}

// ============================================
// Badge Component
// ============================================

/**
 * Generate Badge component for React Native
 */
export function generateBadge(): string {
  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  outline?: boolean;
  dot?: boolean;
  dotColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
  primary: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  secondary: { bg: '#F3F4F6', text: '#4B5563', border: '#D1D5DB' },
  success: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  warning: { bg: '#FFFBEB', text: '#D97706', border: '#FCD34D' },
  danger: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  info: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
};

const SIZE_STYLES: Record<BadgeSize, { paddingH: number; paddingV: number; fontSize: number }> = {
  sm: { paddingH: 6, paddingV: 2, fontSize: 11 },
  md: { paddingH: 8, paddingV: 3, fontSize: 12 },
  lg: { paddingH: 10, paddingV: 4, fontSize: 14 },
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  outline = false,
  dot = false,
  dotColor,
  style,
  textStyle,
}: BadgeProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: outline ? 'transparent' : variantStyle.bg,
          paddingHorizontal: sizeStyle.paddingH,
          paddingVertical: sizeStyle.paddingV,
          borderRadius: rounded ? 100 : 4,
          borderWidth: outline ? 1 : 0,
          borderColor: variantStyle.border,
        },
        style,
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            { backgroundColor: dotColor || variantStyle.text },
          ]}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: variantStyle.text,
            fontSize: sizeStyle.fontSize,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

export function StatusBadge({
  status,
  style,
}: {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
  style?: StyleProp<ViewStyle>;
}) {
  const statusMap: Record<string, { variant: BadgeVariant; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'secondary', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    completed: { variant: 'primary', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
  };

  const config = statusMap[status] || statusMap.inactive;

  return (
    <Badge variant={config.variant} dot rounded style={style}>
      {config.label}
    </Badge>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: '500',
  },
});

export default Badge;
`;
}
