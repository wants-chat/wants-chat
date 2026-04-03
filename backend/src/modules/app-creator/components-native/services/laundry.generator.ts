/**
 * Laundry Service Component Generators (React Native)
 *
 * Generates components for laundry service management:
 * - LaundryStats: Dashboard statistics
 * - OrderFiltersLaundry: Order filtering interface
 * - OrderTimelineLaundry: Order status timeline
 * - CustomerProfileLaundry: Customer profile with order history
 */

export interface LaundryStatsOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateLaundryStats(options: LaundryStatsOptions = {}): string {
  const { componentName = 'LaundryStats', endpoint = '/laundry/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['laundry-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        return {};
      }
    },
  });

  const statCards = [
    { key: 'ordersToday', label: "Today's Orders", icon: 'cube', color: '#3B82F6' },
    { key: 'ordersProcessing', label: 'Processing', icon: 'refresh', color: '#F59E0B' },
    { key: 'readyForPickup', label: 'Ready for Pickup', icon: 'checkmark-circle', color: '#10B981' },
    { key: 'pendingDelivery', label: 'Pending Delivery', icon: 'car', color: '#8B5CF6' },
    { key: 'totalWeight', label: 'Total Weight (lbs)', icon: 'fitness', color: '#6366F1' },
    { key: 'activeCustomers', label: 'Active Customers', icon: 'people', color: '#F97316' },
    { key: 'revenueToday', label: "Today's Revenue", icon: 'cash', color: '#10B981', type: 'currency' },
    { key: 'avgTurnaround', label: 'Avg Turnaround', icon: 'time', color: '#EF4444', suffix: ' hrs' },
  ];

  const formatValue = (value: any, type?: string, suffix?: string) => {
    if (value === undefined || value === null) return '-';
    if (type === 'currency') return '$' + Number(value).toLocaleString();
    return Number(value).toLocaleString() + (suffix || '');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statCards.map((stat) => (
          <View key={stat.key} style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            </View>
            <Text style={styles.value}>
              {formatValue(stats?.[stat.key], stat.type, stat.suffix)}
            </Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    width: '50%',
    padding: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface OrderFiltersLaundryOptions {
  componentName?: string;
}

export function generateOrderFiltersLaundry(options: OrderFiltersLaundryOptions = {}): string {
  const { componentName = 'OrderFiltersLaundry' } = options;

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

interface FilterState {
  search: string;
  status: string;
  serviceType: string;
  dateRange: string;
  sortBy: string;
}

interface ${componentName}Props {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'received', label: 'Received' },
  { value: 'processing', label: 'Processing' },
  { value: 'washing', label: 'Washing' },
  { value: 'drying', label: 'Drying' },
  { value: 'ironing', label: 'Ironing' },
  { value: 'ready', label: 'Ready for Pickup' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'completed', label: 'Completed' },
];

const serviceTypes = [
  { value: '', label: 'All Services' },
  { value: 'wash_fold', label: 'Wash & Fold' },
  { value: 'dry_clean', label: 'Dry Cleaning' },
  { value: 'iron_only', label: 'Iron Only' },
  { value: 'express', label: 'Express Service' },
  { value: 'alterations', label: 'Alterations' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ filters, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      serviceType: '',
      dateRange: '',
      sortBy: 'date_desc',
    });
  };

  const hasActiveFilters = filters.status || filters.serviceType || filters.dateRange;
  const activeFilterCount = [filters.status, filters.serviceType, filters.dateRange].filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders, customers..."
            placeholderTextColor="#9CA3AF"
            value={filters.search}
            onChangeText={(text) => updateFilter('search', text)}
          />
          {filters.search.length > 0 && (
            <TouchableOpacity onPress={() => updateFilter('search', '')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={20} color={hasActiveFilters ? '#FFFFFF' : '#374151'} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
          <View style={styles.tagsContainer}>
            {filters.status && (
              <View style={[styles.tag, styles.tagBlue]}>
                <Text style={styles.tagText}>
                  {statusOptions.find(o => o.value === filters.status)?.label}
                </Text>
                <TouchableOpacity onPress={() => updateFilter('status', '')}>
                  <Ionicons name="close" size={14} color="#1E40AF" />
                </TouchableOpacity>
              </View>
            )}
            {filters.serviceType && (
              <View style={[styles.tag, styles.tagPurple]}>
                <Text style={[styles.tagText, styles.tagTextPurple]}>
                  {serviceTypes.find(o => o.value === filters.serviceType)?.label}
                </Text>
                <TouchableOpacity onPress={() => updateFilter('serviceType', '')}>
                  <Ionicons name="close" size={14} color="#7C3AED" />
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
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

            <ScrollView style={styles.modalBody}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.optionsGrid}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      filters.status === option.value && styles.optionButtonActive
                    ]}
                    onPress={() => updateFilter('status', option.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      filters.status === option.value && styles.optionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Service Type</Text>
              <View style={styles.optionsGrid}>
                {serviceTypes.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      filters.serviceType === option.value && styles.optionButtonActive
                    ]}
                    onPress={() => updateFilter('serviceType', option.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      filters.serviceType === option.value && styles.optionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetButton} onPress={clearFilters}>
                <Text style={styles.resetButtonText}>Reset</Text>
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
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#111827',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tagsScroll: {
    marginTop: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagBlue: {
    backgroundColor: '#DBEAFE',
  },
  tagPurple: {
    backgroundColor: '#EDE9FE',
  },
  tagText: {
    fontSize: 13,
    color: '#1E40AF',
  },
  tagTextPurple: {
    color: '#7C3AED',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  optionButtonActive: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}

export interface OrderTimelineLaundryOptions {
  componentName?: string;
}

export function generateOrderTimelineLaundry(options: OrderTimelineLaundryOptions = {}): string {
  const { componentName = 'OrderTimelineLaundry' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ${componentName}Props {
  currentStatus: string;
  statusHistory?: Array<{ status: string; timestamp: string }>;
}

const statusConfig: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }> = {
  received: { icon: 'cube', label: 'Order Received', color: '#3B82F6' },
  processing: { icon: 'refresh', label: 'Processing', color: '#F59E0B' },
  washing: { icon: 'water', label: 'Washing', color: '#06B6D4' },
  drying: { icon: 'sunny', label: 'Drying', color: '#F97316' },
  ironing: { icon: 'shirt', label: 'Ironing', color: '#8B5CF6' },
  ready: { icon: 'checkmark-circle', label: 'Ready for Pickup', color: '#10B981' },
  out_for_delivery: { icon: 'car', label: 'Out for Delivery', color: '#6366F1' },
  completed: { icon: 'home', label: 'Completed', color: '#059669' },
};

const statusOrder = ['received', 'processing', 'washing', 'drying', 'ironing', 'ready', 'out_for_delivery', 'completed'];

const ${componentName}: React.FC<${componentName}Props> = ({ currentStatus, statusHistory = [] }) => {
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStatusTimestamp = (status: string) => {
    const entry = statusHistory.find(h => h.status === status);
    return entry?.timestamp;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Progress</Text>

      <View style={styles.timeline}>
        {statusOrder.map((status, index) => {
          const config = statusConfig[status];
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const timestamp = getStatusTimestamp(status);
          const isLast = index === statusOrder.length - 1;

          return (
            <View key={status} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[
                  styles.dot,
                  (isCompleted || isCurrent) && { backgroundColor: config.color },
                  !isCompleted && !isCurrent && styles.dotInactive
                ]}>
                  <Ionicons
                    name={config.icon}
                    size={16}
                    color={(isCompleted || isCurrent) ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
                {!isLast && (
                  <View style={[
                    styles.line,
                    isCompleted && { backgroundColor: '#10B981' }
                  ]} />
                )}
              </View>

              <View style={styles.timelineContent}>
                <View style={styles.labelRow}>
                  <Text style={[
                    styles.statusLabel,
                    isCurrent && { color: config.color },
                    !isCompleted && !isCurrent && styles.statusLabelInactive
                  ]}>
                    {config.label}
                  </Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  )}
                </View>
                {timestamp && (
                  <View style={styles.timestampRow}>
                    <Ionicons name="time" size={12} color="#9CA3AF" />
                    <Text style={styles.timestamp}>
                      {new Date(timestamp).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    zIndex: 1,
  },
  dotInactive: {
    backgroundColor: '#E5E7EB',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  statusLabelInactive: {
    color: '#9CA3AF',
  },
  currentBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1E40AF',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ${componentName};
`;
}

export interface CustomerProfileLaundryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileLaundry(options: CustomerProfileLaundryOptions = {}): string {
  const { componentName = 'CustomerProfileLaundry', endpoint = '/laundry/customers' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propId }) => {
  const route = useRoute();
  const navigation = useNavigation();
  const customerId = propId || (route.params as any)?.id;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['laundry-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: orderHistory } = useQuery({
    queryKey: ['laundry-customer-orders', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/orders\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Customer not found</Text>
      </View>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'ready':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'processing':
      case 'washing':
      case 'drying':
        return { bg: '#FEF3C7', text: '#92400E' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewOrder' as never, { customer: customerId } as never)}
            style={styles.orderButton}
          >
            <Ionicons name="cube" size={18} color="#3B82F6" />
            <Text style={styles.orderButtonText}>New Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer Info Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#3B82F6" />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{customer.name}</Text>
              {customer.subscription && (
                <View style={styles.subscriptionBadge}>
                  <Text style={styles.subscriptionText}>{customer.subscription}</Text>
                </View>
              )}
            </View>
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="call" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{customer.phone || 'No phone'}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{customer.email || 'No email'}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="location" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{customer.address || 'No address'}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="car" size={14} color="#6B7280" />
                <Text style={styles.contactText}>{customer.delivery_preference || 'Pickup'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.total_orders || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              \${(customer.total_spent || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{customer.loyalty_points || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
      </View>

      {/* Preferences */}
      {customer.preferences && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Laundry Preferences</Text>
          <View style={styles.preferencesGrid}>
            {customer.preferences.detergent && (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Detergent</Text>
                <Text style={styles.preferenceValue}>{customer.preferences.detergent}</Text>
              </View>
            )}
            {customer.preferences.fabric_softener && (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Fabric Softener</Text>
                <Text style={styles.preferenceValue}>{customer.preferences.fabric_softener}</Text>
              </View>
            )}
            {customer.preferences.starch && (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Starch Level</Text>
                <Text style={styles.preferenceValue}>{customer.preferences.starch}</Text>
              </View>
            )}
            {customer.preferences.fold_type && (
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Fold Type</Text>
                <Text style={styles.preferenceValue}>{customer.preferences.fold_type}</Text>
              </View>
            )}
          </View>
          {customer.preferences.special_instructions && (
            <View style={styles.instructionsBox}>
              <Text style={styles.preferenceLabel}>Special Instructions</Text>
              <Text style={styles.instructionsText}>{customer.preferences.special_instructions}</Text>
            </View>
          )}
        </View>
      )}

      {/* Order History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Order History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {orderHistory && orderHistory.length > 0 ? (
          orderHistory.slice(0, 5).map((order: any) => {
            const statusStyle = getStatusStyle(order.status);
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderItem}
                onPress={() => navigation.navigate('OrderDetail' as never, { id: order.id } as never)}
              >
                <View style={[
                  styles.orderIcon,
                  { backgroundColor: order.status === 'completed' ? '#D1FAE5' : '#DBEAFE' }
                ]}>
                  <Ionicons
                    name={order.status === 'completed' ? 'checkmark-circle' : 'shirt'}
                    size={20}
                    color={order.status === 'completed' ? '#10B981' : '#3B82F6'}
                  />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>
                    Order #{order.order_number || order.id?.slice(-6)}
                  </Text>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderMetaText}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                    <Text style={styles.orderMetaText}>
                      {order.item_count || 0} items
                    </Text>
                    <Text style={styles.orderMetaText}>
                      {order.weight || 0} lbs
                    </Text>
                  </View>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderPrice}>\${(order.total || 0).toFixed(2)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {order.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="cube" size={48} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No order history</Text>
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  orderButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subscriptionBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '500',
  },
  contactInfo: {
    marginTop: 12,
    gap: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceItem: {
    width: '50%',
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  instructionsBox: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  instructionsText: {
    fontSize: 14,
    color: '#111827',
    marginTop: 4,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  orderMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  orderMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptySectionText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}
