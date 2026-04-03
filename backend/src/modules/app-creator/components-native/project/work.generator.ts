/**
 * Work Order Component Generators (React Native)
 *
 * Generates work order management components including:
 * - ActiveWorkOrders: Grid/list of active work orders
 * - WorkOrderFilters: Filter controls for work orders
 * - WorkOrderTimeline: Timeline view of work order activities
 * - WorkFilters: Generic work item filters
 */

export interface WorkOrderOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateActiveWorkOrders(options: WorkOrderOptions = {}): string {
  const { componentName = 'ActiveWorkOrders', endpoint = '/work-orders' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  filter?: string;
  limit?: number;
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  low: { bg: '#D1FAE5', text: '#059669' },
  medium: { bg: '#FEF3C7', text: '#D97706' },
  high: { bg: '#FED7AA', text: '#EA580C' },
  urgent: { bg: '#FEE2E2', text: '#DC2626' },
};

const statusIcons: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  pending: { name: 'time-outline', color: '#F59E0B' },
  'in-progress': { name: 'construct-outline', color: '#3B82F6' },
  completed: { name: 'checkmark-circle-outline', color: '#10B981' },
  cancelled: { name: 'alert-circle-outline', color: '#EF4444' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ filter, limit }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: workOrders, isLoading, refetch } = useQuery({
    queryKey: ['work-orders', filter, limit],
    queryFn: async () => {
      let url = '${endpoint}?status=active';
      if (filter) url += '&type=' + filter;
      if (limit) url += '&limit=' + limit;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    const priority = item.priority || 'medium';
    const status = item.status || 'pending';
    const colors = priorityColors[priority] || priorityColors.medium;
    const statusIcon = statusIcons[status] || statusIcons.pending;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('WorkOrderDetail' as never, { id: item.id } as never)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.statusIcon}>
            <Ionicons name={statusIcon.name} size={20} color={statusIcon.color} />
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || item.name || \`WO-\${item.id}\`}
          </Text>
          <View style={[styles.priorityBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.priorityText, { color: colors.text }]}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          {item.assignee_name && (
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color="#9CA3AF" />
              <Text style={styles.metaText}>{item.assignee_name}</Text>
            </View>
          )}
          {item.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#9CA3AF" />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          )}
          {item.due_date && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
              <Text style={styles.metaText}>
                {new Date(item.due_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  const keyExtractor = useCallback((item: any) => String(item.id), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="construct-outline" size={20} color="#3B82F6" />
        <Text style={styles.headerTitle}>Active Work Orders</Text>
      </View>

      {workOrders && workOrders.length > 0 ? (
        <FlatList
          data={workOrders}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
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
          <Ionicons name="construct-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No active work orders</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    padding: 8,
  },
  card: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateWorkOrderFilters(options: WorkOrderOptions = {}): string {
  const { componentName = 'WorkOrderFilters' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterValues {
  search: string;
  status: string;
  priority: string;
  type: string;
}

interface ${componentName}Props {
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  priority: '',
  type: '',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'repair', label: 'Repair' },
  { value: 'installation', label: 'Installation' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'other', label: 'Other' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: string) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = currentFilters.search || currentFilters.status ||
    currentFilters.priority || currentFilters.type;

  const renderPickerModal = (
    key: string,
    options: Array<{ value: string; label: string }>,
    selectedValue: string,
    onSelect: (value: string) => void,
    title: string
  ) => (
    <Modal
      visible={activeModal === key}
      transparent
      animationType="slide"
      onRequestClose={() => setActiveModal(null)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={() => setActiveModal(null)}
        activeOpacity={1}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  selectedValue === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  setActiveModal(null);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedValue === option.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const FilterButton = ({ label, value, options, modalKey }: {
    label: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    modalKey: string;
  }) => (
    <TouchableOpacity
      style={[styles.filterButton, value && styles.filterButtonActive]}
      onPress={() => setActiveModal(modalKey)}
    >
      <Text style={[styles.filterButtonText, value && styles.filterButtonTextActive]}>
        {options.find(o => o.value === value)?.label || label}
      </Text>
      <Ionicons
        name="chevron-down"
        size={16}
        color={value ? '#3B82F6' : '#6B7280'}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="filter-outline" size={20} color="#6B7280" />
          <Text style={styles.headerTitle}>Filter Work Orders</Text>
          {hasActiveFilters && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search work orders..."
          placeholderTextColor="#9CA3AF"
          value={currentFilters.search}
          onChangeText={(text) => updateFilter('search', text)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {currentFilters.search.length > 0 && (
          <TouchableOpacity onPress={() => updateFilter('search', '')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          <FilterButton label="Status" value={currentFilters.status} options={statusOptions} modalKey="status" />
          <FilterButton label="Priority" value={currentFilters.priority} options={priorityOptions} modalKey="priority" />
          <FilterButton label="Type" value={currentFilters.type} options={typeOptions} modalKey="type" />
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={clearAll}
          disabled={!hasActiveFilters}
          style={[styles.clearButton, !hasActiveFilters && styles.clearButtonDisabled]}
        >
          <Text style={[styles.clearButtonText, !hasActiveFilters && styles.clearButtonTextDisabled]}>
            Clear all filters
          </Text>
        </TouchableOpacity>
        {onSearch && (
          <TouchableOpacity style={styles.applyButton} onPress={handleSearch}>
            <Ionicons name="search" size={16} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      {renderPickerModal('status', statusOptions, currentFilters.status, (v) => updateFilter('status', v), 'Select Status')}
      {renderPickerModal('priority', priorityOptions, currentFilters.priority, (v) => updateFilter('priority', v), 'Select Priority')}
      {renderPickerModal('type', typeOptions, currentFilters.type, (v) => updateFilter('type', v), 'Select Type')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  activeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    color: '#1D4ED8',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  filterScroll: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  filterButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    paddingVertical: 8,
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  clearButtonTextDisabled: {
    color: '#9CA3AF',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export function generateWorkOrderTimeline(options: WorkOrderOptions = {}): string {
  const { componentName = 'WorkOrderTimeline', endpoint = '/work-orders' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  workOrderId?: string;
}

const activityIcons: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  created: { name: 'document-text-outline', color: '#3B82F6', bg: '#DBEAFE' },
  assigned: { name: 'person-outline', color: '#8B5CF6', bg: '#EDE9FE' },
  started: { name: 'construct-outline', color: '#F97316', bg: '#FFEDD5' },
  completed: { name: 'checkmark-circle-outline', color: '#10B981', bg: '#D1FAE5' },
  comment: { name: 'chatbubble-outline', color: '#6B7280', bg: '#F3F4F6' },
  photo: { name: 'camera-outline', color: '#EC4899', bg: '#FCE7F3' },
  issue: { name: 'alert-circle-outline', color: '#EF4444', bg: '#FEE2E2' },
};

const ${componentName}: React.FC<${componentName}Props> = ({ workOrderId: propId }) => {
  const route = useRoute<any>();
  const workOrderId = propId || route.params?.id;
  const [refreshing, setRefreshing] = useState(false);

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['work-order-timeline', workOrderId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + workOrderId + '/activities');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!workOrderId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const type = item.type || 'comment';
    const icon = activityIcons[type] || activityIcons.comment;
    const isLast = activities && index === activities.length - 1;

    return (
      <View style={styles.activityItem}>
        <View style={styles.iconColumn}>
          <View style={[styles.activityIcon, { backgroundColor: icon.bg }]}>
            <Ionicons name={icon.name} size={16} color={icon.color} />
          </View>
          {!isLast && <View style={styles.line} />}
        </View>
        <View style={styles.contentColumn}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>
              {item.title || item.description || item.message}
            </Text>
            <Text style={styles.activityTime}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
          {item.user_name && (
            <Text style={styles.activityUser}>by {item.user_name}</Text>
          )}
          {item.details && (
            <Text style={styles.activityDetails}>{item.details}</Text>
          )}
          {item.photos && item.photos.length > 0 && (
            <View style={styles.photosRow}>
              {item.photos.slice(0, 4).map((photo: string, i: number) => (
                <Image
                  key={i}
                  source={{ uri: photo }}
                  style={styles.photo}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }, [activities]);

  const keyExtractor = useCallback((item: any, index: number) =>
    item.id ? String(item.id) : String(index), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="time-outline" size={20} color="#6B7280" />
        <Text style={styles.headerTitle}>Work Order Timeline</Text>
      </View>

      {activities && activities.length > 0 ? (
        <FlatList
          data={activities}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No activity recorded yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    paddingLeft: 4,
  },
  activityItem: {
    flexDirection: 'row',
  },
  iconColumn: {
    alignItems: 'center',
    marginRight: 12,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: -4,
  },
  contentColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  activityTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  activityUser: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activityDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 18,
  },
  photosRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateWorkFilters(options: WorkOrderOptions = {}): string {
  const { componentName = 'WorkFilters' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterValues {
  search: string;
  status: string;
  category: string;
  worker: string;
}

interface ${componentName}Props {
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
  collapsible?: boolean;
  statusOptions?: Array<{ value: string; label: string }>;
  categoryOptions?: Array<{ value: string; label: string }>;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  category: '',
  worker: '',
};

const defaultStatusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
];

const defaultCategoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'construction', label: 'Construction' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'general', label: 'General' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  values: propValues,
  onChange,
  onSearch,
  collapsible = false,
  statusOptions = defaultStatusOptions,
  categoryOptions = defaultCategoryOptions,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [expanded, setExpanded] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: string) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = currentFilters.search || currentFilters.status ||
    currentFilters.category || currentFilters.worker;

  const renderPickerModal = (
    key: string,
    options: Array<{ value: string; label: string }>,
    selectedValue: string,
    onSelect: (value: string) => void,
    title: string
  ) => (
    <Modal
      visible={activeModal === key}
      transparent
      animationType="slide"
      onRequestClose={() => setActiveModal(null)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={() => setActiveModal(null)}
        activeOpacity={1}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  selectedValue === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option.value);
                  setActiveModal(null);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedValue === option.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {collapsible ? (
        <TouchableOpacity
          style={styles.collapsibleHeader}
          onPress={() => setExpanded(!expanded)}
        >
          <View style={styles.headerLeft}>
            <Ionicons name="filter-outline" size={20} color="#6B7280" />
            <Text style={styles.headerTitle}>Filters</Text>
            {hasActiveFilters && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#6B7280"
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="filter-outline" size={20} color="#6B7280" />
            <Text style={styles.headerTitle}>Filters</Text>
            {hasActiveFilters && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {(!collapsible || expanded) && (
        <View style={styles.content}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search work items..."
              placeholderTextColor="#9CA3AF"
              value={currentFilters.search}
              onChangeText={(text) => updateFilter('search', text)}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {currentFilters.search.length > 0 && (
              <TouchableOpacity onPress={() => updateFilter('search', '')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterButton, currentFilters.status && styles.filterButtonActive]}
              onPress={() => setActiveModal('status')}
            >
              <Text style={[styles.filterButtonText, currentFilters.status && styles.filterButtonTextActive]}>
                {statusOptions.find(o => o.value === currentFilters.status)?.label || 'Status'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={currentFilters.status ? '#3B82F6' : '#6B7280'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterButton, currentFilters.category && styles.filterButtonActive]}
              onPress={() => setActiveModal('category')}
            >
              <Text style={[styles.filterButtonText, currentFilters.category && styles.filterButtonTextActive]}>
                {categoryOptions.find(o => o.value === currentFilters.category)?.label || 'Category'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={currentFilters.category ? '#3B82F6' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={clearAll}
              disabled={!hasActiveFilters}
              style={[styles.clearButton, !hasActiveFilters && styles.clearButtonDisabled]}
            >
              <Text style={[styles.clearButtonText, !hasActiveFilters && styles.clearButtonTextDisabled]}>
                Clear all
              </Text>
            </TouchableOpacity>
            {onSearch && (
              <TouchableOpacity style={styles.applyButton} onPress={handleSearch}>
                <Ionicons name="search" size={16} color="#FFFFFF" />
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Modals */}
      {renderPickerModal('status', statusOptions, currentFilters.status, (v) => updateFilter('status', v), 'Select Status')}
      {renderPickerModal('category', categoryOptions, currentFilters.category, (v) => updateFilter('category', v), 'Select Category')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  activeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    color: '#1D4ED8',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    paddingVertical: 8,
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  clearButtonTextDisabled: {
    color: '#9CA3AF',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}
