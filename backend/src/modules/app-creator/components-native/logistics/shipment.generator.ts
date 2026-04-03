/**
 * Shipment Component Generators (React Native)
 *
 * Generates shipment tracking and management components for React Native.
 * Features: FlatList with shipments, tracking timeline, map placeholder, filters.
 */

export interface ShipmentOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateShipmentMap(options: ShipmentOptions = {}): string {
  const { componentName = 'ShipmentMap', endpoint = '/shipments' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Shipment {
  id: string;
  tracking_number: string;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  origin: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  current_location?: {
    address: string;
    lat: number;
    lng: number;
  };
  carrier?: string;
  estimated_delivery?: string;
}

interface ${componentName}Props {
  shipmentId?: string;
  showControls?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  shipmentId,
  showControls = true,
}) => {
  const [selectedShipment, setSelectedShipment] = useState<string | null>(shipmentId || null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: shipments, isLoading, refetch } = useQuery({
    queryKey: ['shipments-map', shipmentId],
    queryFn: async () => {
      const url = shipmentId
        ? \`${endpoint}/\${shipmentId}\`
        : '${endpoint}?status=in_transit,out_for_delivery';
      const response = await api.get<any>(url);
      return shipmentId
        ? [response?.data || response]
        : (Array.isArray(response) ? response : (response?.data || []));
    },
    refetchInterval: 30000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const statusColors: Record<string, string> = {
    pending: '#6B7280',
    in_transit: '#3B82F6',
    out_for_delivery: '#F59E0B',
    delivered: '#10B981',
    exception: '#EF4444',
  };

  const renderShipmentItem = useCallback(({ item }: { item: Shipment }) => {
    const isSelected = selectedShipment === item.id;

    return (
      <TouchableOpacity
        style={[styles.shipmentItem, isSelected && styles.selectedItem]}
        onPress={() => setSelectedShipment(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.shipmentRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColors[item.status] }]} />
          <View style={styles.shipmentInfo}>
            <Text style={styles.trackingNumber} numberOfLines={1}>
              {item.tracking_number}
            </Text>
            <Text style={styles.destinationAddress} numberOfLines={1}>
              {item.destination?.address}
            </Text>
            {item.estimated_delivery && (
              <Text style={styles.eta}>
                ETA: {new Date(item.estimated_delivery).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [selectedShipment]);

  const keyExtractor = useCallback((item: Shipment) => item.id, []);

  const activeShipments = shipments?.filter((s: Shipment) => s.status !== 'delivered') || [];
  const selected = shipments?.find((s: Shipment) => s.id === selectedShipment);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showControls && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="navigate" size={20} color="#3B82F6" />
            <Text style={styles.headerTitle}>Live Tracking</Text>
            <Text style={styles.headerCount}>({activeShipments.length} active)</Text>
          </View>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="location" size={48} color="#D1D5DB" />
        <Text style={styles.mapPlaceholderText}>Map Integration</Text>
        <Text style={styles.mapPlaceholderSubtext}>Connect your mapping provider</Text>
      </View>

      {/* Shipment List */}
      <View style={styles.listContainer}>
        {activeShipments.length > 0 ? (
          <FlatList
            data={activeShipments}
            renderItem={renderShipmentItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#3B82F6"
              />
            }
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No active shipments</Text>
          </View>
        )}
      </View>

      {/* Selected Shipment Details */}
      {selected && (
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View>
              <Text style={styles.detailsTrackingNumber}>{selected.tracking_number}</Text>
              <Text style={styles.detailsCarrier}>{selected.carrier || 'Standard Carrier'}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColors[selected.status] }]}>
              <Text style={styles.statusBadgeText}>
                {selected.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailsGridItem}>
              <Text style={styles.detailsLabel}>Origin</Text>
              <Text style={styles.detailsValue} numberOfLines={2}>{selected.origin?.address}</Text>
            </View>
            <View style={styles.detailsGridItem}>
              <Text style={styles.detailsLabel}>Destination</Text>
              <Text style={styles.detailsValue} numberOfLines={2}>{selected.destination?.address}</Text>
            </View>
          </View>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  headerCount: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  refreshButton: {
    padding: 8,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
  },
  listContainer: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  shipmentItem: {
    padding: 16,
  },
  selectedItem: {
    backgroundColor: '#EFF6FF',
  },
  shipmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    marginRight: 12,
  },
  shipmentInfo: {
    flex: 1,
  },
  trackingNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  destinationAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  eta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
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
  detailsCard: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailsTrackingNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  detailsCarrier: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  detailsGrid: {
    flexDirection: 'row',
  },
  detailsGridItem: {
    flex: 1,
  },
  detailsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailsValue: {
    fontSize: 13,
    color: '#111827',
    marginTop: 2,
  },
});

export default ${componentName};
`;
}

export function generateShipmentFilters(options: ShipmentOptions = {}): string {
  const { componentName = 'ShipmentFilters' } = options;

  return `import React, { useState } from 'react';
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
  status: string[];
  carrier: string;
  dateRange: { start: string; end: string };
}

interface ${componentName}Props {
  onFilterChange: (filters: FilterState) => void;
  carriers?: string[];
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onFilterChange,
  carriers = ['FedEx', 'UPS', 'DHL', 'USPS'],
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    carrier: '',
    dateRange: { start: '', end: '' },
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#6B7280' },
    { value: 'in_transit', label: 'In Transit', color: '#3B82F6' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: '#F59E0B' },
    { value: 'delivered', label: 'Delivered', color: '#10B981' },
    { value: 'exception', label: 'Exception', color: '#EF4444' },
  ];

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatus });
  };

  const clearFilters = () => {
    const cleared = { search: '', status: [], carrier: '', dateRange: { start: '', end: '' } };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = filters.search || filters.status.length > 0 || filters.carrier;

  return (
    <View style={styles.container}>
      {/* Search and Basic Filters */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by tracking number, address..."
            placeholderTextColor="#9CA3AF"
            value={filters.search}
            onChangeText={(text) => updateFilters({ search: text })}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showAdvanced && styles.filterButtonActive]}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Ionicons name="filter" size={18} color={showAdvanced ? '#3B82F6' : '#6B7280'} />
        </TouchableOpacity>
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Ionicons name="close" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Advanced Filters */}
      {showAdvanced && (
        <View style={styles.advancedFilters}>
          <Text style={styles.filterLabel}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.statusChip,
                  filters.status.includes(option.value) && styles.statusChipActive,
                ]}
                onPress={() => toggleStatus(option.value)}
              >
                <View style={[styles.statusDot, { backgroundColor: option.color }]} />
                <Text
                  style={[
                    styles.statusChipText,
                    filters.status.includes(option.value) && styles.statusChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>Carrier</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carrierScroll}>
            <TouchableOpacity
              style={[styles.carrierChip, !filters.carrier && styles.carrierChipActive]}
              onPress={() => updateFilters({ carrier: '' })}
            >
              <Text style={[styles.carrierChipText, !filters.carrier && styles.carrierChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {carriers.map((carrier) => (
              <TouchableOpacity
                key={carrier}
                style={[styles.carrierChip, filters.carrier === carrier && styles.carrierChipActive]}
                onPress={() => updateFilters({ carrier })}
              >
                <Text
                  style={[
                    styles.carrierChipText,
                    filters.carrier === carrier && styles.carrierChipTextActive,
                  ]}
                >
                  {carrier}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  clearButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  advancedFilters: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statusScroll: {
    marginBottom: 16,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  statusChipActive: {
    backgroundColor: '#EFF6FF',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusChipTextActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  carrierScroll: {
    marginBottom: 8,
  },
  carrierChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  carrierChipActive: {
    backgroundColor: '#3B82F6',
  },
  carrierChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  carrierChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}

export function generateShipmentTimeline(options: ShipmentOptions = {}): string {
  const { componentName = 'ShipmentTimeline', endpoint = '/shipments' } = options;

  return `import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface TrackingEvent {
  id: string;
  timestamp: string;
  status: string;
  location: string;
  description: string;
  is_current?: boolean;
}

interface Shipment {
  id: string;
  tracking_number: string;
  status: string;
  carrier: string;
  estimated_delivery?: string;
  events: TrackingEvent[];
}

interface ${componentName}Props {
  shipmentId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ shipmentId: propId }) => {
  const route = useRoute();
  const shipmentId = propId || (route.params as any)?.id;
  const [refreshing, setRefreshing] = useState(false);

  const { data: shipment, isLoading, error, refetch } = useQuery({
    queryKey: ['shipment-timeline', shipmentId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${shipmentId}\`);
      return response?.data || response;
    },
    enabled: !!shipmentId,
    refetchInterval: 60000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status.toLowerCase()) {
      case 'picked_up':
      case 'label_created':
        return 'cube';
      case 'in_transit':
      case 'departed':
      case 'arrived':
        return 'car';
      case 'out_for_delivery':
        return 'location';
      case 'delivered':
        return 'checkmark-circle';
      case 'exception':
      case 'delayed':
        return 'warning';
      default:
        return 'time';
    }
  };

  const getStatusColor = (status: string, isCurrent: boolean) => {
    if (status.toLowerCase() === 'delivered') return '#10B981';
    if (status.toLowerCase() === 'exception' || status.toLowerCase() === 'delayed') return '#EF4444';
    if (isCurrent) return '#3B82F6';
    return '#D1D5DB';
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !shipment) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Unable to load shipment tracking</Text>
      </View>
    );
  }

  const events = shipment.events || [];

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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerLabel}>Tracking Number</Text>
          <Text style={styles.trackingNumber}>{shipment.tracking_number}</Text>
          <Text style={styles.carrier}>{shipment.carrier}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: shipment.status === 'delivered' ? '#D1FAE5' :
              shipment.status === 'exception' ? '#FEE2E2' : '#DBEAFE' }
          ]}>
            <Text style={[
              styles.statusBadgeText,
              { color: shipment.status === 'delivered' ? '#059669' :
                shipment.status === 'exception' ? '#DC2626' : '#2563EB' }
            ]}>
              {shipment.status.replace('_', ' ')}
            </Text>
          </View>
          {shipment.estimated_delivery && (
            <Text style={styles.eta}>
              ETA: {new Date(shipment.estimated_delivery).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        {events.length > 0 ? (
          events.map((event: TrackingEvent, index: number) => {
            const iconName = getStatusIcon(event.status);
            const iconColor = getStatusColor(event.status, event.is_current || false);
            const isLast = index === events.length - 1;

            return (
              <View key={event.id || index} style={styles.timelineItem}>
                {/* Timeline Line */}
                <View style={styles.timelineLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
                    <Ionicons name={iconName} size={16} color="#FFFFFF" />
                  </View>
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                {/* Content */}
                <View style={styles.timelineContent}>
                  <Text style={styles.eventDescription}>
                    {event.description || event.status.replace('_', ' ')}
                  </Text>
                  <View style={styles.eventMeta}>
                    <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                    <Text style={styles.eventLocation}>{event.location}</Text>
                  </View>
                  <Text style={styles.eventTimestamp}>
                    {new Date(event.timestamp).toLocaleString()}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No tracking events available yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 200,
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerInfo: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  trackingNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  carrier: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  eta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  timelineContainer: {
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 70,
  },
  timelineLeft: {
    width: 36,
    alignItems: 'center',
  },
  iconContainer: {
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
    marginTop: 4,
    marginBottom: -4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  eventDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventLocation: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  eventTimestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
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

export function generateShipmentFiltersWarehouse(options: ShipmentOptions = {}): string {
  const { componentName = 'ShipmentFiltersWarehouse' } = options;

  return `import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WarehouseFilterState {
  search: string;
  warehouse: string;
  zone: string;
  priority: string[];
  shipmentType: string;
  sortBy: string;
}

interface ${componentName}Props {
  onFilterChange: (filters: WarehouseFilterState) => void;
  warehouses?: Array<{ id: string; name: string }>;
  zones?: string[];
  onExport?: () => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onFilterChange,
  warehouses = [],
  zones = ['A', 'B', 'C', 'D', 'Receiving', 'Shipping'],
  onExport,
}) => {
  const [filters, setFilters] = useState<WarehouseFilterState>({
    search: '',
    warehouse: '',
    zone: '',
    priority: [],
    shipmentType: '',
    sortBy: 'date_desc',
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent', color: '#EF4444' },
    { value: 'high', label: 'High', color: '#F59E0B' },
    { value: 'normal', label: 'Normal', color: '#3B82F6' },
    { value: 'low', label: 'Low', color: '#6B7280' },
  ];

  const shipmentTypes = ['Inbound', 'Outbound', 'Transfer', 'Return'];

  const updateFilters = (updates: Partial<WarehouseFilterState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const togglePriority = (priority: string) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter((p) => p !== priority)
      : [...filters.priority, priority];
    updateFilters({ priority: newPriority });
  };

  const clearFilters = () => {
    const cleared: WarehouseFilterState = {
      search: '',
      warehouse: '',
      zone: '',
      priority: [],
      shipmentType: '',
      sortBy: 'date_desc',
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = filters.search || filters.warehouse || filters.zone ||
    filters.priority.length > 0 || filters.shipmentType;

  return (
    <View style={styles.container}>
      {/* Search Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search shipments, SKU, PO number..."
            placeholderTextColor="#9CA3AF"
            value={filters.search}
            onChangeText={(text) => updateFilters({ search: text })}
          />
        </View>
        <TouchableOpacity
          style={[styles.iconButton, showAdvanced && styles.iconButtonActive]}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Ionicons name="filter" size={18} color={showAdvanced ? '#3B82F6' : '#6B7280'} />
        </TouchableOpacity>
        {onExport && (
          <TouchableOpacity style={styles.iconButton} onPress={onExport}>
            <Ionicons name="download-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
        )}
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Ionicons name="close" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Zone and Warehouse Quick Filters */}
      <View style={styles.quickFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.quickFilterChip, !filters.zone && styles.quickFilterChipActive]}
            onPress={() => updateFilters({ zone: '' })}
          >
            <Text style={[styles.quickFilterText, !filters.zone && styles.quickFilterTextActive]}>
              All Zones
            </Text>
          </TouchableOpacity>
          {zones.map((zone) => (
            <TouchableOpacity
              key={zone}
              style={[styles.quickFilterChip, filters.zone === zone && styles.quickFilterChipActive]}
              onPress={() => updateFilters({ zone })}
            >
              <Text style={[styles.quickFilterText, filters.zone === zone && styles.quickFilterTextActive]}>
                Zone {zone}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Advanced Filters */}
      {showAdvanced && (
        <View style={styles.advancedFilters}>
          <Text style={styles.filterLabel}>Priority</Text>
          <View style={styles.priorityContainer}>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.priorityChip,
                  filters.priority.includes(option.value) && styles.priorityChipActive,
                ]}
                onPress={() => togglePriority(option.value)}
              >
                <View style={[styles.priorityDot, { backgroundColor: option.color }]} />
                <Text
                  style={[
                    styles.priorityChipText,
                    filters.priority.includes(option.value) && styles.priorityChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Shipment Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.typeChip, !filters.shipmentType && styles.typeChipActive]}
              onPress={() => updateFilters({ shipmentType: '' })}
            >
              <Text style={[styles.typeChipText, !filters.shipmentType && styles.typeChipTextActive]}>
                All Types
              </Text>
            </TouchableOpacity>
            {shipmentTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  filters.shipmentType === type.toLowerCase() && styles.typeChipActive,
                ]}
                onPress={() => updateFilters({ shipmentType: type.toLowerCase() })}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    filters.shipmentType === type.toLowerCase() && styles.typeChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#111827',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  clearButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  quickFilters: {
    marginTop: 12,
  },
  quickFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  quickFilterChipActive: {
    backgroundColor: '#3B82F6',
  },
  quickFilterText: {
    fontSize: 13,
    color: '#6B7280',
  },
  quickFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  advancedFilters: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    marginBottom: 8,
  },
  priorityChipActive: {
    backgroundColor: '#EFF6FF',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  priorityChipTextActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: '#3B82F6',
  },
  typeChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ${componentName};
`;
}
