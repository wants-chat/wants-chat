/**
 * Campaign Component Generators (React Native)
 *
 * Generates campaign-related components for marketing applications:
 * - CampaignFilters: Filter campaigns by status, type, date
 * - CampaignFiltersMarketing: Advanced marketing-specific filters
 * - CampaignHeader: Campaign detail header with metrics
 * - CampaignListActive: List of active campaigns
 * - CampaignPerformance: Campaign performance metrics
 * - CampaignStats: Overview statistics for campaigns
 * - CampaignStory: Campaign timeline/story view
 */

export interface CampaignFiltersOptions {
  componentName?: string;
  showStatus?: boolean;
  showType?: boolean;
  showDateRange?: boolean;
  showBudget?: boolean;
}

export function generateCampaignFilters(options: CampaignFiltersOptions = {}): string {
  const {
    componentName = 'CampaignFilters',
    showStatus = true,
    showType = true,
    showDateRange = true,
    showBudget = false,
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  onFilterChange?: (filters: Record<string, any>) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    startDate: '',
    endDate: '',
    ${showBudget ? "budgetMin: '',\n    budgetMax: ''," : ''}
  });
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'email', label: 'Email' },
    { value: 'social', label: 'Social Media' },
    { value: 'ppc', label: 'PPC/Ads' },
    { value: 'content', label: 'Content' },
    { value: 'seo', label: 'SEO' },
    { value: 'influencer', label: 'Influencer' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const cleared = {
      search: '',
      status: '',
      type: '',
      startDate: '',
      endDate: '',
      ${showBudget ? "budgetMin: '',\n      budgetMax: ''," : ''}
    };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search campaigns..."
            placeholderTextColor="#9CA3AF"
            value={filters.search}
            onChangeText={(text) => handleFilterChange('search', text)}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons
            name="filter"
            size={20}
            color={activeFiltersCount > 0 ? '#3B82F6' : '#6B7280'}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              ${showStatus ? `<View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Status</Text>
                <View style={styles.optionsRow}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        filters.status === option.value && styles.optionChipActive
                      ]}
                      onPress={() => handleFilterChange('status', option.value)}
                    >
                      <Text style={[
                        styles.optionChipText,
                        filters.status === option.value && styles.optionChipTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>` : ''}

              ${showType ? `<View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Campaign Type</Text>
                <View style={styles.optionsRow}>
                  {typeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        filters.type === option.value && styles.optionChipActive
                      ]}
                      onPress={() => handleFilterChange('type', option.value)}
                    >
                      <Text style={[
                        styles.optionChipText,
                        filters.type === option.value && styles.optionChipTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>` : ''}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
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
    maxHeight: '80%',
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
  modalBody: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  optionChipActive: {
    backgroundColor: '#3B82F6',
  },
  optionChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
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

export interface CampaignFiltersMarketingOptions {
  componentName?: string;
  showChannels?: boolean;
  showGoals?: boolean;
  showClient?: boolean;
}

export function generateCampaignFiltersMarketing(options: CampaignFiltersMarketingOptions = {}): string {
  const {
    componentName = 'CampaignFiltersMarketing',
    showChannels = true,
    showGoals = true,
    showClient = true,
  } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onFilterChange?: (filters: Record<string, any>) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    channel: '',
    goal: '',
    clientId: '',
    startDate: '',
    endDate: '',
    budgetMin: '',
    budgetMax: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  ${showClient ? `const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await api.get<any>('/clients');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });` : ''}

  const channels = [
    { value: '', label: 'All Channels' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'email', label: 'Email' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
  ];

  const goals = [
    { value: '', label: 'All Goals' },
    { value: 'awareness', label: 'Brand Awareness' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'leads', label: 'Lead Generation' },
    { value: 'conversions', label: 'Conversions' },
    { value: 'traffic', label: 'Website Traffic' },
    { value: 'sales', label: 'Sales' },
  ];

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const cleared = {
      search: '',
      status: '',
      channel: '',
      goal: '',
      clientId: '',
      startDate: '',
      endDate: '',
      budgetMin: '',
      budgetMax: '',
    };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search campaigns..."
            placeholderTextColor="#9CA3AF"
            value={filters.search}
            onChangeText={(text) => handleFilterChange('search', text)}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons
            name="options"
            size={20}
            color={activeFiltersCount > 0 ? '#3B82F6' : '#6B7280'}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickFilters}
        contentContainerStyle={styles.quickFiltersContent}
      >
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.quickChip,
              filters.status === option.value && styles.quickChipActive
            ]}
            onPress={() => handleFilterChange('status', option.value)}
          >
            <Text style={[
              styles.quickChipText,
              filters.status === option.value && styles.quickChipTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Advanced Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              ${showChannels ? `<View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Ionicons name="globe" size={16} color="#6B7280" />
                  <Text style={styles.filterLabel}>Channel</Text>
                </View>
                <View style={styles.optionsRow}>
                  {channels.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        filters.channel === option.value && styles.optionChipActive
                      ]}
                      onPress={() => handleFilterChange('channel', option.value)}
                    >
                      <Text style={[
                        styles.optionChipText,
                        filters.channel === option.value && styles.optionChipTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>` : ''}

              ${showGoals ? `<View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Ionicons name="flag" size={16} color="#6B7280" />
                  <Text style={styles.filterLabel}>Goal</Text>
                </View>
                <View style={styles.optionsRow}>
                  {goals.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        filters.goal === option.value && styles.optionChipActive
                      ]}
                      onPress={() => handleFilterChange('goal', option.value)}
                    >
                      <Text style={[
                        styles.optionChipText,
                        filters.goal === option.value && styles.optionChipTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>` : ''}

              ${showClient ? `<View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Ionicons name="business" size={16} color="#6B7280" />
                  <Text style={styles.filterLabel}>Client</Text>
                </View>
                <View style={styles.optionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.optionChip,
                      filters.clientId === '' && styles.optionChipActive
                    ]}
                    onPress={() => handleFilterChange('clientId', '')}
                  >
                    <Text style={[
                      styles.optionChipText,
                      filters.clientId === '' && styles.optionChipTextActive
                    ]}>
                      All Clients
                    </Text>
                  </TouchableOpacity>
                  {clients?.map((client: any) => (
                    <TouchableOpacity
                      key={client.id}
                      style={[
                        styles.optionChip,
                        filters.clientId === client.id && styles.optionChipActive
                      ]}
                      onPress={() => handleFilterChange('clientId', client.id)}
                    >
                      <Text style={[
                        styles.optionChipText,
                        filters.clientId === client.id && styles.optionChipTextActive
                      ]}>
                        {client.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>` : ''}

              <View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Ionicons name="cash" size={16} color="#6B7280" />
                  <Text style={styles.filterLabel}>Budget Range</Text>
                </View>
                <View style={styles.budgetRow}>
                  <TextInput
                    style={styles.budgetInput}
                    placeholder="Min"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={filters.budgetMin}
                    onChangeText={(text) => handleFilterChange('budgetMin', text)}
                  />
                  <Text style={styles.budgetSeparator}>-</Text>
                  <TextInput
                    style={styles.budgetInput}
                    placeholder="Max"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={filters.budgetMax}
                    onChangeText={(text) => handleFilterChange('budgetMax', text)}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Ionicons name="trash-outline" size={18} color="#6B7280" />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111827',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickFilters: {
    maxHeight: 50,
  },
  quickFiltersContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  quickChipActive: {
    backgroundColor: '#3B82F6',
  },
  quickChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  quickChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
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
    maxHeight: '85%',
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
  modalBody: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  optionChipActive: {
    backgroundColor: '#3B82F6',
  },
  optionChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
  },
  budgetSeparator: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
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

export interface CampaignHeaderOptions {
  componentName?: string;
  endpoint?: string;
  showBudget?: boolean;
  showTimeline?: boolean;
  showActions?: boolean;
}

export function generateCampaignHeader(options: CampaignHeaderOptions = {}): string {
  const {
    componentName = 'CampaignHeader',
    endpoint = '/campaigns',
    showBudget = true,
    showTimeline = true,
    showActions = true,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  campaignId?: string;
  campaign?: any;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  campaignId: propCampaignId,
  campaign: propCampaign,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const campaignId = propCampaignId || (route.params as any)?.id;
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const { data: fetchedCampaign, isLoading, refetch } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${campaignId}\`);
      return response?.data || response;
    },
    enabled: !propCampaign && !!campaignId,
  });

  const campaign = propCampaign || fetchedCampaign;

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

  if (!campaign) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>Campaign not found</Text>
      </View>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#D1FAE5', color: '#065F46' };
      case 'paused':
        return { bg: '#FEF3C7', color: '#92400E' };
      case 'completed':
        return { bg: '#EDE9FE', color: '#6B21A8' };
      case 'scheduled':
        return { bg: '#DBEAFE', color: '#1E40AF' };
      default:
        return { bg: '#F3F4F6', color: '#374151' };
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const budgetProgress = campaign.budget ? ((campaign.spent || 0) / campaign.budget) * 100 : 0;
  const statusStyle = getStatusStyle(campaign.status);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
        />
      }
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        ${showActions ? `<View style={styles.actionsRow}>
          {campaign.status === 'active' ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onStatusChange?.('paused')}
            >
              <Ionicons name="pause" size={18} color="#F59E0B" />
            </TouchableOpacity>
          ) : campaign.status !== 'completed' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onStatusChange?.('active')}
            >
              <Ionicons name="play" size={18} color="#10B981" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowMenu(!showMenu)}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>` : ''}
      </View>

      {/* Menu Dropdown */}
      {showMenu && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => { onEdit?.(); setShowMenu(false); }}
          >
            <Ionicons name="create" size={18} color="#6B7280" />
            <Text style={styles.menuItemText}>Edit Campaign</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowMenu(false)}
          >
            <Ionicons name="copy" size={18} color="#6B7280" />
            <Text style={styles.menuItemText}>Duplicate</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              Alert.alert('Delete Campaign', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => { onDelete?.(); setShowMenu(false); } }
              ]);
            }}
          >
            <Ionicons name="trash" size={18} color="#EF4444" />
            <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {campaign.status?.charAt(0).toUpperCase() + campaign.status?.slice(1)}
            </Text>
          </View>
          {campaign.type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{campaign.type}</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{campaign.name}</Text>

        {campaign.description && (
          <Text style={styles.description}>{campaign.description}</Text>
        )}

        ${showTimeline ? `<View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={16} color="#6B7280" />
            <Text style={styles.metaText}>
              {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
            </Text>
          </View>
          {campaign.client_name && (
            <View style={styles.metaItem}>
              <Ionicons name="business" size={16} color="#6B7280" />
              <Text style={styles.metaText}>{campaign.client_name}</Text>
            </View>
          )}
        </View>` : ''}

        ${showBudget ? `<View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Ionicons name="cash" size={18} color="#6B7280" />
          </View>
          <View style={styles.budgetAmounts}>
            <Text style={styles.budgetSpent}>\${(campaign.spent || 0).toLocaleString()}</Text>
            <Text style={styles.budgetTotal}> / \${(campaign.budget || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: \`\${Math.min(budgetProgress, 100)}%\`,
                  backgroundColor: budgetProgress > 90 ? '#EF4444' : budgetProgress > 70 ? '#F59E0B' : '#10B981',
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{budgetProgress.toFixed(1)}% of budget used</Text>
        </View>` : ''}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDropdown: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  menuItemText: {
    fontSize: 14,
    color: '#374151',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  content: {
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  typeText: {
    fontSize: 13,
    color: '#6B7280',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
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
  budgetCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  budgetAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  budgetSpent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  budgetTotal: {
    fontSize: 16,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface CampaignListActiveOptions {
  componentName?: string;
  endpoint?: string;
  limit?: number;
  showProgress?: boolean;
}

export function generateCampaignListActive(options: CampaignListActiveOptions = {}): string {
  const {
    componentName = 'CampaignListActive',
    endpoint = '/campaigns',
    limit = 5,
    showProgress = true,
  } = options;

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
  limit?: number;
  onCampaignClick?: (campaign: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  limit = ${limit},
  onCampaignClick,
}) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['campaigns', 'active'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?status=active');
      const data = Array.isArray(response) ? response : (response?.data || []);
      return data.slice(0, limit);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleClick = (campaign: any) => {
    if (onCampaignClick) {
      onCampaignClick(campaign);
    } else {
      navigation.navigate('CampaignDetail' as never, { id: campaign.id } as never);
    }
  };

  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return '#10B981';
    if (progress >= 50) return '#3B82F6';
    if (progress >= 25) return '#F59E0B';
    return '#9CA3AF';
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const budgetProgress = item.budget ? ((item.spent || 0) / item.budget) * 100 : 0;
    const daysRemaining = getDaysRemaining(item.end_date);
    const goalProgress = item.goal_target ? ((item.goal_current || 0) / item.goal_target) * 100 : 0;

    return (
      <TouchableOpacity
        style={styles.campaignItem}
        onPress={() => handleClick(item)}
        activeOpacity={0.7}
      >
        <View style={styles.campaignHeader}>
          <View style={styles.campaignInfo}>
            <Text style={styles.campaignName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.campaignType}>{item.type || 'Marketing Campaign'}</Text>
          </View>
          <View style={styles.campaignMeta}>
            {daysRemaining !== null && (
              <View style={[
                styles.daysTag,
                daysRemaining <= 3 && styles.daysTagUrgent,
                daysRemaining <= 7 && daysRemaining > 3 && styles.daysTagWarning,
              ]}>
                <Ionicons
                  name="time"
                  size={12}
                  color={daysRemaining <= 3 ? '#EF4444' : daysRemaining <= 7 ? '#F59E0B' : '#6B7280'}
                />
                <Text style={[
                  styles.daysText,
                  daysRemaining <= 3 && styles.daysTextUrgent,
                  daysRemaining <= 7 && daysRemaining > 3 && styles.daysTextWarning,
                ]}>
                  {daysRemaining}d
                </Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </View>
        </View>

        ${showProgress ? `<View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Budget</Text>
                <Text style={styles.progressValue}>
                  \${(item.spent || 0).toLocaleString()} / \${(item.budget || 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: \`\${Math.min(budgetProgress, 100)}%\`,
                      backgroundColor: budgetProgress > 90 ? '#EF4444' : budgetProgress > 70 ? '#F59E0B' : '#3B82F6',
                    }
                  ]}
                />
              </View>
            </View>

            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Goal</Text>
                <Text style={styles.progressValue}>{goalProgress.toFixed(0)}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: \`\${Math.min(goalProgress, 100)}%\`,
                      backgroundColor: getProgressColor(goalProgress),
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        </View>` : ''}
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: any) => item.id?.toString(), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="megaphone" size={20} color="#3B82F6" />
          <Text style={styles.headerTitle}>Active Campaigns</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CampaignCreate' as never)}
        >
          <Ionicons name="add" size={18} color="#3B82F6" />
          <Text style={styles.addButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {!campaigns || campaigns.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="megaphone-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No active campaigns</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CampaignCreate' as never)}
          >
            <Text style={styles.createButtonText}>Create your first campaign</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={campaigns}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ListFooterComponent={
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('CampaignList' as never)}
            >
              <Text style={styles.viewAllText}>View all campaigns</Text>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
  },
  campaignItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  campaignType: {
    fontSize: 13,
    color: '#6B7280',
  },
  campaignMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daysTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  daysTagUrgent: {
    backgroundColor: '#FEE2E2',
  },
  daysTagWarning: {
    backgroundColor: '#FEF3C7',
  },
  daysText: {
    fontSize: 12,
    color: '#6B7280',
  },
  daysTextUrgent: {
    color: '#EF4444',
  },
  daysTextWarning: {
    color: '#F59E0B',
  },
  progressSection: {},
  progressRow: {
    flexDirection: 'row',
    gap: 16,
  },
  progressItem: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 12,
  },
  createButton: {},
  createButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  viewAllButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
});

export default ${componentName};
`;
}

export interface CampaignPerformanceOptions {
  componentName?: string;
  endpoint?: string;
  showCharts?: boolean;
}

export function generateCampaignPerformance(options: CampaignPerformanceOptions = {}): string {
  const {
    componentName = 'CampaignPerformance',
    endpoint = '/campaigns',
    showCharts = true,
  } = options;

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
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  campaignId?: string;
  period?: '7d' | '30d' | '90d' | 'all';
}

const ${componentName}: React.FC<${componentName}Props> = ({
  campaignId: propCampaignId,
  period: initialPeriod = '30d',
}) => {
  const route = useRoute();
  const campaignId = propCampaignId || (route.params as any)?.id;
  const [period, setPeriod] = useState(initialPeriod);
  const [refreshing, setRefreshing] = useState(false);

  const { data: performance, isLoading, refetch } = useQuery({
    queryKey: ['campaign-performance', campaignId, period],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${campaignId}/performance?period=\${period}\`);
      return response?.data || response || {
        impressions: { value: 125000, change: 12.5 },
        clicks: { value: 4800, change: 8.3 },
        conversions: { value: 320, change: 15.2 },
        ctr: { value: 3.84, change: -2.1 },
        cpc: { value: 1.25, change: -5.4 },
        roas: { value: 4.2, change: 22.8 },
        spend: { value: 6000, change: 10.0 },
        revenue: { value: 25200, change: 18.5 },
      };
    },
    enabled: !!campaignId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const periods = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '90d', label: '90D' },
    { value: 'all', label: 'All' },
  ];

  const metricConfig: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; format: (v: number) => string; color: string }> = {
    impressions: { label: 'Impressions', icon: 'eye', format: (v) => v.toLocaleString(), color: '#3B82F6' },
    clicks: { label: 'Clicks', icon: 'finger-print', format: (v) => v.toLocaleString(), color: '#10B981' },
    conversions: { label: 'Conversions', icon: 'checkmark-circle', format: (v) => v.toLocaleString(), color: '#8B5CF6' },
    ctr: { label: 'CTR', icon: 'analytics', format: (v) => v.toFixed(2) + '%', color: '#06B6D4' },
    cpc: { label: 'CPC', icon: 'cash', format: (v) => '$' + v.toFixed(2), color: '#F59E0B' },
    roas: { label: 'ROAS', icon: 'trending-up', format: (v) => v.toFixed(1) + 'x', color: '#059669' },
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
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="bar-chart" size={20} color="#3B82F6" />
            <Text style={styles.headerTitle}>Performance</Text>
          </View>
          <View style={styles.periodSelector}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[styles.periodTab, period === p.value && styles.periodTabActive]}
                onPress={() => setPeriod(p.value as any)}
              >
                <Text style={[
                  styles.periodTabText,
                  period === p.value && styles.periodTabTextActive
                ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.metricsGrid}>
            {Object.entries(performance || {}).map(([key, data]: [string, any]) => {
              const config = metricConfig[key];
              if (!config) return null;
              const isPositive = data.change >= 0;

              return (
                <View key={key} style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Text style={styles.metricLabel}>{config.label}</Text>
                    <Ionicons name={config.icon} size={16} color={config.color} />
                  </View>
                  <Text style={styles.metricValue}>{config.format(data.value)}</Text>
                  <View style={styles.metricChange}>
                    <Ionicons
                      name={isPositive ? 'arrow-up' : 'arrow-down'}
                      size={12}
                      color={isPositive ? '#10B981' : '#EF4444'}
                    />
                    <Text style={[
                      styles.metricChangeText,
                      isPositive ? styles.changePositive : styles.changeNegative
                    ]}>
                      {Math.abs(data.change).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          ${showCharts ? `<View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart-outline" size={48} color="#D1D5DB" />
            <Text style={styles.chartPlaceholderText}>Performance chart</Text>
            <Text style={styles.chartPlaceholderSubtext}>Integrate with react-native-charts</Text>
          </View>` : ''}
        </View>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  periodTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodTabActive: {
    backgroundColor: '#FFFFFF',
  },
  periodTabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  periodTabTextActive: {
    color: '#111827',
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCard: {
    width: '50%',
    padding: 6,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metricChangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  changePositive: {
    color: '#10B981',
  },
  changeNegative: {
    color: '#EF4444',
  },
  chartPlaceholder: {
    marginTop: 24,
    height: 200,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  chartPlaceholderSubtext: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export interface CampaignStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCampaignStats(options: CampaignStatsOptions = {}): string {
  const {
    componentName = 'CampaignStats',
    endpoint = '/campaigns/stats',
  } = options;

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

const ${componentName}: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {
        totalCampaigns: 24,
        activeCampaigns: 8,
        totalBudget: 125000,
        totalSpent: 78500,
        avgROAS: 3.8,
        totalConversions: 2840,
      };
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

  const statCards = [
    {
      label: 'Total Campaigns',
      value: stats?.totalCampaigns || 0,
      icon: 'megaphone' as const,
      color: '#3B82F6',
      subtext: \`\${stats?.activeCampaigns || 0} active\`,
    },
    {
      label: 'Total Budget',
      value: '$' + (stats?.totalBudget || 0).toLocaleString(),
      icon: 'cash' as const,
      color: '#10B981',
      subtext: \`\${((stats?.totalSpent / stats?.totalBudget) * 100 || 0).toFixed(0)}% utilized\`,
    },
    {
      label: 'Avg. ROAS',
      value: (stats?.avgROAS || 0).toFixed(1) + 'x',
      icon: 'trending-up' as const,
      color: '#8B5CF6',
      subtext: 'Return on ad spend',
    },
    {
      label: 'Conversions',
      value: (stats?.totalConversions || 0).toLocaleString(),
      icon: 'checkmark-circle' as const,
      color: '#F59E0B',
      subtext: 'This month',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3B82F6"
          colors={['#3B82F6']}
        />
      }
    >
      <View style={styles.grid}>
        {statCards.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            {stat.subtext && (
              <Text style={styles.statSubtext}>{stat.subtext}</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '50%',
    padding: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
});

export default ${componentName};
`;
}

export interface CampaignStoryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCampaignStory(options: CampaignStoryOptions = {}): string {
  const {
    componentName = 'CampaignStory',
    endpoint = '/campaigns',
  } = options;

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

interface ${componentName}Props {
  campaignId?: string;
  events?: any[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  campaignId: propCampaignId,
  events: propEvents,
}) => {
  const route = useRoute();
  const campaignId = propCampaignId || (route.params as any)?.id;
  const [refreshing, setRefreshing] = useState(false);

  const { data: fetchedEvents, isLoading, refetch } = useQuery({
    queryKey: ['campaign-timeline', campaignId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${campaignId}/timeline\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !propEvents && !!campaignId,
  });

  const events = propEvents || fetchedEvents || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getEventIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      created: 'document-text',
      asset: 'image',
      approved: 'checkmark-circle',
      launched: 'play',
      paused: 'pause',
      completed: 'checkmark-done',
      milestone: 'flag',
      optimization: 'flash',
      budget: 'cash',
      comment: 'chatbubble',
      alert: 'alert-circle',
    };
    return icons[type] || 'ellipse';
  };

  const getEventColor = (type: string): string => {
    const colors: Record<string, string> = {
      created: '#3B82F6',
      asset: '#8B5CF6',
      approved: '#10B981',
      launched: '#059669',
      paused: '#F59E0B',
      completed: '#10B981',
      milestone: '#F97316',
      optimization: '#06B6D4',
      budget: '#EF4444',
      alert: '#EF4444',
    };
    return colors[type] || '#6B7280';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isLast = index === events.length - 1;
    const iconName = getEventIcon(item.type);
    const color = getEventColor(item.type);

    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineLeft}>
          <View style={[styles.dot, { backgroundColor: color }]}>
            <Ionicons name={iconName} size={14} color="#FFFFFF" />
          </View>
          {!isLast && <View style={styles.line} />}
        </View>
        <View style={styles.timelineContent}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>{item.title}</Text>
            <Text style={styles.timelineDate}>{formatDate(item.date)}</Text>
          </View>
          {item.description && (
            <Text style={styles.timelineDescription}>{item.description}</Text>
          )}
          {item.user && (
            <View style={styles.userRow}>
              <Ionicons name="person" size={12} color="#9CA3AF" />
              <Text style={styles.userName}>by {item.user}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }, [events]);

  const keyExtractor = useCallback((item: any, index: number) => item.id?.toString() || index.toString(), []);

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
        <Ionicons name="time" size={20} color="#3B82F6" />
        <Text style={styles.headerTitle}>Campaign Timeline</Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No timeline events yet</Text>
        </View>
      ) : (
        <FlatList
          data={events}
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    width: 32,
    alignItems: 'center',
  },
  dot: {
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
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  timelineDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  timelineDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}
