/**
 * React Native Order Details View Generator
 */

export const generateRNOrderDetailsView = () => {
  const code = `import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface OrderDetailsProps {
  order?: any;
  orderId?: string;
  onTrackOrder?: (orderId: string) => void;
  onReorder?: (order: any) => void;
  onCancelOrder?: (orderId: string) => void;
  [key: string]: any;
}

const OrderDetailsView: React.FC<OrderDetailsProps> = ({
  order: propOrder,
  orderId: propOrderId,
  onTrackOrder,
  onReorder,
  onCancelOrder
}) => {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch order data if only ID is provided
  const { data: apiOrder, isLoading, refetch } = useQuery({
    queryKey: ['order', propOrderId],
    queryFn: async () => {
      const response = await apiClient.get(\`/orders/\${propOrderId}\`);
      return response;
    },
    enabled: !propOrder && !!propOrderId,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const order = propOrder || apiOrder || {};
  const orderId = order.id || order._id || propOrderId;
  const orderNumber = order.orderNumber || order.order_number || orderId;
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#F59E0B';
      case 'processing':
        return '#3B82F6';
      case 'shipped':
      case 'in_transit':
        return '#8B5CF6';
      case 'delivered':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'reload-outline';
      case 'shipped':
      case 'in_transit':
        return 'airplane-outline';
      case 'delivered':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.patch(\`/orders/\${orderId}\`, { status: 'cancelled' });
              Alert.alert('Success', 'Order cancelled successfully');
              refetch();
              if (onCancelOrder) {
                onCancelOrder(orderId);
              }
            } catch (error) {
              console.error('Cancel order error:', error);
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
  };

  const handleReorder = () => {
    if (onReorder) {
      onReorder(order);
    }
  };

  const handleTrackOrder = () => {
    if (onTrackOrder) {
      onTrackOrder(orderId);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order || Object.keys(order).length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="document-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyTitle}>Order not found</Text>
        <Text style={styles.emptyText}>Unable to load order details</Text>
      </View>
    );
  }

  const items = order.items || order.orderItems || [];
  const shippingAddress = order.shippingAddress || order.shipping_address || {};
  const status = order.status || 'pending';
  const orderDate = order.date || order.createdAt || order.created_at || new Date();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{orderNumber}</Text>
          <Text style={styles.orderDate}>
            Placed on {new Date(orderDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          <Ionicons name={getStatusIcon(status)} size={16} color="#fff" />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {(status === 'pending' || status === 'processing') && (
          <TouchableOpacity style={styles.actionButton} onPress={handleCancelOrder}>
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Cancel Order</Text>
          </TouchableOpacity>
        )}
        {(status === 'shipped' || status === 'in_transit') && (
          <TouchableOpacity style={styles.actionButton} onPress={handleTrackOrder}>
            <Ionicons name="location-outline" size={20} color="#3B82F6" />
            <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Track Order</Text>
          </TouchableOpacity>
        )}
        {status === 'delivered' && (
          <TouchableOpacity style={styles.actionButton} onPress={handleReorder}>
            <Ionicons name="refresh-outline" size={20} color="#10B981" />
            <Text style={[styles.actionButtonText, { color: '#10B981' }]}>Reorder</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
        {items.map((item: any, index: number) => {
          const itemId = item.id || item._id || index;
          const itemImage = item.image || item.image_url;
          return (
            <View key={itemId} style={styles.item}>
              {itemImage && (
                <Image
                  source={{ uri: itemImage }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name || item.product_name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                {item.variant && (
                  <Text style={styles.itemVariant}>
                    {item.variant.name || item.variant_name}
                  </Text>
                )}
              </View>
              <Text style={styles.itemPrice}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <Text style={styles.addressText}>
          {shippingAddress.fullName || shippingAddress.name || shippingAddress.full_name}
        </Text>
        <Text style={styles.addressText}>
          {shippingAddress.address || shippingAddress.street}
        </Text>
        <Text style={styles.addressText}>
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode || shippingAddress.zip}
        </Text>
        {shippingAddress.country && (
          <Text style={styles.addressText}>{shippingAddress.country}</Text>
        )}
        {shippingAddress.email && (
          <Text style={styles.addressText}>{shippingAddress.email}</Text>
        )}
        {shippingAddress.phone && (
          <Text style={styles.addressText}>{shippingAddress.phone}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>
            {formatPrice(order.subtotal || order.sub_total || 0)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {order.shippingCost === 0 || order.shipping_cost === 0 || order.shipping === 0
              ? 'FREE'
              : formatPrice(order.shippingCost || order.shipping_cost || order.shipping || 0)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>
            {formatPrice(order.tax || 0)}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatPrice(order.total || order.total_amount || 0)}
          </Text>
        </View>
      </View>

      {/* Payment Method */}
      {order.paymentMethod && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Text style={styles.addressText}>
            {order.paymentMethod === 'card' ? 'Credit/Debit Card' : order.paymentMethod}
          </Text>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemVariant: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  addressText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
});

export default OrderDetailsView;`;

  return { code, imports: [] };
};
