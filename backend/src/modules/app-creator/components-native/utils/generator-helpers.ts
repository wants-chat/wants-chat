/**
 * React Native Generator Helpers - Shared utilities for all React Native component generators
 *
 * Provides utility functions for:
 * - Case conversions (snake_case, camelCase, PascalCase, kebab-case)
 * - Field formatting and display value generation
 * - React Native specific imports and patterns
 * - Status badge colors for React Native
 * - Loading, empty, and error state generation
 * - API fetch hooks for TanStack Query
 */

import { snakeCase, pascalCase, camelCase, kebabCase } from 'change-case';
import pluralize from 'pluralize';
import { EnhancedEntityDefinition, EnhancedFieldDefinition } from '../../dto/create-app.dto';

// Re-export case utilities for convenience
export { snakeCase, pascalCase, camelCase, kebabCase };
export { pluralize };

/**
 * Format field name to human-readable label
 */
export function formatFieldLabel(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

/**
 * Get table name from entity name
 */
export function getTableName(entityName: string): string {
  return snakeCase(pluralize.plural(entityName));
}

/**
 * Get API endpoint from entity name
 */
export function getEndpoint(entityName: string): string {
  return '/' + getTableName(entityName);
}

/**
 * Get component name from entity name and type
 */
export function getComponentName(entityName: string, componentType: string): string {
  return pascalCase(entityName) + pascalCase(componentType);
}

/**
 * Common React Native imports as a string
 */
export const REACT_NATIVE_IMPORTS = `import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';`;

/**
 * Basic React Native imports (minimal)
 */
export const REACT_NATIVE_IMPORTS_BASIC = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';`;

/**
 * React Navigation imports
 */
export const NAVIGATION_IMPORTS = `import { useNavigation, useRoute } from '@react-navigation/native';`;

/**
 * TanStack Query imports
 */
export const QUERY_IMPORTS = `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';`;

/**
 * Common utility imports for React Native
 */
export const UTIL_IMPORTS = `import { api } from '@/lib/api';`;

/**
 * Ionicons import (Expo vector icons)
 */
export function getIoniconsImport(): string {
  return `import { Ionicons } from '@expo/vector-icons';`;
}

/**
 * Get Ionicons icon names for common use cases
 */
export function getIoniconForField(fieldName: string): string {
  const lowerName = fieldName.toLowerCase();
  const iconMap: Record<string, string> = {
    // Status/State
    status: 'checkmark-circle-outline',
    state: 'ellipse-outline',
    active: 'checkmark-circle-outline',
    // User/Person
    user: 'person-outline',
    customer: 'person-outline',
    client: 'person-outline',
    member: 'people-outline',
    owner: 'person-outline',
    author: 'person-outline',
    // Contact
    email: 'mail-outline',
    phone: 'call-outline',
    address: 'location-outline',
    location: 'location-outline',
    // Time/Date
    date: 'calendar-outline',
    time: 'time-outline',
    created_at: 'calendar-outline',
    updated_at: 'refresh-outline',
    due_date: 'calendar-outline',
    // Money
    price: 'cash-outline',
    amount: 'cash-outline',
    total: 'receipt-outline',
    cost: 'cash-outline',
    payment: 'card-outline',
    // Content
    title: 'text-outline',
    name: 'pricetag-outline',
    description: 'document-text-outline',
    notes: 'document-outline',
    content: 'document-text-outline',
    // Media
    image: 'image-outline',
    photo: 'image-outline',
    video: 'videocam-outline',
    file: 'document-outline',
    document: 'document-text-outline',
    // Categories
    category: 'folder-outline',
    type: 'pricetag-outline',
    tags: 'pricetags-outline',
    // Metrics
    count: 'stats-chart-outline',
    quantity: 'cube-outline',
    number: 'stats-chart-outline',
    // Actions
    search: 'search-outline',
    add: 'add-outline',
    edit: 'create-outline',
    delete: 'trash-outline',
    view: 'eye-outline',
    settings: 'settings-outline',
    filter: 'filter-outline',
    sort: 'swap-vertical-outline',
    refresh: 'refresh-outline',
    back: 'arrow-back-outline',
    forward: 'arrow-forward-outline',
    chevron: 'chevron-forward-outline',
    close: 'close-outline',
    menu: 'menu-outline',
    more: 'ellipsis-horizontal-outline',
    // Common
    home: 'home-outline',
    list: 'list-outline',
    grid: 'grid-outline',
    star: 'star-outline',
    heart: 'heart-outline',
    share: 'share-outline',
    download: 'download-outline',
    upload: 'cloud-upload-outline',
    notification: 'notifications-outline',
    message: 'chatbubble-outline',
    info: 'information-circle-outline',
    warning: 'warning-outline',
    error: 'alert-circle-outline',
    success: 'checkmark-circle-outline',
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerName.includes(key)) {
      return icon;
    }
  }

  return 'information-circle-outline';
}

/**
 * Generate standard component interface for React Native
 */
export function generateComponentInterface(
  componentName: string,
  extraProps: Array<{ name: string; type: string; optional?: boolean }> = []
): string {
  const props = [
    { name: 'style', type: 'ViewStyle', optional: true },
    ...extraProps,
  ];

  const propLines = props.map(p =>
    `  ${p.name}${p.optional ? '?' : ''}: ${p.type};`
  ).join('\n');

  return `interface ${componentName}Props {\n${propLines}\n}`;
}

/**
 * Map field type to display format for React Native
 */
export function getFieldDisplayValue(field: EnhancedFieldDefinition, accessor: string): string {
  const { type, name } = field;

  if (type === 'date' || type === 'datetime' || name.endsWith('_at')) {
    return `${accessor} ? new Date(${accessor}).toLocaleDateString() : '-'`;
  }

  if (type === 'decimal' || name.match(/price|amount|total|cost|fee/i)) {
    return `${accessor} != null ? '$' + Number(${accessor}).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'`;
  }

  if (type === 'boolean') {
    return `${accessor} ? 'Yes' : 'No'`;
  }

  if (type === 'phone') {
    return `${accessor} || '-'`;
  }

  return `${accessor} ?? '-'`;
}

/**
 * Status colors for React Native (returns object with bg and text colors as hex)
 */
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: '#dcfce7', text: '#15803d' },
  published: { bg: '#dcfce7', text: '#15803d' },
  completed: { bg: '#dcfce7', text: '#15803d' },
  approved: { bg: '#dcfce7', text: '#15803d' },
  success: { bg: '#dcfce7', text: '#15803d' },
  pending: { bg: '#fef9c3', text: '#a16207' },
  draft: { bg: '#fef9c3', text: '#a16207' },
  warning: { bg: '#fef9c3', text: '#a16207' },
  processing: { bg: '#dbeafe', text: '#1d4ed8' },
  in_progress: { bg: '#dbeafe', text: '#1d4ed8' },
  info: { bg: '#dbeafe', text: '#1d4ed8' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
  rejected: { bg: '#fee2e2', text: '#dc2626' },
  failed: { bg: '#fee2e2', text: '#dc2626' },
  error: { bg: '#fee2e2', text: '#dc2626' },
  inactive: { bg: '#f3f4f6', text: '#4b5563' },
  default: { bg: '#f3f4f6', text: '#4b5563' },
};

/**
 * Get status badge colors for React Native
 */
export function getStatusColors(status: string): { bg: string; text: string } {
  return STATUS_COLORS[status?.toLowerCase()] || STATUS_COLORS.default;
}

/**
 * Generate status color function for inline use in components
 */
export function generateStatusColorFunction(): string {
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
    failed: { bg: '#fee2e2', text: '#dc2626' },
    inactive: { bg: '#f3f4f6', text: '#4b5563' },
  };
  return colors[status?.toLowerCase()] || { bg: '#f3f4f6', text: '#4b5563' };
};`;
}

/**
 * Generate API fetch hook for TanStack Query (React Native)
 */
export function generateFetchHook(
  queryKey: string,
  endpoint: string,
  options: { enabled?: string; single?: boolean } = {}
): string {
  const { enabled, single } = options;

  return `const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['${queryKey}'${single ? ', id' : ''}],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}'${single ? ' + id' : ''});
        return ${single ? 'response?.data || response' : 'Array.isArray(response) ? response : (response?.data || [])'};
      } catch (err) {
        console.error('Failed to fetch:', err);
        return ${single ? 'null' : '[]'};
      }
    },${enabled ? `\n    enabled: ${enabled},` : ''}
    retry: 1,
  });`;
}

/**
 * Generate delete mutation for TanStack Query (React Native)
 */
export function generateDeleteMutation(endpoint: string, queryKey: string): string {
  return `const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(\`${endpoint}/\${id}\`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${queryKey}'] });
    },
  });`;
}

/**
 * Generate loading state JSX for React Native
 */
export function generateLoadingState(): string {
  return `<View style={styles.loadingContainer}>
  <ActivityIndicator size="large" color="#2563eb" />
  <Text style={styles.loadingText}>Loading...</Text>
</View>`;
}

/**
 * Generate empty state JSX for React Native
 */
export function generateEmptyState(message: string, iconName?: string): string {
  const icon = iconName || 'folder-open-outline';
  return `<View style={styles.emptyContainer}>
  <Ionicons name="${icon}" size={48} color="#9ca3af" />
  <Text style={styles.emptyText}>${message}</Text>
</View>`;
}

/**
 * Generate error state JSX for React Native
 */
export function generateErrorState(retryHandler?: string): string {
  return `<View style={styles.errorContainer}>
  <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
  <Text style={styles.errorText}>Failed to load data</Text>
  ${retryHandler ? `<TouchableOpacity style={styles.retryButton} onPress={${retryHandler}}>
    <Text style={styles.retryText}>Retry</Text>
  </TouchableOpacity>` : ''}
</View>`;
}

/**
 * Generate delete confirmation alert for React Native
 */
export function generateDeleteAlert(entityDisplayName: string, deleteHandler: string): string {
  return `Alert.alert(
  'Delete ${entityDisplayName}',
  'Are you sure you want to delete this ${entityDisplayName.toLowerCase()}? This action cannot be undone.',
  [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: ${deleteHandler},
    },
  ]
);`;
}

/**
 * Common base styles for React Native components
 */
export function generateBaseStyles(): string {
  return `const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});`;
}

/**
 * Common header styles for React Native components
 */
export function generateHeaderStyles(): string {
  return `header: {
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
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },`;
}

/**
 * Common card styles for React Native components
 */
export function generateCardStyles(): string {
  return `card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },`;
}

/**
 * Common button styles for React Native components
 */
export function generateButtonStyles(): string {
  return `primaryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  fabButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },`;
}

/**
 * Common badge styles for React Native components
 */
export function generateBadgeStyles(): string {
  return `badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  badgeSuccessText: {
    color: '#15803d',
  },
  badgeWarning: {
    backgroundColor: '#fef9c3',
  },
  badgeWarningText: {
    color: '#a16207',
  },
  badgeError: {
    backgroundColor: '#fee2e2',
  },
  badgeErrorText: {
    color: '#dc2626',
  },
  badgeInfo: {
    backgroundColor: '#dbeafe',
  },
  badgeInfoText: {
    color: '#1d4ed8',
  },
  badgeDefault: {
    backgroundColor: '#f3f4f6',
  },
  badgeDefaultText: {
    color: '#4b5563',
  },`;
}

/**
 * Common input styles for React Native components
 */
export function generateInputStyles(): string {
  return `input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputFocused: {
    borderColor: '#2563eb',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  inputHelper: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  inputErrorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
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
  },`;
}

/**
 * Common list styles for React Native components
 */
export function generateListStyles(): string {
  return `listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listItem: {
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
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  listItemMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  listItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  listSeparator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },`;
}

/**
 * Common grid styles for React Native components
 */
export function generateGridStyles(numColumns: number = 2): string {
  return `gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  gridItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  gridItemImage: {
    aspectRatio: 16 / 9,
    backgroundColor: '#f3f4f6',
  },
  gridItemContent: {
    padding: 12,
  },
  gridItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  gridItemSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },`;
}

/**
 * Format currency value for React Native display
 */
export function formatCurrency(value: number | string, currency: string = 'USD'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(num);
}

/**
 * Format date value for React Native display
 */
export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format datetime value for React Native display
 */
export function formatDateTime(value: string | Date): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Color palette for React Native (consistent with Tailwind)
 */
export const COLORS = {
  // Primary
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  primaryDark: '#1d4ed8',
  // Gray scale
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  // Semantic colors
  success: '#22c55e',
  successLight: '#dcfce7',
  successDark: '#15803d',
  warning: '#eab308',
  warningLight: '#fef9c3',
  warningDark: '#a16207',
  error: '#ef4444',
  errorLight: '#fee2e2',
  errorDark: '#dc2626',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  infoDark: '#1d4ed8',
  // Background
  background: '#f9fafb',
  surface: '#ffffff',
  // Text
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  // Border
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
};

/**
 * Spacing scale for React Native (consistent with Tailwind)
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

/**
 * Font sizes for React Native
 */
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

/**
 * Border radius values for React Native
 */
export const BORDER_RADIUS = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
