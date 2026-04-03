/**
 * Parking Management Component Generators (React Native)
 *
 * Generates components for parking lot/garage management including:
 * - ParkingStats, OccupancyOverviewParking, ReservationFiltersParking
 * - CustomerProfileParking
 */

export interface ParkingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateParkingStats(options: ParkingOptions = {}): string {
  const { componentName = 'ParkingStats', endpoint = '/parking/stats' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['parking-stats'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${endpoint}');
        return response?.data || response || {};
      } catch (err) {
        console.error('Failed to fetch parking stats:', err);
        return {};
      }
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const statItems = [
    { key: 'occupancyRate', label: 'Occupancy Rate', icon: 'car-sport-outline', color: '#3B82F6', format: (v: number) => \`\${v || 0}%\` },
    { key: 'availableSpots', label: 'Available Spots', icon: 'checkmark-circle-outline', color: '#10B981', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'occupiedSpots', label: 'Occupied Spots', icon: 'car-sport', color: '#EF4444', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'totalSpots', label: 'Total Capacity', icon: 'grid-outline', color: '#8B5CF6', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'entriesToday', label: 'Entries Today', icon: 'arrow-up-circle-outline', color: '#059669', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'exitsToday', label: 'Exits Today', icon: 'arrow-down-circle-outline', color: '#F97316', format: (v: number) => (v || 0).toLocaleString() },
    { key: 'avgDuration', label: 'Avg. Duration', icon: 'time-outline', color: '#EAB308', format: (v: number) => \`\${v || 0}h\` },
    { key: 'todayRevenue', label: "Today's Revenue", icon: 'cash-outline', color: '#6366F1', format: (v: number) => \`$\${(v || 0).toLocaleString()}\` },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statItems.map((stat) => {
          const value = stats?.[stat.key];
          const change = stats?.[stat.key + 'Change'];

          return (
            <View key={stat.key} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                  <Ionicons name={stat.icon as any} size={24} color={stat.color} />
                </View>
                {change !== undefined && (
                  <View style={styles.changeContainer}>
                    <Ionicons
                      name={change >= 0 ? 'trending-up' : 'trending-down'}
                      size={14}
                      color={change >= 0 ? '#10B981' : '#EF4444'}
                    />
                    <Text style={[styles.changeText, { color: change >= 0 ? '#10B981' : '#EF4444' }]}>
                      {Math.abs(change)}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.statValue}>{stat.format(value)}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateOccupancyOverviewParking(options: ParkingOptions = {}): string {
  const { componentName = 'OccupancyOverviewParking', endpoint = '/parking/occupancy' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  onSpotClick?: (spot: any) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onSpotClick }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['parking-occupancy', selectedLevel, selectedType],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (selectedLevel !== 'all') params.set('level', selectedLevel);
        if (selectedType !== 'all') params.set('type', selectedType);
        const response = await api.get<any>(\`${endpoint}?\${params}\`);
        return response?.data || response || { spots: [], summary: {} };
      } catch (err) {
        console.error('Failed to fetch parking occupancy:', err);
        return { spots: [], summary: {} };
      }
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: string; bgColor: string; borderColor: string; textColor: string }> = {
      available: { icon: 'checkmark-circle', bgColor: '#D1FAE5', borderColor: '#10B981', textColor: '#059669' },
      occupied: { icon: 'car-sport', bgColor: '#FEE2E2', borderColor: '#EF4444', textColor: '#DC2626' },
      reserved: { icon: 'time', bgColor: '#FEF3C7', borderColor: '#F59E0B', textColor: '#D97706' },
      maintenance: { icon: 'close-circle', bgColor: '#F3F4F6', borderColor: '#9CA3AF', textColor: '#6B7280' },
    };
    return configs[status?.toLowerCase()] || configs.available;
  };

  const getSpotTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'handicap':
      case 'accessible':
        return 'accessibility-outline';
      case 'ev':
      case 'electric':
        return 'flash-outline';
      default:
        return null;
    }
  };

  const levels = ['all', 'P1', 'P2', 'P3', 'G'];
  const types = ['all', 'standard', 'compact', 'handicap', 'ev', 'motorcycle'];

  const spots = data?.spots || [];
  const summary = data?.summary || {};

  // Group spots by level
  const spotsByLevel = spots.reduce((acc: Record<string, any[]>, spot: any) => {
    const level = spot.level || 'P1';
    if (!acc[level]) acc[level] = [];
    acc[level].push(spot);
    return acc;
  }, {});

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const renderSpotItem = ({ item }: { item: any }) => {
    const config = getStatusConfig(item.status);
    const typeIcon = getSpotTypeIcon(item.spot_type || item.type);

    return (
      <TouchableOpacity
        style={[styles.spotCard, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}
        onPress={() => onSpotClick?.(item)}
      >
        <View style={styles.spotHeader}>
          <Text style={[styles.spotNumber, { color: config.textColor }]}>
            {item.spot_number || item.number}
          </Text>
          {typeIcon && (
            <Ionicons name={typeIcon as any} size={12} color={config.textColor} />
          )}
        </View>
        {item.status === 'occupied' && item.duration && (
          <Text style={styles.duration}>{item.duration}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="car-sport-outline" size={20} color="#6366F1" />
          <Text style={styles.title}>Parking Occupancy</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.summaryText}>Available: {summary.available || 0}</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.summaryText}>Occupied: {summary.occupied || 0}</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.summaryText}>Reserved: {summary.reserved || 0}</Text>
          </View>
        </View>

        <View style={styles.occupancyBar}>
          <View style={styles.occupancyBarLabels}>
            <Text style={styles.occupancyLabel}>Overall Occupancy</Text>
            <Text style={styles.occupancyValue}>{summary.occupancyRate || 0}%</Text>
          </View>
          <View style={styles.occupancyBarTrack}>
            <View
              style={[
                styles.occupancyBarFill,
                {
                  width: \`\${summary.occupancyRate || 0}%\`,
                  backgroundColor:
                    (summary.occupancyRate || 0) > 90 ? '#EF4444' :
                    (summary.occupancyRate || 0) > 70 ? '#F59E0B' : '#10B981',
                },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.filtersRow}>
        <FlatList
          data={levels}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, selectedLevel === item && styles.filterChipActive]}
              onPress={() => setSelectedLevel(item)}
            >
              <Text style={[styles.filterChipText, selectedLevel === item && styles.filterChipTextActive]}>
                {item === 'all' ? 'All Levels' : \`Level \${item}\`}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={spots}
        renderItem={renderSpotItem}
        keyExtractor={(item) => item.id || item.spot_number}
        numColumns={6}
        contentContainerStyle={styles.gridContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car-sport-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No parking spots found</Text>
          </View>
        }
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Ionicons name="accessibility-outline" size={16} color="#6B7280" />
          <Text style={styles.legendText}>Accessible: {summary.accessibleAvailable || 0}/{summary.accessibleTotal || 0}</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="flash-outline" size={16} color="#6B7280" />
          <Text style={styles.legendText}>EV: {summary.evAvailable || 0}/{summary.evTotal || 0}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  occupancyBar: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
  },
  occupancyBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  occupancyLabel: {
    fontSize: 14,
    color: '#374151',
  },
  occupancyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  occupancyBarTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  occupancyBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  filtersRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  gridContent: {
    padding: 8,
  },
  spotCard: {
    flex: 1,
    margin: 3,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 45,
    maxWidth: '16%',
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  spotNumber: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 8,
    color: '#6B7280',
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
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ${componentName};
`;
}

export function generateReservationFiltersParking(options: ParkingOptions = {}): string {
  const { componentName = 'ReservationFiltersParking' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ParkingReservationFilters {
  search: string;
  status: string;
  spotType: string;
  level: string;
  dateRange: { start: string; end: string };
  duration: string;
}

interface ${componentName}Props {
  onFilterChange?: (filters: ParkingReservationFilters) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<ParkingReservationFilters>({
    search: '',
    status: '',
    spotType: '',
    level: '',
    dateRange: { start: '', end: '' },
    duration: '',
  });

  const [expandedFilter, setExpandedFilter] = useState<string | null>(null);

  const handleChange = (key: keyof ParkingReservationFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const statuses = ['active', 'upcoming', 'completed', 'cancelled', 'expired'];
  const spotTypes = ['standard', 'compact', 'handicap', 'ev', 'motorcycle', 'oversized'];
  const levels = ['P1', 'P2', 'P3', 'G'];
  const durations = ['hourly', 'daily', 'weekly', 'monthly'];

  const renderFilterSection = (
    title: string,
    key: string,
    options: string[],
    currentValue: string,
    filterKey: keyof ParkingReservationFilters
  ) => (
    <View style={styles.filterSection}>
      <TouchableOpacity
        style={styles.filterHeader}
        onPress={() => setExpandedFilter(expandedFilter === key ? null : key)}
      >
        <Text style={styles.filterTitle}>{title}</Text>
        <Ionicons
          name={expandedFilter === key ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>
      {expandedFilter === key && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, !currentValue && styles.optionButtonActive]}
            onPress={() => handleChange(filterKey, '')}
          >
            <Text style={[styles.optionText, !currentValue && styles.optionTextActive]}>All</Text>
          </TouchableOpacity>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.optionButton, currentValue === option && styles.optionButtonActive]}
              onPress={() => handleChange(filterKey, option)}
            >
              <Text style={[styles.optionText, currentValue === option && styles.optionTextActive]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="filter-outline" size={20} color="#6B7280" />
        <Text style={styles.headerTitle}>Filter Reservations</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="License plate, name, spot..."
          value={filters.search}
          onChangeText={(text) => handleChange('search', text)}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {renderFilterSection('Status', 'status', statuses, filters.status, 'status')}
      {renderFilterSection('Spot Type', 'spotType', spotTypes, filters.spotType, 'spotType')}
      {renderFilterSection('Level', 'level', levels, filters.level, 'level')}
      {renderFilterSection('Duration Type', 'duration', durations, filters.duration, 'duration')}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            const resetFilters: ParkingReservationFilters = {
              search: '',
              status: '',
              spotType: '',
              level: '',
              dateRange: { start: '', end: '' },
              duration: '',
            };
            setFilters(resetFilters);
            onFilterChange?.(resetFilters);
          }}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => onFilterChange?.(filters)}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
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
  filterSection: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  optionButtonActive: {
    backgroundColor: '#6366F1',
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export function generateCustomerProfileParking(options: ParkingOptions = {}): string {
  const { componentName = 'CustomerProfileParking', endpoint = '/parking/customers' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ${componentName}Props {
  customerId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ customerId: propCustomerId }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const customerId = propCustomerId || (route.params as any)?.id;

  const { data: customer, isLoading } = useQuery({
    queryKey: ['parking-customer', customerId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${customerId}\`);
      return response?.data || response;
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
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

  const vehicles = customer.vehicles || [];
  const recentParkings = customer.recent_parkings || customer.recentParkings || [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#6B7280" />
        <Text style={styles.backText}>Back to Customers</Text>
      </TouchableOpacity>

      <View style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {customer.avatar_url || customer.photo ? (
              <Image source={{ uri: customer.avatar_url || customer.photo }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={40} color="#FFFFFF" />
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.customerName}>
              {customer.name || \`\${customer.first_name || ''} \${customer.last_name || ''}\`.trim()}
            </Text>
            {customer.membership_type && (
              <View style={styles.membershipBadge}>
                <Ionicons name="star" size={12} color="#FFFFFF" />
                <Text style={styles.membershipText}>{customer.membership_type} Member</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Contact Information</Text>
        </View>
        {customer.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{customer.email}</Text>
          </View>
        )}
        {customer.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{customer.phone}</Text>
          </View>
        )}
        {customer.member_since && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              Member since {new Date(customer.member_since).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="car-sport-outline" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Assigned Spot</Text>
        </View>
        {customer.assigned_spot ? (
          <>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text style={styles.infoText}>
                Spot {customer.assigned_spot} (Level {customer.assigned_level || 'P1'})
              </Text>
            </View>
            {customer.subscription_expires && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>
                  Expires: {new Date(customer.subscription_expires).toLocaleDateString()}
                </Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.noDataText}>No assigned spot</Text>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="car-sport" size={20} color="#111827" />
          <Text style={styles.sectionTitle}>Registered Vehicles</Text>
        </View>
        {vehicles.length > 0 ? (
          vehicles.map((vehicle: any, idx: number) => (
            <View key={idx} style={styles.vehicleCard}>
              <View style={styles.vehicleIcon}>
                <Ionicons name="car-sport" size={24} color="#6366F1" />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.licensePlate}>{vehicle.license_plate || vehicle.licensePlate}</Text>
                <Text style={styles.vehicleDetails}>
                  {[vehicle.make, vehicle.model, vehicle.year].filter(Boolean).join(' ')}
                </Text>
                {vehicle.color && <Text style={styles.vehicleColor}>{vehicle.color}</Text>}
              </View>
              {vehicle.is_primary && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryText}>Primary</Text>
                </View>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No vehicles registered</Text>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
          <Text style={[styles.statValue, { color: '#4F46E5' }]}>{customer.total_visits || 0}</Text>
          <Text style={styles.statLabel}>Total Visits</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.statValue, { color: '#059669' }]}>{customer.total_hours || 0}h</Text>
          <Text style={styles.statLabel}>Total Hours</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#F3E8FF' }]}>
          <Text style={[styles.statValue, { color: '#7C3AED' }]}>\${(customer.total_spent || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statValue, { color: '#D97706' }]}>{customer.loyalty_points || 0}</Text>
          <Text style={styles.statLabel}>Reward Points</Text>
        </View>
      </View>

      {recentParkings.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Recent Parking Sessions</Text>
          </View>
          {recentParkings.slice(0, 5).map((parking: any, idx: number) => (
            <View key={idx} style={styles.parkingRow}>
              <View style={styles.parkingIcon}>
                <Ionicons name="location-outline" size={18} color="#6366F1" />
              </View>
              <View style={styles.parkingInfo}>
                <Text style={styles.parkingSpot}>Spot {parking.spot_number} (Level {parking.level})</Text>
                <Text style={styles.parkingDate}>
                  {new Date(parking.entry_time || parking.entryTime).toLocaleDateString()} - {parking.duration || 'N/A'}
                </Text>
              </View>
              <View style={styles.parkingAmount}>
                <Text style={styles.amountText}>\${parking.amount || 0}</Text>
                <View style={[styles.statusBadge, { backgroundColor: parking.status === 'completed' ? '#D1FAE5' : '#DBEAFE' }]}>
                  <Text style={[styles.statusText, { color: parking.status === 'completed' ? '#059669' : '#2563EB' }]}>
                    {parking.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {customer.balance !== undefined && customer.balance !== 0 && (
        <View style={[styles.balanceCard, { backgroundColor: customer.balance > 0 ? '#D1FAE5' : '#FEE2E2' }]}>
          <View style={styles.balanceInfo}>
            <Ionicons name="card-outline" size={24} color={customer.balance > 0 ? '#059669' : '#DC2626'} />
            <View>
              <Text style={styles.balanceLabel}>
                {customer.balance > 0 ? 'Account Credit' : 'Outstanding Balance'}
              </Text>
              <Text style={[styles.balanceAmount, { color: customer.balance > 0 ? '#059669' : '#DC2626' }]}>
                \${Math.abs(customer.balance).toLocaleString()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.balanceButton, { backgroundColor: customer.balance > 0 ? '#059669' : '#DC2626' }]}
          >
            <Text style={styles.balanceButtonText}>
              {customer.balance > 0 ? 'Use Credit' : 'Process Payment'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  backText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerCard: {
    backgroundColor: '#6366F1',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  membershipText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  licensePlate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  vehicleDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  vehicleColor: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  primaryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4F46E5',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  parkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  parkingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  parkingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  parkingSpot: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  parkingDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  parkingAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
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
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  balanceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#111827',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  balanceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ${componentName};
`;
}
