/**
 * Order Tracking Component Generator for React Native
 *
 * Generates order tracking components:
 * - OrderTracking: Real-time order status with steps
 * - OrderList: List of all orders
 * - OrderQueue: Staff order queue management
 */

export interface OrderTrackingOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateOrderTracking(options: OrderTrackingOptions = {}): string {
  const { componentName = 'OrderTracking', endpoint = '/orders' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Driver {
  name: string;
  avatar_url?: string;
  phone?: string;
}

interface Order {
  id: string;
  order_number?: string;
  status: string;
  status_message?: string;
  estimated_time?: string;
  driver?: Driver;
}

const STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', icon: 'checkmark-circle' },
  { key: 'preparing', label: 'Preparing', icon: 'restaurant' },
  { key: 'ready', label: 'Ready', icon: 'cube' },
  { key: 'on_the_way', label: 'On the Way', icon: 'bicycle' },
  { key: 'delivered', label: 'Delivered', icon: 'home' },
];

function ${componentName}() {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-tracking', id],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}/' + id);
      return response?.data || response;
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.key === order?.status) || 0;

  const handleCallDriver = () => {
    if (order?.driver?.phone) {
      Linking.openURL(\`tel:\${order.driver.phone}\`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View>
            <Text style={styles.orderNumber}>
              Order #{order?.order_number || id?.slice(-8)}
            </Text>
            {order?.estimated_time && (
              <View style={styles.estimatedTime}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.estimatedTimeText}>
                  Estimated: {order.estimated_time}
                </Text>
              </View>
            )}
          </View>
          <View style={[
            styles.statusBadge,
            order?.status === 'delivered' ? styles.statusDelivered : styles.statusActive
          ]}>
            <Text style={[
              styles.statusText,
              order?.status === 'delivered' ? styles.statusTextDelivered : styles.statusTextActive
            ]}>
              {order?.status?.replace('_', ' ') || 'Processing'}
            </Text>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepIndicator}>
                  <View style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleCompleted,
                    isCurrent && styles.stepCircleCurrent
                  ]}>
                    <Ionicons
                      name={step.icon as any}
                      size={20}
                      color={isCompleted ? '#FFFFFF' : '#9CA3AF'}
                    />
                  </View>
                  {index < STEPS.length - 1 && (
                    <View style={[
                      styles.stepLine,
                      isCompleted && styles.stepLineCompleted
                    ]} />
                  )}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted
                  ]}>
                    {step.label}
                  </Text>
                  {isCurrent && order?.status_message && (
                    <Text style={styles.stepMessage}>{order.status_message}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {order?.driver && (
        <View style={styles.driverCard}>
          <Text style={styles.driverTitle}>Your Driver</Text>
          <View style={styles.driverInfo}>
            {order.driver.avatar_url ? (
              <Image
                source={{ uri: order.driver.avatar_url }}
                style={styles.driverAvatar}
              />
            ) : (
              <View style={styles.driverAvatarPlaceholder}>
                <Ionicons name="person" size={24} color="#9CA3AF" />
              </View>
            )}
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{order.driver.name}</Text>
              {order.driver.phone && (
                <TouchableOpacity onPress={handleCallDriver}>
                  <Text style={styles.driverPhone}>{order.driver.phone}</Text>
                </TouchableOpacity>
              )}
            </View>
            {order.driver.phone && (
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallDriver}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  estimatedTimeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusActive: {
    backgroundColor: '#FFF7ED',
  },
  statusDelivered: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusTextActive: {
    color: '#EA580C',
  },
  statusTextDelivered: {
    color: '#16A34A',
  },
  stepsContainer: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepIndicator: {
    alignItems: 'center',
    width: 40,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: '#16A34A',
  },
  stepCircleCurrent: {
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  stepLine: {
    width: 2,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#86EFAC',
  },
  stepContent: {
    flex: 1,
    marginLeft: 16,
    paddingVertical: 8,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  stepLabelCompleted: {
    color: '#111827',
  },
  stepMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  driverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  driverAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  driverPhone: {
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 2,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ${componentName};
`;
}

export function generateOrderList(options: OrderTrackingOptions = {}): string {
  const { componentName = 'OrderList', endpoint = '/orders' } = options;

  return `import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

interface Order {
  id: string;
  order_number?: string;
  status: string;
  total: number;
  items_count?: number;
  items?: any[];
  created_at: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  confirmed: { bg: '#DBEAFE', text: '#2563EB' },
  preparing: { bg: '#FED7AA', text: '#EA580C' },
  ready: { bg: '#E9D5FF', text: '#9333EA' },
  on_the_way: { bg: '#CFFAFE', text: '#0891B2' },
  delivered: { bg: '#DCFCE7', text: '#16A34A' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626' },
};

function ${componentName}() {
  const navigation = useNavigation();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}');
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const renderItem = ({ item: order }: { item: Order }) => {
    const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail' as never, { id: order.id } as never)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIcon}>
            <Ionicons name="fast-food" size={24} color="#F97316" />
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>
              Order #{order.order_number || order.id?.slice(-8)}
            </Text>
            <View style={styles.orderMeta}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.orderDate}>
                {new Date(order.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.orderItems}>
              {order.items_count || order.items?.length || 0} items
            </Text>
          </View>
        </View>
        <View style={styles.orderFooter}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {order.status?.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.orderTotal}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>\${(order.total || 0).toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>No orders yet</Text>
        <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  orderItems: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  chevron: {
    position: 'absolute',
    right: 16,
    top: '50%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ${componentName};
`;
}

export function generateOrderQueue(options: OrderTrackingOptions = {}): string {
  const { componentName = 'OrderQueue', endpoint = '/orders' } = options;

  return `import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { showToast } from '@/lib/toast';

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  id: string;
  order_number?: string;
  status: string;
  created_at: string;
  items?: OrderItem[];
}

const STATUS_FLOW = ['confirmed', 'preparing', 'ready', 'on_the_way', 'delivered'];

function ${componentName}() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['order-queue'],
    queryFn: async () => {
      const response = await api.get<any>('${endpoint}?status=pending,confirmed,preparing');
      return Array.isArray(response) ? response : (response?.data || []);
    },
    refetchInterval: 10000,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(\`${endpoint}/\${id}/status\`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-queue'] });
      showToast('success', 'Order status updated');
    },
  });

  const handleCancelOrder = useCallback((id: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => updateStatus.mutate({ id, status: 'cancelled' }),
        },
      ]
    );
  }, [updateStatus]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const renderItem = ({ item: order }: { item: Order }) => {
    const currentIndex = STATUS_FLOW.indexOf(order.status);
    const nextStatus = STATUS_FLOW[currentIndex + 1];

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>
              Order #{order.order_number || order.id?.slice(-8)}
            </Text>
            <View style={styles.orderTime}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              <Text style={styles.orderTimeText}>
                {new Date(order.created_at).toLocaleTimeString()}
              </Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {order.status?.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.itemsList}>
          {order.items?.map((item, i) => (
            <Text key={i} style={styles.itemText}>
              {item.quantity}x {item.name}
            </Text>
          ))}
        </View>

        <View style={styles.actions}>
          {nextStatus && (
            <TouchableOpacity
              style={styles.advanceButton}
              onPress={() => updateStatus.mutate({ id: order.id, status: nextStatus })}
              disabled={updateStatus.isPending}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.advanceButtonText}>
                Mark as {nextStatus.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelOrder(order.id)}
          >
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="checkmark-done-circle-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptySubtitle}>No pending orders</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Queue</Text>
        <Text style={styles.orderCount}>{orders.length} active orders</Text>
      </View>
      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  orderCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  orderTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  orderTimeText: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EA580C',
    textTransform: 'capitalize',
  },
  itemsList: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  advanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  advanceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cancelButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default ${componentName};
`;
}
