/**
 * Storage Service Component Generators (React Native)
 *
 * Generates components for self-storage facility management:
 * - UnitAvailability: Unit availability grid/list
 * - UnitFilters: Filter interface for units
 * - CustomerProfileStorage: Customer profile with unit details
 * - RenewalList: Upcoming rental renewals
 */

export interface UnitAvailabilityOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateUnitAvailability(options: UnitAvailabilityOptions = {}): string {
  const { componentName = 'UnitAvailability', endpoint = '/storage/units' } = options;

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
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onUnitSelect?: (unit: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onUnitSelect }) => {
  const navigation = useNavigation();
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: units, isLoading, refetch } = useQuery({
    queryKey: ['storage-units', showOnlyAvailable],
    queryFn: async () => {
      let url = '${endpoint}';
      if (showOnlyAvailable) url += '?status=available';
      const response = await api.get<any>(url);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getSizeLabel = (size: string) => {
    const sizes: Record<string, string> = {
      small: "5'x5' - 5'x10'",
      medium: "10'x10' - 10'x15'",
      large: "10'x20' - 10'x30'",
      extra_large: "15'x20'+",
    };
    return sizes[size?.toLowerCase()] || size;
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return { bg: '#D1FAE5', text: '#065F46', border: '#10B981' };
      case 'occupied':
        return { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' };
      case 'reserved':
        return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' };
      case 'maintenance':
        return { bg: '#F3F4F6', text: '#374151', border: '#6B7280' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' };
    }
  };

  const handleUnitClick = (unit: any) => {
    if (onUnitSelect) {
      onUnitSelect(unit);
    } else if (unit.status === 'available') {
      navigation.navigate('RentUnit' as never, { id: unit.id } as never);
    } else {
      navigation.navigate('UnitDetail' as never, { id: unit.id } as never);
    }
  };

  const availableCount = units?.filter((u: any) => u.status === 'available').length || 0;
  const occupiedCount = units?.filter((u: any) => u.status === 'occupied').length || 0;

  const renderItem = useCallback(({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        style={[
          styles.unitCard,
          { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
          item.status !== 'available' && styles.unitCardDisabled,
        ]}
        onPress={() => handleUnitClick(item)}
        activeOpacity={0.7}
      >
        <View style={styles.unitHeader}>
          <Text style={styles.unitNumber}>{item.unit_number}</Text>
          {item.status === 'available' ? (
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          ) : (
            <Ionicons name="close-circle" size={20} color="#EF4444" />
          )}
        </View>
        <Text style={styles.unitSize}>{item.dimensions || getSizeLabel(item.size)}</Text>
        <View style={styles.unitPrice}>
          <Ionicons name="cash" size={14} color="#6B7280" />
          <Text style={styles.priceText}>\${item.monthly_rate || item.price}/mo</Text>
        </View>
        <View style={styles.unitFeatures}>
          {item.climate_controlled && (
            <View style={styles.featureIcon}>
              <Ionicons name="thermometer" size={14} color="#3B82F6" />
            </View>
          )}
          {item.has_power && (
            <View style={styles.featureIcon}>
              <Ionicons name="flash" size={14} color="#F59E0B" />
            </View>
          )}
          {item.ground_floor && (
            <View style={styles.featureIcon}>
              <Ionicons name="layers" size={14} color="#10B981" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [navigation, onUnitSelect]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Unit Availability</Text>
          <Text style={styles.subtitle}>
            {availableCount} available | {occupiedCount} occupied | {units?.length || 0} total
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowOnlyAvailable(!showOnlyAvailable)}
          style={[styles.filterToggle, showOnlyAvailable && styles.filterToggleActive]}
        >
          <Text style={[styles.filterToggleText, showOnlyAvailable && styles.filterToggleTextActive]}>
            Available only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Reserved</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
          <Text style={styles.legendText}>Maintenance</Text>
        </View>
      </View>

      {/* Units Grid */}
      {units && units.length > 0 ? (
        <FlatList
          data={units}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.grid}
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
          <Ionicons name="cube" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No units found</Text>
        </View>
      )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  filterToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  filterToggleActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterToggleText: {
    fontSize: 13,
    color: '#374151',
  },
  filterToggleTextActive: {
    color: '#FFFFFF',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  grid: {
    padding: 8,
  },
  unitCard: {
    flex: 1,
    margin: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  unitCardDisabled: {
    opacity: 0.7,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  unitSize: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  unitPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  unitFeatures: {
    flexDirection: 'row',
    gap: 8,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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

export interface UnitFiltersOptions {
  componentName?: string;
}

export function generateUnitFilters(options: UnitFiltersOptions = {}): string {
  const { componentName = 'UnitFilters' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FilterState {
  search: string;
  size: string;
  priceRange: string;
  status: string;
  climateControlled: boolean;
  groundFloor: boolean;
  driveUp: boolean;
}

interface ${componentName}Props {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const sizeOptions = [
  { value: '', label: 'All Sizes' },
  { value: 'small', label: "Small (5'x5' - 5'x10')" },
  { value: 'medium', label: "Medium (10'x10' - 10'x15')" },
  { value: 'large', label: "Large (10'x20' - 10'x30')" },
  { value: 'extra_large', label: "Extra Large (15'x20'+)" },
];

const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: '0-50', label: 'Under $50/mo' },
  { value: '50-100', label: '$50 - $100/mo' },
  { value: '100-200', label: '$100 - $200/mo' },
  { value: '200+', label: '$200+/mo' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
];

const ${componentName}: React.FC<${componentName}Props> = ({ filters, onFilterChange }) => {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      size: '',
      priceRange: '',
      status: '',
      climateControlled: false,
      groundFloor: false,
      driveUp: false,
    });
  };

  const hasActiveFilters = filters.search || filters.size || filters.priceRange || filters.status ||
    filters.climateControlled || filters.groundFloor || filters.driveUp;

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search units..."
          placeholderTextColor="#9CA3AF"
          value={filters.search}
          onChangeText={(text) => updateFilter('search', text)}
        />
      </View>

      {/* Dropdown Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dropdownsScroll}>
        <View style={styles.dropdownsRow}>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>
              {sizeOptions.find(o => o.value === filters.size)?.label || 'Size'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>
              {priceRanges.find(o => o.value === filters.priceRange)?.label || 'Price'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>
              {statusOptions.find(o => o.value === filters.status)?.label || 'Status'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Feature Toggles */}
      <View style={styles.togglesRow}>
        <TouchableOpacity
          style={[styles.toggleButton, filters.climateControlled && styles.toggleButtonActive]}
          onPress={() => updateFilter('climateControlled', !filters.climateControlled)}
        >
          <Ionicons
            name="thermometer"
            size={16}
            color={filters.climateControlled ? '#3B82F6' : '#6B7280'}
          />
          <Text style={[styles.toggleText, filters.climateControlled && styles.toggleTextActive]}>
            Climate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, filters.groundFloor && styles.toggleButtonActive]}
          onPress={() => updateFilter('groundFloor', !filters.groundFloor)}
        >
          <Text style={[styles.toggleText, filters.groundFloor && styles.toggleTextActive]}>
            Ground Floor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, filters.driveUp && styles.toggleButtonActive]}
          onPress={() => updateFilter('driveUp', !filters.driveUp)}
        >
          <Ionicons
            name="car"
            size={16}
            color={filters.driveUp ? '#8B5CF6' : '#6B7280'}
          />
          <Text style={[styles.toggleText, filters.driveUp && styles.toggleTextActive]}>
            Drive-Up
          </Text>
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Ionicons name="close" size={16} color="#6B7280" />
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  dropdownsScroll: {
    marginBottom: 12,
  },
  dropdownsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 6,
  },
  dropdownText: {
    fontSize: 13,
    color: '#374151',
  },
  togglesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 4,
  },
  toggleButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  toggleText: {
    fontSize: 13,
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#3B82F6',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  clearText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export interface CustomerProfileStorageOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateCustomerProfileStorage(options: CustomerProfileStorageOptions = {}): string {
  const { componentName = 'CustomerProfileStorage', endpoint = '/storage/customers' } = options;

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
    queryKey: ['storage-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  const { data: rentals } = useQuery({
    queryKey: ['storage-customer-rentals', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/rentals\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ['storage-customer-payments', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}/payments\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!customerId,
  });

  const getRentalStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'overdue':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'ending_soon':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'ended':
        return { bg: '#F3F4F6', text: '#374151' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const activeRentals = rentals?.filter((r: any) => r.status === 'active') || [];

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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('NewRental' as never, { customerId } as never)}
            style={styles.rentButton}
          >
            <Ionicons name="cube" size={18} color="#3B82F6" />
            <Text style={styles.rentButtonText}>Rent Unit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditCustomer' as never, { id: customerId } as never)}
            style={styles.editButton}
          >
            <Ionicons name="create" size={18} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overdue Alert */}
      {customer.has_overdue && (
        <View style={styles.alertCard}>
          <Ionicons name="warning" size={24} color="#EF4444" />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Payment Overdue</Text>
            <Text style={styles.alertAmount}>
              Amount due: \${customer.overdue_amount?.toFixed(2) || 0}
            </Text>
          </View>
        </View>
      )}

      {/* Customer Info Card */}
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#3B82F6" />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{customer.name}</Text>
              {customer.autopay_enabled && (
                <View style={styles.autopayBadge}>
                  <Ionicons name="checkmark-circle" size={12} color="#065F46" />
                  <Text style={styles.autopayText}>AutoPay</Text>
                </View>
              )}
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="call" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{customer.phone || 'No phone'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{customer.email || 'No email'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.contactText}>{customer.address || 'No address'}</Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons name="calendar" size={16} color="#6B7280" />
              <Text style={styles.contactText}>
                Customer since {new Date(customer.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeRentals.length}</Text>
            <Text style={styles.statLabel}>Active Units</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>\${customer.monthly_total || 0}</Text>
            <Text style={styles.statLabel}>Monthly Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              \${(customer.total_paid || 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Lifetime Paid</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {customer.next_payment ? new Date(customer.next_payment).toLocaleDateString() : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Next Payment</Text>
          </View>
        </View>
      </View>

      {/* Active Rentals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Rentals</Text>
        {activeRentals.length > 0 ? (
          activeRentals.map((rental: any) => {
            const statusStyle = getRentalStatusStyle(rental.status);
            return (
              <TouchableOpacity
                key={rental.id}
                style={styles.rentalItem}
                onPress={() => navigation.navigate('UnitDetail' as never, { id: rental.unit_id } as never)}
              >
                <View style={styles.rentalIcon}>
                  <Ionicons name="cube" size={24} color="#3B82F6" />
                </View>
                <View style={styles.rentalInfo}>
                  <View style={styles.rentalHeader}>
                    <Text style={styles.unitNumber}>Unit {rental.unit_number}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {rental.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.unitSize}>{rental.dimensions || rental.size}</Text>
                  <View style={styles.rentalMeta}>
                    <Text style={styles.rentalMetaText}>
                      Started: {new Date(rental.start_date).toLocaleDateString()}
                    </Text>
                    {rental.access_code && (
                      <View style={styles.accessCode}>
                        <Ionicons name="key" size={12} color="#6B7280" />
                        <Text style={styles.rentalMetaText}>{rental.access_code}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.rentalRate}>\${rental.monthly_rate}/mo</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="cube" size={48} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No active rentals</Text>
          </View>
        )}
      </View>

      {/* Payment History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {paymentHistory && paymentHistory.length > 0 ? (
          paymentHistory.slice(0, 5).map((payment: any) => (
            <View key={payment.id} style={styles.paymentItem}>
              <View style={[
                styles.paymentIcon,
                { backgroundColor: payment.status === 'completed' ? '#D1FAE5' : '#FEF3C7' }
              ]}>
                {payment.status === 'completed' ? (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                ) : (
                  <Ionicons name="card" size={20} color="#F59E0B" />
                )}
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentDesc}>
                  {payment.description || 'Monthly Rent'}
                </Text>
                <Text style={styles.paymentDate}>
                  {new Date(payment.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.paymentRight}>
                <Text style={styles.paymentAmount}>\${payment.amount?.toFixed(2)}</Text>
                <Text style={styles.paymentMethod}>{payment.method}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptySection}>
            <Ionicons name="card" size={48} color="#D1D5DB" />
            <Text style={styles.emptySectionText}>No payment history</Text>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 6,
  },
  rentButtonText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
  },
  alertAmount: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 2,
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
    width: 80,
    height: 80,
    borderRadius: 40,
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
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  autopayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  autopayText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#065F46',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
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
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
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
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  rentalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  rentalIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rentalInfo: {
    flex: 1,
  },
  rentalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  unitSize: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  rentalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  rentalMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  accessCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rentalRate: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  paymentMethod: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
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

export interface RenewalListOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateRenewalList(options: RenewalListOptions = {}): string {
  const { componentName = 'RenewalList', endpoint = '/storage/renewals/upcoming' } = options;

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
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  limit?: number;
  daysAhead?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ limit = 10, daysAhead = 30 }) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const { data: renewals, isLoading, refetch } = useQuery({
    queryKey: ['upcoming-renewals', limit, daysAhead],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?limit=\${limit}&days=\${daysAhead}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getDaysUntilRenewal = (date: string) => {
    const renewalDate = new Date(date);
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyStyle = (daysLeft: number) => {
    if (daysLeft <= 3) {
      return { bg: '#FEE2E2', text: '#991B1B' };
    } else if (daysLeft <= 7) {
      return { bg: '#FEF3C7', text: '#92400E' };
    } else {
      return { bg: '#D1FAE5', text: '#065F46' };
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    const daysLeft = getDaysUntilRenewal(item.renewal_date || item.next_payment_date);
    const urgencyStyle = getUrgencyStyle(daysLeft);

    return (
      <TouchableOpacity
        style={styles.renewalItem}
        onPress={() => navigation.navigate('RentalDetail' as never, { id: item.id } as never)}
        activeOpacity={0.7}
      >
        <View style={styles.renewalIcon}>
          <Ionicons name="cube" size={24} color="#3B82F6" />
        </View>

        <View style={styles.renewalContent}>
          <View style={styles.renewalHeader}>
            <Text style={styles.unitNumber}>Unit {item.unit_number}</Text>
            {item.auto_renew ? (
              <View style={styles.autoRenewBadge}>
                <Text style={styles.autoRenewText}>Auto-renew</Text>
              </View>
            ) : (
              <View style={styles.manualBadge}>
                <Text style={styles.manualText}>Manual</Text>
              </View>
            )}
          </View>

          <View style={styles.renewalMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="person" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.customer_name}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                {new Date(item.renewal_date || item.next_payment_date).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {!item.auto_renew && daysLeft <= 7 && (
            <View style={styles.warningBanner}>
              <Ionicons name="warning" size={14} color="#F59E0B" />
              <Text style={styles.warningText}>
                Customer has not set up auto-renewal. Contact recommended.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.renewalRight}>
          <View style={styles.priceRow}>
            <Ionicons name="cash" size={14} color="#6B7280" />
            <Text style={styles.priceText}>\${item.monthly_rate}/mo</Text>
          </View>
          <View style={[styles.daysLeftBadge, { backgroundColor: urgencyStyle.bg }]}>
            <Text style={[styles.daysLeftText, { color: urgencyStyle.text }]}>
              {daysLeft <= 0 ? 'Due today' : daysLeft === 1 ? '1 day' : \`\${daysLeft} days\`}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  }, [navigation]);

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
          <Ionicons name="refresh" size={20} color="#3B82F6" />
          <Text style={styles.title}>Upcoming Renewals</Text>
        </View>
        <View style={styles.daysBadge}>
          <Text style={styles.daysText}>Next {daysAhead} days</Text>
        </View>
      </View>

      {renewals && renewals.length > 0 ? (
        <FlatList
          data={renewals}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>
            No upcoming renewals in the next {daysAhead} days
          </Text>
        </View>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  daysBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  daysText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E40AF',
  },
  renewalItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  renewalIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  renewalContent: {
    flex: 1,
  },
  renewalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unitNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  autoRenewBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  autoRenewText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#065F46',
  },
  manualBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  manualText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#92400E',
  },
  renewalMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
  },
  renewalRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  daysLeftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  daysLeftText: {
    fontSize: 11,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}
