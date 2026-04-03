/**
 * React Native Order Confirmation Generator
 * Generates an order confirmation screen component
 */

export function generateRNOrderConfirmation(): { code: string; imports: string[] } {
  const imports = [
    `import React, { useState, useEffect } from 'react';`,
    `import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';`,
    `import { Ionicons } from '@expo/vector-icons';`,
  ];

  const code = `${imports.join('\n')}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

interface OrderConfirmationProps {
  orderData?: any;
  order?: Order;
  onContinueShopping?: () => void;
  onViewOrder?: (orderId: string) => void;
  onTrackOrder?: (orderId: string) => void;
  [key: string]: any;
}

export default function OrderConfirmation({
  orderData: propData,
  order: propOrder,
  onContinueShopping,
  onViewOrder,
  onTrackOrder
}: OrderConfirmationProps) {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData || propOrder) return;
      setLoading(true);
      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:4000/api/v1';
        const response = await fetch(\`\${apiUrl}/orders\`);
        const result = await response.json();
        setFetchedData(Array.isArray(result) ? result[0] : (result?.data?.[0] || result));
      } catch (err) {
        console.error('Failed to fetch order data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const data = propData || fetchedData || {};
  const order = propOrder || data;

  const formatPrice = (price: number) => \`$\${price.toFixed(2)}\`;

  if (loading && !propData && !propOrder) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.iconContainer}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={48} color="#10b981" />
        </View>
      </View>

      <Text style={styles.title}>Order Confirmed!</Text>
      <Text style={styles.subtitle}>
        Thank you for your purchase
      </Text>

      {order && (
        <View style={styles.orderCard}>
          <View style={styles.orderRow}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.value}>#{order.orderNumber}</Text>
          </View>
          <View style={styles.orderRow}>
            <Text style={styles.label}>Total Amount</Text>
            <Text style={styles.value}>{formatPrice(order.total)}</Text>
          </View>
          {order.estimatedDelivery && (
            <View style={styles.orderRow}>
              <Text style={styles.label}>Estimated Delivery</Text>
              <Text style={styles.value}>{order.estimatedDelivery}</Text>
            </View>
          )}
          {order.trackingNumber && (
            <View style={styles.orderRow}>
              <Text style={styles.label}>Tracking Number</Text>
              <Text style={styles.value}>{order.trackingNumber}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actions}>
        {order && onViewOrder && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => onViewOrder(order.id)}
          >
            <Text style={styles.primaryButtonText}>View Order Details</Text>
          </TouchableOpacity>
        )}

        {order && onTrackOrder && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => onTrackOrder(order.id)}
          >
            <Ionicons name="locate" size={20} color="#3b82f6" />
            <Text style={styles.secondaryButtonText}>Track Order</Text>
          </TouchableOpacity>
        )}

        {onContinueShopping && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={onContinueShopping}
          >
            <Text style={styles.linkButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.emailNote}>
        A confirmation email has been sent to your registered email address
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  orderCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  actions: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  linkButton: {
    padding: 16,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  emailNote: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});`;

  return { code, imports };
}
