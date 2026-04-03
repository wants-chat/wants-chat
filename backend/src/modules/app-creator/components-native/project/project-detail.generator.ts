/**
 * Project Detail Component Generators (React Native)
 *
 * Generates project-related filter and timeline components including:
 * - ProjectFilters: Generic project filters
 * - ProjectFiltersConsulting: Consulting-specific project filters
 * - ProjectFiltersDesign: Design agency project filters
 * - ProjectTimelineConsulting: Consulting project timeline
 */

export interface ProjectFilterOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateProjectFilters(options: ProjectFilterOptions = {}): string {
  const { componentName = 'ProjectFilters' } = options;

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
  team: string;
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
  team: '',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);

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
    currentFilters.priority || currentFilters.team;

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    options: Array<{ value: string; label: string }>,
    selectedValue: string,
    onSelect: (value: string) => void,
    title: string
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
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
                  onClose();
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
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="folder-outline" size={20} color="#6B7280" />
          <Text style={styles.headerTitle}>Filter Projects</Text>
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
          placeholder="Search projects..."
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
          onPress={() => setShowStatusModal(true)}
        >
          <Text style={[styles.filterButtonText, currentFilters.status && styles.filterButtonTextActive]}>
            {statusOptions.find(o => o.value === currentFilters.status)?.label || 'Status'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={currentFilters.status ? '#3B82F6' : '#6B7280'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, currentFilters.priority && styles.filterButtonActive]}
          onPress={() => setShowPriorityModal(true)}
        >
          <Text style={[styles.filterButtonText, currentFilters.priority && styles.filterButtonTextActive]}>
            {priorityOptions.find(o => o.value === currentFilters.priority)?.label || 'Priority'}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={currentFilters.priority ? '#3B82F6' : '#6B7280'}
          />
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
            Clear all filters
          </Text>
        </TouchableOpacity>
        {onSearch && (
          <TouchableOpacity style={styles.applyButton} onPress={handleSearch}>
            <Ionicons name="filter" size={16} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      {renderPickerModal(
        showStatusModal,
        () => setShowStatusModal(false),
        statusOptions,
        currentFilters.status,
        (value) => updateFilter('status', value),
        'Select Status'
      )}
      {renderPickerModal(
        showPriorityModal,
        () => setShowPriorityModal(false),
        priorityOptions,
        currentFilters.priority,
        (value) => updateFilter('priority', value),
        'Select Priority'
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

export function generateProjectFiltersConsulting(options: ProjectFilterOptions = {}): string {
  const { componentName = 'ProjectFiltersConsulting' } = options;

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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface FilterValues {
  search: string;
  status: string;
  type: string;
  client: string;
  industry: string;
}

interface ${componentName}Props {
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  type: '',
  client: '',
  industry: '',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'active', label: 'Active' },
  { value: 'review', label: 'Under Review' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
];

const consultingTypes = [
  { value: '', label: 'All Types' },
  { value: 'strategy', label: 'Strategy Consulting' },
  { value: 'management', label: 'Management Consulting' },
  { value: 'technology', label: 'Technology Consulting' },
  { value: 'operations', label: 'Operations Consulting' },
  { value: 'hr', label: 'HR Consulting' },
  { value: 'financial', label: 'Financial Advisory' },
];

const industries = [
  { value: '', label: 'All Industries' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Financial Services' },
  { value: 'technology', label: 'Technology' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'energy', label: 'Energy' },
  { value: 'government', label: 'Government' },
];

const ${componentName}: React.FC<${componentName}Props> = ({
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/clients');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch {
        return [];
      }
    },
  });

  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...clients.map((c: any) => ({ value: c.id, label: c.name })),
  ];

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
    currentFilters.type || currentFilters.client || currentFilters.industry;

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
          <Ionicons name="briefcase-outline" size={20} color="#6B7280" />
          <Text style={styles.headerTitle}>Filter Consulting Projects</Text>
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
          placeholder="Search projects by name or description..."
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
          <FilterButton
            label="Status"
            value={currentFilters.status}
            options={statusOptions}
            modalKey="status"
          />
          <FilterButton
            label="Type"
            value={currentFilters.type}
            options={consultingTypes}
            modalKey="type"
          />
          <FilterButton
            label="Client"
            value={currentFilters.client}
            options={clientOptions}
            modalKey="client"
          />
          <FilterButton
            label="Industry"
            value={currentFilters.industry}
            options={industries}
            modalKey="industry"
          />
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
            <Ionicons name="filter" size={16} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      {renderPickerModal('status', statusOptions, currentFilters.status, (v) => updateFilter('status', v), 'Select Status')}
      {renderPickerModal('type', consultingTypes, currentFilters.type, (v) => updateFilter('type', v), 'Select Type')}
      {renderPickerModal('client', clientOptions, currentFilters.client, (v) => updateFilter('client', v), 'Select Client')}
      {renderPickerModal('industry', industries, currentFilters.industry, (v) => updateFilter('industry', v), 'Select Industry')}
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

export function generateProjectFiltersDesign(options: ProjectFilterOptions = {}): string {
  const { componentName = 'ProjectFiltersDesign' } = options;

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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface FilterValues {
  search: string;
  status: string;
  type: string;
  client: string;
  designer: string;
  tags: string[];
}

interface ${componentName}Props {
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
}

const initialFilters: FilterValues = {
  search: '',
  status: '',
  type: '',
  client: '',
  designer: '',
  tags: [],
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'brief', label: 'Brief Received' },
  { value: 'research', label: 'Research' },
  { value: 'concept', label: 'Concept' },
  { value: 'design', label: 'In Design' },
  { value: 'revision', label: 'Revisions' },
  { value: 'approved', label: 'Approved' },
  { value: 'delivered', label: 'Delivered' },
];

const designTypes = [
  { value: '', label: 'All Types' },
  { value: 'branding', label: 'Branding & Identity' },
  { value: 'web', label: 'Web Design' },
  { value: 'mobile', label: 'Mobile App Design' },
  { value: 'ui-ux', label: 'UI/UX Design' },
  { value: 'print', label: 'Print Design' },
  { value: 'packaging', label: 'Packaging Design' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'motion', label: 'Motion Graphics' },
];

const designTags = [
  'minimalist', 'modern', 'vintage', 'bold', 'playful',
  'corporate', 'elegant', 'colorful', 'monochrome', 'tech',
];

const ${componentName}: React.FC<${componentName}Props> = ({
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/clients');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch {
        return [];
      }
    },
  });

  const { data: designers = [] } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('/team-members?role=designer');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch {
        return [];
      }
    },
  });

  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...clients.map((c: any) => ({ value: c.id, label: c.name })),
  ];

  const designerOptions = [
    { value: '', label: 'All Designers' },
    ...designers.map((d: any) => ({ value: d.id, label: d.name })),
  ];

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof FilterValues, value: any) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const toggleTag = useCallback((tag: string) => {
    const currentTags = currentFilters.tags || [];
    const updated = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    updateFilter('tags', updated);
  }, [currentFilters.tags, updateFilter]);

  const clearAll = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onSearch) onSearch(initialFilters);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = currentFilters.search || currentFilters.status ||
    currentFilters.type || currentFilters.client || currentFilters.designer ||
    (currentFilters.tags && currentFilters.tags.length > 0);

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
                  <Ionicons name="checkmark" size={20} color="#8B5CF6" />
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
        color={value ? '#8B5CF6' : '#6B7280'}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="color-palette-outline" size={20} color="#8B5CF6" />
          <Text style={styles.headerTitle}>Filter Design Projects</Text>
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
          placeholder="Search projects..."
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
          <FilterButton label="Type" value={currentFilters.type} options={designTypes} modalKey="type" />
          <FilterButton label="Client" value={currentFilters.client} options={clientOptions} modalKey="client" />
          <FilterButton label="Designer" value={currentFilters.designer} options={designerOptions} modalKey="designer" />
        </View>
      </ScrollView>

      {/* Style Tags */}
      <View style={styles.tagsSection}>
        <View style={styles.tagsHeader}>
          <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
          <Text style={styles.tagsLabel}>Style Tags</Text>
        </View>
        <View style={styles.tagsContainer}>
          {designTags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagButton,
                currentFilters.tags?.includes(tag) && styles.tagButtonActive,
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  currentFilters.tags?.includes(tag) && styles.tagTextActive,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
            <Ionicons name="filter" size={16} color="#FFFFFF" />
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modals */}
      {renderPickerModal('status', statusOptions, currentFilters.status, (v) => updateFilter('status', v), 'Select Status')}
      {renderPickerModal('type', designTypes, currentFilters.type, (v) => updateFilter('type', v), 'Select Type')}
      {renderPickerModal('client', clientOptions, currentFilters.client, (v) => updateFilter('client', v), 'Select Client')}
      {renderPickerModal('designer', designerOptions, currentFilters.designer, (v) => updateFilter('designer', v), 'Select Designer')}
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
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    color: '#7C3AED',
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
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
  tagsSection: {
    marginBottom: 16,
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tagButtonActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tagTextActive: {
    color: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
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
    backgroundColor: '#F5F3FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export function generateProjectTimelineConsulting(options: ProjectFilterOptions = {}): string {
  const { componentName = 'ProjectTimelineConsulting', endpoint = '/projects' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  projectId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ projectId: propId }) => {
  const route = useRoute<any>();
  const projectId = propId || route.params?.id;
  const [refreshing, setRefreshing] = useState(false);

  const { data: project, isLoading: loadingProject, refetch: refetchProject } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + projectId);
      return response?.data || response;
    },
    enabled: !!projectId,
  });

  const { data: milestones, isLoading: loadingMilestones, refetch: refetchMilestones } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + projectId + '/milestones');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!projectId,
  });

  const { data: activities, isLoading: loadingActivities, refetch: refetchActivities } = useQuery({
    queryKey: ['project-activities', projectId],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + projectId + '/activities');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!projectId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProject(), refetchMilestones(), refetchActivities()]);
    setRefreshing(false);
  }, [refetchProject, refetchMilestones, refetchActivities]);

  const isLoading = loadingProject || loadingMilestones || loadingActivities;

  const getMilestoneIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'kickoff': return 'people';
      case 'discovery': return 'document-text';
      case 'analysis': return 'analytics';
      case 'presentation': return 'easel';
      case 'delivery': return 'checkmark-circle';
      case 'review': return 'chatbubbles';
      default: return 'calendar';
    }
  };

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#D1FAE5', border: '#059669' };
      case 'in-progress': return { bg: '#DBEAFE', border: '#3B82F6' };
      case 'delayed': return { bg: '#FEE2E2', border: '#EF4444' };
      default: return { bg: '#F3F4F6', border: '#9CA3AF' };
    }
  };

  const getPhaseProgress = () => {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter((m: any) => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'meeting': return 'people';
      case 'document': return 'document';
      case 'milestone': return 'checkmark-circle';
      default: return 'chatbubble';
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
    >
      {/* Project Header Summary */}
      {project && (
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.headerInfo}>
              <Text style={styles.projectTitle}>{project.name || project.title}</Text>
              <Text style={styles.clientName}>{project.client_name}</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{getPhaseProgress()}%</Text>
            </View>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: \`\${getPhaseProgress()}%\` }]} />
          </View>
        </View>
      )}

      {/* Milestones Timeline */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flag-outline" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Project Milestones</Text>
        </View>

        <View style={styles.timelineContainer}>
          <View style={styles.timelineLine} />
          {milestones && milestones.length > 0 ? (
            milestones.map((milestone: any, index: number) => {
              const colors = getMilestoneColor(milestone.status);
              return (
                <View key={milestone.id || index} style={styles.milestoneItem}>
                  <View style={[styles.milestoneIcon, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                    <Ionicons name={getMilestoneIcon(milestone.type)} size={16} color={colors.border} />
                  </View>
                  <View style={styles.milestoneContent}>
                    <View style={styles.milestoneHeader}>
                      <Text style={styles.milestoneName}>{milestone.name || milestone.title}</Text>
                      <Text style={styles.milestoneDate}>
                        {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'TBD'}
                      </Text>
                    </View>
                    {milestone.description && (
                      <Text style={styles.milestoneDescription}>{milestone.description}</Text>
                    )}
                    {milestone.status === 'completed' && milestone.completed_at && (
                      <Text style={styles.completedDate}>
                        Completed {new Date(milestone.completed_at).toLocaleDateString()}
                      </Text>
                    )}
                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                      <View style={styles.deliverables}>
                        {milestone.deliverables.map((d: string, i: number) => (
                          <View key={i} style={styles.deliverableTag}>
                            <Text style={styles.deliverableText}>{d}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No milestones defined yet</Text>
            </View>
          )}
        </View>
      </View>

      {/* Activity Feed */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={20} color="#6B7280" />
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>

        {activities && activities.length > 0 ? (
          activities.slice(0, 10).map((activity: any, index: number) => (
            <View key={activity.id || index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name={getActivityIcon(activity.type)} size={16} color="#6B7280" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  {activity.description || activity.message}
                </Text>
                <Text style={styles.activityMeta}>
                  {activity.user_name && \`\${activity.user_name} - \`}
                  {new Date(activity.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        )}
      </View>
    </ScrollView>
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
  headerCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  clientName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  progressBadge: {
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  timelineContainer: {
    position: 'relative',
    paddingLeft: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 11,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  milestoneItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  milestoneIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    zIndex: 1,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  milestoneDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  milestoneDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  completedDate: {
    fontSize: 11,
    color: '#059669',
    marginTop: 4,
  },
  deliverables: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  deliverableTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deliverableText: {
    fontSize: 11,
    color: '#4B5563',
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#111827',
  },
  activityMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}
