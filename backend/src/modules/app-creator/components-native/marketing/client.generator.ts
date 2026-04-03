/**
 * Client Component Generators (React Native)
 *
 * Generates client management components for marketing agencies:
 * - ClientFilters: Filter clients by status, industry, etc.
 * - ClientHeader: Client profile header with contact info
 * - ClientList: List of all clients with search
 * - ClientProjects: Client's associated projects
 * - ClientStats: Client overview statistics
 */

export interface ClientFiltersOptions {
  componentName?: string;
  showStatus?: boolean;
  showIndustry?: boolean;
  showSort?: boolean;
}

export function generateClientFilters(options: ClientFiltersOptions = {}): string {
  const {
    componentName = 'ClientFilters',
    showStatus = true,
    showIndustry = true,
    showSort = true,
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
    industry: '',
    sortBy: 'name',
  });
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'churned', label: 'Churned' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const industryOptions = [
    { value: '', label: 'All Industries' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'education', label: 'Education' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'hospitality', label: 'Hospitality' },
    { value: 'other', label: 'Other' },
  ];

  ${showSort ? `const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'recent', label: 'Recently Active' },
    { value: 'created', label: 'Date Added' },
  ];` : ''}

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const cleared = {
      search: '',
      status: '',
      industry: '',
      sortBy: 'name',
    };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  const activeFiltersCount = Object.entries(filters)
    .filter(([key, value]) => key !== 'sortBy' && value !== '')
    .length;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            placeholderTextColor="#9CA3AF"
            value={filters.search}
            onChangeText={(text) => handleFilterChange('search', text)}
          />
          {filters.search !== '' && (
            <TouchableOpacity onPress={() => handleFilterChange('search', '')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
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

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Clients</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              ${showStatus ? `<View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Ionicons name="flag" size={16} color="#6B7280" />
                  <Text style={styles.filterLabel}>Status</Text>
                </View>
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

              ${showIndustry ? `<View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Ionicons name="business" size={16} color="#6B7280" />
                  <Text style={styles.filterLabel}>Industry</Text>
                </View>
                <View style={styles.optionsRow}>
                  {industryOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        filters.industry === option.value && styles.optionChipActive
                      ]}
                      onPress={() => handleFilterChange('industry', option.value)}
                    >
                      <Text style={[
                        styles.optionChipText,
                        filters.industry === option.value && styles.optionChipTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>` : ''}

              ${showSort ? `<View style={styles.filterSection}>
                <View style={styles.filterLabelRow}>
                  <Ionicons name="swap-vertical" size={16} color="#6B7280" />
                  <Text style={styles.filterLabel}>Sort By</Text>
                </View>
                <View style={styles.optionsRow}>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        filters.sortBy === option.value && styles.optionChipActive
                      ]}
                      onPress={() => handleFilterChange('sortBy', option.value)}
                    >
                      <Text style={[
                        styles.optionChipText,
                        filters.sortBy === option.value && styles.optionChipTextActive
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
                <Ionicons name="refresh" size={16} color="#6B7280" />
                <Text style={styles.clearButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
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
    maxHeight: '75%',
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
    fontSize: 14,
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

export interface ClientHeaderOptions {
  componentName?: string;
  endpoint?: string;
  showContact?: boolean;
  showActions?: boolean;
}

export function generateClientHeader(options: ClientHeaderOptions = {}): string {
  const {
    componentName = 'ClientHeader',
    endpoint = '/clients',
    showContact = true,
    showActions = true,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  clientId?: string;
  client?: any;
  onEdit?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  clientId: propClientId,
  client: propClient,
  onEdit,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const clientId = propClientId || (route.params as any)?.id;
  const [refreshing, setRefreshing] = useState(false);

  const { data: fetchedClient, isLoading, refetch } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}\`);
      return response?.data || response;
    },
    enabled: !propClient && !!clientId,
  });

  const client = propClient || fetchedClient;

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

  if (!client) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="business" size={48} color="#9CA3AF" />
        <Text style={styles.emptyText}>Client not found</Text>
      </View>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: '#D1FAE5', color: '#065F46' };
      case 'prospect':
        return { bg: '#DBEAFE', color: '#1E40AF' };
      case 'churned':
        return { bg: '#FEE2E2', color: '#991B1B' };
      default:
        return { bg: '#F3F4F6', color: '#374151' };
    }
  };

  const statusStyle = getStatusStyle(client.status);

  const handleCall = () => {
    if (client.phone) {
      Linking.openURL(\`tel:\${client.phone}\`);
    }
  };

  const handleEmail = () => {
    if (client.email) {
      Linking.openURL(\`mailto:\${client.email}\`);
    }
  };

  const handleWebsite = () => {
    if (client.website) {
      Linking.openURL(client.website.startsWith('http') ? client.website : \`https://\${client.website}\`);
    }
  };

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
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        ${showActions ? `<View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Ionicons name="create" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>` : ''}
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          {client.logo ? (
            <Image source={{ uri: client.logo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>
                {client.name?.charAt(0)?.toUpperCase() || 'C'}
              </Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{client.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                  {client.status?.charAt(0).toUpperCase() + client.status?.slice(1)}
                </Text>
              </View>
            </View>
            {client.industry && (
              <Text style={styles.industry}>{client.industry}</Text>
            )}
          </View>
        </View>

        ${showContact ? `<View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact</Text>

          <View style={styles.contactGrid}>
            {client.email && (
              <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                <View style={styles.contactIcon}>
                  <Ionicons name="mail" size={18} color="#3B82F6" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue} numberOfLines={1}>
                    {client.email}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {client.phone && (
              <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
                <View style={styles.contactIcon}>
                  <Ionicons name="call" size={18} color="#10B981" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>{client.phone}</Text>
                </View>
              </TouchableOpacity>
            )}

            {client.website && (
              <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
                <View style={styles.contactIcon}>
                  <Ionicons name="globe" size={18} color="#8B5CF6" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Website</Text>
                  <Text style={styles.contactValue} numberOfLines={1}>
                    {client.website}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {client.address && (
              <View style={styles.contactItem}>
                <View style={styles.contactIcon}>
                  <Ionicons name="location" size={18} color="#F59E0B" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Address</Text>
                  <Text style={styles.contactValue} numberOfLines={2}>
                    {client.address}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>` : ''}

        {client.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{client.description}</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {client.projects_count || 0}
            </Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              \${(client.total_revenue || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {client.active_campaigns || 0}
            </Text>
            <Text style={styles.statLabel}>Campaigns</Text>
          </View>
        </View>
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
  content: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  industry: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  contactSection: {
    marginBottom: 24,
  },
  contactGrid: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#111827',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface ClientListOptions {
  componentName?: string;
  endpoint?: string;
  showRevenue?: boolean;
  showProjects?: boolean;
}

export function generateClientList(options: ClientListOptions = {}): string {
  const {
    componentName = 'ClientList',
    endpoint = '/clients',
    showRevenue = true,
    showProjects = true,
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
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
  filters?: Record<string, any>;
  onClientClick?: (client: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  filters,
  onClientClick,
}) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ['clients', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.sortBy) params.append('sort', filters.sortBy);
      const response = await api.get<any>(\`${endpoint}?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleClick = (client: any) => {
    if (onClientClick) {
      onClientClick(client);
    } else {
      navigation.navigate('ClientDetail' as never, { id: client.id } as never);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'prospect':
        return '#3B82F6';
      case 'churned':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.clientItem}
        onPress={() => handleClick(item)}
        activeOpacity={0.7}
      >
        <View style={styles.clientMain}>
          {item.logo ? (
            <Image source={{ uri: item.logo }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>
                {item.name?.charAt(0)?.toUpperCase() || 'C'}
              </Text>
            </View>
          )}

          <View style={styles.clientInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.clientName} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            </View>
            {item.industry && (
              <Text style={styles.clientIndustry}>{item.industry}</Text>
            )}
            {item.contact_name && (
              <Text style={styles.contactName}>
                <Ionicons name="person-outline" size={12} color="#9CA3AF" /> {item.contact_name}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.clientMeta}>
          ${showRevenue ? `<View style={styles.metaItem}>
            <Text style={styles.metaValue}>\${(item.total_revenue || 0).toLocaleString()}</Text>
            <Text style={styles.metaLabel}>Revenue</Text>
          </View>` : ''}
          ${showProjects ? `<View style={styles.metaItem}>
            <Text style={styles.metaValue}>{item.projects_count || 0}</Text>
            <Text style={styles.metaLabel}>Projects</Text>
          </View>` : ''}
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: any) => item.id?.toString(), []);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={clients || []}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No clients found</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('ClientCreate' as never)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Client</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  clientItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clientMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  clientIndustry: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  contactName: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  clientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 16,
  },
  metaItem: {
    alignItems: 'flex-end',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  metaLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export interface ClientProjectsOptions {
  componentName?: string;
  endpoint?: string;
  limit?: number;
}

export function generateClientProjects(options: ClientProjectsOptions = {}): string {
  const {
    componentName = 'ClientProjects',
    endpoint = '/clients',
    limit = 10,
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  clientId?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  clientId: propClientId,
  limit = ${limit},
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const clientId = propClientId || (route.params as any)?.clientId;
  const [refreshing, setRefreshing] = useState(false);

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['client-projects', clientId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${clientId}/projects?limit=\${limit}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!clientId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: '#D1FAE5', color: '#065F46' };
      case 'in-progress':
        return { bg: '#DBEAFE', color: '#1E40AF' };
      case 'completed':
        return { bg: '#EDE9FE', color: '#6B21A8' };
      case 'on-hold':
        return { bg: '#FEF3C7', color: '#92400E' };
      default:
        return { bg: '#F3F4F6', color: '#374151' };
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        style={styles.projectItem}
        onPress={() => navigation.navigate('ProjectDetail' as never, { id: item.id } as never)}
        activeOpacity={0.7}
      >
        <View style={styles.projectHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.projectDate}>
            {formatDate(item.start_date)} - {formatDate(item.end_date)}
          </Text>
        </View>
        <Text style={styles.projectName} numberOfLines={2}>{item.name}</Text>
        {item.description && (
          <Text style={styles.projectDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.projectFooter}>
          <View style={styles.budgetRow}>
            <Ionicons name="cash" size={14} color="#6B7280" />
            <Text style={styles.budgetText}>
              \${(item.budget || 0).toLocaleString()}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
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
          <Ionicons name="folder" size={20} color="#8B5CF6" />
          <Text style={styles.headerTitle}>Projects</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{projects?.length || 0}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProjectCreate' as never, { clientId } as never)}
        >
          <Ionicons name="add" size={22} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {!projects || projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={40} color="#D1D5DB" />
          <Text style={styles.emptyText}>No projects yet</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
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
  countBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  projectItem: {
    width: 250,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  projectDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  projectDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default ${componentName};
`;
}

export interface ClientStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateClientStats(options: ClientStatsOptions = {}): string {
  const {
    componentName = 'ClientStats',
    endpoint = '/clients/stats',
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
    queryKey: ['client-stats'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {
        totalClients: 48,
        activeClients: 32,
        newThisMonth: 5,
        totalRevenue: 485000,
        avgRevenuePerClient: 15156,
        retentionRate: 92,
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
      label: 'Total Clients',
      value: stats?.totalClients || 0,
      subtext: \`\${stats?.activeClients || 0} active\`,
      icon: 'business' as const,
      color: '#3B82F6',
    },
    {
      label: 'New This Month',
      value: stats?.newThisMonth || 0,
      icon: 'person-add' as const,
      color: '#10B981',
    },
    {
      label: 'Total Revenue',
      value: '$' + (stats?.totalRevenue || 0).toLocaleString(),
      icon: 'trending-up' as const,
      color: '#8B5CF6',
    },
    {
      label: 'Avg per Client',
      value: '$' + (stats?.avgRevenuePerClient || 0).toLocaleString(),
      icon: 'cash' as const,
      color: '#F59E0B',
    },
    {
      label: 'Retention Rate',
      value: (stats?.retentionRate || 0) + '%',
      icon: 'heart' as const,
      color: '#EF4444',
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
