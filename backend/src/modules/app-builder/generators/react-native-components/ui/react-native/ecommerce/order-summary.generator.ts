/**
 * React Native Order Summary Generator
 */

export const generateRNOrderSummary = () => {
  const code = `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummaryProps {
  orderData?: any;
  items?: OrderItem[];
  subtotal?: number;
  shipping?: number;
  tax?: number;
  total?: number;
  [key: string]: any;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderData: propData,
  items: propItems = [],
  subtotal: propSubtotal = 0,
  shipping: propShipping = 0,
  tax: propTax = 0,
  total: propTotal = 0
}) => {
  const [fetchedData, setFetchedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (propData) return;
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
  const items = data.items || propItems;
  const subtotal = data.subtotal ?? propSubtotal;
  const shipping = data.shipping ?? propShipping;
  const tax = data.tax ?? propTax;
  const total = data.total ?? propTotal;

  if (loading && !propData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Summary</Text>

      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>{formatPrice(subtotal)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Shipping</Text>
        <Text style={styles.value}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Tax</Text>
        <Text style={styles.value}>{formatPrice(tax)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  itemsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#6B7280',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
});

export default OrderSummary;`;

  return { code, imports: [] };
};
