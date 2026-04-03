/**
 * Delivery Component Generators (React Native)
 *
 * Generates delivery scheduling and tracking components for React Native.
 * Features: FlatList schedules, delivery tracking with progress, route planning.
 */

export interface DeliveryOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateDeliverySchedule(options: DeliveryOptions = {}): string {
  const { componentName = 'DeliverySchedule', endpoint = '/deliveries' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Delivery {
  id: string;
  order_number: string;
  customer_name: string;
  address: string;
  time_slot: string;
  status: 'scheduled' | 'in_transit' | 'delivered' | 'failed';
  driver?: string;
  vehicle?: string;
  items_count: number;
  priority: 'normal' | 'high' | 'urgent';
}

interface ${componentName}Props {
  driverId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ driverId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const { data: deliveries, isLoading, refetch } = useQuery({
    queryKey: ['delivery-schedule', selectedDate.toISOString().split('T')[0], driverId],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('date', selectedDate.toISOString().split('T')[0]);
      if (driverId) params.append('driver_id', driverId);
      const response = await api.get<any>(\`${endpoint}/schedule?\${params.toString()}\`);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  ];

  const statusColors: Record<string, string> = {
    scheduled: '#3B82F6',
    in_transit: '#F59E0B',
    delivered: '#10B981',
    failed: '#EF4444',
  };

  const priorityColors: Record<string, string> = {
    urgent: '#EF4444',
    high: '#F59E0B',
    normal: '#9CA3AF',
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getDeliveriesForSlot = (slot: string) => {
    return deliveries?.filter((d: Delivery) => d.time_slot === slot) || [];
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Ionicons name="calendar" size={20} color="#3B82F6" />
            <Text style={styles.headerTitle}>Delivery Schedule</Text>
          </View>
        </View>

        <View style={styles.dateNavigator}>
          <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
            <Text style={styles.deliveryCount}>
              {deliveries?.length || 0} deliveries scheduled
            </Text>
          </View>

          <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Schedule Grid */}
      <ScrollView
        style={styles.scheduleContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        {timeSlots.map((slot) => {
          const slotDeliveries = getDeliveriesForSlot(slot);

          return (
            <View key={slot} style={styles.timeSlot}>
              <View style={styles.timeLabel}>
                <Text style={styles.timeLabelText}>{slot}</Text>
              </View>

              <View style={styles.slotDeliveries}>
                {slotDeliveries.length > 0 ? (
                  slotDeliveries.map((delivery: Delivery) => (
                    <TouchableOpacity
                      key={delivery.id}
                      style={[
                        styles.deliveryCard,
                        { borderLeftColor: statusColors[delivery.status] },
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={styles.deliveryHeader}>
                        <View style={styles.deliveryHeaderLeft}>
                          <View style={[styles.priorityDot, { backgroundColor: priorityColors[delivery.priority] }]} />
                          <Text style={styles.orderNumber}>#{delivery.order_number}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors[delivery.status] + '20' }]}>
                          <Text style={[styles.statusText, { color: statusColors[delivery.status] }]}>
                            {delivery.status.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.customerName}>{delivery.customer_name}</Text>
                      <View style={styles.addressRow}>
                        <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                        <Text style={styles.address} numberOfLines={1}>{delivery.address}</Text>
                      </View>

                      <View style={styles.deliveryFooter}>
                        <View style={styles.footerItem}>
                          <Ionicons name="cube-outline" size={12} color="#6B7280" />
                          <Text style={styles.footerText}>{delivery.items_count} items</Text>
                        </View>
                        {delivery.driver && (
                          <View style={styles.footerItem}>
                            <Ionicons name="person-outline" size={12} color="#6B7280" />
                            <Text style={styles.footerText}>{delivery.driver}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noDeliveries}>No deliveries</Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navButton: {
    padding: 8,
  },
  dateContainer: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  deliveryCount: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  scheduleContainer: {
    flex: 1,
    padding: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 12,
  },
  timeLabel: {
    width: 50,
    paddingRight: 12,
  },
  timeLabelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  slotDeliveries: {
    flex: 1,
    minHeight: 40,
  },
  noDeliveries: {
    fontSize: 13,
    color: '#9CA3AF',
    paddingVertical: 8,
  },
  deliveryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  orderNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
});

export default ${componentName};
`;
}

export function generateDeliveryTracker(options: DeliveryOptions = {}): string {
  const { componentName = 'DeliveryTracker', endpoint = '/deliveries' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface DeliveryDetails {
  id: string;
  order_number: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'arriving' | 'delivered' | 'failed';
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  driver?: {
    name: string;
    phone: string;
    avatar_url?: string;
    vehicle: string;
    license_plate: string;
  };
  estimated_arrival?: string;
  actual_arrival?: string;
  current_location?: {
    address: string;
    lat: number;
    lng: number;
    updated_at: string;
  };
  stops_remaining?: number;
  proof_of_delivery?: {
    signature_url?: string;
    photo_url?: string;
    recipient_name?: string;
    timestamp: string;
  };
}

interface ${componentName}Props {
  deliveryId?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ deliveryId: propId }) => {
  const route = useRoute();
  const deliveryId = propId || (route.params as any)?.id;
  const [refreshing, setRefreshing] = useState(false);

  const { data: delivery, isLoading, error, refetch } = useQuery({
    queryKey: ['delivery-tracker', deliveryId],
    queryFn: async () => {
      const response = await api.get<any>(\`${endpoint}/\${deliveryId}\`);
      return response?.data || response;
    },
    enabled: !!deliveryId,
    refetchInterval: 30000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const statusSteps = [
    { key: 'pending', label: 'Order Received', icon: 'cube' },
    { key: 'assigned', label: 'Driver Assigned', icon: 'person' },
    { key: 'picked_up', label: 'Picked Up', icon: 'cube' },
    { key: 'in_transit', label: 'In Transit', icon: 'car' },
    { key: 'arriving', label: 'Arriving Soon', icon: 'navigate' },
    { key: 'delivered', label: 'Delivered', icon: 'checkmark-circle' },
  ];

  const getCurrentStepIndex = () => {
    if (!delivery) return 0;
    if (delivery.status === 'failed') return -1;
    return statusSteps.findIndex((s) => s.key === delivery.status);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(\`tel:\${phone}\`);
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !delivery) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Unable to load delivery information</Text>
      </View>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

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
      {/* Status Card */}
      <View style={styles.card}>
        <View style={styles.statusHeader}>
          <View>
            <Text style={styles.orderLabel}>Order #{delivery.order_number}</Text>
            <Text style={styles.statusTitle}>
              {delivery.status === 'delivered' ? 'Delivered!' : 'Tracking Your Delivery'}
            </Text>
          </View>
          {delivery.estimated_arrival && delivery.status !== 'delivered' && (
            <View style={styles.etaContainer}>
              <Text style={styles.etaLabel}>Estimated Arrival</Text>
              <Text style={styles.etaTime}>
                {new Date(delivery.estimated_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )}
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <View key={step.key} style={styles.progressStep}>
                <View style={[
                  styles.progressIcon,
                  isCompleted ? styles.progressIconCompleted : styles.progressIconPending,
                  isCurrent && styles.progressIconCurrent,
                ]}>
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={isCompleted ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
                <Text style={[
                  styles.progressLabel,
                  isCompleted && styles.progressLabelCompleted,
                ]}>
                  {step.label}
                </Text>
                {index < statusSteps.length - 1 && (
                  <View style={[
                    styles.progressLine,
                    index < currentStepIndex && styles.progressLineCompleted,
                  ]} />
                )}
              </View>
            );
          })}
        </View>

        {/* Current Location */}
        {delivery.current_location && delivery.status === 'in_transit' && (
          <View style={styles.locationBanner}>
            <View style={styles.locationIcon}>
              <Ionicons name="navigate" size={20} color="#3B82F6" />
            </View>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Current Location</Text>
              <Text style={styles.locationAddress}>{delivery.current_location.address}</Text>
              {delivery.stops_remaining !== undefined && (
                <Text style={styles.stopsRemaining}>{delivery.stops_remaining} stops before yours</Text>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Driver Card */}
      {delivery.driver && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Driver</Text>
          <View style={styles.driverContainer}>
            {delivery.driver.avatar_url ? (
              <Image
                source={{ uri: delivery.driver.avatar_url }}
                style={styles.driverAvatar}
              />
            ) : (
              <View style={styles.driverAvatarPlaceholder}>
                <Ionicons name="person" size={24} color="#9CA3AF" />
              </View>
            )}
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{delivery.driver.name}</Text>
              <Text style={styles.driverVehicle}>{delivery.driver.vehicle}</Text>
              <Text style={styles.driverPlate}>{delivery.driver.license_plate}</Text>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(delivery.driver.phone)}
            >
              <Ionicons name="call" size={20} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Delivery Address */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Address</Text>
        <View style={styles.addressContainer}>
          <View style={styles.addressIcon}>
            <Ionicons name="location" size={20} color="#6B7280" />
          </View>
          <View style={styles.addressInfo}>
            <Text style={styles.addressName}>{delivery.customer.name}</Text>
            <Text style={styles.addressText}>{delivery.customer.address}</Text>
            <TouchableOpacity
              style={styles.phoneLink}
              onPress={() => handleCall(delivery.customer.phone)}
            >
              <Ionicons name="call-outline" size={12} color="#3B82F6" />
              <Text style={styles.phoneLinkText}>{delivery.customer.phone}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Proof of Delivery */}
      {delivery.proof_of_delivery && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Proof of Delivery</Text>
          <View style={styles.proofContainer}>
            <View style={styles.proofItem}>
              <Text style={styles.proofLabel}>Received by</Text>
              <Text style={styles.proofValue}>
                {delivery.proof_of_delivery.recipient_name || 'Not specified'}
              </Text>
            </View>
            <View style={styles.proofItem}>
              <Text style={styles.proofLabel}>Delivered at</Text>
              <Text style={styles.proofValue}>
                {new Date(delivery.proof_of_delivery.timestamp).toLocaleString()}
              </Text>
            </View>
            {delivery.proof_of_delivery.signature_url && (
              <View style={styles.proofItem}>
                <Text style={styles.proofLabel}>Signature</Text>
                <Image
                  source={{ uri: delivery.proof_of_delivery.signature_url }}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
              </View>
            )}
            {delivery.proof_of_delivery.photo_url && (
              <View style={styles.proofItem}>
                <Text style={styles.proofLabel}>Photo</Text>
                <Image
                  source={{ uri: delivery.proof_of_delivery.photo_url }}
                  style={styles.deliveryPhoto}
                  resizeMode="cover"
                />
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
    backgroundColor: '#F3F4F6',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  etaTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  progressIconCompleted: {
    backgroundColor: '#10B981',
  },
  progressIconPending: {
    backgroundColor: '#E5E7EB',
  },
  progressIconCurrent: {
    borderWidth: 3,
    borderColor: '#D1FAE5',
  },
  progressLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
  progressLabelCompleted: {
    color: '#111827',
    fontWeight: '500',
  },
  progressLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E5E7EB',
    zIndex: 0,
  },
  progressLineCompleted: {
    backgroundColor: '#10B981',
  },
  locationBanner: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 12,
    color: '#3B82F6',
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginTop: 2,
  },
  stopsRemaining: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  driverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  driverAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  driverVehicle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  driverPlate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  phoneLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  phoneLinkText: {
    fontSize: 13,
    color: '#3B82F6',
    marginLeft: 4,
  },
  proofContainer: {
    gap: 12,
  },
  proofItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  proofLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  proofValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  signatureImage: {
    height: 60,
    width: 150,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  deliveryPhoto: {
    width: 150,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});

export default ${componentName};
`;
}

export function generateRoutePlanner(options: DeliveryOptions = {}): string {
  const { componentName = 'RoutePlanner', endpoint = '/deliveries/routes' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Stop {
  id: string;
  order_number: string;
  customer_name: string;
  address: string;
  time_window?: { start: string; end: string };
  priority: 'normal' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'skipped';
  sequence: number;
  estimated_arrival?: string;
}

interface RouteData {
  id: string;
  driver_id: string;
  driver_name: string;
  vehicle: string;
  date: string;
  status: 'planning' | 'active' | 'completed';
  stops: Stop[];
  total_distance?: number;
  total_duration?: number;
  optimized?: boolean;
}

interface ${componentName}Props {
  routeId?: string;
  driverId?: string;
  date?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  routeId,
  driverId,
  date = new Date().toISOString().split('T')[0],
}) => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: route, isLoading, refetch } = useQuery({
    queryKey: ['route-planner', routeId, driverId, date],
    queryFn: async () => {
      let url = '${endpoint}';
      if (routeId) url += \`/\${routeId}\`;
      else {
        const params = new URLSearchParams();
        if (driverId) params.append('driver_id', driverId);
        params.append('date', date);
        url += '?' + params.toString();
      }
      const response = await api.get<any>(url);
      return response?.data || response;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const optimizeRoute = useMutation({
    mutationFn: () => api.post(\`${endpoint}/\${route?.id}/optimize\`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-planner'] });
      Alert.alert('Success', 'Route optimized successfully');
    },
  });

  const startRoute = useMutation({
    mutationFn: () => api.post(\`${endpoint}/\${route?.id}/start\`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-planner'] });
      Alert.alert('Success', 'Route started');
    },
  });

  const priorityColors: Record<string, string> = {
    urgent: '#EF4444',
    high: '#F59E0B',
    normal: '#6B7280',
  };

  const statusColors: Record<string, string> = {
    pending: '#9CA3AF',
    completed: '#10B981',
    skipped: '#F59E0B',
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!route) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="git-branch-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>No route found for this date</Text>
      </View>
    );
  }

  const completedStops = route.stops.filter((s: Stop) => s.status === 'completed').length;
  const progress = route.stops.length > 0 ? (completedStops / route.stops.length) * 100 : 0;

  const renderStop = ({ item, index }: { item: Stop; index: number }) => (
    <View style={[
      styles.stopCard,
      { borderLeftColor: item.priority === 'urgent' ? '#EF4444' : item.priority === 'high' ? '#F59E0B' : '#E5E7EB' }
    ]}>
      <View style={styles.stopSequence}>
        <Text style={styles.sequenceNumber}>{index + 1}</Text>
      </View>

      <View style={styles.stopContent}>
        <View style={styles.stopHeader}>
          <Text style={styles.stopOrderNumber}>#{item.order_number}</Text>
          <View style={[styles.stopStatusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
            <Text style={[styles.stopStatusText, { color: statusColors[item.status] }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.stopCustomer}>{item.customer_name}</Text>
        <Text style={styles.stopAddress} numberOfLines={1}>{item.address}</Text>

        <View style={styles.stopMeta}>
          {item.time_window && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color="#9CA3AF" />
              <Text style={styles.metaText}>
                {item.time_window.start} - {item.time_window.end}
              </Text>
            </View>
          )}
          {item.estimated_arrival && (
            <Text style={styles.metaText}>
              ETA: {new Date(item.estimated_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Ionicons name="git-branch" size={20} color="#3B82F6" />
            <Text style={styles.headerTitle}>Route Plan</Text>
          </View>

          {route.status === 'planning' && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => optimizeRoute.mutate()}
                disabled={optimizeRoute.isPending}
              >
                {optimizeRoute.isPending ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <Ionicons name="flash" size={18} color="#6B7280" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => startRoute.mutate()}
                disabled={startRoute.isPending}
              >
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.driverInfo}>{route.driver_name} - {route.vehicle}</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="location" size={14} color="#6B7280" />
            <Text style={styles.statText}>{route.stops.length} stops</Text>
          </View>
          {route.total_distance && (
            <View style={styles.statItem}>
              <Ionicons name="navigate" size={14} color="#6B7280" />
              <Text style={styles.statText}>{(route.total_distance / 1000).toFixed(1)} km</Text>
            </View>
          )}
          {route.total_duration && (
            <View style={styles.statItem}>
              <Ionicons name="time" size={14} color="#6B7280" />
              <Text style={styles.statText}>{Math.round(route.total_duration / 60)} min</Text>
            </View>
          )}
          <Text style={styles.statText}>{completedStops} / {route.stops.length}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
        </View>
      </View>

      {/* Stops List */}
      <FlatList
        data={route.stops.sort((a: Stop, b: Stop) => a.sequence - b.sequence)}
        renderItem={renderStop}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  driverInfo: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  listContent: {
    padding: 16,
  },
  stopCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
  },
  stopSequence: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sequenceNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  stopContent: {
    flex: 1,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stopOrderNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  stopStatusBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  stopStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  stopCustomer: {
    fontSize: 14,
    color: '#111827',
  },
  stopAddress: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  stopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  separator: {
    height: 8,
  },
});

export default ${componentName};
`;
}

export function generateTruckSchedule(options: DeliveryOptions = {}): string {
  const { componentName = 'TruckSchedule', endpoint = '/vehicles' } = options;

  return `import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface VehicleSchedule {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  license_plate: string;
  type: 'van' | 'truck' | 'trailer';
  capacity: number;
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  driver?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  current_route?: {
    id: string;
    stops_count: number;
    completed_stops: number;
    estimated_return: string;
  };
  scheduled_maintenance?: string;
  next_assignment?: {
    date: string;
    route_name: string;
    driver_name: string;
  };
}

interface ${componentName}Props {
  date?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ date: initialDate }) => {
  const [selectedDate, setSelectedDate] = useState(initialDate ? new Date(initialDate) : new Date());
  const [refreshing, setRefreshing] = useState(false);

  const { data: vehicles, isLoading, refetch } = useQuery({
    queryKey: ['truck-schedule', selectedDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await api.get<any>(
        \`${endpoint}/schedule?date=\${selectedDate.toISOString().split('T')[0]}\`
      );
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const statusColors: Record<string, string> = {
    available: '#10B981',
    in_use: '#3B82F6',
    maintenance: '#F59E0B',
    offline: '#EF4444',
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const availableCount = vehicles?.filter((v: VehicleSchedule) => v.status === 'available').length || 0;
  const inUseCount = vehicles?.filter((v: VehicleSchedule) => v.status === 'in_use').length || 0;
  const maintenanceCount = vehicles?.filter((v: VehicleSchedule) => v.status === 'maintenance').length || 0;

  const renderVehicle = ({ item }: { item: VehicleSchedule }) => {
    const progress = item.current_route
      ? (item.current_route.completed_stops / item.current_route.stops_count) * 100
      : 0;

    return (
      <TouchableOpacity style={styles.vehicleCard} activeOpacity={0.7}>
        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleIcon}>
            <Ionicons name="car" size={24} color="#6B7280" />
          </View>
          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleNameRow}>
              <Text style={styles.vehicleName}>{item.vehicle_name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
                <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
                  {item.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            <Text style={styles.vehicleDetails}>
              {item.license_plate} - Capacity: {item.capacity}
            </Text>
          </View>
        </View>

        {item.driver && (
          <View style={styles.driverRow}>
            {item.driver.avatar_url ? (
              <Image source={{ uri: item.driver.avatar_url }} style={styles.driverAvatar} />
            ) : (
              <View style={styles.driverAvatarPlaceholder}>
                <Ionicons name="person" size={12} color="#9CA3AF" />
              </View>
            )}
            <Text style={styles.driverName}>{item.driver.name}</Text>
          </View>
        )}

        {item.current_route && (
          <View style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <Text style={styles.routeLabel}>Active Route</Text>
              <Text style={styles.routeProgress}>
                {item.current_route.completed_stops} / {item.current_route.stops_count} stops
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
            </View>
            <View style={styles.routeEta}>
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text style={styles.routeEtaText}>
                Est. return: {new Date(item.current_route.estimated_return).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        )}

        {item.scheduled_maintenance && (
          <View style={styles.maintenanceCard}>
            <Ionicons name="build" size={14} color="#F59E0B" />
            <Text style={styles.maintenanceText}>
              Maintenance scheduled: {new Date(item.scheduled_maintenance).toLocaleDateString()}
            </Text>
          </View>
        )}

        {item.next_assignment && item.status === 'available' && (
          <View style={styles.nextAssignmentCard}>
            <Text style={styles.nextAssignmentLabel}>Next Assignment</Text>
            <Text style={styles.nextAssignmentName}>{item.next_assignment.route_name}</Text>
            <Text style={styles.nextAssignmentDetails}>
              {new Date(item.next_assignment.date).toLocaleDateString()} - {item.next_assignment.driver_name}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Ionicons name="car" size={20} color="#3B82F6" />
            <Text style={styles.headerTitle}>Fleet Schedule</Text>
          </View>
        </View>

        <View style={styles.dateNavigator}>
          <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={() => navigateDate('next')} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.quickStatText}>Available: {availableCount}</Text>
          </View>
          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.quickStatText}>In Use: {inUseCount}</Text>
          </View>
          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.quickStatText}>Maintenance: {maintenanceCount}</Text>
          </View>
        </View>
      </View>

      {/* Vehicle List */}
      {vehicles && vehicles.length > 0 ? (
        <FlatList
          data={vehicles}
          renderItem={renderVehicle}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
            />
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No vehicles found</Text>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navButton: {
    padding: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  quickStatDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  quickStatText: {
    fontSize: 13,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
  },
  vehicleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  vehicleDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  driverAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  driverAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  routeCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
  },
  routeProgress: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#DBEAFE',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  routeEta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  routeEtaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  maintenanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  maintenanceText: {
    fontSize: 13,
    color: '#D97706',
    marginLeft: 8,
  },
  nextAssignmentCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  nextAssignmentLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  nextAssignmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginTop: 2,
  },
  nextAssignmentDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  separator: {
    height: 12,
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
