/**
 * Legal Case Component Generators (React Native)
 *
 * Generates case management components for law firm applications.
 */

export interface CaseOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCaseFilters(options: CaseOptions = {}): string {
  const { componentName = 'CaseFilters' } = options;

  return `import React, { useState } from 'react';
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

interface CaseFilterState {
  search: string;
  status: string;
  caseType: string;
  priority: string;
  attorney: string;
}

interface ${componentName}Props {
  onFilterChange?: (filters: CaseFilterState) => void;
  initialFilters?: Partial<CaseFilterState>;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState<CaseFilterState>({
    search: '',
    status: '',
    caseType: '',
    priority: '',
    attorney: '',
    ...initialFilters,
  });
  const [showModal, setShowModal] = useState(false);

  const handleFilterChange = (key: keyof CaseFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: CaseFilterState = {
      search: '',
      status: '',
      caseType: '',
      priority: '',
      attorney: '',
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const statusOptions = ['', 'open', 'active', 'pending', 'closed', 'on_hold'];
  const typeOptions = ['', 'civil', 'criminal', 'family', 'corporate', 'immigration', 'real_estate', 'personal_injury'];
  const priorityOptions = ['', 'low', 'medium', 'high', 'urgent'];

  const FilterOption = ({
    label,
    value,
    options,
    onSelect
  }: {
    label: string;
    value: string;
    options: string[];
    onSelect: (v: string) => void;
  }) => (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionsRow}>
          {options.map((option) => (
            <TouchableOpacity
              key={option || 'all'}
              style={[
                styles.optionChip,
                value === option && styles.optionChipActive,
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  value === option && styles.optionTextActive,
                ]}
              >
                {option === '' ? 'All' : option.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={filters.search}
            onChangeText={(text) => handleFilterChange('search', text)}
            placeholder="Search cases..."
            placeholderTextColor="#9CA3AF"
          />
          {filters.search !== '' && (
            <TouchableOpacity onPress={() => handleFilterChange('search', '')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="options-outline" size={20} color="#374151" />
          {hasActiveFilters && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <FilterOption
              label="Status"
              value={filters.status}
              options={statusOptions}
              onSelect={(v) => handleFilterChange('status', v)}
            />

            <FilterOption
              label="Case Type"
              value={filters.caseType}
              options={typeOptions}
              onSelect={(v) => handleFilterChange('caseType', v)}
            />

            <FilterOption
              label="Priority"
              value={filters.priority}
              options={priorityOptions}
              onSelect={(v) => handleFilterChange('priority', v)}
            />

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Attorney</Text>
              <TextInput
                style={styles.filterInput}
                value={filters.attorney}
                onChangeText={(text) => handleFilterChange('attorney', text)}
                placeholder="Filter by attorney name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  clearText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  optionChipActive: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  filterInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  applyButton: {
    margin: 16,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generateCaseFiltersLawfirm(options: CaseOptions = {}): string {
  const { componentName = 'CaseFiltersLawfirm', endpoint = '/attorneys' } = options;

  return `import React, { useState } from 'react';
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

interface LawfirmCaseFilterState {
  search: string;
  status: string;
  caseType: string;
  priority: string;
  assignedAttorney: string;
  practiceArea: string;
  billingStatus: string;
}

interface ${componentName}Props {
  onFilterChange?: (filters: LawfirmCaseFilterState) => void;
  initialFilters?: Partial<LawfirmCaseFilterState>;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState<LawfirmCaseFilterState>({
    search: '',
    status: '',
    caseType: '',
    priority: '',
    assignedAttorney: '',
    practiceArea: '',
    billingStatus: '',
    ...initialFilters,
  });
  const [showModal, setShowModal] = useState(false);

  const { data: attorneys } = useQuery({
    queryKey: ['attorneys-list'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const handleFilterChange = (key: keyof LawfirmCaseFilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: LawfirmCaseFilterState = {
      search: '',
      status: '',
      caseType: '',
      priority: '',
      assignedAttorney: '',
      practiceArea: '',
      billingStatus: '',
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  const statusOptions = ['', 'intake', 'active', 'discovery', 'litigation', 'settlement', 'closed', 'archived'];
  const priorityOptions = ['', 'low', 'medium', 'high', 'critical'];
  const billingOptions = ['', 'current', 'pending', 'overdue', 'paid'];

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={filters.search}
            onChangeText={(text) => handleFilterChange('search', text)}
            placeholder="Search by case number, title, client..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="options-outline" size={20} color="#374151" />
          {hasActiveFilters && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Advanced Filters</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsRow}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option || 'all'}
                      style={[
                        styles.optionChip,
                        filters.status === option && styles.optionChipActive,
                      ]}
                      onPress={() => handleFilterChange('status', option)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.status === option && styles.optionTextActive,
                        ]}
                      >
                        {option === '' ? 'All' : option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Assigned Attorney</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.optionChip,
                      filters.assignedAttorney === '' && styles.optionChipActive,
                    ]}
                    onPress={() => handleFilterChange('assignedAttorney', '')}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        filters.assignedAttorney === '' && styles.optionTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {attorneys?.map((attorney: any) => (
                    <TouchableOpacity
                      key={attorney.id}
                      style={[
                        styles.optionChip,
                        filters.assignedAttorney === attorney.id && styles.optionChipActive,
                      ]}
                      onPress={() => handleFilterChange('assignedAttorney', attorney.id)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.assignedAttorney === attorney.id && styles.optionTextActive,
                        ]}
                      >
                        {attorney.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Priority</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsRow}>
                  {priorityOptions.map((option) => (
                    <TouchableOpacity
                      key={option || 'all'}
                      style={[
                        styles.optionChip,
                        filters.priority === option && styles.optionChipActive,
                      ]}
                      onPress={() => handleFilterChange('priority', option)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.priority === option && styles.optionTextActive,
                        ]}
                      >
                        {option === '' ? 'All' : option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Billing Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.optionsRow}>
                  {billingOptions.map((option) => (
                    <TouchableOpacity
                      key={option || 'all'}
                      style={[
                        styles.optionChip,
                        filters.billingStatus === option && styles.optionChipActive,
                      ]}
                      onPress={() => handleFilterChange('billingStatus', option)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.billingStatus === option && styles.optionTextActive,
                        ]}
                      >
                        {option === '' ? 'All' : option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  clearText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  optionChipActive: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  applyButton: {
    margin: 16,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export function generateCaseHeader(options: CaseOptions = {}): string {
  const { componentName = 'CaseHeader', endpoint = '/cases' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface CaseData {
  id: string;
  case_number: string;
  title: string;
  status: string;
  priority: string;
  case_type: string;
  practice_area?: string;
  client_name: string;
  client_id?: string;
  attorney_name?: string;
  court_name?: string;
  next_hearing?: string;
  description?: string;
}

interface ${componentName}Props {
  caseId?: string;
  onEdit?: () => void;
  onBack?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ caseId: propId, onEdit, onBack }) => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const caseId = propId || route.params?.caseId;

  const { data: caseData, isLoading, refetch } = useQuery({
    queryKey: ['case', caseId],
    queryFn: async () => {
      const response = await api.get<CaseData>('${endpoint}/' + caseId);
      return response?.data || response;
    },
    enabled: !!caseId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigation.navigate('CaseEdit', { id: caseId });
    }
  };

  const getStatusColor = (status: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      open: { bg: '#DBEAFE', text: '#1D4ED8' },
      active: { bg: '#DCFCE7', text: '#15803D' },
      pending: { bg: '#FEF9C3', text: '#A16207' },
      closed: { bg: '#F3F4F6', text: '#4B5563' },
      on_hold: { bg: '#FFEDD5', text: '#C2410C' },
      discovery: { bg: '#EDE9FE', text: '#7C3AED' },
      litigation: { bg: '#FEE2E2', text: '#DC2626' },
    };
    return colors[status?.toLowerCase()] || { bg: '#F3F4F6', text: '#4B5563' };
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: '#9CA3AF',
      medium: '#F59E0B',
      high: '#F97316',
      urgent: '#EF4444',
      critical: '#DC2626',
    };
    return colors[priority?.toLowerCase()] || '#9CA3AF';
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!caseData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="briefcase-outline" size={48} color="#9CA3AF" />
        <Text style={styles.errorText}>Case not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusColors = getStatusColor(caseData.status);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerEditButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#3B82F6" />
          <Text style={styles.headerEditText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.caseInfo}>
        <View style={styles.caseNumberRow}>
          <Text style={styles.caseNumber}>{caseData.case_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>
              {caseData.status?.replace(/_/g, ' ').toUpperCase()}
            </Text>
          </View>
          {caseData.priority && (
            <View style={styles.priorityBadge}>
              <Ionicons
                name="alert-circle"
                size={14}
                color={getPriorityColor(caseData.priority)}
              />
              <Text style={[styles.priorityText, { color: getPriorityColor(caseData.priority) }]}>
                {caseData.priority.toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{caseData.title}</Text>

        {caseData.description && (
          <Text style={styles.description} numberOfLines={2}>
            {caseData.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          {caseData.case_type && (
            <View style={styles.metaItem}>
              <Ionicons name="document-text-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{caseData.case_type}</Text>
            </View>
          )}
          {caseData.practice_area && (
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{caseData.practice_area}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <TouchableOpacity
          style={styles.detailCard}
          onPress={() => navigation.navigate('ClientDetail', { id: caseData.client_id })}
        >
          <View style={[styles.detailIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="person-outline" size={20} color="#1D4ED8" />
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Client</Text>
            <Text style={styles.detailValue}>{caseData.client_name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {caseData.attorney_name && (
          <View style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="person-outline" size={20} color="#7C3AED" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Lead Attorney</Text>
              <Text style={styles.detailValue}>{caseData.attorney_name}</Text>
            </View>
          </View>
        )}

        {caseData.court_name && (
          <View style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="business-outline" size={20} color="#B45309" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Court</Text>
              <Text style={styles.detailValue}>{caseData.court_name}</Text>
            </View>
          </View>
        )}

        {caseData.next_hearing && (
          <View style={styles.detailCard}>
            <View style={[styles.detailIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="calendar-outline" size={20} color="#DC2626" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Next Hearing</Text>
              <Text style={styles.detailValue}>
                {new Date(caseData.next_hearing).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerBackButton: {
    padding: 4,
  },
  headerEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  headerEditText: {
    marginLeft: 4,
    color: '#3B82F6',
    fontWeight: '500',
  },
  caseInfo: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  caseNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  caseNumber: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailsGrid: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    gap: 12,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
});

export default ${componentName};
`;
}

export function generateCaseListActive(options: CaseOptions = {}): string {
  const { componentName = 'CaseListActive', endpoint = '/cases' } = options;

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

interface ActiveCase {
  id: string;
  case_number: string;
  title: string;
  status: string;
  priority: string;
  client_name: string;
  attorney_name?: string;
  next_deadline?: string;
  next_hearing?: string;
  updated_at: string;
}

interface ${componentName}Props {
  limit?: number;
  showViewAll?: boolean;
  onCasePress?: (caseItem: ActiveCase) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  limit = 10,
  showViewAll = true,
  onCasePress,
}) => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: cases, isLoading, refetch } = useQuery({
    queryKey: ['active-cases', limit],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?status=active&limit=' + limit);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCasePress = (caseItem: ActiveCase) => {
    if (onCasePress) {
      onCasePress(caseItem);
    } else {
      navigation.navigate('CaseDetail', { id: caseItem.id });
    }
  };

  const getPriorityColor = (priority: string): { bg: string; text: string } => {
    const colors: Record<string, { bg: string; text: string }> = {
      low: { bg: '#F3F4F6', text: '#4B5563' },
      medium: { bg: '#FEF9C3', text: '#A16207' },
      high: { bg: '#FFEDD5', text: '#C2410C' },
      urgent: { bg: '#FEE2E2', text: '#DC2626' },
      critical: { bg: '#FEE2E2', text: '#991B1B' },
    };
    return colors[priority?.toLowerCase()] || { bg: '#F3F4F6', text: '#4B5563' };
  };

  const getUrgencyIndicator = (nextDeadline?: string, nextHearing?: string) => {
    const checkDate = nextDeadline || nextHearing;
    if (!checkDate) return null;

    const daysUntil = Math.ceil((new Date(checkDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return { text: 'OVERDUE', color: '#DC2626' };
    } else if (daysUntil <= 3) {
      return { text: daysUntil + 'd left', color: '#EF4444' };
    } else if (daysUntil <= 7) {
      return { text: daysUntil + 'd left', color: '#F97316' };
    }
    return null;
  };

  const renderCase = ({ item }: { item: ActiveCase }) => {
    const priorityColors = getPriorityColor(item.priority);
    const urgency = getUrgencyIndicator(item.next_deadline, item.next_hearing);

    return (
      <TouchableOpacity
        style={styles.caseCard}
        onPress={() => handleCasePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.caseHeader}>
          <Text style={styles.caseNumber}>{item.case_number}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg }]}>
            <Text style={[styles.priorityText, { color: priorityColors.text }]}>
              {item.priority}
            </Text>
          </View>
          {urgency && (
            <Text style={[styles.urgencyText, { color: urgency.color }]}>
              {urgency.text}
            </Text>
          )}
        </View>

        <Text style={styles.caseTitle} numberOfLines={1}>{item.title}</Text>

        <View style={styles.caseMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={14} color="#9CA3AF" />
            <Text style={styles.metaText}>{item.client_name}</Text>
          </View>
          {item.attorney_name && (
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={14} color="#9CA3AF" />
              <Text style={styles.metaText}>{item.attorney_name}</Text>
            </View>
          )}
        </View>

        {(item.next_deadline || item.next_hearing) && (
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
            <Text style={styles.dateLabel}>
              {item.next_deadline ? 'Deadline' : 'Hearing'}:
            </Text>
            <Text style={styles.dateValue}>
              {new Date(item.next_deadline || item.next_hearing || '').toLocaleDateString()}
            </Text>
          </View>
        )}

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  };

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
        <View style={styles.headerLeft}>
          <Ionicons name="briefcase" size={20} color="#3B82F6" />
          <Text style={styles.headerTitle}>Active Cases</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{cases?.length || 0}</Text>
          </View>
        </View>
        {showViewAll && (
          <TouchableOpacity onPress={() => navigation.navigate('Cases', { status: 'active' })}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cases && cases.length > 0 ? (
        <FlatList
          data={cases}
          renderItem={renderCase}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No active cases</Text>
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
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  listContent: {
    padding: 12,
    gap: 12,
  },
  caseCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    position: 'relative',
  },
  caseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  caseNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6B7280',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    paddingRight: 24,
  },
  caseMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  chevron: {
    position: 'absolute',
    right: 12,
    top: '50%',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateCaseStats(options: CaseOptions = {}): string {
  const { componentName = 'CaseStats', endpoint = '/cases/stats' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface CaseStatistics {
  total_cases: number;
  active_cases: number;
  pending_cases: number;
  closed_cases: number;
  won_cases?: number;
  lost_cases?: number;
  upcoming_deadlines: number;
  overdue_tasks: number;
  total_billable_hours?: number;
  total_revenue?: number;
  win_rate?: number;
  avg_case_duration?: number;
}

interface ${componentName}Props {
  showFinancials?: boolean;
  compact?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ showFinancials = false, compact = false }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['case-stats'],
    queryFn: async () => {
      const response = await api.get<CaseStatistics>('${endpoint}');
      return response?.data || response;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!stats) {
    return null;
  }

  const primaryStats = [
    { label: 'Total', value: stats.total_cases || 0, icon: 'briefcase', color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'Active', value: stats.active_cases || 0, icon: 'play-circle', color: '#10B981', bg: '#DCFCE7' },
    { label: 'Pending', value: stats.pending_cases || 0, icon: 'time', color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Closed', value: stats.closed_cases || 0, icon: 'checkmark-circle', color: '#6B7280', bg: '#F3F4F6' },
  ];

  const alertStats = [
    {
      label: 'Deadlines',
      value: stats.upcoming_deadlines || 0,
      icon: 'alarm',
      color: stats.upcoming_deadlines > 5 ? '#F97316' : '#6B7280',
      bg: stats.upcoming_deadlines > 5 ? '#FFEDD5' : '#F3F4F6',
      alert: stats.upcoming_deadlines > 5,
    },
    {
      label: 'Overdue',
      value: stats.overdue_tasks || 0,
      icon: 'alert-circle',
      color: stats.overdue_tasks > 0 ? '#EF4444' : '#6B7280',
      bg: stats.overdue_tasks > 0 ? '#FEE2E2' : '#F3F4F6',
      alert: stats.overdue_tasks > 0,
    },
  ];

  if (compact) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.compactContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {primaryStats.map((stat) => (
          <View key={stat.label} style={styles.compactCard}>
            <View style={[styles.compactIcon, { backgroundColor: stat.bg }]}>
              <Ionicons name={stat.icon as any} size={18} color={stat.color} />
            </View>
            <Text style={styles.compactValue}>{stat.value}</Text>
            <Text style={styles.compactLabel}>{stat.label}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
      }
    >
      <View style={styles.primaryGrid}>
        {primaryStats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label} Cases</Text>
          </View>
        ))}
      </View>

      <View style={styles.alertGrid}>
        {alertStats.map((stat) => (
          <View
            key={stat.label}
            style={[styles.alertCard, stat.alert && styles.alertCardActive]}
          >
            <View style={[styles.alertIcon, { backgroundColor: stat.bg }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertValue, stat.alert && { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.alertLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {showFinancials && (
        <View style={styles.financialSection}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.financialGrid}>
            {stats.total_billable_hours !== undefined && (
              <View style={styles.financialCard}>
                <Ionicons name="time-outline" size={20} color="#7C3AED" />
                <Text style={styles.financialValue}>{stats.total_billable_hours.toFixed(1)}h</Text>
                <Text style={styles.financialLabel}>Billable Hours</Text>
              </View>
            )}
            {stats.total_revenue !== undefined && (
              <View style={styles.financialCard}>
                <Ionicons name="cash-outline" size={20} color="#10B981" />
                <Text style={styles.financialValue}>\${(stats.total_revenue / 1000).toFixed(0)}K</Text>
                <Text style={styles.financialLabel}>Revenue</Text>
              </View>
            )}
            {stats.win_rate !== undefined && (
              <View style={styles.financialCard}>
                <Ionicons name="trending-up" size={20} color="#3B82F6" />
                <Text style={styles.financialValue}>{stats.win_rate.toFixed(1)}%</Text>
                <Text style={styles.financialLabel}>Win Rate</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContainer: {
    padding: 16,
    gap: 12,
  },
  compactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  compactLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  primaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  alertGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  alertCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  alertCardActive: {
    borderColor: '#FCA5A5',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  alertLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  financialSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  financialGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  financialCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  financialValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  financialLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}

export function generateCaseTimeline(options: CaseOptions = {}): string {
  const { componentName = 'CaseTimeline', endpoint = '/cases' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface TimelineEvent {
  id: string;
  type: 'filing' | 'hearing' | 'document' | 'note' | 'status_change' | 'deadline' | 'communication';
  title: string;
  description?: string;
  user_name?: string;
  date: string;
  metadata?: Record<string, any>;
}

interface ${componentName}Props {
  caseId?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ caseId: propCaseId, limit }) => {
  const route = useRoute<any>();
  const [refreshing, setRefreshing] = useState(false);

  const caseId = propCaseId || route.params?.caseId;

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['case-timeline', caseId, limit],
    queryFn: async () => {
      let url = '${endpoint}/' + caseId + '/timeline';
      if (limit) url += '?limit=' + limit;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!caseId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getEventIcon = (type: string): { name: string; color: string; bg: string } => {
    const icons: Record<string, { name: string; color: string; bg: string }> = {
      filing: { name: 'document-text', color: '#3B82F6', bg: '#DBEAFE' },
      hearing: { name: 'hammer', color: '#7C3AED', bg: '#EDE9FE' },
      document: { name: 'cloud-upload', color: '#10B981', bg: '#DCFCE7' },
      note: { name: 'chatbubble', color: '#6B7280', bg: '#F3F4F6' },
      status_change: { name: 'checkmark-circle', color: '#F59E0B', bg: '#FEF3C7' },
      deadline: { name: 'alarm', color: '#EF4444', bg: '#FEE2E2' },
      communication: { name: 'mail', color: '#6366F1', bg: '#EEF2FF' },
    };
    return icons[type] || { name: 'calendar', color: '#6B7280', bg: '#F3F4F6' };
  };

  const renderEvent = ({ item, index }: { item: TimelineEvent; index: number }) => {
    const iconConfig = getEventIcon(item.type);
    const isLast = index === (events?.length || 0) - 1;

    return (
      <View style={styles.eventContainer}>
        <View style={styles.timelineColumn}>
          <View style={[styles.eventIcon, { backgroundColor: iconConfig.bg }]}>
            <Ionicons name={iconConfig.name as any} size={16} color={iconConfig.color} />
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>

          {item.description && (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          {item.user_name && (
            <View style={styles.userRow}>
              <Ionicons name="person-outline" size={12} color="#9CA3AF" />
              <Text style={styles.userName}>{item.user_name}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Case Timeline</Text>
      </View>

      {events && events.length > 0 ? (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No timeline events</Text>
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
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 40,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  eventContent: {
    flex: 1,
    paddingBottom: 24,
    paddingLeft: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  eventDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

export function generateCaseTimelineLawfirm(options: CaseOptions = {}): string {
  const { componentName = 'CaseTimelineLawfirm', endpoint = '/lawfirm/cases' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description?: string;
  user_name?: string;
  user_role?: string;
  date: string;
  is_billable?: boolean;
  hours_logged?: number;
  attachments?: { name: string; url: string }[];
}

interface ${componentName}Props {
  caseId?: string;
  canAddEvents?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({ caseId: propCaseId, canAddEvents = true }) => {
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: 'note',
    title: '',
    description: '',
    is_billable: false,
    hours_logged: '',
  });

  const caseId = propCaseId || route.params?.caseId;

  const { data: events, isLoading, refetch } = useQuery({
    queryKey: ['lawfirm-case-timeline', caseId, filterType],
    queryFn: async () => {
      let url = '${endpoint}/' + caseId + '/timeline';
      if (filterType !== 'all') url += '?type=' + filterType;
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!caseId,
  });

  const addEventMutation = useMutation({
    mutationFn: (data: any) => api.post('${endpoint}/' + caseId + '/timeline', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawfirm-case-timeline', caseId] });
      setShowAddModal(false);
      setNewEvent({ type: 'note', title: '', description: '', is_billable: false, hours_logged: '' });
      Alert.alert('Success', 'Event added to timeline');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add event');
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSubmit = () => {
    if (!newEvent.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    addEventMutation.mutate({
      ...newEvent,
      hours_logged: newEvent.hours_logged ? parseFloat(newEvent.hours_logged) : 0,
    });
  };

  const getEventIcon = (type: string): { name: string; color: string; bg: string } => {
    const icons: Record<string, { name: string; color: string; bg: string }> = {
      filing: { name: 'document-text', color: '#3B82F6', bg: '#DBEAFE' },
      hearing: { name: 'hammer', color: '#7C3AED', bg: '#EDE9FE' },
      document: { name: 'cloud-upload', color: '#10B981', bg: '#DCFCE7' },
      note: { name: 'chatbubble', color: '#6B7280', bg: '#F3F4F6' },
      status_change: { name: 'checkmark-circle', color: '#F59E0B', bg: '#FEF3C7' },
      deadline: { name: 'alarm', color: '#EF4444', bg: '#FEE2E2' },
      communication: { name: 'mail', color: '#6366F1', bg: '#EEF2FF' },
      billing: { name: 'cash', color: '#10B981', bg: '#DCFCE7' },
      court_order: { name: 'hammer', color: '#F59E0B', bg: '#FEF3C7' },
    };
    return icons[type] || { name: 'calendar', color: '#6B7280', bg: '#F3F4F6' };
  };

  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'filing', label: 'Filings' },
    { value: 'hearing', label: 'Hearings' },
    { value: 'document', label: 'Documents' },
    { value: 'note', label: 'Notes' },
    { value: 'billing', label: 'Billing' },
  ];

  const eventTypes = [
    { value: 'note', label: 'Note' },
    { value: 'filing', label: 'Filing' },
    { value: 'hearing', label: 'Hearing' },
    { value: 'document', label: 'Document' },
    { value: 'communication', label: 'Communication' },
    { value: 'billing', label: 'Billing Entry' },
  ];

  const renderEvent = ({ item, index }: { item: TimelineEvent; index: number }) => {
    const iconConfig = getEventIcon(item.type);
    const isLast = index === (events?.length || 0) - 1;

    return (
      <View style={styles.eventContainer}>
        <View style={styles.timelineColumn}>
          <View style={[styles.eventIcon, { backgroundColor: iconConfig.bg }]}>
            <Ionicons name={iconConfig.name as any} size={16} color={iconConfig.color} />
          </View>
          {!isLast && <View style={styles.timelineLine} />}
        </View>

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <View style={styles.eventTitleRow}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              {item.is_billable && (
                <View style={styles.billableBadge}>
                  <Text style={styles.billableText}>{item.hours_logged}h</Text>
                </View>
              )}
            </View>
            <Text style={styles.eventDate}>
              {new Date(item.date).toLocaleString()}
            </Text>
          </View>

          {item.description && (
            <Text style={styles.eventDescription} numberOfLines={3}>
              {item.description}
            </Text>
          )}

          {item.user_name && (
            <View style={styles.userRow}>
              <Ionicons name="person-outline" size={12} color="#9CA3AF" />
              <Text style={styles.userName}>
                {item.user_name}
                {item.user_role && ' (' + item.user_role + ')'}
              </Text>
            </View>
          )}

          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachmentsRow}>
              {item.attachments.map((attachment, i) => (
                <View key={i} style={styles.attachmentBadge}>
                  <Ionicons name="attach" size={12} color="#6B7280" />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Case Timeline</Text>
        <View style={styles.headerActions}>
          {canAddEvents && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.filterChip,
              filterType === option.value && styles.filterChipActive,
            ]}
            onPress={() => setFilterType(option.value)}
          >
            <Text
              style={[
                styles.filterText,
                filterType === option.value && styles.filterTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {events && events.length > 0 ? (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No timeline events</Text>
        </View>
      )}

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Event</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={addEventMutation.isPending}>
              <Text style={[styles.saveText, addEventMutation.isPending && styles.saveTextDisabled]}>
                {addEventMutation.isPending ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Event Type</Text>
              <View style={styles.typeOptions}>
                {eventTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeChip,
                      newEvent.type === type.value && styles.typeChipActive,
                    ]}
                    onPress={() => setNewEvent({ ...newEvent, type: type.value })}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        newEvent.type === type.value && styles.typeTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Title</Text>
              <TextInput
                style={styles.formInput}
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
                placeholder="Event title"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                placeholder="Event details..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.billableRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setNewEvent({ ...newEvent, is_billable: !newEvent.is_billable })}
              >
                <Ionicons
                  name={newEvent.is_billable ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={newEvent.is_billable ? '#3B82F6' : '#9CA3AF'}
                />
                <Text style={styles.checkboxLabel}>Billable</Text>
              </TouchableOpacity>

              {newEvent.is_billable && (
                <TextInput
                  style={styles.hoursInput}
                  value={newEvent.hours_logged}
                  onChangeText={(text) => setNewEvent({ ...newEvent, hours_logged: text })}
                  placeholder="Hours"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 13,
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  eventContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 40,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  eventContent: {
    flex: 1,
    paddingBottom: 24,
    paddingLeft: 12,
  },
  eventHeader: {
    marginBottom: 4,
  },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  billableBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  billableText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  eventDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  userName: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  attachmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  attachmentName: {
    fontSize: 11,
    color: '#6B7280',
    maxWidth: 100,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  saveTextDisabled: {
    opacity: 0.5,
  },
  modalContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  formTextarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  typeChipActive: {
    backgroundColor: '#3B82F6',
  },
  typeText: {
    fontSize: 14,
    color: '#4B5563',
  },
  typeTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  billableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
  },
  hoursInput: {
    width: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}
