import { Component, ComponentType, DataField, ComponentAction } from '../../interfaces/app-builder.types';
import { pascalCase, capitalCase } from 'change-case';
import { singular } from 'pluralize';
import { generateCreateTrackForm } from './create-track-form.generator';
import { generateCreateAlbumForm } from './create-album-form.generator';
import { generateCreatePlaylistForm } from './create-playlist-form.generator';
import {
  generateRNDataVizBarChart,
  generateRNDataVizLineChart,
  generateRNDataVizPieChart,
  generateRNDataVizAreaChart
} from './ui/react-native/charts';
import { generateRNEntityDetailWithHeader } from './ui/react-native/detail';

/**
 * React Native Component Generator Service
 *
 * Generates React Native components based on blueprint component definitions
 * Supports: data-table (FlatList), form, stats-widget, profile-card, calendar, etc.
 */

export class ReactNativeComponentGeneratorService {
  /**
   * Generate component based on type
   */
  generateComponent(component: Component, entityName: string): { code: string; imports: string[] } {
    switch (component.type) {
      case ComponentType.DATA_TABLE:
        return this.generateDataList(component, entityName);
      case ComponentType.FORM:
      case ComponentType.FORM_COMPONENTS:
        return this.generateForm(component, entityName);
      case ComponentType.STATS_WIDGET:
        return this.generateStatsWidget(component, entityName);
      case ComponentType.PROFILE_CARD:
        return this.generateProfileCard(component, entityName);
      case ComponentType.CALENDAR:
        return this.generateCalendar(component, entityName);
      case ComponentType.KANBAN_BOARD:
        return this.generateKanbanBoard(component, entityName);
      case ComponentType.CHART:
      case ComponentType.DATA_VIZ_BAR_CHART:
      case ComponentType.DATA_VIZ_LINE_CHART:
      case ComponentType.DATA_VIZ_PIE_CHART:
      case ComponentType.DATA_VIZ_AREA_CHART:
        return this.generateChart(component, entityName);
      case ComponentType.FILE_UPLOAD_SINGLE:
        return this.generateFileUploader(component, entityName);
      case ComponentType.CHATBOT_SUPPORT:
        return this.generateChatWidget(component, entityName);
      case ComponentType.VIDEO_PLAYER_CUSTOM:
        return this.generateVideoPlayer(component, entityName);
      case ComponentType.PAYMENT_METHOD:
        return this.generatePaymentForm(component, entityName);

      // E-commerce components
      case ComponentType.PRODUCT_GRID:
      case ComponentType.PRODUCT_GRID_TWO_COLUMN:
      case ComponentType.PRODUCT_GRID_THREE_COLUMN:
      case ComponentType.PRODUCT_GRID_FOUR_COLUMN:
        return this.generateProductGrid(component, entityName);
      case ComponentType.PRODUCT_DETAIL_PAGE:
        return this.generateProductDetail(component, entityName);
      case ComponentType.TRACK_DETAIL_PAGE:
        return this.generateTrackDetail(component, entityName);
      case ComponentType.PRODUCT_CARD_COMPACT:
      case ComponentType.PRODUCT_CARD_DETAILED:
        return this.generateProductCard(component, entityName);
      case ComponentType.CART_FULL_PAGE:
        return this.generateCartFullPage(component, entityName);
      case ComponentType.CART_SUMMARY_SIDEBAR:
        return this.generateCartSummary(component, entityName);
      case ComponentType.CHECKOUT_FORM:
        return this.generateCheckoutForm(component, entityName);
      case ComponentType.ORDER_SUMMARY:
        return this.generateOrderSummary(component, entityName);
      case ComponentType.ORDER_HISTORY_LIST:
        return this.generateOrderHistory(component, entityName);
      case ComponentType.ORDER_DETAILS_VIEW:
        return this.generateOrderDetails(component, entityName);

      // Navigation components
      case ComponentType.TABS_NAVIGATION:
        return this.generateTabsNavigation(component, entityName);

      // Charts components
      case ComponentType.STAT_CARD:
        return this.generateStatCard(component, entityName);
      case ComponentType.ANALYTICS_OVERVIEW_CARDS:
        return this.generateAnalyticsOverviewCards(component, entityName);

      // Blog components
      case ComponentType.HERO_SECTION:
      case ComponentType.HERO_CENTERED:
        return this.generateHeroSection(component, entityName);
      case ComponentType.BLOG_CARD:
      case ComponentType.FEATURED_BLOG_POST:
        return this.generateBlogCard(component, entityName);
      case ComponentType.BLOG_GRID:
      case ComponentType.BLOG_GRID_LAYOUT:
      case ComponentType.BLOG_LIST_LAYOUT:
      case ComponentType.BLOG_LIST:
        // If entity is recipes/products/items, use ProductGrid instead of BlogList
        // Also check component.data.entity since entityName might be undefined
        const dataEntity = component.data?.entity || '';
        if ((entityName && (entityName.includes('recipe') || entityName.includes('product') || entityName.includes('item') || entityName.includes('menu'))) ||
            (dataEntity && (dataEntity.includes('recipe') || dataEntity.includes('product') || dataEntity.includes('item') || dataEntity.includes('menu')))) {
          return this.generateProductGrid(component, entityName || dataEntity);
        }
        return this.generateBlogList(component, entityName);
      case ComponentType.BLOG_POST_CONTENT:
        return this.generateBlogPostContent(component, entityName);
      case ComponentType.BLOG_POST_HEADER:
        return this.generateBlogPostHeader(component, entityName);
      case ComponentType.BLOG_SIDEBAR:
        return this.generateBlogSidebar(component, entityName);
      case ComponentType.COMMENT_SECTION:
        return this.generateCommentSection(component, entityName);
      case ComponentType.COMMENT_FORM:
        return this.generateCommentForm(component, entityName);
      case ComponentType.RELATED_ARTICLES:
        return this.generateRelatedArticles(component, entityName);
      case ComponentType.CATEGORIES_WIDGET:
        return this.generateCategoriesWidget(component, entityName);
      case ComponentType.RICH_TEXT_EDITOR:
        return this.generateRichTextEditor(component, entityName);

      // Food delivery components
      case ComponentType.RESTAURANT_DETAIL_HEADER:
        return this.generateRestaurantDetailHeader(component, entityName);

      // Category/Feature grids
      case ComponentType.CATEGORY_GRID:
      case ComponentType.FEATURE_SHOWCASE_GRID:
        return this.generateCategoryGrid(component, entityName);

      // Budget & Expense Tracker components
      case ComponentType.EXPENSE_LIST:
      case ComponentType.EXPENSE_CARD:
      case ComponentType.TRANSACTION_HISTORY:
      case ComponentType.CATEGORY_SPENDING:
        return this.generateExpenseList(component, entityName);
      case ComponentType.BUDGET_PROGRESS_CARD:
      case ComponentType.BUDGET_OVERVIEW:
        return this.generateBudgetProgressCard(component, entityName);
      case ComponentType.FINANCIAL_GOAL_CARD:
        return this.generateFinancialGoalCard(component, entityName);

      // Detail view components
      case ComponentType.ENTITY_DETAIL_WITH_HEADER:
        return this.generateEntityDetailWithHeader(component, entityName);

      default:
        return this.generatePlaceholder(component, entityName);
    }
  }

  /**
   * Generate Data List component (React Native equivalent of data-table using FlatList)
   */
  private generateDataList(component: Component, entityName: string): { code: string; imports: string[] } {
    const { data, actions, props } = component;
    const hasCreate = actions.some(a => a.type === 'create');
    const hasUpdate = actions.some(a => a.type === 'update');
    const hasDelete = actions.some(a => a.type === 'delete');
    const hasSearchable = props?.searchable !== false;
    const hasPagination = props?.pagination !== false;

    // Build imports dynamically
    const imports: string[] = [];
    const reactImports: string[] = ['useState'];
    const rnImports = ['View', 'Text', 'FlatList', 'StyleSheet', 'TouchableOpacity', 'ActivityIndicator', 'Image', 'Modal', 'Alert'];

    if (hasSearchable) {
      rnImports.push('TextInput');
    }

    // Build import statements
    imports.push(`import React, { ${reactImports.join(', ')} } from 'react';`);
    imports.push(`import { ${rnImports.join(', ')} } from 'react-native';`);
    imports.push(`import { useQuery${hasDelete ? ', useMutation, useQueryClient' : ''} } from '@tanstack/react-query';`);
    imports.push(`import { apiClient } from '@/lib/api';`);
    imports.push(`import { useNavigation } from '@react-navigation/native';`);
    imports.push(`import Ionicons from '@expo/vector-icons/Ionicons';`);

    const code = `${imports.join('\n')}

interface ${pascalCase(singular(entityName))}ListProps {
  data?: any[]; // Accept data from parent
  searchable?: boolean;
  pagination?: boolean;
  createRoute?: string;
  createLabel?: string;
  [key: string]: any; // Allow additional props from parent
}

export default function ${pascalCase(singular(entityName))}List({
  data: propData, // Data from parent (multi-component pages)
  searchable = ${props?.searchable !== false},
  pagination = ${props?.pagination !== false},
  createRoute,
  createLabel = 'Create',
}: ${pascalCase(singular(entityName))}ListProps) {
  const navigation = useNavigation();
  ${hasDelete ? `const queryClient = useQueryClient();` : ''}
  ${hasSearchable ? `const [searchTerm, setSearchTerm] = useState('');` : ''}
  ${hasDelete ? `const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: any | null }>({ open: false, item: null });` : ''}

  // Only fetch data if not provided via props (single-component pages)
  const shouldFetchData = !propData;

  const { data: fetchedData, isLoading, refetch } = useQuery({
    queryKey: ['${entityName}'${hasSearchable ? ', searchTerm' : ''}],
    queryFn: () => apiClient.get('/${entityName}'${hasSearchable ? `, {
      params: { ${hasSearchable ? 'search: searchTerm' : ''} }
    }` : ''}),
    enabled: shouldFetchData, // Only run query if data not provided
  });

  ${hasDelete ? `// Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(\`/${entityName}/\${id}\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${entityName}'] });
      setDeleteModal({ open: false, item: null });
    },
  });

  const handleDeleteConfirm = () => {
    if (deleteModal.item) {
      deleteMutation.mutate(deleteModal.item.id);
    }
  };` : ''}

  ${hasUpdate ? `const handleEdit = (item: any) => {
    const entityName = '${entityName}';
    const screenName = 'Edit' + entityName.charAt(0).toUpperCase() + entityName.slice(1, -1);
    (navigation as any).navigate(screenName, { id: item.id });
  };` : ''}

  const handleView = (item: any) => {
    const entityName = '${entityName}';
    const screenName = entityName.charAt(0).toUpperCase() + entityName.slice(1, -1) + 'Detail';
    (navigation as any).navigate(screenName, { id: item.id });
  };

  // Use prop data if available, otherwise use fetched data
  const ${entityName}List = propData || fetchedData?.data || [];

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      ${this.generateListItemFields(data.fields)}
      ${hasUpdate || hasDelete ? `
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleView(item)}>
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        ${hasUpdate ? `<TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>` : ''}
        ${hasDelete ? `<TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => setDeleteModal({ open: true, item })}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>` : ''}
      </View>` : ''}
    </View>
  );

  // Only show loading when actively fetching (not when data provided via props)
  if (shouldFetchData && isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const handleCreatePress = () => {
    if (createRoute) {
      // Extract screen name from route (e.g., '/artist/tracks/create' -> 'CreateTrack')
      const parts = createRoute.split('/').filter(p => p);
      // Get entity and action (e.g., 'tracks' and 'create')
      const entity = parts.length >= 2 ? parts[parts.length - 2] : '';
      const action = parts[parts.length - 1];
      // Convert to screen name: 'create' + 'Track' (singular form)
      const singularEntity = entity.endsWith('s') ? entity.slice(0, -1) : entity;
      const screenName = action.charAt(0).toUpperCase() + action.slice(1) +
                        singularEntity.charAt(0).toUpperCase() + singularEntity.slice(1);
      (navigation as any).navigate(screenName);
    }
  };

  return (
    <View style={styles.container}>
      {/* Create Button at Top */}
      {createRoute && (
        <View style={styles.headerButtonContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreatePress}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.createButtonText}>{createLabel}</Text>
          </TouchableOpacity>
        </View>
      )}
      ${hasSearchable ? `
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>` : ''}
      <FlatList
        data={${entityName}List}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={refetch}
      />

      ${hasDelete ? `{/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModal.open}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModal({ open: false, item: null })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this item? This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModal({ open: false, item: null })}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDeleteConfirm}
              >
                <Text style={styles.confirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>` : ''}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { padding: 16 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  headerButtonContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  item: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#e5e7eb',
  },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  itemText: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  actions: { flexDirection: 'row', marginTop: 12, gap: 8 },
  actionButton: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    alignItems: 'center'
  },
  actionText: { color: '#374151', fontWeight: '500' },
  deleteButton: { backgroundColor: '#fee2e2' },
  deleteText: { color: '#dc2626', fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#dc2626',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});`;

    return { code, imports };
  }

  /**
   * Generate list item fields
   */
  private generateListItemFields(fields: DataField[]): string {
    const displayFields = fields.slice(0, 4); // Show first 4 fields

    return displayFields.map((field, index) => {
      // Check if field is an image field (matches frontend behavior)
      const isImageField = field.type === 'file' ||
                          field.name.toLowerCase().includes('image') ||
                          field.name.toLowerCase().includes('photo') ||
                          field.name.toLowerCase().includes('thumbnail') ||
                          field.name.toLowerCase().includes('picture') ||
                          field.name.toLowerCase().includes('avatar') ||
                          field.name.toLowerCase().includes('banner') ||
                          field.name.toLowerCase().includes('featured');

      if (isImageField) {
        // Render image with fallback handling
        return `{item.${field.name} && (
        <Image
          source={{ uri: item.${field.name} }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      )}`;
      }

      if (index === 0) {
        return `<Text style={styles.itemTitle}>{item.${field.name}}</Text>`;
      }
      return `<Text style={styles.itemText}>{item.${field.name}}</Text>`;
    }).join('\n      ');
  }

  /**
   * Generate Form component
   */
  private generateForm(component: Component, entityName: string): { code: string; imports: string[] } {
    const { data, actions } = component;
    const isCreateForm = actions.some(a => a.type === 'create');
    const isUpdateForm = actions.some(a => a.type === 'update');

    // Use specialized Create Track form for tracks entity
    if (entityName === 'tracks' && isCreateForm && !isUpdateForm) {
      return generateCreateTrackForm(component, entityName);
    }

    // Use specialized Create Album form for albums entity
    if (entityName === 'albums' && isCreateForm && !isUpdateForm) {
      return generateCreateAlbumForm(component, entityName);
    }

    // Use specialized Create Playlist form for playlists entity
    if (entityName === 'playlists' && isCreateForm && !isUpdateForm) {
      return generateCreatePlaylistForm(component, entityName);
    }

    const imports = [
      `import React, { useState } from 'react';`,
      `import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';`,
      `import { useNavigation } from '@react-navigation/native';`,
      `import { useMutation${isUpdateForm ? ', useQuery' : ''} } from '@tanstack/react-query';`,
      `import { apiClient } from '@/lib/api';`,
    ];

    const formFields = this.generateFormFields(data.fields);
    const initialState = this.generateInitialFormState(data.fields);

    const code = `${imports.join('\n')}

interface ${pascalCase(singular(entityName))}FormProps {
  ${isUpdateForm ? `${singular(entityName)}Id?: string;` : ''}
  onSuccess?: () => void;
  [key: string]: any;
}

export default function ${pascalCase(singular(entityName))}Form({
  ${isUpdateForm ? `${singular(entityName)}Id,` : ''}
  onSuccess
}: ${pascalCase(singular(entityName))}FormProps) {
  const navigation = useNavigation();
  const [formData, setFormData] = useState(${initialState});

  ${isUpdateForm ? `// Fetch existing data for update
  const { data } = useQuery({
    queryKey: ['${entityName}', ${singular(entityName)}Id],
    queryFn: () => apiClient.get(\`/${entityName}/\${${singular(entityName)}Id}\`),
    enabled: !!${singular(entityName)}Id,
  });

  // Update form data when query data changes
  React.useEffect(() => {
    if (data?.data) {
      setFormData(data.data);
    }
  }, [data]);` : ''}

  const mutation = useMutation({
    mutationFn: (data: any) => ${isUpdateForm ? `${singular(entityName)}Id
      ? apiClient.put(\`/${entityName}/\${${singular(entityName)}Id}\`, data)
      : apiClient.post('/${entityName}', data)` : `apiClient.post('/${entityName}', data)`},
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleSubmit = () => {
    // Convert string values to appropriate types
    const processedData = Object.entries(formData).reduce((acc, [key, value]) => {
      // Convert numeric strings to numbers if the value looks like a number
      if (typeof value === 'string' && value !== '' && !isNaN(Number(value))) {
        acc[key] = Number(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    mutation.mutate(processedData);
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.form}>
        ${formFields}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={mutation.isPending}
        >
          <Text style={styles.submitButtonText}>
            {mutation.isPending ? 'Saving...' : '${isUpdateForm ? 'Update' : 'Create'}'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  form: { padding: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});`;

    return { code, imports };
  }

  /**
   * Generate form fields
   */
  private generateFormFields(fields: DataField[]): string {
    return fields.map(field => {
      const fieldName = field.name;
      const label = this.toTitleCase(fieldName);

      return `<View style={styles.formGroup}>
          <Text style={styles.label}>${label}</Text>
          <TextInput
            style={styles.input}
            value={formData.${fieldName}}
            onChangeText={(text) => setFormData({ ...formData, ${fieldName}: text })}
            ${field.type === 'email' ? `keyboardType="email-address"` : ''}
            ${field.type === 'number' ? `keyboardType="numeric"` : ''}
          />
        </View>`;
    }).join('\n        ');
  }

  /**
   * Generate initial form state
   */
  private generateInitialFormState(fields: DataField[]): string {
    const stateObj = fields.reduce((acc, field) => {
      acc[field.name] = ''; // All fields as empty strings for TextInput
      return acc;
    }, {} as Record<string, string>);

    return JSON.stringify(stateObj, null, 2);
  }

  /**
   * Generate Stats Widget component
   */
  private generateStatsWidget(component: Component, entityName: string): { code: string; imports: string[] } {
    const { data, props } = component;

    // Get the metric calculation from component props
    const metric = props?.metric || 'count';
    const field = props?.field || 'amount';

    const imports = [
      `import React from 'react';`,
      `import { View, Text, StyleSheet } from 'react-native';`,
    ];

    const code = `${imports.join('\n')}

interface StatsWidgetProps {
  data?: any[];
  title?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  prefix?: string;
  suffix?: string;
  [key: string]: any;
}

export default function ${pascalCase(singular(entityName))}Stats({
  data,
  title = 'Metric',
  color = 'blue',
  prefix = '',
  suffix = ''
}: StatsWidgetProps) {
  // Stats widget receives data from parent via props (no separate API call needed)
  // Calculate stats from the data array
  const dataArray = Array.isArray(data) ? data : [];

  // Calculate metric: ${metric} for field: ${field}
  let calculatedValue = 0;

  if (dataArray.length > 0) {
    ${metric === 'sum' ? `
    // Sum metric
    calculatedValue = dataArray.reduce((total, item) => total + (Number(item['${field}']) || 0), 0);` :
    metric === 'average' || metric === 'avg' ? `
    // Average metric
    const total = dataArray.reduce((sum, item) => sum + (Number(item['${field}']) || 0), 0);
    calculatedValue = total / dataArray.length;` :
    metric === 'max' ? `
    // Max metric
    calculatedValue = Math.max(...dataArray.map(item => Number(item['${field}']) || 0));` :
    metric === 'min' ? `
    // Min metric
    calculatedValue = Math.min(...dataArray.map(item => Number(item['${field}']) || 0));` : `
    // Count metric
    calculatedValue = dataArray.length;`}
  }

  // Format the value with prefix/suffix
  const formattedValue = \`\${prefix}\${${metric === 'sum' || metric === 'average' || metric === 'avg' ? 'calculatedValue.toFixed(2)' : 'calculatedValue'}}\${suffix}\`;

  // Color styles
  const colorStyles = {
    blue: { bg: '#EFF6FF', text: '#2563EB' },
    green: { bg: '#F0FDF4', text: '#16A34A' },
    yellow: { bg: '#FEFCE8', text: '#CA8A04' },
    red: { bg: '#FEF2F2', text: '#DC2626' },
    purple: { bg: '#FAF5FF', text: '#9333EA' },
    gray: { bg: '#F9FAFB', text: '#6B7280' },
  };

  const selectedColor = colorStyles[color] || colorStyles.blue;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: selectedColor.text }]}>{formattedValue}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
  },
});`;

    return { code, imports };
  }

  /**
   * Generate stat cards
   */
  private generateStatCards(fields: DataField[]): string {
    return `<View style={styles.statsGrid}>
      ${fields.slice(0, 4).map(field => `
        <View style={styles.statCard}>
          <View style={styles.statCardInner}>
            <Text style={styles.statLabel}>${this.toTitleCase(field.name)}</Text>
            <Text style={styles.statValue}>{stats.${field.name} || 0}</Text>
          </View>
        </View>`).join('')}
      </View>`;
  }

  /**
   * Generate Profile Card component
   */
  private generateProfileCard(component: Component, entityName: string): { code: string; imports: string[] } {
    const { data } = component;

    const imports = [
      `import React from 'react';`,
      `import { View, Text, Image, StyleSheet } from 'react-native';`,
      `import { useQuery } from '@tanstack/react-query';`,
      `import { apiClient } from '@/lib/api';`,
    ];

    const code = `${imports.join('\n')}

export default function ${pascalCase(singular(entityName))}Profile({ ${singular(entityName)}Id }: { ${singular(entityName)}Id?: string; [key: string]: any }) {
  const { data } = useQuery({
    queryKey: ['${entityName}', ${singular(entityName)}Id],
    queryFn: () => apiClient.get(\`/${entityName}/\${${singular(entityName)}Id}\`),
  });

  const profile = data?.data || {};

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={{ uri: profile.avatar || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile.name}</Text>
        ${this.generateProfileFields(data.fields)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  field: { fontSize: 14, color: '#6b7280', marginTop: 4 },
});`;

    return { code, imports };
  }

  /**
   * Generate profile fields
   */
  private generateProfileFields(fields: DataField[]): string {
    return fields.slice(0, 5).map(field =>
      `<Text style={styles.field}>{profile.${field.name}}</Text>`
    ).join('\n        ');
  }

  /**
   * Generate Calendar component (placeholder)
   */
  private generateCalendar(component: Component, entityName: string): { code: string; imports: string[] } {
    return this.generatePlaceholder(component, entityName);
  }

  /**
   * Generate Kanban Board component (placeholder)
   */
  private generateKanbanBoard(component: Component, entityName: string): { code: string; imports: string[] } {
    return this.generatePlaceholder(component, entityName);
  }

  /**
   * Generate Chart component - dispatches to specific chart type generator
   */
  private generateChart(component: Component, entityName: string): { code: string; imports: string[] } {
    const resolved = this.resolveComponentData(component, entityName);
    const variant = component.props?.variant || 'simple';

    // Dispatch to the appropriate chart generator based on component type
    switch (component.type) {
      case ComponentType.DATA_VIZ_PIE_CHART:
        return generateRNDataVizPieChart(resolved, variant as 'pie' | 'donut' | 'exploded');

      case ComponentType.DATA_VIZ_LINE_CHART:
        return generateRNDataVizLineChart(resolved, variant as 'simple' | 'multiSeries' | 'area');

      case ComponentType.DATA_VIZ_AREA_CHART:
        return generateRNDataVizAreaChart(resolved, variant as 'simple' | 'stacked');

      case ComponentType.DATA_VIZ_BAR_CHART:
      case ComponentType.CHART:
      default:
        return generateRNDataVizBarChart(resolved, variant as 'vertical' | 'horizontal');
    }
  }

  /**
   * Generate File Uploader component
   */
  private generateFileUploader(component: Component, entityName: string): { code: string; imports: string[] } {
    const imports = [
      `import React, { useState } from 'react';`,
      `import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';`,
      `import * as ImagePicker from 'expo-image-picker';`,
      `import { useMutation } from '@tanstack/react-query';`,
      `import { apiClient } from '@/lib/api';`,
    ];

    const code = `${imports.join('\n')}

export default function ${pascalCase(singular(entityName))}FileUploader() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: (fileUri: string) => {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      } as any);
      return apiClient.post('/${entityName}/upload', formData);
    },
    onSuccess: () => {
      Alert.alert('Success', 'File uploaded successfully');
      setSelectedFile(null);
    },
    onError: () => {
      Alert.alert('Error', 'Failed to upload file');
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedFile(result.assets[0].uri);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.picker} onPress={pickImage}>
        {selectedFile ? (
          <Image source={{ uri: selectedFile }} style={styles.preview} />
        ) : (
          <Text style={styles.pickerText}>Tap to select file</Text>
        )}
      </TouchableOpacity>

      {selectedFile && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUpload}
          disabled={uploadMutation.isPending}
        >
          <Text style={styles.uploadButtonText}>
            {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  picker: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerText: { color: '#6b7280', fontSize: 16 },
  preview: { width: '100%', height: '100%', borderRadius: 8 },
  uploadButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});`;

    return { code, imports };
  }

  /**
   * Generate Chat Widget component
   */
  private generateChatWidget(component: Component, entityName: string): { code: string; imports: string[] } {
    const imports = [
      `import React, { useState, useRef, useEffect } from 'react';`,
      `import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';`,
      `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';`,
      `import { apiClient } from '@/lib/api';`,
    ];

    const code = `${imports.join('\n')}

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: string;
}

export default function ${pascalCase(singular(entityName))}Chat() {
  const [message, setMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['${entityName}-messages'],
    queryFn: () => apiClient.get('/${entityName}/messages'),
    refetchInterval: 3000, // Poll for new messages
  });

  const messages = data?.data || [];

  const sendMutation = useMutation({
    mutationFn: (text: string) => apiClient.post('/${entityName}/messages', { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${entityName}-messages'] });
      setMessage('');
    },
  });

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMutation.mutate(message);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble,
      item.sender === 'me' ? styles.myMessage : styles.theirMessage
    ]}>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!message.trim() || sendMutation.isPending}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  messagesList: { padding: 16 },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
  },
  messageText: { color: '#fff', fontSize: 16 },
  timestamp: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  sendButtonText: { color: '#fff', fontWeight: '600' },
});`;

    return { code, imports };
  }

  /**
   * Generate Video Player component
   */
  private generateVideoPlayer(component: Component, entityName: string): { code: string; imports: string[] } {
    const imports = [
      `import React, { useState } from 'react';`,
      `import { View, Text, StyleSheet } from 'react-native';`,
      `import { Video, ResizeMode } from 'expo-av';`,
      `import { useQuery } from '@tanstack/react-query';`,
      `import { apiClient } from '@/lib/api';`,
    ];

    const code = `${imports.join('\n')}

export default function ${pascalCase(singular(entityName))}VideoPlayer({ ${singular(entityName)}Id }: { ${singular(entityName)}Id?: string; [key: string]: any }) {
  const [status, setStatus] = useState({});

  const { data } = useQuery({
    queryKey: ['${entityName}', ${singular(entityName)}Id],
    queryFn: () => apiClient.get(\`/${entityName}/\${${singular(entityName)}Id}\`),
  });

  const videoData = data?.data || {};
  const videoUrl = videoData.videoUrl || '';

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: videoUrl }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={status => setStatus(() => status)}
      />
      {videoData.title && (
        <View style={styles.info}>
          <Text style={styles.title}>{videoData.title}</Text>
          {videoData.description && (
            <Text style={styles.description}>{videoData.description}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { width: '100%', height: 300 },
  info: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 14, color: '#6b7280' },
});`;

    return { code, imports };
  }

  /**
   * Generate Payment Form component
   */
  private generatePaymentForm(component: Component, entityName: string): { code: string; imports: string[] } {
    const imports = [
      `import React, { useState } from 'react';`,
      `import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';`,
      `import { useNavigation } from '@react-navigation/native';`,
      `import { useMutation } from '@tanstack/react-query';`,
      `import { apiClient } from '@/lib/api';`,
    ];

    const code = `${imports.join('\n')}

export default function ${pascalCase(singular(entityName))}PaymentForm() {
  const navigation = useNavigation();
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const paymentMutation = useMutation({
    mutationFn: (paymentData: any) => apiClient.post('/${entityName}/process-payment', paymentData),
    onSuccess: () => {
      Alert.alert('Success', 'Payment processed successfully');
    },
    onError: () => {
      Alert.alert('Error', 'Payment failed. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!cardNumber || !expiryDate || !cvv || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    paymentMutation.mutate({
      cardNumber,
      expiryDate,
      cvv,
      name,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Payment Information</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Card Holder Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="John Doe"
        />

        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          value={cardNumber}
          onChangeText={setCardNumber}
          placeholder="1234 5678 9012 3456"
          keyboardType="numeric"
          maxLength={19}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              value={expiryDate}
              onChangeText={setExpiryDate}
              placeholder="MM/YY"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          <View style={styles.halfField}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              value={cvv}
              onChangeText={setCvv}
              placeholder="123"
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={paymentMutation.isPending}
        >
          <Text style={styles.submitButtonText}>
            {paymentMutation.isPending ? 'Processing...' : 'Pay Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  form: { backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8, marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: { flexDirection: 'row', gap: 16 },
  halfField: { flex: 1 },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});`;

    return { code, imports };
  }

  /**
   * Generate placeholder component
   */
  private generatePlaceholder(component: Component, entityName: string): { code: string; imports: string[] } {
    const imports = [
      `import React from 'react';`,
      `import { View, Text, StyleSheet } from 'react-native';`,
    ];

    const code = `${imports.join('\n')}

interface ${pascalCase(singular(entityName))}${pascalCase(component.type || 'Component')}Props {
  [key: string]: any;
}

export default function ${pascalCase(singular(entityName))}${pascalCase(component.type || 'Component')}(props: ${pascalCase(singular(entityName))}${pascalCase(component.type || 'Component')}Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        ${pascalCase(component.type || 'Component')} - Coming Soon
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  text: { fontSize: 16, color: '#6b7280' },
});`;

    return { code, imports };
  }


  private toTitleCase(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }

  /**
   * E-commerce Component Generators
   */
  private generateProductGrid(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNProductGridThreeColumn } = require('./ui/react-native/ecommerce');
    return generateRNProductGridThreeColumn();
  }

  private generateProductDetail(component: Component, entityName: string): { code: string; imports: string[] } {
    // Use the generic entity detail component for products
    const { generateRNEntityDetailWithHeader } = require('./ui/react-native/detail');
    const resolved = this.resolveComponentData(component, entityName);
    return generateRNEntityDetailWithHeader(resolved);
  }

  private generateTrackDetail(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNTrackDetailPage } = require('./ui/react-native/media');
    return generateRNTrackDetailPage(component);
  }

  private generateProductCard(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNProductCardCompact } = require('./ui/react-native/ecommerce');
    return generateRNProductCardCompact();
  }

  private generateCartFullPage(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNCartFullPage } = require('./ui/react-native/ecommerce');
    return generateRNCartFullPage();
  }

  private generateCartSummary(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNCartSummarySidebar } = require('./ui/react-native/ecommerce');
    return generateRNCartSummarySidebar();
  }

  private generateCheckoutForm(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNCheckoutSteps } = require('./ui/react-native/ecommerce');
    return generateRNCheckoutSteps();
  }

  private generateOrderSummary(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNOrderSummary } = require('./ui/react-native/ecommerce');
    return generateRNOrderSummary();
  }

  private generateOrderHistory(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNOrderDetailsView } = require('./ui/react-native/ecommerce');
    return generateRNOrderDetailsView();
  }

  private generateOrderDetails(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNOrderDetailsView } = require('./ui/react-native/ecommerce');
    return generateRNOrderDetailsView();
  }

  private generateCategoryGrid(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNCategoryGrid } = require('./ui/react-native/ecommerce');
    return generateRNCategoryGrid();
  }

  // Navigation component generators
  private generateTabsNavigation(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNTabsNavigation } = require('./ui/react-native/navigation');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNTabsNavigation(resolved), imports: [] };
  }

  // Charts component generators
  private generateStatCard(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNKpiCard } = require('./ui/react-native/charts');
    return generateRNKpiCard();
  }

  private generateAnalyticsOverviewCards(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNAnalyticsOverviewCards } = require('./ui/react-native/charts');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNAnalyticsOverviewCards(resolved), imports: [] };
  }

  // Blog component generators
  private generateHeroSection(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNHeroSection } = require('./ui/react-native/common');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNHeroSection(resolved), imports: [] };
  }

  private generateBlogCard(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNBlogCard } = require('./ui/react-native/blog');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNBlogCard(resolved, 'standard'), imports: [] };
  }

  private generateBlogList(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNBlogList } = require('./ui/react-native/blog');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNBlogList(resolved), imports: [] };
  }

  private generateBlogPostContent(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNBlogPostContent } = require('./ui/react-native/blog');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNBlogPostContent(resolved, 'standard'), imports: [] };
  }

  private generateBlogPostHeader(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNBlogPostHeader } = require('./ui/react-native/blog');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNBlogPostHeader(resolved, 'standard'), imports: [] };
  }

  private generateBlogSidebar(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNBlogSidebar } = require('./ui/react-native/blog');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNBlogSidebar(resolved), imports: [] };
  }

  private generateCommentSection(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNCommentSection } = require('./ui/react-native/blog');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNCommentSection(resolved, 'flat'), imports: [] };
  }

  private generateCommentForm(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNCommentForm } = require('./ui/react-native/blog');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNCommentForm(resolved, 'inline'), imports: [] };
  }

  private generateRelatedArticles(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNRelatedArticles } = require('./ui/react-native/blog');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNRelatedArticles(resolved, 'horizontal'), imports: [] };
  }

  private generateCategoriesWidget(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNCategoriesWidget } = require('./ui/react-native/blog');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNCategoriesWidget(resolved, 'grid'), imports: [] };
  }

  private generateRichTextEditor(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNRichTextEditor } = require('./ui/react-native/blog');
    const resolved = this.resolveComponentData(component, entityName);
    return { code: generateRNRichTextEditor(resolved), imports: [] };
  }

  /**
   * Resolve component data to ResolvedComponent format (following React frontend pattern)
   */
  private resolveComponentData(component: Component, entityName: string): any {
    return {
      dataSource: component.data?.entity || entityName,
      title: component.title,
      data: {
        entity: component.data?.entity || entityName,
        fields: component.data?.fields || [],
        relations: component.data?.relations || [],
        fetchOperation: component.data?.fetchOperation,
      },
      fields: component.data?.fields || [],
      relations: component.data?.relations || [],
      fetchOperation: component.data?.fetchOperation,
      actions: component.actions || [],
      props: component.props || {},
      fieldMappings: component.data?.fields?.map((field: DataField) => ({
        sourceField: field.name,
        targetField: field.name,
        type: field.type,
      })) || [],
    };
  }

  /**
   * Find field from component data fields with fallback names
   */
  private findField(fields: DataField[], fieldNames: string[]): DataField | undefined {
    for (const name of fieldNames) {
      const field = fields.find(f => f.name.toLowerCase() === name.toLowerCase());
      if (field) return field;
    }
    return undefined;
  }

  /**
   * Find relation from component data relations
   */
  private findRelation(relations: any[], relationName: string): any | undefined {
    return relations?.find(r => r.entity?.toLowerCase() === relationName.toLowerCase());
  }

  /**
   * Get API route from component actions
   */
  private getAPIRoute(actions: ComponentAction[], entityName: string): string {
    const fetchAction = actions.find(a => a.type === 'fetch');
    if (fetchAction?.serverFunction?.route) {
      return fetchAction.serverFunction.route;
    }
    // Fallback to standard REST convention
    return `/api/v1/${entityName}`;
  }

  // Food delivery component generators
  private generateRestaurantDetailHeader(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNRestaurantDetailHeader } = require('./ui/react-native/food');
    return generateRNRestaurantDetailHeader();
  }

  // Budget & Expense Tracker component generators
  private generateExpenseList(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNExpenseCard } = require('./ui/react-native/budget');
    const resolved = this.resolveComponentData(component, entityName);
    // Default to compact variant for lists, can be overridden by component props
    const variant = component.props?.variant || 'compact';
    return { code: generateRNExpenseCard(resolved, variant), imports: [] };
  }

  private generateBudgetProgressCard(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNBudgetProgressCard } = require('./ui/react-native/budget');
    const resolved = this.resolveComponentData(component, entityName);
    const variant = component.props?.variant || 'standard';
    return { code: generateRNBudgetProgressCard(resolved, variant), imports: [] };
  }

  private generateFinancialGoalCard(component: Component, entityName: string): { code: string; imports: string[] } {
    const { generateRNFinancialGoalCard } = require('./ui/react-native/budget');
    const resolved = this.resolveComponentData(component, entityName);
    const variant = component.props?.variant || 'standard';
    return { code: generateRNFinancialGoalCard(resolved, variant), imports: [] };
  }

  /**
   * Generate Entity Detail with Header component
   */
  private generateEntityDetailWithHeader(component: Component, entityName: string): { code: string; imports: string[] } {
    const resolved = this.resolveComponentData(component, entityName);
    return generateRNEntityDetailWithHeader(resolved);
  }
}
