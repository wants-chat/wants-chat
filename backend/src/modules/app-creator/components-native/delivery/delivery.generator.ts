/**
 * Delivery Component Generators (React Native)
 *
 * Generates delivery management components including delivery lists,
 * schedules, and earnings tracking. Uses FlatList, SectionList,
 * and ScrollView for layouts with React Query for data fetching.
 */

export interface FloristDeliveryOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
  entityType?: string;
}

/**
 * Generates a florist-specific delivery list component
 */
export function generateDeliveryListFlorist(options: FloristDeliveryOptions = {}): string {
  const {
    componentName = 'DeliveryListFlorist',
    endpoint = '/deliveries/florist',
    title = "Today's Deliveries",
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
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface FloristDelivery {
  id: string;
  order_number?: string;
  orderNumber?: string;
  customer_name?: string;
  customerName?: string;
  address: string;
  phone: string;
  arrangement: string;
  delivery_window?: string;
  deliveryWindow?: string;
  driver: string;
  status: 'pending' | 'out-for-delivery' | 'delivered' | 'failed';
  special_instructions?: string;
  specialInstructions?: string;
}

interface ${componentName}Props {
  title?: string;
  onDeliveryPress?: (delivery: FloristDelivery) => void;
}

type FilterStatus = 'all' | 'pending' | 'out-for-delivery' | 'delivered';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'pending': { bg: '#FEF3C7', text: '#D97706' },
  'out-for-delivery': { bg: '#DBEAFE', text: '#2563EB' },
  'delivered': { bg: '#D1FAE5', text: '#059669' },
  'failed': { bg: '#FEE2E2', text: '#DC2626' },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  onDeliveryPress,
}) => {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: deliveries, isLoading, refetch } = useQuery({
    queryKey: ['florist-deliveries', filter],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredDeliveries = filter === 'all'
    ? deliveries
    : deliveries?.filter((d: FloristDelivery) => d.status === filter);

  const filterOptions: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'out-for-delivery', label: 'Out' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const formatStatus = (status: string) => {
    return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const renderDeliveryCard = useCallback(({ item }: { item: FloristDelivery }) => {
    const orderNumber = item.order_number || item.orderNumber || '';
    const customerName = item.customer_name || item.customerName || '';
    const deliveryWindow = item.delivery_window || item.deliveryWindow || '';
    const specialInstructions = item.special_instructions || item.specialInstructions;
    const statusColors = STATUS_COLORS[item.status] || { bg: '#F3F4F6', text: '#6B7280' };

    return (
      <TouchableOpacity
        style={styles.deliveryCard}
        onPress={() => onDeliveryPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {formatStatus(item.status)}
              </Text>
            </View>
          </View>
          <View style={styles.timeInfo}>
            <Text style={styles.deliveryWindow}>{deliveryWindow}</Text>
            <Text style={styles.driver}>Driver: {item.driver}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.arrangement}>{item.arrangement}</Text>
          <Text style={styles.customerName}>{customerName}</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.address}>{item.address}</Text>
          </View>
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={14} color="#6B7280" />
            <Text style={styles.phone}>{item.phone}</Text>
          </View>
        </View>

        {specialInstructions && (
          <View style={styles.instructionsContainer}>
            <Ionicons name="warning-outline" size={16} color="#D97706" />
            <Text style={styles.instructionsText}>{specialInstructions}</Text>
          </View>
        )}

        {item.status === 'pending' && (
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Ionicons name="car-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Mark Out for Delivery</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }, [onDeliveryPress]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flower-outline" size={24} color="#EC4899" />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.count}>{filteredDeliveries?.length || 0} deliveries</Text>
      </View>

      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterTab,
              filter === option.key && styles.filterTabActive
            ]}
            onPress={() => setFilter(option.key)}
          >
            <Text style={[
              styles.filterTabText,
              filter === option.key && styles.filterTabTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDeliveries || []}
        renderItem={renderDeliveryCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EC4899"
            colors={['#EC4899']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="flower-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No deliveries found</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  count: {
    fontSize: 14,
    color: '#6B7280',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#EC4899',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  deliveryCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  deliveryWindow: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  driver: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardContent: {
    gap: 4,
  },
  arrangement: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  customerName: {
    fontSize: 14,
    color: '#374151',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  address: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  phone: {
    fontSize: 13,
    color: '#6B7280',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

/**
 * Generates a generic delivery schedule component
 */
export function generateDeliveryScheduleGeneric(options: FloristDeliveryOptions = {}): string {
  const {
    componentName = 'DeliverySchedule',
    endpoint = '/deliveries/schedule',
    title = 'Delivery Schedule',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface ScheduledDelivery {
  id: string;
  order_number?: string;
  orderNumber?: string;
  customer: string;
  address: string;
  scheduled_time?: string;
  scheduledTime?: string;
  driver: string;
  items: number;
  status: 'scheduled' | 'in-transit' | 'delivered';
}

interface Section {
  title: string;
  data: ScheduledDelivery[];
}

interface ${componentName}Props {
  title?: string;
  onDeliveryPress?: (delivery: ScheduledDelivery) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'scheduled': { bg: '#F3F4F6', text: '#6B7280' },
  'in-transit': { bg: '#DBEAFE', text: '#2563EB' },
  'delivered': { bg: '#D1FAE5', text: '#059669' },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  onDeliveryPress,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);

  const { data: deliveries, isLoading, refetch } = useQuery({
    queryKey: ['delivery-schedule', selectedDate],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?date=\${selectedDate}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const groupByDriver = (items: ScheduledDelivery[]): Section[] => {
    const groups: Record<string, ScheduledDelivery[]> = {};

    items.forEach((item) => {
      const driver = item.driver || 'Unassigned';
      if (!groups[driver]) {
        groups[driver] = [];
      }
      groups[driver].push(item);
    });

    return Object.entries(groups).map(([driver, data]) => ({
      title: driver,
      data: data.sort((a, b) => {
        const timeA = a.scheduled_time || a.scheduledTime || '';
        const timeB = b.scheduled_time || b.scheduledTime || '';
        return timeA.localeCompare(timeB);
      }),
    }));
  };

  const sections = deliveries ? groupByDriver(deliveries) : [];

  const renderDeliveryItem = useCallback(({ item, index }: { item: ScheduledDelivery; index: number }) => {
    const scheduledTime = item.scheduled_time || item.scheduledTime || '';
    const orderNumber = item.order_number || item.orderNumber || '';
    const statusColors = STATUS_COLORS[item.status] || { bg: '#F3F4F6', text: '#6B7280' };

    return (
      <TouchableOpacity
        style={styles.deliveryItem}
        onPress={() => onDeliveryPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.stopNumber}>
          <Text style={styles.stopNumberText}>{index + 1}</Text>
        </View>
        <View style={styles.deliveryContent}>
          <View style={styles.deliveryHeader}>
            <Text style={styles.scheduledTime}>{scheduledTime}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.customerName}>{item.customer}</Text>
          <Text style={styles.address}>{item.address}</Text>
          <View style={styles.deliveryMeta}>
            <Text style={styles.itemCount}>{item.items} items</Text>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [onDeliveryPress]);

  const renderSectionHeader = useCallback(({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.driverAvatar}>
        <Text style={styles.driverInitial}>{section.title.charAt(0)}</Text>
      </View>
      <Text style={styles.driverName}>{section.title}'s Route</Text>
      <View style={styles.stopsBadge}>
        <Text style={styles.stopsCount}>{section.data.length} stops</Text>
      </View>
    </View>
  ), []);

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
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
        <Text style={styles.title}>{title}</Text>
        <View style={styles.datePicker}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => changeDate(-1)}
          >
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <View style={styles.dateDisplay}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </View>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => changeDate(1)}
          >
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderDeliveryItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
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
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No deliveries scheduled</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  driverInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  driverName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  stopsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  stopsCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  deliveryItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stopNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  deliveryContent: {
    flex: 1,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduledTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  customerName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  address: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  deliveryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  orderNumber: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#9CA3AF',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

/**
 * Generates a florist-specific delivery schedule component
 */
export function generateDeliveryScheduleFlorist(options: FloristDeliveryOptions = {}): string {
  const {
    componentName = 'DeliveryScheduleFlorist',
    endpoint = '/deliveries/florist/schedule',
    title = 'Delivery Schedule',
  } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface FloristScheduledDelivery {
  id: string;
  order_number?: string;
  orderNumber?: string;
  customer: string;
  address: string;
  phone: string;
  arrangement: string;
  occasion?: string;
  scheduled_time?: string;
  scheduledTime?: string;
  driver: string;
  status: 'pending' | 'out-for-delivery' | 'delivered';
}

interface Section {
  title: string;
  data: FloristScheduledDelivery[];
}

interface ${componentName}Props {
  title?: string;
  onDeliveryPress?: (delivery: FloristScheduledDelivery) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'pending': { bg: '#FEF3C7', text: '#D97706' },
  'out-for-delivery': { bg: '#DBEAFE', text: '#2563EB' },
  'delivered': { bg: '#D1FAE5', text: '#059669' },
};

const OCCASION_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  'Anniversary': { name: 'heart', color: '#EC4899' },
  'Birthday': { name: 'gift', color: '#8B5CF6' },
  'Wedding': { name: 'sparkles', color: '#F59E0B' },
  'Sympathy': { name: 'leaf', color: '#6B7280' },
  'Get Well': { name: 'medical', color: '#10B981' },
};

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
  onDeliveryPress,
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);

  const { data: deliveries, isLoading, refetch } = useQuery({
    queryKey: ['florist-schedule', selectedDate],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?date=\${selectedDate}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const groupByDriver = (items: FloristScheduledDelivery[]): Section[] => {
    const groups: Record<string, FloristScheduledDelivery[]> = {};

    items.forEach((item) => {
      const driver = item.driver || 'Unassigned';
      if (!groups[driver]) {
        groups[driver] = [];
      }
      groups[driver].push(item);
    });

    return Object.entries(groups).map(([driver, data]) => ({
      title: driver,
      data: data.sort((a, b) => {
        const timeA = a.scheduled_time || a.scheduledTime || '';
        const timeB = b.scheduled_time || b.scheduledTime || '';
        return timeA.localeCompare(timeB);
      }),
    }));
  };

  const sections = deliveries ? groupByDriver(deliveries) : [];

  const formatStatus = (status: string) => {
    return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const renderDeliveryItem = useCallback(({ item }: { item: FloristScheduledDelivery }) => {
    const scheduledTime = item.scheduled_time || item.scheduledTime || '';
    const orderNumber = item.order_number || item.orderNumber || '';
    const statusColors = STATUS_COLORS[item.status] || { bg: '#F3F4F6', text: '#6B7280' };
    const occasionIcon = item.occasion ? OCCASION_ICONS[item.occasion] : null;

    return (
      <TouchableOpacity
        style={styles.deliveryItem}
        onPress={() => onDeliveryPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.timelineMarker}>
          <View style={styles.timelineDot} />
        </View>

        <View style={styles.deliveryCard}>
          <View style={styles.cardHeader}>
            <View style={styles.timeRow}>
              <Text style={styles.scheduledTime}>{scheduledTime}</Text>
              {occasionIcon && (
                <Ionicons
                  name={occasionIcon.name}
                  size={16}
                  color={occasionIcon.color}
                />
              )}
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusText, { color: statusColors.text }]}>
                  {formatStatus(item.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
          </View>

          <Text style={styles.arrangement}>{item.arrangement}</Text>
          <Text style={styles.customerName}>{item.customer}</Text>
          <Text style={styles.address}>{item.address}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [onDeliveryPress]);

  const renderSectionHeader = useCallback(({ section }: { section: Section }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.driverAvatar}>
        <Text style={styles.driverInitial}>{section.title.charAt(0)}</Text>
      </View>
      <Text style={styles.driverName}>{section.title}'s Route</Text>
    </View>
  ), []);

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flower-outline" size={24} color="#EC4899" />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.datePicker}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => changeDate(-1)}
          >
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </View>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => changeDate(1)}
          >
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        renderItem={renderDeliveryItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EC4899"
            colors={['#EC4899']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="flower-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No deliveries scheduled</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FCE7F3',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#BE185D',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  driverAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  driverInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EC4899',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  deliveryItem: {
    flexDirection: 'row',
    marginLeft: 16,
    marginBottom: 8,
  },
  timelineMarker: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EC4899',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  deliveryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduledTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  orderNumber: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#9CA3AF',
  },
  arrangement: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  address: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  phone: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

export default ${componentName};
`;
}

/**
 * Generates an earnings chart component for delivery drivers
 */
export function generateEarningsChart(options: FloristDeliveryOptions = {}): string {
  const {
    componentName = 'EarningsChart',
    endpoint = '/earnings',
    title = 'Earnings Overview',
  } = options;

  return `import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface EarningsData {
  period: string;
  earnings: number;
  orders: number;
  tips: number;
}

interface ${componentName}Props {
  title?: string;
}

type PeriodType = 'week' | 'month' | 'year';

const { width: screenWidth } = Dimensions.get('window');
const CHART_WIDTH = screenWidth - 64;

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
}) => {
  const [period, setPeriod] = useState<PeriodType>('week');
  const [refreshing, setRefreshing] = useState(false);
  const animatedValues = useRef<Animated.Value[]>([]);

  const { data: earningsData, isLoading, refetch } = useQuery({
    queryKey: ['earnings', period],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}?period=\${period}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  useEffect(() => {
    if (earningsData?.length) {
      animatedValues.current = earningsData.map(() => new Animated.Value(0));
      const animations = animatedValues.current.map((value, index) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 500,
          delay: index * 50,
          useNativeDriver: false,
        })
      );
      Animated.parallel(animations).start();
    }
  }, [earningsData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const data: EarningsData[] = earningsData || [];
  const totalEarnings = data.reduce((sum, d) => sum + d.earnings, 0);
  const totalTips = data.reduce((sum, d) => sum + d.tips, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
  const maxEarnings = Math.max(...data.map(d => d.earnings), 1);

  const periodOptions: { key: PeriodType; label: string }[] = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const barWidth = data.length > 0 ? (CHART_WIDTH - (data.length - 1) * 8) / data.length : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#10B981"
          colors={['#10B981']}
        />
      }
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.periodSelector}>
            {periodOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.periodTab,
                  period === option.key && styles.periodTabActive
                ]}
                onPress={() => setPeriod(option.key)}
              >
                <Text style={[
                  styles.periodTabText,
                  period === option.key && styles.periodTabTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="cash-outline" size={24} color="#059669" />
            <Text style={[styles.statValue, { color: '#059669' }]}>
              \${totalEarnings.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="gift-outline" size={24} color="#2563EB" />
            <Text style={[styles.statValue, { color: '#2563EB' }]}>
              \${totalTips.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Tips</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="receipt-outline" size={24} color="#7C3AED" />
            <Text style={[styles.statValue, { color: '#7C3AED' }]}>
              {totalOrders}
            </Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chart}>
            {data.map((item, index) => {
              const barHeight = (item.earnings / maxEarnings) * 150;
              const animatedHeight = animatedValues.current[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [0, barHeight],
              }) || barHeight;

              return (
                <View key={item.period} style={[styles.barContainer, { width: barWidth }]}>
                  <Text style={styles.barValue}>\${item.earnings}</Text>
                  <Animated.View
                    style={[
                      styles.bar,
                      {
                        height: animatedHeight,
                        backgroundColor: '#10B981',
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{item.period}</Text>
                </View>
              );
            })}
          </View>
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
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 4,
  },
  periodTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  periodTabActive: {
    backgroundColor: '#10B981',
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodTabTextActive: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  chartContainer: {
    height: 200,
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  barContainer: {
    alignItems: 'center',
  },
  barValue: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default ${componentName};
`;
}

/**
 * Generates an earnings summary component for delivery drivers
 */
export function generateEarningsSummary(options: FloristDeliveryOptions = {}): string {
  const {
    componentName = 'EarningsSummary',
    endpoint = '/earnings/summary',
    title = 'Earnings Summary',
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

interface EarningsSummaryData {
  today?: number;
  this_week?: number;
  thisWeek?: number;
  this_month?: number;
  thisMonth?: number;
  last_month?: number;
  lastMonth?: number;
  pending_payouts?: number;
  pendingPayouts?: number;
  next_payout_date?: string;
  nextPayoutDate?: string;
}

interface ${componentName}Props {
  title?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  title = '${title}',
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: summary, isLoading, refetch } = useQuery({
    queryKey: ['earnings-summary'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return response?.data || response || {};
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
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  const today = summary?.today || 0;
  const thisWeek = summary?.this_week || summary?.thisWeek || 0;
  const thisMonth = summary?.this_month || summary?.thisMonth || 0;
  const lastMonth = summary?.last_month || summary?.lastMonth || 0;
  const pendingPayouts = summary?.pending_payouts || summary?.pendingPayouts || 0;
  const nextPayoutDate = summary?.next_payout_date || summary?.nextPayoutDate || '';

  const monthlyChange = lastMonth > 0
    ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1)
    : '0';
  const isPositive = Number(monthlyChange) >= 0;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#10B981"
          colors={['#10B981']}
        />
      }
    >
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>

        {/* Summary Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Today</Text>
            <Text style={styles.statValue}>\${today.toLocaleString()}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This Week</Text>
            <Text style={styles.statValue}>\${thisWeek.toLocaleString()}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statValue}>\${thisMonth.toLocaleString()}</Text>
            <View style={styles.changeRow}>
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={14}
                color={isPositive ? '#10B981' : '#EF4444'}
              />
              <Text style={[
                styles.changeText,
                { color: isPositive ? '#10B981' : '#EF4444' }
              ]}>
                {Math.abs(Number(monthlyChange))}% vs last month
              </Text>
            </View>
          </View>
        </View>

        {/* Payout Info */}
        <View style={styles.payoutSection}>
          <View style={styles.payoutInfo}>
            <View style={styles.payoutRow}>
              <View style={styles.payoutIconContainer}>
                <Ionicons name="wallet-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.payoutLabel}>Pending Payouts</Text>
                <Text style={styles.payoutValue}>\${pendingPayouts.toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.payoutRow}>
              <View style={styles.payoutIconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.payoutLabel}>Next Payout</Text>
                <Text style={styles.payoutDate}>{formatDate(nextPayoutDate)}</Text>
              </View>
            </View>
          </View>
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
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 20,
  },
  statCard: {
    width: '33.33%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  changeText: {
    fontSize: 11,
  },
  payoutSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  payoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  payoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payoutLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  payoutValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  payoutDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
});

export default ${componentName};
`;
}
